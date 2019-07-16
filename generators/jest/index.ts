import Generator from "yeoman-generator";

import {
    PackageGenerator,
    PackageGeneratorOptions,
} from "generator-package-installer/app";
import { Package } from "generator-package-installer/Package";

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

    constructor(args, opts: PackageGeneratorOptions) {
        super(args, {
            ...opts,
            required: JSON.stringify([
                new Package({ name: "jest", devOnly: true }),
            ]),
        });
        const { test } = Jest.scripts;
        this.props = {
            moduleFileExtensions: ["js"],
            resolveJsonModule: false,
            enableCoveralls: false,
            scripts: { test },
        };
    }

    public async prompting() {
        const prompts: Generator.Questions = [
            {
                type: "confirm",
                name: "enableCoveralls",
                message: "Enable coveralls integration?",
                default: false,
                // store: true,
            },
        ];

        const props = await this.prompt(prompts);
        this.props.enableCoveralls = props.enableCoveralls;
    }

    public configuring() {
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

    private transforms(): string {
        if (this.hasDevDependency("typescript")) {
            return `\r\ntransform: {\r\t"\.tsx?": "ts-jest",\r\n},\r\n`;
        }
        return "";
    }
}

export default Jest;
