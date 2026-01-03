import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent } from '../ui';
import { Budget, BudgetItem } from '@globe-trotter/shared';

interface BudgetWarningsProps {
  budget: Budget;
  totalSpent: number;
  budgetItems: BudgetItem[];
}

const BudgetWarnings: React.FC<BudgetWarningsProps> = ({
  budget,
  totalSpent,
  budgetItems,
}) => {
  // Calculate warnings
  const warnings = [];
  const spentPercentage = (totalSpent / budget.totalBudget) * 100;

  // Overall budget warnings
  if (totalSpent > budget.totalBudget) {
    warnings.push({
      type: 'error' as const,
      title: 'Budget Exceeded',
      message: `You have exceeded your total budget by ${budget.currency} ${(totalSpent - budget.totalBudget).toLocaleString()}`,
      icon: AlertTriangle,
    });
  } else if (spentPercentage > 90) {
    warnings.push({
      type: 'warning' as const,
      title: 'Budget Almost Exceeded',
      message: `You have used ${spentPercentage.toFixed(1)}% of your budget. Only ${budget.currency} ${(budget.totalBudget - totalSpent).toLocaleString()} remaining.`,
      icon: AlertCircle,
    });
  } else if (spentPercentage > 75) {
    warnings.push({
      type: 'info' as const,
      title: 'Budget Alert',
      message: `You have used ${spentPercentage.toFixed(1)}% of your budget. Consider monitoring your remaining expenses.`,
      icon: Info,
    });
  }

  // Category-specific warnings
  if (budget.categoryBudgets) {
    const categorySpending = budgetItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(budget.categoryBudgets).forEach(([category, categoryBudget]) => {
      const spent = categorySpending[category] || 0;
      const categoryPercentage = (spent / categoryBudget) * 100;
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

      if (spent > categoryBudget) {
        warnings.push({
          type: 'error' as const,
          title: `${categoryName} Budget Exceeded`,
          message: `You have exceeded your ${category} budget by ${budget.currency} ${(spent - categoryBudget).toLocaleString()}`,
          icon: AlertTriangle,
        });
      } else if (categoryPercentage > 90) {
        warnings.push({
          type: 'warning' as const,
          title: `${categoryName} Budget Alert`,
          message: `You have used ${categoryPercentage.toFixed(1)}% of your ${category} budget. Only ${budget.currency} ${(categoryBudget - spent).toLocaleString()} remaining.`,
          icon: AlertCircle,
        });
      }
    });
  }

  // If no warnings, show a positive message
  if (warnings.length === 0 && totalSpent > 0) {
    warnings.push({
      type: 'success' as const,
      title: 'Budget on Track',
      message: `Great job! You're staying within your budget. You've spent ${spentPercentage.toFixed(1)}% of your total budget.`,
      icon: Info,
    });
  }

  if (warnings.length === 0) {
    return null;
  }

  const getWarningStyles = (type: string) => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-500',
          title: 'text-red-800',
          message: 'text-red-700',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-500',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-500',
          title: 'text-green-800',
          message: 'text-green-700',
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-500',
          title: 'text-blue-800',
          message: 'text-blue-700',
        };
    }
  };

  return (
    <div className="space-y-4">
      {warnings.map((warning, index) => {
        const styles = getWarningStyles(warning.type);
        const IconComponent = warning.icon;

        return (
          <Card key={index} className={styles.container}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <IconComponent className={`h-5 w-5 mt-0.5 ${styles.icon}`} />
                <div className="flex-1">
                  <h4 className={`font-medium ${styles.title}`}>
                    {warning.title}
                  </h4>
                  <p className={`text-sm mt-1 ${styles.message}`}>
                    {warning.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default BudgetWarnings;