/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

async function getDetails() {
    // Find the first occurrence of a '<meta>' tag that contains a JSON string in its 'content' attribute
    const metaElem = document.documentElement.innerHTML.match(
        /<meta content="({[^"]+)/
    );

    // Define an object containing HTML entity codes and their corresponding characters
    const replaces = {
        "&#039;": `'`,
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
    };

    // If the '<meta>' tag was found, extract the JSON string from it and replace any HTML entities with their corresponding characters
    if (metaElem) {
        // Get the JSON string from the first '<meta>' tag, and replace any HTML entities using a callback function
        const meta = metaElem[1].replace(
            /&[\w\d#]{2,5};/g,
            (match) => replaces[match]
        );

        // Parse the JSON string and return the resulting object
        return JSON.parse(meta);
    } else {
        const id = document.querySelector("[property=\"twitter:app:url:iphone\"]").content.split("/")[3];
        const response = await fetch(`https://genius.com/api/songs/${id}`);
        const json = await response.json();

        return json.response;
    }
}

async function createSpotifyPlayer() {
    function genAuthBasicToken(clientId, clientSecret) {
        return btoa(`${clientId}:${clientSecret}`);
    }

    // Get epoch time in seconds (because Spotify gives key validity in seconds)
    function getEpochTimeSeconds() {
        return Math.floor(Date.now() / 1000);
    }

    // Format a JavaScript object
    function formatGetParams(params) {
        return Object.keys(params)
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');
    }

    // Remove parentheses, split artists by ampersands, and add these all to a set
    function generateSpotifySearchSets(trackJson, hasAppleMusic = true) {
        if (!trackJson) {
            console.error("No track details!");
            return {
                "title": new Set(),
                "artists": new Set()
            };
        }
        let titleSet = new Set();
        let artistSet = new Set();
        if (hasAppleMusic) {
            titleSet.add(trackJson["title"]);
            titleSet.add(trackJson["title"]?.replace(/ *\([^)]*\) */g, ""));
            artistSet.add(trackJson["artist_display_name"]);
            const splitName = trackJson["artist_display_name"]?.split("&");
            for (const partialName of splitName || [])
                artistSet.add(partialName.trim());
        } else {
            titleSet.add(trackJson[0]);
            artistSet.add(trackJson[1]);
        }
        return {
            "title": titleSet,
            "artists": artistSet
        };
    }

    // Given an Apple Music track, will find the corresponding Spotify ID and call loadSpotifyPlayer
    async function mapIdAndLoad(clientId, clientSecret, trackJson, playerParent, newSite, hasAppleMusic = true) {
        // Add flag to indicate if the player has already been added
        let replacedAlready = false;

        let searchSets;

        if (!hasAppleMusic) {
            searchSets = generateSpotifySearchSets(trackJson, false);
        } else {
            searchSets = generateSpotifySearchSets(trackJson);
        }

        for (const artist of searchSets["artists"]) {
            if (replacedAlready)
                break;
            for (const title of searchSets["title"]) {
                if (replacedAlready)
                    break;
                const params = {
                    "q": `${title} ${artist}`,
                    "type": "track"
                };

                await fetch("https://accounts.spotify.com/api/token", {
                    method: "POST",
                    headers: {
                        "Authorization": `Basic ${genAuthBasicToken(clientId, clientSecret)}`,
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: "grant_type=client_credentials"
                })
                    .then(resObj => resObj.json())
                    .then(response => {
                        response["saved_at"] = getEpochTimeSeconds();
                        chrome.storage.local.set({
                            "token": response
                        }, () => {
                            fetch(`https://api.spotify.com/v1/search?${formatGetParams(params)}`, {
                                method: "GET",
                                headers: {
                                    "Authorization": `${response["token_type"]} ${response["access_token"]}`
                                }
                            })
                                .then(resObj => resObj.json())
                                .then(response => {
                                    try {
                                        // Spotify API returns a list of tracks, so we have to find the best match
                                        const diff = (a, b) => {
                                            const aSet = new Set(a.split(" "));
                                            const bSet = new Set(b.split(" "));
                                            const intersection = new Set([...aSet].filter(x => bSet.has(x)));
                                            return aSet.size + bSet.size - 2 * intersection.size;
                                        };
                                        const bestMatch = response["tracks"]["items"].reduce((prev, curr) => {
                                            const currDiff = diff(curr["name"], title) + diff(curr["artists"][0]["name"], artist);
                                            const prevDiff = diff(prev["name"], title) + diff(prev["artists"][0]["name"], artist);
                                            return currDiff < prevDiff ? curr : prev;
                                        });

                                        loadSpotifyPlayer(playerParent, bestMatch["id"], newSite, replacedAlready);

                                        // Set the flag to indicate the player has already been added
                                        replacedAlready = true;
                                    }
                                    catch (e) {
                                        console.info("No tracks in Spotify response, received:");
                                        console.dir(response);
                                    }
                                });
                        });
                    })
                    .catch(err => {
                        console.error(err);
                    });
            }
        }
    }

    // Given a Spotify ID, will load the Spotify player
    function loadSpotifyPlayer(playerParent, spotifyId, newSite, replacedAlready) {
        if (!replacedAlready) {
            let frame = document.createElement("iframe");
            frame.style.height = "90px";
            frame.style.marginLeft = "15px";

            if (newSite) {
                frame.style.width = "100.2%";
            } else {
                frame.style.width = "calc(100% - 30px)";
            }
            chrome.storage.local.get(["spotifyPopUp"], (res) => {
                if (!res.spotifyPopUp) {
                    frame.style.display = "none";
                }
            });
            frame.id = "ge-spotify-player";
            frame.src = `https://open.spotify.com/embed/track/${spotifyId}`;
            frame.setAttribute("allow", "encrypted-media");
            frame.setAttribute("allowtransparency", "true");

            // Append and make sure our iframe is not crushed
            // If there's SoundCloud player, insert the Spotify player before it
            if (document.getElementById("ge-soundcloud-player")) {
                playerParent.insertBefore(frame, document.getElementById("ge-soundcloud-player"));
            } else {
                playerParent.appendChild(frame);
            }
            playerParent.style.display = "block";
            if (newSite) {
                playerParent.style.width = "70%";
                playerParent.style.marginLeft = "15%";
            } else {
                playerParent.style.width = "100%";
            }
        } else {
            // If the player has already been added, just update the src
            let frame = document.getElementById("ge-spotify-player");
            frame.src = `https://open.spotify.com/embed/track/${spotifyId}`;
        }
    }

    async function swapAppleMusicPlayer(clientId, clientSecret) {
        let newSite = false;
        let title, artist;
        // this holds the iframe for the Apple Music player
        let appleMusicParent = document.getElementsByClassName("apple_music_player_iframe_wrapper")[0];
        // on the new site, the container div has a different name
        if (appleMusicParent == undefined) {
            const classBase = "AppleMusicPlayerdesktop__IframeWrapper-";
            appleMusicParent = document.querySelectorAll("[class^=\"" + classBase + "\"], [class*=\" " + classBase + "\"]")[0];
            newSite = true;
        }
        // some pages do not have an Apple Music player, so they don't get Spotify. if the container
        //  is still undefined after trying both possibilities then we can assume there is no player
        if (appleMusicParent == undefined) {
            if (document.getElementsByClassName("header_with_cover_art-primary_info-title")[0]) {
                newSite = false;
            }

            if (!newSite) {
                title = document.getElementsByClassName("header_with_cover_art-primary_info-title")[0]?.innerText;
                artist = document.getElementsByClassName("header_with_cover_art-primary_info-primary_artist")[0]?.innerText;
            } else {
                const id = document.querySelector("[property=\"twitter:app:url:iphone\"]").content.split("/")[3];
                const response = await fetch(`https://genius.com/api/songs/${id}`);
                const json = await response.json();
                title = json.response.song.title;
                artist = json.response.song.primary_artist.name;
            }

            const query = [title, artist];
            const modifiedQuery = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ "fixNonLatin": [query] }, (response) => {
                    resolve(response);
                });
            });

            mapIdAndLoad(clientId, clientSecret, modifiedQuery, appleMusicParent, newSite);

            return;
        }
        // find the iframe (the apple music player)
        for (let i = 0; i < appleMusicParent.childNodes.length; i++) {
            const appleMusicIframe = appleMusicParent.childNodes[i];
            if (appleMusicIframe.nodeName == "IFRAME") {
                // we have to check and wait until the iframe's content is loaded to get the track metadata
                const contentPoll = setInterval(() => {
                    if (appleMusicIframe.contentDocument != null) {
                        clearInterval(contentPoll);
                        const appleMusicPlayer = appleMusicIframe.contentDocument.querySelector("apple-music-player");
                        // the Apple Music track metadata is stored under this attribute
                        const previewJson = appleMusicPlayer.getAttribute("preview_track");
                        if (previewJson != null) {
                            const trackJson = JSON.parse(previewJson);
                            mapIdAndLoad(clientId, clientSecret, trackJson, appleMusicParent, newSite);

                            // hide appleMusicIframe element if the user wants to
                            chrome.storage.local.get(["appleMusicPopUp"], (res) => {
                                if (!res.appleMusicPopUp) {
                                    appleMusicIframe.style.display = "none";
                                }
                            });
                        }
                    }
                }, 200);
                break;
            }
        }
    }

    if (!document.getElementById("ge-spotify-player")) {
        swapAppleMusicPlayer(secrets.SPOTIFY_CLIENT_ID, secrets.SPOTIFY_CLIENT_SECRET);
    }
}

createSpotifyPlayer();