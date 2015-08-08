/* global cancelAnimationFrame, requestAnimationFrame */

"use strict";

import extend from 'extend';
import inherits from 'inherits';
import EventEmitter from 'events/events';
import d3 from 'd3';

/**
 * @typedef {{xAxisHeight: number, yAxisWidth: number, rowHeight: number, rowPadding: number, axisConfigs: *[], container: string}} D3TimelineOptions
 */

/**
 *
 * @param {D3TimelineOptions} options
 * @constructor
 */
function D3Timeline(options) {

    EventEmitter.call(this);

    D3Timeline.instancesCount += 1;

    this.instanceNumber = D3Timeline.instancesCount;

    var self = this;

    this.options = extend(true, {}, this.defaults, options);

    /** @type {Array<{id: Number, name: String, elements: Array<{ id: Number, start: Date, end: Date}>}>} */
    this.data = [];
    this.flattenedData = [];

    this.margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    this.dimensions = { width: 0, height: 0 };

    this.currentElementsGroupTranslate = [0.0, 0.0];

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
            .tickFormat(this.options.xAxisTicksFormatter)
            .outerTickSize(0)
            .tickPadding(20),

        x2: d3.svg.axis()
            .scale(this.scales.x)
            .orient('top')
            .tickFormat(this.options.xAxis2TicksFormatter)
            .outerTickSize(0)
            .innerTickSize(0),

        y: d3.svg.axis()
            .scale(this.scales.y)
            .orient('left')
            .tickFormat(function(d) {
                if (self._isRound(d)) {
                    return self.options.yAxisFormatter(self.data[(d|0)]);
                } else {
                    return '';
                }
            })
            .outerTickSize(0)
    };

    this.behaviors = {
        zoom: d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on('zoom', this.handleZooming.bind(this))
            .on('zoomend', this.handleZoomingEnd.bind(this)),
        zoomX: d3.behavior.zoom()
            .x(this.scales.x)
            .scale(1)
            .scaleExtent([1, 10]),
        zoomY: d3.behavior.zoom()
            .y(this.scales.y)
            .scale(1)
            .scaleExtent([1, 1]),
        pan: d3.behavior.drag()
            .on('drag', this.handleDragging.bind(this))
    };

    this._yScale = 0.0;

    this._lastTranslate = this.behaviors.zoom.translate();
    this._lastScale = this.behaviors.zoom.scale();

    this._currentScaleConfig = null;
    this._dataChangeCount = 0;
    this._dimensionsChangeCount = 0;
    this._lastAvailableWidth = 0;
    this._lastAvailableHeight = 0;
    this._preventDrawing = false;
    this._nextAnimationFrameHandlers = [];
    this._maxBodyHeight = Infinity;
}

inherits(D3Timeline, EventEmitter);


/**
 * Default options
 *
 * @type {D3TimelineOptions}
 */
D3Timeline.prototype.defaults = {
    xAxisHeight: 50,
    yAxisWidth: 50,
    rowHeight: 30,
    rowPadding: 5,
    axisConfigs: [
        { threshold: 2, minutes: 30 },
        { threshold: 4, minutes: 15 },
        { threshold: 10, minutes: 5 }
    ],
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
    usePreviousDataForTransform: true,
    transitionEasing: 'quad-in-out',
    xAxisTicksFormatter: function(d) {
        return d.getMinutes() % 15 ? '' : d3.time.format('%H:%M')(d);
    },
    xAxis2TicksFormatter: function(d) {
        return '';
    },
    yAxisFormatter: function(d) {
        return d && d.name || '';
    },
    padding: 10,
    trackedDOMEvents: ['click', 'mousemove', 'mouseenter', 'mouseleave'] // not dynamic
};

D3Timeline.instancesCount = 0;

D3Timeline.prototype.noop = function() {};

