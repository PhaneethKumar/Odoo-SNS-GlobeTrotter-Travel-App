import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Globe Trotter heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', {
    name: /Welcome to Globe Trotter/i,
    level: 1,
  });
  expect(heading).toBeInTheDocument();
});

test('renders welcome message', () => {
  render(<App />);
  const welcomeMessage = screen.getByText(/Welcome to Globe Trotter/i);
  expect(welcomeMessage).toBeInTheDocument();
});

test('renders description', () => {
  render(<App />);
  const description = screen.getByText(
    /Plan your perfect multi-city adventure with our comprehensive travel planning tools/i
  );
  expect(description).toBeInTheDocument();
});
