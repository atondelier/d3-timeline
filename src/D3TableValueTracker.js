"use strict";

import D3TableMarker from './D3TableMarker';
import inherits from 'inherits';
import extend from 'extend';

/**
 *
 * @extends {D3TableMarker}
 * @constructor
 */
function D3TableValueTracker(options) {
    D3TableMarker.call(this, options);

    this.enabled = false;
}

inherits(D3TableValueTracker, D3TableMarker);

D3TableValueTracker.prototype.defaults = extend(true, {}, D3TableMarker.prototype.defaults, {
    bemModifier: '--valueTracker'
});

D3TableValueTracker.prototype.valueGetter = function() {

   return 0;

};

D3TableValueTracker.prototype.start = function() {

    var self = this;

    this.enabled = true;

    d3.timer(function() {

        self.setValue(self.valueGetter());

        return !self.enabled;

    });
};

D3TableValueTracker.prototype.stop = function() {

    this.enabled = false;

};

module.exports = D3TableValueTracker;
