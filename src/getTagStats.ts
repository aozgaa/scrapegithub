// From each repo, generate a .csv with the following format
// path, doc comment

import fs = require('graceful-fs');
import util = require('util');
import parseJson = require('json-parse-better-errors');

type TagMap = { [_: string]: number };

class TagStatsWriter {
    private static tagRegex: RegExp = /\* @[\w\-]*/g;
    private tagDictionary: TagMap;

    constructor(private logPath: string) {
        this.tagDictionary = {};
    }

    write(jsDocComment: string) {
        const tagMatches = jsDocComment.match(TagStatsWriter.tagRegex);
        if (!tagMatches) {
            return;
        }
        for (const match of tagMatches) {
            const atTag = match.slice(2);
            if (!this.tagDictionary.hasOwnProperty(atTag)) {
                this.tagDictionary[atTag] = 1;
            } else {
                this.tagDictionary[atTag] += 1;
            }
        }

        return;
    }

    finish() {
        fs.writeFileSync(this.logPath, JSON.stringify(this.tagDictionary));
        console.log(`success: ${this.logPath}`);
    }
}

async function getTags(docCommentsDir: string) {
    const readdirPromise = util.promisify(fs.readdir);
    const jsDocJsonNames = await readdirPromise(docCommentsDir);
    let promises: Promise<void>[] = [];
    for (const jsDocJsonName of jsDocJsonNames) {
        if (promises.length > 50) {
            for (const promise of promises) {
                try {
                    await promise;
                } catch (e) {
                    console.log(JSON.stringify(e));
                }
            }
            promises = [];
        }

        const jsDocJsonPath = `${docCommentsDir}\\${jsDocJsonName}`;
        const logPath = `c:\\scrape\\data\\tagStats\\${jsDocJsonName}`;
        const promise = getTagsForPath(jsDocJsonPath, logPath).catch((reason) => {
            console.log(`failed: ${jsDocJsonPath}, ${logPath}, ${JSON.stringify(reason.stack)}`);
        })
        promises.push(promise);
    }

    for (const promise of promises) {
        await promise;
    }
}

const docCommentsDir = `c:\\scrape\\data\\docComments`;

getTags(docCommentsDir).then(() => {
    console.log("success: done");
}).catch((reason) => {
    console.log(`failed: ${JSON.stringify(reason)}`);
});

async function getTagsForPath(filePath: string, logPath: string) {
    const writer = new TagStatsWriter(logPath);

    const fileContentsPromise = util.promisify(fs.readFile);
    const fileContents = await fileContentsPromise(filePath, "utf-8");
    const ownerJson = parseJson(fileContents).data;
    for (const row of ownerJson) {
        const comment = row.comment;
        writer.write(comment);
    }
    writer.finish();
}
