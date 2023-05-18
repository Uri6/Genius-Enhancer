/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer-Beta/blob/main/LICENSE.md
 */

export async function missingInfo(bio, people, releaseDate) {
    const imgs = {
        bios: {
            exists: chrome.runtime.getURL("/src/images/bio/Exists/48x48.png"),
            missing: chrome.runtime.getURL("/src/images/bio/Missing/48x48.png")
        },
        people: {
            exists: chrome.runtime.getURL("/src/images/people/Exists/48x48.png"),
            missing: chrome.runtime.getURL("/src/images/people/Missing/48x48.png")
        },
        releaseDate: {
            exists: chrome.runtime.getURL("/src/images/releaseDate/Exists/48x48.png"),
            missing: chrome.runtime.getURL("/src/images/releaseDate/Missing/48x48.png")
        }
    }

    let albumObject = await new Promise((resolve) => {
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

        if (people) {
            let img_elem = document.createElement('img');
            const peopleAreMissing = song.writer_artists.length === 0 || song.producer_artists.length === 0;
            img_elem.classList.add("people-icon", "ge-fade-in");
            if (peopleAreMissing) {
                img_elem.src = imgs.people.missing;
                img_elem.setAttribute("alt", "missing people");
                img_elem.setAttribute("title", "There's missing information about the creators of this song");
            } else {
                img_elem.src = imgs.people.exists;
                img_elem.setAttribute("alt", "exists people");
            }
            elem.appendChild(img_elem);
        }

        if (bio) {
            const img_elem = document.createElement("img");
            img_elem.classList.add("bio-icon", "ge-fade-in");
            if (song.description_preview === '') {
                img_elem.src = imgs.bios.missing;
                img_elem.setAttribute("alt", "missing bio");
                img_elem.setAttribute("title", "No one wrote a bio for this song");
            } else {
                img_elem.src = imgs.bios.exists;
                img_elem.setAttribute("alt", "exists bio");
            }
            elem.appendChild(img_elem);
        }

        if (releaseDate) {
            const img_elem = document.createElement("img");
            img_elem.classList.add("release-date-icon", "ge-fade-in");
            if (!song.release_date_for_display) {
                img_elem.src = imgs.releaseDate.missing;
                img_elem.setAttribute("alt", "missing release date");
                img_elem.setAttribute("title", "No one wrote a release date for this song");
            }
            else {
                img_elem.src = imgs.releaseDate.exists;
                img_elem.setAttribute("alt", "exists release date");
            }
            elem.appendChild(img_elem);
        }

        song_index++;
    })

    if (bio || people || releaseDate) {
        chrome.runtime.sendMessage({ "album_missingInfo_restyle": true });
    }
}

export function removeMissingInfo(bio, people, releaseDate) {
    const peopleIcons = document.querySelectorAll(".people-icon");
    const bioIcons = document.querySelectorAll(".bio-icon");
    const releaseDateIcons = document.querySelectorAll(".release-date-icon");

    if (bio) {
        bioIcons.forEach((icon) => {
            icon.classList.remove("ge-fade-in");
            icon.classList.add("ge-fade-out");
            icon.remove()
        })
    }

    else if (people) {
        peopleIcons.forEach((icon) => {
            icon.classList.remove("ge-fade-in");
            icon.classList.add("ge-fade-out");
            icon.remove()
        })
    }

    else if (releaseDate) {
        releaseDateIcons.forEach((icon) => {
            icon.classList.remove("ge-fade-in");
            icon.classList.add("ge-fade-out");
            icon.remove()
        })
    }

    chrome.runtime.sendMessage({ "album_missingInfo_restyle": true });
}

