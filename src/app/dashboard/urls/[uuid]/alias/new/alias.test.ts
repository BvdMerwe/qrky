import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock console.error to prevent noise
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
    redirect: mockRedirect,
    RedirectType: {
        push: 'push'
    }
}));

// Create mock supabase methods that will be reassigned in tests
let mockSingle = vi.fn();
let mockMaybeSingle = vi.fn();
let mockInsert = vi.fn();
let mockSelect = vi.fn();
let mockEq = vi.fn();

// Track from() calls to handle multiple table operations
let fromCallCount = 0;
let mockFromImplementation: any = null;

// Mock the server supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn((table: string) => {
            fromCallCount++;
            if (mockFromImplementation) {
                return mockFromImplementation(table, fromCallCount);
            }
            return {
                insert: mockInsert,
                select: mockSelect
            };
        })
    }))
}));

// Mock the string utilities
vi.mock('@/lib/strings', () => ({
    stringIsValid: vi.fn((data: unknown) => {
        if (typeof data !== 'string') return false;
        if (data === '') return false;
        return true;
    })
}));

const initialState = { message: '', success: false };

describe('Alias Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fromCallCount = 0;
        mockFromImplementation = null;
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT:${url}`);
        });
        
        // Reset mock implementations
        mockSingle = vi.fn();
        mockMaybeSingle = vi.fn();
        mockInsert = vi.fn(() => ({ error: null }));
        mockSelect = vi.fn(() => ({ eq: mockEq }));
        mockEq = vi.fn(() => ({ single: mockSingle, maybeSingle: mockMaybeSingle }));
    });

    afterEach(() => {
        // Clear call history but don't restore (spy is module-level)
        mockConsoleError.mockClear();
    });

    describe('createAlias', () => {
        it('creates alias and redirects on success', async () => {
            const mockUrlData = { id: 123, user_id: 'user-123' };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            mockMaybeSingle.mockResolvedValue({ data: null, error: null }); // No existing alias
            
            let callCount = 0;
            mockFromImplementation = (table: string, _count: number) => {
                callCount++;
                if (callCount === 1) {
                    // First call: lookup url_objects
                    expect(table).toBe('url_objects');
                    return {
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }))
                    };
                } else if (callCount === 2) {
                    // Second call: check for existing alias
                    expect(table).toBe('aliases');
                    return {
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })) }))
                    };
                } else {
                    // Third call: insert alias
                    expect(table).toBe('aliases');
                    return { insert: mockInsert };
                }
            };

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn((table: string) => {
                    fromCallCount++;
                    return mockFromImplementation(table, fromCallCount);
                })
            } as any);

            const { createAlias } = await import('./actions');
            
            const formData = new FormData();
            formData.append('uuid', 'abc-123');
            formData.append('alias', 'my-alias');

            await expect(createAlias(initialState, formData)).rejects.toThrow('REDIRECT:/dashboard/urls');
            
            expect(mockInsert).toHaveBeenCalledWith({
                value: 'my-alias',
                url_object_id: 123
            });
        });

        it('BUG: should fail when alias already exists globally (case insensitive)', async () => {
            const mockUrlData = { id: 123, user_id: 'user-123' };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            
            mockMaybeSingle.mockResolvedValue({ 
                data: { id: 'existing-alias-id', value: 'MY-ALIAS' }, 
                error: null 
            });
            
            let callCount = 0;
            mockFromImplementation = (_table: string, _count: number) => {
                callCount++;
                if (callCount === 1) {
                    return {
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }))
                    };
                } else if (callCount === 2) {
                    return {
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })) }))
                    };
                }
                return { insert: mockInsert };
            };

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn((table: string) => {
                    fromCallCount++;
                    return mockFromImplementation(table, fromCallCount);
                })
            } as any);

            const { createAlias } = await import('./actions');
            
            const formData = new FormData();
            formData.append('uuid', 'abc-123');
            formData.append('alias', 'my-alias');

            const result = await createAlias(initialState, formData);
            expect(result).toMatchObject({ message: 'Alias already exists', success: false });
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('returns error for invalid uuid', async () => {
            const { createAlias } = await import('./actions');
            
            const formData = new FormData();
            formData.append('uuid', '');
            formData.append('alias', 'my-alias');

            const result = await createAlias(initialState, formData);
            expect(result).toMatchObject({ message: 'Invalid input', success: false });
        });

        it('returns error for invalid alias', async () => {
            const { createAlias } = await import('./actions');
            
            const formData = new FormData();
            formData.append('uuid', 'abc-123');
            formData.append('alias', '');

            const result = await createAlias(initialState, formData);
            expect(result).toMatchObject({ message: 'Invalid input', success: false });
        });

        it('returns error when URL not found', async () => {
            mockSingle.mockResolvedValue({ data: null, error: new Error('URL not found') });
            
            mockFromImplementation = () => ({
                select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }))
            });

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => mockFromImplementation())
            } as any);

            const { createAlias } = await import('./actions');
            
            const formData = new FormData();
            formData.append('uuid', 'non-existent');
            formData.append('alias', 'my-alias');

            const result = await createAlias(initialState, formData);
            expect(result).toMatchObject({ message: 'URL not found', success: false });
        });

        it('returns error when database insert fails', async () => {
            const mockUrlData = { id: 123, user_id: 'user-123' };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            mockMaybeSingle.mockResolvedValue({ data: null, error: null });
            
            const dbError = new Error('Unique constraint violation');
            mockInsert.mockReturnValue({ error: dbError });
            
            let callCount = 0;
            mockFromImplementation = () => {
                callCount++;
                if (callCount === 1) {
                    return {
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }))
                    };
                } else if (callCount === 2) {
                    return {
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })) }))
                    };
                }
                return { insert: mockInsert };
            };

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => mockFromImplementation())
            } as any);

            const { createAlias } = await import('./actions');
            
            const formData = new FormData();
            formData.append('uuid', 'abc-123');
            formData.append('alias', 'my-alias');

            const result = await createAlias(initialState, formData);
            expect(result).toMatchObject({ message: 'Unique constraint violation', success: false });
            expect(mockConsoleError).toHaveBeenCalledWith('Unique constraint violation');
        });

        it('normalizes alias to lowercase', async () => {
            const mockUrlData = { id: 123, user_id: 'user-123' };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            mockMaybeSingle.mockResolvedValue({ data: null, error: null });
            
            let capturedInsert: any = null;
            mockInsert.mockImplementation((data: any) => {
                capturedInsert = data;
                return { error: null };
            });
            
            let callCount = 0;
            mockFromImplementation = () => {
                callCount++;
                if (callCount === 1) {
                    return {
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }))
                    };
                } else if (callCount === 2) {
                    return {
                        select: vi.fn(() => ({ 
                            eq: vi.fn(() => ({ 
                                maybeSingle: vi.fn(() => ({ data: null, error: null })) 
                            })) 
                        }))
                    };
                }
                return { insert: mockInsert };
            };

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => mockFromImplementation())
            } as any);

            const { createAlias } = await import('./actions');
            
            const formData = new FormData();
            formData.append('uuid', 'abc-123');
            formData.append('alias', 'My-Cool-Alias');

            await expect(createAlias(initialState, formData)).rejects.toThrow('REDIRECT:/dashboard/urls');
            
            // Alias should be normalized to lowercase
            expect(capturedInsert.value).toBe('my-cool-alias');
        });

        it('rejects reserved alias names', async () => {
            const { createAlias } = await import('./actions');
            
            const reservedNames = ['dashboard', 'api', 'login', 'logout', 'admin', 'analytics', 'settings'];
            
            for (const reserved of reservedNames) {
                const formData = new FormData();
                formData.append('uuid', 'abc-123');
                formData.append('alias', reserved);

                const result = await createAlias(initialState, formData);
                expect(result).toMatchObject({ message: `"${reserved}" is a reserved name and cannot be used as an alias`, success: false });
            }
            
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('rejects aliases with invalid characters', async () => {
            const { createAlias } = await import('./actions');
            
            const invalidAliases = ['my alias', 'my@alias', 'my#alias', 'my$alias', 'space here'];
            
            for (const invalidAlias of invalidAliases) {
                const formData = new FormData();
                formData.append('uuid', 'abc-123');
                formData.append('alias', invalidAlias);

                const result = await createAlias(initialState, formData);
                expect(result).toMatchObject({ message: 'Alias can only contain letters, numbers, and hyphens', success: false });
            }
            
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('rejects aliases that are too short', async () => {
            const { createAlias } = await import('./actions');
            
            const formData = new FormData();
            formData.append('uuid', 'abc-123');
            formData.append('alias', 'ab'); // Only 2 characters

            const result = await createAlias(initialState, formData);
            expect(result).toMatchObject({ message: 'Alias must be between 3 and 50 characters', success: false });
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('rejects aliases that are too long', async () => {
            const { createAlias } = await import('./actions');
            
            const formData = new FormData();
            formData.append('uuid', 'abc-123');
            formData.append('alias', 'a'.repeat(51)); // 51 characters

            const result = await createAlias(initialState, formData);
            expect(result).toMatchObject({ message: 'Alias must be between 3 and 50 characters', success: false });
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('rejects case-insensitive alias collisions', async () => {
            const mockUrlData = { id: 123, user_id: 'user-123' };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            
            // Simulate existing alias 'mylink' already in database
            mockMaybeSingle.mockResolvedValue({ data: { id: 456, value: 'mylink' }, error: null });
            
            mockFromImplementation = () => ({
                select: vi.fn(() => ({ 
                    eq: vi.fn(() => ({ 
                        single: mockSingle,
                        maybeSingle: mockMaybeSingle
                    })) 
                }))
            });

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => mockFromImplementation())
            } as any);

            const { createAlias } = await import('./actions');
            
            // Test various case combinations that should all be rejected
            const collidingAliases = ['mylink', 'MYLINK', 'MyLink', 'mYlInK', 'MyLINK'];
            
            for (const alias of collidingAliases) {
                const formData = new FormData();
                formData.append('uuid', 'abc-123');
                formData.append('alias', alias);

                const result = await createAlias(initialState, formData);
                expect(result).toMatchObject({ message: 'Alias already exists', success: false });
            }
            
            expect(mockInsert).not.toHaveBeenCalled();
        });

        it('returns error when alias availability check fails', async () => {
            const mockUrlData = { id: 123, user_id: 'user-123' };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            
            // Simulate database error during alias check
            mockMaybeSingle.mockResolvedValue({ data: null, error: new Error('Database connection error') });
            
            let callCount = 0;
            mockFromImplementation = () => {
                callCount++;
                if (callCount === 1) {
                    return {
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }))
                    };
                } else if (callCount === 2) {
                    return {
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })) }))
                    };
                }
                return { insert: mockInsert };
            };

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => mockFromImplementation())
            } as any);

            const { createAlias } = await import('./actions');
            
            const formData = new FormData();
            formData.append('uuid', 'abc-123');
            formData.append('alias', 'my-alias');

            const result = await createAlias(initialState, formData);
            expect(result).toMatchObject({ message: 'Failed to check alias availability', success: false });
            expect(mockInsert).not.toHaveBeenCalled();
        });
    });
});
