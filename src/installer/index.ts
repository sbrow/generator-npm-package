import Generator from "yeoman-generator";

import packagesJson from "./packages.json";
import { BaseGenerator } from "../BaseGenerator";

export class Installer extends BaseGenerator {
    public props: { packages: string[] };
    constructor(args, opts) {
        super(args, opts);
        this.props = {
            packages: [],
        };
    }

    public prompting() {
        const choices = [];
        for (const choice of Object.keys(packagesJson)) {
            choices.push(choice);
        }
        const prompts: Generator.Questions = [
            {
                type: "checkbox",
                name: "packages",
                message: "Select packages to install",
                choices,
            },
        ];

        return this.prompt(prompts).then((props: { packages: string[] }) => {
            if (props) {
                this.props.packages = props.packages;
            }
        });
    }

    public configuring() {
        if (this.props.packages === undefined) {
            this.props.packages = [];
        }
        if (this.props.packages.includes("Typescript")) {
            this.composeWith(require.resolve("../typescript"), {});
        }
        if (this.props.packages.includes("Jest")) {
            this.composeWith(require.resolve("../jest"), {});
        }
        if (this.props.packages.includes("Webpack")) {
            this.composeWith(require.resolve("../webpack"), {});
        }
    }

    public writing() {
        this.fs.extendJSON(this.destinationPath("package.json"), { scripts: { start: "node $npm_package_main" } });
    }
    public default() {
        const dependencies = this.getDependencies();
        const devDependencies = this.getDevDependencies();
        for (const dep of devDependencies) {
            dependencies.add(dep);
        }
        const deps = Array.from(dependencies);
        if (deps.length > 0) {
            this.log(`Installing node packages: ${deps.join(" ")}`);
        } else {
            this.log("No additional packages will be installed.");
        }
    }
}

module.exports = Installer;

export default Installer;
