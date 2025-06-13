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
          
          
        </div>
        
        <div>
          <ContactForm />
        </div>
      </div>
      
      
      </div>
  );
};

export default ContactPage;
