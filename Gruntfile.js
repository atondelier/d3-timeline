"use strict";

var path = require('path');
var babelify = require('babelify');

module.exports = function(grunt) {
    grunt.initConfig({

        watchify: {
            options: {
                callback: function(b) {
                    b.transform(babelify.configure({stage: 0}));
                    return b;
                }
            },
            example: {
                options: {
                    keepalive: true
                },
                src: './examples/booking/demo.js',
                dest: './dist/built-demo.js'
            },
            dist: {
                options: {
                    standalone: 'd3Timeline'
                },
                src: './index.js',
                dest: './dist/built.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-watchify');

    grunt.registerTask('default', ['watchify:example']);
    grunt.registerTask('build', ['watchify:dist']);
};
