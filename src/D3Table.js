/* global cancelAnimationFrame, requestAnimationFrame */

"use strict";

import extend from 'extend';
import inherits from 'inherits';
import EventEmitter from 'events/events';
import d3 from 'd3';

var d3Timeline = {};


/**
 * An instance of D3Table uses d3.js to build a svg grid with axises.
 * You set a data set with {@link d3Timeline.D3Table.setData}.
 * Each group of element {@link d3Timeline.D3TableRow} is drawn in rows (y axis)
 * and each element {@link d3Timeline.D3TableElement} of a row is drawn in this row
 * There is no graphical element for rows.
 *
 * The provided nested data set is first flattened to enable transition between differents rows.
 *
 * @param {d3Timeline.D3TableOptions} options
 * @constructor
 */
d3Timeline.D3Table = function D3Table(options) {

    EventEmitter.call(this);

    D3Table.instancesCount += 1;

    this.instanceNumber = D3Table.instancesCount;

    /**
     * @type {d3Timeline.D3TableOptions}
     */
    this.options = extend(true, {}, this.defaults, options);

    /**
     * @type {Array<D3TableRow>}
     */
    this.data = [];

    /**
     * @type {Array<D3TableElement>}
     */
    this.flattenedData = [];

    /**
     * @type {{top: number, right: number, bottom: number, left: number}}
     */
    this.margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    /**
     * @type {{width: number, height: number}}
     */
    this.dimensions = { width: 0, height: 0 };

    /**
     * @type {number[]}
     */
    this.currentElementsGroupTranslate = [0.0, 0.0];

    /**
     * @type {d3.Selection}
     */
    this.container = null;

    /**
     * @type {{
     *  body: d3.Selection,
     *  innerContainer: d3.Selection,
     *  xAxisContainer: d3.Selection,
     *  x2AxisContainer: d3.Selection,
     *  yAxisContainer: d3.Selection,
     *  defs: d3.Selection,
     *  clip: d3.Selection
     * }}
     */
    this.elements = {};

    /**
     * @type {{
     *  x: d3.scale.Linear,
     *  y: d3.scale.Linear
     * }}
     */
    this.scales = {};

    /**
     * @type {{
     *  x: d3.svg.Axis,
     *  x2: d3.svg.Axis,
     *  y: d3.svg.Axis
     * }}
     */
    this.axises = {};

    /**
     * @type {{
     *  zoom: d3.behavior.Zoom,
     *  zoomX: d3.behavior.Zoom,
     *  zoomY: d3.behavior.Zoom,
     *  pan: d3.behavior.Drag
     * }}
     */
    this.behaviors = {};

    /**
     * @type {[Number, Number]}
     * @private
     */
    this._lastTranslate = null;

    /**
     * @type {[Number, Number]}
     * @private
     */
    this._lastScale = null;

    /**
     * @type {Number}
     * @private
     */
    this._yScale = 0.0;

    /**
     * @type {Number}
     * @private
     */
    this._dataChangeCount = 0;

    /**
     * @type {Number}
     * @private
     */
    this._dimensionsChangeCount = 0;

    /**
     * @type {Number}
     * @private
     */
    this._lastAvailableWidth = 0;

    /**
     * @type {Number}
     * @private
     */
    this._lastAvailableHeight = 0;

    /**
     * @type {Boolean}
     * @private
     */
    this._preventDrawing = false;

    /**
     * @type {Array<Function>}
     * @private
     */
    this._nextAnimationFrameHandlers = [];

    /**
     * @type {Number}
     * @private
     */
    this._maxBodyHeight = Infinity;

    /**
     * @type {Array<Number|String>}
     * @protected
     */
    this._frozenUids = [];

    /**
     * @type {Boolean}
     * @private
     */
    this._preventEventEmission = false;

    /**
     * @type {boolean}
     * @private
     */
    this._disabled = false;
};

var D3Table = d3Timeline.D3Table;

inherits(D3Table, EventEmitter);

/**
 * @type {d3Timeline.D3TableOptions}
 */
D3Table.prototype.defaults = {
    bemBlockName: 'table',
    bemBlockModifier: '',
    xAxisHeight: 50,
    yAxisWidth: 50,
    rowHeight: 30,
    rowPadding: 5,
    tickPadding: 20,
    container: 'body',
    cullingX: true,
    cullingY: true,
    cullingDistance: 1,
    renderOnIdle: true,
    hideTicksOnZoom: false,
    hideTicksOnDrag: false,
    panYOnWheel: true,
    wheelMultiplier: 1,
    enableYTransition: true,
    enableTransitionOnExit: true,
    usePreviousDataForTransform: false,
    transitionEasing: 'quad-in-out',
    xAxisTicksFormatter: function(d) {
        return d;
    },
    xAxisStrokeWidth: function(d) {
        return d%2 ? 1 : 2;
    },
    xAxis2TicksFormatter: function(d) {
        return '';
    },
    yAxisFormatter: function(d) {
        return d && d.name || '';
    },
    padding: 10,
    trackedDOMEvents: ['click', 'mousemove', 'touchmove', 'mouseenter', 'mouseleave'] // not dynamic
};

/**
 * @type {number}
 */
D3Table.instancesCount = 0;

