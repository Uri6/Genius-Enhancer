/*
* This code is licensed under the terms of the "LICENSE.md" file
* located in the root directory of this code package.
*/

const GENIUS_PAGE_HTML = `
<fieldset id="info-box">
    <center>
        <legend id="genius-page">
            Genius Page
        </legend>
    </center>
</fieldset>`;

const NO_SPECIAL_FEATURES_HTML = `
<fieldset id="no-features-box">
    <center>
        <legend id="features">
            There are (still) no<br>special features here
        </legend>
    </center>
</fieldset>`;

const NOT_GENIUS_HTML = `
<fieldset id="err-box">
    <center>
        <legend id="missing-genius-err">You're not on a Genius page!</legend>
    </center>
</fieldset>`;

const ALBUM_PAGE_HTML = `
<fieldset id="info-box">
    <center>
        <legend id="genius-page">
            Album Page
        </legend>
    </center>
</fieldset>`;

const SONG_PAGE_HTML = `
<fieldset id="info-box">
    <center>
        <legend id="genius-page">
            Song Page
        </legend>
    </center>
</fieldset>`;

const ALBUM_PAGE_FEATURES_HTML = `
<fieldset id="features-box">
    <legend id="features">
        Metadata Indicators
    </legend>

    <div>
        <input type="checkbox" id="people" checked name="people" class="chkboxm">
            <label for="people">
                <span class="chkboxmspan">
                </span>
                People (producers & writers)
            </label>
        </input>
    </div>
                                                
    <div>
        <input type="checkbox" id="bios" checked name="bios" class="chkboxm">
            <label for="bios">
                <span class="chkboxmspan">
                </span>
                Bios
            </label>
        </input>
    </div>
    
    <div>
        <input type="checkbox" id="release-date" checked name="release-date" class="chkboxm">
            <label for="release-date">
                <span class="chkboxmspan">
                </span>
                Release date
            </label>
        </input>
    </div>
</fieldset>`;

const SONG_PAGE_APPLE_MUSIC_CHECKBOX = `
<div>
    <input type="checkbox" id="apple-music-pop-up" name="apple-music-pop-up" class="chkboxm">
    <label for="apple-music-pop-up">
        <span class="chkboxmspan">
        </span>
        Apple Music
    </label>
</div>`;

const SONG_PAGE_SPOTIFY_CHECKBOX = `
<div>
    <input type="checkbox" id="spotify-pop-up" name="spotify-pop-up" class="chkboxm">
        <label for="spotify-pop-up">
            <span class="chkboxmspan">
            </span>
            Spotify
        </label>
</div>`;

const SONG_PAGE_FEATURES_HTML = `
<fieldset id="features-box">
    <legend id="features">
        Players
    </legend>

    ${SONG_PAGE_APPLE_MUSIC_CHECKBOX}
    ${SONG_PAGE_SPOTIFY_CHECKBOX}
</fieldset>
    
<fieldset id="features-box">
    <legend id="features">
        Features
    </legend>
    
    <div>
        <input type="checkbox" id="modern-text-editor" name="modern-text-editor" class="chkboxm">
            <label for="modern-text-editor">
                <span class="chkboxmspan">
                </span>
                Modern text editor
            </label>
        </input>
    </div>

    <div>
        <input type="checkbox" id="old-song-page" name="old-song-page" class="chkboxm">
            <label for="old-song-page">
                <span class="chkboxmspan">
                </span>
                Open old song page by default
            </label>
        </input>
    </div>
</fieldset>`;

document.getElementById("version").innerHTML += chrome.runtime.getManifest().version;

chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
    await chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            func: (() => {
                const hasAppleMusic = document.getElementsByClassName("apple_music_player-player").length > 0;
                chrome.storage.local.set({ "hasAppleMusic": hasAppleMusic });
            })
        }
    );

    // get the pageType and isGeniusPage from the local storage
    chrome.storage.local.get(["pageType", "isGeniusPage"], async function(result) {
        const isGeniusPage = result.isGeniusPage;
        const pageType = result.pageType;

        if (!isGeniusPage) {
            document.getElementById("optional-additions").innerHTML = NOT_GENIUS_HTML;
            return;
        }

        if (pageType == null || pageType === "unknown") {
            document.getElementById("optional-additions").innerHTML =
                GENIUS_PAGE_HTML + NO_SPECIAL_FEATURES_HTML;
            return;
        }

        switch (pageType) {
            case "song":
                document.getElementById("optional-additions").innerHTML =
                    SONG_PAGE_HTML + SONG_PAGE_FEATURES_HTML;

                chrome.storage.local.get(["appleMusicPopUp"], (res) => {
                    document.getElementById("apple-music-pop-up").checked = res.appleMusicPopUp;
                });

                document.getElementById("apple-music-pop-up").addEventListener("click", () => {
                    const appleMusicCheckbox = document.getElementById("apple-music-pop-up");
                    chrome.storage.local.set({ "appleMusicPopUp": appleMusicCheckbox.checked });
                    chrome.runtime.sendMessage({ "song_appleMusicPopUp": [appleMusicCheckbox.checked] });
                });

                chrome.storage.local.get(["spotifyPopUp"], (res) => {
                    document.getElementById("spotify-pop-up").checked = res.spotifyPopUp;
                });

                document.getElementById("spotify-pop-up").addEventListener("click", () => {
                    const spotifyCheckbox = document.getElementById("spotify-pop-up");
                    chrome.storage.local.set({ "spotifyPopUp": spotifyCheckbox.checked });
                    chrome.runtime.sendMessage({ "song_spotifyPopUp": [spotifyCheckbox.checked] });
                });

                chrome.storage.local.get(["ModernTextEditor"], (res) => {
                    document.getElementById("modern-text-editor").checked = res.ModernTextEditor;
                });

                document.getElementById("modern-text-editor").addEventListener("click", () => {
                    const ModernTextEditorCheckbox = document.getElementById("modern-text-editor");
                    chrome.storage.local.set({ "ModernTextEditor": ModernTextEditorCheckbox.checked });
                    chrome.runtime.sendMessage({ "song_ModernTextEditor": [ModernTextEditorCheckbox.checked] });
                });

                chrome.storage.local.get(["OldSongPage"], (res) => {
                    document.getElementById("old-song-page").checked = res.OldSongPage;
                });

                document.getElementById("old-song-page").addEventListener("click", () => {
                    const OldSongPageCheckbox = document.getElementById("old-song-page");
                    chrome.storage.local.set({ "OldSongPage": OldSongPageCheckbox.checked });
                });
                break;
            case "album":
                document.getElementById("optional-additions").innerHTML =
                    ALBUM_PAGE_HTML + ALBUM_PAGE_FEATURES_HTML;

                chrome.storage.local.get(["bios"], (res) => {
                    document.getElementById("bios").checked = res.bios;
                });

                document.getElementById("bios").addEventListener("click", () => {
                    const biosCheckbox = document.getElementById("bios");
                    chrome.storage.local.set({ "bios": biosCheckbox.checked });

                    const messageText = biosCheckbox.checked ? "album_missingInfo" : "album_missingInfo_remove";

                    chrome.runtime.sendMessage({ [messageText]: [true, false, false] });
                });

                chrome.storage.local.get(["people"], (res) => {
                    document.getElementById("people").checked = res.people;
                });

                document.getElementById("people").addEventListener("click", () => {
                    const peopleCheckbox = document.getElementById("people");
                    chrome.storage.local.set({ "people": peopleCheckbox.checked });

                    const messageText = peopleCheckbox.checked ? "album_missingInfo" : "album_missingInfo_remove";

                    chrome.runtime.sendMessage({ [messageText]: [false, true, false] });
                });

                chrome.storage.local.get(["releaseDate"], (res) => {
                    document.getElementById("release-date").checked = res.releaseDate;
                });

                document.getElementById("release-date").addEventListener("click", () => {
                    const releaseDateCheckbox = document.getElementById("release-date");
                    chrome.storage.local.set({ "releaseDate": releaseDateCheckbox.checked });

                    const messageText = releaseDateCheckbox.checked ? "album_missingInfo" : "album_missingInfo_remove";

                    chrome.runtime.sendMessage({ [messageText]: [false, false, true] });
                });

                break;
            default:
                document.getElementById("optional-additions").innerHTML =
                    GENIUS_PAGE_HTML + NO_SPECIAL_FEATURES_HTML;
                break;
        }
    });
});
