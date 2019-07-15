import { join } from "path";
import { run } from "yeoman-test";

import { loadJSON } from "../../fs";

let app: string;
let opts;

beforeAll(() => {
    app = join(__dirname, "index");
    opts = {
        tmpdir: true,
    };
});

describe("generator-typescript", () => {
    it.skip(`Shows proper types`, async () => {
        const context = run(app, opts).withLocalConfig({
            dependencies: ["react"],
        });
    });

    it("Installs typescript", async () => {
        const tmpDir = await run(app, opts);
        const got = loadJSON(tmpDir, ".yo-rc.json");
        expect(got).toMatchObject({
            "generator-npm-package": {
                devDependencies: expect.arrayContaining([
                    "typescript",
                    "@types/node",
                    "tslint",
                ]),
            },
        });
    }, 5500);
    describe("When installed with React", () => {
        it('sets "jsx" to "react"', async () => {
            const context = run(app, opts).withLocalConfig({
                dependencies: ["react"],
            });
            const tmpDir = await context;
            const want = {
                compilerOptions: {
                    jsx: "react",
                },
            };
            const got = loadJSON(tmpDir, "tsconfig.json");
            expect(got).toMatchObject(want);
        }, 5500);
    });
});
