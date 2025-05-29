import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Categories from '../components/home/Categories';
import StatsBanner from '../components/home/StatsBanner';

const HomePage: React.FC = () => {
  return (
    <div>
      <Hero />
      <Features />
      <StatsBanner />
      <Categories />
    </div>
  );
};

export default HomePage;