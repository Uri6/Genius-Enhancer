/*
* This code is licensed under the terms of the "LICENSE.md" file
* located in the root directory of this code package.
*/

import { getDetails, identifyPageType, replaceTextarea, removeQuill } from "./sideFunctions.js";
import { missingInfo, removeMissingInfo, restyleMissingInfo, autolinkArtwork, saveEverything } from "./sideFunctions_album.js";
import { appleMusicPopUp, spotifyPopUp, song_modernTextEditor, appendReplyButton } from "./sideFunctions_song.js";
import { replaceButtons, forums_modernTextEditor } from "./sideFunctions_forum.js";
import { handlePageType } from "./pageType";
import contentStyle from "../css/content-style.scss";
import dragsortStyle from "../../lib/dragsort/dragsort.css";

function getTabId() {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({
                active: true,
            }, function (tabs) {
                resolve(tabs[0].id);
            })
        } catch (e) {
            reject(e);
        }
    })
}

chrome.runtime.onInstalled.addListener((details) => {
    // const currentVersion = chrome.runtime.getManifest().version;
    // const previousVersion = details.previousVersion;
    const reason = details.reason;

    switch (reason) {
        case 'install':
            chrome.storage.local.set({ "bios": true });
            chrome.storage.local.set({ "people": true });
            chrome.storage.local.set({ "releaseDate": true });
            chrome.storage.local.set({ "appleMusicPopUp": true });
            chrome.storage.local.set({ "spotifyPopUp": true });
            chrome.storage.local.set({ "add_song_as_next": true });
            chrome.storage.local.set({ "ModernTextEditor": true });
            chrome.storage.local.set({ "OldSongPage": false });
            break;
        case 'update':
            // ar newURL = "https://uri6.github.io/genius-bot/versions/";
            // chrome.tabs.create({ url: newURL });
            break;
        case 'chrome_update':
        case 'shared_module_update':
        default:
            break;
    }
});

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    const tabId = await getTabId();
    let func, args;

    switch (true) {
        case "identifyPageType" in message:
            func = identifyPageType;
            break;
        case "replaceTextarea" in message:
            func = replaceTextarea;
            args = message.replaceTextarea;
            break;
        case "removeQuill" in message:
            func = removeQuill;
            break;
        case "album_missingInfo" in message:
            func = missingInfo;
            args = message.album_missingInfo;
            break;
        case "album_missingInfo_remove" in message:
            func = removeMissingInfo;
            args = message.album_missingInfo_remove;
            break;
        case "album_missingInfo_restyle" in message:
            func = restyleMissingInfo;
            break;
        case "album_autolinkArtwork" in message:
            func = autolinkArtwork;
            break;
        case "album_saveEverything" in message:
            func = saveEverything;
            args = message.album_saveEverything;
            break;
        case "song_appleMusicPopUp" in message:
            func = appleMusicPopUp;
            args = message.song_appleMusicPopUp;
            break;
        case "song_spotifyPopUp" in message:
            func = spotifyPopUp;
            args = message.song_spotifyPopUp;
            break;
        case "song_modernTextEditor" in message:
            func = song_modernTextEditor;
            args = message.song_modernTextEditor;
            console.log("song_modernTextEditor message received");
            break;
        case "song_appendReplyButton" in message:
            func = appendReplyButton;
            args = message.song_appendReplyButton;
            break;
        case "forums_replaceButtons" in message:
            func = replaceButtons;
            args = message.forums_replaceButtons;
            break;
        case "forums_modernTextEditor" in message:
            func = forums_modernTextEditor;
            args = message.forums_modernTextEditor;
            break;
        default:
            return;
    }

    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: func,
        args: args
    }, (results) => {
        if (func === identifyPageType) {
            sendResponse(results[0].result);
        }
    });
});

