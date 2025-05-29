import React from 'react';
import StartFundraiserBanner from '../components/donate/StartFundraiserBanner';
import FundraiserList from '../components/donate/FundraiserList';

const DonatePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Support Innovative Projects</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Browse and donate to transparent, milestone-based fundraising campaigns across various categories.
        </p>
      </div>
      
      <StartFundraiserBanner />
      <FundraiserList />
    </div>
  );
};

export default DonatePage;