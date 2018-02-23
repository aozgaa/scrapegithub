// From each repo, generate a .csv with the following format
// path, doc comment

import fs = require('graceful-fs');
import { IWriter } from "./IWriter";
import { readFilesUnder } from './readFilesUnder';

type TagMap = { [_: string]: number };

class TagStatsWriter implements IWriter {
    private tagDictionary: TagMap;

    constructor(private logPath: string) {
        this.tagDictionary = {};
    }

    write(fileContents: string) {
        const tagMap: TagMap = JSON.parse(fileContents); 
        for (const key in tagMap) {
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

const tagStatsDir = `c:\\scrape\\data\\tagStats`;
const logPath = `c:\\scrape\\data\\collectedTagStats.json`;

const writer = new TagStatsWriter(logPath);

readFilesUnder(tagStatsDir, writer).then(() => {
    console.log(`success: ${logPath}`);
}).catch((reason) => {
    console.log(`failed: ${logPath} - ${JSON.stringify(reason)}`);
});
