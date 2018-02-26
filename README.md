**Note** Running these scripts used up ~90gb disk space for me.

# TODO
- [ ] remove hardcoded paths
- [ ] remove duplicated type definitions
- [ ] factor out iteration methods vs writers
- [ ] make paths of repos owner_repo instead of owner/repo to ease iteration

# Directory structure
- src/: Typescript source for scripts
- bin/: location of scripts
- scripts/: (powershell) helpers for parallelizing work
- data/: outputs of scripts


# To Use

- setup:
```
git clone https://github.com/aozgaa/scrapegithub.git c:\scrape
cd c:\scrape
npm install && npm run build
```
- get repos
 ```
node bin/crawler.js # ask github for the most popular repos
node bin/merger.js # merge the lists of repos collected in the previous step into a single list
node bin/fetcher.js # clone the repos from the previous step locally (with a fast network, takes an evening)
```
- get statistics
1) `./scripts/getDocComments.ps1` -- scan through the repo owners from the previous step and extract doc comments for each one into a json file
2) `node bin/getTagStats.js` -- read each json from the previous step and extract jsdoc tags and their usage-count from each one
3) `node bin/proportionWithJsDoc.js` -- read each json from (1) and determine proportion of owners using jsdoc.
4) `node bin/proportionWithTaggedJsDoc.js` -- read each json from (2) and determine proportion of owners using jsdoc tags.
5) `node bin/mergeTagStats.js` -- read each json from the (2) and combine tag stats across all repos.
