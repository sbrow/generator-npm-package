import Generator from "yeoman-generator";

export class BaseGenerator extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.config.save();
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
