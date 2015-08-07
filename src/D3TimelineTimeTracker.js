"use strict";

import D3TimelineMarker from './D3TimelineMarker';
import inherits from 'inherits';
import extend from 'extend';

/**
 *
 * @extends {D3TimelineMarker}
 * @constructor
 */
function D3TimelineTimeTracker(options) {
    D3TimelineMarker.call(this, options);

    this.enabled = false;
}

inherits(D3TimelineTimeTracker, D3TimelineMarker);

D3TimelineTimeTracker.prototype.defaults = extend(true, {}, D3TimelineMarker.prototype.defaults, {
    className: 'timelineMarker--timeTracker'
});

D3TimelineTimeTracker.prototype.timeGetter = function() {

    return new Date();

};

D3TimelineTimeTracker.prototype.start = function() {

    var self = this;

    this.enabled = true;

    d3.timer(function() {

        self.setTime(self.timeGetter());

        return !self.enabled;

    });
};

D3TimelineTimeTracker.prototype.stop = function() {

    this.enabled = false;

};

module.exports = D3TimelineTimeTracker;
