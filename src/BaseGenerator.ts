import Generator from "yeoman-generator";

export class BaseGenerator extends Generator {
    public useYarn: boolean = false;

    constructor(args, opts) {
        super(args, opts);
        if (opts.useYarn || this.config.get("useYarn")) {
            this.useYarn = true;
        }
        this.config.set("useYarn", this.useYarn);
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

    protected addDependencies(deps: string | string[] | Set<string>) {
        const dependencies = this.getDependencies();
        if (typeof deps === "string") {
            deps = [deps];
        } else if (!(deps instanceof Array)) {
            deps = Array.from(deps);
        }
        for (const dep of deps) {
            dependencies.add(dep);
        }
        this.setDependencies(dependencies);
    }

    protected addDevDependencies(deps: string | string[] | Set<string>) {
        const dependencies = this.getDevDependencies();
        if (typeof deps === "string") {
            deps = [deps];
        } else if (!(deps instanceof Array)) {
            deps = Array.from(deps);
        }
        for (const dep of deps) {
            dependencies.add(dep);
        }
        this.setDevDependencies(dependencies);
    }

    protected getDependencies(): Set<string> {
        return new Set(this.config.get("dependencies"));
    }

    protected setDependencies(set: Set<string>) {
        this.config.set("dependencies", Array.from(set));
    }

    protected getDevDependencies(): Set<string> {
        return new Set(this.config.get("devDependencies"));
    }

    protected setDevDependencies(set: Set<string>) {
        this.config.set("devDependencies", Array.from(set));
    }
}
