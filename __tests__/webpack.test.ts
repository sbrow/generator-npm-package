import { readFileSync } from "fs";
import { join } from "path";
import assert from "yeoman-assert";
import { run, RunContextSettings } from "yeoman-test";

import { load, loadJSON } from "../__setup__/fs";
import Webpack from "../src/webpack";

const generator = "webpack";
let opts: RunContextSettings;
beforeEach(() => {
  opts = {
    tmpdir: true,
    resolved: require.resolve(`../src/${generator}/index`),
    namespace: `npm-package:${generator}`,
  };
});

describe("generator-webpack", () => {
  const file = "webpack.config.js";

    describe("Default", () => {
        it(`Creates "${file}"`, async () => {
            const tmpDir = await run(Webpack, opts);
            assert.file(file);
        });
        it(`Sets $NODE_ENV`, async () => {
            const tmpDir = await run(Webpack, opts);
            const want = [
                'process.env.NODE_ENV = process.env.NODE_ENV || "development";',
                "const mode = process.env.NODE_ENV;",
            ].join("\r\n");
            const got = readFileSync(join(tmpDir, file)).toString();
            expect(got).toMatch(want);
        });
        it("Populates config", async () => {
            const tmpDir = await run(Webpack, opts);
            let want = ["module.exports = [", "\tbaseConfig,", "]"].join(
                "\r\n",
            );
            const got = readFileSync(join(tmpDir, file)).toString();
            expect(got).toMatch(want);
            want = [
                "const baseConfig = {",
                "\tentry: packageJson.main,",
                "\tmode,",
                "\toutput: {",
                '\t\tfilename: "main.js",',
                "\t\tpath: outDir,",
                "\t},",
                "}",
            ].join("\r\n");
            expect(got).toMatch(want);
        });
        it("Adds 'webpack' script", async () => {
            const tmpDir = await run(Webpack, opts);
            const got = loadJSON(tmpDir, "package.json");
            const want = { scripts: { webpack: "webpack" } };
            expect(got).toMatchObject(want);
        });
        it("Does not add 'modules'", async () => {
            const tmpDir = await run(Webpack, opts);
            const got = load(tmpDir, "webpack.config.js");
            const want = /^\tmodule: {.*$/;
            expect(got).not.toMatch(want);
        });
    });
    it(`Sets $NODE_ENV`, async () => {
      const tmpDir = await run(Webpack, opts);
      const want = [
        'process.env.NODE_ENV = process.env.NODE_ENV || "development";',
        "const mode = process.env.NODE_ENV;",
      ].join("\r\n");
      const got = readFileSync(join(tmpDir, file)).toString();
      expect(got).toMatch(want);
    });
    it("Populates config", async () => {
      const tmpDir = await run(Webpack, opts);
      let want = ["module.exports = [", "\tbaseConfig,", "]"].join("\r\n");
      const got = readFileSync(join(tmpDir, file)).toString();
      expect(got).toMatch(want);
      want = [
        "const baseConfig = {",
        "\tentry: packageJson.main,",
        "\tmode,",
        "\toutput: {",
        '\t\tfilename: "main.js",',
        "\t\tpath: outDir,",
        "\t},",
        "}",
      ].join("\r\n");
      expect(got).toMatch(want);
    });
    it("Adds 'webpack' script", async () => {
      const tmpDir = await run(Webpack, opts);
      const got = loadJSON(tmpDir, "package.json");
      const want = { scripts: { webpack: "webpack" } };
      expect(got).toMatchObject(want);
    });
    it("Does not add 'modules'", async () => {
      const tmpDir = await run(Webpack, opts);
      const got = load(tmpDir, "webpack.config.js");
      const want = /^\tmodule: {.*$/;
      expect(got).not.toMatch(want);
    });
  });

    describe("When installed beside 'Typescript'", () => {
        it("Adds 'ts-loader' to config.modules.", async () => {
            const tmpDir = await run(Webpack, opts).withLocalConfig({
                devDependencies: ["typescript"],
            });
            const got = require(require.resolve(
                join(tmpDir, "webpack.config.js"),
            ))[0];
            const want = {
                module: {
                    rules: [
                        {
                            test: /\.tsx?$/,
                            use: "ts-loader",
                        },
                    ],
                },
            };
            expect(got).toMatchObject(want);
        });
        it("Adds ts-loader as a DevDependency", async () => {
            const tmpDir = await run(Webpack, opts).withLocalConfig({
                devDependencies: ["typescript"],
            });
            const got = loadJSON(tmpDir, ".yo-rc.json")["generator-npm-package"]
                .devDependencies;
            const want = "ts-loader";
            expect(got).toContain(want);
        });
    });
    it("Adds ts-loader as a DevDependency", async () => {
      const tmpDir = await run(Webpack, opts).withLocalConfig({
        devDependencies: ["typescript"],
      });
      const got = loadJSON(tmpDir, ".yo-rc.json")["generator-npm-package"]
        .devDependencies;
      const want = "ts-loader";
      expect(got).toContain(want);
    });
  });
});
