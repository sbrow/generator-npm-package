import { readFileSync } from "fs";
import { join } from "path";
import { ls } from "shelljs";
import assert from "yeoman-assert";
import { run, RunContextSettings } from "yeoman-test";

import { loadJSON } from "../../fs";
import Jest from ".";

let opts: RunContextSettings;
let app: string;

beforeAll(() => {
    app = join(__dirname, "index");
    opts = {
        tmpdir: true,
    };
});

async function itReadsFileExtensions(extensions: string[], config: any) {
    it(`Reads file extensions: [${extensions}]`, async () => {
        const tmpDir = await run(app, opts).withLocalConfig(config);
        const got = readFileSync(join(tmpDir, "jest.config.js")).toString();
        expect(got).toEqual(
            expect.stringContaining(
                `const moduleFileExtensions = [${extensions.join(",")}]`,
            ),
        );
    });
}

describe("generator-jest", () => {
    it(`Creates "jest.config.js"`, async () => {
        const tmpDir = await run(app, opts);
        assert.file("jest.config.js");
    });
    it(`Adds "test" script`, async () => {
        const tmpDir = await run(app, opts);
        const got = loadJSON(tmpDir, "package.json");
        const { test } = Jest.scripts;
        expect(got).toMatchObject({
            scripts: {
                test: expect.stringMatching(test),
            },
        });
    });
    it(`Does not add "coveralls" script`, async () => {
        const tmpDir = await run(app, opts);
        const { coveralls } = Jest.scripts;
        const got = JSON.parse(
            readFileSync(join(tmpDir, "package.json")).toString(),
        );
        expect(got).not.toMatchObject({
            scripts: {
                coveralls: expect.stringMatching(coveralls),
            },
        });
    });
    it(`Does not emit transforms`, async () => {
        const tmpDir = await run(app, opts);
        const got = readFileSync(join(tmpDir, "jest.config.js")).toString();
        expect(got).toEqual(
            expect.not.stringContaining(`transforms`), // : { \r\n"\.tsx?": "ts-jest", \r\n }`),
        );
    });
    it("installs jest", async () => {
        const context = run(app, opts).withOptions({
            "skip-install": true,
            useYarn: true,
        });
        const tmpDir = await context;
        const got = loadJSON(tmpDir, ".yo-rc.json");

        //  [".yo-rc.json", "jest.config.js", "package.json"]
        expect(ls("-A", tmpDir)).toHaveLength(3);

        const want = {
            "generator-npm-package": {
                devDependencies: expect.arrayContaining(["jest"]),
            },
        };
        expect(got).toMatchObject(want);
    });
    itReadsFileExtensions(['"js"'], {});
    describe("When installed with coveralls", () => {
        it(`Adds "coveralls" as a devDependency`, async () => {
            const tmpDir = await run(app, opts).withPrompts({
                enableCoveralls: true,
            });
            const want = {
                "generator-npm-package": {
                    devDependencies: expect.arrayContaining(["coveralls"]),
                },
            };
            const got = JSON.parse(
                readFileSync(join(tmpDir, ".yo-rc.json")).toString(),
            );
            expect(got).toMatchObject(want);
        });
    });
    describe("When installed beside Typescript", () => {
        it(`Emits transforms`, async () => {
            const tmpDir = await run(app, opts).withLocalConfig({
                devDependencies: ["typescript"],
            });
            expect.stringContaining(`transforms: {/
        // "\.tsx?": "ts-jest",
    }`);
        });
        itReadsFileExtensions(['"ts"', '"js"'], {
            devDependencies: ["typescript"],
        });
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
        itReadsFileExtensions(['"js"', '"jsx"'], {
            devDependencies: ["react"],
        });
    });
});
