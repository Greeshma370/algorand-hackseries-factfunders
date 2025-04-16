from algopy import ARC4Contract, GlobalState, BoxMap, Txn, UInt64, Bytes
from algopy.arc4 import abimethod, Address, String, Bool, Struct, DynamicArray

# Define ARC4 Structs instead of dataclasses
class Donation(Struct):
    account: Address
    amount: UInt64

class Proposal(Struct):
    name: String
    title: String
    description: String
    amount_required: UInt64
    created_by: Address
    donations: DynamicArray[Donation]
    amount_raised: UInt64
    claimed: Bool

class ProposalContract(ARC4Contract):
    def __init__(self) -> None:
        # Global variable to track number of proposals
        self.no_of_proposals = GlobalState(UInt64(0), key="noOfProposals")
        # BoxMap to store all proposals using index (uint64) as key
        self.proposals = BoxMap(UInt64, Proposal)

    @abimethod()
    def create_proposal(self, name: String, title: String, description: String, amount_required: UInt64) -> None:
        idx = self.no_of_proposals.value
        new_proposal = Proposal(
            name=name,
            title=title,
            description=description,
            amount_required=amount_required,
            created_by=Txn.sender,
            donations=DynamicArray[Donation](),
            amount_raised=UInt64(0),
            claimed=Bool(False)
        )
        self.proposals[idx] = new_proposal
        self.no_of_proposals.value += UInt64(1)
        
    @abimethod()
    def donate_proposal(self, proposal_id: UInt64) -> None:
        assert self.proposals.contains(proposal_id), "Proposal doesn't exist"
        prop = self.proposals[proposal_id]

        assert prop.amount_raised < prop.amount_required, "Goal already reached"

        amount = Txn.amount
        donor = Txn.sender

        # Create a donation entry
        donation = Donation(account=donor, amount=amount)

        # Update proposal's donations and amount raised
        prop.donations.append(donation)
        prop.amount_raised += amount

        self.proposals[proposal_id] = prop  # Save updated proposal

   
   
