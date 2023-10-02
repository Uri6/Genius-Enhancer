import $ from "jquery";

const body = $("body");

const templates = {
    "Strikes": {
        "offense": [
            "Mass-Downvoting",
            "Harassment",
            "Hate Speech",
            "Trolling",
            "Spamming",
            "Derailing or Hijacking",
            "Creating Alternate Accounts",
            "Advertisements, Leaks, or Illegal Content",
            "Improperly Sourcing Snippets",
            "Shitposting"
        ],
        "strikeStatus": [
            "Warning",
            "Strike 1",
            "Strike 2",
            "Ban"
        ]
    },
    "Post-Warning Perma": {
        "offense": [
            "Uploading Harmful Content",
            "IQ Gaming",
            "Inappropriate & Trolling Annotations",
            "Plagiarism",
            "Song Page Self-Promotion",
            "Account Sharing",
            "Offensive Usernames & Avatars",
            "Uploading Leaks"
        ],
        "postPermaStatus": [
            "Warning",
            "Ban"
        ]
    },
    "Immediate Perma": {
        "offense": [
            "Pageview Boosting",
            "Song Page Tampering",
            "Song Page Spamming",
            "Sharing Private Information & Phishing",
            "NSFW Content",
            "Subversive Alternate Account Creation",
            "Severe Harassment",
            "Impersonating an Artist"
        ]
    }
};

const additionalOptions = {
    "Offensive Profile Content": [
        "Avatar",
        "Username",
        "Bio"
    ]
};

if (!$("#ge-theme-toggle").length && $(".header-actions").length) {
    const darkModeToogle = $("<input>", {
        id: "ge-theme-toggle",
        class: "ge-theme-toggle",
        type: "checkbox",
        on: {
            click: function() {
                body.addClass("ge-theme-transition");

                if ($(this).is(":checked")) {
                    body.addClass("ge-dark-mode");
                    global.browser.storage.local.set({ "darkMode": true });
                } else {
                    body.removeClass("ge-dark-mode");
                    global.browser.storage.local.set({ "darkMode": false });
                }

                setTimeout(() => {
                    body.removeClass("ge-theme-transition");
                }, 200);
            }
        }
    })
        .prependTo($(".header-actions"));

    global.browser.storage.local.get("darkMode", (res) => {
        if (res.darkMode) {
            darkModeToogle.prop("checked", true);
            body.addClass("ge-dark-mode");
            body.addClass("ge-theme-transition");
            setTimeout(() => {
                $("body").removeClass("ge-theme-transition");
            }, 200);
        }
    });
}

const subNav = $(".header-nav_menu, .PageHeaderdesktop__Subnavigation-bhx5ui-6");

const logo = $(".logo_container, .PageHeaderLogo__Link-sc-175tsd3-0");
subNav.insertAfter(logo);

const newItems = [{ title: "Forums", href: "https://genius.com/forums" }, {
    title: "Add Song",
    href: "https://genius.com/songs/new"
}, { title: "Guides", href: "https://genius.com/albums/Genius/Guides" }, {
    title: "GeniusGraph",
    href: "https://larsbutnotleast.xyz/genius"
}];

// Recreate the header menu content
const $headerNavMenu = $(".header-nav_menu, .PageHeaderdesktop__Subnavigation-bhx5ui-6");
const $headerMenuItems = $headerNavMenu.find("header-menu-item");
const $menuItems = $headerMenuItems.length ? $headerMenuItems : $headerNavMenu.find("a");
const onHomePage = !$headerNavMenu.hasClass("header-nav_menu");

if ($menuItems.length > 0 && $(".ge-inject").length < 1) {
    $menuItems.remove();

    newItems.forEach((item) => {
        const $item = $(`<a class="nav_menu-link ng-binding PageHeaderdesktop__Link-bhx5ui-4 jQULAr" href="${item.href}">${item.title}</a>`);
        if (onHomePage) {
            $headerNavMenu.append($item);
        } else {
            $headerNavMenu.append(`<li class="nav_menu-item ng-scope ge-inject">${$item[0].outerHTML.replace("class=\"nav_menu-link ng-binding PageHeaderdesktop__Link-bhx5ui-4 jQULAr\"", "class=\"nav_menu-link ng-binding\"")}</li>`);
        }
    });
}

