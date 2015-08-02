"use strict";

import regeneratorRuntime from 'babel-runtime/regenerator';
import _ from 'lodash';
import $ from 'jquery';
import D3BookingTimeline from './D3BookingTimeline';
import Faker from 'Faker';
import dat from 'dat-gui';

var gdsData = [];

function randomizeEntries(rows, elements) {
    gdsData = _(0).range(rows,1).map(function(i) {
        var minutesDeltaByRow = 10 * (Math.random() * 15 >>0);
        return { id: i, name: 'T'+(i+1), elements: _(0).range(elements,1).map(function(j) {
            return {
                id: (i+1)*1e2+j,
                start: new Date(2015,7,23,10, minutesDeltaByRow+j*60),
                end: new Date(2015,7,23,10, minutesDeltaByRow+j*60+(20 + Math.random()*40 >>0)),
                card: Faker.Helpers.createCard()
            };
        }).value() };
    }).value();
}

var randomDataRows = 50;
var randomDataElementsPerRow = 3;

randomizeEntries(randomDataRows, randomDataElementsPerRow);

/**
 *
 * @type {D3BookingTimeline}
 */
var timeline = new D3BookingTimeline({
    container: '#container',
    renderOnIdle: true,
    flattenRowElements: true,
    hideTicksOnZoom: true,
    hideTicksOnDrag: true
});


var debugOptions = {
    outlineGroups: false
};

var gui = new dat.GUI({
    width: 400
});

var debugGui = gui.addFolder('Debug');

debugGui.add(debugOptions, 'outlineGroups').name('Outline groups').onChange(function() {
    $(document.body).toggleClass('debug-outlineGroups', debugOptions.outlineGroups);
});

var timelineGui = gui.addFolder('Rendering');
var dimensionsGui = gui.addFolder('Dimensions');
var cullingGui = gui.addFolder('Culling');
var elementGui = gui.addFolder('Text alignment');
var behaviorGui = gui.addFolder('Behaviors');

function forceFullRedraw() {
    timeline.container.selectAll('g.timelineElement').remove();
    timeline.updateMargins();
    timeline.setData([]);
    timeline.requestAnimationFrame(timeline.setData.bind(timeline, gdsData));
}

timelineGui.add(timeline.options, 'renderOnIdle').name('Render on idle');
timelineGui.add(timeline.options, 'hideTicksOnDrag').name('Hide ticks on drag');
timelineGui.add(timeline.options, 'hideTicksOnZoom').name('Hide ticks on zoom');
timelineGui.add(timeline.options, 'flattenRowElements').name('Flat data tree').onChange(forceFullRedraw);
timelineGui.add(timeline.options, 'clipElement').name('Clip blocks').onChange(forceFullRedraw);

dimensionsGui.add(timeline.options, 'rowHeight', 10, 50).step(1).name('Row height').onChange(forceFullRedraw);
dimensionsGui.add(timeline.options, 'rowPadding', 0, 10).step(1).name('Row padding').onChange(forceFullRedraw);
dimensionsGui.add(timeline.options, 'xAxisHeight', 30, 100).step(1).name('X axis height').onFinishChange(forceFullRedraw);
dimensionsGui.add(timeline.options, 'yAxisWidth', 30, 100).step(1).name('Y axis width').onFinishChange(forceFullRedraw);

cullingGui.add(timeline.options, 'cullingX').name('X culling');
cullingGui.add(timeline.options, 'cullingY').name('Y culling');
cullingGui.add(timeline.options, 'cullingTolerance', -10, 10).step(1).name('Y culling distance');

elementGui.add(timeline.options, 'alignLeft').name('Keep text visible');
elementGui.add(timeline.options, 'alignOnTranslate').name('Keep text visible on translate');

behaviorGui.add(timeline.options, 'panYOnWheel').name('Y pan on mouse wheel');
behaviorGui.add(timeline.options, 'wheelMultiplier', 1, 5).step(1).name('Y pan rows per rotation');

timeline
    .toggleDrawing(false)
    .initialize()
    .setAvailableWidth(innerWidth)
    .setAvailableHeight(innerHeight-5)
    .setTimeRange(new Date(2015,7,23, 10), new Date(2015,7,23,16))
    .toggleDrawing(true)
    .setData(gdsData);

$(window).resize(_.debounce(function() {
    timeline
        .setAvailableWidth(innerWidth)
        .setAvailableHeight(innerHeight-5)
}, 100));


/*
var si = setInterval(function loop() {
    loop.inc = loop.inc || 0;
    loop.inc ++;
    if (loop.inc > 2) clearInterval(si);
    randomizeEntries(randomDataRows, randomDataElementsPerRow);
    timeline.setData(gdsData, 500);
}, 2000);
*/


global.timeline = timeline;
