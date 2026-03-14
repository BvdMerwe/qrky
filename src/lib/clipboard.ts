export async function copyToClipboard(content: string): Promise<boolean> {
    await navigator.clipboard.writeText(content);

    return true;
}