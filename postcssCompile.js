const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const sass = require("sass");

const scssFile = process.argv[2];
const targetFile = process.argv[3];

async function compile() {
    const result = sass.compile(scssFile, {
        loadPaths: [path.dirname(scssFile)],
        style: "expanded"
    });
    const processed = await postcss([autoprefixer()])
        .process(result.css, { from: scssFile, to: targetFile });

    fs.writeFileSync(targetFile, processed.css);
}

compile().catch((error) => {
    console.error(error);
    process.exit(1);
});
