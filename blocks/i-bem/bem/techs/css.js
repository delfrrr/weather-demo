var FS = require('fs');
exports.baseTechPath = require.resolve('bem/lib/techs/css');
exports.getBuildResultChunk =  function(relPath, path, suffix) {
    return [
        '/* ' + relPath + ': begin */ /**/',
        FS.readFileSync(path),
        '/* ' + relPath + ': end */ /**/',
        '\n'
    ].join('\n');

}
