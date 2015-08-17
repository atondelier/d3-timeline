"use strict";

import extend from 'extend';
import inherits from 'inherits';
import EventEmitter from 'events/events';
import d3 from 'd3';
import D3Timeline from './D3Timeline';

function D3TableMarker(options) {

    EventEmitter.call(this);

    this.options = extend(true, {}, this.defaults, options);

    /**
     * @type {D3Timeline}
     */
    this.timeline = null;

    this.container = null;
    this.elements = {
        line: null,
        label: null
    };

    /**
     * @type {Function}
     * @private
     */
    this._timelineMoveListener = null;

    /**
     * @type {Function}
     * @private
     */
    this._timelineResizeListener = null;

    this._moveAF = null;

    this.value = null;
    this._lastTimeUpdated = null;
}

inherits(D3TableMarker, EventEmitter);

D3TableMarker.prototype.LAYOUT_HORIZONTAL = 'horizontal';
D3TableMarker.prototype.LAYOUT_VERTICAL = 'vertical';

D3TableMarker.prototype.defaults = {
    formatter: function(d) { return d; },
    outerTickSize: 10,
    tickPadding: 10,
    roundPosition: false,
    bemBlockName: 'tableMarker',
    bemModifier: '',
    layout: D3TableMarker.prototype.LAYOUT_VERTICAL
};

/**
 *
 * @param {D3Timeline} timeline
 */
D3TableMarker.prototype.setTable = function(timeline) {

    var previousTimeline = this.timeline;

    this.timeline = timeline && timeline instanceof D3Timeline ? timeline : null;

    if (this.timeline) {
        if (previousTimeline !== this.timeline) {
            if (previousTimeline) {
                this.unbindTimeline(previousTimeline);
            }
            this.bindTimeline();
        }
    } else if (!this.timeline && previousTimeline) {
        this.unbindTimeline(previousTimeline);
    }

};

D3TableMarker.prototype.valueComparator = function(timeA, timeB) {
    return +timeA !== +timeB;
};

D3TableMarker.prototype.setValue = function(value) {

    var previousTimeUpdated = this._lastTimeUpdated;

    this.value = value;

    if (this.valueComparator(previousTimeUpdated, this.value) && this.timeline && this.container) {

        this._lastTimeUpdated = this.value;

        this.container
            .datum({
                value: value
            });

        this.move();
    }

};

D3TableMarker.prototype.bindTimeline = function() {

    var self = this;

    this.container = this.timeline.container
        .append('g')
        .datum({
            value: this.value
        })
        .attr('class', this.options.bemBlockName + (this.options.bemModifier ? ' ' + this.options.bemBlockName + this.options.bemModifier : '') + ' ' + this.options.bemBlockName + '--' + this.options.layout);

    this.elements.line = this.container
        .append('line')
        .attr('class', this.options.bemBlockName + '-line')
        .style('pointer-events', 'none');

    this.elements.label = this.container
        .append('text')
        .attr('class', this.options.bemBlockName + '-label');

    this.sizeLineAndLabel();

    // on timeline move, move the marker
    this._timelineMoveListener = this.move.bind(this);
    this.timeline.on(this.timeline.options.bemBlockName + ':move', this._timelineMoveListener);

    // on timeline resize, resize the marker and move it
    this._timelineResizeListener = function(timeline, selection, transitionDuration) {
        self.resize(transitionDuration);
        self.move(transitionDuration);
    };
    this.timeline.on(this.timeline.options.bemBlockName + ':resize', this._timelineResizeListener);

    this.emit('marker:bound');

    this.move();

};

D3TableMarker.prototype.sizeLineAndLabel = function(transitionDuration) {

    var layout = this.options.layout;

    var line = this.elements.line;
    var label = this.elements.label;

    if (transitionDuration > 0) {
        line = line.transition().duration(transitionDuration);
        label = label.transition().duration(transitionDuration);
    }

    switch(layout) {
        case this.LAYOUT_VERTICAL:
            line
                .attr({
                    y1: -this.options.outerTickSize,
                    y2: this.timeline.dimensions.height
                });
            label
                .attr('dy', -this.options.outerTickSize-this.options.tickPadding);
            break;
        case this.LAYOUT_HORIZONTAL:
            line
                .attr({
                    x1: -this.options.outerTickSize,
                    x2: this.timeline.dimensions.width
                });
            label
                .attr('dx', -this.options.outerTickSize-this.options.tickPadding)
                .attr('dy', 4);
            break;
    }

};

D3TableMarker.prototype.unbindTimeline = function(previousTimeline) {

    previousTimeline.removeListener(this.timeline.options.bemBlockName + ':move', this._timelineMoveListener);
    previousTimeline.removeListener(this.timeline.options.bemBlockName + ':resize', this._timelineResizeListener);

    this.container.remove();

    if (this._moveAF) {
        previousTimeline.cancelAnimationFrame(this._moveAF);
        this._moveAF = null;
    }

    this.container = null;
    this._timelineMoveListener = null;

    this.emit('marker:unbound', previousTimeline);
};

D3TableMarker.prototype.move = function(transitionDuration) {

    var self = this;
    var layout = this.options.layout;

    if (this._moveAF) {
        this.timeline.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = this.timeline.requestAnimationFrame(function() {

        self.container
            .each(function(d) {

                if (d.value === null) {
                    self.hide();
                    return;
                }

                var scale, position = [0, 0], positionIndex;

                switch(layout) {
                    case self.LAYOUT_VERTICAL:
                        scale = self.timeline.scales.x;
                        positionIndex = 0;
                        break;
                    case self.LAYOUT_HORIZONTAL:
                        scale = self.timeline.scales.y;
                        positionIndex = 1;
                }

                position[positionIndex] = scale(d.value);

                var range = scale.range();
                var isInRange = position[positionIndex] >= range[0] && position[positionIndex] <= range[range.length - 1];

                var g = d3.select(this);

                if (isInRange) {

                    self.show();

                    g.attr('transform', 'translate('+(self.timeline.margin.left + position[0] >> 0)+','+(self.timeline.margin.top + position[1] >> 0)+')');

                    g.select('.' + self.options.bemBlockName + '-label')
                        .text(d => self.options.formatter(d.value));

                } else {
                    self.hide();
                }

            });

    });

};

D3TableMarker.prototype.show = function() {
    this.container.style('display', '');
};

D3TableMarker.prototype.hide = function() {
    this.container.style('display', 'none');
};

D3TableMarker.prototype.resize = function(transitionDuration) {

    this.sizeLineAndLabel(transitionDuration);

};

module.exports = D3TableMarker;
