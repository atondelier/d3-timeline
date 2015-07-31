"use strict";

import D3Timeline from './D3Timeline';
import inherits from 'inherits';

/**
 *
 * @extends {D3Timeline}
 * @constructor
 */
function GDSD3Timeline(options) {
    D3Timeline.call(this, options);
}

inherits(GDSD3Timeline, D3Timeline);

GDSD3Timeline.prototype.elementEnter = function(selection) {

    selection
        .append('rect')
        .attr({
            height: this.options.rowHeight - this.options.rowPadding * 2
        });

    selection
        .append('text')
        .classed('bookingLabel', true)
        .attr({
            dx: 2,
            dy: 20
        });

};

GDSD3Timeline.prototype.elementUpdate = function(selection) {

    var self = this;

    selection
        .select('rect')
        .attr({
            y: this.options.rowPadding,
            width: function(d) {
                return self.scales.x(d.end) - self.scales.x(d.start)
            }
        });

    selection
        .select('text')
        .text(d => d.id);

};

export default GDSD3Timeline;
