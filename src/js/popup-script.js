/*
* This code is licensed under the terms of the "LICENSE.md" file
* located in the root directory of this code package.
*/

const GENIUS_PAGE_ELEMENT = $('<fieldset>', {
    id: 'info-box'
})
    .append($('<div>', {
        class: 'center-text'
    })
        .append($('<legend>', {
            id: 'genius-page',
            text: 'Genius Page'
        }))
    );

const NO_SPECIAL_FEATURES_ELEMENT = $('<fieldset>', {
    id: 'no-features-box'
})
    .append($('<div>', {
        class: 'center-text'
    })
        .append($('<legend>', {
            id: 'features',
            text: 'There are (still) no special features here'
        }))
    );

const NOT_GENIUS_ELEMENT = $('<fieldset>', {
    id: 'err-box'
})
    .append($('<div>', {
        class: 'center-text'
    })
        .append($('<legend>', {
            id: 'missing-genius-err',
            text: "Not a Genius page"
        }))
    );

const ALBUM_PAGE_ELEMENT = $('<fieldset>', {
    id: 'info-box'
})
    .append($('<div>', {
        class: 'center-text'
    })
        .append($('<legend>', {
            id: 'genius-page',
            text: 'Album Page'
        }))
    );

const SONG_PAGE_ELEMENT = $('<fieldset>', {
    id: 'info-box'
})
    .append($('<div>', {
        class: 'center-text'
    })
        .append($('<legend>', {
            id: 'genius-page',
            text: 'Song Page'
        }))
    );

const ALBUM_PAGE_FEATURES_ELEMENT = $('<fieldset>', {
    id: 'features-box'
})
    .append($('<legend>', {
        id: 'features',
        text: 'Metadata Indicators'
    }))
    .append($('<div>')
        .append($('<input>', {
            type: 'checkbox',
            id: 'people',
            checked: true,
            name: 'people',
            class: 'chkboxm'
        }))
        .append($('<label>', {
            for: 'people'
        })
            .append($('<span>', {
                class: 'chkboxmspan'
            }))
            .append(' People (writers & producers)')
        )
    )
    .append($('<div>')
        .append($('<input>', {
            type: 'checkbox',
            id: 'bios',
            checked: true,
            name: 'bios',
            class: 'chkboxm'
        }))
        .append($('<label>', {
            for: 'bios'
        })
            .append($('<span>', {
                class: 'chkboxmspan'
            }))
            .append(' Bios')
        )
    )
    .append($('<div>')
        .append($('<input>', {
            type: 'checkbox',
            id: 'release-date',
            checked: true,
            name: 'release-date',
            class: 'chkboxm'
        }))
        .append($('<label>', {
            for: 'release-date'
        })
            .append($('<span>', {
                class: 'chkboxmspan'
            }))
            .append(' Release date')
        )
    )
    ;

const SONG_PAGE_FEATURES_ELEMENT = $('<div>')
    .append($('<fieldset>', {
        id: 'features-box'
    })
        .append($('<legend>', {
            id: 'features',
            text: 'Players'
        })
            .append($('<div>')
                .append($('<input>', {
                    type: 'checkbox',
                    id: 'apple-music-pop-up',
                    name: 'apple-music-pop-up',
                    class: 'chkboxm'
                }))
                .append($('<label>', {
                    for: 'apple-music-pop-up'
                })
                    .append($('<span>', {
                        class: 'chkboxmspan'
                    }))
                    .append(' Apple Music')
                )
            )
            .append($('<div>')
                .append($('<input>', {
                    type: 'checkbox',
                    id: 'spotify-pop-up',
                    name: 'spotify-pop-up',
                    class: 'chkboxm'
                }))
                .append($('<label>', {
                    for: 'spotify-pop-up'
                })
                    .append($('<span>', {
                        class: 'chkboxmspan'
                    }))
                    .append(' Spotify')
                )
            )
        ))
    .append($('<fieldset>', {
        id: 'features-box'
    })
        .append($('<legend>', {
            id: 'features',
            text: 'Features'
        })
            .append($('<div>')
                .append($('<input>', {
                    type: 'checkbox',
                    id: 'modern-text-editor',
                    name: 'modern-text-editor',
                    class: 'chkboxm'
                }))
                .append($('<label>', {
                    for: 'modern-text-editor'
                })
                    .append($('<span>', {
                        class: 'chkboxmspan'
                    }))
                    .append(' Modern text editor')
                )
            )
            .append($('<div>')
                .append($('<input>', {
                    type: 'checkbox',
                    id: 'old-song-page',
                    name: 'old-song-page',
                    class: 'chkboxm'
                }))
                .append($('<label>', {
                    for: 'old-song-page'
                })
                    .append($('<span>', {
                        class: 'chkboxmspan'
                    }))
                    .append(' Use old song page by default')
                )

            )
        )
    );

