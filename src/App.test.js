import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header', () => {
  render(<App />);
  const headerElement = screen.getByText(/crypto dashboard/i);
  expect(headerElement).toBeInTheDocument();
});
