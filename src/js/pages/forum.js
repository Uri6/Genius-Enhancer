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
                // disable sending the forums search input (.discussions_search_bar-text_input) if there's less than 3 characters
                $(document).on("keypress", ".discussions_search_bar-text_input", function(e) {
                    if (e.which === 13) {
                        if (this.value.length < 3) {
                            e.preventDefault();
                            $(this).css("border-color", "red !important");
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
