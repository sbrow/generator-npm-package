import { PackageGenerator, PackageGeneratorOptions } from "generator-package";
import { Package } from "generator-package/Package";
import { Questions } from "yeoman-generator";

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

        this.option("username", {
            description: "name of the user to find the config for",
            default: undefined,
            type: String,
        });
    }

    public async initializing() {
        const name = async () => {
            try {
                const user = await this.user.github.username();
                return user;
            } catch (err) {
                this.log(err, "error");
            }
            return "<username>";
        };
        if (this.options.username === undefined) {
            this.options.username = await name();
        }
    }

    public async prompting() {
        const prompts: Questions = [];
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
