import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './Header';

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

const HeaderWithProviders = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

test('renders Globe Trotter logo', () => {
  render(<HeaderWithProviders />);
  const logo = screen.getByRole('link', { name: /globe trotter/i });
  expect(logo).toBeInTheDocument();
});

test('renders navigation links when not authenticated', () => {
  render(<HeaderWithProviders />);
  // Navigation should not be visible when not authenticated
  expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /my trips/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /discover/i })).not.toBeInTheDocument();
});

test('renders sign in and sign up buttons when not authenticated', () => {
  render(<HeaderWithProviders />);
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
});