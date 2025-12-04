import React, { useEffect, useState } from 'react';
import {
  getProposalsLength,
  getProposal,
  getAllDonations
} from '../data/getters';
import { Loader2, Trophy, Medal, User, Heart, CheckCircle2 } from 'lucide-react';

interface CreatorLeader {
  address: string;
  totalRaised: number;
  campaignCount: number;
  successfulCampaigns: number;
}

interface DonorLeader {
  address: string;
  totalDonated: number;
  campaignsSupported: number;
}

type Tab = 'creator' | 'donor';

// Helpers
const toNumber = (v: bigint | number | string | null | undefined): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'bigint') return Number(v);
  return Number(v);
};

// If your values are microAlgos, keep this.
// If they're already ALGO, change to: const toAlgo = (v: any) => toNumber(v);
const toAlgo = (v: any): number => toNumber(v) / 1_000_000;

const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('creator');
  const [creators, setCreators] = useState<CreatorLeader[]>([]);
  const [donors, setDonors] = useState<DonorLeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const lengthRaw = await getProposalsLength();
        const length = toNumber(lengthRaw);


        const creatorMap: Record<string, CreatorLeader> = {};
        // Aggregate creators as before
        for (let i = 0; i < length; i++) {
          const proposalId = BigInt(i);
          const proposal = await getProposal(proposalId);
          if (!proposal) continue;
          const creatorAddr = proposal.createdBy;
          if (!creatorMap[creatorAddr]) {
            creatorMap[creatorAddr] = {
              address: creatorAddr,
              totalRaised: 0,
              campaignCount: 0,
              successfulCampaigns: 0,
            };
          }
          const amountRaised = Number(proposal.amountRaised ?? 0);
          const amountRequired = Number(proposal.amountRequired ?? 0);
          creatorMap[creatorAddr].totalRaised += amountRaised;
          creatorMap[creatorAddr].campaignCount += 1;
          if (amountRaised >= amountRequired) {
            creatorMap[creatorAddr].successfulCampaigns += 1;
          }
        }

        // Donor aggregation using getAllDonations
        const donorMap: Record<string, DonorLeader> = {};
        const allDonations = await getAllDonations();
        // Map: donor address -> set of proposalIds supported
        const donorCampaigns: Record<string, Set<string>> = {};
        for (const donation of allDonations) {
          const donorAddr = donation.donor;
          const proposalId = donation.proposalId?.toString?.() ?? String(donation.proposalId);
          const amount = Number(donation.amount ?? 0);
          if (amount > 0) {
            if (!donorMap[donorAddr]) {
              donorMap[donorAddr] = {
                address: donorAddr,
                totalDonated: 0,
                campaignsSupported: 0,
              };
              donorCampaigns[donorAddr] = new Set();
            }
            donorMap[donorAddr].totalDonated += amount;
            donorCampaigns[donorAddr].add(proposalId);
          }
        }
        // Set campaignsSupported for each donor
        for (const donorAddr in donorMap) {
          donorMap[donorAddr].campaignsSupported = donorCampaigns[donorAddr].size;
        }

        const sortedCreators = Object.values(creatorMap).sort(
          (a, b) => b.totalRaised - a.totalRaised
        );
        const sortedDonors = Object.values(donorMap).sort(
          (a, b) => b.totalDonated - a.totalDonated
        );

        setCreators(sortedCreators);
        setDonors(sortedDonors);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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

  // ... your JSX table part is unchanged ...
  // (you can keep exactly what you already had for the return)

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
                {activeTab === 'creator' && (
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                    Successful Campaigns
                  </th>
                )}
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                  {activeTab === 'creator' ? 'Total Raised (ALGO)' : 'Total Donated (ALGO)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeTab === 'creator' ? (
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
                        <span className="font-semibold text-gray-700">
                          {leader.campaignsSupported}
                        </span>
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
