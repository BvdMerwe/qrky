import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModuleTypeEnum } from '@/lib/qrcode/module-type.enum';
import { QRkyOptions } from '@/lib/qrcode/QRkyOptions';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock console.error and console.log to prevent noise
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock next/navigation
const mockRedirect = vi.fn();
const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
    redirect: mockRedirect,
    notFound: mockNotFound,
    RedirectType: {
        push: 'push',
        replace: 'replace'
    }
}));

// Mock next/cache
const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
    revalidatePath: mockRevalidatePath
}));

// Mock next/headers
const mockCookieStore = {
    getAll: vi.fn(() => []),
    set: vi.fn()
};

vi.mock('next/headers', () => ({
    cookies: vi.fn(() => Promise.resolve(mockCookieStore))
}));

// Mock supabase methods
let mockSelect = vi.fn();
let mockEq = vi.fn();
let mockSingle = vi.fn();
let mockInsert = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve({
        from: vi.fn(() => ({
            select: mockSelect,
            insert: mockInsert
        }))
    }))
}));

describe('QR Code Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT:${url}`);
        });
        mockNotFound.mockImplementation(() => {
            throw new Error('NOT_FOUND');
        });
        
        // Reset mock implementations
        mockSelect = vi.fn();
        mockEq = vi.fn();
        mockSingle = vi.fn();
        mockInsert = vi.fn();
    });

    afterEach(() => {
        mockConsoleError.mockClear();
    });

    describe('createQrCode', () => {
        it('creates QR code and redirects on success', async () => {
            const mockUrlData = { id: 123 };
            const mockInsertResult = { error: null };
            
            let fromCallCount = 0;
            const mockFrom = vi.fn(() => {
                fromCallCount++;
                if (fromCallCount === 1) {
                    // First call: get URL by UUID
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn(() => Promise.resolve({ data: mockUrlData, error: null }))
                            }))
                        }))
                    };
                }
                // Second call: insert QR code
                return {
                    insert: vi.fn(() => Promise.resolve(mockInsertResult))
                };
            });

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue({
                from: mockFrom
            } as any);

            const { createQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/new/actions');
            
            const formData = new FormData();
            formData.append('uuid', 'test-uuid-123');

            await expect(createQrCode(formData)).rejects.toThrow('REDIRECT:/dashboard/urls');
            expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/urls');
        });

        it('throws error when UUID is missing', async () => {
            const { createQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/new/actions');
            
            const formData = new FormData();
            // No uuid appended

            await expect(createQrCode(formData)).rejects.toThrow('Invalid input: missing URL UUID');
        });

        it('throws error when UUID is empty', async () => {
            const { createQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/new/actions');
            
            const formData = new FormData();
            formData.append('uuid', '');

            await expect(createQrCode(formData)).rejects.toThrow('Invalid input: missing URL UUID');
        });

        it('throws error when URL not found', async () => {
            const mockFrom = vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: null, error: new Error('URL not found') }))
                    }))
                }))
            }));

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue({
                from: mockFrom
            } as any);

            const { createQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/new/actions');
            
            const formData = new FormData();
            formData.append('uuid', 'non-existent-uuid');

            await expect(createQrCode(formData)).rejects.toThrow('URL not found');
            expect(mockConsoleError).toHaveBeenCalled();
        });

        it('throws error when supabase insert fails', async () => {
            const mockUrlData = { id: 123 };
            const insertError = new Error('Database constraint violation');
            
            let fromCallCount = 0;
            const mockFrom = vi.fn(() => {
                fromCallCount++;
                if (fromCallCount === 1) {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn(() => Promise.resolve({ data: mockUrlData, error: null }))
                            }))
                        }))
                    };
                }
                return {
                    insert: vi.fn(() => Promise.resolve({ error: insertError }))
                };
            });

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue({
                from: mockFrom
            } as any);

            const { createQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/new/actions');
            
            const formData = new FormData();
            formData.append('uuid', 'test-uuid-123');

            await expect(createQrCode(formData)).rejects.toThrow('Database constraint violation');
            expect(mockConsoleError).toHaveBeenCalledWith('Database constraint violation');
        });

        it('throws error when data is null but no error from URL query', async () => {
            const mockFrom = vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
                    }))
                }))
            }));

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue({
                from: mockFrom
            } as any);

            const { createQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/new/actions');
            
            const formData = new FormData();
            formData.append('uuid', 'test-uuid-123');

            await expect(createQrCode(formData)).rejects.toThrow('URL not found');
        });
    });

    describe('updateQrCode', () => {
        it('updates QR code and redirects on success', async () => {
            const mockQrCode = { id: 'qr-uuid', url_object_id: 'url-obj-id' };
            const mockUrlObject = { id: 'url-obj-id', user_id: 'user-123' };
            
            let callCount = 0;
            const mockFrom = vi.fn(() => {
                callCount++;
                if (callCount === 1) {
                    return {
                        select: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                single: vi.fn(() => Promise.resolve({ data: mockQrCode, error: null }))
                            }))
                        }))
                    };
                }
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn(() => Promise.resolve({ data: mockUrlObject, error: null }))
                        }))
                    })),
                    update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) }))
                };
            });

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
                },
                from: mockFrom
            } as any);

            const { updateQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/edit/actions');
            
            const formData = new FormData();
            formData.append('qr_code_id', 'qr-123');
            formData.append('url_uuid', 'url-uuid-456');
            formData.append('fg_color', '#000000');
            formData.append('bg_color', '#ffffff');
            formData.append('corner_radius', '0.45');

            await expect(updateQrCode(formData)).rejects.toThrow('REDIRECT:/dashboard/urls');
            expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/urls');
        });

        it('throws error when QR code ID is missing', async () => {
            const { updateQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/edit/actions');
            
            const formData = new FormData();
            formData.append('url_uuid', 'url-uuid-456');
            // No qr_code_id appended

            await expect(updateQrCode(formData)).rejects.toThrow('Invalid input: missing QR code ID');
        });

        it('throws error when QR code ID is empty', async () => {
            const { updateQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/edit/actions');
            
            const formData = new FormData();
            formData.append('qr_code_id', '');
            formData.append('url_uuid', 'url-uuid-456');

            await expect(updateQrCode(formData)).rejects.toThrow('Invalid input: missing QR code ID');
        });

        it('throws error when QR code not found', async () => {
            const mockFrom = vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: null, error: new Error('QR code not found') }))
                    }))
                }))
            }));

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
                },
                from: mockFrom
            } as any);

            const { updateQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/edit/actions');
            
            const formData = new FormData();
            formData.append('qr_code_id', 'non-existent-qr');
            formData.append('url_uuid', 'url-uuid-456');
            formData.append('fg_color', '#000000');
            formData.append('bg_color', '#ffffff');
            formData.append('corner_radius', '0.45');

            await expect(updateQrCode(formData)).rejects.toThrow('QR code not found');
            expect(mockConsoleError).toHaveBeenCalled();
        });

        it('throws error when data is null but no error from QR query', async () => {
            const mockFrom = vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
                    }))
                }))
            }));

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
                },
                from: mockFrom
            } as any);

            const { updateQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/edit/actions');
            
            const formData = new FormData();
            formData.append('qr_code_id', 'test-qr-123');
            formData.append('url_uuid', 'url-uuid-456');
            formData.append('fg_color', '#000000');
            formData.append('bg_color', '#ffffff');
            formData.append('corner_radius', '0.45');

            await expect(updateQrCode(formData)).rejects.toThrow('QR code not found');
        });
    });
});

