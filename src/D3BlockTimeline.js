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
    clipElementFilter: null,
    renderOnAutomaticScrollIdle: true,
    hideTicksOnAutomaticScroll: false,
    automaticScrollSpeedMultiplier: 2e-4,
    automaticScrollMarginDelta: 30
});

D3BlockTimeline.prototype.generateClipPathId = function(d) {
    return  'timeline-elementClipPath_' + this.instanceNumber + '_' + d.uid;
};

D3BlockTimeline.prototype.generateClipRectLink = function(d) {
    return  '#' + this.generateClipRectId(d);
};

D3BlockTimeline.prototype.generateClipPathLink = function(d) {
    return  'url(#' + this.generateClipPathId(d) + ')';
};

D3BlockTimeline.prototype.generateClipRectId = function(d) {
    return  'timeline-elementClipRect_' + this.instanceNumber + '_' + d.uid;
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
    var bodyNode = self.elements.body.node();

    // positions
    var currentTransform = null;
    var dragStartX = 0, dragStartY = 0;
    var elementStartX = 0, elementStartY = 0;
    var dragPosition;

    // movements
    var verticalMove = 0;
    var horizontalMove = 0;
    var verticalSpeed = 0;
    var horizontalSpeed = 0;
    var timerActive = false;
    var needTimerStop = false;

    // reset start position: to call on drag start or when things are redrawn
    function storeStart() {
        currentTransform = d3.transform(selection.attr('transform'));
        elementStartX = currentTransform.translate[0];
        elementStartY = currentTransform.translate[1];
        dragStartX = dragPosition[0];
        dragStartY = dragPosition[1];
    }

    // handle new drag position and move the element
    function updateTransform(forceDraw) {

        var deltaX = dragPosition[0] - dragStartX;
        var deltaY = dragPosition[1] - dragStartY;

        if (forceDraw || !self.options.renderOnIdle) {
            storeStart(dragPosition);
        }

        currentTransform.translate[0] = elementStartX + deltaX;
        currentTransform.translate[1] = elementStartY + deltaY;

        selection.attr('transform', currentTransform.toString());

    }

    // take micro seconds if possible
    var getPreciseTime = window.performance && typeof performance.now === 'function' ? performance.now.bind(performance) : Date.now ? function() {
        return 1000 * Date.now();
    } : function() {
        return +(new Date());
    };

    // handle automatic scroll arguments
    function doAutomaticScroll(timeDelta, forceDraw) {

        // compute deltas based on direction, speed and time delta
        var speedMultiplier = self.options.automaticScrollSpeedMultiplier;
        var deltaX = horizontalMove * horizontalSpeed * timeDelta * speedMultiplier;
        var deltaY = verticalMove * verticalSpeed * timeDelta * speedMultiplier;

        // take group translate cancellation with forced redraw into account, so redefine start
        if (forceDraw) {
            var currentElementsGroupTranslate = self.currentElementsGroupTranslate.slice(0);
            elementStartX += currentElementsGroupTranslate[0];
            elementStartY += currentElementsGroupTranslate[1];
        }

        var realMove = self.move(deltaX, deltaY, forceDraw, false, !self.options.hideTicksOnAutomaticScroll);

        if (realMove[2] || realMove[3]) {
            updateTransform(forceDraw);
        }

        elementStartX -= realMove[2];
        elementStartY -= realMove[3];

        needTimerStop = realMove[2] === 0 && realMove[3] === 0;
    }

    var drag = d3.behavior.drag()
        .on('dragstart', function() {

            if (d3.event.sourceEvent) {
                d3.event.sourceEvent.stopPropagation();
            }

            dragPosition = d3.mouse(bodyNode);

            storeStart();

        })
        .on('drag', function() {

            dragPosition = d3.mouse(bodyNode);

            var marginDelta = self.options.automaticScrollMarginDelta;
            var dRight = marginDelta - (self.dimensions.width - dragPosition[0]);
            var dLeft = marginDelta - dragPosition[0];
            var dBottom = marginDelta - (self.dimensions.height - dragPosition[1]);
            var dTop = marginDelta - dragPosition[1];

            horizontalSpeed = Math.pow(Math.max(dRight, dLeft, marginDelta), 2);
            verticalSpeed = Math.pow(Math.max(dBottom, dTop, marginDelta), 2);

            var previousHorizontalMove = horizontalMove;
            var previousVerticalMove = verticalMove;
            horizontalMove = dRight > 0 ? -1 : dLeft > 0 ? 1 : 0;
            verticalMove = dBottom > 0 ? -1 : dTop > 0 ? 1 : 0;

            var hasChangedState = previousHorizontalMove !== horizontalMove || previousVerticalMove !== verticalMove;

            if ((horizontalMove || verticalMove) && !timerActive && hasChangedState) {

                var timerStartTime = getPreciseTime();

                timerActive = true;

                d3.timer(function() {

                    var currentTime = getPreciseTime();
                    var timeDelta = currentTime - timerStartTime;

                    var timerWillStop = !verticalMove && !horizontalMove || needTimerStop;

                    doAutomaticScroll(timeDelta, self.options.renderOnAutomaticScrollIdle && timerWillStop);

                    timerStartTime = currentTime;

                    if (timerWillStop) {
                        needTimerStop = false;
                        timerActive = false;
                    }

                    return timerWillStop;
                });
            }

            var data = selection.datum();
            data._defaultPrevented = true;

            if (self._dragAF) {
                self.cancelAnimationFrame(self._dragAF);
            }

            self._dragAF = self.requestAnimationFrame(updateTransform);

        })
        .on('dragend', function() {

            self.cancelAnimationFrame(self._dragAF);
            self._dragAF = null;
            horizontalMove = 0;
            verticalMove = 0;

            var data = selection.datum();
            data._defaultPrevented = false;

            d3.timer.flush();

            var deltaFromTopLeftCorner = d3.mouse(selection.node());
            var halfHeight = self.options.rowHeight / 2;
            self.elements.innerContainer.attr('transform', null);

            self.emitTimelineEvent('element:dragend', selection, [-deltaFromTopLeftCorner[0], -deltaFromTopLeftCorner[1] + halfHeight]);

            self
                .updateY()
                .drawYAxis();
        });

    selection.call(drag);

};


D3BlockTimeline.prototype.elementUpdate = function(selection, d, transitionDuration) {

    var self = this;

    this._wrapWithAnimation(selection.select('rect.timeline-elementBackground'), transitionDuration)
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