// if there's an element with the class "lyrics_controls", when it sticky add the class "sticky" to this element
// make sure that the class "sticky" is removed when the element is not sticky
const lyricsControls = $(".lyrics_controls");
if (lyricsControls.length > 0) {
    let sticky = lyricsControls.offset().top;
    $(window).on("scroll", () => {
        if ($(window).scrollTop() > sticky) {
            lyricsControls.addClass("sticky");
        } else {
            lyricsControls.removeClass("sticky");
        }
    });
}

// clean the search bar from the "Search" text when not focused
// the search bar is the element with the classes "PageHeaderSearchdesktop__Input-eom9vk-2 gajVFV" or "quick_search search quick_search--header"
let searchBar = $(".PageHeaderSearchdesktop__Input-eom9vk-2.gajVFV");
if (searchBar.length) {
    searchBar = $(".quick_search.search.quick_search--header");
}
searchBar.on("blur", () => {
    searchBar.val("");
});

$(".header-actions *").on("click", () => {
    $(".search_results_autocomplete_container").addClass("ng-hide");
});

const feedbackButton = $("a[href='/feedback/new']");
const iosChartbeat = $("a[href='/chartbeat?ios=1']");

feedbackButton?.remove();
iosChartbeat?.remove();

const $modalWindow = $(".modal_window");

