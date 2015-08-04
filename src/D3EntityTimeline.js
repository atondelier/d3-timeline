"use strict";

import D3BlockTimeline from './D3BlockTimeline';
import inherits from 'inherits';
import extend from 'extend';

/**
 *
 * @extends {D3BlockTimeline}
 * @constructor
 */
function D3EntityTimeline(options) {
    D3BlockTimeline.call(this, options);
}

inherits(D3EntityTimeline, D3BlockTimeline);

D3BlockTimeline.prototype.defaults = extend(true, {}, D3BlockTimeline.prototype.defaults, {
    alignLeft: true,
    alignOnTranslate: true
});

D3EntityTimeline.prototype.elementEnter = function(selection) {

    this.constructor.super_.prototype.elementEnter.call(this, selection);

    selection
        .select('.timeline-elementContent')
        .append('text')
        .classed('timeline-bookingLabel', true)
        .attr('dy', this.options.rowHeight/2 + 4);

};

D3EntityTimeline.prototype.elementUpdate = function(selection) {

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

D3EntityTimeline.prototype.elementsTranslate = function(selection) {

    if (this.options.alignLeft && this.options.alignOnTranslate) {
        selection
            .select('.timeline-elementContent > text')
            .attr('dx', d => Math.max(-this.scales.x(d.start), 2));
    }

};

export default D3EntityTimeline;
