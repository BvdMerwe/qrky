import { describe, it, expect } from 'vitest';
import { stringIsValid, stringIsValidUrl } from '@/lib/strings';

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
});

describe('stringIsValidUrl - insecure (http)', () => {
    it('should return true for valid http URLs when secure is false', () => {
        expect(stringIsValidUrl('http://example.com', false)).toBe(true);
    });

    it('should return false for https URLs when secure is false', () => {
        expect(stringIsValidUrl('https://example.com', false)).toBe(false);
    });
});