describe('ModuleTypeEnum', () => {
    it('should have correct binary values for all module types', () => {
        expect(ModuleTypeEnum.SINGLE).toBe(0b0000);                    // 0
        expect(ModuleTypeEnum.END_CAP_RIGHT).toBe(0b0001);            // 1
        expect(ModuleTypeEnum.END_CAP_TOP).toBe(0b0010);              // 2
        expect(ModuleTypeEnum.ELBOW_TOP_RIGHT).toBe(0b0011);          // 3
        expect(ModuleTypeEnum.END_CAP_LEFT).toBe(0b0100);             // 4
        expect(ModuleTypeEnum.CONNECTOR_HORIZONTAL).toBe(0b0101);      // 5
        expect(ModuleTypeEnum.ELBOW_TOP_LEFT).toBe(0b0110);           // 6
        expect(ModuleTypeEnum.JUNCTION_BOTTOM).toBe(0b0111);          // 7
        expect(ModuleTypeEnum.END_CAP_BOTTOM).toBe(0b1000);            // 8
        expect(ModuleTypeEnum.ELBOW_BOTTOM_RIGHT).toBe(0b1001);       // 9
        expect(ModuleTypeEnum.CONNECTOR_VERTICAL).toBe(0b1010);      // 10
        expect(ModuleTypeEnum.JUNCTION_LEFT).toBe(0b1011);            // 11
        expect(ModuleTypeEnum.ELBOW_BOTTOM_LEFT).toBe(0b1100);         // 12
        expect(ModuleTypeEnum.JUNCTION_TOP).toBe(0b1101);             // 13
        expect(ModuleTypeEnum.JUNCTION_RIGHT).toBe(0b1110);          // 14
        expect(ModuleTypeEnum.CONNECTOR_ALL).toBe(0b1111);             // 15
    });

    it('should use correct neighbor detection bits (top=8, right=4, bottom=2, left=1)', () => {
        // Test that enum values correctly represent neighbor patterns
        // SINGLE: no neighbors (0)
        expect(ModuleTypeEnum.SINGLE & 0b1000).toBe(0); // no top
        expect(ModuleTypeEnum.SINGLE & 0b0100).toBe(0); // no right
        expect(ModuleTypeEnum.SINGLE & 0b0010).toBe(0); // no bottom
        expect(ModuleTypeEnum.SINGLE & 0b0001).toBe(0); // no left

        // CONNECTOR_HORIZONTAL: left + right (4 + 1 = 5)
        expect(ModuleTypeEnum.CONNECTOR_HORIZONTAL & 0b0100).toBe(0b0100); // has right
        expect(ModuleTypeEnum.CONNECTOR_HORIZONTAL & 0b0001).toBe(0b0001); // has left
        expect(ModuleTypeEnum.CONNECTOR_HORIZONTAL & 0b1000).toBe(0);      // no top
        expect(ModuleTypeEnum.CONNECTOR_HORIZONTAL & 0b0010).toBe(0);      // no bottom

        // CONNECTOR_VERTICAL: top + bottom (8 + 2 = 10)
        expect(ModuleTypeEnum.CONNECTOR_VERTICAL & 0b1000).toBe(0b1000); // has top
        expect(ModuleTypeEnum.CONNECTOR_VERTICAL & 0b0010).toBe(0b0010); // has bottom
        expect(ModuleTypeEnum.CONNECTOR_VERTICAL & 0b0100).toBe(0);      // no right
        expect(ModuleTypeEnum.CONNECTOR_VERTICAL & 0b0001).toBe(0);      // no left

        // END_CAP_TOP: bottom only (2)
        expect(ModuleTypeEnum.END_CAP_TOP & 0b0010).toBe(0b0010); // has bottom
        expect(ModuleTypeEnum.END_CAP_TOP & 0b1000).toBe(0);     // no top
        expect(ModuleTypeEnum.END_CAP_TOP & 0b0100).toBe(0);     // no right
        expect(ModuleTypeEnum.END_CAP_TOP & 0b0001).toBe(0);     // no left

        // JUNCTION_BOTTOM: left + right + bottom (1 + 4 + 2 = 7)
        expect(ModuleTypeEnum.JUNCTION_BOTTOM & 0b0001).toBe(0b0001); // has left
        expect(ModuleTypeEnum.JUNCTION_BOTTOM & 0b0100).toBe(0b0100); // has right
        expect(ModuleTypeEnum.JUNCTION_BOTTOM & 0b0010).toBe(0b0010); // has bottom
        expect(ModuleTypeEnum.JUNCTION_BOTTOM & 0b1000).toBe(0);      // no top
    });

    it('should have all expected enum values', () => {
        const values = Object.values(ModuleTypeEnum).filter(v => typeof v === 'number');
        expect(values).toHaveLength(16);
        expect(values.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    });
});

describe('QRkyOptions Extended', () => {
    describe('logo path validation', () => {
        it('should accept null svgLogo', () => {
            const options = new QRkyOptions({ svgLogo: null });
            expect(options.svgLogo).toBeNull();
        });

        it('should accept undefined svgLogo', () => {
            const options = new QRkyOptions({});
            expect(options.svgLogo).toBeNull();
        });

        it('should reject empty string svgLogo', () => {
            const options = new QRkyOptions({ svgLogo: '' });
            expect(options.svgLogo).toBeNull();
        });

        it('should reject whitespace-only svgLogo', () => {
            const options = new QRkyOptions({ svgLogo: '   ' });
            expect(options.svgLogo).toBeNull();
        });
    });

    describe('setter methods behavior', () => {
        it('should set svgLogoCssClass correctly', () => {
            const options = new QRkyOptions();
            (options as any).set_svgLogoCssClass('my-custom-class');
            expect(options.svgLogoCssClass).toBe('my-custom-class');
        });

        it('should set clearLogoSpace correctly', () => {
            const options = new QRkyOptions();
            expect(options.clearLogoSpace).toBe(true);
            (options as any).set_clearLogoSpace(false);
            expect(options.clearLogoSpace).toBe(false);
        });

        it('should clamp svgLogoScaleMinimum to 0-1 range', () => {
            const options = new QRkyOptions();
            (options as any).set_svgLogoScaleMinimum(-0.5);
            expect(options.svgLogoScaleMinimum).toBe(0);
            (options as any).set_svgLogoScaleMinimum(1.5);
            expect(options.svgLogoScaleMinimum).toBe(1);
        });

        it('should clamp svgLogoScaleMaximum to 0-1 range', () => {
            const options = new QRkyOptions();
            (options as any).set_svgLogoScaleMaximum(-0.5);
            expect(options.svgLogoScaleMaximum).toBe(0);
            (options as any).set_svgLogoScaleMaximum(1.5);
            expect(options.svgLogoScaleMaximum).toBe(1);
        });

        it('should ensure svgViewBoxSize is at least 1', () => {
            const options = new QRkyOptions();
            (options as any).set_svgViewBoxSize(0);
            expect(options.svgViewBoxSize).toBe(1);
            (options as any).set_svgViewBoxSize(-100);
            expect(options.svgViewBoxSize).toBe(1);
        });
    });

    describe('option inheritance from QROptions', () => {
        it('should inherit standard QR options', () => {
            const options = new QRkyOptions({
                version: 5,
                eccLevel: 3,
                quietzoneSize: 4,
                addQuietzone: true,
                bgColor: '#ffffff',
                drawLightModules: true
            });
            
            expect(options.version).toBe(5);
            expect(options.eccLevel).toBe(3);
            expect(options.quietzoneSize).toBe(4);
            expect(options.addQuietzone).toBe(true);
            expect(options.bgColor).toBe('#ffffff');
            expect(options.drawLightModules).toBe(true);
        });

        it('should allow circleRadius option', () => {
            const options = new QRkyOptions({
                circleRadius: 0.35
            });
            expect(options.circleRadius).toBe(0.35);
        });
    });
});
