import Generator from 'yeoman-generator';
import chalk from "chalk";
import inquirer = require('inquirer');
import path from "path";
import packageInfo from "../package.json";
import yosay from "yosay";
import shelljs, { exit } from "shelljs";

module.exports = class extends Generator {
    public props: inquirer.Answers;

    constructor(args, opts) {
        super(args, opts);
        this.composeWith(require.resolve('generator-npm-init/app'), {
            version: "0.0.0",
            author: this.user.git.name(),
        });
        this.composeWith(require.resolve('./installer'), {});
    }

    initializing() {
        const getUser = (): string => {
            const sources = [
                this.user.git.name().split(" ")[0],
                process.env.USER,
            ]
            for (let source of sources) {
                source.trim();
                if (source !== "") {
                    return source
                }
            }
            return "user"
        };

        const user = getUser();
        const packageName = packageInfo.name.replace(/(generator)?\-/g, " ").trim();
        const author = (typeof packageInfo.author === "object") ? packageInfo.author.name : packageInfo.author;

        // Have Yeoman greet the user.
        this.log(yosay(`'Allo, ${user}!
Welcome to the ${chalk.red(packageName)} generator.
Brought to you by ${chalk.yellow(author)}.`));
    }
    prompting() {
        const dirs = shelljs.ls(this.destinationRoot());

        if (dirs.length > 0) {
            enum choices {
                Yes = "y",
                No = "n",
                Create = "c",
                Delete = "d",
            }

            const prompts = {
                type: "expand",
                message: "Your current directory is not clean, proceed?",
                name: "action",
                // choices: ["Yes- Proceed with a dirty directory", "No- exit without any further action", "Clean first, and then proceed"],
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
                    name: `Delete this directory's contents before proceeding.`,
                    value: choices.Delete,
                },
                ],
                default: [1]
            }

            return this.prompt(prompts).then((props: any) => {
                switch (props.action) {
                    case choices.No:
                        this.log(yosay("Come back soon!"));
                        exit(0);
                        break;
                    case choices.Create:
                        // @todo Choices.create
                        break;
                    case choices.Delete:
                        shelljs.rm("-rf", path.join(this.destinationRoot(), ("*")));
                    case choices.Yes:
                    default:
                }
                this.props = props;
            });
        }
    }

    end() {
        const projectName = require(this.destinationPath("package.json")).name || "your project";
        shelljs.rm(this.destinationPath(".yo-rc.json"));

        this.log(yosay(`You're all set.\nGood luck with ${chalk.blue(projectName)}!`))
    }
};
