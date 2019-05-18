const extensions = ["ts", "tsx", "js", "jsx", "json"];

module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
        `src/**/*\.{${extensions.filter((x) => x !== "json").join(",")}}`,
    ],
    moduleDirectories: ["node_modules", "src"],
    moduleFileExtensions: extensions,
    testPathIgnorePatterns: ["node_modules", "generators"],
    transform: {
        "\.tsx?": "ts-jest",
    },
};
