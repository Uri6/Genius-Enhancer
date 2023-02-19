import * as esbuild from "esbuild"
import { sassPlugin } from "esbuild-sass-plugin"

const details = await esbuild.build({
    entryPoints: {
        "hot-reload": "lib/hot-reload.ts",
        "content": "src/js/content.js",
        "popup-script": "src/js/popup-script.js",
        "background-script": "src/js/background.js",
    },
    bundle: true,
    outdir: "build",
    format: "iife",
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
})

console.log(
    await esbuild.analyzeMetafile(details.metafile, {
        verbose: true,
    })
)
