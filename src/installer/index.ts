import Generator from "yeoman-generator";

import { Package } from "src/installer/Package";
import { BaseGenerator } from "../BaseGenerator";
import packagesJson from "../installer/packages.json";

export class Installer extends BaseGenerator {
    public props: { packages: string[] };
    constructor(args, opts) {
        super(args, opts);
        this.props = {
            packages: [],
        };
    }

    public prompting() {
        let choices: Array<string | Package> = [];
        const packageJson = this.fs.readJSON(
            this.destinationPath("package.json"),
        );

        const inject = (obj: any, prop: string): any[] => {
            if (typeof obj === "object") {
                if (prop in obj) {
                    const value = obj[prop];
                    if (value instanceof Array) {
                        return value;
                    }
                }
            }
            return [];
        };
        const installed = [
            ...inject(packageJson, "dependencies"),
            ...inject(packageJson, "devDependencies"),
        ];
        this.config.set("installed", installed);

        const filter = (value: string): boolean => {
            if (value in packagesJson) {
                let packages = packagesJson[value];
                this.log(`packages: '${JSON.stringify(packages)}'`);
                if (!(packages instanceof Array)) {
                    packages = [packages];
                }
                for (const pkg of packages) {
                    if (!installed.includes(pkg)) {
                        return true;
                    }
                }
            } else if (!(value in packagesJson.Other)) {
                return true;
            }
            return false;
        };
        for (const choice of Object.keys(packagesJson)) {
            if (choice !== "Other") {
                choices.push(choice);
            } else {
                for (const simpleChoice of packagesJson[choice]) {
                    if (typeof simpleChoice === "string") {
                        choices.push(simpleChoice);
                    } else {
                        choices.push(simpleChoice.name);
                    }
                }
            }
        }
        choices = choices.filter(filter).sort();
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
        const useYarn = this.config.get("useYarn");
        if (this.props.packages === undefined) {
            this.props.packages = [];
        }
        if (this.props.packages.includes("Typescript")) {
            this.composeWith(require.resolve("../typescript"), { useYarn });
        }
        if (this.props.packages.includes("Jest")) {
            this.composeWith(require.resolve("../jest"), { useYarn });
        }
        if (this.props.packages.includes("Webpack")) {
            this.composeWith(require.resolve("../webpack"), { useYarn });
        }

        for (const choice of Object.keys(packagesJson)) {
            if (this.props.packages.includes(choice)) {
                let packages: Package | Package[] = packagesJson[choice];
                if (!(packages instanceof Array)) {
                    packages = [packages];
                }
                for (const packageName of packages) {
                    this.addPackage(new Package(packageName));
                }
            }
        }
        for (const pkg of packagesJson.Other) {
            const pack = new Package(pkg);
            if (this.props.packages.includes(pack.name)) {
                this.addPackage(pack);
            }
        }
    }

    public writing() {
        this.fs.extendJSON(this.destinationPath("package.json"), {
            scripts: { start: "node $npm_package_main" },
        });
    }
    public default() {
        const dependencies = this.getDependencies();
        const devDependencies = this.getDevDependencies();
        const devDeps = Array.from(devDependencies);
        for (const dep of devDeps) {
            dependencies.add(dep);
        }
        const deps = Array.from(dependencies);
        if (deps.length > 0) {
            this.log(`Installing node packages: ${deps.join(" ")}`);
        } else {
            this.log("No additional packages will be installed.");
        }
        this.scheduleInstall();
    }
}

module.exports = Installer;

export default Installer;