/**
 * Noop function, which does nothing
 */
D3Table.prototype.noop = function() {};

/**
 * Initialization method
 *  - create the elements
 *  - instantiate d3 instances
 *  - register listeners
 *
 * Data will be drawn in the inner container
 *
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.initialize = function() {

    // container
    this.container = d3.select(this.options.container).append('svg')
        .attr('class', this.options.bemBlockName + (this.options.bemBlockModifier ? ' ' + this.options.bemBlockName + this.options.bemBlockModifier : ''));


    // defs and clip in defs
    this.elements.defs = this.container.append('defs');

    var clipId = this.options.bemBlockName + '-bodyClipPath--' + D3Table.instancesCount;
    this.elements.clip = this.elements.defs.append('clipPath')
        .property('id', clipId);
    this.elements.clip
        .append('rect');


    // background rect in container
    this.container.append('rect')
        .classed(this.options.bemBlockName + '-backgroundRect', true);


    // axises containers in container
    this.elements.xAxisContainer = this.container.append('g')
        .attr('class', this.options.bemBlockName + '-axis ' + this.options.bemBlockName + '-axis--x');

    this.elements.x2AxisContainer = this.container.append('g')
        .attr('class', this.options.bemBlockName + '-axis ' + this.options.bemBlockName + '-axis--x ' + this.options.bemBlockName + '-axis--secondary');

    this.elements.yAxisContainer = this.container.append('g')
        .attr('class', this.options.bemBlockName + '-axis ' + this.options.bemBlockName + '-axis--y');


    // body in container
    this.elements.body = this.container.append('g')
        .attr('clip-path', 'url(#' + clipId + ')');


    // contact rect, inner container and bounding rect in body
    this.elements.body.append('rect')
        .classed(this.options.bemBlockName + '-contactRect', true);

    this.elements.innerContainer = this.elements.body.append('g');

    this.elements.body.append('rect')
        .classed(this.options.bemBlockName + '-boundingRect', true);


    this.updateMargins();

    this.initializeD3Instances();

    this.initializeEventListeners();

    return this;
};

/**
 * Destroy function, to be called when the instance has to be destroyed
 * @todo ensure no memory leak with this destroy implementation, espacially with dom event listeners
 */
D3Table.prototype.destroy = function() {

    this.emit(this.options.bemBlockName + ':destroy', this);

    // remove behavior listeners
    this.behaviors.zoom.on('zoom', null);

    // remove dom listeners
    this.elements.body.on('.zoom', null);
    this.elements.body.on('click', null);

    this.container.remove();

    // remove references
    this.container = null;
    this.elements = null;
    this.scales = null;
    this.axises = null;
    this.behaviors = null;
    this.data = null;
    this.flattenedData = null;

    this.emit(this.options.bemBlockName + ':destroyed', this);
};

/**
 * Initialize d3 instances (scales, axises, behaviors)
 */
D3Table.prototype.initializeD3Instances = function() {

    var self = this;


    // scales

    this.scales.x = this.xScaleFactory();

    this.scales.y = this.yScaleFactory();


    // axises

    this.axises.x = d3.svg.axis()
        .scale(this.scales.x)
        .orient('top')
        .tickFormat(this.options.xAxisTicksFormatter.bind(this))
        .outerTickSize(0)
        .tickPadding(this.options.tickPadding);

    this.axises.x2 = d3.svg.axis()
        .scale(this.scales.x)
        .orient('top')
        .tickFormat(this.options.xAxis2TicksFormatter.bind(this))
        .outerTickSize(0)
        .innerTickSize(0);

    this.axises.y = d3.svg.axis()
        .scale(this.scales.y)
        .orient('left')
        .tickFormat(function(d) {
            return self.options.yAxisFormatter.call(self, self.data[(d|0)]);
        })
        .outerTickSize(0);


    // behaviors

    this.behaviors.zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on('zoom', this.handleZooming.bind(this))
        .on('zoomend', this.handleZoomingEnd.bind(this));

    this.behaviors.zoomX = d3.behavior.zoom()
        .x(this.scales.x)
        .scale(1)
        .scaleExtent([1, 10]);

    this.behaviors.zoomY = d3.behavior.zoom()
        .y(this.scales.y)
        .scale(1)
        .scaleExtent([1, 1]);

    this.behaviors.pan = d3.behavior.drag()
        .on('drag', this.handleDragging.bind(this));

    this.elements.body.call(this.behaviors.pan);
    this.elements.body.call(this.behaviors.zoom);

    this._lastTranslate = this.behaviors.zoom.translate();
    this._lastScale = this.behaviors.zoom.scale();
};

/**
 * x scale factory
 * @returns {d3.scale.Linear}
 */
D3Table.prototype.xScaleFactory = function() {
    return d3.scale.linear();
};

/**
 * y scale factory
 * @returns {d3.scale.Linear}
 */
D3Table.prototype.yScaleFactory = function() {
    return d3.scale.linear();
};


/**
 * Initialize event listeners for all tracked DOM events
 */
