import React from 'react';

const StatsBanner: React.FC = () => {
  return (
    <section className="bg-blue-900 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">Impact</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2 text-blue-300">$20+</div>
            <div className="text-lg text-blue-100 font-medium">Total Funded</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2 text-blue-300">2</div>
            <div className="text-lg text-blue-100 font-medium">Projects Funded</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2 text-blue-300">5</div>
            <div className="text-lg text-blue-100 font-medium">Contributors</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2 text-blue-300">95%</div>
            <div className="text-lg text-blue-100 font-medium">Milestone Completion Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