D3Timeline.prototype.initialize = function() {

    // container
    this.container = d3.select(this.options.container).append('svg')
        .attr('class', 'timeline');

    // defs
    this.elements.defs = this.container.append('defs');

    // clip rect in defs
    var clipId = 'timelineBodyClipPath_' + D3Timeline.instancesCount;
    this.elements.clip = this.elements.defs.append('clipPath')
        .property('id', clipId);
    this.elements.clip
        .append('rect');


    // surrounding rect
    this.container.append('rect')
        .classed('timeline-backgroundRect', true);

    // axises containers
    this.elements.xAxisContainer = this.container.append('g')
        .attr('class', 'timeline-axis timeline-axis--x');

    this.elements.x2AxisContainer = this.container.append('g')
        .attr('class', 'timeline-axis timeline-axis--x timeline-axis--secondary');

    this.elements.yAxisContainer = this.container.append('g')
        .attr('class', 'timeline-axis timeline-axis--y');

    // body container inner container and surrounding rect
    this.elements.body = this.container.append('g')
        .attr('clip-path', 'url(#' + clipId + ')');

    // surrounding rect
    this.elements.body.append('rect')
        .classed('timeline-contactRect', true);

    // inner container
    this.elements.innerContainer = this.elements.body.append('g');

    // surrounding rect
    this.elements.body.append('rect')
        .classed('timeline-boundingRect', true);

    this.updateMargins();

    this.elements.body.call(this.behaviors.pan);
    this.elements.body.call(this.behaviors.zoom);

    this.initializeEventListeners();

    return this;
};

D3Timeline.prototype.initializeEventListeners = function() {

    var self = this;

    this.options.trackedDOMEvents.forEach(function(eventName) {
        self.elements.body.on(eventName, function() {
            if (eventName !== 'click' || !d3.event.defaultPrevented && d3.select(d3.event.target).classed('timeline-contactRect')) {
                self.emitTimelineEvent(eventName, self.elements.body);
            }
        });
    });

};

D3Timeline.prototype.emitTimelineEvent = function(eventName, d3TargetSelection, delta, priorityArguments) {

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
        this, // the timeline instance
        d3TargetSelection, // the d3 selection targeted
        d3.event, // the d3 event
        function getTime() {
            var position = getPosition();
            return self.scales.x.invert(position[0]);
        }, // a time getter
        function getRow() {
            var position = getPosition();
            return self.data[self.scales.y.invert(position[1]) >> 0];
        } // a row getter
    ];

    if (Array.isArray(priorityArguments)) {
        args = priorityArguments.concat(args);
    }

    args.unshift('timeline:' + eventName); // the event name

    this.emit.apply(this, args);
};

D3Timeline.prototype.updateMargins = function(updateDimensions) {

    this.margin = {
        top: this.options.xAxisHeight + this.options.padding,
        right: this.options.padding,
        bottom: this.options.padding,
        left: this.options.yAxisWidth + this.options.padding
    };

    var contentPosition = { x: this.margin.left, y: this.margin.top };
    var contentTransform = 'translate(' + this.margin.left + ',' + this.margin.top + ')';

    this.container.select('rect.timeline-backgroundRect')
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
        this.updateX();
        this.updateY();
    }

};

D3Timeline.prototype.destroy = function() {

    // remove behavior listeners
    this.behaviors.zoom.on('zoom', null);

    // remove dom listeners
    this.elements.body.on('.zoom', null);
    this.elements.body.on('click', null);

    // remove references
    this.container = null;
    this.elements = null;
    this.scales = null;
    this.axises = null;
    this.behaviors = null;
    this.data = null;
    this.flattenedData = null;
};

D3Timeline.prototype.restoreZoom = function() {
    this.behaviors.zoom.translate(this._lastTranslate);
    this.behaviors.zoom.scale(this._lastScale);
};

