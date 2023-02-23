/*
* This code is licensed under the terms of the "LICENSE.md" file
* located in the root directory of this code package.
*/

export function containsHebrew(text) {
    return /[א-ת]/.test(text);
}

export function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

// This function written by @wnull (@wine in Genius.com)
export function getDeatils() {
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
        let dataObject = JSON.parse(meta);
        return dataObject;
    }
}

export function identifyPageType() {
    console.log("identifyPageType");
    let pageType = "unknown";
    let pageObject = {};
    const geniusAdress = ["http://www.genius.com/", "https://www.genius.com/", "http://genius.com/", "https://genius.com/"];
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    func: getDeatils
                },
                function (returnVal) {
                    if (returnVal != undefined && returnVal[0].result != null) {
                        pageObject = returnVal[0].result;
                        pageType = pageObject.page_type;
                    }

                    if (returnVal == undefined || returnVal[0].result == null || pageType == undefined || pageType == "unknown") {
                        var urlPart = tab.url.split("genius.com/")[1];
                        if (!urlPart.includes("/") && (urlPart.endsWith("-lyrics") || urlPart.endsWith("-lyrics/") || urlPart.endsWith("-annotated") || urlPart.endsWith("-annotated/") || urlPart.endsWith("?react=1") || urlPart.endsWith("?react=1/") || urlPart.endsWith("?bagon=1") || urlPart.endsWith("?bagon=1/"))) {
                            pageType = "song";
                        }
                        else if (geniusAdress.some((adress) => tab.url == adress) || (urlPart[0] == "#" && !urlPart.includes("/"))) {
                            pageType = "home";
                        }
                        else if (geniusAdress.some((adress) => tab.url.startsWith(adress + "firehose"))) {
                            pageType = "firehose";
                        }
                        else if (geniusAdress.some((adress) => tab.url == adress + "new" || tab.url == adress + "new/")) {
                            pageType = "new song";
                        }
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tab.id },
                                func: () => {
                                    return document.getElementsByClassName("group_summary").length > 0;
                                }
                            },
                            function (isForumPage) {
                                if (isForumPage[0].result) {
                                    if (tab.url.endsWith("/forum")) {
                                        pageType = "forum (main)";
                                    }
                                    else if (tab.url.endsWith("/new")) {
                                        pageType = "new post";
                                    }
                                    else if (tab.url.includes("/discussions/")) {
                                        pageType = "forum thread";
                                    }
                                    else {
                                        pageType = "forum";
                                    }
                                }
                                if (pageType != undefined) {
                                    chrome.storage.local.set({ "pageType": pageType });
                                    console.log("pageType: " + pageType);
                                }
                                resolve();
                            }
                        );
                    }

                    else {
                        if (pageType != undefined) {
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
            var parser = new DOMParser();
            var htmlDoc = parser.parseFromString(res, 'text/html');
            tagElem = htmlDoc.getElementsByName("tag_ids[]")[0];
        });

    return tagElem;
}

export function replaceTextarea(textareaClasses) {

    if ($(".ql-editor").length) {
        console.info("Quill already exists");
        return;
    }

    var textarea = document.getElementsByClassName(textareaClasses)[0];
    console.log("textarea: ", textarea);
    var content = textarea.value;
    textarea.style.display = "none";
    var editor = document.createElement('div');
    textarea.parentNode.appendChild(editor);
    var quill = new Quill(editor, {
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'clean'],
                [{ 'align': ['justify', 'center'] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['code-block']
            ],
            history: {
                delay: 2000,
                maxStack: 500,
                userOnly: true
            }
        },
        theme: 'snow'
    });

    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    content = content.replace(/\n/g, '<br>');

    // if editing lyrics, it's making the header sticky
    if (textareaClasses != "required markdown_preview_setup_complete") {
        var toolbar = $(".ql-toolbar");
        var toolbarHeight = toolbar.height();
        var toolbarContainer = $("<div>", { class: "ql-toolbar-container" });
        toolbarContainer.css("height", toolbarHeight + 48);
        $(".eqRvkr").css("z-index", "3")
        $(".hJeJkL").css("z-index", "4")
        $(".fmKONB").css("padding-bottom", "2rem")
        $(toolbar).before(toolbarContainer);
    }

    quill.clipboard.dangerouslyPasteHTML(content);

    quill.on('text-change', function (delta, oldDelta, source) {
        var htmlContent = quill.root.innerHTML;
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

        var event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });
        textarea.dispatchEvent(event);
    });

    if (textareaClasses == "required markdown_preview_setup_complete") {
        window.scrollTo(0, 0);
    }
}

export function removeQuill() {
    $(".ql-toolbar-container").remove();
    while ($(".ql-snow").length) {
        $(".ql-snow").remove();
    }
}