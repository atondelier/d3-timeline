"use strict";

import D3TableValueTracker from './D3TableValueTracker';
import inherits from 'inherits';
import extend from 'extend';

/**
 *
 * @extends {D3TableValueTracker}
 * @constructor
 */
function D3TimelineTimeTracker(options) {
    D3TableValueTracker.call(this, options);
}

inherits(D3TimelineTimeTracker, D3TableValueTracker);

D3TimelineTimeTracker.prototype.defaults = extend(true, {}, D3TableValueTracker.prototype.defaults, {
    bemBlockName: 'timelineMarker',
    bemModifier: '--timeTracker'
});

D3TimelineTimeTracker.prototype.timeGetter = function() {
    return new Date();
};

D3TimelineTimeTracker.prototype.timeComparator = function(a,b) {
    return this.valueComparator(a,b);
}

D3TimelineTimeTracker.prototype.setTime = function(time) {
    return this.setValue(time);
};

D3TimelineTimeTracker.prototype.valueGetter = function() {
    return this.timeGetter();
};

module.exports = D3TimelineTimeTracker;
