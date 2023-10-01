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
 */
export function spotifyPopUp(show) {
    const spotiftElem = $("#ge-spotify-player");
    if (!spotiftElem.length) return;
    spotiftElem.toggle(show);
}

/**
 * Initializes the modern text editor for a song, and monitoring for changes in the DOM to remove the editor when necessary
 *
 * @returns {void}
 */
export function song_modernTextEditor() {
    document.addEventListener("DOMNodeInserted", (e) => {
        if (e.target.className === "ExpandingTextarea__Textarea-sc-4cgivl-0 kYxCOo") {
            // Remove the Quill toolbar container from the DOM
            if ($(".ql-toolbar-container").length) {
                $(".ql-toolbar-container").remove();
            }

            // Loop through all elements with class "ql-snow" and remove them from the DOM
            while ($(".ql-snow").length) {
                $(".ql-snow").remove();
            }

            chrome.runtime.sendMessage({
                replaceTextarea: [
                    "ExpandingTextarea__Textarea-sc-4cgivl-0 kYxCOo"
                ]
            });
        }
    });
}

/**
 * Search for a video on YouTube using the YouTube Data API v3
 *
 * @param {string} query - The search query for the video
 * @returns {Promise<string>} - A Promise that resolves to the URL of the most relevant video for the given search query
 */
export async function searchVideo(query) {
    // TODO: don't hardcode the API key
    const key = secrets.GOOGLE_API_KEY;

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=id&q=${encodeURIComponent(query)}&type=video&order=relevance&key=${key}`
        );
        const data = await response.json();
        const [{ id: { videoId } }] = data.items;
        return `https://www.youtube.com/watch?v=${videoId}`;
    } catch (error) {
        console.error(error);
    }
}

export async function reactSongAdditions() {
    const toolbarContainer = document.querySelector(".StickyContributorToolbar__Left-sc-1s6k5oy-1.lhAIsa");

    const classBase = "ContributorSidebarSection__Container-";
    const completeTheSongLyrics = document.querySelectorAll("[class^=\"" + classBase + "\"], [class*=\" " + classBase + "\"]")[0];

    const id = document.querySelector("[property=\"twitter:app:url:iphone\"]").content.split("/")[3];
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

    const checky = `<svg class="ge-checky" width="16" height="16" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg"><path fill="#27F145" d="M0 0h11v11H0z"></path><path fill="#FFF" d="M4.764 5.9l-2-2L1.35 5.314l3.414 3.414 4.914-4.914L8.264 2.4"></path></svg>`;

    if (song.verified_contributors.length > 0) {
        const lyricVerifiers = song.verified_contributors.filter(contrib => (
            contrib.contributions.includes("lyrics")
        ));

        if (lyricVerifiers.length > 0) {
            const verifiedBy = document.createElement("div")

            verifiedBy.className = "ge-verified-by";

            verifiedBy.innerHTML = `<div style="display: inline-block">${checky}</div> <span>Lyrics verified by ${lyricVerifiers.map(verifier => (
                `<a href="${verifier.artist.url}" class="ge-verified-link">${verifier.artist.name}</a>`
            )).join(", ")}</span>`

            completeTheSongLyrics.insertBefore(verifiedBy, completeTheSongLyrics.children[1]);
        }
    }

    if (toolbarContainer && !document.querySelector("#ge-follow-button")) {
        const id = document.querySelector("[property=\"twitter:app:url:iphone\"]").content.split("/")[3];
        const currentStatus = song.current_user_metadata.interactions.following;

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
