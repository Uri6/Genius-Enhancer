/*
 * This code is licensed under the terms of the "LICENSE.md" file
 * located in the root directory of this code package.
 */

import BioExists48 from "../images/bio/Exists/48x48.png";
import BioMissing48 from "../images/bio/Missing/48x48.png";
import PeopleExists48 from "../images/people/Exists/48x48.png";
import PeopleMissing48 from "../images/people/Missing/48x48.png";
import ReleaseDateExists48 from "../images/releaseDate/Exists/48x48.png";
import ReleaseDateMissing48 from "../images/releaseDate/Missing/48x48.png";
import ExtensionIcon128 from "../images/icons/2/128x128.png";
import CloseIcon from "../images/other/closeIcon.png";
import CloseIconX from "../images/other/closeIconX.png";
import Artwork512 from "../images/artwork/512x512.png";
import CheckIcon from "../images/other/check.png";
import CrossIcon from "../images/other/cross.png";

import { getDetails } from "./sideFunctions";

export function missingInfo(bio, people, releaseDate) {
    const imgs = {
        bios: {
            exists: chrome.runtime.getURL(BioExists48),
            missing: chrome.runtime.getURL(BioMissing48),
        },
        people: {
            exists: chrome.runtime.getURL(PeopleExists48),
            missing: chrome.runtime.getURL(PeopleMissing48),
        },
        releaseDate: {
            exists: chrome.runtime.getURL(ReleaseDateExists48),
            missing: chrome.runtime.getURL(ReleaseDateMissing48),
        },
    };

    let albumObject = getDetails();
    const tracklist = document.getElementsByClassName(
        "chart_row chart_row--light_border chart_row--full_bleed_left chart_row--align_baseline chart_row--no_hover"
    );
    let song_index = 0;

    albumObject.album_appearances.forEach(({ song }) => {
        let elem = tracklist[song_index];

        if (people) {
            let img_elem = document.createElement("img");
            const peopleAreMissing =
                song.writer_artists.length === 0 ||
                song.producer_artists.length === 0;
            img_elem.classList.add("people-icon", "gb-fade-in");
            if (peopleAreMissing) {
                img_elem.src = imgs.people.missing;
                img_elem.setAttribute("alt", "missing people");
                img_elem.setAttribute(
                    "title",
                    "There's missing information about the creators of this song"
                );
            } else {
                img_elem.src = imgs.people.exists;
                img_elem.setAttribute("alt", "exists people");
            }
            elem.appendChild(img_elem);
        }

        if (bio) {
            const img_elem = document.createElement("img");
            img_elem.classList.add("bio-icon", "gb-fade-in");
            if (song.description_preview === "") {
                img_elem.src = imgs.bios.missing;
                img_elem.setAttribute("alt", "missing bio");
                img_elem.setAttribute(
                    "title",
                    "No one wrote a bio for this song"
                );
            } else {
                img_elem.src = imgs.bios.exists;
                img_elem.setAttribute("alt", "exists bio");
            }
            elem.appendChild(img_elem);
        }

        if (releaseDate) {
            const img_elem = document.createElement("img");
            img_elem.classList.add("release-date-icon", "gb-fade-in");
            if (!song.release_date_for_display) {
                img_elem.src = imgs.releaseDate.missing;
                img_elem.setAttribute("alt", "missing release date");
                img_elem.setAttribute(
                    "title",
                    "No one wrote a release date for this song"
                );
            } else {
                img_elem.src = imgs.releaseDate.exists;
                img_elem.setAttribute("alt", "exists release date");
            }
            elem.appendChild(img_elem);
        }

        song_index++;
    });

    if (bio || people || releaseDate) {
        chrome.runtime.sendMessage({ album_missingInfo_restyle: true });
    }
}

export function removeMissingInfo(bio, people, releaseDate) {
    const peopleIcons = document.querySelectorAll(".people-icon");
    const bioIcons = document.querySelectorAll(".bio-icon");
    const releaseDateIcons = document.querySelectorAll(".release-date-icon");

    if (bio) {
        bioIcons.forEach((icon) => {
            icon.classList.remove("gb-fade-in");
            icon.classList.add("gb-fade-out");
            icon.remove();
        });
    } else if (people) {
        peopleIcons.forEach((icon) => {
            icon.classList.remove("gb-fade-in");
            icon.classList.add("gb-fade-out");
            icon.remove();
        });
    } else if (releaseDate) {
        releaseDateIcons.forEach((icon) => {
            icon.classList.remove("gb-fade-in");
            icon.classList.add("gb-fade-out");
            icon.remove();
        });
    }

    chrome.runtime.sendMessage({ album_missingInfo_restyle: true });
}

