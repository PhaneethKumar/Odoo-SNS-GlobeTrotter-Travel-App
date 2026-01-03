import React from 'react';
import { PieChart, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { Budget, BudgetItem } from '@globe-trotter/shared';

interface BudgetBreakdownProps {
  budget: Budget;
  budgetItems: BudgetItem[];
  isLoading: boolean;
}

const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({
  budget,
  budgetItems,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Budget Breakdown
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

  // Calculate spending by category
  const categorySpending = budgetItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  // Get category budgets or create default ones
  const categoryBudgets = budget.categoryBudgets || {
    accommodation: budget.totalBudget * 0.4,
    food: budget.totalBudget * 0.3,
    activities: budget.totalBudget * 0.2,
    transportation: budget.totalBudget * 0.1,
  };

  // Prepare category data
  const categories = Object.keys(categoryBudgets).map(category => {
    const budgeted = categoryBudgets[category];
    const spent = categorySpending[category] || 0;
    const remaining = budgeted - spent;
    const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;

    return {
      name: category.charAt(0).toUpperCase() + category.slice(1),
      budgeted,
      spent,
      remaining,
      percentage,
      isOverBudget: spent > budgeted,
    };
  });

  // Colors for categories
  const categoryColors = {
    Accommodation: 'bg-blue-500',
    Food: 'bg-green-500',
    Activities: 'bg-purple-500',
    Transportation: 'bg-orange-500',
  };

  const totalSpent = budgetItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        categoryColors[category.name as keyof typeof categoryColors] || 'bg-gray-500'
                      }`}
                    ></div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${
                      category.isOverBudget ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {budget.currency} {category.spent.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {' '}/ {budget.currency} {category.budgeted.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      category.isOverBudget ? 'bg-red-500' : 
                      category.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(category.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{category.percentage.toFixed(1)}% used</span>
                  <span>
                    {category.remaining >= 0 ? 'Remaining: ' : 'Over by: '}
                    {budget.currency} {Math.abs(category.remaining).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual Chart Representation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Spending Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalSpent > 0 ? (
            <div className="space-y-4">
              {/* Simple visual representation */}
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => {
                  const spentPercentage = totalSpent > 0 ? (category.spent / totalSpent) * 100 : 0;
                  return (
                    <div key={category.name} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div
                        className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                          categoryColors[category.name as keyof typeof categoryColors] || 'bg-gray-500'
                        }`}
                      >
                        {spentPercentage.toFixed(0)}%
                      </div>
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="text-xs text-gray-500">
                        {budget.currency} {category.spent.toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No expenses recorded yet</p>
              <p className="text-sm text-gray-500">
                Add activities with costs to see your spending distribution
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgetItems.length > 0 ? (
            <div className="space-y-3">
              {budgetItems
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium">{item.description || 'Expense'}</p>
                      <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {item.currency} {item.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              {budgetItems.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">
                    And {budgetItems.length - 5} more expenses...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No expenses recorded yet</p>
              <p className="text-sm text-gray-500">
                Expenses will appear here as you add activities with costs
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetBreakdown;