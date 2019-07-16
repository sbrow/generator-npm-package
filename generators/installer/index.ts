import Generator from "yeoman-generator";

import { Package } from "../../generator-package-installer/Package";
import { PackageGenerator } from "../../generator-package-installer/app";
import packagesJson from "./packages.json";

export class Installer extends PackageGenerator {
    // @todo is this necessary?
    public props: { packages: string[] };
    constructor(args, opts) {
        super(args, { ...opts, required: "[]" });
        this.props = {
            packages: [],
        };
    }

    public prompting() {
        let choices = [];
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
                    choices.push(simpleChoice);
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
                this.addPackage(...packages);
                for (const packageName of packages) {
                    this.addPackage(packageName);
                }
            }
        }
        for (const pkg of packagesJson.Other) {
            const name = typeof pkg === "object" ? pkg.name : pkg;
            if (this.props.packages.includes(name)) {
                this.addPackage(pkg);
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
