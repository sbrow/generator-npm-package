import { join } from "path";
import { ls } from "shelljs";
import { run, RunContextSettings } from "yeoman-test";

let opts: RunContextSettings;
let srcDir: string;
let app: string;

beforeAll(() => {
    opts = {
        tmpdir: true,
    };
    srcDir = join(__dirname, "../src");
    app = join(srcDir, "installer");
});

describe('With prompt "install react-bootstrap"', () => {
    it("should install as a dependency", async () => {
        const tmpDir = await run(app, opts)
            .withPrompts({
                packages: ["react-bootstrap"],
            })
            .inTmpDir((dir: string) => {
                expect(ls("-A", dir)).toHaveLength(0);
            });
    });
});
