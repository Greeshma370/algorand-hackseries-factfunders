
export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  completed: boolean;
  proofLink?: string;
  votes: {
    yes: number;
    no: number;
  };
  claimed: boolean;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  category: string;
  target: number;
  raised: number;
  backers: number;
  createdAt: string;
  endDate: string;
  status: 'active' | 'funded' | 'completed' | 'expired';
  imageUrl: string;
  milestones: Milestone[];
}

export interface Donation {
  id: string;
  proposalId: string;
  userId: string;
  amount: number;
  date: string;
}

export type UserRole = 'creator' | 'donor' | 'both';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  donations: Donation[];
  createdProposals: string[];
}