$(document).on("DOMNodeInserted", (e) => {
    const $target = $(e.target);

    if ($target.hasClass("feed_dropdown--left_align")) {
        $target.removeClass("feed_dropdown--left_align");
    }

    if (e.target.tagName === "path" && e.target.getAttribute("d") === "M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39" && e.target.parentElement.classList.contains("global_search-search_icon")) {
        e.target.setAttribute("d", "M21.48 20.18L14.8 13.5a8.38 8.38 0 1 0-1.43 1.4l6.69 6.69zM2 8.31a6.32 6.32 0 1 1 6.32 6.32A6.32 6.32 0 0 1 2 8.31z");
        e.target.parentElement.classList.add("global_search-search_icon");
    }

    setTimeout(() => {
        if ($target.hasClass("modal_window") && $target.find(".modal_window-content").length > 0 && ($target.find(".modal_window-content").find("conversation-with-user").length > 0 || $target.find(".modal_window-content").find("conversation-messages").length > 0)) {
            body.removeClass("u-noscroll u-dark_overlay");
            $target.css("pointer-events", "none");
            $target.find(".modal_window-content").css("pointer-events", "auto");

            if ($modalWindow.length > 1) {
                $modalWindow.first().remove();
            }

            const oldCloseButton = $target.find(".modal_window-close_button");
            if (oldCloseButton.length > 0) {
                oldCloseButton.hide();
            }

            const closeButton = document.createElement("img");
            closeButton.className = "modal_window-close_button";
            closeButton.src = global.browser.runtime.getURL("/src/imgs/other/closeIcon.png");
            closeButton.setAttribute("onmouseover", `this.src='${global.browser.runtime.getURL("/src/imgs/other/closeIconX.png")}'`);
            closeButton.setAttribute("onmouseout", `this.src='${global.browser.runtime.getURL("/src/imgs/other/closeIcon.png")}'`);
            closeButton.setAttribute("title", "Esc");

            closeButton.addEventListener("click", () => {
                oldCloseButton.trigger("click");
            });

            $target.find(".modal_window-content").prepend(closeButton);

            $target.find(".modal_window-content").draggable({
                handle: ".modal_window-header", containment: "window", scroll: false
            });

            const $buttonsRow = $target.find("form>.u-bottom_margin:has(span)");

            if ($buttonsRow.length > 0 && $buttonsRow.find(".ge-magic-button").length === 0) {
                const svgIcon = global.browser.runtime.getURL("/src/imgs/magicWand/colorful.svg");
                const magicButton = $("<span>", {
                    class: "text_label text_label--no_margin u-small_horizontal_margins text_label--purple text_label--button ge-magic-button"
                })
                    .append($("<img>", {
                        src: svgIcon
                    }))
                    .appendTo($buttonsRow);

                $("<div>", {
                    class: "ge-message-template-chooser",
                    style: "display: none;"
                })
                    .appendTo(magicButton);

                magicButton.on("click", () => {
                    const $formContainer = $(".square_input.conversation-message_textarea").parent();
                    $formContainer.find("#punishmentForm").remove();

                    const $form = $("<form>", {
                        id: "punishmentForm"
                    }).insertBefore($(".square_input.conversation-message_textarea"));

                    const $typeSelect = $("<select>", {
                        id: "typeSelect",
                        html: "<option selected hidden>Choose Punishment Type</option>"
                    }).appendTo($form);

                    Object.keys(templates).forEach(type => {
                        $typeSelect.append(new Option(type, type));
                    });

                    const $offenseSelect = $("<select>", {
                        id: "offenseSelect",
                        style: "display: none;",
                        html: "<option selected hidden>Choose Offense</option>"
                    }).appendTo($form);

                    const $statusSelect = $("<select>", {
                        id: "statusSelect",
                        style: "display: none;",
                        html: "<option selected hidden>Choose Status</option>"
                    }).appendTo($form);

                    const $additionalSelect = $("<select>", {
                        id: "additionalSelect",
                        style: "display: none;",
                        html: "<option selected hidden>Choose Offensive Content</option>"
                    }).appendTo($form);

                    const $plagiarismInput = $("<input>", {
                        id: "plagiarismSource",
                        type: "text",
                        placeholder: "Enter Plagiarism Source",
                        style: "display: none;"
                    }).appendTo($form);

                    $("<input>", {
                        type: "submit",
                        value: "Generate"
                    }).appendTo($form);

                    $typeSelect.change(() => {
                        const selectedType = $typeSelect.val();
                        $offenseSelect.empty().append("<option selected hidden>Choose Offense</option>");
                        templates[selectedType].offense.forEach(offense => {
                            $offenseSelect.append(new Option(offense, offense));
                        });
                        $offenseSelect.show();
                    });

                    $offenseSelect.change(() => {
                        const selectedType = $typeSelect.val();
                        const selectedOffense = $offenseSelect.val();
                        if (templates[selectedType].hasOwnProperty("strikeStatus") || templates[selectedType].hasOwnProperty("postPermaStatus")) {
                            const statusOptions = templates[selectedType].hasOwnProperty("strikeStatus") ? templates[selectedType].strikeStatus : templates[selectedType].postPermaStatus;
                            $statusSelect.empty().append("<option selected hidden>Choose Status</option>");
                            statusOptions.forEach(status => {
                                $statusSelect.append(new Option(status, status));
                            });
                            $statusSelect.show();
                        }

                        if (selectedType === "Post-Warning Perma" && selectedOffense === "Offensive Usernames & Avatars") {
                            $additionalSelect.empty().append("<option selected hidden>Choose Offensive Content</option>");
                            additionalOptions["Offensive Profile Content"].forEach(option => {
                                $additionalSelect.append(new Option(option, option));
                            });
                            $additionalSelect.show();
                        } else {
                            $additionalSelect.hide();
                        }

                        if (selectedType === "Post-Warning Perma" && selectedOffense === "Plagiarism") {
                            $plagiarismInput.show();
                        } else {
                            $plagiarismInput.hide();
                        }
                    });

                    $form.submit((event) => {
                        event.preventDefault();

                        let payload = {
                            type: $typeSelect.val(),
                            offense: $offenseSelect.val()
                        };

                        const selectedType = $typeSelect.val();
                        if (templates[selectedType].hasOwnProperty("strikeStatus")) {
                            payload["strikeStatus"] = $statusSelect.val();
                        }
                        if (templates[selectedType].hasOwnProperty("postPermaStatus")) {
                            payload["postPermaStatus"] = $statusSelect.val();
                        }
                        if (selectedType === "Post-Warning Perma" && payload.offense === "Offensive Usernames & Avatars") {
                            payload["inappropriateUC"] = $additionalSelect.val();
                        }
                        if (selectedType === "Post-Warning Perma" && payload.offense === "Plagiarism") {
                            payload["plagiarismSource"] = $plagiarismInput.val();
                        }

                        const requestOptions = {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                        };

                        fetch("https://backend.rdil.rocks/genius/templates/generate", requestOptions)
                            .then(response => response.text())
                            .then(result => {
                                const entities = {
                                    "&amp;": "&",
                                    "&lt;": "<",
                                    "&gt;": ">",
                                    "&quot;": "\"",
                                    "&#39;": "'",
                                    "&#x2F;": "/",
                                    "&#x60;": "`",
                                    "&#x3D;": "="
                                };

                                return result.replace(/&(amp|lt|gt|quot|#39|#x2F|#x60|#x3D);/g, function(match, entity) {
                                    return entities[match];
                                });
                            })
                            .then(cleanedResult => {
                                $(".square_input.conversation-message_textarea").val(cleanedResult);
                                const event = new Event("change", { bubbles: true });
                                $(".square_input.conversation-message_textarea")[0].dispatchEvent(event);

                                $form.remove();
                            });
                    });
                });
            }
        }
    }, 1);
});
