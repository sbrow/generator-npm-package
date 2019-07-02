import { join } from "path";
import { run, RunContextSettings } from "yeoman-test";

import { loadJSON } from "../src/fs";

const appName = "prettier";

let opts: RunContextSettings;
let srcDir: string;
let app: string;
let prettier: string;

beforeAll(() => {
    opts = {
        tmpdir: true,
    };
    srcDir = join(__dirname, "../src");
    app = join(srcDir, appName);
});

beforeEach(() => {
    prettier = "@sbrow/prettier-config";
});

describe(`generator-${appName}`, () => {
    describe("Without input", () => {
        it("should configure package.json:prettier = default", async () => {
            const tmpDir = await run(app, opts).withPrompts({
                configPackage: prettier,
            });
            const packageJson = loadJSON(tmpDir, "package.json");
            expect(packageJson).toMatchObject({ prettier });
        });
        describe("Installer", () => {
            let tmpDir: string;
            let got: string;

            beforeAll(async () => {
                tmpDir = await run(app, opts).withOptions({
                    "skip-install": false,
                });
                got = loadJSON(tmpDir, "package.json");
            }, 15000);
            it.each(["prettier", "@sbrow/prettier-config"])(
                "should install %p",
                (packageName: string) => {
                    const want = {
                        devDependencies: {},
                    };
                    want.devDependencies[packageName] = expect.any(String);
                    expect(got).toMatchObject(want);
                },
            );
        });
    });
    describe("With input", () => {
        beforeEach(() => {
            prettier = prettier.replace(/^@.*\//, "sbrower");
        });
        it("should configure package.json:prettier = prompt", async () => {
            const tmpDir = await run(app, opts).withPrompts({
                configPackage: prettier,
            });
            const packageJson = loadJSON(tmpDir, "package.json");
            expect(packageJson).toMatchObject({ prettier });
        });
        it("should configure package.json:prettier = argument", async () => {
            const tmpDir = await run(app, opts).withArguments([prettier]);
            const packageJson = loadJSON(tmpDir, "package.json");
            expect(packageJson).toMatchObject({ prettier });
        });
    });
});
