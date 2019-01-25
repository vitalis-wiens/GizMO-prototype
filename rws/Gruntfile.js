"use strict";

module.exports = function (grunt) {

    require("load-grunt-tasks")(grunt);
    var webpack = require("webpack");
    var webpackConfig = require("./webpack.config.js");

    var deployPath = "bin/";
    var testPath= "testing/";

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            deploy: deployPath,
            test: testPath

        },
        copy: {
            dependencies: {
                files: [
                    {expand: true, cwd: "node_modules/d3/", src: ["d3.min.js"], dest: deployPath },
                    {expand: true, cwd: "node_modules/d3/", src: ["d3.min.js"], dest: testPath }
                ]
            },
            static: {
                files: [
                    {expand: true, cwd: "src/", src: ["favicon.ico"], dest: testPath},
                    {expand: true, src: ["license.txt"], dest: testPath},
                    {expand: true, src: ["index.html"], dest: testPath},
                    {expand: true, src: ["controlling.js"], dest: testPath}
                ]
            },
            final:{
                files: [
                    {expand: true, cwd: "bin/", src: ["d3.min.js"], dest: testPath},
                    {expand: true, src: ["license.txt"], dest: testPath},
                    {expand: true, cwd: "bin/", src: ["rws.min.js"],  dest: testPath}

                ]
            }
        },
        htmlbuild: {
            release: {
                // required for removing the benchmark ontology from the selection menu
                src: "index.html",
                dest: testPath
            }
        },
        webpack: {
            options: webpackConfig,
            build: {
                plugins: webpackConfig.plugins.concat(
                    new webpack.optimize.DedupePlugin(),
                    new webpack.optimize.UglifyJsPlugin()
                )
            },
            "build-dev": {
                devtool: "sourcemap",
                debug: true
            }
        }

    });


    grunt.registerTask("default", ["release"]);
    grunt.registerTask("pre-js", ["clean:deploy", "clean:test", "copy"]);
    grunt.registerTask("post-js", ["copy"]);
    grunt.registerTask("package", ["pre-js", "webpack:build-dev","post-js", "htmlbuild:release"]);
    grunt.registerTask("release", ["pre-js", "webpack:build","post-js", "htmlbuild:release" ]);
};
