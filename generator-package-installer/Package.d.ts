export declare type SerializedPackage = string | {
    name: string;
    devOnly?: boolean;
    isDev?: boolean;
};
export declare class Package {
    name: string;
    devOnly: boolean;
    isDev: boolean;
    constructor(props: SerializedPackage);
}
