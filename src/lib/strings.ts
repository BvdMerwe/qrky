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