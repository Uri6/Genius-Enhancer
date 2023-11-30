/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

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

export function handleCheckboxClick(checkboxId, storageKey = checkboxId, messageKey = checkboxId, messageValue = false, additionalFunc = null) {
    const $checkbox = $(`#${checkboxId}`);

    const getAndUpdateState = () => {
        chrome.storage.local.get([storageKey], (res) => {
            $checkbox.prop("checked", res[storageKey]);
            if (additionalFunc) {
                additionalFunc(res[storageKey]);
            }
        });
    };

    // Initial state
    getAndUpdateState();

    // Update state on window focus
    $(window).focus(getAndUpdateState);

    $checkbox.click(() => {
        const isChecked = $checkbox.prop("checked");
        const altMessageKey = isChecked ? "album_missingInfo" : "album_missingInfo_remove";
        const updateMessageKey = messageKey.length ? messageKey : altMessageKey;

        chrome.storage.local.set({ [storageKey]: isChecked });
        chrome.runtime.sendMessage({ [updateMessageKey]: messageValue || [isChecked] });

        getAndUpdateState();
    });
};

export function handleCheckboxesClicks(checkboxId1, checkboxId2, ...rest) {
    const checkboxesIds = [checkboxId1, checkboxId2, ...rest];
    checkboxesIds.forEach(checkboxId => {
        if (typeof checkboxId !== "string") {
            throw new Error(`The checkbox id must be a string (bad index: ${checkboxesIds.indexOf(checkboxId)})`);
        }
        handleCheckboxClick(checkboxId);
    });
}

export function handleSelectChange(selectId, storageKey = selectId, messageKey = selectId, messageValue = false, additionalFunc = null) {
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

export function handleSelectsChanges(selectId1, selectId2, ...rest) {
    const selectsIds = [selectId1, selectId2, ...rest];
    selectsIds.forEach(selectId => {
        if (typeof selectId !== "string") {
            throw new Error(`The select id must be a string (bad index: ${selectsIds.indexOf(selectId)})`);
        }
        handleSelectChange(selectId);
    });
}