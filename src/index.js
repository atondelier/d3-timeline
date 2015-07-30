"use strict";

import regeneratorRuntime from 'babel-runtime/regenerator';
import _ from 'lodash';
import GDSD3Timeline from './GDSD3Timeline';

console.clear();

// external variables


/** @type {Array<{id: Number, name: String, elements: Array<{ id: Number, start: Date, end: Date}>}>} */
var gdsData = [];

function randomizeEntries(rows) {
    gdsData = _(0).range(rows,1).map(function(i) {
        var minutesDeltaByRow = 10 * (Math.random() * 15 >>0);
        return { id: i, name: 'T'+(i+1), elements: _(0).range(3,1).map(function(j) {
            return {
                id: (i+1)*1e2+j,
                start: new Date(2015,7,23,10, minutesDeltaByRow+j*60),
                end: new Date(2015,7,23,10, minutesDeltaByRow+j*60+(20 + Math.random()*40 >>0))
            };
        }).value() };
    }).value()
}

randomizeEntries(1);


var timeline = new GDSD3Timeline({
    container: '#container'
});

timeline.initialize();
timeline.setData(gdsData);
timeline.drawElements();


var si = setInterval(function loop() {
    loop.inc = loop.inc || 0;
    loop.inc ++;
    if (loop.inc > 2) clearInterval(si);
    randomizeEntries(loop.inc*4 + 1);
    timeline.setData(gdsData);
    timeline.drawElements(1000);
}, 2000);

global.timeline = timeline;
