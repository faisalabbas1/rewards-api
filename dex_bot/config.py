from dataclasses import dataclass
import os
from typing import Optional

from dotenv import load_dotenv


@dataclass
class AppConfig:
    eth_rpc_url: str
    eth_chain_id: int
    eth_private_key: Optional[str]
    eth_uniswap_router: str
    eth_uniswap_quoter: str
    default_recipient: Optional[str]


def get_config() -> AppConfig:
    # Load environment variables from .env if present
    load_dotenv(override=False)

    rpc_url = os.getenv("ETH_RPC_URL", "")
    chain_id_str = os.getenv("ETH_CHAIN_ID", "1")
    private_key = os.getenv("ETH_PRIVATE_KEY")
    router = os.getenv(
        "ETH_UNISWAP_V3_ROUTER",
        "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    )
    quoter = os.getenv(
        "ETH_UNISWAP_V3_QUOTER",
        "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    )
    default_recipient = os.getenv("DEFAULT_RECIPIENT")

    try:
        chain_id = int(chain_id_str)
    except ValueError:
        raise ValueError("ETH_CHAIN_ID must be an integer")

    if not rpc_url:
        raise ValueError("ETH_RPC_URL must be set")

    return AppConfig(
        eth_rpc_url=rpc_url,
        eth_chain_id=chain_id,
        eth_private_key=private_key,
        eth_uniswap_router=router,
        eth_uniswap_quoter=quoter,
        default_recipient=default_recipient,
    )
