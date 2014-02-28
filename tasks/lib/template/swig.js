var swig  = require('swig');






var T = module.exports = function(template,outpath,data){
    return swig.renderFile(template,data);
}


