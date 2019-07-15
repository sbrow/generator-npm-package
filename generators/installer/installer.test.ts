import { join } from "path";
import { ls } from "shelljs";
import { run, RunContextSettings } from "yeoman-test";

let app: string;
let opts: RunContextSettings;

beforeAll(() => {
    app = join(__dirname, "index");
    opts = {
        tmpdir: true,
    };
});

describe('With prompt "install react-bootstrap"', () => {
    it("installs as a dependency", async () => {
        const tmpDir = await run(app, opts)
            .withPrompts({
                packages: ["react-bootstrap"],
            })
            .inTmpDir((dir: string) => {
                expect(ls("-A", dir)).toHaveLength(0);
            });
    });
});
