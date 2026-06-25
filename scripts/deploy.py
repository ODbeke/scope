"""
Deploy and verify the ScopeEvaluator contract on Bradbury.
Reads GENLAYER_PRIVATE_KEY from .env.
"""
import json
import os
import sys

from genlayer_py import create_client, create_account
from genlayer_py.chains import testnet_bradbury
from genlayer_py.types import TransactionStatus

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WORKDIR_ROOT = os.path.dirname(ROOT)
CONTRACT_PATH = os.path.join(ROOT, "contracts", "scope_evaluator.py")


def read_private_key() -> str:
    # Look for .env in project root first, then workspace root
    paths = (os.path.join(ROOT, ".env"), os.path.join(WORKDIR_ROOT, ".env"))
    for p in paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                for line in f.read().splitlines():
                    line = line.strip()
                    if line.startswith("GENLAYER_PRIVATE_KEY"):
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("Error: GENLAYER_PRIVATE_KEY was not found in any .env file")


def main():
    pk = read_private_key()
    account = create_account(account_private_key=pk)
    print(f"Signing Address: {account.address}")

    client = create_client(chain=testnet_bradbury, account=account)
    balance = client.get_balance(account.address)
    print(f"Account Balance: {balance / 10**18} GEN")

    with open(CONTRACT_PATH, "r", encoding="utf-8") as f:
        contract_code = f.read()

    print("Deploying ScopeEvaluator to Bradbury...")
    tx_hash = client.deploy_contract(code=contract_code, args=[])
    print(f"Transaction Hash: {tx_hash}")

    print("Waiting for transaction confirmation...")
    receipt = client.wait_for_transaction_receipt(
        transaction_hash=tx_hash,
        status=TransactionStatus.ACCEPTED,
        interval=4000,
        retries=150,
    )
    
    contract_addr = getattr(receipt, "contract_address", None)
    if not contract_addr and isinstance(receipt, dict):
        contract_addr = receipt.get("data", {}).get("contract_address") or receipt.get("contract_address")
        
    print("Deployment completed successfully!")
    print(f"Deployed Contract Address: {contract_addr}")

    out = {
        "deploy_tx": tx_hash if isinstance(tx_hash, str) else tx_hash.hex(),
        "contract_address": contract_addr,
        "signer": account.address,
    }
    
    with open(os.path.join(ROOT, "deployment.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    print("Saved deployment info to deployment.json")


if __name__ == "__main__":
    main()
