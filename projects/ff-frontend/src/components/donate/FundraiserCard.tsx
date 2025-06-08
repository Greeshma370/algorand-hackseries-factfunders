import React from 'react';
import { ArrowRight, Users, Target, TrendingUp } from 'lucide-react';
import { ReadableProposal } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import { Link } from 'react-router-dom';

interface FundraiserCardProps {
  proposal: ReadableProposal;
}

const FundraiserCard: React.FC<FundraiserCardProps> = ({ proposal }) => {
  const percentFunded = Math.round((proposal.amountRaised / proposal.amountRequired) * 100);
  const completedMilestones = proposal.milestones.filter(m => m.claimed).length;
  
  return (
    <Card 
      elevation="md" 
      padding="none" 
      rounded="lg"
      hoverEffect={true}
      className="overflow-hidden flex flex-col h-full"
    >
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {proposal.category}
          </span>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{percentFunded}%</div>
            <div className="text-xs text-gray-500">funded</div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">{proposal.title}</h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-3">{proposal.description}</p>
        
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressColor(percentFunded)}`} 
              style={{ width: `${percentFunded}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm mb-4">
          <span className="font-medium text-gray-900">${proposal.amountRaised.toLocaleString()}</span>
          <span className="text-gray-500">of ${proposal.amountRequired.toLocaleString()}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users size={16} className="text-blue-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">{proposal.noOfUniqueDonors}</div>
            <div className="text-xs text-gray-500">donors</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target size={16} className="text-green-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">{completedMilestones}/{proposal.milestones.length}</div>
            <div className="text-xs text-gray-500">milestones</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp size={16} className="text-purple-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">{proposal.noOfDonations}</div>
            <div className="text-xs text-gray-500">donations</div>
          </div>
        </div>
        
        {proposal.milestones.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Milestone:</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900">
                {proposal.milestones[proposal.currentMilestone]?.name || 'All milestones completed'}
              </div>
              {proposal.milestones[proposal.currentMilestone] && (
                <div className="text-xs text-gray-500 mt-1">
                  ${proposal.milestones[proposal.currentMilestone].amount.toLocaleString()} target
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="px-6 pb-6">
        <Link to={`/fundraiser/${proposal.id}`}>
          <Button 
            variant="primary" 
            fullWidth 
            icon={ArrowRight} 
            iconPosition="right"
          >
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
};

// Helper function to determine progress bar color
function getProgressColor(percentage: number): string {
  if (percentage < 30) return 'bg-red-500';
  if (percentage < 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

export default FundraiserCard;