#!/usr/bin/env node
module.exports = function () {
    const fs = require('fs'),
        os = require("os"),
        readline = require("readline"),
        deferral = require('q').defer();

    const perfPluginStr = "apply plugin: 'com.google.firebase.firebase-perf'"
    let perfPluginStrExists = false
    const classpathsStrToVerify = "com.google.firebase:perf-plugin:1.4.2"
    const classpathsStr = `\t\tclasspath "${classpathsStrToVerify}"`
    const rootBuildGradlePath = "platforms/android/build.gradle"
    const appBuildGradlePath = "platforms/android/app/build.gradle"

    const lineReader = readline.createInterface({
        terminal: false,
        input: fs.createReadStream(rootBuildGradlePath)
    });
    lineReader.on("line", function (line) {
        if (!line.includes(classpathsStrToVerify)) {
            fs.appendFileSync('./build.gradle', line.toString() + os.EOL);
            if (/.* dependencies \{.*/.test(line)) {
                fs.appendFileSync('./build.gradle', classpathsStr + os.EOL);
            }
        }

    }).on("close", function () {
        fs.rename('./build.gradle', rootBuildGradlePath, deferral.resolve);
    });

    const lineReaderApp = readline.createInterface({
        terminal: false,
        input: fs.createReadStream(appBuildGradlePath)
    });
    lineReaderApp.on("line", function (line) {
        if (line.includes(perfPluginStr)) {
            perfPluginStrExists = true;
        }
    });
    lineReaderApp.on("close", function () {
        if (!perfPluginStrExists) {
            fs.appendFileSync('./' + appBuildGradlePath, perfPluginStr + os.EOL);
            fs.rename('./' + appBuildGradlePath, appBuildGradlePath, deferral.resolve);
        }

    });

    return deferral.promise;
};
