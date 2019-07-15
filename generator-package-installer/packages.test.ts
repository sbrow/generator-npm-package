import { Package } from "./Package";
import { devOnly } from "./packages";

describe("devOnly", () => {
    it("Works with one argument", () => {
        const args: Parameters<typeof devOnly>[0] = "typescript";
        const want: Package[] = [{ name: "typescript", devOnly: true }];

        const got = devOnly(args);
        expect(got).toMatchObject(expect.arrayContaining(want));
    });
    it("Works with two arguments", () => {
        const args: Parameters<typeof devOnly> = ["typescript", "tslint"];
        const want: Package[] = [
            { name: "typescript", devOnly: true },
            { name: "tslint", devOnly: true },
        ];

        const got = devOnly(...args);
        expect(got).toMatchObject(expect.arrayContaining(want));
    });
});
