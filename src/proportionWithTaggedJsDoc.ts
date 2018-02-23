// From each repo, generate a .csv with the following format
// path, doc comment

import fs = require('graceful-fs');
import { readFilesUnder } from "./readFilesUnder";
import { IWriter } from "./IWriter";

type TagMap = { [_: string]: number };

class TagProportionWriter implements IWriter {
    private ownersChecked = 0;
    private ownersWithTags = 0;

    constructor(private logPath: string) {
    }

    write(fileContents: string) {
        const tagMap: TagMap = JSON.parse(fileContents);
        ++this.ownersChecked;
        if(Object.keys(tagMap).length > 0) {
            ++this.ownersWithTags;
        }

        return;
    }

    finish() {
        const result = {
            ownersChecked: this.ownersChecked,
            ownersWithTags: this.ownersWithTags
        };

        fs.writeFileSync(this.logPath, JSON.stringify(result));
    }
}

const tagStatsDir = `c:\\scrape\\data\\tagStats`;
const logPath = `c:\\scrape\\data\\ownerProportionWithTaggedJsDoc.json`;

const writer = new TagProportionWriter(logPath);

readFilesUnder(tagStatsDir, writer).then(() => {
    console.log(`success: ${logPath}`);
}).catch((reason) => {
    console.log(`failed: ${logPath} - ${JSON.stringify(reason)}`);
});