D3Timeline.prototype.move = function(dx, dy, forceDraw, skipXAxis, forceTicks) {

    var currentTranslate = this.behaviors.zoom.translate();
    var updatedT = [currentTranslate[0] + dx, currentTranslate[1] + dy];

    updatedT = this._clampTranslationWithScale(updatedT, [this.behaviors.zoom.scale(), this.behaviors.zoomY.scale()]);

    this.behaviors.zoom.translate(updatedT);
    this.behaviors.zoomX.translate(updatedT);
    this.behaviors.zoomX.scale(this.behaviors.zoom.scale());
    this.behaviors.zoomY.translate(updatedT);

    this.moveElements(forceDraw, skipXAxis, forceTicks);

    this._lastTranslate = updatedT;

    this.emit('timeline:move');

    return updatedT.concat([updatedT[0] - currentTranslate[0], updatedT[1] - currentTranslate[1]]);
};

D3Timeline.prototype.ensureInDomains = function() {
    return this.move(0, 0, false, false, true);
};

/**
 * pan X/Y & zoom X handler (clamped pan Y when wheel is pressed without ctrl, zoom X and pan X/Y otherwise)
 */
D3Timeline.prototype.handleZooming = function() {

    if (d3.event.sourceEvent && !d3.event.sourceEvent.ctrlKey && !(d3.event.sourceEvent.changedTouches && d3.event.sourceEvent.changedTouches.length >= 2)) {
        if (d3.event.sourceEvent.type === 'wheel') {
            if (this.options.panYOnWheel) {
                this.restoreZoom();
                this.handleWheeling();
                return;
            }
        } else {
            this.restoreZoom();
            return;
        }
    }

    var t = this.behaviors.zoom.translate();
    var updatedT = [t[0], this._lastTranslate[1]];

    updatedT = this._clampTranslationWithScale(updatedT, [this.behaviors.zoom.scale(), this.behaviors.zoomY.scale()]);

    this.behaviors.zoom.translate(updatedT);
    this.behaviors.zoomX.translate(updatedT);
    this.behaviors.zoomX.scale(this.behaviors.zoom.scale());

    this.moveElements(true, false, !this.options.hideTicksOnZoom);

    this._lastTranslate = updatedT;
    this._lastScale = this.behaviors.zoom.scale();

    this.emit('timeline:move');

};

