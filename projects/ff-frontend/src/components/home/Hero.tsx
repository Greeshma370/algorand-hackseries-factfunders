import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 right-0 h-40 bg-white opacity-10 transform -skew-y-6 translate-y-24"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-white opacity-10 transform skew-y-6 -translate-y-24"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-block bg-blue-500 bg-opacity-30 px-4 py-2 rounded-full">
              <span className="text-sm font-medium">Powered by Algorand Blockchain</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Transparent Crowdfunding with Milestone-Based Releases
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0">
              Fact Funders creates trust through community governance and blockchain transparency. 
              Fund projects that matter with milestone-based releases verified by donors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/donate">
                <Button 
                  variant="primary" 
                  size="lg" 
                  icon={ArrowRight} 
                  iconPosition="right"
                >
                  Explore Projects
                </Button>
              </Link>
              <Link to="/donate">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white hover:bg-opacity-10"
                >
                  Start a Fundraiser
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="relative rounded-lg overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="People collaborating on a project" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-60"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Clean Water Initiative</span>
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">65% Funded</span>
                  </div>
                  <div className="w-full bg-gray-300 bg-opacity-30 rounded-full h-2 mb-4">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span>$32,500 raised</span>
                    <span>$50,000 goal</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-blue-500 bg-opacity-20 rounded-full"></div>
            <div className="absolute -top-10 -right-10 w-16 h-16 bg-indigo-500 bg-opacity-20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;