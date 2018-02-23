// From each repo, generate a .csv with the following format
// path, doc comment

import fs = require('graceful-fs');
import util = require('util');
import process = require('process');

const docCommentRegex = /\/\*\*[^]*?\*\//g;

class FileJsonWriter {
    private pastFirstLine: boolean;
    constructor(private logPath: string) {
        this.pastFirstLine = false;
    }

    start() {
        fs.writeFileSync(this.logPath, `{ "data": [\n`);
    }

    write(filePath: string, jsDocComment: string): Promise<void> {
        const jsonBlob = `,\n  { "path": ${JSON.stringify(filePath)}, "comment": ${JSON.stringify(jsDocComment)}}`;
        if (this.pastFirstLine) {
            return util.promisify(fs.appendFile)(this.logPath, jsonBlob);
        } else {
            fs.appendFileSync(this.logPath, jsonBlob.slice(2));
            this.pastFirstLine = true;
            return Promise.resolve(void 0);
        }
    }

    finish() {
        fs.appendFileSync(this.logPath, "\n]}");
    }
}

const scrapeDataPath = process.argv[2];
const owner = process.argv[3];
const searchDir = `${scrapeDataPath}\\repos\\${owner}`;
const logPath = `${scrapeDataPath}\\docComments\\${owner}.json`;

const writer = new FileJsonWriter(logPath);
readJsFilesUnder(searchDir, writer).then(() => {
    console.log(`success: ${logPath}`);
}).catch((reason) => {
    console.log(`failed: ${logPath} - ${JSON.stringify(reason)}`);
});

async function readJsFilesUnder(path: string, writer: FileJsonWriter) {
    writer.start();
    try {
        await readJsFilesUnderHelper(path, writer);
    }
    finally {
        writer.finish();
    }
}

async function readJsFilesUnderHelper(path: string, writer: FileJsonWriter) {
    const readdirPromise = util.promisify(fs.readdir);
    const dirEntries = await readdirPromise(path);
    const subDirPromises: Promise<void>[] = [];
    for (let dirEntry of dirEntries) {
        if (!dirEntry) {
            continue;
        }

        const filePath = `${path}/${dirEntry}`;

        const statPromise = util.promisify(fs.stat);
        const fileStats = await statPromise(filePath);

        if (fileStats && fileStats.isDirectory()) {
            // TODO: await here?
            subDirPromises.push(readJsFilesUnderHelper(filePath, writer));
        } else {
            const extension = dirEntry.split('.').pop();
            if (extension !== 'js') {
                continue;
            }
            const fileContentsPromise = util.promisify(fs.readFile);
            const fileContents = await fileContentsPromise(filePath, "utf-8");

            let match = fileContents.match(docCommentRegex);
            if (match) {
                for (const entry of match) {
                    subDirPromises.push(writer.write(filePath, entry));
                }
            }
        }
    }

    for (const promise of subDirPromises) {
        await promise;
    }
}

