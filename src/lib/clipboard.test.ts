import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyToClipboard } from './clipboard';

describe('copyToClipboard', () => {
    beforeEach(() => {
        // Mock navigator.clipboard
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn()
            }
        });
    });

    it('calls navigator.clipboard.writeText with correct value', async () => {
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator.clipboard, { writeText: mockWriteText });

        await copyToClipboard('test content');

        expect(mockWriteText).toHaveBeenCalledWith('test content');
        expect(mockWriteText).toHaveBeenCalledTimes(1);
    });

    it('returns true on successful copy', async () => {
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator.clipboard, { writeText: mockWriteText });

        const result = await copyToClipboard('success test');

        expect(result).toBe(true);
    });

    it('throws error when clipboard API rejects', async () => {
        const mockError = new Error('Clipboard access denied');
        const mockWriteText = vi.fn().mockRejectedValue(mockError);
        Object.assign(navigator.clipboard, { writeText: mockWriteText });

        await expect(copyToClipboard('fail test')).rejects.toThrow('Clipboard access denied');
    });

    it('handles empty string', async () => {
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator.clipboard, { writeText: mockWriteText });

        const result = await copyToClipboard('');

        expect(mockWriteText).toHaveBeenCalledWith('');
        expect(result).toBe(true);
    });

    it('handles long content', async () => {
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator.clipboard, { writeText: mockWriteText });

        const longContent = 'a'.repeat(10000);
        const result = await copyToClipboard(longContent);

        expect(mockWriteText).toHaveBeenCalledWith(longContent);
        expect(result).toBe(true);
    });
});
