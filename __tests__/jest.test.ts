import { readFileSync } from "fs";
import path from "path";
import { ls } from "shelljs";
import assert from "yeoman-assert";
import helpers from "yeoman-test";

import { loadJSON } from "../__setup__/loadJSON";
import jest from "../src/jest";

let opts: helpers.RunContextSettings;
beforeEach(() => {
    opts = {
        tmpdir: true,
        resolved: require.resolve("../src/jest/index"),
        namespace: "npm-package:jest",
    };
});

async function itReadsFileExtensions(exts: string[], config: any) {
    it(`Reads file extensions: [${exts}]`, async () => {
        const tmpDir = await helpers.run(jest, opts)
            .withLocalConfig(config);
        const got = readFileSync(path.join(tmpDir, "jest.config.js")).toString();
        expect(got).toEqual(
            expect.stringContaining(`const moduleFileExtensions = [${exts.join(",")}]`),
        );
    });
}

describe("generator-jest", () => {
    describe("With default options", () => {
        it(`Creates "jest.config.js"`, async () => {
            const tmpDir = await helpers.run(jest, opts);
            assert.file("jest.config.js");
        });
        it(`Adds "test" script`, async () => {
            const tmpDir = await helpers.run(jest, opts);
            const got = loadJSON(tmpDir, "package.json");
            const { test, coveralls } = jest.scripts;
            expect(got).toMatchObject({
                scripts: {
                    test: expect.stringMatching(test),
                },
            });
        });
        it(`Does not add "coveralls" script`, async () => {
            const tmpDir = await helpers.run(jest, opts);
            const { test, coveralls } = jest.scripts;
            const got = JSON.parse(readFileSync(path.join(tmpDir, "package.json")).toString());
            expect(got).not.toMatchObject({
                scripts: {
                    coveralls: expect.stringMatching(coveralls),
                },
            });
        });
        it(`Does not emit transforms`, async () => {
            const tmpDir = await helpers.run(jest, opts);
            const got = readFileSync(path.join(tmpDir, "jest.config.js")).toString();
            expect(got).toEqual(
                expect.not.stringContaining(`transforms`), // : { \r\n"\.tsx?": "ts-jest", \r\n }`),
            );
        });
        it("installs jest", async () => {
            const context = helpers.run(jest, opts).withOptions({ "skip-install": false });
            const tmpDir = await context;
            const got = loadJSON(tmpDir, "package.json");

            const want = {
                devDependencies: { jest: expect.any(String) },
            };
            expect(ls("-A", tmpDir)).toHaveLength(5);

            expect(got).toMatchObject(want);
        }, 35000);
        itReadsFileExtensions(['"js"'], {});
    });
    describe("When installed with coveralls", () => {
        it(`Adds "coveralls" as a devDependency`, async () => {
            const tmpDir = await helpers.run(jest, opts)
                .withPrompts({ enableCoveralls: true });
            const want = {
                "generator-npm-package": {
                    devDependencies: expect.arrayContaining(["coveralls"]),
                },
            };
            const got = JSON.parse(readFileSync(path.join(tmpDir, ".yo-rc.json")).toString());
            expect(got).toMatchObject(want);
        });
        it(`Adds "coveralls" script`, async () => {
            const context = helpers.run(jest, opts)
                .withPrompts({ enableCoveralls: true });
            const tmpDir = await context;
            const { test, coveralls } = jest.scripts;
            const want = { scripts: { coveralls } };
            const got = JSON.parse(readFileSync(path.join(tmpDir, "package.json")).toString());
            expect(got).toMatchObject(want);
        });
    });
    describe("When installed beside Typescript", () => {
        it(`Emits transforms`, async () => {
            const tmpDir = await helpers.run(jest, opts)
                .withLocalConfig({ devDependencies: ["typescript"] });
            expect.stringContaining(`transforms: {/
        // "\.tsx?": "ts-jest",
    }`);
        });
        itReadsFileExtensions(['"ts"', '"js"'], { devDependencies: ["typescript"] });
        describe('When "resolveJsonModule = true"', () => {
            itReadsFileExtensions(['"ts"', '"js"', '"json"'], {
                devDependencies: ["typescript"],
                tsconfig: { resolveJsonModule: true },
            });
        });
        describe("When also installed beside React", () => {
            itReadsFileExtensions(['"ts"', '"tsx"', '"js"', '"jsx"'], {
                devDependencies: ["react", "typescript"],
            });
        });
    });
    describe("When installed beside React", () => {
        itReadsFileExtensions(['"js"', '"jsx"'], { devDependencies: ["react"] });
    });
});
