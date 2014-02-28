var markdown = require('marked'),
    YAML = require('libyaml'),
    fs = require('fs'),
    _ = require('lodash');


module.exports.parseFile = function(path){
    var md = fs.readFileSync(path,{encoding: 'utf8'}),
        pageData = {
            path: path,
            content: '',
            template: 'default'
            // ...
        };

    if(md.substr(0,3)==='---'){
        var bits = md.split("---",3);
        pageData.content = markdown(bits[2]);

        var yml = YAML.parse(bits[1]).shift();
        pageData = _.merge(pageData,yml);
    } else {
        pageData.content = markdown(md);
    }

    return pageData;
}