let pageType = "unknown";
let isGeniusPage = false;
let pageObject = {};
let url = "";
const geniusAddress = ["http://www.genius.com/", "https://www.genius.com/", "http://genius.com/", "https://genius.com/"];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    isGeniusPage = geniusAddress.some((adress) => tab.url.startsWith(adress));
    chrome.storage.local.set({ "isGeniusPage": isGeniusPage });
    url = tab.url;

    console.info("----------------------------------------");
    console.info("%c new tab loaded ", "background-color: #fffe65; color: #000; padding: 5px; text-align: center; font-size: 15px; font-weight: bold; display: block; border-radius: 5px;");
    console.info("tab id: " + tabId);
    console.info("changeInfo: " + changeInfo.status);
    console.info("tab: " + tab.title + ", " + tab.url);
    console.info("isGeniusPage: " + isGeniusPage);

    chrome.storage.local.set({ "album_artwork_results": "" });
    pageType = "unknown";

    if (tab.url.startsWith("https://promote.genius.com/") || tab.url.startsWith("http://promote.genius.com/") || tab.url.startsWith("https://support.genius.com/") || tab.url.startsWith("http://support.genius.com/")) {
        return;
    }

    if (changeInfo.status === 'complete' && tab.url.includes("genius.com")) {
        const files = [
            { type: "css", css: contentStyle },
            { type: "css", file: "./lib/bootstarp/bootstarp.min.css" },
            { type: "css", file: "./lib/tagify/tagify.css" },
            { type: "css", css: dragsortStyle },
            { type: "css", file: "./lib/quilljs/quill.snow.css" },
            { type: "js", file: "./lib/jquery/jquery.min.js" },
            { type: "js", file: "./lib/jquery/jquery-ui.js" },
            { type: "js", file: "./lib/bootstarp/bootstarp.min.js" },
            { type: "js", file: "./lib/tagify/tagify.polyfills.min.js" },
            { type: "js", file: "./lib/dragsort/dragsort.js" },
            { type: "js", file: "./lib/quilljs/quill.min.js" },
            { type: "js", file: "./lib/oauth/oauth.min.js" }
        ];

        const cssFiles = files
            .filter(f => f.type === "css")
            .map(f => f.file ? f.file : f.css);

        const jsFiles = files
            .filter(f => f.type === "js")
            .map(f => f.file);

        if (cssFiles.length > 0) {
            chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: cssFiles
            });
        }

        if (jsFiles.length > 0) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: jsFiles
            });
        }

        if (isGeniusPage) {
            new Promise((resolve, reject) => {
                chrome.tabs.query({ active: true, currentWindow: true }, () => {
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: tabId },
                            func: getDetails
                        },
                        function (returnVal) {
                            if (returnVal !== undefined && returnVal[0].result != null) {
                                pageObject = returnVal[0].result;
                                pageType = pageObject.page_type;
                            }

                            if (returnVal === undefined || returnVal[0].result == null || pageType === undefined || pageType === "unknown") {
                                const urlPart = tab.url.split("genius.com/")[1];
                                if (!urlPart.includes("/") && (urlPart.endsWith("-lyrics") || urlPart.endsWith("-lyrics/") || urlPart.endsWith("-annotated") || urlPart.endsWith("-annotated/") || urlPart.endsWith("?react=1") || urlPart.endsWith("?react=1/") || urlPart.endsWith("?bagon=1") || urlPart.endsWith("?bagon=1/"))) {
                                    pageType = "song";

                                    chrome.storage.local.get("OldSongPage", (res) => {
                                        if (res.OldSongPage) {
                                            let currentUrl = tab.url;
                                            if (currentUrl.indexOf("?bagon=1") === -1 && currentUrl.indexOf("?react=1") === -1) {
                                                currentUrl += "?bagon=1";
                                                chrome.tabs.update(tabId, { url: currentUrl });
                                            }
                                        } else if (res.OldSongPage === undefined) {
                                            console.error("OldSongPage is undefined\nPlease report this error here: https://uri6.github.io/genius-enhancer/report-and-suggest/");
                                        }
                                    });
                                } else if (geniusAddress.some((adress) => tab.url === adress) || (urlPart[0] === "#" && !urlPart.includes("/"))) {
                                    pageType = "home";
                                } else if (geniusAddress.some((adress) => tab.url.startsWith(adress + "firehose"))) {
                                    pageType = "firehose";
                                } else if (geniusAddress.some((adress) => tab.url === adress + "new" || tab.url === adress + "new/")) {
                                    pageType = "new song";
                                }
                                chrome.scripting.executeScript(
                                    {
                                        target: { tabId: tabId },
                                        func: () => {
                                            return document.getElementsByClassName("group_summary").length > 0;
                                        }
                                    },
                                    function(isForumPage) {
                                        if (isForumPage[0].result) {
                                            if (tab.url.endsWith("/forums")) {
                                                pageType = "forums (main)";
                                            } else if (tab.url.endsWith("/new")) {
                                                pageType = "new post";
                                            } else if (tab.url.includes("/discussions/")) {
                                                pageType = "forum thread";
                                            } else {
                                                pageType = "forum";
                                            }
                                        }
                                        resolve();
                                    }
                                );
                            } else {
                                resolve();
                            }
                        }
                    )
                })
            }).then(() => {
                if (pageType !== undefined) {
                    chrome.storage.local.set({ "pageType": pageType });
                }

                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabId },
                        func: (() => {
                            // move the div with the classes "PageHeaderdesktop__Subnavigation-bhx5ui-6 koeYQd"
                            // (or the element with the class "header-nav_menu" if there's no element with the classes above)
                            // to after the element with the classes "PageHeaderLogo__Link-sc-175tsd3-0 jNXEyt"
                            // (or to after the element with the class "logo_container" if there's no element with the classes above)
                            let subNav = $(".PageHeaderdesktop__Subnavigation-bhx5ui-6.koeYQd");
                            if (subNav.length === 0) {
                                subNav = $(".header-nav_menu");
                            }
                            let logo = $(".PageHeaderLogo__Link-sc-175tsd3-0.jNXEyt");
                            if (logo.length === 0) {
                                logo = $(".logo_container");
                            }
                            subNav.insertAfter(logo);

                            // if there's an element with the class "lyrics_controls", when it sticky add the class "sticky" to this element
                            // make sure that the class "sticky" is removed when the element is not sticky
                            const lyricsControls = $(".lyrics_controls");
                            if (lyricsControls.length > 0) {
                                const sticky = lyricsControls.offset().top;
                                $(window).scroll(function () {
                                    if ($(window).scrollTop() > sticky) {
                                        lyricsControls.addClass("sticky");
                                    }
                                    else {
                                        lyricsControls.removeClass("sticky");
                                    }
                                });
                            }

                            // clean the search bar from the "Search" text when not focused
                            // the search bar is the element with the classes "PageHeaderSearchdesktop__Input-eom9vk-2 gajVFV" or "quick_search search quick_search--header"
                            let searchBar = $(".PageHeaderSearchdesktop__Input-eom9vk-2.gajVFV");
                            if (searchBar.length === 0) {
                                searchBar = $(".quick_search.search.quick_search--header");
                            }
                            searchBar.blur(function () {
                                searchBar.val("");
                            });

                            // there's three elements with the class "PageHeaderdesktop__Link-bhx5ui-4 jQULAr"
                            // if the element have the href "/#featured-stories" is clicked, scroll to the "HomeContentdesktop__Section-sc-1xfg7l1-4 bBDcg" element
                            // if the element have the href "/#top-songs" is clicked, scroll to the "HomeContentdesktop__CenteredFlexColumn-sc-1xfg7l1-1 btjJtO" element
                            // if the element have the href "/#videos" is clicked, scroll to the "HomeContentdesktop__Section-sc-1xfg7l1-4 gveVlf" element
                            function scrollToElement(element) {
                                const elementOffset = element.offset().top;
                                $("html, body").animate({ scrollTop: elementOffset }, 500);
                            }

                            const elementsToScroll = {
                                "/#top-songs": $(".HomeContentdesktop__Section-sc-1xfg7l1-4.bBDcg"),
                                "/#featured-stories": $(".PageGriddesktop-a6v82w-0.csQZGy"),
                                "/#videos": $(".HomeContentdesktop__Section-sc-1xfg7l1-4.gveVlf")
                            }

                            $(document).on("click", ".PageHeaderdesktop__Link-bhx5ui-4.jQULAr", function (e) {
                                const href = $(this).attr("href");
                                if (href in elementsToScroll) {
                                    e.preventDefault();
                                    scrollToElement(elementsToScroll[href]);
                                }
                            });

                            // if an element with the classes "AnnotationPortaldesktop__Sticky-sc-17hre1n-2 daeaLL" added, remove the class "daeaLL" from it
                            $(document).on("DOMNodeInserted", function (e) {
                                /* replace the elememt
                                    <div ng-if="focused" ng-click="unfocus()" stop-propagation="click" class="global_search-submit_button global_search-submit_button--focused ng-scope">
                                        <svg src="x.svg" class="global_search-search_icon global_search-search_icon--close inline_icon inline_icon--down_4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39"></path></svg>
                                    </div>
                                   with
                                    <div ng-if="!focused" ng-click="focus()" stop-propagation="click" class="global_search-submit_button ng-scope">
                                        <svg src="magnifying_glass.svg" class="global_search-search_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.48 21.59"><path d="M21.48 20.18L14.8 13.5a8.38 8.38 0 1 0-1.43 1.4l6.69 6.69zM2 8.31a6.32 6.32 0 1 1 6.32 6.32A6.32 6.32 0 0 1 2 8.31z"></path></svg>
                                    </div>
                                    make sure to replace only the inner path and check only him on the condition
                                */

                                if (e.target.parentElement.classList.contains("global_search-search_icon") && e.target.tagName === "path" && e.target.getAttribute("d") === "M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39") {
                                    e.target.setAttribute("d", "M21.48 20.18L14.8 13.5a8.38 8.38 0 1 0-1.43 1.4l6.69 6.69zM2 8.31a6.32 6.32 0 1 1 6.32 6.32A6.32 6.32 0 0 1 2 8.31z");
                                    e.target.parentElement.setAttribute("class", "global_search-search_icon");
                                }

                                setTimeout(() => {
                                    if ($(e.target).attr("class") === "modal_window" && $(e.target).find(".modal_window-content").length > 0 && ($(e.target).find(".modal_window-content").find("conversation-with-user").length > 0 || $(e.target).find(".modal_window-content").find("conversation-messages").length > 0)) {

                                        $("body").removeClass("u-noscroll u-dark_overlay");
                                        $(e.target).css("pointer-events", "none");
                                        $(e.target).find(".modal_window-content").css("pointer-events", "auto");

                                        if ($(".modal_window").length > 1) {
                                            $(".modal_window").first().remove();
                                        }

                                        const oldCloseButton = $(e.target).find(".modal_window-close_button");
                                        if (oldCloseButton.length > 0) {
                                            $(oldCloseButton).css("display", "none");
                                        }

                                        const closeButton = document.createElement('img');
                                        closeButton.className = "modal_window-close_button";
                                        closeButton.src = chrome.runtime.getURL("/src/images/other/closeIcon.png");
                                        closeButton.setAttribute("onmouseover", "this.src=\'" + chrome.runtime.getURL("/src/images/other/closeIconX.png") + "\'");
                                        closeButton.setAttribute("onmouseout", "this.src=\'" + chrome.runtime.getURL("/src/images/other/closeIcon.png") + "\'");
                                        closeButton.setAttribute("title", "Esc");

                                        closeButton.addEventListener("click", () => {
                                            oldCloseButton.click();
                                        });

                                        $(e.target).find(".modal_window-content").prepend(closeButton);

                                        // make the ".modal_window-content" element movable (with the mouse)
                                        $(e.target).find(".modal_window-content").draggable({
                                            handle: ".modal_window-header",
                                            containment: "window",
                                            scroll: false
                                        });
                                    }
                                }, 1);
                            });
                        })
                    }
                );
                console.log("page type: " + pageType);

                if (!(pageType == null || pageType === "unknown")) {
                    handlePageType(pageType);
                }
            })
        }
    }
})
