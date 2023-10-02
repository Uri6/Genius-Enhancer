/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

import { forums_modernTextEditor } from "../sideFunctions/forum";

global.browser.storage.local.get("ModernTextEditor", (res) => {
    if (res.ModernTextEditor) {
        forums_modernTextEditor();
    }
});
