import assert from "yeoman-assert";
import fs from "fs";
import helpers from "yeoman-test";
import path from "path";
import Jest from "../src/jest/index";

const opts = {
    resolved: require.resolve("../src/jest/index"),
    namespace: "npm-package:jest",
};
describe("generator-jest", () => {
    describe("#writing", () => {
        const file = "jest.config.js";
        it("creates file", async () => {
            const tmpDir = await helpers.run(Jest, opts);
            assert.file(file);
        });
        it(`extensions = [".js"]`, async () => {
            const tmpDir = await helpers.run(Jest, opts);
            const got = fs.readFileSync(path.join(tmpDir, file)).toString();
            expect(got).toMatchSnapshot();
        });
        it(`extensions = [".js", ".jsx"]`, async () => {
            const tmpDir = await helpers.run(Jest, opts)
                .withLocalConfig({ devDependencies: ["react"] });
            const got = fs.readFileSync(path.join(tmpDir, file)).toString();
            expect(got).toMatchSnapshot();
        });
        it(`extensions = [".ts", ".js"]`, async () => {
            const tmpDir = await helpers.run(Jest, opts)
                .withLocalConfig({
                    devDependencies: ["typescript"],
                    tsconfig: { resolveJsonModule: false },
                })
            const got = fs.readFileSync(path.join(tmpDir, file)).toString();
            expect(got).toMatchSnapshot();
        });
        it(`extensions = [".ts", ".js", ".json"]`, async () => {
            const tmpDir = await helpers.run(Jest, opts)
                .withLocalConfig({
                    devDependencies: ["typescript"],
                    tsconfig: { resolveJsonModule: true },
                })
            const got = fs.readFileSync(path.join(tmpDir, file)).toString();
            expect(got).toMatchSnapshot();
        });
        it(`extensions = [".ts", ".tsx", ".js", ".jsx"]`, async () => {
            const tmpDir = await helpers.run(Jest, opts)
                .withLocalConfig({
                    devDependencies: ["react", "typescript"],
                    tsconfig: { resolveJsonModule: false },
                })
            const got = fs.readFileSync(path.join(tmpDir, file)).toString();
            expect(got).toMatchSnapshot();
        });
    });
});
