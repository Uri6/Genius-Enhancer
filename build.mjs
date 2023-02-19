import * as esbuild from "esbuild"
import { sassPlugin } from "esbuild-sass-plugin"

const commonOptions = {
    bundle: true,
    outdir: "build",
    platform: "browser",
    metafile: true,
    sourcemap: "external",
    loader: {
        ".svg": "text",
    },
    plugins: [
        sassPlugin({
            type: "css-text",
        })
    ]
}

async function analyze(buildDetails) {
    console.log(
        await esbuild.analyzeMetafile(buildDetails.metafile, {
            verbose: true,
        })
    )
}

const iifeBuildDetails = await esbuild.build({
    ...commonOptions,
    format: "iife",
    entryPoints: {
        "content": "src/js/content.js",
        "popup-script": "src/js/popup-script.js",
    },
})

await analyze(iifeBuildDetails)

const esmBuildDetails = await esbuild.build({
    ...commonOptions,
    format: "esm",
    treeShaking: true,
    splitting: true,
    entryPoints: {
        "background-script": "src/js/background.js",
    },
})

await analyze(esmBuildDetails)
