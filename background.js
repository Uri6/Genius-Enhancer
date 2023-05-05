/*
 * This code is licensed under the terms of the "LICENSE.md" file
 * located in the root directory of this code package.
 */

import {
    fixNonLatin,
    getDetails,
    getArtistsList,
    getCreditsList,
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
    addSongAsNext,
} from "./src/js/sideFunctions_album.js";
import {
    appleMusicPopUp,
    spotifyPopUp,
    song_modernTextEditor,
    appendReplyButton,
    searchVideo,
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
            chrome.storage.local.set({ "darkMode": false });
        case 'update':
            // var newURL = "https://uri6.github.io/genius-bot/versions/";
            // chrome.tabs.create({ url: newURL });
            // break;
            break;
    }
});

chrome.runtime.onMessage.addListener((
    message,
    sender,
    sendResponse
) => {
    getTabId().then((tabId) => {
        let func, args;

        switch (true) {
            case "fixNonLatin" in message:
                func = fixNonLatin;
                args = message.fixNonLatin;
                break;
            case "getDetails" in message:
                func = getDetails;
                args = [''];
                break;
            case "getArtistsList" in message:
                func = getArtistsList;
                args = message.getArtistsList;
                break;
            case "getCreditsList" in message:
                func = getCreditsList;
                args = message.getCreditsList;
                break;
            case "identifyPageType" in message:
                func = identifyPageType;
                args = [''];
                break;
            case "replaceTextarea" in message:
                func = replaceTextarea;
                args = message.replaceTextarea;
                break;
            case "removeQuill" in message:
                func = removeQuill;
                args = [''];
                break;
            case "album_appendIcon" in message:
                func = appendIcon;
                args = message.album_appendIcon;
                break;
            case "album_addSongAsNext" in message:
                func = addSongAsNext;
                args = message.album_addSongAsNext;
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
                args = [''];
                break;
            case "album_autolinkArtwork" in message:
                func = autolinkArtwork;
                args = message.album_autolinkArtwork;
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
            case "song_searchVideo" in message:
                func = searchVideo;
                args = message.song_searchVideo;
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

        new Promise((resolve) => {
            chrome.scripting
                .executeScript({
                    target: { tabId: tabId },
                    func: func,
                    args: args,
                })
                .then((results) => {
                    if (
                        func === autolinkArtwork ||
                        func === identifyPageType ||
                        func === getPlaylistVideos ||
                        func === getDetails ||
                        func === getArtistsList ||
                        func === getCreditsList ||
                        func === searchVideo ||
                        func === fixNonLatin
                    ) {
                        resolve(results[0].result);
                    } else {
                        resolve();
                    }
                });
        }).then((res) => {
            console.info("----------------------------------------");
            console.info(
                "%c new message received ", "background-color: #ff1464; color: #fff; padding: 5px; text-align: center; font-size: 15px; font-weight: bold; display: block; border-radius: 5px;"
            )
            console.info("time received: ", new Date().toLocaleTimeString('en-US', { hour12: false }));
            console.info("message received: ", message);
            console.info("function called: ", func.name);
            console.info("arguments: ", args);
            console.info("response: ", res);

            sendResponse(res);
        });
    });

    return true;
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
    console.info("time loaded: " + new Date().toLocaleTimeString('en-US', { hour12: false }));
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
            { type: "css", file: "./src/css/darkmode.css" },
            { type: "css", file: "./lib/bootstrap/bootstrap.min.css" },
            { type: "css", file: "./lib/tagify/tagify.css" },
            { type: "css", file: "./lib/dragsort/dragsort.css" },
            { type: "css", file: "./lib/quilljs/quill.snow.css" },
            { type: "js", file: "./lib/jquery/jquery.min.js" },
            { type: "js", file: "./lib/jquery/jquery-ui.js" },
            //{ type: "js", file: "./lib/bootstrap/bootstrap.min.js" },
            { type: "js", file: "./lib/tagify/tagify.polyfills.min.js" },
            { type: "js", file: "./lib/dragsort/dragsort.js" },
            { type: "js", file: "./lib/quilljs/quill.min.js" },
            { type: "js", file: "./lib/axios/axios.min.js" },
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

        console.info("----------------------------------------");
        console.info(
            "%c loaded files ", "background-color: #ad2885; color: #fff; padding: 5px; text-align: center; font-size: 15px; font-weight: bold; display: block; border-radius: 5px;"
        )
        console.info("time loaded: ", new Date().toLocaleTimeString('en-US', { hour12: false }));
        console.info("css files: ", cssFiles);
        console.info("js files: ", jsFiles);

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
                                        if (isForumPage?.[0]?.result) {
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

                            if (!$('#ge-theme-toggle').length && $(".header-actions").length) {
                                const darkModeToogle = $("<input>", {
                                    id: "ge-theme-toggle",
                                    class: "ge-theme-toggle",
                                    type: "checkbox",
                                    on: {
                                        click: function () {
                                            $("body").addClass("ge-theme-transition");

                                            if ($(this).is(":checked")) {
                                                $("body").addClass("ge-dark-mode");
                                                chrome.storage.local.set({ "darkMode": true });
                                            }
                                            else {
                                                $("body").removeClass("ge-dark-mode");
                                                chrome.storage.local.set({ "darkMode": false });
                                            }

                                            setTimeout(() => {
                                                $("body").removeClass("ge-theme-transition");
                                            }, 2000);
                                        }
                                    }
                                })
                                    .prependTo($(".header-actions"));

                                chrome.storage.local.get("darkMode", (res) => {
                                    if (res.darkMode) {
                                        darkModeToogle.prop("checked", true);
                                        $("body").addClass("ge-dark-mode");
                                        $("body").addClass("ge-theme-transition");
                                        setTimeout(() => {
                                            $("body").removeClass("ge-theme-transition");
                                        }, 2000);
                                    }
                                });
                            }

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
                            let searchBar = $(".PageHeaderSearchdesktop__Input-eom9vk-2.gajVFV");
                            if (searchBar.length == 0) {
                                searchBar = $(".quick_search.search.quick_search--header");
                            }
                            searchBar.blur(() => {
                                searchBar.val("");
                            });

                            $(".header-actions *").click(() => {
                                $(".search_results_autocomplete_container").addClass("ng-hide");
                            });

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

                            const $body = $('body');
                            const $modalWindow = $('.modal_window');

                            $(document).on('DOMNodeInserted', (e) => {
                                const $target = $(e.target);

                                if ($target.hasClass('feed_dropdown--left_align')) {
                                    $target.removeClass('feed_dropdown--left_align');
                                }

                                if (
                                    e.target.tagName === 'path' &&
                                    e.target.getAttribute('d') ===
                                    'M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39' &&
                                    e.target.parentElement.classList.contains('global_search-search_icon')
                                ) {
                                    e.target.setAttribute(
                                        'd',
                                        'M21.48 20.18L14.8 13.5a8.38 8.38 0 1 0-1.43 1.4l6.69 6.69zM2 8.31a6.32 6.32 0 1 1 6.32 6.32A6.32 6.32 0 0 1 2 8.31z'
                                    );
                                    e.target.parentElement.classList.add('global_search-search_icon');
                                }

                                setTimeout(() => {
                                    if (
                                        $target.hasClass('modal_window') &&
                                        $target.find('.modal_window-content').length > 0 &&
                                        ($target.find('.modal_window-content').find('conversation-with-user').length > 0 ||
                                            $target.find('.modal_window-content').find('conversation-messages').length > 0)
                                    ) {
                                        $body.removeClass('u-noscroll u-dark_overlay');
                                        $target.css('pointer-events', 'none');
                                        $target.find('.modal_window-content').css('pointer-events', 'auto');

                                        if ($modalWindow.length > 1) {
                                            $modalWindow.first().remove();
                                        }

                                        const oldCloseButton = $target.find('.modal_window-close_button');
                                        if (oldCloseButton.length > 0) {
                                            oldCloseButton.hide();
                                        }

                                        const closeButton = document.createElement('img');
                                        closeButton.className = 'modal_window-close_button';
                                        closeButton.src = chrome.runtime.getURL('/src/images/other/closeIcon.png');
                                        closeButton.setAttribute(
                                            'onmouseover',
                                            `this.src='${chrome.runtime.getURL('/src/images/other/closeIconX.png')}'`
                                        );
                                        closeButton.setAttribute(
                                            'onmouseout',
                                            `this.src='${chrome.runtime.getURL('/src/images/other/closeIcon.png')}'`
                                        );
                                        closeButton.setAttribute('title', 'Esc');

                                        closeButton.addEventListener("click", () => {
                                            oldCloseButton.click();
                                        });

                                        $target.find(".modal_window-content").prepend(closeButton);

                                        // make the ".modal_window-content" element movable (with the mouse)
                                        $target.find(".modal_window-content").draggable({
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
                                        $('input:not(.search-field input)').on('keydown', function (e) {
                                            if (e.key === 'Enter') {
                                                $('#song_submit').click();
                                            }
                                        });

                                        // if send clicked but (on of the ".required" inputs is empty) or (the input "#song_lyrics_state" is not checked and and textarea ".add_song_page-lyrics_textarea" is empty), add for all of them a red border
                                        // else, remove the red border
                                        document.querySelector('#song_submit').addEventListener('click', async (e) => {

                                            const clickedTag = document.querySelector('.modern-chooser-button-active');
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
                                    })
                                }
                            );
                            break;
                        case 'album':

                            chrome.scripting.insertCSS(
                                {
                                    target: { tabId: tabId },
                                    files: ["./src/css/album.css"]
                                }
                            );

                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: (async () => {
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

                                        if (!$('.extension-icon').length) {
                                            chrome.runtime.sendMessage({ "album_appendIcon": [true] });
                                            chrome.runtime.sendMessage({ "album_addSongAsNext": [true] });
                                            chrome.storage.local.get(["bios", "people", "releaseDate"], (res) => {
                                                console.info("bios: " + res.bios, " people: " + res.people, " releaseDate: " + res.releaseDate);
                                                chrome.runtime.sendMessage({ "album_missingInfo": [res.bios, res.people, res.releaseDate] });
                                            });

                                            $('.header_with_cover_art-primary_info h2 .drop-target')
                                                .prepend($('<img>', {
                                                    src: chrome.runtime.getURL("/src/images/artist/Simple/32x32.png"),
                                                    class: "artist_icon",
                                                    title: "Artist"
                                                }));

                                            if ($('.header_with_cover_art metadata .metadata_unit').length) {
                                                $('.header_with_cover_art metadata .metadata_unit').text($('.header_with_cover_art .metadata_unit').text().replace("Released ", ""));
                                                $('.header_with_cover_art metadata')
                                                    .prepend($('<img>', {
                                                        src: chrome.runtime.getURL("/src/images/releaseDate/Simple/32x32.png"),
                                                        class: "release_date_icon",
                                                        title: "Release Date"
                                                    }));
                                            }
                                        }



                                        // Get the album title and artist name from the page DOM
                                        const title = document.getElementsByClassName("header_with_cover_art-primary_info-title header_with_cover_art-primary_info-title--white")[0].innerText;
                                        const artist = document.getElementsByClassName("header_with_cover_art-primary_info-primary_artist")[0].innerText;
                                        const query = [title, artist];

                                        const albumArtworks = await new Promise((resolve) => {
                                            chrome.runtime.sendMessage({ "album_autolinkArtwork": [query, "album", true] }, (response) => {
                                                resolve(response);
                                            });
                                        });

                                        console.log("albumArtworks: ", albumArtworks);

                                        // set the result as the inner text of the "albumArtworks" element
                                        $('<div>', {
                                            id: "albumArtworks",
                                            style: "display: none;",
                                            text: JSON.stringify(albumArtworks)
                                        })
                                            .appendTo('body');

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
                                    func: async () => {

                                        // Show the artwork res when hovering over the artwork
                                        const artworkElem = $('.SizedImage__Image-sc-1hyeaua-1');

                                        if (artworkElem.length) {
                                            let imageUrl = artworkElem.attr('src');

                                            if (imageUrl.includes("https://t2.genius.com/unsafe/")) {
                                                // Find the index of the last occurrence of "/"
                                                const endIndex = imageUrl.lastIndexOf("/");

                                                // Remove the prefix from the image URL & decode any HTML encoded characters in the URL
                                                imageUrl = decodeURIComponent(imageUrl.slice(endIndex + 1));
                                            }

                                            const img = new Image();
                                            img.src = imageUrl;
                                            img.onload = () => {
                                                const width = img.width;
                                                const height = img.height;

                                                artworkElem.attr('title', `Resolution: ${width}x${height}`);
                                            }
                                        }

                                        $(document).on("DOMNodeInserted", "[data-react-modal-body-trap]", (e) => {

                                            setTimeout(() => {

                                                const titleField = document.querySelector('.Fieldshared__FieldContainer-dxskot-0.metadatastyles__MetadataField-nhmb0p-1 .TextInput-sc-2wssth-0');
                                                const title = titleField.value;

                                                const artistField = document.querySelector('.Fieldshared__FieldContainer-dxskot-0.metadatastyles__MetadataSelectField-nhmb0p-2 .TagInput__Container-sc-17py0eg-0 .TagInput__MultiValueLabel-sc-17py0eg-2');
                                                const artist = artistField.textContent;

                                                const query = [artist, title];

                                                console.log(query);

                                                const ytInputContainer = $(".Fieldshared__FieldLabel-dxskot-2.eIbATv:contains('YouTube URL')");

                                                if (ytInputContainer.length && !ytInputContainer.find(".magic-wand-button-container").length) {
                                                    const magicWandContainer = $("<div>", {
                                                        class: "magic-wand-button-container",
                                                    })
                                                        .append($("<img>", {
                                                            class: "magic-wand-button-icon",
                                                            src: chrome.runtime.getURL("/src/images/magicWand/26x26.png"),
                                                        }))
                                                        .appendTo(ytInputContainer);

                                                    magicWandContainer.on("click", async function () {
                                                        const nonLatinRegex = /[\u011E-\u011F\u0130-\u0131\u015E-\u015F\u00C7-\u00E7\u0590-\u05FF\u0400-\u04FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/;

                                                        const modifiedQuery = query.map(part => {
                                                            if (part.includes(" - ") && nonLatinRegex.test(part.split(" - ")[1])) {
                                                                const [, langPart] = part.split(" - ");
                                                                return langPart;
                                                            }
                                                            return part;
                                                        }).join(" - ");

                                                        console.log(modifiedQuery);

                                                        let ytURL = await new Promise((resolve) => {
                                                            chrome.runtime.sendMessage({ "song_searchVideo": [modifiedQuery] }, (response) => {
                                                                resolve(response);
                                                            });
                                                        });

                                                        if (ytURL.length > 0) {
                                                            // Clear any previous search results
                                                            const youtubeInput = document.querySelectorAll("section.ScrollableTabs__Section-sc-179ldtd-6[data-section-index='1'] input.TextInput-sc-2wssth-0")[0];
                                                            youtubeInput.value = "";

                                                            youtubeInput.click();
                                                            youtubeInput.value = ytURL;
                                                            const event = new InputEvent("input", {
                                                                bubbles: true,
                                                                data: ytURL,
                                                            });
                                                            youtubeInput.dispatchEvent(event);
                                                        }
                                                    });
                                                }

                                                const artworkInputContainer = $(".Fieldshared__FieldLabel-dxskot-2.eIbATv:contains('Song Art')");

                                                if (artworkInputContainer.length > 0 && !artworkInputContainer.find(".magic-wand-button-container").length) {
                                                    /*const magicWandContainer = */$("<div>", {
                                                    class: "magic-wand-button-container",
                                                    disabled: true,
                                                    style: "cursor: not-allowed;"
                                                })
                                                        .append($("<img>", {
                                                            class: "magic-wand-button-icon",
                                                            src: chrome.runtime.getURL("/src/images/magicWand/26x26.png"),
                                                        }))
                                                        .appendTo(artworkInputContainer)

                                                    /*magicWandContainer.on("click", async function () {
                                                        let artwork = await new Promise((resolve) => {
                                                            chrome.runtime.sendMessage({ "album_autolinkArtwork": [query, "song", false] }, (response) => {
                                                                resolve(response);
                                                            });
                                                        });

                                                        if (artwork.length) {
                                                            artwork = artwork[0];

                                                            const artworkInput = document.querySelectorAll("section.ScrollableTabs__Section-sc-179ldtd-6[data-section-index='1'] input.TextInput-sc-2wssth-0")[2];
                                                            artworkInput.value = "";

                                                            artworkInput.click();
                                                            artworkInput.value = artwork;
                                                            const event = new InputEvent("input", {
                                                                bubbles: true,
                                                                data: artwork,
                                                            });
                                                            artworkInput.dispatchEvent(event);
                                                        }
                                                    });*/
                                                }
                                            }, 1000);
                                        });

                                        $(document).on("DOMNodeInserted", ".Modalshared__ModalSharedContainer-knew3e-0.Modaldesktop__Container-sc-1e03w42-0.cJpfVu", (e) => {

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
                                                options.forEach((option) => {
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
                                                $(button).click(() => {
                                                    $(filterDropdown).toggle();
                                                });

                                                // When the user clicks anywhere outside of the dropdown, hide it (make sure it won't hide when clicking on the button)
                                                $(document).click((e) => {
                                                    if (!$(e.target).is(button) && !$(e.target).is(filterDropdown) && !$(e.target).is(filterDropdown.find('*'))) {
                                                        $(filterDropdown).hide();
                                                    }
                                                });

                                                $('.RecentActivity__FilteringDropdownItem').click(() => {
                                                    $(this).find('.chkboxm').prop('checked', !$(this).find('.chkboxm').prop('checked'));
                                                });

                                                // When the user clicks on an option, show/hide the activity items
                                                $(filterDropdown).find('.chkboxm').click(() => {
                                                    const filterIds = $(this).attr('filter-id').split('|');
                                                    const isChecked = $(this).prop('checked');

                                                    // the activity items are in the .PlaceholderSpinnerIframe__Iframe-sc-1vue620-0 iframe, so we need to get the iframe's document
                                                    const iframe = document.querySelector('.PlaceholderSpinnerIframe__Iframe-sc-1vue620-0');

                                                    // each div child of the element with the tag name song-activity-stream is an activity item
                                                    const activityItems = Array.from(iframe.contentWindow.document.querySelector('song-activity-stream div').children);

                                                    activityItems.forEach((activityItem) => {
                                                        // the action type is in the ng-switch-when attribute of the svg element inside the element with the tag name inbox-line-item-action-icon
                                                        let actionType = activityItem.querySelector('inbox-line-item-action-icon div svg');
                                                        if (actionType) {
                                                            actionType = actionType.getAttribute('ng-switch-when');
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

                                            const activityIfame = document.querySelector('.PlaceholderSpinnerIframe__Iframe-sc-1vue620-0');

                                            if (activityIfame) {

                                                activityIfame.contentWindow.document.querySelector('song-activity-stream div').addEventListener('DOMNodeInserted', (e) => {
                                                    if (e.target.tagName === 'DIV') {
                                                        let filterIds = activityIfame.contentWindow.document.querySelector('.checked-filters');
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
                                            }
                                        });

                                        /*let isAnnotation = false;

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
                                        }*/
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

                                            var observer = new MutationObserver((mutations) => {
                                                mutations.forEach((mutation) => {
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

                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: () => {
                                        // if exists, remove the inner text (without removing the svg child) of the elements that have the class "u-quarter_vertical_margins" and at least one of the following classes: square_button--facebook, square_button--twitter, square_button--instagram
                                        // the inner text is the username in the social media
                                        const socialMediaButtons = $(".square_button--facebook, .square_button--twitter, .square_button--instagram").filter((i, el) => $(el).hasClass("u-quarter_vertical_margins"));
                                        if (socialMediaButtons.length) {
                                            const dict = {
                                                "square_button--facebook": "Facebook",
                                                "square_button--twitter": "Twitter",
                                                "square_button--instagram": "Instagram"
                                            };

                                            const socialMediaIcons = {
                                                "Facebook": chrome.runtime.getURL("src/images/socialMediaIcons/facebook.svg"),
                                                "Twitter": chrome.runtime.getURL("src/images/socialMediaIcons/twitter.svg"),
                                                "Instagram": chrome.runtime.getURL("src/images/socialMediaIcons/instagram.svg"),
                                            }

                                            const socialMediaIconsArray = Object.entries(socialMediaIcons);
                                            console.log(socialMediaIconsArray);

                                            // its a dictionary of the social media name and the username
                                            const socialMediaUsernames = socialMediaButtons.map((i, el) => {
                                                const classes = $(el).attr("class").split(" ");
                                                const socialMediaName = classes.find(className => className in dict);

                                                if (socialMediaName === "square_button--facebook") {
                                                    return {
                                                        [dict[socialMediaName]]: "@" + $(el).text().trim()
                                                    };
                                                }

                                                return {
                                                    [dict[socialMediaName]]: $(el).text().trim()
                                                };
                                            }).get();

                                            const socialMediaNames = socialMediaButtons.map((i, el) => {
                                                const classes = $(el).attr("class").split(" ");
                                                const socialMediaName = classes.find(className => className in dict);
                                                return dict[socialMediaName];
                                            }).get();

                                            // hide the old buttons, and for each social media button, create a new modern-look button with the social media name as the title attr
                                            socialMediaButtons.hide();

                                            const socialMediaButtonsContainer = $("<div>", {
                                                class: "social_media_buttons_container",
                                            })

                                            socialMediaNames.forEach(socialMediaName => {
                                                $("<div>", {
                                                    class: "social_media_button ",
                                                    title: socialMediaName,
                                                })
                                                    .append($("<div>", {
                                                        class: "social_media_button_icon",
                                                    })
                                                        .append($("<img>", {
                                                            src: socialMediaIconsArray.find(icon => icon[0] === socialMediaName)[1],
                                                        }))
                                                    )
                                                    .append($("<div>", {
                                                        class: "social_media_button_username",
                                                        text: socialMediaUsernames.find(username => Object.keys(username)[0] === socialMediaName)[socialMediaName],
                                                    }))
                                                    .appendTo(socialMediaButtonsContainer);
                                            });

                                            // add the buttons as a child of the element with the tag name "profile-artist-pane", and before the element with the attribute "ng-init" equal to "$ctrl.show_leaderboard = true"
                                            socialMediaButtonsContainer.insertBefore($("profile-artist-pane").find("[ng-init='$ctrl.show_leaderboard = true']"));

                                            socialMediaButtonsContainer.find('.social_media_button').each((i, el) => {
                                                $(el).click(() => {
                                                    socialMediaButtons[i].click();
                                                });
                                            });
                                        }
                                    }
                                });
                            break;
                    }
                }
            })
        }
    }
})
