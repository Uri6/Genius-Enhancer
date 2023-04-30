export async function handleFirehose(tabId) {
    await chrome.scripting.insertCSS(
        {
            target: { tabId: tabId },
            files: ["./src/css/firehose.css"]
        }
    );

    await chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            func: (() => {
                $("fieldset input[type='checkbox']").each(function() {
                    if ($(this).hasClass("chkboxm")) {
                        return;
                    }
                    let attributes = "";
                    for (let i = 0; i < this.attributes.length; i++) {
                        attributes += this.attributes[i].name + "=\"" + this.attributes[i].value + "\" ";
                    }
                    $(this).replaceWith("<input type=\"checkbox\" name=\"" + this.name + "\" class=\"chkboxm\" " + attributes + "><label for=\"" + this.name + "\"><span class=\"chkboxmspan\"></span>" + $(this).next().html() + "</label>");
                });

                $("fieldset label").each(function() {
                    if ($(this).children().length) {
                        $(this).remove();
                    }
                });
            })
        }
    );
}
