/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

import { createCheckbox, createFieldSet, handleCheckboxClick } from "./utils.js";

const ALBUM_PAGE_ELEMENT = createFieldSet("info-box", "genius-page", "Album");
const SONG_PAGE_ELEMENT = createFieldSet("info-box", "genius-page", "Song");
const FORUMS_ELEMENT = createFieldSet("info-box", "genius-page", "Forums");

const ALBUM_PAGE_FEATURES_ELEMENT = $("<fieldset>", { id: "features-box" })
    .append($("<legend>", { id: "features", text: "Metadata Indicators" }))
    .append(createCheckbox("people", "People (writers & producers)"))
    .append(createCheckbox("bios", "Bios"))
    .append(createCheckbox("release-date", "Release date"));

const SONG_PAGE_FEATURES_ELEMENT = $("<div>")
    .append($("<fieldset>", { id: "features-box" })
        .append($("<legend>", { id: "features", text: "Players" }))
        .append(createCheckbox("apple-music-pop-up", "Apple Music"))
        .append(createCheckbox("spotify-pop-up", "Spotify"))
    )
    .append($("<fieldset>", { id: "features-box" })
        .append($("<legend>", { id: "features", text: "Features" }))
        .append(createCheckbox("modern-text-editor", "Modern text editor"))
        .append(createCheckbox("old-song-page", "Use old song page by default"))
    );

const FORUMS_FEATURES_ELEMENT = $("<fieldset>", { id: "features-box" })
    .append($("<legend>", { id: "features", text: "Features" }))
    .append(createCheckbox("modernForums", "Modern forums"))
    .append(createCheckbox("modern-text-editor", "Modern text editor"));

const INFO_TOOLTIP = $("<div>", {
    id: "info-tooltip",
    text: "Version " + chrome.runtime.getManifest().version
});

const SONG_PAGE_CONTAINER = $("<div>", { id: "song-container" });
const ALBUM_PAGE_CONTAINER = $("<div>", { id: "album-container" });
const FORUMS_CONTAINER = $("<div>", { id: "forum-container" });

// Initialize hidden state for all pages except the first
ALBUM_PAGE_CONTAINER.hide();
FORUMS_CONTAINER.hide();

const $infoIcon = $("svg.info-icon");

$infoIcon.hover(() => {
    INFO_TOOLTIP.appendTo($infoIcon.parent());
}, () => {
    INFO_TOOLTIP.remove();
});

const $suggestFeature = $("a.suggest");
const suggestIcon = chrome.runtime.getURL("/src/imgs/other/lightBulbWBg.svg");

$suggestFeature.append($("<img>", { src: suggestIcon, class: "icon" }));

handleCheckboxClick("extensionStatus", "extensionStatus", "", false, (isChecked) => {
    if (isChecked) {
        $("body").removeClass("disabled");
    } else {
        $("body").addClass("disabled");
    }
});

const pages = [SONG_PAGE_CONTAINER, ALBUM_PAGE_CONTAINER, FORUMS_CONTAINER];
let currentPageIndex = 0;

const loadPage = () => {
    $("#optional-additions > div:not(.arrow)").hide(); // hide all pages
    pages[currentPageIndex].show(); // show current page
};

loadPage(); // initially load the first page

chrome.tabs.query({ active: true, currentWindow: true }, async () => {
    const additions = $("#optional-additions");

    const $arrowLeft = $("<div>", {
        class: "arrow",
        id: "arrow-left",
        text: "‹",
        on: {
            click: () => {
                currentPageIndex--;
                if (currentPageIndex < 0) {
                    currentPageIndex = pages.length - 1; // loop back to last page
                }
                loadPage();
            }
        }
    });

    const $arrowRight = $("<div>", {
        class: "arrow",
        id: "arrow-right",
        text: "›",
        on: {
            click: () => {
                currentPageIndex++;
                if (currentPageIndex >= pages.length) {
                    currentPageIndex = 0; // loop back to first page
                }
                loadPage();
            }
        }
    });

    // add all pages to the additions container
    additions.append($arrowLeft, SONG_PAGE_CONTAINER, ALBUM_PAGE_CONTAINER, FORUMS_CONTAINER, $arrowRight);

    // create and add song elements
    SONG_PAGE_CONTAINER
        .append(SONG_PAGE_ELEMENT)
        .append(SONG_PAGE_FEATURES_ELEMENT);
    handleCheckboxClick("apple-music-pop-up", "appleMusicPopUp", "song_appleMusicPopUp");
    handleCheckboxClick("spotify-pop-up", "spotifyPopUp", "song_spotifyPopUp");
    handleCheckboxClick("modern-text-editor", "ModernTextEditor", "song_ModernTextEditor");
    handleCheckboxClick("old-song-page", "OldSongPage", "");

    // create and add album elements
    ALBUM_PAGE_CONTAINER
        .append(ALBUM_PAGE_ELEMENT)
        .append(ALBUM_PAGE_FEATURES_ELEMENT);
    handleCheckboxClick("bios", "bios", "", [true, false, false]);
    handleCheckboxClick("people", "people", "", [false, true, false]);
    handleCheckboxClick("release-date", "releaseDate", "", [false, false, true]);

    // create and add forum elements
    FORUMS_CONTAINER
        .append(FORUMS_ELEMENT)
        .append(FORUMS_FEATURES_ELEMENT);
    handleCheckboxClick("modernForums", "modernForums", "");
    handleCheckboxClick("modern-text-editor", "ModernTextEditor", "song_ModernTextEditor");

    // allow navigation through pages using arrow keys
    $(document).keydown((e) => {
        if (e.key === "ArrowLeft") {
            $arrowLeft.click();
        } else if (e.key === "ArrowRight") {
            $arrowRight.click();
        }
    });
});