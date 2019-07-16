const extensions = ["ts", "tsx", "js", "jsx", "json"];

module.exports = {
    collectCoverage: true,
    collectCoverageFrom: ["packages/**/*.{ts,tsx}"],
    globals: {
        "ts-jest": {
            diagnostics: { warnOnly: true },
        },
    },
    moduleDirectories: ["node_modules", "packages"],
    moduleFileExtensions: extensions,
    testPathIgnorePatterns: ["node_modules"],
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    transform: {
        ".tsx?": "ts-jest",
    },
};
