import { BasicPackage, Package } from "./Package";

describe("Package", () => {
    it("Should compile", () => {
        let a: Package;
        // string
        a = "yarn";
        // PackageInterface
        a = { name: "yarn" };
        a = { name: "yarn", isDev: false };
        a = { name: "yarn", isDev: true };
        a = { name: "yarn", devOnly: true };
        // DevOnlyPackage
        a = { name: "yarn", devOnly: true, isDev: true };
        a = { name: "yarn", devOnly: true, isDev: false }; // should fail
        // Devable
        a = { name: "yarn", devOnly: false, isDev: false };
        a = { name: "yarn", devOnly: false, isDev: true };
        a = { name: "yarn", devOnly: false, isDev: true, otherProp: "thing" };
    });
});
