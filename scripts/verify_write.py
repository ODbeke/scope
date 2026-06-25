"""
Verify write calls on the deployed ScopeEvaluator contract.
Submits a milestone verification write transaction and polls status.
"""
import os
import json
import time
from gl import initialize_client, execute_read_call
from genlayer_py.types import TransactionStatus

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

def main():
    deploy_path = os.path.join(ROOT, "deployment.json")
    if not os.path.exists(deploy_path):
        raise SystemExit("Error: deployment.json not found. Run scripts/deploy.py first.")

    with open(deploy_path, "r", encoding="utf-8") as f:
        config = json.load(f)
    addr = config["contract_address"]
    print(f"Target contract address: {addr}")

    client, account = initialize_client()
    
    # SOW and outcome report for testing
    sow = (
        "Design a classy and professional user interface layout for the SCOPE project "
        "using deep navy, slate gray, and gold color styling tokens."
    )
    outcome = (
        "Delivered CSS design sheets, defined slate gray backgrounds, deep navy components, "
        "and applied gold accent colors. Created structured page components with classy fonts."
    )

    print("Submitting milestone (AI Write)...")
    tx_hash = client.write_contract(
        address=addr,
        function_name="submit_milestone",
        args=[sow, outcome]
    )
    print(f"Transaction Hash: {tx_hash}")

    print("Waiting for transaction confirmation on Bradbury...")
    receipt = client.wait_for_transaction_receipt(
        transaction_hash=tx_hash,
        status=TransactionStatus.ACCEPTED,
        interval=5000,
        retries=150,
    )
    
    status = getattr(receipt, "status", None) or (receipt.get("status") if isinstance(receipt, dict) else None)
    exec_res = receipt.get("tx_execution_result_name") if isinstance(receipt, dict) else None
    print(f"Receipt Status: {status}, Execution outcome: {exec_res}")
    
    time.sleep(3)
    stats = execute_read_call(client, account, addr, "get_stats")
    print(f"Updated stats: {stats}")

if __name__ == "__main__":
    main()
