"use strict";

import D3BlockTimeline from './D3BlockTimeline';
import inherits from 'inherits';
import $ from 'jquery';

/**
 *
 * @extends {D3BlockTimeline}
 * @constructor
 */
function D3BookingTimeline(options) {
    D3BlockTimeline.call(this, options);
}

inherits(D3BookingTimeline, D3BlockTimeline);

D3BookingTimeline.prototype.elementEnter = function(selection) {

    this.constructor.super_.prototype.elementEnter.call(this, selection);

    selection
        .append('text')
        .classed('bookingLabel', true)
        .attr({
            dx: 2,
            dy: this.options.rowHeight/2 + 4
        });

};

D3BookingTimeline.prototype.elementUpdate = function(selection) {

    this.constructor.super_.prototype.elementUpdate.call(this, selection);

    selection
        .select('text')
        .text(d => d.card.name);

};

export default D3BookingTimeline;
