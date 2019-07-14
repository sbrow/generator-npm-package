import { Package } from "./Package";

export function devOnly(...packageNames: string[]): Package[] {
    const packages: Package[] = [];
    for (const pkg of packageNames) {
        packages.push(new Package({ name: pkg, devOnly: true }));
    }
    return packages;
}
