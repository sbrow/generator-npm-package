import Generator from 'yeoman-generator';

import packages from "./packages.json";


module.exports = class extends Generator {
    props: any;
    constructor(args, opts) {
        super(args, opts)
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

        return this.prompt(prompts).then((props: { packages: string }) => {
            this.props = props;
        });
    }

    configuring() {
        if (this.props.packages.includes("Typescript")) {
            this.composeWith(require.resolve('../typescript'), {});
        }
        if (this.props.packages.includes("Jest")) {
            this.composeWith(require.resolve('../jest'), {});
        }

        const dependencies = new Set(this.config.get('dependencies'));
        const devDependencies = (this.config.get('devDependencies') === {})
            ? new Set(this.config.get('devDependencies'))
            : new Set();

        for (const name of this.props.packages) {
            const pkgs = packages[name];
            switch (typeof pkgs) {
                case "string":
                    devDependencies.add(pkgs)
                    break;
                default:
                    for (const pkg of pkgs) {
                        devDependencies.add(pkg);
                    }
            }
        }
        this.config.set('dependencies', Array.from(dependencies));
        this.config.set('devDependencies', Array.from(devDependencies));
    }

    writing() {
        this.fs.extendJSON(this.destinationPath('package.json'), { scripts: { start: "node $npm_package_main" } });
    }
    installing() {
        const dependencies = this.config.get('dependencies');
        const devDependencies = this.config.get('devDependencies');
        dependencies.push(...devDependencies);
        if (dependencies.length > 0) {
            this.log(`Installing node packages: ${dependencies.join(" ")}`)
            this.installDependencies({
                npm: true,
                bower: false
            });
        } else {
            this.log("No additional packages will be installed.");
        }
    }
};
