const path = require("path");
const shelljs = require("shelljs");

const dirs = shelljs.ls("-d", "./src/*/");

// Copy all template files from the source directory
// to the destination directory.
for (const dir of dirs) {
    if (shelljs.ls(dir).toString().match(/templates/)) {
        const src = path.join(dir, "templates");
        const dest = src.replace(/src/, "generators");
        shelljs.cp("-r", src, dest);
    }
}
