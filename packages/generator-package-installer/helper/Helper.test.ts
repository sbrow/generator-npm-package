import { ls } from "shelljs";
import { run, RunContextSettings } from "yeoman-test";

import { loadJSON } from "../../fs";
import packageJson from "../package.json";

let app: string;
let opts: RunContextSettings;

beforeAll(() => {
    app = require.resolve(__dirname);
    opts = {
        tmpdir: true,
    };
});

describe("Helper", () => {
    it("calls main.scheduleInstall()", async () => {
        const main = {
            addPackage: jest.fn(),
            options: { useYarn: undefined, required: [] },
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
                    options: { required: "[]", useYarn: undefined },
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
        const wantObj = {};
        wantObj[packageJson.name] = { useYarn: want };
        expect(got).toMatchObject(wantObj);
    });
});
