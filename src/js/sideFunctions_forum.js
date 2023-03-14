/*
* This code is licensed under the terms of the "LICENSE.md" file
* located in the root directory of this code package.
*/

import createDiscussionIcon from "../svg/createDiscussion.svg";
import followIcon from "../svg/follow.svg";
import unfollowIcon from "../svg/unfollow.svg";

export function replaceButtons(createDiscussion, follow) {
    if (createDiscussion) {
        const createDiscussionElement = document.getElementsByClassName("create_discussion");
        for (var i = 0; i < createDiscussionElement.length; i++) {
            createDiscussionElement[i].innerHTML = createDiscussionIcon;
        }
    }

    if (follow) {
        const unfollowElement = document.getElementsByClassName("new_status_unfollow");
        for (var i = 0; i < unfollowElement.length; i++) {
            unfollowElement[i].innerHTML = unfollowIcon;
        }

        const followElement = document.getElementsByClassName("new_status_follow");
        for (var i = 0; i < followElement.length; i++) {
            followElement[i].innerHTML = followIcon;
        }
    }
}

export function forums_modernTextEditor() {
    if ($('.reply_container .required.markdown_preview_setup_complete').length || $('#new_discussion .required.markdown_preview_setup_complete').length) {
        chrome.runtime.sendMessage({ "replaceTextarea": ["required markdown_preview_setup_complete"] });

        if ($('.reply_container .formatting_help').length) {
            $('.reply_container .formatting_help').css('display', 'none');
        }

        if ($('.reply_container .markdown_preview_container').length) {
            $('.reply_container .markdown_preview_container').css('display', 'none');
        }
    }
}
