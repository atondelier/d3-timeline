"use strict";

import extend from 'extend';
import inherits from 'inherits';
import EventEmitter from 'events/events';
import d3 from 'd3';
import D3Table from './D3Table';

function D3TableMarker(options) {

    EventEmitter.call(this);

    this.options = extend(true, {}, this.defaults, options);

    /**
     * @type {D3Table}
     */
    this.table = null;

    this.container = null;
    this.elements = {
        line: null,
        label: null
    };

    /**
     * @type {Function}
     * @private
     */
    this._tableMoveListener = null;

    /**
     * @type {Function}
     * @private
     */
    this._tableResizeListener = null;

    /**
     * @type {Function}
     * @private
     */
    this._tableDestroyListener = null;

    this._moveAF = null;

    this.value = null;
    this._lastTimeUpdated = null;
}

inherits(D3TableMarker, EventEmitter);

D3TableMarker.prototype.LAYOUT_HORIZONTAL = 'horizontal';
D3TableMarker.prototype.LAYOUT_VERTICAL = 'vertical';

D3TableMarker.prototype.defaults = {
    formatter: function(d) { return d; },
    outerTickSize: 10,
    tickPadding: 10,
    roundPosition: false,
    bemBlockName: 'tableMarker',
    bemModifiers: [],
    layout: D3TableMarker.prototype.LAYOUT_VERTICAL
};

/**
 *
 * @param {D3Table} table
 */
D3TableMarker.prototype.setTable = function(table) {

    var previousTable = this.table;

    this.table = table && table instanceof D3Table ? table : null;

    if (this.table) {
        if (previousTable !== this.table) {
            if (previousTable) {
                this.unbindTable(previousTable);
            }
            this.bindTable();
        }
    } else if (!this.table && previousTable) {
        this.unbindTable(previousTable);
    }

};

D3TableMarker.prototype.valueComparator = function(timeA, timeB) {
    return +timeA !== +timeB;
};

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

D3TableMarker.prototype.getValue = function(data) {
    return data.value;
};

D3TableMarker.prototype.bindTable = function() {

    var self = this;

    var className = this.options.bemBlockName + ' ' + this.options.bemBlockName + '--' + this.options.layout;

    if (this.options.bemModifiers && Array.isArray(this.options.bemModifiers) && this.options.bemModifiers.length > 0) {
        className = className + ' ' + this.options.bemModifiers.map(function(modifier) {
            return self.options.bemBlockName + '--' + modifier;
        }).join(' ');
    }

    this.container = this.table.container
        .append('g')
        .datum({
            value: this.value
        })
        .attr('class', className);

    this.elements.line = this.container
        .append('line')
        .attr('class', this.options.bemBlockName + '-line')
        .style('pointer-events', 'none');

    this.elements.label = this.container
        .append('text')
        .attr('class', this.options.bemBlockName + '-label');

    this.sizeLineAndLabel();

    // on table move, move the marker
    this._tableMoveListener = this.move.bind(this);
    this.table.on(this.table.options.bemBlockName + ':move', this._tableMoveListener);

    // on table resize, resize the marker and move it
    this._tableResizeListener = function(table, selection, transitionDuration) {
        self.resize(transitionDuration);
        self.move(transitionDuration);
    };
    this.table.on(this.table.options.bemBlockName + ':resize', this._tableResizeListener);

    this._tableDestroyListener = function(table) {
        self.unbindTable(table);
    };
    this.table.on(this.table.options.bemBlockName + ':destroy', this._tableDestroyListener);

    this.emit('marker:bound');

    this.move();

};

D3TableMarker.prototype.sizeLineAndLabel = function(transitionDuration) {

    var layout = this.options.layout;

    var line = this.elements.line;
    var label = this.elements.label;

    if (transitionDuration > 0) {
        line = line.transition().duration(transitionDuration);
        label = label.transition().duration(transitionDuration);
    }

    switch(layout) {
        case this.LAYOUT_VERTICAL:
            line
                .attr({
                    y1: -this.options.outerTickSize,
                    y2: this.table.dimensions.height
                });
            label
                .attr('dy', -this.options.outerTickSize-this.options.tickPadding);
            break;
        case this.LAYOUT_HORIZONTAL:
            line
                .attr({
                    x1: -this.options.outerTickSize,
                    x2: this.table.dimensions.width
                });
            label
                .attr('dx', -this.options.outerTickSize-this.options.tickPadding)
                .attr('dy', 4);
            break;
    }

};

D3TableMarker.prototype.unbindTable = function(previousTable) {

    previousTable.removeListener(previousTable.options.bemBlockName + ':move', this._tableMoveListener);
    previousTable.removeListener(previousTable.options.bemBlockName + ':resize', this._tableResizeListener);
    previousTable.removeListener(previousTable.options.bemBlockName + ':destroy', this._tableDestroyListener);

    if (this.container) {
        this.container.remove();
    }

    if (this._moveAF) {
        previousTable.cancelAnimationFrame(this._moveAF);
        this._moveAF = null;
    }

    this.container = null;
    this._tableMoveListener = null;

    this.emit('marker:unbound', previousTable);
};

D3TableMarker.prototype.move = function(transitionDuration) {

    if (this._moveAF) {
        this.table.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = this.table.requestAnimationFrame(this.moveSync.bind(this));

};

D3TableMarker.prototype.moveSync = function() {

    if (!this.table) {
        return;
    }

    var self = this;
    var layout = this.options.layout;

    this.container
        .each(function(d) {

            var value = self.getValue(d);

            if (value === null) {
                self.hide();
                return;
            }

            var scale, position = [0, 0], positionIndex;

            switch(layout) {
                case self.LAYOUT_VERTICAL:
                    scale = self.table.scales.x;
                    positionIndex = 0;
                    break;
                case self.LAYOUT_HORIZONTAL:
                    scale = self.table.scales.y;
                    positionIndex = 1;
            }

            position[positionIndex] = scale(value);

            var range = scale.range();
            var isInRange = position[positionIndex] >= range[0] && position[positionIndex] <= range[range.length - 1];

            var g = d3.select(this);

            if (isInRange) {

                self.show();

                g.attr('transform', 'translate('+(self.table.margin.left + position[0] >> 0)+','+(self.table.margin.top + position[1] >> 0)+')');

                g.select('.' + self.options.bemBlockName + '-label')
                    .text(self.options.formatter(value));

            } else {
                self.hide();
            }

        });

};

D3TableMarker.prototype.show = function() {
    if (this.container) {
        this.container.style('display', '');
    }
};

D3TableMarker.prototype.hide = function() {
    if (this.container) {
        this.container.style('display', 'none');
    }
};

D3TableMarker.prototype.resize = function(transitionDuration) {

    this.sizeLineAndLabel(transitionDuration);

};

module.exports = D3TableMarker;