export function restyleMissingInfo() {
    let peopleIcons = document.querySelectorAll(".people-icon");
    let bioIcons = document.querySelectorAll(".bio-icon");
    let releaseDateIcons = document.querySelectorAll(".release-date-icon");

    // make sure at least one of the icons is present
    // if not, wait until they are
    do {
        peopleIcons = document.querySelectorAll(".people-icon");
        bioIcons = document.querySelectorAll(".bio-icon");
        releaseDateIcons = document.querySelectorAll(".release-date-icon");
    } while (
        peopleIcons.length === 0 &&
        bioIcons.length === 0 &&
        releaseDateIcons.length === 0
    );

    const distances = ["-60px", "-105px", "-150px"];
    let bioLeftPosition, releaseDateLeftPosition;

    if (peopleIcons.length > 0) {
        bioLeftPosition = distances[1];
    } else {
        bioLeftPosition = distances[0];
    }

    if (peopleIcons.length > 0) {
        if (bioIcons.length > 0) {
            releaseDateLeftPosition = distances[2];
        } else {
            releaseDateLeftPosition = distances[1];
        }
    } else {
        if (bioIcons.length > 0) {
            releaseDateLeftPosition = distances[1];
        } else {
            releaseDateLeftPosition = distances[0];
        }
    }

    bioIcons.forEach((icon) => (icon.style.left = bioLeftPosition));
    releaseDateIcons.forEach(
        (icon) => (icon.style.left = releaseDateLeftPosition)
    );
}

export async function getPlaylistVideos(playlistLink) {
    const possibleLinks = [
        "https://www.youtube.com/playlist",
        "https://youtube.com/playlist",
        "https://music.youtube.com/playlist",
    ];
    if (!possibleLinks.some((link) => playlistLink.startsWith(link))) {
        throw new Error("Invalid playlist link");
    }
    const playlistId = playlistLink.split("list=")[1];
    const apiKey = "AIzaSyBgyAo8T6yTDCbLHauokuqHBkVHkjs6NjM";

    // Fetch the playlist metadata
    const metadataResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
    );
    if (!metadataResponse.ok) {
        throw new Error("Failed to fetch playlist metadata");
    }

    // Extract the playlist metadata
    let metadataData = await metadataResponse.json();
    metadataData = metadataData.items[0].snippet;
    const playlistTitle = metadataData.title;
    const artistName = metadataData.channelTitle;
    const thumbnails = metadataData.thumbnails;
    let playlistImage =
        thumbnails.maxres ||
        thumbnails.high ||
        thumbnails.medium ||
        thumbnails.default;
    playlistImage = playlistImage.url;

    // Fetch the playlist videos
    const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`
    );
    if (!videosResponse.ok) {
        throw new Error("Failed to fetch playlist videos");
    }

    // Extract the videos data
    const videosData = await videosResponse.json();
    const videoTitles = videosData.items.map((item) => item.snippet.title);
    const videoLinks = videosData.items.map(
        (item) =>
            `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
    );
    const playlistLength = videoLinks.length;

    // Return an object containing the metadata and the video links
    return {
        artistName,
        playlistTitle,
        playlistImage,
        playlistLength,
        videoTitles,
        videoLinks,
    };
}

