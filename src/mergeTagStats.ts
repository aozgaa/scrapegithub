// From each repo, generate a .csv with the following format
// path, doc comment

import fs = require('graceful-fs');
import util = require('util');

type TagMap = { [_: string]: number };

class TagStatsWriter {
    private tagDictionary: TagMap;

    constructor(private logPath: string) {
        this.tagDictionary = {};
    }

    write(tagMap: TagMap) {
        for(const key in tagMap) {
            if (!this.tagDictionary.hasOwnProperty(key)) {
                this.tagDictionary[key] = tagMap[key];
            } else {
                this.tagDictionary[key] += tagMap[key];
            }
        }

        return;
    }

    finish() {
        fs.writeFileSync(this.logPath, JSON.stringify(this.tagDictionary));
    }
}

const tagStatsDir = `c:\\scrape\\tagStats`;
const logPath = `c:\\scrape\\collectedTagStats.json`;

const writer = new TagStatsWriter(logPath);

getTags(tagStatsDir, writer).then(() => {
    console.log(`success: ${logPath}`);
}).catch((reason) => {
    console.log(`failed: ${logPath} - ${JSON.stringify(reason)}`);
});

const maxPromises = 50;
async function getTags(tagStatsDir: string, writer: TagStatsWriter) {
    const readdirPromise = util.promisify(fs.readdir);
    const dirEntries = await readdirPromise(tagStatsDir);

    let filePromises: Promise<string>[] = [];
    for (let i = 0; i < dirEntries.length; ++i) {  
        if (filePromises.length >= maxPromises) {
            for(const promise of filePromises) {
                const tagsJson = await promise;
                const tagMap = JSON.parse(tagsJson);
                writer.write(tagMap);
            }
            filePromises = [];
        }

        const jsonFile = dirEntries[i];
        const jsonPath = `${tagStatsDir}/${jsonFile}`;
        const fileContentsPromise = util.promisify(fs.readFile)(jsonPath, "utf-8");
        filePromises.push(fileContentsPromise);
    }

    for(const promise of filePromises) {
        const tagsJson = await promise;
        const tagMap = JSON.parse(tagsJson);
        writer.write(tagMap);
    }
    filePromises = [];

    writer.finish();
}