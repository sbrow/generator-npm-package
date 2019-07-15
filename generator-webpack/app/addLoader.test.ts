import {
    createPrinter,
    createSourceFile,
    EmitHint,
    Printer,
    ScriptTarget,
} from "typescript";
import { addLoader, loaderToAST } from "./addLoader";

let printer: Printer;

beforeEach(() => {
    printer = createPrinter({});
});

describe(addLoader.name, () => {
    const source = `const baseConfig = {
    module: {
        rules: [
            {foo: "bar"},
        ],
    },
};

module.exports = baseConfig;`;
    // tslint:disable-next-line: mocha-no-side-effect-code
    it("Updates rules", () => {
        const sourceFile = createSourceFile(
            "test.ts",
            source,
            ScriptTarget.Latest,
        );
        const got = addLoader(
            {
                use: "ts-loader",
            },
            sourceFile,
        );
        expect(
            printer.printNode(EmitHint.Unspecified, got, sourceFile),
        ).toMatchSnapshot();
    });
});
describe(loaderToAST.name, () => {
    // tslint:disable-next-line: mocha-no-side-effect-code
    it.each([
        {
            use: "ts-loader",
        },
        {
            exclude: [/node_modules/],
            use: "ts-loader",
        },
    ])("Works", (...args: Parameters<typeof loaderToAST>) => {
        const [object] = args;
        const [node, sourceFile] = loaderToAST(object);
        expect(
            printer.printNode(EmitHint.Unspecified, node, sourceFile),
        ).toMatchSnapshot();
    });
});
