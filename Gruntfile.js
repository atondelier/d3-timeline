"use strict";

var path = require('path');

module.exports = function(grunt) {
    grunt.initConfig({

        watchify: {
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
