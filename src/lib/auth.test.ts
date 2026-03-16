import { describe, it, expect } from 'vitest';
import { authIsPasswordValid, authGeneratePasswordFormula } from '@/lib/auth';

describe('authIsPasswordValid', () => {
    it('should return true for valid password with all requirements', () => {
        expect(authIsPasswordValid('Password1!')).toBe(true);
    });

    it('should return true for complex password', () => {
        expect(authIsPasswordValid('MyP@ssw0rd!')).toBe(true);
    });

    it('should return false for password less than 8 characters', () => {
        expect(authIsPasswordValid('Pass1!')).toBe(false);
    });

    it('should return false for password without uppercase', () => {
        expect(authIsPasswordValid('password1!')).toBe(false);
    });

    it('should return false for password without lowercase', () => {
        expect(authIsPasswordValid('PASSWORD1!')).toBe(false);
    });

    it('should return false for password without digit', () => {
        expect(authIsPasswordValid('Password!')).toBe(false);
    });

    it('should return false for password without symbol', () => {
        expect(authIsPasswordValid('Password1')).toBe(false);
    });

    it('should return false for empty password', () => {
        expect(authIsPasswordValid('')).toBe(false);
    });
});

describe('authGeneratePasswordFormula', () => {
    it('should return password requirements string', () => {
        const result = authGeneratePasswordFormula();
        expect(result).toBe('Password should contain at least 8 characters, an uppercase letter and lowercase letter, a number and a symbol.');
    });
});
