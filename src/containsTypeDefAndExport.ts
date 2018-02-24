// From each repo, generate a .csv with the following format
// path, doc comment

import fs = require('graceful-fs');
import util = require('util');
import parseJson = require('json-parse-better-errors');

class ExportsAndTypeDefTagWriter {
    private static tagRegex: RegExp = /\* @[\w\-]*/g;
    private docCommentsWithBothTags: {path: string, comment: string}[];

    constructor(private logPath: string) {
        this.docCommentsWithBothTags = [];
    }

    write(path: string, comment: string) {
        const tagMatches = comment.match(ExportsAndTypeDefTagWriter.tagRegex);
        if (!tagMatches) {
            return;
        }
        let containsTypeDef = false;
        let containsExport = false;
        for (const match of tagMatches) {
            const atTag = match.slice(2);
            if (atTag.indexOf("@typedef") !== -1) {
                containsTypeDef = true;
            }
            if (atTag.indexOf("@export") !== -1) {
                containsExport = true;
            }
        }
        if (containsExport && containsTypeDef) {
            this.docCommentsWithBothTags.push({ path, comment });
        }

        return;
    }

    finish() {
        fs.writeFileSync(this.logPath, JSON.stringify(this.docCommentsWithBothTags));
        console.log(`success: ${this.logPath}`);
    }
}


const docCommentsDir = `c:\\scrape\\data\\docComments`;
const logPath = `c:\\scrape\\data\\containsTypeDefAndExport.json`;

getTags(docCommentsDir).then(() => {
    console.log("success: done");
}).catch((reason) => {
    console.log(`failed: ${JSON.stringify(reason)}`);
});

async function getTags(docCommentsDir: string) {
    const writer = new ExportsAndTypeDefTagWriter(logPath);
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
        const promise = getTagsForPath(jsDocJsonPath, writer).catch((reason) => {
            console.log(`failed: ${jsDocJsonPath}, ${logPath}, ${JSON.stringify(reason.stack)}`);
        })
        promises.push(promise);
    }

    for (const promise of promises) {
        await promise;
    }
    
    writer.finish();
}

async function getTagsForPath(filePath: string, writer: ExportsAndTypeDefTagWriter) {
    const fileContentsPromise = util.promisify(fs.readFile);
    const fileContents = await fileContentsPromise(filePath, "utf-8");
    const ownerJson = parseJson(fileContents).data;
    for (const row of ownerJson) {
        const path = row.path;
        const comment = row.comment;
        writer.write(path, comment);
    }
    console.log(`success: ${filePath}`);
}
