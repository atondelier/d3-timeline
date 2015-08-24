/**
 * Drag simulation helper
 *
 * @param element
 * @param parent
 * @constructor
 */
function DragSimulator(element, parent) {
    this.element = element;
    this.parent = parent;
    this.center = null;
    this.transitionDuration = 500;
}

DragSimulator.prototype.startEventType = 'mousedown';
DragSimulator.prototype.moveEventType = 'mousemove';
DragSimulator.prototype.stopEventType = 'mouseup';

DragSimulator.prototype.createEvent = function(type, x, y) {
    var evt = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
    evt.initCustomEvent(type, true, true, null);
    evt.pageX = evt.clientX = evt.x = x;
    evt.pageY = evt.clientY = evt.y = y;
    return evt;
};

DragSimulator.prototype.getElementOffset = function(element) {
    if (typeof element.getScreenCTM === 'function') {
        return this.getSVGElementOffset(element);
    }
    var elementBoundingClientRect = element.getBoundingClientRect();
    return {
        x: elementBoundingClientRect.left,
        y: elementBoundingClientRect.top
    };
};

DragSimulator.prototype.getSVGElementOffset = function(element) {
    var elementCTM = element.getScreenCTM();
    return {
        x: elementCTM.e,
        y: elementCTM.f
    };
};

DragSimulator.prototype.getElementPosition = function(element, parent) {
    parent = parent || document.body;
    var elementPosition = this.getElementOffset(element);
    var parentPosition = this.getElementOffset(parent);
    return { x: elementPosition.x - parentPosition.x, y: elementPosition.y - parentPosition.y };
};

DragSimulator.prototype.dispatchAction = function(action, element, x, y) {
    var event = this.createEvent(action, x, y);
    element.dispatchEvent(event);
};

DragSimulator.prototype.start = function() {
    this.center = this.getElementPosition(this.element, this.parent);
    this.dispatchAction(this.startEventType, this.element, this.center.x, this.center.y);
};

DragSimulator.prototype.move = function(dx, dy) {
    this.dispatchAction(this.moveEventType, window, this.center.x + dx, this.center.y + dy);
};

DragSimulator.prototype.stop = function(dx, dy) {
    this.dispatchAction(this.stopEventType, window, this.center.x + dx, this.center.y + dy);
};

DragSimulator.prototype.now = function() {
    return window.performance && typeof performance.now === 'function' ? performance.now() : typeof Date.now === 'function' ? Date.now() : +new Date();
};

DragSimulator.prototype.dragBy = function(dx, dy, cb) {
    var self = this;
    var transitionDuration = this.transitionDuration;

    this.start();

    var s = this.now();

    function step(t) {
        t = t || 0;
        var now = self.now();
        var d = now - s;
        s = now;
        t = t + d / transitionDuration;

        self.move(dx * t, dy * t);

        if (t >= 1) {
            self.move(dx, dy);
            requestAnimationFrame(function() {
                self.stop(dx, dy);
                cb();
            });
        } else {
            requestAnimationFrame(function() {
                step(t);
            });
        }
    }

    requestAnimationFrame(function() {
        step(0);
    });
};

DragSimulator.prototype.dragTo = function(x, y, cb) {
    var elementPosition = this.getElementPosition(this.element, this.parent);
    var dx = x - elementPosition.x;
    var dy = y - elementPosition.y;
    this.dragBy(dx, dy, cb);
};
