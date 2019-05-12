import chalk from "chalk";
import inquirer from "inquirer";
import path from "path";
import shelljs, { exit } from "shelljs";
import Generator from "yeoman-generator";
import yosay from "yosay";

const packageJson = require("../../package.json");

enum choices {
    Yes = "y",
    No = "n",
    Create = "c",
    Delete = "d",
}

module.exports = class extends Generator {
    public props: inquirer.Answers;

    public prompts: Generator.Questions = [];

    constructor(args, opts) {
        super(args, opts);
        this.composeWith(require.resolve("generator-npm-init/app"), {
            author: this.user.git.name(),
            version: "0.0.0",
        });
        this.composeWith(require.resolve("../installer"), {});
    }

    public initializing() {
        const getUser = (): string => {
            const sources = [
                this.user.git.name().split(" ")[0],
                process.env.USER,
            ];
            for (const source of sources) {
                source.trim();
                if (source !== "") {
                    return source;
                }
            }
            return "user";
        };

        const user = getUser();
        const packageName = packageJson.name.replace(/(generator)?\-/g, " ").trim();
        const author = (typeof packageJson.author === "object") ? packageJson.author.name : packageJson.author;

        // Have Yeoman greet the user.
        this.log(yosay(`'Allo, ${user}!
        Welcome to the ${chalk.red(packageName)} generator.
        Brought to you by ${chalk.yellow(author)}.`));
        this.log("You will be guided through the scaffolding of a new npm package.");
    }

    public prompting() {
        const dirs = shelljs.ls(this.destinationRoot());

        const checkDirClean = () => {
            if (dirs.length === 0) {
                return [];
            }

            return [{
                type: "expand",
                name: "action",
                message: `"${this.destinationRoot()}" is not clean, proceed?`,
                default: [1],
                choices: [{
                    key: choices.Yes,
                    name: `Yes, continue installing in a dirty directory`,
                    value: choices.Yes,
                },
                {
                    key: choices.No,
                    name: `No, exit immediately.`,
                    value: choices.No,
                },
                {
                    key: choices.Create,
                    name: `Create the project in a subdirectory.`,
                    value: choices.Create,
                },
                {
                    key: choices.Delete,
                    name: `Delete the contents of "${this.destinationRoot()}" before proceeding.`,
                    value: choices.Delete,
                },
                ],
            }];
        };

        const prompts: Generator.Questions = [...checkDirClean(), {
            type: "confirm",
            name: "useYarn",
            message: "Would you like to use yarn as your package manager?",
            default: false,
            store: true,
        }];

        return this.prompt(prompts).then((props: any) => {
            switch (props.action) {
                case choices.No:
                    this.log(yosay("Come back soon!"));
                    exit(0);
                    break;
                case choices.Create:
                    return this.prompt([{
                        name: "dirName",
                        message: "What directory should be created?",
                    }]).then((props2: any) => {
                        if (props2.dirName === "") {
                            this.log("No name was entered");
                            return this.prompting();
                        }
                        shelljs.mkdir(props2.dirName);
                        this.destinationRoot(this.destinationPath(props2.dirName));
                    });
                case choices.Delete:
                    shelljs.rm("-rf", path.join(this.destinationRoot(), ("*")));
                    shelljs.rm("-rf", path.join(this.destinationRoot(), (".yo-rc.json")));
                case choices.Yes:
                default:
            }
            this.config.set("useYarn", props.useYarn);
        });
    }

    public end() {
        const projectName = require(this.destinationPath("package.json")).name || "your project";
        // shelljs.rm(this.destinationPath(".yo-rc.json"));
        this.log(yosay(`You're all set.\nGood luck with ${chalk.blue(projectName)}!`));
    }
};
