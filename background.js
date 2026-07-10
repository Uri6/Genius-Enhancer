/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

import {
    fixNonLatin,
    getDetails,
    getArtistsList,
    getCreditsList,
    identifyPageType,
    replaceTextarea
} from "./src/js/sideFunctions/global.js";
import {
    missingInfo,
    removeMissingInfo,
    appendIcon,
    autolinkArtwork,
    getPlaylistVideos,
    saveEverything,
    addSongAsNext
} from "./src/js/sideFunctions/album.js";
import {
    appleMusicPopUp,
    spotifyPopUp,
    soundCloudPopUp,
    song_modernTextEditor,
    searchVideo,
    reactSongAdditions
} from "./src/js/sideFunctions/song.js";
import {
    replaceButtons,
    forums_modernTextEditor
} from "./src/js/sideFunctions/forum.js";
import { handleSongPage } from "./src/js/pages/song.js";
import { handleFirehose } from "./src/js/pages/firehose.js";
import { handleAddASong } from "./src/js/pages/addASong.js";
import { handleHome } from "./src/js/pages/home.js";
import { handleAlbum } from "./src/js/pages/album.js";
import { handleForum } from "./src/js/pages/forum.js";
import { handleForumThread } from "./src/js/pages/forumThread.js";
import { handleProfile } from "./src/js/pages/profile.js";
import { handleNewPost } from "./src/js/pages/newPost.js";
import { handleForumsMain } from "./src/js/pages/forumsMain.js";
import { handlePenalties } from "./src/js/pages/mecha.penalties.js";
import { geniusGlobalContentScript } from "./src/js/globalContent.js";

async function getTabId(sender) {
    if (sender?.tab?.id !== undefined) {
        return sender.tab.id;
    }
    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    return tabs[0]?.id;
}

function isInjectableGeniusUrl(tabUrl) {
    try {
        const parsed = new URL(tabUrl);
        return parsed.protocol === "https:" &&
            (parsed.hostname === "genius.com" || parsed.hostname === "www.genius.com");
    } catch {
        return false;
    }
}

const defaultSettings = {
    bios: true,
    people: true,
    releaseDate: true,
    appleMusicPopUp: true,
    spotifyPopUp: true,
    soundCloudPopUp: true,
    add_song_as_next: true,
    ModernTextEditor: false,
    extensionStatus: true,
    OldSongPage: false,
    darkMode: false,
    powerbarStatus: true,
    openPowerbarResultsInNewTab: false,
    defaultSearchType: "multi",
    powerbarHotkey: "Shift + Shift",
    songHeadersLanguage: "songsLang",
    modernAddASong: true,
    modernForums: true
};

async function initializeMissingSettings() {
    const currentSettings = await chrome.storage.local.get(Object.keys(defaultSettings));
    const missingSettings = Object.fromEntries(
        Object.entries(defaultSettings).filter(([key]) => currentSettings[key] === undefined)
    );
    if (Object.keys(missingSettings).length) {
        await chrome.storage.local.set(missingSettings);
    }
}

initializeMissingSettings().catch((error) => {
    console.error("Failed to initialize Genius Enhancer settings", error);
});

