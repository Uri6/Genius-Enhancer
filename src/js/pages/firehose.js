/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer-Beta/blob/main/LICENSE.md
 * 
 * @fileoverview
 * Handles the Firehose page redesign
 */

/**
 * Inserts the Firehose CSS file into the specified tab
 *
 * @async
 * @param {number} tabId - The ID of the tab to insert the CSS file into
 */
async function insertFirehoseCSS(tabId) {
    await chrome.scripting.insertCSS({
        target: { tabId },
        files: ["./src/css/firehose.css"],
    });
}

/**
 * Executes the Firehose script in the specified tab and updates checkboxes
 *
 * @async
 * @param {number} tabId - The ID of the tab to execute the script in
 */
async function executeFirehoseScript(tabId) {
    function firehoseScript() {
        /**
         * Updates checkboxes in the page by replacing them with custom checkboxes
         *
         * @function
         * @inner
         */
        function updateCheckboxes() {
            $("fieldset input[type='checkbox']").each(function() {
                // If the checkbox is already a custom checkbox, skip it
                if ($(this).hasClass("chkboxm")) {
                    return;
                }

                // Get the attributes of the checkbox
                let attributes = Array.from(this.attributes)
                    .map(attr => `${attr.name}="${attr.value}"`)
                    .join(' ');

                // Replace the checkbox with a custom checkbox
                let replacement = `<input type="checkbox" name="${this.name}" class="chkboxm" ${attributes}><label for="${this.name}"><span class="chkboxmspan"></span>${$(this).next().html()}</label>`;
                $(this).replaceWith(replacement);
            });
        }

        /**
         * Removes empty labels from the page
         * 
         * @function
         * @inner
         */
        function removeEmptyLabels() {
            $("fieldset label").each(function() {
                if (!$(this).children().length) {
                    $(this).remove();
                }
            });
        }

        updateCheckboxes();
        removeEmptyLabels();
    }

    await chrome.scripting.executeScript({
        target: { tabId },
        func: firehoseScript,
    });
}

/**
 * Handles the Firehose page redesign for the specified tab
 *
 * @async
 * @param {number} tabId - The ID of the tab to handle the Firehose functionality for
 */
export async function handleFirehose(tabId) {
    await insertFirehoseCSS(tabId);
    await executeFirehoseScript(tabId);
}