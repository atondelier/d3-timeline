"use strict";

import D3TableMarker from './D3TableMarker';
import inherits from 'inherits';
import extend from 'extend';

/**
 *
 * @extends {D3TableMarker}
 * @constructor
 */
function D3TableMouseTracker(options) {
    D3TableMarker.call(this, options);

    this._timelineMouseenterListener = null;
    this._timelineMousemoveListener = null;
    this._timelineMouseleaveListener = null;

    this._moveAF = null;

    this.on('marker:bound', this.handleTimelineBound.bind(this));
    this.on('marker:unbound', this.handleTimelineUnbound.bind(this));

    this._isListeningToTouchEvents = false;
}

inherits(D3TableMouseTracker, D3TableMarker);

D3TableMouseTracker.prototype.defaults = extend(true, {}, D3TableMarker.prototype.defaults, {
    bemModifier: '--mouseTracker',
    listenToTouchEvents: true
});

D3TableMouseTracker.prototype.handleTimelineBound = function() {

    this._timelineMouseenterListener = this.handleMouseenter.bind(this);
    this._timelineMousemoveListener = this.handleMousemove.bind(this);
    this._timelineMouseleaveListener = this.handleMouseleave.bind(this);

    this.timeline.on('timeline:mouseenter', this._timelineMouseenterListener);
    this.timeline.on('timeline:mousemove', this._timelineMousemoveListener);
    this.timeline.on('timeline:mouseleave', this._timelineMouseleaveListener);

    if (this.options.listenToTouchEvents) {
        this._isListeningToTouchEvents = true;
        this.timeline.on('timeline:touchmove', this._timelineMousemoveListener);
    } else {
        this._isListeningToTouchEvents = false;
    }
};

D3TableMouseTracker.prototype.handleTimelineUnbound = function(previousTimeline) {

    previousTimeline.removeListener('timeline:mouseenter', this._timelineMouseenterListener);
    previousTimeline.removeListener('timeline:mousemove', this._timelineMousemoveListener);
    previousTimeline.removeListener('timeline:mouseleave', this._timelineMouseleaveListener);

    if (this._isListeningToTouchEvents) {
        previousTimeline.removeListener('timeline:touchmove', this._timelineMousemoveListener);
    }

};

D3TableMouseTracker.prototype.getValueFromTableEvent = function(timeline, selection, d3Event, getTime, getRow) {
    switch (this.options.layout) {
        case 'vertical':
            return getTime();
        case 'horizontal':
            return getRow();
    }
};

D3TableMouseTracker.prototype.handleMouseenter = function(timeline, selection, d3Event, getTime, getRow) {

    var self = this;

    var time = this.getValueFromTableEvent.apply(this, arguments);;

    timeline.requestAnimationFrame(function() {
        self.show();
        self.setValue(time);
    });

};

D3TableMouseTracker.prototype.handleMousemove = function(timeline, selection, d3Event, getTime, getRow) {

    var self = this;
    var time = this.getValueFromTableEvent.apply(this, arguments);;

    if (this._moveAF) {
        timeline.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = timeline.requestAnimationFrame(function() {
        self.setValue(time);
    });

};

D3TableMouseTracker.prototype.handleMouseleave = function(timeline, selection, d3Event, getTime, getRow) {

    if (this._moveAF) {
        timeline.cancelAnimationFrame(this._moveAF);
    }

    var self = this;
    timeline.requestAnimationFrame(function() {
        self.hide();
    });

};

module.exports = D3TableMouseTracker;
