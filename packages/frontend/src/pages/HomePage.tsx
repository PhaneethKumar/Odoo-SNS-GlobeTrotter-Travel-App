import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Welcome to Globe Trotter
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Plan your perfect multi-city adventure with our comprehensive travel planning tools
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Create Itineraries
                </h3>
                <p className="text-gray-600">
                  Build detailed multi-city travel plans with stops, activities, and timelines
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Manage Budgets
                </h3>
                <p className="text-gray-600">
                  Track expenses and stay within budget with our financial planning tools
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Share & Collaborate
                </h3>
                <p className="text-gray-600">
                  Share your itineraries and collaborate with friends on trip planning
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;