import Generator from "yeoman-generator";

export class BaseGenerator extends Generator {
    constructor(args, opts) {
        super(args, opts);
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
