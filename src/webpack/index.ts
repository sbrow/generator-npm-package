import { BaseGenerator } from "../BaseGenerator";

export class Webpack extends BaseGenerator {
    public static dependencies = ["webpack", "webpack-cli"];
    public props: {
        config: { [key: string]: string };
    };

    constructor(args, opts) {
        super(args, opts);
        this.props = {
            config: {
            },
        };
    }

    public configuring() {
        this.addDependencies(Webpack.dependencies);
    }

    public writing() {
        this.fs.extendJSON(this.destinationPath("package.json"), { scripts: { webpack: "webpack" } });
        this.fs.write(this.destinationPath("webpack.config.js"),
            [
                'const packageJson = require("./package.json")',
                "",
                'process.env.NODE_ENV = process.env.NODE_ENV || "development";',
                "const mode = process.env.NODE_ENV;",
                "",
                "const baseConfig = {",
                "\tentry: packageJson.main,",
                "\tmode,",
                "}",
                "",
                "module.exports = [",
                "\tbaseConfig,",
                "]",
            ].join("\r\n"));
    }

    public default() {
        this.scheduleInstall();
    }
}

module.exports = Webpack;

export default Webpack;
