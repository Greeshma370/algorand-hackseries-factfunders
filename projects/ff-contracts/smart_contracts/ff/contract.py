from algopy import ARC4Contract, GlobalState, BoxMap, Txn, UInt64 as NativeUInt64, Global, urange, gtxn, itxn
from algopy.arc4 import abimethod, Address, String, Bool, Struct, DynamicArray, UInt64
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
        
    @abimethod()
    def donate_proposal(self, proposal_id: UInt64, payment: gtxn.PaymentTransaction) -> None:
        assert proposal_id in self.proposals, "Proposal doesn't exist"
        prop = self.proposals[proposal_id].copy()

        assert prop.amount_raised < prop.amount_required, "Goal already reached"

        amount = payment.amount
        donor = payment.sender

        assert payment.receiver == Global.current_application_address, "Payment must be sent to the contract address"

        donation = Donation(account=Address(donor), amount=UInt64(amount))
        prop.donations.append(donation.copy())  # append donation
        prop.amount_raised = UInt64(prop.amount_raised.native + amount)

        self.proposals[proposal_id] = prop.copy()

    @abimethod()
    def submit_proof(self, proposal_id: UInt64, proof_link: String) -> None:
        assert proposal_id in self.proposals, "Proposal doesn't exist"
        prop = self.proposals[proposal_id].copy()

        assert prop.created_by == Address(Txn.sender), "Only creator can submit proof"
        assert prop.amount_raised >= prop.amount_required, "Goal not reached yet"
        assert prop.current_milestone.native < prop.milestones.length, "All milestones already completed"
        
        current_time = Global.latest_timestamp
        
        new_milestones = DynamicArray[Milestone]()
        for idx in urange(prop.milestones.length):
            milestone = prop.milestones[idx].copy()
            if idx == prop.current_milestone.native:
                milestone.proof_link = proof_link
                milestone.proof_submitted_time = UInt64(current_time)
                milestone.voting_end_time = UInt64(current_time + 172800)  # Voting ends after 2 days (48 hours)
                milestone.claimed = Bool(False)  # Reset claimed status
                milestone.votes_for = UInt64(0)  # Reset votes
                milestone.votes_against = UInt64(0)
                milestone.total_voters = UInt64(0)
                new_milestones.append(milestone.copy())
            else:
                new_milestones.append(milestone.copy())
        
        prop.milestones = new_milestones.copy()
        self.proposals[proposal_id] = prop.copy()
        self.milestoneVotes[proposal_id] = DynamicArray[Address]()  # Reset votes for the new milestone

    @abimethod()
    def vote_milestone(self, proposal_id: UInt64, vote: Bool) -> None:
        assert proposal_id in self.proposals, "Proposal doesn't exist"
        prop = self.proposals[proposal_id].copy()
        milestone = prop.milestones[prop.current_milestone.native].copy()
        
        milestone_votes = self.milestoneVotes[proposal_id].copy()
        for addr in milestone_votes:
            assert addr.native != Txn.sender, "You have already voted for this milestone"
            
        assert prop.created_by.native != Txn.sender, "Creator cannot vote"
        
        assert milestone.proof_link != "", "Proof is not submitted yet"
        
        # Check if voting period has ended
        current_time = Global.latest_timestamp
        assert milestone.voting_end_time.native > current_time, "Voting period has ended"
        
        # Calculate weighted vote
        donor = Txn.sender
        amount_donated = NativeUInt64(0)
        for idx in urange(prop.donations.length):
            donation = prop.donations[idx].copy()
            if donation.account.native == donor:
                amount_donated = donation.amount.native
                break
            
        
        assert amount_donated > 0, "You have not donated to this proposal"

        # Vote weighting by amount donated
        weight = amount_donated * 100 // prop.amount_raised.native  # Integer-based calculation

        if vote:
            milestone.votes_for = UInt64(milestone.votes_for.native + weight)  # Normalize to percentage
        else:
            milestone.votes_against = UInt64(milestone.votes_against.native + weight)

        milestone.total_voters = UInt64(milestone.total_voters.native + 1)
        milestone_votes.append(Address(donor))
        self.milestoneVotes[proposal_id] = milestone_votes.copy()
        self.proposals[proposal_id].milestones[prop.current_milestone.native] = milestone.copy()

    @abimethod()
    def claim_milestone(self, proposal_id: UInt64) -> None:
        assert proposal_id in self.proposals, "Proposal doesn't exist"
        prop = self.proposals[proposal_id].copy()
        milestone = prop.milestones[prop.current_milestone.native].copy()
        
        # Ensure voting period has ended
        current_time = Global.latest_timestamp
        assert milestone.proof_link != "", "Proof is not submitted yet"
        assert milestone.proof_submitted_time.native != 0, "Proof not submitted yet"
        assert current_time > milestone.voting_end_time.native, "Voting period not ended yet"
        
        assert milestone.votes_for.native > milestone.votes_against.native, "Milestone not approved"
        assert not milestone.claimed, "Milestone already claimed"
        
        
            # Transfer the milestone amount to the creator
        creator = prop.created_by.native
        itxn.Payment(
            sender=Global.current_application_address,
            receiver=creator,
            amount=milestone.amount.native
        ).submit()
            
        # Mark milestone as claimed
        milestone.claimed = Bool(True)
        self.proposals[proposal_id].milestones[prop.current_milestone.native] = milestone.copy()
        self.proposals[proposal_id].current_milestone = UInt64(prop.current_milestone.native + 1)

    @abimethod()
    def refund_if_inactive(self, proposal_id: UInt64) -> None:
        assert proposal_id in self.proposals, "Proposal doesn't exist"
        prop = self.proposals[proposal_id].copy()
        current_milestone = prop.milestones[prop.current_milestone.native].copy()
        current_time = Global.latest_timestamp
        time_difference = current_time - current_milestone.proof_submitted_time.native
        
        if time_difference > 7776000:  # 3 months = 7776000 seconds
            # Refund to donors proportionately
            remaining_amount = prop.amount_required.native - prop.amount_raised.native  # Amount that was not claimed
            new_donors = DynamicArray[Donation]()
            for idx in urange(prop.donations.length):
                donation = prop.donations[idx].copy()
                sender = Txn.sender
                if donation.account.native == sender:
                    # Refund the donor proportionately
                    if donation.amount.native > 0:
                        refund_amount = UInt64(remaining_amount * donation.amount.native // prop.amount_raised.native)
                        itxn.Payment(
                            sender=Global.current_application_address,
                            receiver=donation.account.native,
                            amount=refund_amount.native
                        ).submit()
                else:
                    new_donors.append(donation.copy())
                    
            prop.donations = new_donors.copy()
            self.proposals[proposal_id] = prop.copy()
