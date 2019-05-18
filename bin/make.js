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

/**
 * Create `${dist}/node_modules`
 */
const base = path.dirname(__dirname);
const dist = path.join(base, "generators");
const node_modules = path.join(dist, "node_modules");
shelljs.mkdir("-p", node_modules);
shelljs.cd(node_modules);
shelljs.ln("-s", path.resolve(dist), "./src");
