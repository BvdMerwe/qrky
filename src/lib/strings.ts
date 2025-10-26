export function stringIsValid(data: unknown): data is string {
    if (typeof data !== 'string') {
        return false;
    } else if (data === '') {
        return false;
    } else {
        return true;
    }
}