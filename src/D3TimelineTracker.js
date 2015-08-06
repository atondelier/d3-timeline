"use strict";

import D3TimelineMarker from './D3TimelineMarker';
import inherits from 'inherits';
import extend from 'extend';

/**
 *
 * @extends {D3TimelineMarker}
 * @constructor
 */
function D3TimelineTracker(options) {
    D3TimelineMarker.call(this, options);

    this.enabled = false;
}

inherits(D3TimelineTracker, D3TimelineMarker);

D3TimelineTracker.prototype.timeGetter = function() {

    return new Date();

};

D3TimelineTracker.prototype.start = function() {

    var self = this;

    this.enabled = true;

    d3.timer(function() {

        self.setTime(self.timeGetter());

        return !self.enabled;

    });
};

D3TimelineTracker.prototype.stop = function() {

    this.enabled = false;

};

module.exports = D3TimelineTracker;
