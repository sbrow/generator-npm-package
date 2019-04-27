import inquirer = require('inquirer');

export class SelectorProps implements inquirer.Answers {
    public dependencies: Set<string>;
    public devDependencies: Set<string>;
    public useTypescript: boolean;

    constructor() {
        this.dependencies = new Set<string>()
        this.devDependencies = new Set<string>()
        this.useTypescript = false;
    }
}
