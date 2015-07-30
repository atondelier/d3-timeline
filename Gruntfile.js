/*
 * grunt-watchify
 * http://github.com/amiorin/grunt-watchify
 *
 * Copyright (c) 2013 Alberto Miorin, contributors
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

module.exports = function(grunt) {
    grunt.initConfig({

        watchify: {
            options: {
                keepalive: true
            },
            example: {
                src: './src/index.js',
                dest: 'built.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-watchify');

    grunt.registerTask('default', ['watchify']);
};
