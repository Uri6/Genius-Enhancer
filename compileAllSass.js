const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function findSassFiles(directory, files = []) {
    for (const entry of fs.readdirSync(directory)) {
        const filePath = path.join(directory, entry);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            if (![".git", ".yarn", "Builds", "node_modules"].includes(entry)) {
                findSassFiles(filePath, files);
            }
        } else if (path.extname(filePath) === ".scss") {
            files.push(filePath);
        }
    }

    return files;
}

const compiler = path.join(__dirname, "postcssCompile.js");

for (const scssFile of findSassFiles(__dirname)) {
    const targetFile = scssFile.replace(/\.scss$/, ".css");
    console.log(`Compiling ${path.relative(__dirname, scssFile)}`);

    const result = spawnSync(process.execPath, [compiler, scssFile, targetFile], {
        stdio: "inherit"
    });

    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
}