D3Table.prototype.initializeEventListeners = function() {

    var self = this;

    this.options.trackedDOMEvents.forEach(function(eventName) {

        self.elements.body.on(eventName, function() {
            if (eventName !== 'click' || !d3.event.defaultPrevented && d3.select(d3.event.target).classed(self.options.bemBlockName + '-contactRect')) {
                self.emitDetailedEvent(eventName, self.elements.body);
            }
        });

    });

};


/**
 * Pan X/Y & zoom X (clamped pan Y when wheel is pressed without ctrl, zoom X and pan X/Y otherwise)
 */
D3Table.prototype.handleZooming = function() {

    // if not ctrlKey and not touches >= 2
    if (d3.event.sourceEvent && !d3.event.sourceEvent.ctrlKey && !(d3.event.sourceEvent.changedTouches && d3.event.sourceEvent.changedTouches.length >= 2)) {

        // if wheeling, avoid zooming and let the wheeling handler pan
        if (d3.event.sourceEvent.type === 'wheel') {

            if (this.options.panYOnWheel) {
                this.restoreZoom();
                this.handleWheeling();
                return;
            }

        }
        // else avoid zooming and return (the user gesture will be handled by the the pan behavior
        else {
            this.restoreZoom();
            return;
        }
    }

    var translate = this.behaviors.zoom.translate();
    var updatedTranslate = [translate[0], this._lastTranslate[1]];

    updatedTranslate = this._clampTranslationWithScale(updatedTranslate, [this.behaviors.zoom.scale(), this.behaviors.zoomY.scale()]);

    this.behaviors.zoom.translate(updatedTranslate);
    this.behaviors.zoomX.translate(updatedTranslate);
    this.behaviors.zoomX.scale(this.behaviors.zoom.scale());

    this.moveElements(true, false, !this.options.hideTicksOnZoom);

    this._lastTranslate = updatedTranslate;
    this._lastScale = this.behaviors.zoom.scale();

    this.emit(this.options.bemBlockName + ':move');

};

/**
 * Force drawing elements, nullify optimized inner container transform and redraw axises
 */
D3Table.prototype.handleZoomingEnd = function() {

    var self = this;
    this.requestAnimationFrame(function() {
        self.elements.innerContainer.attr('transform', null);
    });

    this.stopElementTransition();
    this.moveElements(true);
    this.drawYAxis();
    this.drawXAxis();
};

/**
 * Clamped pan Y
 */
D3Table.prototype.handleWheeling = function() {

    var event = d3.event.sourceEvent;

    var deltaX = 0, deltaY = 0;

    var movingX = event && event.wheelDeltaX || event.deltaX;

    // if moving x, ignore y and compute x delta
    if (movingX) {

        var movingRight = event.wheelDeltaX > 0 || event.deltaX < 0;
        deltaX = (movingRight ? 1 : -1) * this.columnWidth * this.options.wheelMultiplier;

    }
    // if not moving x
    else {

        var movingY = event.wheelDelta || event.wheelDeltaY || event.detail || event.deltaY;

        // if moving y, compute y delta
        if (movingY) {
            var movingDown = event.wheelDelta > 0 || event.wheelDeltaY > 0 || event.detail < 0 || event.deltaY < 0;
            deltaY = movingY ? (movingDown ? 1 : -1) * this.options.rowHeight * this.options.wheelMultiplier : 0;
        }

    }

    // finally move the elements
    this.move(deltaX, deltaY, false, !movingX, true);

};

/**
 * Directly use event x and y delta to move elements
 */
D3Table.prototype.handleDragging = function() {

    // if more than 2 touches, return
    if (d3.event.sourceEvent.touches && d3.event.sourceEvent.touches.length >= 2) {
        return;
    }

    this.move(d3.event.dx, d3.event.dy, false, false, !this.options.hideTicksOnDrag);
};

/**
 * Restore previous zoom translate and scale thus cancelling the zoom behavior handling
 */
D3Table.prototype.restoreZoom = function() {
    this.behaviors.zoom.translate(this._lastTranslate);
    this.behaviors.zoom.scale(this._lastScale);
};

/**
 * Fire an event event with the given eventName prefixed with the bem block name
 * The following arguments are passed to the listeners:
 *  - ...priorityArguments
 *  - this: the D3Table instance
 *  - d3TargetSelection
 *  - d3.event
 *  - getColumn(): a function to get the x value in data space
 *  - getRow(): a function to get the y value in data space
 *  - ...extraArguments
 *
 * @param {String} eventName
 * @param {d3.Selection} [d3TargetSelection]
 * @param {[Number,Number]} [delta]
 * @param {Array<*>} [priorityArguments]
 * @param {Array<*>} [extraArguments]
 */
D3Table.prototype.emitDetailedEvent = function(eventName, d3TargetSelection, delta, priorityArguments, extraArguments) {

    if (this._preventEventEmission) {
        return;
    }

    var self = this;

    var position;

    var getPosition = function() {
        if (!position) {
            position = d3.mouse(self.elements.body.node());
            if (Array.isArray(delta)) {
                position[0] += delta[0];
                position[1] += delta[1];
            }
        }
        return position;
    };

    var args = [
        this, // the table instance
        d3TargetSelection, // the d3 selection targeted
        d3.event, // the d3 event
        function getColumn() {
            var position = getPosition();
            return self.scales.x.invert(position[0]);
        }, // a column getter
        function getRow() {
            var position = getPosition();
            return self.scales.y.invert(position[1]);
        } // a row getter
    ];

    if (Array.isArray(priorityArguments)) {
        args = priorityArguments.concat(args);
    }

    if (Array.isArray(extraArguments)) {
        args = args.concat(extraArguments);
    }

    args.unshift(this.options.bemBlockName + ':' + eventName); // the event name

    this.emit.apply(this, args);
};

