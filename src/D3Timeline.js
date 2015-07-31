/* global cancelAnimationFrame, requestAnimationFrame */

"use strict";

import _ from 'lodash';
import d3 from 'd3';
import $ from 'jquery';

/**
 * @typedef {{xAxisHeight: number, yAxisWidth: number, maxBodyHeight: number, rowHeight: number, rowPadding: number, axisConfigs: *[], container: string}} D3TimelineOptions
 */

/**
 *
 * @param {D3TimelineOptions} options
 * @constructor
 */
function D3Timeline(options) {

    var self = this;

    this.options = $.extend(true, {}, this.defaults, options);

    /** @type {Array<{id: Number, name: String, elements: Array<{ id: Number, start: Date, end: Date}>}>} */
    this.data = [];

    this.margin = {
        top: this.options.xAxisHeight,
        right: 20,
        bottom: 5,
        left: this.options.yAxisWidth
    };
    
    /** @type {Number} */
    this.yScale = 0.0;

    // @todo dynamic width and so on about x axis
    this.dimensions = { width: 800 };

    this.container = null;

    this.elements = {
        body: null,
        innerContainer: null,
        xAxisContainer: null,
        x2AxisContainer: null,
        yAxisContainer: null,
        defs: null,
        clip: null
    };

    this.scales = {
        x: d3.time.scale(),
        y: d3.scale.linear()
    };

    this.axises = {

        x: d3.svg.axis()
            .scale(this.scales.x)
            .orient('top')
            .tickFormat(function(d) {
                return d.getMinutes() % 15 ? '' : d3.time.format('%H:%M')(d);
            })
            .outerTickSize(0)
            .tickPadding(20),

        x2: d3.svg.axis()
            .scale(this.scales.x)
            .orient('top')
            .tickFormat(function(d) {
                return d.getMinutes() % 15 ? '' : d3.time.format('?/?')(d);
            })
            .outerTickSize(0)
            .innerTickSize(0),

        y: d3.svg.axis()
            .scale(this.scales.y)
            .orient('left')
            .tickFormat(function(d) {
                if (self._isRound(d)) {
                    return self._entryNameGetter(self.data[(d|0)]);
                } else {
                    return '';
                }
            })
            .outerTickSize(1)
            .innerTickSize(-this.dimensions.width)
    };

    this.behaviors = {

        // zoom X with ctrlkey+wheel & pan X&Y
        zoom: d3.behavior.zoom()
            .x(this.scales.x)
            .scaleExtent([1, 10])
            .scale(1)
            .on('zoom', this.handleZooming.bind(this)),

        // pan Y
        pan: d3.behavior.zoom()
            .y(this.scales.y),

        // drag piped into pan Y
        drag: d3.behavior.drag()
            .on('drag', this.handleDragging.bind(this))

    };

    this._lastXScale = this.behaviors.zoom.scale();
    this._lastTranslate = this.behaviors.zoom.translate();
    this._currentScaleConfig = null;
    this._dataChangeCount = 0;
    this._dimensionsChangeCount = 0;
    this._lastAvailableWidth = 0;
    this._lastAvailableHeight = 0;
    this._preventDrawing = false;
}

/**
 * Default options
 *
 * @type {D3TimelineOptions}
 */
D3Timeline.prototype.defaults = {
    xAxisHeight: 50,
    yAxisWidth: 50,
    maxBodyHeight: 500,
    rowHeight: 30,
    rowPadding: 5,
    axisConfigs: [
        {
            threshold: 2,
            minutes: 30
        },
        {
            threshold: 4,
            minutes: 15
        },
        {
            threshold: 10,
            minutes: 5
        }
    ],
    container: 'body'
};

