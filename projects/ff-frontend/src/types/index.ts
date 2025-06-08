export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Milestone {
  id: string;
  name: string;
  amount: number;
  completed: boolean;
}

export interface Fundraiser {
  id: string;
  title: string;
  description: string;
  creator: string;
  imageUrl: string;
  totalAmount: number;
  raisedAmount: number;
  category: string;
  milestones: Milestone[];
  createdAt: string;
  daysLeft: number;
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  bio: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface ReadableMilestone {
  name: string;
  amount: number;
  proofLink: string;
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  claimed: boolean;
  proofSubmittedTime: number;
  votingEndTime: number;
}

export interface ReadableProposal {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  amountRequired: number;
  milestones: ReadableMilestone[];
  createdAt: number;
  createdBy: string;
  amountRaised: number;
  noOfDonations: number;
  noOfUniqueDonors: number;
  currentMilestone: number;
}