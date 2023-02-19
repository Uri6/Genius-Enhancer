/*
* This code is licensed under the terms of the "LICENSE.md" file
* located in the root directory of this code package.
*/

import { getDetails } from "./sideFunctions.js";

document.getElementById("version").innerHTML += chrome.runtime.getManifest().version;

chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
    chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            func: (() => {
                const hasAppleMusic = document.getElementsByClassName("apple_music_player-player").length > 0 ? true : false
                chrome.storage.local.set({ "hasAppleMusic": hasAppleMusic });
            })
        }
    );

    // get the pageType and isGeniusPage from the local storage
    chrome.storage.local.get(["pageType", "isGeniusPage"], async function (result) {
        var isGeniusPage = result.isGeniusPage;
        var pageType = result.pageType;

        if (isGeniusPage) {
            if (pageType == null || pageType == "unknown") {
                var info = `
                        <fieldset id="info-box">
                            <center>
                                <legend id="genius-page">
                                    Genius Page
                                </legend>
                            </center>
                        </fieldset>
                        `;

                var features = `
                            <fieldset id="no-features-box">
                                <center>
                                    <legend id="features">
                                        There are (still) no<br>special features here
                                    </legend>
                                </center>
                            </fieldset>
                            `;

                var add = info + features;
                document.getElementById("optional-additions").innerHTML = add;
            }

            else switch (pageType) {
                case 'song':
                    var info = `
                            <fieldset id="info-box">
                                <center>
                                    <legend id="genius-page">
                                        Song Page
                                    </legend>
                                </center>
                            </fieldset>
                            `;

                    var appleMusicCheckbox = ``;

                    var spotifyCheckbox = ``;

                    var result = await chrome.storage.local.get(["hasAppleMusic"]);
                    if (true) {//result.hasAppleMusic) {
                        appleMusicCheckbox = `
                                                <div>
                                                <input type="checkbox" id="apple-music-pop-up" name="apple-music-pop-up"("apple-music-pop-up") class="chkboxm">
                                                <label for="apple-music-pop-up">
                                                    <span class="chkboxmspan">
                                                    </span>
                                                    Apple Music
                                                </label>
                                                </div>
                                            `;

                        spotifyCheckbox = `
                                            <div>
                                                <input type="checkbox" id="spotify-pop-up" name="spotify-pop-up"("spotify-pop-up")" class="chkboxm">
                                                <label for="spotify-pop-up">
                                                <span class="chkboxmspan">
                                                </span>
                                                    Spotify
                                                </label>
                                            </div>
                                          `;
                    }

                    else {
                        appleMusicCheckbox = `
                                                <div>
                                                <input type="checkbox" disabled="disabled" id="apple-music-pop-up" name="apple-music-pop-up"("apple-music-pop-up") class="chkboxm">
                                                <label for="apple-music-pop-up">
                                                <span class="chkboxmspan disabled">
                                                </span>
                                                    Apple Music (unavailable)
                                                </label>
                                                </div>
                                            `;

                        spotifyCheckbox = `
                                            <div>
                                                <input type="checkbox" disabled="disabled" id="spotify-pop-up" name="spotify-pop-up"("spotify-pop-up")" class="chkboxm">
                                                <label for="spotify-pop-up">
                                                <span class="chkboxmspan disabled">
                                                </span>
                                                    Spotify (unavailable)
                                                </label>
                                            </div>
                                        `;
                    }

                    var features = `
                                <fieldset id="features-box">
                                    <legend id="features">
                                        Players
                                    </legend>
                                `

                        +

                        appleMusicCheckbox

                        +

                        spotifyCheckbox

                        +

                        `
                                </fieldset>
    
                                <fieldset id="features-box">
                                    <legend id="features">
                                        Features
                                    </legend>
    
                                    <div>
                                        <input type="checkbox" id="modern-text-editor" name="modern-text-editor"("modern-text-editor")" class="chkboxm">
                                        <label for="modern-text-editor">
                                        <span class="chkboxmspan">
                                        </span>
                                            Modern text editor
                                        </label>
                                    </div>

                                    <div>
                                        <input type="checkbox" id="old-song-page" name="old-song-page"("old-song-page")" class="chkboxm">
                                        <label for="old-song-page">
                                        <span class="chkboxmspan">
                                        </span>
                                            Open old song page by default
                                        </label>
                                    </div>
    
                                </fieldset>
                        `;

                    var add = info + features;
                    document.getElementById("optional-additions").innerHTML = add;

                    chrome.storage.local.get(["appleMusicPopUp"], (res) => {
                        document.getElementById("apple-music-pop-up").checked = res.appleMusicPopUp;
                    });

                    document.getElementById("apple-music-pop-up").addEventListener("click", () => {
                        var appleMusicCheckbox = document.getElementById("apple-music-pop-up");
                        chrome.storage.local.set({ "appleMusicPopUp": appleMusicCheckbox.checked });
                        chrome.runtime.sendMessage({ 'song_appleMusicPopUp': [appleMusicCheckbox.checked] });
                    })

                    chrome.storage.local.get(["spotifyPopUp"], (res) => {
                        document.getElementById("spotify-pop-up").checked = res.spotifyPopUp;
                    });

                    document.getElementById("spotify-pop-up").addEventListener("click", () => {
                        var spotifyCheckbox = document.getElementById("spotify-pop-up");
                        chrome.storage.local.set({ "spotifyPopUp": spotifyCheckbox.checked });
                        chrome.runtime.sendMessage({ 'song_spotifyPopUp': [spotifyCheckbox.checked] });
                    })

                    chrome.storage.local.get(["ModernTextEditor"], (res) => {
                        document.getElementById("modern-text-editor").checked = res.ModernTextEditor;
                    });

                    document.getElementById("modern-text-editor").addEventListener("click", () => {
                        var ModernTextEditorCheckbox = document.getElementById("modern-text-editor");
                        chrome.storage.local.set({ "ModernTextEditor": ModernTextEditorCheckbox.checked });
                        chrome.runtime.sendMessage({ 'song_ModernTextEditor': [ModernTextEditorCheckbox.checked] });
                    })

                    chrome.storage.local.get(["OldSongPage"], (res) => {
                        document.getElementById("old-song-page").checked = res.OldSongPage;
                    });

                    document.getElementById("old-song-page").addEventListener("click", () => {
                        var OldSongPageCheckbox = document.getElementById("old-song-page");
                        chrome.storage.local.set({ "OldSongPage": OldSongPageCheckbox.checked });
                    })
                    break;
                case 'album':
                    var info = `
                                        <fieldset id="info-box">
                                            <center>
                                                <legend id="genius-page">
                                                    Album Page
                                                </legend>
                                            </center>
                                        </fieldset>
                            `;

                    var features = `
                                            <fieldset id="features-box">
                                                <legend id="features">
                                                    Metadata Indicators
                                                </legend>
                                                
                                                <div>
                                                <input type="checkbox" id="people" checked name="people"("people") class="chkboxm">
                                                <label for="people">
                                                <span class="chkboxmspan">
                                                </span>
                                                    People (producers & writers)
                                                </label>
                                                </div>
                                                
                                                <div>
                                                    <input type="checkbox" id="bios" checked name="bios"("bios") class="chkboxm">
                                                    <label for="bios">
                                                    <span class="chkboxmspan">
                                                    </span>
                                                        Bios
                                                    </label>
                                                </div>
    
                                                <div>
                                                <input type="checkbox" id="release-date" checked name="release-date"("release-date") class="chkboxm">
                                                <label for="release-date">
                                                <span class="chkboxmspan">
                                                </span>
                                                    Release date
                                                </label>
                                                </div>
                                            </fieldset>
                                `;

                    var add = info + features;
                    document.getElementById("optional-additions").innerHTML = add;

                    chrome.storage.local.get(["bios"], (res) => {
                        document.getElementById("bios").checked = res.bios;
                    });

                    document.getElementById("bios").addEventListener("click", () => {
                        var biosCheckbox = document.getElementById("bios");
                        chrome.storage.local.set({ "bios": biosCheckbox.checked });

                        if (biosCheckbox.checked)
                            var messageText = "album_missingInfo";
                        else
                            var messageText = "album_missingInfo_remove";

                        chrome.runtime.sendMessage({ [messageText]: [true, false, false] });
                    })

                    chrome.storage.local.get(["people"], (res) => {
                        document.getElementById("people").checked = res.people;
                    });

                    document.getElementById("people").addEventListener("click", () => {
                        var peopleCheckbox = document.getElementById("people");
                        chrome.storage.local.set({ "people": peopleCheckbox.checked });

                        if (peopleCheckbox.checked)
                            var messageText = "album_missingInfo";
                        else
                            var messageText = "album_missingInfo_remove";

                        chrome.runtime.sendMessage({ [messageText]: [false, true, false] });
                    })

                    chrome.storage.local.get(["releaseDate"], (res) => {
                        document.getElementById("release-date").checked = res.releaseDate;
                    });

                    document.getElementById("release-date").addEventListener("click", () => {
                        var releaseDateCheckbox = document.getElementById("release-date");
                        chrome.storage.local.set({ "releaseDate": releaseDateCheckbox.checked });

                        if (releaseDateCheckbox.checked)
                            var messageText = "album_missingInfo";
                        else
                            var messageText = "album_missingInfo_remove";

                        chrome.runtime.sendMessage({ [messageText]: [false, false, true] });
                    })

                    break;
                default:
                    var info = `
                        <fieldset id="info-box">
                            <center>
                                <legend id="genius-page">
                                    Genius Page
                                </legend>
                            </center>
                        </fieldset>
                        `;

                    var features = `
                            <fieldset id="no-features-box">
                                <center>
                                    <legend id="features">
                                        There are (still) no<br>special features here
                                    </legend>
                                </center>
                            </fieldset>
                            `;

                    var add = info + features;
                    document.getElementById("optional-additions").innerHTML = add;
                //  var info = `
                //      <fieldset id="info-box">
                //          <center>
                //              <legend id="genius-page">` + /*separate the page type by spaces and capitalize the first letter of each word*/ pageType.split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ') + ` Page</legend>
                //          </center>
                //      </fieldset>
                //      `;
                //  var add = info;
                //  document.getElementById("optional-additions").innerHTML = add;
            }
        }

        else {
            add = `
                <fieldset id="err-box">
                    <center>
                        <legend id="missing-genius-err">It isn't a Genius page</legend>
                    </center>
                </fieldset>
                `;

            document.getElementById("optional-additions").innerHTML = add;
        }
    });
});
