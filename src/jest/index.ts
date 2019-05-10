import Generator from "yeoman-generator";

import { BaseGenerator } from "../BaseGenerator";

export class Jest extends BaseGenerator {

    public props: {
        moduleFileExtensions: string[]
        resolveJsonModule: boolean,
        enableCoveralls: boolean,
    };

    constructor(args, opts) {
        super(args, opts);
        this.props = {
            moduleFileExtensions: ["js"],
            resolveJsonModule: false,
            enableCoveralls: false,
        };
    }

    public get scripts() {
        return {
            cover: "jest --coverage",
            coveralls: "jest --coverage --coverageReporters=text-lcov | coveralls",
            test: "jest",
        };
    }

    public prompting() {
        const prompts: Generator.Questions = [{
            type: "confirm",
            name: "enableCoveralls",
            message: "Enable coveralls integration?",
            default: false,
        }];

        return this.prompt(prompts).then((props) => {
            this.props.enableCoveralls = props.enableCoveralls;
            return this.props;
        });
    }

    public configuring() {
        const devDependencies = this.getDevDependencies();

        if (devDependencies.has("typescript")) {
            this.props.moduleFileExtensions.unshift("ts");
            const tsconfig = this.config.get("tsconfig");
            if (tsconfig !== undefined && tsconfig.hasOwnProperty("resolveJsonModule")) {
                this.props.resolveJsonModule = tsconfig.resolveJsonModule;
            }
        }
        if (devDependencies.has("react")) {
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
            devDependencies.add("coveralls");
            this.setDevDependencies(devDependencies);
        }
    }

    public writing() {
        const scripts: { test: string; coveralls?: string } = {
            test: this.scripts.test,
        };
        if (this.props.enableCoveralls) {
            scripts.coveralls = this.scripts.coveralls;
        }
        this.fs.extendJSON(this.destinationPath("package.json"), { scripts });
        this.fs.write(this.destinationPath("jest.config.js"),
            `const moduleFileExtensions = ${JSON.stringify(this.props.moduleFileExtensions)};
${this.transforms()}
module.exports = {
    collectCoverageFrom: [\`src/**/*.\${moduleFileExtensions}\`]
};
`);
    }

    private transforms(): string {
        if (this.getDevDependencies().has("typescript")) {
            return `
    transform: {
        "\.tsx?": "ts-jest",
    },
`;
        }
        return "";
    }
}

module.exports = Jest;

export default Jest;
