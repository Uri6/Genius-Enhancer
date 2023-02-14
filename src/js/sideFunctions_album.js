/*
* This code is licensed under the terms of the "LICENSE.md" file
* located in the root directory of this code package.
*/

export function missingInfo(bio, people, releaseDate) {

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

    // This functoin written by @wnull (@wine in Genius.com)
    const getDeatils = () => {
        let matches = document.documentElement.innerHTML.match(/<meta content="({[^"]+)/);
        let replaces = {
            '&#039;': `'`,
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"'
        };

        if (matches) {
            let meta = matches[1].replace(/&[\w\d#]{2,5};/g, match => replaces[match]);
            // full metadata album & another data
            let dataObject = JSON.parse(meta);
            return dataObject;
        }
    }

    let albumObject = getDeatils();
    var tracklist = document.getElementsByClassName("chart_row chart_row--light_border chart_row--full_bleed_left chart_row--align_baseline chart_row--no_hover");
    let song_index = 0;

    albumObject.album_appearances.forEach(({ song }) => {

        let elem = tracklist[song_index];

        if (people) {
            let img_elem = document.createElement('img');
            var peopleAreMissing = song.writer_artists.length == 0 || song.producer_artists.length == 0;
            img_elem.classList.add("people-icon", "gb-fade-in");
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
            img_elem = document.createElement("img");
            img_elem.classList.add("bio-icon", "gb-fade-in");
            if (song.description_preview == '') {
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
            img_elem = document.createElement("img");
            img_elem.classList.add("release-date-icon", "gb-fade-in");
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

    var peopleIcons = document.querySelectorAll('.people-icon');
    var bioIcons = document.querySelectorAll('.bio-icon');
    var releaseDateIcons = document.querySelectorAll('.release-date-icon');

    if (bio) {
        bioIcons.forEach((icon) => {
            icon.classList.remove("gb-fade-in");
            icon.classList.add("gb-fade-out");
            icon.remove()
        })
    }

    else if (people) {
        peopleIcons.forEach((icon) => {
            icon.classList.remove("gb-fade-in");
            icon.classList.add("gb-fade-out");
            icon.remove()
        })
    }

    else if (releaseDate) {
        releaseDateIcons.forEach((icon) => {
            icon.classList.remove("gb-fade-in");
            icon.classList.add("gb-fade-out");
            icon.remove()
        })
    }

    chrome.runtime.sendMessage({ "album_missingInfo_restyle": true });
}

export function restyleMissingInfo() {
    var peopleIcons = document.querySelectorAll('.people-icon');
    var bioIcons = document.querySelectorAll('.bio-icon');
    var releaseDateIcons = document.querySelectorAll('.release-date-icon');

    // make sure at least one of the icons is present
    // if not, wait until they are
    while (peopleIcons.length == 0 && bioIcons.length == 0 && releaseDateIcons.length == 0) {
        setTimeout(() => {
            peopleIcons = document.querySelectorAll('.people-icon');
            bioIcons = document.querySelectorAll('.bio-icon');
            releaseDateIcons = document.querySelectorAll('.release-date-icon');
        }, 100);
    }

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

export function appendIcon() {

    let hashmap;

    const userValidation = () => {
        const disable_add_tag = (placeholderText) => {
            // change the placeholder of the add-tags box to warn the user about the lower than 100 IQ
            document.getElementById("gb-add-tags").placeholder = placeholderText;
        }

        const user_picture = document.getElementsByClassName("header-user_avatar clipped_background_image")[0];

        // check if user is logged in
        if (user_picture) {
            // access user_picture's parent element
            const user_picture_parent = user_picture.parentElement;
            // make sure the user's iq is high enough to add a tag
            if (parseInt(user_picture_parent.children[1].innerHTML.replace(" IQ", "").replaceAll(",", "")) < 100) {
                disable_add_tag("You need at least 100 IQ to add tags");
            }
        }

        else {
            disable_add_tag("You need to be logged in to add tags");
        }
    }

    const buttonBackground = document.getElementsByClassName("column_layout-column_span column_layout-column_span--three_quarter column_layout-column_span--force_padding")[0]
    const icon_elem = document.createElement('img');
    icon_elem.className = "extension-icon";
    icon_elem.setAttribute("alt", "genius bot extension icon");
    icon_elem.setAttribute("title", "Alt + G");
    icon_elem.src = chrome.runtime.getURL("src/images/icons/2/128x128.png");
    buttonBackground.appendChild(icon_elem);



    document.getElementsByClassName("extension-icon")[0].addEventListener("click", () => {

        window.scrollTo(0, 0);

        // creating the popup window
        const popupDiv = document.createElement("dialog");
        popupDiv.setAttribute("open", "");
        popupDiv.classList.add("blured-background", "gb-fade-in");

        const popupBox = document.createElement("div");
        popupBox.classList.add("extension-box", "gb-zoom-in");
        popupDiv.appendChild(popupBox);

        const closePopup = document.createElement('img');
        closePopup.className = "close-icon";
        closePopup.src = chrome.runtime.getURL("/src/images/other/closeIcon.png");
        closePopup.setAttribute("onmouseover", "this.src=\'" + chrome.runtime.getURL("/src/images/other/closeIconX.png") + "\'");
        closePopup.setAttribute("onmouseout", "this.src=\'" + chrome.runtime.getURL("/src/images/other/closeIcon.png") + "\'");
        closePopup.setAttribute("title", "Esc");

        //alert before closing the popup
        closePopup.addEventListener("click", () => {
            if (confirm("If you've made changes, they won't save.\nAre you sure you want to close this window?")) {
                document.getElementsByClassName("extension-box")[0].classList.add("gb-zoom-out");
                document.getElementsByClassName("blured-background")[0].classList.add("gb-fade-out");
                document.body.classList.remove('disable-scrolling');
                setTimeout(() => { document.getElementsByClassName("blured-background")[0].remove(); }, 400);
            }
        });

        popupBox.appendChild(closePopup);

        const addTagsTitle = document.createElement('div');
        addTagsTitle.classList.add("add-tags-title");
        addTagsTitle.innerHTML = "Add tags for each song";
        popupBox.appendChild(addTagsTitle);

        //const addTagsSubTitle = document.createElement('div');
        //addTagsSubTitle.classList.add("add-tags-sub-title");
        //addTagsSubTitle.innerHTML = "Notice: You can now add only one tag at a time,<br>but soon it will be how much you want to.";
        //popupBox.appendChild(addTagsSubTitle);

        const addTags = document.createElement('input');
        addTags.classList.add("add-tags", "rcorners", "gb-textarea");
        addTags.setAttribute("id", "gb-add-tags");
        addTags.setAttribute("type", "text");
        addTags.setAttribute("placeholder", "Tags");
        addTags.setAttribute("spellcheck", "false");
        addTags.setAttribute("data-gramm", "false");
        popupBox.appendChild(addTags);

        const addCreditsTitle = document.createElement('div');
        addCreditsTitle.classList.add("add-credits-title");
        addCreditsTitle.innerHTML = "Add credits for each song";
        popupBox.appendChild(addCreditsTitle);

        const addCredits_role = document.createElement('input');
        addCredits_role.classList.add("add-credits", "role", "rcorners", "gb-textarea");
        addTags.setAttribute("type", "text");
        addCredits_role.setAttribute("placeholder", "Role");
        addCredits_role.setAttribute("spellcheck", "false");
        addCredits_role.setAttribute("data-gramm", "false");
        addCredits_role.setAttribute("disabled", "");
        popupBox.appendChild(addCredits_role);

        const addCredits_artist = document.createElement('input');
        addCredits_artist.classList.add("add-credits", "artist", "rcorners", "gb-textarea");
        addTags.setAttribute("type", "text");
        addCredits_artist.setAttribute("placeholder", "Artist");
        addCredits_artist.setAttribute("spellcheck", "false");
        addCredits_artist.setAttribute("data-gramm", "false");
        // disable it
        addCredits_artist.setAttribute("disabled", "");
        popupBox.appendChild(addCredits_artist);

        const addCredits_add = document.createElement('input');
        addCredits_role.classList.add("add-credits", "role", "rcorners", "gb-textarea");
        addTags.setAttribute("type", "text");
        addCredits_role.setAttribute("placeholder", "Role");
        addCredits_role.setAttribute("spellcheck", "false");
        addCredits_role.setAttribute("data-gramm", "false");
        popupBox.appendChild(addCredits_role);

        const autolinkArtworkContainer = document.createElement("div");
        autolinkArtworkContainer.classList.add("autolink-artwork-icon-container", "rcorners");

        const autolinkArtwork = document.createElement("img");
        autolinkArtwork.classList.add("autolink-artwork-icon");
        autolinkArtwork.src = chrome.runtime.getURL("/src/images/artwork/512x512.png");
        autolinkArtworkContainer.appendChild(autolinkArtwork);

        const autolinkArtworkTitle = document.createElement('div');
        autolinkArtworkTitle.classList.add("autolink-artwork-title");
        autolinkArtworkTitle.innerHTML = "Autolink<br>artwork";
        autolinkArtworkContainer.appendChild(autolinkArtworkTitle);

        autolinkArtworkContainer.addEventListener("click", () => {
            if (!document.getElementsByClassName("artwork-images-stack")[0]) {
                chrome.storage.local.get(["album_artwork_results"], (result) => {
                    autolinkArtworkContainer.style.backgroundColor = "#333a3c";
                    autolinkArtworkContainer.style.cursor = "default";
                    autolinkArtwork.style.transform = "scale(1) rotate(0deg)";
                    autolinkArtworkTitle.style.transform = "scale(1)";

                    result = result.album_artwork_results;

                    // set the result var to error if no artwork is found
                    if (result.length == 0) {
                        chrome.storage.local.set({ "album_artwork": { "type": "error", "output": "No artwork found" } });
                    }

                    // create a images stack element which contains every image in result
                    const imagesStack = document.createElement("div");
                    imagesStack.classList.add("artwork-images-stack", "gb-animate-right");

                    for (let i = 0; i < result.length; i++) {
                        const container = document.createElement("div");
                        container.classList.add("artwork-image-container");

                        const image = document.createElement("img");
                        image.classList.add("artwork-image");
                        image.src = result[i];
                        container.insertAdjacentElement('afterbegin', image);

                        // add a overlay to the image with v and x buttons to accept or reject the image
                        // if image got accepted, set the image to the local storage and delete the stack element
                        // if image got rejected, delete the image element from the stack
                        // take the images for the buttons from the images folder
                        const overlay = document.createElement("div");
                        overlay.classList.add("overlay");

                        $(overlay).hover(() => {
                            overlay.style.backgroundColor = $(".v-button").length == $(".artwork-image").length ? "rgb(0, 0, 0, 0.2)" : "rgb(33, 236, 138, 0.4)";
                        });
                        $(overlay).mouseleave(() => {
                            overlay.style.backgroundColor = $(".v-button").length == $(".artwork-image").length ? "rgb(0, 0, 0, 0.0)" : "rgb(33, 236, 138, 0.0)";
                        });

                        const vButton = document.createElement("img");
                        vButton.classList.add("v-button");
                        vButton.src = chrome.runtime.getURL("/src/images/other/v.png");

                        $(vButton).hover(() => {
                            overlay.style.backgroundColor = "rgb(33, 236, 138, 0.1)";
                        });
                        $(vButton).mouseleave(() => {
                            overlay.style.backgroundColor = "rgb(0, 0, 0, 0.2)";
                        });

                        vButton.addEventListener("click", function () {
                            chrome.storage.local.set({ "album_artwork": { "type": "success", "output": result[i] } });

                            $(".v-button").css("opacity", "0.0");
                            $(".x-button").css("opacity", "0.0");

                            setTimeout(() => {
                                $(".v-button").remove();
                                $(".x-button").remove();
                            }, 400);

                            overlay.style.backgroundColor = "rgb(33, 236, 138, 0.4)";
                            setTimeout(() => {
                                overlay.style.backgroundColor = "rgb(33, 236, 138, 0.0)";
                            }, 400);
                            setTimeout(() => {
                                overlay.style.backgroundColor = "rgb(33, 236, 138, 0.4)";
                            }, 400);
                            setTimeout(() => {
                                overlay.style.backgroundColor = "rgb(33, 236, 138, 0.0)";
                            }, 400);
                        });

                        overlay.insertAdjacentElement('afterbegin', vButton);

                        const xButton = document.createElement("img");
                        xButton.classList.add("x-button");
                        xButton.src = chrome.runtime.getURL("/src/images/other/x.png");

                        $(xButton).hover(() => {
                            overlay.style.backgroundColor = "rgb(252, 88, 84, 0.1)";
                        });
                        $(xButton).mouseleave(() => {
                            overlay.style.backgroundColor = "rgb(0, 0, 0, 0.2)";
                        });

                        xButton.addEventListener("click", function () {
                            container.style.opacity = "0";
                            container.style.transform = "translateY(25%)";
                            overlay.style.backgroundColor = "rgb(252, 88, 84, 0.3)";
                            // wait for animation to finish before removing the element
                            setTimeout(() => { container.remove(); }, 400);
                            // if its the last image, set the local storage to error
                            if (imagesStack.childNodes.length == 0) {
                                chrome.storage.local.set({ "album_artwork": { "type": "error", "output": "No artwork found" } });
                            }
                        });
                        overlay.insertAdjacentElement('afterbegin', xButton);

                        container.insertAdjacentElement('afterbegin', overlay);

                        imagesStack.insertAdjacentElement('afterbegin', container);
                    }

                    // at the end of the stack element, add a error message
                    const errorContainer = document.createElement("div");
                    errorContainer.classList.add("error-container");

                    const errorText = document.createElement("div");
                    errorText.classList.add("error-text");
                    errorText.innerHTML = "No artwork<br>found";
                    errorContainer.insertAdjacentElement('afterbegin', errorText);

                    imagesStack.insertAdjacentElement('afterbegin', errorContainer);

                    autolinkArtworkContainer.insertAdjacentElement('afterbegin', imagesStack);
                });
            }
        });

        popupBox.appendChild(autolinkArtworkContainer);

        const saveButton = document.createElement('input');
        saveButton.classList.add("gb-save-button", "rcorners");
        saveButton.setAttribute("value", "Save");
        saveButton.setAttribute("readonly", "readonly");
        saveButton.setAttribute("title", "Alt + S");

        //disable text selection in save button
        saveButton.addEventListener("mousedown", function (event) {
            event.preventDefault();
        });

        saveButton.addEventListener("click", () => {
            chrome.runtime.sendMessage({ 'album_saveEverything': [true] });
            document.getElementsByClassName("extension-box")[0].classList.add("gb-zoom-out");
            document.getElementsByClassName("blured-background")[0].classList.add("gb-fade-out");
            document.body.classList.remove('disable-scrolling');
            setTimeout(() => { document.getElementsByClassName("blured-background")[0].remove(); }, 400);
        })

        popupBox.appendChild(saveButton);

        document.body.appendChild(popupDiv);

        $('body').addClass('disable-scrolling');

        userValidation();

        document.addEventListener("click", () => {
            if (!hashmap && !!document.getElementById("tagsList")) {
                hashmap = Array.prototype.reduce.call(document.getElementById("tagsList").options, (obj, option) => {
                    if (!obj[option.value.toLowerCase()]) {
                        obj[option.value.toLowerCase()] = option.value;
                    }
                    return obj;
                }, {});
            }
        })

        var tagify_tagsWhitelist = $('datalist#tagsList option').map(function (_, o) {
            let searchByStr;

            switch (o.value) {
                case "Hip-Hop":
                    searchByStr = "hip hop, genius hip hop, genius hip-hop, hip hop genius, hip-hop genius";
            }

            return {
                value: o.value,
                searchBy: searchByStr
            };
        }).get();

        var tagify_tags = new Tagify(document.getElementById("gb-add-tags"), {
            delimiters: null,
            templates: {
                tag: function (tagData) {
                    try {
                        return `<tag title='${tagData.value}' contenteditable='false' spellcheck="false" class='tagify__tag ${tagData.class ? tagData.class : ""}' ${this.getAttributes(tagData)}>
                                <x title='remove tag' class='tagify__tag__removeBtn'></x>
                                <div>
                                    <span class='tagify__tag-text'>${tagData.value}</span>
                                </div>
                            </tag>`
                    }
                    catch (err) { console.error(err) }
                },

                dropdownItem: function (tagData) {
                    try {
                        return `<div ${this.getAttributes(tagData)} class='tagify__dropdown__item ${tagData.class ? tagData.class : ""}' >
                                    <span>${tagData.value}</span>
                                </div>`
                    }
                    catch (err) { console.error(err) }
                }
            },
            enforceWhitelist: true,
            whitelist: tagify_tagsWhitelist,
            transformTag: transformTag,
            dropdown: {
                enabled: 0,
                classname: 'tags-look',
                maxItems: 20
            }
        })

        function getRandomColor() {
            function rand(min, max) {
                return min + Math.random() * (max - min);
            }

            var h = rand(1, 360) | 0,
                s = rand(40, 70) | 0,
                l = rand(65, 72) | 0;

            return 'hsl(' + h + ',' + s + '%,' + l + '%)';
        }

        function transformTag(tagData) {
            tagData.color = getRandomColor();
            tagData.style = "--tag-bg:" + tagData.color;

            tagData.value = tagData.value.trim().replace(/  +/g, ' ');
            switch (tagData.value.toLowerCase()) {
                case "pop":
                case "genius pop":
                    tagData.value = "Pop Genius";
                    break;
                case "rap":
                case "genius rap":
                    tagData.value = "Rap Genius";
                    break;
                case "rock":
                case "genius rock":
                    tagData.value = "Rock Genius";
                    break;
                case "r&b":
                case "genius r&b":
                    tagData.value = "R&B Genius";
                    break;
                case "country":
                case "genius country":
                    tagData.value = "Country Genius";
                    break;
                case "hip hop":
                case "genius hip hop":
                case "genius hip-hop":
                case "hip hop genius":
                case "hip-hop genius":
                    tagData.value = "Hip-Hop";
                    break;
            }
        }

        tagify_tags.on('input', function (e) {
            document.getElementsByClassName("blured-background")[0].appendChild(document.getElementsByClassName("tagify__dropdown")[0]);
        })

        if (!!document.getElementById("tagsList")) {
            hashmap = Array.prototype.reduce.call(document.getElementById("tagsList").options, (obj, option) => {
                if (!obj[option.value.toLowerCase()]) {
                    obj[option.value.toLowerCase()] = option.value;
                }
                return obj;
            }, {});
        }

        document.getElementsByTagName("tags")[0].addEventListener("click", () => {
            // wait for the dropdown to be rendered
            setTimeout(() => {
                document.getElementsByClassName("blured-background")[0].appendChild(document.getElementsByClassName("tagify__dropdown")[0]);
            }, 0.1);
        })


    });

    //alow to open & close the popup with shortcuts
    window.onkeyup = () => {
        switch (event.key) {
            case "Escape":
                if (!!document.getElementsByClassName("close-icon").length) {
                    document.getElementsByClassName("close-icon")[0].click();
                }
                break;
            case "g":
                if (event.altKey && !document.getElementsByClassName("blured-background").length) {
                    document.getElementsByClassName("extension-icon")[0].click();
                }
                break;
            case "s":
                if (event.altKey && !!document.getElementsByClassName("gb-save-button").length) {
                    document.getElementsByClassName("gb-save-button")[0].click();
                }
                break;
            default:
                break;
        }
    }
}

export async function autolinkArtwork() {

    console.log("autolinkArtwork");

    let itunesResult = "";

    new Promise((resolve, reject) => {
        // TODO: add support for other non-english languages

        const containsHebrew = (text) => {
            return /[א-ת]/.test(text);
        }

        let albumTitle = document.getElementsByClassName("header_with_cover_art-primary_info-title header_with_cover_art-primary_info-title--white")[0].innerText;
        let artistName = document.getElementsByClassName("header_with_cover_art-primary_info-primary_artist")[0].innerHTML;
        let nameToSearch = [albumTitle, artistName];

        for (let i = 0; i < nameToSearch.length; i++) {
            if (containsHebrew(nameToSearch[i])) {
                const langsParts = nameToSearch[i].split(" - ")
                nameToSearch[i] = langsParts[i == 0 ? 1 : 0];
            }
        }

        nameToSearch = nameToSearch[0]//.join(" ");

        $.ajax({

            type: "GET",
            crossDomain: true,
            url: 'https://itunesartwork.bendodson.com/api.php',
            data: { query: nameToSearch, entity: 'album', country: 'us', type: 'request' },
            dataType: 'json'

        }).done(function (data) {
            $.ajax({

                type: "GET",
                crossDomain: true,
                url: data.url,
                data: {},
                dataType: 'json'

            }).done(function (data) {
                $.ajax({

                    type: "POST",
                    crossDomain: true,
                    url: 'https://itunesartwork.bendodson.com/api.php',
                    data: { json: JSON.stringify(data), type: 'data', entity: 'album' },
                    dataType: 'json'

                }).done(function (data) {
                    if (!data.error && data.length) {
                        for (var i = 0; i < data.length; i++) {
                            data[i] = data[i].url.replace("/600x600bb.jpg", "/1000x1000-999.jpg");
                        };
                        itunesResult = data;
                    }
                    resolve();
                });
            });
        })
    }).then(() => {
        chrome.storage.local.set({ "album_artwork_results": itunesResult });
        return itunesResult;
    });
}

export async function saveEverything() {
    const numOfSongs = Array.from(
        document.getElementsByClassName("chart_row-number_container-number chart_row-number_container-number--gray")
    ).length;

    const albumSongs = Array.from(
        document.getElementsByClassName("u-display_block")
    ).slice(0, numOfSongs);

    const tagNames = $(".extension-box tag")
        .map(function () {
            return $(this).attr("title");
        })
        .get();

    let everythingIsSaved = false;

    const progressBar = document.createElement("div");
    progressBar.id = "progressBar";
    progressBar.style.left = "0";
    progressBar.style.width = "0%";
    progressBar.style.height = "3px";
    progressBar.style.backgroundColor = "#4CAF50";
    progressBar.style.zIndex = "10000";
    progressBar.style.height = "10px";

    // insert after the leement with the tag name header-with-cover-art
    $("header-with-cover-art").after(progressBar);

    console.log("progressBar", progressBar);

    albumSongs.forEach(async (song) => {
        const iframe = document.createElement("iframe");
        iframe.classList.add("extension-song");
        iframe.sandbox = "allow-scripts allow-same-origin";
        iframe.style.display = "none";
        iframe.src = song.href;
        document.body.appendChild(iframe);

        await new Promise((resolve) => (iframe.onload = resolve));

        let width = progressBar.style.width;
        let newWidth = `${(parseInt(width, 10) + (1 / albumSongs.length / 3) * 100)}%`;
        progressBar.style.width = newWidth;


        while (!iframe.contentWindow.document.querySelector("button.SmallButton__Container-mg33hl-0")) {
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

        const tagsForThisSong = tagNames.filter((e) => !existingTags.includes(e));
        console.log(
            "song: ",
            song.innerText,
            " tags: ",
            tagNames,
            " existing tags: ",
            existingTags,
            " tags for this song: ",
            tagsForThisSong
        );

        for (const tag of tagsForThisSong) {
            const input = iframe.contentWindow.document.querySelector("input#react-select-7-input");
            input.value = tag;
            const event = new InputEvent("input", {
                bubbles: true,
                data: tag,
            });
            input.dispatchEvent(event);

            while (!iframe.contentWindow.document.querySelectorAll("div.css-47gho1-option").length) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            const options = iframe.contentWindow.document.querySelectorAll("div.css-47gho1-option");
            options[0].click();
        }

        let width1 = progressBar.style.width;
        let newWidth1 = `${(parseInt(width1, 10) + (2 / albumSongs.length / 3) * 100)}%`;
        progressBar.style.width = newWidth1;

        // if it's the last song, set everythingIsSaved to true
        if (song === albumSongs[albumSongs.length - 1]) {
            everythingIsSaved = true;
        }

        while (iframe.contentWindow.document.querySelector("button.IconButton__Button-z735f6-0.fsRAyK.Modaldesktop__SaveIconButton-sc-1e03w42-7.jyxyfC").disabled) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        iframe.contentWindow.document.querySelector("button.IconButton__Button-z735f6-0.fsRAyK.Modaldesktop__SaveIconButton-sc-1e03w42-7.jyxyfC").click();

        await new Promise((resolve) => setTimeout(resolve, 1000));
        iframe.remove();
    });

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
    // then add a "on/off" button to it which will add the song as the next song in the queue if turned on
    // save to the local storage the state of the button (on/off) [and if it's already true, change the button to on]

    // in the same observer, look for the "Add to queue" button (it's have the class "ac_even" or "ac_odd") and add a click event listener to it
    // if the button is on, add the song as the next song in the queue
    // for adding the song as the next song in the queue, click on the button ".button--unstyled" which is child of an elem with the classes "editable_tracklist-row-number-edit_icon editable_tracklist-row-number-edit_icon--no_number"
    // then, write in the input with the class "square_input editable_tracklist-row-number-input u-x_small_right_margin ng-pristine ng-valid ng-empty ng-touched" the length-3 of $(".editable_tracklist-row-number")
    // then, click on the first element with the classes "inline_icon inline_icon--gray u-x_small_right_margin u-clickable"

    let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
                let addedElem = mutation.addedNodes[0];
                console.log("addedElem: ", addedElem.classList);
                let input = addedElem.querySelector("input.square_input.square_input--full_width.ac_input");

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
                    checkbox.classList.add("add-song-as-next-checkbox", "chkboxm");
                    checkbox.type = "checkbox";
                    checkbox.id = "add-song-as-next-checkbox";
                    $(container).append(checkbox);
                    $(container).append(label);
                    $(input).parent().append(container);

                    chrome.storage.local.get("add_song_as_next", function (result) {
                        if (result.add_song_as_next) {
                            checkbox.checked = true;
                        }
                    });

                    checkbox.addEventListener("change", function () {
                        chrome.storage.local.set({ "add_song_as_next": checkbox.checked });
                    });
                }

                if (addedElem.classList.contains("ac_even") || addedElem.classList.contains("ac_odd")) {
                    console.log("found add to queue button");
                    let addToQueueButton = addedElem;
                    chrome.storage.local.get("add_song_as_next", function (result) {
                        if (result.add_song_as_next) {
                            $(addToQueueButton).on("click", function () {
                                setTimeout(function () {
                                    // save the last word in the innerText of ".text_label text_label--gray" element into the var "songNum"
                                    // the ".text_label text_label--gray" should be a child of the ".tracklist-row__number" element without "ng-repeat" attribute ot "ng-if" attribute
                                    let songNum = $("div.text_label.text_label--gray").not("[ng-repeat]").not("[ng-if]").first().text().split(" ").pop();
                                    let buttonsLength = $(".button--unstyled").length;
                                    let button = $(".button--unstyled")[buttonsLength - 1];
                                    button.click();
                                    let input = document.querySelector("input.square_input.editable_tracklist-row-number-input.u-x_small_right_margin.ng-pristine.ng-valid");
                                    setTimeout(function () {
                                        input.classList.remove("ng-empty");
                                        input.classList.add("ng-not-empty");
                                        input.value = songNum;
                                        let event = new Event("input", { bubbles: true });
                                        input.dispatchEvent(event);
                                    }, 5);
                                    setTimeout(function () {
                                        document.querySelectorAll(".button--unstyled")[buttonsLength].click();
                                    }, 5);
                                }, 5);
                            });
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