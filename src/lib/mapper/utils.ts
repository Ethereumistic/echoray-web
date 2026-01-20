/**
 * Utility functions for the Mapper app
 */

/**
 * Removes protocol and www prefix from a URL
 * @param url - The URL to clean
 * @returns Clean URL without protocol or www
 * 
 * @example
 * stripProtocol("https://www.example.com") // "example.com"
 * stripProtocol("http://example.com") // "example.com"
 * stripProtocol("www.example.com") // "example.com"
 * stripProtocol("example.com") // "example.com"
 */
export function stripProtocol(url: string): string {
    if (!url) return '';

    return url
        .replace(/^https?:\/\//i, '') // Remove http:// or https://
        .replace(/^www\./i, '');       // Remove www.
}

/**
 * Adds https:// protocol to a URL if it doesn't have one
 * @param url - The URL to add protocol to
 * @returns URL with https:// protocol
 * 
 * @example
 * addProtocol("example.com") // "https://example.com"
 * addProtocol("https://example.com") // "https://example.com"
 * addProtocol("") // ""
 */
export function addProtocol(url: string): string {
    if (!url) return '';

    // Already has protocol
    if (url.match(/^https?:\/\//i)) {
        return url;
    }

    // Add https://
    return `https://${url}`;
}

/**
 * Validates if a string is a valid URL format
 * @param url - The URL to validate
 * @returns True if valid URL format
 * 
 * @example
 * isValidUrl("example.com") // true
 * isValidUrl("www.example.com") // true
 * isValidUrl("https://example.com/path") // true
 * isValidUrl("not a url") // false
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;

    // Simple URL pattern - must have at least a domain with a dot
    const urlPattern = /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?$/;
    return urlPattern.test(url);
}
