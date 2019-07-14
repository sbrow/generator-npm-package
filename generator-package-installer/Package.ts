export type Package = string | DevablePackage | DevOnlyPackage | BasicPackage;
export class BasicPackage {
    public name: string = "";
    public isDev?: boolean;
}

interface DevablePackage extends BasicPackage {
    devOnly: false;
}

export interface DevOnlyPackage extends BasicPackage {
    isDev?: true;
    devOnly: true;
}
