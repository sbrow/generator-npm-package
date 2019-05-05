import Generator from "yeoman-generator";

export class Jest extends Generator {

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
        const prompts = [{
            default: false,
            message: "Enable coveralls integration?",
            name: "enableCoveralls",
            type: "confirm",
        }];

        return this.prompt(prompts).then((props) => {
            this.props.enableCoveralls = props.enableCoveralls;
            return this.props;
        });
    }

    public configuring() {
        const devDependencies = new Set(this.config.get("devDependencies"));

        if (devDependencies.has("typescript")) {
            this.props.moduleFileExtensions.unshift("ts");
            const tsconfig = this.config.get("tsconfig");
            if (tsconfig.hasOwnProperty("resolveJsonModule")) {
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
            this.config.set("devDependencies", Array.from(devDependencies));
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

module.exports = {
    collectCoverageFrom: [\`src/**/*.\${moduleFileExtensions}\`]
};
`);
    }
}

module.exports = Jest;

export default Jest;
