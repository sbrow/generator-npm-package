import Generator from "yeoman-generator";
import shelljs from "shelljs";

import blacklist from "./blacklist.json";

module.exports = class extends Generator {
    public tslint = {
        extends: "tslint:recommended",
        rules: {},
    }
    public props: any;

    prompting() {
        const dependencies: Set<string> = new Set(this.config.get('dependencies'));
        const devDependencies: Set<string> = new Set(this.config.get('devDependencies'));
        const deps: string[] = [...Array.from(dependencies), ...Array.from(devDependencies)];
        const choices = new Set<string>();
        for (const pkg of deps) {
            if (pkg !== null && !blacklist.includes(pkg) && !pkg.match(/^@types/)) {
                const name = `@types/${pkg}`
                if (!choices.has(name)) {
                    choices.add(name)
                }
            }
        }

        const prompts: Generator.Questions = [
            {
                type: "checkbox",
                name: "typeDefs",
                message: "Select packages to install type definitions (.d.ts) files for",
                choices: Array.from(choices),
            },
            {
                type: "input",
                name: "outDir",
                message: "What directory should tsc compile to?",
                default: "dist"
            },
            {
                type: "confirm",
                name: "esModuleInterop",
                default: true
            }
        ];

        return this.prompt(prompts).then(props => {
            this.props = props;
        });
    }

    configuring() {
        const devDependencies = (this.config.get("devDependencies") !== {})
            ? new Set(this.config.get('devDependencies'))
            : new Set();
        for (const name of this.props.typeDefs) {
            devDependencies.add(name);
        }
        this.config.set('devDependencies', Array.from(devDependencies));
    }

    writing() {
        // Setup directories
        shelljs.mkdir(this.destinationPath('src'));
        shelljs.mkdir(this.destinationPath(this.props.outDir));

        const dependencies = new Set(this.config.get("dependencies"));

        const jsx = (dependencies.has("react"))
            ? "react"
            : undefined;

        const { esModuleInterop, outDir } = this.props;
        this.fs.extendJSON(this.destinationPath('tsconfig.json'),
            {
                compilerOptions: {
                    esModuleInterop,
                    jsx,
                    outDir
                }
            });
        this.fs.extendJSON(this.destinationPath('tslint.json'), this.tslint);
        this.fs.extendJSON(this.destinationPath('package.json'),
            {
                directories: { lib: this.props.outDir },
                scripts: {
                    lint: "tslint",
                    build: "tsc"
                }
            });
    }
}