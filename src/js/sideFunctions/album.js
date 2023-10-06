/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

export async function missingInfo(bio, people, releaseDate) {
    if ($(".icon-container").length > 0) {
        if (bio) {
            $(".bio-icon").removeClass("ge-hidden ge-fade-out").addClass("ge-fade-in");
        }
        if (people) {
            $(".people-icon").removeClass("ge-hidden ge-fade-out").addClass("ge-fade-in");
        }
        if (releaseDate) {
            $(".release-date-icon").removeClass("ge-hidden ge-fade-out").addClass("ge-fade-in");
        }
        return;
    }

    const imgs = {
        bios: {
            exists: chrome.runtime.getURL("/src/imgs/bio/2/Exists/64x64.png"),
            missing: chrome.runtime.getURL("/src/imgs/bio/2/Missing/64x64.png")
        },
        people: {
            exists: chrome.runtime.getURL("/src/imgs/people/2/Exists/64x64.png"),
            missing: chrome.runtime.getURL("/src/imgs/people/2/Missing/64x64.png")
        },
        releaseDate: {
            exists: chrome.runtime.getURL("/src/imgs/releaseDate/2/Exists/64x64.png"),
            missing: chrome.runtime.getURL("/src/imgs/releaseDate/2/Missing/64x64.png")
        }
    };

    const bioClasses = "bio-icon" + (bio ? " ge-fade-in" : " ge-hidden");
    const peopleClasses = "people-icon" + (people ? " ge-fade-in" : " ge-hidden");
    const releaseDateClasses = "release-date-icon" + (releaseDate ? " ge-fade-in" : " ge-hidden");
    const albumObject = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ "getDetails": [true] }, (response) => {
            resolve(response);
        });
    });
    const tracklist = document.getElementsByClassName("chart_row chart_row--light_border chart_row--full_bleed_left chart_row--align_baseline chart_row--no_hover");
    let song_index = 0;

    if (albumObject.album_appearances.length === 0) {
        return;
    }

    albumObject.album_appearances.forEach(({ song }) => {
        let elem = tracklist[song_index];

        const iconContainer = $("<div>", {
            class: "icon-container"
        });

        const createIcon = (imgSrc, imgAlt, imgTitle, imgClasses) => {
            const imgElem = $("<img>").attr("src", imgSrc).attr("alt", imgAlt).addClass(imgClasses);
            if (imgTitle) {
                imgElem.attr("title", imgTitle);
            }
            iconContainer.append(imgElem);
        };

        const peopleAreMissing = song.writer_artists.length === 0 || song.producer_artists.length === 0;
        createIcon(imgs.people[peopleAreMissing ? "missing" : "exists"], peopleAreMissing ? "missing people" : "exists people", peopleAreMissing ? "There's missing information about the creators of this song" : "", peopleClasses);
        createIcon(imgs.bios[song.description_preview === "" ? "missing" : "exists"], song.description_preview === "" ? "missing bio" : "exists bio", song.description_preview === "" ? "No one has written a bio for this song yet" : "", bioClasses);
        createIcon(imgs.releaseDate[song.release_date_for_display ? "exists" : "missing"], song.release_date_for_display ? "exists release date" : "missing release date", !song.release_date_for_display ? "The release date for this song is unknown" : "", releaseDateClasses);

        elem.appendChild(iconContainer[0]);
        song_index++;
    });
}


export function removeMissingInfo(bio, people, releaseDate) {
    const peopleIcons = $(".people-icon");
    const bioIcons = $(".bio-icon");
    const releaseDateIcons = $(".release-date-icon");

    const icons = bio ? bioIcons : people ? peopleIcons : releaseDateIcons;
    icons.removeClass("ge-fade-in").addClass("ge-fade-out");
    setTimeout(() => {
        icons.addClass("ge-hidden");
    }, 200);
}

/**
 * Retrieves information about a YouTube playlist, including the artist name, playlist title, image, and a list of video titles and links
 *
 * @param {string} playlistLink - The link to the YouTube playlist to retrieve information for
 * @throws {Error} - If the playlist link is not a valid YouTube playlist link, or if there is an error fetching the playlist metadata or videos
 * @returns {Promise<Object>} - A Promise that resolves to an object containing the artist name, playlist title, image, and a list of video titles and links for the playlist
 */
export async function getPlaylistVideos(playlistLink) {
    const possibleLinks = ["https://www.youtube.com/playlist", "https://youtube.com/playlist", "https://music.youtube.com/playlist"];
    if (!possibleLinks.some((link) => playlistLink.startsWith(link))) {
        return ("getPlaylistVideos: Invalid playlist link");
    }

    const playlistId = new URL(playlistLink).searchParams.get("list");
    const key = secrets.GOOGLE_API_KEY;
    console.log(key);

    const metadataResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${key}`);
    if (!metadataResponse.ok) {
        return ("getPlaylistVideos: Failed to fetch playlist metadata");
    }

    const metadataData = (await metadataResponse.json()).items[0].snippet;
    const thumbnails = metadataData.thumbnails;
    const playlistImage = (thumbnails.maxres || thumbnails.high || thumbnails.medium || thumbnails.default).url;

    let videosData;
    let videoTitles = [];
    let videoLinks = [];
    let nextPageToken = '';

    do {
        const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${nextPageToken}&playlistId=${playlistId}&key=${key}`);
        if (!videosResponse.ok) {
            return ("getPlaylistVideos: Failed to fetch playlist videos");
        }

        videosData = await videosResponse.json();
        videoTitles.push(...videosData.items.map(item => item.snippet.title));
        videoLinks.push(...videosData.items.map(item => `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`));
        nextPageToken = videosData.nextPageToken;
    } while (nextPageToken);

    return {
        artistName: metadataData.channelTitle,
        playlistTitle: metadataData.title,
        playlistImage,
        playlistLength: videoLinks.length,
        videoTitles,
        videoLinks
    };
}

