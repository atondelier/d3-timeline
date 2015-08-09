/* global cancelAnimationFrame, requestAnimationFrame */

"use strict";

import extend from 'extend';
import inherits from 'inherits';
import D3Table from './D3Table';
import d3 from 'd3';

/**
 * @typedef {{xAxisHeight: number, yAxisWidth: number, rowHeight: number, rowPadding: number, axisConfigs: *[], container: string}} D3TimelineOptions
 */

/**
 *
 * @param {D3TimelineOptions} options
 * @constructor
 */
function D3Timeline(options) {

    D3Table.call(this);

    this._currentScaleConfig = null;
}

inherits(D3Timeline, D3Table);

D3Timeline.prototype.blockName = 'timeline';

D3Timeline.prototype.defaults = extend(true, {}, D3Table.prototype.defaults, {
    xAxisTicksFormatter: function(d) {
        return d.getMinutes() % 15 ? '' : d3.time.format('%H:%M')(d);
    }
});

/*D3Table.prototype.xScaleFactory = function() {
    return d3.time.scale();
};

D3Table.prototype.yScaleFactory = function() {
    return d3.scale.linear();
};

D3Table.prototype.getDataStart = function(d) {
    return d.start;
};

D3Table.prototype.getDataEnd = function(d) {
    return d.end;
};*/

D3Timeline.prototype.setTimeRange = D3Table.prototype.setXRange;

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

export default D3Timeline;
