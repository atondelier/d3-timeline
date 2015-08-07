"use strict";

import extend from 'extend';
import inherits from 'inherits';
import EventEmitter from 'events/events';
import d3 from 'd3';
import D3Timeline from './D3Timeline';

function D3TimelineMarker(options) {

    EventEmitter.call(this);

    this.options = extend(true, {}, this.defaults, options);

    /**
     * @type {D3Timeline}
     */
    this.timeline = null;

    this.container = null;

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

    this.time = null;
    this._lastTimeUpdated = null;
}

inherits(D3TimelineMarker, EventEmitter);

D3TimelineMarker.prototype.defaults = {
    timeFormat: d3.time.format('%H:%M'),
    outerTickSize: 10,
    tickPadding: 10,
    roundPosition: false,
    className: ''
};

/**
 *
 * @param {D3Timeline} timeline
 */
D3TimelineMarker.prototype.setTimeline = function(timeline) {

    var previousTimeline = this.timeline;

    this.timeline = timeline && timeline instanceof D3Timeline ? timeline : null;

    if (this.timeline && !previousTimeline) {
        this.handleBoundTimeline();
    } else if (!this.timeline && previousTimeline) {
        this.handleUnboundTimeline(previousTimeline);
    }

};

D3TimelineMarker.prototype.timeComparator = function(timeA, timeB) {
    return +timeA !== +timeB;
};

D3TimelineMarker.prototype.setTime = function(time) {

    var previousTimeUpdated = this._lastTimeUpdated;

    this.time = time;

    if (this.timeComparator(previousTimeUpdated, this.time) && this.timeline && this.container) {

        this._lastTimeUpdated = this.time;

        this.container
            .datum({
                time: time
            });

        this.move();
    }

};

D3TimelineMarker.prototype.handleBoundTimeline = function() {

    var self = this;

    this.container = this.timeline.container
        .append('g')
        .datum({
            time: this.time
        })
        .attr('class', 'timelineMarker ' + this.options.className);

    this.container
        .append('line')
        .attr('class', 'timelineMarker-line')
        .style('pointer-events', 'none')
        .attr({
            y1: -this.options.outerTickSize,
            y2: this.timeline.dimensions.height
        });

    this.container
        .append('text')
        .attr('class', 'timelineMarker-label')
        .attr('dy', -this.options.outerTickSize-this.options.tickPadding);

    // on timeline move, move the marker
    this._timelineMoveListener = this.move.bind(this);
    this.timeline.on('timeline:move', this._timelineMoveListener);

    // on timeline resize, resize the marker and move it
    this._timelineResizeListener = function() {
        self.resize();
        self.move();
    };
    this.timeline.on('timeline:resize', this._timelineResizeListener);

    this.emit('timeline:marker:bound');

    this.move();

};

D3TimelineMarker.prototype.handleUnboundTimeline = function(previousTimeline) {

    previousTimeline.removeListener('timeline:move', this._timelineMoveListener);
    previousTimeline.removeListener('timeline:resize', this._timelineResizeListener);

    this.container.remove();

    if (this._moveAF) {
        previousTimeline.cancelAnimationFrame(this._moveAF);
        this._moveAF = null;
    }

    this.container = null;
    this._timelineMoveListener = null;

    this.emit('timeline:marker:unbound', previousTimeline);
};

D3TimelineMarker.prototype.move = function() {

    var self = this;

    if (this._moveAF) {
        this.timeline.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = this.timeline.requestAnimationFrame(function() {

        self.container
            .each(function(d) {

                var xScale = self.timeline.scales.x;
                var xRange = xScale.range();
                var left = self.timeline.scales.x(d.time);
                var isInRange = left >= xRange[0] && left <= xRange[xRange.length - 1];

                var g = d3.select(this);

                if (isInRange) {

                    self.show();

                    g.attr('transform', 'translate('+(self.timeline.margin.left + left >> 0)+','+self.timeline.margin.top+')');

                    g.select('.timelineMarker-label')
                        .text(d => self.options.timeFormat(d.time));

                } else {
                    self.hide();
                }

            });

    });

};

D3TimelineMarker.prototype.show = function() {
    this.container.style('display', '');
};

D3TimelineMarker.prototype.hide = function() {
    this.container.style('display', 'none');
};

D3TimelineMarker.prototype.resize = function() {

    this.container
        .select('.timelineMarker-line')
        .attr({
            y1: -this.options.outerTickSize,
            y2: this.timeline.dimensions.height
        });

};

module.exports = D3TimelineMarker;
