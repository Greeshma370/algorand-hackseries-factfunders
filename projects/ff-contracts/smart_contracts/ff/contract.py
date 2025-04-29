from algopy import ARC4Contract, GlobalState, BoxMap
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
