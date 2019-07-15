const packageJson = require("./packageJson");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const mode = process.env.NODE_ENV;
const outDir = "./app";
const entry = "main" in packageJson ? packageJson.main : "index.js";
const baseConfig = {
    entry,
    mode,
    module: { rules: [] },
    output: {
        filename: "main.js",
        path: outDir,
    },
};
module.exports = baseConfig;
