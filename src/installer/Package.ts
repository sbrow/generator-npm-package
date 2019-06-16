export class Package {
    public name: string;
    public devOnly: boolean;
    public isDev: boolean;

    constructor(props: string | { name: string, devOnly?: boolean, isDev?: boolean }) {
        this.devOnly = false;
        this.isDev = false;

        if (typeof props === "string") {
            this.name = props;
        } else {
            const { name, isDev, devOnly } = props;
            this.name = name;
            this.devOnly = devOnly || false;
            if (devOnly) {
                this.isDev = true;
            } else {
                this.isDev = isDev || false;
            }
        }
    }
}
