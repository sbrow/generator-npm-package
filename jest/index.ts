import Generator from "yeoman-generator";

export class Jest extends Generator {

    public props: { moduleFileExtensions: string[] };

    constructor(args, opts) {
        super(args, opts);
        this.props = { moduleFileExtensions: ["js"] };
    }

    configuring() {
        const devDependencies = new Set(this.config.get('devDependencies'));

        if (devDependencies.has("typescript")) {
            this.props.moduleFileExtensions.unshift("ts");
        }
        if (devDependencies.has("react")) {
            const temp = [];
            for (const extension of this.props.moduleFileExtensions) {
                temp.push(extension, `${extension}x`)
            }
            this.props.moduleFileExtensions = temp;
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