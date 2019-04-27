"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yeoman_generator_1 = __importDefault(require("yeoman-generator"));
class Jest extends yeoman_generator_1.default {
    prompting() {
        const prompts = [];
        return this.prompt(prompts).then(props => {
            this.props = props;
        });
    }
    writing() {
        this.fs.extendJSON(this.destinationPath('package.json'), { scripts: { test: "jest" } });
    }
}
exports.Jest = Jest;
;
module.exports = Jest;
exports.default = Jest;
