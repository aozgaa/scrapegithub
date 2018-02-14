// From each repo, generate a .csv with the following format
// path, doc comment

import fs = require('graceful-fs');
import util = require('util');
import process = require('process');

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
    }
}

const jsonName = process.argv[2];
const docCommentsJsonPath = `c:\\scrape\\docComments\\${jsonName}`;
const logPath = `c:\\scrape\\tagStats\\${jsonName}`;

const writer = new TagStatsWriter(logPath);

getTags(docCommentsJsonPath, writer).then(() => {
    console.log(`success: ${logPath}`);
}).catch((reason) => {
    console.log(`failed: ${logPath} - ${JSON.stringify(reason)}`);
});

async function getTags(filePath: string, writer: TagStatsWriter) {
    const fileContentsPromise = util.promisify(fs.readFile);
    const fileContents = await fileContentsPromise(filePath, "utf-8");
    const ownerJson = JSON.parse(fileContents).data;
    for (const row of ownerJson) {
        const comment = row.comment;
        writer.write(comment);
    }
    writer.finish();
}
