import Generator from "yeoman-generator";

export class Jest extends Generator {
    public props: any;

    prompting() {
        const prompts = [];

        return this.prompt(prompts).then(props => {
            this.props = props;
        });
    }

    writing() {
        this.fs.extendJSON(this.destinationPath('package.json'), { scripts: { test: "jest" } });
    }
};

module.exports = Jest;

export default Jest;