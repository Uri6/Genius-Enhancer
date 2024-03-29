/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

export async function handleSongPage(tabId) {
	await chrome.scripting.insertCSS({
		target: {
			tabId: tabId
		},
		files: ["./src/css/pages/song.css"]
	});

	await chrome.scripting.executeScript({
		target: {
			tabId: tabId
		},
		files: ["/src/js/extension/createSongMediaPlayers.js"]
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
				"song_reactSongAdditions": [true]
			});

			// Function to update YT iframes and add allowfullscreen attribute
			function updateIframe(iframe) {
				if (iframe.src.includes('youtube.com/embed') && !iframe.hasAttribute('allowfullscreen')) {
					const newIframe = document.createElement('iframe');
					for (const attribute of iframe.attributes) {
						newIframe.setAttribute(attribute.name, attribute.value);
					}
					newIframe.setAttribute('allowfullscreen', true);
					iframe.parentNode.replaceChild(newIframe, iframe);
				}
			}

			// Update existing YT iframes
			document.querySelectorAll('iframe').forEach(updateIframe);

			// Listen for new YT iframes being added to the DOM
			$(document).on("DOMNodeInserted", ":has(iframe)", (e) => {
				const iframe = e.target.querySelector('iframe');
				if (iframe) {
					updateIframe(iframe);
				}
			});

			$(document).on("DOMNodeInserted", "[data-react-modal-body-trap]", async () => {
				setTimeout(() => {
					const titleField = document.querySelector(".Fieldshared__FieldContainer-dxskot-0.metadatastyles__MetadataField-nhmb0p-1 .TextInput-sc-2wssth-0");
					const title = titleField.value;

					const artistField = document.querySelector(".Fieldshared__FieldContainer-dxskot-0.metadatastyles__MetadataSelectField-nhmb0p-2 .TagInput__Container-sc-17py0eg-0 .TagInput__MultiValueLabel-sc-17py0eg-2");
					const artist = artistField.textContent;

					const query = [artist, title];

					const ytInputContainer = $(".Fieldshared__FieldLabel-dxskot-2.eIbATv:contains('YouTube URL')");
					const tagInputContainer = $(".Fieldshared__FieldLabel-dxskot-2.eIbATv:contains('Tags')");
					const artworkInputContainer = $(".Fieldshared__FieldLabel-dxskot-2.eIbATv:contains('Song Art')");

					if (tagInputContainer.length && !tagInputContainer.find(".clear-tags-btn").length) {
						const clearTagsContainer = $("<div>", {
							class: "clear-tags-btn"
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
								src: chrome.runtime.getURL("/src/imgs/magicWand/2/32x32.png")
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
						const magicWandContainer = $("<div>", {
							class: "magic-wand-button-container"
						})
							.append($("<img>", {
								class: "magic-wand-button-icon",
								src: chrome.runtime.getURL("/src/imgs/magicWand/2/32x32.png")
							}))
							.appendTo(artworkInputContainer);

						magicWandContainer.on("click", async function() {
							if ($(this).hasClass("clicked")) return;
							$(this).addClass("clicked").attr("title", "Searching for artwork...");

							let artworks = await new Promise((resolve) => {
								chrome.runtime.sendMessage({ "album_autolinkArtwork": [query, "song", false] }, (response) => {
									resolve(response);
								});
							});

							$(this).attr("title", "Already checked for artwork");

							if (artworks.length) {
								const defaultArtwork = artworks[0];

								const artworkInput = document.querySelectorAll("section.ScrollableTabs__Section-sc-179ldtd-6[data-section-index='1'] input.TextInput-sc-2wssth-0")[2];
								artworkInput.value = "";

								artworkInput.click();
								artworkInput.value = defaultArtwork;
								const event = new InputEvent("input", {
									bubbles: true,
									data: defaultArtwork,
								});
								artworkInput.dispatchEvent(event);

								// Insert arrows to navigate between the artwork images
								const resultsArrows = $("<div>", {
									class: "results-arrows",
									title: "Use the arrows to navigate between the results"
								})
									.append($("<span>", {
										class: "arrow left",
										text: "◀",
										disabled: true,
										title: "Can't go back, this is the first result"
									}))
									.append($("<span>", {
										class: "arrow right",
										text: "▶",
										disabled: artworks.length === 1,
										title: artworks.length === 1 ? "Can't go forward, this is the last result" : "Use the arrows to navigate between the results"
									}))
									.appendTo(artworkInputContainer.parent());

								// If the div one before the arrows is not the input container, change its display to inline-block
								if (resultsArrows.prev().attr("class") !== "Fieldshared__FieldContainer-dxskot-0 metadatastyles__MetadataField-nhmb0p-1") {
									resultsArrows.prev().css("display", "inline-block");
								}

								// If no artwork was found, disable the arrows and change their title
								if (JSON.stringify(artworks) === JSON.stringify([''])) {
									$(this).attr("title", "No artwork found");
									resultsArrows.find(".arrow.right").attr("disabled", true);
									resultsArrows.find(".arrow.right").removeAttr("title");
									resultsArrows.find(".arrow.left").removeAttr("title");
									resultsArrows.attr("title", "No artwork found");
									return;
								}

								// Add event listeners to the arrows
								resultsArrows.find(".arrow").on("click", function() {
									// Don't do anything if the arrow is disabled
									if ($(this).attr("disabled")) return;

									// Get the current artwork and its index
									const currentArtwork = artworkInput.value;
									const currentIndex = artworks.indexOf(currentArtwork);
									const nextIndex = $(this).hasClass("left") ? currentIndex - 1 : currentIndex + 1;
									const nextArtwork = artworks[nextIndex];

									// Clear any previous search results & update the input with the next artwork
									artworkInput.value = "";
									artworkInput.click();
									artworkInput.value = nextArtwork;
									const event = new InputEvent("input", {
										bubbles: true,
										data: nextArtwork,
									});
									artworkInput.dispatchEvent(event);

									// Update the arrows' disabled attribute
									if (nextIndex === 0) {
										resultsArrows.find(".arrow.left").attr("disabled", true).attr("title", "Can't go back, this is the first result");
									} else {
										resultsArrows.find(".arrow.left").removeAttr("disabled").attr("title", "Use the arrows to navigate between the results");
									}

									if (nextIndex === artworks.length - 1) {
										resultsArrows.find(".arrow.right").attr("disabled", true).attr("title", "Can't go forward, this is the last result");
									} else {
										resultsArrows.find(".arrow.right").removeAttr("disabled").attr("title", "Use the arrows to navigate between the results");
									}
								});
							}
						});
					}
				}, 1000);
			});

			$(document).on("DOMNodeInserted", ".ReactModalPortal>div:has(.RecentActivity__Title-d62qa5-1.ilJdac)", (e) => {
				if (!$(".RecentActivity__FilteringContainer").length) {
					const filterContainer = $('<div>', {
						class: 'RecentActivity__FilteringContainer'
					});
					const button = $('<span>', {
						class: 'RecentActivity__FilteringTitle',
						text: 'Filter'
					}).appendTo(filterContainer);
					// Define the options for the dropdown
					const options = [
						{ id: 'created|edited|proposed_an_edit_to|merged|accepted|rejected|deleted|pinned', text: 'Annotations, Proposals, Q&A' },
						{ id: 'added_a_suggestion_to|replied_to|integrated|archived|marked', text: 'Comments, Suggestions' },
						{ id: 'followed|unfollowed', text: 'Follows' },
						{ id: '', text: 'Geniusbot' },
						{ id: 'edited_the_lyrics_of|recognized|marked_complete|verified_the_lyrics_of|unverified_the_lyrics_of', text: 'Lyrics Edits' },
						{ id: 'edited_the_metadata_of|locked|unlocked', text: 'Metadata' },
						{ id: 'pinned|unpinned', text: 'Pins' },
						{ id: 'pyonged', text: 'Pyongs' },
						{ id: 'downvoted|upvoted', text: 'Voting' }
					];
					// Create a select element for the dropdown
					const filterDropdown = $('<div>', {
						class: 'RecentActivity__FilteringDropdown',
						style: 'display: none;'
					});
					// Create an option element for each option and add it to the dropdown
					options.forEach((option) => {
						const element = $('<div>', {
							class: 'RecentActivity__FilteringDropdownItem'
						})
							.append($('<input>', {
								type: 'checkbox',
								class: 'chkboxm',
								id: option.text,
								name: option.text,
								'filter-id': option.id,
								checked: true
							}))
							.append($('<label>', {
								for: option.text,
							})
								.append($('<span>', {
									class: 'chkboxmspan'
								}))
								.append($('<span>', {
									class: 'RecentActivity__FilteringDropdownItemText',
									text: option.text
								}))
							)
							.appendTo(filterDropdown);

						// Make sure that even if the user clicks on the label, the checkbox will be checked/unchecked
						$(element).click((e) => {
							if ($(e.target).is('div')) {
								$(element).find('.chkboxm').click();
							}
						});
					});
					// Add the dropdown to the page
					$(e.target).find('.RecentActivity__Title-d62qa5-1.ilJdac').after(filterContainer);
					$(filterContainer).append(filterDropdown);
					// When the dropdown is clicked, show the options
					$(button).click(() => {
						$(filterDropdown).toggle();
					});
					// When the user clicks anywhere outside of the dropdown, hide it (make sure it won't hide when clicking on the button)
					$(document).click((e) => {
						if (!$(e.target).is(button) && !$(e.target).is(filterDropdown) && !$(e.target).is(filterDropdown.find('*'))) {
							$(filterDropdown).hide();
						}
					});
					$('.RecentActivity__FilteringDropdownItem').click(() => {
						$(this).find('.chkboxm').prop('checked', !$(this).find('.chkboxm').prop('checked'));
					});
					// When the user clicks on an option, show/hide the activity items
					$(filterDropdown).find('.chkboxm').click(function() {
						const filterIds = $(this).attr('filter-id').split('|');
						const isChecked = $(this).prop('checked');
						// the activity items are in the .PlaceholderSpinnerIframe__Iframe-sc-1vue620-0 iframe, so we need to get the iframe's document
						const iframe = document.querySelector('.PlaceholderSpinnerIframe__Iframe-sc-1vue620-0');
						// each div child of the element with the tag name song-activity-stream is an activity item
						const activityItems = Array.from(iframe.contentWindow.document.querySelector('song-activity-stream div').children);
						activityItems.forEach((activityItem) => {
							// the action type is in the ng-switch-when attribute of the svg element inside the element with the tag name inbox-line-item-action-icon
							let actionType = activityItem.querySelector('inbox-line-item-action-icon div svg');
							if (actionType) {
								actionType = actionType.getAttribute('ng-switch-when');
								if (filterIds.includes(actionType)) {
									$(activityItem).toggle(isChecked);
								}
							} else {
								actionType = activityItem.querySelector('inbox-line-item-action-icon div');
								if (actionType && !actionType.querySelector('svg') && filterIds.length === 1 && filterIds[0] === '') {
									$(activityItem).toggle(isChecked);
								}
							}
						});

						// insert to the iframe a .checked-filters div element with all the checked filters ids (if there's already a .checked-filters div element, remove it)
						const checkedFilters = document.querySelectorAll('.RecentActivity__FilteringDropdownItem input:checked');
						const checkedFiltersIds = Array.from(checkedFilters).map(checkedFilter => checkedFilter.getAttribute('filter-id')).join('|').split('|');

						clearInterval(activityItemsFilterTracker);
						activityItemsFilterTracker(checkedFiltersIds);
					});
				}

				const activityItemsFilterTracker = (checkedFiltersIds) => {
					const activityIframe = document.querySelector('.PlaceholderSpinnerIframe__Iframe-sc-1vue620-0');
					if (activityIframe) {
						const activityStream = activityIframe.contentWindow.document.querySelector('song-activity-stream div');
						const observer = new MutationObserver((mutationsList) => {
							for (const mutation of mutationsList) {
								if (mutation.type === 'childList') {
									for (const addedNode of mutation.addedNodes) {
										if (addedNode.tagName === 'DIV') {
											let actionType = addedNode.querySelector('inbox-line-item-action-icon div svg');
											if (actionType) {
												actionType = actionType.getAttribute('ng-switch-when');
												if (!checkedFiltersIds.includes(actionType)) {
													$(addedNode).toggle(false);
												}
											} else {
												actionType = addedNode.querySelector('inbox-line-item-action-icon div');
												if (actionType && !actionType.querySelector('svg') && JSON.stringify(checkedFiltersIds) === JSON.stringify([''])) {
													$(addedNode).toggle(false);
												}
											}
										}
									}
								}
							}
						});
						observer.observe(activityStream, { childList: true });
					}
				};
			});

			// Fade the background of the leaderboard rows (works only on the old page for now)
			const leaderboardInsertionObserver = new MutationObserver((mutations) => {
				const elements = mutations.flatMap(mutation => Array.from(mutation.addedNodes))
					.filter(node => node instanceof HTMLElement)
					.flatMap(node => Array.from(node.querySelectorAll(".leaderboard-row .leaderboard-percentage_fill")))
					.filter((element, index, self) => self.indexOf(element) === index);
				const total = elements.length;

				if (total === 1) {
					elements[0].style.background = `rgba(154, 154, 154, 0.42)`;
				} else {
					elements.forEach((element, index) => {
						index = total - index;
						const opacity = (index * 0.42) / total;
						element.style.background = `rgba(154, 154, 154, ${opacity})`;
					});
				}
			});

			// Start observing the document with the configured parameters
			leaderboardInsertionObserver.observe(document, { childList: true, subtree: true });

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

			// Update X (twitter) logo
			const twitterLogo = $("button[aria-label='twitter']");

			if (twitterLogo) {
				const twitterLogoSvg = twitterLogo.find("svg");

				// Update attributes of the SVG
				twitterLogoSvg.attr('width', '17.71');
				twitterLogoSvg.attr('height', '16');
				twitterLogoSvg.attr('viewBox', '0 0 300 271');

				// Update the path
				const path = twitterLogoSvg.find('path');
				path.attr('d', 'm236 0h46l-101 115 118 156h-92.6l-72.5-94.8-83 94.8h-46l107-123-113-148h94.9l65.5 86.6zm-16.1 244h25.5l-165-218h-27.4z');
			}



			// TOOLBAR
			const explainerSelector = ".LyricsEditExplainer__Container-sc-1aeph76-0";
			$(explainerSelector).hide();

			const buttonStyle = "Button__Container-rtu9rw-0 coQEbB LyricsEditdesktop__Button-sc-19lxrhp-4 kpOoZB";

			const lyricsEditorSelector = document.querySelector(".LyricsEditdesktop__Controls-sc-19lxrhp-3");

			const createButton = (text, className, onClick, accessKey) => {
				const button = document.createElement("button");
				button.innerText = text;
				button.value = text;
				button.classList.add(...className.split(" "));
				button.addEventListener("click", onClick);
				if (accessKey && !document.querySelector(".ql-snow")) {
					button.accessKey = accessKey;
				}
				return button;
			};

			// Define toolbar buttons
			const toolbarButtonNames = ["Bold", "Italic"];
			const toolbarButtons = toolbarButtonNames.map(name => {
				const accessKey = name === "Bold" ? "b" : "i";
				const button = createButton(name, buttonStyle, () => addTextToTextArea(name), accessKey);

				if (name === "Bold") {
					button.style.fontWeight = "bold";
				} else if (name === "Italic") {
					button.style.fontStyle = "italic";
					button.style.fontWeight = "500";
				}

				return button;
			});

			// Add event listener for hotkeys
			if (!document.querySelector(".ql-snow")) {
				document.addEventListener("keydown", event => {
					const lyricsTextarea = document.querySelector(`textarea.${LYRICS_TEXTAREA_CLASS}`);
					const { ctrlKey, key } = event;

					if (ctrlKey && (key === "b" || key === "i") && document.activeElement === lyricsTextarea) {
						const text = key === "b" ? "Bold" : "Italic";
						addTextToTextArea(text);
						event.preventDefault();
					}
				});
			}

			// Define header option buttons
			let prefferedLanguage = (await chrome.storage.local.get("songHeadersLanguage")).songHeadersLanguage;

			if (prefferedLanguage === "songsLang") {
				const id = document.querySelector("[property=\"twitter:app:url:iphone\"]").content.split("/")[3];
				const songData = await fetch(`https://genius.com/api/songs/${id}`)
					.then(response => response?.json())
					.catch((err) => { console.error("Error fetching song data:", err); });
				const songLanguage = songData?.response?.song?.language?.replace(/\s/g, '') || "en";

				const commonLangCodes = {
					'ar': 'ar-SA', // Arabic - Saudi Arabia
					'zh': 'zh-TW', // Chinese - Traditional
					'zh-Hant': 'zh-TW', // Chinese - Traditional
					'hi': 'hi-IN', // Hindi - India
					'no': 'no-NO', // Norwegian - Norway
					'ca': 'ca-ES', // Catalan - Spain
					'nl': 'nl-NL', // Dutch - Netherlands
					'fi': 'fi-FI', // Finnish - Finland
					'fr': 'fr-FR', // French - France
					'de': 'de-DE', // German - Germany
					'he': 'he-IL', // Hebrew - Israel
					'iw': 'he-IL', // Hebrew - Israel
					'ru': 'ru-RU', // Russian - Russia
					'es': 'es-ES', // Spanish - Spain
					'sv': 'sv-SE', // Swedish - Sweden
					'tr': 'tr-TR' // Turkish - Turkey
				};

				prefferedLanguage = commonLangCodes[songLanguage] ? commonLangCodes[songLanguage] : 'en-US';
			}

			const headersFile = chrome.runtime.getURL(`/src/text/${prefferedLanguage}/songParts.json`);
			const headers = await fetch(headersFile)
				.then(response => response?.json())
				.catch((err) => { console.error("Error fetching headers file:", err); })
				|| { intro: '[Intro]', verse: '[Verse {{count}}]', chorus: '[Chorus]', bridge: '[Bridge]', outro: '[Outro]' };
			const headerOptionButtons = Object.keys(headers).map(name => {
				return createButton(name.charAt(0).toUpperCase() + name.slice(1), buttonStyle, () => addTextToTextArea(`\n${headers[name]}`, name === "verse"));
			});

			const toolbarButtonDiv = $("<div>", {
				class: "header-buttons"
			}).append(...toolbarButtons);

			const headerOptionsDiv = $("<div>", {
				class: "header-buttons"
			}).append(...headerOptionButtons);

			const headerLyrics = $("<div>", {
				class: "header-div tEQJY"
			}).append(toolbarButtonDiv, headerOptionsDiv);

			const existingheaderLyrics = $(lyricsEditorSelector).find(".header-div");

			if (!existingheaderLyrics.length) {
				$(lyricsEditorSelector).append(headerLyrics);
			}

			// Add text to text area
			const addTextToTextArea = (text, isVerse = false) => {
				if (document.querySelector(".ql-snow")) {
					const styleAction = text === "Bold" || text === "Italic";
					if (styleAction) {
						const buttonClass = text === "Bold" ? ".ql-bold" : ".ql-italic";
						const button = document.querySelector(buttonClass);
						button.click();
					} else {
						// Turn every "\n[Part]" into "part"
						const partName = text.replace(/\n\[(.*)\]/, "$1").toLowerCase();
						const buttonClass = `.ql-song-part-buttons-container .insert-song-part.${partName}`;
						const button = document.querySelector(buttonClass);
						button.click();
					}
				} else {
					const lyricsTextarea = document.querySelector(`textarea.${LYRICS_TEXTAREA_CLASS}`);
					const { selectionStart, selectionEnd, value } = lyricsTextarea;
					const selectedText = value.substring(selectionStart, selectionEnd);

					if (isVerse) {
						let verseCount;
						const thereIsNoVerseHeader = !value.substring(0, selectionStart).includes(text.split(" ")[0].replace("\n", ""));

						// If the language is Hebrew, replace the verse count with the matching Hebrew letter
						if (text.includes("וורס")) {
							const possibleSplitters = ["]וורס ", "[וורס ", "['וורס ", "]'וורס "]

							verseCount = possibleSplitters.reduce((totalCount, splitter) => {
								const currentCount = value.substring(0, selectionStart).split(splitter).length - 1;
								return totalCount + currentCount;
							}, 0);

							const hebrewNumbers = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י"];
							verseCount = hebrewNumbers[verseCount];
						} else if (thereIsNoVerseHeader) {
							verseCount = 1;
						} else {
							verseCount = value.substring(0, selectionStart).split(text.split(" ")[0]).length;
							verseCount = verseCount === 1 ? 2 : verseCount;
						}

						text = text.replace("{{count}}", verseCount);
					}

					// Modify the text based on the selected button (bold or italic)
					const modifiedText = text === 'Bold'
						? `<b>${selectedText}</b>`
						: text === 'Italic'
							? `<i>${selectedText}</i>`
							: text;

					// Insert the modified text into the textarea
					lyricsTextarea.setRangeText(modifiedText, selectionStart, selectionEnd, 'end');
				}
			};


			document.addEventListener('DOMNodeInserted', (event) => {
				const insertedNode = event.target;
				if (insertedNode.nodeType !== Node.ELEMENT_NODE || insertedNode.classList?.contains('ge-text-tracking')) return;

				const isAnnotationEdit = isAnnotationEditForm(insertedNode);
				const isLyricsEdit = isLyricsEditTextarea(insertedNode);

				if (!isAnnotationEdit && !isLyricsEdit) return;

				const type = isAnnotationEdit
					? 'annotation'
					: 'lyrics';
				const toolbarQuery = isAnnotationEdit
					? 'div.Fieldshared__FieldControlWithLabel-dxskot-1>div.TextEditor__Toolbar-sc-128gj0x-0'
					: 'div.LyricsEditdesktop__ControlsContainer-sc-19lxrhp-2>div.LyricsEditdesktop__Controls-sc-19lxrhp-3';
				const buttonClass = isAnnotationEdit
					? 'kviCal'
					: 'kpOoZB coQEbB';
				const buttonTag = isAnnotationEdit
					? 'div'
					: 'button';

				insertedNode.classList.add('ge-text-tracking');
				const textarea = insertedNode.nodeName === 'TEXTAREA'
					? insertedNode
					: insertedNode.querySelector('textarea');

				if (textarea) {
					console.info(`Tracking ${type} input (textarea:`, textarea, `)`);
					textarea.addEventListener('input', () => handleInput(textarea, type));
				}

				const toolbar = document.querySelector(toolbarQuery);
				if (toolbar && !toolbar.querySelector('.ge-restore-button')) {
					const restoreButton = document.createElement(buttonTag);
					restoreButton.className = `ge-restore-button ${type} ${buttonClass}`;
					restoreButton.innerText = 'Restore';
					restoreButton.addEventListener('click', () => handleRestore(textarea, type));
					updateRestoreButtonState(restoreButton, type);
					toolbar.insertBefore(restoreButton, toolbar.children[1]);
				}
			});
		}
	});
}