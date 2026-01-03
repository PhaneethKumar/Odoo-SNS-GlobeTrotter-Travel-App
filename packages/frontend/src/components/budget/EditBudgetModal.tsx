import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, DollarSign } from 'lucide-react';
import { Button, Input } from '../ui';
import { api } from '../../lib/api';
import { Budget } from '@globe-trotter/shared';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget;
  itineraryId: string;
}

const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  isOpen,
  onClose,
  budget,
  itineraryId,
}) => {
  const [formData, setFormData] = useState({
    totalBudget: budget.totalBudget,
    currency: budget.currency,
    categoryBudgets: budget.categoryBudgets || {
      accommodation: 0,
      food: 0,
      activities: 0,
      transportation: 0,
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        totalBudget: budget.totalBudget,
        currency: budget.currency,
        categoryBudgets: budget.categoryBudgets || {
          accommodation: budget.totalBudget * 0.4,
          food: budget.totalBudget * 0.3,
          activities: budget.totalBudget * 0.2,
          transportation: budget.totalBudget * 0.1,
        },
      });
    }
  }, [isOpen, budget]);

  const updateBudgetMutation = useMutation({
    mutationFn: async (budgetData: typeof formData) => {
      const response = await api.put(`/itineraries/${itineraryId}/budget`, budgetData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', itineraryId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudgetMutation.mutate(formData);
  };

  const handleTotalBudgetChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      totalBudget: value,
    }));
  };

  const handleCategoryBudgetChange = (category: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      categoryBudgets: {
        ...prev.categoryBudgets,
        [category]: value,
      },
    }));
  };

  const distributeBudgetEvenly = () => {
    const categories = Object.keys(formData.categoryBudgets);
    const amountPerCategory = formData.totalBudget / categories.length;
    
    setFormData(prev => ({
      ...prev,
      categoryBudgets: categories.reduce((acc, category) => ({
        ...acc,
        [category]: amountPerCategory,
      }), {}),
    }));
  };

  const categoryTotal = Object.values(formData.categoryBudgets).reduce((sum, amount) => sum + amount, 0);
  const isBalanced = Math.abs(categoryTotal - formData.totalBudget) < 0.01;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Edit Budget
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Total Budget */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Total Budget
            </label>
            <div className="flex gap-2">
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.totalBudget}
                onChange={(e) => handleTotalBudgetChange(parseFloat(e.target.value) || 0)}
                className="flex-1"
                placeholder="Enter total budget"
              />
            </div>
          </div>

          {/* Category Budgets */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Category Budgets
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={distributeBudgetEvenly}
              >
                Distribute Evenly
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.categoryBudgets).map(([category, amount]) => (
                <div key={category} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {category}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => handleCategoryBudgetChange(category, parseFloat(e.target.value) || 0)}
                    placeholder={`${category} budget`}
                  />
                </div>
              ))}
            </div>

            {/* Budget Balance Check */}
            <div className={`p-3 rounded-md ${
              isBalanced ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Category Total: {formData.currency} {categoryTotal.toLocaleString()}
                </span>
                <span className="text-sm font-medium">
                  Total Budget: {formData.currency} {formData.totalBudget.toLocaleString()}
                </span>
              </div>
              {!isBalanced && (
                <p className="text-sm text-yellow-700 mt-1">
                  Category budgets don't match total budget. 
                  Difference: {formData.currency} {Math.abs(categoryTotal - formData.totalBudget).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateBudgetMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateBudgetMutation.isPending}
            >
              {updateBudgetMutation.isPending ? 'Saving...' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBudgetModal;