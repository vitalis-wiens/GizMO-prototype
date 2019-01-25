var path = require("path");
var webpack = require("webpack");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    cache: true,
    entry: {
        wapi: "./src/init.js"
    },
    output: {
        path: path.join(__dirname, "bin/"),
        publicPath: "",
        filename: "wapi.min.js",
        chunkFilename: "[chunkhash].js",
        libraryTarget: "assign",
        library: "[name]"
    },


    plugins: [
        new webpack.ProvidePlugin({
            d3: "d3"
        })
    ],
    externals: {
        "d3": "d3"
    }
};
