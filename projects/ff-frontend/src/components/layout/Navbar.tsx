import React, { useState, useEffect } from "react";
import { Menu, X, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { WalletButton } from "@txnlab/use-wallet-ui-react";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
  }, [location]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white py-3 ${scrolled && "shadow-md !py-2"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-blue-600">
              <span className="text-3xl">💰</span>
              <span className={`${scrolled ? "text-blue-600" : "text-blue-600"}`}>Fact Funders</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 py-2">
            <div className="flex space-x-6 mr-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors duration-200 hover:text-blue-600 ${
                  isActive("/") ? "text-blue-600 border-b-2 border-blue-600 pb-1" : scrolled ? "text-gray-700" : "text-gray-700"
                }`}
              >
                Home
              </Link>
              <Link
                to="/donate"
                className={`text-sm font-medium transition-colors duration-200 hover:text-blue-600 ${
                  isActive("/donate") ? "text-blue-600 border-b-2 border-blue-600 pb-1" : scrolled ? "text-gray-700" : "text-gray-700"
                }`}
              >
                Proposals
              </Link>
              <Link
                to="/create"
                className={`text-sm font-medium transition-colors duration-200 hover:text-blue-600 ${
                  isActive("/create") ? "text-blue-600 border-b-2 border-blue-600 pb-1" : scrolled ? "text-gray-700" : "text-gray-700"
                }`}
              >
                Create Fundraiser
              </Link>
              <Link
                to="/fund-future"
                className={`text-sm font-medium transition-colors duration-200 hover:text-blue-600 ${
                  isActive("/fund-future") ? "text-blue-600 border-b-2 border-blue-600 pb-1" : scrolled ? "text-gray-700" : "text-gray-700"
                }`}
              >
                Future Funds
              </Link>
              <Link
                to="/leaderboard"
                className={`text-sm font-medium transition-colors duration-200 hover:text-blue-600 ${
                  isActive("/leaderboard") ? "text-blue-600 border-b-2 border-blue-600 pb-1" : scrolled ? "text-gray-700" : "text-gray-700"
                }`}
              >
                Leaderboard
              </Link>
            </div>
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-gray-700 hover:text-blue-600 focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fadeIn">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`text-sm font-medium px-3 py-2 rounded-md ${
                  isActive("/") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Home
              </Link>
              <Link
                to="/donate"
                className={`text-sm font-medium px-3 py-2 rounded-md ${
                  isActive("/donate") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Proposals
              </Link>
              <Link
                to="/create"
                className={`text-sm font-medium px-3 py-2 rounded-md ${
                  isActive("/create") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Create Fundraiser
              </Link>
              <Link
                to="/leaderboard"
                className={`text-sm font-medium px-3 py-2 rounded-md ${
                  isActive("/leaderboard") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Leaderboard
              </Link>
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200">
                <Wallet size={18} />
                <span>Connect Wallet</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
