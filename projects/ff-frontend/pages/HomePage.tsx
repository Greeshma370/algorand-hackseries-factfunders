
import { useState } from "react";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProposalCard } from "@/components/ProposalCard";
import { useFunding } from "@/context/FundingContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { proposals } = useFunding();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Extract unique categories from proposals
  const categories = [...new Set(proposals.map(p => p.category))];
  
  // Filter proposals by selected category
  const filteredProposals = selectedCategory 
    ? proposals.filter(p => p.category === selectedCategory)
    : proposals;

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="py-16 md:py-24 hero-gradient">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Fund the Future Together
            </h1>
            <p className="text-xl text-muted-foreground">
              Transparent crowdfunding with milestone-based accountability for projects that matter.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/create">
                <Button size="lg">Start a Project</Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" size="lg">Learn How It Works</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Projects section */}
      <section className="container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Discover Projects</h2>
        </div>
        
        <div className="mb-6">
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map(proposal => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
          
          {filteredProposals.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">No projects found in this category.</p>
              <Button 
                variant="link" 
                onClick={() => setSelectedCategory(null)}
              >
                View all projects
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How it works section */}
      <section className="bg-accent/10 py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-bold text-xl">Define Your Proposal</h3>
              <p className="text-muted-foreground">
                Create your project with clear goals and milestone-based funding targets.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-bold text-xl">Receive Funding</h3>
              <p className="text-muted-foreground">
                Backers contribute to your project, supporting your vision.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-bold text-xl">Meet Milestones</h3>
              <p className="text-muted-foreground">
                Complete milestones, submit proof, and receive funds after backer approval.
              </p>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <Link to="/how-it-works">
              <Button variant="outline">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
