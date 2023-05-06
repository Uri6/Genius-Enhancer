export async function handleHome(tabId) {
    await chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            func: (() => {
                $("body").css("background-color", "#99E47A");
                /*
                    change the order of the elements in ".HomeContentdesktop__Container-sc-1xfg7l1-0.zvOxT"
                    the current order (by classes, top to bottom):
                        1. PageHeaderdesktop__Container-bhx5ui-0 dmNhEr
                        2. HomeContentdesktop__SkinContainer-sc-1xfg7l1-2 cQrBTG
                        3. LeaderboardOrMarquee__Sticky-yjd3i4-0 dIgauN
                        4. HomeContentdesktop__CenteredFlexColumn-sc-1xfg7l1-1 btjJtO (charts)
                        5. HomeContentdesktop__Section-sc-1xfg7l1-4 gveVlf (videos)
                        6. HomeContentdesktop__Section-sc-1xfg7l1-4 bBDcg (news)
                        7. HomeContentdesktop__Section-sc-1xfg7l1-4 bMwme (community)
                        8. PageFooterdesktop__Container-hz1fx1-0 boDKcJ (bottom)
                    the new order:
                        1. PageHeaderdesktop__Container-bhx5ui-0 dmNhEr
                        2. HomeContentdesktop__SkinContainer-sc-1xfg7l1-2 cQrBTG
                        3. LeaderboardOrMarquee__Sticky-yjd3i4-0 dIgauN
                        4. HomeContentdesktop__CenteredFlexColumn-sc-1xfg7l1-1 btjJtO (charts)
                        5. HomeContentdesktop__Section-sc-1xfg7l1-4 bMwme (community)
                        6. HomeContentdesktop__Section-sc-1xfg7l1-4 bBDcg (news)
                        7. HomeContentdesktop__Section-sc-1xfg7l1-4 gveVlf (videos)
                        8. PageFooterdesktop__Container-hz1fx1-0 boDKcJ (bottom)
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

                document.querySelectorAll(".qsIlk, .dUTFUv, .kcEpRx, .jdaOmt, .klrmXf").forEach(function (e) {
                    $(e).append("<div class='styled-background'></div>");
                });

                $(document).on("DOMNodeInserted", (e) => {
                    if ($(e.target).is(".qsIlk, .dUTFUv, .kcEpRx, .jdaOmt, .klrmXf")) {
                        $(e.target).append("<div class='styled-background'></div>");
                    }
                });

                document.querySelectorAll(".qsIlk, .dUTFUv, .kcEpRx, .jdaOmt, .klrmXf").forEach(function (e) {
                    $(e).on("mousemove", function (ee) {
                        const parentOffset = $(this).offset();
                        $(this).find(".styled-background").css({
                            "top": ee.pageY - parentOffset.top,
                            "left": ee.pageX - parentOffset.left
                        });
                    });
                });

                $(".SquareButton-sc-109lda7-0.hlrLfQ").last().click();

                // when hovering the element ".jHQizl .kMmimq", change a bit the position of their child ".SizedImage__Container-sc-1hyeaua-0" according to the position of the mouse
                // the child ".SizedImage__Container-sc-1hyeaua-0" is image of the artist
                // make sure it will move just a bit, so it will look like the image is moving with the mouse
                $(".jHQizl .kMmimq").on("mousemove", function (e) {
                    const parentOffset = $(this).offset();
                    const relX = e.pageX - parentOffset.left;
                    const relY = e.pageY - parentOffset.top;
                    // the propotion should change according how much the mouse close to the center of the element
                    // the closer to the center, the bigger the propotion
                    const propotion = 1 - Math.sqrt(Math.pow(relX - $(this).width() / 2, 2) + Math.pow(relY - $(this).height() / 2, 2)) / Math.sqrt(Math.pow($(this).width() / 2, 2) + Math.pow($(this).height() / 2, 2));
                    $(this).find(".SizedImage__Container-sc-1hyeaua-0").css({
                        "transform": "translate(" + (relX - $(this).width() / 2) * propotion / 10 + "px, " + (relY - $(this).height() / 2) * propotion / 10 + "px)"
                    });
                });

                // make sure to cancel the effect when the mouse leaves the element ".jHQizl .kMmimq"
                $(".jHQizl .kMmimq").on("mouseleave", function () {
                    $(this).find(".SizedImage__Container-sc-1hyeaua-0").css({
                        "transform": "translate(0px, 0px)"
                    });
                });
            })
        }
    );
}
