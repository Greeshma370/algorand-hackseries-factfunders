
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-accent">FundTogether</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium hover:text-accent">
              Explore
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium hover:text-accent">
              How It Works
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/create">
            <Button>Start a Project</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