/**
 * Update margins and update transforms
 *
 * @param {Boolean} [updateDimensions] True means it has to update X and Y
 */
D3Table.prototype.updateMargins = function(updateDimensions) {

    this.margin = {
        top: this.options.xAxisHeight + this.options.padding,
        right: this.options.padding,
        bottom: this.options.padding,
        left: this.options.yAxisWidth + this.options.padding
    };

    var contentPosition = { x: this.margin.left, y: this.margin.top };
    var contentTransform = 'translate(' + this.margin.left + ',' + this.margin.top + ')';

    this.container.select('rect.' + this.options.bemBlockName + '-backgroundRect')
        .attr(contentPosition);

    this.elements.body
        .attr('transform', contentTransform);

    this.elements.xAxisContainer
        .attr('transform', contentTransform);

    this.elements.x2AxisContainer
        .attr('transform', contentTransform);

    this.elements.yAxisContainer
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    if (updateDimensions) {
        this.updateXY();
    }

};

/**
 *
 * @param {Array<D3TableRow>} data
 * @param {Number} [transitionDuration]
 * @param {Boolean} [animateY]
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.setData = function(data, transitionDuration, animateY) {

    this._dataChangeCount += 1;

    var isSizeChanging = data.length !== this.data.length;

    this.data = data;

    this.generateFlattenedData();

    if (isSizeChanging || this._dataChangeCount === 1) {
        this
            .updateXY(animateY ? transitionDuration : undefined)
            .updateXAxisInterval()
            .drawXAxis()
            .drawYAxis();
    }

    this.drawElements(transitionDuration);

    return this;
};

/**
 *
 * @param {Date} minX
 * @param {Date} maxX
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.setXRange = function(minX, maxX) {

    this.minX = minX;
    this.maxX = maxX;

    this.scales.x
        .domain([this.minX, this.maxX]);

    this
        .updateX()
        .updateXAxisInterval()
        .drawXAxis()
        .drawYAxis()
        .drawElements();

    return this;
};

/**
 * Set available width and height so that every thing update correspondingly
 *
 * @param {Number} availableWidth
 * @param {Number} availableHeight
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.setAvailableDimensions = function(availableWidth, availableHeight) {

    this._disabled = true;
    var _lastAvailableWidth = this._lastAvailableWidth;
    var _lastAvailableHeight = this._lastAvailableHeight;
    this.setAvailableWidth(availableWidth);
    this.setAvailableHeight(availableHeight);
    this._disabled = false;

    var isAvailableWidthChanging = _lastAvailableWidth !== this._lastAvailableWidth;
    var isAvailableHeightChanging = _lastAvailableHeight !== this._lastAvailableHeight;

    if (isAvailableWidthChanging || isAvailableHeightChanging || this._dimensionsChangeCount === 2) {
        this
            .updateX()
            .updateXAxisInterval()
            .drawXAxis()
            .drawYAxis()
            .drawElements();
    }

    return this;
};

/**
 * Set available width so that every thing update correspondingly
 *
 * @param {Number} availableWidth
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.setAvailableWidth = function(availableWidth) {

    this._dimensionsChangeCount += 1;

    var isAvailableWidthChanging = availableWidth !== this._lastAvailableWidth;
    this._lastAvailableWidth = availableWidth;

    this.dimensions.width = this._lastAvailableWidth - this.margin.left - this.margin.right;

    if (!this._disabled && (isAvailableWidthChanging || this._dimensionsChangeCount === 1)) {
        this
            .updateX()
            .updateXAxisInterval()
            .drawXAxis()
            .drawYAxis()
            .drawElements();
    }

    return this;
};

/**
 * Set available height so that every thing update correspondingly
 *
 * @param {Number} availableHeight
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.setAvailableHeight = function(availableHeight) {

    this._dimensionsChangeCount += 1;

    var isAvailableHeightChanging = availableHeight !== this._lastAvailableHeight;
    this._lastAvailableHeight = availableHeight;

    this._maxBodyHeight = this._lastAvailableHeight - this.margin.top - this.margin.bottom;

    if (!this._disabled && (isAvailableHeightChanging || this._dimensionsChangeCount === 1)) {
        this
            .updateY()
            .drawXAxis()
            .drawYAxis()
            .drawElements();
    }

    return this;
};

/**
 * Update elements which depends on x and y dimensions
 *
 * @param {Number} [transitionDuration]
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.updateXY = function(transitionDuration) {
    this._preventEventEmission = true;
    this.updateX(transitionDuration);
    this._preventEventEmission = false;
    this.updateY(transitionDuration);
    return this;
};

/**
 * Update elements which depends on x dimension
 *
 * @param {Number} [transitionDuration]
 */
