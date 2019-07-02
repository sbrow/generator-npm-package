import { join } from "path";
import { run, RunContextSettings } from "yeoman-test";

import { loadJSON } from "../../fs";

const appName = "prettier";

let opts: RunContextSettings;
let app: string;
let prettier: string;

beforeAll(() => {
    opts = {
        tmpdir: true,
    };
    app = join(__dirname, "index");
});

beforeEach(() => {
    prettier = "@<username>/prettier-config";
});

describe(`generator-${appName}`, () => {
    describe("Without input", () => {
        it("Configures package.json:prettier = default", async () => {
            const tmpDir = await run(app, opts).withPrompts({
                configPackage: prettier,
            });
            const packageJson = loadJSON(tmpDir, "package.json");
            expect(packageJson).toMatchObject({ prettier });
        });
        describe("Installer", () => {
            let tmpDir: string;
            let got: {};
            let yoRc: {};

            beforeAll(async () => {
                tmpDir = await run(app, opts).withOptions({
                    "skip-install": false,
                });
                yoRc = loadJSON(tmpDir, ".yo-rc.json");
                got = loadJSON(tmpDir, "package.json");
            }, 20000);
            // tslint:disable-next-line: mocha-no-side-effect-code
            it.each(["prettier", "@sbrow/prettier-config"])(
                "installs %p",
                (packageName: string) => {
                    const want = { devDependencies: {} };
                    want.devDependencies[packageName] = expect.any(String);
                    expect(got).toMatchObject(want);
                    expect(yoRc).toMatchObject({
                        "generator-prettier": {
                            devDependencies: expect.arrayContaining([
                                packageName,
                            ]),
                        },
                    });
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
