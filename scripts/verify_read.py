"""
Verify read calls on the deployed ScopeEvaluator contract.
Queries stats and evaluations.
"""
import os
import json
from gl import initialize_client, execute_read_call

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

def main():
    deploy_path = os.path.join(ROOT, "deployment.json")
    if not os.path.exists(deploy_path):
        raise SystemExit("Error: deployment.json not found. Run scripts/deploy.py first.")

    with open(deploy_path, "r", encoding="utf-8") as f:
        config = json.load(f)
    addr = config["contract_address"]
    print(f"Reading contract state at: {addr}")

    client, account = initialize_client()
    
    stats = execute_read_call(client, account, addr, "get_stats")
    print(f"get_stats() outcome: {stats}")
    
    evaluations = execute_read_call(client, account, addr, "get_evaluations", [0])
    print(f"get_evaluations(0) outcome: {evaluations}")

if __name__ == "__main__":
    main()
