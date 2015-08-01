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

    D3Timeline.instancesCount += 1;

    var self = this;

    this.options = $.extend(true, {}, this.defaults, options);

    /** @type {Array<{id: Number, name: String, elements: Array<{ id: Number, start: Date, end: Date}>}>} */
    this.data = [];

    this.margin = {
        top: this.options.xAxisHeight,
        right: 50,
        bottom: 50,
        left: this.options.yAxisWidth
    };
    
    /** @type {Number} */
    this.yScale = 0.0;

    this.dimensions = { width: 0, height: 0 };

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
                return d.getMinutes() % 15 ? '' : '?/?';
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

    this._lastTranslate = this.behaviors.zoom.translate();
    this._lastScale = this.behaviors.zoom.scale();

    this._currentScaleConfig = null;
    this._dataChangeCount = 0;
    this._dimensionsChangeCount = 0;
    this._lastAvailableWidth = 0;
    this._lastAvailableHeight = 0;
    this._preventDrawing = false;
    this._nextAnimationFrameHandlers = [];
    this._currentElementsGroupTranslate = [0.0, 0.0];
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
    container: 'body',
    cullingTolerance: 1,
    renderOnIdle: true,
    flattenRowElements: false, // @todo: make it dynamic
    hideTicksOnZoom: true,
    hideTicksOnDrag: true
};

D3Timeline.instancesCount = 0;

D3Timeline.prototype.initialize = function() {

    // container
    this.container = d3.select(this.options.container).append('svg');

    // defs
    this.elements.defs = this.container.append('defs');

    // clip rect in defs
    var clipId = 'bodyClip' + D3Timeline.instancesCount;
    this.elements.clip = this.elements.defs.append('clipPath')
        .property('id', clipId);
    this.elements.clip
        .append('rect');

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
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
        .attr('clip-path', 'url(#' + clipId + ')');

    // surrounding rect
    this.elements.body.append('rect')
        .classed('contactrect', true);

    // inner container
    this.elements.innerContainer = this.elements.body.append('g');

    // surrounding rect
    this.elements.body.append('rect')
        .classed('boundingrect', true);

    this.elements.body.call(this.behaviors.pan);
    this.elements.body.call(this.behaviors.zoom);

    return this;
};

D3Timeline.prototype.destroy = function() {

    // remove behavior listeners
    this.behaviors.zoom.on('zoom', null);

    // remove dom listeners
    this.elements.body.on('.zoom', null);

    // remove references
    this.container = null;
    this.elements = null;
    this.scales = null;
    this.axises = null;
    this.behaviors = null;
    this.data = null;
    this.flattenedData = null;
};

/**
 * pan X/Y & zoom X handler (clamped pan Y when wheel is pressed without ctrl, zoom X and pan X/Y otherwise)
 */
