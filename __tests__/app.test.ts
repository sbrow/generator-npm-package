import { writeFileSync } from "fs";
import { join } from "path";
import { ls } from "shelljs";
import assert from "yeoman-assert";
import { run, RunContextSettings } from "yeoman-test";

import { load } from "../__setup__/fs";

let opts: RunContextSettings;
let srcDir: string;
let app: string;

beforeAll(() => {
    opts = {
        tmpdir: true,
    };
    srcDir = join(__dirname, "../src");
    app = join(srcDir, "app");
});

describe("generator-app", () => {
    describe("default", () => {
        const file = ".gitignore";
        it(`Creates "${file}"`, async () => {
            const tmpDir = await run(app, opts);
            assert.file(file);
            const got = load(tmpDir, file);
            const want = load(join(app, "templates"), ".template.gitignore");
            expect(got).toMatch(want);
        });
    });
    describe('With prompt "delete"', () => {
        it("Removes all files from target.", async () => {
            const context = run(app, opts)
                .inTmpDir((dir) => {
                    writeFileSync(join(dir, "testfile.json"), "{}");
                    writeFileSync(join(dir, ".testfile.json"), "{}");
                    expect(ls("-A", dir)).toHaveLength(2);
                })
                .withPrompts({
                    action: "d",
                    useYarn: false,
                });
            const tmpDir = await context;
            const contents = ls("-A");
            expect(contents).toHaveLength(3);
        });
    });

    describe('With prompt "stop"', () => {
        it.skip("Doesn't create any files", async () => {
            const tmpDir = await run(app, opts)
                .withPrompts({
                    action: "n",
                    useYarn: false,
                }).inTmpDir((dir: string) => {
                    expect(ls("-A", dir)).toHaveLength(0);
                });
            expect(ls("-A", tmpDir)).toHaveLength(0);
        });
    });
});
