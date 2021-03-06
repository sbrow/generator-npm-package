import { readFileSync } from "fs";
import { join } from "path";
import assert from "yeoman-assert";
import { run, RunContextSettings } from "yeoman-test";

import { name as packageName } from "../package.json";
import { load, loadJSON } from "../../fs";

let app: string;
let opts: RunContextSettings;

beforeEach(() => {
    app = join(__dirname, "index");
    opts = {
        tmpdir: true,
    };
});

describe("generator-webpack", () => {
    const file = "webpack.config.ts";

    it(`Creates "${file}"`, async () => {
        const tmpDir = await run(app, opts);
        assert.file(file);
    }, 5400);
    it(`Sets $NODE_ENV`, async () => {
        const tmpDir = await run(app, opts);
        const want = [
            'process.env.NODE_ENV = process.env.NODE_ENV || "development";',
            "const mode = process.env.NODE_ENV;",
        ].join("\n");
        const got = readFileSync(join(tmpDir, file)).toString();
        expect(got).toMatch(want);
    });
    it("Populates config", async () => {
        const tmpDir = await run(app, opts);
        let want = "module.exports = baseConfig;";
        const got = readFileSync(join(tmpDir, file)).toString();
        expect(got).toMatch(want);
        want = [
            "const baseConfig = {",
            "\tentry,",
            "\tmode,",
            "\tmodule: { rules: [] },",
            "\toutput: {",
            '\t\tfilename: "main.js",',
            "\t\tpath: outDir,",
            "\t},",
            "}",
        ]
            .join("\n")
            .replace(/\t/g, "    ");
        expect(got).toMatch(want);
    });
    it("Adds 'webpack' script", async () => {
        const tmpDir = await run(app, opts);
        const got = loadJSON(tmpDir, "package.json");
        const want = { scripts: { webpack: "webpack" } };
        expect(got).toMatchObject(want);
    });
    it("Does not add 'modules'", async () => {
        const tmpDir = await run(app, opts);
        const got = load(tmpDir, "webpack.config.ts");
        const want = /^\tmodule: {.*$/;
        expect(got).not.toMatch(want);
    });

    describe("When installed beside 'Typescript'", () => {
        it("Adds 'ts-loader' to config.modules.", async () => {
            const tmpDir = await run(app, opts).withLocalConfig({
                devDependencies: ["typescript"],
            });
            const got = require(require.resolve(
                join(tmpDir, "webpack.config.ts"),
            ));
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
            const tmpDir = await run(app, opts).withLocalConfig({
                devDependencies: ["typescript"],
            });
            const got = loadJSON(tmpDir, ".yo-rc.json")[packageName]
                .devDependencies;
            const want = "ts-loader";
            expect(got).toContain(want);
        });
    });
});
