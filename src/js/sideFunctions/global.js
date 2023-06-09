/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer-Beta/blob/main/LICENSE.md
 */

/**
 * Checks if the given text contains any non Latin characters
 *
 * @param {string} text - The text to check for non Latin characters
 * @returns {string} - The fixed text
 */
export async function fixNonLatin(text) {
    // Check if the input is an array of strings
    if (Array.isArray(text)) {
        // Map over each string in the array and apply the fixNonLatin function recursively
        return await Promise.all(text.map(async (str) => {
            return await new Promise((resolve) => {
                chrome.runtime.sendMessage({ "fixNonLatin": [str] }, (response) => {
                    resolve(response);
                });
            });
        }));
    }

    const nonLatinRegex = /[\u011E-\u011F\u0130-\u0131\u015E-\u015F\u00C7-\u00E7\u0590-\u05FF\u0400-\u04FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/;

    if (nonLatinRegex.test(text)) {
        if (text.split(" - ").length === 2 && nonLatinRegex.test(text.split(" - ")[1])) {
            const langsParts = text.split(" - ");
            return langsParts[1];
        }
    }

    return text;
}

export function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

/**
 * Extracts metadata from the current page's HTML and returns it as a parsed JSON object
 * Was originally written by @wnull (@wine in Genius.com)
 *
 * @returns The parsed metadata object
 */
export function getDetails() {
    // Find the first occurrence of a '<meta>' tag that contains a JSON string in its 'content' attribute
    const metaElem = document.documentElement.innerHTML.match(
        /<meta content="({[^"]+)/
    );

    // Define an object containing HTML entity codes and their corresponding characters
    const replaces = {
        "&#039;": `'`,
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
    };

    // If the '<meta>' tag was found, extract the JSON string from it and replace any HTML entities with their corresponding characters
    if (metaElem) {
        // Get the JSON string from the first '<meta>' tag, and replace any HTML entities using a callback function
        const meta = metaElem[1].replace(
            /&[\w\d#]{2,5};/g,
            (match) => replaces[match]
        );

        // Parse the JSON string and return the resulting object
        return JSON.parse(meta);
    }
}

/**
 * Identifies the type of page currently open in the browser tab
 *
 * @returns {Promise<string>} A promise that resolves to the page type
 */

export function identifyPageType() {
    // Initialize variables for later use
    let pageType = "unknown";
    let pageObject = {};

    // An array of possible Genius.com URLs
    const geniusAdress = [
        "https://www.genius.com/",
        "https://genius.com/",
    ];

    const urlToPageType = {
        "/forum": "forum (main)",
        "/new": "new post",
        "/discussions/": "forum thread",
    };

    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    func: getDetails,
                },
                function(returnVal) {
                    if (returnVal && returnVal[0].result != null) {
                        pageObject = returnVal[0].result;
                        pageType = pageObject.page_type;
                    }

                    if (
                        !returnVal ||
                        returnVal[0].result == null ||
                        !pageType ||
                        pageType === "unknown"
                    ) {
                        const urlPart = tab.url.split("genius.com/")[1];
                        if (
                            !urlPart.includes("/") &&
                            (urlPart.endsWith("-lyrics") ||
                                urlPart.endsWith("-lyrics/") ||
                                urlPart.endsWith("-annotated") ||
                                urlPart.endsWith("-annotated/") ||
                                urlPart.endsWith("?react=1") ||
                                urlPart.endsWith("?react=1/") ||
                                urlPart.endsWith("?bagon=1") ||
                                urlPart.endsWith("?bagon=1/"))
                        ) {
                            pageType = "song";
                        } else if (
                            geniusAdress.some((adress) => tab.url === adress) ||
                            (urlPart[0] === "#" && !urlPart.includes("/"))
                        ) {
                            pageType = "home";
                        } else if (
                            geniusAdress.some((adress) =>
                                tab.url.startsWith(adress + "firehose")
                            )
                        ) {
                            pageType = "firehose";
                        } else if (
                            geniusAdress.some(
                                (adress) =>
                                    tab.url === adress + "new" ||
                                    tab.url === adress + "new/"
                            )
                        ) {
                            pageType = "new song";
                        }
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tab.id },
                                func: () => {
                                    return (
                                        document.getElementsByClassName(
                                            "group_summary"
                                        ).length > 0
                                    );
                                },
                            },
                            function(isForumPage) {
                                if (isForumPage[0].result) {
                                    // Loop through the keys of the urlToPageType object and check if the URL includes any of them
                                    for (const url of Object.keys(
                                        urlToPageType
                                    )) {
                                        if (tab.url.includes(url)) {
                                            // If yes, set the pageType to the corresponding value in the urlToPageType object
                                            pageType = urlToPageType[url];
                                            break;
                                        }
                                    }

                                    // If the pageType is still "unknown", it has to be a forum page
                                    if (
                                        pageType === "unknown" ||
                                        pageType === undefined
                                    ) {
                                        pageType = "forum";
                                    }
                                }
                                if (pageType !== undefined) {
                                    chrome.storage.local.set({
                                        pageType: pageType,
                                    });
                                }
                                resolve(pageType);
                            }
                        );
                    } else {
                        if (pageType !== undefined) {
                            chrome.storage.local.set({ pageType: pageType });
                        }
                        resolve(pageType);
                    }
                }
            );
        });
    });
}

