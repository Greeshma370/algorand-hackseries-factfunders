import { ReadableProposal } from "../types";
import { appClient, syncTimeOffsetInLocalNet } from "./clients";
import * as algokit from "@algorandfoundation/algokit-utils";

const getProposalsLength = async () => {
  try {
    await syncTimeOffsetInLocalNet();
    const proposalsLength = await appClient.state.global.noOfProposals();
    return proposalsLength ?? 0n;
  } catch {
    return 0n;
  }
};

const getProposal = async (proposalId: bigint) => {
  try {
    await syncTimeOffsetInLocalNet();
    const proposal = await appClient.state.box.proposals.value(proposalId);
    const readableProposal: ReadableProposal | undefined = proposal && {
      id: proposalId.toString(),
      name: proposal.name,
      title: proposal.title,
      description: proposal.description,
      category: proposal.category,
      amountRequired: algokit.microAlgos(proposal.amountRequired).algos,
      milestones: proposal.milestones.map((milestone) => ({
        name: milestone[0],
        amount: algokit.microAlgos(milestone[1]).algos,
        proofLink: milestone[2],
        votesFor: Number(milestone[3]),
        votesAgainst: Number(milestone[4]),
        totalVoters: Number(milestone[5]),
        claimed: Boolean(milestone[6]),
        proofSubmittedTime: Number(milestone[7]),
        votingEndTime: Number(milestone[8]),
      })),
      createdAt: Number(proposal.createdAt),
      createdBy: proposal.createdBy,
      amountRaised: algokit.microAlgos(proposal.amountRaised).algos,
      noOfDonations: Number(proposal.noOfDonations),
      noOfUniqueDonors: Number(proposal.noOfUniqueDonors),
      currentMilestone: Number(proposal.currentMilestone),
    };
    return readableProposal;
  } catch {
    return undefined;
  }
};

const getDonationAmount = async (proposalId: bigint, donor: string) => {
  try {
    await syncTimeOffsetInLocalNet();
    const donation = await appClient.state.box.donations.value({
      proposalId: proposalId,
      donor: donor,
    });
    return donation ? algokit.microAlgos(donation).algos : undefined;
  } catch {
    return undefined;
  }
};

const getVotedAddresses = async (proposalId: bigint) => {
  try {
    await syncTimeOffsetInLocalNet();
    const votedAddresses = await appClient.state.box.milestoneVotes.value(proposalId);
    return votedAddresses ?? [];
  } catch {
    return [];
  }
};

const categories = [
  "Technology",
  "Healthcare",
  "Education",
  "Environment",
  "Social Impact",
  "Arts & Culture",
  "Research & Development",
  "Community Projects",
];

export { getProposalsLength, getProposal, categories, getDonationAmount, getVotedAddresses };
