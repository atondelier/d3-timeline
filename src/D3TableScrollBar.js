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
d3Timeline.D3TableScrollBar = function D3TableScrollBar(options) {

    D3TableStaticMarker.call(this, options);

    /**
     * @type {Function}
     * @private
     */
    this._tableMoveListener = null;
};

var D3TableScrollBar = d3Timeline.D3TableScrollBar;

inherits(D3TableScrollBar, D3TableStaticMarker);

/**
 * @type {d3Timeline.D3TableStaticMarkerOptions}
 */
D3TableScrollBar.prototype.defaults = extend(true, {}, D3TableStaticMarker.prototype.defaults, {
    bemModifiers: ['scrollBar']
});

/**
 * Handle a D3Table being bound
 */
D3TableScrollBar.prototype.bindTable = function() {

    D3TableStaticMarker.prototype.bindTable.apply(this, arguments);

    var self = this;

    // on table move, move the marker
    this._tableMoveListener = function() {
        self.updateSize();
    };
    this.table.on(this.table.options.bemBlockName + ':move', this._tableMoveListener);

    this.move();

};

/**
 * Handle D3Table unbound
 *
 * @param {d3Timeline.D3Table} previousTable
 */
D3TableScrollBar.prototype.unbindTable = function(previousTable) {

    D3TableStaticMarker.prototype.unbindTable.apply(this, arguments);

    previousTable.removeListener(previousTable.options.bemBlockName + ':move', this._tableMoveListener);

    this._tableMoveListener = null;

    this.emit('marker:unbound', previousTable);
};

/**
 * @todo document this
 *
 * @returns {*}
 */
D3TableScrollBar.prototype.getPosition = function() {

    switch(this.options.layout) {
        case this.LAYOUT_VERTICAL:
            return [this.table.dimensions.width - this.options.rectThickness / 2, 0];
        case this.LAYOUT_HORIZONTAL:
            return [0, this.table.dimensions.height - this.options.rectThickness / 2];
    }

};

/**
 * Move the marker synchronously
 */
D3TableScrollBar.prototype.moveSync = function() {

    if (!this.table) {
        return;
    }

    var self = this;

    this.container
        .each(function() {

            var position = self.getPosition();

            if (position) {
                var group = d3.select(this);

                self.show();

                group.attr('transform', 'translate('+(self.table.margin.left + position[0] >> 0)+','+(self.table.margin.top + position[1] >> 0)+')');

            } else {
                self.hide();
            }

        });

    this.updateSize();

};

/**
 * Update the scroll bar size
 */
D3TableScrollBar.prototype.updateSize = function() {

    var scale, start, end, min, quantity, domain, multiplier, positionRule, sizeRule;

    switch(this.options.layout) {

        case this.LAYOUT_VERTICAL:

            var data = this.table.data;
            scale = this.table.scales.y;
            domain = scale.domain();
            start = domain[0];
            end = domain[1];

            if (start == 0 && end == data.length) {
                if (this.visible) {
                    this.hide();
                }
                return;
            } else {
                if (!this.visible) {
                    this.show();
                }
            }

            min = 0;
            quantity = data.length;
            multiplier = this.table.dimensions.height / quantity;
            positionRule = 'y';
            sizeRule = 'height';

            break;

        case this.LAYOUT_HORIZONTAL:

            scale = this.table.scales.x;
            domain = scale.domain();
            start = domain[0];
            end = domain[1];

            if (+start == +this.table.minX && +end == +this.table.maxX) {
                this.hide();
                return;
            } else {
                this.show();
            }

            min = this.table.minX;
            quantity = +this.table.maxX - this.table.minX;
            multiplier = this.table.dimensions.width / quantity;
            positionRule = 'x';
            sizeRule = 'width';

            break;
    }

    this.container.select('rect')
        .attr(positionRule, (+start - min) * multiplier)
        .attr(sizeRule, (end - start) * multiplier);
};

module.exports = D3TableScrollBar;
