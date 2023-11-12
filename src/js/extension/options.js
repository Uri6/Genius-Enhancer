/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

import { createCheckbox, handleCheckboxClick, handleCheckboxesClicks, handleSelectsChanges } from "./utils.js";

// Set version number
$("#version").text("v" + chrome.runtime.getManifest().version);

const extensionStatusStorageKey = "extensionStatus";
const $extensionStatusCheckbox = $("#extensionStatus");

// Handle extension status checkbox
handleCheckboxClick("extensionStatus", "extensionStatus", "", false, (isChecked) => {
    if (isChecked) {
        $("body").removeClass("disabled");
    } else {
        $("body").addClass("disabled");
    }
});

// Click event listener to handle checkbox state
$extensionStatusCheckbox.click(() => {
    const isChecked = $extensionStatusCheckbox.prop("checked");

    // Update local storage
    chrome.storage.local.set({ [extensionStatusStorageKey]: isChecked });

    // Apply additional functionality based on checkbox state
    if (isChecked) {
        $("body").removeClass("disabled");
    } else {
        $("body").addClass("disabled");
    }
});

// Function to insert the needed settings according to the chosen category
async function insertSettings(category) {
    const $settings = $(".settings");

    // Remove all settings
    $settings.empty();

    // Insert settings according to the chosen category
    switch (category) {
        case "general":
            $("<div>", {
                class: "setting"
            })
                .append($("<span>", {
                    class: "setting-title",
                    text: "Powerbar"
                }))
                .append($("<span>", {
                    class: "setting-input"
                })
                    .append(createCheckbox("powerbarStatus", "Enable the powerbar"))
                )
                .append($("<span>", {
                    class: "setting-input",
                    text: "Default search category: "
                })
                    .append($("<select>", {
                        id: "defaultSearchType"
                    })
                        .append($("<option>", {
                            value: "multi",
                            text: "Multi"
                        }))
                        .append($("<option>", {
                            value: "song",
                            text: "Song"
                        }))
                        .append($("<option>", {
                            value: "lyric",
                            text: "Lyric"
                        }))
                        .append($("<option>", {
                            value: "album",
                            text: "Album"
                        }))
                        .append($("<option>", {
                            value: "artist",
                            text: "Artist"
                        }))
                        .append($("<option>", {
                            value: "user",
                            text: "User"
                        }))
                    )
                )
                .append($("<span>", {
                    class: "setting-input",
                    text: "Hotkey: "
                })
                    .append($("<input>", {
                        type: "text",
                        id: "powerbarHotkey",
                        class: "setting-input",
                        value: (await chrome.storage.local.get("powerbarHotkey"))?.powerbarHotkey || "Shift + Shift"
                    }))
                    .append($("<span>", {
                        class: "empty-input",
                        text: "×",
                        title: "Clear hotkey"
                    }))
                )
                .append($("<span>", {
                    class: "setting-suggestions-list",
                    text: "Try those: "
                })
                    .append($("<span>", {
                        class: "setting-suggestions-list-item",
                        text: "Ctrl + Space"
                    }))
                    .append($("<span>", {
                        class: "setting-suggestions-list-item",
                        text: "Ctrl + Shift + Alt"
                    }))
                    .append($("<span>", {
                        class: "setting-suggestions-list-item",
                        text: "Ctrl + Alt + Space"
                    }))
                    .append($("<span>", {
                        class: "setting-suggestions-list-item",
                        text: "Shift + Shift"
                    }))
                    .append($("<span>", {
                        class: "setting-suggestions-list-item",
                        text: "Alt + b"
                    }))
                )

                .append($("<span>", {
                    class: "setting-title",
                    text: "Localization"
                }))
                .append($("<span>", {
                    class: "setting-input",
                    text: "Song headers language: "
                })
                    .append($("<select>", {
                        id: "songHeadersLanguage"
                    })
                        .append($("<option>", {
                            value: "songsLang",
                            text: "Song's language"
                        }))
                        .append($("<option>", {
                            value: "en-US",
                            text: "English (US)"
                        }))
                        .append($("<option>", {
                            value: "ca-ES",
                            text: "Catalan"
                        }))
                        .append($("<option>", {
                            value: "nl-NL",
                            text: "Dutch"
                        }))
                        .append($("<option>", {
                            value: "fi-FI",
                            text: "Finnish"
                        }))
                        .append($("<option>", {
                            value: "fr-FR",
                            text: "French"
                        }))
                        .append($("<option>", {
                            value: "de-DE",
                            text: "German"
                        }))
                        .append($("<option>", {
                            value: "he-IL",
                            text: "Hebrew"
                        }))
                        .append($("<option>", {
                            value: "no-NO",
                            text: "Norwegian"
                        }))
                        .append($("<option>", {
                            value: "ru-RU",
                            text: "Russian"
                        }))
                        .append($("<option>", {
                            value: "es-ES",
                            text: "Spanish"
                        }))
                        .append($("<option>", {
                            value: "sv-SE",
                            text: "Swedish"
                        }))
                        .append($("<option>", {
                            value: "tr-TR",
                            text: "Turkish"
                        }))
                    )
                )
                .append($("<span>", {
                    class: "setting-input disabled",
                    text: "Toolbar language: "
                })
                    .append($("<select>", {
                        id: "toolbarLanguage",
                        disabled: true
                    })
                        .append($("<option>", {
                            value: "Soon!",
                            text: "Soon!"
                        }))
                    )
                )
                .append($("<span>", {
                    class: "setting-input disabled",
                    text: "Home page language: "
                })
                    .append($("<select>", {
                        id: "homePageLanguage",
                        disabled: true
                    })
                        .append($("<option>", {
                            value: "Soon!",
                            text: "Soon!"
                        }))
                    )
                )
                .append($("<span>", {
                    class: "setting-input note"
                })
                    .append($("<img>", {
                        src: chrome.runtime.getURL("/src/imgs/other/lightBulb.svg"),
                        class: "icon"
                    }))
                    .append($("<span>", {
                        class: "note-text",
                        text: "Found a mistake? Want to help translate? Visit the "
                    })
                        .append($("<a>", {
                            href: "https://crowdin.com/project/genius-enhancer",
                            text: "Crowdin project page"
                        }))
                    )
                )

                .appendTo($settings);

            handleCheckboxClick("powerbarStatus");
            handleSelectsChanges("defaultSearchType", "songHeadersLanguage");

            // Handle powerbar hotkey input
            $("#powerbarHotkey").keydown(function(event) {
                let key = event.key;

                // Define the allowed keys
                let allowedKeys = ["Ctrl", "Shift", "Alt", "Space"];
                let allowedChars = /^[a-z0-9]+$/i;

                // Check if the key is a special character that equals to Shift + number
                let specialChars = {
                    "!": "1",
                    "@": "2",
                    "#": "3",
                    "$": "4",
                    "%": "5",
                    "^": "6",
                    "&": "7",
                    "*": "8",
                    "(": "9",
                    ")": "0",
                    " ": "Space",
                    "Control": "Ctrl"
                };

                if (specialChars[key]) {
                    key = specialChars[key];
                }

                // Check if the key is allowed
                if (allowedKeys.includes(key) || (key.length === 1 && allowedChars.test(key))) {
                    let keys = $(this).val().split(" + ");
                    if (keys.length < 3) {
                        if ($(this).val()) {
                            $(this).val($(this).val() + " + " + key);
                        } else {
                            $(this).val(key);
                        }
                    } else {
                        alert("You can only enter up to 3 keys.");
                    }
                } else if (key === "Backspace") {
                    let keys = $(this).val().split(" + ");
                    keys.pop();
                    $(this).val(keys.join(" + "));
                }

                chrome.storage.local.set({ "powerbarHotkey": $(this).val() });

                event.preventDefault();
            });

            // If the input is empty, set the default value
            $("#powerbarHotkey").focusout(function() {
                if (!$(this).val()) {
                    $(this).val("Shift + Shift");
                    chrome.storage.local.set({ "powerbarHotkey": "Shift + Shift" });
                }
            });

            // Clear the input when the × button is clicked
            $(".setting-input:has(#powerbarHotkey)>.empty-input").click(function() {
                $("#powerbarHotkey").val("");
                $("#powerbarHotkey").focus();
            });

            // Handle suggestions click
            $(".setting-suggestions-list-item").click(function() {
                $("#powerbarHotkey").val($(this).text());
                $("#powerbarHotkey").trigger({ type: "keydown", key: "Enter" });
            });

            break;
        case "album":
            break;
        case "song":
            break;
        case "forums":
            break;
        case "other":
            break;
        default:
            break;
    }
}

// Function to handle category selection
function handleCategorySelection(category) {
    // Remove all active classes
    $(".category").removeClass("active");

    // Add active class to the selected category
    $(`#${category}`).addClass("active");

    // Insert settings according to the selected category
    insertSettings(category);
}

// Click event listener for category selection
$(".category").click(function() {
    handleCategorySelection($(this).attr("id"));
});

// Initial category selection (general)
$("#general").click();