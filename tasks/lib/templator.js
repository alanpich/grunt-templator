var glob = require('glob'),
    parser = require('./parser/markdown'),
    template = require('./template/swig'),
    createFileTree = require('file-tree'),
    fs = require('fs'),
    PATH = require('path'),
    _ = require('lodash');



function hasChildren(node){

}

function walkTree(tree,fn,scope){
    tree.forEach(function(node){
        // Handle the node (matron)
        fn.call(scope,node);

        // Check for child nodes
        //@TODO this is bullshit, there must be a better way
        var children = [];
        if(node.children){
            children = node.children;
        }
        var REGEX = /\.md/;
        for(key in node){
            if(REGEX.test(key)){
                children.push(node[key]);
            }
        }
        if(children){
            walkTree(children,fn,scope);
        }
    },this);
}



var T = module.exports = function (opts) {

    // Merge user options with defaults
    this.setConfig({

    }, opts);

    var pattern = this.config.contentPath+'/**/*',
        files = glob(pattern,{sync:true});

    var tree = this.config.tree = createFileTree(
            files,
            this.prepareFile.bind(this),
            this.onceFileTreeGenerated.bind(this)
        );

};



T.prototype.prepareFile = function(path,next){
    // Execute on each file, then call next(null,{merge:data})
    var data = {},
        stat = fs.statSync(path);


    data.path = path;

    if(stat.isFile()){
        data = _.merge(data,parser.parseFile(path));
        data.mtime = stat.mtime;
        data.ctime = stat.ctime;
        data.isFile = true;
    }

    if(stat.isDirectory()){
        data = _.merge(data,{
           isDirectory: true
        });
    }

    // Generate a relative path to file without file extensions
    data.relativePath = data.path
        .replace(this.config.contentPath+'/','')
        .replace(this.config.path)
        .replace('.md','');


    // Prepare path to root for url prefixing
    var count = data.relativePath.split('/').length - 1,
        url='';
    for(var k=0; k<count;k++){
        url+='../'
    }
    data.pathToRoot = url;

    next(null,data);
};


/**
 * @private
 * @param err
 * @param tree
 */
T.prototype.onceFileTreeGenerated = function(err,tree){
        if(err){
            console.log('[ERROR] ',err.message)
            throw err;
        }

        this.config.tree = tree;

        walkTree(tree,function(node){
            this.generateOutput(node);
        },this)
};


T.prototype.generateOutput = function(node)
{

    var tplPath = this.config.templatePath+'/'+node.template+'.twig',
        outPath = this.config.path+'/'+node.relativePath,
        pathToRoot = node.pathToRoot,
        data = this.data({
            page: node,
            tree: this.config.tree,
            url: function(path){
                var rg = /^\//;
                    url = pathToRoot+path;
                    if(url.substr(0,1)=='/'){
                        url = url.substr(1);
                    }

                return url;
            }
        });

    if(node.isDirectory){
        // ensure parent directory exists
        if (!fs.existsSync(outPath)) {
            fs.mkdirSync(outPath);
        }
    } else {
        outPath+='.html';
        html = template(tplPath, outPath, data);
        fs.writeFileSync(outPath, html);
    }
};

/**
 * Returns config data, optionally merged with overrides
 *
 * @param overrides
 * @returns {Object}
 */
T.prototype.data = function(overrides){
    return _.merge(this.config,overrides);
};


/**
 * Set config variables
 *
 * @returns void
 */
T.prototype.setConfig = function () {
    if (!this.config) {
        this.config = {}
    }
    var opts;
    for (var k = 0; k < arguments.length; k++) {
        opts = arguments[k];
        for (key in opts) {
            this.config[key] = opts[key];
        }
    }
};

