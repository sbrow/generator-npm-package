"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yeoman_generator_1 = __importDefault(require("yeoman-generator"));
const chalk_1 = __importDefault(require("chalk"));
const yosay_1 = __importDefault(require("yosay"));
const package_json_1 = __importDefault(require("../package.json"));
module.exports = class extends yeoman_generator_1.default {
    constructor(args, opts) {
        super(args, opts);
        this.composeWith(require.resolve('generator-npm-init/app'), {
            version: "0.0.0",
            author: this.user.git.name(),
        });
        this.composeWith(require.resolve('./selector'), {});
    }
    prompting() {
        const getUser = () => {
            const sources = [
                this.user.git.name().split(" ")[0],
                process.env.USER,
            ];
            for (let source of sources) {
                source.trim();
                if (source !== "") {
                    return source;
                }
            }
            return "user";
        };
        const user = getUser();
        const packageName = package_json_1.default.name.replace(/(generator)?\-/g, " ").trim();
        const author = (typeof package_json_1.default.author === "object") ? package_json_1.default.author.name : package_json_1.default.author;
        // Have Yeoman greet the user.
        this.log(yosay_1.default(`'Allo, ${user}!
Welcome to the ${chalk_1.default.red(packageName)} generator.
Brought to you by ${chalk_1.default.yellow(author)}.`));
        const prompts = [];
        return this.prompt(prompts).then(props => {
            this.props = props;
        });
    }
    end() {
        this.log(yosay_1.default(`You're all set. Good luck with your project!`));
    }
};
