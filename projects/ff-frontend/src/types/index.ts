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