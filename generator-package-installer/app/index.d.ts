import Generator from "yeoman-generator";
import { Package } from "../Package";
export declare type Dependencies = string | string[] | Set<string> | {
    [name: string]: string;
} | undefined;
export interface PackageGeneratorOptions {
    optional?: string | Package[];
    required?: string | Package[];
    useYarn?: boolean;
}
/**
 * A generator that configures and installs npm packages.
 *
 * In order to make a successful package generator,
 * you must do the following:
 * 1. Call {@link PackageGenerator.required | required}
 * with any packages that must be installed.
 * 2. Call {@link PackageGenerator.optional | optional}
 * with any packages to prompt the user for.
 */
export declare class PackageGenerator extends Generator {
    options: PackageGeneratorOptions;
    constructor(args: string | any[], opts: PackageGeneratorOptions);
    addPackage(...packages: Package[]): void;
    scheduleInstall(): void;
    protected addDependencies(deps: Dependencies, dev?: boolean): void;
    protected addDevDependencies(deps: Dependencies): void;
    protected getDependencies(dev?: boolean): Set<string>;
    /**
     * @param items The packages to search for.
     * @param dev Whether or not to match devDependencies.
     * @returns true if all items are included in the dependencies.
     */
    protected hasDependency(items: string | string[], dev?: boolean): boolean;
    protected hasDevDependency(items: string | string[]): boolean;
    protected hasAnyDependency(items: string | string[]): boolean;
    protected setDependencies(set: Set<string>, dev?: boolean): void;
    protected getDevDependencies(): Set<string>;
    /**
     * Converts {@link PackageGenerator.options.required | required}
     * to a {@link Package} array.
     */
    private required;
    private getPackageManager;
}