D3Table.prototype.updateX = function(transitionDuration) {

    this.scales.x
        .domain([this.minX, this.maxX])
        .range([0, this.dimensions.width]);

    this.axises.y
        .innerTickSize(-this.dimensions.width);

    this.behaviors.zoomX
        .x(this.scales.x)
        .translate(this.behaviors.zoom.translate())
        .scale(this.behaviors.zoom.scale());

    if (!this._preventDrawing) {
        this.container.attr('width', this.dimensions.width + this.margin.left + this.margin.right);
        this.elements.body.select('rect.' + this.options.bemBlockName + '-boundingRect').attr('width', this.dimensions.width);
        this.elements.body.select('rect.' + this.options.bemBlockName + '-contactRect').attr('width', this.dimensions.width);
        this.container.select('rect.' + this.options.bemBlockName + '-backgroundRect').attr('width', this.dimensions.width);
        this.elements.clip.select('rect').attr('width', this.dimensions.width);
    }

    this.emit(this.options.bemBlockName + ':resize', this, this.container, transitionDuration);

    return this;
};

/**
 * Update elements which depends on y dimension
 *
 * @param {Number} [transitionDuration]
 */
D3Table.prototype.updateY = function (transitionDuration) {

    var elementAmount = this.data.length;

    // have 1 more elemnt to force representing one more tick
    var elementsRange = [0, elementAmount];

    // compute new height
    this.dimensions.height = Math.min(this.data.length * this.options.rowHeight, this._maxBodyHeight);

    // compute new Y scale
    this._yScale = this.options.rowHeight / this.dimensions.height * elementAmount;

    // update Y scale, axis and zoom behavior
    this.scales.y.domain(elementsRange).range([0, this.dimensions.height]);

    // y scale has been updated so tell the zoom behavior to apply the previous translate and scale on it
    this.behaviors.zoomY.y(this.scales.y).translate(this._lastTranslate).scale(this._yScale);

    // and update X axis ticks height
    this.axises.x.innerTickSize(-this.dimensions.height);

    if (!this._preventDrawing) {

        var container = this.container;
        var clip = this.elements.clip.select('rect');
        var boundingRect = this.elements.body.select('rect.' + this.options.bemBlockName + '-boundingRect');

        if (transitionDuration) {
            container = container.transition().duration(transitionDuration);
            clip = clip.transition().duration(transitionDuration);
            boundingRect = boundingRect.transition().duration(transitionDuration);
        }

        // update svg height
        container.attr('height', this.dimensions.height + this.margin.top + this.margin.bottom);

        // update inner rect height
        this.elements.body.select('rect.' + this.options.bemBlockName + '-contactRect').attr('height', this.dimensions.height);
        boundingRect.attr('height', this.dimensions.height);
        container.select('rect.' + this.options.bemBlockName + '-backgroundRect').attr('height', this.dimensions.height);
        clip.attr('height', this.dimensions.height);

    }

    this.stopElementTransition();

    this.emit(this.options.bemBlockName + ':resize', this, this.container, transitionDuration);

    return this;
};

/**
 * Update column with, basically the width corresponding to 1 unit in x data dimension
 *
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.updateXAxisInterval = function() {

    this.columnWidth = this.scales.x(1) - this.scales.x(0);

    return this;
};

/**
 * Draw the x axises
 *
 * @param {Number} [transitionDuration]
 * @param {Boolean} [skipTicks] Should not draw tick lines
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.drawXAxis = function(transitionDuration, skipTicks) {

    if (this._preventDrawing) {
        return this;
    }

    this.axises.y
        .innerTickSize(skipTicks ? 0 : -this.dimensions.width);

    var self = this;

    if (this._xAxisAF) {
        this.cancelAnimationFrame(this._xAxisAF);
    }

    this._xAxisAF = this.requestAnimationFrame(function() {

        self.wrapWithAnimation(self.elements.xAxisContainer, transitionDuration)
            .call(self.axises.x)
            .selectAll('line')
            .style({
                'stroke-width': self.options.xAxisStrokeWidth.bind(self)
            });

        self.wrapWithAnimation(self.elements.x2AxisContainer, transitionDuration)
            .call(self.axises.x2)
            .selectAll('text')
            .attr({
                x: self.columnWidth / 2
            })
            .style({
                display: function(d) {
                    return +d === +self.maxX ? 'none' : '';
                }
            });
    });

    return this;
};

/**
 * Draw the y axis
 *
 * @param {Number} [transitionDuration]
 * @param {Boolean} [skipTicks] Should not draw tick lines
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.drawYAxis = function drawYAxis(transitionDuration, skipTicks) {

    if (this._preventDrawing) {
        return this;
    }

    this.axises.x
        .innerTickSize(skipTicks ? 0 : -this.dimensions.height);

    var domainY = this.scales.y.domain();

    this.axises.y
        .tickValues(d3.range(Math.round(domainY[0]), Math.round(domainY[1]), 1));

    var self = this;

    if (this._yAxisAF) {
        this.cancelAnimationFrame(this._yAxisAF);
    }

    this._yAxisAF = this.requestAnimationFrame(function() {

        var container = self.wrapWithAnimation(self.elements.yAxisContainer, transitionDuration);
        container.call(self.axises.y);

        container
            .selectAll('text').attr('y', self.options.rowHeight / 2);

        container
            .selectAll('line').style('display', function(d,i) {
                return i ? '' : 'none';
            });

    });

    return this;
};

/**
 * This clone method does not clone the entities itself
 *
 * @returns {Array<D3TableRow>}
 */
