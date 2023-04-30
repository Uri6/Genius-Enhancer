import { replaceButtons } from "../sideFunctions_forum.js";

export async function handleForum(tabId) {
    await chrome.scripting.insertCSS(
        {
            target: { tabId: tabId },
            files: ["./src/css/forumsPages/forum.css"]
        }
    );

    await chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            func: replaceButtons,
            args: [true, true]
        }
    );

    await chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            func: () => {
                // disable sending the input ".discussions_search_bar-text_input" if there's less than 3 characters
                // if there's less than and the user presses enter, the strok of the box will turn red
                // use jquery
                $(document).on("keypress", ".discussions_search_bar-text_input", function(e) {
                    if (e.which === 13) {
                        if (this.value.length < 3) {
                            e.preventDefault();
                            $(this).css("border-color", "red !important");
                            // notice the user that the input is too short
                            // dont use placeholder, it's not visible
                            // use a span element, remove it after 3 seconds
                            if (!document.getElementsByClassName("discussions_search_bar-text_input-error").length) {
                                var span = document.createElement("span");
                                span.textContent = "The input is too short (min 3 characters)";
                                span.setAttribute("class", "discussions_search_bar-text_input-error");
                                $(span).hide().appendTo(this.parentElement).fadeIn(500);
                                setTimeout(() => {
                                    $(span).fadeOut(500, () => {
                                        span.remove();
                                    });
                                }, 2500);
                            }
                        }
                    }
                });
            }
        }
    );
}