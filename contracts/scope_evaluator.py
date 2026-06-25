# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

# Unique error classifications to separate expected execution paths from errors
ERR_INVALID_INPUT = "[BAD_INPUT]"
ERR_TRANSIENT_RPC = "[NETWORK_ERR]"
ERR_MODEL_INTEGRITY = "[ARBITER_PARSE_FAILED]"

# Input boundaries to prevent gas exhaustion and prompt injection abuse
MAX_CRITERIA_LEN = 500
MAX_EVIDENCE_LEN = 1000
PAGE_LIMIT = 20
ALLOWED_VERDICTS = ("VERIFIED", "DEFICIENT", "DEFAULT")


def _parse_json_outcome(raw_data) -> dict:
    """
    Extracts and sanitizes the evaluation details from the LLM's non-deterministic response.
    Tolerates minor variations in key names (e.g. decision/verdict, rating/score)
    and extracts raw JSON blocks from surrounding conversational text.
    """
    if isinstance(raw_data, str):
        # Extract JSON if surrounded by markdown or conversation
        start_idx = raw_data.find("{")
        end_idx = raw_data.rfind("}")
        if start_idx < 0 or end_idx < 0:
            raise gl.vm.UserError(ERR_MODEL_INTEGRITY + " Failed to locate JSON boundaries in arbiter response")
        raw_data = json.loads(raw_data[start_idx:end_idx + 1])
    
    if not isinstance(raw_data, dict):
        raise gl.vm.UserError(ERR_MODEL_INTEGRITY + " LLM output is not structured as a dictionary")
    
    # Handle potential key variations returning a uniform verdict key
    decision = str(raw_data.get("verdict", raw_data.get("decision", raw_data.get("status", "")))).strip().upper()
    if decision not in ALLOWED_VERDICTS:
        raise gl.vm.UserError(ERR_MODEL_INTEGRITY + " Unrecognized evaluation verdict: " + repr(decision))
    
    # Normalize rating/score/points to an integer between 0 and 100
    raw_score = raw_data.get("score", raw_data.get("rating", raw_data.get("points", 0)))
    try:
        score = max(0, min(100, int(round(float(str(raw_score).strip())))))
    except (ValueError, TypeError):
        raise gl.vm.UserError(ERR_MODEL_INTEGRITY + " Non-numeric score provided by arbiter")
    
    # Trim and default the reasoning text if missing
    reason = str(raw_data.get("reasoning", raw_data.get("rationale", raw_data.get("note", "")))).strip()[:300]
    if not reason:
        reason = "No detailed feedback was logged by the arbiter."
        
    return {"verdict": decision, "score": score, "reasoning": reason}


def _handle_leader_exceptions(leader_result, run_leader) -> bool:
    """
    Ensures validators replicate expected user errors or transient model errors.
    If the leader failed with an expected input/parsing error, validators must
    re-execute and assert the exact same issue occurred.
    """
    leader_error_msg = getattr(leader_result, "message", "")
    try:
        run_leader()
        return False
    except gl.vm.UserError as e:
        err_msg = getattr(e, "message", str(e))
        if err_msg.startswith(ERR_INVALID_INPUT):
            return err_msg == leader_error_msg
        if err_msg.startswith(ERR_MODEL_INTEGRITY) and leader_error_msg.startswith(ERR_MODEL_INTEGRITY):
            return True
        return False
    except Exception:
        return False


class ScopeEvaluator(gl.Contract):
    owner: Address
    evaluations: TreeMap[str, str]      # eval_id -> serialized evaluation record (JSON string)
    evaluation_ids: DynArray[str]        # list of eval_ids in chronological order
    total_evals: u256
    total_verified: u256
    seq: u256

    def __init__(self):
        self.owner = gl.message.sender_address
        self.total_evals = u256(0)
        self.total_verified = u256(0)
        self.seq = u256(0)

