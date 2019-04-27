import Generator from "yeoman-generator";
import shelljs from "shelljs";

class Typescript extends Generator {
    public devDependencies: string[] = ["typescript", "@types/node", "tslint"];
    public tslint = {
        extends: "tslint:recommended",
        rules: {},
    }
    public props: any;

    prompting() {
        const packages = [];
        const toInstall = [
            ...this.config.get('devDependencies'),
            ...this.config.get('dependencies'),
            ...this.devDependencies,
        ];
        this.log(JSON.stringify({
            dev: this.config.get('devDependencies'),
            deps: this.config.get('dependencies'),
        }))
        for (const pkg of toInstall) {
            if (pkg !== null && !pkg.match(/^@types/)) {
                const name = `@types/${pkg}`
                if (!packages.includes(name)) {
                    packages.push(name)
                }
            }
        }
        this.log(`packages: ${JSON.stringify(packages)}`);

        const prompts: Generator.Questions = [
            {
                type: "checkbox",
                name: "typeDefs",
                message: "Select packages to install type definitions (.d.ts) files for",
                choices: packages
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

    writing() {
        // Setup directories
        shelljs.mkdir(this.destinationPath('src'));
        shelljs.mkdir(this.destinationPath(this.props.outDir));

        const jsx = (this.config.get("dependencies").includes("react"))
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

    install() {
        const packages = [...this.devDependencies, ...this.props.typeDefs]
        this.log(`Installing ${packages.join(" ")}`);
        this.npmInstall(packages, { "save-dev": true });
    }
}

module.exports = Typescript;

export default Typescript;