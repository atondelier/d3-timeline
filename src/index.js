"use strict";

import regeneratorRuntime from 'babel-runtime/regenerator';
import _ from 'lodash';
import $ from 'jquery';
import GDSD3Timeline from './GDSD3Timeline';
import Faker from 'Faker';


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

randomizeEntries(30, 3);

/**
 *
 * @type {GDSD3Timeline}
 */
var timeline = new GDSD3Timeline({
    container: '#container'
});

timeline
    .toggleDrawing(false)
    .initialize()
    .setAvailableWidth(innerWidth)
    .setAvailableHeight(innerHeight-5)
    .setTimeRange(new Date(2015,7,23, 10), new Date(2015,7,23, 16))
    .toggleDrawing(true)
    .setData(gdsData);

$(window).resize(_.debounce(function() {
    timeline
        .setAvailableWidth(innerWidth)
        .setAvailableHeight(innerHeight-5)
}, 100));


var si = setInterval(function loop() {
    loop.inc = loop.inc || 0;
    loop.inc ++;
    if (loop.inc > 2) clearInterval(si);
    randomizeEntries(timeline.data.length + 4, 3);
    timeline.setData(gdsData, 500);
}, 2000);


global.timeline = timeline;

var form = document.forms.timelineOptions;
[].slice.call(form.elements, 0).forEach(function(input) {
    if (input.className === 'ignore') {
        return;
    }
    var optionName = input.name;
    var optionValue = timeline.options[optionName];

    switch(input.type) {
        case 'checkbox':
            input.checked = optionValue;
            input.onchange = function() {
                timeline.options[optionName] = input.checked;
            };
            break;
        case 'number':
            input.value = optionValue;
            input.onchange = function() {
                timeline.options[optionName] = +input.value;
            };
            break;
        default:
            input.value = optionValue;
            input.onchange = function() {
                timeline.options[optionName] = input.value;
            };
            break;
    }
});
