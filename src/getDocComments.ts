// From each repo, generate a .csv with the following format
// path, doc comment

import fs = require('fs');
import util = require('util');

const docCommentRegex = /\/\*\*[^]*?\*\//g;

fs.writeFileSync("./out.txt", `{ "data": [\n`);
walk("./repos").then(() => {
    fs.appendFileSync("./out.txt", "]}");
    console.log("success");
}).catch((reason) => {
    fs.appendFileSync("./out.txt", "\n]}");
    console.log(`failed: ${JSON.stringify(reason)}`);
});


interface Writer<T> {
    start: ()=> void;
    write: (filePath: string, jsDocComment: string) => Promise<void>;
    /** it is the user's responsibility to await all promises *before* calling finish. */
    finish: () => T;
}

type TagMap = { [_: string] : number};

// @ts-ignore
class TagStatsWriter implements Writer<TagMap> {
    private static tagRegex: RegExp = /(@\S*)/g;
    private tagDictionary: TagMap;

    constructor() {
        this.tagDictionary = {};
    }

    start() {}

    write(_filePath: string, jsDocComment: string): Promise<void> {
        const matches = jsDocComment.match(TagStatsWriter.tagRegex);
        if(!matches) {
            return Promise.resolve(void 0);
        }
        for(const match of matches) {
            if(!this.tagDictionary[match]) {
                this.tagDictionary[match] = 1;
            } else {
                this.tagDictionary[match] += 1;
            }
        }

        return Promise.resolve(void 0);
    }

    finish() {
        return this.tagDictionary;
    }
}

// @ts-ignore
class FileJsonWriter implements Writer<void> {
    private pastFirstLine: boolean;
    constructor(private logPath: string) {
        this.pastFirstLine = false;
    }

    start() {
        fs.writeFileSync(this.logPath, `{ "data": [\n`);
    }

    write(filePath: string, jsDocComment: string): Promise<void> {
        const jsonBlob = `,\n  { ${JSON.stringify(filePath)}: ${JSON.stringify(jsDocComment)}}`;
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

let existsPrevEntry = false;

async function walk(path: string) {
    const readdirPromise = util.promisify(fs.readdir);
    const dirEntries = await readdirPromise(path);
    const subDirPromises: Promise<void>[] = [];
    for(let dirEntry of dirEntries) {
        if (!dirEntry) {
            continue;
        }

        const filePath = `${path}/${dirEntry}`;
        
        const statPromise = util.promisify(fs.stat);
        const fileStats = await statPromise(filePath);

        if(fileStats && fileStats.isDirectory()) {
            // TODO: await here?
            subDirPromises.push(walk(filePath));
        } else {
            const extension = dirEntry.split('.').pop();
            if(extension !== 'js') {
                continue;
            }
            const fileContentsPromise = util.promisify(fs.readFile);
            const fileContents = await fileContentsPromise(filePath, "utf-8");

            let match = fileContents.match(docCommentRegex);
            if (match) {
                for (const entry of match) {
                    const jsonBlob = `  { ${JSON.stringify(filePath)}: ${JSON.stringify(entry)}}`;
                    fs.appendFileSync("./out.txt", `${existsPrevEntry ? ",\n" : ""}${jsonBlob}`);
                    existsPrevEntry = true;
                }
            }
        }
    }

    for (const promise of subDirPromises) {
        await promise;
    }
}

