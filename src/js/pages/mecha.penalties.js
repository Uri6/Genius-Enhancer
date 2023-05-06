export async function handlePenalties(tabId) {
    await chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            func: () => {
                const noManualPenalties = `<tr><td colspan="7" style="text-align: center;">No manual penalties on this page.</td></tr>`

                function iterNodesBySelector(selector, cb) {
                    for (const node of document.querySelectorAll(selector)) {
                        cb(node);
                    }
                }

                const condense = document.createElement("button", {
                    class: "button keep",
                });

                condense.onclick = () => {
                    iterNodesBySelector(".is-empty", (table) => table.parentElement.remove());
                };

                condense.innerText = "Hide Empty Pages";

                document.getElementById("container").appendChild(condense);

                const noteEmptyTables = () =>
                    iterNodesBySelector("tbody", (table) => {
                        if (table.children.length === 0) {
                            table.classList.add("is-empty");
                            table.innerHTML = noManualPenalties;
                        }
                    });

                function handleLoad() {
                    iterNodesBySelector("thead", (thead) => {
                        thead.remove();
                    })

                    iterNodesBySelector("tbody tr", (row) => {
                        if (row.children[1]?.innerText.includes("Automated suspension")) {
                            // if it does, we should remove it to save memory
                            row.remove();
                            return;
                        }

                        if (row.children[3]?.innerText?.startsWith("in")) {
                            row.children[3].innerText = "out " + row.children[3].innerText;
                        }

                        if (row.children[5]?.innerText?.length > 1) {
                            row.children[5].innerHTML = "Moderator: " + row.children[5].innerHTML;
                            row.children[4].remove();
                        }
                    });

                    iterNodesBySelector("a.button", (button) => {
                        if (!button.classList.contains("keep") && !button.innerText.includes("more")) {
                            console.log(button);
                            button.remove();
                        }
                    });

                    noteEmptyTables();
                }

                iterNodesBySelector("a.button", (button) => {
                    button.classList.add("keep");
                });

                handleLoad();
                new MutationObserver(handleLoad).observe(document, { childList: true, subtree: true });
            }
        }
    );
}
