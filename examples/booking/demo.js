"use strict";

import regeneratorRuntime from 'babel-runtime/regenerator';
import D3EntityTimeline from '../../src/D3EntityTimeline';
import D3TimelineMouseTracker from '../../src/D3TimelineMouseTracker';
import D3TimelineTimeTracker from '../../src/D3TimelineTimeTracker';
import Faker from 'Faker';
import dat from 'dat-gui';

var gdsData = [];

var now = new Date();
var year = now.getFullYear();
var month = now.getMonth();
var date = now.getDate();

function randomizeEntries(rows, elements) {
    gdsData = _(0).range(rows,1).map(function(i) {
        var minutesDeltaByRow = 10 * (Math.random() * 15 >>0);
        return { id: i, name: 'T'+(i+1), elements: _(0).range(elements,1).map(function(j) {
            return {
                id: (i+1)*1e2+j,
                start: new Date(year,month,date,10, minutesDeltaByRow+j*60),
                end: new Date(year,month,date,10, minutesDeltaByRow+j*60+(20 + Math.random()*40 >>0)),
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
 * @type {D3EntityTimeline}
 */
var timeline = new D3EntityTimeline({
    container: '#container',
    renderOnIdle: true,
    flattenRowElements: true,
    hideTicksOnZoom: true,
    hideTicksOnDrag: true,
    clipElementFilter: function(selection) {
        return selection.datum().card.name.length > 10;
    }
});

var mouseTracker = new D3TimelineMouseTracker({});


timeline.elementContentUpdate = function(selection) {

    selection
        .select('.timeline-elementContent > text')
        .text(d => d.card.name);

};

timeline.on('timeline:element:click', function (d, selection, d3Event) {
    console.log('click on element', arguments);
});

timeline.on('timeline:click', function (timeline, selection, d3Event, getTime, getRow){
    console.log('click on timeline', arguments);
});

var debugOptions = {
    outlineGroups: false
};

var gui = new dat.GUI({
    width: 400
});

gui.close();

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
    timeline.container.selectAll('g.timeline-element').remove();
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
cullingGui.add(timeline.options, 'cullingDistance', -10, 10).step(1).name('Y culling distance');

elementGui.add(timeline.options, 'alignLeft').name('Keep text visible');
elementGui.add(timeline.options, 'alignOnTranslate').name('Keep text visible on translate');

behaviorGui.add(timeline.options, 'panYOnWheel').name('Y pan on mouse wheel');
behaviorGui.add(timeline.options, 'wheelMultiplier', 1, 5).step(1).name('Y pan rows per rotation');

timeline
    .toggleDrawing(false)
    .initialize()
    .setAvailableWidth(innerWidth)
    .setAvailableHeight(innerHeight-5)
    .setTimeRange(new Date(year,month,date, 10), new Date(year,month,date,16))
    .toggleDrawing(true)
    .setData(gdsData);

mouseTracker.setTimeline(timeline);

$(window).resize(_.debounce(function() {
    timeline
        .setAvailableWidth(innerWidth)
        .setAvailableHeight(innerHeight-5)
}, 100));

global.timeline = timeline;

var timeTracker = new D3TimelineTimeTracker({});

timeTracker.setTimeline(timeline);

timeTracker.timeComparator = function(timeA, timeB) {
    var oneMinute = 1e3;
    return (+timeA/oneMinute>>0) !== (+timeB/oneMinute>>0);
};

timeTracker.start();

global.tracker = timeTracker;


