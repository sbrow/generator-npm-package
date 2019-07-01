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
            for (const pkg of packages.required) {
                this.main.addPackage(pkg);
            }
        }
    }

    /**
     * Prompts the user for which optional packages to install.
     */
    public prompting() {
        if (this.main !== undefined) {
            const { optional } = this.main.packages;

            if (optional) {
                const prompt: Question = {
                    type: "checkbox",
                    name: "optional",
                    message: "Select optional packages to install",
                    choices: optional,
                };

                return this.prompt([prompt]).then((answers: Answers) => {
                    for (const pkg of answers.optional) {
                        this.main.addPackage(pkg);
                    }
                });
            }
        }
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
