import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { Fundraiser } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import { Link } from 'react-router-dom';

interface FundraiserCardProps {
  fundraiser: Fundraiser;
}

const FundraiserCard: React.FC<FundraiserCardProps> = ({ fundraiser }) => {
  const percentFunded = Math.round((fundraiser.raisedAmount / fundraiser.totalAmount) * 100);
  
  return (
    <Card 
      elevation="md" 
      padding="none" 
      rounded="lg"
      hoverEffect={true}
      className="overflow-hidden flex flex-col h-full"
    >
      <div className="relative">
        <img 
          src={fundraiser.imageUrl} 
          alt={fundraiser.title} 
          className="w-full h-52 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-800">
            {fundraiser.category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">{fundraiser.title}</h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-3">{fundraiser.description}</p>
        
        <div className="flex items-center mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressColor(percentFunded)}`} 
              style={{ width: `${percentFunded}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm mb-4">
          <span className="font-medium text-gray-900">${fundraiser.raisedAmount.toLocaleString()}</span>
          <span className="text-gray-500">of ${fundraiser.totalAmount.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm mb-6">
          <span className="font-medium text-gray-900">{percentFunded}% funded</span>
          <span className="flex items-center text-gray-500">
            <Clock size={14} className="mr-1" />
            {fundraiser.daysLeft} days left
          </span>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Milestones:</h4>
          <div className="space-y-2">
            {fundraiser.milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-center text-sm">
                <div 
                  className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 
                    ${milestone.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                >
                  {index + 1}
                </div>
                <span className={milestone.completed ? 'text-gray-900' : 'text-gray-500'}>
                  {milestone.name}
                </span>
                <span className="ml-auto text-xs">
                  ${milestone.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-6 mt-4">
        <Link to={`/fundraiser/${fundraiser.id}`}>
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