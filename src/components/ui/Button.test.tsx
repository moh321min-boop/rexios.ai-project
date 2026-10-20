import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { Button } from './Button'

describe('Button component', () => {
  it('renders button text correctly', () => {
    render(<Button>Submit Solution</Button>)
    expect(screen.getByRole('button', { name: /submit solution/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disables button when disabled or isLoading is true', () => {
    const { rerender } = render(<Button disabled>Disabled Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()

    rerender(<Button isLoading>Loading Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')

    rerender(<Button variant="accent">Accent</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-accent')
  })
})
