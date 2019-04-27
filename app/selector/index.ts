import Generator from 'yeoman-generator';
import { Typescript } from "../typescript";
import inquirer = require('inquirer');

const packages = {
    "jest": "jest",
    "React": ["react", "react-dom"]
}

interface SelectorProps extends inquirer.Answers {
    packages: string[];
    useTypescript: boolean;
}

module.exports = class extends Generator {
    public props: SelectorProps;

    constructor(args, opts) {
        super(args, opts)
        this.props = { packages: [], useTypescript: false };
    }

    prompting() {
        const prompts = [
            {
                type: "checkbox",
                name: "packages",
                message: "Select packages to install",
                choices: ["jest", "React"]
            },
            {
                type: 'confirm',
                name: 'useTypescript',
                message: 'would you like to use Typescript in your package?',
                default: true
            }
        ];

        return this.prompt(prompts).then((props: SelectorProps) => {
            if (props.useTypescript) {
                this.composeWith(require.resolve('../typescript'), {});
            }
            this.props.useTypescript = props.useTypescript;

            for (const packageName of props.packages) {
                const pkgs = packages[packageName];
                switch (typeof pkgs) {
                    case "string":
                        this.props.packages.push(pkgs)
                        break;
                    default:
                        this.props.packages.push(...pkgs);
                }
            }
            if (this.props.packages.includes("jest")) {
                this.composeWith(require.resolve('../jest'), {});
            }
        });
    }

    writing() {
        this.fs.extendJSON(this.destinationPath('package.json'), { scripts: { start: "node $npm_package_main" } });
    }
    installing() {
        if (this.props.packages.length > 0) {
            this.log(`Installing node packages: ${this.props.packages.join(" ")}`)
            this.npmInstall(this.props.packages);
        } else {
            this.log("No additional packages will be installed.");
        }
    }
};
