import React from 'react';
import { Shield, Vote, Milestone, Scale, Zap } from 'lucide-react';
import Card from '../common/Card';
import { features } from '../../data/mockData';

const iconMap: { [key: string]: React.ReactNode } = {
  shield: <Shield className="w-12 h-12 text-blue-500" />,
  vote: <Vote className="w-12 h-12 text-blue-500" />,
  milestone: <Milestone className="w-12 h-12 text-blue-500" />,
  scale: <Scale className="w-12 h-12 text-blue-500" />,
  zap: <Zap className="w-12 h-12 text-blue-500" />
};

const Features: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">How Fact Funders Works</h2>
          <p className="text-xl text-gray-600">
            Our platform combines blockchain technology with community governance to create a transparent and accountable crowdfunding experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card 
              key={feature.id} 
              elevation="sm" 
              hoverEffect={true}
              className="flex flex-col items-center text-center p-8"
            >
              <div className="mb-6 p-4 bg-blue-50 rounded-full">
                {iconMap[feature.icon]}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-white shadow-md rounded-lg p-8 max-w-2xl">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Why Choose Fact Funders?</h3>
            <p className="text-gray-600 mb-6">
              Traditional crowdfunding platforms provide little visibility into how funds are used. 
              Fact Funders ensures transparency and accountability by releasing funds only when 
              project milestones are completed and verified by the community.
            </p>
            <div className="flex justify-center">
              <a 
                href="#" 
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200"
              >
                Learn more about our technology →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;