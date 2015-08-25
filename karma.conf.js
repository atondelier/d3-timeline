/* jshint node:true */

"use strict";

module.exports = function(config) {

    config.set({
        basePath: './',
        browsers: ['PhantomJS'],
        port: 9877,
        frameworks: ['mocha', 'chai', 'sinon-chai', 'chai-jquery', 'chai-as-promised', 'chai-things'],
        plugins: [
            'karma-babel-preprocessor',
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-mocha-reporter',
            'karma-mocha',
            'karma-chai-plugins'
        ],
        reporters: [
            'mocha'
        ],
        colors: true,
        logLevel: config.LOG_INFO,
        files: [
            // styles
            { pattern: 'examples/booking/*.css', included: false },

            // scripts
            'test/lib/inherits.js',
            'node_modules/chai-stats/chai-stats.js',
            'node_modules/karma-babel-preprocessor/node_modules/babel-core/browser-polyfill.js',
            'node_modules/requestanimationframe/app/requestAnimationFrame.js',
            'node_modules/jquery/dist/jquery.js',
            'node_modules/d3/d3.js',
            'dist/built.js',

            // test lib & helpers
            'test/helper/EventSimulator.js',
            'test/helper/DragSimulator.js',
            'test/helper/generateRandomData.js',
            'test/helper/timelineClickSimulator.js',
            'test/helper/timelineDragSimulator.js',

            // specs
            'test/e2e.js'
        ],
        preprocessors: {
            "test/helper/*.js": ["babel"],
            "test/e2e.js": ["babel"]
        },
        babelPreprocessor: {
            stage: function() { return 0; }
        },
        client: {
            mocha: {
                timeout : 20000 // 20 seconds
            }
        }
    });

};
