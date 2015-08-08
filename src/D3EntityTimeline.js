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

D3EntityTimeline.prototype.defaults = extend(true, {}, D3BlockTimeline.prototype.defaults, {
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

    selection.call(this.elementContentEnter.bind(this));

};

D3EntityTimeline.prototype.elementUpdate = function(selection, d, transitionDuration) {

    this.constructor.super_.prototype.elementUpdate.call(this, selection, d, transitionDuration);

    if (this.options.alignLeft && !d._defaultPrevented) {

        selection
            .select('.timeline-elementContent > text')
            .attr('dx', d => Math.max(-this.scales.x(d.start), 2))
    }

    selection.call(this.elementContentUpdate.bind(this));

};

D3EntityTimeline.prototype.elementsTranslate = function(selection) {

    if (this.options.alignLeft && this.options.alignOnTranslate) {
        selection
            .select('.timeline-elementContent > text')
            .attr('dx', d => Math.max(-this.scales.x(d.start), 2));
    }

};

D3EntityTimeline.prototype.elementContentEnter = function() {};

D3EntityTimeline.prototype.elementContentUpdate = function() {};

export default D3EntityTimeline;