export async function appendIcon() {
    let hashmap;
    /*
        const roleDefaultWhitelist = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ "getRolesList": ["A"] }, async (response) => {
                resolve(response);
            });
        });

        const artistDefaultWhitelist = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ "getArtistsList": ["A"] }, async (response) => {
                resolve(response);
            });
        });
    */

    const handleKeyboardEvents = (event) => {
        if ($("#ge-changelog-popup").length) {
            return;
        }

        switch (event.keyCode || event.which) {
            case 27: // Escape key
                const closeIcon = $(".close-icon");
                if (!!closeIcon.length) {
                    closeIcon[0].click();
                }
                break;
            case 71: // 'G'/'g' key
                if (event.altKey && !$(".blured-background").length) {
                    $(".extension-icon")[0].click();
                }
                break;
            case 83: // 'S'/'s' key
                const saveButton = $(".ge-save-button");
                if (event.altKey && !!saveButton.length) {
                    saveButton[0].click();
                }
                break;
            default:
                break;
        }
    };

    const userValidation = () => {
        const disable_add_tag = (placeholderText) => {
            document.getElementById("ge-add-tags").placeholder = placeholderText;
        };

        const user_picture = document.getElementsByClassName("header-user_avatar clipped_background_image")[0];

        // check if the user is logged in
        if (user_picture) {
            // access user_picture's parent element
            const user_picture_parent = user_picture.parentElement;
            // make sure the user's iq is high enough to add a tag
            if (parseInt(user_picture_parent.children[1].innerText.replace(" IQ", "").replaceAll(",", "")) < 100) {
                disable_add_tag("You need at least 100 IQ to tag songs");
            }
        } else {
            disable_add_tag("You need to be logged in to tag songs");
        }
    };

    const createInput = (classes, type, placeholder) => {
        return $("<input>", {
            class: classes,
            type: type,
            placeholder: placeholder,
            spellcheck: "false",
            "data-gramm": "false"
        });
    };

    const getRandomColor = () => {
        const rand = (min, max) => {
            return min + Math.random() * (max - min);
        };

        const h = rand(1, 360) | 0,
            s = rand(40, 70) | 0,
            l = rand(65, 72) | 0;

        return "hsl(" + h + "," + s + "%," + l + "%)";
    };

    const transformTag = (tagData) => {
        tagData.color = getRandomColor();
        tagData.style = "--tag-bg:" + tagData.color;
        tagData.value = tagData.value.trim().replace(/ +/g, " ");
    };

    const tags_transformTag = (tagData) => {
        transformTag(tagData);

        switch (tagData.value.toLowerCase()) {
            case "pop":
            case "genius pop":
                tagData.value = "Pop Genius";
                tagData.id = 16;
                break;
            case "rap":
            case "genius rap":
                tagData.value = "Rap Genius";
                tagData.id = 1434;
                break;
            case "rock":
            case "genius rock":
                tagData.value = "Rock Genius";
                tagData.id = 567;
                break;
            case "r&b":
            case "genius r&b":
                tagData.value = "R&B Genius";
                tagData.id = 352;
                break;
            case "country":
            case "genius country":
                tagData.value = "Country Genius";
                tagData.id = 413;
                break;
            case "hip hop":
            case "genius hip hop":
            case "genius hip-hop":
            case "hip hop genius":
            case "hip-hop genius":
                tagData.value = "Hip-Hop";
                tagData.id = 3783;
                break;
        }
    };

    const addCreditsInputs = (/*roleDefaultWhitelist, artistDefaultWhitelist*/) => {

        let controller;

        const inputs = $("<div>", {
            class: "add-credits-inputs"
        }).insertBefore($(".add-credits.add"));

        const roleInput = createInput("add-credits role rcorners ge-textarea", "text", "Role").appendTo(inputs);
        const artistInput = createInput("add-credits artist rcorners ge-textarea", "text", "Artist").appendTo(inputs);

        $("<div>", {
            class: "delete-button-container",
            on: {
                click: function() {
                    inputs.remove();
                }
            }
        })
            .append($("<img>", {
                class: "delete-button",
                src: chrome.runtime.getURL("src/imgs/other/delete.svg")
            }))
            .appendTo(inputs);

        const tagify_role = new Tagify(roleInput[0], {
            delimiters: null,
            mode: "select",
            templates: {
                tag: function(tagData) {
                    try {
                        return `<tag title="${tagData.value}" tag-id="${tagData.id}" contenteditable="false" spellcheck="false" class="tagify__tag ${tagData.class ? tagData.class : ""}" ${this.getAttributes(tagData)}>
                                        <div>
                                            <span class="tagify__tag-text">${tagData.value}</span>
                                        </div>
                                    </tag>`;
                    } catch (err) {
                        console.error(err);
                    }
                },

                dropdownItem: function(tagData) {
                    try {
                        return `<div ${this.getAttributes(tagData)} class="tagify__dropdown__item ${tagData.class ? tagData.class : ""}" >
                                            <span>${tagData.value}</span>
                                        </div>`;
                    } catch (err) {
                        console.error(err);
                    }
                }
            },
            whitelist: /*roleDefaultWhitelist*/[],
            dropdown: {
                enabled: 0,
                classname: "tags-look",
                maxItems: 100,
                closeOnSelect: true,
                highlightFirst: true
            },
            enforceWhitelist: false,
            maxTags: 1,
            autoComplete: {
                enabled: true
            },
            editTags: 1
        });

        const tagify_artist = new Tagify(artistInput[0], {
            delimiters: ",",
            templates: {
                tag: function(tagData) {
                    try {
                        return `<tag
                                    title="${tagData.value}"
                                    tag-id="${tagData.id}"
                                    full-response='${JSON.stringify(tagData.full_response)}'
                                    contenteditable="false"
                                    spellcheck="false"
                                    class="tagify__tag ${tagData.class ? tagData.class : ""}"
                                    ${this.getAttributes(tagData)}>
                                    <x title="remove tag" class="tagify__tag__removeBtn"></x>
                                    <div>
                                        <div class="tagify__tag__avatar-wrap">
                                            <img onerror="this.style.visibility='hidden'" src="${tagData.avatar}">
                                        </div>
                                        <span class="tagify__tag-text">${tagData.value}</span>
                                    </div>
                                </tag>`;
                    } catch (err) {
                        console.error(err);
                    }
                },

                dropdownItem: function(tagData) {
                    try {
                        return `<div
                                ${this.getAttributes(tagData)}
                                class="tagify__dropdown__item ${tagData.class ? tagData.class : ""}" >
                                    ${tagData.avatar ?
                                `<div class="tagify__dropdown__item__avatar-wrap">
    <img onerror="this.style.visibility='hidden'" src="${tagData.avatar}">
</div>` : ""
                            }
                                    <span>${tagData.value}</span>
                            </div>`;
                    } catch (err) {
                        console.error(err);
                    }
                }
            },
            whitelist: /*artistDefaultWhitelist*/[],
            enforceWhitelist: false,
            autoComplete: {
                enabled: true
            },
            editTags: 0,
            transformTag: transformTag,
            dropdown: {
                enabled: 0,
                classname: "users-list",
                maxItems: 50,
                closeOnSelect: true,
                highlightFirst: true
            }
        });

        roleInput.addClass("has-tagify");
        artistInput.addClass("has-tagify");

        const searchRole = (e) => {
            const roleValue = e.detail.value || e.detail.target.innerText;
            tagify_role.whitelist = /*roleDefaultWhitelist*/[];

            controller?.abort();
            controller = new AbortController();

            tagify_role.loading(true).dropdown.hide();

            new Promise((resolve) => {
                chrome.runtime.sendMessage({ "getCreditsList": [roleValue] }, async (response) => {
                    resolve(response);
                });
            })
                .then((response) => {
                    if (response) {
                        tagify_role.whitelist = response;
                        tagify_role.loading(false).dropdown.show(roleValue);
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        };

        const searchArtist = (e) => {
            const artistValue = e.detail.value;
            tagify_artist.whitelist = /*artistDefaultWhitelist*/[];

            controller?.abort();
            controller = new AbortController();

            tagify_artist.loading(true).dropdown.hide();

            new Promise((resolve) => {
                chrome.runtime.sendMessage({ "getArtistsList": [artistValue] }, async (response) => {
                    resolve(response);
                });
            })
                .then((response) => {
                    if (response) {
                        tagify_artist.whitelist = response;
                        tagify_artist.loading(false).dropdown.show(artistValue);
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        };

        tagify_role.on("input", searchRole);
        tagify_artist.on("input", searchArtist);

        tagify_role.DOM.input.addEventListener("paste", (e) => {
            tagify_role.trigger("input", e);
        });
    };

    const buttonContainer = $(".column_layout-column_span.column_layout-column_span--three_quarter.column_layout-column_span--force_padding").eq(0);
    const extensionButton = $("<img>", {
        class: "extension-icon",
        alt: "genius enhancer extension icon",
        title: "Alt + G",
        src: chrome.runtime.getURL("src/imgs/icons/3/128x128.png")
    }).appendTo(buttonContainer);

    extensionButton.on("click", async () => {
        window.scrollTo(0, 0);
        $("body").addClass("disable-scrolling");

        const popupDiv = $("<dialog>", {
            class: "blured-background ge-fade-in",
            open: true
        }).appendTo("body");

        const popupBox = $("<div>", {
            class: "extension-box ge-zoom-in"
        }).appendTo(popupDiv);

        const headerBox = $("<div>", {
            class: "header-box-container"
        }).appendTo(popupBox);

        const mainBox = $("<div>", {
            class: "main-box-container"
        }).appendTo(popupBox);

        const leftColumn = $("<div>", {
            class: "left-column-container"
        }).appendTo(mainBox);

        const rightColumn = $("<div>", {
            class: "right-column-container"
        }).appendTo(mainBox);

        $("<div>", {
            class: "extension-header-title",
            text: "GE Metadata Editor"
        }).appendTo(headerBox);

        const closeIcons = {
            "close": chrome.runtime.getURL("/src/imgs/other/closeIcon.png"),
            "closeX": chrome.runtime.getURL("/src/imgs/other/closeIconX.png")
        };

        $("<img>", {
            class: "close-icon",
            src: chrome.runtime.getURL("/src/imgs/other/closeIcon.png"),
            on: {
                mouseover: function() {
                    this.src = closeIcons.closeX;
                },
                mouseout: function() {
                    this.src = closeIcons.close;
                },
                click: function() {
                    if (confirm("If you've made changes, they won't save.\nAre you sure you want to close this window?")) {
                        $(".extension-box").addClass("ge-zoom-out");
                        $(".blured-background").addClass("ge-fade-out");
                        $("body").removeClass("disable-scrolling");
                        setTimeout(() => {
                            $(".blured-background").remove();
                        }, 400);
                    }
                }
            },
            attr: {
                title: "Esc"
            }
        }).appendTo(headerBox);

        const autolinkArtworkContainer = $("<div>", {
            class: "autolink-artwork-icon-container"
        }).appendTo(rightColumn);

        const autolinkArtwork = $("<img>", {
            class: "autolink-artwork-icon",
            src: chrome.runtime.getURL("/src/imgs/artwork/artwork-generator.png")
        }).appendTo(autolinkArtworkContainer);

        autolinkArtworkContainer.on("click", async () => {
            if (!$(".artwork-images-stack").length) {

                const imagesStack = $("<div>", {
                    class: "artwork-images-stack"
                });

                $("<div>", {
                    class: "error-container"
                })
                    .append($("<div>", {
                        class: "error-text",
                        html: "There's no<br>match :("
                    }))
                    .appendTo(imagesStack);

                const album_artwork_results = $("#albumArtworks").children().map(function() {
                    return $(this).val();
                }).get();

                autolinkArtwork.attr('disabled', 'disabled');

                if (JSON.stringify(album_artwork_results) !== JSON.stringify([''])) {
                    album_artwork_results.slice().reverse().forEach(result => {
                        $("<img>", {
                            class: "artwork-image",
                            src: result
                        }).appendTo(imagesStack);
                    });

                    $("<div>", {
                        class: "overlay"
                    }).appendTo(imagesStack);

                    $("<div>", {
                        class: "confirmation-box"
                    })
                        .append($("<button>", {
                            class: 'button decline',
                            text: 'Decline',
                            on: {
                                click: function() {
                                    $(".artwork-images-stack .artwork-image:last").remove();

                                    if ($(".artwork-images-stack .artwork-image").length === 0) {
                                        $('.confirmation-box').remove();
                                    }
                                }
                            }
                        }))
                        .append($("<button>", {
                            class: 'button accept',
                            text: 'Accept',
                            on: {
                                click: function() {
                                    $(".artwork-images-stack .artwork-image:not(:last)").remove();
                                    $('.confirmation-box').remove();

                                    $("<div>", {
                                        class: "confirmation-text",
                                        text: "Swap the first artwork or add a new one?"
                                    }).appendTo(imagesStack);

                                    $("<div>", {
                                        class: "confirmation-box"
                                    })
                                        .append($("<button>", {
                                            class: 'button swap',
                                            text: 'Swap',
                                            on: {
                                                click: function() {
                                                    $(".artwork-images-stack .artwork-image:last").attr("data-swap", "true");
                                                    $('.confirmation-text').remove();
                                                    $('.confirmation-box').remove();
                                                }
                                            }
                                        }))
                                        .append($("<button>", {
                                            class: 'button add',
                                            text: 'Add',
                                            on: {
                                                click: function() {
                                                    $(".artwork-images-stack .artwork-image:last").attr("data-swap", "false");
                                                    $('.confirmation-text').remove();
                                                    $('.confirmation-box').remove();
                                                }
                                            }
                                        }))
                                        .appendTo(imagesStack);
                                }
                            }
                        }))
                        .appendTo(imagesStack);
                }

                autolinkArtworkContainer.prepend(imagesStack);
            }
        });

        $("<div>", {
            class: "add-tags-title title",
            text: "Tag Songs"
        }).appendTo(leftColumn);

        $("<input>", {
            class: "add-tags rcorners ge-textarea",
            id: "ge-add-tags",
            type: "text",
            placeholder: "Tag",
            spellcheck: "false",
            "data-gramm": "false",
            on: {
                keydown: function(e) {
                    if (e.keyCode === 13) {
                        e.preventDefault();
                        return false;
                    }
                }
            }
        }).appendTo(leftColumn);

        $("<div>", {
            class: "add-credits-title title",
            text: "Credit Artists"
        }).appendTo(leftColumn);

        const addCreditsContainer = $("<div>", {
            class: "add-credits-inputs-container"
        }).appendTo(leftColumn);

        $("<div>", {
            class: "add-credits add rcorners ge-textarea",
            type: "text",
            text: "Add",
            spellcheck: "false",
            "data-gramm": "false",
            on: {
                click: () => {
                    addCreditsInputs(/*roleDefaultWhitelist, artistDefaultWhitelist*/);

                    const lastRoleInput = $(".add-credits-inputs-container .add-credits.role.tagify .tagify__input").last();
                    lastRoleInput.focus();
                }
            }
        }).appendTo(addCreditsContainer);

        addCreditsInputs(/*roleDefaultWhitelist, artistDefaultWhitelist*/);

        $("<div>", {
            class: "set-release-date-title title",
            text: "Set Release Date"
        }).appendTo(leftColumn);

        const dateInputContainer = $("<div>", {
            class: "date-input-container"
        }).appendTo(leftColumn);

        const datePickerInput = $("<input>", {
            type: "text",
            class: "set-release-date rcorners ge-textarea",
            placeholder: "Date",
            readonly: true
        }).appendTo(dateInputContainer);

        const datePicker = datepicker(datePickerInput[0], {
            customDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            customMonths: [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ],
            overlayButton: "Close",
            overlayPlaceholder: "Year",
            startDay: 0,
            onShow: () => {
                datePickerInput.addClass("calendar-open");
            },
            onHide: () => {
                datePickerInput.removeClass("calendar-open");
            },
            formatter: (input, date) => {
                input.value = date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric"
                }); // Set the input value to the selected date
            },
            maxDate: (() => {
                const currentDate = new Date();
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                return currentDate;
            })() // Set the maximum selectable date to the current date plus 2 years
        });

        const clearDateButton = $("<x>", {
            class: "tagify tagify__tag__removeBtn",
            title: "Clear"
        })
            .appendTo(dateInputContainer);

        clearDateButton.on("click", () => {
            datePicker.setDate(null); // Set the selected date to null
        });

        $("<div>", { // Overwrite checkbox
            class: "ge-overwrite-info-chkbox-container",
        })
            .append($("<input>", { type: "checkbox", id: "ge-overwrite-release-dates", name: "ge-overwrite-release-dates", class: "chkboxm" }))
            .append($("<label>", { for: "ge-overwrite-release-dates" })
                .append($("<span>", { class: "chkboxmspan" }))
                .append(" " + "Overwrite existing release dates")
            )
            .appendTo(leftColumn);

        $("<div>", {
            class: "add-media-title title",
            text: "Link Media"
        }).appendTo(leftColumn);

        const addMediaInput = $("<input>", {
            class: "add-media rcorners ge-textarea",
            id: "ge-add-media",
            type: "text",
            placeholder: "YouTube Playlist",
            spellcheck: "false",
            "data-gramm": "false"
        }).appendTo(leftColumn);

        $("<div>", {
            class: "ge-textarea add-media details"
        })
            .append($("<div>", {
                class: "add-media details image-container",
                text: ""
            })
                .append($("<img>", {
                    class: "add-media details image",
                    src: ""
                })))
            .append($("<div>", {
                class: "add-media details title",
                text: ""
            }))
            .append($("<div>", {
                class: "add-media details artist",
                text: ""
            }))
            .append($("<div>", {
                class: "add-media details length",
                text: ""
            }))
            .append($("<div>", {
                class: "add-media details videos-links",
                text: "",
                style: "display: none;"
            }))
            .appendTo(leftColumn);

        addMediaInput.on("input", async () => {
            const url = addMediaInput.val();
            if (url === "") {
                addMediaInput.removeClass("error");
                addMediaInput.attr("title", "");
                const addMediaTitle = $(".add-media.details.title");
                addMediaTitle.text("");
                addMediaTitle.attr("title", "");
                $(".add-media.details.image").attr("src", "");
                $(".add-media.details.artist").text("");
                $(".add-media.details.length").text("");
                $(".add-media.details.videos-links").text("");
                return;
            }

            const playlistVideos = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ "album_getPlaylistVideos": [url] }, (response) => {
                    resolve(response);
                });
            });

            if (typeof playlistVideos !== "string") {
                const numOfSongs = Array.from(
                    document.getElementsByClassName("chart_row-number_container-number chart_row-number_container-number--gray")
                ).length;

                addMediaInput.removeClass("error");
                addMediaInput.attr("title", "");
                $(".add-media.details.title").text(playlistVideos.playlistTitle);
                $(".add-media.details.title").attr("title", playlistVideos.playlistTitle);
                $(".add-media.details.image").attr("src", playlistVideos.playlistImage);
                $(".add-media.details.artist").text(playlistVideos.artistName);
                $(".add-media.details.length").text(playlistVideos.playlistLength);
                $(".add-media.details.videos-links").text(playlistVideos.videoLinks.join(" "));

                if (numOfSongs === playlistVideos.playlistLength) {
                    $(".add-media.details.length").css({ color: "#1cc674" });
                    $(".add-media.details.length").attr("title", "The number of songs in the playlist matches the number of songs in the chart");
                    addMediaInput.removeClass("error");

                } else {
                    $(".add-media.details.length").css({ color: "#fc5753" });
                    $(".add-media.details.length").attr("title", "The number of songs in the playlist does not match the number of songs in the chart");
                    addMediaInput.addClass("error");
                }
            } else {
                console.error(playlistVideos);
                addMediaInput.addClass("error");
                addMediaInput.attr("title", "Invalid YouTube Playlist URL");
                // clear the details
                $(".add-media.details.title").text("");
                $(".add-media.details.title").attr("title", "");
                $(".add-media.details.image").attr("src", "");
                $(".add-media.details.artist").text("");
                $(".add-media.details.length").text("");
                $(".add-media.details.videos-links").text("");
            }
        });

        $("<div>", { // Overwrite checkbox
            class: "ge-overwrite-info-chkbox-container",
        })
            .append($("<input>", { type: "checkbox", id: "ge-overwrite-yt-links", name: "ge-overwrite-yt-links", class: "chkboxm" }))
            .append($("<label>", { for: "ge-overwrite-yt-links" })
                .append($("<span>", { class: "chkboxmspan" }))
                .append(" " + "Overwrite existing YouTube links")
            )
            .appendTo(leftColumn);

        const saveButton = $("<input>")
            .addClass("ge-save-button rcorners")
            .attr({
                "value": "Save",
                "readonly": "readonly",
                "title": "Alt + S"
            })
            .on("mousedown", function(event) {
                event.preventDefault();
            })
            .on("click", function() {
                let error = false;
                const addCreditsInputs = $(".extension-box .add-credits-inputs-container .add-credits-inputs");
                if (addCreditsInputs.length) {
                    // for each row of credits, there's two inputs - ".add-credits.role" and ".add-credits.artist"
                    // if one of them has a tag child and the other doesn't, we'll make error animation
                    addCreditsInputs.each(function() {
                        const role = $(this).find("tags.add-credits.role");
                        const artist = $(this).find("tags.add-credits.artist");
                        if (role.find("tag").length && !artist.find("tag").length) {
                            artist.addClass("error-animation");
                            setTimeout(function() {
                                artist.removeClass("error-animation");
                            }, 200);
                            error = true;
                        }
                        if (artist.find("tag").length && !role.find("tag").length) {
                            role.addClass("error-animation");
                            setTimeout(function() {
                                role.removeClass("error-animation");
                            }, 200);
                            error = true;
                        }
                    });
                }
                if ($(".extension-box .error").length) {
                    // make a flashing animation on the error inputs
                    $(".extension-box .error").addClass("error-animation");
                    setTimeout(function() {
                        $(".extension-box .error").removeClass("error-animation");
                    }, 200);
                    error = true;
                }
                if (error) {
                    return;
                }
                chrome.runtime.sendMessage({ "album_saveEverything": [true] });
                $(".extension-box").eq(0).addClass("ge-zoom-out");
                $(".blured-background").eq(0).addClass("ge-fade-out");
                $("body").removeClass("disable-scrolling");
                setTimeout(() => {
                    $(".blured-background").eq(0).remove();
                }, 400);
            });

        popupBox.append(saveButton);

        userValidation();

        $(document).on("click", () => {
            if (!hashmap && !!$("#tagsList").length) {
                hashmap = Array.prototype.reduce.call($("#tagsList option"), (obj, option) => {
                    if (!obj[option.value.toLowerCase()]) {
                        obj[option.value.toLowerCase()] = option.value;
                    }
                    return obj;
                }, {});
            }
        });

        async function waitForTagsList() {
            const tagsList = $("datalist#tagsList");
            if (tagsList.children("option").length > 0) {
                $("input.add-tags.rcorners.ge-textarea").attr("placeholder", "Tag");
                $("input.add-tags.rcorners.ge-textarea").removeAttr("disabled");
                $("input.add-tags.rcorners.ge-textarea").css("cursor", "default");
                return;
            }
            const inputElem = $("input.add-tags.rcorners.ge-textarea");
            inputElem.attr("placeholder", "Loading.");
            inputElem.attr("disabled", true);
            inputElem.css("cursor", "not-allowed");
            await new Promise(resolve => setTimeout(resolve, 500));
            inputElem.attr("placeholder", "Loading..");
            await new Promise(resolve => setTimeout(resolve, 500));
            inputElem.attr("placeholder", "Loading...");
            await new Promise(resolve => setTimeout(resolve, 500));
            inputElem.attr("placeholder", "Loading.");
            await waitForTagsList();
        }

        await waitForTagsList();

        const tagify_tagsWhitelist = $("datalist#tagsList option").map(function(_, o) {
            let searchByStr;

            switch (o.innerText) {
                case "Hip-Hop":
                    searchByStr = "hip hop, genius hip hop, genius hip-hop, hip hop genius, hip-hop genius";
            }

            return {
                value: o.innerText,
                id: o.value,
                searchBy: searchByStr
            };
        }).get().filter((v, i, a) => a.findIndex(t => (t.value === v.value)) === i);

        const tagify_tags = new Tagify(document.getElementById("ge-add-tags"), {
            delimiters: ",",
            templates: {
                tag: function(tagData) {
                    try {
                        return `<tag title="${tagData.value}" tag-id="${tagData.id}" contenteditable="false" spellcheck="false" class="tagify__tag ${tagData.class ? tagData.class : ""}" ${this.getAttributes(tagData)}>
                                <x title="remove tag" class="tagify__tag__removeBtn"></x>
                                <div>
                                    <span class="tagify__tag-text">${tagData.value}</span>
                                </div>
                            </tag>`;
                    } catch (err) {
                        console.error(err);
                    }
                },

                dropdownItem: function(tagData) {
                    try {
                        return `<div ${this.getAttributes(tagData)} class="tagify__dropdown__item ${tagData.class ? tagData.class : ""}" >
                                    <span>${tagData.value}</span>
                                </div>`;
                    } catch (err) {
                        console.error(err);
                    }
                }
            },
            whitelist: tagify_tagsWhitelist,
            enforceWhitelist: true,
            autoComplete: {
                enabled: true
            },
            editTags: 1,
            transformTag: tags_transformTag,
            dropdown: {
                enabled: 0,
                classname: "tags-look",
                maxItems: 20,
                closeOnSelect: false,
                highlightFirst: true
            }
        });

        $("#tagify_tags").on("input", (e) => {
            $(".blured-background").append($(".tagify__dropdown").eq(0));
        });

        if ($("#tagsList").length) {
            hashmap = Array.prototype.reduce.call($("#tagsList option"), (obj, option) => {
                if (!obj[option.value.toLowerCase()]) {
                    obj[option.value.toLowerCase()] = option.value;
                }
                return obj;
            }, {});
        }

        $("input[type=\"tags\"]").on("click", () => {
            setTimeout(() => {
                $(".blured-background").append($(".tagify__dropdown:first"));
            }, 0.1);
        });

        const onDragEnd = () => {
            tagify_tags.updateValueByDOMTags();
            tagify_tags.DOM.scope.querySelectorAll("tag").forEach(tagElm => {
                tagElm.style.cssText = "--tag-bg:" + tagElm.__tagifyTagData.color;
            });
        };

        new DragSort(tagify_tags.DOM.scope, {
            selector: "." + tagify_tags.settings.classNames.tag,
            callbacks: {
                dragEnd: onDragEnd
            }
        });
    });

    // allow to open & close the popup with shortcuts
    $(window).on("keyup", handleKeyboardEvents);
}

