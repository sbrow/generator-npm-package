import Generator from "yeoman-generator";

export class Typescript extends Generator {
    public devDependencies: string[] = ["typescript", "@types/node", "tslint"];
    public tslint = {
        extends: "tslint:recommended",
        rules: {},
    }
    public props: any;

    prompting() {
        const prompts = [];

        return this.prompt(prompts).then(props => {
            this.props = props;
        });
    }

    writing() {
        this.fs.extendJSON(this.destinationPath('tslint.json'), this.tslint);
        this.fs.extendJSON(this.destinationPath('package.json'), { scripts: { lint: "tslint" } });
    }

    install() {
        this.log('Installing devDependencies');
        this.npmInstall(this.devDependencies, { "save-dev": true });
    }
};

module.exports = Typescript;

export default Typescript;