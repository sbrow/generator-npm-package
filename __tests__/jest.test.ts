import fs from "fs";
import path from "path";
import { ls } from "shelljs";
import assert from "yeoman-assert";
import helpers from "yeoman-test";

import Jest from "../src/jest";

let opts: helpers.RunContextSettings;
beforeEach(() => {
    opts = {
        resolved: require.resolve("../src/jest/index"),
        namespace: "npm-package:jest",
        tmpdir: true,
    };
});

describe("generator-jest", () => {
    describe("#writing", () => {
        const file = "jest.config.js";

        it(`Creates "${file}"`, async () => {
            const tmpDir = await helpers.run(Jest, opts);
            assert.file(file);
        });
        it(`Adds "test" script`, async () => {
            const tmpDir = await helpers.run(Jest, opts);
            const got = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json")).toString());
            const { test, coveralls } = Jest.scripts;
            expect(got).toMatchObject({
                scripts: {
                    test: expect.stringMatching(test),
                },
            });
        });
        it(`Does not add "coveralls" script`, async () => {
            const tmpDir = await helpers.run(Jest, opts);
            const { test, coveralls } = Jest.scripts;
            const got = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json")).toString());
            expect(got).not.toMatchObject({
                scripts: {
                    coveralls: expect.stringMatching(coveralls),
                },
            });
        });
        it("installs jest", async () => {
            const context = helpers.run(Jest, opts);
            const tmpDir = await context;
            const got = JSON.parse(fs.readFileSync(path.join(tmpDir, ".yo-rc.json")).toString());
            const want = {
                "generator-npm-package":
                    { devDependencies: ["jest"] },
            };
            expect(ls("-A", tmpDir)).toHaveLength(3);
            expect(got).toMatchObject(want);
        });
        it(`Adds "coveralls" as a devDependency`, async () => {
            const tmpDir = await helpers.run(Jest, opts)
                .withPrompts({ enableCoveralls: true });
            const want = {
                "generator-npm-package": {
                    devDependencies: expect.arrayContaining(["coveralls"]),
                },
            };
            const got = JSON.parse(fs.readFileSync(path.join(tmpDir, ".yo-rc.json")).toString());
            expect(got).toMatchObject(want);
        });
        it(`Adds "coveralls" script`, async () => {
            const context = helpers.run(Jest, opts)
                .withPrompts({ enableCoveralls: true });
            const tmpDir = await context;
            const { test, coveralls } = Jest.scripts;
            const want = { scripts: { coveralls } };
            const got = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json")).toString());
            expect(got).toMatchObject(want);
        });

        it(`Emits transforms`, async () => {
            const tmpDir = await helpers.run(Jest, opts)
                .withLocalConfig({ devDependencies: ["typescript"] });
            expect.stringContaining(`transforms: {/
        // "\.tsx?": "ts-jest",
    }`);
        });
        it(`Does not emit transforms`, async () => {
            const tmpDir = await helpers.run(Jest, opts);
            const got = fs.readFileSync(path.join(tmpDir, "jest.config.js")).toString();
            expect(got).toEqual(
                expect.not.stringContaining(`transforms`), // : { \r\n"\.tsx?": "ts-jest", \r\n }`),
            );
        });
        test.each`
        config | want
        ${{}}  | ${'"js"'}
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
                const got = fs.readFileSync(path.join(tmpDir, "jest.config.js")).toString();
                expect(got).toEqual(
                    expect.stringContaining(`const moduleFileExtensions = [${want}]`),
                );
            });
    });
});
