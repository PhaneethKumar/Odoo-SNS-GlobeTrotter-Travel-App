import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole('button', { name: /click me/i });
  expect(button).toBeInTheDocument();
});

test('applies primary variant by default', () => {
  render(<Button>Primary Button</Button>);
  const button = screen.getByRole('button');
  expect(button).toHaveClass('bg-blue-600');
});

test('applies secondary variant when specified', () => {
  render(<Button variant="secondary">Secondary Button</Button>);
  const button = screen.getByRole('button');
  expect(button).toHaveClass('bg-gray-600');
});