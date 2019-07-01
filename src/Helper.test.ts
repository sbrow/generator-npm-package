import { join } from "path";
import { ls } from "shelljs";
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
    app = join(srcDir, "Helper");
});

describe("Helper", () => {
    it("calls main.scheduleInstall()", async () => {
        const main = {
            addPackage: jest.fn(),
            options: { useYarn: undefined },
            packages: { required: [] },
            scheduleInstall: jest.fn(),
            useYarn: () => false,
        };
        const tmpDir = await run(app, opts)
            .withOptions({
                main,
            })
            .inTmpDir((dir: string) => {});
        expect(main.addPackage).toHaveBeenCalledTimes(1);
        expect(main.addPackage).toHaveBeenCalledWith();
    });

    // tslint:disable-next-line: mocha-no-side-effect-code
    it.each([true, false])("sets useYarn to %s", async (want: boolean) => {
        const context = run(app, opts)
            .withOptions({
                main: {
                    addPackage: jest.fn(),
                    options: { useYarn: undefined },
                    packages: { required: [] },
                    scheduleInstall: jest.fn(),
                    useYarn: () => false,
                },
            })
            .inTmpDir((dir: string) => {
                expect(ls()).toHaveLength(0);
            })
            .withPrompts({ useYarn: want });
        const tmpDir = await context;
        const got = loadJSON(tmpDir, ".yo-rc.json");
        expect(got).toMatchObject({
            "generator-npm-package": {
                useYarn: want,
            },
        });
    });
});
