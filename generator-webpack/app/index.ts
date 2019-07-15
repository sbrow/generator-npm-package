import { PackageGenerator } from "generator-package-installer";
import { Package } from "generator-package-installer/Package";
import {
    createPrinter,
    createSourceFile,
    ScriptKind,
    ScriptTarget,
    SourceFile,
} from "typescript";

import { addLoader } from "./addLoader";

const packages: Package[] = [
    { name: "webpack", devOnly: true },
    { name: "webpack-cli", devOnly: true },
];

export class Webpack extends PackageGenerator {
    public props: {
        config: { [key: string]: any };
    };
    private configFile: SourceFile;

    constructor(args, opts) {
        super(args, { ...opts, required: JSON.stringify(packages) });
        this.props = {
            config: {},
        };
    }

    public configuring() {
        const filename = "webpack.config.ts";
        const config = this.destinationPath(filename);
        this.configFile = createSourceFile(
            filename,
            this.fs.read(
                this.fs.exists(config) ? config : this.templatePath(filename),
            ),
            ScriptTarget.Latest,
            false,
            ScriptKind.JS,
        );
        if (this.hasDevDependency("typescript")) {
            const loader = "ts-loader";
            this.addDevDependencies(loader);
            this.log(
                `Typescript has been detected: ${loader} will be installed.`,
            );
            this.configFile = addLoader(
                {
                    exclude: [/node_modules/, /build/, /dist/],
                    test: /\.tsx?$/,
                    use: loader,
                },
                this.configFile,
            );
        }
    }

    public writing() {
        this.fs.extendJSON(this.destinationPath("package.json"), {
            scripts: { webpack: "webpack" },
        });

        const printer = createPrinter();
        this.fs.write(
            this.destinationPath(this.configFile.fileName),
            printer.printFile(this.configFile),
        );
    }
}

export default Webpack;
