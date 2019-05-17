import path from "path";
import { ls, pwd } from "shelljs";
import assert from "yeoman-assert";
import helpers from "yeoman-test";

import { writeFileSync } from "fs";
import { load } from "../__setup__/fs";

let opts: helpers.RunContextSettings;
let srcDir: string;
let app: string;

beforeAll(() => {
    opts = {
        tmpdir: true,
    };
    srcDir = path.join(__dirname, "../src");
    app = path.join(srcDir, "app");
});

describe("generator-app", () => {
    describe("default", () => {
        const file = ".gitignore";
        it(`Creates "${file}"`, async () => {
            const tmpDir = await helpers.run(app, opts);
            assert.file(file);
            const got = load(tmpDir, file);
            const want = load(path.join(app, "templates"), ".template.gitignore");
            expect(got).toMatch(want);
        });
    });
    describe('With prompt "delete"', () => {
        it("Removes all files from target.", async () => {
            const context = helpers.run(app, opts)
                .inTmpDir((dir) => {
                    writeFileSync(path.join(dir, "testfile.json"), "{}");
                    writeFileSync(path.join(dir, ".testfile.json"), "{}");
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
        it("Doesn't create any files", async () => {
            const tmpDir = await helpers.run(app, opts)
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
