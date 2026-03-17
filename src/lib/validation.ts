export const RESERVED_NAMES = [
    'dashboard', 'api', 'login', 'logout', 'admin', 'qr', 'q', 'u',
    'auth', 'callback', 'new', 'edit', 'analytics', 'settings'
];

export const ALIAS_REGEX = /^[a-z0-9-]+$/;

export function validateAlias(alias: string): void {
    const normalizedAlias = alias.toLowerCase().trim();

    if (normalizedAlias.length < 3 || normalizedAlias.length > 50) {
        throw new Error("Alias must be between 3 and 50 characters");
    }

    if (!ALIAS_REGEX.test(normalizedAlias)) {
        throw new Error("Alias can only contain letters, numbers, and hyphens");
    }

    if (RESERVED_NAMES.includes(normalizedAlias)) {
        throw new Error(`"${normalizedAlias}" is a reserved name and cannot be used as an alias`);
    }
}

export function normalizeAlias(alias: string): string {
    return alias.toLowerCase().trim();
}
