const esbuild = require("esbuild");
const { analyzeMetafileSync } = esbuild;
const { sassPlugin } = require("esbuild-sass-plugin");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");

const entryPoints = [
    "src/css/pages/main.scss",
    "src/css/pages/darkmode.scss",

    "src/css/pages/forums/main.scss",
    "src/css/pages/forums/newPost.scss",
    "src/css/pages/forums/fonts.scss",
    "src/css/pages/forums/thread.scss",
    "src/css/pages/album.scss",
    "src/css/pages/firehose.scss",
    "src/css/pages/home.scss",
    "src/css/pages/newSong.scss",
    "src/css/pages/profile.scss",
    "src/css/pages/song.scss",

    "src/js/extension/popup.js",

    "src/js/globalContent.js",

    "src/js/pages/forumsMain.js",
    "src/js/pages/forum.js",
    "src/js/pages/newPost.ts",
    "src/js/pages/firehose.js",
    "src/js/pages/newSong.js",
    "src/js/pages/home.js",
    "src/js/pages/profile.js",
    "src/js/pages/song.js",
    "src/js/pages/album.js",
    "src/js/pages/mecha.penalties.ts"
];

const pcss = postcss([autoprefixer()]);

const pcssTransform = async (source, resolveDir) => {
    const { css } = await pcss.process(source, {
        from: resolveDir,
    });
    return css;
};

esbuild.build({
    entryPoints,
    bundle: true,
    outdir: "dist",
    minify: true,
    sourcemap: true,
    target: ["es2020", "chrome80", "firefox80"],
    splitting: false,
    format: "iife",
    metafile: true,
    platform: "browser",
    logLevel: "info",
    plugins: [
        sassPlugin({
            filter: /\.scss$/,
            transform: pcssTransform,
        }),
    ]
})
    .then((result) => {
        console.log(analyzeMetafileSync(result.metafile));
    })
    .catch((reason) => {
        throw reason;
    });
