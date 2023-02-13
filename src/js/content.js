import { missingInfo, appendIcon, addSongAsTheNext } from "./src/js/sideFunctions_album.js";
import { ModernTextEditor } from "./src/js/sideFunctions_song.js";
import { replaceButtons } from "./src/js/sideFunctions_forum.js";

export function contentHandler() {
    chrome.runtime.sendMessage({ "identifyPageType": [true] }).then((response) => {
        console.log("identifyPageType: " + response);
        return response.identifyPageType;
    }).then(() => {
        // get the page type from the local storage
        chrome.storage.local.get(["pageType"], (result) => {
            let pageType = result.pageType;
            console.info("pageType: " + pageType);

            chrome.scripting.executeScript(
                {
                    target: { tabId: tabId },
                    func: (() => {
                        // move the div with the classes "PageHeaderdesktop__Subnavigation-bhx5ui-6 koeYQd"
                        // (or the element with the class "header-nav_menu" if there's no element with the classes above)
                        // to after the element with the classes "PageHeaderLogo__Link-sc-175tsd3-0 jNXEyt"
                        // (or to after the element with the class "logo_container" if there's no element with the classes above)
                        var subNav = $(".PageHeaderdesktop__Subnavigation-bhx5ui-6.koeYQd");
                        if (subNav.length == 0) {
                            subNav = $(".header-nav_menu");
                        }
                        var logo = $(".PageHeaderLogo__Link-sc-175tsd3-0.jNXEyt");
                        if (logo.length == 0) {
                            logo = $(".logo_container");
                        }
                        subNav.insertAfter(logo);

                        // if there's an element with the class "lyrics_controls", when it sticky add the class "sticky" to this element
                        // make sure that the class "sticky" is removed when the element is not sticky
                        var lyricsControls = $(".lyrics_controls");
                        if (lyricsControls.length > 0) {
                            var sticky = lyricsControls.offset().top;
                            $(window).scroll(function () {
                                if ($(window).scrollTop() > sticky) {
                                    lyricsControls.addClass("sticky");
                                }
                                else {
                                    lyricsControls.removeClass("sticky");
                                }
                            });
                        }

                        // clean the search bar from the "Search" text when not focused
                        // the search bar is the element with the classes "PageHeaderSearchdesktop__Input-eom9vk-2 gajVFV" or "quick_search search quick_search--header"
                        var searchBar = $(".PageHeaderSearchdesktop__Input-eom9vk-2.gajVFV");
                        if (searchBar.length == 0) {
                            searchBar = $(".quick_search.search.quick_search--header");
                        }
                        searchBar.blur(function () {
                            searchBar.val("");
                        });

                        // there's three elements with the class "PageHeaderdesktop__Link-bhx5ui-4 jQULAr"
                        // if the element have the href "/#featured-stories" is clicked, scroll to the "HomeContentdesktop__Section-sc-1xfg7l1-4 bBDcg" element
                        // if the element have the href "/#top-songs" is clicked, scroll to the "HomeContentdesktop__CenteredFlexColumn-sc-1xfg7l1-1 btjJtO" element
                        // if the element have the href "/#videos" is clicked, scroll to the "HomeContentdesktop__Section-sc-1xfg7l1-4 gveVlf" element
                        // remove their default href attribute
                        // use jQuery to scroll to the element
                        function scrollToElement(element) {
                            var elementOffset = element.offset().top;
                            $("html, body").animate({ scrollTop: elementOffset }, 500);
                        }

                        elementsToScroll = {
                            "/#top-songs": $(".HomeContentdesktop__Section-sc-1xfg7l1-4.bBDcg"),
                            "/#featured-stories": $(".PageGriddesktop-a6v82w-0.csQZGy"),
                            "/#videos": $(".HomeContentdesktop__Section-sc-1xfg7l1-4.gveVlf")
                        }

                        $(document).on("click", ".PageHeaderdesktop__Link-bhx5ui-4.jQULAr", function (e) {
                            var href = $(this).attr("href");
                            if (href in elementsToScroll) {
                                e.preventDefault();
                                scrollToElement(elementsToScroll[href]);
                            }
                        });

                        // follow after dominserted
                        // if an element with the classes "AnnotationPortaldesktop__Sticky-sc-17hre1n-2 daeaLL" added, remove the class "daeaLL" from it
                        $(document).on("DOMNodeInserted", function (e) {
                            /* replace the elememt
                                <div ng-if="focused" ng-click="unfocus()" stop-propagation="click" class="global_search-submit_button global_search-submit_button--focused ng-scope">
                                    <svg src="x.svg" class="global_search-search_icon global_search-search_icon--close inline_icon inline_icon--down_4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39"></path></svg>
                                </div>
                               with
                                <div ng-if="!focused" ng-click="focus()" stop-propagation="click" class="global_search-submit_button ng-scope">
                                    <svg src="magnifying_glass.svg" class="global_search-search_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.48 21.59"><path d="M21.48 20.18L14.8 13.5a8.38 8.38 0 1 0-1.43 1.4l6.69 6.69zM2 8.31a6.32 6.32 0 1 1 6.32 6.32A6.32 6.32 0 0 1 2 8.31z"></path></svg>
                                </div>
                                make sure to replace only the inner path and check only him on the condition
                            */

                            if (e.target.parentElement.classList.contains("global_search-search_icon") && e.target.tagName == "path" && e.target.getAttribute("d") == "M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39") {
                                e.target.setAttribute("d", "M21.48 20.18L14.8 13.5a8.38 8.38 0 1 0-1.43 1.4l6.69 6.69zM2 8.31a6.32 6.32 0 1 1 6.32 6.32A6.32 6.32 0 0 1 2 8.31z");
                                e.target.parentElement.setAttribute("class", "global_search-search_icon");
                            }

                            setTimeout(() => {
                                if ($(e.target).attr("class") == "modal_window" && $(e.target).find(".modal_window-content").length > 0 && ($(e.target).find(".modal_window-content").find("conversation-with-user").length > 0 || $(e.target).find(".modal_window-content").find("conversation-messages").length > 0)) {

                                    $("body").removeClass("u-noscroll u-dark_overlay");
                                    $(e.target).css("pointer-events", "none");
                                    $(e.target).find(".modal_window-content").css("pointer-events", "auto");

                                    if ($(".modal_window").length > 1) {
                                        $(".modal_window").first().remove();
                                    }

                                    const oldCloseButton = $(e.target).find(".modal_window-close_button");
                                    if (oldCloseButton.length > 0) {
                                        $(oldCloseButton).css("display", "none");
                                    }

                                    const closeButton = document.createElement('img');
                                    closeButton.className = "modal_window-close_button";
                                    closeButton.src = chrome.runtime.getURL("/src/images/other/closeIcon.png");
                                    closeButton.setAttribute("onmouseover", "this.src=\'" + chrome.runtime.getURL("/src/images/other/closeIconX.png") + "\'");
                                    closeButton.setAttribute("onmouseout", "this.src=\'" + chrome.runtime.getURL("/src/images/other/closeIcon.png") + "\'");
                                    closeButton.setAttribute("title", "Esc");

                                    closeButton.addEventListener("click", () => {
                                        oldCloseButton.click();
                                    });

                                    $(e.target).find(".modal_window-content").prepend(closeButton);
                                }
                            }, 1);
                        });

                    })
                }
            );
            console.log("page type: " + pageType);

            if (!(pageType == null || pageType == "unknown")) {
                switch (pageType) {
                    case "new song":
                        // inject the css file
                        chrome.scripting.insertCSS(
                            {
                                target: { tabId: tabId },
                                files: ["./src/css/newSong.css"]
                            }
                        );

                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: (() => {
                                    const oldChooser = document.querySelector('.primary_tag_chooser');
                                    oldChooser.style.display = 'none';

                                    const newChooser = document.createElement('div');
                                    newChooser.classList.add('modern-chooser');
                                    oldChooser.after(newChooser);

                                    const genres = [
                                        { value: 1434, name: 'Rap', emoji: '🎤' },
                                        { value: 16, name: 'Pop', emoji: '🎵' },
                                        { value: 352, name: 'R&B', emoji: '🎶' },
                                        { value: 567, name: 'Rock', emoji: '🎸' },
                                        { value: 413, name: 'Country', emoji: '🤠' },
                                        { value: 1452, name: 'Non-Music', emoji: '🎙️' },
                                    ];

                                    genres.forEach((genre) => {
                                        const genreButton = document.createElement('button');
                                        genreButton.innerHTML = `${genre.emoji} ${genre.name}`;
                                        genreButton.classList.add('modern-chooser-button');
                                        genreButton.addEventListener('click', (e) => {
                                            e.preventDefault();
                                            $('.modern-chooser-button').removeClass('modern-chooser-button-active');
                                            $(e.target).addClass('modern-chooser-button-active');
                                            $(`#song_primary_tag_id_${genre.value}`).click();
                                        });
                                        newChooser.appendChild(genreButton);
                                    });

                                    $(`#song_primary_tag_id_${genres[1].value}`).click();
                                    $(newChooser.children[1]).addClass('modern-chooser-button-active');


                                    // Lets change the text in the element ".lyrics_style_guide" to shown only if the first h4 child has clicked
                                    // First, change the h4 element parent to be the parent of his parent. then, make the styleGuide diaply be none unless the h4 is clicked.
                                    // Then, make the h4 element to be clicked and change the styleGuide display to be block
                                    const styleGuide = document.querySelector('.lyrics_style_guide');
                                    const h4 = styleGuide.querySelector('h4');
                                    /*make sure the h4 will be the first child*/
                                    styleGuide.parentElement.insertBefore(h4, styleGuide);
                                    styleGuide.style.opacity = '0';

                                    // when hovering the h4, change the styleGuide display to be block
                                    // make sure the animation will be smooth
                                    h4.addEventListener('mouseover', (e) => {
                                        styleGuide.style.opacity = '1';
                                    });

                                    // add mouse leave event
                                    h4.addEventListener('mouseleave', (e) => {
                                        // check if the mouse is not in the styleGuide
                                        if (!$('.lyrics_style_guides:hover').length) {
                                            styleGuide.style.opacity = '0';
                                        }
                                        else {
                                            // if the mouse is in the styleGuide, add mouse leave event to the styleGuide
                                            $('.lyrics_style_guides').mouseleave((e) => {
                                                styleGuide.style.opacity = '0';
                                            });
                                        }
                                    });

                                    // on every input which isn't child of .search-field, if "enter" is pressed, click the submit button (#song_submit)
                                    document.querySelectorAll('input').forEach((input) => {
                                        if (!input.parentElement.classList.contains('search-field')) {
                                            input.addEventListener('keydown', (e) => {
                                                if (e.key == 'Enter') {
                                                    document.querySelector('#song_submit').click();
                                                }
                                            });
                                        }
                                    });

                                    // if send clicked but (on of the ".required" inputs is empty) or (the input "#song_lyrics_state" is not checked and and textarea ".add_song_page-lyrics_textarea" is empty), add for all of them a red border
                                    // else, remove the red border
                                    document.querySelector('#song_submit').addEventListener('click', async (e) => {

                                        const clickedTag = document.querySelector('.modern-chooser-button-active');
                                        console.log(clickedTag);
                                        const requiredInputs = document.querySelectorAll('.required');
                                        const lyricsState = document.querySelector('#song_lyrics_state');
                                        const lyricsTextarea = document.querySelector('.add_song_page-lyrics_textarea');

                                        requiredInputs.forEach((input) => {
                                            if (input.value == '') {
                                                e.preventDefault();
                                                $(input).addClass('missing');

                                                input.addEventListener('input', (e) => {
                                                    $(e.target).removeClass('missing');

                                                    if (e.target.value == '') {
                                                        $(e.target).addClass('missing');
                                                    }
                                                });
                                            }
                                        });

                                        if (!lyricsState.checked && lyricsTextarea.value == '') {
                                            e.preventDefault();
                                            $(lyricsTextarea).addClass('missing');

                                            lyricsTextarea.addEventListener('input', (e) => {
                                                $(e.target).removeClass('missing');

                                                if (e.target.value == '' && !lyricsState.checked) {
                                                    $(e.target).addClass('missing');
                                                }
                                            });
                                        }

                                        // wait 100ms and click the tag button
                                        setTimeout(() => {
                                            clickedTag.click();
                                        }, 100);
                                    });
                                })
                            }
                        );
                        break;
                    case "firehose":
                        // inject the css file
                        chrome.scripting.insertCSS(
                            {
                                target: { tabId: tabId },
                                files: ["./src/css/firehose.css"]
                            }
                        );

                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: (() => {
                                    /* replace any 
                                        <input type="checkbox" name="x" [atttibutes]>
                                            <label for="x">
                                                text
                                            </label>
    
                                        with
    
                                        <input type="checkbox" name="x" class="chkboxm" [atttibutes]>
                                            <label for="x">
                                                <span class="chkboxmspan">
                                                </span>
                                                text
                                            </label>
                                    */
                                    $("fieldset input[type='checkbox']").each(function () {
                                        if ($(this).hasClass("chkboxm")) {
                                            return;
                                        }
                                        var attributes = "";
                                        for (var i = 0; i < this.attributes.length; i++) {
                                            attributes += this.attributes[i].name + "=\"" + this.attributes[i].value + "\" ";
                                        }
                                        $(this).replaceWith("<input type=\"checkbox\" name=\"" + this.name + "\" class=\"chkboxm\" " + attributes + "><label for=\"" + this.name + "\"><span class=\"chkboxmspan\"></span>" + $(this).next().html() + "</label>");
                                    });

                                    $("fieldset label").each(function () {
                                        if ($(this).children().length == 0) {
                                            $(this).remove();
                                        }
                                    });
                                })
                            }
                        );
                        break;
                    case 'home':
                        // add the "Home" button to the header
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: (() => {
                                    // change the background color of the page to 99E47A
                                    $("body").css("background-color", "#99E47A");
                                    // change the order of the elements in ".HomeContentdesktop__Container-sc-1xfg7l1-0.zvOxT"
                                    // the current order (by classes from the top to the bottom):
                                    //    1. PageHeaderdesktop__Container-bhx5ui-0 dmNhEr
                                    //    2. HomeContentdesktop__SkinContainer-sc-1xfg7l1-2 cQrBTG
                                    //    3. LeaderboardOrMarquee__Sticky-yjd3i4-0 dIgauN
                                    //    4. HomeContentdesktop__CenteredFlexColumn-sc-1xfg7l1-1 btjJtO (charts)
                                    //    5. HomeContentdesktop__Section-sc-1xfg7l1-4 gveVlf (videos)
                                    //    6. HomeContentdesktop__Section-sc-1xfg7l1-4 bBDcg (news)
                                    //    7. HomeContentdesktop__Section-sc-1xfg7l1-4 bMwme (community)
                                    //    8. PageFooterdesktop__Container-hz1fx1-0 boDKcJ (bottom)
                                    // the new order:
                                    //    1. PageHeaderdesktop__Container-bhx5ui-0 dmNhEr
                                    //    2. HomeContentdesktop__SkinContainer-sc-1xfg7l1-2 cQrBTG
                                    //    3. LeaderboardOrMarquee__Sticky-yjd3i4-0 dIgauN
                                    //    4. HomeContentdesktop__CenteredFlexColumn-sc-1xfg7l1-1 btjJtO (charts)
                                    //    5. HomeContentdesktop__Section-sc-1xfg7l1-4 bMwme (community)
                                    //    6. HomeContentdesktop__Section-sc-1xfg7l1-4 bBDcg (news)
                                    //    7. HomeContentdesktop__Section-sc-1xfg7l1-4 gveVlf (videos)
                                    //    8. PageFooterdesktop__Container-hz1fx1-0 boDKcJ (bottom)
                                    $("#featured-stories").remove();
                                    var container = $(".HomeContentdesktop__Container-sc-1xfg7l1-0.zvOxT");
                                    var children = container.children();
                                    container
                                        .empty()
                                        .append(children[0])
                                        .append(children[1])
                                        .append(children[2])
                                        .append(children[3])
                                        .append(children[6])
                                        .append(children[5])
                                        .append(children[4])
                                        .append(children[7]);


                                    document.querySelectorAll(".qsIlk, .dUTFUv, .kcEpRx, .jdaOmt, .klrmXf").forEach(function (e) {
                                        $(e).append("<div class='styled-background'></div>");
                                    });

                                    $(document).on('DOMNodeInserted', function (e) {
                                        if ($(e.target).is('.qsIlk, .dUTFUv, .kcEpRx, .jdaOmt, .klrmXf')) {
                                            $(e.target).append("<div class='styled-background'></div>");
                                        }
                                    });

                                    document.querySelectorAll(".qsIlk, .dUTFUv, .kcEpRx, .jdaOmt, .klrmXf").forEach(function (e) {
                                        $(e).mousemove(function (ee) {
                                            var parentOffset = $(this).offset();
                                            $(this).find('.styled-background').css({
                                                "top": ee.pageY - parentOffset.top,
                                                "left": ee.pageX - parentOffset.left
                                            });
                                        });
                                    });

                                    $(".SquareButton-sc-109lda7-0.hlrLfQ").last().click();

                                    // find the color that exists in the most of the image
                                    // and set it as the ouline color of the image
                                    // the image itself is inside a nonscript element which is son of the element ".SizedImage__Container-sc-1hyeaua-0"
                                    // the structure is like this:
                                    // <div class="jHQizl">
                                    //     <div class="kMmimq">
                                    //         <div class="SizedImage__Container-sc-1hyeaua-0">
                                    //             <noscript>
                                    //                 <img src="https://images.genius.com/e20ffe0ca1804e098cf0eda50e74bb03.1000x563x1.jpg" class="SizedImage__NoScript-sc-1hyeaua-2 UJCmI"/>
                                    //             </noscript>
                                    //         </div>
                                    //     </div>
                                    // </div>
                                    // so we need to get the src of the image inside the noscript element
                                    // and then use the color-thief library to get the color
                                    // and then set it as the outline color of the image

                                    // when hovering the element ".jHQizl .kMmimq", change a bit the position of their child ".SizedImage__Container-sc-1hyeaua-0" according to the position of the mouse
                                    // the child ".SizedImage__Container-sc-1hyeaua-0" is image of the artist
                                    // make sure it will move just a bit, so it will look like the image is moving with the mouse
                                    $(".jHQizl .kMmimq").mousemove(function (e) {
                                        var parentOffset = $(this).offset();
                                        var relX = e.pageX - parentOffset.left;
                                        var relY = e.pageY - parentOffset.top;
                                        // the propotion should change according how much the mouse close to the center of the element
                                        // the closer to the center, the bigger the propotion
                                        var propotion = 1 - Math.sqrt(Math.pow(relX - $(this).width() / 2, 2) + Math.pow(relY - $(this).height() / 2, 2)) / Math.sqrt(Math.pow($(this).width() / 2, 2) + Math.pow($(this).height() / 2, 2));
                                        $(this).find('.SizedImage__Container-sc-1hyeaua-0').css({
                                            "transform": "translate(" + (relX - $(this).width() / 2) * propotion / 10 + "px, " + (relY - $(this).height() / 2) * propotion / 10 + "px)"
                                        });
                                    });

                                    // make sure to cancel the effect when the mouse leaves the element ".jHQizl .kMmimq"
                                    $(".jHQizl .kMmimq").mouseleave(function (e) {
                                        $(this).find('.SizedImage__Container-sc-1hyeaua-0').css({
                                            "transform": "translate(0px, 0px)"
                                        });
                                    });

                                    // auto remove the background of the image of the artist when hovering the element ".jHQizl .kMmimq"
                                    // notice it isn't a css background, it's an image!
                                    const img = document.querySelector('.jHQizl .kMmimq');
                                    const apiKey = 'YOUR_API_KEY';

                                    remove.bg.init({ apiKey });

                                    remove.bg.removeBackgroundFromImage(img, (result) => {
                                        img.src = result.dataUrl;
                                    }, (e) => {
                                        console.log(e);
                                    });

                                })
                            }
                        );
                        break;
                    case 'album':
                        // create the tags & artists datalists
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: (() => {
                                    const getTagsList = async function () {
                                        let tagElem;

                                        await fetch("https://genius.com/new")
                                            .then(function (response) { return response.text() })
                                            .then((res) => {
                                                var parser = new DOMParser();
                                                var htmlDoc = parser.parseFromString(res, 'text/html');
                                                tagElem = htmlDoc.getElementsByName("tag_ids[]")[0];
                                            });

                                        return tagElem;
                                    }

                                    getTagsList().then((res) => {
                                        let replaces = {
                                            '&#039;': `'`,
                                            '&amp;': '&',
                                            '&lt;': '<',
                                            '&gt;': '>',
                                            '&quot;': '"'
                                        };

                                        var tempElem = document.createElement('datalist');
                                        tempElem.innerHTML = res.innerHTML;
                                        tempElem.setAttribute("id", "tagsList");

                                        for (let i = tempElem.childNodes.length; i > 0; i -= 2) {
                                            var tagNameFixed = tempElem.childNodes[i - 1].innerHTML.replace(/&[\w\d#]{2,5};/g, match => replaces[match]).replace(/  +/g, ' ');
                                            tempElem.childNodes[i - 1].innerHTML = tagNameFixed;
                                            tempElem.childNodes[i - 1].setAttribute("value", tagNameFixed);
                                        }

                                        document.body.appendChild(tempElem);

                                        var options = $('datalist#tagsList option');
                                        var arr = options.map(function (_, o) {
                                            return {
                                                text: $(o).text(),
                                                value: o.value
                                            };
                                        }).get();
                                        arr.sort(function (o1, o2) {
                                            return o1.text > o2.text ? 1 : o1.text < o2.text ? -1 : 0;
                                        });
                                        options.each(function (i, o) {
                                            o.value = arr[i].value;
                                            $(o).text(arr[i].t);
                                        });
                                    })

                                    const getArtistsList = async function () {
                                        let artistElem;
                                        const letters = "abcdefghijklmnopqrstuvwxyz0".split("");
                                        for (let i = 0; i < letters.length; i++) {
                                            await fetch("https://genius.com/artists-index/" + letters[i])
                                                .then(function (response) { return response.text() })
                                                .then((res) => {
                                                    var parser = new DOMParser();
                                                    var htmlDoc = parser.parseFromString(res, 'text/html');
                                                    artistElem = htmlDoc.getElementsByClassName("artists_index_list")[1];
                                                });

                                            if (artistElem != undefined) {
                                                break;
                                            }
                                        }
                                        return artistElem;
                                    }

                                    getArtistsList().then((res) => {
                                        // need to convert the ul to a select element with options for each li element in the ul element

                                        let replaces = {
                                            '&#039;': `'`,
                                            '&amp;': '&',
                                            '&lt;': '<',
                                            '&gt;': '>',
                                            '&quot;': '"'
                                        };

                                        var tempElem = document.createElement('datalist');
                                        tempElem.innerHTML = res.innerHTML;
                                        tempElem.setAttribute("id", "artistsList");

                                        for (let i = tempElem.childNodes.length; i > 0; i -= 2) {
                                            var artistNameFixed = tempElem.childNodes[i - 1].innerHTML//.replace(/&[\w\d#]{2,5};/g, match => replaces[match]).replace(/  +/g, ' ');
                                            tempElem.childNodes[i - 1].innerHTML = artistNameFixed;
                                            tempElem.childNodes[i - 1].setAttribute("value", artistNameFixed);
                                        }

                                        document.body.appendChild(tempElem);

                                        var options = $('datalist#artistsList option');
                                        var arr = options.map(function (_, o) {
                                            return {
                                                text: $(o).text(),
                                                value: o.value
                                            };
                                        }).get();
                                        arr.sort(function (o1, o2) {
                                            return o1.text > o2.text ? 1 : o1.text < o2.text ? -1 : 0;
                                        });
                                        options.each(function (i, o) {
                                            o.value = arr[i].value;
                                            $(o).text(arr[i].t);
                                        });
                                    });
                                })
                            }
                        );

                        // insert the css
                        chrome.scripting.insertCSS(
                            {
                                target: { tabId: tabId },
                                files: ["./src/css/album.css"]
                            }
                        );

                        // create the extension icon in the bottom right corner of the album details container
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: appendIcon
                            }
                        );

                        //create data mising / exsisting info, if the user chooses to do so
                        chrome.storage.local.get(["bios", "people", "releaseDate"], (res) => {
                            console.log(res);
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tabId },
                                    func: missingInfo,
                                    args: [res.bios, res.people, res.releaseDate]
                                }
                            );
                        });

                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: addSongAsTheNext
                            }
                        );

                        // get the album artwork
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: (() => {
                                    chrome.runtime.sendMessage({ "album_autolinkArtwork": [true] });
                                })
                            }
                        );

                        break;
                    case 'song':
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ["./lib/geniuspot/geniuspot.min.js"]
                        });

                        chrome.storage.local.get("ModernTextEditor", (res) => {
                            if (res.ModernTextEditor) {
                                chrome.scripting.executeScript({
                                    target: { tabId: tabId },
                                    func: ModernTextEditor
                                });
                            }
                        });

                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: () => {
                                    let isAnnotation = false;

                                    if (document.getElementsByClassName("annotation_sidebar_unit").length == 2) {
                                        isAnnotation = true;
                                    }
                                    else if (!!document.getElementsByClassName("Annotation__Container-l76qjh-0 cNCMgo").length) {
                                        isAnnotation = true;
                                    }

                                    chrome.runtime.sendMessage({ ["song_appendReplyButton"]: [isAnnotation] });
                                }
                            }
                        );
                        break;
                    case 'forums (main)':
                        chrome.scripting.insertCSS(
                            {
                                target: { tabId: tabId },
                                files: ["./src/css/forumsPages/main.css"]
                            }
                        );
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: replaceButtons,
                                args: [true, true]
                            }
                        );
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: () => {
                                    // disable sending the input ".discussions_search_bar-text_input" if there's less than 3 characters
                                    // notice it's input element
                                    // if there's less than and the user presses enter, the strok of the box will turn red
                                    // use jquery
                                    $(document).on('keypress', '.discussions_search_bar-text_input', function (e) {
                                        if (e.which == 13) {
                                            if (this.value.length < 3) {
                                                e.preventDefault();
                                                $(this).css("border-color", "red !important");
                                                // notice the user that the input is too short
                                                // dont use placeholder, it's not visible
                                                // use a span element, remove it after 3 seconds
                                                if (!document.getElementsByClassName("discussions_search_bar-text_input-error").length) {
                                                    var span = document.createElement("span");
                                                    span.textContent = "The input is too short (min 3 characters)";
                                                    span.setAttribute("class", "discussions_search_bar-text_input-error");
                                                    $(span).hide().appendTo(this.parentElement).fadeIn(500);
                                                    setTimeout(() => {
                                                        $(span).fadeOut(500, () => {
                                                            span.remove();
                                                        });
                                                    }, 2500);
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        );
                        break;
                    case 'forum':
                        chrome.scripting.insertCSS(
                            {
                                target: { tabId: tabId },
                                files: ["./src/css/forumsPages/forum.css"]
                            }
                        );
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: replaceButtons,
                                args: [true, true]
                            }
                        );

                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: () => {
                                    // disable sending the input ".discussions_search_bar-text_input" if there's less than 3 characters
                                    // notice it's input element
                                    // if there's less than and the user presses enter, the strok of the box will turn red
                                    // use jquery
                                    $(document).on('keypress', '.discussions_search_bar-text_input', function (e) {
                                        if (e.which == 13) {
                                            if (this.value.length < 3) {
                                                e.preventDefault();
                                                $(this).css("border-color", "red !important");
                                                // notice the user that the input is too short
                                                // dont use placeholder, it's not visible
                                                // use a span element, remove it after 3 seconds
                                                if (!document.getElementsByClassName("discussions_search_bar-text_input-error").length) {
                                                    var span = document.createElement("span");
                                                    span.textContent = "The input is too short (min 3 characters)";
                                                    span.setAttribute("class", "discussions_search_bar-text_input-error");
                                                    $(span).hide().appendTo(this.parentElement).fadeIn(500);
                                                    setTimeout(() => {
                                                        $(span).fadeOut(500, () => {
                                                            span.remove();
                                                        });
                                                    }, 2500);
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        );
                        break;
                    case 'forum thread':
                        chrome.scripting.insertCSS(
                            {
                                target: { tabId: tabId },
                                files: ["./src/css/forumsPages/thread.css"]
                            }
                        );
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabId },
                                func: () => {
                                    if (document.readyState === 'complete') {
                                        $(".reply_container h3").replaceWith('<h3 class="comment-title">Comment</h3>');
                                        $(".forum_post_container .avatar").first().removeClass("small");
                                        $(".user_badge").first().addClass("first_one");
                                        $(".body.embedly.embedly_pro").first().addClass("first_one");
                                        $('#groups_sidebar').remove();
                                        $('.group_summary').insertBefore('#container.mecha--deprecated');
                                        $('.discussion_thread-discussion_and_group_list').insertAfter('.group_summary');
                                        $('#group_container.discussion_thread').insertAfter('.discussion_thread-discussion_and_group_list');
                                        // look for .group_summary and add a onclick property to go to the href of the a child  element
                                        $('.group_summary').attr("onclick", "window.location.href=$('.group_summary a').attr('href')").css("cursor", "pointer");
                                        $('.group_summary').hover(function () {
                                            $('.header-primary').addClass('header-primary-hover');
                                        }, function () {
                                            $('.header-primary').removeClass('header-primary-hover');
                                        });

                                        $(document).ready(function () {
                                            var loadMoreButton = $('.pagination.no_auto_more a');
                                            var sendButton = $("#forum_post_submit");
                                            if (loadMoreButton.length) {
                                                loadMoreButton.text("Load older comments");
                                            }
                                            if (sendButton.length) {
                                                sendButton.val("Send");
                                            }
                                        });

                                        $(document).on("DOMNodeInserted", function (e) {
                                            if (e.target.classList.contains("error") && e.target.getAttribute("for") == "forum_post_body" && e.target.getAttribute("generated") == "true") {
                                                e.target.innerText = "Please enter a comment";

                                                // after 3 seconds, remove the error message
                                                setTimeout(() => {
                                                    e.target.remove();
                                                }, 3000);
                                            }
                                        });



                                        var observer = new MutationObserver(function (mutations) {
                                            mutations.forEach(function (mutation) {
                                                if (mutation.addedNodes) {
                                                    var newNodes = mutation.addedNodes;
                                                    for (var i = 0; i < newNodes.length; i++) {
                                                        var node = newNodes[i];
                                                        if (node.classList && node.classList.contains("pagination") && node.classList.contains("no_auto_more")) {
                                                            $(node).find("a").text("Load older comments");
                                                        }
                                                    }
                                                }
                                            });
                                        });

                                        var config = {
                                            childList: true,
                                            subtree: true
                                        };

                                        observer.observe(document.body, config);

                                        const userTooltip = $(".user_tooltip");
                                        if (userTooltip.length) {
                                            const toggleFollowBtn = userTooltip.find(".toggle_follow.button.new_status_unfollow");
                                            if (toggleFollowBtn.length) {
                                                const helperText = toggleFollowBtn.find(".toggle_follow-helper_text");
                                                if (helperText.length) {
                                                    helperText.text("Unfollow");
                                                    helperText.attr("data-is-changed", "true");
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        );
                        break;
                    case 'new post':
                        chrome.scripting.insertCSS(
                            {
                                target: { tabId: tabId },
                                files: ["./src/css/forumsPages/newPost.css"]
                            }
                        );
                }
            }
        });
    });
}