chrome.runtime.onInstalled.addListener(async (details) => {
    const currentVersion = chrome.runtime.getManifest().version;
    const previousVersion = details.previousVersion;
    const reason = details.reason;

    switch (reason) {
        case "install":
            await chrome.storage.local.set(defaultSettings);
            break;
        case "update":
            if (previousVersion) {
                const missedVersions = await calculateMissedVersions(previousVersion, currentVersion);
                const releaseNotes = await getReleaseNotes(missedVersions);

                // Filter out versions with empty release notes
                const validReleaseNotes = releaseNotes.filter((note) => note.trim() !== "");

                if (validReleaseNotes.length > 0) {
                    // Create a long string variable with version notes and horizontal lines
                    const notesString = validReleaseNotes.map((note, index) => {
                        const versionNote = `# Version ${missedVersions[index]}\n\n${note}`;

                        // Add horizontal line if it's not the last version note
                        if (index < validReleaseNotes.length - 1) {
                            return `${versionNote}\n\n${"-".repeat(50)}`;
                        } else {
                            return versionNote;
                        }
                    }).join("\n\n");

                    const cleanNotes = notesString
                        .replace(/\n@[\w-]+(\s@[\w-]+)*/g, "") // Remove line(s) that only contain @mentions
                        .replace(/#\d+/g, ""); // Remove issues & PRs references

                    chrome.storage.local.set({ "changelog": cleanNotes });
                }
            }

            break;
    }
});

async function calculateMissedVersions(previousVersion, currentVersion) {
    const versionsUrl = "https://api.github.com/repos/Uri6/Genius-Enhancer/tags";

    // Get all versions from GitHub
    const response = await fetch(versionsUrl);
    const data = await response.json();
    const versions = data.map((version) => version.name);

    // Get the index of the previous version
    const previousVersionIndex = versions.indexOf(previousVersion);

    // Get the index of the current version
    const currentVersionIndex = versions.indexOf(currentVersion);

    // Get the versions between the previous and current versions
    return versions.slice(currentVersionIndex, previousVersionIndex);
}

async function getReleaseNotes(versions) {
    const releaseNotes = [];

    for (const version of versions) {
        const releaseUrl = `https://api.github.com/repos/Uri6/Genius-Enhancer/releases/tags/${version}`;
        const response = await fetch(releaseUrl);

        if (response.status === 200) {
            const data = await response.json();
            const notes = data.body.trim();

            // Only add notes that are not empty
            if (notes) {
                releaseNotes.push(notes);
            }
        }
    }

    return releaseNotes;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    getTabId(sender).then(async (tabId) => {
        if (tabId === undefined) {
            sendResponse(undefined);
            return;
        }

        const targetTab = sender?.tab || await chrome.tabs.get(tabId);
        if (!isInjectableGeniusUrl(targetTab?.url)) {
            sendResponse(undefined);
            return;
        }

        const functions = {
            fixNonLatin: [fixNonLatin, message.fixNonLatin],
            getDetails: [getDetails, [""]],
            getArtistsList: [getArtistsList, message.getArtistsList],
            getCreditsList: [getCreditsList, message.getCreditsList],
            identifyPageType: [identifyPageType, [""]],
            replaceTextarea: [replaceTextarea, message.replaceTextarea],
            album_appendIcon: [appendIcon, message.album_appendIcon],
            album_addSongAsNext: [addSongAsNext, message.album_addSongAsNext],
            album_missingInfo: [missingInfo, message.album_missingInfo],
            album_missingInfo_remove: [removeMissingInfo, message.album_missingInfo_remove],
            album_autolinkArtwork: [autolinkArtwork, message.album_autolinkArtwork],
            album_getPlaylistVideos: [getPlaylistVideos, message.album_getPlaylistVideos],
            album_saveEverything: [saveEverything, message.album_saveEverything],
            song_appleMusicPopUp: [appleMusicPopUp, message.song_appleMusicPopUp],
            song_spotifyPopUp: [spotifyPopUp, message.song_spotifyPopUp],
            song_soundCloudPopUp: [soundCloudPopUp, message.song_soundCloudPopUp],
            song_modernTextEditor: [song_modernTextEditor, message.song_modernTextEditor],
            song_reactSongAdditions: [reactSongAdditions, message.song_reactSongAdditions],
            song_searchVideo: [searchVideo, message.song_searchVideo],
            forums_replaceButtons: [replaceButtons, message.forums_replaceButtons],
            forums_modernTextEditor: [forums_modernTextEditor, message.forums_modernTextEditor]
        };

        const [func, args] = functions[Object.keys(message)[0]] || [];

        if (!func) {
            sendResponse(undefined);
            return;
        }

        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: func,
            args: args
        });
        const res = (func === autolinkArtwork ||
            func === identifyPageType ||
            func === getPlaylistVideos ||
            func === getDetails ||
            func === getArtistsList ||
            func === getCreditsList ||
            func === searchVideo ||
            func === fixNonLatin) ? results[0]?.result : undefined;

        console.info("----------------------------------------");
        console.info("%c new message received ", "background-color: #ff1464; color: #fff; padding: 5px; text-align: center; font-size: 15px; font-weight: bold; display: block; border-radius: 5px;");
        console.info("time received: ", new Date().toLocaleTimeString("en-US", { hour12: false }));
        console.info("message received: ", message);
        console.info("function called: ", func.name);
        console.info("arguments: ", args);
        console.info("response: ", res);

        sendResponse(res);
    }).catch((error) => {
        console.warn("Genius Enhancer could not handle a page message", error);
        sendResponse(undefined);
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

    const forumsV2 = (await chrome.storage.local.get("modernForums"))?.modernForums || false;
    const changelog = (await chrome.storage.local.get("changelog"))?.changelog || false;
    const sprinkleConfetti = () => {
        const duration = 2.5 * 1000,
            animationEnd = Date.now() + duration,
            defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 30 * (timeLeft / duration);

            // since particles fall down, start a bit higher than random
            confetti(
                Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                })
            );
            confetti(
                Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                })
            );
        }, 250);
    };

    if (changelog) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: sprinkleConfetti
        });

        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: async () => {
                const changelog = (await chrome.storage.local.get("changelog"))?.changelog || false;
                const converter = new showdown.Converter();
                const changelogHTML = converter.makeHtml(changelog);
                const closeButtonPhrases = [
                    "gotcha, thanks",
                    "cool",
                    "nice",
                    "great work",
                    "keep me updated",
                    "seems useful, tnx",
                    "superb, ty",
                    "awesome"
                ];
                const supportButtonPhrases = [
                    "help maintaining this project 🦾",
                    "buy me a beer 🍻",
                    "take my money 💸",
                    "keep the lights on 💡",
                    "support the magic ✨",
                    "sponsor a snack 🍫",
                    "keep the coffee coming ☕",
                    "donate a donut 🍩",
                    "back this endeavor 🌟",
                    "help the hamster run 🐹💨",
                    "keep the code flowing 🌊"
                ];

                // Create and display the changelog popup
                const popupContainer = $("<dialog>", {
                    id: "ge-changelog-popup"
                })
                    .append($("<div>", {
                        class: "ge-changelog",
                        html: changelogHTML
                    }))
                    .append($("<div>", {
                        class: "ge-changelog-buttons"
                    })
                        .append($("<button>", {
                            class: "ge-changelog-github",
                            text: "view on github",
                            click: () => {
                                window.open("https://github.com/Uri6/Genius-Enhancer/releases")
                            }
                        }))
                        .append($("<button>", {
                            class: "ge-changelog-close",
                            text: closeButtonPhrases[Math.floor(Math.random() * closeButtonPhrases.length)],
                            click: () => {
                                $("#ge-changelog-popup").remove();

                                // Remove the changelog from storage
                                chrome.storage.local.remove("changelog");
                            }
                        }))
                        .append($("<button>", {
                            class: "ge-changelog-support",
                            text: supportButtonPhrases[Math.floor(Math.random() * supportButtonPhrases.length)],
                            click: () => {
                                window.open("https://uri6.github.io/genius-enhancer/support", "_blank");
                            }
                        })));

                $("body").append(popupContainer);
            }
        });
    }

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
            const modernAddASong = (await chrome.storage.local.get("modernAddASong"))?.modernAddASong || false;
            if (modernAddASong) {
                await handleAddASong(tabId);
            }
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
        file: "./src/css/pages/main.css"
    },
    {
        type: "css",
        file: "./src/css/powerbar.css"
    },
    {
        type: "css",
        file: "./src/css/pages/darkmode.css"
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
        file: "./src/js/extension/defaultSecrets.js"
    },
    {
        type: "js",
        file: "./lib/showdown/showdown.min.js",
        only: ["changelog"]
    },
    {
        type: "js",
        file: "./lib/particles/tsparticles.confetti.bundle.min.js",
        only: ["changelog"]
    },
    {
        type: "js",
        file: "./src/js/powerbar.js"
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
            // we might not have access to this page
            let parsedUrl;
            try {
                parsedUrl = new URL(tab?.url);
            } catch {
                parsedUrl = null;
            }
            isGeniusPage = parsedUrl?.protocol === "https:" &&
                (parsedUrl.hostname === "genius.com" || parsedUrl.hostname === "www.genius.com");
            await chrome.storage.local.set({ "isGeniusPage": isGeniusPage });

            if (!tab.url || changeInfo.status !== "complete" || !isGeniusPage) {
                return;
            }

            url = tab.url;

            console.info("----------------------------------------");
            console.info("%c new tab loaded ", "background-color: #fffe65; color: #000; padding: 5px; text-align: center; font-size: 15px; font-weight: bold; display: block; border-radius: 5px;");
            console.info("time loaded: " + new Date().toLocaleTimeString("en-US", { hour12: false }));
            console.info("tab id: " + tabId);
            console.info("changeInfo: " + changeInfo.status);
            console.info("tab: " + tab.title + ", " + tab.url);
            console.info("isGeniusPage: " + isGeniusPage);

            pageType = "unknown";

            const prohibitedDomains = [
                "promote.genius.com",
                "support.genius.com",
                "docs.genius.com",
                "homestudio.genius.com",
                "api.genius.com"
            ];
            const prohibitedPaths = ["/developers", "/api-clients"];

            if (prohibitedDomains.includes(parsedUrl.hostname) ||
                prohibitedPaths.some((path) => parsedUrl.pathname.startsWith(path))) {
                return;
            }

            let runningFlag;
            try {
                runningFlag = await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: () => {
                        if (document.body.dataset.geniusEnhancerUrl === location.href) {
                            return false;
                        } else {
                            document.body.dataset.geniusEnhancerRunning = "true";
                            document.body.dataset.geniusEnhancerUrl = location.href;
                            return true;
                        }
                    }
                });
            } catch (error) {
                console.warn("Genius Enhancer could not access this tab", error);
                return;
            }

            if (!runningFlag?.[0]?.result) {
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

                const currentUrl = new URL(tab.url);
                const urlPart = currentUrl.pathname.replace(/^\/|\/$/g, "");

                if (!urlPart.includes("/") && (urlPart.endsWith("-lyrics") || urlPart.endsWith("-annotated"))) {
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
                            console.error("OldSongPage is undefined\nPlease report this error here: https://uri6.github.io/genius-enhancer/report-a-bug/");
                        }
                    });

                    return "song";
                } else if (currentUrl.pathname === "/" || (currentUrl.hash && !urlPart.includes("/"))) {
                    return "home";
                } else if (urlPart === "firehose" || urlPart.startsWith("firehose/")) {
                    return "firehose";
                } else if (urlPart === "new" || urlPart === "songs/new") {
                    return "new song";
                } else if (urlPart === "penalties" || urlPart.startsWith("penalties/")) {
                    return "mecha.penalties";
                } else if (urlPart === "albums" || urlPart.startsWith("albums/")) {
                    return "album";
                } else if (urlPart === "forums") {
                    return "forums (main)";
                } else if (urlPart.includes("/discussions/")) {
                    return "forum thread";
                } else if (urlPart.startsWith("forums/") && urlPart.endsWith("/new")) {
                    return "new post";
                } else if (urlPart.startsWith("forums/")) {
                    return "forum";
                }

                const isForumPage = await chrome.scripting.executeScript({
                    target: { tabId: tabId }, func: () => (document.getElementsByClassName("group_summary").length > 0)
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

            async function applicable(file) {
                let enabled = file.only?.includes(pageType) ?? true;
                if (!enabled && file.only?.includes("changelog")) {
                    enabled = (await chrome.storage.local.get("changelog"))?.changelog || false;
                }
                console.debug(file, enabled);
                return enabled;
            }

            const applicableFiles = (await Promise.all(
                files.map(async (file) => ({
                    file,
                    enabled: await applicable(file)
                }))
            ))
                .filter(({ enabled }) => enabled)
                .map(({ file }) => file);

            const cssFiles = applicableFiles
                .filter((f) => f.type === "css")
                .map((f) => f.file);

            const baseJsFiles = applicableFiles
                .filter((f) => f.type === "js")
                .map((f) => f.file);

            console.info("css files: ", cssFiles);
            console.info("js files: ", baseJsFiles);

            // inject relevant css/js files
            try {
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
            } catch (error) {
                console.error("Genius Enhancer failed to initialize this page", error);
                await chrome.scripting.executeScript({
                    target: { tabId },
                    func: () => {
                        delete document.body.dataset.geniusEnhancerRunning;
                        delete document.body.dataset.geniusEnhancerUrl;
                    }
                }).catch(() => {});
            }
        }
    });
});
