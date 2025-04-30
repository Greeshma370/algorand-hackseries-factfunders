
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Proposal } from "@/types";
import { Link } from "react-router-dom";

interface ProposalCardProps {
  proposal: Proposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const percentFunded = Math.min(Math.round((proposal.raised / proposal.target) * 100), 100);
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(proposal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <Link to={`/proposal/${proposal.id}`}>
      <Card className="overflow-hidden card-hover">
        <div className="aspect-video overflow-hidden">
          <img 
            src={proposal.imageUrl} 
            alt={proposal.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-accent mb-1">{proposal.category}</p>
              <h3 className="font-bold text-xl line-clamp-2">{proposal.title}</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-muted-foreground line-clamp-2 text-sm mb-4">
            {proposal.description}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">${proposal.raised.toLocaleString()}</span>
              <span className="text-muted-foreground">funded of ${proposal.target.toLocaleString()}</span>
            </div>
            <Progress value={percentFunded} className="h-2" />
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <span className="font-medium">{proposal.backers}</span>
            <span className="text-muted-foreground">backers</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{daysLeft}</span>
            <span className="text-muted-foreground">days left</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
