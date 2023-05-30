/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer-Beta/blob/main/LICENSE.md
 */

import {
    fixNonLatin,
    getDetails,
    getArtistsList,
    getCreditsList,
    identifyPageType,
    replaceTextarea,
    removeQuill
} from "./src/js/sideFunctions.js";
import {
    missingInfo,
    removeMissingInfo,
    appendIcon,
    autolinkArtwork,
    getPlaylistVideos,
    saveEverything,
    addSongAsNext
} from "./src/js/sideFunctions_album.js";
import {
    appleMusicPopUp,
    spotifyPopUp,
    song_modernTextEditor,
    searchVideo,
    appendFollowButton
} from "./src/js/sideFunctions_song.js";
import {
    replaceButtons,
    forums_modernTextEditor
} from "./src/js/sideFunctions_forum.js";
import { handleSongPage } from "./src/js/pages/song.js";
import { handleFirehose } from "./src/js/pages/firehose.js";
import { handleNewSong } from "./src/js/pages/newSong.js";
import { handleHome } from "./src/js/pages/home.js";
import { handleAlbum } from "./src/js/pages/album.js";
import { handleForum } from "./src/js/pages/forum.js";
import { handleForumThread } from "./src/js/pages/forumThread.js";
import { handleProfile } from "./src/js/pages/profile.js";
import { handleNewPost } from "./src/js/pages/newPost.js";
import { handleForumsMain } from "./src/js/pages/forumsMain.js";
import { handlePenalties } from "./src/js/pages/mecha.penalties.js";

