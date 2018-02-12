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

var pageNumber = 1;
var activeQuery = queries.pop();

function fetchNext() {
    console.log('Fetch page ' + pageNumber);

    var options = {
        host: 'api.github.com',
        path: '/search/repositories?q=language:javascript&per_page=100&' +activeQuery + '&page=' + pageNumber,
        headers: { 'user-agent': 'Mozilla/5.0' }
    };
    https.get(options, (res: any) => {
        var body = '';
        res.on('data', (d: any) => body = body + d);

        res.on('end', () => {
            fs.writeFileSync(`repoData/data_${queries.length}_${pageNumber}.json`, body);

            if (pageNumber === 10) {
                if (activeQuery === undefined || activeQuery.length === 0) {
                    console.log('Done.');
                } else {
                    console.log('Next query.');
                    activeQuery = queries.pop();
                    pageNumber = 1;
                    setTimeout(fetchNext, 15000);
                }
            } else {
                console.log('Wait.');
                pageNumber++;
                setTimeout(fetchNext, 15000);
            }
        });
    });
}

fetchNext();
