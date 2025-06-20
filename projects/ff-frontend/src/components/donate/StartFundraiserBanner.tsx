import React from "react";
import { ArrowRight } from "lucide-react";
import Button from "../common/Button";
import { Link } from "react-router-dom";
const StartFundraiserBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl overflow-hidden shadow-lg mb-12">
      <div className="px-6 py-10 sm:px-10 sm:py-12 md:flex md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to fund your project?</h2>
          <p className="mt-3 text-lg text-blue-100">Create a transparent fundraising campaign with milestone-based funding releases.</p>
          <div className="mt-8 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Link to="/create">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                className="bg-blue text-white hover:bg-blue-50 hover:bg-opacity-10"
              >
                Start a Fundraiser
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-6 md:mt-0 md:ml-6 flex-shrink-0">
          <img
            className="hidden md:block h-40 w-auto"
            src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Team collaboration"
          />
        </div>
      </div>
    </div>
  );
};

export default StartFundraiserBanner;
