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
import { geniusGlobalContentScript } from "./src/js/globalContent.js";

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
        func: geniusGlobalContentScript,
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
