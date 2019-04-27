"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yeoman_generator_1 = __importDefault(require("yeoman-generator"));
class Typescript extends yeoman_generator_1.default {
    constructor() {
        super(...arguments);
        this.devDependencies = ["typescript", "@types/node", "tslint"];
        this.tslint = {
            extends: "tslint:recommended",
            rules: {},
        };
    }
    prompting() {
        const prompts = [];
        return this.prompt(prompts).then(props => {
            this.props = props;
        });
    }
    writing() {
        this.fs.extendJSON(this.destinationPath('tslint.json'), this.tslint);
        this.fs.extendJSON(this.destinationPath('package.json'), { scripts: { lint: "tslint" } });
    }
    install() {
        this.log('Installing devDependencies');
        this.npmInstall(this.devDependencies, { "save-dev": true });
    }
}
exports.Typescript = Typescript;
;
module.exports = Typescript;
exports.default = Typescript;
