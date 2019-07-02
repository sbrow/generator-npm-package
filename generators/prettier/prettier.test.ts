import { join } from "path";
import { run, RunContextSettings } from "yeoman-test";

import { loadJSON } from "../../fs";

const appName = "prettier";
const username = "mario";

let app: string;
let opts: RunContextSettings;
let prettier: string;

beforeAll(() => {
    app = join(__dirname, "index");
    opts = {
        tmpdir: true,
    };
});

beforeEach(() => {
    prettier = `@${username}/prettier-config`;
});

describe(`generator-${appName}`, () => {
    it("Configures prettier", async () => {
        const tmpDir = await run(app, opts).withOptions({ username });
        const want = { prettier };
        const got = loadJSON(tmpDir, "package.json");
        expect(got).toMatchObject(want);
    });
    it("installs packages", async () => {
        const tmpDir = await run(app, opts).withOptions({
            username,
        });
        const got = loadJSON(tmpDir, ".yo-rc.json");
        const want = { devDependencies: { prettier: expect.any(String) } };
        want.devDependencies[prettier] = expect.any(String);
        expect(got).toMatchObject({
            "generator-prettier": {
                devDependencies: expect.arrayContaining(["prettier", prettier]),
            },
        });
    });
    describe("Without input", () => {
        it("Configures package.json:prettier = default", async () => {
            const tmpDir = await run(app, opts).withPrompts({
                configPackage: prettier,
            });
            const packageJson = loadJSON(tmpDir, "package.json");
            expect(packageJson).toMatchObject({ prettier });
        }, 6000);
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
