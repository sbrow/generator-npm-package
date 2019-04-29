import Generator from "yeoman-generator";

const config = "jest.config.template.js"
export class Jest extends Generator {
    public props: any;

    writing() {
        this.fs.extendJSON(this.destinationPath('package.json'), { scripts: { test: "jest" } });
        // this.fs.copy(this.templatePath(config), this.destinationRoot(config.replace(".template", "")));
    }
};

module.exports = Jest;

export default Jest;