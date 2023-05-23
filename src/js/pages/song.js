/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer-Beta/blob/main/LICENSE.md
 */

export async function handleSongPage(tabId) {
    await chrome.scripting.insertCSS({
        target: {
            tabId: tabId
        },
        files: ["./src/css/song.css"]
    });

    await chrome.scripting.executeScript({
        target: {
            tabId: tabId
        },
        files: ["/lib/geniuspot/geniuspot.min.js"]
    });

    chrome.storage.local.get("ModernTextEditor", (res) => {
        if (res.ModernTextEditor) {
            chrome.scripting.executeScript({
                target: {
                    tabId: tabId
                },
                func: (() => {
                    chrome.runtime.sendMessage({
                        "song_modernTextEditor": [true]
                    });
                })
            });
        }
    });

    await chrome.scripting.executeScript({
        target: {
            tabId: tabId
        },
        func: async () => {
            // Show the artwork res when hovering over the artwork
            const artworkElem = $(".SizedImage__Image-sc-1hyeaua-1");

            if (artworkElem.length) {
                let imageUrl = artworkElem.attr("src");

                if (imageUrl.includes("https://t2.genius.com/unsafe/")) {
                    // Find the index of the last occurrence of "/"
                    const endIndex = imageUrl.lastIndexOf("/");

                    // Remove the prefix from the image URL & decode any HTML encoded characters in the URL
                    imageUrl = decodeURIComponent(imageUrl.slice(endIndex + 1));
                }

                const img = new Image();
                img.src = imageUrl;
                img.onload = () => {
                    const width = img.width;
                    const height = img.height;

                    artworkElem.attr("title", `Resolution: ${width}x${height}`);
                };
            }

            await chrome.runtime.sendMessage({
                "song_appendFollowButton": [true]
            });

            $(document).on("DOMNodeInserted", "[data-react-modal-body-trap]", () => {

                setTimeout(() => {

                    const titleField = document.querySelector(".Fieldshared__FieldContainer-dxskot-0.metadatastyles__MetadataField-nhmb0p-1 .TextInput-sc-2wssth-0");
                    const title = titleField.value;

                    const artistField = document.querySelector(".Fieldshared__FieldContainer-dxskot-0.metadatastyles__MetadataSelectField-nhmb0p-2 .TagInput__Container-sc-17py0eg-0 .TagInput__MultiValueLabel-sc-17py0eg-2");
                    const artist = artistField.textContent;

                    const query = [artist, title];

                    const ytInputContainer = $(".Fieldshared__FieldLabel-dxskot-2.eIbATv:contains('YouTube URL')");
                    const tagInputContainer = $(".Fieldshared__FieldLabel-dxskot-2.eIbATv:contains('Tags')");
                    const artworkInputContainer = $(".Fieldshared__FieldLabel-dxskot-2.eIbATv:contains('Song Art')");

                    if (tagInputContainer.length && !tagInputContainer.find(".clear-tags-rdil").length) {
                        const clearTagsContainer = $("<div>", {
                            class: "clear-tags-rdil"
                        })
                            .append($("<span>✖ Clear Tags</span>"))
                            .appendTo(tagInputContainer);

                        clearTagsContainer.on("click", () => {
                            let tags = document.querySelectorAll("div[data-testid=tags-input] .css-3xx46x");
                            while (tags.length > 0) {
                                tags[0].click();
                                tags = document.querySelectorAll("div[data-testid=tags-input] .css-3xx46x");
                            }
                        });
                    }

                    if (ytInputContainer.length && !ytInputContainer.find(".magic-wand-button-container").length) {
                        const magicWandContainer = $("<div>", {
                            class: "magic-wand-button-container"
                        })
                            .append($("<img>", {
                                class: "magic-wand-button-icon",
                                src: chrome.runtime.getURL("/src/images/magicWand/26x26.png")
                            }))
                            .appendTo(ytInputContainer);

                        magicWandContainer.on("click", async function() {
                            const nonLatinRegex = /[\u011E-\u011F\u0130-\u0131\u015E-\u015F\u00C7-\u00E7\u0590-\u05FF\u0400-\u04FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/;

                            const modifiedQuery = query.map(part => {
                                if (part.includes(" - ") && nonLatinRegex.test(part.split(" - ")[1])) {
                                    const [, langPart] = part.split(" - ");
                                    return langPart;
                                }
                                return part;
                            }).join(" - ");

                            let ytURL = await new Promise((resolve) => {
                                chrome.runtime.sendMessage({
                                    "song_searchVideo": [modifiedQuery]
                                }, (response) => {
                                    resolve(response);
                                });
                            });

                            if (ytURL.length > 0) {
                                // Clear any previous search results
                                const youtubeInput = document.querySelectorAll("section.ScrollableTabs__Section-sc-179ldtd-6[data-section-index='1'] input.TextInput-sc-2wssth-0")[0];
                                youtubeInput.value = "";

                                youtubeInput.click();
                                youtubeInput.value = ytURL;
                                const event = new InputEvent("input", {
                                    bubbles: true,
                                    data: ytURL
                                });
                                youtubeInput.dispatchEvent(event);
                            }
                        });
                    }

                    if (artworkInputContainer.length > 0 && !artworkInputContainer.find(".magic-wand-button-container").length) {
                        /*const magicWandContainer = */
                        $("<div>", {
                            class: "magic-wand-button-container",
                            disabled: true,
                            style: "cursor: not-allowed;"
                        })
                            .append($("<img>", {
                                class: "magic-wand-button-icon",
                                src: chrome.runtime.getURL("/src/images/magicWand/26x26.png")
                            }))
                            .appendTo(artworkInputContainer);

                        /*magicWandContainer.on("click", async function () {
                            let artwork = await new Promise((resolve) => {
                                chrome.runtime.sendMessage({ "album_autolinkArtwork": [query, "song", false] }, (response) => {
                                    resolve(response);
                                });
                            });

                            if (artwork.length) {
                                artwork = artwork[0];

                                const artworkInput = document.querySelectorAll("section.ScrollableTabs__Section-sc-179ldtd-6[data-section-index='1'] input.TextInput-sc-2wssth-0")[2];
                                artworkInput.value = "";

                                artworkInput.click();
                                artworkInput.value = artwork;
                                const event = new InputEvent("input", {
                                    bubbles: true,
                                    data: artwork,
                                });
                                artworkInput.dispatchEvent(event);
                            }
                        });*/
                    }
                }, 1000);
            });

            // $(document).on("DOMNodeInserted", ".Modalshared__ModalSharedContainer-knew3e-0.Modaldesktop__Container-sc-1e03w42-0.cJpfVu", (e) => {
            //
            //     if (!$(".RecentActivity__FilteringContainer").length) {
            //
            //         const filterContainer = $('<div>', {
            //             class: 'RecentActivity__FilteringContainer'
            //         });
            //
            //         const button = $('<span>', {
            //             class: 'RecentActivity__FilteringTitle',
            //             text: 'Filter'
            //         }).appendTo(filterContainer);
            //
            //         // Define the options for the dropdown
            //         const options = [
            //             { id: 'created|edited|proposed_an_edit_to|merged|accepted|rejected|deleted|pinned', text: 'Annotations, Proposals, Q&A' },
            //             { id: 'added_a_suggestion_to|replied_to|integrated|archived|marked', text: 'Comments, Suggestions' },
            //             { id: 'followed|unfollowed', text: 'Follows' },
            //             { id: '', text: 'Geniusbot' },
            //             { id: 'edited_the_lyrics_of|recognized|marked_complete|verified_the_lyrics_of|unverified_the_lyrics_of', text: 'Lyrics Edits' },
            //             { id: 'edited_the_metadata_of|locked|unlocked', text: 'Metadata' },
            //             { id: 'pyonged', text: 'Pyongs' },
            //             { id: 'downvoted|upvoted', text: 'Voting' }
            //         ];
            //
            //         // Create a select element for the dropdown
            //         const filterDropdown = $('<div>', {
            //             class: 'RecentActivity__FilteringDropdown',
            //             style: 'display: none;'
            //         });
            //
            //         // Create an option element for each option and add it to the dropdown
            //         options.forEach((option) => {
            //             $('<div>', {
            //                 class: 'RecentActivity__FilteringDropdownItem'
            //             })
            //                 .append($('<input>', {
            //                     type: 'checkbox',
            //                     class: 'chkboxm',
            //                     id: option.text,
            //                     name: option.text,
            //                     'filter-id': option.id,
            //                     checked: true
            //                 }))
            //                 .append($('<label>', {
            //                     for: option.text,
            //                 })
            //                     .append($('<span>', {
            //                         class: 'chkboxmspan'
            //                     }))
            //                     .append($('<span>', {
            //                         class: 'RecentActivity__FilteringDropdownItemText',
            //                         text: option.text
            //                     }))
            //                 )
            //                 .appendTo(filterDropdown);
            //         });
            //
            //         // Add the dropdown to the page
            //         $(e.target).find('.RecentActivity__Title-d62qa5-1.ilJdac').after(filterContainer);
            //         $(filterContainer).append(filterDropdown);
            //
            //         // When the dropdown is clicked, show the options
            //         $(button).click(() => {
            //             $(filterDropdown).toggle();
            //         });
            //
            //         // When the user clicks anywhere outside of the dropdown, hide it (make sure it won't hide when clicking on the button)
            //         $(document).click((e) => {
            //             if (!$(e.target).is(button) && !$(e.target).is(filterDropdown) && !$(e.target).is(filterDropdown.find('*'))) {
            //                 $(filterDropdown).hide();
            //             }
            //         });
            //
            //         $('.RecentActivity__FilteringDropdownItem').click(() => {
            //             $(this).find('.chkboxm').prop('checked', !$(this).find('.chkboxm').prop('checked'));
            //         });
            //
            //         // When the user clicks on an option, show/hide the activity items
            //         $(filterDropdown).find('.chkboxm').click(() => {
            //             const filterIds = $(this).attr('filter-id').split('|');
            //             const isChecked = $(this).prop('checked');
            //
            //             // the activity items are in the .PlaceholderSpinnerIframe__Iframe-sc-1vue620-0 iframe, so we need to get the iframe's document
            //             const iframe = document.querySelector('.PlaceholderSpinnerIframe__Iframe-sc-1vue620-0');
            //
            //             // each div child of the element with the tag name song-activity-stream is an activity item
            //             const activityItems = Array.from(iframe.contentWindow.document.querySelector('song-activity-stream div').children);
            //
            //             activityItems.forEach((activityItem) => {
            //                 // the action type is in the ng-switch-when attribute of the svg element inside the element with the tag name inbox-line-item-action-icon
            //                 let actionType = activityItem.querySelector('inbox-line-item-action-icon div svg');
            //                 if (actionType) {
            //                     actionType = actionType.getAttribute('ng-switch-when');
            //                     if (filterIds.includes(actionType)) {
            //                         $(activityItem).toggle(!isChecked);
            //                     }
            //                 } else {
            //                     actionType = activityItem.querySelector('inbox-line-item-action-icon div');
            //                     if (actionType && !actionType.querySelector('svg') && filterIds === ['']) {
            //                         $(activityItem).toggle(!isChecked);
            //                     }
            //                 }
            //             });
            //
            //             // insert to the iframe a .checked-filters div element with all the checked filters ids (if there's already a .checked-filters div element, remove it)
            //             const checkedFilters = document.querySelectorAll('.RecentActivity__FilteringDropdownItem input:checked');
            //             const checkedFiltersIds = Array.from(checkedFilters).map(checkedFilter => checkedFilter.getAttribute('filter-id')).join('|');
            //             const checkedFiltersDiv = iframe.contentWindow.document.querySelector('.checked-filters');
            //             if (checkedFiltersDiv) {
            //                 checkedFiltersDiv.remove();
            //             }
            //             $('<div>', {
            //                 class: 'checked-filters',
            //                 style: 'display: none;',
            //                 text: checkedFiltersIds
            //             }).prependTo(iframe.contentWindow.document);
            //         });
            //     }
            //
            //     const activityIfame = document.querySelector('.PlaceholderSpinnerIframe__Iframe-sc-1vue620-0');
            //
            //     if (activityIfame) {
            //
            //         activityIfame.contentWindow.document.querySelector('song-activity-stream div').addEventListener('DOMNodeInserted', (e) => {
            //             if (e.target.tagName === 'DIV') {
            //                 let filterIds = activityIfame.contentWindow.document.querySelector('.checked-filters');
            //                 if (filterIds) {
            //                     filterIds = filterIds.innerText.split('|');
            //                     // the action type is in the ng-switch-when attribute of the svg element inside the element with the tag name inbox-line-item-action-icon
            //                     let actionType = e.target.querySelector('inbox-line-item-action-icon div svg');
            //                     if (actionType) {
            //                         actionType = actionType.getAttribute('ng-switch-when');
            //                         if (filterIds.includes(actionType)) {
            //                             $(e.target).toggle(false);
            //                         }
            //                     } else {
            //                         actionType = e.target.querySelector('inbox-line-item-action-icon div');
            //                         if (actionType && !actionType.querySelector('svg') && JSON.stringify(filterIds) === JSON.stringify([''])) {
            //                             $(e.target).toggle(false);
            //                         }
            //                     }
            //                 }
            //             }
            //         });
            //     }
            // });

            const ANNOTATION_FORM_CLASS = "AnnotationEditFormdesktop__Form-sc-15key0q-0";
            const LYRICS_TEXTAREA_CLASS = "ExpandingTextarea__Textarea-sc-4cgivl-0";

            const isAnnotationEditForm = (element) => {
                return element?.classList?.contains(ANNOTATION_FORM_CLASS) && element.nodeName === "FORM" ||
                    element.querySelector(`form.${ANNOTATION_FORM_CLASS}`);
            };

            const isLyricsEditTextarea = (element) => {
                return element?.classList?.contains(LYRICS_TEXTAREA_CLASS) && element.nodeName === "TEXTAREA" ||
                    element.querySelector(`textarea.${LYRICS_TEXTAREA_CLASS}`);
            };

            const updateRestoreButtonState = (restoreButton, type) => {
                const text = sessionStorage.getItem(`ge-input-tracker-${type}`);

                if (text) {
                    restoreButton.title = `Restore ${type} input`;
                    restoreButton.disabled = false;
                    restoreButton.classList.remove("disabled");
                } else {
                    restoreButton.title = `No ${type} input to restore`;
                    restoreButton.disabled = true;
                    // add the class disabled to the button
                    restoreButton.classList.add("disabled");
                }
            };

            const handleInput = (textarea, type) => {
                const inputValue = textarea.value.trim();
                if (inputValue) {
                    sessionStorage.setItem(`ge-input-tracker-${type}`, inputValue);
                }
                const restoreButton = document.querySelector(`.ge-restore-button.${type}`);
                updateRestoreButtonState(restoreButton, type);
            };

            const handleRestore = (textarea, type) => {
                const text = sessionStorage.getItem(`ge-input-tracker-${type}`);
                if (text) {
                    console.info(`Restoring ${type} input: ${text}`);
                    if (type === "lyrics") {
                        textarea = document.querySelector(`textarea.${LYRICS_TEXTAREA_CLASS}`);
                    }
                    textarea.focus();
                    textarea.value = text;
                    const event = new Event("input", {
                        bubbles: true,
                        cancelable: true
                    });
                    textarea.dispatchEvent(event);
                }
            };

            const explainer = ".LyricsEditExplainer__Container-sc-1aeph76-0";

            $(explainer).hide();

            const buttonStyle = "Button__Container-rtu9rw-0 coQEbB LyricsEditdesktop__Button-sc-19lxrhp-4 kpOoZB";

            // Will fix the naming later
            const lyricsEditorContainer = document.querySelector(".LyricsEditdesktop__Controls-sc-19lxrhp-3");

            // Create buttons
            const createButton = (text, className, onClick) => {
                const button = document.createElement("button");
                button.innerText = text;
                button.value = text;
                for (const clazz of className.split(" ")) {
                    button.classList.add(clazz);
                }
                button.addEventListener("click", onClick);
                return button;
            };

            const toolbarButtonNames = ["B", "I"];
            const toolbarButtons = toolbarButtonNames.map(name => createButton(name, buttonStyle, () =>
                addTextToTextArea(name)));

            const headerOptionButtonNames = ["Intro", "Verse", "Chorus", "Outro"];
            const headerOptionButtons = headerOptionButtonNames.map(name => createButton(name, buttonStyle, () =>
                addTextToTextArea(`[${name}]`)));

            const toolbarButtonDiv = document.createElement("div");
            toolbarButtonDiv.classList.add("header-buttons");
            toolbarButtonDiv.append(...toolbarButtons);

            const headerOptionsDiv = document.createElement("div");
            headerOptionsDiv.classList.add("header-buttons");
            headerOptionsDiv.append(...headerOptionButtons);

            const headerLyrics = document.createElement("div");
            headerLyrics.classList.add("header-div", "tEQJY");
            headerLyrics.append(toolbarButtonDiv, headerOptionsDiv);

            const existingheaderLyrics = lyricsEditorContainer.querySelector(".header-div");

            if (!existingheaderLyrics) {
                lyricsEditorContainer.appendChild(headerLyrics);
            }

            const addTextToTextArea = (text) => {
                const lyricsTextarea = document.querySelector(`textarea.${LYRICS_TEXTAREA_CLASS}`);
                const { selectionStart, selectionEnd, value } = lyricsTextarea;
                const selectedText = value.substring(selectionStart, selectionEnd);

                // Modify the text based on the selected button (bold or italic)
                let modifiedText = text;

                if (text === "B") {
                    modifiedText = `<b>${selectedText}</b>`;
                } else if (text === "I") {
                    modifiedText = `<i>${selectedText}</i>`;
                }

                // Insert the modified text into the textarea
                const newText = `${value.substring(0, selectionStart)}${modifiedText}${value.substring(selectionEnd)}`;
                lyricsTextarea.value = newText;
            };

            // document.addEventListener('DOMNodeInserted', (event) => {
            //     const insertedNode = event.target;
            //     if (insertedNode.nodeType !== Node.ELEMENT_NODE || insertedNode.classList?.contains('ge-text-tracking')) return;
            //
            //     const isAnnotationEdit = isAnnotationEditForm(insertedNode);
            //     const isLyricsEdit = isLyricsEditTextarea(insertedNode);
            //
            //     if (!isAnnotationEdit && !isLyricsEdit) return;
            //
            //     const type = isAnnotationEdit
            //         ? 'annotation'
            //         : 'lyrics';
            //     const toolbarQuery = isAnnotationEdit
            //         ? 'div.Fieldshared__FieldControlWithLabel-dxskot-1>div.TextEditor__Toolbar-sc-128gj0x-0'
            //         : 'div.LyricsEditdesktop__ControlsContainer-sc-19lxrhp-2>div.LyricsEditdesktop__Controls-sc-19lxrhp-3';
            //     const buttonClass = isAnnotationEdit
            //         ? 'kviCal'
            //         : 'kpOoZB coQEbB';
            //     const buttonTag = isAnnotationEdit
            //         ? 'div'
            //         : 'button';
            //
            //     insertedNode.classList.add('ge-text-tracking');
            //     const textarea = insertedNode.nodeName === 'TEXTAREA'
            //         ? insertedNode
            //         : insertedNode.querySelector('textarea');
            //
            //     if (textarea) {
            //         console.info(`Tracking ${type} input (textarea:`, textarea, `)`);
            //         textarea.addEventListener('input', () => handleInput(textarea, type));
            //     }
            //
            //     const toolbar = document.querySelector(toolbarQuery);
            //     if (toolbar && !toolbar.querySelector('.ge-restore-button')) {
            //         const restoreButton = document.createElement(buttonTag);
            //         restoreButton.className = `ge-restore-button ${type} ${buttonClass}`;
            //         restoreButton.innerText = 'Restore';
            //         restoreButton.addEventListener('click', () => handleRestore(textarea, type));
            //         updateRestoreButtonState(restoreButton, type);
            //         toolbar.insertBefore(restoreButton, toolbar.children[1]);
            //     }
            // });

            window.addEventListener("beforeunload", () => {
                Object.keys(sessionStorage).forEach((key) => {
                    if (key.startsWith("ge-input-tracker-")) {
                        sessionStorage.removeItem(key);
                    }
                });
            });

            /*let isAnnotation = false;

            if (document.getElementsByClassName("annotation_sidebar_unit").length == 2) {
                isAnnotation = true;
            }
            else if (!!document.getElementsByClassName("Annotation__Container-l76qjh-0 cNCMgo").length) {
                isAnnotation = true;
            }

            const lyricsContainer = $('.Lyrics__Container-sc-1ynbvzw-6')[0] || $(".lyrics section")[0];
            let text = lyricsContainer.innerText;

            var words = text.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g, '').split(/\s+/);

            var languageCounts = {};
            for (var i = 0; i < words.length; i++) {
                var word = words[i];
                var language = getLanguage(word);
                if (!languageCounts[language]) {
                    languageCounts[language] = 0;
                }
                languageCounts[language]++;
            }

            var mostUsedLanguage = null;
            var highestCount = 0;
            for (var language in languageCounts) {
                if (languageCounts[language] > highestCount) {
                    mostUsedLanguage = language;
                    highestCount = languageCounts[language];
                }
            }

            if (mostUsedLanguage === null) {
                console.log("No language detected");
            } else {
                var direction = isRTL(mostUsedLanguage) ? "RTL" : "LTR";
                console.log("Most used language: " + mostUsedLanguage + " (" + direction + ")");
            }

            function getLanguage(word) {
                switch (true) {
                    case /^[a-zA-Z]+$/.test(word):
                        return "English";
                    case /^[\u0600-\u06FF]+$/.test(word):
                        return "Arabic";
                    case /^[\u0590-\u05FF]+$/.test(word):
                        return "Hebrew";
                    case /^[\u0400-\u04FF]+$/.test(word):
                        return "Russian";
                    case /^[\u3040-\u309F]+$/.test(word):
                        return "Japanese";
                    case /^[\u4E00-\u9FFF]+$/.test(word):
                        return "Chinese Simplified";
                    case /^[\u00E4-\u00FC]+$/.test(word):
                        return "German";
                    case /^[\u00C0-\u00FF]+$/.test(word):
                        return "French";
                    case /^[\u00E0-\u00FF]+$/.test(word):
                        return "Spanish";
                    case /^[\u00C6-\u00E6]+$/.test(word):
                        return "Danish";
                    case /^[\u0104-\u0134]+$/.test(word):
                        return "Polish";
                    case /^[\u0103-\u0103]+$/.test(word):
                        return "Romanian";
                    case /^[\u00E6-\u00E6]+$/.test(word):
                        return "Ukrainian";
                    case /^[\u0131-\u0131]+$/.test(word):
                        return "Turkish";
                    case /^[\u0050-\u00FF]+$/.test(word):
                        return "Italian";
                    case /^[\u01C5-\u0218]+$/.test(word):
                        return "Dutch";
                    default:
                        return "Other";
                }
            }

            function isRTL(language) {
                return (language === "Arabic" || language === "Hebrew");
            }*/
        }
    });
}
