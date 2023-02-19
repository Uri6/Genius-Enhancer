/*
* This code is licensed under the terms of the "LICENSE.md" file
* located in the root directory of this code package.
*/

import iconCreateDiscussion from "../svg/createDiscussion.svg";
import iconUnfollow from "../svg/unfollow.svg";
import iconFollow from "../svg/follow.svg";

export function replaceButtons(createDiscussion, follow) {
    if (createDiscussion) {
        const createDiscussionElement = document.getElementsByClassName("create_discussion");
        for (const element of createDiscussionElement) {
            element.innerHTML = iconCreateDiscussion;
        }
    }

    if (follow) {
        const unfollowElement = document.getElementsByClassName("new_status_unfollow");
        for (const element of unfollowElement) {
            element.innerHTML = iconUnfollow;
        }

        const followElement = document.getElementsByClassName("new_status_follow");
        for (const element of followElement) {
            element.innerHTML = iconFollow;
        }
    }
}

export function forums_modernTextEditor() {
    updateTextEditor();

    function updateTextEditor() {
        if ($('.reply_container .required.markdown_preview_setup_complete').length || $('#new_discussion .required.markdown_preview_setup_complete').length) {
            chrome.runtime.sendMessage({ "replaceTextarea": ["required markdown_preview_setup_complete"] });

            if ($('.reply_container .formatting_help').length) {
                $('.reply_container .formatting_help').css('display', 'none');
            }

            if ($('.reply_container .markdown_preview_container').length) {
                $('.reply_container .markdown_preview_container').css('display', 'none');
            }

            if ($('#forum_post_submit').length) {
                $('#forum_post_submit').on('click', function () {
                    chrome.runtime.sendMessage({ "removeQuill": [true] });
                });

                setTimeout(updateTextEditor, 100);
            }
        }
    }
}
