type UnionKeys<T> = T extends any ? keyof T : never;
type StrictUnionHelper<T, TAll> = T extends any
    ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>>
    : never;
type StrictUnion<T> = StrictUnionHelper<T, T>;

export type Package =
    | string
    | StrictUnion<DevablePackage | DevOnlyPackage | BasicPackage>;
export class BasicPackage {
    public name: string = "";
    public isDev?: boolean;
}

export interface DevablePackage extends BasicPackage {
    devOnly: false;
}

export interface DevOnlyPackage extends BasicPackage {
    isDev?: true;
    devOnly: true;
}
