import {
    createPrinter,
    ObjectLiteralExpression,
    Printer,
    SyntaxKind,
} from "typescript";
import { getByPath, toAST } from "./ast";

let printer: Printer;

beforeEach(() => {
    printer = createPrinter({});
});

describe(getByPath.name, () => {
    it("", () => {
        const sourceFile = toAST(`const a = {}`);
        const kinds = [
            SyntaxKind.VariableStatement,
            SyntaxKind.VariableDeclarationList,
            SyntaxKind.VariableDeclaration,
            SyntaxKind.ObjectLiteralExpression,
        ];
        const node = getByPath(sourceFile, kinds);
        // const got = getByPath(sourceFile, kinds) as ObjectLiteralExpression;
        expect(node).toBeDefined();
        expect(node).toHaveProperty("properties");
        const got = (node as ObjectLiteralExpression).properties;
        expect(got).toHaveLength(0);
    });
});
describe(toAST.name, () => {
    describe('typeof source = "object"', () => {
        it("parses array", () => {
            const source = { arr: [/regexContents/] };
            const got = toAST(source);
            expect(printer.printFile(got)).toMatchSnapshot();
        });
    });
});
