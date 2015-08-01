"use strict";

import D3Timeline from './D3Timeline';
import inherits from 'inherits';
import $ from 'jquery';

/**
 *
 * @extends {D3Timeline}
 * @constructor
 */
function GDSD3Timeline(options) {
    D3Timeline.call(this, options);
}

inherits(GDSD3Timeline, D3Timeline);

GDSD3Timeline.prototype.defaults = $.extend(true, {}, D3Timeline.prototype.defaults, {
    clipElement: true
});

GDSD3Timeline.prototype.generateClipPathId = function(d) {
    return  'timelineElementClipPath_' + d.id;
};

GDSD3Timeline.prototype.generateClipRectLink = function(d) {
    return  '#' + this.generateClipPathId(d);
};

GDSD3Timeline.prototype.generateClipPathLink = function(d) {
    return  'url(#' + this.generateClipPathId(d) + ')';
};

GDSD3Timeline.prototype.generateClipRectId = function(d) {
    return  'timelineElementClipPath_' + d.id;
};

GDSD3Timeline.prototype.elementEnter = function(selection) {

    var self = this;

    var elementHeight = this.options.rowHeight - this.options.rowPadding * 2;

    var rect = selection
        .append('rect')
        .attr('height', elementHeight);

    if (this.options.clipElement) {

        selection
            .attr('clip-path', this.generateClipPathLink.bind(this));

        rect
            .property('id', this.generateClipRectId.bind(this));

        selection.append('clipPath')
            .property('id', this.generateClipPathId.bind(this))
            .append('use')
            .attr('xlink:href', this.generateClipRectLink.bind(this));
    }

    selection
        .append('text')
        .classed('bookingLabel', true)
        .text('test')
        .attr({
            dx: 2,
            dy: this.options.rowHeight/2 + 4
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
        .text(d => d.card.name);

};

export default GDSD3Timeline;