/**
 * Searches for album artwork from iTunes API based on album and artist name obtained from the web page
 * The results are saved in the Chrome storage and also returned as a promise
 *
 * @returns {Promise<Array<String>>} A promise that resolves to an array of album artwork URLs
 */
export async function autolinkArtwork(query, type, minimize = false) {

    // Fix non-latin characters
    const modifiedQuery = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ "fixNonLatin": [query] }, (response) => {
            resolve(response.join(" "));
        });
    });

    console.info("Searching for artwork for " + modifiedQuery + "...");

    try {
        const data = await fetch("https://larsbutnotleast.xyz/genius/assets/js/itunes.php?query=" + encodeURIComponent(modifiedQuery) + "&entity=" + type).then((response) => response.json());

        if (!data.error && data.length) {
            const imageSize = minimize ? "/200x200.png" : "/1000x1000-999.png";

            console.info("Found " + data.length + " artwork(s) for " + modifiedQuery);

            return data.map((url) => url.url.replace("/600x600bb.jpg", imageSize));
        }

        console.info("No artwork found for " + modifiedQuery);

        return [""];
    } catch (error) {
        console.error(error);
    }
}

/**
 * Saves details about a set of songs, including YouTube links, tags, and credits, to the Genius API
 *
 * @returns {void}
 */
