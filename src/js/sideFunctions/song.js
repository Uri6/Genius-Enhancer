/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

/**
 * Toggles the visibility of the Apple Music player iframe
 *
 * @param {boolean} show - Whether to show (true) or hide (false) the iframe
 * @returns {void}
 */
export function appleMusicPopUp(show) {
    const classBase = "AppleMusicPlayerdesktop__IframeWrapper-";
    const appleMusicParent = $(`[class^="${classBase}"], [class*=" ${classBase}"], .apple_music_player_iframe_wrapper`).first();
    if (!appleMusicParent.length) return;
    const appleMusicIframe = appleMusicParent.find("iframe").first();
    appleMusicIframe.toggle(show);
}

/**
 * Toggles the visibility of the Spotify player iframe
 *
 * @param {boolean} show - Whether to show (true) or hide (false) the iframe
 * @returns {void}
 */
export function spotifyPopUp(show) {
    const spotiftElem = $("#ge-spotify-player");
    if (!spotiftElem.length) return;
    spotiftElem.toggle(show);
}

/**
 * Toggles the visibility of the SoundCloud player iframe
 * 
 * @param {boolean} show - Whether to show (true) or hide (false) the iframe
 * @returns {void}
 */
export function soundCloudPopUp(show) {
    const soundcloudElem = $("#ge-soundcloud-player");
    if (!soundcloudElem.length) return;
    soundcloudElem.toggle(show);
}

/**
 * Initializes the modern text editor for a song, and monitoring for changes in the DOM to remove the editor when necessary
 *
 * @returns {void}
 */
export function song_modernTextEditor() {
    const selector = [
        "form[aria-label='Edit Lyrics Form'] textarea",
        "[data-react-modal-body-trap] textarea",
        "[role='dialog'] textarea",
        "[data-react-modal-body-trap] [contenteditable='true'][role='textbox']",
        "[role='dialog'] [contenteditable='true'][role='textbox']",
        "textarea[class*='LyricsEdit']",
        "textarea[class*='ExpandingTextarea']",
        "textarea[data-testid*='lyrics']",
        "textarea[name*='lyrics']",
        "textarea[aria-label*='lyrics' i]"
    ].join(", ");

    const initializeEditor = () => {
        const textarea = [...document.querySelectorAll(selector)]
            .find((element) => element.getClientRects().length > 0);
        if (!textarea || textarea.dataset.geniusEnhancerEditor === "true") return;

        $(".ql-toolbar-container, .ql-toolbar, .ql-container").remove();
        chrome.runtime.sendMessage({
            replaceTextarea: [selector]
        });
    };

    initializeEditor();
    const observer = new MutationObserver(initializeEditor);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    window.addEventListener("pagehide", () => {
        observer.disconnect();
    }, { once: true });
}

/**
 * Search for a video on YouTube using the YouTube Data API v3
 *
 * @param {string} query - The search query for the video
 * @returns {Promise<string>} - A Promise that resolves to the URL of the most relevant video for the given search query
 */
export async function searchVideo(query) {
    const key = globalThis.secrets?.GOOGLE_API_KEY;
    if (!key) {
        console.info("YouTube search is unavailable until a Google API key is configured.");
        return null;
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=id&q=${encodeURIComponent(query)}&type=video&order=relevance&key=${key}`
        );
        const data = await response.json();
        const videoId = data.items?.[0]?.id?.videoId;
        if (!videoId) {
            return null;
        }
        return `https://www.youtube.com/watch?v=${videoId}`;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function reactSongAdditions() {
    const toolbarContainer = document.querySelector(".StickyContributorToolbar__Left-sc-1s6k5oy-1.lhAIsa");

    const classBase = "ContributorSidebarSection__Container-";
    const completeTheSongLyrics = document.querySelectorAll("[class^=\"" + classBase + "\"], [class*=\" " + classBase + "\"]")[0];

    const appUrl = document.querySelector("[property=\"twitter:app:url:iphone\"]")?.content;
    const id = appUrl?.split("/")[3];
    if (!id) {
        console.info("Genius Enhancer could not determine the current song ID.");
        return;
    }
    const parseCookies = () => {
        return Object.fromEntries(
            document.cookie.split("; ").map(cookie => {
                const [key, value] = cookie.split("=");
                return [key, decodeURIComponent(value)];
            })
        );
    };
    const gapi = axios.create({
        baseUrl: "https://genius.com/api",
        withCredentials: true,
        headers: {
            "X-CSRF-Token": parseCookies()["_csrf_token"]
        }
    });

    const { song } = (await gapi.get(`https://genius.com/api/songs/${id}`)).data.response;

    const checky = `<svg class="ge-checky" fill="currentColor" width="16" height="16" viewBox="0 0 18 19" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4 2.017a9 9 0 1 1 10 14.966A9 9 0 0 1 4 2.017Zm.714 13.897a7.715 7.715 0 1 0 8.572-12.829 7.715 7.715 0 0 0-8.572 12.83ZM4.5 9.765l3.214 3.215L13.5 7.195l-.91-.91-4.876 4.877-2.306-2.305-.908.909Z" clip-rule="evenodd"></path></svg>`;

    if (completeTheSongLyrics && song.verified_contributors?.length > 0) {
        const lyricVerifiers = song.verified_contributors.filter(contrib => (
            contrib.contributions.includes("lyrics")
        ));

        if (lyricVerifiers.length > 0) {
            const verifiedBy = document.createElement("div");

            verifiedBy.className = "ge-verified-by";

            verifiedBy.innerHTML = `<div class="ge-checky-container">${checky}</div> <span>Lyrics verified by ${lyricVerifiers.map(verifier => (
                `<a href="${verifier.artist.url}" class="ge-verified-link">${verifier.artist.name}</a>`
            )).join(", ")}</span>`

            completeTheSongLyrics.insertBefore(verifiedBy, completeTheSongLyrics.children[1]);
        }
    }

    if (toolbarContainer && !document.querySelector("#ge-follow-button")) {
        const currentStatus = song.current_user_metadata?.interactions?.following || false;

        const button = document.createElement("input");
        button.type = "checkbox";
        button.id = "ge-follow-button";
        button.checked = currentStatus;

        button.addEventListener("change", async () => {
            const action = button.checked ? "follow" : "unfollow";
            gapi.post(`https://genius.com/api/songs/${id}/${action}`);
        });

        // sometimes it runs simultaneously so we need to check again
        if (!document.querySelector("#ge-follow-button")) {
            toolbarContainer.appendChild(button);
        }
    } else {
        console.error("Could not find container for follow button");
    }
}
