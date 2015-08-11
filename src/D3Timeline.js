/* global cancelAnimationFrame, requestAnimationFrame */

"use strict";

import extend from 'extend';
import inherits from 'inherits';
import D3BlockTable from './D3BlockTable';
import d3 from 'd3';

/**
 *
 * @param {Object} options
 * @constructor
 */
function D3Timeline(options) {

    D3BlockTable.call(this, options);

    this._currentScaleConfig = null;

    this.currentTimeInterval = this.options.minimumTimeInterval;
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

D3Timeline.prototype.xScaleFactory = function() {
    return d3.time.scale();
};

D3Timeline.prototype.yScaleFactory = function() {
    return d3.scale.linear();
};

D3Timeline.prototype.getDataStart = function(d) {
    return d.start;
};

D3Timeline.prototype.getDataEnd = function(d) {
    return d.end;
};

D3Timeline.prototype._computeColumnWidthFromTimeInterval = function(timeInterval) {
    return this.scales.x(new Date(timeInterval)) - this.scales.x(new Date(0));
};

D3Timeline.prototype.updateXAxisInterval = function() {

    var self = this;

    var minimumTimeInterval = this.options.minimumTimeInterval;
    var minimumColumnWidth = this.options.minimumColumnWidth;
    var currentTimeInterval = this.currentTimeInterval;
    var availableTimeIntervals = this.options.availableTimeIntervals;
    var currentTimeIntervalIndex = availableTimeIntervals.indexOf(currentTimeInterval);
    var currentColumnWidth = this._computeColumnWidthFromTimeInterval(currentTimeInterval);

    function translateTimeInterval(delta) {
        currentTimeIntervalIndex += delta;
        currentTimeInterval = availableTimeIntervals[currentTimeIntervalIndex];
        currentColumnWidth = self._computeColumnWidthFromTimeInterval(currentTimeInterval);
    }

    if (availableTimeIntervals.length > 0) {
        if (currentColumnWidth < minimumColumnWidth) {
            while(currentColumnWidth < minimumColumnWidth && currentTimeIntervalIndex < availableTimeIntervals.length - 1) {
                translateTimeInterval(1);
            }
        } else if (currentColumnWidth > minimumColumnWidth) {
            while(currentColumnWidth > minimumColumnWidth && currentTimeIntervalIndex > 0) {
                translateTimeInterval(-1);
            }
            translateTimeInterval(1);
        }
    }

    if (currentTimeInterval < minimumTimeInterval) {
        currentTimeInterval = minimumTimeInterval;
        currentColumnWidth = self._computeColumnWidthFromTimeInterval(currentTimeInterval)
    }

    this.currentTimeInterval = Math.floor(currentTimeInterval);
    this.columnWidth = Math.floor(currentColumnWidth);

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

D3Timeline.prototype.setTimeRange = function(minDate, maxDate) {
    return this.setXRange(minDate, maxDate);
};

export default D3Timeline;
