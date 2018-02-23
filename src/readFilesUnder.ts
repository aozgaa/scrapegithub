import fs = require('graceful-fs');
import util = require('util');
import { IWriter } from "./IWriter";

const maxPromises = 50;
export async function readFilesUnder(dir: string, writer: IWriter) {
    const readdirPromise = util.promisify(fs.readdir);
    const dirEntries = await readdirPromise(dir);

    let filePromises: Promise<string>[] = [];
    for (let i = 0; i < dirEntries.length; ++i) {
        if (filePromises.length >= maxPromises) {
            for (const promise of filePromises) {
                const fileContents = await promise;
                writer.write(fileContents);
            }
            filePromises = [];
        }

        const jsonFile = dirEntries[i];
        const jsonPath = `${dir}/${jsonFile}`;
        const fileContentsPromise = util.promisify(fs.readFile)(jsonPath, "utf-8");
        filePromises.push(fileContentsPromise);
    }

    for (const promise of filePromises) {
        const fileContents = await promise;
        writer.write(fileContents);
    }
    filePromises = [];

    writer.finish();
}