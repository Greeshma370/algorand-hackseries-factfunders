import React, { useEffect, useState } from 'react';
import {
  getProposalsLength,
  getProposal,
  getVotedAddresses,
  getDonationAmount
} from '../data/getters';
import { Loader2, Trophy, Medal, User, Heart, CheckCircle2 } from 'lucide-react';

// Interfaces for our data
interface CreatorLeader {
  address: string;
  totalRaised: number;
  campaignCount: number;
  successfulCampaigns: number; // <--- New Field
}

interface DonorLeader {
  address: string;
  totalDonated: number;
  campaignsSupported: number;
}

type Tab = 'creator' | 'donor';

const LeaderboardPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<Tab>('creator');
  const [creators, setCreators] = useState<CreatorLeader[]>([]);
  const [donors, setDonors] = useState<DonorLeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const length = await getProposalsLength();
        const creatorMap: Record<string, CreatorLeader> = {};
        const donorMap: Record<string, DonorLeader> = {};

        // Loop through all proposals
        for (let i = 0; i < Number(length); i++) {
          const proposalId = BigInt(i);
          const proposal = await getProposal(proposalId);

          if (proposal) {
            // 1. Process Creator Data
            const creatorAddr = proposal.createdBy;
            if (!creatorMap[creatorAddr]) {
              creatorMap[creatorAddr] = {
                address: creatorAddr,
                totalRaised: 0,
                campaignCount: 0,
                successfulCampaigns: 0 // <--- Initialize
              };
            }
            creatorMap[creatorAddr].totalRaised += proposal.amountRaised;
            creatorMap[creatorAddr].campaignCount += 1;

            // Check if campaign was successful (Raised >= Required)
            if (proposal.amountRaised >= proposal.amountRequired) {
              creatorMap[creatorAddr].successfulCampaigns += 1;
            }

            // 2. Process Donor Data
            const voters = await getVotedAddresses(proposalId);
            const uniqueVoters = Array.from(new Set(voters));

            for (const donorAddr of uniqueVoters) {
              const donationAmount = await getDonationAmount(proposalId, donorAddr);

              if (donationAmount && donationAmount > 0) {
                if (!donorMap[donorAddr]) {
                  donorMap[donorAddr] = {
                    address: donorAddr,
                    totalDonated: 0,
                    campaignsSupported: 0
                  };
                }
                donorMap[donorAddr].totalDonated += Number(donationAmount);
                donorMap[donorAddr].campaignsSupported += 1;
              }
            }
          }
        }

        // Convert maps to arrays and sort
        const sortedCreators = Object.values(creatorMap).sort((a, b) => b.totalRaised - a.totalRaised);
        const sortedDonors = Object.values(donorMap).sort((a, b) => b.totalDonated - a.totalDonated);

        setCreators(sortedCreators);
        setDonors(sortedDonors);

      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const RenderRankIcon = ({ index }: { index: number }) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="font-semibold text-gray-500 pl-2">#{index + 1}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Leaderboard</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Recognizing the top creators and donors making an impact on Fact Funders.
        </p>
      </div>

      {/* Toggle Buttons */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'creator'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4 mr-2" />
            Top Creators
          </button>
          <button
            onClick={() => setActiveTab('donor')}
            className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'donor'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Heart className="w-4 h-4 mr-2" />
            Top Donors
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 max-w-5xl mx-auto">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-24">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  {activeTab === 'creator' ? 'Creator Address' : 'Donor Address'}
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                  {activeTab === 'creator' ? 'Campaigns Created' : 'Campaigns Supported'}
                </th>
                {/* NEW COLUMN HEADER FOR CREATORS */}
                {activeTab === 'creator' && (
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                    Successful Campaigns
                  </th>
                )}
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  {activeTab === 'creator' ? 'Total Raised' : 'Total Donated'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeTab === 'creator' ? (
                // Creators List
                creators.length > 0 ? (
                  creators.map((leader, index) => (
                    <tr key={leader.address} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <RenderRankIcon index={index} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
                          {formatAddress(leader.address)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-gray-700">{leader.campaignCount}</span>
                      </td>
                      {/* NEW COLUMN DATA FOR CREATORS */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1 text-green-600">
                           <CheckCircle2 className="w-4 h-4" />
                           <span className="font-semibold">{leader.successfulCampaigns}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-gray-800">
                          {leader.totalRaised.toLocaleString()} ALGO
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No creator data available yet.
                    </td>
                  </tr>
                )
              ) : (
                // Donors List
                donors.length > 0 ? (
                  donors.map((leader, index) => (
                    <tr key={leader.address} className="hover:bg-pink-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <RenderRankIcon index={index} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-sm">
                          {formatAddress(leader.address)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-gray-700">{leader.campaignsSupported}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-green-600">
                          {leader.totalDonated.toLocaleString()} ALGO
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No donation data available yet.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
