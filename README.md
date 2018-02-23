**Note** Running these scripts used up ~90gb disk space for me.

# Directory structure
- src/: Typescript source for scripts
- bin/: location of scripts
- scripts/: (powershell) helpers for parallelizing work
- data/: outputs of scripts

# TODO: remove hardcoded paths
# TODO: remove duplicated type definitions
# TODO: factor out iteration methods vs writers
# TODO: make paths of repos owner_repo instead of owner/repo to ease iteration

# To Use
0) npm install && npm run build
1) node bin/crawler.js -- ask github for the most popular repos
2) node bin/merger.js -- merge the lists of repos collected in the previous step into a single list
3) node bin/fetcher.js -- clone the repos from the previous step locally
4) ./scripts/getDocComments.ps1 -- scan through the repo owners from the previous step and extract doc comments for each one into a json file
5) ./scripts/getTagStats.ps1 -- read each json from the previous step and extract jsdoc tags and their usage-count from each one
6) node bin/mergeTagStats.js -- read each json from the previous step and combine tag stats across all repos.
7) node bin/proportionWithJsDoc.js -- read each json from (4) and determine proportion of owners using jsdoc.
8) node bin/proportionWithTaggedJsDoc.js -- read each json from (5) and determine proportion of owners using jsdoc tags.