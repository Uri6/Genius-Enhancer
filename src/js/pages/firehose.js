/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 *
 * @fileoverview
 * Handles the Firehose page redesign
 */

import $ from "jquery";

/**
 * Updates checkboxes in the page by replacing them with custom checkboxes
 */
function updateCheckboxes() {
    $("fieldset input[type='checkbox']").each((_, element) => {
        // If the checkbox is already a custom checkbox, skip it
        if ($(element).hasClass("chkboxm")) {
            return;
        }

        // Get the attributes of the checkbox
        let attributes = Array.from(element.attributes)
            .map(attr => `${attr.name}="${attr.value}"`)
            .join(" ");

        const e = $(element);

        // Replace the checkbox with a custom checkbox
        let replacement = `<input type="checkbox" name="${e.name}" class="chkboxm" ${attributes}><label for="${e.name}"><span class="chkboxmspan"></span>${e.next().html()}</label>`;
        $(element).replaceWith(replacement);
    });
}

/**
 * Removes empty labels from the page
 */
function removeEmptyLabels() {
    $("fieldset label").each((_, e) => {
        if (!$(e).children().length) {
            $(e).remove();
        }
    });
}

updateCheckboxes();
removeEmptyLabels();
