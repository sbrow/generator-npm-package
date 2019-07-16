import * as ts from "typescript";
import { formatWithOptions } from "util";

export function getIdentifier(
    sourceFile: ts.SourceFile,
    id: string | ts.Identifier,
): ts.Identifier | undefined {
    let ret: ts.Identifier | undefined;
    if (typeof id === "string") {
        id = ts.createIdentifier(id);
    }
    sourceFile.forEachChild(node => {
        if (node.kind === ts.SyntaxKind.VariableStatement) {
            const list = node.getChildAt(
                0,
                sourceFile,
            ) as ts.VariableDeclarationList;
            list.forEachChild((declaration: ts.VariableDeclaration) => {
                const [identifier, equals, value] = declaration.getChildren(
                    sourceFile,
                );
                // @ts-ignore
                if (identifier.getText(sourceFile) === id.text) {
                    ret = value as ts.Identifier;
                    return;
                }
            });
        }
    });
    return ret;
}
export function getProperty(
    sourceFile: ts.SourceFile,
    object: ts.ObjectLiteralExpression,
    property: string | ts.Identifier,
): ts.Node | undefined {
    if (typeof property === "string") {
        property = ts.createIdentifier(property);
    }
    const properties = object.getChildAt(1, sourceFile).getChildren(sourceFile);
    for (const prop of properties) {
        // console.log(prop);
        if (prop.kind !== ts.SyntaxKind.CommaToken) {
            const [identifier, colon, value] = prop.getChildren(sourceFile);
            if (identifier.getText(sourceFile) === property.text) {
                return value;
            }
        }
    }
    return undefined;
}

export function getExports(sourceFile: ts.SourceFile): ts.NodeArray<ts.Node> {
    const ret: ts.Node[] = [];
    sourceFile.forEachChild(node => {
        if (node.kind === ts.SyntaxKind.ExpressionStatement) {
            const truthy = (n: ts.Node): ts.Node | undefined => {
                const innerNode = node.getChildAt(0, sourceFile);
                if (innerNode.kind === ts.SyntaxKind.BinaryExpression) {
                    const [left, mid, right] = innerNode.getChildren(
                        sourceFile,
                    );
                    switch (left.kind) {
                        case ts.SyntaxKind.PropertyAccessExpression:
                            const [expression, dot, name] = left.getChildren(
                                sourceFile,
                            );
                            if (
                                expression.getText(sourceFile) === "module" &&
                                name.getText(sourceFile) === "exports"
                            ) {
                                break;
                            }
                            return;
                        case ts.SyntaxKind.Identifier:
                            if (left.getText(sourceFile) === "exports") {
                                break;
                            }
                        default:
                            return;
                    }
                    if (mid.kind !== ts.SyntaxKind.EqualsToken) {
                        return;
                    }
                    return right;
                }
            };
            if (truthy(node)) {
                ret.push(truthy(node));
            }
        }
    });
    return ts.createNodeArray(ret);
}

// Allows gaps between nodes.
export function getByPath(
    sourceFile: ts.SourceFile,
    kinds: ts.SyntaxKind[],
): ts.Node | undefined {
    function visit(node: ts.Node, kinds: ts.SyntaxKind[]) {
        // kinds.length should always be > 1.
        if (kinds.length === 0) {
            throw new Error("Hit rock bottom, something went wrong.");
        }
        if (node.kind === kinds[0]) {
            if (kinds.length === 1) {
                return node;
            } else {
                kinds = kinds.slice(1);
            }
        }
        for (const child of node.getChildren(sourceFile)) {
            const result = visit(child, kinds);
            if (result !== undefined) {
                return result;
            }
        }
    }
    return visit(sourceFile, kinds);
}

export function toAST(source: string): ts.SourceFile;
export function toAST(source: {}, id?: ts.Identifier): ts.SourceFile;
export function toAST(source: string | {}, id?: ts.Identifier): ts.SourceFile {
    let sourceCode: string;
    if (typeof source === "string") {
        sourceCode = source;
    } else {
        switch (typeof id) {
            case "string":
                id = ts.createIdentifier(id);
                break;
            case "undefined":
                id = ts.createIdentifier("a");
        }
        sourceCode = `const ${id.text} = ${formatWithOptions(
            { depth: null },
            "%O",
            source,
        )};`;
    }
    return ts.createSourceFile(
        "example.ts",
        sourceCode,
        ts.ScriptTarget.Latest,
    );
}

export function updateFile(
    sourceFile: ts.SourceFile,
    toInsert: string,
    pos: number,
    end: number,
) {
    const insert = (
        p: number,
        e: number,
        original: string,
        str: string,
    ): string => {
        return original.slice(0, p) + str + original.slice(e);
    };

    const newString = insert(
        pos,
        end,
        sourceFile.getFullText(sourceFile),
        toInsert,
    );
    const range = ts.createTextChangeRange(
        ts.createTextSpan(pos, end - pos),
        toInsert.length,
    );
    // return sourceFile.update(newString, range);
    return ts.createSourceFile(
        sourceFile.fileName,
        newString,
        sourceFile.languageVersion,
    );
}
