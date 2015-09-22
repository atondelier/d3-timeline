"use strict";

import extend from 'extend';
import inherits from 'inherits';
import d3 from 'd3';
import D3Table from './D3Table';
import D3TableStaticMarker from './D3TableStaticMarker';

var d3Timeline = {};

/**
 * Table marker which knows how to represent itself in a {@link d3Timeline.D3Table#container}
 *
 * @param {d3Timeline.D3TableStaticMarkerOptions} options
 * @extends {d3Timeline.D3TableStaticMarker}
 * @constructor
 */
d3Timeline.D3TableMarker = function D3TableMarker(options) {

    D3TableStaticMarker.call(this, options);

    /**
     * @type {Function}
     * @private
     */
    this._tableMoveListener = null;

    this._lastTimeUpdated = null;
};

var D3TableMarker = d3Timeline.D3TableMarker;

inherits(D3TableMarker, D3TableStaticMarker);


/**
 * Compare two values
 * To be overridden if you wish the marker not to be moved for some value changes which should not impact the marker position
 *
 * @param {Number} a
 * @param {Number} b
 * @returns {Boolean}
 */
D3TableMarker.prototype.valueComparator = function(a, b) {
    return +a !== +b;
};

/**
 * Set the value for the marker, which updates if it needs to
 *
 * @param {Number} value
 * @param {Boolean} [silent]
 */
D3TableMarker.prototype.setValue = function(value, silent) {

    var previousTimeUpdated = this._lastTimeUpdated;

    this.value = value;

    if (this.valueComparator(previousTimeUpdated, this.value) && this.table && this.container) {

        this._lastTimeUpdated = this.value;

        this.container
            .datum({
                value: value
            });

        if (!silent) {
            this.move();
        }
    }

};

/**
 * Value getter from d3 selection datum which should be made of a value
 * To be overridden if you wish to alter this value dynamically
 *
 * @param {value: Number} data
 * @returns {*}
 */
D3TableMarker.prototype.getValue = function(data) {
    return data.value;
};

/**
 * Handle a D3Table being bound
 */
D3TableMarker.prototype.bindTable = function() {

    D3TableStaticMarker.prototype.bindTable.apply(this, arguments);

    var self = this;

    // on table move, move the marker
    this._tableMoveListener = function() {
        self.move();
    };
    this.table.on(this.table.options.bemBlockName + ':move', this._tableMoveListener);

    this.move();

};

/**
 * Handle D3Table unbound
 *
 * @param {d3Timeline.D3Table} previousTable
 */
D3TableMarker.prototype.unbindTable = function(previousTable) {

    D3TableStaticMarker.prototype.unbindTable.apply(this, arguments);

    previousTable.removeListener(previousTable.options.bemBlockName + ':move', this._tableMoveListener);

    this._tableMoveListener = null;

    this.emit('marker:unbound', previousTable);
};

/**
 * @todo document this
 *
 * @param data
 * @returns {*}
 */
D3TableMarker.prototype.getPosition = function(data) {

    var value = this.getValue(data);

    if (value === null) {
        return null;
    }

    var layout = this.options.layout;
    var scale, position = [0, 0], positionIndex;

    switch(layout) {
        case this.LAYOUT_VERTICAL:
            scale = this.table.scales.x;
            positionIndex = 0;
            break;
        case this.LAYOUT_HORIZONTAL:
            scale = this.table.scales.y;
            positionIndex = 1;
    }

    position[positionIndex] = scale(value);

    var range = scale.range();
    var isInRange = position[positionIndex] >= range[0] && position[positionIndex] <= range[range.length - 1];

    return isInRange ? position : null;
};

/**
 * Move the marker synchronously
 */
D3TableMarker.prototype.moveSync = function() {

    if (!this.table) {
        return;
    }

    var self = this;

    this.container
        .each(function(data) {

            var position = self.getPosition(data);

            if (position) {
                var group = d3.select(this);

                self.show();

                group.attr('transform', 'translate('+(self.table.margin.left + position[0] >> 0)+','+(self.table.margin.top + position[1] >> 0)+')');

                group.select('.' + self.options.bemBlockName + '-label')
                    .text(self.options.formatter.call(self, self.getValue(data)));

            } else {
                self.hide();
            }

        });

};

module.exports = D3TableMarker;