D3Timeline.prototype.initialize = function() {

    // container
    this.container = d3.select(this.options.container).append('svg');

    // defs
    this.elements.defs = this.container.append('defs');

    // clip rect in defs
    this.elements.clip = this.elements.defs.append('clipPath')
        .attr('id', 'bodyClip');
    this.elements.clip
        .append('rect')
        .attr({
            width: this.dimensions.width
        });

    // axises containers
    this.elements.xAxisContainer = this.container.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + this.options.yAxisWidth + ',' + this.options.xAxisHeight + ')');

    this.elements.x2AxisContainer = this.container.append('g')
        .attr('class', 'x2 axis')
        .attr('transform', 'translate(' + this.options.yAxisWidth + ',' + this.options.xAxisHeight + ')');

    this.elements.yAxisContainer = this.container.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + this.options.xAxisHeight + ',' + this.options.yAxisWidth + ')');

    // body container inner container and surrounding rect
    this.elements.body = this.container.append('g')
        .attr({
            transform: 'translate(' + this.margin.left + ',' + this.margin.top + ')'
        });

    // inner container
    this.elements.innerContainer = this.elements.body.append('g')
        .attr('clip-path', 'url(#bodyClip)');

    // surrounding rect
    this.elements.body.append('rect')
        .attr({
            width: this.dimensions.width
        })
        .classed('boundingrect', true);

    this.container.call(this.behaviors.zoom);
    this.container.call(this.behaviors.drag);

    return this;
};

D3Timeline.prototype.destroy = function() {

    // remove behavior listeners
    this.behaviors.zoom.on('zoom', null);
    this.behaviors.drag.on('drag', null);

    // remove dom listeners
    this.container.on('.zoom', null);
    this.container.on('.drag', null);

    // remove references
    this.container = null;
    this.elements = null;
    this.scales = null;
    this.axises = null;
    this.behaviors = null;
};

/**
 * pan X/Y & zoom X handler (clamped pan Y when wheel is pressed without ctrl, zoom X and pan X/Y otherwise)
 */
D3Timeline.prototype.handleZooming = function() {

    var sourceEvent = d3.event.sourceEvent;

    if (!sourceEvent.ctrlKey && sourceEvent.type == 'wheel') {
        this.behaviors.zoom.scale(this._lastXScale);
        this.behaviors.zoom.translate(this._lastTranslate);
        this.handleWheeling();
    } else {
        this.behaviors.zoom.translate(this._clampTranslationWithScale(d3.event.translate, [this.behaviors.zoom.scale(), this.behaviors.pan.scale()]));

        this.updateXAxisInterval();
        this.drawXAxis();
        this.drawElements();

        console.log('zooming');
    }

    this._lastXScale = this.behaviors.zoom.scale();
    this._lastTranslate = this.behaviors.zoom.translate();

};

/**
 * wheel handler (clamped pan Y)
 */
D3Timeline.prototype.handleWheeling = function() {

    var event = d3.event.sourceEvent;
    var translation = this.behaviors.pan.translate();
    var tx = translation[0];
    var ty = translation[1];

    ty += ((event.wheelDeltaY / 120) || (event.deltaY * -3)) * this.options.rowHeight;

    this.behaviors.pan.translate(this._clampTranslationWithScale([tx,ty], [this._lastXScale, this.behaviors.pan.scale()]));

    this.drawYAxis();
    this.drawElements(undefined, true);

    console.log('wheeling');

};

/**
 * dragged handler (clamped pan Y)
 */
D3Timeline.prototype.handleDragging = function() {

    var translation = this.behaviors.pan.translate();
    this.behaviors.pan.translate(this._clampTranslationWithScale([translation[0] + d3.event.dx, translation[1] + d3.event.dy], [this.behaviors.zoom.scale(), this.behaviors.pan.scale()]));
    this.drawYAxis();

    console.log('dragging');

};

D3Timeline.prototype.toggleDrawing = function(active) {

    this._preventDrawing = typeof active === 'boolean' ? !active : !this._preventDrawing;

    return this;
};

D3Timeline.prototype.setData = function(data) {

    this._dataChangeCount += 1;

    var isSizeChanging = data.length !== this.data.length;

    this.data = data;

    if (isSizeChanging || this._dataChangeCount === 1) {
        this
            .updateXAxisInterval()
            .updateY()
            .drawXAxis()
            .drawYAxis();
    }

    this.drawElements();

    return this;
};

