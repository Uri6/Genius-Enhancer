/*
* This code was not written by me (Uri Sivani) and is subject to the license of the original project.
* Please refer to the original project website for more information.
*/

// Noah Sandman
// genius-inject.ts
// Created 13 Jan 2021
// GeniuSpot
// "clientId:clientSecret", base64 encoded
function genAuthBasicToken(clientId: string, clientSecret: string): string {
    return window.btoa(`${clientId}:${clientSecret}`);
}

// get epoch time in seconds because Spotify gives key validity in seconds
function getEpochTimeSeconds() {
    return Math.floor(Date.now() / 1000);
}

// format a JavaScript object
function formatGetParams(params: Record<string, string | number>) {
    return Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join("&");
}

interface Track {
    title: string;
    artist_display_name: string;
}

// remove parentheses, split artists by ampersands, and add these all to a set
// getSpotifyId will search as many of these as needed to find a match
function generateSpotifySearchSets(trackJson: Track, hasAppleMusic = true) {
    let titleSet: Set<string> = new Set();
    let artistSet: Set<string> = new Set();

    if (hasAppleMusic) {
        titleSet.add(trackJson.title);
        titleSet.add(trackJson.title.replace(/ *\([^)]*\) */g, ""));
        artistSet.add(trackJson.artist_display_name);
        const splitName = trackJson.artist_display_name.split("&");

        for (const partialName of splitName) {
            artistSet.add(partialName.trim());
        }
    } else {
        titleSet.add(trackJson[0]);
        artistSet.add(trackJson[1]);
    }

    return {
        "title": titleSet,
        "artists": artistSet
    };
}

// given an Apple Music track, will find the corresponding Spotify ID and call loadSpotifyPlayer
async function mapIdAndLoad(clientId, clientSecret, trackJson, playerParent, newSite, hasAppleMusic = true) {
    await chrome.storage.local.set({ "hasAppleMusic": hasAppleMusic });

    // Add flag to indicate if the player has already been added
    let replacedAlready = false;
    let searchSets;

    if (!hasAppleMusic) {
        console.log("No Apple Music");
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
                                    loadSpotifyPlayer(playerParent, response["tracks"]["items"][0]["id"], newSite, replacedAlready);
                                    // Set the flag to indicate the player has already been added
                                    replacedAlready = true;
                                }
                                catch (e) {
                                    console.log("No tracks in Spotify response, received:");
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

function loadSpotifyPlayer(playerParent, spotifyId, newSite, replacedAlready) {
    if (!replacedAlready) {
        let frame = document.createElement("iframe");
        frame.style.height = "90px";

        if (newSite) {
            frame.style.width = "100.2%";
            frame.style.marginLeft = "15px";
        } else {
            frame.style.width = "calc(100% - 30px)";
            frame.style.marginLeft = "15px";
        }

        chrome.storage.local.get(["spotifyPopUp"], (res) => {
            if (!res.spotifyPopUp) {
                frame.style.display = "none";
            }
        });

        frame.id = "gb-spotify-player";
        frame.src = `https://open.spotify.com/embed/track/${spotifyId}`;
        frame.setAttribute("allow", "encrypted-media");
        frame.setAttribute("allowtransparency", "true");
        // append and make sure our iframe is not crushed
        playerParent.appendChild(frame);
        playerParent.style.display = "block";
        if (newSite) {
            playerParent.style.width = "70%";
            playerParent.style.marginLeft = "15%";
        } else {
            playerParent.style.width = "100%";
        }
    } else {
        // If the player has already been added, just update the src
        let frame: HTMLIFrameElement = document.getElementById("gb-spotify-player") as HTMLIFrameElement;
        frame.src = `https://open.spotify.com/embed/track/${spotifyId}`;
    }
}
function swapAppleMusicPlayer(clientId, clientSecret) {
    let newSite = false;
    let title, artist;
    // this holds the iframe for the Apple Music player
    let appleMusicParent = document.getElementsByClassName("apple_music_player_iframe_wrapper")[0];
    // on the new site, the container div has a different name
    if (appleMusicParent == undefined) {
        appleMusicParent = document.getElementsByClassName("AppleMusicPlayer__IframeWrapper-uavgzr-1")[0];
        newSite = true;
    }
    // some pages do not have an Apple Music player, so they don't get Spotify. if the container
    //  is still undefined after trying both possibilities then we can assume there is no player
    if (appleMusicParent == undefined) {

        if (document.getElementsByClassName("header_with_cover_art-primary_info-title")[0]) {
            newSite = false;
        }

        const classNames = {
            old: {
                title: "header_with_cover_art-primary_info-title",
                artist: "header_with_cover_art-primary_info-primary_artist"
            },
            new: {
                title: "SongHeaderdesktop__HiddenMask-sc-1effuo1-10 kwCpxe",
                artist: "SongHeaderdesktop__Artist-sc-1effuo1-11 fPVhsa",
            }
        }

        const activeClassNames = classNames[!newSite ? "old" : "new"]

        title = (
            document.getElementsByClassName(activeClassNames.title)[0] as HTMLParagraphElement
        ).innerText;
        artist = (
            document.getElementsByClassName(activeClassNames.artist)[0] as HTMLParagraphElement
        ).innerText;

        const nonLatinRegex = /[\u011E-\u011F\u0130-\u0131\u015E-\u015F\u00C7-\u00E7\u0590-\u05FF\u0400-\u04FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/;

        const query = [title, artist];
        const modifiedQuery = query.map(part => {
            if (part.split(" - ").length === 2 && nonLatinRegex.test(part.split(" - ")[1])) {
                const langsParts = part.split(" - ");
                return langsParts[1];
            }
            return part;
        });

        mapIdAndLoad(clientId, clientSecret, modifiedQuery, appleMusicParent, newSite);

        return;
    }

    // find the iframe (the apple music player)
    for (let i = 0; i < appleMusicParent.childNodes.length; i++) {
        const appleMusicIframe = appleMusicParent.childNodes[i] as unknown as HTMLIFrameElement;

        if (appleMusicIframe.nodeName != "IFRAME") {
            continue;
        }

        // we have to check and wait until the iframe's content is loaded to get the track metadata
        const contentPoll = setInterval(() => {
            if (appleMusicIframe.contentDocument == null) {
                return;
            }

            clearInterval(contentPoll);
            const appleMusicPlayer = appleMusicIframe.contentDocument.querySelector("apple-music-player");
            const previewJson = appleMusicPlayer.getAttribute("preview_track");

            if (previewJson == null) {
                return;
            }

            const trackJson = JSON.parse(previewJson);
            mapIdAndLoad(clientId, clientSecret, trackJson, appleMusicParent, newSite);
            chrome.storage.local.get(["appleMusicPopUp"], (res) => {
                if (!res.appleMusicPopUp) {
                    appleMusicIframe.style.display = "none";
                }
            });
        }, 200);
        break;
    }
}

export function swapPlayer() {
    if (!document.getElementById("gb-spotify-player")) {
        // TODO: we should NOT be hard-coding these values
        swapAppleMusicPlayer("e4021c9e5eae4db2b13671badf0a7633", "e2daf42f2e7f4a309f946e8a4194d958");
    }
}
