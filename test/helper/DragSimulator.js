/**
 * Drag simulation helper
 *
 * @param element
 * @param container
 * @param dragTargetRelative
 * @constructor
 */
function DragSimulator(element, container, dragTargetRelative) {
    EventSimulator.apply(this, arguments);
    this.dragTargetRelative = dragTargetRelative;
    this.dragStart = null;
}

inherits(DragSimulator, EventSimulator);

DragSimulator.prototype.transitionDuration = 500;
DragSimulator.prototype.startEventType = 'mousedown';
DragSimulator.prototype.moveEventType = 'mousemove';
DragSimulator.prototype.stopEventType = 'mouseup';

DragSimulator.prototype.start = function() {
    this.dragStart = this.dispatchActionOnElement(this.startEventType);
};

DragSimulator.prototype.move = function(dx, dy) {
    this.dispatchAction(this.moveEventType, window, this.dragStart.x + dx, this.dragStart.y + dy);
};

DragSimulator.prototype.stop = function(dx, dy) {
    this.dispatchAction(this.stopEventType, window, this.dragStart.x + dx, this.dragStart.y + dy);
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
    var elementPosition = this.getElementPosition(this.element, this.dragTargetRelative);
    var dx = x - elementPosition.x;
    var dy = y - elementPosition.y;
    this.dragBy(dx, dy, cb);
};