D3Table.prototype.cloneData = function() {

    var self = this;

    return this.data.map(function(d) {

        /**
         * @type {d3Timeline.D3TableRow}
         */
        var res = {};

        for (var key in d) {
            if (d.hasOwnProperty(key)) {
                if (key !== 'elements') {
                    res[key] = d[key];
                } else {
                    res[key] = d[key].map(self.cloneElement.bind(self));
                }
            }
        }

        return res;
    });
};

/**
 * This clone method does not clone the entities itself
 *
 * @returns {Array<D3TableElement>}
 */
D3Table.prototype.cloneFlattenedData = function() {
    return this.flattenedData.map(function(e) {

        /**
         * @type {d3Timeline.D3TableElement}
         */
        var res = {};

        for (var key in e) {
            if (e.hasOwnProperty(key)) {
                res[key] = e[key];
            }
        }

        return res;
    });
};

/**
 * This clone method does not clone the entities itself
 *
 * @returns {d3Timeline.D3TableElement}
 */
D3Table.prototype.cloneElement = function(e) {

    /**
     * @type {d3Timeline.D3TableElement}
     */
    var res = {};

    for (var key in e) {
        if (e.hasOwnProperty(key)) {
            res[key] = e[key];
        }
    }

    return res;
};

/**
 * Get the row holding the provided element (reference equality test)
 *
 * @param {d3Timeline.D3TableElement} element
 * @returns {d3Timeline.D3TableRow}
 */
D3Table.prototype.getElementRow = function(element) {
    return this._find(this.data, function(row) {
        return row.elements.indexOf(element) !== -1;
    });
};

/**
 * Store a clone of the currently bound flattened data
 */
D3Table.prototype.storeFlattenedData = function() {
    this.previousFlattenedData = this.cloneFlattenedData();
};

/**
 * Generate the new set of flattened data, storing previous set if configured so and preserving element flags
 */
D3Table.prototype.generateFlattenedData = function() {

    var self = this;

    if (this.options.usePreviousDataForTransform) {
        this.storeFlattenedData();
    }

    this.flattenedData.length = 0;

    this.data.forEach(function(d, i) {
        d.elements.forEach(function(element) {
            element.rowIndex = i;
            if (self._frozenUids.indexOf(element.uid) !== -1) {
                element._defaultPrevented = true;
            }
            self.flattenedData.push(element);
        });
    });
};

/**
 * Compute the transform string for a given element
 *
 * @param {d3Timeline.D3TableElement} element
 * @returns {string}
 */
D3Table.prototype.getTransformFromData = function(element) {
    return 'translate(' + this.scales.x(this.getDataStart(element)) + ',' + this.scales.y(element.rowIndex) + ')';
};

/**
 * Returns true if the element with the provided bound data should be culled
 *
 * @param {d3Timeline.D3TableElement} data
 * @returns {Boolean}
 */
D3Table.prototype.cullingFilter = function(data) {

    var domainX = this.scales.x.domain();
    var domainXStart = domainX[0];
    var domainXEnd = domainX[domainX.length - 1];

    var domainY = this.scales.y.domain();
    var domainYStart = domainY[0];
    var domainYEnd = domainY[domainY.length - 1];

    return data._defaultPrevented ||
        // NOT x culling AND NOT y culling
        (
            // NOT x culling
            (!this.options.cullingX || !(this.getDataEnd(data) < domainXStart || this.getDataStart(data) > domainXEnd))
            &&
            // NOT y culling
            (!this.options.cullingY || (data.rowIndex >= domainYStart - this.options.cullingDistance && data.rowIndex < domainYEnd + this.options.cullingDistance - 1))
        );
};

/**
 * Get start value of the provided data, used to represent element start
 *
 * @param {d3Timeline.D3TableElement} data
 * @returns {number}
 */
D3Table.prototype.getDataStart = function(data) {
    return +data.start;
};

/**
 * Get end value of the provided data, used to represent element end
 *
 * @param {d3Timeline.D3TableElement} data
 * @returns {number}
 */
D3Table.prototype.getDataEnd = function(data) {
    return +data.end;
};

/**
 * Move the elements with clamping the asked move and returned what it finally did with the asked x and y delta
 *
 * @param {Number} [dx] Asked x move delta
 * @param {Number} [dy] Asked y move delta
 * @param {Boolean} [forceDraw] Should the elements be redrawn instead of translating the inner container
 * @param {Boolean} [skipXAxis] Should the x axis not be redrawn
 * @param {Boolean} [forceTicks] Should the tick lines be drawn
 * @returns {[Number, Number, Number, Number]} Final translate x, final translate y, translate x delta, translate y delta
 */
