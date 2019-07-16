import { join } from "path";
import { ls, touch } from "shelljs";
import { run, RunContextSettings } from "yeoman-test";

import { loadJSON } from "../../fs";
import packageJson from "../package.json";

let app: string;
let opts: RunContextSettings;

beforeAll(() => {
    app = require.resolve(__dirname);
    opts = {
        tmpdir: true,
    };
});

describe("PackageGenerator", () => {
    it("parses opts.required", async () => {
        const tmpDir = await run(app, opts)
            .withOptions({
                required: JSON.stringify(["webpack"]),
            })
            .inTmpDir((dir: string) => {});
        const got = loadJSON(tmpDir, ".yo-rc.json");
        const want = {};
        want[packageJson.name] = {
            dependencies: expect.arrayContaining(["webpack"]),
        };
        expect(got).toMatchObject(want);
    }, 7000);
    describe("addPackage", () => {
        it("adds as a devDependency", async () => {
            const tmpDir = await run(app, opts).withOptions({
                required: JSON.stringify([{ name: "jest", devOnly: true }]),
            });
            const got = loadJSON(tmpDir, ".yo-rc.json");
            expect(got["generator-package-installer"]).toMatchObject(
                expect.objectContaining({
                    devDependencies: ["jest"],
                }),
            );
        });
    });
    describe("useYarn", () => {
        // tslint:disable-next-line: mocha-no-side-effect-code
        it.each([
            ["package.lock", false],
            [undefined, undefined],
            ["yarn.lock", true],
        ])(
            "detects file %j",
            async (file: string, want: boolean | undefined) => {
                const tmpDir = await run(app, opts)
                    .withOptions({ required: "[]" })
                    .inTmpDir((dir: string) => {
                        if (file) {
                            touch(join(dir, file));
                        }
                    });
                const got = loadJSON(tmpDir, ".yo-rc.json");
                const wantObj = {};
                wantObj[packageJson.name] = {};
                if (want !== undefined) {
                    wantObj[packageJson.name] = { useYarn: want };
                }
                if (file !== undefined) {
                    expect(ls(tmpDir)).toContain(file);
                }
                expect(got).toMatchObject(wantObj);
            },
            10000,
        );
    });
});