/**
 * Retrieves the first input element with the name "tag_ids[]" from the HTML content of the Genius New page
 *
 * @returns {HTMLElement} The input element with the name "tag_ids[]"
 */
export async function getTagsList() {
    // Initialize variable for later use
    let tagElem;

    // Fetch the HTML content of the Genius New page
    const response = await fetch("https://genius.com/new");
    const res = await response.text();

    // Parse the HTML content into a DOM object
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(res, "text/html");

    // Find the element with the name "tag_ids[]" and assign it to tagElem
    tagElem = htmlDoc.getElementsByName("tag_ids[]")[0];

    // Return the element
    return tagElem;
}

/**
 * Retrieves a list of artists from the Genius API based on a search query
 *
 * @param {string} query - The search query for artists
 * @returns {Promise<Array>} - A Promise that resolves to an array of unique artists matching the search query
 */
export async function getArtistsList(query) {
    // Encode the search query to include special characters
    const encodedName = encodeURIComponent(query);

    // Construct the URL to call the Genius API search endpoint
    const url = `https://genius.com/api/artists/autocomplete?q=${encodedName}&limit=50`;

    // Call the Genius API search endpoint and get the response as JSON
    const response = await fetch(url);
    const jsonResponse = await response.json();

    // Extract the artists from the response and map them to a new object with just their name and ID
    return jsonResponse.response.artists.map((artist) => ({
        value: artist.name,
        avatar: artist.image_url,
        id: artist.id,
        full_response: artist,
    }));
}

/**
 * Retrieves a list of credits from the Genius API based on a search query
 *
 * @param {string} query - The search query for credits
 * @returns {Promise<Array>} - A Promise that resolves to an array of unique credits matching the search query
 */
export async function getCreditsList(query) {
    // Encode the search query to include special characters
    const encodedName = encodeURIComponent(query);

    // Construct the URL to call the Genius API search endpoint
    const url = `https://genius.com/api/custom_performance_roles/autocomplete?q=${encodedName}&limit=100`;

    // Call the Genius API search endpoint and get the response as JSON
    const response = await fetch(url);
    const jsonResponse = await response.json();

    // Extract the artists from the response and map them to a new object with just their name and ID
    return jsonResponse.response.custom_performance_roles.map((credit) => ({
        value: credit.label,
        id: credit.id,
    }));
}

/**
 * Replaces a textarea with a Quill rich text editor
 *
 * @param {string} textareaClasses - The classes of the textarea to replace
 * @throws {Error} - Throws an error if the textarea could not be found
 * @returns {void}
 */
