import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewForm from '../ReviewForm';
import { expect, vi, describe, it, beforeEach } from 'vitest';

// Mock useCurrentUser hook
const mockUserReturn = { current: null as { id: string; name: string } | null };

vi.mock('@/lib/hook/useCurrentUser', () => ({
    default: () => mockUserReturn.current,
}));

describe('ReviewForm Component', () => {
    const mockSubmit = vi.fn();

    beforeEach(() => {
        mockSubmit.mockClear();
        // Anonymous user
        mockUserReturn.current = null;
    });

    it('renders correctly (Anonymous User)', () => {
        render(<ReviewForm onSubmit={mockSubmit} isSubmitting={false} />);

        expect(screen.getByText('Write a Review')).toBeInTheDocument();

        const nameInput = screen.getByPlaceholderText('Your Name');
        expect(nameInput).toBeInTheDocument();
        expect(nameInput).toHaveValue('');

        const textInput = screen.getByPlaceholderText('Share your thoughts...');
        expect(textInput).toBeInTheDocument();
        expect(textInput).toHaveValue('');

        expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument();
    });

    it('renders correctly (Authenticated User)', () => {
        mockUserReturn.current = { id: 'user_123', name: 'Jason Yen' };

        render(<ReviewForm onSubmit={mockSubmit} isSubmitting={false} />);

        expect(screen.getByText('Jason Yen')).toBeInTheDocument();
        expect(screen.getByText('Logged In')).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Your Name')).not.toBeInTheDocument();
    });

    it('shows validation errors when submitting empty form', async () => {
        const user = userEvent.setup();
        render(<ReviewForm onSubmit={mockSubmit} isSubmitting={false} />);

        const submitBtn = screen.getByRole('button', { name: /submit review/i });
        await user.click(submitBtn);

        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Please select a star rating')).toBeInTheDocument();
        expect(screen.getByText('Review text is required')).toBeInTheDocument();

        expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with correct data (Anonymous User)', async () => {
        const user = userEvent.setup();
        render(<ReviewForm onSubmit={mockSubmit} isSubmitting={false} />);

        const nameInput = screen.getByPlaceholderText('Your Name');
        await user.type(nameInput, 'Alice');

        const stars = screen.getAllByRole('button');
        await user.click(stars[4]);

        const textInput = screen.getByPlaceholderText('Share your thoughts...');
        await user.type(textInput, 'Great product!');

        const submitBtn = screen.getByRole('button', { name: /submit review/i });
        await user.click(submitBtn);

        expect(mockSubmit).toHaveBeenCalledTimes(1);
        expect(mockSubmit).toHaveBeenCalledWith({
            name: 'Alice',
            rating: 5,
            text: 'Great product!',
            userId: undefined,
        });
    });

    it('calls onSubmit with correct data (Authenticated User)', async () => {
        mockUserReturn.current = { id: 'user_123', name: 'Jason Yen' };

        const user = userEvent.setup();
        render(<ReviewForm onSubmit={mockSubmit} isSubmitting={false} />);

        const stars = screen.getAllByRole('button');
        await user.click(stars[3]);

        const textInput = screen.getByPlaceholderText('Share your thoughts...');
        await user.type(textInput, 'Pretty good.');

        const submitBtn = screen.getByRole('button', { name: /submit review/i });
        await user.click(submitBtn);

        expect(mockSubmit).toHaveBeenCalledWith({
            name: 'Jason Yen',
            rating: 4,
            text: 'Pretty good.',
            userId: 'user_123',
        });
    });

    it('disables all inputs when isSubmitting is true', () => {
        render(<ReviewForm onSubmit={mockSubmit} isSubmitting={true} />);

        const submitBtn = screen.getByRole('button', { name: /submitting/i });
        expect(submitBtn).toBeDisabled();

        expect(screen.getByPlaceholderText('Your Name')).toBeDisabled();
        expect(screen.getByPlaceholderText('Share your thoughts...')).toBeDisabled();

        const stars = screen.getAllByRole('button');
        expect(stars[0]).toBeDisabled();
    });
});