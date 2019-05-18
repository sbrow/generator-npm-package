import { join } from "path";
import helpers from "yeoman-test";

import { Typescript } from "../src/typescript";

let opts;
let srcDir;

beforeAll(() => {
    opts = {
        tmpdir: true,
        resolved: require.resolve("../src/typescript/index"),
        namespace: "npm-package:typescript",
    };
    srcDir = join(__dirname, "../src");
});
describe("generator-typescript", () => {
    describe("With default options", () => {
        it.skip(`Shows proper types`, async () => {
            const context = helpers.run(Typescript, opts)
                .withLocalConfig({ dependencies: ["react"] });
        });
    });
});
