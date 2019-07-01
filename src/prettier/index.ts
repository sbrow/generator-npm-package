import Generator from "yeoman-generator";

import { Package } from "../installer/Package";
import { PackageGenerator, PackageGeneratorOptions } from "../PackageGenerator";

export interface PrettierOptions extends PackageGeneratorOptions {
    prettier?: string;
}

/**
 * Installs and configures {@link prettier}.
 */
export class PrettierGenerator extends PackageGenerator {
    public options: PrettierOptions;

    constructor(args: string | any[], opts: PrettierOptions) {
        super(args, opts);
        this.argument("prettier", { type: String, required: false });
        this.required(new Package({ name: "prettier", devOnly: true }));
    }

    public async prompting() {
        const prompts: Generator.Questions = [];
        let username = "<username>";
        try {
            const name = await this.user.github.username();
            username = name;
        } catch (err) {
            this.log(err, "error");
        }
        if (this.options.prettier === undefined) {
            prompts.push({
                type: "input",
                name: "configPackage",
                message: "Enter your package name:",
                default: `@${username}/prettier-config`,
                store: true,
            });
        }

        const answers = await this.prompt(prompts);
        if (this.options.prettier === undefined && answers.configPackage) {
            this.options.prettier = answers.configPackage;
        }
        this.addDevDependencies(this.options.prettier);
    }

    public writing() {
        this.fs.extendJSON(this.destinationPath("package.json"), {
            prettier: this.options.prettier,
        });
    }
}

module.exports = PrettierGenerator;
