import { readFileSync } from "fs";
import path from "path";
export function loadJSON(dir: string, file: string): any {
    return JSON.parse(readFileSync(path.join(dir, file)).toString());
}
