export const RESERVED_NAMES = [
    'dashboard',
    'api',
    'login',
    'logout',
    'admin',
    'qr',
    'q',
    'u',
    'auth',
    'callback',
    'new',
    'edit',
    'analytics',
    'settings',
];

export const ALIAS_REGEX = /^[a-z0-9-]+$/;
const ALIAS_LENGTH_MIN = 3;
const ALIAS_LENGTH_MAX = 50;

export function validateAlias(alias: string): void {
    const normalizedAlias = alias.toLowerCase().trim();

    if (
        normalizedAlias.length < ALIAS_LENGTH_MIN ||
        normalizedAlias.length > ALIAS_LENGTH_MAX
    ) {
        throw new Error(
            `Alias must be between ${ALIAS_LENGTH_MIN} and ${ALIAS_LENGTH_MAX} characters`,
        );
    }

    if (!ALIAS_REGEX.test(normalizedAlias)) {
        throw new Error('Alias can only contain letters, numbers, and hyphens');
    }

    if (RESERVED_NAMES.includes(normalizedAlias)) {
        throw new Error(
            `"${normalizedAlias}" is a reserved name and cannot be used as an alias`,
        );
    }
}

export function normalizeAlias(alias: string): string {
    return alias.toLowerCase().trim();
}
