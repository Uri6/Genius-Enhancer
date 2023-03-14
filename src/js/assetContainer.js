/* This is a hack to get webpack to include the extension icons, processed by file loader. */

import Size1 from "../images/icons/2/16x16.png";
import Size2 from "../images/icons/2/32x32.png";
import Size3 from "../images/icons/2/48x48.png";
import Size4 from "../images/icons/2/128x128.png";

// avoid them being optimized out
if (!Size1 || !Size2 || !Size3 || !Size4) {
    throw new Error("this shouldn't be possible");
}