/**
 *
 * @param {Date} minDate
 * @param {Date} maxDate
 * @returns {D3Timeline}
 */
D3Timeline.prototype.setTimeRange = function(minDate, maxDate) {

    this.minDate = minDate;
    this.maxDate = maxDate;

    this
        .updateX()
        .drawXAxis()
        .drawYAxis()
        .drawElements();

    return this;
};

D3Timeline.prototype.setAvailableWidth = function(availableWidth) {

    this._dimensionsChangeCount += 1;

    var isAvailableWidthChanging = availableWidth !== this._lastAvailableWidth;
    this._lastAvailableWidth = availableWidth;

    this.dimensions.width = availableWidth - this.margin.top - this.margin.bottom;

    if (isAvailableWidthChanging || this._dimensionsChangeCount === 1) {
        this
            .updateX()
            .drawXAxis()
            .drawYAxis()
            .drawElements()
    }

    return this;
};

D3Timeline.prototype.setAvailableHeight = function(availableHeight) {

    this._dimensionsChangeCount += 1;

    var isAvailableHeightChanging = availableHeight !== this._lastAvailableHeight;
    this._lastAvailableHeight = availableHeight;

    this.options.maxBodyHeight = availableHeight - this.margin.left - this.margin.right;

    if (isAvailableHeightChanging || this._dimensionsChangeCount === 1) {
        this
            .updateY()
            .drawXAxis()
            .drawYAxis()
            .drawElements()
    }

    return this;
};

D3Timeline.prototype.updateX = function() {

    this.container.attr('width', this.dimensions.width + this.margin.left + this.margin.right);

    this.scales.x
        .domain([this.minDate, this.maxDate])
        .range([0, this.dimensions.width]);

    this.axises.y
        .innerTickSize(-this.dimensions.width);

    this.behaviors.zoom
        .x(this.scales.x);

    this.elements.body.select('rect.boundingrect').attr('width', this.dimensions.width);
    this.elements.clip.select('rect').attr('width', this.dimensions.width);

    return this;
};

D3Timeline.prototype.drawXAxis = function(transitionDuration) {

    if (this._preventDrawing) {
        return this;
    }

    var self = this;
    
    if (this._xAxisAF) {
        cancelAnimationFrame(this._xAxisAF);
    }

    this._xAxisAF = requestAnimationFrame(function() {

        self._wrapWithAnimation(self.elements.xAxisContainer, transitionDuration)
            .call(self.axises.x)
            .selectAll('line')
            .style({
                'stroke-width': function(d) {
                    return d.getMinutes() %30 ? 1 : 2;
                }
            });

        self._wrapWithAnimation(self.elements.x2AxisContainer, transitionDuration)
            .call(self.axises.x2)
            .selectAll('text')
            .attr({
                x: (self.scales.x(new Date(0, 0, 0, 0, Math.max(15, self._currentScaleConfig.minutes, 0))) - self.scales.x(new Date(0, 0, 0, 0, 0, 0))) / 2,
            })
            .style({
                display: function(d) {
                    return d === self.maxDate
                }
            });
    });

    return this;
};

D3Timeline.prototype.drawYAxis = function drawYAxis(transitionDuration) {

    if (this._preventDrawing) {
        return this;
    }
    
    var self = this;
    
    if (this._yAxisAF) {
        cancelAnimationFrame(this._yAxisAF);
    }

    this._yAxisAF = requestAnimationFrame(function() {

        var container = self._wrapWithAnimation(self.elements.yAxisContainer, transitionDuration);
        container.call(self.axises.y);

        container
            .selectAll('text').attr({
                y: self.options.rowHeight / 2
            });

        container
            .selectAll('line').style({
                display: function(d) {
                    return self._isRound(d) ? '' : 'none';
                }
            });

    });

    return this;
};

