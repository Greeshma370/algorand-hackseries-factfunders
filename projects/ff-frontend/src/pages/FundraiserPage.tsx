import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  Clock,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Upload,
  Vote,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ReadableProposal } from "../types";
import { getDonationAmount, getProposal, getVotedAddresses } from "../data/getters";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { algorandClient, appClient, syncTimeOffsetInLocalNet } from "../data/clients";
import * as algokit from "@algorandfoundation/algokit-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import { showErrorToast, showSuccessToast, toastMessages } from "../utils/toast";
import { APP_ADDRESS } from "../data/config";

const FundraiserPage: React.FC = () => {
  const { activeAddress, transactionSigner } = useWallet();
  const { id } = useParams<{ id: string }>();
  const [proposal, setProposal] = useState<ReadableProposal | null>(null);
  const [donatedAmount, setDonatedAmount] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [isCreator, setIsCreator] = useState(false); // This should be set based on wallet connection
  const [hasDonated, setHasDonated] = useState(false); // This should be checked from contract
  const [votedAddresses, setVotedAddresses] = useState<string[]>([]);

  const fetchState = async () => {
    setLoading(true);
    try {
      if (id) {
        const proposalData = await getProposal(BigInt(id));
        if (proposalData) {
          setProposal(proposalData);
        }
        const votedAddresses = await getVotedAddresses(BigInt(id));
        setVotedAddresses(votedAddresses);
        if (activeAddress) {
          const da = await getDonationAmount(BigInt(id), activeAddress);
          setDonatedAmount(da ?? undefined);
          setHasDonated(da !== undefined);
          if (proposalData) {
            const isC = proposalData.createdBy === activeAddress;
            setIsCreator(isC);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log(proposal);

  useEffect(() => {
    fetchState();
  }, [id, activeAddress]);

  const isVoted = useMemo(() => {
    if (!activeAddress) return false;
    return votedAddresses.includes(activeAddress);
  }, [votedAddresses, activeAddress]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proposal not found</h1>
          <Link to="/donate">
            <Button variant="primary" icon={ArrowLeft} iconPosition="left">
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const percentFunded = Math.round((proposal.amountRaised / proposal.amountRequired) * 100);
  const amountCanBeDonated = proposal.amountRequired - proposal.amountRaised > 0 ? proposal.amountRequired - proposal.amountRaised : 0;
  const isFullyFunded = proposal.amountRaised >= proposal.amountRequired;
  const currentMilestone = proposal.milestones[proposal.currentMilestone];
  const completedMilestones = proposal.milestones.filter((m) => m.claimed).length;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now() / 1000;
    const remaining = endTime - now;
    if (remaining <= 0) return "Voting ended";

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const handleDonate = async () => {
    if (!activeAddress || !transactionSigner) {
      showErrorToast(toastMessages.fundraiser.walletNotConnected);
      return;
    }
    // Implement donation logic
    try {
      const paymentTxn = await algorandClient.createTransaction.payment({
        sender: activeAddress,
        receiver: APP_ADDRESS,
        amount: algokit.algos(BigInt(parseFloat(donationAmount))),
        signer: transactionSigner,
      });
      await syncTimeOffsetInLocalNet();
      const result = await appClient.send.donateProposal({
        args: {
          proposalId: BigInt(proposal.id),
          payment: paymentTxn,
        },
        signer: transactionSigner,
        sender: activeAddress,
        populateAppCallResources: true,
      });
      showSuccessToast(toastMessages.fundraiser.donationSuccess);
      await fetchState();
    } catch (error) {
      console.error("Error donating:", error);
      showErrorToast(toastMessages.fundraiser.donationFailed);
    }
  };

  const handleSubmitProof = async () => {
    if (!activeAddress || !transactionSigner) {
      showErrorToast(toastMessages.fundraiser.walletNotConnected);
      return;
    }
    try {
      await syncTimeOffsetInLocalNet();
      const result = await appClient.send.submitProof({
        args: {
          proposalId: BigInt(proposal.id),
          proofLink: proofLink,
        },
        signer: transactionSigner,
        sender: activeAddress,
        populateAppCallResources: true,
      });
      showSuccessToast(toastMessages.fundraiser.proofSubmissionSuccess);
      await fetchState();
    } catch (error) {
      console.error("Error submitting proof:", error);
      showErrorToast(toastMessages.fundraiser.proofSubmissionFailed);
    }
  };

  const handleVote = async (vote: boolean) => {
    if (!activeAddress || !transactionSigner) {
      showErrorToast(toastMessages.fundraiser.walletNotConnected);
      return;
    }
    try {
      await syncTimeOffsetInLocalNet();
      const result = await appClient.send.voteMilestone({
        args: {
          proposalId: BigInt(proposal.id),
          vote: vote,
        },
        signer: transactionSigner,
        sender: activeAddress,
        populateAppCallResources: true,
      });
      showSuccessToast(toastMessages.fundraiser.milestoneVoteSuccess);
      await fetchState();
    } catch (error) {
      console.error("Error voting:", error);
      showErrorToast(toastMessages.fundraiser.milestoneVoteFailed);
    }
  };

  const handleClaimMilestone = async () => {
    if (!activeAddress || !transactionSigner) {
      showErrorToast(toastMessages.fundraiser.walletNotConnected);
      return;
    }
    try {
      await syncTimeOffsetInLocalNet();
      const result = await appClient.send.claimMilestone({
        args: {
          proposalId: BigInt(proposal.id),
        },
        signer: transactionSigner,
        sender: activeAddress,
        populateAppCallResources: true,
        coverAppCallInnerTransactionFees: true,
        maxFee: algokit.microAlgos(1000000),
      });
      showSuccessToast(toastMessages.fundraiser.milestoneClaimSuccess);
      await fetchState();
    } catch (error) {
      console.error("Error claiming milestone:", error);
      showErrorToast(toastMessages.fundraiser.milestoneClaimFailed);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/donate" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Back to Projects
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-2">
              {proposal.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{proposal.title}</h1>
            <p className="text-lg text-gray-600">{proposal.description}</p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" icon={Heart}>
              Save
            </Button>
            <Button variant="outline" size="sm" icon={Share2}>
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Stats */}
          <Card padding="lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">${proposal.amountRaised.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Raised of ${proposal.amountRequired.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{proposal.noOfUniqueDonors}</div>
                <div className="text-sm text-gray-500">Unique Donors</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target size={20} className="text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {completedMilestones}/{proposal.milestones.length}
                </div>
                <div className="text-sm text-gray-500">Milestones</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp size={20} className="text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{proposal.noOfDonations}</div>
                <div className="text-sm text-gray-500">Total Donations</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{percentFunded}% funded</span>
                <span className="text-gray-500">Created {formatDate(proposal.createdAt)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    percentFunded >= 100 ? "bg-green-500" : percentFunded >= 70 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(percentFunded, 100)}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Milestones Timeline */}
          <Card padding="lg">
            <h2 className="text-xl font-semibold mb-6">Project Milestones</h2>
            <div className="space-y-6">
              {proposal.milestones.map((milestone, index) => {
                const isCurrent = index === proposal.currentMilestone;
                const isCompleted = milestone.claimed;
                const hasProof = milestone.proofLink !== "";
                const isVotingActive = hasProof && milestone.votingEndTime > Date.now() / 1000;
                const votingEnded = hasProof && milestone.votingEndTime <= Date.now() / 1000;
                const votingPassed = milestone.votesFor > milestone.votesAgainst;
                const totalVotes = milestone.votesFor + milestone.votesAgainst;
                const votingForPercentage = totalVotes > 0 ? (milestone.votesFor / totalVotes) * 100 : 0;
                const votingAgainstPercentage = totalVotes > 0 ? (milestone.votesAgainst / totalVotes) * 100 : 0;
                const yourVoteWeight = donatedAmount ? Math.floor(Math.sqrt(donatedAmount)) : 0;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                      ${
                        isCompleted ? "bg-green-100 text-green-600" : isCurrent ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted ? <CheckCircle size={16} /> : index + 1}
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-medium ${isCompleted ? "text-gray-900" : isCurrent ? "text-blue-900" : "text-gray-500"}`}>
                          {milestone.name}
                        </h3>
                        <span className="text-sm font-medium text-gray-900">${milestone.amount.toLocaleString()}</span>
                      </div>

                      {/* Milestone Status */}
                      {isCompleted && (
                        <div className="flex items-center space-x-2 text-sm text-green-600 mb-2">
                          <CheckCircle size={14} />
                          <span>Completed and claimed</span>
                        </div>
                      )}

                      {isCurrent && !isCompleted && (
                        <div className="space-y-3">
                          {!isFullyFunded && (
                            <div className="text-sm text-amber-600 flex items-center space-x-2">
                              <AlertCircle size={14} />
                              <span>Waiting for full funding to begin</span>
                            </div>
                          )}

                          {isFullyFunded && !hasProof && (
                            <div className="text-sm text-blue-600 flex items-center space-x-2">
                              <Clock size={14} />
                              <span>Waiting for creator to submit proof</span>
                            </div>
                          )}

                          {hasProof && isVotingActive && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-blue-900">Voting in Progress</span>
                                <span className="text-xs text-blue-600">{formatTimeRemaining(milestone.votingEndTime)}</span>
                              </div>

                              <div className="space-y-2 mb-3">
                                <div className="flex justify-between text-sm">
                                  <span>For: {votingForPercentage.toFixed(2)}%</span>
                                  <span>Against: {votingAgainstPercentage.toFixed(2)}%</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {milestone.totalVoters} voters •{" "}
                                  <a
                                    href={milestone.proofLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View Proof
                                  </a>
                                </div>

                                {/* Voting Buttons */}
                                {hasDonated && !isVoted && yourVoteWeight > 0 && (
                                  <div className="text-sm text-gray-600 mb-2">
                                    Your vote weight: {yourVoteWeight}
                                    <div className="flex space-x-2 pt-2">
                                      <Button size="sm" variant="primary" onClick={() => handleVote(true)}>
                                        Vote For
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => handleVote(false)}>
                                        Vote Against
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {isVoted && <div className="text-sm text-green-600 pt-2">✓ You have voted this milestone</div>}
                              </div>
                            </div>
                          )}

                          {votingEnded && (
                            <div className={`p-4 rounded-lg ${votingPassed ? "bg-green-50" : "bg-red-50"}`}>
                              <div className="flex justify-between items-center mb-2">
                                <span className={`text-sm font-medium ${votingPassed ? "text-green-900" : "text-red-900"}`}>
                                  Voting {votingPassed ? "Passed" : "Failed"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                For: {milestone.votesFor} • Against: {milestone.votesAgainst}
                              </div>
                              {votingPassed && isCreator && (
                                <Button size="sm" variant="primary" onClick={handleClaimMilestone}>
                                  Claim Milestone
                                </Button>
                              )}
                              {!votingPassed && isCreator && (
                                <div className="text-sm text-red-600">You can resubmit proof to restart voting</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Creator Actions */}
          {isCreator && isFullyFunded && currentMilestone && (
            <Card padding="lg">
              <h2 className="text-xl font-semibold mb-4">Creator Actions</h2>

              {(!currentMilestone.proofLink ||
                (currentMilestone.votingEndTime <= Date.now() / 1000 && currentMilestone.votesFor <= currentMilestone.votesAgainst)) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Submit Proof Link for Current Milestone</label>
                    <input
                      type="url"
                      value={proofLink}
                      onChange={(e) => setProofLink(e.target.value)}
                      placeholder="https://example.com/proof"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button variant="primary" onClick={handleSubmitProof} disabled={!proofLink} icon={Upload}>
                    Submit Proof
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Donation Card */}
          <Card padding="lg">
            <h2 className="text-xl font-semibold mb-4">Support This Project</h2>

            <div className="space-y-4">
              {hasDonated && <div className="text-sm text-green-600 mb-2">You have donated {donatedAmount} ALGO to this project</div>}

              {!isCreator && !isFullyFunded && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Donation Amount (ALGO)</label>
                    <input
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleDonate}
                    disabled={!donationAmount || parseFloat(donationAmount) < 1 || parseFloat(donationAmount) > amountCanBeDonated}
                    icon={Heart}
                  >
                    Donate Now
                  </Button>
                  <div className="text-xs text-gray-500">
                    {amountCanBeDonated > 0 ? `• Maximum ${amountCanBeDonated} ALGO can be donated` : "• This project is fully funded"}
                    <br />
                    • Minimum 1 ALGO required to vote on milestones
                    <br />
                    • Your vote weight is based on donation amount
                    <br />• Donations are non-refundable unless project is inactive for 3+ months
                  </div>
                </>
              )}

              {isCreator && <div className="text-lg">You cannot donate to your own project</div>}

              {isFullyFunded && <div className="text-lg">This project is fully funded</div>}
            </div>
          </Card>

          {/* Project Creator */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-3">Project Creator</h3>
            <div className="text-sm text-gray-600">
              <div className="font-mono text-xs bg-gray-100 p-2 rounded">{proposal.createdBy}</div>
              <div className="mt-2">Created on {formatDate(proposal.createdAt)}</div>
            </div>
          </Card>

          {/* Project Status */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-3">Project Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Funding Status:</span>
                <span className={`font-medium ${isFullyFunded ? "text-green-600" : "text-orange-600"}`}>
                  {isFullyFunded ? "Fully Funded" : "In Progress"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Phase:</span>
                <span className="font-medium">
                  {proposal.currentMilestone >= proposal.milestones.length ? "Completed" : `Milestone ${proposal.currentMilestone + 1}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Progress:</span>
                <span className="font-medium">
                  {completedMilestones}/{proposal.milestones.length} milestones
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FundraiserPage;
