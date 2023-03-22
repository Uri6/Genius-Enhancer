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

export function spotifyPopUp(show) {
    const spotiftElem = $("#gb-spotify-player");
    if (!spotiftElem.length) return;
    spotiftElem.toggle(show);
}

export function song_modernTextEditor() {
    console.log("song_modernTextEditor called");

    let flag = true;

    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (
                mutation.type === "attributes" &&
                mutation.attributeName === "class" &&
                !$(".ql-toolbar-container").length
            ) {
                if (
                    !mutation.target.classList.contains("ng-hide") &&
                    mutation.target.classList.contains("wysiwyg_input") &&
                    mutation.target.classList.contains(
                        "wysiwyg_input--full_width"
                    )
                ) {
                    chrome.runtime.sendMessage({
                        replaceTextarea: [
                            "wysiwyg_input wysiwyg_input--full_width",
                        ],
                    });
                    flag = true;

                    $(document).on("DOMNodeRemoved", function (e) {
                        if (flag) {
                            console.log("removed: ", e.target);
                            setTimeout(function () {
                                if (
                                    $(e.target).attr("ng-if") ===
                                    "lyrics_ctrl.should_show_full_lyrics_save_cancel_buttons()" ||
                                    $(e.target).attr("ng-if") ===
                                    "!lyrics_ctrl.saving"
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

    if ($(".wysiwyg_input.wysiwyg_input--full_width").length) {
        observer.observe(
            document.getElementsByClassName(
                "wysiwyg_input wysiwyg_input--full_width"
            )[0],
            {
                attributes: true,
                childList: false,
                characterData: false,
            }
        );
    }

    $(document).on("DOMNodeInserted", function (e) {
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

            $(document).on("DOMNodeRemoved", () => {
                setTimeout(function () {
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

export async function searchVideo() {

    console.log("searchVideo called");

    const nonLatinRegex = /[\u011E-\u011F\u0130-\u0131\u015E-\u015F\u00C7-\u00E7\u0590-\u05FF\u0400-\u04FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/;

    const title = $('.Fieldshared__FieldContainer-dxskot-0.metadatastyles__MetadataField-nhmb0p-1 .TextInput-sc-2wssth-0').value;
    const artist = $('.Fieldshared__FieldContainer-dxskot-0.metadatastyles__MetadataSelectField-nhmb0p-2 .TagInput__Container-sc-17py0eg-0 .TagInput__MultiValueLabel-sc-17py0eg-2').textContent;
    const query = [title, artist];
    const modifiedQuery = query.map(part => {
        if (part.split(" - ").length === 2 && nonLatinRegex.test(part.split(" - ")[1])) {
            const langsParts = part.split(" - ");
            return langsParts[1];
        }
        return part;
    }).join(" - ");

    console.log(modifiedQuery);

    // TODO: don't hardcode the API key
    const apiKey = "AIzaSyBgyAo8T6yTDCbLHauokuqHBkVHkjs6NjM";

    // Clear any previous search results
    const youtubeInput = $("section.ScrollableTabs__Section-sc-179ldtd-6[data-section-index='1'] input.TextInput-sc-2wssth-0");
    youtubeInput.value = "";

    // Make the API request
    $.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
            part: 'id',
            q: query,
            type: 'video',
            order: 'relevance',
            key: apiKey
        },
        function (data) {
            // Check if there are any search results
            if (data.items.length == 0) {
                // add ".no-results" class to the youtube input
                youtubeInput.addClass("no-results");
            }
            else {
                // Get the video ID of the first search result
                var videoId = data.items[0].id.videoId;
                var url = 'https://www.youtube.com/watch?v=' + videoId;
                youtubeInput.click();
                youtubeInput.setAttribute("value", url);
                const event = new InputEvent("input", {
                    bubbles: true,
                    data: url,
                });
                youtubeInput.dispatchEvent(event);
            }
        }
    );
}

export function appendReplyButton() {
    /*var commentClassName = "comment" || "Comment__Container-qhf03b-0 joncYs";

  document.getElementsByClassName(commentClassName).array.forEach(element => {
    console.log(element.childNodes[12]);
  });*/
    // return;
}
