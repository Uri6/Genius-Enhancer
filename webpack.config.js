const { EsbuildPlugin } = require("esbuild-loader");
const globby = require("globby");
const sass = require("sass");
const fs = require("fs");

const isDev = process.env.NODE_ENV !== "production";

class ScssCompilerPlugin {
    apply(compiler) {
        // run the following after the build is complete
        compiler.hooks.afterEmit.tap("AfterBuildPlugin", () => {
            globby
                .sync(["src/css/**/*.scss"])
                .forEach((file) => {
                    // compile the scss files to css
                    const result = sass.compile(file)
                    // write the css to the corresponding file in /dist
                    const cssFile = file.replace("src/css", "dist/css").replace(".scss", ".css");
                    // create the output subdir if it doesn't exist
                    fs.mkdirSync(cssFile.substring(0, cssFile.lastIndexOf("/")), { recursive: true });
                    fs.writeFileSync(cssFile, result.css.toString());
                })
        })
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
                    }
                },
                {
                    test: /\.svg$/,
                    use: [
                        "svgo-loader",
                    ],
                    type: "asset/source",
                },
                {
                    test: /\.s?css$/,
                    use: [
                        "style-loader",
                        "css-loader",
                        "sass-loader",
                    ],
                },
                {
                    test: /\.png$/,
                    type: "asset/resource",
                    generator: {
                        filename: "img/[contenthash][ext]",
                    }
                }
            ]
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
            assetContainer: "./src/js/assetContainer.js"
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
            ]
        },
        plugins: [
            new ScssCompilerPlugin(),
        ],
        optimization: {
            minimizer: [
                new EsbuildPlugin({
                    target: "es2019",
                }),
            ],
        },
    }
]