D3Table.prototype.move = function(dx, dy, forceDraw, skipXAxis, forceTicks) {

    dx = dx || 0;
    dy = dy || 0;

    var currentTranslate = this.behaviors.zoom.translate();
    var updatedT = [currentTranslate[0] + dx, currentTranslate[1] + dy];

    updatedT = this._clampTranslationWithScale(updatedT, [this.behaviors.zoom.scale(), this.behaviors.zoomY.scale()]);

    this.behaviors.zoom.translate(updatedT);
    this.behaviors.zoomX.translate(updatedT);
    this.behaviors.zoomX.scale(this.behaviors.zoom.scale());
    this.behaviors.zoomY.translate(updatedT);

    this.moveElements(forceDraw, skipXAxis, forceTicks);

    this._lastTranslate = updatedT;

    this.emit(this.options.bemBlockName + ':move');

    return updatedT.concat([updatedT[0] - currentTranslate[0], updatedT[1] - currentTranslate[1]]);
};

/**
 * Move elements, switching between drawing methods depending on arguments
 * Basically, it should be used to that is chooses optimized drawing (translating the inner container) is there is no scale change.
 *
 * @param {Boolean} [forceDraw] Force the elements to be drawn without translation optimization
 * @param {Boolean} [skipXAxis] Skip x axis being redrawn (always the case when the scale does not change on move)
 * @param {Boolean} [forceTicks] Force ticks to be redrawn; if false then they will be hidden
 */
D3Table.prototype.moveElements = function(forceDraw, skipXAxis, forceTicks) {

    if (!this.options.renderOnIdle || forceDraw) {
        this.drawElements();
    } else {
        this.translateElements(this.behaviors.zoom.translate(), this._lastTranslate);
    }

    this.drawYAxis(undefined, !forceTicks);

    if (!skipXAxis) {
        this.updateXAxisInterval();
        this.drawXAxis(undefined, !forceTicks);
    }
};

/**
 * Draw elements (entering, exiting, updating)
 *
 * @param {Number} [transitionDuration]
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.drawElements = function(transitionDuration) {

    if (this._preventDrawing) {
        return this;
    }

    this.stopElementTransition();

    var self = this;

    if (this._elementsAF) {
        this.cancelAnimationFrame(this._elementsAF)
    }

    this._elementsAF = this.requestAnimationFrame(function() {


        /**
         * Map of start transform strings for all elements
         *
         * @type {Object<String>}
         */
        var startTransformMap = {};

        /**
         * Map of end transform strings for all elements
         *
         * @type {Object<String>}
         */
        var endTransformMap = {};


        // fill both transform string maps

        if (self.options.usePreviousDataForTransform && transitionDuration > 0) {
            if (self.previousFlattenedData) {
                self.previousFlattenedData.forEach(
                    /**
                     * @param {d3Timeline.D3TableElement} data
                     */
                    function(data) {
                        if (!startTransformMap[data.uid]) {
                            startTransformMap[data.id] = startTransformMap[data.uid] = self.getTransformFromData(data);
                        }
                    });
            }
            if (self.flattenedData) {
                self.flattenedData.forEach(
                    /**
                     * @param {d3Timeline.D3TableElement} data
                     */
                    function(data) {
                        if (!endTransformMap[data.uid]) {
                            endTransformMap[data.id] = endTransformMap[data.uid] = self.getTransformFromData(data);
                        }
                    }
                );
            }
        }

        // filter with culling logic
        var data = self.flattenedData.filter(self.cullingFilter.bind(self));

        var groups = self.elements.innerContainer.selectAll('g.' + self.options.bemBlockName + '-element')
            .data(data, function(d) {
                return d.uid;
            });


        // handle exiting elements

        var exiting = groups.exit();

        if (self.options.enableTransitionOnExit && transitionDuration > 0) {

            exiting.each(
                /**
                 * @param {d3Timeline.D3TableElement} data
                 */
                function(data) {

                    var group = d3.select(this);

                    self.elementExit(group, data);

                    // flag the element as removed
                    data._removed = true;

                    var exitTransform = endTransformMap[data.uid] || endTransformMap[data.id];

                    if (exitTransform) {
                        self.wrapWithAnimation(group, transitionDuration)
                            .attr('transform', exitTransform)
                            .remove();
                    } else {
                        group.remove();
                    }

                    self.emitDetailedEvent('element:remove', group, null, [data]);

                }
            );
        } else {
            exiting
                .remove();
        }


        // handle entering elements

        groups.enter().append('g')
            .attr('class', self.options.bemBlockName + '-element')
            .each(function(data) {
                self.elementEnter(d3.select(this), data);
            });


        // handle all elements existing after entering

        groups.each(
            /**
             * @param {d3Timeline.D3TableElement} data
             */
            function(data) {

                if (data._removed) {
                    return;
                }

                var group = d3.select(this);

                if (data._defaultPrevented) {

                    self.elementUpdate(group, data, transitionDuration);

                    return;
                }

                var isUpdate = data._positioned;

                var newTransform = endTransformMap[data.uid] || endTransformMap[data.id] || self.getTransformFromData(data);

                if (transitionDuration > 0) {

                    var originTransform = startTransformMap[data.uid] || startTransformMap[data.id] || newTransform;
                    var modifiedOriginTransform;

                    if (!isUpdate && self.options.usePreviousDataForTransform) {
                        if (originTransform) {
                            modifiedOriginTransform = originTransform;
                            group.attr('transform', originTransform);
                        }
                    }

                    self.wrapWithAnimation(group, transitionDuration)
                        .attrTween("transform", function() {
                            var originTransform = modifiedOriginTransform || group.attr('transform');
                            if (self.options.enableYTransition) {
                                return d3.interpolateTransform(originTransform, newTransform);
                            } else {
                                var startTransform = d3.transform(originTransform);
                                var endTransform = d3.transform(newTransform);
                                startTransform.translate[1] = endTransform.translate[1];
                                return d3.interpolateTransform(startTransform.toString(), endTransform.toString());
                            }
                        });
                }
                else {
                    group
                        .attr('transform', newTransform);
                }

                data._positioned = true;

                self.elementUpdate(group, data, transitionDuration);

            }
        );

        self.currentElementsGroupTranslate = [0.0, 0.0];
        self.elements.innerContainer.attr('transform', null);

    });

    return this;
};

