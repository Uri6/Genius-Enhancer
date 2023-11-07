/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

import { createCheckbox, createFieldSet, handleCheckboxClick, handleSelectChange } from "./utils.js";

// Set version number
$("#version").text("v" + chrome.runtime.getManifest().version);

const extensionStatusStorageKey = "extensionStatus";
const $extensionStatusCheckbox = $("#extensionStatus");

// Initial checkbox state check
handleCheckboxClick("extensionStatus", "extensionStatus", "", false, (isChecked) => {
    if (isChecked) {
        $("body").removeClass("disabled");
    } else {
        $("body").addClass("disabled");
    }
});

// Focus event listener to handle checkbox state
$(window).focus(() => {
    handleCheckboxClick("extensionStatus", "extensionStatus", "", false, (isChecked) => {
        if (isChecked) {
            $("body").removeClass("disabled");
        } else {
            $("body").addClass("disabled");
        }
    });
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

                .appendTo($settings);

            handleCheckboxClick("powerbarStatus");
            handleSelectChange("defaultSearchType");

            $("#powerbarHotkey").keydown(function(event) {
                let key = event.key;

                // Define the allowed keys
                let allowedKeys = ["Control", "Shift", "Alt", "Space"];
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
                    ")": "0"
                };

                if (specialChars[key]) {
                    key = specialChars[key];
                }

                if (key === " ") {
                    key = "Space";
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

            $("#powerbarHotkey").focusout(function() {
                if (!$(this).val()) {
                    $(this).val("Shift + Shift");
                }
            });

            $(".setting-input:has(#powerbarHotkey)>.empty-input").click(function() {
                $("#powerbarHotkey").val("");
                $("#powerbarHotkey").focus();
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