$("#version").text($("#version").text() + ' ' + chrome.runtime.getManifest().version);

chrome.tabs.query({ active: true, currentWindow: true }, async () => {

    // get the pageType and isGeniusPage from the local storage
    chrome.storage.local.get(["pageType", "isGeniusPage"], async (result) => {
        const isGeniusPage = result.isGeniusPage;
        const pageType = result.pageType;

        if (!isGeniusPage) {
            $("#optional-additions")
                .append(NOT_GENIUS_ELEMENT);
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

                chrome.storage.local.get(["appleMusicPopUp"], (res) => {
                    $("#apple-music-pop-up").prop("checked", res.appleMusicPopUp);
                });

                $("#apple-music-pop-up").click(() => {
                    const appleMusicCheckbox = document.getElementById("apple-music-pop-up");
                    chrome.storage.local.set({ "appleMusicPopUp": appleMusicCheckbox.checked });
                    chrome.runtime.sendMessage({ "song_appleMusicPopUp": [appleMusicCheckbox.checked] });
                });

                chrome.storage.local.get(["spotifyPopUp"], (res) => {
                    $("#spotify-pop-up").prop("checked", res.spotifyPopUp);
                });

                $("#spotify-pop-up").click(() => {
                    const spotifyCheckbox = document.getElementById("spotify-pop-up");
                    chrome.storage.local.set({ "spotifyPopUp": spotifyCheckbox.checked });
                    chrome.runtime.sendMessage({ "song_spotifyPopUp": [spotifyCheckbox.checked] });
                });

                chrome.storage.local.get(["ModernTextEditor"], (res) => {
                    $("#modern-text-editor").prop("checked", res.ModernTextEditor);
                });

                $("#modern-text-editor").click(() => {
                    const ModernTextEditorCheckbox = document.getElementById("modern-text-editor");
                    chrome.storage.local.set({ "ModernTextEditor": ModernTextEditorCheckbox.checked });
                    chrome.runtime.sendMessage({ "song_ModernTextEditor": [ModernTextEditorCheckbox.checked] });
                });

                chrome.storage.local.get(["OldSongPage"], (res) => {
                    $("#old-song-page").prop("checked", res.OldSongPage);
                });

                $("#old-song-page").click(() => {
                    const OldSongPageCheckbox = document.getElementById("old-song-page");
                    chrome.storage.local.set({ "OldSongPage": OldSongPageCheckbox.checked });
                });
                break;
            case "album":
                $("#optional-additions")
                    .append(ALBUM_PAGE_ELEMENT)
                    .append(ALBUM_PAGE_FEATURES_ELEMENT);

                // Define reusable functions to handle checkboxes
                const handleCheckbox = (checkboxName, messageArray) => {
                    chrome.storage.local.get([checkboxName], (res) => {
                        $(`#${checkboxName}`).prop("checked", res[checkboxName]);
                    });

                    $(`#${checkboxName}`).click(() => {
                        chrome.storage.local.set({ [checkboxName]: $(`#${checkboxName}`).prop("checked") });
                        const messageText = $(`#${checkboxName}`).prop("checked") ? "album_missingInfo" : "album_missingInfo_remove";
                        chrome.runtime.sendMessage({ [messageText]: messageArray });
                    });
                };

                // Handle each checkbox individually
                handleCheckbox("bios", [true, false, false]);
                handleCheckbox("people", [false, true, false]);
                handleCheckbox("release-date", [false, false, true]);


                break;
            default:
                $("#optional-additions")
                    .append(GENIUS_PAGE_ELEMENT);
                break;
        }
    });
});
