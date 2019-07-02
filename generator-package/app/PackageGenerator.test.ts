import { join } from "path";
import { touch } from "shelljs";
import { run, RunContextSettings } from "yeoman-test";

import { loadJSON } from "../../fs";

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
        expect(got).toMatchObject({
            "generator-package": {
                dependencies: expect.arrayContaining(["webpack"]),
            },
        });
    });
    describe("useYarn", () => {
        // tslint:disable-next-line: mocha-no-side-effect-code
        it.each([
            ["package.lock", false],
            [undefined, false],
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
                expect(got).toMatchObject({
                    "generator-package": {
                        useYarn: want,
                    },
                });
            },
            10000,
        );
    });
});
