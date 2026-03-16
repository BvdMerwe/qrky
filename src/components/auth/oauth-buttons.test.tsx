import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OAuthButtons from '@/components/auth/oauth-buttons';

// Mock the Supabase browser client
const mockSignInWithOAuth = vi.fn();

vi.mock('@/lib/supabase/browser', () => ({
    createClient: vi.fn(() => ({
        auth: {
            signInWithOAuth: mockSignInWithOAuth
        }
    }))
}));

// Mock window.location
const mockLocation = {
    origin: 'http://localhost:3000'
};
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true
});

describe('OAuthButtons', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Google and GitHub buttons', () => {
        render(<OAuthButtons />);
        
        expect(screen.getByText('Continue with Google')).toBeInTheDocument();
        expect(screen.getByText('Continue with Github')).toBeInTheDocument();
    });

    it('calls signInWithOAuth with google provider when Google button is clicked', async () => {
        mockSignInWithOAuth.mockResolvedValue({ error: null });
        
        render(<OAuthButtons />);
        const googleButton = screen.getByText('Continue with Google');
        
        fireEvent.click(googleButton);
        
        // Wait for async operation
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
            provider: 'google',
            options: {
                redirectTo: 'http://localhost:3000/auth/callback'
            }
        });
    });

    it('calls signInWithOAuth with github provider when GitHub button is clicked', async () => {
        mockSignInWithOAuth.mockResolvedValue({ error: null });
        
        render(<OAuthButtons />);
        const githubButton = screen.getByText('Continue with Github');
        
        fireEvent.click(githubButton);
        
        // Wait for async operation
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
            provider: 'github',
            options: {
                redirectTo: 'http://localhost:3000/auth/callback'
            }
        });
    });

    it('logs error when OAuth sign-in fails', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const mockError = new Error('OAuth failed');
        mockSignInWithOAuth.mockResolvedValue({ error: mockError });
        
        render(<OAuthButtons />);
        const googleButton = screen.getByText('Continue with Google');
        
        fireEvent.click(googleButton);
        
        // Wait for async operation
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('OAuth error:', mockError);
        
        consoleErrorSpy.mockRestore();
    });
});
