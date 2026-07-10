const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const backgroundPath = path.join(root, manifest.background.service_worker);
const background = fs.readFileSync(backgroundPath, "utf8");

const referencedPaths = new Set([
    manifest.background.service_worker,
    manifest.action.default_popup,
    manifest.options_page,
    ...Object.values(manifest.icons || {}),
    ...Object.values(manifest.action.default_icon || {})
]);

function walk(directory, files = []) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if ([".git", ".yarn", "Builds", "node_modules"].includes(entry.name)) continue;
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(entryPath, files);
        else files.push(entryPath);
    }
    return files;
}

for (const sourcePath of walk(root).filter((file) => /\.(?:js|html)$/.test(file))) {
    const source = fs.readFileSync(sourcePath, "utf8");
    for (const match of source.matchAll(/["'](?:\.{1,2}\/|\/)((?:src|lib)\/[^"'?#]+\.(?:css|html|js|json|png|svg))["']/g)) {
        let referenced = match[1];
        if (match[0].startsWith('"../') || match[0].startsWith("'../")) {
            referenced = path.relative(root, path.resolve(path.dirname(sourcePath), match[0].slice(1, -1)));
        }
        referencedPaths.add(referenced.replaceAll("\\", "/"));
    }

    if (sourcePath.endsWith(".html")) {
        for (const match of source.matchAll(/(?:src|href)=["']([^"'?#]+)["']/g)) {
            const value = match[1];
            if (/^(?:https?:|#)/.test(value)) continue;
            const absolute = value.startsWith("/")
                ? path.join(root, value.slice(1))
                : path.resolve(path.dirname(sourcePath), value);
            referencedPaths.add(path.relative(root, absolute).replaceAll("\\", "/"));
        }
    }
}

const missing = [...referencedPaths]
    .map((file) => file.replace(/^[/\\]/, ""))
    .filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length) {
    console.error("Extension validation failed. Missing referenced files:");
    missing.forEach((file) => console.error(`- ${file}`));
    process.exit(1);
}

console.log(`Extension validation passed (${referencedPaths.size} referenced files checked).`);
