import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../src/pages/Home';
import ThemeProvider from '../src/ThemeProvider';
import React from 'react';
import { beforeEach } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';

describe('Home page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function renderWithProviders(ui: React.ReactElement) {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  }

  it('renders no recipes message', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/no recipes found/i)).toBeInTheDocument();
  });

  it('can add a recipe', () => {
    renderWithProviders(<Home />);
    fireEvent.click(screen.getByText(/add recipe/i));
    fireEvent.change(screen.getByPlaceholderText(/pasta alla carbonara/i), { target: { value: 'Test Recipe' } });
    fireEvent.change(screen.getByPlaceholderText(/pasta\nuova\nguanciale/i), { target: { value: 'a, b, c' } });
    fireEvent.click(screen.getByText(/add recipe/i));
    expect(screen.getByText(/Test Recipe/)).toBeInTheDocument();
    expect(screen.getByText(/a, b, c/)).toBeInTheDocument();
  });

  it('can edit a recipe', () => {
    renderWithProviders(<Home />);
    // Add a recipe first
    fireEvent.click(screen.getByText(/add recipe/i));
    fireEvent.change(screen.getByPlaceholderText(/pasta alla carbonara/i), { target: { value: 'Edit Me' } });
    fireEvent.change(screen.getByPlaceholderText(/pasta\nuova\nguanciale/i), { target: { value: 'x, y' } });
    fireEvent.click(screen.getByText(/add recipe/i));
    // Edit it
    fireEvent.click(screen.getByLabelText(/edit/i));
    fireEvent.change(screen.getByPlaceholderText(/pasta alla carbonara/i), { target: { value: 'Edited' } });
    fireEvent.click(screen.getByText(/save/i));
    expect(screen.getByText(/Edited/)).toBeInTheDocument();
  });

  it('can delete a recipe', () => {
    renderWithProviders(<Home />);
    // Add a recipe first
    fireEvent.click(screen.getByText(/add recipe/i));
    fireEvent.change(screen.getByPlaceholderText(/pasta alla carbonara/i), { target: { value: 'Delete Me' } });
    fireEvent.change(screen.getByPlaceholderText(/pasta\nuova\nguanciale/i), { target: { value: 'z' } });
    fireEvent.click(screen.getByText(/add recipe/i));
    // Delete it
    fireEvent.click(screen.getByLabelText(/delete/i));
    expect(screen.queryByText(/Delete Me/)).not.toBeInTheDocument();
  });
});