export function replaceTextarea(textareaClasses) {
    if ($(".ql-editor").length) {
        console.info("Quill already exists");
        return;
    }

    const textarea = document.getElementsByClassName(textareaClasses)[0];
    if (!textarea) {
        throw new Error("could not find textarea");
    }
    let content = textarea.value;
    textarea.style.display = "none";
    const editor = document.createElement("div");
    textarea.parentNode.appendChild(editor);

    const songParts = [
        "Intro",
        "Verse",
        "Chorus",
        "Bridge",
        "Outro"
    ];

    const songPartButtonsContainer = document.createElement("div");
    songPartButtonsContainer.classList = "ql-song-part-buttons-container ge-hidden";
    textarea.parentNode.appendChild(songPartButtonsContainer);

    songParts.map((part) => {
        const button = document.createElement("button");
        button.textContent = part;
        button.classList = "insert-song-part " + part.toLowerCase();
        songPartButtonsContainer.appendChild(button);
    });

    const quill = new Quill(editor, {
        modules: {
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "clean"],
                [{ align: ["justify", "center"] }],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
                ["code-block"],
            ],
            history: {
                delay: 2000,
                maxStack: 500,
                userOnly: true,
            },
        },
        theme: "snow",
        scrollingContainer: "html",
    });

    content = content.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2">$1</a>'
    );
    content = content.replace(/\n/g, "<br>");

    // Add event listeners to the buttons to insert text at the current cursor position
    document.querySelector(".ql-song-part-buttons-container").childNodes.forEach((button) => {
        button.addEventListener("click", function() {
            const cursorPosition = quill.getSelection()?.index || quill.getLength();
            quill.insertText(cursorPosition, "\n\n[" + button.textContent + "]\n");
        });
    });

    // if editing lyrics, it's making the header sticky
    if (textareaClasses !== "required markdown_preview_setup_complete") {
        const toolbar = $(".ql-toolbar");
        const toolbarHeight = toolbar.height();
        const toolbarContainer = $("<div>", { class: "ql-toolbar-container" });
        toolbarContainer.css("height", toolbarHeight + 48);
        $(".eqRvkr").css("z-index", "3");
        $(".hJeJkL").css("z-index", "4");
        $(".fmKONB").css("padding-bottom", "2rem");
        $(toolbar).before(toolbarContainer);
    }

    quill.clipboard.dangerouslyPasteHTML(content);

    quill.on('text-change', function(delta, oldDelta, source) {
        let markdownFormat = quill.root.innerHTML
            .replace(/<strong>/g, "<b>")
            .replace(/<\/strong>/g, "</b>")

            .replace(/<em>/g, "<i>")
            .replace(/<\/em>/g, "</i>")

            .replace(/<br>/g, "\n")

            .replace(/<p><\/p>/g, "")
            .replace(/<p>/g, "")
            .replace(/<\/p>/g, "\n")
            .replace(/\n\n/g, "\n")

            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");

        // Creating a temporary HTMLDocument
        let tempDoc = new DOMParser().parseFromString(markdownFormat, 'text/html');
        let walker = tempDoc.createTreeWalker(tempDoc.body, NodeFilter.SHOW_ELEMENT);
        let node, nextNode, tempNode;

        // Walk through each element node in the document
        while (node = walker.nextNode()) {
            if (node.tagName.toLowerCase() === 'a') {
                nextNode = walker.nextNode();

                // Check if next node is also an <a> element with the same href
                while (nextNode && nextNode.tagName.toLowerCase() === 'a' && node.href === nextNode.href) {
                    // If so, merge the content of these <a> elements
                    node.textContent += '\n' + nextNode.textContent;
                    tempNode = nextNode;
                    nextNode = walker.nextNode();
                    tempNode.previousSibling.remove();
                    tempNode.remove();
                }
            }
        }

        markdownFormat = tempDoc.body.innerHTML
            .replace(/<a href="([^"]*)">([^<]*)<\/a>/g, "[$2]($1)")
            .replace(/<\/b>\n<b>/g, "\n")
            .replace(/<\/i>\n<i>/g, "\n");

        textarea.value = markdownFormat;

        const event = new Event("input", {
            bubbles: true,
            cancelable: true,
        });
        textarea.dispatchEvent(event);
    });

    if (textareaClasses === "required markdown_preview_setup_complete") {
        window.scrollTo(0, 0);
    }
}

/**
 * Uploads an image to Genius using Filestack APIs.
 *
 * This function performs the following steps:
 * 1. Retrieves metadata for the specified image from the Filestack metadata API.
 * 2. Sends a request to the Filestack process API to store the image.
 * 3. Constructs the final URL of the uploaded image.
 *
 * @param {string} imageUrl The URL of the image to upload.
 * @returns {Promise<string>} A promise that resolves to the URL of the uploaded image.
 * @throws {Error} If any network error occurs or if any of the APIs return an error response.
 */
export async function uploadImageToGenius(imageUrl) {
    const geniusSecrets = {
        api: "Ar03MDs73TQm241ZgLwfjz",
        policy: "eyJleHBpcnkiOjIzNTEwOTE1NTgsImNhbGwiOlsicGljayIsInJlYWQiLCJzdG9yZSIsInN0YXQiLCJjb252ZXJ0Il19",
        signature: "68597b455e6c09bce0bfd73f758e299c95d49a5d5c8e808aaf4877da7801c4da"
    };

    try {
        let metadata = await fetch("https://cloud.filestackapi.com/metadata", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                apikey: geniusSecrets.api,
                url: imageUrl,
                policy: geniusSecrets.policy,
                signature: geniusSecrets.signature
            })
        }).then(res => {
            if (!res.ok) {
                throw new Error("Failed to fetch metadata");
            }
            return res.json();
        });

        const key = await fetch("https://process.filestackapi.com/process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                apikey: geniusSecrets.api,
                sources: [metadata.link_path],
                tasks: [{
                    name: "store"
                }, {
                    name: "security",
                    params: {
                        policy: geniusSecrets.policy,
                        signature: geniusSecrets.signature
                    }
                }]
            })
        }).then(res => {
            if (!res.ok) {
                throw new Error("Failed to process the image");
            }
            return res.json();
        }).then(res => res.key);

        const coverArtUrl = `https://filepicker-images-rapgenius.s3.amazonaws.com/${key}`;

        return coverArtUrl;
    } catch (error) {
        // Rethrow the error to be handled by the calling code
        throw error;
    }
};