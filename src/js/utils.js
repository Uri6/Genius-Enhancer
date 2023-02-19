export function containsHebrew(text) {
    return /[א-ת]/.test(text);
}

export function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

export function isSongPageUrl(urlPart) {
    return !urlPart.includes("/") && (urlPart.endsWith("-lyrics") || urlPart.endsWith("-lyrics/") || urlPart.endsWith("-annotated") || urlPart.endsWith("-annotated/") || urlPart.endsWith("?react=1") || urlPart.endsWith("?react=1/") || urlPart.endsWith("?bagon=1") || urlPart.endsWith("?bagon=1/"));
}

export const geniusAddress = ["http://www.genius.com/", "https://www.genius.com/", "http://genius.com/", "https://genius.com/"];
