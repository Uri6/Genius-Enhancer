/*
 * This code is licensed under the terms of the "LICENSE.md" file
 * located in the root directory of this code package.
 */

import {
    getDetails,
    identifyPageType,
    replaceTextarea,
    removeQuill,
} from "./src/js/sideFunctions.js";
import {
    missingInfo,
    removeMissingInfo,
    restyleMissingInfo,
    appendIcon,
    autolinkArtwork,
    getPlaylistVideos,
    saveEverything,
    addSongAsTheNext,
} from "./src/js/sideFunctions_album.js";
import {
    appleMusicPopUp,
    spotifyPopUp,
    song_modernTextEditor,
    appendReplyButton,
} from "./src/js/sideFunctions_song.js";
import {
    replaceButtons,
    forums_modernTextEditor,
} from "./src/js/sideFunctions_forum.js";

function getTabId() {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query(
                {
                    active: true,
                },
                function (tabs) {
                    resolve(tabs[0].id);
                }
            );
        } catch (e) {
            reject(e);
        }
    });
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
        case 'update':
            // var newURL = "https://uri6.github.io/genius-bot/versions/";
            // chrome.tabs.create({ url: newURL });
            // break;
            break;
    }
});

chrome.runtime.onMessage.addListener(async function (
    message,
    sender,
    sendResponse
) {
    const tabId = await getTabId();
    let func, args;

    switch (true) {
        case "getDetails" in message:
            func = getDetails;
            break;
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
        case "album_getPlaylistVideos" in message:
            func = getPlaylistVideos;
            args = message.album_getPlaylistVideos;
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

    let res = new Promise((resolve) => {
        chrome.scripting
            .executeScript({
                target: { tabId: tabId },
                func: func,
                args: args,
            })
            .then((results) => {
                if (
                    func === identifyPageType ||
                    func === getPlaylistVideos ||
                    func === getDetails
                ) {
                    resolve(results[0].result);
                }

                resolve();
            });
    });

    sendResponse(res);
});

let pageType = "unknown";
let isGeniusPage = false;
let pageObject = {};
let url = "";
const geniusAddress = [
    "http://www.genius.com/",
    "https://www.genius.com/",
    "http://genius.com/",
    "https://genius.com/",
];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    isGeniusPage = geniusAddress.some((adress) => tab.url.startsWith(adress));
    chrome.storage.local.set({ "isGeniusPage": isGeniusPage });
    url = tab.url;

    console.info("----------------------------------------");
    console.info(
        "%c new tab loaded ",
        "background-color: #fffe65; color: #000; padding: 5px; text-align: center; font-size: 15px; font-weight: bold; display: block; border-radius: 5px;"
    );
    console.info("tab id: " + tabId);
    console.info("changeInfo: " + changeInfo.status);
    console.info("tab: " + tab.title + ", " + tab.url);
    console.info("isGeniusPage: " + isGeniusPage);

    chrome.storage.local.set({ "album_artwork_results": "" });
    pageType = "unknown";

    const prohibitedDomains = [
        "promote.genius.com",
        "support.genius.com",
        "docs.genius.com",
        "homestudio.genius.com",
        "genius.com/developers",
        "genius.com/api-clients",
    ];

    const protocolAndDomainRegex = /^https:\/\/([^\/]+)/;
    const protocolAndDomainMatch = tab.url.match(protocolAndDomainRegex);

    if (
        protocolAndDomainMatch !== null &&
        prohibitedDomains.includes(protocolAndDomainMatch[1])
    ) {
        return;
    }

    if (changeInfo.status === "complete" && tab.url.includes("genius.com")) {
        // TODO: migrate to using the npm packages
        const files = [
            { type: "css", file: "./src/css/content-style.css" },
            { type: "css", file: "./lib/bootstrap/bootstrap.min.css" },
            { type: "css", file: "./lib/tagify/tagify.css" },
            { type: "css", file: "./lib/dragsort/dragsort.css" },
            { type: "css", file: "./lib/quilljs/quill.snow.css" },
            { type: "js", file: "./lib/jquery/jquery.min.js" },
            { type: "js", file: "./lib/jquery/jquery-ui.js" },
            { type: "js", file: "./lib/bootstrap/bootstrap.min.js" },
            { type: "js", file: "./lib/tagify/tagify.polyfills.min.js" },
            { type: "js", file: "./lib/dragsort/dragsort.js" },
            { type: "js", file: "./lib/quilljs/quill.min.js" },
            //{ type: "js", file: "./lib/axios/axios.min.js" },
            //{ type: "js", file: "./lib/oauth/oauth.min.js" },
        ];

        const cssFiles = files
            .filter((f) => f.type === "css")
            .map((f) => f.file);

        const jsFiles = files
            .filter((f) => f.type === "js")
            .map((f) => f.file);

        if (cssFiles.length) {
            chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: cssFiles,
            });
        }

        if (jsFiles.length) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: jsFiles,
            });
        }

        if (isGeniusPage) {
            new Promise((resolve, reject) => {
                chrome.tabs.query({ active: true, currentWindow: true }, () => {
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: tabId },
                            func: getDetails,
                        },
                        function (returnVal) {
                            if (
                                returnVal != undefined &&
                                returnVal[0].result != null
                            ) {
                                pageObject = returnVal[0].result;
                                pageType = pageObject.page_type;
                            }

                            if (
                                returnVal == undefined ||
                                returnVal[0].result == null ||
                                pageType == undefined ||
                                pageType == "unknown"
                            ) {
                                var urlPart = tab.url.split("genius.com/")[1];
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

                                    chrome.storage.local.get(
                                        "OldSongPage",
                                        (res) => {
                                            if (res.OldSongPage) {
                                                let currentUrl = tab.url;
                                                if (
                                                    currentUrl.indexOf(
                                                        "?bagon=1"
                                                    ) === -1 &&
                                                    currentUrl.indexOf(
                                                        "?react=1"
                                                    ) === -1
                                                ) {
                                                    currentUrl += "?bagon=1";
                                                    chrome.tabs.update(tabId, {
                                                        url: currentUrl,
                                                    });
                                                }
                                            } else if (
                                                res.OldSongPage === undefined
                                            ) {
                                                console.error(
                                                    "OldSongPage is undefined\nPlease report this error here: https://uri6.github.io/genius-enhancer/report-and-suggest/"
                                                );
                                            }
                                        }
                                    );
                                } else if (
                                    geniusAddress.some(
                                        (adress) => tab.url == adress
                                    ) ||
                                    (urlPart[0] == "#" &&
                                        !urlPart.includes("/"))
                                ) {
                                    pageType = "home";
                                } else if (
                                    geniusAddress.some((adress) =>
                                        tab.url.startsWith(adress + "firehose")
                                    )
                                ) {
                                    pageType = "firehose";
                                } else if (
                                    geniusAddress.some(
                                        (adress) =>
                                            tab.url == adress + "new" ||
                                            tab.url == adress + "new/"
                                    )
                                ) {
                                    pageType = "new song";
                                }
                                chrome.scripting.executeScript(
                                    {
                                        target: { tabId: tabId },
                                        func: () => {
                                            return (
                                                document.getElementsByClassName(
                                                    "group_summary"
                                                ).length > 0
                                            );
                                        },
                                    },
                                    function (isForumPage) {
                                        if (isForumPage[0].result) {
                                            if (tab.url.endsWith("/forums")) {
                                                pageType = "forums (main)";
                                            } else if (
                                                tab.url.endsWith("/new")
                                            ) {
                                                pageType = "new post";
                                            } else if (
                                                tab.url.includes(
                                                    "/discussions/"
                                                )
                                            ) {
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
                    );
                });
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
                            var subNav = $(".PageHeaderdesktop__Subnavigation-bhx5ui-6.koeYQd");
                            if (subNav.length == 0) {
                                subNav = $(".header-nav_menu");
                            }
                            var logo = $(".PageHeaderLogo__Link-sc-175tsd3-0.jNXEyt");
                            if (logo.length == 0) {
                                logo = $(".logo_container");
                            }
                            subNav.insertAfter(logo);

                            // if there's an element with the class "lyrics_controls", when it sticky add the class "sticky" to this element
                            // make sure that the class "sticky" is removed when the element is not sticky
                            var lyricsControls = $(".lyrics_controls");
                            if (lyricsControls.length > 0) {
                                var sticky = lyricsControls.offset().top;
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
                            var searchBar = $(".PageHeaderSearchdesktop__Input-eom9vk-2.gajVFV");
                            if (searchBar.length == 0) {
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
                                var elementOffset = element.offset().top;
                                $("html, body").animate({ scrollTop: elementOffset }, 500);
                            }

                            const elementsToScroll = {
                                "/#top-songs": $(".HomeContentdesktop__Section-sc-1xfg7l1-4.bBDcg"),
                                "/#featured-stories": $(".PageGriddesktop-a6v82w-0.csQZGy"),
                                "/#videos": $(".HomeContentdesktop__Section-sc-1xfg7l1-4.gveVlf")
                            }

                            $(document).on("click", ".PageHeaderdesktop__Link-bhx5ui-4.jQULAr", function (e) {
                                var href = $(this).attr("href");
                                if (href in elementsToScroll) {
                                    e.preventDefault();
                                    scrollToElement(elementsToScroll[href]);
                                }
                            });

                            // if an element with the classes "AnnotationPortaldesktop__Sticky-sc-17hre1n-2 daeaLL" added, remove the class "daeaLL" from it
                            $(document).on("DOMNodeInserted", (e) => {

                                if ($('.search_results_autocomplete_container .feed_dropdown').hasClass("feed_dropdown--left_align")) {
                                    $('.search_results_autocomplete_container .feed_dropdown').removeClass("feed_dropdown--left_align");
                                }

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

                                if (e.target.parentElement.classList.contains("global_search-search_icon") && e.target.tagName == "path" && e.target.getAttribute("d") == "M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39") {
                                    e.target.setAttribute("d", "M21.48 20.18L14.8 13.5a8.38 8.38 0 1 0-1.43 1.4l6.69 6.69zM2 8.31a6.32 6.32 0 1 1 6.32 6.32A6.32 6.32 0 0 1 2 8.31z");
                                    e.target.parentElement.setAttribute("class", "global_search-search_icon");
                                }

                                setTimeout(() => {
                                    if ($(e.target).attr("class") == "modal_window" && $(e.target).find(".modal_window-content").length > 0 && ($(e.target).find(".modal_window-content").find("conversation-with-user").length > 0 || $(e.target).find(".modal_window-content").find("conversation-messages").length > 0)) {

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

                if (!(pageType == null || pageType == "unknown")) {
                    switch (pageType) {
                        case "new song":
                            chrome.scripting.insertCSS(
                                {
                                    target: { tabId: tabId },
                                    files: ["./src/css/newSong.css"]
                                }
                            );

                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: (() => {
                                        const oldChooser = document.querySelector('.primary_tag_chooser');
                                        oldChooser.style.display = 'none';

                                        const newChooser = document.createElement('div');
                                        newChooser.classList.add('modern-chooser');
                                        oldChooser.after(newChooser);

                                        const genres = [
                                            { value: 1434, name: 'Rap', emoji: '🎤' },
                                            { value: 16, name: 'Pop', emoji: '🎵' },
                                            { value: 352, name: 'R&B', emoji: '🎶' },
                                            { value: 567, name: 'Rock', emoji: '🎸' },
                                            { value: 413, name: 'Country', emoji: '🤠' },
                                            { value: 1452, name: 'Non-Music', emoji: '🎙️' },
                                        ];

                                        genres.forEach((genre) => {
                                            const genreButton = document.createElement('button');
                                            genreButton.innerHTML = `${genre.emoji} ${genre.name}`;
                                            genreButton.classList.add('modern-chooser-button');
                                            genreButton.addEventListener('click', (e) => {
                                                e.preventDefault();
                                                $('.modern-chooser-button').removeClass('modern-chooser-button-active');
                                                $(e.target).addClass('modern-chooser-button-active');
                                                $(`#song_primary_tag_id_${genre.value}`).click();
                                            });
                                            newChooser.appendChild(genreButton);
                                        });

                                        $(`#song_primary_tag_id_${genres[1].value}`).click();
                                        $(newChooser.children[1]).addClass('modern-chooser-button-active');


                                        // change the text in the element ".lyrics_style_guide" to shown only if the first h4 child has clicked
                                        // first, change the h4 element parent to be the parent of his parent. then, make the styleGuide diaply be none unless the h4 is clicked.
                                        // then, make the h4 element to be clicked and change the styleGuide display to be block
                                        const styleGuide = document.querySelector('.lyrics_style_guide');
                                        const h4 = styleGuide.querySelector('h4');
                                        styleGuide.parentElement.insertBefore(h4, styleGuide);
                                        styleGuide.style.opacity = '0';

                                        h4.addEventListener('mouseover', (e) => {
                                            styleGuide.style.opacity = '1';
                                        });

                                        h4.addEventListener('mouseleave', (e) => {
                                            if (!$('.lyrics_style_guides:hover').length) {
                                                styleGuide.style.opacity = '0';
                                            }
                                            else {
                                                $('.lyrics_style_guides').mouseleave((e) => {
                                                    styleGuide.style.opacity = '0';
                                                });
                                            }
                                        });

                                        // on every input which isn't child of .search-field, if "enter" is pressed, click the submit button (#song_submit)
                                        document.querySelectorAll('input').forEach((input) => {
                                            if (!input.parentElement.classList.contains('search-field')) {
                                                input.addEventListener('keydown', (e) => {
                                                    if (e.key == 'Enter') {
                                                        document.querySelector('#song_submit').click();
                                                    }
                                                });
                                            }
                                        });

                                        // if send clicked but (on of the ".required" inputs is empty) or (the input "#song_lyrics_state" is not checked and and textarea ".add_song_page-lyrics_textarea" is empty), add for all of them a red border
                                        // else, remove the red border
                                        document.querySelector('#song_submit').addEventListener('click', async (e) => {

                                            const clickedTag = document.querySelector('.modern-chooser-button-active');
                                            console.log(clickedTag);
                                            const requiredInputs = document.querySelectorAll('.required');
                                            const lyricsState = document.querySelector('#song_lyrics_state');
                                            const lyricsTextarea = document.querySelector('.add_song_page-lyrics_textarea');

                                            requiredInputs.forEach((input) => {
                                                if (input.value == '') {
                                                    e.preventDefault();
                                                    $(input).addClass('missing');

                                                    input.addEventListener('input', (e) => {
                                                        $(e.target).removeClass('missing');

                                                        if (e.target.value == '') {
                                                            $(e.target).addClass('missing');
                                                        }
                                                    });
                                                }
                                            });

                                            if (!lyricsState.checked && lyricsTextarea.value == '') {
                                                e.preventDefault();
                                                $(lyricsTextarea).addClass('missing');

                                                lyricsTextarea.addEventListener('input', (e) => {
                                                    $(e.target).removeClass('missing');

                                                    if (e.target.value == '' && !lyricsState.checked) {
                                                        $(e.target).addClass('missing');
                                                    }
                                                });
                                            }

                                            setTimeout(() => {
                                                clickedTag.click();
                                            }, 100);
                                        });
                                    })
                                }
                            );
                            break;
                        case "firehose":
                            chrome.scripting.insertCSS(
                                {
                                    target: { tabId: tabId },
                                    files: ["./src/css/firehose.css"]
                                }
                            );

                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: (() => {
                                        $("fieldset input[type='checkbox']").each(function () {
                                            if ($(this).hasClass("chkboxm")) {
                                                return;
                                            }
                                            var attributes = "";
                                            for (var i = 0; i < this.attributes.length; i++) {
                                                attributes += this.attributes[i].name + "=\"" + this.attributes[i].value + "\" ";
                                            }
                                            $(this).replaceWith("<input type=\"checkbox\" name=\"" + this.name + "\" class=\"chkboxm\" " + attributes + "><label for=\"" + this.name + "\"><span class=\"chkboxmspan\"></span>" + $(this).next().html() + "</label>");
                                        });

                                        $("fieldset label").each(function () {
                                            if ($(this).children().length == 0) {
                                                $(this).remove();
                                            }
                                        });
                                    })
                                }
                            );
                            break;
                        case 'home':
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: (() => {
                                        // change the background color of the page to 99E47A
                                        $("body").css("background-color", "#99E47A");
                                        // change the order of the elements in ".HomeContentdesktop__Container-sc-1xfg7l1-0.zvOxT"
                                        // the current order (by classes from the top to the bottom):
                                        //    1. PageHeaderdesktop__Container-bhx5ui-0 dmNhEr
                                        //    2. HomeContentdesktop__SkinContainer-sc-1xfg7l1-2 cQrBTG
                                        //    3. LeaderboardOrMarquee__Sticky-yjd3i4-0 dIgauN
                                        //    4. HomeContentdesktop__CenteredFlexColumn-sc-1xfg7l1-1 btjJtO (charts)
                                        //    5. HomeContentdesktop__Section-sc-1xfg7l1-4 gveVlf (videos)
                                        //    6. HomeContentdesktop__Section-sc-1xfg7l1-4 bBDcg (news)
                                        //    7. HomeContentdesktop__Section-sc-1xfg7l1-4 bMwme (community)
                                        //    8. PageFooterdesktop__Container-hz1fx1-0 boDKcJ (bottom)
                                        // the new order:
                                        //    1. PageHeaderdesktop__Container-bhx5ui-0 dmNhEr
                                        //    2. HomeContentdesktop__SkinContainer-sc-1xfg7l1-2 cQrBTG
                                        //    3. LeaderboardOrMarquee__Sticky-yjd3i4-0 dIgauN
                                        //    4. HomeContentdesktop__CenteredFlexColumn-sc-1xfg7l1-1 btjJtO (charts)
                                        //    5. HomeContentdesktop__Section-sc-1xfg7l1-4 bMwme (community)
                                        //    6. HomeContentdesktop__Section-sc-1xfg7l1-4 bBDcg (news)
                                        //    7. HomeContentdesktop__Section-sc-1xfg7l1-4 gveVlf (videos)
                                        //    8. PageFooterdesktop__Container-hz1fx1-0 boDKcJ (bottom)
                                        $("#featured-stories").remove();
                                        var container = $(".HomeContentdesktop__Container-sc-1xfg7l1-0.zvOxT");
                                        var children = container.children();
                                        console.log(children);
                                        container
                                            .empty()
                                            .append(children[0])
                                            .append(children[1])
                                            .append(children[2])
                                            .append(children[3])
                                            .append(children[6])
                                            .append(children[5])
                                            .append(children[4])
                                            .append(children[7]);


                                        document.querySelectorAll(".qsIlk, .dUTFUv, .kcEpRx, .jdaOmt, .klrmXf").forEach(function (e) {
                                            $(e).append("<div class='styled-background'></div>");
                                        });

                                        $(document).on('DOMNodeInserted', function (e) {
                                            if ($(e.target).is('.qsIlk, .dUTFUv, .kcEpRx, .jdaOmt, .klrmXf')) {
                                                $(e.target).append("<div class='styled-background'></div>");
                                            }
                                        });

                                        document.querySelectorAll(".qsIlk, .dUTFUv, .kcEpRx, .jdaOmt, .klrmXf").forEach(function (e) {
                                            $(e).mousemove(function (ee) {
                                                var parentOffset = $(this).offset();
                                                $(this).find('.styled-background').css({
                                                    "top": ee.pageY - parentOffset.top,
                                                    "left": ee.pageX - parentOffset.left
                                                });
                                            });
                                        });

                                        $(".SquareButton-sc-109lda7-0.hlrLfQ").last().click();

                                        // when hovering the element ".jHQizl .kMmimq", change a bit the position of their child ".SizedImage__Container-sc-1hyeaua-0" according to the position of the mouse
                                        // the child ".SizedImage__Container-sc-1hyeaua-0" is image of the artist
                                        // make sure it will move just a bit, so it will look like the image is moving with the mouse
                                        $(".jHQizl .kMmimq").mousemove(function (e) {
                                            var parentOffset = $(this).offset();
                                            var relX = e.pageX - parentOffset.left;
                                            var relY = e.pageY - parentOffset.top;
                                            // the propotion should change according how much the mouse close to the center of the element
                                            // the closer to the center, the bigger the propotion
                                            var propotion = 1 - Math.sqrt(Math.pow(relX - $(this).width() / 2, 2) + Math.pow(relY - $(this).height() / 2, 2)) / Math.sqrt(Math.pow($(this).width() / 2, 2) + Math.pow($(this).height() / 2, 2));
                                            $(this).find('.SizedImage__Container-sc-1hyeaua-0').css({
                                                "transform": "translate(" + (relX - $(this).width() / 2) * propotion / 10 + "px, " + (relY - $(this).height() / 2) * propotion / 10 + "px)"
                                            });
                                        });

                                        // make sure to cancel the effect when the mouse leaves the element ".jHQizl .kMmimq"
                                        $(".jHQizl .kMmimq").mouseleave(function (e) {
                                            $(this).find('.SizedImage__Container-sc-1hyeaua-0').css({
                                                "transform": "translate(0px, 0px)"
                                            });
                                        });

                                        // auto remove the background of the image of the artist when hovering the element ".jHQizl .kMmimq"
                                        // notice it isn't a css background, it's an image!
                                        const img = document.querySelector('.jHQizl .kMmimq');
                                        const apiKey = 'YOUR_API_KEY';

                                        remove.bg.init({ apiKey });

                                        remove.bg.removeBackgroundFromImage(img, (result) => {
                                            img.src = result.dataUrl;
                                        }, (e) => {
                                            console.error(e);
                                        });

                                    })
                                }
                            );
                            break;
                        case 'album':
                            // create the tags & artists datalists
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: (() => {
                                        const getTagsList = async function () {
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

                                        getTagsList().then(res => {
                                            const replaces = {
                                                '&#039;': `'`,
                                                '&amp;': '&',
                                                '&lt;': '<',
                                                '&gt;': '>',
                                                '&quot;': '"'
                                            };

                                            const dataListElem = $('<datalist>').html(res.innerHTML).attr('id', 'tagsList');
                                            const options = dataListElem.find('option');

                                            options.each(function () {
                                                const tagNameFixed = $(this).html().replace(/&[\w\d#]{2,5};/g, match => replaces[match]).replace(/  +/g, ' ');
                                                const tagID = $(this).attr('value');
                                                $(this).html(tagNameFixed).attr('value', tagID);
                                            });

                                            const arr = options.map(function () {
                                                return {
                                                    text: $(this).text(),
                                                    value: this.value
                                                };
                                            }).get().sort(function (o1, o2) {
                                                return o1.text > o2.text ? 1 : o1.text < o2.text ? -1 : 0;
                                            });

                                            options.each(function (i, o) {
                                                o.value = arr[i].value;
                                                $(o).text(arr[i].text);
                                            });

                                            $('body').append(dataListElem);
                                        });

                                        if ($('.header_with_cover_art metadata .metadata_unit').length) {
                                            $('.header_with_cover_art metadata .metadata_unit').text($('.header_with_cover_art .metadata_unit').text().replace("Released ", ""));
                                            $('.header_with_cover_art metadata')
                                                .prepend($('<img>', {
                                                    src: chrome.runtime.getURL("/src/images/releaseDate/Simple/32x32.png"),
                                                    class: "release_date_icon",
                                                    title: "Release Date"
                                                }));
                                            $('.header_with_cover_art-primary_info h2 .drop-target')
                                                .prepend($('<img>', {
                                                    src: chrome.runtime.getURL("/src/images/artist/Simple/32x32.png"),
                                                    class: "artist_icon",
                                                    title: "Artist"
                                                }));
                                        }
                                    })
                                }
                            );

                            chrome.scripting.insertCSS(
                                {
                                    target: { tabId: tabId },
                                    files: ["./src/css/album.css"]
                                }
                            );

                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: appendIcon
                                }
                            );

                            chrome.storage.local.get(["bios", "people", "releaseDate"], (res) => {
                                console.log(res);
                                chrome.scripting.executeScript(
                                    {
                                        target: { tabId: tabId },
                                        func: missingInfo,
                                        args: [res.bios, res.people, res.releaseDate]
                                    }
                                );
                            });

                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: addSongAsTheNext
                                }
                            );

                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: (() => {
                                        chrome.runtime.sendMessage({ "album_autolinkArtwork": [true] });
                                    })
                                }
                            );

                            break;
                        case 'song':
                            chrome.scripting.executeScript({
                                target: { tabId: tabId },
                                files: ["./lib/geniuspot/geniuspot.min.js"]
                            });

                            chrome.storage.local.get("ModernTextEditor", (res) => {
                                if (res.ModernTextEditor) {
                                    chrome.scripting.executeScript(
                                        {
                                            target: { tabId: tabId },
                                            func: (() => {
                                                chrome.runtime.sendMessage({ "song_modernTextEditor": [true] });
                                            })
                                        }
                                    );
                                }
                            });

                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: () => {

                                        $(document).on("DOMNodeInserted", ".Modalshared__ModalSharedContainer-knew3e-0.Modaldesktop__Container-sc-1e03w42-0.cJpfVu", function (e) {
                                            if (!$(".RecentActivity__FilteringContainer").length) {

                                                const filterContainer = $('<div>', {
                                                    class: 'RecentActivity__FilteringContainer'
                                                });

                                                const button = $('<span>', {
                                                    class: 'RecentActivity__FilteringTitle',
                                                    text: 'Filter'
                                                }).appendTo(filterContainer);

                                                // Define the options for the dropdown
                                                const options = [
                                                    { id: 'created|edited|proposed_an_edit_to|merged|accepted|rejected|deleted|pinned', text: 'Annotations, Proposals, Q&A' },
                                                    { id: 'added_a_suggestion_to|replied_to|integrated|archived|marked', text: 'Comments, Suggestions' },
                                                    { id: 'followed|unfollowed', text: 'Follows' },
                                                    { id: '', text: 'Geniusbot' },
                                                    { id: 'edited_the_lyrics_of|recognized|marked_complete|verified_the_lyrics_of|unverified_the_lyrics_of', text: 'Lyrics Edits' },
                                                    { id: 'edited_the_metadata_of|locked|unlocked', text: 'Metadata' },
                                                    { id: 'pyonged', text: 'Pyongs' },
                                                    { id: 'downvoted|upvoted', text: 'Voting' }
                                                ];

                                                // Create a select element for the dropdown
                                                const filterDropdown = $('<div>', {
                                                    class: 'RecentActivity__FilteringDropdown',
                                                    style: 'display: none;'
                                                });

                                                // Create an option element for each option and add it to the dropdown
                                                options.forEach(function (option) {
                                                    $('<div>', {
                                                        class: 'RecentActivity__FilteringDropdownItem'
                                                    })
                                                        .append($('<input>', {
                                                            type: 'checkbox',
                                                            class: 'chkboxm',
                                                            id: option.text,
                                                            name: option.text,
                                                            'filter-id': option.id,
                                                            checked: true
                                                        }))
                                                        .append($('<label>', {
                                                            for: option.text,
                                                        })
                                                            .append($('<span>', {
                                                                class: 'chkboxmspan'
                                                            }))
                                                            .append($('<span>', {
                                                                class: 'RecentActivity__FilteringDropdownItemText',
                                                                text: option.text
                                                            }))
                                                        )
                                                        .appendTo(filterDropdown);
                                                });

                                                // Add the dropdown to the page
                                                $(e.target).find('.RecentActivity__Title-d62qa5-1.ilJdac').after(filterContainer);
                                                $(filterContainer).append(filterDropdown);

                                                // When the dropdown is clicked, show the options
                                                $(button).click(function () {
                                                    $(filterDropdown).toggle();
                                                });

                                                // When the user clicks anywhere outside of the dropdown, hide it (make sure it won't hide when clicking on the button)
                                                $(document).click(function (e) {
                                                    if (!$(e.target).is(button) && !$(e.target).is(filterDropdown) && !$(e.target).is(filterDropdown.find('*'))) {
                                                        $(filterDropdown).hide();
                                                    }
                                                });

                                                $('.RecentActivity__FilteringDropdownItem').click(function () {
                                                    $(this).find('.chkboxm').prop('checked', !$(this).find('.chkboxm').prop('checked'));
                                                });

                                                // When the user clicks on an option, show/hide the activity items
                                                $(filterDropdown).find('.chkboxm').click(function () {
                                                    const filterIds = $(this).attr('filter-id').split('|');
                                                    const isChecked = $(this).prop('checked');

                                                    // the activity items are in the .PlaceholderSpinnerIframe__Iframe-sc-1vue620-0 iframe, so we need to get the iframe's document
                                                    const iframe = document.querySelector('.PlaceholderSpinnerIframe__Iframe-sc-1vue620-0');

                                                    // each div child of the element with the tag name song-activity-stream is an activity item
                                                    const activityItems = Array.from(iframe.contentWindow.document.querySelector('song-activity-stream div').children);

                                                    activityItems.forEach(activityItem => {
                                                        // the action type is in the ng-switch-when attribute of the svg element inside the element with the tag name inbox-line-item-action-icon
                                                        let actionType = activityItem.querySelector('inbox-line-item-action-icon div svg');
                                                        if (actionType) {
                                                            actionType = actionType.getAttribute('ng-switch-when');
                                                            console.log(actionType);
                                                            if (filterIds.includes(actionType)) {
                                                                $(activityItem).toggle(!isChecked);
                                                            }
                                                        } else {
                                                            actionType = activityItem.querySelector('inbox-line-item-action-icon div');
                                                            if (actionType && !actionType.querySelector('svg') && filterIds === ['']) {
                                                                $(activityItem).toggle(!isChecked);
                                                            }
                                                        }
                                                    });

                                                    // insert to the iframe a .checked-filters div element with all the checked filters ids (if there's already a .checked-filters div element, remove it)
                                                    const checkedFilters = document.querySelectorAll('.RecentActivity__FilteringDropdownItem input:checked');
                                                    const checkedFiltersIds = Array.from(checkedFilters).map(checkedFilter => checkedFilter.getAttribute('filter-id')).join('|');
                                                    const checkedFiltersDiv = iframe.contentWindow.document.querySelector('.checked-filters');
                                                    if (checkedFiltersDiv) {
                                                        checkedFiltersDiv.remove();
                                                    }
                                                    $('<div>', {
                                                        class: 'checked-filters',
                                                        style: 'display: none;',
                                                        text: checkedFiltersIds
                                                    }).prependTo(iframe.contentWindow.document);
                                                });
                                            }

                                            document.querySelector('.PlaceholderSpinnerIframe__Iframe-sc-1vue620-0').contentWindow.document.querySelector('song-activity-stream div').addEventListener('DOMNodeInserted', function (e) {
                                                if (e.target.tagName === 'DIV') {
                                                    let filterIds = document.querySelector('.PlaceholderSpinnerIframe__Iframe-sc-1vue620-0').contentWindow.document.querySelector('.checked-filters');
                                                    if (filterIds) {
                                                        filterIds = filterIds.innerText.split('|');
                                                        // the action type is in the ng-switch-when attribute of the svg element inside the element with the tag name inbox-line-item-action-icon
                                                        let actionType = e.target.querySelector('inbox-line-item-action-icon div svg');
                                                        if (actionType) {
                                                            actionType = actionType.getAttribute('ng-switch-when');
                                                            if (filterIds.includes(actionType)) {
                                                                $(e.target).toggle(false);
                                                            }
                                                        } else {
                                                            actionType = e.target.querySelector('inbox-line-item-action-icon div');
                                                            if (actionType && !actionType.querySelector('svg') && JSON.stringify(filterIds) === JSON.stringify([''])) {
                                                                $(e.target).toggle(false);
                                                            }
                                                        }
                                                    }
                                                }
                                            });
                                        });

                                        let isAnnotation = false;

                                        if (document.getElementsByClassName("annotation_sidebar_unit").length == 2) {
                                            isAnnotation = true;
                                        }
                                        else if (!!document.getElementsByClassName("Annotation__Container-l76qjh-0 cNCMgo").length) {
                                            isAnnotation = true;
                                        }

                                        chrome.runtime.sendMessage({ ["song_appendReplyButton"]: [isAnnotation] });
                                        
                                        const lyricsContainer = $('.Lyrics__Container-sc-1ynbvzw-6')[0] || $(".lyrics section")[0];
                                        let text = lyricsContainer.innerText;

                                        var words = text.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g, '').split(/\s+/);

                                        var languageCounts = {};
                                        for (var i = 0; i < words.length; i++) {
                                            var word = words[i];
                                            var language = getLanguage(word);
                                            if (!languageCounts[language]) {
                                                languageCounts[language] = 0;
                                            }
                                            languageCounts[language]++;
                                        }

                                        var mostUsedLanguage = null;
                                        var highestCount = 0;
                                        for (var language in languageCounts) {
                                            if (languageCounts[language] > highestCount) {
                                                mostUsedLanguage = language;
                                                highestCount = languageCounts[language];
                                            }
                                        }

                                        if (mostUsedLanguage === null) {
                                            console.log("No language detected");
                                        } else {
                                            var direction = isRTL(mostUsedLanguage) ? "RTL" : "LTR";
                                            console.log("Most used language: " + mostUsedLanguage + " (" + direction + ")");
                                        }

                                        function getLanguage(word) {
                                            switch (true) {
                                                case /^[a-zA-Z]+$/.test(word):
                                                    return "English";
                                                case /^[\u0600-\u06FF]+$/.test(word):
                                                    return "Arabic";
                                                case /^[\u0590-\u05FF]+$/.test(word):
                                                    return "Hebrew";
                                                case /^[\u0400-\u04FF]+$/.test(word):
                                                    return "Russian";
                                                case /^[\u3040-\u309F]+$/.test(word):
                                                    return "Japanese";
                                                case /^[\u4E00-\u9FFF]+$/.test(word):
                                                    return "Chinese Simplified";
                                                case /^[\u00E4-\u00FC]+$/.test(word):
                                                    return "German";
                                                case /^[\u00C0-\u00FF]+$/.test(word):
                                                    return "French";
                                                case /^[\u00E0-\u00FF]+$/.test(word):
                                                    return "Spanish";
                                                case /^[\u00C6-\u00E6]+$/.test(word):
                                                    return "Danish";
                                                case /^[\u0104-\u0134]+$/.test(word):
                                                    return "Polish";
                                                case /^[\u0103-\u0103]+$/.test(word):
                                                    return "Romanian";
                                                case /^[\u00E6-\u00E6]+$/.test(word):
                                                    return "Ukrainian";
                                                case /^[\u0131-\u0131]+$/.test(word):
                                                    return "Turkish";
                                                case /^[\u0050-\u00FF]+$/.test(word):
                                                    return "Italian";
                                                case /^[\u01C5-\u0218]+$/.test(word):
                                                    return "Dutch";
                                                default:
                                                    return "Other";
                                            }
                                        }

                                        function isRTL(language) {
                                            return (language === "Arabic" || language === "Hebrew");
                                        }
                                    }
                                }
                            );
                            break;
                        case 'forums (main)':
                            chrome.scripting.insertCSS(
                                {
                                    target: { tabId: tabId },
                                    files: ["./src/css/forumsPages/main.css"]
                                }
                            );
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: replaceButtons,
                                    args: [true, true]
                                }
                            );
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: () => {
                                        // disable sending the input ".discussions_search_bar-text_input" if there's less than 3 characters
                                        // if there's less than and the user presses enter, the strok of the box will turn red
                                        $(document).on('keypress', '.discussions_search_bar-text_input', function (e) {
                                            if (e.which == 13) {
                                                if (this.value.length < 3) {
                                                    e.preventDefault();
                                                    $(this).css("border-color", "red !important");
                                                    // notice the user that the input is too short
                                                    // dont use placeholder, it's not visible
                                                    // use a span element, remove it after 3 seconds
                                                    if (!document.getElementsByClassName("discussions_search_bar-text_input-error").length) {
                                                        var span = document.createElement("span");
                                                        span.textContent = "The input is too short (min 3 characters)";
                                                        span.setAttribute("class", "discussions_search_bar-text_input-error");
                                                        $(span).hide().appendTo(this.parentElement).fadeIn(500);
                                                        setTimeout(() => {
                                                            $(span).fadeOut(500, () => {
                                                                span.remove();
                                                            });
                                                        }, 2500);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                            );
                            break;
                        case 'forum':
                            chrome.scripting.insertCSS(
                                {
                                    target: { tabId: tabId },
                                    files: ["./src/css/forumsPages/forum.css"]
                                }
                            );
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: replaceButtons,
                                    args: [true, true]
                                }
                            );

                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: () => {
                                        // disable sending the input ".discussions_search_bar-text_input" if there's less than 3 characters
                                        // if there's less than and the user presses enter, the strok of the box will turn red
                                        // use jquery
                                        $(document).on('keypress', '.discussions_search_bar-text_input', function (e) {
                                            if (e.which == 13) {
                                                if (this.value.length < 3) {
                                                    e.preventDefault();
                                                    $(this).css("border-color", "red !important");
                                                    // notice the user that the input is too short
                                                    // dont use placeholder, it's not visible
                                                    // use a span element, remove it after 3 seconds
                                                    if (!document.getElementsByClassName("discussions_search_bar-text_input-error").length) {
                                                        var span = document.createElement("span");
                                                        span.textContent = "The input is too short (min 3 characters)";
                                                        span.setAttribute("class", "discussions_search_bar-text_input-error");
                                                        $(span).hide().appendTo(this.parentElement).fadeIn(500);
                                                        setTimeout(() => {
                                                            $(span).fadeOut(500, () => {
                                                                span.remove();
                                                            });
                                                        }, 2500);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                            );
                            break;
                        case 'forum thread':
                            chrome.scripting.insertCSS(
                                {
                                    target: { tabId: tabId },
                                    files: ["./src/css/forumsPages/thread.css"]
                                }
                            );
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: () => {
                                        chrome.storage.local.get("ModernTextEditor", (res) => {
                                            if (res.ModernTextEditor) {
                                                chrome.runtime.sendMessage({ "forums_modernTextEditor": [true] });
                                            }
                                        });

                                        if (document.readyState === 'complete') {
                                            $(".reply_container h3").replaceWith('<h3 class="comment-title">Comment</h3>');
                                            $(".forum_post_container .avatar").first().removeClass("small");
                                            $(".user_badge").first().addClass("first_one");
                                            $(".body.embedly.embedly_pro").first().addClass("first_one");
                                            $('#groups_sidebar').remove();
                                            $('.group_summary').insertBefore('#container.mecha--deprecated');
                                            $('.discussion_thread-discussion_and_group_list').insertAfter('.group_summary');
                                            $('#group_container.discussion_thread').insertAfter('.discussion_thread-discussion_and_group_list');
                                            $('.group_summary').attr("onclick", "window.location.href=$('.group_summary a').attr('href')").css("cursor", "pointer");

                                            // Restyling the header of the post
                                            if ($(".group_title-moderation_actions").length) {
                                                $(".group_title-moderation_actions").insertBefore($(".forum_post-header .voting_links").first());
                                                $(".forum_post-header .voting_links").first().css("margin-right", 10);
                                                $(".group_title-moderation_actions").css("padding-right", $(".forum_post-header .voting_links").first().outerWidth() + 10);
                                            }
                                            $(".forum_post-header").first().css("width", $(".group_title-subject").first().outerWidth(true));
                                            $(".forum_post-header").first().css("height", $(".group_title-subject").first().outerHeight());
                                            $(".body.embedly.embedly_pro.first_one").css("margin-top", $(".body.embedly.embedly_pro.first_one").css("padding-top"));

                                            $('.group_summary').hover(function () {
                                                $('.header-primary').addClass('header-primary-hover');
                                            }, function () {
                                                $('.header-primary').removeClass('header-primary-hover');
                                            });

                                            $(document).ready(function () {
                                                var loadMoreButton = $('.pagination.no_auto_more a');
                                                var sendButton = $("#forum_post_submit");
                                                if (loadMoreButton.length) {
                                                    loadMoreButton.text("Load older comments");
                                                }
                                                if (sendButton.length) {
                                                    sendButton.val("Send");
                                                }
                                            });

                                            $(document).on("DOMNodeInserted", function (e) {
                                                if (e.target.classList.contains("error") && e.target.getAttribute("for") == "forum_post_body" && e.target.getAttribute("generated") == "true") {
                                                    e.target.innerText = "Please enter a comment";

                                                    setTimeout(() => {
                                                        e.target.remove(e.target);
                                                    }, 3000);
                                                }

                                                else if (e.target.classList.contains('forum_post_unit')) {
                                                    addReplyButton(e.target);
                                                }
                                            });

                                            $('.forum_post_container .forum_post_unit:not(:first-child)').each(function () {
                                                addReplyButton(this);
                                            });

                                            function addReplyButton(forumPostUnit) {
                                                const replyButton = document.createElement('div');
                                                replyButton.classList.add('reply_button');
                                                replyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24" width="24"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>';

                                                replyButton.addEventListener('click', function () {
                                                    const iqValue = forumPostUnit.querySelector('.iq_value');
                                                    if (!iqValue) {
                                                        console.error('no iq value');
                                                        return;
                                                    }
                                                    const username = iqValue.getAttribute('href').slice(1);
                                                    console.log(username);
                                                    const quillEditor = $('.ql-editor');
                                                    if (quillEditor.length === 0) {
                                                        console.error('no quill editor');
                                                        return;
                                                    }
                                                    const existingText = quillEditor.html();
                                                    if (existingText.includes('@' + username + ' ')) {
                                                        console.log('already tagged');
                                                        return;
                                                    }
                                                    const taggedUsernames = existingText.match(/@\w+\s/g) || [];
                                                    if (taggedUsernames.length > 0) {
                                                        quillEditor.append('\n@' + username + ' \n\n');
                                                    } else {
                                                        quillEditor.prepend('@' + username + ' \n\n');
                                                    }

                                                    $('html, body').animate({
                                                        scrollTop: quillEditor.offset().top
                                                    }, 500);

                                                    quillEditor.focus();

                                                    // set the cursor to the end of the text
                                                    const range = document.createRange();
                                                    const sel = window.getSelection();
                                                    range.setStart(quillEditor[0], quillEditor[0].childNodes.length);
                                                    range.collapse(true);
                                                    sel.removeAllRanges();
                                                    sel.addRange(range);
                                                });

                                                forumPostUnit.appendChild(replyButton);
                                            }

                                            var observer = new MutationObserver(function (mutations) {
                                                mutations.forEach(function (mutation) {
                                                    if (mutation.addedNodes) {
                                                        var newNodes = mutation.addedNodes;
                                                        for (var i = 0; i < newNodes.length; i++) {
                                                            var node = newNodes[i];
                                                            if (node.classList && node.classList.contains("pagination") && node.classList.contains("no_auto_more")) {
                                                                $(node).find("a").text("Load older comments");
                                                            }
                                                        }
                                                    }
                                                });
                                            });

                                            var config = {
                                                childList: true,
                                                subtree: true
                                            };

                                            observer.observe(document.body, config);

                                            const userTooltip = $(".user_tooltip");
                                            if (userTooltip.length) {
                                                const toggleFollowBtn = userTooltip.find(".toggle_follow.button.new_status_unfollow");
                                                if (toggleFollowBtn.length) {
                                                    const helperText = toggleFollowBtn.find(".toggle_follow-helper_text");
                                                    if (helperText.length) {
                                                        helperText.text("Unfollow");
                                                        helperText.attr("data-is-changed", "true");
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            );
                            break;
                        case 'new post':
                            chrome.scripting.insertCSS(
                                {
                                    target: { tabId: tabId },
                                    files: ["./src/css/forumsPages/newPost.css"]
                                }
                            );
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: () => {
                                        chrome.storage.local.get("ModernTextEditor", (res) => {
                                            if (res.ModernTextEditor) {
                                                chrome.runtime.sendMessage({ "forums_modernTextEditor": [true] });
                                            }
                                        });
                                    }
                                });
                            break;
                        case 'profile':
                            chrome.scripting.insertCSS(
                                {
                                    target: { tabId: tabId },
                                    files: ["./src/css/profile.css"]
                                }
                            );
                            break;
                    }
                }
            })
        }
    }
})
