
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Milestone } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { BadgeCheck, Check, ExternalLink, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface MilestoneCardProps {
  milestone: Milestone;
  projectCreator?: boolean;
  onSubmitProof?: (milestoneId: string, proofLink: string) => void;
  onVote?: (milestoneId: string, vote: boolean) => void;
  onClaim?: (milestoneId: string) => void;
  index: number;
}

export function MilestoneCard({ 
  milestone, 
  projectCreator = false,
  onSubmitProof,
  onVote,
  onClaim,
  index
}: MilestoneCardProps) {
  const { toast } = useToast();
  const [proofLink, setProofLink] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  
  const totalVotes = milestone.votes.yes + milestone.votes.no;
  const approvalPercentage = totalVotes > 0 ? Math.round((milestone.votes.yes / totalVotes) * 100) : 0;
  const isApproved = totalVotes > 0 && approvalPercentage >= 60;
  
  const handleSubmitProof = () => {
    if (!proofLink || !proofLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid proof link",
        variant: "destructive",
      });
      return;
    }
    
    onSubmitProof?.(milestone.id, proofLink);
  };
  
  return (
    <Card className={`${milestone.completed ? "border-fund-green/30 bg-fund-green/5" : ""} ${milestone.claimed ? "opacity-70" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Milestone {index + 1}</p>
            <h4 className="font-semibold text-lg">{milestone.title}</h4>
          </div>
          <div className="text-right">
            <p className="font-medium">${milestone.amount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-4">{milestone.description}</p>
        
        {milestone.completed && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Approval vote: {approvalPercentage}%</span>
              <span className="text-muted-foreground">
                {milestone.votes.yes} Yes / {milestone.votes.no} No
              </span>
            </div>
            <Progress value={approvalPercentage} className="h-2" />
          </div>
        )}
        
        {milestone.proofLink && (
          <div className="flex items-center gap-2 text-sm mb-3">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <a 
              href={milestone.proofLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:underline flex items-center gap-1"
            >
              View submitted proof <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {projectCreator && !milestone.completed && !milestone.claimed && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Submit Proof</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Milestone Proof</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Please provide a link to the proof that this milestone has been completed.
                  This could be a document, video, or other evidence.
                </p>
                <div className="space-y-2">
                  <label htmlFor="proofLink" className="text-sm font-medium">
                    Proof Link
                  </label>
                  <input
                    id="proofLink"
                    type="url"
                    value={proofLink}
                    onChange={(e) => setProofLink(e.target.value)}
                    placeholder="https://example.com/proof"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  />
                </div>
                <Button onClick={handleSubmitProof} className="w-full">
                  Submit Proof
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {milestone.completed && !milestone.claimed && !projectCreator && !isVoting && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Vote on Completion</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vote on Milestone Completion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  The project creator has submitted proof for this milestone. Please review the proof and vote.
                </p>
                {milestone.proofLink && (
                  <a 
                    href={milestone.proofLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:underline flex items-center gap-1 text-sm"
                  >
                    View submitted proof <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <div className="flex justify-center gap-4 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsVoting(true);
                      onVote?.(milestone.id, false);
                    }}
                  >
                    Vote No
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsVoting(true);
                      onVote?.(milestone.id, true);
                    }}
                  >
                    Vote Yes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {projectCreator && milestone.completed && isApproved && !milestone.claimed && (
          <Button onClick={() => onClaim?.(milestone.id)}>
            Claim Funds
          </Button>
        )}
        
        {milestone.claimed && (
          <div className="flex items-center gap-1 text-fund-green">
            <BadgeCheck className="h-4 w-4" />
            <span className="text-sm font-medium">Milestone completed</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
