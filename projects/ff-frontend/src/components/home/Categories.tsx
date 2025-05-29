import React from 'react';
import { HeartPulse, GraduationCap, Lightbulb, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/mockData';

const iconMap: { [key: string]: React.ReactNode } = {
  'heart-pulse': <HeartPulse className="w-8 h-8" />,
  'graduation-cap': <GraduationCap className="w-8 h-8" />,
  'lightbulb': <Lightbulb className="w-8 h-8" />,
  'film': <Film className="w-8 h-8" />
};

const Categories: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Fund Projects That Matter</h2>
          <p className="text-xl text-gray-600">
            Explore different categories and support initiatives that align with your values.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/donate?category=${category.name.toLowerCase()}`}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                <div className="relative">
                  <div className={`h-40 bg-gradient-to-r ${getCategoryGradient(category.name)} flex items-center justify-center`}>
                    <div className="text-white">
                      {iconMap[category.icon]}
                    </div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white rounded-full p-4 shadow-md group-hover:bg-blue-50 transition-colors duration-300">
                      {React.cloneElement(iconMap[category.icon] as React.ReactElement, {
                        className: "w-8 h-8 text-blue-600"
                      })}
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-10 text-center">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-gray-600">{category.description}</p>
                  <div className="mt-4 inline-block text-blue-600 font-medium group-hover:text-blue-800 transition-colors duration-200">
                    Explore {category.name} →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// Helper function to get gradient colors based on category
function getCategoryGradient(category: string): string {
  switch (category) {
    case 'Medical':
      return 'from-red-500 to-pink-500';
    case 'Education':
      return 'from-blue-500 to-teal-400';
    case 'Entrepreneurship':
      return 'from-amber-500 to-orange-500';
    case 'Entertainment':
      return 'from-purple-500 to-indigo-500';
    default:
      return 'from-blue-500 to-teal-400';
  }
}

export default Categories;