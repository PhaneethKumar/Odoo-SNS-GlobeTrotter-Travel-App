import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, AlertTriangle, Edit, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../ui';
import { api } from '../../lib/api';
import { Budget, BudgetItem } from '@globe-trotter/shared';
import BudgetBreakdown from './BudgetBreakdown';
import BudgetWarnings from './BudgetWarnings';
import EditBudgetModal from './EditBudgetModal';

interface BudgetDashboardProps {
  itineraryId: string;
}

const BudgetDashboard: React.FC<BudgetDashboardProps> = ({ itineraryId }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch budget data
  const { data: budget, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget', itineraryId],
    queryFn: async () => {
      const response = await api.get(`/itineraries/${itineraryId}/budget`);
      return response.data.data as Budget;
    },
  });

  // Fetch budget items for breakdown
  const { data: budgetItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['budget-items', budget?.id],
    queryFn: async () => {
      if (!budget?.id) return [];
      const response = await api.get(`/budgets/${budget.id}/items`);
      return response.data.data as BudgetItem[];
    },
    enabled: !!budget?.id,
  });

  // Create budget mutation
  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: { totalBudget: number; currency: string; categoryBudgets?: Record<string, number> }) => {
      const response = await api.post(`/itineraries/${itineraryId}/budget`, budgetData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', itineraryId] });
    },
  });

  const handleCreateBudget = () => {
    // Create a default budget
    createBudgetMutation.mutate({
      totalBudget: 1000,
      currency: 'USD',
      categoryBudgets: {
        accommodation: 400,
        food: 300,
        activities: 200,
        transportation: 100,
      },
    });
  };

  if (budgetLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!budget) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Budget Set</h3>
            <p className="text-gray-600 mb-6">
              Set up a budget to track your expenses and stay within your limits.
            </p>
            <Button
              onClick={handleCreateBudget}
              disabled={createBudgetMutation.isPending}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Budget
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSpent = budgetItems?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const remainingBudget = budget.totalBudget - totalSpent;
  const spentPercentage = (totalSpent / budget.totalBudget) * 100;

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Overview
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Budget */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                {budget.currency} {budget.totalBudget.toLocaleString()}
              </p>
            </div>

            {/* Total Spent */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-blue-600">
                {budget.currency} {totalSpent.toLocaleString()}
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      spentPercentage > 100 ? 'bg-red-500' : 
                      spentPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {spentPercentage.toFixed(1)}% of budget used
                </p>
              </div>
            </div>

            {/* Remaining Budget */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Remaining</p>
              <p className={`text-2xl font-bold ${
                remainingBudget < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {budget.currency} {remainingBudget.toLocaleString()}
              </p>
              {remainingBudget < 0 && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-red-600">Over budget</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Warnings */}
      <BudgetWarnings
        budget={budget}
        totalSpent={totalSpent}
        budgetItems={budgetItems || []}
      />

      {/* Budget Breakdown */}
      <BudgetBreakdown
        budget={budget}
        budgetItems={budgetItems || []}
        isLoading={itemsLoading}
      />

      {/* Edit Budget Modal */}
      <EditBudgetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        budget={budget}
        itineraryId={itineraryId}
      />
    </div>
  );
};

export default BudgetDashboard;