import Generator from "yeoman-generator";

type dependencies = string | string[] | Set<string> | { [name: string]: string } | undefined;

export class BaseGenerator extends Generator {
    public useYarn: boolean = false;

    constructor(args, opts: any) {
        super(args, opts);
        if (typeof opts !== "undefined") {
            if (opts.useYarn || this.config.get("useYarn")) {
                this.useYarn = true;
            }
        }
        this.config.set("useYarn", this.useYarn);
        const packageJson = this.fs.readJSON(this.destinationPath("package.json"));
        if (typeof packageJson !== "undefined") {
            this.addDependencies(packageJson.dependencies);
            this.addDevDependencies(packageJson.devDependencies);
        }
    }

    public scheduleInstall() {
        const dev = (t: boolean) => {
            if (this.useYarn) {
                return { dev: t };
            }
            return { "save-dev": t };
        };
        const args = [
            { pkgs: this.getDependencies(), opts: dev(false) },
            { pkgs: this.getDevDependencies(), opts: dev(true) },
        ];
        for (const arg of args) {
            if (this.useYarn) {
                this.yarnInstall(Array.from(arg.pkgs), { ...arg.opts, silent: true });
            } else {
                this.npmInstall(Array.from(arg.pkgs), arg.opts);
            }
        }
    }

    protected addDependencies(deps: dependencies, dev: boolean = false) {
        const dependencies = this.getDependencies(dev);
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
                    break;
                }
            default:
                deps = Object.keys(deps);
        }
        for (const dep of deps) {
            dependencies.add(dep);
        }
        this.setDependencies(dependencies, dev);
    }

    protected addDevDependencies(deps: dependencies) {
        this.addDependencies(deps, true);
    }

    protected getDependencies(dev: boolean = false): Set<string> {
        const t = (dev) ? "devDependencies" : "dependencies";
        return new Set(this.config.get(t));
    }

    /**
     * @param items The packages tosearch for.
     * @param dev Whether or not to match devDependencies.
     * @returns true if all items are included in the dependencies.
     */
    protected hasDependency(items: string | string[], dev: boolean = false): boolean {
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
        const t = (dev) ? "devDependencies" : "dependencies";
        this.config.set(t, Array.from(set));
    }

    protected getDevDependencies(): Set<string> {
        return this.getDependencies(true);
    }

    protected setDevDependencies(set: Set<string>) {
        this.setDependencies(set, true);
    }
}
