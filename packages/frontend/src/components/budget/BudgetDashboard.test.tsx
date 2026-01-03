import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import BudgetDashboard from './BudgetDashboard';

// Mock the API
vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('BudgetDashboard', () => {
  it('renders budget dashboard title', () => {
    renderWithQueryClient(<BudgetDashboard itineraryId="test-id" />);
    
    expect(screen.getByText('Budget Dashboard')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithQueryClient(<BudgetDashboard itineraryId="test-id" />);
    
    // Should show loading animation
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows create budget option when no budget exists', async () => {
    const { api } = await import('../../lib/api');
    (api.get as any).mockResolvedValue({ data: { data: null } });

    renderWithQueryClient(<BudgetDashboard itineraryId="test-id" />);
    
    // Wait for the component to load and show the no budget state
    await screen.findByText('No Budget Set');
    expect(screen.getByText('Create Budget')).toBeInTheDocument();
  });
});