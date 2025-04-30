
import { Proposal } from '../types';

export const dummyProposals: Proposal[] = [
  {
    id: "1",
    title: "EcoHarvest: Sustainable Urban Farming Solutions",
    description: "We're building a network of urban farms using vertical farming technology to provide fresh produce to food deserts in major cities. Our system uses 95% less water than traditional farming and can be installed in unused urban spaces.",
    creatorId: "user1",
    creatorName: "Green Future Initiative",
    category: "Environment",
    target: 50000,
    raised: 32500,
    backers: 215,
    createdAt: "2025-03-15",
    endDate: "2025-06-15",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    milestones: [
      {
        id: "1-1",
        title: "Prototype Development",
        description: "Complete the initial prototype for our vertical farming unit and conduct preliminary tests.",
        amount: 15000,
        dueDate: "2025-04-30",
        completed: true,
        proofLink: "https://example.com/proof1",
        votes: {
          yes: 180,
          no: 5
        },
        claimed: true
      },
      {
        id: "1-2",
        title: "First Installation",
        description: "Install our first functional urban farm in a pilot location and begin growing operations.",
        amount: 20000,
        dueDate: "2025-07-15",
        completed: false,
        votes: {
          yes: 0,
          no: 0
        },
        claimed: false
      },
      {
        id: "1-3",
        title: "Distribution Network",
        description: "Establish partnerships with local markets and community centers for produce distribution.",
        amount: 15000,
        dueDate: "2025-09-30",
        completed: false,
        votes: {
          yes: 0,
          no: 0
        },
        claimed: false
      }
    ]
  },
  {
    id: "2",
    title: "MindfulTech: Accessible Mental Health Platform",
    description: "We're developing an AI-powered mental health platform that provides personalized resources, guided meditation, and anonymous peer support for those who can't access traditional therapy.",
    creatorId: "user2",
    creatorName: "Wellness Tech Collective",
    category: "Health",
    target: 75000,
    raised: 45000,
    backers: 320,
    createdAt: "2025-02-20",
    endDate: "2025-05-20",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    milestones: [
      {
        id: "2-1",
        title: "Platform Development",
        description: "Complete the core platform development and initial AI integration.",
        amount: 30000,
        dueDate: "2025-04-15",
        completed: true,
        proofLink: "https://example.com/proof2",
        votes: {
          yes: 290,
          no: 10
        },
        claimed: true
      },
      {
        id: "2-2",
        title: "Beta Testing",
        description: "Launch beta testing with select users and gather feedback for improvements.",
        amount: 25000,
        dueDate: "2025-06-30",
        completed: false,
        votes: {
          yes: 0,
          no: 0
        },
        claimed: false
      },
      {
        id: "2-3",
        title: "Public Launch",
        description: "Full public release with all features and ongoing support infrastructure.",
        amount: 20000,
        dueDate: "2025-08-15",
        completed: false,
        votes: {
          yes: 0,
          no: 0
        },
        claimed: false
      }
    ]
  },
  {
    id: "3",
    title: "Ocean Cleanup Drone Fleet",
    description: "We're building autonomous solar-powered drones that can collect plastic waste from oceans and coastlines. Each drone can collect up to 500kg of waste before returning to base for recycling.",
    creatorId: "user3",
    creatorName: "Clean Seas Coalition",
    category: "Environment",
    target: 120000,
    raised: 72000,
    backers: 450,
    createdAt: "2025-01-10",
    endDate: "2025-04-10",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    milestones: [
      {
        id: "3-1",
        title: "Prototype Development",
        description: "Build and test the first prototype drone in controlled environments.",
        amount: 40000,
        dueDate: "2025-03-01",
        completed: true,
        proofLink: "https://example.com/proof3",
        votes: {
          yes: 430,
          no: 20
        },
        claimed: true
      },
      {
        id: "3-2",
        title: "Ocean Testing",
        description: "Conduct real-world ocean testing and refine the collection mechanisms.",
        amount: 50000,
        dueDate: "2025-05-15",
        completed: false,
        votes: {
          yes: 0,
          no: 0
        },
        claimed: false
      },
      {
        id: "3-3",
        title: "Fleet Production",
        description: "Begin production of the initial fleet of 5 operational drones.",
        amount: 30000,
        dueDate: "2025-07-30",
        completed: false,
        votes: {
          yes: 0,
          no: 0
        },
        claimed: false
      }
    ]
  }
];
