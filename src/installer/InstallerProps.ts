export class InstallerProps {
    public dependencies: Set<string>;
    public devDependencies: Set<string>;

    constructor() {
        this.dependencies = new Set();
        this.devDependencies = new Set();
    }
}
