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
        it.each([["package.lock", false], ["yarn.lock", true]])(
            'detects "%s"',
            async (file: string, want: boolean | undefined) => {
                const tmpDir = await run(app, opts)
                    .withOptions({ testing: true })
                    .inTmpDir((dir: string) => {
                        touch(join(dir, file));
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
