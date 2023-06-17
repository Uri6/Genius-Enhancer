/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

export function replaceButtons(createDiscussion, follow) {
    if (createDiscussion) {
        const createDiscussionElement = document.getElementsByClassName("create_discussion");
        for (var i = 0; i < createDiscussionElement.length; i++) {
            createDiscussionElement[i].innerHTML = `<svg class="ge-new-button" version="1.0" 
                                                    width="18pt" height="18pt" viewBox="0 0 512 512"
                                                    preserveAspectRatio="xMidYMid meet">
                                                    <g transform="translate(0,512) scale(0.1,-0.1)"
                                                    stroke="none">
                                                    <path d="M4275 5104 c-38 -8 -113 -35 -165 -60 l-95 -46 -1266 -1267 -1267
                                                    -1266 -191 -575 c-109 -330 -191 -591 -191 -612 0 -99 79 -178 177 -178 23 0
                                                    273 78 613 191 l575 191 1266 1267 1267 1266 46 95 c101 210 101 411 -1 620
                                                    -38 79 -60 109 -132 181 -72 73 -101 94 -181 132 -153 73 -299 93 -455 61z
                                                    m285 -385 c66 -32 123 -86 158 -154 23 -44 27 -62 27 -145 0 -81 -4 -103 -24
                                                    -145 -20 -40 -274 -299 -1233 -1260 l-1208 -1210 -352 -117 c-193 -65 -353
                                                    -116 -355 -115 -1 2 50 161 113 353 l116 349 1182 1183 c649 651 1198 1197
                                                    1219 1214 21 17 64 42 95 55 78 32 183 29 262 -8z"/>
                                                    <path d="M406 4735 c-141 -39 -272 -144 -338 -271 -73 -139 -69 11 -66 -2116
                                                    l3 -1913 26 -67 c14 -37 41 -89 58 -117 76 -118 226 -218 361 -241 46 -8 568
                                                    -10 1785 -8 l1720 3 69 27 c182 71 313 222 351 406 13 62 15 209 13 1036 l-3
                                                    962 -24 36 c-50 72 -137 104 -214 79 -45 -15 -102 -78 -116 -128 -7 -25 -11
                                                    -345 -11 -975 0 -637 -3 -946 -11 -965 -13 -34 -55 -80 -91 -99 -23 -12 -283
                                                    -14 -1724 -14 l-1697 0 -41 24 c-23 13 -51 42 -64 64 l-22 40 2 1889 3 1890
                                                    29 37 c16 21 47 47 70 57 39 18 89 19 1173 19 775 0 1141 3 1160 11 67 25 114
                                                    94 115 168 0 67 -31 124 -85 156 l-44 25 -1169 -1 c-950 -1 -1178 -3 -1218
                                                    -14z"/>
                                                    </g>
                                                    </svg>`;
        }
    }

    if (follow) {
        const unfollowElement = document.getElementsByClassName("new_status_unfollow");
        for (var i = 0; i < unfollowElement.length; i++) {
            unfollowElement[i].innerHTML = `<svg class="ge-new-button" version="1.0" 
                                            width="18pt" height="18pt" viewBox="0 0 512 512"
                                            preserveAspectRatio="xMidYMid meet">
                                            <g transform="translate(0,512) scale(0.024,-0.024)"
                                            stroke="none">
                                            <path d="M10005 21313 c-228 -14 -743 -76 -1064 -128
                                            -1187 -194 -2266 -563 -3346 -1146 -1097 -592 -2165 
                                            -1462 -3041 -2474 -911 -1054 -1538 -2163 -1989 -3518 
                                            -260 -779 -470 -1719 -514 -2292 -40 -521 -40 -1658 
                                            -1 -2175 28 -355 138 -962 270 -1485 206 -816 471 -1514 
                                            874 -2300 500 -976 1011 -1690 1762 -2465 996 -1027 1800 
                                            -1622 2979 -2205 812 -401 1328 -594 2130 -794 1311 -326
                                            2585 -411 3865 -255 997 120 2044 400 2860 762 612 272 
                                            1283 627 1696 897 856 561 1701 1317 2373 2125 1177 1415 
                                            1973 3105 2295 4875 167 918 214 1962 131 2905 -77 861 
                                            -270 1743 -561 2554 -394 1098 -988 2180 -1667 3033 -275
                                            347 -515 613 -896 993 -428 427 -695 661 -1112 975 -1104
                                            829 -2533 1508 -3864 1835 -615 151 -1304 252 -1900 280 
                                            -195 9 -1150 11 -1280 3z m1245 -1357 c574 -36 817 -63 
                                            1178 -135 1417 -282 2706 -853 3822 -1692 354 -267 595 
                                            -475 924 -799 492 -485 881 -954 1264 -1527 661 -987 1130 
                                            -2126 1381 -3355 125 -612 146 -865 146 -1783 0 -886 -20 
                                            -1155 -131 -1714 -247 -1251 -717 -2400 -1410 -3447 -338 
                                            -511 -701 -952 -1163 -1414 -431 -431 -805 -744 -1308 
                                            -1098 -1024 -717 -2199 -1214 -3505 -1481 -608 -124 -869
                                            -146 -1768 -146 -927 0 -1227 27 -1900 171 -2455 525 -4503
                                            1916 -5897 4004 -708 1062 -1189 2286 -1427 3631 -75 423 
                                            -91 686 -91 1489 0 913 20 1166 141 1770 303 1509 930 2869 
                                            1853 4015 911 1132 2092 2070 3348 2659 1000 470 1996 742 
                                            3148 861 184 19 1029 13 1395 -9z"/>
                                            <path d="M6555 11320 c-1083 -9 -1320 -18 -1426 -55 -88 -32 
                                            -247 -181 -296 -281 -50 -99 -58 -144 -58 -319 0 -175 8 -220 
                                            58 -319 49 -99 208 -249 296 -281 157 -55 546 -59 5536 -59 
                                            4990 0 5379 4 5536 59 88 32 247 182 296 281 50 99 58 144 58 
                                            319 0 175 -8 220 -58 319 -49 99 -208 249 -296 281 -68 24 -222 
                                            35 -606 46 -454 12 -7773 20 -9040 9z"/>
                                            </g>
                                            </svg>`;
        }

        const followElement = document.getElementsByClassName("new_status_follow");
        for (var i = 0; i < followElement.length; i++) {
            followElement[i].innerHTML = `<svg class="ge-new-button" version="1.0" 
                                            width="18pt" height="18pt" viewBox="0 0 512 512"
                                            preserveAspectRatio="xMidYMid meet">
                                            <g transform="translate(0,512) scale(0.1,-0.1)"
                                            stroke="none">
                                            <path d="M2370
                                            5113 c-371 -35 -653 -114 -961 -269 -406 -203 -782
                                            -548 -1029 -944 -179 -286 -309 -655 -362 -1025 -17
                                            -118 -17 -512 0 -630 42 -295 120 -553 242 -800 137
                                            -280 272 -468 494 -691 221 -220 412 -357 681 -489 
                                            188 -92 309 -137 500 -185 500 -126 1002 -102 1490 
                                            71 150 53 408 183 540 271 560 374 952 942 1095 1588
                                            33 150 50 291 57 465 15 426 -73 832 -263 1214 -124
                                            250 -263 447 -458 648 -214 222 -430 379 -711 518 -296
                                            146 -572 225 -900 255 -102 9 -333 11 -415 3z m545 -342
                                            c628 -106 1158 -448 1511 -977 179 -267 296 -573 351
                                            -909 24 -153 24 -497 0 -650 -108 -668 -474 -1222 -1042
                                            -1580 -243 -153 -537 -261 -850 -312 -154 -24 -497 -24 
                                            -650 1 -657 107 -1198 456 -1557 1006 -168 257 -281 557 
                                            -335 885 -24 153 -24 497 0 650 81 497 291 912 636 1255 
                                            382 381 862 605 1401 654 108 10 418 -4 535 -23z"/>
                                            <path d="M2495 3966
                                            c-37 -17 -70 -52 -84 -89 -7 -19 -11 -217 -11 -592 l0 
                                            -565 -579 -2 c-568 -3 -580 -3 -607 -24 -53 -39 -69 -71 
                                            -69 -134 0 -63 16 -95 69 -134 27 -21 39 -21 606 -24 l580
                                            -2 2 -580 c3 -567 3 -579 24 -606 39 -53 71 -69 134 -69 
                                            63 0 95 16 134 69 21 27 21 39 24 606 l2 580 580 2 c567 3
                                            579 3 606 24 53 39 69 71 69 134 0 63 -16 95 -69 134 -27 21
                                            -39 21 -606 24 l-580 2 -2 580 c-3 567 -3 579 -24 606 -11 
                                            15 -32 37 -46 47 -34 25 -113 32 -153 13z"/>
                                            </g>
                                            </svg>`;
        }
    }
}

export function forums_modernTextEditor() {
    if (
        $(".reply_container .required.markdown_preview_setup_complete")
            .length ||
        $("#new_discussion .required.markdown_preview_setup_complete").length
    ) {
        chrome.runtime.sendMessage({
            replaceTextarea: ["required markdown_preview_setup_complete"],
        });

        if ($(".reply_container .formatting_help").length) {
            $(".reply_container .formatting_help").css("display", "none");
        }

        if ($(".reply_container .markdown_preview_container").length) {
            $(".reply_container .markdown_preview_container").css(
                "display",
                "none"
            );
        }
    }
}
