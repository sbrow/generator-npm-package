import shelljs from "shelljs";
import Generator from "yeoman-generator";

import chalk from "chalk";
import { BaseGenerator } from "../BaseGenerator";
import blacklistJson from "./blacklist.json";

export class Typescript extends BaseGenerator {
    public static readonly devDependencies = ["typescript", "@types/node"];
    public tslint = {
        extends: "tslint:recommended",
        rules: {},
    };
    public props: any;

    public prompting() {
        const dependencies = this.getDependencies();
        const devDependencies = this.getDevDependencies();
        const deps: string[] = [...Array.from(dependencies), ...Array.from(devDependencies)];

        const installDefs = () => {
            const choices = new Set<string>();
            for (const pkg of deps) {
                if (pkg !== null && !blacklistJson.includes(pkg) && !pkg.match(/^@types/)) {
                    const name = `@types/${pkg}`;
                    if (!choices.has(name)) {
                        choices.add(name);
                    }
                }
            }
            if (choices.size > 0) {
                return [{
                    type: "checkbox",
                    name: "typeDefs",
                    message: "Select Type definitions (.d.ts files) to install",
                    choices: Array.from(choices),
                }];
            }
            return [];
        };

        const prompts: Generator.Questions = [
            ...installDefs(),
            {
                type: "input",
                name: "outDir",
                message: `Select ${chalk.yellow("outDir")}. (Where to put transpiled files)`,
                default: "dist",
            },
            {
                type: "confirm",
                name: "esModuleInterop",
                message: chalk`Allow default imports in ES module style? (e.g. {magenta import} {blueBright foo}` +
                    chalk` {magenta from} {yellow "bar"});`,
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
        this.addDevDependencies(Typescript.devDependencies);
        if (this.props.typeDefs) {
            this.addDevDependencies(this.props.typeDefs);
        }
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
        const dependencies = this.getDependencies();

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

    public default() {
        this.scheduleInstall();
    }
}

module.exports = Typescript;
export default Typescript;