D3Timeline.prototype.handleZooming = function() {

    if (!d3.event.sourceEvent.ctrlKey && !(d3.event.sourceEvent.changedTouches && d3.event.sourceEvent.changedTouches.length >= 2)) {
        this.behaviors.zoom.translate(this._lastTranslate);
        this.behaviors.zoom.scale(this._lastScale);
        if (d3.event.sourceEvent.type === 'wheel') {
            this.handleWheeling();
        }
        return;
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

};

D3Timeline.prototype.handleZoomingEnd = function() {
    this.elements.innerContainer.attr('transform', '');
    this.stopElementTransition();
    this.moveElements(true);
    this.drawYAxis();
    this.drawXAxis();
};

/**
 * wheel handler (clamped pan Y)
 */
D3Timeline.prototype.handleWheeling = function() {

    var t = this.behaviors.zoom.translate();
    var dy = ((event.wheelDeltaY / 120) || (event.deltaY * -3)) * this.options.rowHeight;
    var updatedT = [t[0], t[1] + dy];

    updatedT = this._clampTranslationWithScale(updatedT, [this.behaviors.zoom.scale(), this.behaviors.zoomY.scale()]);

    this.behaviors.zoom.translate(updatedT);
    this.behaviors.zoomY.translate(updatedT);

    this.moveElements(false, true);

    this._lastTranslate = updatedT;

};

D3Timeline.prototype.handleDragging = function() {

    if (d3.event.sourceEvent.changedTouches && d3.event.sourceEvent.changedTouches.length >= 2) {
        return;
    }

    var t = this.behaviors.zoom.translate();
    var updatedT = [t[0] + d3.event.dx, t[1] + d3.event.dy];

    updatedT = this._clampTranslationWithScale(updatedT, [this.behaviors.zoom.scale(), this.behaviors.zoomY.scale()]);

    this.behaviors.zoom.translate(updatedT);
    this.behaviors.zoomX.translate(updatedT);
    this.behaviors.zoomX.scale(this.behaviors.zoom.scale());
    this.behaviors.zoomY.translate(updatedT);

    this.moveElements(false, false, !this.options.hideTicksOnDrag);

    this._lastTranslate = updatedT;
},

D3Timeline.prototype.toggleDrawing = function(active) {

    this._preventDrawing = typeof active === 'boolean' ? !active : !this._preventDrawing;

    return this;
};

D3Timeline.prototype.setData = function(data, transitionDuration) {

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

    if (this.options.flattenRowElements) {
        this.flattenedData = _(this.data).map(function(d, i) {
            _.each(d.elements, function(e, j) {
                e.rowIndex = i;
            });
            return d.elements;
        }).flatten().value();
    } else {
        this.flattenedData = [];
    }

    this.drawElements(transitionDuration);

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

    this.dimensions.width = availableWidth - this.margin.left - this.margin.right;

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

    this.options.maxBodyHeight = availableHeight - this.margin.top - this.margin.bottom;

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

    this.behaviors.zoomX
        .x(this.scales.x);

    this.elements.body.select('rect.boundingrect').attr('width', this.dimensions.width);
    this.elements.body.select('rect.contactrect').attr('width', this.dimensions.width);
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
    
    var self = this;
    
    if (this._yAxisAF) {
        this.cancelAnimationFrame(this._yAxisAF);
    }

    this._yAxisAF = this.requestAnimationFrame(function() {

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

D3Timeline.prototype.drawElements = function(transitionDuration) {

    if (this._preventDrawing) {
        return this;
    }

    if (this.options.flattenRowElements) {
        return this.drawFlattenedElements(transitionDuration);
    } else {
        return this.drawGroupedElements(transitionDuration);
    }
}

D3Timeline.prototype.drawGroupedElements = function(transitionDuration) {

    var self = this;

    if (this._elementsAF) {
        this.cancelAnimationFrame(this._elementsAF)
    }

    this._elementsAF = this.requestAnimationFrame(function() {

        var domain = self.scales.y.domain();
        var domainStart = domain[0];
        var domainEnd = domain[1];
        var cullingTolerance = self.options.cullingTolerance;

        var g = self.elements.innerContainer.selectAll('g.timelineRow')
            .data(self.data, self._getter('id'));

        g.exit().remove();

        g.enter()
            .append('g')
            .classed('timelineRow', true)
            .attr('transform', self.moveRow.bind(self));

        g.each(function(d,i) {

            var g = d3.select(this);

            var isInBody = i >= domainStart - cullingTolerance && i < domainEnd + cullingTolerance - 1;
            var previousDisplay = g.style('display');

            g.style('display', isInBody ? '' : 'none');

            if (!isInBody) return;

            g
                .attr('transform', self.moveRow.bind(self));

            var sg = g.selectAll('g.timelineElement')
                .data(self._getter('elements'), self._getter('id'));

            sg.exit().remove();

            var enteringSG = sg.enter()
                .append('g')
                .classed('timelineElement', true);

            enteringSG
                .call(self.elementEnter.bind(self))
                .attr('transform', self.moveElement.bind(self));

            var updatingSG = self._wrapWithAnimation(sg, transitionDuration)
                .attr('transform', self.moveElement.bind(self));

            updatingSG
                .call(self.elementUpdate.bind(self))
        });

        self._currentElementsGroupTranslate = [0.0, 0.0];

    });

    return this;
};

D3Timeline.prototype.drawFlattenedElements = function(transitionDuration) {

    var self = this;

    if (this._elementsAF) {
        this.cancelAnimationFrame(this._elementsAF)
    }

    this._elementsAF = this.requestAnimationFrame(function() {

        var domain = self.scales.y.domain();
        var domainStart = domain[0];
        var domainEnd = domain[1];
        var cullingTolerance = self.options.cullingTolerance;

        var g = self.elements.innerContainer.selectAll('g.timelineElement')
            .data(self.flattenedData, self._getter('id'));

        g.exit().remove();

        g.enter().append('g')
            .attr('class', 'timelineElement')

        g.each(function(d) {

            var g = d3.select(this);

            var isInBody = d.rowIndex >= domainStart - cullingTolerance && d.rowIndex < domainEnd + cullingTolerance - 1;
            var previouslyHidden = g.style('display') === 'none';
            var hasPreviousTransform = g.attr('transform') !== null;

            if (isInBody && previouslyHidden) {
                g.style('display', '');
            } else if (!isInBody && !previouslyHidden) {
                g.style('display', 'none');
            }

            if (!isInBody) return;

            var updatingSG;

            if (!hasPreviousTransform) {
                g
                    .call(self.elementEnter.bind(self));
            }

            var newTransform = 'translate(' + self.scales.x(d.start) + ',' + self.scales.y(d.rowIndex) + ')';

            if (transitionDuration > 0 && hasPreviousTransform) {
                updatingSG = self._wrapWithAnimation(g, transitionDuration)
                    .attrTween("transform", function(interpolate) {
                        var startTransform = d3.transform(g.attr('transform'));
                        startTransform.translate[1] = self.scales.y(d.rowIndex);
                        return d3.interpolateTransform(startTransform.toString(), newTransform);
                    });
            } else {
                updatingSG = g
                    .attr('transform', newTransform);
            }

            updatingSG
                .call(self.elementUpdate.bind(self))
        });

        self._currentElementsGroupTranslate = [0.0, 0.0];

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

    var tx = translate[0] - previousTranslate[0];
    var ty = translate[1] - previousTranslate[1];

    this._currentElementsGroupTranslate[0] = this._currentElementsGroupTranslate[0] + tx;
    this._currentElementsGroupTranslate[1] = this._currentElementsGroupTranslate[1] + ty;

    this.elements.innerContainer.attr({
        transform: 'translate('+this._currentElementsGroupTranslate+')'
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

    this.behaviors.zoomY
        .y(this.scales.y)
        .translate(this._lastTranslate)
        .scale(this.yScale);

    this.axises.y
        .ticks(elementsRange[1]);

    // and update X axis ticks height
    this.axises.x
        .innerTickSize(-this.dimensions.height);

    // update svg height
    this.container.attr('height',this.dimensions.height + this.margin.top + this.margin.bottom);

    // update inner rect height
    this.elements.body.select('rect.boundingrect').attr('height', this.dimensions.height);
    this.elements.body.select('rect.contactrect').attr('height', this.dimensions.height);
    this.elements.clip.select('rect').attr('height', this.dimensions.height);

    this.stopElementTransition();

    return this;
};

D3Timeline.prototype.stopElementTransition = function() {
    this.elements.innerContainer.selectAll('g.timelineElement').transition();
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
