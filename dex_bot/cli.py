import typer
from rich import print
from rich.table import Table
from web3 import Web3

from .config import get_config
from .eth_uniswap_v3 import UniswapV3Client


app = typer.Typer(help="Cross-chain DEX trading bot CLI")


@app.callback()
def main() -> None:
    pass


eth_app = typer.Typer(help="Ethereum / Uniswap v3")
app.add_typer(eth_app, name="eth")


@eth_app.command("quote")
def eth_quote(
    token_in: str = typer.Argument(..., help="Token in address"),
    token_out: str = typer.Argument(..., help="Token out address"),
    fee: int = typer.Argument(3000, help="Pool fee in bps (500, 3000, 10000)"),
    amount_in: str = typer.Argument(..., help="Amount in, in raw units (wei)"),
):
    cfg = get_config()
    client = UniswapV3Client(cfg)
    quote = client.quote_exact_input_single(token_in, token_out, int(fee), int(amount_in))
    table = Table(title="Uniswap v3 Quote (exactInputSingle)")
    table.add_column("Field")
    table.add_column("Value")
    table.add_row("amountOut", str(quote.amount_out))
    table.add_row("sqrtPriceAfterX96", str(quote.sqrt_price_after_x96))
    table.add_row("ticksCrossed", str(quote.initialized_ticks_crossed))
    table.add_row("gasEstimate", str(quote.gas_estimate))
    print(table)


@eth_app.command("approve")
def eth_approve(
    token: str = typer.Argument(..., help="ERC20 token address to approve"),
    spender: str = typer.Argument(..., help="Spender (e.g., Uniswap router)"),
    amount: str = typer.Argument(..., help="Allowance amount in raw units"),
    gas_price_gwei: int = typer.Option(None, help="Override gas price in gwei"),
):
    cfg = get_config()
    client = UniswapV3Client(cfg)
    tx_hash = client.approve(token, spender, int(amount), gas_price_gwei)
    print({"tx": Web3.to_hex(tx_hash)})


@eth_app.command("swap")
def eth_swap(
    token_in: str = typer.Argument(..., help="Token in address"),
    token_out: str = typer.Argument(..., help="Token out address"),
    fee: int = typer.Argument(3000, help="Pool fee in bps (500, 3000, 10000)"),
    amount_in: str = typer.Argument(..., help="Amount in raw units"),
    min_out: str = typer.Argument(..., help="Minimum amount out in raw units"),
    recipient: str = typer.Option(None, help="Recipient address (defaults to sender)"),
    deadline: int = typer.Option(120, help="Seconds until deadline"),
    gas_price_gwei: int = typer.Option(None, help="Override gas price in gwei"),
    value: str = typer.Option("0", help="ETH value to attach (for ETH->token)"),
):
    cfg = get_config()
    client = UniswapV3Client(cfg)
    tx_hash = client.swap_exact_input_single(
        token_in,
        token_out,
        int(fee),
        int(amount_in),
        int(min_out),
        recipient,
        int(deadline),
        gas_price_gwei,
        int(value),
    )
    print({"tx": Web3.to_hex(tx_hash)})


if __name__ == "__main__":
    app()
