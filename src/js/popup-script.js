/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer-Beta/blob/main/LICENSE.md
 */

const createElement = (type, id, text) => {
    return $("<fieldset>", { id }).append(
        $("<div>", { class: "center-text" }).append(
            $("<legend>", { id, text })
        )
    );
};

const createCheckbox = (id, labelText) => {
    return $("<div>")
        .append($("<input>", { type: "checkbox", id, name: id, class: "chkboxm" }))
        .append($("<label>", { for: id })
            .append($("<span>", { class: "chkboxmspan" }))
            .append(labelText)
        );
};

const GENIUS_PAGE_ELEMENT = createElement("info-box", "genius-page", "Genius Page");
const NO_SPECIAL_FEATURES_ELEMENT = createElement("no-features-box", "features", "There are (still) no special features here");
const NOT_GENIUS_ELEMENT = createElement("err-box", "missing-genius-err", "Not a Genius page");
const ALBUM_PAGE_ELEMENT = createElement("info-box", "genius-page", "Album Page");
const SONG_PAGE_ELEMENT = createElement("info-box", "genius-page", "Song Page");

const ALBUM_PAGE_FEATURES_ELEMENT = $("<fieldset>", { id: "features-box" })
    .append($("<legend>", { id: "features", text: "Metadata Indicators" }))
    .append(createCheckbox("people", " People (writers & producers)"))
    .append(createCheckbox("bios", " Bios"))
    .append(createCheckbox("release-date", " Release date"));

const SONG_PAGE_FEATURES_ELEMENT = $("<div>")
    .append($("<fieldset>", { id: "features-box" })
        .append($("<legend>", { id: "features", text: "Players" }))
        .append(createCheckbox("apple-music-pop-up", " Apple Music"))
        .append(createCheckbox("spotify-pop-up", " Spotify"))
    )
    .append($("<fieldset>", { id: "features-box" })
        .append($("<legend>", { id: "features", text: "Features" }))
        .append(createCheckbox("modern-text-editor", " Modern text editor"))
        .append(createCheckbox("old-song-page", " Use old song page by default"))
    );

$("#version").text($("#version").text() + " " + chrome.runtime.getManifest().version);

const handleCheckboxClick = (checkboxId, storageKey, messageKey, messageValue = false) => {
    const $checkbox = $(`#${checkboxId}`);
    chrome.storage.local.get([storageKey], (res) => {
        $checkbox.prop("checked", res[storageKey]);
    });

    $checkbox.click(() => {
        const isChecked = $checkbox.prop("checked");
        const altMessageKey = isChecked ?  "album_missingInfo" : "album_missingInfo_remove"
        let updateMessageKey = messageKey.length ? messageKey : altMessageKey;
        chrome.storage.local.set({ [storageKey]: isChecked });
        messageValue ? chrome.runtime.sendMessage({ [updateMessageKey]: messageValue }) : chrome.runtime.sendMessage({ [updateMessageKey]: [isChecked] });
    });
};

chrome.tabs.query({ active: true, currentWindow: true }, async () => {
    chrome.storage.local.get(["pageType", "isGeniusPage"], async (result) => {
        const { isGeniusPage, pageType } = result;

        if (!isGeniusPage) {
            $("#optional-additions").append(NOT_GENIUS_ELEMENT);
            return;
        }

        if (pageType == null || pageType === "unknown") {
            $("#optional-additions")
                .append(GENIUS_PAGE_FEATURES_ELEMENT)
                .append(SONG_PAGE_FEATURES_ELEMENT);
            return;
        }

        switch (pageType) {
            case "song":
                $("#optional-additions")
                    .append(SONG_PAGE_ELEMENT)
                    .append(SONG_PAGE_FEATURES_ELEMENT);

                handleCheckboxClick("apple-music-pop-up", "appleMusicPopUp", "song_appleMusicPopUp");
                handleCheckboxClick("spotify-pop-up", "spotifyPopUp", "song_spotifyPopUp");
                handleCheckboxClick("modern-text-editor", "ModernTextEditor", "song_ModernTextEditor");

                chrome.storage.local.get(["OldSongPage"], (res) => {
                    $("#old-song-page").prop("checked", res.OldSongPage);
                });

                $("#old-song-page").click(() => {
                    const OldSongPageCheckbox = document.getElementById("old-song-page");
                    chrome.storage.local.set({ OldSongPage: OldSongPageCheckbox.checked });
                });
                break;
            case "album":
                $("#optional-additions")
                    .append(ALBUM_PAGE_ELEMENT)
                    .append(ALBUM_PAGE_FEATURES_ELEMENT);

                handleCheckboxClick("bios", "bios", "", [true, false, false]);
                handleCheckboxClick("people", "people", "", [false, true, false]);
                handleCheckboxClick("release-date", "releaseDate", "", [false, false, true]);

                break;
            default:
                $("#optional-additions").append(GENIUS_PAGE_ELEMENT);
                break;
        }
    });
});