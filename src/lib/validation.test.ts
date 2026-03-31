import { describe, it, expect } from 'vitest';
import { validateAlias, normalizeAlias, RESERVED_NAMES } from './validation';

describe('validateAlias', () => {
    // Valid cases
    it('accepts valid alias', () => {
        expect(() => validateAlias('valid-alias')).not.toThrow();
    });

    it('accepts alias of exactly 3 chars', () => {
        expect(() => validateAlias('abc')).not.toThrow();
    });

    it('accepts alias of exactly 50 chars', () => {
        const fiftyChars = 'a'.repeat(50);
        expect(() => validateAlias(fiftyChars)).not.toThrow();
    });

    // Length validation
    it('rejects alias shorter than 3 chars', () => {
        expect(() => validateAlias('ab')).toThrow('Alias must be between 3 and 50 characters');
    });

    it('rejects alias longer than 50 chars', () => {
        const fiftyOneChars = 'a'.repeat(51);
        expect(() => validateAlias(fiftyOneChars)).toThrow('Alias must be between 3 and 50 characters');
    });

    // Character validation
    it('rejects alias with spaces', () => {
        expect(() => validateAlias('my alias')).toThrow('Alias can only contain letters, numbers, and hyphens');
    });

    it('rejects alias with underscores', () => {
        expect(() => validateAlias('my_alias')).toThrow('Alias can only contain letters, numbers, and hyphens');
    });

    it('rejects alias with special characters', () => {
        expect(() => validateAlias('my@alias')).toThrow('Alias can only contain letters, numbers, and hyphens');
    });

    it('accepts alias with uppercase (normalizes internally)', () => {
        expect(() => validateAlias('MyAlias')).not.toThrow();
    });

    // Reserved names - test ALL 14 individually
    it('rejects reserved name: dashboard', () => {
        expect(() => validateAlias('dashboard')).toThrow('"dashboard" is a reserved name and cannot be used as an alias');
    });

    it('rejects reserved name: api', () => {
        expect(() => validateAlias('api')).toThrow('"api" is a reserved name and cannot be used as an alias');
    });

    it('rejects reserved name: login', () => {
        expect(() => validateAlias('login')).toThrow('"login" is a reserved name and cannot be used as an alias');
    });

    it('rejects reserved name: logout', () => {
        expect(() => validateAlias('logout')).toThrow('"logout" is a reserved name and cannot be used as an alias');
    });

    it('rejects reserved name: admin', () => {
        expect(() => validateAlias('admin')).toThrow('"admin" is a reserved name and cannot be used as an alias');
    });

    it('rejects reserved name: qr (fails length check first)', () => {
        // Note: 'qr' is only 2 chars, so it fails length validation before reserved name check
        expect(() => validateAlias('qr')).toThrow('Alias must be between 3 and 50 characters');
    });

    it('rejects reserved name: q (fails length check first)', () => {
        // Note: 'q' is only 1 char, so it fails length validation before reserved name check
        expect(() => validateAlias('q')).toThrow('Alias must be between 3 and 50 characters');
    });

    it('rejects reserved name: u (fails length check first)', () => {
        // Note: 'u' is only 1 char, so it fails length validation before reserved name check
        expect(() => validateAlias('u')).toThrow('Alias must be between 3 and 50 characters');
    });

    it('rejects reserved name: auth', () => {
        expect(() => validateAlias('auth')).toThrow('"auth" is a reserved name and cannot be used as an alias');
    });

    it('rejects reserved name: callback', () => {
        expect(() => validateAlias('callback')).toThrow('"callback" is a reserved name and cannot be used as an alias');
    });

    it('rejects reserved name: new', () => {
        expect(() => validateAlias('new')).toThrow('"new" is a reserved name and cannot be used as an alias');
    });

    it('rejects reserved name: edit', () => {
        expect(() => validateAlias('edit')).toThrow('"edit" is a reserved name and cannot be used as an alias');
    });

    it('rejects reserved name: analytics', () => {
        expect(() => validateAlias('analytics')).toThrow('"analytics" is a reserved name and cannot be used as an alias');
    });

    it('rejects reserved name: settings', () => {
        expect(() => validateAlias('settings')).toThrow('"settings" is a reserved name and cannot be used as an alias');
    });

    // Reserved names are case-insensitive
    it('rejects reserved name with uppercase (DASHBOARD)', () => {
        expect(() => validateAlias('DASHBOARD')).toThrow('"dashboard" is a reserved name and cannot be used as an alias');
    });

    // Verify all reserved names are tested
    it('has tests for all reserved names', () => {
        // This test ensures we don't miss any reserved names if the list changes
        // dashboard, api, login, logout, admin, qr, q, u, auth, callback, new, edit, analytics, settings
        expect(RESERVED_NAMES).toHaveLength(14);
        // Note: qr, q, u fail length check before reserved name check
    });
});

describe('normalizeAlias', () => {
    it('lowercases uppercase input', () => {
        expect(normalizeAlias('MyAlias')).toBe('myalias');
    });

    it('trims leading whitespace', () => {
        expect(normalizeAlias('  myalias')).toBe('myalias');
    });

    it('trims trailing whitespace', () => {
        expect(normalizeAlias('myalias  ')).toBe('myalias');
    });

    it('trims leading and trailing whitespace', () => {
        expect(normalizeAlias('  myalias  ')).toBe('myalias');
    });

    it('passes through already-lowercase alias', () => {
        expect(normalizeAlias('myalias')).toBe('myalias');
    });

    it('lowercases and trims together', () => {
        expect(normalizeAlias('  MyAlias  ')).toBe('myalias');
    });
});
