import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { BudgetDashboard } from '../components/budget';
import { api } from '../lib/api';
import { Itinerary } from '@globe-trotter/shared';

const BudgetPage: React.FC = () => {
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);

  // Fetch user's itineraries
  const { data: itineraries, isLoading } = useQuery({
    queryKey: ['itineraries'],
    queryFn: async () => {
      const response = await api.get('/itineraries');
      return response.data.data as Itinerary[];
    },
  });

  // Fetch budget summaries for all itineraries
  const { data: budgetSummaries } = useQuery({
    queryKey: ['budget-summaries'],
    queryFn: async () => {
      if (!itineraries?.length) return [];
      
      const summaries = await Promise.all(
        itineraries.map(async (itinerary) => {
          try {
            const budgetResponse = await api.get(`/itineraries/${itinerary.id}/budget`);
            const budget = budgetResponse.data.data;
            
            if (!budget) return { itinerary, budget: null, totalSpent: 0 };
            
            const itemsResponse = await api.get(`/budgets/${budget.id}/items`);
            const items = itemsResponse.data.data || [];
            const totalSpent = items.reduce((sum: number, item: any) => sum + item.amount, 0);
            
            return { itinerary, budget, totalSpent };
          } catch (error) {
            return { itinerary, budget: null, totalSpent: 0 };
          }
        })
      );
      
      return summaries;
    },
    enabled: !!itineraries?.length,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="h-64 bg-gray-300 rounded-lg"></div>
                <div className="h-64 bg-gray-300 rounded-lg"></div>
                <div className="h-64 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalBudgetAcrossAll = budgetSummaries?.reduce((sum, summary) => 
    sum + (summary.budget?.totalBudget || 0), 0) || 0;
  
  const totalSpentAcrossAll = budgetSummaries?.reduce((sum, summary) => 
    sum + summary.totalSpent, 0) || 0;

  const overBudgetItineraries = budgetSummaries?.filter(summary => 
    summary.budget && summary.totalSpent > summary.budget.totalBudget) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-8 w-8" />
              Budget Management
            </h1>
            <p className="text-gray-600 mt-2">
              Track and manage budgets across all your travel itineraries
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  Total Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">
                  USD {totalBudgetAcrossAll.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Across {itineraries?.length || 0} itineraries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  USD {totalSpentAcrossAll.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {totalBudgetAcrossAll > 0 ? 
                    `${((totalSpentAcrossAll / totalBudgetAcrossAll) * 100).toFixed(1)}% of total budget` :
                    'No budget set'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5" />
                  Budget Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  {overBudgetItineraries.length}
                </p>
                <p className="text-sm text-gray-500">
                  {overBudgetItineraries.length === 1 ? 'Itinerary' : 'Itineraries'} over budget
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Itinerary Selection and Budget Details */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Itinerary List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Your Itineraries
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {itineraries?.length ? (
                    <div className="space-y-1">
                      {itineraries.map((itinerary) => {
                        const summary = budgetSummaries?.find(s => s.itinerary.id === itinerary.id);
                        const isOverBudget = summary?.budget && summary.totalSpent > summary.budget.totalBudget;
                        const isSelected = selectedItineraryId === itinerary.id;

                        return (
                          <button
                            key={itinerary.id}
                            onClick={() => setSelectedItineraryId(itinerary.id)}
                            className={`w-full text-left p-4 hover:bg-gray-50 border-l-4 transition-colors ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 
                              isOverBudget ? 'border-red-500' : 'border-transparent'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {itinerary.title}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                                </p>
                                {summary?.budget && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-600">
                                      {summary.budget.currency} {summary.totalSpent.toLocaleString()} / {summary.budget.totalBudget.toLocaleString()}
                                    </p>
                                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                      <div
                                        className={`h-1 rounded-full ${
                                          isOverBudget ? 'bg-red-500' : 'bg-green-500'
                                        }`}
                                        style={{ 
                                          width: `${Math.min((summary.totalSpent / summary.budget.totalBudget) * 100, 100)}%` 
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {isOverBudget && (
                                <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-gray-600">No itineraries found</p>
                      <Button className="mt-2" onClick={() => window.location.href = '/itineraries'}>
                        Create Itinerary
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Budget Dashboard */}
            <div className="lg:col-span-3">
              {selectedItineraryId ? (
                <BudgetDashboard itineraryId={selectedItineraryId} />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select an Itinerary
                    </h3>
                    <p className="text-gray-600">
                      Choose an itinerary from the list to view and manage its budget details.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;