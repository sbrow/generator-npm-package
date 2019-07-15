import Generator from "yeoman-generator";
import { PackageGenerator } from "../app";
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
export declare class Helper extends Generator {
    /**
     * Pointer to the primary {@link PackageGenerator | Package Generator}.
     */
    private main;
    constructor(args: string | any[], opts: HelperOptions);
    /**
     * During initialization, required packages are added to the dependencies.
     */
    initializing(): void;
    /**
     * Prompts the user for which optional packages to install.
     */
    prompting(): Promise<void>;
    /**
     * Installs required, optional, and additional packages.
     */
    installing(): void;
}
