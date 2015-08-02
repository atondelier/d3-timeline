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

D3BlockTimeline.prototype.defaults = $.extend(true, {}, D3BlockTimeline.prototype.defaults, {
    alignLeft: true,
    alignOnTranslate: true
});

D3BookingTimeline.prototype.elementEnter = function(selection) {

    this.constructor.super_.prototype.elementEnter.call(this, selection);

    selection
        .append('text')
        .classed('bookingLabel', true)
        .attr('dy', this.options.rowHeight/2 + 4);

};

D3BookingTimeline.prototype.elementUpdate = function(selection) {

    this.constructor.super_.prototype.elementUpdate.call(this, selection);

    var text = selection
        .select('text');

    if (this.options.alignLeft) {
        text
            .attr('dx', d => Math.max(-this.scales.x(d.start), 2))
    }

    text
        .text(d => d.card.name);

};

D3BookingTimeline.prototype.elementsTranslate = function(selection) {

    if (this.options.alignLeft && this.options.alignOnTranslate) {
        selection
            .select('text')
            .attr('dx', d => Math.max(-this.scales.x(d.start), 2));
    }

};

export default D3BookingTimeline;
