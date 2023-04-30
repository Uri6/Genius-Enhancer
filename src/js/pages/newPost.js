export async function handleNewPost(tabId) {
    await chrome.scripting.insertCSS({
        target: { tabId: tabId }, files: ["./src/css/forumsPages/newPost.css"]
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
