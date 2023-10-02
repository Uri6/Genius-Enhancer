/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

import { replaceButtons } from "../sideFunctions/forum.ts";
import $ from "jquery";
import { addTooSmallLabel } from "../common/forums";

replaceButtons(true, true);

// disable sending the forums search input (.discussions_search_bar-text_input) if there's less than 3 characters
$(document).on("keypress", ".discussions_search_bar-text_input", function(e) {
    if (e.which !== 13) {
        return;
    }

    if (this.value.length >= 3) {
        return;
    }

    e.preventDefault();
    $(this).css("border-color", "red !important");

    if (document.getElementsByClassName("discussions_search_bar-text_input-error").length) {
        return;
    }

    addTooSmallLabel(this);
});
