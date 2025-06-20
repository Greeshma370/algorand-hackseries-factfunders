import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import FundraiserCard from './FundraiserCard';
import { getProposal, getProposalsLength, categories } from '../../data/getters';
import { ReadableProposal } from '../../types';

const FundraiserList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [proposals, setProposals] = useState<ReadableProposal[]>([]);

  useEffect(() => {
    const fetchProposals = async () => {
      const length = await getProposalsLength();
      const proposalsPromises = [];
      for (let i = 0; i < length; i++) {
        proposalsPromises.push(getProposal(BigInt(i)));
      }
      const proposals = await Promise.all(proposalsPromises);
      const filteredProposals = proposals.filter((proposal): proposal is ReadableProposal => proposal !== undefined);
      setProposals(filteredProposals);
      console.log(filteredProposals);
    };
    fetchProposals();
  }, []);

  const filteredFundraisers = useMemo(() => {
    return proposals.filter(fundraiser => {
      const matchesSearch = fundraiser.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           fundraiser.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === '' || fundraiser.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [proposals, searchTerm, categoryFilter]);
  
  return (
    <div>
      <div className="mb-8 bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {filteredFundraisers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFundraisers.map(proposal => (
            <FundraiserCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">No projects found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default FundraiserList;