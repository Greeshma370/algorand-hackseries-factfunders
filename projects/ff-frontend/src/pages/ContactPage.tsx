import React from 'react';
import ContactForm from '../components/contact/ContactForm';
import FounderProfile from '../components/contact/FounderProfile';
import { founders } from '../data/mockData';

const ContactPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Have questions about Fact Funders? We're here to help you with any inquiries.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Meet Our Team</h2>
          <div className="space-y-6">
            {founders.map(founder => (
              <FounderProfile key={founder.id} founder={founder} />
            ))}
          </div>
          
          <div className="mt-10 bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Company Information</h3>
            <div className="space-y-3 text-gray-600">
              <p>
                <strong className="text-gray-900">Email:</strong> hello@factfunders.com
              </p>
              <p>
                <strong className="text-gray-900">Address:</strong> 123 Blockchain Street, San Francisco, CA 94107
              </p>
              <p>
                <strong className="text-gray-900">Working Hours:</strong> Monday-Friday, 9AM-6PM PST
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <ContactForm />
        </div>
      </div>
      
      <div className="mb-16">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">How does milestone-based funding work?</h3>
              <p className="text-gray-600">
                Projects are divided into milestones with specific funding amounts. Funds are only released when each milestone is completed and approved by donors through voting.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">What happens if a project doesn't reach its funding goal?</h3>
              <p className="text-gray-600">
                If a project doesn't reach its minimum funding goal within the specified timeframe, all contributions are automatically returned to the donors.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">How are funds protected?</h3>
              <p className="text-gray-600">
                All funds are secured in smart contracts on the Algorand blockchain. If a project remains inactive for 3 months, donors can initiate a refund process.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Do I need cryptocurrency to donate?</h3>
              <p className="text-gray-600">
                Yes, donations are made using Algorand cryptocurrency. However, we provide an easy onboarding process for users new to cryptocurrency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;