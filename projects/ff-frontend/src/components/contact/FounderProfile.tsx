import React from 'react';
import { Twitter, Linkedin, Github } from 'lucide-react';
import { Founder } from '../../types';
import Card from '../common/Card';

interface FounderProfileProps {
  founder: Founder;
}

const FounderProfile: React.FC<FounderProfileProps> = ({ founder }) => {
  return (
    <Card elevation="md" className="overflow-hidden">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img 
            className="h-48 w-full object-cover md:h-full md:w-48" 
            src={founder.imageUrl}
            alt={founder.name}
          />
        </div>
        <div className="p-6">
          <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">
            {founder.role}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">
            {founder.name}
          </h3>
          <p className="mt-3 text-gray-600">
            {founder.bio}
          </p>
          <div className="mt-4 flex space-x-4">
            {founder.socialLinks.twitter && (
              <a 
                href={founder.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
              >
                <Twitter size={20} />
              </a>
            )}
            {founder.socialLinks.linkedin && (
              <a 
                href={founder.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                <Linkedin size={20} />
              </a>
            )}
            {founder.socialLinks.github && (
              <a 
                href={founder.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors duration-200"
              >
                <Github size={20} />
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FounderProfile;