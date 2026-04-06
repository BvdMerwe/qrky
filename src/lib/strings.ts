export function stringIsValid(data: unknown): data is string {
    if (typeof data !== 'string') {
        return false;
    } else if (data === '') {
        return false;
    } else {
        return true;
    }
}

export function stringIsValidUrl(data: unknown, isSecure = true): data is string {
    if (stringIsValid(data)) {
        const urlRegex = new RegExp(`^http${isSecure ? "s" : ""}:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\\s]*)?$`);

        return urlRegex.test(data);
    } else {
        return false;
    }
}

export async function hashString(data: string, length = 12, algorithm = 'SHA-1') {
    const enc = new TextEncoder().encode(data);
    const hashBuf = await crypto.subtle.digest(algorithm, enc);
    const hashArray = Array.from(new Uint8Array(hashBuf));
    const hex = hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
    return hex.slice(0, length); // e.g. "a1b2c3d4"
}