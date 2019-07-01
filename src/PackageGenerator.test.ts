import { join } from "path";
import { ls, touch } from "shelljs";
import { run, RunContextSettings } from "yeoman-test";

import { loadJSON } from "../__setup__/fs";

let opts: RunContextSettings;
let srcDir: string;
let app: string;

beforeAll(() => {
    opts = {
        tmpdir: true,
    };
    srcDir = join(__dirname, "..", "src");
    app = join(srcDir, "PackageGenerator");
});

describe("PackageGenerator", () => {
    describe("useYarn", () => {
        describe("Without prompt", () => {
            // tslint:disable-next-line: mocha-no-side-effect-code
            it.each([
                ["package.lock", false],
                [undefined, false],
                ["yarn.lock", true],
            ])(
                "detects file %j",
                async (file: string, want: boolean | undefined) => {
                    const tmpDir = await run(app, opts)
                        .withOptions({ testing: true })
                        .inTmpDir((dir: string) => {
                            if (file) {
                                touch(join(dir, file));
                            }
                        });
                    const got = loadJSON(tmpDir, ".yo-rc.json");
                    expect(got).toMatchObject({
                        "generator-npm-package": {
                            useYarn: want,
                        },
                    });
                },
                10000,
            );
        });
    });
});
