/**
 * Drag simulation helper
 *
 * @param element
 * @param container
 * @constructor
 */
function EventSimulator(element, container) {
    this.element = element;
    this.container = container;
}

EventSimulator.prototype.createEvent = function(type, x, y) {
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(type, true, true, null);
    evt.pageX = evt.clientX = x;
    evt.pageY = evt.clientY = y;
    return evt;
};

EventSimulator.prototype.getElementOffset = function(element) {
    if (typeof element.getScreenCTM === 'function') {
        return this.getSVGElementOffset(element);
    }
    var elementBoundingClientRect = element.getBoundingClientRect();
    return {
        x: elementBoundingClientRect.left,
        y: elementBoundingClientRect.top
    };
};

EventSimulator.prototype.getSVGElementOffset = function(element) {
    var elementCTM = element.getScreenCTM();
    var elementBBox = element.tagName === 'svg' ? {x:0, y:0} : element.getBBox();
    return {
        x: elementCTM.e + elementBBox.x,
        y: elementCTM.f + elementBBox.y
    };
};

EventSimulator.prototype.getElementPosition = function(element, container) {
    container = container || document.body;
    var elementPosition = this.getElementOffset(element);
    var containerPosition = this.getElementOffset(container);
    return { x: elementPosition.x - containerPosition.x, y: elementPosition.y - containerPosition.y };
};

EventSimulator.prototype.dispatchAction = function(action, element, x, y) {
    element = element || this.element;
    var event = this.createEvent(action, x, y);
    element.dispatchEvent(event);
};

EventSimulator.prototype.dispatchActionOnElement = function(action, element) {
    element = element || this.element;
    var position = this.getElementPosition(this.element, this.container);
    this.dispatchAction(action, element, position.x, position.y);
    return position;
};

EventSimulator.prototype.now = function() {
    return window.performance && typeof performance.now === 'function' ? performance.now() : typeof Date.now === 'function' ? Date.now() : +new Date();
};
