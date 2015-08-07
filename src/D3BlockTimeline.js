"use strict";

import D3Timeline from './D3Timeline';
import inherits from 'inherits';
import extend from 'extend';

/**
 *
 * @extends {D3Timeline}
 * @constructor
 */
function D3BlockTimeline(options) {
    D3Timeline.call(this, options);
}

inherits(D3BlockTimeline, D3Timeline);

D3BlockTimeline.prototype.defaults = extend(true, {}, D3Timeline.prototype.defaults, {
    clipElement: true,
    clipElementFilter: null
});

D3BlockTimeline.prototype.generateClipPathId = function(d) {
    return  'timeline-elementClipPath_' + this.instanceNumber + '_' + d.id;
};

D3BlockTimeline.prototype.generateClipRectLink = function(d) {
    return  '#' + this.generateClipRectId(d);
};

D3BlockTimeline.prototype.generateClipPathLink = function(d) {
    return  'url(#' + this.generateClipPathId(d) + ')';
};

D3BlockTimeline.prototype.generateClipRectId = function(d) {
    return  'timeline-elementClipRect_' + this.instanceNumber + '_' + d.id;
};

D3BlockTimeline.prototype.elementEnter = function(selection) {

    var self = this;

    var elementHeight = this.options.rowHeight - this.options.rowPadding * 2;

    var rect = selection
        .append('rect')
        .attr('class', 'timeline-elementBackground')
        .attr('height', elementHeight);

    var g = selection
        .append('g')
        .attr('class', 'timeline-elementContent');


    var clipElement = false;

    if (this.options.clipElement) {
        if (typeof this.options.clipElementFilter === 'function') {
            clipElement = !!this.options.clipElementFilter.call(this, selection);
        } else {
            clipElement = true;
        }
    }

    if (clipElement) {

        g
            .attr('clip-path', this.generateClipPathLink.bind(this));

        rect
            .property('id', this.generateClipRectId.bind(this));

        selection.append('clipPath')
            .property('id', this.generateClipPathId.bind(this))
            .append('use')
            .attr('xlink:href', this.generateClipRectLink.bind(this));
    }

    selection.on('click', function(d) {
        if (!d3.event.defaultPrevented) {
            self.emitTimelineEvent('element:click', selection, null, [d]);
        }
    });

    this.bindDragAndDropOnSelection(selection);

};


// @todo clean up
D3BlockTimeline.prototype.bindDragAndDropOnSelection = function(selection) {

    var self = this;

    var transform = null;
    var tx = 0, ty = 0;
    var startX = 0, startY = 0;
    var marginDelta = 30;

    var previousVerticalMove = 0;
    var previousHorizontalMove = 0;
    var verticalMove = 0;
    var horizontalMove = 0;

    var redrawOnMove = true;
    var timerActive = false;

    function storeStart(mousePosition) {
        transform = d3.transform(selection.attr('transform'));
        startX = transform.translate[0];
        startY = transform.translate[1];
        tx = mousePosition[0];
        ty = mousePosition[1];
    }

    function updateFromMousePosition(mousePosition) {

        var dx = mousePosition[0] - tx;
        var dy = mousePosition[1] - ty;

        if (redrawOnMove) {
            storeStart(mousePosition);
        }

        transform.translate[0] = startX + dx;
        transform.translate[1] = startY + dy;

        selection.attr('transform', transform.toString());

    }

    var getPreciseTime = window.performance && typeof performance.now === 'function' ? performance.now.bind(performance) : Date.now.bind(Date);

    var drag = d3.behavior.drag()
        .on('dragstart', function() {

            if (d3.event.sourceEvent) {
                d3.event.sourceEvent.stopPropagation();
            }

            var mousePosition = d3.mouse(self.elements.body.node());

            storeStart(mousePosition);

        })
        .on('drag', function() {

            var mousePosition = d3.mouse(self.elements.body.node());

            previousHorizontalMove = horizontalMove;
            previousVerticalMove = verticalMove;

            horizontalMove = mousePosition[0] > self.dimensions.width - marginDelta ? -1 : mousePosition[0] < marginDelta ? 1 : 0;
            verticalMove = mousePosition[1] > self.dimensions.height - marginDelta ? -1 : mousePosition[1] < marginDelta ? 1 : 0;

            var hasChangedState = previousHorizontalMove !== horizontalMove || previousVerticalMove !== verticalMove;

            if ((horizontalMove || verticalMove) && !timerActive && hasChangedState) {

                var s = getPreciseTime();

                d3.timer(function() {

                    var n = getPreciseTime();
                    var d = n - s;
                    var m = d * 1e-2;

                    var r = self.move(horizontalMove * m, verticalMove * m, redrawOnMove, false, true);

                    if (r[2] || r[3]) {
                        updateFromMousePosition(mousePosition, true);
                    }

                    if (r[2] === 0) {
                        horizontalMove = 0;
                    } else {
                        startX -= horizontalMove * m;
                    }

                    if (r[3] === 0) {
                        verticalMove = 0;
                    } else {
                        startY -= verticalMove * m;
                    }

                    return !verticalMove && !horizontalMove;
                });
            }

            if (!verticalMove && !horizontalMove || !hasChangedState) {

                if (self._dragAF) {
                    self.cancelAnimationFrame(self._dragAF);
                }

                var d = selection.datum();
                d._defaultPrevented = true;

                self._dragAF = self.requestAnimationFrame(function() {

                    updateFromMousePosition(mousePosition);

                });
            }

        })
        .on('dragend', function() {

            self.cancelAnimationFrame(self._dragAF);
            horizontalMove = 0;
            verticalMove = 0;

            var d = selection.datum();

            d._defaultPrevented = false;

            d3.timer.flush();

            var deltaFromTopLeftCorner = d3.mouse(selection.node());
            var halfHeight = self.options.rowHeight / 2;
            self.emitTimelineEvent('element:dragend', selection, [-deltaFromTopLeftCorner[0], -deltaFromTopLeftCorner[1] + halfHeight]);

            self.elements.innerContainer.attr('transform', null);

            self
                .updateY()
                .updateX()
                .updateXAxisInterval()
                .drawXAxis()
                .drawYAxis()
                .drawElements();
        });

    selection.call(drag);

};

D3BlockTimeline.prototype.elementUpdate = function(selection) {

    var self = this;

    selection
        .select('rect.timeline-elementBackground')
        .attr({
            y: this.options.rowPadding,
            width: function(d) {
                return self.scales.x(d.end) - self.scales.x(d.start)
            }
        });

};

D3BlockTimeline.prototype.elementExit = function(selection) {

    selection.on('click', null);

};

export default D3BlockTimeline;