D3Timeline.prototype.drawElements = function(transitionDuration, skipX) {

    if (this._preventDrawing) {
        return this;
    }

    var self = this;

    if (this._elementsAF) {
        cancelAnimationFrame(this._elementsAF)
    }

    this._elementsAF = requestAnimationFrame(function() {

        var g = self.elements.innerContainer.selectAll('g.timelineRow')
            .data(self.data, self._getter('id'));

        g.enter()
            .append('g')
            .classed('timelineRow', true)
            .attr('transform', self.moveRow.bind(self));

        g.exit().remove();

        self._wrapWithAnimation(g, transitionDuration)
            .attr('transform', self.moveRow.bind(self));

        var sg = g.selectAll('g.timelineElement')
            .data(self._getter('elements'), self._getter('id'));

        var enteringSG = sg.enter()
            .append('g')
            .classed('timelineElement', true);

        sg.exit().remove();

        enteringSG
            .call(self.elementEnter.bind(self))
            .attr('transform', self.moveElement.bind(self));

        if (!skipX) {
            self._wrapWithAnimation(sg, transitionDuration)
                .attr('transform', self.moveElement.bind(self))
                .call(self.elementUpdate.bind(self))
        }

    });

    return this;
};

D3Timeline.prototype.moveRow = function(d,i) {
    return 'translate(0, ' + this.scales.y(i) + ')';
};

D3Timeline.prototype.moveElement = function(d) {
    return 'translate(' + this.scales.x(d.start) + ',0)'
};

D3Timeline.prototype.updateXAxisInterval = function() {

    var scale = this.behaviors.zoom.scale();

    var conf = this._currentScaleConfig = _(this.options.axisConfigs).find(function(params) {
        var threshold = params.threshold;
        return scale <= threshold;
    });

    this.axises.x.ticks(d3.time.minutes, conf.minutes);

    return this;
};

D3Timeline.prototype.updateY = function() {
    
    var elementAmount = this.data.length;

    // have 1 more elemnt to force representing one more tick
    var elementsRange = [0, elementAmount];

    // compute new height
    this.dimensions.height = Math.min(this.data.length * 30, this.options.maxBodyHeight);

    // compute new Y scale
    this.yScale = this.options.rowHeight / this.dimensions.height * elementAmount;

    // update Y scale, axis and zoom behavior
    this.scales.y
        .domain(elementsRange)
        .range([0, this.dimensions.height]);

    this.behaviors.pan
        .y(this.scales.y)
        .scale(this.yScale);

    this.axises.y
        .ticks(elementsRange[1]);

    // and update X axis ticks height
    this.axises.x
        .innerTickSize(-this.dimensions.height);

    // update svg height
    this.container.attr({
        height: this.dimensions.height + this.margin.top + this.margin.bottom
    });

    // update inner rect height
    this.elements.body.select('rect.boundingrect').attr('height', this.dimensions.height);
    this.elements.clip.select('rect').attr('height', this.dimensions.height);

    return this;
};

D3Timeline.prototype.elementEnter = function(selection) { return selection; };

D3Timeline.prototype.elementUpdate = function(selection) { return selection; };

D3Timeline.prototype._wrapWithAnimation = function(selection, transitionDuration) {
    if (transitionDuration > 0) {
        return selection.transition().duration(transitionDuration).ease('quad-out');
    } else {
        return selection;
    }
};

D3Timeline.prototype._getter = function(prop) {
    return function(d) { return d[prop]; };
};

D3Timeline.prototype._entryNameGetter = function(entry) {
    return entry && entry.name || '';
};

D3Timeline.prototype._isRound = function(v) {
    var n = v|0;
    return v > n - 1e-3 && v < n + 1e-3;
};

D3Timeline.prototype._clampTranslationWithScale = function(translate, scale) {

    scale = scale || [1, 1];

    if (!(scale instanceof Array)) {
        scale = [scale, scale];
    }

    var tx = translate[0];
    var ty = translate[1];
    var sx = scale[0];
    var sy = scale[1];

    if (sx === 1) {
        tx = 0;
    } else {
        tx = Math.min(Math.max(-this.dimensions.width * (sx-1), tx), 0);
    }

    if (sy === 1) {
        ty = 0;
    } else {
        ty = Math.min(Math.max(-this.dimensions.height * (sy-1), ty), 0);
    }

    return [tx, ty];

};

export default D3Timeline;
