/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer-Beta/blob/main/LICENSE.md
 */

export async function handleAlbum(tabId) {
    await chrome.scripting.insertCSS(
        {
            target: { tabId: tabId },
            files: ["./src/css/album.css"]
        }
    );

    await chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            func: (async () => {
                const getTagsList = async function() {
                    let tagElem;

                    // Fetch the HTML content of the Genius New page
                    const response = await fetch("https://genius.com/new");
                    const res = await response.text();

                    // Parse the HTML content into a DOM object
                    const parser = new DOMParser();
                    const htmlDoc = parser.parseFromString(res, "text/html");

                    // Find the element with the name "tag_ids[]" and assign it to tagElem
                    tagElem = htmlDoc.getElementsByName("tag_ids[]")[0];

                    // Return the element
                    return tagElem;
                };

                if (!$(".extension-icon").length) {
                    await chrome.runtime.sendMessage({ "album_appendIcon": [true] });
                    await chrome.runtime.sendMessage({ "album_addSongAsNext": [true] });
                    chrome.storage.local.get(["bios", "people", "releaseDate"], (res) => {
                        console.info("bios: " + res.bios, " people: " + res.people, " releaseDate: " + res.releaseDate);
                        chrome.runtime.sendMessage({ "album_missingInfo": [res.bios, res.people, res.releaseDate] });
                    });

                    $(".header_with_cover_art-primary_info h2 .drop-target")
                        .prepend($("<img>", {
                            src: chrome.runtime.getURL("/src/images/artist/Simple/32x32.png"),
                            class: "artist_icon",
                            title: "Artist"
                        }));

                    if ($(".header_with_cover_art metadata .metadata_unit").length) {
                        $(".header_with_cover_art metadata .metadata_unit").text($(".header_with_cover_art .metadata_unit").text().replace("Released ", ""));
                        $(".header_with_cover_art metadata")
                            .prepend($("<img>", {
                                src: chrome.runtime.getURL("/src/images/releaseDate/Simple/ge_releasedate_grey32.png"),
                                class: "release_date_icon",
                                title: "Release Date"
                            }));
                    }
                }

                if (!$(".copy_id_button").length) {
                    const meta = $("meta[itemprop='page_data']").attr("content");
                    let id;

                    try {
                        const pageData = JSON.parse(meta);
                        id = pageData?.album?.id;
                    } catch (err) {
                        console.error("Failed to parse page data", err);
                    }

                    if (id) {
                        $("<div>", {
                            class: "copy_id_button text_label text_label--purple u-top_margin cursor_pointer",
                            text: "Copy Album ID"
                        }).insertAfter($(`div[ng-if="!$ctrl.hide_leaderboard"]`));

                        $(".copy_id_button").on("click", () => {
                            navigator.clipboard.writeText(id);
                        });
                    }
                }

                // Get the album title and artist name from the page DOM
                const title = document.getElementsByClassName("header_with_cover_art-primary_info-title header_with_cover_art-primary_info-title--white")[0].innerText;
                const artist = document.getElementsByClassName("header_with_cover_art-primary_info-primary_artist")[0].innerText;
                const query = [title, artist];

                const albumArtworks = await new Promise((resolve) => {
                    chrome.runtime.sendMessage({ "album_autolinkArtwork": [query, "album", true] }, (response) => {
                        resolve(response);
                    });
                });

                // Set the result as the inner text of the "albumArtworks" element
                $("<div>", {
                    id: "albumArtworks",
                    style: "display: none;",
                    text: JSON.stringify(albumArtworks)
                })
                    .appendTo("body");

                getTagsList().then(res => {
                    const replaces = {
                        "&#039;": `'`,
                        "&amp;": "&",
                        "&lt;": "<",
                        "&gt;": ">",
                        "&quot;": "\""
                    };

                    const dataListElem = $("<datalist>").html(res.innerHTML).attr("id", "tagsList");
                    const options = dataListElem.find("option");

                    options.each(function() {
                        const tagNameFixed = $(this).html().replace(/&[\w\d#]{2,5};/g, match => replaces[match]).replace(/  +/g, " ");
                        const tagID = $(this).attr("value");
                        $(this).html(tagNameFixed).attr("value", tagID);
                    });

                    const arr = options.map(function() {
                        return {
                            text: $(this).text(),
                            value: this.value
                        };
                    }).get().sort(function(o1, o2) {
                        return o1.text > o2.text ? 1 : o1.text < o2.text ? -1 : 0;
                    });

                    options.each(function(i, o) {
                        o.value = arr[i].value;
                        $(o).text(arr[i].text);
                    });

                    $("body").append(dataListElem);
                });

                const albumObject = await new Promise((resolve) => {
                    chrome.runtime.sendMessage({ "getDetails": [true] }, (response) => {
                        resolve(response);
                    });
                });

                const isExplicit = albumObject.dfp_kv.find(x => x.name === "is_explicit").values[0] === "true";

                if (isExplicit && !$(".ge-explicit-icon").length) {
                    $(".header_with_cover_art-primary_info-title").append($("<img>", {
                        class: "ge-explicit-icon",
                        src: chrome.runtime.getURL("/src/images/explicit/explicit.svg")
                    }));
                }
            })
        }
    );
}
