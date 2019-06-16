import { join } from "path";
import { run, RunContextSettings } from "yeoman-test";

let opts: RunContextSettings;
let srcDir: string;
let installer: string;

beforeAll(() => {
    opts = {
        tmpdir: true,
    };
    srcDir = join(__dirname, "../src");
    installer = join(srcDir, "installer", "index");
});

describe('With prompt "install react-bootstrap"', () => {
    it("should install as a dependency", async () => {
        const tmpDir = await run(installer, opts)
            .withPrompts({
                packages: ["react-bootstrap"],
            }).inTmpDir((dir: string) => {
                expect(ls("-A", dir)).toHaveLength(0);
            });
    });
});
