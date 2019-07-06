import { PackageGenerator } from "generator-package";
import { Package } from "generator-package/Package";
import * as ts from "typescript";

import { getIdentifier, getProperty, updateFile } from "./ast";

const packages: Package[] = [
    new Package({ name: "webpack", devOnly: true }),
    new Package({ name: "webpack-cli", devOnly: true }),
];

export class Webpack extends PackageGenerator {
    public props: {
        config: { [key: string]: any };
    };

    constructor(args, opts) {
        super(args, { ...opts, required: JSON.stringify(packages) });
        this.props = {
            config: {},
        };
    }

    public modules(): string {
        if (!this.hasDevDependency("typescript")) {
            return "";
        }
        return `{
    rules: [
        {
            exclude: [/node_modules/, /build/, /dist/],
            test: /\.tsx?$/,
            use: "ts-loader",
        },
    ],
}`;
    }

    public configuring() {
        if (this.hasDevDependency("typescript")) {
            this.addDevDependencies("ts-loader");
            this.log(
                "Typescript has been detected: ts-loader will be installed.",
            );
        }
    }

    public writing() {
        const filename = "webpack.config.js";
        const config = this.destinationPath(filename);
        this.fs.extendJSON(this.destinationPath("package.json"), {
            scripts: { webpack: "webpack" },
        });

        if (!this.fs.exists(filename)) {
            this.fs.copy(this.templatePath(filename), config);
        }

        const modules = this.modules();
        if (modules !== "") {
            const configFile = ts.createSourceFile(
                filename,
                this.fs.read(config),
                ts.ScriptTarget.Latest,
                false,
                ts.ScriptKind.JS,
            );
            const baseConfig = getIdentifier(configFile, "baseConfig");
            // @ts-ignore
            const mod = getProperty(configFile, baseConfig, "module");
            const { pos, end } = mod;

            const f = updateFile(configFile, modules, pos, end);
            this.fs.write(config, f.getFullText(f));
        }
    }
}

export default Webpack;