D3Timeline.prototype.handleZoomingEnd = function() {

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
 * wheel handler (clamped pan Y)
 */
D3Timeline.prototype.handleWheeling = function() {

    var event = d3.event.sourceEvent;

    var dx = 0, dy = 0;

    var movingX = event && event.wheelDeltaX || event.deltaX;

    if (movingX) {

        var movingRight = event.wheelDeltaX > 0 || event.deltaX < 0;
        dx = (movingRight ? 1 : -1) * this.columnWidth * this.options.wheelMultiplier;

    } else {

        var movingY = event.wheelDelta || event.wheelDeltaY || event.detail || event.deltaY;

        if (movingY) {
            var movingDown = event.wheelDelta > 0 || event.wheelDeltaY > 0 || event.detail < 0 || event.deltaY < 0;
            dy = movingY ? (movingDown ? 1 : -1) * this.options.rowHeight * this.options.wheelMultiplier : 0;
        }

    }

    this.move(dx, dy, false, !movingX);

};

D3Timeline.prototype.handleDragging = function() {

    if (d3.event.sourceEvent.changedTouches && d3.event.sourceEvent.touches.length >= 2) {
        return;
    }

    this.move(d3.event.dx, d3.event.dy, false, false, !this.options.hideTicksOnDrag);
};

D3Timeline.prototype.toggleDrawing = function(active) {

    this._preventDrawing = typeof active === 'boolean' ? !active : !this._preventDrawing;

    return this;
};

/**
 *
 * @param {Array<{id: Number, name: String, elements: Array<{ id: Number, start: Date, end: Date}>}>} data
 * @param {Number} [transitionDuration]
 * @returns {D3Timeline}
 */
D3Timeline.prototype.setData = function(data, transitionDuration) {

    this._dataChangeCount += 1;

    var isSizeChanging = data.length !== this.data.length;

    this.data = data;

    this.generateFlattenedData();

    if (isSizeChanging || this._dataChangeCount === 1) {
        this
            .updateXAxisInterval()
            .updateY()
            .drawXAxis()
            .drawYAxis();
    }

    this.drawElements(transitionDuration);

    return this;
};

D3Timeline.prototype.generateFlattenedData = function() {

    var self = this;

    if (this.options.usePreviousDataForTransform) {
        this.previousFlattenedData = this.flattenedData.slice(0);
    }

    this.flattenedData.length = 0;

    this.data.forEach(function(d, i) {
        d.elements.forEach(function(e) {
            e.rowIndex = i;
            e.parentId = e.parentId !== undefined && e.parentId !== null ? e.parentId : d.id;
            self.flattenedData.push(e);
        });
    });
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

    this.scales.x
        .domain([this.minDate, this.maxDate]);

    this
        .updateX()
        .updateXAxisInterval()
        .drawXAxis()
        .drawYAxis()
        .drawElements();

    return this;
};

D3Timeline.prototype.setAvailableWidth = function(availableWidth) {

    this._dimensionsChangeCount += 1;

    var isAvailableWidthChanging = availableWidth !== this._lastAvailableWidth;
    this._lastAvailableWidth = availableWidth;

    this.dimensions.width = this._lastAvailableWidth - this.margin.left - this.margin.right;

    if (isAvailableWidthChanging || this._dimensionsChangeCount === 1) {
        this
            .updateX()
            .updateXAxisInterval()
            .drawXAxis()
            .drawYAxis()
            .drawElements()
    }

    this.emit('timeline:resize');

    return this;
};

D3Timeline.prototype.setAvailableHeight = function(availableHeight) {

    this._dimensionsChangeCount += 1;

    var isAvailableHeightChanging = availableHeight !== this._lastAvailableHeight;
    this._lastAvailableHeight = availableHeight;

    this._maxBodyHeight = this._lastAvailableHeight - this.margin.top - this.margin.bottom;

    if (isAvailableHeightChanging || this._dimensionsChangeCount === 1) {
        this
            .updateY()
            .drawXAxis()
            .drawYAxis()
            .drawElements()
    }

    this.emit('timeline:resize');

    return this;
};

D3Timeline.prototype.updateX = function() {

    this.container.attr('width', this.dimensions.width + this.margin.left + this.margin.right);

    this.scales.x
        .domain([this.minDate, this.maxDate])
        .range([0, this.dimensions.width]);

    this.axises.y
        .innerTickSize(-this.dimensions.width);

    this.behaviors.zoomX
        .x(this.scales.x)
        .translate(this.behaviors.zoom.translate())
        .scale(this.behaviors.zoom.scale());

    this.elements.body.select('rect.timeline-boundingRect').attr('width', this.dimensions.width);
    this.elements.body.select('rect.timeline-contactRect').attr('width', this.dimensions.width);
    this.container.select('rect.timeline-backgroundRect').attr('width', this.dimensions.width);
    this.elements.clip.select('rect').attr('width', this.dimensions.width);

    return this;
};

D3Timeline.prototype.requestAnimationFrame = function(f) {

    var self = this;

    this._nextAnimationFrameHandlers.push(f);

    if (this._nextAnimationFrameHandlers.length === 1) {
        requestAnimationFrame(function() {
            var g;
            while(g = self._nextAnimationFrameHandlers.shift()) g();
        });
    }

    return f;
};

D3Timeline.prototype.cancelAnimationFrame = function(f) {

    var index = this._nextAnimationFrameHandlers.length > 0 ? this._nextAnimationFrameHandlers.indexOf(f) : -1;

    if (index !== -1) {
        this._nextAnimationFrameHandlers.splice(index, 1);
    }
};

D3Timeline.prototype.drawXAxis = function(transitionDuration, skipTicks) {

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
                    return +d === +self.maxDate ? 'none' : '';
                }
            });
    });

    return this;
};

