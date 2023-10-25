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

// Track after double pressing shift, and insert the powerbar when it pressed
let shiftPressed = false;

window.addEventListener("keyup", (e) => {
    if (e.key === "Shift") {
        if (shiftPressed) {
            shiftPressed = false;
            e.preventDefault();
            $("#powerbar-input").val("");
            $("#powerbar-results").remove();
            $("#ge-powerbar").toggle();
            $("#powerbar-input").attr("placeholder", placeholders[Math.floor(Math.random() * placeholders.length)]);
            if ($("#ge-powerbar").is(":visible")) {
                $("#powerbar-input").focus();
            }
        } else {
            shiftPressed = true;
        }
    } else {
        shiftPressed = false;
    }

    if (e.key === "Escape") {
        $("#ge-powerbar").hide();
        shiftPressed = false;
    }
});

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
            // Remove the results & warning class from the input
            $("#powerbar-results").remove();
            $("#powerbar-input").removeClass("powerbar-input-warning");

            // Extract the command and arguments from the input
            // For example, if the input is "!hide 123", then the command is "hide" and the arguments are "123"
            const command = input.match(/!\w+/) ? input.match(/!\w+/)[0].replace("!", "").toLowerCase() : "";
            const args = input.replace(/!\w+/, "").trim().replace(/\s+/g, " ");

            // Load the execution options for the command
            loadExecutionOptions(command, args);
        }
    });
}

function addLoadingAnimation() {
    if (!$("#powerbar-loading-ball").length) {
        $("<div>", { id: "powerbar-loading-ball" }).appendTo($("#ge-powerbar"));
    }
}

function loadExecutionOptions(command, args) {
    // Add a loading animation to the powerbar
    addLoadingAnimation();

    let options = {};

    switch (command) {
        case "help":
            options = {
                "searchTypes": {
                    "song (default)": {
                        description: "Search for a song",
                        command: "#song",
                        arguments: "query",
                        examples: ["#song as - stevie", "as - stevie"]
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
            // Let the user know that the command isn't supported
            $("#powerbar-input").addClass("powerbar-input-warning");

            // Remove the results
            $("#powerbar-results").remove();

            // Return so that the rest of the function doesn't run
            return;
    }

    // Remove the warning class from the input (since the command was valid)
    $("#powerbar-input").removeClass("powerbar-input-warning");

    // Display the command options
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

async function search(query, type = "song") {
    // Add a loading animation to the powerbar
    addLoadingAnimation();

    // Encode the search query to include special characters
    const encodedName = encodeURIComponent(query);

    // Construct the URL to call the Genius API search endpoint
    const url = `https://genius.com/api/search/${type}?q=${encodedName}`;

    // Call the Genius API search endpoint and get the response as JSON
    const response = await fetch(url);
    let jsonResponse = await response.json();

    // Extract the results from the response and map them to a new clean object
    switch (type) {
        case "song":
        case "songs":
        case "lyric":
        case "lyrics":
            jsonResponse = jsonResponse.response.sections[0].hits.map((hit) => {
                return {
                    artist: {
                        name: hit.result.primary_artist.name,
                        url: hit.result.primary_artist.url
                    },
                    name: hit.result.title_with_featured,
                    id: hit.result.id,
                    img: hit.result.song_art_image_thumbnail_url,
                    url: hit.result.url,
                    type: "song"
                };
            });
            break;
        case "artist":
        case "artists":
            jsonResponse = jsonResponse.response.sections[0].hits.map((hit) => {
                return {
                    name: hit.result.name,
                    id: hit.result.id,
                    img: hit.result.image_url,
                    url: hit.result.url,
                    type: "artist"
                };
            });
            break;
        case "album":
        case "albums":
            jsonResponse = jsonResponse.response.sections[0].hits.map((hit) => {
                return {
                    artist: {
                        name: hit.result.artist.name,
                        url: hit.result.artist.url
                    },
                    name: hit.result.name,
                    id: hit.result.id,
                    img: hit.result.cover_art_url,
                    url: hit.result.url,
                    type: "album"
                };
            });
            break;
        case "user":
        case "users":
            jsonResponse = jsonResponse.response.sections[0].hits.map((hit) => {
                return {
                    name: hit.result.name,
                    id: hit.result.id,
                    img: hit.result.avatar.thumb.url,
                    url: hit.result.url,
                    type: "user"
                };
            });
            break;
        default:
            // Let the user know that the type isn't supported
            $("#powerbar-input").addClass("powerbar-input-warning");

            // Remove the results
            $("#powerbar-results").remove();

            // Return so that the rest of the function doesn't run
            return;
    }

    // Remove the warning class from the input (since the search was successful)
    $("#powerbar-input").removeClass("powerbar-input-warning");

    // If there are results, display them
    displaySearchResults(jsonResponse);
}

function displaySearchResults(results) {
    // Remove any existing results
    $("#powerbar-results").remove();

    // Create a container for the results
    const container = $("<div>", {
        id: "powerbar-results",
    })
        .append($("<div>", {
            class: "scroll-container"
        }));

    // Iterate over the results and create a card for each one
    results.forEach((result) => {
        $("<div>", {
            class: "powerbar-result-card",
            "data-id": result.id,
            "data-type": result.type,
        })
            .append($("<img>", {
                class: "powerbar-result-img",
                src: result.img,
                title: `Go to ${result.type} page`,
                "data-url": result.url
            }))
            .append($("<div>", {
                class: "powerbar-result-text"
            })
                .append($("<div>", {
                    class: "powerbar-result-name",
                    text: result.name,
                    title: `Go to ${result.type} page`,
                    "data-url": result.url
                }))
                .append($("<div>", {
                    class: "powerbar-result-artist",
                    text: result?.artist?.name,
                    title: "Go to artist page",
                    "data-url": result?.artist?.url
                }))
            )
            .appendTo(container.find(".scroll-container"));
    });

    // Append the container to the powerbar & remove the loading animation
    $("#ge-powerbar").append(container);
    $("#powerbar-loading-ball").remove();

    // When a card is clicked, open the link in a new tab
    $(".powerbar-result-img, .powerbar-result-name, .powerbar-result-artist").on("click", function() {
        window.open($(this).attr("data-url"), "_blank");
    });
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