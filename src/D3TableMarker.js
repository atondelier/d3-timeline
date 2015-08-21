"use strict";

import extend from 'extend';
import inherits from 'inherits';
import EventEmitter from 'events/events';
import d3 from 'd3';
import D3Table from './D3Table';

/**
 * Table marker options which knows how to represent itself in a {@link D3Table#container}
 *
 * @param {D3TableMarkerOptions} options
 * @constructor
 */
function D3TableMarker(options) {

    EventEmitter.call(this);

    this.options = extend(true, {}, this.defaults, options);

    /**
     * @type {D3Table}
     */
    this.table = null;

    /**
     * @type {d3.Selection}
     */
    this.container = null;

    /**
     * @type {{line: d3.Selection, label: d3.Selection}}
     */
    this.elements = {};

    /**
     * @type {Number}
     */
    this.value = null;

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
    this._lastTimeUpdated = null;
}

inherits(D3TableMarker, EventEmitter);

D3TableMarker.prototype.LAYOUT_HORIZONTAL = 'horizontal';
D3TableMarker.prototype.LAYOUT_VERTICAL = 'vertical';

/**
 * @type {D3TableMarkerOptions}
 */
D3TableMarker.prototype.defaults = {
    formatter: function(d) { return d; },
    outerTickSize: 10,
    tickPadding: 3,
    roundPosition: false,
    bemBlockName: 'tableMarker',
    bemModifiers: [],
    layout: D3TableMarker.prototype.LAYOUT_VERTICAL,
    lineShape: 'line',
    rectThickness: D3Table.prototype.defaults.rowHeight
};

/**
 * Set the table it should draw itself onto
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

    switch(this.options.lineShape) {
        case 'line':
            this.elements.line = this.container
                .append('line')
                .attr('class', this.options.bemBlockName + '-line')
                .style('pointer-events', 'none');
            break;
        case 'rect':
            this.elements.line = this.container
                .append('rect')
                .attr('class', this.options.bemBlockName + '-rect')
                .style('pointer-events', 'none');
            break;
    }

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

/**
 * Set the correct dimensions and label content
 *
 * @param {Number} [transitionDuration]
 */
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

            switch(this.options.lineShape) {
                case 'line':
                    line
                        .attr({
                            y1: -this.options.outerTickSize,
                            y2: this.table.dimensions.height
                        });
                    break;
                case 'rect':
                    line.attr({
                        x: -this.options.rectThickness/2,
                        y: -this.options.outerTickSize,
                        width: this.options.rectThickness,
                        height: this.options.outerTickSize + this.table.dimensions.height
                    });
                    break;
            }

            label
                .attr('dy', -this.options.outerTickSize-this.options.tickPadding);

            break;

        case this.LAYOUT_HORIZONTAL:

            switch(this.options.lineShape) {
                case 'line':
                    line
                        .attr({
                            x1: -this.options.outerTickSize,
                            x2: this.table.dimensions.width
                        });
                    break;
                case 'rect':
                    line.attr({
                        x: -this.options.outerTickSize,
                        y: -this.options.rectThickness/2,
                        width: this.options.outerTickSize + this.table.dimensions.width,
                        height: this.options.rectThickness
                    });
                    break;
            }

            label
                .attr('dx', -this.options.outerTickSize-this.options.tickPadding)
                .attr('dy', 4);

            break;
    }

};

/**
 * Handle D3Table unbound
 *
 * @param {D3Table} previousTable
 */
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

/**
 * Move the marker requesting an animation frame
 *
 * @param {Number} [transitionDuration]
 */
D3TableMarker.prototype.move = function(transitionDuration) {

    if (this._moveAF) {
        this.table.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = this.table.requestAnimationFrame(this.moveSync.bind(this));

};

/**
 * Move the marker synchronously
 */
D3TableMarker.prototype.moveSync = function() {

    if (!this.table) {
        return;
    }

    var self = this;
    var layout = this.options.layout;

    this.container
        .each(function(data) {

            var value = self.getValue(data);

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

            var group = d3.select(this);

            if (isInRange) {

                self.show();

                group.attr('transform', 'translate('+(self.table.margin.left + position[0] >> 0)+','+(self.table.margin.top + position[1] >> 0)+')');

                group.select('.' + self.options.bemBlockName + '-label')
                    .text(self.options.formatter.call(self, value));

            } else {
                self.hide();
            }

        });

};

/**
 * Show the marker
 */
D3TableMarker.prototype.show = function() {
    if (this.container) {
        this.container.style('display', '');
    }
};

/**
 * Hide the marker
 */
D3TableMarker.prototype.hide = function() {
    if (this.container) {
        this.container.style('display', 'none');
        this.container.datum({
            value: null
        });
    }
};

/**
 * Implement resizing the marker, which should be called on D3Table resize event
 *
 * @param transitionDuration
 */
D3TableMarker.prototype.resize = function(transitionDuration) {

    this.sizeLineAndLabel(transitionDuration);

};

module.exports = D3TableMarker;
