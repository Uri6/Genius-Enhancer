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