function getTabId() {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({
                active: true
            }, (tabs) => {
                resolve(tabs[0].id);
            });
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
        case "install":
            chrome.storage.local.set({ "bios": true });
            chrome.storage.local.set({ "people": true });
            chrome.storage.local.set({ "releaseDate": true });
            chrome.storage.local.set({ "appleMusicPopUp": true });
            chrome.storage.local.set({ "spotifyPopUp": true });
            chrome.storage.local.set({ "add_song_as_next": true });
            chrome.storage.local.set({ "ModernTextEditor": true });
            chrome.storage.local.set({ "forums2": true });
            chrome.storage.local.set({ "extensionStatus": true });
            chrome.storage.local.set({ "OldSongPage": false });
            chrome.storage.local.set({ "darkMode": false });
            break;
        case "update":
            // var newURL = "https://uri6.github.io/genius-enhancer/versions/";
            // chrome.tabs.create({ url: newURL });
            break;
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    getTabId().then((tabId) => {
        const functions = {
            fixNonLatin: [fixNonLatin, message.fixNonLatin],
            getDetails: [getDetails, [""]],
            getArtistsList: [getArtistsList, message.getArtistsList],
            getCreditsList: [getCreditsList, message.getCreditsList],
            identifyPageType: [identifyPageType, [""]],
            replaceTextarea: [replaceTextarea, message.replaceTextarea],
            removeQuill: [removeQuill, [""]],
            album_appendIcon: [appendIcon, message.album_appendIcon],
            album_addSongAsNext: [addSongAsNext, message.album_addSongAsNext],
            album_missingInfo: [missingInfo, message.album_missingInfo],
            album_missingInfo_remove: [removeMissingInfo, message.album_missingInfo_remove],
            album_autolinkArtwork: [autolinkArtwork, message.album_autolinkArtwork],
            album_getPlaylistVideos: [getPlaylistVideos, message.album_getPlaylistVideos],
            album_saveEverything: [saveEverything, message.album_saveEverything],
            song_appleMusicPopUp: [appleMusicPopUp, message.song_appleMusicPopUp],
            song_spotifyPopUp: [spotifyPopUp, message.song_spotifyPopUp],
            song_modernTextEditor: [song_modernTextEditor, message.song_modernTextEditor],
            song_appendFollowButton: [appendFollowButton, message.song_appendFollowButton],
            song_searchVideo: [searchVideo, message.song_searchVideo],
            forums_replaceButtons: [replaceButtons, message.forums_replaceButtons],
            forums_modernTextEditor: [forums_modernTextEditor, message.forums_modernTextEditor]
        };

        const [func, args] = functions[Object.keys(message)[0]] || [];

        if (!func) {
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: func,
            args: args
        }).then((results) => {
            const res = (func === autolinkArtwork ||
                func === identifyPageType ||
                func === getPlaylistVideos ||
                func === getDetails ||
                func === getArtistsList ||
                func === getCreditsList ||
                func === searchVideo ||
                func === fixNonLatin) ? results[0].result : undefined;

            console.info("----------------------------------------");
            console.info("%c new message received ", "background-color: #ff1464; color: #fff; padding: 5px; text-align: center; font-size: 15px; font-weight: bold; display: block; border-radius: 5px;");
            console.info("time received: ", new Date().toLocaleTimeString("en-US", { hour12: false }));
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
const geniusAddress = ["https://www.genius.com/", "https://genius.com/"];

async function handleGeniusPage(tabId) {
    if (pageType !== undefined) {
        await chrome.storage.local.set({ "pageType": pageType });
    }

    const forumsV2 = (await chrome.storage.local.get("forums2"))?.forums2 || false;

    await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (() => {
            const body = $("body");

            if (!$("#ge-theme-toggle").length && $(".header-actions").length) {
                const darkModeToogle = $("<input>", {
                    id: "ge-theme-toggle",
                    class: "ge-theme-toggle",
                    type: "checkbox",
                    on: {
                        click: function() {
                            body.addClass("ge-theme-transition");

                            if ($(this).is(":checked")) {
                                body.addClass("ge-dark-mode");
                                chrome.storage.local.set({ "darkMode": true });
                            } else {
                                body.removeClass("ge-dark-mode");
                                chrome.storage.local.set({ "darkMode": false });
                            }

                            setTimeout(() => {
                                body.removeClass("ge-theme-transition");
                            }, 200);
                        }
                    }
                })
                    .prependTo($(".header-actions"));

                chrome.storage.local.get("darkMode", (res) => {
                    if (res.darkMode) {
                        darkModeToogle.prop("checked", true);
                        body.addClass("ge-dark-mode");
                        body.addClass("ge-theme-transition");
                        setTimeout(() => {
                            $("body").removeClass("ge-theme-transition");
                        }, 200);
                    }
                });
            }

            // move the div with the classes "PageHeaderdesktop__Subnavigation-bhx5ui-6 koeYQd"
            // (or the element with the class "header-nav_menu" if there's no element with the classes above)
            // to after the element with the classes "PageHeaderLogo__Link-sc-175tsd3-0 jNXEyt"
            // (or to after the element with the class "logo_container" if there's no element with the classes above)
            const subNav = $(".header-nav_menu, .PageHeaderdesktop__Subnavigation-bhx5ui-6");

            const logo = $(".logo_container, .PageHeaderLogo__Link-sc-175tsd3-0");
            subNav.insertAfter(logo);

            // Recreate the header menu content
            const $headerNavMenu = $(".header-nav_menu, .PageHeaderdesktop__Subnavigation-bhx5ui-6");
            const $headerMenuItems = $headerNavMenu.find("header-menu-item");
            const $menuItems = $headerMenuItems.length ? $headerMenuItems : $headerNavMenu.find("a");
            const onHomePage = !$headerNavMenu.hasClass("header-nav_menu");

            if ($menuItems.length > 0 && $(".ge-inject").length < 1) {
                $menuItems.remove();
                const newItems = [{ title: "Forums", href: "https://genius.com/forums" }, {
                    title: "Add Song",
                    href: "https://genius.com/songs/new"
                }, { title: "Guides", href: "https://genius.com/albums/Genius/Guides" }, {
                    title: "GeniusGraph",
                    href: "https://larsbutnotleast.xyz/genius"
                }];
                newItems.forEach((item) => {
                    const $item = $(`<a class="nav_menu-link ng-binding PageHeaderdesktop__Link-bhx5ui-4 jQULAr" href="${item.href}">${item.title}</a>`);
                    if (onHomePage) {
                        $headerNavMenu.append($item);
                    } else {
                        $headerNavMenu.append(`<li class="nav_menu-item ng-scope ge-inject">${$item[0].outerHTML.replace("class=\"nav_menu-link ng-binding PageHeaderdesktop__Link-bhx5ui-4 jQULAr\"", "class=\"nav_menu-link ng-binding\"")}</li>`);
                    }
                });
            }

            // if there's an element with the class "lyrics_controls", when it sticky add the class "sticky" to this element
            // make sure that the class "sticky" is removed when the element is not sticky
            const lyricsControls = $(".lyrics_controls");
            if (lyricsControls.length > 0) {
                let sticky = lyricsControls.offset().top;
                $(window).on("scroll", () => {
                    if ($(window).scrollTop() > sticky) {
                        lyricsControls.addClass("sticky");
                    } else {
                        lyricsControls.removeClass("sticky");
                    }
                });
            }

            // clean the search bar from the "Search" text when not focused
            // the search bar is the element with the classes "PageHeaderSearchdesktop__Input-eom9vk-2 gajVFV" or "quick_search search quick_search--header"
            let searchBar = $(".PageHeaderSearchdesktop__Input-eom9vk-2.gajVFV");
            if (searchBar.length) {
                searchBar = $(".quick_search.search.quick_search--header");
            }
            searchBar.on("blur", () => {
                searchBar.val("");
            });

            $(".header-actions *").on("click", () => {
                $(".search_results_autocomplete_container").addClass("ng-hide");
            });

            // const adminHeader = $("div[ng-show='$ctrl.open_header_menus.admin_menu']");
            const feedbackButton = $("a[href='/feedback/new']");
            const iosChartbeat = $("a[href='/chartbeat?ios=1']");

            feedbackButton?.remove();
            iosChartbeat?.remove();

            // adminHeader?.append('<a href="/users/recent_signups" class="feed_dropdown-item feed_dropdown-item--link">Recent Signups</a>');

            const $modalWindow = $(".modal_window");

            $(document).on("DOMNodeInserted", (e) => {
                const $target = $(e.target);

                if ($target.hasClass("feed_dropdown--left_align")) {
                    $target.removeClass("feed_dropdown--left_align");
                }

                if (e.target.tagName === "path" && e.target.getAttribute("d") === "M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39" && e.target.parentElement.classList.contains("global_search-search_icon")) {
                    e.target.setAttribute("d", "M21.48 20.18L14.8 13.5a8.38 8.38 0 1 0-1.43 1.4l6.69 6.69zM2 8.31a6.32 6.32 0 1 1 6.32 6.32A6.32 6.32 0 0 1 2 8.31z");
                    e.target.parentElement.classList.add("global_search-search_icon");
                }

                setTimeout(() => {
                    if ($target.hasClass("modal_window") && $target.find(".modal_window-content").length > 0 && ($target.find(".modal_window-content").find("conversation-with-user").length > 0 || $target.find(".modal_window-content").find("conversation-messages").length > 0)) {
                        body.removeClass("u-noscroll u-dark_overlay");
                        $target.css("pointer-events", "none");
                        $target.find(".modal_window-content").css("pointer-events", "auto");

                        if ($modalWindow.length > 1) {
                            $modalWindow.first().remove();
                        }

                        const oldCloseButton = $target.find(".modal_window-close_button");
                        if (oldCloseButton.length > 0) {
                            oldCloseButton.hide();
                        }

                        const closeButton = document.createElement("img");
                        closeButton.className = "modal_window-close_button";
                        closeButton.src = chrome.runtime.getURL("/src/images/other/closeIcon.png");
                        closeButton.setAttribute("onmouseover", `this.src='${chrome.runtime.getURL("/src/images/other/closeIconX.png")}'`);
                        closeButton.setAttribute("onmouseout", `this.src='${chrome.runtime.getURL("/src/images/other/closeIcon.png")}'`);
                        closeButton.setAttribute("title", "Esc");

                        closeButton.addEventListener("click", () => {
                            oldCloseButton.trigger("click");
                        });

                        $target.find(".modal_window-content").prepend(closeButton);

                        $target.find(".modal_window-content").draggable({
                            handle: ".modal_window-header", containment: "window", scroll: false
                        });

                        const $buttonsRow = $target.find("form>.u-bottom_margin:has(span)");

                        if ($buttonsRow.length > 0 && $buttonsRow.find(".ge-magic-button").length === 0) {
                            const svgIcon = chrome.runtime.getURL("/src/images/magicWand/colorful.svg");
                            const magicButton = $("<span>", {
                                class: "text_label text_label--no_margin u-small_horizontal_margins text_label--purple text_label--button ge-magic-button"
                            })
                                .append($("<img>", {
                                    src: svgIcon
                                }))
                                .appendTo($buttonsRow);

                            const templates = {
                                "Strikes": {
                                    "offense": [
                                        "Mass-Downvoting",
                                        "Harassment",
                                        "Hate Speech",
                                        "Trolling",
                                        "Spamming",
                                        "Derailing or Hijacking",
                                        "Creating Alternate Accounts",
                                        "Advertisements, Leaks, or Illegal Content",
                                        "Improperly Sourcing Snippets",
                                        "Shitposting"
                                    ],
                                    "strikeStatus": [
                                        "Warning",
                                        "Strike 1",
                                        "Strike 2",
                                        "Ban"
                                    ]
                                },
                                "Post-Warning Perma": {
                                    "offense": [
                                        "Uploading Harmful Content",
                                        "IQ Gaming",
                                        "Inappropriate & Trolling Annotations",
                                        "Plagiarism",
                                        "Song Page Self-Promotion",
                                        "Account Sharing",
                                        "Offensive Usernames & Avatars",
                                        "Uploading Leaks"
                                    ],
                                    "postPermaStatus": [
                                        "Warning",
                                        "Ban"
                                    ]
                                },
                                "Immediate Perma": {
                                    "offense": [
                                        "Pageview Boosting",
                                        "Song Page Tampering",
                                        "Song Page Spamming",
                                        "Sharing Private Information & Phishing",
                                        "NSFW Content",
                                        "Subversive Alternate Account Creation",
                                        "Severe Harassment",
                                        "Impersonating an Artist"
                                    ]
                                }
                            };

                            const additionalOptions = {
                                "Offensive Profile Content": [
                                    "Avatar",
                                    "Username",
                                    "Bio"
                                ]
                            };

                            const templateChooser = $("<div>", {
                                class: "ge-message-template-chooser",
                                style: "display: none;"
                            })
                                .appendTo(magicButton);


                            magicButton.on("click", () => {
                                const $formContainer = $(".square_input.conversation-message_textarea").parent();
                                $formContainer.find("#punishmentForm").remove();

                                const $form = $("<form>", {
                                    id: "punishmentForm",
                                }).insertBefore($(".square_input.conversation-message_textarea"));

                                const $typeSelect = $("<select>", {
                                    id: "typeSelect",
                                    html: "<option selected hidden>Choose Punishment Type</option>"
                                }).appendTo($form);

                                Object.keys(templates).forEach(type => {
                                    $typeSelect.append(new Option(type, type));
                                });

                                const $offenseSelect = $("<select>", {
                                    id: "offenseSelect",
                                    style: "display: none;",
                                    html: "<option selected hidden>Choose Offense</option>"
                                }).appendTo($form);

                                const $statusSelect = $("<select>", {
                                    id: "statusSelect",
                                    style: "display: none;",
                                    html: "<option selected hidden>Choose Status</option>"
                                }).appendTo($form);

                                const $additionalSelect = $("<select>", {
                                    id: "additionalSelect",
                                    style: "display: none;",
                                    html: "<option selected hidden>Choose Offensive Content</option>"
                                }).appendTo($form);

                                const $plagiarismInput = $("<input>", {
                                    id: "plagiarismSource",
                                    type: "text",
                                    placeholder: "Enter Plagiarism Source",
                                    style: "display: none;"
                                }).appendTo($form);

                                $("<input>", {
                                    type: "submit",
                                    value: "Generate"
                                }).appendTo($form);

                                $typeSelect.change(() => {
                                    const selectedType = $typeSelect.val();
                                    $offenseSelect.empty().append("<option selected hidden>Choose Offense</option>");
                                    templates[selectedType].offense.forEach(offense => {
                                        $offenseSelect.append(new Option(offense, offense));
                                    });
                                    $offenseSelect.show();
                                });

                                $offenseSelect.change(() => {
                                    const selectedType = $typeSelect.val();
                                    const selectedOffense = $offenseSelect.val();
                                    if (templates[selectedType].hasOwnProperty("strikeStatus") || templates[selectedType].hasOwnProperty("postPermaStatus")) {
                                        const statusOptions = templates[selectedType].hasOwnProperty("strikeStatus") ? templates[selectedType].strikeStatus : templates[selectedType].postPermaStatus;
                                        $statusSelect.empty().append("<option selected hidden>Choose Status</option>");
                                        statusOptions.forEach(status => {
                                            $statusSelect.append(new Option(status, status));
                                        });
                                        $statusSelect.show();
                                    }

                                    if (selectedType === "Post-Warning Perma" && selectedOffense === "Offensive Usernames & Avatars") {
                                        $additionalSelect.empty().append("<option selected hidden>Choose Offensive Content</option>");
                                        additionalOptions["Offensive Profile Content"].forEach(option => {
                                            $additionalSelect.append(new Option(option, option));
                                        });
                                        $additionalSelect.show();
                                    } else {
                                        $additionalSelect.hide();
                                    }

                                    if (selectedType === "Post-Warning Perma" && selectedOffense === "Plagiarism") {
                                        $plagiarismInput.show();
                                    } else {
                                        $plagiarismInput.hide();
                                    }
                                });

                                $form.submit((event) => {
                                    event.preventDefault();

                                    let payload = {
                                        type: $typeSelect.val(),
                                        offense: $offenseSelect.val()
                                    };

                                    const selectedType = $typeSelect.val();
                                    if (templates[selectedType].hasOwnProperty("strikeStatus")) {
                                        payload["strikeStatus"] = $statusSelect.val();
                                    }
                                    if (templates[selectedType].hasOwnProperty("postPermaStatus")) {
                                        payload["postPermaStatus"] = $statusSelect.val();
                                    }
                                    if (selectedType === "Post-Warning Perma" && payload.offense === "Offensive Usernames & Avatars") {
                                        payload["inappropriateUC"] = $additionalSelect.val();
                                    }
                                    if (selectedType === "Post-Warning Perma" && payload.offense === "Plagiarism") {
                                        payload["plagiarismSource"] = $plagiarismInput.val();
                                    }

                                    const requestOptions = {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(payload)
                                    };

                                    fetch("https://backend.rdil.rocks/genius/templates/generate", requestOptions)
                                        .then(response => response.text())
                                        .then(result => {
                                            const entities = {
                                                "&amp;": "&",
                                                "&lt;": "<",
                                                "&gt;": ">",
                                                "&quot;": "\"",
                                                "&#39;": "'",
                                                "&#x2F;": "/",
                                                "&#x60;": "`",
                                                "&#x3D;": "="
                                            };

                                            return result.replace(/&(amp|lt|gt|quot|#39|#x2F|#x60|#x3D);/g, function (match, entity) {
                                                return entities[match];
                                            });
                                        })
                                        .then(cleanedResult => {
                                            $(".square_input.conversation-message_textarea").val(cleanedResult);
                                            const event = new Event("change", { bubbles: true });
                                            $(".square_input.conversation-message_textarea")[0].dispatchEvent(event);

                                            $form.remove();
                                        });
                                });
                            });
                        }
                    }
                }, 1);
            });
        })
    });

    console.info("page type", pageType);

    if (pageType == null || pageType === "unknown") {
        return;
    }

    const forumPages = ["forums (main)", "forum", "forum thread", "new post"];

    if (forumPages.includes(pageType) && !forumsV2) {
        return;
    }

    switch (pageType) {
        case "new song":
            await handleNewSong(tabId);
            break;
        case "firehose":
            await handleFirehose(tabId);
            break;
        case "home":
            await handleHome(tabId);
            break;
        case "album":
            await handleAlbum(tabId);
            break;
        case "song":
            await handleSongPage(tabId);
            break;
        case "forums (main)":
            await handleForumsMain(tabId);
            break;
        case "forum":
            await handleForum(tabId);
            break;
        case "forum thread":
            await handleForumThread(tabId);
            break;
        case "new post":
            await handleNewPost(tabId);
            break;
        case "profile":
            await handleProfile(tabId, url);
            break;
        case "mecha.penalties":
            await handlePenalties(tabId);
            break;
    }
}

const files = [
    {
        type: "css",
        file: "./src/css/content-style.css"
    },
    {
        type: "css",
        file: "./src/css/darkmode.css"
    },
    {
        type: "css",
        file: "./lib/tagify/tagify.css",
        only: ["album"]
    },
    {
        type: "css",
        file: "./lib/dragsort/dragsort.css",
        only: ["album"]
    },
    {
        type: "css",
        file: "./lib/quilljs/quill.snow.css"
    },
    {
        type: "css",
        file: "./lib/js-datepicker/datepicker.min.css",
        only: ["album"]
    },
    {
        type: "js",
        file: "./lib/jquery/jquery.min.js"
    },
    {
        type: "js",
        file: "./lib/jquery/jquery-ui.min.js"
    },
    {
        type: "js",
        file: "./lib/tagify/tagify.jq.min.js",
        only: ["album"]
    },
    {
        type: "js",
        file: "./lib/dragsort/dragsort.js",
        only: ["album"]
    },
    {
        type: "js",
        file: "./lib/quilljs/quill.min.js"
    },
    {
        type: "js",
        file: "./lib/axios/axios.min.js"
    },
    {
        type: "js",
        file: "./lib/js-datepicker/datepicker.min.js",
        only: ["album"]
    }
];

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    chrome.storage.local.get("extensionStatus", async (res) => {
        if (res.extensionStatus) {
            isGeniusPage = geniusAddress.some((adress) => tab.url.startsWith(adress));
            await chrome.storage.local.set({ "isGeniusPage": isGeniusPage });
            url = tab.url;

            console.info("----------------------------------------");
            console.info("%c new tab loaded ", "background-color: #fffe65; color: #000; padding: 5px; text-align: center; font-size: 15px; font-weight: bold; display: block; border-radius: 5px;");
            console.info("time loaded: " + new Date().toLocaleTimeString("en-US", { hour12: false }));
            console.info("tab id: " + tabId);
            console.info("changeInfo: " + changeInfo.status);
            console.info("tab: " + tab.title + ", " + tab.url);
            console.info("isGeniusPage: " + isGeniusPage);

            await chrome.storage.local.set({ "album_artwork_results": "" });
            pageType = "unknown";

            const prohibitedDomains = ["promote.genius.com", "support.genius.com", "docs.genius.com", "homestudio.genius.com", "genius.com/developers", "genius.com/api-clients", "api.genius.com"];

            const protocolAndDomainRegex = /^https:\/\/([^\/]+)/;
            const protocolAndDomainMatch = tab.url.match(protocolAndDomainRegex);

            if (protocolAndDomainMatch !== null && prohibitedDomains.includes(protocolAndDomainMatch[1])) {
                return;
            }

            if (changeInfo.status !== "complete" || !tab.url.includes("genius.com")) {
                return;
            }

            console.info("----------------------------------------");
            console.info("%c loaded files ", "background-color: #ad2885; color: #fff; padding: 5px; text-align: center; font-size: 15px; font-weight: bold; display: block; border-radius: 5px;");
            console.info("time loaded: ", new Date().toLocaleTimeString("en-US", { hour12: false }));

            if (!isGeniusPage) {
                return;
            }

            async function getPageType() {
                const returnVal = await chrome.scripting.executeScript({
                    target: { tabId: tabId }, func: getDetails
                });

                if (returnVal !== undefined && returnVal[0].result != null) {
                    pageObject = returnVal[0].result;
                    return pageObject.page_type;
                }

                if (!(returnVal === undefined || returnVal[0].result == null || pageType === undefined || pageType === "unknown")) {
                    return undefined;
                }

                const urlPart = tab.url.split("genius.com/")[1];

                if (!urlPart.includes("/") && (urlPart.endsWith("-lyrics") || urlPart.endsWith("-lyrics/") || urlPart.endsWith("-annotated") || urlPart.endsWith("-annotated/") || urlPart.endsWith("?react=1") || urlPart.endsWith("?bagon=1") || urlPart.endsWith("?bagon=1/"))) {
                    // we may not reach the end of the function by the time chrome updates. just in case!
                    pageType = "song";

                    chrome.storage.local.get("OldSongPage", (res) => {
                        if (res.OldSongPage) {
                            let currentUrl = tab.url;
                            if (currentUrl.indexOf("?bagon=1") === -1 && currentUrl.indexOf("?react=1") === -1) {
                                currentUrl += "?bagon=1";
                                chrome.tabs.update(tabId, {
                                    url: currentUrl
                                });
                            }
                        } else if (res.OldSongPage === undefined) {
                            console.error("OldSongPage is undefined\nPlease report this error here: https://uri6.github.io/genius-enhancer/report-and-suggest/");
                        }
                    });

                    return "song";
                } else if (geniusAddress.some((address) => tab.url === address) || (urlPart[0] === "#" && !urlPart.includes("/"))) {
                    return "home";
                } else if (geniusAddress.some((address) => tab.url.startsWith(address + "firehose"))) {
                    return "firehose";
                } else if (geniusAddress.some((address) => tab.url === address + "new" || tab.url === address + "new/" || tab.url === address + "songs/new" || tab.url === address + "songs/new/")) {
                    return "new song";
                } else if (geniusAddress.some((address) => tab.url.startsWith(address + "penalties"))) {
                    return "mecha.penalties";
                }

                const isForumPage = await chrome.scripting.executeScript({
                    target: { tabId: tabId }, func: () => (
                        (document.getElementsByClassName("group_summary").length > 0)
                    )
                });

                if (isForumPage?.[0]?.result) {
                    if (tab.url.endsWith("/forums")) {
                        return "forums (main)";
                    } else if (tab.url.endsWith("/new")) {
                        return "new post";
                    } else if (tab.url.includes("/discussions/")) {
                        return "forum thread";
                    } else {
                        return "forum";
                    }
                }
            }

            pageType = await getPageType();

            function applicable(file) {
                const enabled = file.only?.includes(pageType) ?? true;
                console.debug(file, enabled);
                return enabled;
            }

            const cssFiles = files
                .filter((f) => f.type === "css" && applicable(f))
                .map((f) => f.file);

            const baseJsFiles = files
                .filter((f) => f.type === "js" && applicable(f))
                .map((f) => f.file);

            console.info("css files: ", cssFiles);
            console.info("js files: ", baseJsFiles);

            // inject relevant css/js files
            if (cssFiles.length) {
                await chrome.scripting.insertCSS({
                    target: { tabId: tabId }, files: cssFiles
                });
            }

            if (baseJsFiles.length) {
                await chrome.scripting.executeScript({
                    target: { tabId: tabId }, files: baseJsFiles
                });
            }

            await handleGeniusPage(tabId);

        }
    });
});
