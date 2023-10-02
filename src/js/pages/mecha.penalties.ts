/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

function iterNodesBySelector(selector, cb) {
    for (const node of document.querySelectorAll(selector)) {
        cb(node);
    }
}

const noteEmptyTables = () =>
    iterNodesBySelector("tbody", (table: HTMLTableElement) => {
        if (table.children.length === 0) {
            table.remove();
        }
    });

function handleLoad() {
    iterNodesBySelector("thead", (thead: HTMLTableElement) => {
        thead.remove();
    });

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

    iterNodesBySelector("a.button", (button: HTMLButtonElement) => {
        if (!button.classList.contains("keep") && !button.innerText.includes("more")) {
            button.remove();
        }
    });

    noteEmptyTables();
}

iterNodesBySelector("a.button", (button: HTMLButtonElement) => {
    button.classList.add("keep");
});

handleLoad();
new MutationObserver(handleLoad).observe(document, { childList: true, subtree: true });
