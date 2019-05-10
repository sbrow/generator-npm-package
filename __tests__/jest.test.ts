import fs from "fs";
import path from "path";
import assert from "yeoman-assert";
import helpers from "yeoman-test";

import Jest from "../src/jest";

const opts = {
    resolved: require.resolve("../src/jest/index"),
    namespace: "npm-package:jest",
};
describe("generator-jest", () => {
    describe("#writing", () => {
        const file = "jest.config.js";

        it(`Creates "${file}"`, async () => {
            const tmpDir = await helpers.run(Jest, opts);
            assert.file(file);
        });
        it(`Adds "test" script`, async () => {
            const tmpDir = await helpers.run(Jest, opts);
            const packageJSON = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json")).toString());
            const { test, coveralls } = Jest.prototype.scripts;
            expect.objectContaining({
                scripts: {
                    test: expect.stringMatching(test),
                },
            });
            expect.not.objectContaining({
                scripts: {
                    coveralls: expect.stringMatching(coveralls),
                },
            });
        });
        it(`Does not add "coveralls" script`, async () => {
            const tmpDir = await helpers.run(Jest, opts);
            const { test, coveralls } = Jest.prototype.scripts;
            const got = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json")).toString());
            expect.not.objectContaining({
                scripts: {
                    coveralls: expect.stringMatching(coveralls),
                },
            });
        });
        it(`Adds "coveralls" as a devDependency`, async () => {
            const tmpDir = await helpers.run(Jest, opts)
                .withPrompts([{ enableCoveralls: true }]);
            const got = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json")).toString());
            expect.objectContaining({
                "generator-npm-package": {
                    devDependencies: expect.arrayContaining(["coveralls"]),
                },
            });
        });
        it(`Adds "coveralls" script`, async () => {
            const tmpDir = await helpers.run(Jest, opts)
                .withPrompts([{ enableCoveralls: true }]);
            const { test, coveralls } = Jest.prototype.scripts;
            const got = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json")).toString());
            expect.objectContaining({
                scripts: {
                    coveralls: expect.stringMatching(coveralls),
                },
            });
        });

        it(`Emits transforms`, async () => {
            const tmpDir = await helpers.run(Jest, opts)
                .withLocalConfig({ devDependencies: ["typescript"] });
            expect.stringContaining(`transforms: {
        "\.tsx?": "ts-jest",
    }`);
        });
        it(`Does not emit transforms`, async () => {
            const tmpDir = await helpers.run(Jest, opts);
            expect.not.stringContaining(`transforms: {
        "\.tsx?": "ts-jest",
    }`);
        });
        test.each`
        config | want
        ${{}}  | ${"js"}
        ${{ devDependencies: ["react"] }
            }  | ${'"js","jsx"'}
        ${{
                devDependencies: ["typescript"],
                tsconfig: { resolveJsonModule: false },
            }} | ${'"ts","js"'}
        ${{
                devDependencies: ["typescript"],
                tsconfig: { resolveJsonModule: true },
            }} | ${'"ts","js","json"'}
        ${{
                devDependencies: [
                    "react",
                    "typescript",
                ],
                tsconfig: { resolveJsonModule: true },
            }} | ${'"ts","tsx","js","jsx","json"'}
        `(`Has extensions '[$want]'`, async ({ config, want }) => {
                const tmpDir = await helpers.run(Jest, opts)
                    .withLocalConfig(config);
                expect.stringContaining(`const moduleFileExtensions = [${want}]`);
            });
    });
});
