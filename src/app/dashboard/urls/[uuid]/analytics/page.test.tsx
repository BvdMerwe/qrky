import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Track mock state
let mockSelectResult: any = { data: null, error: null };

// Mock next/navigation
const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
    notFound: () => mockNotFound()
}));

// Mock the server supabase client
const mockSelect = vi.fn(() => ({
    eq: vi.fn(() => ({
        maybeSingle: vi.fn(() => Promise.resolve(mockSelectResult)),
        single: vi.fn(() => Promise.resolve(mockSelectResult))
    }))
}));

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
            if (table === 'visits') {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => Promise.resolve({ data: [] })),
                        in: vi.fn(() => Promise.resolve({ data: [] }))
                    }))
                };
            }
            return { select: mockSelect };
        })
    }))
}));

describe('Analytics Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNotFound.mockImplementation(() => {
            throw new Error('NOT_FOUND');
        });
    });

    it('displays URL not found when URL does not exist', async () => {
        mockSelectResult = { data: null, error: null };
        
        vi.resetModules();
        const { default: UrlAnalyticsPage } = await import('./page');
        
        const params = Promise.resolve({ uuid: 'non-existent-uuid' });
        
        // Component renders "URL Not Found" message instead of calling notFound()
        const result = await UrlAnalyticsPage({ params });
        expect(result).toBeDefined();
        // Check that it returns the not found JSX structure
        expect(result.props.children[0].props.children).toBe('URL Not Found');
    });

    it('displays analytics for URL with no visits', async () => {
        const mockUrl = {
            id: 1,
            uuid: 'test-uuid',
            url: 'https://example.com',
            qr_codes: [],
            aliases: []
        };
        
        mockSelectResult = { data: mockUrl, error: null };
        
        // Mock visits queries to return empty arrays
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockReturnValue({
            from: vi.fn((table: string) => {
                if (table === 'url_objects') {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                maybeSingle: vi.fn(() => Promise.resolve({ data: mockUrl, error: null }))
                            }))
                        }))
                    };
                }
                if (table === 'visits') {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => Promise.resolve({ data: [] })),
                            in: vi.fn(() => Promise.resolve({ data: [] }))
                        }))
                    };
                }
                return { select: mockSelect };
            })
        } as any);
        
        vi.resetModules();
        const { default: UrlAnalyticsPage } = await import('./page');
        
        const params = Promise.resolve({ uuid: 'test-uuid' });
        
        // Should not throw - renders successfully with 0 visits
        const result = await UrlAnalyticsPage({ params });
        expect(result).toBeDefined();
    });

    it('fetches visits for QR codes associated with URL', async () => {
        const mockUrl = {
            id: 1,
            uuid: 'test-uuid',
            url: 'https://example.com',
            qr_codes: [{ id: 'qr-1' }, { id: 'qr-2' }],
            aliases: []
        };
        
        const mockQrVisits = [
            { id: 1, qr_code_id: 'qr-1', created_at: '2024-01-01', user_agent: 'Test', ip: '1.1.1.1' }
        ];
        
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockReturnValue({
            from: vi.fn((table: string) => {
                if (table === 'url_objects') {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                maybeSingle: vi.fn(() => Promise.resolve({ data: mockUrl, error: null }))
                            }))
                        }))
                    };
                }
                if (table === 'visits') {
                    return {
                        select: vi.fn((fields: string) => ({
                            eq: vi.fn(() => Promise.resolve({ data: [] })),
                            in: vi.fn((field: string, values: string[]) => {
                                // Return QR visits when querying by qr_code_id
                                if (field === 'qr_code_id') {
                                    return Promise.resolve({ data: mockQrVisits });
                                }
                                return Promise.resolve({ data: [] });
                            })
                        }))
                    };
                }
                return { select: mockSelect };
            })
        } as any);
        
        vi.resetModules();
        const { default: UrlAnalyticsPage } = await import('./page');
        
        const params = Promise.resolve({ uuid: 'test-uuid' });
        const result = await UrlAnalyticsPage({ params });
        
        expect(result).toBeDefined();
    });

    it('fetches visits for aliases associated with URL', async () => {
        const mockUrl = {
            id: 1,
            uuid: 'test-uuid',
            url: 'https://example.com',
            qr_codes: [],
            aliases: [{ id: 'alias-1' }]
        };
        
        const mockAliasVisits = [
            { id: 2, alias_id: 'alias-1', created_at: '2024-01-02', user_agent: 'Mobile', ip: '2.2.2.2' }
        ];
        
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockReturnValue({
            from: vi.fn((table: string) => {
                if (table === 'url_objects') {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                maybeSingle: vi.fn(() => Promise.resolve({ data: mockUrl, error: null }))
                            }))
                        }))
                    };
                }
                if (table === 'visits') {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => Promise.resolve({ data: [] })),
                            in: vi.fn((field: string) => {
                                // Return alias visits when querying by alias_id
                                if (field === 'alias_id') {
                                    return Promise.resolve({ data: mockAliasVisits });
                                }
                                return Promise.resolve({ data: [] });
                            })
                        }))
                    };
                }
                return { select: mockSelect };
            })
        } as any);
        
        vi.resetModules();
        const { default: UrlAnalyticsPage } = await import('./page');
        
        const params = Promise.resolve({ uuid: 'test-uuid' });
        const result = await UrlAnalyticsPage({ params });
        
        expect(result).toBeDefined();
    });
});
