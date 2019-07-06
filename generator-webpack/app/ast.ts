import * as ts from "typescript";

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
    return sourceFile.update(newString, range);
}
