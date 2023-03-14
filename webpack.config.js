const { EsbuildPlugin } = require("esbuild-loader");
const globby = require("globby");
const sass = require("sass");
const CopyPlugin = require("copy-webpack-plugin");
const RawSource = require("webpack-sources/lib/RawSource");

const isDev = process.env.NODE_ENV !== "production";

class ScssCompilerPlugin {
    apply(compiler) {
        // run the following after the build is complete
        compiler.hooks.thisCompilation.tap("AfterBuildPlugin", (compilation) => {
            globby.sync(["src/css/**/*.scss"]).forEach((file) => {
                const result = sass.compile(file);

                const cssFile = file
                    .replace("src/css", "css")
                    .replace(".scss", ".css");

                // write the css to the corresponding file in /dist
                compilation.emitAsset(cssFile, new RawSource(result.css.toString()));
            });
        });
    }
}

module.exports = [
    {
        mode: isDev ? "development" : "production",
        entry: {
            background: "./background.js",
            popup: "./src/js/popup-script.js",
        },
        resolve: {
            extensions: [".js", ".ts", "mjs", "cjs", "cts"],
        },
        module: {
            rules: [
                {
                    test: /\.[jt]s$/,
                    loader: "esbuild-loader",
                    options: {
                        // JavaScript version to compile to
                        target: "es2019",
                    },
                },
                {
                    test: /\.svg$/,
                    use: ["svgo-loader"],
                    type: "asset/source",
                },
                {
                    test: /\.s?css$/,
                    use: ["style-loader", "css-loader", "sass-loader"],
                },
                {
                    test: /\.png$/,
                    type: "asset/resource",
                    generator: {
                        filename: "img/[contenthash][ext]",
                    },
                },
            ],
        },
        optimization: {
            minimizer: [
                new EsbuildPlugin({
                    target: "es2019",
                }),
            ],
        },
    },
    {
        /* This is a hack to get webpack to include the extension icons, processed by file loader. */
        /* Same deal as above, but with a different entry point and loader rules. */
        mode: "production",
        entry: {
            assetContainer: "./src/js/assetContainer.js",
        },
        module: {
            rules: [
                {
                    test: /\.png$/,
                    type: "asset/resource",
                    generator: {
                        filename: "img/ext/[name][ext]",
                    },
                },
            ],
        },
        plugins: [
            new ScssCompilerPlugin(),
            new CopyPlugin({
                patterns: [
                    {
                        from: "manifest.json",
                        to: "manifest.json",
                    },
                    {
                        from: "src/html/*.html",
                        to: "[name].html",
                    },
                ],
            }),
        ],
    },
];
