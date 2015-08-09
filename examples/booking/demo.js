"use strict";

import regeneratorRuntime from 'babel-runtime/regenerator';
import D3EntityTimeline from '../../src/D3EntityTimeline';
import D3TimelineMouseTracker from '../../src/D3TimelineMouseTracker';
import D3TimelineTimeTracker from '../../src/D3TimelineTimeTracker';
import Faker from 'Faker';
import dat from 'dat-gui';
import _ from 'lodash';

/*
Data random generation
 */

var gdsData = [];
var bookings = [];
var now = new Date();
var year = now.getFullYear();
var month = now.getMonth();
var date = now.getDate();
var hours = now.getHours();
var minDate = new Date(year,month,date,hours-2);
var maxDate = new Date(year,month,date,hours+4);

var randomizeMethodByMode = {
    'tables': randomizeEntries,
    'bookings': randomizeEntries2
};

function randomizeBookings(rows, elements) {
    bookings = _(0).range(elements,1).map(function(i) {
        var start = new Date(year,month,date,hours-2, Math.random()*60*4);
        var end = new Date(+start + (20 + Math.random()*10 >>0) * 6e4);
        var tables = _(1).range(rows, 1).shuffle().slice(rows/2>>0,(rows/2>>0)+2+Math.random()*3>>0).value();
        return {
            id: i,
            uid: i,
            start: start,
            end: end,
            card: Faker.Helpers.createCard(),
            parentId: tables[0],
            tables: tables
        };
    }).value();
}

function makeBookingsInRows(bookings, rows) {
    return _(0).range(rows,1).map(function(i) {
        return {
            uid: i,
            name: 'T'+(i+1),
            elements: _.cloneDeep(_(bookings).filter(function(b) {
                var hasTable = b.tables.indexOf(i) !== -1;
                if (hasTable) {
                    b.parentId = i;
                    b.uid = i + '_' + b.id;
                }
                return hasTable;
            }).value())
        };
    }).value();
}

function makeSortedBookings(bookings) {
    return _(bookings).sortBy(function(b) {
        return b.start;
    }).map(function(b) {
        return {
            uid: b.parentId + '_' + b.id,
            name: b.uid,
            elements: [_.cloneDeep(b)]
        };
    }).value();
}

function randomizeEntries(rows, elements, keepExisting) {
    if (!keepExisting) {
        randomizeBookings(rows, elements);
    }
    gdsData = makeBookingsInRows(bookings, rows);
}

function randomizeEntries2(rows, elements, keepExisting) {
    if (!keepExisting) {
        randomizeBookings(rows, elements);
    }
    gdsData = makeSortedBookings(bookings);
}

var randomDataRows = 40;
var randomDataElements = 40;

function handleDistributionMode(mode, keepExisting, animate) {
    randomizeMethodByMode[mode](randomDataRows, randomDataElements, keepExisting);

    timeline.setData(gdsData, animate ? 400 : 0);

    timeline
        .updateY()
        .updateX()
        .updateXAxisInterval()
        .drawXAxis()
        .drawYAxis();
}


/*
Timeline instantiation and listeners
 */

/**
 * @type {D3EntityTimeline}
 */
var timeline = new D3EntityTimeline({
    container: '#container',
    renderOnIdle: true,
    hideTicksOnZoom: true,
    hideTicksOnDrag: true,
    clipElementFilter: function(selection) {
        return selection.datum().card.name.length > 10;
    },
    enableYTransition: true,
    cullingX: true,
    cullingY: true
});


timeline.elementContentUpdate = function(selection) {
    selection
        .select('.timeline-elementContent > text')
        .text(d => d.card.name);
};

timeline.on('timeline:element:click', function (d, timeline, selection, d3Event, getTime, getRow) {
    console.log('click on element', arguments);
    console.log('time:', getTime());
    console.log('row:', getRow());
});

timeline.on('timeline:click', function (timeline, selection, d3Event, getTime, getRow){
    console.log('click on timeline', arguments);
    console.log('time:', getTime());
    console.log('row:', getRow());
});

timeline.on('timeline:element:dragend', function(d, timeline, selection, d3Event, getTime, getRow) {
    console.log('draggend on timeline', arguments);
    console.log('time:', getTime());
    console.log('row:', getRow());
});

timeline.on('timeline:element:dragend', function(d, timeline, selection, d3Event, getTime, getRow) {
    var d = selection.datum();
    var original = _.findWhere(bookings, { uid: d.uid }) || _.findWhere(bookings, { id: d.id });

    var previousDuration = +d.end - +d.start;

    d.start = original.start = getTime();
    d.end = original.end = new Date(+(getTime()) + previousDuration);
    var currentRow = timeline.data[d.rowIndex];
    var row = getRow();

    currentRow.elements.splice(currentRow.elements.indexOf(d), 1);

    row.elements.push(d);

    if (demoOptions.distributionMode === 'bookings') {
        gdsData = makeSortedBookings(bookings);
        timeline.setData(gdsData, 500);
    } else if (demoOptions.distributionMode === 'tables') {
        timeline.generateFlattenedData();
        timeline.drawElements();
    }
});

timeline.options.yAxisFormatter = function(d) {
    return !d ? '' : demoOptions.distributionMode === 'bookings' ? d.elements[0].card.name : d.name;
};


/*
GUI
 */

var demoOptions = {
    outlineGroups: false,
    distributionMode: 'tables'
};

var gui = new dat.GUI({
    width: 400
});

gui.close();

var debugGui = gui.addFolder('External options');

debugGui.add(demoOptions, 'outlineGroups').name('Outline groups').onChange(function() {
    $(document.body).toggleClass('debug-outlineGroups', demoOptions.outlineGroups);
});
debugGui.add(demoOptions, 'distributionMode', ['tables', 'bookings']).name('Distribution').onChange(function() {
    handleDistributionMode(demoOptions.distributionMode, true, true);
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
timelineGui.add(timeline.options, 'renderOnAutomaticScrollIdle').name('Render on automatic scroll');
timelineGui.add(timeline.options, 'hideTicksOnDrag').name('Hide ticks on drag');
timelineGui.add(timeline.options, 'hideTicksOnZoom').name('Hide ticks on zoom');
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


/*
 Timeline initialization
 */

timeline
    .toggleDrawing(false)
    .initialize()
    .setAvailableWidth(innerWidth)
    .setAvailableHeight(innerHeight-5)
    .setTimeRange(minDate, maxDate)
    .toggleDrawing(true);

handleDistributionMode(demoOptions.distributionMode, false, false);


/*
 Markers
 */

var mouseTracker = new D3TimelineMouseTracker({});

mouseTracker.setTimeline(timeline);

$(window).resize(_.debounce(function() {
    console.log('window size', innerWidth, innerHeight);
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
