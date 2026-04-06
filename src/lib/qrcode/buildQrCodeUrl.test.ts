import { describe, it, expect, vi, afterEach } from 'vitest';

describe('buildQrCodeUrl', () => {
    const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

    afterEach(() => {
        // Restore original env
        if (originalEnv !== undefined) {
            vi.stubEnv('NEXT_PUBLIC_APP_URL', originalEnv);
        } else {
            vi.unstubAllEnvs();
        }
    });

    it('builds correct URL when NEXT_PUBLIC_APP_URL is set', async () => {
        vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.qrky.io');

        const { buildQrCodeUrl } = await import('./buildQrCodeUrl');
        
        const result = buildQrCodeUrl('abc123');
        
        expect(result).toBe('https://app.qrky.io/q/abc123');
    });

    it('documents behaviour when NEXT_PUBLIC_APP_URL is undefined', async () => {
        vi.unstubAllEnvs();
        delete process.env.NEXT_PUBLIC_APP_URL;

        const { buildQrCodeUrl } = await import('./buildQrCodeUrl');
        
        const result = buildQrCodeUrl('test-uuid');
        
        // Documents current behaviour: returns 'undefined/q/test-uuid'
        expect(result).toBe('undefined/q/test-uuid');
    });
});
