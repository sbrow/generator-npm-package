import { Package } from "generator-package/Package";
import { PackageGenerator } from "generator-package";

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

    /**
     * @todo install typescript loader.
     */
    public modules(): string {
        if (!this.hasDevDependency("typescript")) {
            return "";
        }
        return `\r\n\tmodule: ${JSON.stringify(
            {
                rules: [
                    {
                        exclude: [/node_modules/, /build/, /dist/],
                        test: /\.tsx?$/,
                        use: "ts-loader",
                    },
                ],
            },
            null,
            2,
        )},`;
    }

    public configuring() {
        if (this.hasDevDependency("typescript")) {
            this.addDevDependencies("ts-loader");
        }
    }

    public writing() {
        this.fs.extendJSON(this.destinationPath("package.json"), {
            scripts: { webpack: "webpack" },
        });

        this.fs.write(
            this.destinationPath("webpack.config.js"),
            [
                'const path = require("path");',
                "",
                'const packageJson = require("./package.json")',
                "",
                'process.env.NODE_ENV = process.env.NODE_ENV || "development";',
                "const mode = process.env.NODE_ENV;",
                'const outDir = path.resolve(__dirname, "dist");',
                "",
                "const baseConfig = {",
                "\tentry: packageJson.main,",
                `\tmode,${this.modules()}`,
                "\toutput: {",
                '\t\tfilename: "main.js",',
                "\t\tpath: outDir,",
                "\t},",
                "}",
                "",
                "module.exports = [",
                "\tbaseConfig,",
                "]",
            ].join("\r\n"),
        );
    }

    public default() {
        this.scheduleInstall();
    }
}

export default Webpack;
