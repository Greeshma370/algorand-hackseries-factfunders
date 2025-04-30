
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Proposal, Milestone } from '../types';
import { dummyProposals } from '../lib/data';
import { toast } from '@/components/ui/use-toast';

interface FundingContextType {
  proposals: Proposal[];
  createProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'backers' | 'raised'>) => void;
  donateToProposal: (proposalId: string, amount: number) => void;
  submitProof: (proposalId: string, milestoneId: string, proofLink: string) => void;
  voteMilestone: (proposalId: string, milestoneId: string, vote: boolean) => void;
  claimMilestone: (proposalId: string, milestoneId: string) => void;
  refundIfInactive: (proposalId: string) => void;
}

const FundingContext = createContext<FundingContextType | undefined>(undefined);

export function FundingProvider({ children }: { children: ReactNode }) {
  const [proposals, setProposals] = useState<Proposal[]>(dummyProposals);

  // Create a new proposal with milestones
  const createProposal = (proposal: Omit<Proposal, 'id' | 'createdAt' | 'backers' | 'raised'>) => {
    const newProposal: Proposal = {
      ...proposal,
      id: `${proposals.length + 1}`,
      createdAt: new Date().toISOString().split('T')[0],
      backers: 0,
      raised: 0,
    };

    setProposals([...proposals, newProposal]);
    toast({
      title: "Proposal Created",
      description: "Your proposal has been successfully created.",
    });
  };

  // Donate to a proposal
  const donateToProposal = (proposalId: string, amount: number) => {
    setProposals(
      proposals.map(proposal => {
        if (proposal.id === proposalId) {
          return {
            ...proposal,
            raised: proposal.raised + amount,
            backers: proposal.backers + 1,
          };
        }
        return proposal;
      })
    );
    toast({
      title: "Donation Successful",
      description: `Thank you for donating $${amount.toLocaleString()}.`,
    });
  };

  // Submit proof for a milestone
  const submitProof = (proposalId: string, milestoneId: string, proofLink: string) => {
    setProposals(
      proposals.map(proposal => {
        if (proposal.id === proposalId) {
          return {
            ...proposal,
            milestones: proposal.milestones.map(milestone => {
              if (milestone.id === milestoneId) {
                return {
                  ...milestone,
                  proofLink,
                  completed: true,
                };
              }
              return milestone;
            }),
          };
        }
        return proposal;
      })
    );
    toast({
      title: "Proof Submitted",
      description: "Your proof has been submitted for review.",
    });
  };

  // Vote on a milestone
  const voteMilestone = (proposalId: string, milestoneId: string, vote: boolean) => {
    setProposals(
      proposals.map(proposal => {
        if (proposal.id === proposalId) {
          return {
            ...proposal,
            milestones: proposal.milestones.map(milestone => {
              if (milestone.id === milestoneId) {
                return {
                  ...milestone,
                  votes: {
                    yes: vote ? milestone.votes.yes + 1 : milestone.votes.yes,
                    no: !vote ? milestone.votes.no + 1 : milestone.votes.no,
                  },
                };
              }
              return milestone;
            }),
          };
        }
        return proposal;
      })
    );
    toast({
      title: "Vote Recorded",
      description: `You voted ${vote ? "Yes" : "No"} for this milestone.`,
    });
  };

  // Claim milestone funds
  const claimMilestone = (proposalId: string, milestoneId: string) => {
    setProposals(
      proposals.map(proposal => {
        if (proposal.id === proposalId) {
          return {
            ...proposal,
            milestones: proposal.milestones.map(milestone => {
              if (milestone.id === milestoneId) {
                return {
                  ...milestone,
                  claimed: true,
                };
              }
              return milestone;
            }),
          };
        }
        return proposal;
      })
    );
    toast({
      title: "Milestone Claimed",
      description: "Milestone funds have been successfully claimed.",
    });
  };

  // Refund if proposal is inactive
  const refundIfInactive = (proposalId: string) => {
    setProposals(
      proposals.map(proposal => {
        if (proposal.id === proposalId) {
          return {
            ...proposal,
            status: 'expired',
          };
        }
        return proposal;
      })
    );
    toast({
      title: "Refund Initiated",
      description: "This proposal has been marked as expired. Refunds will be processed.",
    });
  };

  const value = {
    proposals,
    createProposal,
    donateToProposal,
    submitProof,
    voteMilestone,
    claimMilestone,
    refundIfInactive,
  };

  return <FundingContext.Provider value={value}>{children}</FundingContext.Provider>;
}

export function useFunding() {
  const context = useContext(FundingContext);
  if (context === undefined) {
    throw new Error('useFunding must be used within a FundingProvider');
  }
  return context;
}
