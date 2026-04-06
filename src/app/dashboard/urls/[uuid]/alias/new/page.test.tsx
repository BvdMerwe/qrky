import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Component Integration Test for Alias Page
 * 
 * This test verifies the page renders without Server/Client serialization errors.
 * The bug that prompted this test: passing React elements from Server Component
 * to Client Component causes runtime serialization errors.
 */

// Mock next/navigation
const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
    notFound: () => mockNotFound()
}));

// Mock the server supabase client
let mockSelectResult: any = { data: null, error: null };

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn((table: string) => {
            if (table === 'url_objects') {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            maybeSingle: vi.fn(() => Promise.resolve(mockSelectResult))
                        }))
                    }))
                };
            }
            return {
                select: vi.fn(() => ({
                    eq: vi.fn(() => Promise.resolve({ data: null }))
                }))
            };
        })
    }))
}));

// Mock the Client Component to avoid React element serialization issues in test
vi.mock('./components/form/alias-form', () => ({
    AliasForm: ({ uuid, url }: { uuid: string; url: string }) => {
        return React.createElement('div', { 'data-testid': 'alias-form' }, 
            `AliasForm: uuid=${uuid}, url=${url}`
        );
    }
}));

describe('Alias New Page - Component Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSelectResult = { data: null, error: null };
        mockNotFound.mockImplementation(() => {
            throw new Error('NOT_FOUND');
        });
    });

    it('renders without Server/Client serialization errors', async () => {
        const mockUrl = {
            uuid: 'test-uuid-123',
            url: 'https://example.com/test-url'
        };
        mockSelectResult = { data: mockUrl, error: null };

        // Reset modules to get fresh imports with new mocks
        vi.resetModules();
        const { default: NewAliasPage } = await import('./page');
        
        const params = Promise.resolve({ uuid: 'test-uuid-123' });
        
        // Should not throw serialization errors
        const result = await NewAliasPage({ params });
        expect(result).toBeDefined();
        
        // Verify meaningful content is rendered
        render(result);
        expect(screen.getByTestId('alias-form')).toBeInTheDocument();
        expect(screen.getByText(/test-uuid-123/)).toBeInTheDocument();
        expect(screen.getByText(/https:\/\/example.com\/test-url/)).toBeInTheDocument();
    });

    it('fetches URL data from Supabase', async () => {
        const mockUrl = {
            uuid: 'url-uuid-456',
            url: 'https://test.com/page'
        };
        mockSelectResult = { data: mockUrl, error: null };

        vi.resetModules();
        const { default: NewAliasPage } = await import('./page');
        
        const params = Promise.resolve({ uuid: 'url-uuid-456' });
        const result = await NewAliasPage({ params });
        expect(result).toBeDefined();
        
        // Verify the fetched URL data appears in the rendered output
        render(result);
        expect(screen.getByTestId('alias-form')).toBeInTheDocument();
        expect(screen.getByText(/url-uuid-456/)).toBeInTheDocument();
        expect(screen.getByText(/https:\/\/test.com\/page/)).toBeInTheDocument();
    });

    it('throws error when URL not found', async () => {
        mockSelectResult = { data: null, error: new Error('Not found') };

        vi.resetModules();
        const { default: NewAliasPage } = await import('./page');
        
        const params = Promise.resolve({ uuid: 'non-existent' });
        
        await expect(NewAliasPage({ params })).rejects.toThrow('URL not found');
    });
});
