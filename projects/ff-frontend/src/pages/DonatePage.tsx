import React, { useEffect } from "react";
import StartFundraiserBanner from "../components/donate/StartFundraiserBanner";
import FundraiserList from "../components/donate/FundraiserList";
import { getProposalsLength } from "../data/getters";

const DonatePage: React.FC = () => {
  useEffect(() => {
    getProposalsLength().then((length) => {
      console.log(length);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Support Innovative Projects</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Browse and donate to transparent, milestone-based fundraising campaigns across various categories.
        </p>
      </div>
      <iframe
        title="tinyman swap widget"
        src="https://tinymanorg.github.io/swap-widget/?platformName=FactFunders&network=testnet&themeVariables=eyJ0aGVtZSI6ImxpZ2h0IiwiY29udGFpbmVyQnV0dG9uQmciOiIjMmNiY2EyIiwid2lkZ2V0QmciOiIjYTA1NmZmIiwiaGVhZGVyQnV0dG9uQmciOiIjODM0NmQxIiwiaGVhZGVyQnV0dG9uVGV4dCI6IiNmZmZmZmYiLCJoZWFkZXJUaXRsZSI6IiNmZmZmZmYiLCJjb250YWluZXJCdXR0b25UZXh0IjoiI2ZmZmZmZiIsImlmcmFtZUJnIjoiI0Y4RjhGOCIsImJvcmRlclJhZGl1c1NpemUiOiJtZWRpdW0iLCJ0aXRsZSI6IlN3YXAiLCJzaG91bGREaXNwbGF5VGlueW1hbkxvZ28iOmZhbHNlfQ%3D%3D&assetIn=0&assetOut=10458941"
        style={{ width: 415, height: 600, border: "none" }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
      <StartFundraiserBanner />
      <FundraiserList />
    </div>
  );
};

export default DonatePage;
