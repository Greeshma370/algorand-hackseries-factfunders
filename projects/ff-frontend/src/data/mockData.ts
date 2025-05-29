import { Category, Feature, Fundraiser, Founder } from '../types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Medical',
    icon: 'heart-pulse',
    description: 'Support healthcare initiatives, medical research, and patient care projects'
  },
  {
    id: '2',
    name: 'Education',
    icon: 'graduation-cap',
    description: 'Fund educational programs, scholarships, and learning resources'
  },
  {
    id: '3',
    name: 'Entrepreneurship',
    icon: 'lightbulb',
    description: 'Back innovative startups, small businesses, and entrepreneurial ventures'
  },
  {
    id: '4',
    name: 'Entertainment',
    icon: 'film',
    description: 'Support creative projects in film, music, gaming, and the arts'
  }
];

export const features: Feature[] = [
  {
    id: '1',
    title: 'Milestone-Based Funding',
    description: 'Funds are released incrementally as project milestones are completed and verified',
    icon: 'milestone'
  },
  {
    id: '2',
    title: 'Community Governance',
    description: 'Donors vote to approve milestone completions based on submitted evidence',
    icon: 'vote'
  },
  {
    id: '3',
    title: 'Weighted Voting',
    description: 'Voting power is proportional to donation amounts for fair representation',
    icon: 'scale'
  },
  {
    id: '4',
    title: 'Blockchain Transparency',
    description: 'All transactions and voting records are stored on the Algorand blockchain',
    icon: 'shield'
  },
  {
    id: '5',
    title: 'Automatic Distribution',
    description: 'Smart contracts ensure automatic fund distribution when milestones are approved',
    icon: 'zap'
  }
];

export const fundraisers: Fundraiser[] = [
  {
    id: '1',
    title: 'Clean Water Initiative',
    description: 'Bringing clean water to underserved communities through sustainable infrastructure',
    creator: 'EcoSolutions',
    imageUrl: 'https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    totalAmount: 50000,
    raisedAmount: 32500,
    category: 'Medical',
    milestones: [
      { id: '1', name: 'Initial Research', amount: 10000, completed: true },
      { id: '2', name: 'Equipment Purchase', amount: 15000, completed: true },
      { id: '3', name: 'Construction Phase 1', amount: 15000, completed: false },
      { id: '4', name: 'Deployment', amount: 10000, completed: false }
    ],
    createdAt: '2023-09-15',
    daysLeft: 15
  },
  {
    id: '2',
    title: 'AI Education Platform',
    description: 'Developing an accessible AI learning platform for students in underserved areas',
    creator: 'EduTech Innovations',
    imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    totalAmount: 75000,
    raisedAmount: 45000,
    category: 'Education',
    milestones: [
      { id: '1', name: 'Curriculum Development', amount: 15000, completed: true },
      { id: '2', name: 'Platform Architecture', amount: 20000, completed: true },
      { id: '3', name: 'Beta Testing', amount: 15000, completed: false },
      { id: '4', name: 'Launch', amount: 25000, completed: false }
    ],
    createdAt: '2023-10-01',
    daysLeft: 30
  },
  {
    id: '3',
    title: 'Sustainable Fashion Brand',
    description: 'Creating eco-friendly clothing using innovative recycled materials',
    creator: 'GreenThreads',
    imageUrl: 'https://images.pexels.com/photos/6567607/pexels-photo-6567607.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    totalAmount: 40000,
    raisedAmount: 12000,
    category: 'Entrepreneurship',
    milestones: [
      { id: '1', name: 'Material Research', amount: 8000, completed: true },
      { id: '2', name: 'Design Phase', amount: 10000, completed: false },
      { id: '3', name: 'Production Setup', amount: 12000, completed: false },
      { id: '4', name: 'Marketing Launch', amount: 10000, completed: false }
    ],
    createdAt: '2023-11-10',
    daysLeft: 45
  },
  {
    id: '4',
    title: 'Interactive Documentary Series',
    description: 'A groundbreaking documentary series exploring climate solutions worldwide',
    creator: 'Visionary Films',
    imageUrl: 'https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    totalAmount: 90000,
    raisedAmount: 60000,
    category: 'Entertainment',
    milestones: [
      { id: '1', name: 'Pre-production', amount: 20000, completed: true },
      { id: '2', name: 'Production Phase 1', amount: 25000, completed: true },
      { id: '3', name: 'Production Phase 2', amount: 25000, completed: false },
      { id: '4', name: 'Post-production', amount: 20000, completed: false }
    ],
    createdAt: '2023-08-22',
    daysLeft: 20
  }
];

export const founders: Founder[] = [
  {
    id: '1',
    name: 'Alexandra Chen',
    role: 'Co-Founder & CEO',
    imageUrl: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bio: 'Blockchain technology expert with over 10 years of experience in fintech. Previously led development at major cryptocurrency exchanges.',
    socialLinks: {
      twitter: 'https://twitter.com/alexchen',
      linkedin: 'https://linkedin.com/in/alexchen',
      github: 'https://github.com/alexchen'
    }
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Co-Founder & CTO',
    imageUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    bio: 'Smart contract specialist with a background in decentralized finance and crowdfunding platforms. Passionate about democratizing access to funding.',
    socialLinks: {
      twitter: 'https://twitter.com/marcusjohnson',
      linkedin: 'https://linkedin.com/in/marcusjohnson',
      github: 'https://github.com/marcusjohnson'
    }
  }
];