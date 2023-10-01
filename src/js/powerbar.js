insertPowerbar();

// Track after double pressing shift, and insert the powerbar when it pressed
// Also track when the escape key is pressed to hide the powerbar
let shiftPressed = false;

window.addEventListener("keydown", (e) => {
    if (e.key === "Shift") {
        if (shiftPressed) {
            shiftPressed = false;
            e.preventDefault();
            $("#powerbar-input").val("");
            $("#powerbar-results").remove();
            $("#ge-powerbar").toggle();
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

function insertPowerbar() {
    const powerbar = $("<div>", {
        id: "ge-powerbar",
        css: {
            display: "none"
        }
    })
        .append($("<input>", {
            id: "powerbar-input",
            type: "text",
        }))
        .insertAfter($("body"));

    powerbar.find("#powerbar-input").attr("data-gramm", "false");

    trackPowerbarInput();
}

function trackPowerbarInput() {
    $("#powerbar-input").on("input", function () {
        const input = $(this).val();
        // As long as "!" isn't inserted as the first character (excluding whitespace), send the input to the search function
        if (!input.match(/^\s*!/)) {
            // If there's "#" then it's the type of search
            if (input.match(/#/)) {
                const type = input.match(/#(\w+)/)[1];
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
            // Don't forget to make sure that it's not just "!" (which would be invalid)
            const command = input.match(/!\w+/) ? input.match(/!\w+/)[0].replace("!", "") : "";
            const args = input.replace(/!\w+/, "").trim().replace(/\s+/g, " ");

            // Load the execution options for the command
            loadExecutionOptions(command, args);
        }
    });
}

function loadExecutionOptions(command, args) {
    switch (command) {
        case "hide":
            break;
        case "show":
        case "unhide":
            break;
        case "get-artwork":
            break;
        default:
            break;
    }
}

function executeCommand(command, args) {
    switch (command) {
        case "hide":
            break;
        case "show":
        case "unhide":
            break;
        case "get-artwork":
            break;
        default:
            break;
    }
}

async function search(query, type = "song") {
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
    displayResults(jsonResponse);
}

function displayResults(results) {
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

    // Append the container to the powerbar
    $("#ge-powerbar").append(container);

    // When a card is clicked, open the link in a new tab
    $(".powerbar-result-img, .powerbar-result-name, .powerbar-result-artist").on("click", function () {
        window.open($(this).attr("data-url"), "_blank");
    });
}

function hidePage(id, type) {

}