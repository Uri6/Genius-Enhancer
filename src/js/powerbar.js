/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

// Create a new AbortController for the search request
let searchController = new AbortController();

insertPowerbar();

// Placeholder texts for the powerbar input
const placeholders = [
    "Type \"!help\" if you're lost",
    "Type \"!help\" if you need some",
    "\"!help\" is your magic word",
    "Type \"!help\" for some guidance",
    "Don't be shy, type \"!help\"",
    "Don't guess, just type \"!help\"",
    "Type \"!help\" for assistance",
    "Everyone needs \"!help\" sometimes"
];

// Map of special characters to their corresponding number keys
const specialChars = {
    "!": "1",
    "@": "2",
    "#": "3",
    "$": "4",
    "%": "5",
    "^": "6",
    "&": "7",
    "*": "8",
    "(": "9",
    ")": "0"
};

// Initialize key press status array
let keyPressStatus = [false, false, false];

window.addEventListener("keyup", async (e) => {
    // Handle escape key to hide the powerbar
    if (e.key === "Escape") {
        $("#ge-powerbar").hide();
        keyPressStatus = [false, false, false];
        return;
    }

    // Retrieve the hotkey combination and split it into individual keys
    let powerbarHotkey = (await chrome.storage.local.get("powerbarHotkey"))?.powerbarHotkey || "Shift + Shift";
    let keys = powerbarHotkey.split(" + ").map(key => key.toLowerCase().replace("space", " ").replace("ctrl", "control"));

    // Normalize the key pressed
    let keyPressed = e.key.toLowerCase();
    keyPressed = specialChars[keyPressed] || keyPressed;

    // If the key pressed isn't one of the keys in the hotkey combination, reset the key press status
    if (!keys.includes(keyPressed)) {
        keyPressStatus = [false, false, false];
        return;
    }

    // Update key press status
    keys.some((key, index) => {
        // If the key pressed matches and it hasn't been pressed yet, set it as pressed
        if (key === keyPressed && !keyPressStatus[index]) {
            keyPressStatus[index] = true;
            return true;
        }
        return false;
    });

    // Check if all required keys are pressed
    const allKeysPressed = keys.every((key, index) => keyPressStatus[index]);

    // Toggle the powerbar if all keys are pressed
    if (allKeysPressed) {
        chrome.storage.local.get(["powerbarStatus"], (res) => {
            if (res.powerbarStatus) {
                e.preventDefault();
                $("#powerbar-input").val("");
                $("#powerbar-results").remove();
                $("#ge-powerbar").toggle();
                $("#powerbar-input").attr("placeholder", placeholders[Math.floor(Math.random() * placeholders.length)]);
                if ($("#ge-powerbar").is(":visible")) {
                    $("#powerbar-input").focus();
                }
                keyPressStatus = [false, false, false];
            }
        });
    }
});

function addLoadingAnimation() {
    if (!$("#powerbar-loading-ball").length) {
        $("<div>", { id: "powerbar-loading-ball" }).appendTo($("#ge-powerbar"));
    }
}

function showSearchTypeWarning() {
    $("#powerbar-input").addClass("powerbar-input-warning");
    $("#powerbar-results").remove();
}

function removeSearchWarning() {
    $("#powerbar-input").removeClass("powerbar-input-warning");
    $("#powerbar-results").remove();
}

async function insertPowerbar() {
    const powerbar = $("<div>", {
        id: "ge-powerbar",
        css: {
            display: "none"
        }
    })
        .append($("<input>", {
            id: "powerbar-input",
            type: "text"
        }))
        .insertAfter($("body"));

    powerbar.find("#powerbar-input").attr("data-gramm", "false");

    trackPowerbarInput();
}

