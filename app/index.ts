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
        const author = (typeof packageInfo.author === "object") ? packageInfo.author.name : packageInfo.author;

        // Have Yeoman greet the user.
        this.log(
            yosay(`Welcome to the ${chalk.red('npm project')} generator!\nBy ${chalk.red(`${author}`)}`)
        );

        const prompts = [];

        return this.prompt(prompts).then(props => {
            this.props = props;
        });
    }
};
