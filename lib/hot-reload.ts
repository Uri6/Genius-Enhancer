/*
 * This file is part of the CRX Hot Reload project.
 */

function filesInDirectory(dir): Promise<string[]> {
    return new Promise((resolve) =>
        dir.createReader().readEntries((entries) =>
            Promise.all(
                entries
                    .filter((e) => e.name[0] !== ".")
                    .map((e) =>
                        e.isDirectory
                            ? filesInDirectory(e)
                            : new Promise((resolve) => e.file(resolve))
                    )
            )
                .then((files) => [].concat(...files))
                .then(resolve)
        )
    )
}

async function timestampForFilesInDirectory(dir): Promise<string> {
    let files = await filesInDirectory(dir)
    return files.map((f: any) => f.name + f.lastModifiedDate).join()
}

async function watchChanges(
    dir: FileSystemDirectoryEntry,
    lastTimestamp?: string
): Promise<void> {
    let timestamp = await timestampForFilesInDirectory(dir)

    if (!lastTimestamp || lastTimestamp === timestamp) {
        setTimeout(() => watchChanges(dir, timestamp), 1000) // retry after 1s
        return
    }

    // do the reload
    chrome.runtime.reload()
}

chrome.management.getSelf((self) => {
    if (self.installType === "development") {
        chrome.runtime.getPackageDirectoryEntry((dir) => watchChanges(dir))
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            // NB: see https://github.com/xpl/crx-hotreload/issues/5
            if (tabs[0]) {
                chrome.tabs.reload(tabs[0].id)
            }
        })
    }
})