export async function appendIcon() {
    let hashmap;

    const userValidation = () => {
        const disable_add_tag = (placeholderText) => {
            document.getElementById("gb-add-tags").placeholder =
                placeholderText;
        };

        const user_picture = document.getElementsByClassName(
            "header-user_avatar clipped_background_image"
        )[0];

        // check if user is logged in
        if (user_picture) {
            // access user_picture's parent element
            const user_picture_parent = user_picture.parentElement;
            // make sure the user's iq is high enough to add a tag
            if (
                parseInt(
                    user_picture_parent.children[1].innerHTML
                        .replace(" IQ", "")
                        .replaceAll(",", "")
                ) < 100
            ) {
                disable_add_tag("You need at least 100 IQ to tag songs");
            }
        } else {
            disable_add_tag("You need to be logged in to tag songs");
        }
    };

    const buttonBackground = $(
        ".column_layout-column_span.column_layout-column_span--three_quarter.column_layout-column_span--force_padding"
    ).eq(0);
    const icon_elem = $("<img>")
        .addClass("extension-icon")
        .attr({
            alt: "genius enhancer extension icon",
            title: "Alt + G",
            src: chrome.runtime.getURL(ExtensionIcon128),
        });
    buttonBackground.append(icon_elem);

    $(".extension-icon")
        .eq(0)
        .on("click", async () => {
            window.scrollTo(0, 0);
            $("body").addClass("disable-scrolling");

            const popupDiv = $("<dialog>", {
                class: "blured-background gb-fade-in",
                open: true,
            }).appendTo("body");

            const popupBox = $("<div>", {
                class: "extension-box gb-zoom-in",
            }).appendTo(popupDiv);

            $("<img>", {
                class: "close-icon",
                src: chrome.runtime.getURL(CloseIcon),
                on: {
                    mouseover: function () {
                        this.src = chrome.runtime.getURL(CloseIconX);
                    },
                    mouseout: function () {
                        this.src = chrome.runtime.getURL(CloseIcon);
                    },
                    click: function () {
                        if (
                            confirm(
                                "If you've made changes, they won't save.\nAre you sure you want to close this window?"
                            )
                        ) {
                            $(".extension-box").addClass("gb-zoom-out");
                            $(".blured-background").addClass("gb-fade-out");
                            $("body").removeClass("disable-scrolling");
                            setTimeout(() => {
                                $(".blured-background").remove();
                            }, 400);
                        }
                    },
                },
                attr: {
                    title: "Esc",
                },
            }).appendTo(popupBox);

            $("<div>", {
                class: "add-tags-title title",
                text: "Tag songs",
            }).appendTo(popupBox);

            $("<input>", {
                class: "add-tags rcorners gb-textarea",
                id: "gb-add-tags",
                type: "text",
                placeholder: "Tags",
                spellcheck: "false",
                "data-gramm": "false",
                on: {
                    keydown: function (e) {
                        if (e.keyCode === 13) {
                            e.preventDefault();
                            return false;
                        }
                    },
                },
            }).appendTo(popupBox);

            $("<div>", {
                class: "add-credits-title title",
                text: "Credit Artists",
            }).appendTo(popupBox);

            $("<input>", {
                class: "add-credits role rcorners gb-textarea",
                type: "text",
                placeholder: "Role",
                spellcheck: "false",
                "data-gramm": "false",
                disabled: "",
            }).appendTo(popupBox);

            $("<input>", {
                class: "add-credits artist rcorners gb-textarea",
                type: "text",
                placeholder: "Artist",
                spellcheck: "false",
                "data-gramm": "false",
                disabled: "",
            }).appendTo(popupBox);

            // $("<input>", {
            //     class: "add-credits add rcorners gb-textarea",
            //     type: "text",
            //     placeholder: "Add",
            //     spellcheck: "false",
            //     "data-gramm": "false",
            //     disabled: ""
            // }).appendTo(popupBox);

            $("<div>", {
                class: "add-media-title title",
                text: "Link Media",
            }).appendTo(popupBox);

            const addMediaInput = $("<input>", {
                class: "add-media rcorners gb-textarea",
                id: "gb-add-media",
                type: "text",
                placeholder: "Youtube Playlist",
                spellcheck: "false",
                "data-gramm": "false",
            }).appendTo(popupBox);

            $("<div>", {
                class: "gb-textarea add-media details",
            })
                .append(
                    $("<div>", {
                        class: "add-media details image-container",
                        text: "",
                    }).append(
                        $("<img>", {
                            class: "add-media details image",
                            src: "",
                        })
                    )
                )
                .append(
                    $("<div>", {
                        class: "add-media details title",
                        text: "",
                    })
                )
                .append(
                    $("<div>", {
                        class: "add-media details artist",
                        text: "",
                    })
                )
                .append(
                    $("<div>", {
                        class: "add-media details length",
                        text: "",
                    })
                )
                .append(
                    $("<div>", {
                        class: "add-media details videos-links",
                        text: "",
                        style: "display: none;",
                    })
                )
                .appendTo(popupBox);

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
                    const possibleLinks = [
                        "https://www.youtube.com/playlist",
                        "https://youtube.com/playlist",
                        "https://music.youtube.com/playlist",
                    ];
                    if (
                        !possibleLinks.some((link) =>
                            playlistLink.startsWith(link)
                        )
                    ) {
                        throw new Error("Invalid playlist link");
                    }
                    const playlistId = playlistLink.split("list=")[1];
                    const apiKey = "AIzaSyBgyAo8T6yTDCbLHauokuqHBkVHkjs6NjM";

                    // Fetch the playlist metadata
                    const metadataResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
                    );
                    if (!metadataResponse.ok) {
                        throw new Error("Failed to fetch playlist metadata");
                    }

                    // Extract the metadata
                    let metadataData = await metadataResponse.json();
                    metadataData = metadataData.items[0].snippet;
                    const playlistTitle = metadataData.title;
                    const artistName = metadataData.channelTitle;
                    const thumbnails = metadataData.thumbnails;
                    let playlistImage =
                        thumbnails.maxres ||
                        thumbnails.high ||
                        thumbnails.medium ||
                        thumbnails.default;
                    playlistImage = playlistImage.url;

                    // Fetch the playlist videos
                    const videosResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`
                    );
                    if (!videosResponse.ok) {
                        throw new Error("Failed to fetch playlist videos");
                    }

                    // Extract the videos data
                    const videosData = await videosResponse.json();
                    const videoTitles = videosData.items.map(
                        (item) => item.snippet.title
                    );
                    const videoLinks = videosData.items.map(
                        (item) =>
                            `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
                    );
                    const playlistLength = videoLinks.length;

                    // Return an object containing the metadata and the video links
                    return {
                        artistName,
                        playlistTitle,
                        playlistImage,
                        playlistLength,
                        videoTitles,
                        videoLinks,
                    };
                };

                try {
                    const response = await getPlaylistVideos(url);
                    console.log(response);
                    if (response === undefined) {
                        throw new Error("Invalid Youtube Playlist URL");
                    }

                    const numOfSongs = Array.from(
                        document.getElementsByClassName(
                            "chart_row-number_container-number chart_row-number_container-number--gray"
                        )
                    ).length;

                    addMediaInput.removeClass("error");
                    addMediaInput.attr("title", "");
                    $(".add-media.details.title").text(
                        response.playlistTitle
                    );
                    $(".add-media.details.title").attr(
                        "title",
                        response.playlistTitle
                    );
                    $(".add-media.details.image").attr(
                        "src",
                        response.playlistImage
                    );
                    $(".add-media.details.artist").text(
                        response.artistName
                    );
                    $(".add-media.details.length").text(
                        response.playlistLength
                    );
                    $(".add-media.details.videos-links").text(
                        response.videoLinks.join(" ")
                    );

                    if (numOfSongs === response.playlistLength) {
                        $(".add-media.details.length").css({
                            color: "#1cc674"
                        });
                        $(".add-media.details.length").attr(
                            "title",
                            "The number of songs in the playlist matches the number of songs in the chart"
                        );
                        addMediaInput.removeClass("error");
                    } else {
                        $(".add-media.details.length").css({
                            color: "#fc5753"
                        });
                        $(".add-media.details.length").attr(
                            "title",
                            "The number of songs in the playlist does not match the number of songs in the chart"
                        );
                        addMediaInput.addClass("error");
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

            const autolinkArtworkContainer = $("<div>", {
                class: "autolink-artwork-icon-container rcorners",
            });

            const autolinkArtwork = $("<img>", {
                class: "autolink-artwork-icon",
                src: chrome.runtime.getURL(Artwork512),
            }).appendTo(autolinkArtworkContainer);

            const autolinkArtworkTitle = $("<div>", {
                class: "autolink-artwork-title",
                text: "Autolink\nartwork",
            }).appendTo(autolinkArtworkContainer);

            autolinkArtworkContainer.on("click", async () => {
                if (!$(".artwork-images-stack").length) {
                    const imagesStack = $("<div>", {
                        class: "artwork-images-stack gb-animate-right",
                    });

                    $("<div>", {
                        class: "error-container",
                    })
                        .append(
                            $("<div>", {
                                class: "error-text",
                                html: "No artwork<br>found",
                            })
                        )
                        .appendTo(imagesStack);

                    const album_artwork_results = await new Promise(
                        (resolve, reject) => {
                            chrome.storage.local.get(
                                "album_artwork_results",
                                (result) => {
                                    resolve(result.album_artwork_results);
                                }
                            );
                        }
                    );

                    console.log(
                        "album_artwork_results: ",
                        album_artwork_results
                    );

                    autolinkArtworkContainer.css("backgroundColor", "#333a3c");
                    autolinkArtworkContainer.css("cursor", "default");
                    autolinkArtwork.css("transform", "scale(1) rotate(0deg)");
                    autolinkArtworkTitle.css("transform", "scale(1)");

                    if (!album_artwork_results.length) {
                        chrome.storage.local.set({
                            album_artwork: {
                                type: "error",
                                output: "No artwork found",
                            },
                        });
                    } else {
                        album_artwork_results
                            .slice()
                            .reverse()
                            .forEach((result) => {
                                const container = $("<div>", {
                                    class: "artwork-image-container",
                                });

                                $("<img>", {
                                    class: "artwork-image",
                                    src: result,
                                }).appendTo(container);

                                const overlay = $("<div>", {
                                    class: "overlay",
                                });

                                overlay.hover(function () {
                                    overlay.css(
                                        "backgroundColor",
                                        $(".v-button").length ===
                                            $(".artwork-image").length
                                            ? "rgb(0, 0, 0, 0.2)"
                                            : "rgb(33, 236, 138, 0.4)"
                                    );
                                });

                                overlay.mouseleave(function () {
                                    overlay.css(
                                        "backgroundColor",
                                        $(".v-button").length ===
                                            $(".artwork-image").length
                                            ? "rgb(0, 0, 0, 0)"
                                            : "rgb(33, 236, 138, 0)"
                                    );
                                });

                                const vButton = $("<img>", {
                                    class: "v-button",
                                    src: chrome.runtime.getURL(CheckIcon),
                                });

                                vButton.hover(function () {
                                    overlay.css(
                                        "backgroundColor",
                                        "rgb(33, 236, 138, 0.1)"
                                    );
                                });

                                vButton.mouseleave(function () {
                                    overlay.css(
                                        "backgroundColor",
                                        "rgb(0, 0, 0, 0.2)"
                                    );
                                });

                                vButton.click(function () {
                                    chrome.storage.local.set({
                                        album_artwork: {
                                            type: "success",
                                            output: result,
                                        },
                                    });

                                    $(".v-button, .x-button").css(
                                        "opacity",
                                        "0"
                                    );

                                    setTimeout(() => {
                                        $(".v-button, .x-button").remove();
                                    }, 400);

                                    overlay.css(
                                        "backgroundColor",
                                        "rgb(33, 236, 138, 0.4)"
                                    );
                                    setTimeout(() => {
                                        overlay.css(
                                            "backgroundColor",
                                            "rgb(33, 236, 138, 0)"
                                        );
                                    }, 400);
                                    setTimeout(() => {
                                        overlay.css(
                                            "backgroundColor",
                                            "rgb(33, 236, 138, 0.4)"
                                        );
                                    }, 400);
                                    setTimeout(() => {
                                        overlay.css(
                                            "backgroundColor",
                                            "rgb(33, 236, 138, 0)"
                                        );
                                    }, 400);
                                });

                                overlay.prepend(vButton);

                                const xButton = $("<img>", {
                                    class: "x-button",
                                    src: chrome.runtime.getURL(CrossIcon),
                                });

                                xButton.hover(function () {
                                    overlay.css(
                                        "backgroundColor",
                                        "rgb(252, 88, 84, 0.1)"
                                    );
                                });

                                xButton.mouseleave(function () {
                                    overlay.css(
                                        "backgroundColor",
                                        "rgb(0, 0, 0, 0.2)"
                                    );
                                });

                                xButton.click(function () {
                                    container.css({
                                        opacity: "0",
                                        transform: "translateY(25%)",
                                        backgroundColor:
                                            "rgb(252, 88, 84, 0.3)",
                                    });
                                    setTimeout(() => {
                                        container.remove();
                                    }, 400);
                                    if (imagesStack.children().length === 0) {
                                        chrome.storage.local.set({
                                            album_artwork: {
                                                type: "error",
                                                output: "No artwork found",
                                            },
                                        });
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

            popupBox.append(autolinkArtworkContainer);

            const saveButton = $("<input>")
                .addClass("gb-save-button rcorners")
                .attr({
                    value: "Save",
                    readonly: "readonly",
                    title: "Alt + S",
                })
                .on("mousedown", function (event) {
                    event.preventDefault();
                })
                .on("click", function () {
                    if ($(".extension-box .error").length) {
                        // make a flashing animation on the error inputs
                        $(".extension-box .error").addClass("error-animation");
                        setTimeout(function () {
                            $(".extension-box .error").removeClass(
                                "error-animation"
                            );
                        }, 200);
                        return;
                    }
                    chrome.runtime.sendMessage({
                        album_saveEverything: [true],
                    });
                    $(".extension-box").eq(0).addClass("gb-zoom-out");
                    $(".blured-background").eq(0).addClass("gb-fade-out");
                    $("body").removeClass("disable-scrolling");
                    setTimeout(() => {
                        $(".blured-background").eq(0).remove();
                    }, 400);
                });

            popupBox.append(saveButton);

            userValidation();

            $(document).on("click", () => {
                if (!hashmap && !!$("#tagsList").length) {
                    hashmap = Array.prototype.reduce.call(
                        $("#tagsList option"),
                        (obj, option) => {
                            if (!obj[option.value.toLowerCase()]) {
                                obj[option.value.toLowerCase()] = option.value;
                            }
                            return obj;
                        },
                        {}
                    );
                }
            });

            const tagify_tagsWhitelist = $("datalist#tagsList option")
                .map(function (_, o) {
                    let searchByStr;

                    switch (o.innerText) {
                        case "Hip-Hop":
                            searchByStr =
                                "hip hop, genius hip hop, genius hip-hop, hip hop genius, hip-hop genius";
                    }

                    return {
                        value: o.innerText,
                        id: o.value,
                        searchBy: searchByStr,
                    };
                })
                .get();

            const tagify_tags = new Tagify(
                document.getElementById("gb-add-tags"),
                {
                    delimiters: null,
                    templates: {
                        tag: function (tagData) {
                            console.log(tagData);
                            try {
                                return `<tag title='${tagData.value}' tag-id='${
                                    tagData.id
                                }' contenteditable='false' spellcheck="false" class='tagify__tag ${
                                    tagData.class ? tagData.class : ""
                                }' ${this.getAttributes(tagData)}>
                                <x title='remove tag' class='tagify__tag__removeBtn'></x>
                                <div>
                                    <span class='tagify__tag-text'>${
                                        tagData.value
                                    }</span>
                                </div>
                            </tag>`;
                            } catch (err) {
                                console.error(err);
                            }
                        },

                        dropdownItem: function (tagData) {
                            try {
                                return `<div ${this.getAttributes(
                                    tagData
                                )} class='tagify__dropdown__item ${
                                    tagData.class ? tagData.class : ""
                                }' >
                                    <span>${tagData.value}</span>
                                </div>`;
                            } catch (err) {
                                console.error(err);
                            }
                        },
                    },
                    enforceWhitelist: true,
                    whitelist: tagify_tagsWhitelist,
                    transformTag: transformTag,
                    dropdown: {
                        enabled: 0,
                        classname: "tags-look",
                        maxItems: 20,
                    },
                }
            );

            function getRandomColor() {
                function rand(min, max) {
                    return min + Math.random() * (max - min);
                }

                const h = rand(1, 360) | 0,
                    s = rand(40, 70) | 0,
                    l = rand(65, 72) | 0;

                return "hsl(" + h + "," + s + "%," + l + "%)";
            }

            function transformTag(tagData) {
                tagData.color = getRandomColor();
                tagData.style = "--tag-bg:" + tagData.color;
                tagData.value = tagData.value.trim().replace(/ +/g, " ");

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
            }

            $("#tagify_tags").on("input", function (e) {
                $(".blured-background").append($(".tagify__dropdown").eq(0));
            });

            if ($("#tagsList").length) {
                hashmap = Array.prototype.reduce.call(
                    $("#tagsList option"),
                    function (obj, option) {
                        if (!obj[option.value.toLowerCase()]) {
                            obj[option.value.toLowerCase()] = option.value;
                        }
                        return obj;
                    },
                    {}
                );
            }

            $('input[type="tags"]').on("click", function () {
                setTimeout(function () {
                    $(".blured-background").append(
                        $(".tagify__dropdown:first")
                    );
                }, 0.1);
            });
        });

    // allow to open & close the popup with shortcuts
    $(window).on("keyup", function (event) {
        switch (event.key) {
            case "Escape":
                const closeIcon = $(".close-icon");
                if (!!closeIcon.length) {
                    closeIcon[0].click();
                }
                break;
            case "g":
                if (event.altKey && !$(".blured-background").length) {
                    $(".extension-icon")[0].click();
                }
                break;
            case "s":
                const saveButton = $(".gb-save-button");
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
 * @returns {Promise<Array<String>>} A promise that resolves to an array of album artwork URLs
 */
export async function autolinkArtwork() {
    // A helper function that checks if a given text string contains Hebrew characters
    const containsHebrew = (text) => {
        return /[א-ת]/.test(text);
    };

    // Get the album title and artist name from the page DOM
    let albumTitle = document.getElementsByClassName(
        "header_with_cover_art-primary_info-title header_with_cover_art-primary_info-title--white"
    )[0].innerText;
    let artistName = document.getElementsByClassName(
        "header_with_cover_art-primary_info-primary_artist"
    )[0].innerHTML;
    let nameToSearch = [albumTitle, artistName];

    // If the album or artist name contains Hebrew characters, split it and use the non-Hebrew part for the search query
    for (let i = 0; i < nameToSearch.length; i++) {
        if (containsHebrew(nameToSearch[i])) {
            const langsParts = nameToSearch[i].split(" - ");
            nameToSearch[i] = langsParts[i === 0 ? 1 : 0];
        }
    }

    nameToSearch = nameToSearch[0];

    try {
        // Make a GET request to the iTunes Artwork API to get a URL for the album artwork
        const data = await $.ajax({
            type: "GET",
            crossDomain: true,
            url: "https://itunesartwork.bendodson.com/api.php",
            data: {
                query: nameToSearch,
                entity: "album",
                country: "us",
                type: "request",
            },
            dataType: "json",
        });

        // Make a GET request to the URL returned by the previous request to get more information about the album artwork
        const data2 = await $.ajax({
            type: "GET",
            crossDomain: true,
            url: data.url,
            data: {},
            dataType: "json",
        });

        // Make a POST request to the iTunes Artwork API with the data returned by the previous request to get the actual image URLs for the artwork
        const data3 = await $.ajax({
            type: "POST",
            crossDomain: true,
            url: "https://itunesartwork.bendodson.com/api.php",
            data: {
                json: JSON.stringify(data2),
                type: "data",
                entity: "album",
            },
            dataType: "json",
        });

        let itunesResult = "";
        if (!data3.error && data3.length) {
            // Replace the large image URLs with smaller ones to save bandwidth and performance
            for (let i = 0; i < data3.length; i++) {
                data3[i] = data3[i].url.replace(
                    "/600x600bb.jpg",
                    "/115x115.jpg"
                );
            }
            itunesResult = data3;
        }

        console.log("result: ", itunesResult);

        // Store the result in Chrome storage
        chrome.storage.local.set({ album_artwork_results: itunesResult });
        return itunesResult;
    } catch (error) {
        console.log(error);
    }
}

export async function saveEverything() {
    // TODO: refactor this into an API call

    axios.defaults.withCredentials = true;

    //const details = getDetails();
    //const albumSongs = details.album_appearances;

    const youtubeLinks = $(".add-media.details.videos-links").text().split(" ");

    const tags = $(".extension-box tag")
        .toArray()
        .map((tag) => {
            return {
                id: tag.getAttribute("tag-id"),
                name: tag.getAttribute("title"),
            };
        });

    const tagsNames = tags.map((tag) => {
        return tag.name;
    });

    const numOfSongs = Array.from(
        document.getElementsByClassName(
            "chart_row-number_container-number chart_row-number_container-number--gray"
        )
    ).length;

    const albumSongs = Array.from(
        document.getElementsByClassName("u-display_block")
    ).slice(0, numOfSongs);

    // unit the album songs with the youtube links
    if (youtubeLinks.length) {
        albumSongs.forEach((song) => {
            song.youtubeLink = youtubeLinks[albumSongs.indexOf(song)];
        });
    }

    console.log("albumSongs: ", albumSongs);

    let everythingIsSaved = false;

    const progressBar = document.createElement("div");
    progressBar.id = "progressBar";
    progressBar.style.left = "0";
    progressBar.style.width = "0%";
    progressBar.style.height = "3px";
    progressBar.style.backgroundColor = "#4CAF50";
    progressBar.style.zIndex = "10000";
    progressBar.style.height = "10px";

    $("header-with-cover-art").after(progressBar);

    await Promise.all(albumSongs.map(async (song) => {
        //axios.put(`https://genius.com/api${song.song.api_path}`, {
        //    text_format: "html,markdown",
        //    song: {
        //        tags: tags.map((tag) => {
        //            return {
        //                id: +tag.id,
        //                name: tag.name,
        //            };
        //        }),
        //    }
        //});

        const iframe = document.createElement("iframe");
        iframe.classList.add("extension-song");
        iframe.sandbox = "allow-scripts allow-same-origin";
        iframe.style.display = "none";
        iframe.src = song.href;
        document.body.appendChild(iframe);

        await new Promise((resolve) => (iframe.onload = resolve));

        let currentWidth = $(progressBar).width();
        let newWidth = `${currentWidth + 1 / (albumSongs.length / 3)}%`;
        $(progressBar).width(newWidth);

        while (
            !iframe.contentWindow.document.querySelector(
                "button.SmallButton__Container-mg33hl-0"
            )
        ) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        iframe.contentWindow.document
            .querySelector("button.SmallButton__Container-mg33hl-0")
            .click();

        let existingTags = [];
        iframe.contentWindow.document
            .querySelector("[data-testid='tags-input']")
            .querySelectorAll(".TagInput__MultiValueLabel-sc-17py0eg-2.blnjJQ")
            .forEach((e) => {
                existingTags.push(e.innerText);
            });

        const tagsForThisSong = tagsNames.filter(
            (e) => !existingTags.includes(e)
        );
        console.log(
            "song: ",
            song.innerText,
            " tags: ",
            tagsNames,
            " existing tags: ",
            existingTags,
            " tags for this song: ",
            tagsForThisSong
        );

        const youtubeURLInput =
            /*iframe.contentWindow.*/ document.querySelector(
                "section.ScrollableTabs__Section-sc-179ldtd-6[data-section-index='1'] input.TextInput-sc-2wssth-0"
            );

        if (youtubeURLInput) {
            youtubeURLInput.click();
            youtubeURLInput.setAttribute("value", song.youtubeLink);
            const event = new InputEvent("input", {
                bubbles: true,
                data: song.youtubeLink,
            });
            youtubeURLInput.dispatchEvent(event);
        }

        for (const tag of tagsForThisSong) {
            const input = iframe.contentWindow.document.querySelector(
                "input#react-select-7-input"
            );
            input.value = tag;
            const event = new InputEvent("input", {
                bubbles: true,
                data: tag,
            });
            input.dispatchEvent(event);

            while (
                !iframe.contentWindow.document.querySelectorAll(
                    "div.css-47gho1-option"
                ).length
            ) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            const options = iframe.contentWindow.document.querySelectorAll(
                "div.css-47gho1-option"
            );
            options[0].click();
        }

        currentWidth = $(progressBar).width();
        newWidth = `${currentWidth + 2 / (albumSongs.length / 3)}%`;
        $(progressBar).width(newWidth);

        // if it's the last song, set everythingIsSaved to true
        if (song === albumSongs[albumSongs.length - 1]) {
            everythingIsSaved = true;
        }

        while (
            iframe.contentWindow.document.querySelector(
                "button.IconButton__Button-z735f6-0.fsRAyK.Modaldesktop__SaveIconButton-sc-1e03w42-7.jyxyfC"
            ).disabled
        ) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        iframe.contentWindow.document
            .querySelector(
                "button.IconButton__Button-z735f6-0.fsRAyK.Modaldesktop__SaveIconButton-sc-1e03w42-7.jyxyfC"
            )
            .click();

        await new Promise((resolve) => setTimeout(resolve, 1000));
        iframe.remove();
    }));

    while (!everythingIsSaved) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    progressBar.style.width = "100%";

    await new Promise((resolve) => setTimeout(resolve, 2000));

    document.getElementById("progressBar").remove();
    document.querySelectorAll(".extension-song").forEach((e) => e.remove());
}

export function addSongAsTheNext() {
    // look for an element with the classes "square_input square_input--full_width ac_input" (it's the input for the song name) inserted into the DOM
    // then add an "on/off" button to it which will add the song as the next song in the queue if turned on
    // save to the local storage the state of the button (on/off) [and if it's already true, change the button to on]

    // in the same observer, look for the "Add to queue" button (it has the class "ac_even" or "ac_odd") and add a click event listener to it
    // if the button is on, add the song as the next song in the queue
    // for adding the song as the next song in the queue, click on the button ".button--unstyled" which is child of an elem with the classes "editable_tracklist-row-number-edit_icon editable_tracklist-row-number-edit_icon--no_number"
    // then, write in the input with the class "square_input editable_tracklist-row-number-input u-x_small_right_margin ng-pristine ng-valid ng-empty ng-touched" the length-3 of $(".editable_tracklist-row-number")
    // then, click on the first element with the classes "inline_icon inline_icon--gray u-x_small_right_margin u-clickable"

    const addSongAsNext_ = () => {
        setTimeout(() => {
            // save the last word in the innerText of ".text_label text_label--gray" element into the var "songNum"
            // the ".text_label text_label--gray" should be a child of the ".tracklist-row__number" element without "ng-repeat" attribute ot "ng-if" attribute
            let songNum = $("div.text_label.text_label--gray")
                .not("[ng-repeat]")
                .not("[ng-if]")
                .first()
                .text()
                .split(" ")
                .pop();
            let buttonsLength = $(".button--unstyled").length;
            let button = $(".button--unstyled")[buttonsLength - 1];
            button.click();
            let input = document.querySelector(
                "input.square_input.editable_tracklist-row-number-input.u-x_small_right_margin.ng-pristine.ng-valid"
            );
            setTimeout(() => {
                input.classList.remove("ng-empty");
                input.classList.add("ng-not-empty");
                input.value = songNum;
                let event = new Event("input", { bubbles: true });
                input.dispatchEvent(event);
            }, 5);
            setTimeout(() => {
                document
                    .querySelectorAll(".button--unstyled")
                    [buttonsLength].click();
            }, 5);
        }, 5);
    };

    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (!mutation.addedNodes.length) {
                return;
            }

            let addedElem = mutation.addedNodes[0];
            let input = addedElem.querySelector(
                "input.square_input.square_input--full_width.ac_input"
            );
            if (input) {
                let container = document.createElement("div");
                container.classList.add("add-song-as-next-container");
                let label = document.createElement("label");
                label.classList.add("add-song-as-next-label");
                label.innerText = "Add as next";
                label.htmlFor = "add-song-as-next-checkbox";
                let span = document.createElement("span");
                span.classList.add("add-song-as-next-span", "chkboxmspan");
                $(label).prepend(span);
                let checkbox = document.createElement("input");
                checkbox.classList.add(
                    "add-song-as-next-checkbox",
                    "chkboxm"
                );
                checkbox.type = "checkbox";
                checkbox.id = "add-song-as-next-checkbox";
                $(container).append(checkbox);
                $(container).append(label);
                $(input).parent().append(container);

                chrome.storage.local.get("add_song_as_next", (result) => {
                    if (result.add_song_as_next) {
                        checkbox.checked = true;
                    }
                });

                checkbox.addEventListener("change", () => {
                    chrome.storage.local.set({
                        add_song_as_next: checkbox.checked
                    });
                });
                $("input[on-select=\"$ctrl.add_song(data)\"]").on(
                    "keydown",
                    (e) => {
                        console.log("keydown", e);
                        chrome.storage.local.get(
                            "add_song_as_next",
                            (result) => {
                                if (result.add_song_as_next) {
                                    if (e.keyCode === 13) {
                                        addSongAsNext_();
                                    }
                                }
                            }
                        );
                    }
                );
            }
            if (
                addedElem.classList.contains("ac_even") ||
                addedElem.classList.contains("ac_odd")
            ) {
                console.log("found add to queue button");
                let addToQueueButton = addedElem;
                chrome.storage.local.get("add_song_as_next", (result) => {
                    if (result.add_song_as_next) {
                        $(addToQueueButton).on("click", addSongAsNext_);
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    // run a keydown event listener on the body
    // if the key is enter log the element which has the focus
    document.body.addEventListener("keydown", (e) => {
        if (e.keyCode === 13) {
            console.log(document.activeElement);
        }
    });
}
