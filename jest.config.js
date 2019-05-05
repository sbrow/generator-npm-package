const extensions = ["ts", "tsx", "js", "jsx", "json"];

module.exports = {
    collectCoverageFrom: [
        `src/**/*\.{${extensions.filter((x) => x != "json").join(",")}}`,
    ],
    transform: {
        "\.tsx?": "ts-jest",
    },
    moduleFileExtensions: extensions,
    testPathIgnorePatterns: ["node_modules", "generators"]
};

