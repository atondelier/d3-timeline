"use strict";

import D3Table from './D3Table';
import inherits from 'inherits';
import extend from 'extend';

/**
 *
 * @extends {D3Table}
 * @constructor
 */
function D3BlockTable(options) {
    D3Table.call(this, options);
}

inherits(D3BlockTable, D3Table);

D3BlockTable.prototype.defaults = extend(true, {}, D3Table.prototype.defaults, {
    clipElement: true,
    clipElementFilter: null,
    renderOnAutomaticScrollIdle: true,
    hideTicksOnAutomaticScroll: false,
    automaticScrollSpeedMultiplier: 2e-4,
    automaticScrollMarginDelta: 30,
    appendText: true,
    alignLeft: true,
    alignOnTranslate: true,
    maximumClickDragTime: 100,
    maximumClickDragDistance: 12,
    minimumDragDistance: 5,
    trackedElementDOMEvents: ['click', 'mouseenter', 'mouseleave'] // not dynamic
});

D3BlockTable.prototype.generateClipPathId = function(d) {
    return this.options.bemBlockName + '-elementClipPath_' + this.instanceNumber + '_' + d.uid;
};

D3BlockTable.prototype.generateClipRectLink = function(d) {
    return '#' + this.generateClipRectId(d);
};

D3BlockTable.prototype.generateClipPathLink = function(d) {
    return 'url(#' + this.generateClipPathId(d) + ')';
};

D3BlockTable.prototype.generateClipRectId = function(d) {
    return this.options.bemBlockName + '-elementClipRect_' + this.instanceNumber + '_' + d.uid;
};

D3BlockTable.prototype.elementEnter = function(selection) {

    var self = this;

    var elementHeight = this.options.rowHeight - this.options.rowPadding * 2;

    var rect = selection
        .append('rect')
        .attr('class', this.options.bemBlockName + '-elementBackground')
        .attr('height', elementHeight);

    var g = selection
        .append('g')
        .attr('class', this.options.bemBlockName + '-elementContent');

    g.append('g')
        .attr('class', this.options.bemBlockName + '-elementMovableContent');


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

    this.options.trackedElementDOMEvents.forEach(function(eventName) {
        selection.on(eventName, function(d) {
            if (!d3.event.defaultPrevented) {
                self.emitDetailedEvent('element:' + eventName, selection, null, [d]);
            }
        });
    });

    if (this.options.appendText) {
        selection
            .select('.timeline-elementMovableContent')
            .append('text')
            .classed('timeline-entityLabel', true)
            .attr('dy', this.options.rowHeight/2 + 4);
    }

    selection.call(this.elementContentEnter.bind(this));

    this.bindDragAndDropOnSelection(selection);

};


D3BlockTable.prototype.elementsTranslate = function(selection, d) {

    var self = this;

    if (this.options.appendText && this.options.alignLeft && this.options.alignOnTranslate && !d._defaultPrevented) {

        selection
            .select('.' + this.options.bemBlockName + '-elementMovableContent')
            .attr('transform', function(d) {
                return 'translate(' + Math.max(-self.scales.x(self.getDataStart(d)), 2) + ',0)'
            });
    }

};

D3BlockTable.prototype.elementContentEnter = function() {};

D3BlockTable.prototype.elementContentUpdate = function() {};


// @todo clean up
D3BlockTable.prototype.bindDragAndDropOnSelection = function(selection) {

    var self = this;
    var bodyNode = self.elements.body.node();
    var dragStarted = false;

    // positions
    var currentTransform = null;
    var originTransformString = null;
    var dragStartX = 0, dragStartY = 0;
    var elementStartX = 0, elementStartY = 0;
    var dragPosition;
    var startDragPosition;

    // movements
    var verticalMove = 0;
    var horizontalMove = 0;
    var verticalSpeed = 0;
    var horizontalSpeed = 0;
    var timerActive = false;
    var needTimerStop = false;
    var startTime;

    // reset start position: to call on drag start or when things are redrawn
    function storeStart() {
        currentTransform = d3.transform(originTransformString = selection.attr('transform'));
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
    var getPreciseTime = window.performance && typeof performance.now === 'function' ?
        performance.now.bind(performance)
        : typeof Date.now === 'function' ?
            Date.now.bind(Date)
            : function() {
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
        .on('dragstart', function(data) {

            if (d3.event.sourceEvent) {
                d3.event.sourceEvent.stopPropagation();
            }

            startDragPosition = dragPosition = d3.mouse(bodyNode);

            startTime = +new Date();

            storeStart();

            data._defaultPrevented = true;
            self._frozenUids.push(data.uid);

        })
        .on('drag', function(data) {

            dragPosition = d3.mouse(bodyNode);

            if (!dragStarted) {

                var timeDelta = +new Date() - startTime;
                var totalDeltaX = dragPosition[0] - startDragPosition[0];
                var totalDeltaY = dragPosition[1] - startDragPosition[1];
                var dragDistance = Math.sqrt(totalDeltaX*totalDeltaX+totalDeltaY*totalDeltaY);

                dragStarted = (timeDelta > self.options.maximumClickDragTime || dragDistance > self.options.maximumClickDragDistance) && dragDistance > self.options.minimumDragDistance;

                if (dragStarted) {
                    self.emitDetailedEvent('element:dragstart', selection, null, [data]);
                }
            }

            if (dragStarted) {
                self.emitDetailedEvent('element:drag', selection, null, [data]);
            }

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

            if (self._dragAF) {
                self.cancelAnimationFrame(self._dragAF);
            }

            self._dragAF = self.requestAnimationFrame(updateTransform);

        })
        .on('dragend', function(data) {

            self.cancelAnimationFrame(self._dragAF);
            self._dragAF = null;
            horizontalMove = 0;
            verticalMove = 0;

            data._defaultPrevented = false;
            self._frozenUids.splice(self._frozenUids.indexOf(data.uid), 1);

            d3.timer.flush();

            var deltaFromTopLeftCorner = d3.mouse(selection.node());
            var halfHeight = self.options.rowHeight / 2;
            self.elements.innerContainer.attr('transform', null);

            if (dragStarted) {
                self.emitDetailedEvent('element:dragend', selection, [-deltaFromTopLeftCorner[0], -deltaFromTopLeftCorner[1] + halfHeight], [data]);
            } else {
                selection.attr('transform', originTransformString);
            }

            self
                .updateY()
                .drawYAxis();

            dragStarted = false;
        });

    selection.call(drag);

};


D3BlockTable.prototype.elementUpdate = function(selection, d, transitionDuration) {

    var self = this;

    this.wrapWithAnimation(selection.select('.' + this.options.bemBlockName + '-elementBackground'), transitionDuration)
        .attr({
            y: this.options.rowPadding,
            width: function(d) {
                return self.scales.x(self.getDataEnd(d)) - self.scales.x(self.getDataStart(d))
            }
        });

    if (this.options.appendText && this.options.alignLeft && !d._defaultPrevented) {

        selection
            .select('.' + this.options.bemBlockName + '-elementMovableContent')
            .attr('transform', d => 'translate(' + Math.max(-this.scales.x(this.getDataStart(d)), 2) + ',0)');
    }

    selection.call(function() {
        self.elementContentUpdate(selection, d, transitionDuration);
    });

};

D3BlockTable.prototype.elementExit = function(selection) {

    selection.on('click', null);

};

export default D3BlockTable;
