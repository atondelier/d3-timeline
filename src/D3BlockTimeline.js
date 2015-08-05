"use strict";

import D3Timeline from './D3Timeline';
import inherits from 'inherits';
import extend from 'extend';

/**
 *
 * @extends {D3Timeline}
 * @constructor
 */
function D3BlockTimeline(options) {
    D3Timeline.call(this, options);
}

inherits(D3BlockTimeline, D3Timeline);

D3BlockTimeline.prototype.defaults = extend(true, {}, D3Timeline.prototype.defaults, {
    clipElement: true,
    clipElementFilter: null
});

D3BlockTimeline.prototype.generateClipPathId = function(d) {
    return  'timeline-elementClipPath_' + this.instanceNumber + '_' + d.id;
};

D3BlockTimeline.prototype.generateClipRectLink = function(d) {
    return  '#' + this.generateClipRectId(d);
};

D3BlockTimeline.prototype.generateClipPathLink = function(d) {
    return  'url(#' + this.generateClipPathId(d) + ')';
};

D3BlockTimeline.prototype.generateClipRectId = function(d) {
    return  'timeline-elementClipRect_' + this.instanceNumber + '_' + d.id;
};

D3BlockTimeline.prototype.elementEnter = function(selection) {

    var self = this;

    var elementHeight = this.options.rowHeight - this.options.rowPadding * 2;

    var rect = selection
        .append('rect')
        .attr('class', 'timeline-elementBackground')
        .attr('height', elementHeight);

    var g = selection
        .append('g')
        .attr('class', 'timeline-elementContent');


    var clipElement = false;

    if (this.options.clipElement) {
        if (typeof this.options.clipElementFilter === 'function') {
            clipElement = !!this.options.clipElementFilter.call(this, selection);
        } else {
            clipElement = true;
        }
    }

    if (clipElement) {

        g
            .attr('clip-path', this.generateClipPathLink.bind(this));

        rect
            .property('id', this.generateClipRectId.bind(this));

        selection.append('clipPath')
            .property('id', this.generateClipPathId.bind(this))
            .append('use')
            .attr('xlink:href', this.generateClipRectLink.bind(this));
    }

    selection.on('click', function(d) {
        if (!d3.event.defaultPrevented) {
            self.emit('elementClick', d, selection, d3.event);
        }
    });

};

D3BlockTimeline.prototype.elementUpdate = function(selection) {

    var self = this;

    selection
        .select('rect.timeline-elementBackground')
        .attr({
            y: this.options.rowPadding,
            width: function(d) {
                return self.scales.x(d.end) - self.scales.x(d.start)
            }
        });

};

D3BlockTimeline.prototype.elementExit = function(selection) {

    selection.on('click', null);

};

export default D3BlockTimeline;
