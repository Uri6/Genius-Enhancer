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

export function appendReplyButton() {
    /*var commentClassName = "comment" || "Comment__Container-qhf03b-0 joncYs";

  document.getElementsByClassName(commentClassName).array.forEach(element => {
    console.log(element.childNodes[12]);
  });*/
    // return;
}
