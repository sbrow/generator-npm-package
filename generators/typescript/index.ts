import chalk from "chalk";
import {
    PackageGenerator,
    PackageGeneratorOptions,
} from "generator-package-installer";
import { Package } from "generator-package-installer/Package";
import shelljs from "shelljs";
import Generator from "yeoman-generator";

import blacklistJson from "./blacklist.json";

export interface TypescriptOptions extends PackageGeneratorOptions {
    outDir?: string;
    esModuleInterop?: boolean;
    resolveJsonModule?: boolean;
}

// tslint:disable-next-line: export-name
export class Typescript extends PackageGenerator {
    public options: TypescriptOptions;

    /**
     * Will be replaced with optional packages.
     */
    public typeDefs: any;
    public tslint = {
        extends: "tslint:recommended",
        rules: {},
    };

    constructor(args: string | any[], opts: TypescriptOptions) {
        super(args, {
            ...opts,
            required: JSON.stringify([
                new Package({ name: "@types/node", devOnly: true }),
                new Package({ name: "tslint", devOnly: true }),
                new Package({ name: "typescript", devOnly: true }),
            ]),
        });
        this.option("outDir", {
            type: String,
        });
        this.option("esModuleInterop", {
            type: Boolean,
        });
        this.option("resolveJsonModule", {
            type: Boolean,
        });
    }

    public async prompting() {
        const prompts: Generator.Questions = [
            ...this.installDefs(),
            {
                type: "input",
                name: "outDir",
                message: `Select ${chalk.yellow(
                    "outDir",
                )}. (Where to put transpiled files)`,
                default: "dist",
            },
            {
                type: "confirm",
                name: "esModuleInterop",
                message:
                    chalk`Allow default imports in ES module style? (e.g. {magenta import} {blueBright foo}` +
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

        this.options = await this.prompt(prompts);
    }

    public configuring() {
        if (this.typeDefs) {
            this.addDevDependencies(this.typeDefs);
        }
        const tsconfig = { ...this.options };
        this.config.set("tsconfig", tsconfig);
    }

    public writing() {
        // Setup directories
        shelljs.mkdir(this.destinationPath("src"));
        shelljs.mkdir(this.destinationPath(this.options.outDir));

        const deps = "dependencies";
        const dependencies = this.getDependencies();

        const jsx = this.hasAnyDependency("react") ? "react" : undefined;
        const { esModuleInterop, outDir, resolveJsonModule } = this.options;
        this.fs.extendJSON(this.destinationPath("tsconfig.json"), {
            compilerOptions: {
                esModuleInterop,
                jsx,
                outDir,
                resolveJsonModule,
            },
        });
        this.fs.extendJSON(this.destinationPath("tslint.json"), this.tslint);
        this.fs.extendJSON(this.destinationPath("package.json"), {
            directories: { lib: this.options.outDir },
            scripts: {
                build: "tsc",
                lint: "tslint",
            },
        });
    }

    private installDefs(): Generator.Question[] {
        const dependencies = this.getDependencies();
        const devDependencies = this.getDevDependencies();
        const deps: string[] = [
            ...Array.from(dependencies),
            ...Array.from(devDependencies),
        ];
        const choices = new Set<string>();
        for (const pkg of deps) {
            if (
                pkg !== null &&
                !blacklistJson.includes(pkg) &&
                !pkg.match(/^@types/)
            ) {
                const name = `@types/${pkg}`;
                if (!choices.has(name)) {
                    choices.add(name);
                }
            }
        }
        if (choices.size > 0) {
            return [
                {
                    type: "checkbox",
                    name: "typeDefs",
                    message: "Select Type definitions (.d.ts files) to install",
                    choices: Array.from(choices),
                },
            ];
        }
        return [];
    }
}

export default Typescript;
