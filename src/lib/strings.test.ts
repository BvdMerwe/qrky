import { describe, it, expect } from 'vitest';
import { stringIsValid, stringIsValidUrl, hashString } from '@/lib/strings';

describe('stringIsValid', () => {
    it('should return true for valid non-empty string', () => {
        expect(stringIsValid('hello')).toBe(true);
    });

    it('should return false for empty string', () => {
        expect(stringIsValid('')).toBe(false);
    });

    it('should return false for non-string types', () => {
        expect(stringIsValid(null)).toBe(false);
        expect(stringIsValid(undefined)).toBe(false);
        expect(stringIsValid(123)).toBe(false);
        expect(stringIsValid({})).toBe(false);
        expect(stringIsValid([])).toBe(false);
    });
});

describe('stringIsValidUrl - secure (https)', () => {
    it('should return true for valid https URLs', () => {
        expect(stringIsValidUrl('https://example.com')).toBe(true);
        expect(stringIsValidUrl('https://example.com/path')).toBe(true);
        expect(stringIsValidUrl('https://example.com/path/to/page')).toBe(true);
        expect(stringIsValidUrl('https://sub.example.com')).toBe(true);
        expect(stringIsValidUrl('https://example.co.uk')).toBe(true);
    });

    it('should return false for http URLs when secure is true', () => {
        expect(stringIsValidUrl('http://example.com')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
        expect(stringIsValidUrl('not-a-url')).toBe(false);
        expect(stringIsValidUrl('')).toBe(false);
    });

    it('should return false for non-string input', () => {
        expect(stringIsValidUrl(null)).toBe(false);
        expect(stringIsValidUrl(undefined)).toBe(false);
        expect(stringIsValidUrl(123)).toBe(false);
    });

    it('should return true for URLs with query strings', () => {
        expect(stringIsValidUrl('https://example.com/path?foo=bar')).toBe(true);
        expect(stringIsValidUrl('https://example.com?key=value&other=data')).toBe(true);
    });

    it('should return true for URLs with fragments', () => {
        expect(stringIsValidUrl('https://example.com/path#section')).toBe(true);
        expect(stringIsValidUrl('https://example.com#top')).toBe(true);
    });

    it('should return false for non-http(s) protocols', () => {
        expect(stringIsValidUrl('ftp://example.com')).toBe(false);
        expect(stringIsValidUrl('file:///path/to/file')).toBe(false);
        expect(stringIsValidUrl('mailto:test@example.com')).toBe(false);
    });
});

describe('stringIsValidUrl - insecure (http)', () => {
    it('should return true for valid http URLs when secure is false', () => {
        expect(stringIsValidUrl('http://example.com', false)).toBe(true);
    });

    it('should return false for https URLs when secure is false', () => {
        expect(stringIsValidUrl('https://example.com', false)).toBe(false);
    });
});

describe('hashString', () => {
    it('should return hex string of default length 12', async () => {
        const result = await hashString('test');
        expect(result).toMatch(/^[0-9a-f]{12}$/);
        expect(result.length).toBe(12);
    });

    it('should be deterministic (same input produces same output)', async () => {
        const hash1 = await hashString('hello');
        const hash2 = await hashString('hello');
        expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', async () => {
        const hashA = await hashString('a');
        const hashB = await hashString('b');
        expect(hashA).not.toBe(hashB);
    });

    it('should respect custom length parameter', async () => {
        const hash8 = await hashString('test', 8);
        expect(hash8.length).toBe(8);
        expect(hash8).toMatch(/^[0-9a-f]{8}$/);
    });

    it('should handle various string inputs', async () => {
        const emptyHash = await hashString('');
        const longHash = await hashString('a very long string with special chars !@#$%^&*()');
        
        expect(emptyHash).toMatch(/^[0-9a-f]{12}$/);
        expect(longHash).toMatch(/^[0-9a-f]{12}$/);
    });
});