D3Timeline.prototype.drawYAxis = function drawYAxis(transitionDuration, skipTicks) {

    if (this._preventDrawing) {
        return this;
    }

    this.axises.x
        .innerTickSize(skipTicks ? 0 : -this.dimensions.height);

    var domainY = this.scales.y.domain();

    this.axises.y
        .tickValues(this._range(Math.round(domainY[0]), Math.round(domainY[1]), 1));

    var self = this;

    if (this._yAxisAF) {
        this.cancelAnimationFrame(this._yAxisAF);
    }

    this._yAxisAF = this.requestAnimationFrame(function() {

        var container = self._wrapWithAnimation(self.elements.yAxisContainer, transitionDuration);
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

D3Timeline.prototype.getTransformFromData = function(d) {
    return 'translate(' + this.scales.x(d.start) + ',' + this.scales.y(d.rowIndex) + ')';
};

D3Timeline.prototype.drawElements = function(transitionDuration) {

    if (this._preventDrawing) {
        return this;
    }

    this.stopElementTransition();

    var self = this;

    if (this._elementsAF) {
        this.cancelAnimationFrame(this._elementsAF)
    }

    var enableYTransition = this.options.enableYTransition;

    this._elementsAF = this.requestAnimationFrame(function() {

        var domainX = self.scales.x.domain();
        var domainXStart = domainX[0];
        var domainXEnd = domainX[domainX.length - 1];

        var domainY = self.scales.y.domain();
        var domainYStart = domainY[0];
        var domainYEnd = domainY[domainY.length - 1];

        var cullingDistance = self.options.cullingDistance;
        var cullingX = self.options.cullingX;
        var cullingY = self.options.cullingY;


        var transformMap = {};

        if (self.options.usePreviousDataForTransform && self.previousFlattenedData && transitionDuration > 0) {
            self.previousFlattenedData.forEach(function(d) {
                if (!transformMap[d.uid] || !transformMap[d.id]) {
                    transformMap[d.id] = transformMap[d.uid] = self.getTransformFromData(d);
                }
            });
        }

        var transformMap2 = {};

        if (self.options.usePreviousDataForTransform && self.flattenedData) {
            self.flattenedData.forEach(function(d) {
                if (!transformMap2[d.uid] || !transformMap2[d.id]) {
                    transformMap2[d.id] = transformMap2[d.uid] = self.getTransformFromData(d);
                }
            });
        }

        var data = self.flattenedData.filter(function(d) {
            return d._defaultPrevented || (!cullingY || (d.rowIndex >= domainYStart - cullingDistance && d.rowIndex < domainYEnd + cullingDistance - 1))
                && (!cullingX || !(d.end < domainXStart || d.start > domainXEnd));
        });


        var g = self.elements.innerContainer.selectAll('g.timeline-element')
            .data(data, function(d) {
                return d.uid;
            });

        var exiting = g.exit();

        if (self.options.enableTransitionOnExit && transitionDuration > 0) {
            exiting
                .call(self.elementExit.bind(self));

            self._wrapWithAnimation(exiting, transitionDuration)
                .attr('transform', function(d) { return transformMap2[d.uid] || transformMap2[d.id]; })
                .remove();
        } else {
            exiting
                .remove();
        }

        g.enter().append('g')
            .attr('class', 'timeline-element')
            .each(function() {
                d3.select(this).call(self.elementEnter.bind(self));
            });

        g.each(function(d) {

            var g = d3.select(this);

            if (d._defaultPrevented) {

                self.elementUpdate(g, d, transitionDuration);

                return;
            }

            var hasPreviousTransform = g.attr('transform') !== null;

            if (!hasPreviousTransform) {
                g
                    ;
            }

            var newTransform = transformMap2[d.uid];

            if (transitionDuration > 0) {
                if (!hasPreviousTransform && self.options.usePreviousDataForTransform) {
                    var originTransform = transformMap[d.uid] || transformMap[d.id];
                    if (originTransform) {
                        g.attr('transform', originTransform);
                    }
                }

                self._wrapWithAnimation(g, transitionDuration)
                    .attrTween("transform", function() {
                        var startTransform = d3.transform(g.attr('transform'));
                        if (!enableYTransition) {
                            startTransform.translate[1] = self.scales.y(d.rowIndex);
                        }
                        return d3.interpolateTransform(startTransform.toString(), newTransform);
                    });
            }
            else {
                g
                    .attr('transform', newTransform);
            }

            self.elementUpdate(g, d, transitionDuration);

        });

        self.currentElementsGroupTranslate = [0.0, 0.0];
        self.elements.innerContainer.attr('transform', null);

    });

    return this;
};

D3Timeline.prototype.moveElements = function(forceDraw, skipXAxis, forceTicks) {

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

D3Timeline.prototype.translateElements = function(translate, previousTranslate) {

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
                .selectAll('.timeline-element')
                .call(self.elementsTranslate.bind(self));
        }

    });

};

D3Timeline.prototype.moveRow = function(d) {
    return 'translate(0, ' + this.scales.y(this.data.indexOf(d)) + ')';
};

D3Timeline.prototype.moveElement = function(d) {
    return 'translate(' + this.scales.x(d.start) + ',0)';
};

D3Timeline.prototype.updateXAxisInterval = function() {

    var scale = this.behaviors.zoom.scale();

    var conf = this._currentScaleConfig = this._find(this.options.axisConfigs, function(params) {
        var threshold = params.threshold;
        return scale <= threshold;
    });

    this.axises.x.ticks(d3.time.minutes, conf.minutes);

    this.columnWidth = this.scales.x(new Date(0, 0, 0, 0, Math.max(15, this._currentScaleConfig.minutes, 0))) - this.scales.x(new Date(0, 0, 0, 0, 0, 0));

    return this;
};

D3Timeline.prototype.updateY = function() {

    var elementAmount = this.data.length;

    // have 1 more elemnt to force representing one more tick
    var elementsRange = [0, elementAmount];

    // compute new height
    this.dimensions.height = Math.min(this.data.length * 30, this._maxBodyHeight);

    // compute new Y scale
    this._yScale = this.options.rowHeight / this.dimensions.height * elementAmount;

    // update Y scale, axis and zoom behavior
    this.scales.y
        .domain(elementsRange)
        .range([0, this.dimensions.height]);

    this.behaviors.zoomY
        .y(this.scales.y)
        .translate(this._lastTranslate)
        .scale(this._yScale);

    // and update X axis ticks height
    this.axises.x
        .innerTickSize(-this.dimensions.height);

    // update svg height
    this.container.attr('height',this.dimensions.height + this.margin.top + this.margin.bottom);

    // update inner rect height
    this.elements.body.select('rect.timeline-boundingRect').attr('height', this.dimensions.height);
    this.elements.body.select('rect.timeline-contactRect').attr('height', this.dimensions.height);
    this.container.select('rect.timeline-backgroundRect').attr('height', this.dimensions.height);
    this.elements.clip.select('rect').attr('height', this.dimensions.height);

    this.stopElementTransition();

    return this;
};

D3Timeline.prototype.stopElementTransition = function() {
    this.elements.innerContainer.selectAll('g.timeline-element').transition()
        .style('opacity', '');
};

D3Timeline.prototype.elementEnter = function(selection) { return selection; };

D3Timeline.prototype.elementUpdate = function(selection) { return selection; };

D3Timeline.prototype.elementExit = function(selection) { return selection; };

D3Timeline.prototype._wrapWithAnimation = function(selection, transitionDuration) {
    if (transitionDuration > 0) {
        return selection.transition().duration(transitionDuration).ease(this.options.transitionEasing);
    } else {
        return selection;
    }
};

D3Timeline.prototype._getter = function(prop) {
    return function(d) { return d[prop]; };
};

D3Timeline.prototype._isRound = function(v) {
    var n = v|0;
    return v > n - 1e-3 && v < n + 1e-3;
};

D3Timeline.prototype._range = function(start, end, inc) {
    var res = [];
    while (start < end) {
        res.push(start);
        start = start + inc;
    }
    return res;
};

/**
 * @see https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/find
 * @type {*|Function}
 * @private
 */
D3Timeline.prototype._find = function(list, predicate) {
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
