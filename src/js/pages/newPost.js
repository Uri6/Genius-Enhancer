/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer-Beta/blob/main/LICENSE.md
 */

export async function handleNewPost(tabId) {
    await chrome.scripting.insertCSS({
        target: { tabId: tabId }, files: ["./src/css/pages/forums/newPost.css"]
    });

    await chrome.scripting.executeScript({
        target: { tabId: tabId }, func: () => {
            chrome.storage.local.get("ModernTextEditor", (res) => {
                if (res.ModernTextEditor) {
                    chrome.runtime.sendMessage({ "forums_modernTextEditor": [true] });
                }
            });
        }
    });
}