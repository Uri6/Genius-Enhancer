async function insertFirehoseCSS(tabId) {
    await chrome.scripting.insertCSS({
        target: { tabId },
        files: ["./src/css/firehose.css"],
    });
}

async function executeFirehoseScript(tabId) {
    function firehoseScript() {
        function updateCheckboxes() {
            $("fieldset input[type='checkbox']").each(function () {
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

        function removeEmptyLabels() {
            $("fieldset label").each(function () {
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

export async function handleFirehose(tabId) {
    await insertFirehoseCSS(tabId);
    await executeFirehoseScript(tabId);
}