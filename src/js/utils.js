export function containsHebrew(text) {
    return /[א-ת]/.test(text);
}

export function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}
