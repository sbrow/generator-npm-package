const extensions = ["ts", "tsx", "js", "jsx", "json"];

module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
        "generator{s,-package,-prettier}/**/*.{ts,tsx}",
        "!generator{s,-package,-prettier}/**/*.{d,test}*.ts",
        "!**/templates/*",
    ],
    moduleDirectories: ["node_modules", "generators", "generator-package"],
    moduleFileExtensions: extensions,
    testPathIgnorePatterns: ["node_modules"],
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    transform: {
        ".tsx?": "ts-jest",
    },
};
