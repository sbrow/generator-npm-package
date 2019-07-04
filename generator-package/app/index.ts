import Generator from "yeoman-generator";

import { Package } from "../Package";

export type Dependencies =
    | string
    | string[]
    | Set<string>
    | { [name: string]: string }
    | undefined;

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
export class PackageGenerator extends Generator {
    public options: PackageGeneratorOptions;

    constructor(args: string | any[], opts: PackageGeneratorOptions) {
        super(args, opts);

        this.option("useYarn", {
            default: this.getPackageManager(),
            description: "Whether or not to use Yarn as the package manager.",
            type: String,
        });
        this.option("required", {
            default: undefined,
            description: "Packages that are required by this Generator",
            type: String,
            hide: true,
        });
        this.option("testing", {
            default: false,
            description: "Toggled on in testing mode.",
            type: Boolean,
            hide: true,
        });

        if (opts.useYarn !== undefined) {
            this.config.set("useYarn", Boolean(this.options.useYarn));
        }
        this.composeWith(require.resolve("../helper"), {
            main: this,
        });
        if (this.options.required !== undefined) {
            this.required();
        }
    }

    public addPackage(...packages: Package[]) {
        for (const pkg of packages) {
            this.addDependencies(pkg.name, pkg.isDev);
        }
    }

    public scheduleInstall() {
        const dev = (t: boolean) => {
            const opts = { silent: true };
            if (this.options.useYarn === true) {
                return { ...opts, dev: t };
            }
            return { ...opts, "save-dev": t };
        };
        const args = [
            { pkgs: this.getDependencies(), opts: dev(false) },
            { pkgs: this.getDevDependencies(), opts: dev(true) },
        ];
        const installedPackages = [];
        const packageJson = this.fs.readJSON(
            this.destinationPath("package.json"),
        );
        if (packageJson !== undefined) {
            const depTypes = ["dependencies", "devDependencies"];
            for (const depType of depTypes) {
                if (depType in packageJson) {
                    installedPackages.push(
                        ...Object.keys(packageJson[depType]),
                    );
                }
            }
        }

        for (const arg of args) {
            if (!installedPackages.includes(arg)) {
                if (this.options.useYarn === true) {
                    this.yarnInstall(Array.from(arg.pkgs), arg.opts);
                } else {
                    this.npmInstall(Array.from(arg.pkgs), arg.opts);
                }
            }
        }
    }

    protected addDependencies(deps: Dependencies, dev: boolean = false) {
        switch (typeof deps) {
            case "undefined":
                deps = [];
                break;
            case "string":
                deps = [deps];
                break;
            case "object":
            default:
                if (deps instanceof Set) {
                    deps = Array.from(deps);
                }
                if (!(deps instanceof Array)) {
                    deps = Object.keys(deps);
                }
        }
        const dependencies = this.getDependencies(dev);
        for (const dep of deps) {
            dependencies.add(dep);
        }
        this.setDependencies(dependencies, dev);
    }

    protected addDevDependencies(deps: Dependencies) {
        this.addDependencies(deps, true);
    }

    protected getDependencies(dev: boolean = false): Set<string> {
        const t = dev ? "devDependencies" : "dependencies";
        const deps = this.config.get(t);
        if (deps instanceof Array) {
            return new Set<string>(deps);
        }
        return new Set();
    }
    /**
     * @param items The packages to search for.
     * @param dev Whether or not to match devDependencies.
     * @returns true if all items are included in the dependencies.
     */
    protected hasDependency(
        items: string | string[],
        dev: boolean = false,
    ): boolean {
        const deps = this.getDependencies(dev);
        switch (typeof items) {
            case "string":
                items = [items];
            case "object":
                break;
            default:
                const err = new Error(`typeof items === ${typeof items}`);
                // throw err;
                return false;
        }
        for (const item of items) {
            if (!deps.has(item)) {
                return false;
            }
        }
        return true;
    }

    protected hasDevDependency(items: string | string[]): boolean {
        return this.hasDependency(items, true);
    }
    protected hasAnyDependency(items: string | string[]): boolean {
        return this.hasDependency(items) || this.hasDevDependency(items);
    }

    protected setDependencies(set: Set<string>, dev: boolean = false) {
        const t = dev ? "devDependencies" : "dependencies";
        if (set !== undefined) {
            this.config.set(t, Array.from(set));
        }
    }

    protected getDevDependencies(): Set<string> {
        return this.getDependencies(true);
    }

    /**
     * Converts {@link PackageGenerator.options.required | required}
     * to a {@link Package} array.
     */
    private required() {
        if (typeof this.options.required === "string") {
            this.options.required = JSON.parse(this.options.required);
        }
        if (this.options.required !== undefined) {
            const temp = [];
            for (const pkg of this.options.required) {
                if (pkg instanceof Package) {
                    temp.push(pkg);
                } else {
                    temp.push(new Package(pkg));
                }
            }
            this.options.required = [...temp];
        }
    }

    private getPackageManager(): boolean | undefined {
        if (this.fs.exists(this.destinationPath("yarn.lock"))) {
            return true;
        }
        if (this.fs.exists(this.destinationPath("package.lock"))) {
            return false;
        }
    }
}

export default PackageGenerator;
