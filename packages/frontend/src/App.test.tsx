import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Globe Trotter heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', {
    name: /^Globe Trotter$/i,
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
    /Your comprehensive travel planning application/i
  );
  expect(description).toBeInTheDocument();
});
