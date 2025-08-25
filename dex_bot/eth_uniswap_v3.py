from dataclasses import dataclass
from typing import Optional, Tuple

from eth_account import Account
from eth_account.signers.local import LocalAccount
from hexbytes import HexBytes
from web3 import Web3
from web3.contract import Contract
from web3.exceptions import ContractLogicError

from .config import AppConfig


# Minimal ABIs for Uniswap v3 interactions
ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function",
    },
    {
        "constant": False,
        "inputs": [
            {"name": "spender", "type": "address"},
            {"name": "amount", "type": "uint256"},
        ],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [
            {"name": "owner", "type": "address"},
            {"name": "spender", "type": "address"},
        ],
        "name": "allowance",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function",
    },
]

# ISwapRouter exactInputSingle
UNISWAP_V3_ROUTER_ABI = [
    {
        "inputs": [
            {
                "components": [
                    {"internalType": "address", "name": "tokenIn", "type": "address"},
                    {"internalType": "address", "name": "tokenOut", "type": "address"},
                    {"internalType": "uint24", "name": "fee", "type": "uint24"},
                    {"internalType": "address", "name": "recipient", "type": "address"},
                    {"internalType": "uint256", "name": "deadline", "type": "uint256"},
                    {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
                    {"internalType": "uint256", "name": "amountOutMinimum", "type": "uint256"},
                    {"internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160"},
                ],
                "internalType": "struct ISwapRouter.ExactInputSingleParams",
                "name": "params",
                "type": "tuple",
            }
        ],
        "name": "exactInputSingle",
        "outputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}],
        "stateMutability": "payable",
        "type": "function",
    }
]

# QuoterV2 quoteExactInputSingle
UNISWAP_V3_QUOTER_ABI = [
    {
        "inputs": [
            {
                "components": [
                    {"internalType": "address", "name": "tokenIn", "type": "address"},
                    {"internalType": "address", "name": "tokenOut", "type": "address"},
                    {"internalType": "uint24", "name": "fee", "type": "uint24"},
                    {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
                    {"internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160"},
                ],
                "internalType": "struct IQuoterV2.QuoteExactInputSingleParams",
                "name": "params",
                "type": "tuple",
            }
        ],
        "name": "quoteExactInputSingle",
        "outputs": [
            {"internalType": "uint256", "name": "amountOut", "type": "uint256"},
            {"internalType": "uint160", "name": "sqrtPriceX96After", "type": "uint160"},
            {"internalType": "uint32", "name": "initializedTicksCrossed", "type": "uint32"},
            {"internalType": "uint256", "name": "gasEstimate", "type": "uint256"},
        ],
        "stateMutability": "nonpayable",
        "type": "function",
    }
]


@dataclass
class UniswapQuote:
    amount_out: int
    sqrt_price_after_x96: int
    initialized_ticks_crossed: int
    gas_estimate: int


class UniswapV3Client:
    def __init__(self, cfg: AppConfig) -> None:
        self.cfg = cfg
        self.web3 = Web3(Web3.HTTPProvider(cfg.eth_rpc_url))
        self.router: Contract = self.web3.eth.contract(
            address=Web3.to_checksum_address(cfg.eth_uniswap_router),
            abi=UNISWAP_V3_ROUTER_ABI,
        )
        self.quoter: Contract = self.web3.eth.contract(
            address=Web3.to_checksum_address(cfg.eth_uniswap_quoter),
            abi=UNISWAP_V3_QUOTER_ABI,
        )

    def _get_account(self) -> LocalAccount:
        if not self.cfg.eth_private_key:
            raise ValueError("ETH_PRIVATE_KEY must be set to sign transactions")
        return Account.from_key(self.cfg.eth_private_key)

    def _erc20(self, token: str) -> Contract:
        return self.web3.eth.contract(
            address=Web3.to_checksum_address(token), abi=ERC20_ABI
        )

    def get_token_decimals(self, token: str) -> int:
        return self._erc20(token).functions.decimals().call()

    def get_allowance(self, token: str, owner: str, spender: str) -> int:
        return (
            self._erc20(token)
            .functions.allowance(
                Web3.to_checksum_address(owner), Web3.to_checksum_address(spender)
            )
            .call()
        )

    def approve(self, token: str, spender: str, amount: int, gas_price_gwei: Optional[int] = None) -> HexBytes:
        account = self._get_account()
        nonce = self.web3.eth.get_transaction_count(account.address)
        tx = (
            self._erc20(token)
            .functions.approve(Web3.to_checksum_address(spender), int(amount))
            .build_transaction(
                {
                    "from": account.address,
                    "chainId": self.cfg.eth_chain_id,
                    "nonce": nonce,
                    "maxFeePerGas": self._get_max_fee_per_gas(gas_price_gwei),
                    "maxPriorityFeePerGas": self._get_max_priority_fee_per_gas(gas_price_gwei),
                }
            )
        )
        signed = account.sign_transaction(tx)
        tx_hash = self.web3.eth.send_raw_transaction(signed.rawTransaction)
        return tx_hash

    def quote_exact_input_single(
        self, token_in: str, token_out: str, fee: int, amount_in: int, sqrt_price_limit_x96: int = 0
    ) -> UniswapQuote:
        try:
            amount_out, sqrt_after, ticks_crossed, gas_est = self.quoter.functions.quoteExactInputSingle(
                (
                    Web3.to_checksum_address(token_in),
                    Web3.to_checksum_address(token_out),
                    int(fee),
                    int(amount_in),
                    int(sqrt_price_limit_x96),
                )
            ).call()
        except ContractLogicError as e:
            raise RuntimeError(f"Quoter call failed: {e}")
        return UniswapQuote(
            amount_out=amount_out,
            sqrt_price_after_x96=sqrt_after,
            initialized_ticks_crossed=ticks_crossed,
            gas_estimate=gas_est,
        )

    def swap_exact_input_single(
        self,
        token_in: str,
        token_out: str,
        fee: int,
        amount_in: int,
        amount_out_minimum: int,
        recipient: Optional[str] = None,
        deadline_seconds_from_now: int = 120,
        gas_price_gwei: Optional[int] = None,
        value: int = 0,
    ) -> HexBytes:
        account = self._get_account()
        to_address = Web3.to_checksum_address(
            recipient or self.cfg.default_recipient or account.address
        )
        params = (
            Web3.to_checksum_address(token_in),
            Web3.to_checksum_address(token_out),
            int(fee),
            to_address,
            self.web3.eth.get_block("latest")["timestamp"] + int(deadline_seconds_from_now),
            int(amount_in),
            int(amount_out_minimum),
            0,
        )
        nonce = self.web3.eth.get_transaction_count(account.address)
        tx = self.router.functions.exactInputSingle(params).build_transaction(
            {
                "from": account.address,
                "chainId": self.cfg.eth_chain_id,
                "nonce": nonce,
                "maxFeePerGas": self._get_max_fee_per_gas(gas_price_gwei),
                "maxPriorityFeePerGas": self._get_max_priority_fee_per_gas(gas_price_gwei),
                "value": int(value),
            }
        )
        signed = account.sign_transaction(tx)
        tx_hash = self.web3.eth.send_raw_transaction(signed.rawTransaction)
        return tx_hash

    def _get_max_fee_per_gas(self, gas_price_gwei: Optional[int]) -> int:
        if gas_price_gwei is not None:
            wei = Web3.to_wei(gas_price_gwei, "gwei")
            return wei
        base = self.web3.eth.gas_price
        return int(base * 2)

    def _get_max_priority_fee_per_gas(self, gas_price_gwei: Optional[int]) -> int:
        if gas_price_gwei is not None:
            return Web3.to_wei(max(1, int(gas_price_gwei * 0.1)), "gwei")
        return Web3.to_wei(1.5, "gwei")
