/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer-Beta/blob/main/LICENSE.md
 *
 * @fileoverview
 * Handles the home page redesign
 */

/**
 * Changes the background color of the page, rearranges elements, and adds background for elements
 *
 * @async
 * @param {number} tabId - The ID of the tab to handle the home page redesign for
 */
export async function handleHome(tabId) {
    await chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            func: (() => {
                // Change the background color of the page
                $("body").css("background-color", "#99E47A");

                /*
                 * Rearrange the order of the elements in ".HomeContentdesktop__Container-sc-1xfg7l1-0.zvOxT"
                 * to the following:
                 * 1. PageHeaderdesktop__Container-bhx5ui-0 dmNhEr
                 * 2. HomeContentdesktop__SkinContainer-sc-1xfg7l1-2 cQrBTG
                 * 3. LeaderboardOrMarquee__Sticky-yjd3i4-0 dIgauN
                 * 4. HomeContentdesktop__CenteredFlexColumn-sc-1xfg7l1-1 btjJtO (charts)
                 * 5. HomeContentdesktop__Section-sc-1xfg7l1-4 bMwme (community)
                 * 6. HomeContentdesktop__Section-sc-1xfg7l1-4 bBDcg (news)
                 * 7. HomeContentdesktop__Section-sc-1xfg7l1-4 gveVlf (videos)
                 * 8. PageFooterdesktop__Container-hz1fx1-0 boDKcJ (bottom)
                 */
                $("#featured-stories").remove();
                const container = $(".HomeContentdesktop__Container-sc-1xfg7l1-0.zvOxT");
                const children = container.children();
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

                // Add a background for certain elements
                document.querySelectorAll(".qsIlk, .dUTFUv, .kcEpRx, .jdaOmt, .klrmXf").forEach(function (e) {
                    $(e).append("<div class='styled-background'></div>");
                });

                $(document).on("DOMNodeInserted", (e) => {
                    if ($(e.target).is(".qsIlk, .dUTFUv, .kcEpRx, .jdaOmt, .klrmXf")) {
                        $(e.target).append("<div class='styled-background'></div>");
                    }
                });

                // When hovering certain elements, change the position of their child ".styled-background" according to the position of the mouse
                document.querySelectorAll(".qsIlk, .dUTFUv, .kcEpRx, .jdaOmt, .klrmXf").forEach(function (e) {
                    $(e).on("mousemove", function (ee) {
                        const parentOffset = $(this).offset();
                        $(this).find(".styled-background").css({
                            "top": ee.pageY - parentOffset.top,
                            "left": ee.pageX - parentOffset.left
                        });
                    });
                });

                // Click on the "load more videos" button
                $(".SquareButton-sc-109lda7-0.hlrLfQ").last().click();

                // When hovering the main video thumbnail, change a bit the position of the image (.SizedImage__Container-sc-1hyeaua-0) according to the position of the mouse
                $(".jHQizl .kMmimq").on("mousemove", function (e) {
                    const parentOffset = $(this).offset();
                    const relX = e.pageX - parentOffset.left;
                    const relY = e.pageY - parentOffset.top;
                    const propotion = 1 - Math.sqrt(Math.pow(relX - $(this).width() / 2, 2) + Math.pow(relY - $(this).height() / 2, 2)) / Math.sqrt(Math.pow($(this).width() / 2, 2) + Math.pow($(this).height() / 2, 2));
                    
                    $(this).find(".SizedImage__Container-sc-1hyeaua-0").css({
                        "transform": "translate(" + (relX - $(this).width() / 2) * propotion / 10 + "px, " + (relY - $(this).height() / 2) * propotion / 10 + "px)"
                    });
                });

                // Revert the image to the original position when the mouse leaves the thumbnail (.jHQizl .kMmimq)
                $(".jHQizl .kMmimq").on("mouseleave", function () {
                    $(this).find(".SizedImage__Container-sc-1hyeaua-0").css({
                        "transform": "translate(0px, 0px)"
                    });
                });
            })
        }
    );
}