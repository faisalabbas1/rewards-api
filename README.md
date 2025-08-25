## Web3 DEX Trading Bot (Ethereum + Solana)

This project provides a cross-chain trading bot for decentralized exchanges (DEXs):

- Ethereum: Uniswap v3 (quotes, approvals, swaps)
- Solana: Jupiter (quotes and swaps) — to be added

### Quick start

1) Create a virtual environment and install dependencies

```bash
python3 -m venv .venv
. ./.venv/bin/activate
pip install -r requirements.txt
```

2) Copy `.env.example` to `.env` and fill in values

```bash
cp .env.example .env
```

3) Run CLI help

```bash
python -m dex_bot.cli --help
python -m dex_bot.cli eth --help
```

### Environment variables

See `.env.example` for required and optional settings. Router and Quoter addresses default to Uniswap v3 mainnet, but can be overridden.

### Notes

- Use testnets first. Never fund private keys you cannot afford to lose.
- This software is provided as-is; you are responsible for operational security and compliance.
# rewards-api
