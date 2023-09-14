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
    const appleMusicParent = $(".apple_music_player_iframe_wrapper, .AppleMusicPlayer__IframeWrapper-uavgzr-1").first();
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
 */
export function song_modernTextEditor() {
    const observer = new MutationObserver(mutations =>
        mutations.flatMap(mutation => Array.from(mutation.addedNodes))
            .filter(node => node.nodeType === Node.ELEMENT_NODE && node.classList?.contains("ExpandingTextarea__Textarea-sc-4cgivl-0", "kYxCOo"))
            .forEach(() => {
                document.querySelector(".ql-toolbar-container")?.remove();
                document.querySelectorAll(".ql-snow").forEach(elem => elem.remove());
                chrome.runtime.sendMessage({ replaceTextarea: ["ExpandingTextarea__Textarea-sc-4cgivl-0 kYxCOo"] });
            })
    );

    // Start observing the body
    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Search for a video on YouTube using the YouTube Data API v3
 *
 * @param {string} query - The search query for the video
 * @returns {Promise<string>} - A Promise that resolves to the URL of the most relevant video for the given search query
 */
export async function searchVideo(query) {
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

export async function appendFollowButton() {
    const container = document.querySelector(".StickyContributorToolbar__Left-sc-1s6k5oy-1.lhAIsa");

    if (container && !document.querySelector("#ge-follow-button")) {
        const id = document.querySelector('[property="twitter:app:url:iphone"]').content.split("/")[3];
        const parseCookies = () => {
            return Object.fromEntries(
                document.cookie.split('; ').map(cookie => {
                    const [key, value] = cookie.split('=');
                    return [key, decodeURIComponent(value)];
                })
            );
        };
        const gapi = axios.create({
            baseUrl: "https://genius.com/api",
            withCredentials: true,
            headers: {
                "X-CSRF-Token": parseCookies()["_csrf_token"],
            },
        });

        const songData = await gapi.get(`https://genius.com/api/songs/${id}`);
        const currentStatus = songData.data.response.song.current_user_metadata.interactions.following;

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
            container.appendChild(button);
        }
    } else {
        console.error("Could not find container for follow button");
    }
}
