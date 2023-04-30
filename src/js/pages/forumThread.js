export async function handleForumThread(tabId) {
    await chrome.scripting.insertCSS(
        {
            target: { tabId: tabId },
            files: ["./src/css/forumsPages/thread.css"]
        }
    );
    await chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            func: () => {
                chrome.storage.local.get("ModernTextEditor", (res) => {
                    if (res.ModernTextEditor) {
                        chrome.runtime.sendMessage({ "forums_modernTextEditor": [true] });
                    }
                });

                if (document.readyState === "complete") {
                    $(".reply_container h3").replaceWith("<h3 class=\"comment-title\">Comment</h3>");
                    $(".forum_post_container .avatar").first().removeClass("small");
                    $(".user_badge").first().addClass("first_one");
                    $(".body.embedly.embedly_pro").first().addClass("first_one");
                    $("#groups_sidebar").remove();
                    $(".group_summary").insertBefore("#container.mecha--deprecated");
                    $(".discussion_thread-discussion_and_group_list").insertAfter(".group_summary");
                    $("#group_container.discussion_thread").insertAfter(".discussion_thread-discussion_and_group_list");
                    $(".group_summary").attr("onclick", "window.location.href=$('.group_summary a').attr('href')").css("cursor", "pointer");

                    // Restyling the header of the post
                    if ($(".group_title-moderation_actions").length) {
                        $(".group_title-moderation_actions").insertBefore($(".forum_post-header .voting_links").first());
                        $(".forum_post-header .voting_links").first().css("margin-right", 10);
                        $(".group_title-moderation_actions").css("padding-right", $(".forum_post-header .voting_links").first().outerWidth() + 10);
                    }
                    $(".forum_post-header").first().css("width", $(".group_title-subject").first().outerWidth(true));
                    $(".forum_post-header").first().css("height", $(".group_title-subject").first().outerHeight());
                    $(".body.embedly.embedly_pro.first_one").css("margin-top", $(".body.embedly.embedly_pro.first_one").css("padding-top"));

                    $(".group_summary").hover(function() {
                        $(".header-primary").addClass("header-primary-hover");
                    }, function() {
                        $(".header-primary").removeClass("header-primary-hover");
                    });

                    $(document).on("ready", function() {
                        const loadMoreButton = $(".pagination.no_auto_more a");
                        const sendButton = $("#forum_post_submit");
                        if (loadMoreButton.length) {
                            loadMoreButton.text("Load older comments");
                        }
                        if (sendButton.length) {
                            sendButton.val("Send");
                        }
                    });

                    $(document).on("DOMNodeInserted", function(e) {
                        if (e.target.classList.contains("error") && e.target.getAttribute("for") == "forum_post_body" && e.target.getAttribute("generated") == "true") {
                            e.target.innerText = "Please enter a comment";

                            setTimeout(() => {
                                e.target.remove(e.target);
                            }, 3000);
                        } else if (e.target.classList.contains("forum_post_unit")) {
                            addReplyButton(e.target);
                        }
                    });

                    $(".forum_post_container .forum_post_unit:not(:first-child)").each(function() {
                        addReplyButton(this);
                    });

                    function addReplyButton(forumPostUnit) {
                        const replyButton = document.createElement("div");
                        replyButton.classList.add("reply_button");
                        replyButton.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" height=\"24\" width=\"24\"><path d=\"M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z\"/></svg>";

                        replyButton.addEventListener("click", function() {
                            const iqValue = forumPostUnit.querySelector(".iq_value");
                            if (!iqValue) {
                                console.error("no iq value");
                                return;
                            }
                            const username = iqValue.getAttribute("href").slice(1);
                            const quillEditor = $(".ql-editor");
                            if (quillEditor.length === 0) {
                                console.error("no quill editor");
                                return;
                            }
                            const existingText = quillEditor.html();
                            if (existingText.includes("@" + username + " ")) {
                                console.log("already tagged");
                                return;
                            }
                            const taggedUsernames = existingText.match(/@\w+\s/g) || [];
                            if (taggedUsernames.length > 0) {
                                quillEditor.append("\n@" + username + " \n\n");
                            } else {
                                quillEditor.prepend("@" + username + " \n\n");
                            }

                            $("html, body").animate({
                                scrollTop: quillEditor.offset().top
                            }, 500);

                            quillEditor.trigger("focus");

                            // set the cursor to the end of the text
                            const range = document.createRange();
                            const sel = window.getSelection();
                            range.setStart(quillEditor[0], quillEditor[0].childNodes.length);
                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        });

                        forumPostUnit.appendChild(replyButton);
                    }

                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (mutation.addedNodes) {
                                const newNodes = mutation.addedNodes;
                                for (let i = 0; i < newNodes.length; i++) {
                                    const node = newNodes[i];
                                    if (node.classList && node.classList.contains("pagination") && node.classList.contains("no_auto_more")) {
                                        $(node).find("a").text("Load older comments");
                                    }
                                }
                            }
                        });
                    });

                    const config = {
                        childList: true,
                        subtree: true
                    };

                    observer.observe(document.body, config);

                    const userTooltip = $(".user_tooltip");
                    if (userTooltip.length) {
                        const toggleFollowBtn = userTooltip.find(".toggle_follow.button.new_status_unfollow");
                        if (toggleFollowBtn.length) {
                            const helperText = toggleFollowBtn.find(".toggle_follow-helper_text");
                            if (helperText.length) {
                                helperText.text("Unfollow");
                                helperText.attr("data-is-changed", "true");
                            }
                        }
                    }
                }
            }
        }
    );
}
