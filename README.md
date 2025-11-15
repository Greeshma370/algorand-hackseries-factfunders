Fact Funders – Decentralized Milestone-Based Crowdfunding (Algorand)

Fact Funders is a transparent, decentralized crowdfunding platform built on the Algorand blockchain where funds are released only when milestones are completed and approved by the donor community.
Creators receive funding in phases — not all at once — ensuring accountability, transparency, and trust.

📄 Overview

Fact Funders introduces a milestone-based funding model where:

Creators define up to 5 milestones with clear deliverables

Donors vote on milestone completion using weighted voting (more funds = more voting power)

Approved milestones trigger automatic fund release

If a project becomes inactive for 3 months, donors can claim proportional refunds

This transforms crowdfunding into a trustless and community-governed funding system, eliminating the risk of abandoned projects.

⚙️ Setup & Installation
1️⃣ Install Algopy
pip install algopy

2️⃣ Compile the Smart Contract
python -m algopy compile proposal_contract.py

3️⃣ Deploy to Algorand TestNet
python -m algopy deploy proposal_contract.py --network testnet

4️⃣ Interact Using AlgoSDK

Example: creating a proposal

from algosdk import v2client, transaction
from algopy import ARC4Contract

algod = v2client.algod.AlgodClient("YOUR_API_KEY", "TESTNET_URL")

milestones = [
    {"name": "MVP Development", "amount": 5000000},
    {"name": "Beta Release", "amount": 3000000},
    {"name": "Final Product", "amount": 2000000},
]

proposal_contract.create_proposal(
    "project-alpha",
    "Revolutionary DeFi Product",
    "A decentralized platform that revolutionizes finance...",
    10000000,
    milestones
)

🔗 Deployed Smart Contract (TestNet)

Your live smart contract is deployed on the Algorand TestNet:

👉 https://lora.algokit.io/testnet/application/740840374

Use this link to explore global/local state and test interaction.

🌐 Frontend (Live Deployment)

Your frontend is deployed and accessible at:

👉 https://greeshma370.github.io/algorand-hackseries-factfunders/

This interface allows users to:

View available projects

Donate to proposals

Track milestone progress

Vote on milestone completion

Claim milestone payouts or refunds

🧠 Architecture & Components

Fact Funders consists of three main layers:

1️⃣ Smart Contract Layer (Algorand / Algopy)

Handles:

Proposal creation & milestone storage

Donation tracking

Donor-weighted voting

Escrowed milestone payouts

Inactivity detection & refunds

2️⃣ Off-Chain Logic (SDK Interactions)

Includes:

AlgoSDK calls for donations, votes, and proof submission

Transaction grouping & wallet signing

Proof link verification

3️⃣ Frontend (React + Wallet Connect)

Provides:

UI for exploring proposals

Wallet connectivity (Pera, Defly, etc.)

Voting dashboard

Milestone status and payout claim options

🛡️ Security Features

Escrowed milestone funds until approval

Weighted voting prevents spam/Sybil attacks

48-hour voting windows

Automatic refunds after 90 days of inactivity

Immutable on-chain milestone records

📜 License

MIT License

🤝 Contributing

Contributions are welcome!
Please open an issue or submit a pull request.
