import Generator from "yeoman-generator";
import { Package, SerializedPackage } from "./installer/Package";

export type Dependencies =
    | string
    | string[]
    | Set<string>
    | { [name: string]: string }
    | undefined;

export interface PackageGeneratorOptions {
    dependencies?: Dependencies;
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
 * 3. Call {@link PackageGenerator.scheduleInstall | scheduleInstall}
 * when you've finished configuring dependencies.
 * Do this before the  step.
 */
export class PackageGenerator extends Generator {
    public options: PackageGeneratorOptions;
    public packages: {
        required: Package[];
        optional: Package[] | undefined;
    };

    constructor(args: string | any[], opts: PackageGeneratorOptions) {
        super(args, opts);

        this.option("useYarn", {
            default: this.shouldUseYarn(),
            description: "Whether or not to use Yarn as the package manager.",
            type: Boolean,
        });
        if ("dependencies" in opts) {
            this.addDependencies(opts.dependencies);
        }
        const useYarn: boolean | undefined =
            this.config.get("useYarn") || opts.useYarn || this.options.useYarn;

        if (useYarn !== undefined) {
            this.options.useYarn = useYarn;
            this.config.set("useYarn", this.options.useYarn);
        }
        this.packages = { required: undefined, optional: undefined };
        this.composeWith(require.resolve("./Helper"), {
            main: this,
        });
    }

    /**
     * Used to define packages that are required by this generator.
     *
     * **Must** be called in the constructor.
     */
    public required(...packages: Array<Package | SerializedPackage>) {
        this.packages.required = [];
        for (const pkg of packages) {
            if (pkg instanceof Package) {
                this.packages.required.push(pkg);
            } else {
                this.packages.required.push(new Package(pkg));
            }
        }
    }

    public prompting() {
        if (this.options.useYarn === undefined) {
            const prompts: Generator.Questions = [
                {
                    type: "confirm",
                    name: "useYarn",
                    message:
                        "Would you like to use Yarn as your package manager?",
                    default: this.useYarn(),
                    store: true,
                },
            ];
            return this.prompt(prompts).then(answers => {
                this.options.useYarn = answers.useYarn;
                this.config.set("useYarn", this.options.useYarn);
            });
        }
    }

    public addPackage(pack: Package) {
        this.addDependencies(pack.name, pack.isDev);
    }

    public scheduleInstall() {
        const dev = (t: boolean) => {
            const opts = { silent: true };
            if (this.useYarn()) {
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
                if (this.useYarn()) {
                    this.yarnInstall(Array.from(arg.pkgs), arg.opts);
                } else {
                    this.npmInstall(Array.from(arg.pkgs), arg.opts);
                }
            }
        }
    }

    public useYarn(): boolean {
        return this.options.useYarn || false;
    }
    public shouldUseYarn(): boolean | undefined {
        if (this.fs.exists(this.destinationPath("yarn.lock"))) {
            return true;
        }
        if (this.fs.exists(this.destinationPath("package.lock"))) {
            return false;
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
        if (typeof items === "string") {
            items = [items];
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
        this.config.set(t, Array.from(set));
    }

    protected getDevDependencies(): Set<string> {
        return this.getDependencies(true);
    }

    protected setDevDependencies(set: Set<string>) {
        this.setDependencies(set, true);
    }
}

export default PackageGenerator;
