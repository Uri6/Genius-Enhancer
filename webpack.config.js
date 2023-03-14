const { EsbuildPlugin } = require("esbuild-loader");

module.exports = [
    {
        mode: "production",
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
                    }
                }
            ]
        },
    }
]
