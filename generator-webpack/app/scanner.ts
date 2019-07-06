import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";

export function createNamespaceImport(namespace: string, source?: string) {
    if (source === undefined) {
        source = namespace;
    }
    return ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
            undefined,
            ts.createNamespaceImport(ts.createIdentifier(namespace)),
        ),
        ts.createStringLiteral(source),
    );
}
export function createImport(
    things: string[],
    pack: string,
): ts.ImportDeclaration {
    return ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
            undefined,
            ts.createNamedImports([
                ts.createImportSpecifier(
                    undefined,
                    ts.createIdentifier(things[0]),
                ),
            ]),
        ),
        ts.createStringLiteral(pack),
    );
}

function getExports(sourceFile: ts.SourceFile): ts.NodeArray<ts.Node> {
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

function ModuleTransformer<T extends ts.Node>(prop: ts.Node): ts.TransformerFactory<T> {
    return context => {
        const visit: ts.Visitor = node => {
            if (node === prop) {
                return ts.createObjectLiteral(
                    [
                        ts.createPropertyAssignment(
                            "thing",
                            ts.createNumericLiteral("12"),
                        ),
                    ],
                    true,
                );
            }
            return ts.visitEachChild(node, child => visit(child), context);
        };

        return node => ts.visitNode(node, visit);
    };
}

export function updateFile(
    sourceFile: ts.SourceFile,
    string: string,
    pos: number,
    end: number,
) {
    const insert = (
        p: number,
        e: number,
        original: string,
        toInsert: string,
    ): string => {
        return original.slice(0, p) + toInsert + original.slice(e);
    };

    const newString = insert(
        pos,
        end,
        sourceFile.getFullText(sourceFile),
        string,
    );
    const range = ts.createTextChangeRange(
        ts.createTextSpan(pos, end - pos),
        string.length,
    );
    return sourceFile.update(newString, range);
}
/*
// main
const data = readFileSync(
    join(__dirname, "templates/webpack.config.js"),
).toString();
const config = ts.createSourceFile(
    "webpack.config.js",
    data,
    ts.ScriptTarget.ES2019,
    false,
    ts.ScriptKind.JS,
);
const ID = getExports(config)[0] as ts.Identifier;
// @ts-ignore
const exported = getIdentifier(config, ID) as ObjectLiteralExpression;
const prop = getProperty(config, exported, ts.createIdentifier("module"));
const printer = ts.createPrinter({
    removeComments: false,
    newLine: ts.NewLineKind.LineFeed,
});
const result = ts.transform(config, [ModuleTransformer()], {});
const changed = result.transformed[0];

const thing = getIdentifier(changed, ts.createIdentifier("baseConfig"));
// @ts-ignore
// const mod = getProperty(changed, thing, ts.createIdentifier("module"));
const str = " " + printer.printNode(ts.EmitHint.Expression, thing, changed);
const f = updateFile(config, str, exported.pos, exported.end);
console.log(f.getFullText(f));
*/
