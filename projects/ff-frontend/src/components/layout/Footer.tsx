import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-white mb-4">
              <span className="text-3xl">💰</span>
              <span>Fact Funders</span>
            </Link>
            <p className="text-gray-400 mb-6">
              A transparent, decentralized crowdfunding platform built on the Algorand blockchain.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/Greeshma370/algorand-hackseries-factfunders" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Github size={20} />
              </a>
              
              <a href="https://x.com/GreeshmaGu1242" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Twitter size={20} />
              </a>
              
              <a href="https://www.linkedin.com/in/greeshma-guntupalli" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Linkedin size={20} />
              </a>
              
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Donate
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <a href="#/donate?category=medical" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Medical
                </a>
              </li>
              <li>
                <a href="#/donate?category=education" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Education
                </a>
              </li>
              <li>
                <a href="#/donate?category=entrepreneurship" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Entrepreneurship
                </a>
              </li>
              <li>
                <a href="#/donate?category=entertainment" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Entertainment
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Subscribe</h3>
            <p className="text-gray-400 mb-4">
              Stay updated with the latest projects and platform features.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <p className="text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Fact Funders. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
