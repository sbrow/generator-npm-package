import Generator from "yeoman-generator";

//@todo option: Allow resolve JSON.
export class Jest extends Generator {

    public props: {
        moduleFileExtensions: string[]
        resolveJsonModule: boolean,
    };

    constructor(args, opts) {
        super(args, opts);
        this.props = {
            moduleFileExtensions: ["js"],
            resolveJsonModule: false,
        };
    }

    configuring() {
        const devDependencies = new Set(this.config.get('devDependencies'));

        if (devDependencies.has("typescript")) {
            this.props.moduleFileExtensions.unshift("ts");
            const tsconfig = this.config.get('tsconfig');
            if (tsconfig.hasOwnProperty("resolveJsonModule")) {
                this.props.resolveJsonModule = tsconfig.resolveJsonModule;
            }
        } else {
            this.prompt([{
                type: "confirm",
                name: "resolveJsonModule",
                message: "Allow import of JSON files in tests?",
            }]).then(props => {
                this.props.resolveJsonModule = props.resolveJsonModule;
            });
        }
        if (devDependencies.has("react")) {
            const temp = [];
            for (const extension of this.props.moduleFileExtensions) {
                temp.push(extension, `${extension}x`)
            }
            this.props.moduleFileExtensions = temp;
        }
        if (this.props.resolveJsonModule) {
            this.props.moduleFileExtensions.push('json');
        }
    }

    writing() {
        this.fs.extendJSON(this.destinationPath('package.json'), { scripts: { test: "jest" } });
        this.fs.write(this.destinationPath('jest.config.js'), `const moduleFileExtensions = ${JSON.stringify(this.props.moduleFileExtensions)}

module.exports = {
    collectCoverageFrom: [\`src/**/*.\${moduleFileExtensions}\`]
}
`);
    }
};

module.exports = Jest;

export default Jest;