export async function saveEverything() {

    const parseCookies = () => {
        return Object.fromEntries(
            document.cookie.split("; ").map(cookie => {
                const [key, value] = cookie.split("=");
                return [key, decodeURIComponent(value)];
            })
        );
    };

    const getDetails = () => {
        const metaElem = document.documentElement.innerHTML.match(/<meta content="({[^"]+)/);
        const replaces = {
            "&#039;": `'`,
            "&amp;": "&",
            "&lt;": "<",
            "&gt;": ">",
            "&quot;": "\""
        };

        if (metaElem) {
            const meta = metaElem[1].replace(/&[\w\d#]{2,5};/g, match => replaces[match]);
            return JSON.parse(meta);
        }
    };

    const details = getDetails();
    const albumSongs = details.album_appearances;
    const youtubeLinks = $(".extension-box .add-media.details.videos-links").text().split(" ");
    const releaseDate = $(".extension-box .set-release-date").val().split("/");

    const overwriteReleaseDates = $(".extension-box .ge-overwrite-info-chkbox-container input#ge-overwrite-release-dates").is(":checked");
    const overwriteYoutubeVideos = $(".extension-box .ge-overwrite-info-chkbox-container input#ge-overwrite-yt-links").is(":checked");

    const tags = $(".extension-box .add-tags tag")
        ?.toArray()
        .map(tag => ({
            id: tag.getAttribute("tag-id"),
            name: tag.getAttribute("title")
        }));

    const credits = $(".extension-box .add-credits-inputs-container .add-credits-inputs")
        ?.toArray()
        .map(credit => ({
            role: $(credit).find(".role tag")[0]?.getAttribute("title"),
            artists: $(credit).find(".artist tag")
                ?.toArray()
                .map(artist => JSON.parse(artist?.getAttribute("full-response")))
        }))
        .filter(credit => credit.role && credit.artists.length);

    if (youtubeLinks.length) {
        albumSongs.forEach((song, index) => {
            song.youtube_url = youtubeLinks[index];
        });
    }

    const addArtwork = $(".extension-box .artwork-images-stack:has(>.artwork-image):not(:has(>.confirmation-box))").length;
    const addMetadata = JSON.stringify(youtubeLinks) !== JSON.stringify(['']) || JSON.stringify(releaseDate) !== JSON.stringify(['']) || tags?.length || credits?.length;

    // Create an instance of Axios with the Genius API's base URL and a CSRF token
    const gapi = axios.create({
        baseUrl: "https://genius.com/api",
        withCredentials: true,
        headers: {
            "X-CSRF-Token": parseCookies()["_csrf_token"]
        }
    });

    if (addArtwork) {
        // Retrieve the URL of the artwork from the page
        const artwork = $(".extension-box .artwork-images-stack img");
        let artworkUrl = artwork.attr("src").replace("/200x200.png", "/1000x1000-999.png");
        const swap = details.album.cover_arts.length && artwork.attr("data-swap") === "true";

        // If there's no cover art or if the user has chosen to swap the existing cover art, update the first cover art
        if (swap) {
            await gapi.put(`/api/cover_arts/${details.album.cover_arts[0].id}`, {
                cover_art: {
                    image_url: artworkUrl
                }
            });
        }
        // Otherwise, create a new cover art
        else {
            await gapi.post("/api/cover_arts", {
                cover_art: {
                    image_url: artworkUrl
                },
                album_id: details.album.id
            });
        }
    }

    if (addMetadata) {
        for (const song of albumSongs) {
            const { response: { song: songDetails } } = await fetch(`https://genius.com/api${song.song.api_path}`).then(res => res.json());

            const params = {
                tags: [
                    ...tags.map(tag => ({ id: +tag.id, name: tag.name })),
                    ...songDetails.tags.map(tag => ({ name: tag.name, id: +tag.id }))
                ],
                custom_performances: [
                    ...credits.map(credit => ({ label: credit.role, artists: credit.artists })),
                    ...songDetails.custom_performances.map(credit => ({ label: credit.label, artists: credit.artists }))
                ]
            };

            if ((!songDetails.release_date_components || overwriteReleaseDates) && releaseDate.length === 3) {
                params.release_date_components = {
                    day: releaseDate[0],
                    month: releaseDate[1],
                    year: releaseDate[2]
                };
            }

            if ((!songDetails.youtube_url || overwriteYoutubeVideos) && song.youtube_url) {
                params.youtube_url = song.youtube_url;
            }

            gapi.put(`https://genius.com/api${song.song.api_path}`, {
                text_format: "html,markdown",
                song: {
                    tags: params.tags,
                    youtube_url: params.youtube_url,
                    custom_performances: params.custom_performances,
                    release_date_components: params.release_date_components
                }
            });
        }
    }
}

