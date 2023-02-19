/*
* This code is licensed under the terms of the "LICENSE.md" file
* located in the root directory of this code package.
*/

import { handlePageType } from "./pageType";

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
                        let subNav = $(".PageHeaderdesktop__Subnavigation-bhx5ui-6.koeYQd");
                        if (subNav.length === 0) {
                            subNav = $(".header-nav_menu");
                        }
                        let logo = $(".PageHeaderLogo__Link-sc-175tsd3-0.jNXEyt");
                        if (logo.length === 0) {
                            logo = $(".logo_container");
                        }
                        subNav.insertAfter(logo);

                        // if there's an element with the class "lyrics_controls", when it sticky add the class "sticky" to this element
                        // make sure that the class "sticky" is removed when the element is not sticky
                        const lyricsControls = $(".lyrics_controls");
                        if (lyricsControls.length > 0) {
                            const sticky = lyricsControls.offset().top;
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
                        let searchBar = $(".PageHeaderSearchdesktop__Input-eom9vk-2.gajVFV");
                        if (searchBar.length === 0) {
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
                            const elementOffset = element.offset().top;
                            $("html, body").animate({ scrollTop: elementOffset }, 500);
                        }

                        const elementsToScroll = {
                            "/#top-songs": $(".HomeContentdesktop__Section-sc-1xfg7l1-4.bBDcg"),
                            "/#featured-stories": $(".PageGriddesktop-a6v82w-0.csQZGy"),
                            "/#videos": $(".HomeContentdesktop__Section-sc-1xfg7l1-4.gveVlf")
                        }

                        $(document).on("click", ".PageHeaderdesktop__Link-bhx5ui-4.jQULAr", function (e) {
                            const href = $(this).attr("href");
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

                            if (e.target.parentElement.classList.contains("global_search-search_icon") && e.target.tagName === "path" && e.target.getAttribute("d") === "M22 1.39L20.61 0 11 9.62 1.39 0 0 1.39 9.62 11 0 20.61 1.39 22 11 12.38 20.61 22 22 20.61 12.38 11 22 1.39") {
                                e.target.setAttribute("d", "M21.48 20.18L14.8 13.5a8.38 8.38 0 1 0-1.43 1.4l6.69 6.69zM2 8.31a6.32 6.32 0 1 1 6.32 6.32A6.32 6.32 0 0 1 2 8.31z");
                                e.target.parentElement.setAttribute("class", "global_search-search_icon");
                            }

                            setTimeout(() => {
                                if ($(e.target).attr("class") === "modal_window" && $(e.target).find(".modal_window-content").length > 0 && ($(e.target).find(".modal_window-content").find("conversation-with-user").length > 0 || $(e.target).find(".modal_window-content").find("conversation-messages").length > 0)) {

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

            if (!(pageType == null || pageType === "unknown")) {
                handlePageType(pageType);
            }
        });
    });
}
