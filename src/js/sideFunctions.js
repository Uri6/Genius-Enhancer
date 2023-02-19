/*
* This code is licensed under the terms of the "LICENSE.md" file
* located in the root directory of this code package.
*/

import { geniusAddress, isSongPageUrl } from "./utils";

export function getDetails() {
    let matches = document.documentElement.innerHTML.match(/<meta content="({[^"]+)/);
    let replaces = {
        '&#039;': `'`,
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"'
    };

    if (matches) {
        let meta = matches[1].replace(/&[\w\d#]{2,5};/g, match => replaces[match]);
        // full metadata album & another data
        return JSON.parse(meta);
    }
}

export function identifyPageType() {
    console.log("identifyPageType");
    let pageType = "unknown";
    let pageObject = {};
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    func: getDetails
                },
                function (returnVal) {
                    if (returnVal !== undefined && returnVal[0].result != null) {
                        pageObject = returnVal[0].result;
                        pageType = pageObject.page_type;
                    }

                    if (returnVal === undefined || returnVal[0].result == null || pageType === undefined || pageType === "unknown") {
                        const urlPart = tab.url.split("genius.com/")[1];
                        if (isSongPageUrl(urlPart)) {
                            pageType = "song";
                        } else if (geniusAddress.some((address) => tab.url === address) || (urlPart[0] === "#" && !urlPart.includes("/"))) {
                            pageType = "home";
                        } else if (geniusAddress.some((address) => tab.url.startsWith(address + "firehose"))) {
                            pageType = "firehose";
                        } else if (geniusAddress.some((address) => tab.url === address + "new" || tab.url === address + "new/")) {
                            pageType = "new song";
                        }
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tab.id },
                                func: () => (
                                    document.getElementsByClassName("group_summary").length > 0
                                )
                            },
                            function (isForumPage) {
                                if (isForumPage[0].result) {
                                    if (tab.url.endsWith("/forum")) {
                                        pageType = "forum (main)";
                                    } else if (tab.url.endsWith("/new")) {
                                        pageType = "new post";
                                    } else if (tab.url.includes("/discussions/")) {
                                        pageType = "forum thread";
                                    } else {
                                        pageType = "forum";
                                    }
                                }
                                if (pageType !== undefined) {
                                    chrome.storage.local.set({ "pageType": pageType });
                                    console.log("pageType: " + pageType);
                                }
                                resolve();
                            }
                        );
                    } else {
                        if (pageType !== undefined) {
                            chrome.storage.local.set({ "pageType": pageType });
                            console.log("pageType: " + pageType);
                        }
                        resolve();
                    }
                }
            );
        });
    });
}

export async function getTagsList() {
    let tagElem;

    await fetch("https://genius.com/new")
        .then(function (response) { return response.text() })
        .then((res) => {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(res, "text/html");
            tagElem = htmlDoc.getElementsByName("tag_ids[]")[0];
        });

    return tagElem;
}

export function replaceTextarea(textareaClasses) {
    if ($(".ql-editor").length) {
        console.info("Quill already exists");
        return;
    }

    const textarea = document.getElementsByClassName(textareaClasses)[0];
    console.log("textarea: ", textarea);
    let content = textarea.value;
    textarea.style.display = "none";
    const editor = document.createElement("div");
    textarea.parentNode.appendChild(editor);
    const quill = new Quill(editor, {
        modules: {
            toolbar: [
                [{ "header": [1, 2, 3, false] }],
                ["bold", "italic", "clean"],
                [{ "align": ["justify", "center"] }],
                [{ "list": "ordered" }, { "list": "bullet" }],
                ["link", "image"],
                ["code-block"]
            ],
            history: {
                delay: 2000,
                maxStack: 500,
                userOnly: true
            }
        },
        theme: "snow"
    });

    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    content = content.replace(/\n/g, '<br>');

    // if editing lyrics, it's making the header sticky
    if (textareaClasses !== "required markdown_preview_setup_complete") {
        const toolbar = $(".ql-toolbar");
        const toolbarHeight = toolbar.height();
        const toolbarContainer = $("<div>", { class: "ql-toolbar-container" });
        toolbarContainer.css("height", toolbarHeight + 48);
        $(".eqRvkr").css("z-index", "3")
        $(".hJeJkL").css("z-index", "4")
        $(".fmKONB").css("padding-bottom", "2rem")
        $(toolbar).before(toolbarContainer);
    }

    quill.clipboard.dangerouslyPasteHTML(content);

    quill.on('text-change', function (delta, oldDelta, source) {
        let htmlContent = quill.root.innerHTML;
        htmlContent = htmlContent.replace(/<strong>/g, '<b>').replace(/<\/strong>/g, '</b>');
        htmlContent = htmlContent.replace(/<em>/g, '<i>').replace(/<\/em>/g, '</i>');
        htmlContent = htmlContent.replace(/<br>/g, '\n').replace(/<p><\/p>/g, '').replace(/<p>/g, '').replace(/<\/p>/g, '\n').replace(/\n\n/g, '\n');
        htmlContent = htmlContent.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        // still working on the while loop below
        while (htmlContent.match(/<a [^>]*href="([^"\r\n]+)"[^>]*>(?:(?!<\/a>)[\s\S])+<\/a>\n<a [^>]*href="\1"[^>]*>(?:(?!<\/a>)[\s\S])+<\/a>/g)) {
            htmlContent = htmlContent.replace(/<a [^>]*href="([^"\r\n]+)"[^>]*>((?:(?!<\/a>)[\s\S])+)<\/a>\n<a [^>]*href="\1"[^>]*>((?:(?!<\/a>)[\s\S])+)<\/a>/g, function (match, url, text1, text2) {
                return '[' + text1.replace(/<br[^>]*>/g, '\n') + '\n' + text2.replace(/<br[^>]*>/g, '\n') + '](' + url + ')';
            });
        }
        htmlContent = htmlContent.replace(/<a href="([^"\r\n]+)" target="[^"\r\n]+">([^<\r\n]+)<\/a>/g, '[$2]($1)').replace(/<a href="([^"\r\n]+)"[^<\r\n]+>([^<\r\n]+)<\/a>/g, '[$2]($1)');

        textarea.value = htmlContent;

        const event = new Event("input", {
            bubbles: true,
            cancelable: true
        });
        textarea.dispatchEvent(event);
    });
}

export function removeQuill() {
    $(".ql-toolbar-container").remove();
    while ($(".ql-snow").length) {
        $(".ql-snow").remove();
    }
}
