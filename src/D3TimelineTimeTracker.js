"use strict";

import D3TableValueTracker from './D3TableValueTracker';
import inherits from 'inherits';
import extend from 'extend';

var d3Timeline = {};

/**
 * Timeline time tracker which can be started and stopped as it is a {@link d3Timeline.D3TableValueTracker}
 *
 * @extends {d3Timeline.D3TableValueTracker}
 * @constructor
 */
d3Timeline.D3TimelineTimeTracker = function D3TimelineTimeTracker(options) {
    D3TableValueTracker.call(this, options);

    /**
     * @name d3Timeline.D3TimelineTimeTracker#value
     * @type {Date}
     */
};

var D3TimelineTimeTracker = d3Timeline.D3TimelineTimeTracker;

inherits(D3TimelineTimeTracker, D3TableValueTracker);

/**
 * @type {d3Timeline.D3TableMarkerOptions}
 */
D3TimelineTimeTracker.prototype.defaults = extend(true, {}, D3TableValueTracker.prototype.defaults, {
    bemBlockName: 'timelineMarker',
    bemModifiers: ['timeTracker'],
    layout: 'vertical'
});

/**
 * Get the current time
 * To be overridden if you wish to represent a biased time for example
 *
 * @returns {Date}
 */
D3TimelineTimeTracker.prototype.timeGetter = function() {
    return new Date();
};

/**
 * Proxy to {@link d3Timeline.D3TableValueTracker#timeGetter}
 *
 * @returns {Date}
 */
D3TimelineTimeTracker.prototype.valueGetter = function() {
    return this.timeGetter();
};

/**
 * Compare times, defaults to {@link d3Timeline.D3TableValueTracker#valueComparator}
 *
 * @type {Function|*}
 */
D3TimelineTimeTracker.prototype.timeComparator = D3TableValueTracker.prototype.valueComparator;

/**
 * Proxy to {@link d3Timeline.D3TimelineTimeTracker.timeComparator}
 *
 * @param {Date} a
 * @param {Date} b
 */
D3TimelineTimeTracker.prototype.valueComparator = function(a,b) {
    return this.timeComparator(a,b);
};

/**
 * Proxy to {@link d3Timeline.D3TableValueTracker#setValue}
 * To be overridden if you which to alter the value set
 *
 * @param {Date} time
 */
D3TimelineTimeTracker.prototype.setTime = function(time) {
    return this.setValue(time);
};

/**
 * Proxy to {@link d3Timeline.D3TableValueTracker#setTable}
 *
 * @param {d3Timeline.D3Timeline} timeline
 */
D3TimelineTimeTracker.prototype.setTimeline = D3TableValueTracker.prototype.setTable;

module.exports = D3TimelineTimeTracker;
