from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded


def test_milestone_evaluation_flow():
    # Deploy contract
    factory = get_contract_factory("ScopeEvaluator")
    contract = factory.deploy(args=[])

    # Assert empty baseline stats
    stats = contract.get_stats(args=[]).call()
    assert stats["evals"] == 0
    assert stats["verified"] == 0

    # Submit a milestone verification request (valid criteria and evidence)
    sow_criteria = (
        "Develop a responsive navigation header component in React containing a brand logo, "
        "a menu list of 4 pages, and a functional user login button."
    )
    outcome_evidence = (
        "Delivered React navigation header. Integrated logo graphics, configured list links "
        "for Home, Services, About, and Contact, and styled login action buttons with active mouse states."
    )

    receipt = contract.submit_milestone(args=[sow_criteria, outcome_evidence]).transact()
    assert tx_execution_succeeded(receipt)

    # Assert stats updated
    stats = contract.get_stats(args=[]).call()
    assert stats["evals"] == 1

    # Fetch and verify evaluation record
    evals = contract.get_evaluations(args=[0]).call()
    assert len(evals) == 1
    record = evals[0]

    assert record["id"] == "eval-1"
    assert record["scope"] == sow_criteria
    assert record["evidence"] == outcome_evidence
    assert record["verdict"] in ("VERIFIED", "DEFICIENT", "DEFAULT")
    assert 0 <= record["score"] <= 100

    # Enforce contract score clamping backstop logic
    if record["verdict"] == "VERIFIED":
        assert record["score"] >= 70
    elif record["verdict"] == "DEFICIENT":
        assert 35 <= record["score"] <= 69
    else:
        assert record["score"] <= 34


def test_invalid_input_guards():
    # Deploy contract
    factory = get_contract_factory("ScopeEvaluator")
    contract = factory.deploy(args=[])

    # Empty scope criteria must revert
    receipt = contract.submit_milestone(args=["", "Delivered some mock code output"]).transact()
    assert not tx_execution_succeeded(receipt)
