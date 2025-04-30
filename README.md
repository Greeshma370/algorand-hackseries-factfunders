# Fact Funders
A transparent, decentralized crowdfunding platform built on the Algorand blockchain that enables milestone-based funding releases with community governance.

## Overview

This smart contract implements a decentralized crowdfunding platform on Algorand that introduces a milestone-based funding release mechanism. Unlike traditional crowdfunding platforms where creators receive all funds at once, this platform releases funds incrementally as project milestones are completed and approved by donors through a weighted voting system.

## Key Features

- **Milestone-Based Funding**: Projects are divided into milestones (up to 5), each with specific funding amounts and deliverables.
- **Community Governance**: Donors vote to approve or reject milestone completions based on proof submitted by creators.
- **Weighted Voting**: Voting power is proportional to donation amounts, giving larger donors more influence.
- **Time-Limited Voting**: Voting periods last 48 hours after proof submission.
- **Automated Fund Distribution**: Funds are automatically released when milestones are approved.
- **Protection Against Abandonment**: If a project remains inactive for 3 months, remaining funds can be refunded to donors.

## Smart Contract Functions

### `create_proposal`
Creates a new funding proposal with specified milestones.

**Parameters:**
- `name`: Project identifier
- `title`: Project title
- `description`: Detailed project description
- `amount_required`: Total funding goal (in microAlgos)
- `milestones`: Array of milestone objects with name and amount fields

### `donate_proposal`
Contributes funds to a project.

**Parameters:**
- `proposal_id`: ID of the target proposal
- `payment`: Payment transaction details

### `submit_proof`
Submits proof of milestone completion to initiate voting.

**Parameters:**
- `proposal_id`: ID of the target proposal
- `proof_link`: Link to evidence demonstrating milestone completion

### `vote_milestone`
Allows donors to vote on milestone completion.

**Parameters:**
- `proposal_id`: ID of the target proposal
- `vote`: Boolean (true for approval, false for rejection)

### `claim_milestone`
Releases milestone funds if voting approves completion.

**Parameters:**
- `proposal_id`: ID of the target proposal

### `refund_if_inactive`
Refunds proportional donation amounts if project is inactive for 3 months.

**Parameters:**
- `proposal_id`: ID of the target proposal

## Usage Example

1. **Create a Project:**
   ```python
   from algosdk import v2client, transaction
   from algopy import ARC4Contract
   
   # Initialize client
   algod_client = v2client.algod.AlgodClient("YOUR_API_KEY", "YOUR_ALGOD_NODE")
   
   # Create proposal with milestones
   milestones = [
       {"name": "MVP Development", "amount": 5000000},  # 5 Algos
       {"name": "Beta Release", "amount": 3000000},     # 3 Algos
       {"name": "Final Product", "amount": 2000000}     # 2 Algos
   ]
   
   proposal_contract.create_proposal(
       "project-alpha",
       "Revolutionary DeFi Product",
       "A decentralized platform that revolutionizes finance...",
       10000000,  # 10 Algos total
       milestones
   )
   ```

2. **Donate to Projects:**
   ```python
   # Donate 1 Algo to proposal ID 0
   payment_txn = transaction.PaymentTxn(
       sender=user_address,
       receiver=contract_address,
       amt=1000000,  # 1 Algo
       sp=algod_client.suggested_params()
   )
   
   proposal_contract.donate_proposal(0, payment_txn)
   ```

3. **Submit Milestone Proof:**
   ```python
   # After reaching funding goal and completing the first milestone
   proposal_contract.submit_proof(
       0, 
       "https://github.com/myproject/milestone1-evidence"
   )
   ```

4. **Vote on Milestone:**
   ```python
   # As a donor, vote to approve the milestone
   proposal_contract.vote_milestone(0, True)  # True to approve
   ```

5. **Claim Milestone Funding:**
   ```python
   # After voting period ends with positive result
   proposal_contract.claim_milestone(0)
   ```

## Deployment Instructions

1. Compile the contract using AlgoPy:
   ```
   python -m algopy compile proposal_contract.py
   ```

2. Deploy to Algorand testnet or mainnet:
   ```
   python -m algopy deploy proposal_contract.py --network testnet
   ```

## Security Considerations

- All milestone funds are held in escrow by the smart contract until milestone approval
- Voting weights prevent "Sybil attacks" by requiring donations to have influence
- Time-limited milestone submissions prevent indefinite fund locking
- The refund mechanism protects donors if projects are abandoned

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
