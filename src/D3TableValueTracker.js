"use strict";

import D3TableMarker from './D3TableMarker';
import inherits from 'inherits';
import extend from 'extend';

/**
 * A D3TableValueTracker is a D3TableMarker which behaves alone and can be started and stopped,
 * getting its value from the implemented valueGetter
 *
 * @see d3.timer to understand how it behaves automatically
 * @param {d3Timeline.D3TableMarkerOptions} options
 * @extends {d3Timeline.D3TableMarker}
 * @constructor
 */
function D3TableValueTracker(options) {
    D3TableMarker.call(this, options);

    this.enabled = false;
}

inherits(D3TableValueTracker, D3TableMarker);

/**
 * @type {d3Timeline.D3TableMarkerOptions}
 */
D3TableValueTracker.prototype.defaults = extend(true, {}, D3TableMarker.prototype.defaults, {
    bemModifiers: ['valueTracker']
});

/**
 * By default, the value it gets is 0
 *
 * @returns {Number}
 */
D3TableValueTracker.prototype.valueGetter = function() {

   return 0;

};

/**
 * Start the tracker
 */
D3TableValueTracker.prototype.start = function() {

    var self = this;

    this.enabled = true;

    d3.timer(function() {

        self.setValue(self.valueGetter());

        return !self.enabled;

    });
};

/**
 * Stop the tracker
 */
D3TableValueTracker.prototype.stop = function() {

    this.enabled = false;

};

module.exports = D3TableValueTracker;
