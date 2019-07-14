import { Package } from "./Package";
import { devOnly } from "./packages";

describe("devOnly", () => {
    it("Works with one argument", () => {
        const args = "typescript";
        const want = [new Package({ name: "typescript", devOnly: true })];

        const got = devOnly(args);
        expect(got).toMatchObject(expect.arrayContaining(want));
    });
    it("Works with two arguments", () => {
        const args = ["typescript", "tslint"];
        const want = [
            new Package({ name: "typescript", devOnly: true }),
            new Package({ name: "tslint", devOnly: true }),
        ];

        const got = devOnly(...args);
        expect(got).toMatchObject(expect.arrayContaining(want));
    });
});
