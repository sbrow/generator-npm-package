const extensions = ["ts", "tsx", "js", "jsx", "json"];

module.exports = {
    // collectCoverage: true,
    // collectCoverageFrom: [
    // `src/**/*\.{${extensions.filter(x => x !== "json").join(",")}}`,
    // ],
    moduleDirectories: ["node_modules", "generators", "generator-package"],
    moduleFileExtensions: extensions,
    testPathIgnorePatterns: ["node_modules"],
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    transform: {
        ".tsx?": "ts-jest",
    },
};