function trackPowerbarInput() {
    $("#powerbar-input").on("input", function() {
        const input = $(this).val();
        // As long as "!" isn't inserted as the first character (excluding whitespace), send the input to the search function
        if (!input.match(/^\s*!/)) {
            // If there's "#" then it's the type of search
            if (input.match(/#/)) {
                const type = input.match(/#(\w+)/)[1].toLowerCase();
                const query = input.replace(/#\w+/, "").trim().replace(/\s+/g, " ");
                search(query, type);
            } else {
                search(input);
            }
        } else {
            removeSearchWarning();

            // Extract the command and arguments from the input
            // For example, if the input is "!hide 123", then the command is "hide" and the arguments are "123"
            const command = input.match(/!\w+/) ? input.match(/!\w+/)[0].replace("!", "").toLowerCase() : "";
            const args = input.replace(/!\w+/, "").trim().replace(/\s+/g, " ");

            // Load the execution options for the command
            loadExecutionOptions(command, args);
        }
    });
}

function loadExecutionOptions(command, args) {
    // Add a loading animation to the powerbar
    addLoadingAnimation();

    let options = {};

    switch (command) {
        case "help":
            options = {
                "searchTypes": {
                    "multi (default)": {
                        description: "Search for all types of results",
                        command: "#multi",
                        arguments: "query",
                        examples: ["chance", "#multi chance"]
                    },
                    "song": {
                        description: "Search for a song",
                        command: "#song",
                        arguments: "query",
                        examples: ["#song as - stevie"]
                    },
                    "lyric": {
                        description: "Search for a lyric",
                        command: "#lyric",
                        arguments: "query",
                        examples: ["#lyric one becomes two"]
                    },
                    "album": {
                        description: "Search for an album",
                        command: "#album",
                        arguments: "query",
                        examples: ["#album damn"]
                    },
                    "artist": {
                        description: "Search for an artist",
                        command: "#artist",
                        arguments: "query",
                        examples: ["#artist jay z"]
                    },
                    "user": {
                        description: "Search for a user",
                        command: "#user",
                        arguments: "query",
                        examples: ["#user Uri6"]
                    }
                },
                "commands": {
                    "hide": {
                        description: "Hide a song/album page",
                        command: "!hide",
                        arguments: "url / query",
                        examples: ["!hide https://genius.com/Queen-bohemian-rhapsody-lyrics", "!hide bohemian rhapsody"]
                    },
                    "unhide / show": {
                        description: "Unhide a song/album page",
                        command: "!unhide / !show",
                        arguments: "url / query",
                        examples: ["!unhide https://genius.com/albums/Kanye-west/The-life-of-pablo", "!show #album the life of pablo"]
                    },
                    "search-artwork": {
                        description: "Search for artwork",
                        command: "!search-artwork",
                        arguments: "query",
                        examples: ["!search-artwork kiss me more"]
                    }
                }
            };
            break;
        case "hide":
        //break;
        case "show":
        case "unhide":
        //break;
        case "search-artwork":
            options = {
                "soon": {
                    description: "Still working on it, coming soon!"
                }
            }
            break;
        default:
            showSearchTypeWarning();
            return;
    }

    removeSearchWarning();
    displayCommandResults(options);
}

function executeCommand(command, args) {
    switch (command) {
        case "hide":
            break;
        case "show":
        case "unhide":
            break;
        case "search-artwork":
            break;
        default:
            break;
    }
}

async function search(query, type = "unset") {
    // Kill the previous search request if it's still running
    if (searchController) {
        searchController.abort();
    }

    searchController = new AbortController();
    const { signal } = searchController;

    if (type === "unset") {
        // Get the default search type from the storage
        type = (await chrome.storage.local.get("defaultSearchType"))?.defaultSearchType || "multi";
    }

    addLoadingAnimation();
    const encodedName = encodeURIComponent(query);
    const url = `https://genius.com/api/search/${type}?q=${encodedName}`;

    const response = await fetch(url, { signal });

    // If the request was aborted, don't do anything
    if (signal.aborted) {
        return;
    } else if (!response.ok) {
        showSearchTypeWarning();
        return;
    }

    let jsonResponse = await response.json();

    // Helper function to create a song hit object
    const createSongHit = (hit) => ({
        artist: {
            name: hit.result.primary_artist.name,
            url: hit.result.primary_artist.url
        },
        name: hit.result.title_with_featured,
        id: hit.result.id,
        img: hit.result.song_art_image_thumbnail_url,
        url: hit.result.url,
        type: "song"
    });

    // Helper function to create an artist hit object
    const createArtistHit = (hit) => ({
        name: hit.result.name,
        id: hit.result.id,
        img: hit.result.image_url,
        url: hit.result.url,
        type: "artist"
    });

    // Helper function to create an album hit object
    const createAlbumHit = (hit) => ({
        artist: {
            name: hit.result.artist.name,
            url: hit.result.artist.url
        },
        name: hit.result.name,
        id: hit.result.id,
        img: hit.result.cover_art_url,
        url: hit.result.url,
        type: "album"
    });

    // Helper function to create a user hit object
    const createUserHit = (hit) => ({
        name: hit.result.name,
        id: hit.result.id,
        img: hit.result.avatar.thumb.url,
        url: hit.result.url,
        type: "user"
    });

    // Function to process section hits based on type
    const processSectionHits = (section, seenIds) => section.hits
        .filter(hit => !seenIds.has(hit.result.id)) // Filter out duplicates
        .map(hit => {
            seenIds.add(hit.result.id); // Mark as seen
            switch (hit.type) {
                case "song":
                case "songs":
                case "lyric":
                case "lyrics": return createSongHit(hit);
                case "artist":
                case "artists": return createArtistHit(hit);
                case "album":
                case "albums": return createAlbumHit(hit);
                case "user":
                case "users": return createUserHit(hit);
                default: return null;
            }
        })
        .filter(hit => hit !== null) // Filter out any nulls from unrecognized types
        .filter((hit, index, self) => self.findIndex(h => h.id === hit.id && h.type === hit.type) === index); // Remove any duplicates that may have slipped through

    let allHits = [];
    let seenIds = new Set();

    const singleTypes = ["song", "songs", "lyric", "lyrics", "artist", "artists", "album", "albums", "user", "users"];

    if (type === "multi") {
        jsonResponse.response.sections.forEach((section) => {
            allHits = allHits.concat(processSectionHits(section, seenIds));
        });
        jsonResponse = allHits;
    } else if (singleTypes.includes(type)) {
        jsonResponse = processSectionHits(jsonResponse.response.sections[0], seenIds);
    } else {
        showSearchTypeWarning();
        return;
    }

    removeSearchWarning();
    displaySearchResults(jsonResponse);
}

async function displaySearchResults(results) {
    // Remove any existing results
    $("#powerbar-results").remove();

    // Create a container for the results
    const container = $("<div>", {
        id: "powerbar-results",
    })
        .append($("<div>", {
            class: "scroll-container"
        }));

    const openInNewTab = (await chrome.storage.local.get("openPowerbarResultsInNewTab"))?.openPowerbarResultsInNewTab || false;

    // Iterate over the results and create a card for each one
    results.forEach((result) => {
        $("<div>", {
            class: "powerbar-result-card",
            "data-id": result?.id,
            "data-type": result?.type
        })
            .append($("<a>", {
                class: "powerbar-result-img-container",
                href: result?.url,
                target: openInNewTab ? "_blank" : "_self",
                title: `Go to ${result?.type} page`
            })
                .append($("<img>", {
                    class: "powerbar-result-img",
                    src: result?.img
                }))
            )
            .append($("<div>", {
                class: "powerbar-result-text"
            })
                .append($("<a>", {
                    class: "powerbar-result-name",
                    text: result?.name,
                    href: result?.url,
                    target: openInNewTab ? "_blank" : "_self",
                    title: `Go to ${result?.type} page`
                }))
                .append($("<a>", {
                    class: "powerbar-result-artist",
                    text: result?.artist?.name,
                    href: result?.artist?.url,
                    target: openInNewTab ? "_blank" : "_self",
                    title: "Go to artist page"
                }))
            )
            .appendTo(container.find(".scroll-container"));
    });

    // Append the container to the powerbar & remove the loading animation
    $("#ge-powerbar").append(container);
    $("#powerbar-loading-ball").remove();
}

function displayCommandResults(options) {
    // Remove any existing results
    $("#powerbar-results").remove();

    // Create a container for the results
    const container = $("<div>", {
        id: "powerbar-results",
    })
        .append($("<div>", {
            class: "scroll-container"
        }));

    if (options.searchTypes) { // If it's !help
        $("<div>", {
            class: "powerbar-result-cards-category",
            text: "Search Types",
            "data-type": "search-types"
        })
            .appendTo(container.find(".scroll-container"));

        Object.keys(options.searchTypes).forEach((searchType) => {
            $("<div>", {
                class: "powerbar-result-card",
                "data-type": "command",
                title: "Try it out!"
            })
                .append($("<div>", {
                    class: "powerbar-result-text"
                })
                    .append($("<div>", {
                        class: "powerbar-result-name",
                        text: searchType,
                        title: options.searchTypes[searchType].description
                    }))
                    .append($("<div>", {
                        class: "powerbar-result-command",
                        type: "command",
                        text: options.searchTypes[searchType].command
                    }))
                    .append($("<div>", {
                        class: "powerbar-result-arguments",
                        type: "arguments",
                        text: options.searchTypes[searchType].arguments
                    }))
                    .append($("<div>", {
                        class: "powerbar-result-examples",
                        type: options.searchTypes[searchType].examples.length > 1 ? "examples" : "example",
                        html: options.searchTypes[searchType].examples.join("<br>")
                    }))
                )
                .appendTo(container.find(".scroll-container"));
        });

        // Append the container to the powerbar & remove the loading animation
        $("#ge-powerbar").append(container);
        $("#powerbar-loading-ball").remove();

        // Go over the results and add a description to each one
        $(".powerbar-result-text").each(function() {
            $(this).children().not(".powerbar-result-name").each(function() {
                const descriptionText = $(this).attr("type") + ": ";
                const wrapper = $("<div>", {
                    class: "description-wrapper"
                });

                // Creating the new description element with a different class name
                const descriptionElement = $("<div>", {
                    class: "powerbar-custom-description",
                    text: descriptionText
                });

                // Wrapping the current element and its description in the wrapper
                wrapper.append(descriptionElement).append($(this).clone());
                $(this).replaceWith(wrapper);
            });
        });

        // When a card is clicked, insert the example into the input
        $(".powerbar-result-card").on("click", function() {
            const example = $(this).find(".powerbar-result-examples").html().split("<br>")[0];
            $("#powerbar-input").val(example);
            $("#powerbar-input").focus();
            $("#powerbar-input").trigger("input");
        });
    }
}

function hidePage(id, type) {

}