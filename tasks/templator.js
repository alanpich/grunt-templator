/*
 * grunt-templator
 * https://github.com/alan/templator
 *
 * Copyright (c) 2014 Alan Pich
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {


    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('templator', 'Static site generator', function () {
        var Templator = require('./lib/templator');
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            punctuation: '.',
            separator: ', '
        }, this.data);

        // Write the destination file.
//      grunt.file.write(f.dest, src);

        new Templator({
            path: options.dir,
            templatePath: options.templates,
            contentPath: options.content
        })

    });
};
