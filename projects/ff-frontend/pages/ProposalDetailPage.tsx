
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MilestoneCard } from "@/components/MilestoneCard";
import { useFunding } from "@/context/FundingContext";
import { useToast } from "@/components/ui/use-toast";

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { proposals, donateToProposal, submitProof, voteMilestone, claimMilestone, refundIfInactive } = useFunding();
  const { toast } = useToast();
  const [donationAmount, setDonationAmount] = useState<number>(25);
  const [isCreator, setIsCreator] = useState<boolean>(false); // In a real app, this would be determined by auth
  
  const proposal = proposals.find(p => p.id === id);
  
  if (!proposal) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
        <p className="mb-6">We couldn't find the project you're looking for.</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }
  
  const percentFunded = Math.min(Math.round((proposal.raised / proposal.target) * 100), 100);
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(proposal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  
  const handleDonation = () => {
    if (donationAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a positive donation amount.",
        variant: "destructive",
      });
      return;
    }
    
    donateToProposal(proposal.id, donationAmount);
  };
  
  const handleSubmitProof = (milestoneId: string, proofLink: string) => {
    submitProof(proposal.id, milestoneId, proofLink);
  };
  
  const handleVote = (milestoneId: string, vote: boolean) => {
    voteMilestone(proposal.id, milestoneId, vote);
  };
  
  const handleClaimFunds = (milestoneId: string) => {
    claimMilestone(proposal.id, milestoneId);
  };
  
  const handleRefund = () => {
    refundIfInactive(proposal.id);
  };
  
  // Check if the project has been inactive for more than 3 months
  const lastActivityDate = new Date(proposal.createdAt);
  const currentDate = new Date();
  const monthsDiff = (currentDate.getFullYear() - lastActivityDate.getFullYear()) * 12 + currentDate.getMonth() - lastActivityDate.getMonth();
  const isInactive = monthsDiff >= 3 && proposal.status !== 'completed' && proposal.status !== 'expired';
  
  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <Link to="/" className="text-accent hover:text-accent/80 inline-flex items-center gap-1 mb-4">
          ← Back to projects
        </Link>
        
        {proposal.status === 'expired' && (
          <Alert className="mb-6 bg-destructive/10 text-destructive border-destructive/20">
            <AlertDescription>
              This project has been marked as inactive and funds are being returned to backers.
            </AlertDescription>
          </Alert>
        )}
        
        {isInactive && proposal.status !== 'expired' && (
          <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200">
            <AlertDescription className="flex justify-between items-center">
              <span>This project has been inactive for 3+ months.</span>
              <Button variant="outline" size="sm" onClick={handleRefund} className="border-amber-500 text-amber-800 hover:bg-amber-100">
                Request Refund
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img 
              src={proposal.imageUrl} 
              alt={proposal.title} 
              className="w-full aspect-video object-cover rounded-lg" 
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-accent font-medium">{proposal.category}</p>
              <h1 className="text-3xl font-bold">{proposal.title}</h1>
              <p className="text-muted-foreground mt-2">
                by {proposal.creatorName}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">${proposal.raised.toLocaleString()}</span>
                <span className="text-muted-foreground">funded of ${proposal.target.toLocaleString()}</span>
              </div>
              <Progress value={percentFunded} className="h-2.5" />
              
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <p className="text-2xl font-bold">{percentFunded}%</p>
                  <p className="text-sm text-muted-foreground">Funded</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{proposal.backers}</p>
                  <p className="text-sm text-muted-foreground">Backers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{daysLeft}</p>
                  <p className="text-sm text-muted-foreground">Days left</p>
                </div>
              </div>
            </div>
            
            {proposal.status !== 'expired' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">Back this project</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Support this project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      Your contribution helps bring this project to life and gives you voting power on milestone completions.
                    </p>
                    
                    <div className="space-y-2">
                      <label htmlFor="amount" className="block text-sm font-medium">
                        Donation Amount ($)
                      </label>
                      <input
                        id="amount"
                        type="number"
                        min="1"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      />
                      
                      <div className="flex gap-2 pt-2">
                        {[25, 50, 100, 250].map((amount) => (
                          <Button
                            key={amount}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDonationAmount(amount)}
                            className={donationAmount === amount ? "border-accent text-accent" : ""}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <Button onClick={handleDonation} className="w-full">
                      Donate ${donationAmount}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsCreator(!isCreator)}
              >
                {isCreator ? "View as Backer" : "Simulate Creator View"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="about">
        <TabsList className="mb-6">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">About this project</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {proposal.description}
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Creator</h2>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-xl">
                {proposal.creatorName.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{proposal.creatorName}</h3>
                <p className="text-sm text-muted-foreground">Member since {new Date(proposal.createdAt).getFullYear()}</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="milestones">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Project Milestones</h2>
            <p className="text-muted-foreground">
              This project is broken down into the following milestones. Funds are released only when each milestone is completed and approved by backers.
            </p>
            
            <div className="space-y-4">
              {proposal.milestones.map((milestone, index) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  projectCreator={isCreator}
                  onSubmitProof={handleSubmitProof}
                  onVote={handleVote}
                  onClaim={handleClaimFunds}
                  index={index}
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