export function restyleMissingInfo() {
    let peopleIcons = document.querySelectorAll(".people-icon");
    let bioIcons = document.querySelectorAll(".bio-icon");
    let releaseDateIcons = document.querySelectorAll(".release-date-icon");

    // Wait until at least one of the icons is loaded
    do {
        peopleIcons = document.querySelectorAll('.people-icon');
        bioIcons = document.querySelectorAll('.bio-icon');
        releaseDateIcons = document.querySelectorAll('.release-date-icon');
    } while (peopleIcons.length === 0 && bioIcons.length === 0 && releaseDateIcons.length === 0)

    const distances = ["-60px", "-105px", "-150px"];
    let bioLeftPosition, releaseDateLeftPosition;

    if (peopleIcons.length > 0) {
        bioLeftPosition = distances[1];
    }

    else {
        bioLeftPosition = distances[0];
    }

    if (peopleIcons.length > 0) {
        if (bioIcons.length > 0) {
            releaseDateLeftPosition = distances[2];
        }
        else {
            releaseDateLeftPosition = distances[1];
        }
    }
    else {
        if (bioIcons.length > 0) {
            releaseDateLeftPosition = distances[1];
        }
        else {
            releaseDateLeftPosition = distances[0];
        }
    }

    bioIcons.forEach((icon) => icon.style.left = bioLeftPosition);
    releaseDateIcons.forEach((icon) => icon.style.left = releaseDateLeftPosition);
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
        throw new Error("Invalid playlist link");
    }

    const playlistId = new URL(playlistLink).searchParams.get('list');
    const apiKey = "AIzaSyBgyAo8T6yTDCbLHauokuqHBkVHkjs6NjM";

    const metadataResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`);
    if (!metadataResponse.ok) {
        throw new Error("Failed to fetch playlist metadata");
    }

    const metadataData = (await metadataResponse.json()).items[0].snippet;
    const thumbnails = metadataData.thumbnails;
    const playlistImage = (thumbnails.maxres || thumbnails.high || thumbnails.medium || thumbnails.default).url;

    const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`);
    if (!videosResponse.ok) {
        throw new Error("Failed to fetch playlist videos");
    }

    const videosData = await videosResponse.json();
    const videoTitles = videosData.items.map(item => item.snippet.title);
    const videoLinks = videosData.items.map(item => `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`);

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
    const userValidation = () => {
        const disable_add_tag = (placeholderText) => {
            document.getElementById("ge-add-tags").placeholder = placeholderText;
        }

        const user_picture = document.getElementsByClassName("header-user_avatar clipped_background_image")[0];

        // check if the user is logged in
        if (user_picture) {
            // access user_picture's parent element
            const user_picture_parent = user_picture.parentElement;
            // make sure the user's iq is high enough to add a tag
            if (parseInt(user_picture_parent.children[1].innerHTML.replace(" IQ", "").replaceAll(",", "")) < 100) {
                disable_add_tag("You need at least 100 IQ to tag songs");
            }
        }

        else {
            disable_add_tag("You need to be logged in to tag songs");
        }
    }

    const getRandomColor = () => {
        const rand = (min, max) => {
            return min + Math.random() * (max - min);
        }

        const h = rand(1, 360) | 0,
            s = rand(40, 70) | 0,
            l = rand(65, 72) | 0;

        return 'hsl(' + h + ',' + s + '%,' + l + '%)';
    };

    const transformTag = (tagData) => {
        tagData.color = getRandomColor();
        tagData.style = "--tag-bg:" + tagData.color;
        tagData.value = tagData.value.trim().replace(/ +/g, ' ');
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
            class: "add-credits-inputs",
        }).insertBefore($(".add-credits.add"));

        const roleInput = $("<input>", {
            class: "add-credits role rcorners ge-textarea",
            type: "text",
            placeholder: "Role",
            spellcheck: "false",
            "data-gramm": "false",
        }).appendTo(inputs);

        const artistInput = $("<input>", {
            class: "add-credits artist rcorners ge-textarea",
            type: "text",
            placeholder: "Artist",
            spellcheck: "false",
            "data-gramm": "false",
        }).appendTo(inputs);

        $("<div>", {
            class: "delete-button-container",
            on: {
                click: function () {
                    inputs.remove();
                }
            }
        })
            .append($("<img>", {
                class: "delete-button",
                src: chrome.runtime.getURL("src/images/other/delete.svg"),
            }))
            .appendTo(inputs);

        const tagify_role = new Tagify(roleInput[0], {
            delimiters: null,
            mode: "select",
            templates: {
                tag: function (tagData) {
                    try {
                        return `<tag title='${tagData.value}' tag-id='${tagData.id}' contenteditable='false' spellcheck="false" class='tagify__tag ${tagData.class ? tagData.class : ""}' ${this.getAttributes(tagData)}>
                                        <div>
                                            <span class='tagify__tag-text'>${tagData.value}</span>
                                        </div>
                                    </tag>`;
                    } catch (err) {
                        console.error(err);
                    }
                },

                dropdownItem: function (tagData) {
                    try {
                        return `<div ${this.getAttributes(tagData)} class='tagify__dropdown__item ${tagData.class ? tagData.class : ""}' >
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
            enforceWhitelist: true,
            maxTags: 1,
            autoComplete: {
                enabled: true
            },
            editTags: 1
        });

        const tagify_artist = new Tagify(artistInput[0], {
            delimiters: ",",
            templates: {
                tag: function (tagData) {
                    try {
                        return `<tag
                                    title='${tagData.value}'
                                    tag-id='${tagData.id}'
                                    full-response='${JSON.stringify(tagData.full_response)}'
                                    contenteditable='false'
                                    spellcheck="false"
                                    class='tagify__tag ${tagData.class ? tagData.class : ""}'
                                    ${this.getAttributes(tagData)}>
                                    <x title='remove tag' class='tagify__tag__removeBtn'></x>
                                    <div>
                                        <div class='tagify__tag__avatar-wrap'>
                                            <img onerror="this.style.visibility='hidden'" src="${tagData.avatar}">
                                        </div>
                                        <span class='tagify__tag-text'>${tagData.value}</span>
                                    </div>
                                </tag>`;
                    } catch (err) {
                        console.error(err);
                    }
                },

                dropdownItem: function (tagData) {
                    try {
                        return `<div
                                ${this.getAttributes(tagData)}
                                class='tagify__dropdown__item ${tagData.class ? tagData.class : ""}' >
                                    ${tagData.avatar ? `
                                    <div class='tagify__dropdown__item__avatar-wrap'>
                                        <img onerror="this.style.visibility='hidden'" src="${tagData.avatar}">
                                    </div>` : ''
                            }
                                    <span>${tagData.value}</span>
                            </div>`;
                    } catch (err) {
                        console.error(err);
                    }
                }
            },
            whitelist: /*artistDefaultWhitelist*/[],
            enforceWhitelist: true,
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
            },
        });

        roleInput.addClass('has-tagify');
        artistInput.addClass('has-tagify');

        const searchRole = (e) => {
            const roleValue = e.detail.value;
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
        }

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
        }

        tagify_role.on('input', searchRole);
        tagify_artist.on('input', searchArtist);
    };

    const buttonBackground = $(".column_layout-column_span.column_layout-column_span--three_quarter.column_layout-column_span--force_padding").eq(0);
    const icon_elem = $("<img>", {
        class: "extension-icon",
        alt: "genius enhancer extension icon",
        title: "Alt + G",
        src: chrome.runtime.getURL("src/images/icons/3/128x128.png")
    });
    buttonBackground.append(icon_elem);

    $(".extension-icon").eq(0).on("click", async () => {

        window.scrollTo(0, 0);
        $('body').addClass('disable-scrolling');

        const popupDiv = $("<dialog>", {
            class: "blured-background ge-fade-in",
            open: true
        }).appendTo("body");

        const popupBox = $("<div>", {
            class: "extension-box ge-zoom-in"
        }).appendTo(popupDiv);

        // Create a container for the left column
        const leftColumn = $("<div>", {
            class: "left-column-container"
        }).appendTo(popupBox);

        $('<img>', {
            class: 'close-icon',
            src: chrome.runtime.getURL('/src/images/other/closeIcon.png'),
            on: {
                mouseover: function () {
                    this.src = chrome.runtime.getURL('/src/images/other/closeIconX.png');
                },
                mouseout: function () {
                    this.src = chrome.runtime.getURL('/src/images/other/closeIcon.png');
                },
                click: function () {
                    if (confirm('If you\'ve made changes, they won\'t save.\nAre you sure you want to close this window?')) {
                        $('.extension-box').addClass('ge-zoom-out');
                        $('.blured-background').addClass('ge-fade-out');
                        $('body').removeClass('disable-scrolling');
                        setTimeout(() => { $('.blured-background').remove(); }, 400);
                    }
                }
            },
            attr: {
                title: 'Esc'
            }
        }).appendTo(popupBox);

        const autolinkArtworkContainer = $('<div>', {
            class: 'autolink-artwork-icon-container rcorners'
        }).appendTo(popupBox);

        const autolinkArtwork = $('<img>', {
            class: 'autolink-artwork-icon',
            src: chrome.runtime.getURL('/src/images/artwork/512x512.png')
        }).appendTo(autolinkArtworkContainer);

        const autolinkArtworkTitle = $('<div>', {
            class: 'autolink-artwork-title',
            text: "Autolink\nArtwork"
        }).appendTo(autolinkArtworkContainer);

        autolinkArtworkContainer.on("click", async () => {
            if (!$('.artwork-images-stack').length) {

                const imagesStack = $('<div>', {
                    class: 'artwork-images-stack ge-animate-right'
                });

                $('<div>', {
                    class: 'error-container'
                })
                    .append($('<div>', {
                        class: 'error-text',
                        html: 'No artwork<br>found'
                    }))
                    .appendTo(imagesStack);

                // stringify the inner text of the element #albumArtworks
                const album_artwork_results = JSON.parse($('#albumArtworks').text());

                autolinkArtworkContainer.css('backgroundColor', '#333a3c');
                autolinkArtworkContainer.css('cursor', 'default');
                autolinkArtwork.css('transform', 'scale(1) rotate(0deg)');
                autolinkArtworkTitle.css('transform', 'scale(1)');

                if (!album_artwork_results.length) {
                    chrome.storage.local.set({ "album_artwork": { "type": "error", "output": "No artwork found" } });
                } else {
                    album_artwork_results.slice().reverse().forEach(result => {

                        const container = $('<div>', {
                            class: 'artwork-image-container'
                        });

                        $('<img>', {
                            class: 'artwork-image',
                            src: result
                        }).appendTo(container);

                        const overlay = $('<div>', {
                            class: 'overlay'
                        });

                        overlay.hover(function () {
                            overlay.css('backgroundColor', $(".v-button").length === $(".artwork-image").length ? "rgb(0, 0, 0, 0.2)" : "rgb(33, 236, 138, 0.4)");
                        });

                        overlay.mouseleave(function () {
                            overlay.css('backgroundColor', $(".v-button").length === $(".artwork-image").length ? "rgb(0, 0, 0, 0)" : "rgb(33, 236, 138, 0)");
                        });

                        const vButton = $('<img>', {
                            class: 'v-button',
                            src: chrome.runtime.getURL('/src/images/other/check.png')
                        });

                        vButton.hover(function () {
                            overlay.css('backgroundColor', "rgb(33, 236, 138, 0.1)");
                        });

                        vButton.mouseleave(function () {
                            overlay.css('backgroundColor', "rgb(0, 0, 0, 0.2)");
                        });

                        vButton.click(function () {
                            chrome.storage.local.set({ "album_artwork": { "type": "success", "output": result } });

                            $(".v-button, .x-button").css("opacity", "0");

                            setTimeout(() => {
                                $(".v-button, .x-button").remove();
                            }, 400);

                            overlay.css('backgroundColor', "rgb(33, 236, 138, 0.4)");
                            setTimeout(() => {
                                overlay.css('backgroundColor', "rgb(33, 236, 138, 0)");
                            }, 400);
                            setTimeout(() => {
                                overlay.css('backgroundColor', "rgb(33, 236, 138, 0.4)");
                            }, 400);
                            setTimeout(() => {
                                overlay.css('backgroundColor', "rgb(33, 236, 138, 0)");
                            }, 400);
                        });

                        overlay.prepend(vButton);

                        const xButton = $('<img>', {
                            class: 'x-button',
                            src: chrome.runtime.getURL('/src/images/other/cross.png')
                        });

                        xButton.hover(function () {
                            overlay.css('backgroundColor', "rgb(252, 88, 84, 0.1)");
                        });

                        xButton.mouseleave(function () {
                            overlay.css('backgroundColor', "rgb(0, 0, 0, 0.2)");
                        });

                        xButton.click(function () {
                            container.css({ 'opacity': '0', 'transform': 'translateY(25%)', 'backgroundColor': 'rgb(252, 88, 84, 0.3)' });
                            setTimeout(() => { container.remove(); }, 400);
                            if (imagesStack.children().length === 0) {
                                chrome.storage.local.set({ "album_artwork": { "type": "error", "output": "No artwork found" } });
                            }
                        });

                        overlay.prepend(xButton);
                        container.prepend(overlay);
                        imagesStack.append(container);
                    });
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
                keydown: function (e) {
                    if (e.keyCode === 13) {
                        e.preventDefault();
                        return false;
                    }
                }
            }
        }).appendTo(leftColumn);

        $("<div>", {
            class: "add-credits-title title",
            text: "Credit Artists",
        }).appendTo(leftColumn);

        const addCreditsContainer = $("<div>", {
            class: "add-credits-inputs-container",
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
            },
        }).appendTo(addCreditsContainer);

        addCreditsInputs(/*roleDefaultWhitelist, artistDefaultWhitelist*/);

        $("<div>", {
            class: "add-media-title title",
            text: "Link Media",
        }).appendTo(leftColumn);

        const addMediaInput = $("<input>", {
            class: "add-media rcorners ge-textarea",
            id: "ge-add-media",
            type: "text",
            placeholder: "Youtube Playlist",
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

            const getPlaylistVideos = async (playlistLink) => {
                const possibleLinks = ["https://www.youtube.com/playlist", "https://youtube.com/playlist", "https://music.youtube.com/playlist"];
                if (!possibleLinks.some((link) => playlistLink.startsWith(link))) {
                    throw new Error("Invalid playlist link");
                }
                const playlistId = playlistLink.split("list=")[1];
                const apiKey = "AIzaSyBgyAo8T6yTDCbLHauokuqHBkVHkjs6NjM";

                // Fetch the playlist metadata
                const metadataResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`);
                if (!metadataResponse.ok) {
                    throw new Error("Failed to fetch playlist metadata");
                }

                // Extract the metadata
                let metadataData = await metadataResponse.json();
                metadataData = metadataData.items[0].snippet;
                const playlistTitle = metadataData.title;
                const artistName = metadataData.channelTitle;
                const thumbnails = metadataData.thumbnails;
                let playlistImage = thumbnails.maxres || thumbnails.high || thumbnails.medium || thumbnails.default;
                playlistImage = playlistImage.url;

                // Fetch the playlist videos
                const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`);
                if (!videosResponse.ok) {
                    throw new Error("Failed to fetch playlist videos");
                }

                // Extract the videos data
                const videosData = await videosResponse.json();
                const videoTitles = videosData.items.map(item => item.snippet.title);
                const videoLinks = videosData.items.map(item => `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`);
                const playlistLength = videoLinks.length;

                // Return an object containing the metadata and the video links
                return {
                    artistName,
                    playlistTitle,
                    playlistImage,
                    playlistLength,
                    videoTitles,
                    videoLinks
                };
            }

            try {
                const response = await getPlaylistVideos(url);
                if (response === undefined) {
                    throw new Error("Invalid Youtube Playlist URL");
                }
                else {
                    const numOfSongs = Array.from(
                        document.getElementsByClassName("chart_row-number_container-number chart_row-number_container-number--gray")
                    ).length;

                    addMediaInput.removeClass("error");
                    addMediaInput.attr("title", "");
                    $(".add-media.details.title").text(response.playlistTitle);
                    $(".add-media.details.title").attr("title", response.playlistTitle);
                    $(".add-media.details.image").attr("src", response.playlistImage);
                    $(".add-media.details.artist").text(response.artistName);
                    $(".add-media.details.length").text(response.playlistLength);
                    $(".add-media.details.videos-links").text(response.videoLinks.join(" "));

                    if (numOfSongs === response.playlistLength) {
                        $(".add-media.details.length").css({ color: "#1cc674" });
                        $(".add-media.details.length").attr("title", "The number of songs in the playlist matches the number of songs in the chart");
                        addMediaInput.removeClass("error");

                    } else {
                        $(".add-media.details.length").css({ color: "#fc5753" });
                        $(".add-media.details.length").attr("title", "The number of songs in the playlist does not match the number of songs in the chart")
                        addMediaInput.addClass("error");
                    }
                }
            } catch (error) {
                console.error(error);
                // add the error class to the input
                addMediaInput.addClass("error");
                // add a tooltip to the input
                addMediaInput.attr("title", "Invalid Youtube Playlist URL");
                // clear the details
                $(".add-media.details.title").text("");
                $(".add-media.details.title").attr("title", "");
                $(".add-media.details.image").attr("src", "");
                $(".add-media.details.artist").text("");
                $(".add-media.details.length").text("");
                $(".add-media.details.videos-links").text("");
            }
        });

        const saveButton = $('<input>')
            .addClass('ge-save-button rcorners')
            .attr({
                'value': 'Save',
                'readonly': 'readonly',
                'title': 'Alt + S'
            })
            .on('mousedown', function (event) {
                event.preventDefault();
            })
            .on('click', function () {
                let error = false;
                const addCreditsInputs = $('.extension-box .add-credits-inputs-container .add-credits-inputs');
                if (addCreditsInputs.length) {
                    // for each row of credits, there's two inputs - ".add-credits.role" and ".add-credits.artist"
                    // if one of them has a tag child and the other doesn't, we'll make error animation
                    addCreditsInputs.each(function () {
                        const role = $(this).find('tags.add-credits.role');
                        const artist = $(this).find('tags.add-credits.artist');
                        if (role.find('tag').length && !artist.find('tag').length) {
                            artist.addClass('error-animation');
                            setTimeout(function () {
                                artist.removeClass('error-animation');
                            }, 200);
                            error = true;
                        }
                        if (artist.find('tag').length && !role.find('tag').length) {
                            role.addClass('error-animation');
                            setTimeout(function () {
                                role.removeClass('error-animation');
                            }, 200);
                            error = true;
                        }
                    });
                }
                if ($('.extension-box .error').length) {
                    // make a flashing animation on the error inputs
                    $('.extension-box .error').addClass('error-animation');
                    setTimeout(function () {
                        $('.extension-box .error').removeClass('error-animation');
                    }, 200);
                    error = true;
                }
                if (error) {
                    return;
                }
                chrome.runtime.sendMessage({ 'album_saveEverything': [true] });
                $('.extension-box').eq(0).addClass('ge-zoom-out');
                $('.blured-background').eq(0).addClass('ge-fade-out');
                $('body').removeClass('disable-scrolling');
                setTimeout(() => {
                    $('.blured-background').eq(0).remove();
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

        const tagify_tagsWhitelist = $("datalist#tagsList option").map(function (_, o) {
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
                tag: function (tagData) {
                    try {
                        return `<tag title='${tagData.value}' tag-id='${tagData.id}' contenteditable='false' spellcheck="false" class='tagify__tag ${tagData.class ? tagData.class : ""}' ${this.getAttributes(tagData)}>
                                <x title='remove tag' class='tagify__tag__removeBtn'></x>
                                <div>
                                    <span class='tagify__tag-text'>${tagData.value}</span>
                                </div>
                            </tag>`;
                    } catch (err) {
                        console.error(err);
                    }
                },

                dropdownItem: function (tagData) {
                    try {
                        return `<div ${this.getAttributes(tagData)} class='tagify__dropdown__item ${tagData.class ? tagData.class : ""}' >
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
            },
        });

        $('#tagify_tags').on('input', (e) => {
            $('.blured-background').append($('.tagify__dropdown').eq(0));
        });

        if ($('#tagsList').length) {
            hashmap = Array.prototype.reduce.call($('#tagsList option'), (obj, option) => {
                if (!obj[option.value.toLowerCase()]) {
                    obj[option.value.toLowerCase()] = option.value;
                }
                return obj;
            }, {});
        }

        $('input[type="tags"]').on('click', () => {
            setTimeout(() => {
                $('.blured-background').append($('.tagify__dropdown:first'));
            }, 0.1);
        });

        const onDragEnd = (elm) => {
            tagify_tags.updateValueByDOMTags()
            tagify_tags.DOM.scope.querySelectorAll('tag').forEach(tagElm => {
                tagElm.style.cssText = '--tag-bg:' + tagElm.__tagifyTagData.color
            })
        }

        new DragSort(tagify_tags.DOM.scope, {
            selector: '.' + tagify_tags.settings.classNames.tag,
            callbacks: {
                dragEnd: onDragEnd
            }
        });
    });


    // allow to open & close the popup with shortcuts
    $(window).on('keyup', (event) => {
        switch (event.keyCode || event.which) {
            case 27: // Escape key
                const closeIcon = $('.close-icon');
                if (!!closeIcon.length) {
                    closeIcon[0].click();
                }
                break;
            case 71: // 'G' or 'g' key
                if (event.altKey && !$('.blured-background').length) {
                    $('.extension-icon')[0].click();
                }
                break;
            case 83: // 'S' or 's' key
                const saveButton = $('.ge-save-button');
                if (event.altKey && !!saveButton.length) {
                    saveButton[0].click();
                }
                break;
            default:
                break;
        }
    });
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

    try {
        // Make a GET request to the iTunes Artwork API to get a URL for the album artwork
        const data = await fetch('https://itunesartwork.bendodson.com/api.php?' + new URLSearchParams({
            query: modifiedQuery,
            entity: type,
            country: 'us',
            type: 'request'
        })).then(response => response.json());

        // Make a GET request to the URL returned by the previous request to get more information about the album artwork
        const data2 = await fetch(data.url).then(response => response.json());

        // Make a POST request to the iTunes Artwork API with the data returned by the previous request to get the actual image URLs for the artwork
        const data3 = await fetch('https://itunesartwork.bendodson.com/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ json: JSON.stringify(data2), type: 'data', entity: 'album' })
        }).then(response => response.json());

        if (!data3.error && data3.length) {
            const imageSize = minimize ? "/115x115.jpg" : "/1000x1000-999.jpg";
            return data3.map((url) => url.url.replace("/600x600bb.jpg", imageSize));
        }

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
            document.cookie.split('; ').map(cookie => {
                const [key, value] = cookie.split('=');
                return [key, decodeURIComponent(value)];
            })
        );
    };

    const getDetails = () => {
        const metaElem = document.documentElement.innerHTML.match(/<meta content="({[^"]+)/);
        const replaces = {
            '&#039;': `'`,
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"'
        };

        if (metaElem) {
            const meta = metaElem[1].replace(/&[\w\d#]{2,5};/g, match => replaces[match]);
            return JSON.parse(meta);
        }
    };

    const details = getDetails();
    const albumSongs = details.album_appearances;
    const youtubeLinks = $('.add-media.details.videos-links').text().split(' ');

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

    const gapi = axios.create({
        baseUrl: "https://genius.com/api",
        withCredentials: true,
        headers: {
            "X-CSRF-Token": parseCookies()["_csrf_token"],
        },
    });

    for (const song of albumSongs) {
        const { response: { song: songDetails } } = await fetch(`https://genius.com/api${song.song.api_path}`).then(res => res.json());

        const params = {
            tags: [
                ...tags.map(tag => ({ id: +tag.id, name: tag.name })),
                ...songDetails.tags.map(tag => ({ name: tag.name, id: +tag.id })),
            ],
            youtube_url: song.youtube_url || songDetails.youtube_url,
            custom_performances: [
                ...credits.map(credit => ({ label: credit.role, artists: credit.artists })),
                ...songDetails.custom_performances.map(credit => ({ label: credit.label, artists: credit.artists })),
            ],
        };

        gapi.put(`https://genius.com/api${song.song.api_path}`, {
            text_format: "html,markdown",
            song: {
                tags: params.tags,
                youtube_url: params.youtube_url,
                custom_performances: params.custom_performances,
            },
        });
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
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
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

                    $('input[on-select="$ctrl.add_song(data)"]').on("keydown", (e) => {
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
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}