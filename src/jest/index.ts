import Generator from "yeoman-generator";

import { BaseGenerator } from "../BaseGenerator";

export class Jest extends BaseGenerator {
    public static readonly scripts = {
        cover: "jest --coverage",
        coveralls: "jest --coverage --coverageReporters=text-lcov | coveralls",
        test: "jest",
    };

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

    public prompting() {
        const prompts: Generator.Questions = [{
            type: "confirm",
            name: "enableCoveralls",
            message: "Enable coveralls integration?",
            default: false,
        }];

        return this.prompt(prompts).then((props) => {
            this.props.enableCoveralls = props.enableCoveralls;
        });
    }

    public configuring() {
        const devDependencies = this.getDevDependencies();
        devDependencies.add("jest");
        this.setDevDependencies(devDependencies);

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
            test: Jest.scripts.test,
        };

        if (this.props.enableCoveralls) {
            scripts.coveralls = Jest.scripts.coveralls;
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

    public installing() {
        this.npmInstall(Array.from(this.getDevDependencies()));
    }

    private transforms(): string {
        if (this.getDevDependencies().has("typescript")) {
            return `\r\ntransform: {\r\n"\.tsx?": "ts-jest",\r\n},\r\n`;
        }
        return "";
    }
}

module.exports = Jest;

export default Jest;
