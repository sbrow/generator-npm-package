import Generator from 'yeoman-generator';
import { Answers } from "inquirer";
import { Typescript } from "../typescript";

module.exports = class extends Generator {
    public props: Answers;

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
