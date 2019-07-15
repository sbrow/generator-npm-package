import {
    createArrayLiteral,
    Identifier,
    isArrayLiteralExpression,
    Node,
    ObjectLiteralExpression,
    SourceFile,
    SyntaxKind,
    transform,
    TransformerFactory,
    visitEachChild,
    visitNode,
    Visitor,
} from "typescript";
import { RuleSetRule } from "webpack";

import {
    getByPath,
    getExports,
    getIdentifier,
    getProperty,
    toAST,
} from "./ast";

export function loaderToAST(loader: RuleSetRule): [Node, SourceFile] {
    const loaderAST = toAST(loader);
    const tree = [
        SyntaxKind.VariableStatement,
        SyntaxKind.VariableDeclarationList,
        SyntaxKind.VariableDeclaration,
        SyntaxKind.ObjectLiteralExpression,
    ];
    const node = getByPath(loaderAST, tree);
    return [node, loaderAST];
}

function SingleReplaceTransformer<T extends Node>(
    original: Node,
    replacement: Node,
): TransformerFactory<T> {
    return context => {
        const visit: Visitor = node => {
            if (node === original) {
                return replacement;
            }
            return visitEachChild(node, child => visit(child), context);
        };

        return node => visitNode(node, visit);
    };
}
export function addLoader(
    loader: RuleSetRule,
    sourceFile: SourceFile,
): SourceFile {
    const configVar = getConfig(sourceFile);
    const mod = getProperty(
        sourceFile,
        configVar,
        "module",
    ) as ObjectLiteralExpression;

    const rules = getProperty(sourceFile, mod, "rules");
    if (isArrayLiteralExpression(rules)) {
        const arr = createArrayLiteral(
            [
                ...rules.elements,
                { ...loaderToAST(loader)[0], _expressionBrand: true },
            ],
            true,
        );
        return updateNode(sourceFile, rules, arr);
    }
}
/**
 * @remarks
 * Works, but eliminates whitespace.
 */
function updateNode(
    sourceFile: SourceFile,
    target: Node,
    replacement: Node,
): SourceFile {
    const { transformed } = transform(sourceFile, [
        SingleReplaceTransformer(target, replacement),
    ]);
    return transformed[0];
}

function getConfig(
    sourceFile: SourceFile,
): ObjectLiteralExpression | undefined {
    const ID = getExports(sourceFile)[0] as Identifier;
    return (getIdentifier(
        sourceFile,
        ID,
    ) as unknown) as ObjectLiteralExpression;
}
