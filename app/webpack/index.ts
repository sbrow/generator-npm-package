import Generator from 'yeoman-generator';
import chalk from "chalk";
import yosay from "yosay";
import packageInfo from "../../package.json";
import inquirer = require('inquirer');
import shelljs from "shelljs";

export class Webpack extends Generator {
    prompting() {

    }
}

export default Webpack;