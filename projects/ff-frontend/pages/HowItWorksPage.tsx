
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  return (
    <div className="container py-12 space-y-16 max-w-4xl mx-auto">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4">How FundTogether Works</h1>
        <p className="text-xl text-muted-foreground">
          Transparent, milestone-based crowdfunding that builds trust between creators and backers.
        </p>
      </section>

      <section className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-block p-3 bg-primary/10 rounded-lg">
              <span className="text-2xl font-bold text-primary">01</span>
            </div>
            <h2 className="text-2xl font-bold">Create a Proposal</h2>
            <p className="text-muted-foreground">
              Project creators define their vision, set a funding target, and break down the project into specific milestones. Each milestone includes a description, funding amount, and completion date.
            </p>
          </div>
          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-semibold mb-3">Example Milestone Breakdown:</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0">1</div>
                <div>
                  <p className="font-medium">Initial Development</p>
                  <p className="text-sm text-muted-foreground">Build MVP and conduct user testing</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0">2</div>
                <div>
                  <p className="font-medium">Production Phase</p>
                  <p className="text-sm text-muted-foreground">Complete manufacturing and prepare for distribution</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0">3</div>
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-sm text-muted-foreground">Ship products to backers and collect feedback</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-muted rounded-lg p-6 order-2 md:order-1">
            <h3 className="font-semibold mb-3">Security Features:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2 items-start">
                <span className="text-primary">✓</span>
                <span>Funds are only released when milestones are achieved and verified</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-primary">✓</span>
                <span>Backer voting ensures project accountability</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-primary">✓</span>
                <span>Automatic refunds if project becomes inactive for 3+ months</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-primary">✓</span>
                <span>Transparent progress tracking throughout the project lifecycle</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4 order-1 md:order-2">
            <div className="inline-block p-3 bg-primary/10 rounded-lg">
              <span className="text-2xl font-bold text-primary">02</span>
            </div>
            <h2 className="text-2xl font-bold">Backers Fund & Participate</h2>
            <p className="text-muted-foreground">
              Backers contribute to projects they believe in. Unlike traditional crowdfunding, backers maintain involvement through milestone voting, ensuring creators deliver on their promises.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-block p-3 bg-primary/10 rounded-lg">
              <span className="text-2xl font-bold text-primary">03</span>
            </div>
            <h2 className="text-2xl font-bold">Milestone Completion & Verification</h2>
            <p className="text-muted-foreground">
              When a milestone is completed, creators submit proof of their work. Backers then vote to approve or reject the milestone. If approved, the creator can claim the funds allocated for that milestone.
            </p>
          </div>
          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-semibold mb-3">The Milestone Process:</h3>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">1</div>
                <div>
                  <p className="font-medium">Creator Submits Proof</p>
                  <p className="text-sm text-muted-foreground">Documentation, videos, or other evidence showing milestone completion</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">2</div>
                <div>
                  <p className="font-medium">Backers Vote</p>
                  <p className="text-sm text-muted-foreground">Voting power is proportional to donation amount</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">3</div>
                <div>
                  <p className="font-medium">Funds Released</p>
                  <p className="text-sm text-muted-foreground">If approved, milestone funds are transferred to the creator</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-accent/10 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg mb-6">Launch your project or back innovative ideas with milestone-based accountability.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/create">
            <Button size="lg">Start a Project</Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg">Browse Projects</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
