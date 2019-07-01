import Generator from "yeoman-generator";

import { PackageGenerator } from "../PackageGenerator";
import { Package } from "../installer/Package";
import packagesJson from "../installer/packages.json";

export class Jest extends PackageGenerator {
    public static readonly scripts = {
        cover: "jest --coverage",
        coveralls: "jest --coverage --coverageReporters=text-lcov | coveralls",
        test: "jest",
    };

    public props: {
        moduleFileExtensions: string[];
        resolveJsonModule: boolean;
        enableCoveralls: boolean;
        scripts: { [key: string]: string };
    };

    constructor(args, opts) {
        super(args, opts);
        const { test } = Jest.scripts;
        this.props = {
            moduleFileExtensions: ["js"],
            resolveJsonModule: false,
            enableCoveralls: false,
            scripts: { test },
        };
        this.required(new Package({ name: "jest", devOnly: true }));
    }

    public prompting() {
        const prompts: Generator.Questions = [
            {
                type: "confirm",
                name: "enableCoveralls",
                message: "Enable coveralls integration?",
                default: false,
                // store: true,
            },
        ];

        return this.prompt(prompts).then((props) => {
            this.props.enableCoveralls = props.enableCoveralls;
        });
    }

    public configuring() {
        this.addPackage(new Package(packagesJson.Jest));
        if (this.hasAnyDependency("typescript")) {
            this.props.moduleFileExtensions.unshift("ts");
            const tsconfig = this.config.get("tsconfig");
            if (
                tsconfig !== undefined &&
                tsconfig.hasOwnProperty("resolveJsonModule")
            ) {
                this.props.resolveJsonModule = tsconfig.resolveJsonModule;
            }
        }
        if (this.hasAnyDependency("react")) {
            const temp = [];
            for (const extension of this.props.moduleFileExtensions) {
                temp.push(extension, `${extension}x`);
            }
            this.props.moduleFileExtensions = temp;
        }
        if (this.props.resolveJsonModule) {
            this.props.moduleFileExtensions.push("json");
        }
        if (this.props.enableCoveralls) {
            this.addDevDependencies("coveralls");
        }
    }

    public writing() {
        if (this.props.enableCoveralls) {
            this.props.scripts.coveralls = Jest.scripts.coveralls;
        }
        const { scripts } = this.props;
        this.fs.extendJSON(this.destinationPath("package.json"), { scripts });
        this.fs.write(
            this.destinationPath("jest.config.js"),
            `const moduleFileExtensions = ${JSON.stringify(
                this.props.moduleFileExtensions,
            )};
module.exports = {
    ${this.transforms()}
    collectCoverageFrom: [\`src/**/*.\${moduleFileExtensions}\`]
};
`,
        );
    }

    public default() {
        this.scheduleInstall();
    }

    private transforms(): string {
        if (this.hasDevDependency("typescript")) {
            return `\r\ntransform: {\r\t"\.tsx?": "ts-jest",\r\n},\r\n`;
        }
        return "";
    }
}

module.exports = Jest;

export default Jest;
