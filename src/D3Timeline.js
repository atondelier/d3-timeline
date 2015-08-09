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

    D3BlockTable.call(this);

    this._currentScaleConfig = null;
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
    }
});

D3BlockTable.prototype.xScaleFactory = function() {
    return d3.time.scale();
};

D3BlockTable.prototype.yScaleFactory = function() {
    return d3.scale.linear();
};

D3BlockTable.prototype.getDataStart = function(d) {
    return d.start;
};

D3BlockTable.prototype.getDataEnd = function(d) {
    return d.end;
};

D3Timeline.prototype.updateXAxisInterval = function() {

    var scale = this.behaviors.zoom.scale();

    var conf = this._currentScaleConfig = this._find(this.options.axisConfigs, function(params) {
        var threshold = params.threshold;
        return scale <= threshold;
    });

    this.axises.x.ticks(d3.time.minutes, conf.minutes);

    this.columnWidth = this.scales.x(new Date(0, 0, 0, 0, Math.max(15, this._currentScaleConfig.minutes, 0))) - this.scales.x(new Date(0, 0, 0, 0, 0, 0));

    return this;
};

D3Timeline.prototype.setTimeRange = function(minDate, maxDate) {
    return this.setXRange(minDate, maxDate);
};

export default D3Timeline;
