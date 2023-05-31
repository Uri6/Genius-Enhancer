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

    quill.on("text-change", function(delta, oldDelta, source) {
        let htmlContent = quill.root.innerHTML
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

        // still working on the while loop below
        // the bug is that it's separating linked lines into two separate elements
        // for now, I solved it only for the case of two lines
        while (
            htmlContent.match(
                /<a [^>]*href="([^"\r\n]+)"[^>]*>(?:(?!<\/a>)[\s\S])+<\/a>\n<a [^>]*href="\1"[^>]*>(?:(?!<\/a>)[\s\S])+<\/a>/g
            )
        ) {
            htmlContent = htmlContent.replace(
                /<a [^>]*href="([^"\r\n]+)"[^>]*>((?:(?!<\/a>)[\s\S])+)<\/a>\n<a [^>]*href="\1"[^>]*>((?:(?!<\/a>)[\s\S])+)<\/a>/g,
                function(match, url, text1, text2) {
                    return (
                        "[" +
                        text1.replace(/<br[^>]*>/g, "\n") +
                        text2.replace(/<br[^>]*>/g, "\n") +
                        "](" +
                        url +
                        ")"
                    );
                }
            );
        }

        htmlContent = htmlContent
            .replace(
                /<a href="([^"\r\n]+)" target="[^"\r\n]+">([^<\r\n]+)<\/a>/g,
                "[$2]($1)"
            )
            .replace(
                /<a href="([^"\r\n]+)"[^<\r\n]+>([^<\r\n]+)<\/a>/g,
                "[$2]($1)"
            );

        textarea.value = htmlContent;

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
 * Removes the Quill rich text editor from the DOM
 *
 * @returns {void}
 */
export function removeQuill() {
    // Remove the Quill toolbar container from the DOM
    if ($(".ql-toolbar-container").length) {
        $(".ql-toolbar-container").remove();
    }

    // Loop through all elements with class "ql-snow" and remove them from the DOM
    while ($(".ql-snow").length) {
        $(".ql-snow").remove();
    }
}