/**
 * Adds a "Add as next" checkbox to the add to queue modal and, when checked,
 * adds the selected song as the next song to play in the queue
 *
 * @returns {void}
 */
export function addSongAsNext() {
    const addSongAsNext_ = () => {
        setTimeout(() => {
            const songNum = document.querySelector("div.text_label.text_label--gray:not([ng-repeat]):not([ng-if])").innerText.split(" ").pop();
            const buttons = document.querySelectorAll(".button--unstyled");
            const button = buttons[buttons.length - 1];
            button.click();
            const input = document.querySelector("input.square_input.editable_tracklist-row-number-input.u-x_small_right_margin.ng-pristine.ng-valid");

            setTimeout(() => {
                input.classList.remove("ng-empty");
                input.classList.add("ng-not-empty");
                input.value = songNum;
                const event = new Event("input", { bubbles: true });
                input.dispatchEvent(event);
            }, 5);

            setTimeout(() => {
                document.querySelectorAll(".button--unstyled")[buttons.length].click();
            }, 5);
        }, 5);
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (!mutation.addedNodes.length) {
                return;
            }

            const addedElem = mutation.addedNodes[0];
            if (!addedElem || !addedElem.children) return;
            const input = addedElem.querySelector("input.square_input.square_input--full_width.ac_input");
            if (input) {
                const container = $("<div>", {
                    class: "add-song-as-next-container"
                });

                const label = $("<label>", {
                    class: "add-song-as-next-label",
                    text: "Add as next",
                    for: "add-song-as-next-checkbox"
                });

                $("<span>", {
                    class: "add-song-as-next-span chkboxmspan"
                }).prependTo(label);

                const checkbox = $("<input>", {
                    class: "add-song-as-next-checkbox chkboxm",
                    type: "checkbox",
                    id: "add-song-as-next-checkbox"
                }).appendTo(container);

                label.appendTo(container);
                container.insertAfter(input.parentElement);

                chrome.storage.local.get("add_song_as_next", (result) => {
                    if (result.add_song_as_next) {
                        checkbox.prop("checked", true);
                    }
                });

                checkbox.on("change", (e) => {
                    chrome.storage.local.set({ add_song_as_next: e.target.checked });
                });

                $("input[on-select=\"$ctrl.add_song(data)\"]").on("keydown", (e) => {
                    if (e.keyCode === 13) {
                        chrome.storage.local.get("add_song_as_next", (result) => {
                            if (result.add_song_as_next) {
                                addSongAsNext_();
                            }
                        });
                    }
                });
            }
            if (addedElem.classList.contains("ac_even") || addedElem.classList.contains("ac_odd")) {
                const addToQueueButton = addedElem;
                chrome.storage.local.get("add_song_as_next", (result) => {
                    if (result.add_song_as_next) {
                        addToQueueButton.addEventListener("click", addSongAsNext_);
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
