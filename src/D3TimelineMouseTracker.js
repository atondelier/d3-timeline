"use strict";

import D3TimelineMarker from './D3TimelineMarker';
import inherits from 'inherits';
import extend from 'extend';

/**
 *
 * @extends {D3TimelineMarker}
 * @constructor
 */
function D3TimelineMouseTracker(options) {
    D3TimelineMarker.call(this, options);

    this._timelineMouseenterListener = null;
    this._timelineMousemoveListener = null;
    this._timelineMouseleaveListener = null;

    this._moveAF = null;

    this.on('timeline:marker:bound', this.handleTimelineBound.bind(this));
    this.on('timeline:marker:unbound', this.handleTimelineUnbound.bind(this));
}

inherits(D3TimelineMouseTracker, D3TimelineMarker);

D3TimelineMouseTracker.prototype.defaults = extend(true, {}, D3TimelineMarker.prototype.defaults, {
    className: 'timelineMarker--mouseTracker'
});

D3TimelineMouseTracker.prototype.handleTimelineBound = function() {

    this.timeline.on('timeline:mouseenter', this._timelineMouseenterListener = this.handleMouseenter.bind(this));
    this.timeline.on('timeline:mousemove', this._timelineMousemoveListener = this.handleMousemove.bind(this));
    this.timeline.on('timeline:mouseleave', this._timelineMouseleaveListener = this.handleMouseleave.bind(this));

};

D3TimelineMouseTracker.prototype.handleTimelineUnbound = function(previousTimeline) {

    previousTimeline.removeListener('timeline:mouseenter', this._timelineMouseenterListener);
    previousTimeline.removeListener('timeline:mousemove', this._timelineMousemoveListener);
    previousTimeline.removeListener('timeline:mouseleave', this._timelineMouseleaveListener);

};

D3TimelineMouseTracker.prototype.handleMouseenter = function(timeline, selection, d3Event, getTime, getRow) {

    var self = this;

    var time = getTime();

    timeline.requestAnimationFrame(function() {
        self.show();
        self.setTime(time);
    });

};

D3TimelineMouseTracker.prototype.handleMousemove = function(timeline, selection, d3Event, getTime, getRow) {

    var self = this;
    var time = getTime();

    if (this._moveAF) {
        timeline.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = timeline.requestAnimationFrame(function() {
        self.setTime(time);
    });

};

D3TimelineMouseTracker.prototype.handleMouseleave = function(timeline, selection, d3Event, getTime, getRow) {

    if (this._moveAF) {
        timeline.cancelAnimationFrame(this._moveAF);
    }

    var self = this;
    timeline.requestAnimationFrame(function() {
        self.hide();
    });

};

module.exports = D3TimelineMouseTracker;
