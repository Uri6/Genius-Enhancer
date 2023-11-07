export function createCheckbox(id, labelText) {
    return $("<div>")
        .append($("<input>", { type: "checkbox", id, name: id, class: "chkboxm" }))
        .append($("<label>", { for: id })
            .append($("<span>", { class: "chkboxmspan" }))
            .append(" " + labelText)
        );
};

export function createFieldSet(type, id, text) {
    return $("<fieldset>", { id }).append(
        $("<div>", { class: "center-text" }).append(
            $("<legend>", { id, text })
        )
    );
};

export function handleCheckboxClick (checkboxId, storageKey = checkboxId, messageKey = checkboxId, messageValue = false, additionalFunc = null) {
    const $checkbox = $(`#${checkboxId}`);
    chrome.storage.local.get([storageKey], (res) => {
        $checkbox.prop("checked", res[storageKey]);

        if (additionalFunc) {
            additionalFunc(res[storageKey]);
        }
    });

    $checkbox.click(() => {
        const isChecked = $checkbox.prop("checked");
        const altMessageKey = isChecked ? "album_missingInfo" : "album_missingInfo_remove";
        let updateMessageKey = messageKey.length ? messageKey : altMessageKey;
        chrome.storage.local.set({ [storageKey]: isChecked });
        messageValue ? chrome.runtime.sendMessage({ [updateMessageKey]: messageValue }) : chrome.runtime.sendMessage({ [updateMessageKey]: [isChecked] });

        if (additionalFunc) {
            additionalFunc(isChecked);
        }
    });
};

export function handleSelectChange (selectId, storageKey = selectId, messageKey = selectId, messageValue = false, additionalFunc = null) {
    const $select = $(`#${selectId}`);
    chrome.storage.local.get([storageKey], (res) => {
        $select.val(res[storageKey]);

        if (additionalFunc) {
            additionalFunc(res[storageKey]);
        }
    });

    $select.change(() => {
        $select.blur();
        const value = $select.val();
        chrome.storage.local.set({ [storageKey]: value });
        if (messageValue) {
            chrome.runtime.sendMessage({ [messageKey]: messageValue });
        }

        if (additionalFunc) {
            additionalFunc(value);
        }
    });
};