import Generator from "yeoman-generator";

import { Package } from "../../generators/installer/Package";
import {
    PackageGenerator,
    PackageGeneratorOptions,
} from "../../generator-package/app";

export interface PrettierOptions extends PackageGeneratorOptions {
    prettier?: string;
    username?: string;
}

/**
 * Installs and configures {@link prettier}.
 */
export class PrettierGenerator extends PackageGenerator {
    public options: PrettierOptions;

    constructor(args: string | any[], opts: PrettierOptions) {
        super(args, {
            ...opts,
            required: JSON.stringify([
                new Package({ name: "prettier", devOnly: true }),
            ]),
        });
        this.argument("prettier", { type: String, required: false });
        const name = async () => {
            try {
                const user = await this.user.github.username();
                return user;
            } catch (err) {
                this.log(err, "error");
            }
            return "<username>";
        };
        this.option("username", {
            description: "name of the user to find the config for",
            default: name(),
            type: String,
        });
    }

    public async prompting() {
        const prompts: Generator.Questions = [];
        if (this.options.prettier === undefined) {
            prompts.push({
                type: "input",
                name: "configPackage",
                message: "Enter your package name:",
                default: `@${this.options.username}/prettier-config`,
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
