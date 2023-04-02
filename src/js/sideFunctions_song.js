/*
 * This code is licensed under the terms of the "LICENSE.md" file
 * located in the root directory of this code package.
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
    const spotiftElem = $("#gb-spotify-player");
    if (!spotiftElem.length) return;
    spotiftElem.toggle(show);
}

/**
 * Initializes the modern text editor for a song, and monitoring for changes in the DOM to remove the editor when necessary
 * 
 * @returns {void}
 */
export function song_modernTextEditor() {
    let flag = true;

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (
                mutation.type === "attributes" &&
                mutation.attributeName === "class" &&
                !$(".ql-toolbar-container").length
            ) {
                const target = mutation.target;
                if (
                    !target.classList.contains("ng-hide") &&
                    target.classList.contains("wysiwyg_input") &&
                    target.classList.contains("wysiwyg_input--full_width")
                ) {
                    chrome.runtime.sendMessage({
                        replaceTextarea: [
                            "wysiwyg_input wysiwyg_input--full_width",
                        ],
                    });
                    flag = true;

                    document.addEventListener("DOMNodeRemoved", (e) => {
                        if (flag) {
                            setTimeout(() => {
                                const ngIfAttr = e.target.getAttribute("ng-if");
                                if (
                                    ngIfAttr === "lyrics_ctrl.should_show_full_lyrics_save_cancel_buttons()" ||
                                    ngIfAttr === "!lyrics_ctrl.saving"
                                ) {
                                    chrome.runtime.sendMessage({
                                        removeQuill: true,
                                    });
                                    flag = false;
                                }
                            }, 100);
                        }
                    });
                }
            }
        });
    });

    const targetNode = document.querySelector(
        ".wysiwyg_input.wysiwyg_input--full_width"
    );

    if (targetNode) {
        observer.observe(targetNode, {
            attributes: true,
            childList: false,
            characterData: false,
        });
    }

    document.addEventListener("DOMNodeInserted", (e) => {
        if (
            e.target.className ===
            "ExpandingTextarea__Textarea-sc-4cgivl-0 kYxCOo" &&
            e.target.parentNode.childNodes.length < 3
        ) {
            chrome.runtime.sendMessage({
                replaceTextarea: [
                    "ExpandingTextarea__Textarea-sc-4cgivl-0 kYxCOo",
                ],
            });

            document.addEventListener("DOMNodeRemoved", () => {
                setTimeout(() => {
                    if (
                        document.querySelectorAll(
                            ".LyricsEditdesktop__Controls-sc-19lxrhp-5.bwjuqY button"
                        ).length < 3
                    ) {
                        chrome.runtime.sendMessage({ removeQuill: true });
                    }
                }, 100);
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
    const apiKey = "AIzaSyBgyAo8T6yTDCbLHauokuqHBkVHkjs6NjM";

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=id&q=${encodeURIComponent(query)}&type=video&order=relevance&key=${apiKey}`
        );
        const data = await response.json();
        const [{ id: { videoId } }] = data.items;
        return `https://www.youtube.com/watch?v=${videoId}`;
    } catch (error) {
        console.error(error);
    }
}

export function appendReplyButton() {
    /*var commentClassName = "comment" || "Comment__Container-qhf03b-0 joncYs";

  document.getElementsByClassName(commentClassName).array.forEach(element => {
    console.log(element.childNodes[12]);
  });*/
    // return;
}
