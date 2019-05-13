import { readFileSync } from "fs";
import path from "path";

/**
 * Returns the contents of file with name `file` from the directory
 * at path `dir` as a parsed object.
 *
 * @export
 * @param {string} dir
 * @param {string} file
 * @returns {*}
 */
export function loadJSON(dir: string, file: string): any {
    return JSON.parse(load(dir, file));
}

export function load(dir: string, file: string): string {
    return readFileSync(path.join(dir, file)).toString();
}
