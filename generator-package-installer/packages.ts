import { Package } from "./Package";

export function devOnly(...packageNames: string[]): Package[] {
    const packages: Package[] = [];
    for (const pkg of packageNames) {
        packages.push({ name: pkg, devOnly: true });
    }
    return packages;
}
