import Generator, { Answers, Question } from "yeoman-generator";

import PackageGenerator from "./PackageGenerator";

export interface HelperOptions {
    main: PackageGenerator | undefined;
}

/**
 * Helper Generator that handles behind-the-scenes context
 * for the {@link PackageGenerator | Package Generator}.
 *
 * @remarks
 * Automatically installs required packages and
 * prompts the user to install optional ones.
 *
 * @todo Ask about yarn.
 */
export class Helper extends Generator {
    /**
     * Pointer to the primary {@link PackageGenerator | Package Generator}.
     */
    private main: PackageGenerator | undefined;

    constructor(args: string | any[], opts: HelperOptions) {
        super(args, opts);
        this.main = opts.main;
    }

    /**
     * During initialization, required packages are added to the dependencies.
     */
    public initializing() {
        if (this.main !== undefined) {
            const { packages } = this.main;
            if (!packages.required) {
                throw new Error(`No required packages were defined. \
Did you forget to call "this.required()" in your  constructor?`);
            }
            this.main.addPackage(...packages.required);
        }
    }

    /**
     * Prompts the user for which optional packages to install.
     */
    public prompting(): void {
        const prompts: Generator.Questions = [];
        if (this.main.options.useYarn === undefined) {
            prompts.push({
                type: "confirm",
                name: "useYarn",
                message: "Would you like to use Yarn as your package manager?",
                default: this.main.useYarn(),
                store: true,
            });
        }
        if (this.main !== undefined) {
            const { optional } = this.main.packages;

            if (optional) {
                prompts.push({
                    type: "checkbox",
                    name: "optional",
                    message: "Select optional packages to install",
                    choices: optional,
                });
            }
        }
        return this.prompt(prompts).then(answers => {
            // Install optional packages
            if (answers.optional) {
                for (const pkg of answers.optional) {
                    this.main.addPackage(pkg);
                }
            }

            // set `useYarn`.
            if (answers.useYarn) {
                this.options.useYarn = answers.useYarn;
                this.config.set("useYarn", this.options.useYarn);
            }
        });
    }

    /**
     * Installs required, optional, and additional packages.
     */
    public installing() {
        if (this.main !== undefined) {
            this.main.scheduleInstall();
        }
    }
}

// export default Helper;
module.exports = Helper;
