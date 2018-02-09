
declare var require: any;

var fs = require('fs');
var cp = require('child_process');

var repos: any[] = JSON.parse(fs.readFileSync('repoList.json', 'utf-8'));

function next() {
    if (repos.length === 0) return;

    var entry = repos.pop();

    if (entry.fullName.toLowerCase().indexOf('coin') >= 0) {
        // Skip ridiculous cryptocurrencies
        next();
    } else {
        console.log('Download ' + entry.fullName);
        var target = 'repos/' + entry.fullName;
        if (fs.existsSync(target)) {
            console.log('Already have it');
            setTimeout(next, 1);
        } else {
            var proc = cp.spawn('git', ['clone', entry.cloneUrl, target, '--depth', '1']);
            proc.on('exit', () => {
                setTimeout(next, 100);
            });
        }
    }
}

next();