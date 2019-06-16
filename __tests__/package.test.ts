import { Package } from "../src/installer/Package";

describe("Package", () => {
    it.each([
        ["jest", { name: "jest", isDev: false, devOnly: false }],
        [
            { name: "jest" },
            { name: "jest", isDev: false, devOnly: false },
        ],
        [{ name: "jest", devOnly: true }, { name: "jest", isDev: true, devOnly: true }],
        [{ name: "jest", devOnly: false }, { name: "jest", isDev: false, devOnly: false }],
        [{ name: "jest", isDev: true }, { name: "jest", isDev: true, devOnly: false }],
        [{ name: "jest", isDev: true, devOnly: false }, { name: "jest", isDev: true, devOnly: false }],
    ])("%s", (args: any, want: Package) => {
        const got = new Package(args);
        expect(got).toMatchObject(want);
    });
});
