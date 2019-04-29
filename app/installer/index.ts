import Generator from 'yeoman-generator';
import inquirer = require('inquirer');

import packages from "./packages.json";

interface SelectorProps extends inquirer.Answers {
    dependencies: string[];
    devDependencies: string[];
}

module.exports = class extends Generator {
    public props: SelectorProps;

    constructor(args, opts) {
        super(args, opts)
        this.props = {
            dependencies: [], devDependencies: []
        };
    }

    prompting() {
        const choices = [];
        for (const choice in packages) {
            choices.push(choice);
        }
        const prompts = [
            {
                type: "checkbox",
                name: "packages",
                message: "Select packages to install",
                choices
            },
        ];

        return this.prompt(prompts).then((props: SelectorProps) => {
            if (props.packages.includes("Typescript")) {
                this.composeWith(require.resolve('../typescript'), {});
            }
            if (props.packages.includes("jest")) {
                this.composeWith(require.resolve('../jest'), {});
            }

            const dependencies = new Set(this.config.get('dependencies'));

            for (const name of props.packages) {
                const pkgs = packages[name];
                switch (typeof pkgs) {
                    case "string":
                        dependencies.add(pkgs)
                        break;
                    default:
                        console.log(pkgs, name)
                        for (const pkg of pkgs) {
                            dependencies.add(pkg);
                        }
                }
            }
            this.config.set('dependencies', Array.from(dependencies));
        });
    }

    writing() {
        this.fs.extendJSON(this.destinationPath('package.json'), { scripts: { start: "node $npm_package_main" } });
    }
    installing() {
        const dependencies = this.config.get('dependencies');
        if (dependencies.length > 0) {
            this.log(`Installing node packages: ${dependencies.join(" ")}`)
            // this.npmInstall(dependencies);
        } else {
            this.log("No additional packages will be installed.");
        }
    }
};
