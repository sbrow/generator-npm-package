import shelljs from "shelljs";
import Generator from "yeoman-generator";

import { BaseGenerator } from "../BaseGenerator";
import blacklistJson from "./blacklist.json";

export class Typescript extends BaseGenerator {
    public tslint = {
        extends: "tslint:recommended",
        rules: {},
    };
    public props: any;

    public prompting() {
        const dependencies = this.getDependencies();
        const devDependencies = this.getDevDependencies();
        const deps: string[] = [...Array.from(dependencies), ...Array.from(devDependencies)];
        const choices = new Set<string>();
        for (const pkg of deps) {
            if (pkg !== null && !blacklistJson.includes(pkg) && !pkg.match(/^@types/)) {
                const name = `@types/${pkg}`;
                if (!choices.has(name)) {
                    choices.add(name);
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
                message: "Where should source files be transpiled to?",
                default: "dist",
            },
            {
                type: "confirm",
                name: "esModuleInterop",
                message: "Allow ES module imports? (Import foo from \"bar\")",
                default: true,
            },
            {
                type: "confirm",
                name: "resolveJsonModule",
                message: "Allow import of JSON modules?",
                default: false,
            },
        ];

        return this.prompt(prompts).then((props) => {
            this.props = props;
        });
    }

    public configuring() {
        const devDependencies = this.getDevDependencies();
        for (const name of this.props.typeDefs) {
            devDependencies.add(name);
        }

        this.setDevDependencies(devDependencies);
        const tsconfig = { ...this.props };
        delete tsconfig.typeDefs;
        this.config.set("tsconfig", tsconfig);
    }

    public writing() {
        // Setup directories
        shelljs.mkdir(this.destinationPath("src"));
        shelljs.mkdir(this.destinationPath(this.props.outDir));

        // const dependencies = new Set(this.config.get("dependencies"));
        const deps = "dependencies";
        const dependencies = new Set(this.config.get(deps));

        const jsx = (dependencies.has("react"))
            ? "react"
            : undefined;

        const { esModuleInterop, outDir, resolveJsonModule } = this.props;
        this.fs.extendJSON(this.destinationPath("tsconfig.json"),
            {
                compilerOptions: {
                    esModuleInterop,
                    jsx,
                    outDir,
                    resolveJsonModule,
                },
            });
        this.fs.extendJSON(this.destinationPath("tslint.json"), this.tslint);
        this.fs.extendJSON(this.destinationPath("package.json"),
            {
                directories: { lib: this.props.outDir },
                scripts: {
                    build: "tsc",
                    lint: "tslint",
                },
            });
    }
};
