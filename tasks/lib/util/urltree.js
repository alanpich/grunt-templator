var util = require('util');



module.exports = function urltree(urls){

    if(!util.isArray(urls)){
        urls = arguments
    };

    var tree = {};


    urls.forEach(function(url){
        // Split url into segments
        var bits = url.split('/'),
            current = tree,
            bit,c=bits.length,i=0;;

        console.log(c);
        while(bit = bits.shift()){
            // Skip 'index' as the last segment of the path
            if(c>0 && (i==0 || bit != 'index')){
                if(current[bit] == undefined){
                    current[bit] = {};
                }
                current = current[bit];
                --c;
                ++i;
            }
        }
    })

    return tree;

}