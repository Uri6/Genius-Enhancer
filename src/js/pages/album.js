// noinspection RequiredAttributes,HtmlRequiredAltAttribute

/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

import $ from "jquery";
import { getDetails, getTagsList } from "../sideFunctions/global";
import { addSongAsNext, appendIcon, autolinkArtwork, missingInfo } from "../sideFunctions/album";

$("div[ng-bind-html='metadata_question.question']").each((_, e) => {
    e.parentElement.remove();
});

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

const albumObject = getDetails();

const isExplicit = albumObject.dfp_kv.find(x => x.name === "is_explicit").values[0] === "true";

if (isExplicit && !$(".ge-explicit-icon").length) {
    $(".header_with_cover_art-primary_info-title").append($("<img>", {
        class: "ge-explicit-icon",
        src: global.browser.runtime.getURL("/src/imgs/explicit/explicit.svg"),
        alt: "Explicit",
    }));
}

(async () => {
    if (!$(".extension-icon").length) {
        await appendIcon();
        addSongAsNext();

        global.browser.storage.local.get(["bios", "people", "releaseDate"], (res) => {
            console.info("bios: " + res.bios, " people: " + res.people, " releaseDate: " + res.releaseDate);
            missingInfo(res.bios, res.people, res.releaseDate);
        });

        $(".header_with_cover_art-primary_info h2 .drop-target")
            .prepend($("<img>", {
                src: global.browser.runtime.getURL("/src/imgs/artist/Simple/32x32.png"),
                class: "artist_icon",
                title: "Artist"
            }));

        if ($(".header_with_cover_art metadata .metadata_unit").length) {
            $(".header_with_cover_art metadata .metadata_unit").text($(".header_with_cover_art .metadata_unit").text().replace("Released ", ""));
            $(".header_with_cover_art metadata")
                .prepend($("<img>", {
                    src: global.browser.runtime.getURL("/src/imgs/releaseDate/2/Simple/32x32.png"),
                    class: "release_date_icon",
                    title: "Release Date"
                }));
        }
    }

    // Get the album title and artist name from the page DOM
    const title = document.getElementsByClassName("header_with_cover_art-primary_info-title header_with_cover_art-primary_info-title--white")[0].innerText;
    const artist = document.getElementsByClassName("header_with_cover_art-primary_info-primary_artist")[0].innerText;
    const query = [title, artist];

    const albumArtworks = await autolinkArtwork(query, "album", true);

    const albumArtworksContainer = $("<datalist>", {
        id: "albumArtworks",
        style: "display: none;"
    })
        .appendTo("body");

    for (const artwork of albumArtworks) {
        $("<option>", {
            value: artwork
        })
            .appendTo(albumArtworksContainer);
    }

    const res = await getTagsList();
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
    }).get().sort((o1, o2) => o1.text > o2.text ? 1 : o1.text < o2.text ? -1 : 0);

    options.each((i, o) => {
        o.value = arr[i].value;
        $(o).text(arr[i].text);
    });

    $(document.body).append(dataListElem);
})();
