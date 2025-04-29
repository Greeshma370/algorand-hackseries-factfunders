from algopy import ARC4Contract, GlobalState, BoxMap, Txn, UInt64 as NativeUInt64, Global, urange
from algopy.arc4 import Address, String, Bool, Struct, DynamicArray, UInt64
# Define ARC4 Structs
class Donation(Struct):
    account: Address
    amount: UInt64

class Milestone(Struct):
    name: String
    amount: UInt64
    proof_link: String
    votes_for: UInt64  # weighted sum
    votes_against: UInt64  # weighted sum
    total_voters: UInt64  # track total number of voters
    claimed: Bool
    proof_submitted_time: UInt64  # store timestamp when proof is submitted
    voting_end_time: UInt64  # store timestamp when voting period ends
    
class MilestoneInput(Struct):
    name: String
    amount: UInt64

class Proposal(Struct):
    name: String
    title: String
    description: String
    amount_required: UInt64
    created_by: Address
    donations: DynamicArray[Donation]
    amount_raised: UInt64
    milestones: DynamicArray[Milestone]
    current_milestone: UInt64
    created_at: UInt64  # timestamp of when the proposal is created
# Proposal Contract class
class ProposalContract(ARC4Contract):
    def __init__(self) -> None:
        self.no_of_proposals = GlobalState(UInt64(0), key="noOfProposals")
        self.proposals = BoxMap(UInt64, Proposal)
        self.milestoneVotes = BoxMap(UInt64, DynamicArray[Address],key_prefix="milestoneVotes_")
        
     @abimethod()
    def create_proposal(self, name: String, title: String, description: String, amount_required: UInt64, milestones: DynamicArray[MilestoneInput]) -> None:
        idx = self.no_of_proposals.value
        final_milestones = DynamicArray[Milestone]()
        milestones_total = NativeUInt64(0)
        for index in urange(milestones.length):
            milestone = milestones[index].copy()
            final_milestones.append(Milestone(
                name=milestone.name,
                amount=milestone.amount,
                proof_link=String(""),
                votes_for=UInt64(0),
                votes_against=UInt64(0),
                total_voters=UInt64(0),
                claimed=Bool(False),
                proof_submitted_time=UInt64(0),  # initialize to 0
                voting_end_time=UInt64(0)  # initialize to 0
            ))
            milestones_total = milestones_total + milestone.amount.native
        assert amount_required == milestones_total, "Total milestone amount must equal the required amount"
        assert amount_required > 0, "Amount required must be greater than 0"
        assert final_milestones.length > 0, "At least one milestone is required"
        assert final_milestones.length <= 5, "Maximum of 5 milestones allowed"
        assert name.native.bytes.length > 0, "Proposal name cannot be empty"
        assert title.native.bytes.length > 0, "Proposal title cannot be empty"
        assert description.native.bytes.length > 0, "Proposal description cannot be empty"
        
        new_proposal = Proposal(
            name=name,
            title=title,
            description=description,
            amount_required=amount_required,
            created_by=Address(Txn.sender),
            donations=DynamicArray[Donation](),
            amount_raised=UInt64(0),
            milestones=final_milestones.copy(),
            current_milestone=UInt64(0),
            created_at=UInt64(Global.latest_timestamp)  # store proposal creation timestamp
        )
        self.proposals[idx] = new_proposal.copy()  # save proposal
        self.milestoneVotes[idx] = DynamicArray[Address]()  # initialize milestone votes
        self.no_of_proposals.value = UInt64(self.no_of_proposals.value.native + 1)
