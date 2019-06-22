import { join } from "path";
import { run } from "yeoman-test";

import { loadJSON } from "../__setup__/fs";
import Typescript from "../src/typescript";

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
      const context = run(Typescript, opts).withLocalConfig({
        dependencies: ["react"],
      });
    });
  });
  describe("When installed with React", () => {
    it('sets "jsx" to "react"', async () => {
      const context = run(Typescript, opts).withLocalConfig({
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
    });
  });
});
