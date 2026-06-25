"""
Helper utilities for interacting with the ScopeEvaluator contract from python scripts.
Loads private key and executes read transactions.
"""
import os
from genlayer_py import create_client, create_account
from genlayer_py.chains import testnet_bradbury
from genlayer_py.types import TransactionStatus
from genlayer_py.abi import calldata
from genlayer_py.abi.transactions import serialize
from genlayer_py.contracts.utils import make_calldata_object
import eth_utils

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def get_private_key() -> str:
    paths = (os.path.join(ROOT, ".env"), os.path.join(os.path.dirname(ROOT), ".env"))
    for p in paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                for line in f.read().splitlines():
                    if line.strip().startswith("GENLAYER_PRIVATE_KEY"):
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("GENLAYER_PRIVATE_KEY not found in env")


def initialize_client():
    account = create_account(account_private_key=get_private_key())
    return create_client(chain=testnet_bradbury, account=account), account


def execute_read_call(client, account, contract_address, function_name, args=None):
    encoded_calldata = [
        calldata.encode(make_calldata_object(method=function_name, args=args or [], kwargs=None)),
        b"\x00",
    ]
    params = {
        "type": "read",
        "to": contract_address,
        "from": account.address,
        "data": serialize(encoded_calldata),
        "transaction_hash_variant": "latest-nonfinal",
    }
    response = client.provider.make_request(method="gen_call", params=[params])["result"]
    hex_string = response.get("data", "") if isinstance(response, dict) else response
    return calldata.decode(eth_utils.hexadecimal.decode_hex("0x" + hex_string))
