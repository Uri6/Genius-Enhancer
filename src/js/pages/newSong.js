/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer-Beta/blob/main/LICENSE.md
 */

export async function handleNewSong(tabId) {
    await chrome.scripting.insertCSS(
        {
            target: { tabId: tabId },
            files: ["./src/css/newSong.css"]
        }
    );

    await chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            func: (() => {
                const oldChooser = document.querySelector(".primary_tag_chooser");
                oldChooser.style.display = "none";

                const newChooser = document.createElement("div");
                newChooser.classList.add("modern-chooser");
                oldChooser.after(newChooser);

                const genres = [
                    { value: 1434, name: "Rap", emoji: "🎤" },
                    { value: 16, name: "Pop", emoji: "🎵" },
                    { value: 352, name: "R&B", emoji: "🎶" },
                    { value: 567, name: "Rock", emoji: "🎸" },
                    { value: 413, name: "Country", emoji: "🤠" },
                    { value: 1452, name: "Non-Music", emoji: "🎙️" }
                ];

                genres.forEach((genre) => {
                    const genreButton = document.createElement("button");
                    genreButton.innerHTML = `${genre.emoji} ${genre.name}`;
                    genreButton.classList.add("modern-chooser-button");
                    genreButton.addEventListener("click", (e) => {
                        e.preventDefault();
                        $(".modern-chooser-button").removeClass("modern-chooser-button-active");
                        $(e.target).addClass("modern-chooser-button-active");
                        $(`#song_primary_tag_id_${genre.value}`).trigger("click");
                    });
                    newChooser.appendChild(genreButton);
                });

                $(`#song_primary_tag_id_${genres[1].value}`).trigger("click");
                $(newChooser.children[1]).addClass("modern-chooser-button-active");

                // change the text in the element ".lyrics_style_guide" to shown only if the first h4 child has clicked
                // first, change the h4 element parent to be the parent of his parent. then, make the styleGuide diaply be none unless the h4 is clicked.
                // then, make the h4 element to be clicked and change the styleGuide display to be block
                const styleGuide = document.querySelector(".lyrics_style_guide");
                const h4 = styleGuide.querySelector("h4");
                styleGuide.parentElement.insertBefore(h4, styleGuide);
                styleGuide.style.opacity = "0";

                h4.addEventListener("mouseover", () => {
                    styleGuide.style.opacity = "1";
                });

                h4.addEventListener("mouseleave", () => {
                    if (!$(".lyrics_style_guides:hover").length) {
                        styleGuide.style.opacity = "0";
                    } else {
                        $(".lyrics_style_guides").mouseleave(() => {
                            styleGuide.style.opacity = "0";
                        });
                    }
                });

                // on every input which isn't child of .search-field, if "enter" is pressed, click the submit button (#song_submit)
                $("input:not(.search-field input)").on("keydown", function(e) {
                    if (e.key === "Enter") {
                        $("#song_submit").trigger("click");
                    }
                });
            })
        }
    );
}