D3Table.prototype.translateElements = function(translate, previousTranslate) {

    var self = this;

    var tx = translate[0] - previousTranslate[0];
    var ty = translate[1] - previousTranslate[1];

    this.currentElementsGroupTranslate[0] = this.currentElementsGroupTranslate[0] + tx;
    this.currentElementsGroupTranslate[1] = this.currentElementsGroupTranslate[1] + ty;


    if (this._eltsTranslateAF) {
        this.cancelAnimationFrame(this._eltsTranslateAF);
    }

    this._eltsTranslateAF = this.requestAnimationFrame(function() {

        self.elements.innerContainer.attr({
            transform: 'translate(' + self.currentElementsGroupTranslate + ')'
        });

        if (self.elementsTranslate !== self.noop) {
            self.elements.innerContainer
                .selectAll('.' + self.options.bemBlockName + '-element')
                .each(function(d) {
                    self.elementsTranslate(d3.select(this), d);
                });
        }

    });

};

D3Table.prototype.stopElementTransition = function() {
    this.elements.innerContainer.selectAll('g.' + this.options.bemBlockName + '-element').transition();
};

/**
 * @param {d3.Selection} selection
 * @param {d3Timeline.D3TableElement} element
 * @returns {d3.Selection}
 */
D3Table.prototype.elementEnter = function(selection, element) { return selection; };

/**
 * @param {d3.Selection} selection
 * @param {d3Timeline.D3TableElement} element
 * @param {Number} transitionDuration
 * @returns {d3.Selection}
 */
D3Table.prototype.elementUpdate = function(selection, element, transitionDuration) { return selection; };

/**
 * @param {d3.Selection} selection
 * @param {d3Timeline.D3TableElement} element
 * @returns {d3.Selection}
 */
D3Table.prototype.elementExit = function(selection, element) { return selection; };

/**
 * Wrap the selection with a d3 transition if the transition duration is greater than 0
 *
 * @param {d3.Selection} selection
 * @param {Number} [transitionDuration]
 * @returns {d3.Selection|d3.Transition}
 */
D3Table.prototype.wrapWithAnimation = function(selection, transitionDuration) {
    if (transitionDuration > 0) {
        return selection.transition().duration(transitionDuration).ease(this.options.transitionEasing);
    } else {
        return selection;
    }
};

/**
 * Proxy to request animation frames
 * Ensure all listeners register before the next frame are played in the same sequence
 *
 * @param {Function} listener
 * @returns {Function}
 */
D3Table.prototype.requestAnimationFrame = function(listener) {

    var self = this;

    this._nextAnimationFrameHandlers.push(listener);

    if (this._nextAnimationFrameHandlers.length === 1) {
        requestAnimationFrame(function() {
            var g;
            while(g = self._nextAnimationFrameHandlers.shift()) g();
        });
    }

    return listener;
};

/**
 * Proxy to cancel animation frame
 * Remove the listener from the list of functions to be played on next animation frame
 *
 * @param {Function} listener
 */
D3Table.prototype.cancelAnimationFrame = function(listener) {

    var index = this._nextAnimationFrameHandlers.length > 0 ? this._nextAnimationFrameHandlers.indexOf(listener) : -1;

    if (index !== -1) {
        this._nextAnimationFrameHandlers.splice(index, 1);
    }
};

/**
 * Call a move forcing the drawings to fit within scale domains
 *
 * @returns {[Number,Number,Number,Number]}
 */
D3Table.prototype.ensureInDomains = function() {
    return this.move(0, 0, false, false, true);
};

/**
 * Toggle internal drawing prevent flag
 *
 * @param {Boolean} [active] If not provided, it negates the current flag value
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.toggleDrawing = function(active) {

    this._preventDrawing = typeof active === 'boolean' ? !active : !this._preventDrawing;

    return this;
};

/**
 * @see https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/find
 * @type {*|Function}
 * @private
 */
D3Table.prototype._find = function(list, predicate) {
    var length = list.length >>> 0;
    var thisArg = list;
    var value;

    for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
            return value;
        }
    }

    return undefined;
};

/**
 * Clamped provided translation based on dimensions and current provided scales
 *
 * @param {[Number,Number]} translate
 * @param {[Number,Number]} scale
 * @returns {[Number,Number]}
 * @private
 */
D3Table.prototype._clampTranslationWithScale = function(translate, scale) {

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

export default D3Table;
