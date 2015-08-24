/* global cancelAnimationFrame, requestAnimationFrame */

"use strict";

import extend from 'extend';
import inherits from 'inherits';
import D3BlockTable from './D3BlockTable';
import d3 from 'd3';

/**
 * Timeline version of a D3BlockTable with
 *  - time scale as x scale
 *  - and special methods proxying to D3BlockTable methods
 *
 *
 * @param {d3Timeline.D3TimelineOptions} options
 * @name d3Timeline.D3Timeline
 * @constructor
 * @extends {d3Timeline.D3BlockTable}
 */
function D3Timeline(options) {

    D3BlockTable.call(this, options);

    this.currentTimeInterval = this.options.minimumTimeInterval;

    /**
     * @name D3Timeline#options
     * @type {d3Timeline.D3TimelineOptions}
     */
}

inherits(D3Timeline, D3BlockTable);

D3Timeline.prototype.defaults = extend(true, {}, D3BlockTable.prototype.defaults, {
    bemBlockName: 'timeline',
    bemBlockModifier: '',
    xAxisTicksFormatter: function(d) {
        return d.getMinutes() % 15 ? '' : d3.time.format('%H:%M')(d);
    },
    xAxisStrokeWidth: function(d) {
        return d.getMinutes() %30 ? 1 : 2;
    },
    minimumColumnWidth: 30,
    minimumTimeInterval: 3e5,
    availableTimeIntervals: [ 6e4, 3e5, 9e5, 1.8e6, 3.6e6, 7.2e6, 1.44e7, 2.88e7, 4.32e7, 8.64e7 ]
});

/**
 * Time scale as x scale
 * @returns {d3.time.Scale}
 */
D3Timeline.prototype.xScaleFactory = function() {
    return d3.time.scale();
};

/**
 * Use data start property without casting
 *
 * @param {d3Timeline.D3TableElement} data
 * @returns {start|any}
 */
D3Timeline.prototype.getDataStart = function(data) {
    return data.start;
};

/**
 * Use data end property without casting
 *
 * @param {d3Timeline.D3TableElement} data
 * @returns {start|any}
 */
D3Timeline.prototype.getDataEnd = function(data) {
    return data.end;
};

/**
 * Override update x axis interval implement with column width update based on instance options:
 *  - minimumColumnWidth: the column width should never be lower than that
 *  - minimumTimeInterval: the time interval should never be lower than that
 *  - availableTimeIntervals: the list of available time intervals
 *
 * @returns {d3Timeline.D3Timeline}
 */
D3Timeline.prototype.updateXAxisInterval = function() {

    var self = this;

    var minimumTimeInterval = this.options.minimumTimeInterval;
    var minimumColumnWidth = this.options.minimumColumnWidth;
    var currentTimeInterval = this.currentTimeInterval;
    var availableTimeIntervals = this.options.availableTimeIntervals;
    var currentTimeIntervalIndex = availableTimeIntervals.indexOf(currentTimeInterval);
    var currentColumnWidth = this._computeColumnWidthFromTimeInterval(currentTimeInterval);

    // private function to increase/decrease time interval by index delta in the available time intervals and update time interval and column width
    function translateTimeInterval(delta) {
        currentTimeIntervalIndex += delta;
        currentTimeInterval = availableTimeIntervals[currentTimeIntervalIndex];
        currentColumnWidth = self._computeColumnWidthFromTimeInterval(currentTimeInterval);
    }

    if (availableTimeIntervals.length > 0) {
        // if lower, increase
        if (currentColumnWidth < minimumColumnWidth) {
            // stop when it's higher
            while(currentColumnWidth < minimumColumnWidth && currentTimeIntervalIndex < availableTimeIntervals.length - 1) {
                translateTimeInterval(1);
            }
        }
        // if greater decrease
        else if (currentColumnWidth > minimumColumnWidth) {
            // stop when it's lower
            while(currentColumnWidth > minimumColumnWidth && currentTimeIntervalIndex > 0) {
                translateTimeInterval(-1);
            }
            // then increase once
            translateTimeInterval(1);
        }
    }

    // if time interval is lower than the minimum, set it to the minimum and compute column width
    if (currentTimeInterval < minimumTimeInterval) {
        currentTimeInterval = minimumTimeInterval;
        currentColumnWidth = self._computeColumnWidthFromTimeInterval(currentTimeInterval)
    }

    // keep floor values
    this.currentTimeInterval = Math.floor(currentTimeInterval);
    this.columnWidth = Math.floor(currentColumnWidth);

    // update axises ticks
    if (this.currentTimeInterval > 3.6e6) {
        this.axises.x.ticks(d3.time.hours, this.currentTimeInterval / 3.6e6 );
        this.axises.x2.ticks(d3.time.hours, this.currentTimeInterval / 3.6e6 );
    }
    else if (this.currentTimeInterval > 6e4) {
        this.axises.x.ticks(d3.time.minutes, this.currentTimeInterval / 6e4 );
        this.axises.x2.ticks(d3.time.minutes, this.currentTimeInterval / 6e4 );
    }
    else if (this.currentTimeInterval > 1e3) {
        this.axises.x.ticks(d3.time.seconds, this.currentTimeInterval / 1e3 );
        this.axises.x2.ticks(d3.time.seconds, this.currentTimeInterval / 1e3 );
    }

    return this;
};

/**
 * Proxy to {@link d3Timeline.D3Table#setXRange}
 *
 * @param {Date} minDate
 * @param {Date} maxDate
 * @returns {d3Timeline.D3Timeline}
 */
D3Timeline.prototype.setTimeRange = function(minDate, maxDate) {
    return this.setXRange(minDate, maxDate);
};

/**
 * Compute column width from a provided time interval
 *
 * @param {Number} timeInterval
 * @returns {Number}
 * @private
 */
D3Timeline.prototype._computeColumnWidthFromTimeInterval = function(timeInterval) {
    return this.scales.x(new Date(timeInterval)) - this.scales.x(new Date(0));
};

export default D3Timeline;
