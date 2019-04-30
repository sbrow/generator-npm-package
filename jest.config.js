const extensions = ["ts", "tsx", "js", "jsx", "json"];

module.exports = {
    collectCoverageFrom: [
        `src/**/*\.{${extensions.join(",")}}`,
    ],
    transform: {
        "\.tsx?": "ts-jest",
    },
    moduleFileExtensions: extensions,
};

