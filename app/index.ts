import Generator from 'yeoman-generator';
import chalk from "chalk";
import yosay from "yosay";
import packageInfo from "../package.json";
import inquirer = require('inquirer');

module.exports = class extends Generator {
    public props: inquirer.Answers;

    constructor(args, opts) {
        super(args, opts);
        this.composeWith(require.resolve('generator-npm-init/app'), {
            version: "0.0.0",
            author: this.user.git.name(),
        });
        this.composeWith(require.resolve('./selector'), {});
    }

    prompting() {
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

        const prompts = [];

        return this.prompt(prompts).then(props => {
            this.props = props;
        });
    }

    end() {
        this.log(yosay(`You're all set. Good luck with your project!`))
    }
};
