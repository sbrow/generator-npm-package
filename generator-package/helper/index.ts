import Generator from "yeoman-generator";

import PackageGenerator from "../app";
import { Package } from "../../generators/installer/Package";

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
            let { required } = this.main.options;
            if (required === undefined) {
                throw new Error(`No required packages were defined. \
Did you forget to call "this.required()" in your  constructor?`);
            }
            if (typeof required === "string") {
                required = JSON.parse(required) as Package[];
            }
            this.main.addPackage(...required);
        }
    }

    /**
     * Prompts the user for which optional packages to install.
     */
    public prompting(): Promise<void> {
        const prompts: Generator.Questions = [];
        if (this.main.options.useYarn === undefined) {
            prompts.push({
                type: "confirm",
                name: "useYarn",
                message: "Would you like to use Yarn as your package manager?",
                default: false,
                store: true,
            });
        }
        if (this.main !== undefined) {
            let { optional } = this.main.options;

            if (typeof optional === "string") {
                optional = JSON.parse(optional);
            }
            if (optional !== undefined) {
                // prompts.push({
                //     type: "checkbox",
                //     name: "optional",
                //     message: "Select optional packages to install",
                //     choices: optional,
                // });
            }
        }
        return this.prompt(prompts).then(answers => {
            // Install optional packages
            if (answers.optional !== undefined) {
                for (const pkg of answers.optional) {
                    this.main.addPackage(pkg);
                }
            }

            // set `useYarn`.
            if (answers.useYarn !== undefined) {
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

module.exports = Helper;
