"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yeoman_generator_1 = __importDefault(require("yeoman-generator"));
module.exports = class extends yeoman_generator_1.default {
    prompting() {
        const prompts = [
            {
                type: 'confirm',
                name: 'useTypescript',
                message: 'would you like to use Typescript in your package?',
                default: true
            }
        ];
        return this.prompt(prompts).then(props => {
            if (props.useTypescript) {
                // @ts-ignore
                this.composeWith(require.resolve('../typescript'), {});
            }
            this.props = props;
        });
    }
};
