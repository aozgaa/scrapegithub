// From each repo, generate a .csv with the following format
// path, doc comment

import fs = require('graceful-fs');
import { readFilesUnder } from "./readFilesUnder";
import { IWriter } from "./IWriter";

class JsDocProportionWriter implements IWriter {
    private ownersChecked = 0;
    private ownersWithDocComments = 0;
    private static emptyDocCommentData =
`{ "data": [

]}`;

    constructor(private logPath: string) {
    }

    write(docCommentsFileContents: string) {
        ++this.ownersChecked;
        if(!docCommentsFileContents.startsWith(JsDocProportionWriter.emptyDocCommentData)) {
            ++this.ownersWithDocComments;
        }

        return;
    }

    finish() {
        const result = {
            ownersChecked: this.ownersChecked,
            ownersWithDocComments: this.ownersWithDocComments
        };

        fs.writeFileSync(this.logPath, JSON.stringify(result));
    }
}

const docCommentsDir = `c:\\scrape\\data\\docComments`;
const logPath = `c:\\scrape\\data\\ownerProportionWithJsDoc.json`;

const writer = new JsDocProportionWriter(logPath);

readFilesUnder(docCommentsDir, writer).then(() => {
    console.log(`success: ${logPath}`);
}).catch((reason) => {
    console.log(`failed: ${logPath} - ${JSON.stringify(reason)}`);
});