
declare var require: any;

var fs = require('fs');
var https = require('https');

var queries = [
    'sort=forks&order=asc',
    'sort=forks&order=desc',
    'sort=stars&order=asc',
    'sort=stars&order=desc',
    'sort=updated&order=asc',
    'sort=updated&order=desc',
    'order=asc',
    'order=desc'
];

var queryNames = ['mostForks', 'fewestForks', 'mostStars', 'fewestStars', 'newUpdated', 'oldUpdated', 'mostRel', 'leastRel'];

var repoIds: number[] = [];
var entries = [];
for (var i = 0; i < queries.length; i++) {
    for (var j = 0; j < 10; j++) {
        var data = JSON.parse(fs.readFileSync('repoData/data_' + i + '_' + (j + 1) + '.json', 'utf-8'));
        for (var k = 0; k < data.items.length; k++) {
            var repo = data.items[k];
            if (repoIds.indexOf(repo.id) >= 0) continue;
            var entry = {
                source: queryNames[i],
                ranking: j * 100 + k,
                name: repo.name,
                fullName: repo.full_name,
                url: repo.html_url,
                stars: repo.stargazers_count,
                watchers: repo.watchers_count,
                forks: repo.forks_count,
                issues: repo.open_issues_count,
                size: repo.size,
                cloneUrl: repo.clone_url
            };
            repoIds.push(repo.id);
            entries.push(entry);
        }
    }
}

var keys = Object.keys(entries[0]);
var csv = keys.join(',') + '\r\n';
function rowToCsv(x: any) {
    return keys.map(k => x[k]).join(',');
}
csv = csv + entries.map(rowToCsv).join('\r\n');
fs.writeFile('repos.csv', csv);

fs.writeFile('repoList.json', JSON.stringify(entries));
