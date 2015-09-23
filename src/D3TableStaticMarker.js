"use strict";

import extend from 'extend';
import inherits from 'inherits';
import EventEmitter from 'events/events';
import d3 from 'd3';
import D3Table from './D3Table';

var d3Timeline = {};

/**
 * Table static marker which knows how to represent itself in a {@link d3Timeline.D3Table#container}
 *
 * @param {d3Timeline.D3TableStaticMarkerOptions} options
 * @extends {EventEmitter}
 * @constructor
 */
d3Timeline.D3TableStaticMarker = function D3TableStaticMarker(options) {

    EventEmitter.call(this);

    /**
     * @type {d3Timeline.D3TableStaticMarkerOptions}
     */
    this.options = extend(true, {}, this.defaults, options);

    /**
     * @type {d3Timeline.D3Table}
     */
    this.table = null;

    /**
     * @type {Boolean}
     */
    this.visible = true;

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
    this._tableResizeListener = null;

    /**
     * @type {Function}
     * @private
     */
    this._tableDestroyListener = null;

    this._moveAF = null;
};

var D3TableStaticMarker = d3Timeline.D3TableStaticMarker;

inherits(D3TableStaticMarker, EventEmitter);

D3TableStaticMarker.prototype.LAYOUT_HORIZONTAL = 'horizontal';
D3TableStaticMarker.prototype.LAYOUT_VERTICAL = 'vertical';

D3TableStaticMarker.prototype.INSERT_ON_TOP = 'insertOnTop';
D3TableStaticMarker.prototype.INSERT_BEHIND = 'insertBehind';

/**
 * @type {d3Timeline.D3TableStaticMarkerOptions}
 */
D3TableStaticMarker.prototype.defaults = {
    formatter: function(d) { return d; },
    insertionMethod: D3TableStaticMarker.prototype.INSERT_ON_TOP,
    outerTickSize: 10,
    tickPadding: 3,
    roundPosition: false,
    bemBlockName: 'tableMarker',
    bemModifiers: [],
    layout: D3TableStaticMarker.prototype.LAYOUT_VERTICAL,
    lineShape: 'line',
    rectThickness: D3Table.prototype.defaults.rowHeight
};

/**
 * Set the table it should draw itself onto
 * @param {d3Timeline.D3Table} table
 */
D3TableStaticMarker.prototype.setTable = function(table) {

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
 * Handle a D3Table being bound
 */
D3TableStaticMarker.prototype.bindTable = function() {

    var self = this;

    var className = this.options.bemBlockName + ' ' + this.options.bemBlockName + '--' + this.options.layout;

    if (this.options.bemModifiers && Array.isArray(this.options.bemModifiers) && this.options.bemModifiers.length > 0) {
        className = className + ' ' + this.options.bemModifiers.map(function(modifier) {
            return self.options.bemBlockName + '--' + modifier;
        }).join(' ');
    }

    switch(this.options.insertionMethod) {
        case this.INSERT_BEHIND:
            this.container = this.table.container
                .insert('g', function() {
                    return self.table.elements.body.node();
                });
            break;
        case this.INSERT_ON_TOP:
            this.container = this.table.container
                .append('g');
            break;
    }

    this.container
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

};

/**
 * Set the correct dimensions and label content
 *
 * @param {Number} [transitionDuration]
 */
D3TableStaticMarker.prototype.sizeLineAndLabel = function(transitionDuration) {

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
 * @param {d3Timeline.D3Table} previousTable
 */
D3TableStaticMarker.prototype.unbindTable = function(previousTable) {

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
    this._tableResizeListener = null;
    this._tableDestroyListener = null;

    this.emit('marker:unbound', previousTable);
};

/**
 * Move the marker requesting an animation frame
 */
D3TableStaticMarker.prototype.move = function() {

    if (this._moveAF) {
        this.table.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = this.table.requestAnimationFrame(this.moveSync.bind(this));

};


/**
 * @todo document this
 *
 * @returns {*}
 */
D3TableStaticMarker.prototype.getPosition = function() {
    return null;
};

/**
 * Move the marker synchronously
 */
D3TableStaticMarker.prototype.moveSync = function() {

    if (!this.table) {
        return;
    }

    var self = this;
    var layout = this.options.layout;

    var position = this.getPosition();

    this.container
        .each(function() {

            var finalPosition = [0, 0], positionIndex;

            switch(layout) {
                case self.LAYOUT_VERTICAL:
                    positionIndex = 0;
                    break;
                case self.LAYOUT_HORIZONTAL:
                    positionIndex = 1;
            }

            finalPosition[positionIndex] = position;

            var group = d3.select(this);

            self.show();

            group.attr('transform', 'translate('+(self.table.margin.left + finalPosition[0] >> 0)+','+(self.table.margin.top + finalPosition[1] >> 0)+')');

            group.select('.' + self.options.bemBlockName + '-label')
                .text(self.options.formatter.call(self, finalPosition));

        });


};

/**
 * Show the marker
 */
D3TableStaticMarker.prototype.show = function() {
    if (!this.visible && this.container) {
        this.visible = true;
        this.container.style('display', '');
    }
};

/**
 * Hide the marker
 */
D3TableStaticMarker.prototype.hide = function() {
    if (this.visible && this.container) {
        this.visible = false;
        this.container.style('display', 'none');
    }
};

/**
 * Implement resizing the marker, which should be called on D3Table resize event
 *
 * @param transitionDuration
 */
D3TableStaticMarker.prototype.resize = function(transitionDuration) {

    this.sizeLineAndLabel(transitionDuration);

};

module.exports = D3TableStaticMarker;
