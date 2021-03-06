import { join } from "path";
import { run } from "yeoman-test";

import { loadJSON } from "../../fs";
import { name as packageName } from "../package.json";

describe(packageName, () => {
    let app: string;
    const opts = {
        tmpdir: true,
    };
    beforeAll(() => {
        app = join(__dirname, "index");
        jest.setTimeout(10000);
    });

    it.skip(`Shows proper types`, async () => {
        const context = run(app, opts).withLocalConfig({
            dependencies: ["react"],
        });
    });

    it("Installs typescript", async () => {
        const tmpDir = await run(app, opts);
        const got = loadJSON(tmpDir, ".yo-rc.json");
        const want = {};
        want[packageName] = {
            devDependencies: expect.arrayContaining([
                "typescript",
                "@types/node",
                "tslint",
            ]),
        };
        expect(got).toMatchObject(want);
    });
    describe("When installed with React", () => {
        it('sets "jsx" to "react"', async () => {
            const tmpDir = await run(app, opts).withLocalConfig({
                dependencies: ["react"],
            });
            const want = {
                compilerOptions: expect.objectContaining({ jsx: "react" }),
            };
            const got = loadJSON(tmpDir, "tsconfig.json");
            expect(got).toMatchObject(want);
        });
    });
});
