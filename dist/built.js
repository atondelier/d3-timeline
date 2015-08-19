!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.d3Timeline=e():"undefined"!=typeof global?global.d3Timeline=e():"undefined"!=typeof self&&(self.d3Timeline=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports.D3Table = require('./src/D3Table.js');
module.exports.D3BlockTable = require('./src/D3BlockTable.js');
module.exports.D3Timeline = require('./src/D3Timeline.js');
module.exports.D3TableMarker = require('./src/D3TableMarker.js');
module.exports.D3TableMouseTracker = require('./src/D3TableMouseTracker.js');
module.exports.D3TableValueTracker = require('./src/D3TableValueTracker.js');
module.exports.D3TimelineTimeTracker = require('./src/D3TimelineTimeTracker.js');

},{"./src/D3BlockTable.js":5,"./src/D3Table.js":6,"./src/D3TableMarker.js":7,"./src/D3TableMouseTracker.js":8,"./src/D3TableValueTracker.js":9,"./src/D3Timeline.js":10,"./src/D3TimelineTimeTracker.js":11}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],4:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _D3Table = require('./D3Table');

var _D3Table2 = _interopRequireDefault(_D3Table);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _extend = require('extend');

/**
 *
 * @extends {D3Table}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3BlockTable(options) {
    _D3Table2['default'].call(this, options);
}

(0, _inherits2['default'])(D3BlockTable, _D3Table2['default']);

D3BlockTable.prototype.defaults = (0, _extend2['default'])(true, {}, _D3Table2['default'].prototype.defaults, {
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

D3BlockTable.prototype.generateClipPathId = function (d) {
    return this.options.bemBlockName + '-elementClipPath_' + this.instanceNumber + '_' + d.uid;
};

D3BlockTable.prototype.generateClipRectLink = function (d) {
    return '#' + this.generateClipRectId(d);
};

D3BlockTable.prototype.generateClipPathLink = function (d) {
    return 'url(#' + this.generateClipPathId(d) + ')';
};

D3BlockTable.prototype.generateClipRectId = function (d) {
    return this.options.bemBlockName + '-elementClipRect_' + this.instanceNumber + '_' + d.uid;
};

D3BlockTable.prototype.elementEnter = function (selection) {

    var self = this;

    var elementHeight = this.options.rowHeight - this.options.rowPadding * 2;

    var rect = selection.append('rect').attr('class', this.options.bemBlockName + '-elementBackground').attr('height', elementHeight);

    var g = selection.append('g').attr('class', this.options.bemBlockName + '-elementContent');

    g.append('g').attr('class', this.options.bemBlockName + '-elementMovableContent');

    var clipElement = false;

    if (this.options.clipElement) {
        if (typeof this.options.clipElementFilter === 'function') {
            clipElement = !!this.options.clipElementFilter.call(this, selection);
        } else {
            clipElement = true;
        }
    }

    if (clipElement) {

        g.attr('clip-path', this.generateClipPathLink.bind(this));

        rect.property('id', this.generateClipRectId.bind(this));

        selection.append('clipPath').property('id', this.generateClipPathId.bind(this)).append('use').attr('xlink:href', this.generateClipRectLink.bind(this));
    }

    this.options.trackedElementDOMEvents.forEach(function (eventName) {
        selection.on(eventName, function (d) {
            if (!d3.event.defaultPrevented) {
                self.emitDetailedEvent('element:' + eventName, selection, null, [d]);
            }
        });
    });

    if (this.options.appendText) {
        selection.select('.timeline-elementMovableContent').append('text').classed('timeline-entityLabel', true).attr('dy', this.options.rowHeight / 2 + 4);
    }

    selection.call(this.elementContentEnter.bind(this));

    this.bindDragAndDropOnSelection(selection);
};

D3BlockTable.prototype.elementsTranslate = function (selection, d) {

    var self = this;

    if (this.options.appendText && this.options.alignLeft && this.options.alignOnTranslate && !d._defaultPrevented) {

        selection.select('.' + this.options.bemBlockName + '-elementMovableContent').attr('transform', function (d) {
            return 'translate(' + Math.max(-self.scales.x(self.getDataStart(d)), 2) + ',0)';
        });
    }
};

D3BlockTable.prototype.elementContentEnter = function () {};

D3BlockTable.prototype.elementContentUpdate = function () {};

// @todo clean up
D3BlockTable.prototype.bindDragAndDropOnSelection = function (selection) {

    var self = this;
    var bodyNode = self.elements.body.node();
    var dragStarted = false;

    // positions
    var currentTransform = null;
    var originTransformString = null;
    var dragStartX = 0,
        dragStartY = 0;
    var elementStartX = 0,
        elementStartY = 0;
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
    var getPreciseTime = window.performance && typeof performance.now === 'function' ? performance.now.bind(performance) : typeof Date.now === 'function' ? Date.now.bind(Date) : function () {
        return +new Date();
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

    var drag = d3.behavior.drag().on('dragstart', function (data) {

        if (d3.event.sourceEvent) {
            d3.event.sourceEvent.stopPropagation();
        }

        startDragPosition = dragPosition = d3.mouse(bodyNode);

        startTime = +new Date();

        storeStart();

        data._defaultPrevented = true;
        self._frozenUids.push(data.uid);
    }).on('drag', function (data) {

        dragPosition = d3.mouse(bodyNode);

        if (!dragStarted) {

            var timeDelta = +new Date() - startTime;
            var totalDeltaX = dragPosition[0] - startDragPosition[0];
            var totalDeltaY = dragPosition[1] - startDragPosition[1];
            var dragDistance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);

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

            d3.timer(function () {

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
    }).on('dragend', function (data) {

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

        self.updateY().drawYAxis();

        dragStarted = false;
    });

    selection.call(drag);
};

D3BlockTable.prototype.elementUpdate = function (selection, d, transitionDuration) {
    var _this = this;

    var self = this;

    this.wrapWithAnimation(selection.select('.' + this.options.bemBlockName + '-elementBackground'), transitionDuration).attr({
        y: this.options.rowPadding,
        width: function width(d) {
            return self.scales.x(self.getDataEnd(d)) - self.scales.x(self.getDataStart(d));
        }
    });

    if (this.options.appendText && this.options.alignLeft && !d._defaultPrevented) {

        selection.select('.' + this.options.bemBlockName + '-elementMovableContent').attr('transform', function (d) {
            return 'translate(' + Math.max(-_this.scales.x(_this.getDataStart(d)), 2) + ',0)';
        });
    }

    selection.call(function () {
        self.elementContentUpdate(selection, d, transitionDuration);
    });
};

D3BlockTable.prototype.elementExit = function (selection) {

    selection.on('click', null);
};

exports['default'] = D3BlockTable;
module.exports = exports['default'];

},{"./D3Table":6,"extend":3,"inherits":4}],6:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/* global cancelAnimationFrame, requestAnimationFrame */

"use strict";

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _eventsEvents = require('events/events');

var _eventsEvents2 = _interopRequireDefault(_eventsEvents);

var _d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);

/**
 * @typedef {Object} D3TableRow
 * @property {String|Number} id
 * @property {String} name
 * @property {Array<D3TableElement>} elements
 */

/**
 * @typedef {Object} D3TableElement
 * @property {String|Number} id
 * @property {String|Number} uid
 * @property {Number} start
 * @property {Number} end
 * @property {Number} [rowIndex]
 */

/**
 * @param {Object} options
 * @constructor
 */

var _d32 = _interopRequireDefault(_d3);

function D3Table(options) {

    _eventsEvents2['default'].call(this);

    D3Table.instancesCount += 1;

    this.instanceNumber = D3Table.instancesCount;

    this.options = (0, _extend2['default'])(true, {}, this.defaults, options);

    /**
     * @type {Array<D3TableRow>}
     */
    this.data = [];

    /**
     * @type {Array<D3TableElement>}
     */
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
        x: null,
        y: null
    };

    this.axises = {
        x: null,
        x2: null,
        y: null
    };

    this.behaviors = {
        zoom: null,
        zoomX: null,
        zoomY: null,
        pan: null
    };

    this._lastTranslate = null;
    this._lastScale = null;

    this._yScale = 0.0;
    this._dataChangeCount = 0;
    this._dimensionsChangeCount = 0;
    this._lastAvailableWidth = 0;
    this._lastAvailableHeight = 0;
    this._preventDrawing = false;
    this._nextAnimationFrameHandlers = [];
    this._maxBodyHeight = Infinity;
    this._frozenUids = [];
}

(0, _inherits2['default'])(D3Table, _eventsEvents2['default']);

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
    xAxisTicksFormatter: function xAxisTicksFormatter(d) {
        return d;
    },
    xAxisStrokeWidth: function xAxisStrokeWidth(d) {
        return d % 2 ? 1 : 2;
    },
    xAxis2TicksFormatter: function xAxis2TicksFormatter(d) {
        return '';
    },
    yAxisFormatter: function yAxisFormatter(d) {
        return d && d.name || '';
    },
    padding: 10,
    trackedDOMEvents: ['click', 'mousemove', 'touchmove', 'mouseenter', 'mouseleave'] // not dynamic
};

D3Table.instancesCount = 0;

D3Table.prototype.noop = function () {};

D3Table.prototype.initialize = function () {

    // container
    this.container = _d32['default'].select(this.options.container).append('svg').attr('class', this.options.bemBlockName + (this.options.bemBlockModifier ? ' ' + this.options.bemBlockName + this.options.bemBlockModifier : ''));

    // defs
    this.elements.defs = this.container.append('defs');

    // clip rect in defs
    var clipId = this.options.bemBlockName + '-bodyClipPath--' + D3Table.instancesCount;
    this.elements.clip = this.elements.defs.append('clipPath').property('id', clipId);
    this.elements.clip.append('rect');

    // surrounding rect
    this.container.append('rect').classed(this.options.bemBlockName + '-backgroundRect', true);

    // axises containers
    this.elements.xAxisContainer = this.container.append('g').attr('class', this.options.bemBlockName + '-axis ' + this.options.bemBlockName + '-axis--x');

    this.elements.x2AxisContainer = this.container.append('g').attr('class', this.options.bemBlockName + '-axis ' + this.options.bemBlockName + '-axis--x ' + this.options.bemBlockName + '-axis--secondary');

    this.elements.yAxisContainer = this.container.append('g').attr('class', this.options.bemBlockName + '-axis ' + this.options.bemBlockName + '-axis--y');

    // body container inner container and surrounding rect
    this.elements.body = this.container.append('g').attr('clip-path', 'url(#' + clipId + ')');

    // surrounding rect
    this.elements.body.append('rect').classed(this.options.bemBlockName + '-contactRect', true);

    // inner container
    this.elements.innerContainer = this.elements.body.append('g');

    // surrounding rect
    this.elements.body.append('rect').classed(this.options.bemBlockName + '-boundingRect', true);

    this.updateMargins();

    this.initializeD3Instances();

    this.initializeEventListeners();

    return this;
};

D3Table.prototype.xScaleFactory = function () {
    return _d32['default'].scale.linear();
};

D3Table.prototype.yScaleFactory = function () {
    return _d32['default'].scale.linear();
};

D3Table.prototype.initializeD3Instances = function () {

    var self = this;

    this.scales.x = this.xScaleFactory();

    this.scales.y = this.yScaleFactory();

    this.axises.x = _d32['default'].svg.axis().scale(this.scales.x).orient('top').tickFormat(this.options.xAxisTicksFormatter.bind(this)).outerTickSize(0).tickPadding(this.options.tickPadding);

    this.axises.x2 = _d32['default'].svg.axis().scale(this.scales.x).orient('top').tickFormat(this.options.xAxis2TicksFormatter.bind(this)).outerTickSize(0).innerTickSize(0);

    this.axises.y = _d32['default'].svg.axis().scale(this.scales.y).orient('left').tickFormat(function (d) {
        if (self._isRound(d)) {
            return self.options.yAxisFormatter(self.data[d | 0]);
        } else {
            return '';
        }
    }).outerTickSize(0);

    this.behaviors.zoom = _d32['default'].behavior.zoom().scaleExtent([1, 10]).on('zoom', this.handleZooming.bind(this)).on('zoomend', this.handleZoomingEnd.bind(this));

    this.behaviors.zoomX = _d32['default'].behavior.zoom().x(this.scales.x).scale(1).scaleExtent([1, 10]);

    this.behaviors.zoomY = _d32['default'].behavior.zoom().y(this.scales.y).scale(1).scaleExtent([1, 1]);

    this.behaviors.pan = _d32['default'].behavior.drag().on('drag', this.handleDragging.bind(this));

    this.elements.body.call(this.behaviors.pan);
    this.elements.body.call(this.behaviors.zoom);

    this._lastTranslate = this.behaviors.zoom.translate();
    this._lastScale = this.behaviors.zoom.scale();
};

D3Table.prototype.initializeEventListeners = function () {

    var self = this;

    this.options.trackedDOMEvents.forEach(function (eventName) {
        self.elements.body.on(eventName, function () {
            if (eventName !== 'click' || !_d32['default'].event.defaultPrevented && _d32['default'].select(_d32['default'].event.target).classed(self.options.bemBlockName + '-contactRect')) {
                self.emitDetailedEvent(eventName, self.elements.body);
            }
        });
    });
};

D3Table.prototype.emitDetailedEvent = function (eventName, d3TargetSelection, delta, priorityArguments, extraArguments) {

    var self = this;

    var position;

    var getPosition = function getPosition() {
        if (!position) {
            position = _d32['default'].mouse(self.elements.body.node());
            if (Array.isArray(delta)) {
                position[0] += delta[0];
                position[1] += delta[1];
            }
        }
        return position;
    };

    var args = [this, // the table instance
    d3TargetSelection, // the d3 selection targeted
    _d32['default'].event, // the d3 event
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

D3Table.prototype.updateMargins = function (updateDimensions) {

    this.margin = {
        top: this.options.xAxisHeight + this.options.padding,
        right: this.options.padding,
        bottom: this.options.padding,
        left: this.options.yAxisWidth + this.options.padding
    };

    var contentPosition = { x: this.margin.left, y: this.margin.top };
    var contentTransform = 'translate(' + this.margin.left + ',' + this.margin.top + ')';

    this.container.select('rect.' + this.options.bemBlockName + '-backgroundRect').attr(contentPosition);

    this.elements.body.attr('transform', contentTransform);

    this.elements.xAxisContainer.attr('transform', contentTransform);

    this.elements.x2AxisContainer.attr('transform', contentTransform);

    this.elements.yAxisContainer.attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    if (updateDimensions) {
        this.updateX();
        this.updateY();
    }
};

D3Table.prototype.destroy = function () {

    this.emit(this.options.bemBlockName + ':destroy', this);

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

    this.emit(this.options.bemBlockName + ':destroyed', this);
};

D3Table.prototype.restoreZoom = function () {
    this.behaviors.zoom.translate(this._lastTranslate);
    this.behaviors.zoom.scale(this._lastScale);
};

D3Table.prototype.move = function (dx, dy, forceDraw, skipXAxis, forceTicks) {

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

D3Table.prototype.ensureInDomains = function () {
    return this.move(0, 0, false, false, true);
};

/**
 * pan X/Y & zoom X handler (clamped pan Y when wheel is pressed without ctrl, zoom X and pan X/Y otherwise)
 */
D3Table.prototype.handleZooming = function () {

    if (_d32['default'].event.sourceEvent && !_d32['default'].event.sourceEvent.ctrlKey && !(_d32['default'].event.sourceEvent.changedTouches && _d32['default'].event.sourceEvent.changedTouches.length >= 2)) {
        if (_d32['default'].event.sourceEvent.type === 'wheel') {
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

    this.emit(this.options.bemBlockName + ':move');
};

D3Table.prototype.handleZoomingEnd = function () {

    var self = this;
    this.requestAnimationFrame(function () {
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
D3Table.prototype.handleWheeling = function () {

    var event = _d32['default'].event.sourceEvent;

    var dx = 0,
        dy = 0;

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

D3Table.prototype.handleDragging = function () {

    if (_d32['default'].event.sourceEvent.changedTouches && _d32['default'].event.sourceEvent.touches.length >= 2) {
        return;
    }

    this.move(_d32['default'].event.dx, _d32['default'].event.dy, false, false, !this.options.hideTicksOnDrag);
};

D3Table.prototype.toggleDrawing = function (active) {

    this._preventDrawing = typeof active === 'boolean' ? !active : !this._preventDrawing;

    return this;
};

/**
 *
 * @param {Array<D3TableRow>} data
 * @param {Number} [transitionDuration]
 * @param {Boolean} [animateY]
 * @returns {D3Table}
 */
D3Table.prototype.setData = function (data, transitionDuration, animateY) {

    this._dataChangeCount += 1;

    var isSizeChanging = data.length !== this.data.length;

    this.data = data;

    this.generateFlattenedData();

    if (isSizeChanging || this._dataChangeCount === 1) {
        this.updateXAxisInterval().updateY(animateY ? transitionDuration : undefined).drawXAxis().drawYAxis();
    }

    this.drawElements(transitionDuration);

    return this;
};

/**
 * This clone method does not clone the entities itself
 * @returns {Array<D3TableRow>}
 */
D3Table.prototype.cloneData = function () {

    var self = this;

    return this.data.map(function (d) {

        /**
         * @type {D3TableRow}
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
 * @returns {Array<D3TableElement>}
 */
D3Table.prototype.cloneFlattenedData = function () {
    return this.flattenedData.map(function (e) {

        /**
         * @type {D3TableElement}
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
 * @returns {D3TableElement}
 */
D3Table.prototype.cloneElement = function (e) {

    /**
     * @type {D3TableElement}
     */
    var res = {};

    for (var key in e) {
        if (e.hasOwnProperty(key)) {
            res[key] = e[key];
        }
    }

    return res;
};

D3Table.prototype.getElementRow = function (d) {
    return this._find(this.data, function (row) {
        return row.elements.indexOf(d) !== -1;
    });
};

D3Table.prototype.storeFlattenedData = function () {
    this.previousFlattenedData = this.cloneFlattenedData();
};

D3Table.prototype.generateFlattenedData = function () {

    var self = this;

    if (this.options.usePreviousDataForTransform) {
        this.storeFlattenedData();
    }

    this.flattenedData.length = 0;

    this.data.forEach(function (d, i) {
        d.elements.forEach(function (element) {
            element.rowIndex = i;
            if (self._frozenUids.indexOf(element.uid) !== -1) {
                element._defaultPrevented = true;
            }
            self.flattenedData.push(element);
        });
    });
};

/**
 *
 * @param {Date} minX
 * @param {Date} maxX
 * @returns {D3Table}
 */
D3Table.prototype.setXRange = function (minX, maxX) {

    this.minX = minX;
    this.maxX = maxX;

    this.scales.x.domain([this.minX, this.maxX]);

    this.updateX().updateXAxisInterval().drawXAxis().drawYAxis().drawElements();

    return this;
};

D3Table.prototype.setAvailableWidth = function (availableWidth) {

    this._dimensionsChangeCount += 1;

    var isAvailableWidthChanging = availableWidth !== this._lastAvailableWidth;
    this._lastAvailableWidth = availableWidth;

    this.dimensions.width = this._lastAvailableWidth - this.margin.left - this.margin.right;

    if (isAvailableWidthChanging || this._dimensionsChangeCount === 1) {
        this.updateX().updateXAxisInterval().drawXAxis().drawYAxis().drawElements();
    }

    return this;
};

D3Table.prototype.setAvailableHeight = function (availableHeight) {

    this._dimensionsChangeCount += 1;

    var isAvailableHeightChanging = availableHeight !== this._lastAvailableHeight;
    this._lastAvailableHeight = availableHeight;

    this._maxBodyHeight = this._lastAvailableHeight - this.margin.top - this.margin.bottom;

    if (isAvailableHeightChanging || this._dimensionsChangeCount === 1) {
        this.updateY().drawXAxis().drawYAxis().drawElements();
    }

    return this;
};

D3Table.prototype.updateX = function (transitionDuration) {

    this.container.attr('width', this.dimensions.width + this.margin.left + this.margin.right);

    this.scales.x.domain([this.minX, this.maxX]).range([0, this.dimensions.width]);

    this.axises.y.innerTickSize(-this.dimensions.width);

    this.behaviors.zoomX.x(this.scales.x).translate(this.behaviors.zoom.translate()).scale(this.behaviors.zoom.scale());

    this.elements.body.select('rect.' + this.options.bemBlockName + '-boundingRect').attr('width', this.dimensions.width);
    this.elements.body.select('rect.' + this.options.bemBlockName + '-contactRect').attr('width', this.dimensions.width);
    this.container.select('rect.' + this.options.bemBlockName + '-backgroundRect').attr('width', this.dimensions.width);
    this.elements.clip.select('rect').attr('width', this.dimensions.width);

    this.emit(this.options.bemBlockName + ':resize', this, this.container, transitionDuration);

    return this;
};

D3Table.prototype.requestAnimationFrame = function (f) {

    var self = this;

    this._nextAnimationFrameHandlers.push(f);

    if (this._nextAnimationFrameHandlers.length === 1) {
        requestAnimationFrame(function () {
            var g;
            while (g = self._nextAnimationFrameHandlers.shift()) g();
        });
    }

    return f;
};

D3Table.prototype.cancelAnimationFrame = function (f) {

    var index = this._nextAnimationFrameHandlers.length > 0 ? this._nextAnimationFrameHandlers.indexOf(f) : -1;

    if (index !== -1) {
        this._nextAnimationFrameHandlers.splice(index, 1);
    }
};

D3Table.prototype.drawXAxis = function (transitionDuration, skipTicks) {

    if (this._preventDrawing) {
        return this;
    }

    this.axises.y.innerTickSize(skipTicks ? 0 : -this.dimensions.width);

    var self = this;

    if (this._xAxisAF) {
        this.cancelAnimationFrame(this._xAxisAF);
    }

    this._xAxisAF = this.requestAnimationFrame(function () {

        self.wrapWithAnimation(self.elements.xAxisContainer, transitionDuration).call(self.axises.x).selectAll('line').style({
            'stroke-width': self.options.xAxisStrokeWidth.bind(self)
        });

        self.wrapWithAnimation(self.elements.x2AxisContainer, transitionDuration).call(self.axises.x2).selectAll('text').attr({
            x: self.columnWidth / 2
        }).style({
            display: function display(d) {
                return +d === +self.maxX ? 'none' : '';
            }
        });
    });

    return this;
};

D3Table.prototype.drawYAxis = function drawYAxis(transitionDuration, skipTicks) {

    if (this._preventDrawing) {
        return this;
    }

    this.axises.x.innerTickSize(skipTicks ? 0 : -this.dimensions.height);

    var domainY = this.scales.y.domain();

    this.axises.y.tickValues(this._range(Math.round(domainY[0]), Math.round(domainY[1]), 1));

    var self = this;

    if (this._yAxisAF) {
        this.cancelAnimationFrame(this._yAxisAF);
    }

    this._yAxisAF = this.requestAnimationFrame(function () {

        var container = self.wrapWithAnimation(self.elements.yAxisContainer, transitionDuration);
        container.call(self.axises.y);

        container.selectAll('text').attr('y', self.options.rowHeight / 2);

        container.selectAll('line').style('display', function (d, i) {
            return i ? '' : 'none';
        });
    });

    return this;
};

D3Table.prototype.getTransformFromData = function (d) {
    return 'translate(' + this.scales.x(this.getDataStart(d)) + ',' + this.scales.y(d.rowIndex) + ')';
};

D3Table.prototype.getDataStart = function (d) {
    return +d.start;
};

D3Table.prototype.getDataEnd = function (d) {
    return +d.end;
};

D3Table.prototype.drawElements = function (transitionDuration) {

    if (this._preventDrawing) {
        return this;
    }

    this.stopElementTransition();

    var self = this;

    if (this._elementsAF) {
        this.cancelAnimationFrame(this._elementsAF);
    }

    var enableYTransition = this.options.enableYTransition;

    this._elementsAF = this.requestAnimationFrame(function () {

        var domainX = self.scales.x.domain();
        var domainXStart = domainX[0];
        var domainXEnd = domainX[domainX.length - 1];

        var domainY = self.scales.y.domain();
        var domainYStart = domainY[0];
        var domainYEnd = domainY[domainY.length - 1];

        var cullingDistance = self.options.cullingDistance;
        var cullingX = self.options.cullingX;
        var cullingY = self.options.cullingY;

        var startTransformMap = {};
        var endTransformMap = {};

        if (self.options.usePreviousDataForTransform && transitionDuration > 0) {
            if (self.previousFlattenedData) {
                self.previousFlattenedData.forEach(function (d) {
                    if (!startTransformMap[d.uid]) {
                        startTransformMap[d.id] = startTransformMap[d.uid] = self.getTransformFromData(d);
                    }
                });
            }
            if (self.flattenedData) {
                self.flattenedData.forEach(function (d) {
                    if (!endTransformMap[d.uid]) {
                        endTransformMap[d.id] = endTransformMap[d.uid] = self.getTransformFromData(d);
                    }
                });
            }
        }

        var data = self.flattenedData.filter(function (d) {
            return d._defaultPrevented || (!cullingY || d.rowIndex >= domainYStart - cullingDistance && d.rowIndex < domainYEnd + cullingDistance - 1) && (!cullingX || !(self.getDataEnd(d) < domainXStart || self.getDataStart(d) > domainXEnd));
        });

        var g = self.elements.innerContainer.selectAll('g.' + self.options.bemBlockName + '-element').data(data, function (d) {
            return d.uid;
        });

        var exiting = g.exit();

        if (self.options.enableTransitionOnExit && transitionDuration > 0) {
            exiting.call(self.elementExit.bind(self));

            exiting.each(function (d) {

                var g = _d32['default'].select(this);

                var exitTransform = endTransformMap[d.uid] || endTransformMap[d.id];

                if (exitTransform) {
                    self.wrapWithAnimation(g, transitionDuration).attr('transform', exitTransform).remove();
                } else {
                    g.remove();
                }
            });
        } else {
            exiting.remove();
        }

        g.enter().append('g').attr('class', self.options.bemBlockName + '-element').each(function () {
            _d32['default'].select(this).call(self.elementEnter.bind(self));
        });

        g.each(function (d) {

            var g = _d32['default'].select(this);

            if (d._defaultPrevented) {

                self.elementUpdate(g, d, transitionDuration);

                return;
            }

            var hasPreviousTransform = g.attr('transform') !== null;

            var newTransform = endTransformMap[d.uid] || endTransformMap[d.id] || self.getTransformFromData(d);

            if (transitionDuration > 0) {
                var originTransform = startTransformMap[d.uid] || startTransformMap[d.id] || newTransform;
                var modifiedOriginTransform;
                if (!hasPreviousTransform && self.options.usePreviousDataForTransform) {
                    if (originTransform) {
                        modifiedOriginTransform = originTransform;
                        g.attr('transform', originTransform);
                    }
                }

                self.wrapWithAnimation(g, transitionDuration).attrTween("transform", function () {
                    var originTransform = modifiedOriginTransform || g.attr('transform');
                    if (enableYTransition) {
                        return _d32['default'].interpolateTransform(originTransform, newTransform);
                    } else {
                        var startTransform = _d32['default'].transform(originTransform);
                        var endTransform = _d32['default'].transform(newTransform);
                        startTransform.translate[1] = endTransform.translate[1];
                        return _d32['default'].interpolateTransform(startTransform.toString(), endTransform.toString());
                    }
                });
            } else {
                g.attr('transform', newTransform);
            }

            self.elementUpdate(g, d, transitionDuration);
        });

        self.currentElementsGroupTranslate = [0.0, 0.0];
        self.elements.innerContainer.attr('transform', null);
    });

    return this;
};

D3Table.prototype.moveElements = function (forceDraw, skipXAxis, forceTicks) {

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

D3Table.prototype.translateElements = function (translate, previousTranslate) {

    var self = this;

    var tx = translate[0] - previousTranslate[0];
    var ty = translate[1] - previousTranslate[1];

    this.currentElementsGroupTranslate[0] = this.currentElementsGroupTranslate[0] + tx;
    this.currentElementsGroupTranslate[1] = this.currentElementsGroupTranslate[1] + ty;

    if (this._eltsTranslateAF) {
        this.cancelAnimationFrame(this._eltsTranslateAF);
    }

    this._eltsTranslateAF = this.requestAnimationFrame(function () {

        self.elements.innerContainer.attr({
            transform: 'translate(' + self.currentElementsGroupTranslate + ')'
        });

        if (self.elementsTranslate !== self.noop) {
            self.elements.innerContainer.selectAll('.' + self.options.bemBlockName + '-element').each(function (d) {
                self.elementsTranslate(_d32['default'].select(this), d);
            });
        }
    });
};

D3Table.prototype.updateXAxisInterval = function () {

    this.columnWidth = this.scales.x(1) - this.scales.x(0);

    return this;
};

D3Table.prototype.updateY = function (transitionDuration) {

    var container = this.container;
    var clip = this.elements.clip.select('rect');
    var boundingRect = this.elements.body.select('rect.' + this.options.bemBlockName + '-boundingRect');

    if (transitionDuration) {
        container = container.transition().duration(transitionDuration);
        clip = clip.transition().duration(transitionDuration);
        boundingRect = boundingRect.transition().duration(transitionDuration);
    }

    var elementAmount = this.data.length;

    // have 1 more elemnt to force representing one more tick
    var elementsRange = [0, elementAmount];

    // compute new height
    this.dimensions.height = Math.min(this.data.length * this.options.rowHeight, this._maxBodyHeight);

    // compute new Y scale
    this._yScale = this.options.rowHeight / this.dimensions.height * elementAmount;

    // update Y scale, axis and zoom behavior
    this.scales.y.domain(elementsRange).range([0, this.dimensions.height]);

    this.behaviors.zoomY.y(this.scales.y).translate(this._lastTranslate).scale(this._yScale);

    // and update X axis ticks height
    this.axises.x.innerTickSize(-this.dimensions.height);

    // update svg height
    container.attr('height', this.dimensions.height + this.margin.top + this.margin.bottom);

    // update inner rect height
    this.elements.body.select('rect.' + this.options.bemBlockName + '-contactRect').attr('height', this.dimensions.height);
    boundingRect.attr('height', this.dimensions.height);
    container.select('rect.' + this.options.bemBlockName + '-backgroundRect').attr('height', this.dimensions.height);
    clip.attr('height', this.dimensions.height);

    this.stopElementTransition();

    this.emit(this.options.bemBlockName + ':resize', this, this.container, transitionDuration);

    return this;
};

D3Table.prototype.stopElementTransition = function () {
    this.elements.innerContainer.selectAll('g.' + this.options.bemBlockName + '-element').transition().style('opacity', '');
};

D3Table.prototype.elementEnter = function (selection) {
    return selection;
};

D3Table.prototype.elementUpdate = function (selection) {
    return selection;
};

D3Table.prototype.elementExit = function (selection) {
    return selection;
};

D3Table.prototype.wrapWithAnimation = function (selection, transitionDuration) {
    if (transitionDuration > 0) {
        return selection.transition().duration(transitionDuration).ease(this.options.transitionEasing);
    } else {
        return selection;
    }
};

D3Table.prototype._getter = function (prop) {
    return function (d) {
        return d[prop];
    };
};

D3Table.prototype._isRound = function (v) {
    var n = v | 0;
    return v > n - 1e-3 && v < n + 1e-3;
};

D3Table.prototype._range = function (start, end, inc) {
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
D3Table.prototype._find = function (list, predicate) {
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

D3Table.prototype._clampTranslationWithScale = function (translate, scale) {

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
        tx = Math.min(Math.max(-this.dimensions.width * (sx - 1), tx), 0);
    }

    if (sy === 1) {
        ty = 0;
    } else {
        ty = Math.min(Math.max(-this.dimensions.height * (sy - 1), ty), 0);
    }

    return [tx, ty];
};

exports['default'] = D3Table;
module.exports = exports['default'];

},{"events/events":2,"extend":3,"inherits":4}],7:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _eventsEvents = require('events/events');

var _eventsEvents2 = _interopRequireDefault(_eventsEvents);

var _d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);

var _d32 = _interopRequireDefault(_d3);

var _D3Table = require('./D3Table');

var _D3Table2 = _interopRequireDefault(_D3Table);

function D3TableMarker(options) {

    _eventsEvents2['default'].call(this);

    this.options = (0, _extend2['default'])(true, {}, this.defaults, options);

    /**
     * @type {D3Table}
     */
    this.table = null;

    this.container = null;
    this.elements = {
        line: null,
        label: null
    };

    /**
     * @type {Function}
     * @private
     */
    this._tableMoveListener = null;

    /**
     * @type {Function}
     * @private
     */
    this._tableResizeListener = null;

    /**
     * @type {Function}
     * @private
     */
    this._tableDestroyListener = null;

    this._moveAF = null;

    this.value = null;
    this._lastTimeUpdated = null;
}

(0, _inherits2['default'])(D3TableMarker, _eventsEvents2['default']);

D3TableMarker.prototype.LAYOUT_HORIZONTAL = 'horizontal';
D3TableMarker.prototype.LAYOUT_VERTICAL = 'vertical';

D3TableMarker.prototype.defaults = {
    formatter: function formatter(d) {
        return d;
    },
    outerTickSize: 10,
    tickPadding: 3,
    roundPosition: false,
    bemBlockName: 'tableMarker',
    bemModifiers: [],
    layout: D3TableMarker.prototype.LAYOUT_VERTICAL,
    lineShape: 'line',
    rectThickness: _D3Table2['default'].prototype.defaults.rowHeight
};

/**
 *
 * @param {D3Table} table
 */
D3TableMarker.prototype.setTable = function (table) {

    var previousTable = this.table;

    this.table = table && table instanceof _D3Table2['default'] ? table : null;

    if (this.table) {
        if (previousTable !== this.table) {
            if (previousTable) {
                this.unbindTable(previousTable);
            }
            this.bindTable();
        }
    } else if (!this.table && previousTable) {
        this.unbindTable(previousTable);
    }
};

D3TableMarker.prototype.valueComparator = function (timeA, timeB) {
    return +timeA !== +timeB;
};

D3TableMarker.prototype.setValue = function (value, silent) {

    var previousTimeUpdated = this._lastTimeUpdated;

    this.value = value;

    if (this.valueComparator(previousTimeUpdated, this.value) && this.table && this.container) {

        this._lastTimeUpdated = this.value;

        this.container.datum({
            value: value
        });

        if (!silent) {
            this.move();
        }
    }
};

D3TableMarker.prototype.getValue = function (data) {
    return data.value;
};

D3TableMarker.prototype.bindTable = function () {

    var self = this;

    var className = this.options.bemBlockName + ' ' + this.options.bemBlockName + '--' + this.options.layout;

    if (this.options.bemModifiers && Array.isArray(this.options.bemModifiers) && this.options.bemModifiers.length > 0) {
        className = className + ' ' + this.options.bemModifiers.map(function (modifier) {
            return self.options.bemBlockName + '--' + modifier;
        }).join(' ');
    }

    this.container = this.table.container.append('g').datum({
        value: this.value
    }).attr('class', className);

    switch (this.options.lineShape) {
        case 'line':
            this.elements.line = this.container.append('line').attr('class', this.options.bemBlockName + '-line').style('pointer-events', 'none');
            break;
        case 'rect':
            this.elements.line = this.container.append('rect').attr('class', this.options.bemBlockName + '-rect').style('pointer-events', 'none');
            break;
    }

    this.elements.label = this.container.append('text').attr('class', this.options.bemBlockName + '-label');

    this.sizeLineAndLabel();

    // on table move, move the marker
    this._tableMoveListener = this.move.bind(this);
    this.table.on(this.table.options.bemBlockName + ':move', this._tableMoveListener);

    // on table resize, resize the marker and move it
    this._tableResizeListener = function (table, selection, transitionDuration) {
        self.resize(transitionDuration);
        self.move(transitionDuration);
    };
    this.table.on(this.table.options.bemBlockName + ':resize', this._tableResizeListener);

    this._tableDestroyListener = function (table) {
        self.unbindTable(table);
    };
    this.table.on(this.table.options.bemBlockName + ':destroy', this._tableDestroyListener);

    this.emit('marker:bound');

    this.move();
};

D3TableMarker.prototype.sizeLineAndLabel = function (transitionDuration) {

    var layout = this.options.layout;

    var line = this.elements.line;
    var label = this.elements.label;

    if (transitionDuration > 0) {
        line = line.transition().duration(transitionDuration);
        label = label.transition().duration(transitionDuration);
    }

    switch (layout) {

        case this.LAYOUT_VERTICAL:

            switch (this.options.lineShape) {
                case 'line':
                    line.attr({
                        y1: -this.options.outerTickSize,
                        y2: this.table.dimensions.height
                    });
                    break;
                case 'rect':
                    line.attr({
                        x: -this.options.rectThickness / 2,
                        y: -this.options.outerTickSize,
                        width: this.options.rectThickness,
                        height: this.options.outerTickSize + this.table.dimensions.height
                    });
                    break;
            }

            label.attr('dy', -this.options.outerTickSize - this.options.tickPadding);

            break;

        case this.LAYOUT_HORIZONTAL:

            switch (this.options.lineShape) {
                case 'line':
                    line.attr({
                        x1: -this.options.outerTickSize,
                        x2: this.table.dimensions.width
                    });
                    break;
                case 'rect':
                    line.attr({
                        x: -this.options.outerTickSize,
                        y: -this.options.rectThickness / 2,
                        width: this.options.outerTickSize + this.table.dimensions.width,
                        height: this.options.rectThickness
                    });
                    break;
            }

            label.attr('dx', -this.options.outerTickSize - this.options.tickPadding).attr('dy', 4);

            break;
    }
};

D3TableMarker.prototype.unbindTable = function (previousTable) {

    previousTable.removeListener(previousTable.options.bemBlockName + ':move', this._tableMoveListener);
    previousTable.removeListener(previousTable.options.bemBlockName + ':resize', this._tableResizeListener);
    previousTable.removeListener(previousTable.options.bemBlockName + ':destroy', this._tableDestroyListener);

    if (this.container) {
        this.container.remove();
    }

    if (this._moveAF) {
        previousTable.cancelAnimationFrame(this._moveAF);
        this._moveAF = null;
    }

    this.container = null;
    this._tableMoveListener = null;

    this.emit('marker:unbound', previousTable);
};

D3TableMarker.prototype.move = function (transitionDuration) {

    if (this._moveAF) {
        this.table.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = this.table.requestAnimationFrame(this.moveSync.bind(this));
};

D3TableMarker.prototype.moveSync = function () {

    if (!this.table) {
        return;
    }

    var self = this;
    var layout = this.options.layout;

    this.container.each(function (d) {

        var value = self.getValue(d);

        if (value === null) {
            self.hide();
            return;
        }

        var scale,
            position = [0, 0],
            positionIndex;

        switch (layout) {
            case self.LAYOUT_VERTICAL:
                scale = self.table.scales.x;
                positionIndex = 0;
                break;
            case self.LAYOUT_HORIZONTAL:
                scale = self.table.scales.y;
                positionIndex = 1;
        }

        position[positionIndex] = scale(value);

        var range = scale.range();
        var isInRange = position[positionIndex] >= range[0] && position[positionIndex] <= range[range.length - 1];

        var g = _d32['default'].select(this);

        if (isInRange) {

            self.show();

            g.attr('transform', 'translate(' + (self.table.margin.left + position[0] >> 0) + ',' + (self.table.margin.top + position[1] >> 0) + ')');

            g.select('.' + self.options.bemBlockName + '-label').text(self.options.formatter(value));
        } else {
            self.hide();
        }
    });
};

D3TableMarker.prototype.show = function () {
    if (this.container) {
        this.container.style('display', '');
    }
};

D3TableMarker.prototype.hide = function () {
    if (this.container) {
        this.container.style('display', 'none');
        this.container.datum({
            value: null
        });
    }
};

D3TableMarker.prototype.resize = function (transitionDuration) {

    this.sizeLineAndLabel(transitionDuration);
};

module.exports = D3TableMarker;

},{"./D3Table":6,"events/events":2,"extend":3,"inherits":4}],8:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _D3TableMarker = require('./D3TableMarker');

var _D3TableMarker2 = _interopRequireDefault(_D3TableMarker);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _extend = require('extend');

/**
 *
 * @extends {D3TableMarker}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3TableMouseTracker(options) {
    _D3TableMarker2['default'].call(this, options);

    this._tableMouseenterListener = null;
    this._tableMousemoveListener = null;
    this._tableMouseleaveListener = null;

    this._moveAF = null;

    this.on('marker:bound', this.handleTableBound.bind(this));
    this.on('marker:unbound', this.handleTableUnbound.bind(this));

    this._isListeningToTouchEvents = false;
}

(0, _inherits2['default'])(D3TableMouseTracker, _D3TableMarker2['default']);

D3TableMouseTracker.prototype.defaults = (0, _extend2['default'])(true, {}, _D3TableMarker2['default'].prototype.defaults, {
    bemModifiers: ['mouseTracker'],
    listenToTouchEvents: true
});

D3TableMouseTracker.prototype.handleTableBound = function () {

    this._tableMouseenterListener = this.handleMouseenter.bind(this);
    this._tableMousemoveListener = this.handleMousemove.bind(this);
    this._tableMouseleaveListener = this.handleMouseleave.bind(this);

    this.table.on(this.table.options.bemBlockName + ':mouseenter', this._tableMouseenterListener);
    this.table.on(this.table.options.bemBlockName + ':mousemove', this._tableMousemoveListener);
    this.table.on(this.table.options.bemBlockName + ':mouseleave', this._tableMouseleaveListener);

    if (this.options.listenToTouchEvents) {
        this._isListeningToTouchEvents = true;
        this.table.on(this.table.options.bemBlockName + ':touchmove', this._tableMousemoveListener);
    } else {
        this._isListeningToTouchEvents = false;
    }
};

D3TableMouseTracker.prototype.handleTableUnbound = function (previousTable) {

    previousTable.removeListener(previousTable.options.bemBlockName + ':mouseenter', this._tableMouseenterListener);
    previousTable.removeListener(previousTable.options.bemBlockName + ':mousemove', this._tableMousemoveListener);
    previousTable.removeListener(previousTable.options.bemBlockName + ':mouseleave', this._tableMouseleaveListener);

    if (this._isListeningToTouchEvents) {
        previousTable.removeListener(previousTable.options.bemBlockName + ':touchmove', this._tableMousemoveListener);
    }
};

D3TableMouseTracker.prototype.getValueFromTableEvent = function (table, selection, d3Event, getTime, getRow) {
    switch (this.options.layout) {
        case 'vertical':
            return getTime();
        case 'horizontal':
            return getRow();
    }
};

D3TableMouseTracker.prototype.handleMouseenter = function (table, selection, d3Event, getTime, getRow) {

    var self = this;

    var time = this.getValueFromTableEvent.apply(this, arguments);

    table.requestAnimationFrame(function () {
        self.show();
        self.setValue(time);
    });
};

D3TableMouseTracker.prototype.handleMousemove = function (table, selection, d3Event, getTime, getRow) {

    var self = this;
    var time = this.getValueFromTableEvent.apply(this, arguments);

    if (this._moveAF) {
        table.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = table.requestAnimationFrame(function () {
        self.setValue(time);
    });
};

D3TableMouseTracker.prototype.handleMouseleave = function (table, selection, d3Event, getTime, getRow) {

    if (this._moveAF) {
        table.cancelAnimationFrame(this._moveAF);
    }

    var self = this;
    table.requestAnimationFrame(function () {
        self.hide();
    });
};

module.exports = D3TableMouseTracker;

},{"./D3TableMarker":7,"extend":3,"inherits":4}],9:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _D3TableMarker = require('./D3TableMarker');

var _D3TableMarker2 = _interopRequireDefault(_D3TableMarker);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _extend = require('extend');

/**
 *
 * @extends {D3TableMarker}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3TableValueTracker(options) {
    _D3TableMarker2['default'].call(this, options);

    this.enabled = false;
}

(0, _inherits2['default'])(D3TableValueTracker, _D3TableMarker2['default']);

D3TableValueTracker.prototype.defaults = (0, _extend2['default'])(true, {}, _D3TableMarker2['default'].prototype.defaults, {
    bemModifiers: ['valueTracker']
});

D3TableValueTracker.prototype.valueGetter = function () {

    return 0;
};

D3TableValueTracker.prototype.start = function () {

    var self = this;

    this.enabled = true;

    d3.timer(function () {

        self.setValue(self.valueGetter());

        return !self.enabled;
    });
};

D3TableValueTracker.prototype.stop = function () {

    this.enabled = false;
};

module.exports = D3TableValueTracker;

},{"./D3TableMarker":7,"extend":3,"inherits":4}],10:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/* global cancelAnimationFrame, requestAnimationFrame */

"use strict";

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _D3BlockTable = require('./D3BlockTable');

var _D3BlockTable2 = _interopRequireDefault(_D3BlockTable);

var _d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);

/**
 *
 * @param {Object} options
 * @constructor
 */

var _d32 = _interopRequireDefault(_d3);

function D3Timeline(options) {

    _D3BlockTable2['default'].call(this, options);

    this.currentTimeInterval = this.options.minimumTimeInterval;
}

(0, _inherits2['default'])(D3Timeline, _D3BlockTable2['default']);

D3Timeline.prototype.defaults = (0, _extend2['default'])(true, {}, _D3BlockTable2['default'].prototype.defaults, {
    bemBlockName: 'timeline',
    bemBlockModifier: '',
    xAxisTicksFormatter: function xAxisTicksFormatter(d) {
        return d.getMinutes() % 15 ? '' : _d32['default'].time.format('%H:%M')(d);
    },
    xAxisStrokeWidth: function xAxisStrokeWidth(d) {
        return d.getMinutes() % 30 ? 1 : 2;
    },
    minimumColumnWidth: 30,
    minimumTimeInterval: 3e5,
    availableTimeIntervals: [6e4, 3e5, 9e5, 1.8e6, 3.6e6, 7.2e6, 1.44e7, 2.88e7, 4.32e7, 8.64e7]
});

D3Timeline.prototype.xScaleFactory = function () {
    return _d32['default'].time.scale();
};

D3Timeline.prototype.yScaleFactory = function () {
    return _d32['default'].scale.linear();
};

D3Timeline.prototype.getDataStart = function (d) {
    return d.start;
};

D3Timeline.prototype.getDataEnd = function (d) {
    return d.end;
};

D3Timeline.prototype._computeColumnWidthFromTimeInterval = function (timeInterval) {
    return this.scales.x(new Date(timeInterval)) - this.scales.x(new Date(0));
};

D3Timeline.prototype.updateXAxisInterval = function () {

    var self = this;

    var minimumTimeInterval = this.options.minimumTimeInterval;
    var minimumColumnWidth = this.options.minimumColumnWidth;
    var currentTimeInterval = this.currentTimeInterval;
    var availableTimeIntervals = this.options.availableTimeIntervals;
    var currentTimeIntervalIndex = availableTimeIntervals.indexOf(currentTimeInterval);
    var currentColumnWidth = this._computeColumnWidthFromTimeInterval(currentTimeInterval);

    function translateTimeInterval(delta) {
        currentTimeIntervalIndex += delta;
        currentTimeInterval = availableTimeIntervals[currentTimeIntervalIndex];
        currentColumnWidth = self._computeColumnWidthFromTimeInterval(currentTimeInterval);
    }

    if (availableTimeIntervals.length > 0) {
        if (currentColumnWidth < minimumColumnWidth) {
            while (currentColumnWidth < minimumColumnWidth && currentTimeIntervalIndex < availableTimeIntervals.length - 1) {
                translateTimeInterval(1);
            }
        } else if (currentColumnWidth > minimumColumnWidth) {
            while (currentColumnWidth > minimumColumnWidth && currentTimeIntervalIndex > 0) {
                translateTimeInterval(-1);
            }
            translateTimeInterval(1);
        }
    }

    if (currentTimeInterval < minimumTimeInterval) {
        currentTimeInterval = minimumTimeInterval;
        currentColumnWidth = self._computeColumnWidthFromTimeInterval(currentTimeInterval);
    }

    this.currentTimeInterval = Math.floor(currentTimeInterval);
    this.columnWidth = Math.floor(currentColumnWidth);

    if (this.currentTimeInterval > 3.6e6) {
        this.axises.x.ticks(_d32['default'].time.hours, this.currentTimeInterval / 3.6e6);
        this.axises.x2.ticks(_d32['default'].time.hours, this.currentTimeInterval / 3.6e6);
    } else if (this.currentTimeInterval > 6e4) {
        this.axises.x.ticks(_d32['default'].time.minutes, this.currentTimeInterval / 6e4);
        this.axises.x2.ticks(_d32['default'].time.minutes, this.currentTimeInterval / 6e4);
    } else if (this.currentTimeInterval > 1e3) {
        this.axises.x.ticks(_d32['default'].time.seconds, this.currentTimeInterval / 1e3);
        this.axises.x2.ticks(_d32['default'].time.seconds, this.currentTimeInterval / 1e3);
    }

    return this;
};

D3Timeline.prototype.setTimeRange = function (minDate, maxDate) {
    return this.setXRange(minDate, maxDate);
};

exports['default'] = D3Timeline;
module.exports = exports['default'];

},{"./D3BlockTable":5,"extend":3,"inherits":4}],11:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _D3TableValueTracker = require('./D3TableValueTracker');

var _D3TableValueTracker2 = _interopRequireDefault(_D3TableValueTracker);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _extend = require('extend');

/**
 *
 * @extends {D3TableValueTracker}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3TimelineTimeTracker(options) {
    _D3TableValueTracker2['default'].call(this, options);
}

(0, _inherits2['default'])(D3TimelineTimeTracker, _D3TableValueTracker2['default']);

D3TimelineTimeTracker.prototype.defaults = (0, _extend2['default'])(true, {}, _D3TableValueTracker2['default'].prototype.defaults, {
    bemBlockName: 'timelineMarker',
    bemModifiers: ['timeTracker'],
    layout: 'vertical'
});

D3TimelineTimeTracker.prototype.timeGetter = function () {
    return new Date();
};

D3TimelineTimeTracker.prototype.timeComparator = function (a, b) {
    return this.valueComparator(a, b);
};

D3TimelineTimeTracker.prototype.setTime = function (time) {
    return this.setValue(time);
};

D3TimelineTimeTracker.prototype.setTimeline = function (timeline) {
    return this.setTable(timeline);
};

D3TimelineTimeTracker.prototype.valueGetter = function () {
    return this.timeGetter();
};

module.exports = D3TimelineTimeTracker;

},{"./D3TableValueTracker":9,"extend":3,"inherits":4}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9pbmRleC5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL3NyYy9EM0Jsb2NrVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzNELE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOzs7QUNSakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBLFlBQVksQ0FBQzs7Ozs7Ozs7dUJBRU8sV0FBVzs7Ozt3QkFDVixVQUFVOzs7O3NCQUNaLFFBQVE7Ozs7Ozs7Ozs7QUFPM0IsU0FBUyxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQzNCLHlCQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDL0I7O0FBRUQsMkJBQVMsWUFBWSx1QkFBVSxDQUFDOztBQUVoQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyx5QkFBTyxJQUFJLEVBQUUsRUFBRSxFQUFFLHFCQUFRLFNB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Q0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFM0YsUUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQ1IsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDOUIsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs7QUFFdkMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQ1IsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFM0MsUUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQ2YsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQ2hCLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUMxQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQzs7QUFFeEMsUUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEgsUUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckgsUUFBSSxDQUFDLFNB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IiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMuRDNUYWJsZSA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGUuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzQmxvY2tUYWJsZSA9IHJlcXVpcmUoJy4vc3JjL0QzQmxvY2tUYWJsZS5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUaW1lbGluZSA9IHJlcXVpcmUoJy4vc3JjL0QzVGltZWxpbmUuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGFibGVNYXJrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlTWFya2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlTW91c2VUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZU1vdXNlVHJhY2tlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZVZhbHVlVHJhY2tlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGltZWxpbmVUaW1lVHJhY2tlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcycpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgey8qKi99XG5cblx0cmV0dXJuIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmUsXG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzBdLFxuXHRcdGkgPSAxLFxuXHRcdGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0ZGVlcCA9IGZhbHNlO1xuXG5cdC8vIEhhbmRsZSBhIGRlZXAgY29weSBzaXR1YXRpb25cblx0aWYgKHR5cGVvZiB0YXJnZXQgPT09ICdib29sZWFuJykge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuXHRcdC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcblx0XHRpID0gMjtcblx0fSBlbHNlIGlmICgodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJykgfHwgdGFyZ2V0ID09IG51bGwpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAob3B0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbbmFtZV07XG5cdFx0XHRcdGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKHRhcmdldCAhPT0gY29weSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRcdGlmIChkZWVwICYmIGNvcHkgJiYgKGlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gaXNBcnJheShjb3B5KSkpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29weUlzQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvcHkgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZSBmcm9tICcuL0QzVGFibGUnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxuLyoqXG4gKlxuICogQGV4dGVuZHMge0QzVGFibGV9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNCbG9ja1RhYmxlKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlLmNhbGwodGhpcywgb3B0aW9ucyk7XG59XG5cbmluaGVyaXRzKEQzQmxvY2tUYWJsZSwgRDNUYWJsZSk7XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGUucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgY2xpcEVsZW1lbnQ6IHRydWUsXG4gICAgY2xpcEVsZW1lbnRGaWx0ZXI6IG51bGwsXG4gICAgcmVuZGVyT25BdXRvbWF0aWNTY3JvbGxJZGxlOiB0cnVlLFxuICAgIGhpZGVUaWNrc09uQXV0b21hdGljU2Nyb2xsOiBmYWxzZSxcbiAgICBhdXRvbWF0aWNTY3JvbGxTcGVlZE11bHRpcGxpZXI6IDJlLTQsXG4gICAgYXV0b21hdGljU2Nyb2xsTWFyZ2luRGVsdGE6IDMwLFxuICAgIGFwcGVuZFRleHQ6IHRydWUsXG4gICAgYWxpZ25MZWZ0OiB0cnVlLFxuICAgIGFsaWduT25UcmFuc2xhdGU6IHRydWUsXG4gICAgbWF4aW11bUNsaWNrRHJhZ1RpbWU6IDEwMCxcbiAgICBtYXhpbXVtQ2xpY2tEcmFnRGlzdGFuY2U6IDEyLFxuICAgIG1pbmltdW1EcmFnRGlzdGFuY2U6IDUsXG4gICAgdHJhY2tlZEVsZW1lbnRET01FdmVudHM6IFsnY2xpY2snLCAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJ10gLy8gbm90IGR5bmFtaWNcbn0pO1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFBhdGhJZCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENsaXBQYXRoXycgKyB0aGlzLmluc3RhbmNlTnVtYmVyICsgJ18nICsgZC51aWQ7XG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFJlY3RMaW5rID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiAnIycgKyB0aGlzLmdlbmVyYXRlQ2xpcFJlY3RJZChkKTtcbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUGF0aExpbmsgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICd1cmwoIycgKyB0aGlzLmdlbmVyYXRlQ2xpcFBhdGhJZChkKSArICcpJztcbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUmVjdElkID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50Q2xpcFJlY3RfJyArIHRoaXMuaW5zdGFuY2VOdW1iZXIgKyAnXycgKyBkLnVpZDtcbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudEVudGVyID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgZWxlbWVudEhlaWdodCA9IHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgLSB0aGlzLm9wdGlvbnMucm93UGFkZGluZyAqIDI7XG5cbiAgICB2YXIgcmVjdCA9IHNlbGVjdGlvblxuICAgICAgICAuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudEJhY2tncm91bmQnKVxuICAgICAgICAuYXR0cignaGVpZ2h0JywgZWxlbWVudEhlaWdodCk7XG5cbiAgICB2YXIgZyA9IHNlbGVjdGlvblxuICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENvbnRlbnQnKTtcblxuICAgIGcuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50Jyk7XG5cblxuICAgIHZhciBjbGlwRWxlbWVudCA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbGlwRWxlbWVudCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5jbGlwRWxlbWVudEZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2xpcEVsZW1lbnQgPSAhIXRoaXMub3B0aW9ucy5jbGlwRWxlbWVudEZpbHRlci5jYWxsKHRoaXMsIHNlbGVjdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGlwRWxlbWVudCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2xpcEVsZW1lbnQpIHtcblxuICAgICAgICBnXG4gICAgICAgICAgICAuYXR0cignY2xpcC1wYXRoJywgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoTGluay5iaW5kKHRoaXMpKTtcblxuICAgICAgICByZWN0XG4gICAgICAgICAgICAucHJvcGVydHkoJ2lkJywgdGhpcy5nZW5lcmF0ZUNsaXBSZWN0SWQuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgc2VsZWN0aW9uLmFwcGVuZCgnY2xpcFBhdGgnKVxuICAgICAgICAgICAgLnByb3BlcnR5KCdpZCcsIHRoaXMuZ2VuZXJhdGVDbGlwUGF0aElkLmJpbmQodGhpcykpXG4gICAgICAgICAgICAuYXBwZW5kKCd1c2UnKVxuICAgICAgICAgICAgLmF0dHIoJ3hsaW5rOmhyZWYnLCB0aGlzLmdlbmVyYXRlQ2xpcFJlY3RMaW5rLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucy50cmFja2VkRWxlbWVudERPTUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuICAgICAgICBzZWxlY3Rpb24ub24oZXZlbnROYW1lLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICBpZiAoIWQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OicgKyBldmVudE5hbWUsIHNlbGVjdGlvbiwgbnVsbCwgW2RdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZFRleHQpIHtcbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcudGltZWxpbmUtZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgICAgLmNsYXNzZWQoJ3RpbWVsaW5lLWVudGl0eUxhYmVsJywgdHJ1ZSlcbiAgICAgICAgICAgIC5hdHRyKCdkeScsIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQvMiArIDQpO1xuICAgIH1cblxuICAgIHNlbGVjdGlvbi5jYWxsKHRoaXMuZWxlbWVudENvbnRlbnRFbnRlci5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmluZERyYWdBbmREcm9wT25TZWxlY3Rpb24oc2VsZWN0aW9uKTtcblxufTtcblxuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRzVHJhbnNsYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBkKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZFRleHQgJiYgdGhpcy5vcHRpb25zLmFsaWduTGVmdCAmJiB0aGlzLm9wdGlvbnMuYWxpZ25PblRyYW5zbGF0ZSAmJiAhZC5fZGVmYXVsdFByZXZlbnRlZCkge1xuXG4gICAgICAgIHNlbGVjdGlvblxuICAgICAgICAgICAgLnNlbGVjdCgnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50TW92YWJsZUNvbnRlbnQnKVxuICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgTWF0aC5tYXgoLXNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhU3RhcnQoZCkpLCAyKSArICcsMCknXG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudENvbnRlbnRFbnRlciA9IGZ1bmN0aW9uKCkge307XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudENvbnRlbnRVcGRhdGUgPSBmdW5jdGlvbigpIHt9O1xuXG5cbi8vIEB0b2RvIGNsZWFuIHVwXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmJpbmREcmFnQW5kRHJvcE9uU2VsZWN0aW9uID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGJvZHlOb2RlID0gc2VsZi5lbGVtZW50cy5ib2R5Lm5vZGUoKTtcbiAgICB2YXIgZHJhZ1N0YXJ0ZWQgPSBmYWxzZTtcblxuICAgIC8vIHBvc2l0aW9uc1xuICAgIHZhciBjdXJyZW50VHJhbnNmb3JtID0gbnVsbDtcbiAgICB2YXIgb3JpZ2luVHJhbnNmb3JtU3RyaW5nID0gbnVsbDtcbiAgICB2YXIgZHJhZ1N0YXJ0WCA9IDAsIGRyYWdTdGFydFkgPSAwO1xuICAgIHZhciBlbGVtZW50U3RhcnRYID0gMCwgZWxlbWVudFN0YXJ0WSA9IDA7XG4gICAgdmFyIGRyYWdQb3NpdGlvbjtcbiAgICB2YXIgc3RhcnREcmFnUG9zaXRpb247XG5cbiAgICAvLyBtb3ZlbWVudHNcbiAgICB2YXIgdmVydGljYWxNb3ZlID0gMDtcbiAgICB2YXIgaG9yaXpvbnRhbE1vdmUgPSAwO1xuICAgIHZhciB2ZXJ0aWNhbFNwZWVkID0gMDtcbiAgICB2YXIgaG9yaXpvbnRhbFNwZWVkID0gMDtcbiAgICB2YXIgdGltZXJBY3RpdmUgPSBmYWxzZTtcbiAgICB2YXIgbmVlZFRpbWVyU3RvcCA9IGZhbHNlO1xuICAgIHZhciBzdGFydFRpbWU7XG5cbiAgICAvLyByZXNldCBzdGFydCBwb3NpdGlvbjogdG8gY2FsbCBvbiBkcmFnIHN0YXJ0IG9yIHdoZW4gdGhpbmdzIGFyZSByZWRyYXduXG4gICAgZnVuY3Rpb24gc3RvcmVTdGFydCgpIHtcbiAgICAgICAgY3VycmVudFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm1TdHJpbmcgPSBzZWxlY3Rpb24uYXR0cigndHJhbnNmb3JtJykpO1xuICAgICAgICBlbGVtZW50U3RhcnRYID0gY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMF07XG4gICAgICAgIGVsZW1lbnRTdGFydFkgPSBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXTtcbiAgICAgICAgZHJhZ1N0YXJ0WCA9IGRyYWdQb3NpdGlvblswXTtcbiAgICAgICAgZHJhZ1N0YXJ0WSA9IGRyYWdQb3NpdGlvblsxXTtcbiAgICB9XG5cbiAgICAvLyBoYW5kbGUgbmV3IGRyYWcgcG9zaXRpb24gYW5kIG1vdmUgdGhlIGVsZW1lbnRcbiAgICBmdW5jdGlvbiB1cGRhdGVUcmFuc2Zvcm0oZm9yY2VEcmF3KSB7XG5cbiAgICAgICAgdmFyIGRlbHRhWCA9IGRyYWdQb3NpdGlvblswXSAtIGRyYWdTdGFydFg7XG4gICAgICAgIHZhciBkZWx0YVkgPSBkcmFnUG9zaXRpb25bMV0gLSBkcmFnU3RhcnRZO1xuXG4gICAgICAgIGlmIChmb3JjZURyYXcgfHwgIXNlbGYub3B0aW9ucy5yZW5kZXJPbklkbGUpIHtcbiAgICAgICAgICAgIHN0b3JlU3RhcnQoZHJhZ1Bvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzBdID0gZWxlbWVudFN0YXJ0WCArIGRlbHRhWDtcbiAgICAgICAgY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMV0gPSBlbGVtZW50U3RhcnRZICsgZGVsdGFZO1xuXG4gICAgICAgIHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nLCBjdXJyZW50VHJhbnNmb3JtLnRvU3RyaW5nKCkpO1xuXG4gICAgfVxuXG4gICAgLy8gdGFrZSBtaWNybyBzZWNvbmRzIGlmIHBvc3NpYmxlXG4gICAgdmFyIGdldFByZWNpc2VUaW1lID0gd2luZG93LnBlcmZvcm1hbmNlICYmIHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICBwZXJmb3JtYW5jZS5ub3cuYmluZChwZXJmb3JtYW5jZSlcbiAgICAgICAgOiB0eXBlb2YgRGF0ZS5ub3cgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgRGF0ZS5ub3cuYmluZChEYXRlKVxuICAgICAgICAgICAgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKyhuZXcgRGF0ZSgpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAvLyBoYW5kbGUgYXV0b21hdGljIHNjcm9sbCBhcmd1bWVudHNcbiAgICBmdW5jdGlvbiBkb0F1dG9tYXRpY1Njcm9sbCh0aW1lRGVsdGEsIGZvcmNlRHJhdykge1xuXG4gICAgICAgIC8vIGNvbXB1dGUgZGVsdGFzIGJhc2VkIG9uIGRpcmVjdGlvbiwgc3BlZWQgYW5kIHRpbWUgZGVsdGFcbiAgICAgICAgdmFyIHNwZWVkTXVsdGlwbGllciA9IHNlbGYub3B0aW9ucy5hdXRvbWF0aWNTY3JvbGxTcGVlZE11bHRpcGxpZXI7XG4gICAgICAgIHZhciBkZWx0YVggPSBob3Jpem9udGFsTW92ZSAqIGhvcml6b250YWxTcGVlZCAqIHRpbWVEZWx0YSAqIHNwZWVkTXVsdGlwbGllcjtcbiAgICAgICAgdmFyIGRlbHRhWSA9IHZlcnRpY2FsTW92ZSAqIHZlcnRpY2FsU3BlZWQgKiB0aW1lRGVsdGEgKiBzcGVlZE11bHRpcGxpZXI7XG5cbiAgICAgICAgLy8gdGFrZSBncm91cCB0cmFuc2xhdGUgY2FuY2VsbGF0aW9uIHdpdGggZm9yY2VkIHJlZHJhdyBpbnRvIGFjY291bnQsIHNvIHJlZGVmaW5lIHN0YXJ0XG4gICAgICAgIGlmIChmb3JjZURyYXcpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUuc2xpY2UoMCk7XG4gICAgICAgICAgICBlbGVtZW50U3RhcnRYICs9IGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdO1xuICAgICAgICAgICAgZWxlbWVudFN0YXJ0WSArPSBjdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVsxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZWFsTW92ZSA9IHNlbGYubW92ZShkZWx0YVgsIGRlbHRhWSwgZm9yY2VEcmF3LCBmYWxzZSwgIXNlbGYub3B0aW9ucy5oaWRlVGlja3NPbkF1dG9tYXRpY1Njcm9sbCk7XG5cbiAgICAgICAgaWYgKHJlYWxNb3ZlWzJdIHx8IHJlYWxNb3ZlWzNdKSB7XG4gICAgICAgICAgICB1cGRhdGVUcmFuc2Zvcm0oZm9yY2VEcmF3KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnRTdGFydFggLT0gcmVhbE1vdmVbMl07XG4gICAgICAgIGVsZW1lbnRTdGFydFkgLT0gcmVhbE1vdmVbM107XG5cbiAgICAgICAgbmVlZFRpbWVyU3RvcCA9IHJlYWxNb3ZlWzJdID09PSAwICYmIHJlYWxNb3ZlWzNdID09PSAwO1xuICAgIH1cblxuXG4gICAgdmFyIGRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgICAgLm9uKCdkcmFnc3RhcnQnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCkge1xuICAgICAgICAgICAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdGFydERyYWdQb3NpdGlvbiA9IGRyYWdQb3NpdGlvbiA9IGQzLm1vdXNlKGJvZHlOb2RlKTtcblxuICAgICAgICAgICAgc3RhcnRUaW1lID0gK25ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHN0b3JlU3RhcnQoKTtcblxuICAgICAgICAgICAgZGF0YS5fZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLl9mcm96ZW5VaWRzLnB1c2goZGF0YS51aWQpO1xuXG4gICAgICAgIH0pXG4gICAgICAgIC5vbignZHJhZycsIGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgZHJhZ1Bvc2l0aW9uID0gZDMubW91c2UoYm9keU5vZGUpO1xuXG4gICAgICAgICAgICBpZiAoIWRyYWdTdGFydGVkKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGltZURlbHRhID0gK25ldyBEYXRlKCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsRGVsdGFYID0gZHJhZ1Bvc2l0aW9uWzBdIC0gc3RhcnREcmFnUG9zaXRpb25bMF07XG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsRGVsdGFZID0gZHJhZ1Bvc2l0aW9uWzFdIC0gc3RhcnREcmFnUG9zaXRpb25bMV07XG4gICAgICAgICAgICAgICAgdmFyIGRyYWdEaXN0YW5jZSA9IE1hdGguc3FydCh0b3RhbERlbHRhWCp0b3RhbERlbHRhWCt0b3RhbERlbHRhWSp0b3RhbERlbHRhWSk7XG5cbiAgICAgICAgICAgICAgICBkcmFnU3RhcnRlZCA9ICh0aW1lRGVsdGEgPiBzZWxmLm9wdGlvbnMubWF4aW11bUNsaWNrRHJhZ1RpbWUgfHwgZHJhZ0Rpc3RhbmNlID4gc2VsZi5vcHRpb25zLm1heGltdW1DbGlja0RyYWdEaXN0YW5jZSkgJiYgZHJhZ0Rpc3RhbmNlID4gc2VsZi5vcHRpb25zLm1pbmltdW1EcmFnRGlzdGFuY2U7XG5cbiAgICAgICAgICAgICAgICBpZiAoZHJhZ1N0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnc3RhcnQnLCBzZWxlY3Rpb24sIG51bGwsIFtkYXRhXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZHJhZ1N0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OmRyYWcnLCBzZWxlY3Rpb24sIG51bGwsIFtkYXRhXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBtYXJnaW5EZWx0YSA9IHNlbGYub3B0aW9ucy5hdXRvbWF0aWNTY3JvbGxNYXJnaW5EZWx0YTtcbiAgICAgICAgICAgIHZhciBkUmlnaHQgPSBtYXJnaW5EZWx0YSAtIChzZWxmLmRpbWVuc2lvbnMud2lkdGggLSBkcmFnUG9zaXRpb25bMF0pO1xuICAgICAgICAgICAgdmFyIGRMZWZ0ID0gbWFyZ2luRGVsdGEgLSBkcmFnUG9zaXRpb25bMF07XG4gICAgICAgICAgICB2YXIgZEJvdHRvbSA9IG1hcmdpbkRlbHRhIC0gKHNlbGYuZGltZW5zaW9ucy5oZWlnaHQgLSBkcmFnUG9zaXRpb25bMV0pO1xuICAgICAgICAgICAgdmFyIGRUb3AgPSBtYXJnaW5EZWx0YSAtIGRyYWdQb3NpdGlvblsxXTtcblxuICAgICAgICAgICAgaG9yaXpvbnRhbFNwZWVkID0gTWF0aC5wb3coTWF0aC5tYXgoZFJpZ2h0LCBkTGVmdCwgbWFyZ2luRGVsdGEpLCAyKTtcbiAgICAgICAgICAgIHZlcnRpY2FsU3BlZWQgPSBNYXRoLnBvdyhNYXRoLm1heChkQm90dG9tLCBkVG9wLCBtYXJnaW5EZWx0YSksIDIpO1xuXG4gICAgICAgICAgICB2YXIgcHJldmlvdXNIb3Jpem9udGFsTW92ZSA9IGhvcml6b250YWxNb3ZlO1xuICAgICAgICAgICAgdmFyIHByZXZpb3VzVmVydGljYWxNb3ZlID0gdmVydGljYWxNb3ZlO1xuICAgICAgICAgICAgaG9yaXpvbnRhbE1vdmUgPSBkUmlnaHQgPiAwID8gLTEgOiBkTGVmdCA+IDAgPyAxIDogMDtcbiAgICAgICAgICAgIHZlcnRpY2FsTW92ZSA9IGRCb3R0b20gPiAwID8gLTEgOiBkVG9wID4gMCA/IDEgOiAwO1xuXG4gICAgICAgICAgICB2YXIgaGFzQ2hhbmdlZFN0YXRlID0gcHJldmlvdXNIb3Jpem9udGFsTW92ZSAhPT0gaG9yaXpvbnRhbE1vdmUgfHwgcHJldmlvdXNWZXJ0aWNhbE1vdmUgIT09IHZlcnRpY2FsTW92ZTtcblxuICAgICAgICAgICAgaWYgKChob3Jpem9udGFsTW92ZSB8fCB2ZXJ0aWNhbE1vdmUpICYmICF0aW1lckFjdGl2ZSAmJiBoYXNDaGFuZ2VkU3RhdGUpIHtcblxuICAgICAgICAgICAgICAgIHZhciB0aW1lclN0YXJ0VGltZSA9IGdldFByZWNpc2VUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICB0aW1lckFjdGl2ZSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBkMy50aW1lcihmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFRpbWUgPSBnZXRQcmVjaXNlVGltZSgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZURlbHRhID0gY3VycmVudFRpbWUgLSB0aW1lclN0YXJ0VGltZTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZXJXaWxsU3RvcCA9ICF2ZXJ0aWNhbE1vdmUgJiYgIWhvcml6b250YWxNb3ZlIHx8IG5lZWRUaW1lclN0b3A7XG5cbiAgICAgICAgICAgICAgICAgICAgZG9BdXRvbWF0aWNTY3JvbGwodGltZURlbHRhLCBzZWxmLm9wdGlvbnMucmVuZGVyT25BdXRvbWF0aWNTY3JvbGxJZGxlICYmIHRpbWVyV2lsbFN0b3ApO1xuXG4gICAgICAgICAgICAgICAgICAgIHRpbWVyU3RhcnRUaW1lID0gY3VycmVudFRpbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVyV2lsbFN0b3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lZWRUaW1lclN0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVyQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXJXaWxsU3RvcDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNlbGYuX2RyYWdBRikge1xuICAgICAgICAgICAgICAgIHNlbGYuY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2VsZi5fZHJhZ0FGKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5fZHJhZ0FGID0gc2VsZi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlVHJhbnNmb3JtKTtcblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2RyYWdlbmQnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIHNlbGYuY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2VsZi5fZHJhZ0FGKTtcbiAgICAgICAgICAgIHNlbGYuX2RyYWdBRiA9IG51bGw7XG4gICAgICAgICAgICBob3Jpem9udGFsTW92ZSA9IDA7XG4gICAgICAgICAgICB2ZXJ0aWNhbE1vdmUgPSAwO1xuXG4gICAgICAgICAgICBkYXRhLl9kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgICAgICAgICBzZWxmLl9mcm96ZW5VaWRzLnNwbGljZShzZWxmLl9mcm96ZW5VaWRzLmluZGV4T2YoZGF0YS51aWQpLCAxKTtcblxuICAgICAgICAgICAgZDMudGltZXIuZmx1c2goKTtcblxuICAgICAgICAgICAgdmFyIGRlbHRhRnJvbVRvcExlZnRDb3JuZXIgPSBkMy5tb3VzZShzZWxlY3Rpb24ubm9kZSgpKTtcbiAgICAgICAgICAgIHZhciBoYWxmSGVpZ2h0ID0gc2VsZi5vcHRpb25zLnJvd0hlaWdodCAvIDI7XG4gICAgICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLmF0dHIoJ3RyYW5zZm9ybScsIG51bGwpO1xuXG4gICAgICAgICAgICBpZiAoZHJhZ1N0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OmRyYWdlbmQnLCBzZWxlY3Rpb24sIFstZGVsdGFGcm9tVG9wTGVmdENvcm5lclswXSwgLWRlbHRhRnJvbVRvcExlZnRDb3JuZXJbMV0gKyBoYWxmSGVpZ2h0XSwgW2RhdGFdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uLmF0dHIoJ3RyYW5zZm9ybScsIG9yaWdpblRyYW5zZm9ybVN0cmluZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGZcbiAgICAgICAgICAgICAgICAudXBkYXRlWSgpXG4gICAgICAgICAgICAgICAgLmRyYXdZQXhpcygpO1xuXG4gICAgICAgICAgICBkcmFnU3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgIHNlbGVjdGlvbi5jYWxsKGRyYWcpO1xuXG59O1xuXG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudFVwZGF0ZSA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZCwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLndyYXBXaXRoQW5pbWF0aW9uKHNlbGVjdGlvbi5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudEJhY2tncm91bmQnKSwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICB5OiB0aGlzLm9wdGlvbnMucm93UGFkZGluZyxcbiAgICAgICAgICAgIHdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhRW5kKGQpKSAtIHNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhU3RhcnQoZCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRUZXh0ICYmIHRoaXMub3B0aW9ucy5hbGlnbkxlZnQgJiYgIWQuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBkID0+ICd0cmFuc2xhdGUoJyArIE1hdGgubWF4KC10aGlzLnNjYWxlcy54KHRoaXMuZ2V0RGF0YVN0YXJ0KGQpKSwgMikgKyAnLDApJyk7XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudENvbnRlbnRVcGRhdGUoc2VsZWN0aW9uLCBkLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH0pO1xuXG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRFeGl0ID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7XG5cbiAgICBzZWxlY3Rpb24ub24oJ2NsaWNrJywgbnVsbCk7XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEQzQmxvY2tUYWJsZTtcbiIsIi8qIGdsb2JhbCBjYW5jZWxBbmltYXRpb25GcmFtZSwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMvZXZlbnRzJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEM1RhYmxlUm93XG4gKiBAcHJvcGVydHkge1N0cmluZ3xOdW1iZXJ9IGlkXG4gKiBAcHJvcGVydHkge1N0cmluZ30gbmFtZVxuICogQHByb3BlcnR5IHtBcnJheTxEM1RhYmxlRWxlbWVudD59IGVsZW1lbnRzXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEM1RhYmxlRWxlbWVudFxuICogQHByb3BlcnR5IHtTdHJpbmd8TnVtYmVyfSBpZFxuICogQHByb3BlcnR5IHtTdHJpbmd8TnVtYmVyfSB1aWRcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBzdGFydFxuICogQHByb3BlcnR5IHtOdW1iZXJ9IGVuZFxuICogQHByb3BlcnR5IHtOdW1iZXJ9IFtyb3dJbmRleF1cbiAqL1xuXG5cbi8qKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RhYmxlKG9wdGlvbnMpIHtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgRDNUYWJsZS5pbnN0YW5jZXNDb3VudCArPSAxO1xuXG4gICAgdGhpcy5pbnN0YW5jZU51bWJlciA9IEQzVGFibGUuaW5zdGFuY2VzQ291bnQ7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQodHJ1ZSwge30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXk8RDNUYWJsZVJvdz59XG4gICAgICovXG4gICAgdGhpcy5kYXRhID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXk8RDNUYWJsZUVsZW1lbnQ+fVxuICAgICAqL1xuICAgIHRoaXMuZmxhdHRlbmVkRGF0YSA9IFtdO1xuXG5cbiAgICB0aGlzLm1hcmdpbiA9IHtcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICByaWdodDogMCxcbiAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICBsZWZ0OiAwXG4gICAgfTtcblxuICAgIHRoaXMuZGltZW5zaW9ucyA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuXG4gICAgdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IFswLjAsIDAuMF07XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG5cbiAgICB0aGlzLmVsZW1lbnRzID0ge1xuICAgICAgICBib2R5OiBudWxsLFxuICAgICAgICBpbm5lckNvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgeEF4aXNDb250YWluZXI6IG51bGwsXG4gICAgICAgIHgyQXhpc0NvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgeUF4aXNDb250YWluZXI6IG51bGwsXG4gICAgICAgIGRlZnM6IG51bGwsXG4gICAgICAgIGNsaXA6IG51bGxcbiAgICB9O1xuXG4gICAgdGhpcy5zY2FsZXMgPSB7XG4gICAgICAgIHg6IG51bGwsXG4gICAgICAgIHk6IG51bGxcbiAgICB9O1xuXG4gICAgdGhpcy5heGlzZXMgPSB7XG4gICAgICAgIHg6IG51bGwsXG4gICAgICAgIHgyOiBudWxsLFxuICAgICAgICB5OiBudWxsXG4gICAgfTtcblxuICAgIHRoaXMuYmVoYXZpb3JzID0ge1xuICAgICAgICB6b29tOiBudWxsLFxuICAgICAgICB6b29tWDogbnVsbCxcbiAgICAgICAgem9vbVk6IG51bGwsXG4gICAgICAgIHBhbjogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSBudWxsO1xuXG4gICAgdGhpcy5feVNjYWxlID0gMC4wO1xuICAgIHRoaXMuX2RhdGFDaGFuZ2VDb3VudCA9IDA7XG4gICAgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID0gMDtcbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGggPSAwO1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQgPSAwO1xuICAgIHRoaXMuX3ByZXZlbnREcmF3aW5nID0gZmFsc2U7XG4gICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMgPSBbXTtcbiAgICB0aGlzLl9tYXhCb2R5SGVpZ2h0ID0gSW5maW5pdHk7XG4gICAgdGhpcy5fZnJvemVuVWlkcyA9IFtdO1xufVxuXG5pbmhlcml0cyhEM1RhYmxlLCBFdmVudEVtaXR0ZXIpO1xuXG5EM1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcbiAgICBiZW1CbG9ja05hbWU6ICd0YWJsZScsXG4gICAgYmVtQmxvY2tNb2RpZmllcjogJycsXG4gICAgeEF4aXNIZWlnaHQ6IDUwLFxuICAgIHlBeGlzV2lkdGg6IDUwLFxuICAgIHJvd0hlaWdodDogMzAsXG4gICAgcm93UGFkZGluZzogNSxcbiAgICB0aWNrUGFkZGluZzogMjAsXG4gICAgY29udGFpbmVyOiAnYm9keScsXG4gICAgY3VsbGluZ1g6IHRydWUsXG4gICAgY3VsbGluZ1k6IHRydWUsXG4gICAgY3VsbGluZ0Rpc3RhbmNlOiAxLFxuICAgIHJlbmRlck9uSWRsZTogdHJ1ZSxcbiAgICBoaWRlVGlja3NPblpvb206IGZhbHNlLFxuICAgIGhpZGVUaWNrc09uRHJhZzogZmFsc2UsXG4gICAgcGFuWU9uV2hlZWw6IHRydWUsXG4gICAgd2hlZWxNdWx0aXBsaWVyOiAxLFxuICAgIGVuYWJsZVlUcmFuc2l0aW9uOiB0cnVlLFxuICAgIGVuYWJsZVRyYW5zaXRpb25PbkV4aXQ6IHRydWUsXG4gICAgdXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtOiBmYWxzZSxcbiAgICB0cmFuc2l0aW9uRWFzaW5nOiAncXVhZC1pbi1vdXQnLFxuICAgIHhBeGlzVGlja3NGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgfSxcbiAgICB4QXhpc1N0cm9rZVdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkJTIgPyAxIDogMjtcbiAgICB9LFxuICAgIHhBeGlzMlRpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9LFxuICAgIHlBeGlzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkICYmIGQubmFtZSB8fCAnJztcbiAgICB9LFxuICAgIHBhZGRpbmc6IDEwLFxuICAgIHRyYWNrZWRET01FdmVudHM6IFsnY2xpY2snLCAnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZScsICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXSAvLyBub3QgZHluYW1pY1xufTtcblxuRDNUYWJsZS5pbnN0YW5jZXNDb3VudCA9IDA7XG5cbkQzVGFibGUucHJvdG90eXBlLm5vb3AgPSBmdW5jdGlvbigpIHt9O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBjb250YWluZXJcbiAgICB0aGlzLmNvbnRhaW5lciA9IGQzLnNlbGVjdCh0aGlzLm9wdGlvbnMuY29udGFpbmVyKS5hcHBlbmQoJ3N2ZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAodGhpcy5vcHRpb25zLmJlbUJsb2NrTW9kaWZpZXIgPyAnICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTW9kaWZpZXIgOiAnJykpO1xuXG4gICAgLy8gZGVmc1xuICAgIHRoaXMuZWxlbWVudHMuZGVmcyA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZGVmcycpO1xuXG4gICAgLy8gY2xpcCByZWN0IGluIGRlZnNcbiAgICB2YXIgY2xpcElkID0gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm9keUNsaXBQYXRoLS0nICsgRDNUYWJsZS5pbnN0YW5jZXNDb3VudDtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXAgPSB0aGlzLmVsZW1lbnRzLmRlZnMuYXBwZW5kKCdjbGlwUGF0aCcpXG4gICAgICAgIC5wcm9wZXJ0eSgnaWQnLCBjbGlwSWQpO1xuICAgIHRoaXMuZWxlbWVudHMuY2xpcFxuICAgICAgICAuYXBwZW5kKCdyZWN0Jyk7XG5cbiAgICAvLyBzdXJyb3VuZGluZyByZWN0XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnLCB0cnVlKTtcblxuICAgIC8vIGF4aXNlcyBjb250YWluZXJzXG4gICAgdGhpcy5lbGVtZW50cy54QXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXgnKTtcblxuICAgIHRoaXMuZWxlbWVudHMueDJBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teCAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0tc2Vjb25kYXJ5Jyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teScpO1xuXG4gICAgLy8gYm9keSBjb250YWluZXIgaW5uZXIgY29udGFpbmVyIGFuZCBzdXJyb3VuZGluZyByZWN0XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5ID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoIycgKyBjbGlwSWQgKyAnKScpO1xuXG4gICAgLy8gc3Vycm91bmRpbmcgcmVjdFxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuY2xhc3NlZCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcsIHRydWUpO1xuXG4gICAgLy8gaW5uZXIgY29udGFpbmVyXG4gICAgdGhpcy5lbGVtZW50cy5pbm5lckNvbnRhaW5lciA9IHRoaXMuZWxlbWVudHMuYm9keS5hcHBlbmQoJ2cnKTtcblxuICAgIC8vIHN1cnJvdW5kaW5nIHJlY3RcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0JywgdHJ1ZSk7XG5cbiAgICB0aGlzLnVwZGF0ZU1hcmdpbnMoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUQzSW5zdGFuY2VzKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVFdmVudExpc3RlbmVycygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS54U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUueVNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmluaXRpYWxpemVEM0luc3RhbmNlcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5zY2FsZXMueCA9IHRoaXMueFNjYWxlRmFjdG9yeSgpO1xuXG4gICAgdGhpcy5zY2FsZXMueSA9IHRoaXMueVNjYWxlRmFjdG9yeSgpO1xuXG4gICAgdGhpcy5heGlzZXMueCA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgLnNjYWxlKHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5vcmllbnQoJ3RvcCcpXG4gICAgICAgIC50aWNrRm9ybWF0KHRoaXMub3B0aW9ucy54QXhpc1RpY2tzRm9ybWF0dGVyLmJpbmQodGhpcykpXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApXG4gICAgICAgIC50aWNrUGFkZGluZyh0aGlzLm9wdGlvbnMudGlja1BhZGRpbmcpO1xuXG4gICAgdGhpcy5heGlzZXMueDIgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy54KVxuICAgICAgICAub3JpZW50KCd0b3AnKVxuICAgICAgICAudGlja0Zvcm1hdCh0aGlzLm9wdGlvbnMueEF4aXMyVGlja3NGb3JtYXR0ZXIuYmluZCh0aGlzKSlcbiAgICAgICAgLm91dGVyVGlja1NpemUoMClcbiAgICAgICAgLmlubmVyVGlja1NpemUoMCk7XG5cbiAgICB0aGlzLmF4aXNlcy55ID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAuc2NhbGUodGhpcy5zY2FsZXMueSlcbiAgICAgICAgLm9yaWVudCgnbGVmdCcpXG4gICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9pc1JvdW5kKGQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYub3B0aW9ucy55QXhpc0Zvcm1hdHRlcihzZWxmLmRhdGFbKGR8MCldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAub3V0ZXJUaWNrU2l6ZSgwKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20gPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pXG4gICAgICAgIC5vbignem9vbScsIHRoaXMuaGFuZGxlWm9vbWluZy5iaW5kKHRoaXMpKVxuICAgICAgICAub24oJ3pvb21lbmQnLCB0aGlzLmhhbmRsZVpvb21pbmdFbmQuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWCA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAueCh0aGlzLnNjYWxlcy54KVxuICAgICAgICAuc2NhbGUoMSlcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkgPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAgICAgLnkodGhpcy5zY2FsZXMueSlcbiAgICAgICAgLnNjYWxlKDEpXG4gICAgICAgIC5zY2FsZUV4dGVudChbMSwgMV0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMucGFuID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgIC5vbignZHJhZycsIHRoaXMuaGFuZGxlRHJhZ2dpbmcuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuY2FsbCh0aGlzLmJlaGF2aW9ycy5wYW4pO1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5jYWxsKHRoaXMuYmVoYXZpb3JzLnpvb20pO1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdGhpcy5fbGFzdFNjYWxlID0gdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuaW5pdGlhbGl6ZUV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLm9wdGlvbnMudHJhY2tlZERPTUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuICAgICAgICBzZWxmLmVsZW1lbnRzLmJvZHkub24oZXZlbnROYW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChldmVudE5hbWUgIT09ICdjbGljaycgfHwgIWQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYgZDMuc2VsZWN0KGQzLmV2ZW50LnRhcmdldCkuY2xhc3NlZChzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudChldmVudE5hbWUsIHNlbGYuZWxlbWVudHMuYm9keSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5lbWl0RGV0YWlsZWRFdmVudCA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgZDNUYXJnZXRTZWxlY3Rpb24sIGRlbHRhLCBwcmlvcml0eUFyZ3VtZW50cywgZXh0cmFBcmd1bWVudHMpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwb3NpdGlvbjtcblxuICAgIHZhciBnZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXBvc2l0aW9uKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGQzLm1vdXNlKHNlbGYuZWxlbWVudHMuYm9keS5ub2RlKCkpO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGVsdGEpKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25bMF0gKz0gZGVsdGFbMF07XG4gICAgICAgICAgICAgICAgcG9zaXRpb25bMV0gKz0gZGVsdGFbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH07XG5cbiAgICB2YXIgYXJncyA9IFtcbiAgICAgICAgdGhpcywgLy8gdGhlIHRhYmxlIGluc3RhbmNlXG4gICAgICAgIGQzVGFyZ2V0U2VsZWN0aW9uLCAvLyB0aGUgZDMgc2VsZWN0aW9uIHRhcmdldGVkXG4gICAgICAgIGQzLmV2ZW50LCAvLyB0aGUgZDMgZXZlbnRcbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29sdW1uKCkge1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy54LmludmVydChwb3NpdGlvblswXSk7XG4gICAgICAgIH0sIC8vIGEgY29sdW1uIGdldHRlclxuICAgICAgICBmdW5jdGlvbiBnZXRSb3coKSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBnZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLnkuaW52ZXJ0KHBvc2l0aW9uWzFdKTtcbiAgICAgICAgfSAvLyBhIHJvdyBnZXR0ZXJcbiAgICBdO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocHJpb3JpdHlBcmd1bWVudHMpKSB7XG4gICAgICAgIGFyZ3MgPSBwcmlvcml0eUFyZ3VtZW50cy5jb25jYXQoYXJncyk7XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZXh0cmFBcmd1bWVudHMpKSB7XG4gICAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChleHRyYUFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgYXJncy51bnNoaWZ0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOicgKyBldmVudE5hbWUpOyAvLyB0aGUgZXZlbnQgbmFtZVxuXG4gICAgdGhpcy5lbWl0LmFwcGx5KHRoaXMsIGFyZ3MpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlTWFyZ2lucyA9IGZ1bmN0aW9uKHVwZGF0ZURpbWVuc2lvbnMpIHtcblxuICAgIHRoaXMubWFyZ2luID0ge1xuICAgICAgICB0b3A6IHRoaXMub3B0aW9ucy54QXhpc0hlaWdodCArIHRoaXMub3B0aW9ucy5wYWRkaW5nLFxuICAgICAgICByaWdodDogdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIGJvdHRvbTogdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIGxlZnQ6IHRoaXMub3B0aW9ucy55QXhpc1dpZHRoICsgdGhpcy5vcHRpb25zLnBhZGRpbmdcbiAgICB9O1xuXG4gICAgdmFyIGNvbnRlbnRQb3NpdGlvbiA9IHsgeDogdGhpcy5tYXJnaW4ubGVmdCwgeTogdGhpcy5tYXJnaW4udG9wIH07XG4gICAgdmFyIGNvbnRlbnRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyB0aGlzLm1hcmdpbi5sZWZ0ICsgJywnICsgdGhpcy5tYXJnaW4udG9wICsgJyknO1xuXG4gICAgdGhpcy5jb250YWluZXIuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcpXG4gICAgICAgIC5hdHRyKGNvbnRlbnRQb3NpdGlvbik7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHlcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGNvbnRlbnRUcmFuc2Zvcm0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy54QXhpc0NvbnRhaW5lclxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLngyQXhpc0NvbnRhaW5lclxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyB0aGlzLm1hcmdpbi5sZWZ0ICsgJywnICsgdGhpcy5tYXJnaW4udG9wICsgJyknKTtcblxuICAgIGlmICh1cGRhdGVEaW1lbnNpb25zKSB7XG4gICAgICAgIHRoaXMudXBkYXRlWCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVkoKTtcbiAgICB9XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpkZXN0cm95JywgdGhpcyk7XG5cbiAgICAvLyByZW1vdmUgYmVoYXZpb3IgbGlzdGVuZXJzXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS5vbignem9vbScsIG51bGwpO1xuXG4gICAgLy8gcmVtb3ZlIGRvbSBsaXN0ZW5lcnNcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkub24oJy56b29tJywgbnVsbCk7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5Lm9uKCdjbGljaycsIG51bGwpO1xuXG4gICAgLy8gcmVtb3ZlIHJlZmVyZW5jZXNcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5lbGVtZW50cyA9IG51bGw7XG4gICAgdGhpcy5zY2FsZXMgPSBudWxsO1xuICAgIHRoaXMuYXhpc2VzID0gbnVsbDtcbiAgICB0aGlzLmJlaGF2aW9ycyA9IG51bGw7XG4gICAgdGhpcy5kYXRhID0gbnVsbDtcbiAgICB0aGlzLmZsYXR0ZW5lZERhdGEgPSBudWxsO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOmRlc3Ryb3llZCcsIHRoaXMpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUucmVzdG9yZVpvb20gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSh0aGlzLl9sYXN0VHJhbnNsYXRlKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKHRoaXMuX2xhc3RTY2FsZSk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oZHgsIGR5LCBmb3JjZURyYXcsIHNraXBYQXhpcywgZm9yY2VUaWNrcykge1xuXG4gICAgdmFyIGN1cnJlbnRUcmFuc2xhdGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpO1xuICAgIHZhciB1cGRhdGVkVCA9IFtjdXJyZW50VHJhbnNsYXRlWzBdICsgZHgsIGN1cnJlbnRUcmFuc2xhdGVbMV0gKyBkeV07XG5cbiAgICB1cGRhdGVkVCA9IHRoaXMuX2NsYW1wVHJhbnNsYXRpb25XaXRoU2NhbGUodXBkYXRlZFQsIFt0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCksIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnNjYWxlKCldKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkudHJhbnNsYXRlKHVwZGF0ZWRUKTtcblxuICAgIHRoaXMubW92ZUVsZW1lbnRzKGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVDtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJyk7XG5cbiAgICByZXR1cm4gdXBkYXRlZFQuY29uY2F0KFt1cGRhdGVkVFswXSAtIGN1cnJlbnRUcmFuc2xhdGVbMF0sIHVwZGF0ZWRUWzFdIC0gY3VycmVudFRyYW5zbGF0ZVsxXV0pO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZW5zdXJlSW5Eb21haW5zID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubW92ZSgwLCAwLCBmYWxzZSwgZmFsc2UsIHRydWUpO1xufTtcblxuLyoqXG4gKiBwYW4gWC9ZICYgem9vbSBYIGhhbmRsZXIgKGNsYW1wZWQgcGFuIFkgd2hlbiB3aGVlbCBpcyBwcmVzc2VkIHdpdGhvdXQgY3RybCwgem9vbSBYIGFuZCBwYW4gWC9ZIG90aGVyd2lzZSlcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlWm9vbWluZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmICFkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5ICYmICEoZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID49IDIpKSB7XG4gICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC50eXBlID09PSAnd2hlZWwnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBhbllPbldoZWVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlWm9vbSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlV2hlZWxpbmcoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlc3RvcmVab29tKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdCA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdmFyIHVwZGF0ZWRUID0gW3RbMF0sIHRoaXMuX2xhc3RUcmFuc2xhdGVbMV1dO1xuXG4gICAgdXBkYXRlZFQgPSB0aGlzLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlKHVwZGF0ZWRULCBbdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpLCB0aGlzLmJlaGF2aW9ycy56b29tWS5zY2FsZSgpXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVgudHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuXG4gICAgdGhpcy5tb3ZlRWxlbWVudHModHJ1ZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25ab29tKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVDtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScpO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVab29taW5nRW5kID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuICAgIHRoaXMubW92ZUVsZW1lbnRzKHRydWUpO1xuICAgIHRoaXMuZHJhd1lBeGlzKCk7XG4gICAgdGhpcy5kcmF3WEF4aXMoKTtcbn07XG5cbi8qKlxuICogd2hlZWwgaGFuZGxlciAoY2xhbXBlZCBwYW4gWSlcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlV2hlZWxpbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBldmVudCA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50O1xuXG4gICAgdmFyIGR4ID0gMCwgZHkgPSAwO1xuXG4gICAgdmFyIG1vdmluZ1ggPSBldmVudCAmJiBldmVudC53aGVlbERlbHRhWCB8fCBldmVudC5kZWx0YVg7XG5cbiAgICBpZiAobW92aW5nWCkge1xuXG4gICAgICAgIHZhciBtb3ZpbmdSaWdodCA9IGV2ZW50LndoZWVsRGVsdGFYID4gMCB8fCBldmVudC5kZWx0YVggPCAwO1xuICAgICAgICBkeCA9IChtb3ZpbmdSaWdodCA/IDEgOiAtMSkgKiB0aGlzLmNvbHVtbldpZHRoICogdGhpcy5vcHRpb25zLndoZWVsTXVsdGlwbGllcjtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdmFyIG1vdmluZ1kgPSBldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LndoZWVsRGVsdGFZIHx8IGV2ZW50LmRldGFpbCB8fCBldmVudC5kZWx0YVk7XG5cbiAgICAgICAgaWYgKG1vdmluZ1kpIHtcbiAgICAgICAgICAgIHZhciBtb3ZpbmdEb3duID0gZXZlbnQud2hlZWxEZWx0YSA+IDAgfHwgZXZlbnQud2hlZWxEZWx0YVkgPiAwIHx8IGV2ZW50LmRldGFpbCA8IDAgfHwgZXZlbnQuZGVsdGFZIDwgMDtcbiAgICAgICAgICAgIGR5ID0gbW92aW5nWSA/IChtb3ZpbmdEb3duID8gMSA6IC0xKSAqIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgKiB0aGlzLm9wdGlvbnMud2hlZWxNdWx0aXBsaWVyIDogMDtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgdGhpcy5tb3ZlKGR4LCBkeSwgZmFsc2UsICFtb3ZpbmdYKTtcblxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlRHJhZ2dpbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b3VjaGVzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm1vdmUoZDMuZXZlbnQuZHgsIGQzLmV2ZW50LmR5LCBmYWxzZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25EcmFnKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnRvZ2dsZURyYXdpbmcgPSBmdW5jdGlvbihhY3RpdmUpIHtcblxuICAgIHRoaXMuX3ByZXZlbnREcmF3aW5nID0gdHlwZW9mIGFjdGl2ZSA9PT0gJ2Jvb2xlYW4nID8gIWFjdGl2ZSA6ICF0aGlzLl9wcmV2ZW50RHJhd2luZztcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtBcnJheTxEM1RhYmxlUm93Pn0gZGF0YVxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFthbmltYXRlWV1cbiAqIEByZXR1cm5zIHtEM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24oZGF0YSwgdHJhbnNpdGlvbkR1cmF0aW9uLCBhbmltYXRlWSkge1xuXG4gICAgdGhpcy5fZGF0YUNoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNTaXplQ2hhbmdpbmcgPSBkYXRhLmxlbmd0aCAhPT0gdGhpcy5kYXRhLmxlbmd0aDtcblxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICB0aGlzLmdlbmVyYXRlRmxhdHRlbmVkRGF0YSgpO1xuXG4gICAgaWYgKGlzU2l6ZUNoYW5naW5nIHx8IHRoaXMuX2RhdGFDaGFuZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgICAgICAudXBkYXRlWShhbmltYXRlWSA/IHRyYW5zaXRpb25EdXJhdGlvbiA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd0VsZW1lbnRzKHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICogQHJldHVybnMge0FycmF5PEQzVGFibGVSb3c+fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZURhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiB0aGlzLmRhdGEubWFwKGZ1bmN0aW9uKGQpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge0QzVGFibGVSb3d9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0ge307XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIGQpIHtcbiAgICAgICAgICAgIGlmIChkLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAnZWxlbWVudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc1trZXldID0gZFtrZXldO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc1trZXldID0gZFtrZXldLm1hcChzZWxmLmNsb25lRWxlbWVudC5iaW5kKHNlbGYpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKiBAcmV0dXJucyB7QXJyYXk8RDNUYWJsZUVsZW1lbnQ+fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5mbGF0dGVuZWREYXRhLm1hcChmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtEM1RhYmxlRWxlbWVudH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSB7fTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZSkge1xuICAgICAgICAgICAgaWYgKGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHJlc1trZXldID0gZVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICogQHJldHVybnMge0QzVGFibGVFbGVtZW50fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZUVsZW1lbnQgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RDNUYWJsZUVsZW1lbnR9XG4gICAgICovXG4gICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgZm9yICh2YXIga2V5IGluIGUpIHtcbiAgICAgICAgaWYgKGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgcmVzW2tleV0gPSBlW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RWxlbWVudFJvdyA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmluZCh0aGlzLmRhdGEsIGZ1bmN0aW9uKHJvdykge1xuICAgICAgICByZXR1cm4gcm93LmVsZW1lbnRzLmluZGV4T2YoZCkgIT09IC0xO1xuICAgIH0pO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuc3RvcmVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wcmV2aW91c0ZsYXR0ZW5lZERhdGEgPSB0aGlzLmNsb25lRmxhdHRlbmVkRGF0YSgpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybSkge1xuICAgICAgICB0aGlzLnN0b3JlRmxhdHRlbmVkRGF0YSgpO1xuICAgIH1cblxuICAgIHRoaXMuZmxhdHRlbmVkRGF0YS5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5kYXRhLmZvckVhY2goZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICBkLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5yb3dJbmRleCA9IGk7XG4gICAgICAgICAgICBpZiAoc2VsZi5fZnJvemVuVWlkcy5pbmRleE9mKGVsZW1lbnQudWlkKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9kZWZhdWx0UHJldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuZmxhdHRlbmVkRGF0YS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gbWluWFxuICogQHBhcmFtIHtEYXRlfSBtYXhYXG4gKiBAcmV0dXJucyB7RDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc2V0WFJhbmdlID0gZnVuY3Rpb24obWluWCwgbWF4WCkge1xuXG4gICAgdGhpcy5taW5YID0gbWluWDtcbiAgICB0aGlzLm1heFggPSBtYXhYO1xuXG4gICAgdGhpcy5zY2FsZXMueFxuICAgICAgICAuZG9tYWluKFt0aGlzLm1pblgsIHRoaXMubWF4WF0pO1xuXG4gICAgdGhpc1xuICAgICAgICAudXBkYXRlWCgpXG4gICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAuZHJhd0VsZW1lbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnNldEF2YWlsYWJsZVdpZHRoID0gZnVuY3Rpb24oYXZhaWxhYmxlV2lkdGgpIHtcblxuICAgIHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCArPSAxO1xuXG4gICAgdmFyIGlzQXZhaWxhYmxlV2lkdGhDaGFuZ2luZyA9IGF2YWlsYWJsZVdpZHRoICE9PSB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGg7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoID0gYXZhaWxhYmxlV2lkdGg7XG5cbiAgICB0aGlzLmRpbWVuc2lvbnMud2lkdGggPSB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGggLSB0aGlzLm1hcmdpbi5sZWZ0IC0gdGhpcy5tYXJnaW4ucmlnaHQ7XG5cbiAgICBpZiAoaXNBdmFpbGFibGVXaWR0aENoYW5naW5nIHx8IHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWCgpXG4gICAgICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAgICAgLmRyYXdFbGVtZW50cygpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRBdmFpbGFibGVIZWlnaHQgPSBmdW5jdGlvbihhdmFpbGFibGVIZWlnaHQpIHtcblxuICAgIHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCArPSAxO1xuXG4gICAgdmFyIGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgPSBhdmFpbGFibGVIZWlnaHQgIT09IHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQ7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCA9IGF2YWlsYWJsZUhlaWdodDtcblxuICAgIHRoaXMuX21heEJvZHlIZWlnaHQgPSB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0IC0gdGhpcy5tYXJnaW4udG9wIC0gdGhpcy5tYXJnaW4uYm90dG9tO1xuXG4gICAgaWYgKGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgfHwgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID09PSAxKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVZKClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgICAgICAuZHJhd0VsZW1lbnRzKClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVggPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHRoaXMuY29udGFpbmVyLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoICsgdGhpcy5tYXJnaW4ubGVmdCArIHRoaXMubWFyZ2luLnJpZ2h0KTtcblxuICAgIHRoaXMuc2NhbGVzLnhcbiAgICAgICAgLmRvbWFpbihbdGhpcy5taW5YLCB0aGlzLm1heFhdKVxuICAgICAgICAucmFuZ2UoWzAsIHRoaXMuZGltZW5zaW9ucy53aWR0aF0pO1xuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZSgtdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YXG4gICAgICAgIC54KHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC50cmFuc2xhdGUodGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKSlcbiAgICAgICAgLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1ib3VuZGluZ1JlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgdGhpcy5jb250YWluZXIuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXAuc2VsZWN0KCdyZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMsIHRoaXMuY29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihmKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5wdXNoKGYpO1xuXG4gICAgaWYgKHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZztcbiAgICAgICAgICAgIHdoaWxlKGcgPSBzZWxmLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5zaGlmdCgpKSBnKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihmKSB7XG5cbiAgICB2YXIgaW5kZXggPSB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5sZW5ndGggPiAwID8gdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMuaW5kZXhPZihmKSA6IC0xO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRyYXdYQXhpcyA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbiwgc2tpcFRpY2tzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZShza2lwVGlja3MgPyAwIDogLXRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5feEF4aXNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3hBeGlzQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX3hBeGlzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKHNlbGYuZWxlbWVudHMueEF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5jYWxsKHNlbGYuYXhpc2VzLngpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdsaW5lJylcbiAgICAgICAgICAgIC5zdHlsZSh7XG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IHNlbGYub3B0aW9ucy54QXhpc1N0cm9rZVdpZHRoLmJpbmQoc2VsZilcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy54MkF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5jYWxsKHNlbGYuYXhpc2VzLngyKVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgndGV4dCcpXG4gICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgeDogc2VsZi5jb2x1bW5XaWR0aCAvIDJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3R5bGUoe1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICtkID09PSArc2VsZi5tYXhYID8gJ25vbmUnIDogJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRyYXdZQXhpcyA9IGZ1bmN0aW9uIGRyYXdZQXhpcyh0cmFuc2l0aW9uRHVyYXRpb24sIHNraXBUaWNrcykge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuYXhpc2VzLnhcbiAgICAgICAgLmlubmVyVGlja1NpemUoc2tpcFRpY2tzID8gMCA6IC10aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIHZhciBkb21haW5ZID0gdGhpcy5zY2FsZXMueS5kb21haW4oKTtcblxuICAgIHRoaXMuYXhpc2VzLnlcbiAgICAgICAgLnRpY2tWYWx1ZXModGhpcy5fcmFuZ2UoTWF0aC5yb3VuZChkb21haW5ZWzBdKSwgTWF0aC5yb3VuZChkb21haW5ZWzFdKSwgMSkpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX3lBeGlzQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl95QXhpc0FGKTtcbiAgICB9XG5cbiAgICB0aGlzLl95QXhpc0FGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHNlbGYud3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy55QXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgY29udGFpbmVyLmNhbGwoc2VsZi5heGlzZXMueSk7XG5cbiAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCd0ZXh0JykuYXR0cigneScsIHNlbGYub3B0aW9ucy5yb3dIZWlnaHQgLyAyKTtcblxuICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ2xpbmUnKS5zdHlsZSgnZGlzcGxheScsIGZ1bmN0aW9uKGQsaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpID8gJycgOiAnbm9uZSc7XG4gICAgICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm1Gcm9tRGF0YSA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgdGhpcy5zY2FsZXMueCh0aGlzLmdldERhdGFTdGFydChkKSkgKyAnLCcgKyB0aGlzLnNjYWxlcy55KGQucm93SW5kZXgpICsgJyknO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RGF0YVN0YXJ0ID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiArZC5zdGFydDtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmdldERhdGFFbmQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICtkLmVuZDtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRyYXdFbGVtZW50cyA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5fZWxlbWVudHNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2VsZW1lbnRzQUYpXG4gICAgfVxuXG4gICAgdmFyIGVuYWJsZVlUcmFuc2l0aW9uID0gdGhpcy5vcHRpb25zLmVuYWJsZVlUcmFuc2l0aW9uO1xuXG4gICAgdGhpcy5fZWxlbWVudHNBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBkb21haW5YID0gc2VsZi5zY2FsZXMueC5kb21haW4oKTtcbiAgICAgICAgdmFyIGRvbWFpblhTdGFydCA9IGRvbWFpblhbMF07XG4gICAgICAgIHZhciBkb21haW5YRW5kID0gZG9tYWluWFtkb21haW5YLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIHZhciBkb21haW5ZID0gc2VsZi5zY2FsZXMueS5kb21haW4oKTtcbiAgICAgICAgdmFyIGRvbWFpbllTdGFydCA9IGRvbWFpbllbMF07XG4gICAgICAgIHZhciBkb21haW5ZRW5kID0gZG9tYWluWVtkb21haW5ZLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIHZhciBjdWxsaW5nRGlzdGFuY2UgPSBzZWxmLm9wdGlvbnMuY3VsbGluZ0Rpc3RhbmNlO1xuICAgICAgICB2YXIgY3VsbGluZ1ggPSBzZWxmLm9wdGlvbnMuY3VsbGluZ1g7XG4gICAgICAgIHZhciBjdWxsaW5nWSA9IHNlbGYub3B0aW9ucy5jdWxsaW5nWTtcblxuXG4gICAgICAgIHZhciBzdGFydFRyYW5zZm9ybU1hcCA9IHt9O1xuICAgICAgICB2YXIgZW5kVHJhbnNmb3JtTWFwID0ge307XG5cbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy51c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm0gJiYgdHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgaWYgKHNlbGYucHJldmlvdXNGbGF0dGVuZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wcmV2aW91c0ZsYXR0ZW5lZERhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RhcnRUcmFuc2Zvcm1NYXBbZC51aWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRyYW5zZm9ybU1hcFtkLmlkXSA9IHN0YXJ0VHJhbnNmb3JtTWFwW2QudWlkXSA9IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWxmLmZsYXR0ZW5lZERhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZsYXR0ZW5lZERhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZW5kVHJhbnNmb3JtTWFwW2QudWlkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVHJhbnNmb3JtTWFwW2QuaWRdID0gZW5kVHJhbnNmb3JtTWFwW2QudWlkXSA9IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhID0gc2VsZi5mbGF0dGVuZWREYXRhLmZpbHRlcihmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gZC5fZGVmYXVsdFByZXZlbnRlZCB8fCAoIWN1bGxpbmdZIHx8IChkLnJvd0luZGV4ID49IGRvbWFpbllTdGFydCAtIGN1bGxpbmdEaXN0YW5jZSAmJiBkLnJvd0luZGV4IDwgZG9tYWluWUVuZCArIGN1bGxpbmdEaXN0YW5jZSAtIDEpKVxuICAgICAgICAgICAgICAgICYmICghY3VsbGluZ1ggfHwgIShzZWxmLmdldERhdGFFbmQoZCkgPCBkb21haW5YU3RhcnQgfHwgc2VsZi5nZXREYXRhU3RhcnQoZCkgPiBkb21haW5YRW5kKSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgdmFyIGcgPSBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLnNlbGVjdEFsbCgnZy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAuZGF0YShkYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQudWlkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGV4aXRpbmcgPSBnLmV4aXQoKTtcblxuICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmVuYWJsZVRyYW5zaXRpb25PbkV4aXQgJiYgdHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgZXhpdGluZ1xuICAgICAgICAgICAgICAgIC5jYWxsKHNlbGYuZWxlbWVudEV4aXQuYmluZChzZWxmKSk7XG5cbiAgICAgICAgICAgIGV4aXRpbmcuZWFjaChmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZyA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIHZhciBleGl0VHJhbnNmb3JtID0gZW5kVHJhbnNmb3JtTWFwW2QudWlkXSB8fCBlbmRUcmFuc2Zvcm1NYXBbZC5pZF07XG5cbiAgICAgICAgICAgICAgICBpZiAoZXhpdFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKGcsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBleGl0VHJhbnNmb3JtKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGcucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4aXRpbmdcbiAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBnLmVudGVyKCkuYXBwZW5kKCdnJylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKVxuICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNhbGwoc2VsZi5lbGVtZW50RW50ZXIuYmluZChzZWxmKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBnLmVhY2goZnVuY3Rpb24oZCkge1xuXG4gICAgICAgICAgICB2YXIgZyA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgaWYgKGQuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudFVwZGF0ZShnLCBkLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaGFzUHJldmlvdXNUcmFuc2Zvcm0gPSBnLmF0dHIoJ3RyYW5zZm9ybScpICE9PSBudWxsO1xuXG4gICAgICAgICAgICB2YXIgbmV3VHJhbnNmb3JtID0gZW5kVHJhbnNmb3JtTWFwW2QudWlkXSB8fCBlbmRUcmFuc2Zvcm1NYXBbZC5pZF0gfHwgc2VsZi5nZXRUcmFuc2Zvcm1Gcm9tRGF0YShkKTtcblxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgb3JpZ2luVHJhbnNmb3JtID0gc3RhcnRUcmFuc2Zvcm1NYXBbZC51aWRdIHx8IHN0YXJ0VHJhbnNmb3JtTWFwW2QuaWRdIHx8IG5ld1RyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICB2YXIgbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNQcmV2aW91c1RyYW5zZm9ybSAmJiBzZWxmLm9wdGlvbnMudXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5UcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkT3JpZ2luVHJhbnNmb3JtID0gb3JpZ2luVHJhbnNmb3JtO1xuICAgICAgICAgICAgICAgICAgICAgICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCBvcmlnaW5UcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi53cmFwV2l0aEFuaW1hdGlvbihnLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyVHdlZW4oXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3JpZ2luVHJhbnNmb3JtID0gbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm0gfHwgZy5hdHRyKCd0cmFuc2Zvcm0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbmFibGVZVHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5pbnRlcnBvbGF0ZVRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm0sIG5ld1RyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGFydFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbmRUcmFuc2Zvcm0gPSBkMy50cmFuc2Zvcm0obmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRyYW5zZm9ybS50cmFuc2xhdGVbMV0gPSBlbmRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5pbnRlcnBvbGF0ZVRyYW5zZm9ybShzdGFydFRyYW5zZm9ybS50b1N0cmluZygpLCBlbmRUcmFuc2Zvcm0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ1xuICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgbmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5lbGVtZW50VXBkYXRlKGcsIGQsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IFswLjAsIDAuMF07XG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG5cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUubW92ZUVsZW1lbnRzID0gZnVuY3Rpb24oZm9yY2VEcmF3LCBza2lwWEF4aXMsIGZvcmNlVGlja3MpIHtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLnJlbmRlck9uSWRsZSB8fCBmb3JjZURyYXcpIHtcbiAgICAgICAgdGhpcy5kcmF3RWxlbWVudHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRyYW5zbGF0ZUVsZW1lbnRzKHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCksIHRoaXMuX2xhc3RUcmFuc2xhdGUpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd1lBeGlzKHVuZGVmaW5lZCwgIWZvcmNlVGlja3MpO1xuXG4gICAgaWYgKCFza2lwWEF4aXMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVYQXhpc0ludGVydmFsKCk7XG4gICAgICAgIHRoaXMuZHJhd1hBeGlzKHVuZGVmaW5lZCwgIWZvcmNlVGlja3MpO1xuICAgIH1cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnRyYW5zbGF0ZUVsZW1lbnRzID0gZnVuY3Rpb24odHJhbnNsYXRlLCBwcmV2aW91c1RyYW5zbGF0ZSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHR4ID0gdHJhbnNsYXRlWzBdIC0gcHJldmlvdXNUcmFuc2xhdGVbMF07XG4gICAgdmFyIHR5ID0gdHJhbnNsYXRlWzFdIC0gcHJldmlvdXNUcmFuc2xhdGVbMV07XG5cbiAgICB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdID0gdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVswXSArIHR4O1xuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV0gPSB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdICsgdHk7XG5cblxuICAgIGlmICh0aGlzLl9lbHRzVHJhbnNsYXRlQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9lbHRzVHJhbnNsYXRlQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX2VsdHNUcmFuc2xhdGVBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cih7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoJyArIHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgKyAnKSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHNlbGYuZWxlbWVudHNUcmFuc2xhdGUgIT09IHNlbGYubm9vcCkge1xuICAgICAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoJy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRzVHJhbnNsYXRlKGQzLnNlbGVjdCh0aGlzKSwgZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVYQXhpc0ludGVydmFsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmNvbHVtbldpZHRoID0gdGhpcy5zY2FsZXMueCgxKSAtIHRoaXMuc2NhbGVzLngoMCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVkgPSBmdW5jdGlvbiAodHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXI7XG4gICAgdmFyIGNsaXAgPSB0aGlzLmVsZW1lbnRzLmNsaXAuc2VsZWN0KCdyZWN0Jyk7XG4gICAgdmFyIGJvdW5kaW5nUmVjdCA9IHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcpO1xuXG4gICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgICAgICBjb250YWluZXIgPSBjb250YWluZXIudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGNsaXAgPSBjbGlwLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBib3VuZGluZ1JlY3QgPSBib3VuZGluZ1JlY3QudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfVxuXG4gICAgdmFyIGVsZW1lbnRBbW91bnQgPSB0aGlzLmRhdGEubGVuZ3RoO1xuXG4gICAgLy8gaGF2ZSAxIG1vcmUgZWxlbW50IHRvIGZvcmNlIHJlcHJlc2VudGluZyBvbmUgbW9yZSB0aWNrXG4gICAgdmFyIGVsZW1lbnRzUmFuZ2UgPSBbMCwgZWxlbWVudEFtb3VudF07XG5cbiAgICAvLyBjb21wdXRlIG5ldyBoZWlnaHRcbiAgICB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ID0gTWF0aC5taW4odGhpcy5kYXRhLmxlbmd0aCAqIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQsIHRoaXMuX21heEJvZHlIZWlnaHQpO1xuXG4gICAgLy8gY29tcHV0ZSBuZXcgWSBzY2FsZVxuICAgIHRoaXMuX3lTY2FsZSA9IHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgLyB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICogZWxlbWVudEFtb3VudDtcblxuICAgIC8vIHVwZGF0ZSBZIHNjYWxlLCBheGlzIGFuZCB6b29tIGJlaGF2aW9yXG4gICAgdGhpcy5zY2FsZXMueS5kb21haW4oZWxlbWVudHNSYW5nZSkucmFuZ2UoWzAsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHRdKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnkodGhpcy5zY2FsZXMueSkudHJhbnNsYXRlKHRoaXMuX2xhc3RUcmFuc2xhdGUpLnNjYWxlKHRoaXMuX3lTY2FsZSk7XG5cbiAgICAvLyBhbmQgdXBkYXRlIFggYXhpcyB0aWNrcyBoZWlnaHRcbiAgICB0aGlzLmF4aXNlcy54LmlubmVyVGlja1NpemUoLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgLy8gdXBkYXRlIHN2ZyBoZWlnaHRcbiAgICBjb250YWluZXIuYXR0cignaGVpZ2h0Jyx0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICsgdGhpcy5tYXJnaW4udG9wICsgdGhpcy5tYXJnaW4uYm90dG9tKTtcblxuICAgIC8vIHVwZGF0ZSBpbm5lciByZWN0IGhlaWdodFxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JykuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgYm91bmRpbmdSZWN0LmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuICAgIGNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JykuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgY2xpcC5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6cmVzaXplJywgdGhpcywgdGhpcy5jb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnN0b3BFbGVtZW50VHJhbnNpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWxlbWVudHMuaW5uZXJDb250YWluZXIuc2VsZWN0QWxsKCdnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JykudHJhbnNpdGlvbigpXG4gICAgICAgIC5zdHlsZSgnb3BhY2l0eScsICcnKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRFbnRlciA9IGZ1bmN0aW9uKHNlbGVjdGlvbikgeyByZXR1cm4gc2VsZWN0aW9uOyB9O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5lbGVtZW50VXBkYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRFeGl0ID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbkQzVGFibGUucHJvdG90eXBlLndyYXBXaXRoQW5pbWF0aW9uID0gZnVuY3Rpb24oc2VsZWN0aW9uLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICByZXR1cm4gc2VsZWN0aW9uLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pLmVhc2UodGhpcy5vcHRpb25zLnRyYW5zaXRpb25FYXNpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZWxlY3Rpb247XG4gICAgfVxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX2dldHRlciA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtwcm9wXTsgfTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLl9pc1JvdW5kID0gZnVuY3Rpb24odikge1xuICAgIHZhciBuID0gdnwwO1xuICAgIHJldHVybiB2ID4gbiAtIDFlLTMgJiYgdiA8IG4gKyAxZS0zO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX3JhbmdlID0gZnVuY3Rpb24oc3RhcnQsIGVuZCwgaW5jKSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIHdoaWxlIChzdGFydCA8IGVuZCkge1xuICAgICAgICByZXMucHVzaChzdGFydCk7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQgKyBpbmM7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59O1xuXG4vKipcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZnIvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvT2JqZXRzX2dsb2JhdXgvQXJyYXkvZmluZFxuICogQHR5cGUgeyp8RnVuY3Rpb259XG4gKiBAcHJpdmF0ZVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5fZmluZCA9IGZ1bmN0aW9uKGxpc3QsIHByZWRpY2F0ZSkge1xuICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aCA+Pj4gMDtcbiAgICB2YXIgdGhpc0FyZyA9IGxpc3Q7XG4gICAgdmFyIHZhbHVlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IGxpc3RbaV07XG4gICAgICAgIGlmIChwcmVkaWNhdGUuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaSwgbGlzdCkpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5fY2xhbXBUcmFuc2xhdGlvbldpdGhTY2FsZSA9IGZ1bmN0aW9uKHRyYW5zbGF0ZSwgc2NhbGUpIHtcblxuICAgIHNjYWxlID0gc2NhbGUgfHwgWzEsIDFdO1xuXG4gICAgaWYgKCEoc2NhbGUgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgICAgc2NhbGUgPSBbc2NhbGUsIHNjYWxlXTtcbiAgICB9XG5cbiAgICB2YXIgdHggPSB0cmFuc2xhdGVbMF07XG4gICAgdmFyIHR5ID0gdHJhbnNsYXRlWzFdO1xuICAgIHZhciBzeCA9IHNjYWxlWzBdO1xuICAgIHZhciBzeSA9IHNjYWxlWzFdO1xuXG4gICAgaWYgKHN4ID09PSAxKSB7XG4gICAgICAgIHR4ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0eCA9IE1hdGgubWluKE1hdGgubWF4KC10aGlzLmRpbWVuc2lvbnMud2lkdGggKiAoc3gtMSksIHR4KSwgMCk7XG4gICAgfVxuXG4gICAgaWYgKHN5ID09PSAxKSB7XG4gICAgICAgIHR5ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0eSA9IE1hdGgubWluKE1hdGgubWF4KC10aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICogKHN5LTEpLCB0eSksIDApO1xuICAgIH1cblxuICAgIHJldHVybiBbdHgsIHR5XTtcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNUYWJsZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMvZXZlbnRzJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5pbXBvcnQgRDNUYWJsZSBmcm9tICcuL0QzVGFibGUnO1xuXG5mdW5jdGlvbiBEM1RhYmxlTWFya2VyKG9wdGlvbnMpIHtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtEM1RhYmxlfVxuICAgICAqL1xuICAgIHRoaXMudGFibGUgPSBudWxsO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMuZWxlbWVudHMgPSB7XG4gICAgICAgIGxpbmU6IG51bGwsXG4gICAgICAgIGxhYmVsOiBudWxsXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGFibGVEZXN0cm95TGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcblxuICAgIHRoaXMudmFsdWUgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RUaW1lVXBkYXRlZCA9IG51bGw7XG59XG5cbmluaGVyaXRzKEQzVGFibGVNYXJrZXIsIEV2ZW50RW1pdHRlcik7XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLkxBWU9VVF9IT1JJWk9OVEFMID0gJ2hvcml6b250YWwnO1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX1ZFUlRJQ0FMID0gJ3ZlcnRpY2FsJztcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZGVmYXVsdHMgPSB7XG4gICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7IHJldHVybiBkOyB9LFxuICAgIG91dGVyVGlja1NpemU6IDEwLFxuICAgIHRpY2tQYWRkaW5nOiAzLFxuICAgIHJvdW5kUG9zaXRpb246IGZhbHNlLFxuICAgIGJlbUJsb2NrTmFtZTogJ3RhYmxlTWFya2VyJyxcbiAgICBiZW1Nb2RpZmllcnM6IFtdLFxuICAgIGxheW91dDogRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX1ZFUlRJQ0FMLFxuICAgIGxpbmVTaGFwZTogJ2xpbmUnLFxuICAgIHJlY3RUaGlja25lc3M6IEQzVGFibGUucHJvdG90eXBlLmRlZmF1bHRzLnJvd0hlaWdodFxufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtEM1RhYmxlfSB0YWJsZVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zZXRUYWJsZSA9IGZ1bmN0aW9uKHRhYmxlKSB7XG5cbiAgICB2YXIgcHJldmlvdXNUYWJsZSA9IHRoaXMudGFibGU7XG5cbiAgICB0aGlzLnRhYmxlID0gdGFibGUgJiYgdGFibGUgaW5zdGFuY2VvZiBEM1RhYmxlID8gdGFibGUgOiBudWxsO1xuXG4gICAgaWYgKHRoaXMudGFibGUpIHtcbiAgICAgICAgaWYgKHByZXZpb3VzVGFibGUgIT09IHRoaXMudGFibGUpIHtcbiAgICAgICAgICAgIGlmIChwcmV2aW91c1RhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51bmJpbmRUYWJsZShwcmV2aW91c1RhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYmluZFRhYmxlKCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCF0aGlzLnRhYmxlICYmIHByZXZpb3VzVGFibGUpIHtcbiAgICAgICAgdGhpcy51bmJpbmRUYWJsZShwcmV2aW91c1RhYmxlKTtcbiAgICB9XG5cbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnZhbHVlQ29tcGFyYXRvciA9IGZ1bmN0aW9uKHRpbWVBLCB0aW1lQikge1xuICAgIHJldHVybiArdGltZUEgIT09ICt0aW1lQjtcbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24odmFsdWUsIHNpbGVudCkge1xuXG4gICAgdmFyIHByZXZpb3VzVGltZVVwZGF0ZWQgPSB0aGlzLl9sYXN0VGltZVVwZGF0ZWQ7XG5cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy52YWx1ZUNvbXBhcmF0b3IocHJldmlvdXNUaW1lVXBkYXRlZCwgdGhpcy52YWx1ZSkgJiYgdGhpcy50YWJsZSAmJiB0aGlzLmNvbnRhaW5lcikge1xuXG4gICAgICAgIHRoaXMuX2xhc3RUaW1lVXBkYXRlZCA9IHRoaXMudmFsdWU7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJcbiAgICAgICAgICAgIC5kYXR1bSh7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXNpbGVudCkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBkYXRhLnZhbHVlO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuYmluZFRhYmxlID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgY2xhc3NOYW1lID0gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICcgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLS0nICsgdGhpcy5vcHRpb25zLmxheW91dDtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXJzICYmIEFycmF5LmlzQXJyYXkodGhpcy5vcHRpb25zLmJlbU1vZGlmaWVycykgJiYgdGhpcy5vcHRpb25zLmJlbU1vZGlmaWVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNsYXNzTmFtZSA9IGNsYXNzTmFtZSArICcgJyArIHRoaXMub3B0aW9ucy5iZW1Nb2RpZmllcnMubWFwKGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctLScgKyBtb2RpZmllcjtcbiAgICAgICAgfSkuam9pbignICcpO1xuICAgIH1cblxuICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy50YWJsZS5jb250YWluZXJcbiAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgIC5kYXR1bSh7XG4gICAgICAgICAgICB2YWx1ZTogdGhpcy52YWx1ZVxuICAgICAgICB9KVxuICAgICAgICAuYXR0cignY2xhc3MnLCBjbGFzc05hbWUpO1xuXG4gICAgc3dpdGNoKHRoaXMub3B0aW9ucy5saW5lU2hhcGUpIHtcbiAgICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzLmxpbmUgPSB0aGlzLmNvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoJ2xpbmUnKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxpbmUnKVxuICAgICAgICAgICAgICAgIC5zdHlsZSgncG9pbnRlci1ldmVudHMnLCAnbm9uZScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3JlY3QnOlxuICAgICAgICAgICAgdGhpcy5lbGVtZW50cy5saW5lID0gdGhpcy5jb250YWluZXJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1yZWN0JylcbiAgICAgICAgICAgICAgICAuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudHMubGFiZWwgPSB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctbGFiZWwnKTtcblxuICAgIHRoaXMuc2l6ZUxpbmVBbmRMYWJlbCgpO1xuXG4gICAgLy8gb24gdGFibGUgbW92ZSwgbW92ZSB0aGUgbWFya2VyXG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSB0aGlzLm1vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnLCB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lcik7XG5cbiAgICAvLyBvbiB0YWJsZSByZXNpemUsIHJlc2l6ZSB0aGUgbWFya2VyIGFuZCBtb3ZlIGl0XG4gICAgdGhpcy5fdGFibGVSZXNpemVMaXN0ZW5lciA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgICAgICBzZWxmLnJlc2l6ZSh0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBzZWxmLm1vdmUodHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9O1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6cmVzaXplJywgdGhpcy5fdGFibGVSZXNpemVMaXN0ZW5lcik7XG5cbiAgICB0aGlzLl90YWJsZURlc3Ryb3lMaXN0ZW5lciA9IGZ1bmN0aW9uKHRhYmxlKSB7XG4gICAgICAgIHNlbGYudW5iaW5kVGFibGUodGFibGUpO1xuICAgIH07XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpkZXN0cm95JywgdGhpcy5fdGFibGVEZXN0cm95TGlzdGVuZXIpO1xuXG4gICAgdGhpcy5lbWl0KCdtYXJrZXI6Ym91bmQnKTtcblxuICAgIHRoaXMubW92ZSgpO1xuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zaXplTGluZUFuZExhYmVsID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgbGF5b3V0ID0gdGhpcy5vcHRpb25zLmxheW91dDtcblxuICAgIHZhciBsaW5lID0gdGhpcy5lbGVtZW50cy5saW5lO1xuICAgIHZhciBsYWJlbCA9IHRoaXMuZWxlbWVudHMubGFiZWw7XG5cbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICBsaW5lID0gbGluZS50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgbGFiZWwgPSBsYWJlbC50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBzd2l0Y2gobGF5b3V0KSB7XG5cbiAgICAgICAgY2FzZSB0aGlzLkxBWU9VVF9WRVJUSUNBTDpcblxuICAgICAgICAgICAgc3dpdGNoKHRoaXMub3B0aW9ucy5saW5lU2hhcGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkxOiAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTI6IHRoaXMudGFibGUuZGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgbGluZS5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IC10aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzcy8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMub3B0aW9ucy5yZWN0VGhpY2tuZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSArIHRoaXMudGFibGUuZGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsIC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZS10aGlzLm9wdGlvbnMudGlja1BhZGRpbmcpO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRoaXMuTEFZT1VUX0hPUklaT05UQUw6XG5cbiAgICAgICAgICAgIHN3aXRjaCh0aGlzLm9wdGlvbnMubGluZVNoYXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgICAgICAgICAgICAgIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MTogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgyOiB0aGlzLnRhYmxlLmRpbWVuc2lvbnMud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgbGluZS5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzcy8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplICsgdGhpcy50YWJsZS5kaW1lbnNpb25zLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2R4JywgLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLXRoaXMub3B0aW9ucy50aWNrUGFkZGluZylcbiAgICAgICAgICAgICAgICAuYXR0cignZHknLCA0KTtcblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS51bmJpbmRUYWJsZSA9IGZ1bmN0aW9uKHByZXZpb3VzVGFibGUpIHtcblxuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScsIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6ZGVzdHJveScsIHRoaXMuX3RhYmxlRGVzdHJveUxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLmNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHByZXZpb3VzVGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICAgICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5lbWl0KCdtYXJrZXI6dW5ib3VuZCcsIHByZXZpb3VzVGFibGUpO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICB0aGlzLnRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fbW92ZUFGID0gdGhpcy50YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5tb3ZlU3luYy5iaW5kKHRoaXMpKTtcblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUubW92ZVN5bmMgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICghdGhpcy50YWJsZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBsYXlvdXQgPSB0aGlzLm9wdGlvbnMubGF5b3V0O1xuXG4gICAgdGhpcy5jb250YWluZXJcbiAgICAgICAgLmVhY2goZnVuY3Rpb24oZCkge1xuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBzZWxmLmdldFZhbHVlKGQpO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzY2FsZSwgcG9zaXRpb24gPSBbMCwgMF0sIHBvc2l0aW9uSW5kZXg7XG5cbiAgICAgICAgICAgIHN3aXRjaChsYXlvdXQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIHNlbGYuTEFZT1VUX1ZFUlRJQ0FMOlxuICAgICAgICAgICAgICAgICAgICBzY2FsZSA9IHNlbGYudGFibGUuc2NhbGVzLng7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHNlbGYuTEFZT1VUX0hPUklaT05UQUw6XG4gICAgICAgICAgICAgICAgICAgIHNjYWxlID0gc2VsZi50YWJsZS5zY2FsZXMueTtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25JbmRleCA9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdID0gc2NhbGUodmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgcmFuZ2UgPSBzY2FsZS5yYW5nZSgpO1xuICAgICAgICAgICAgdmFyIGlzSW5SYW5nZSA9IHBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdID49IHJhbmdlWzBdICYmIHBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdIDw9IHJhbmdlW3JhbmdlLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgICAgICB2YXIgZyA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgaWYgKGlzSW5SYW5nZSkge1xuXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XG5cbiAgICAgICAgICAgICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysoc2VsZi50YWJsZS5tYXJnaW4ubGVmdCArIHBvc2l0aW9uWzBdID4+IDApKycsJysoc2VsZi50YWJsZS5tYXJnaW4udG9wICsgcG9zaXRpb25bMV0gPj4gMCkrJyknKTtcblxuICAgICAgICAgICAgICAgIGcuc2VsZWN0KCcuJyArIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxhYmVsJylcbiAgICAgICAgICAgICAgICAgICAgLnRleHQoc2VsZi5vcHRpb25zLmZvcm1hdHRlcih2YWx1ZSkpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuY29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnN0eWxlKCdkaXNwbGF5JywgJycpO1xuICAgIH1cbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5jb250YWluZXIpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5kYXR1bSh7XG4gICAgICAgICAgICB2YWx1ZTogbnVsbFxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHRoaXMuc2l6ZUxpbmVBbmRMYWJlbCh0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVNYXJrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGVNYXJrZXIgZnJvbSAnLi9EM1RhYmxlTWFya2VyJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbi8qKlxuICpcbiAqIEBleHRlbmRzIHtEM1RhYmxlTWFya2VyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGFibGVNb3VzZVRyYWNrZXIob3B0aW9ucykge1xuICAgIEQzVGFibGVNYXJrZXIuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyID0gbnVsbDtcbiAgICB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyID0gbnVsbDtcbiAgICB0aGlzLl90YWJsZU1vdXNlbGVhdmVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSBudWxsO1xuXG4gICAgdGhpcy5vbignbWFya2VyOmJvdW5kJywgdGhpcy5oYW5kbGVUYWJsZUJvdW5kLmJpbmQodGhpcykpO1xuICAgIHRoaXMub24oJ21hcmtlcjp1bmJvdW5kJywgdGhpcy5oYW5kbGVUYWJsZVVuYm91bmQuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMgPSBmYWxzZTtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZU1vdXNlVHJhY2tlciwgRDNUYWJsZU1hcmtlcik7XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbU1vZGlmaWVyczogWydtb3VzZVRyYWNrZXInXSxcbiAgICBsaXN0ZW5Ub1RvdWNoRXZlbnRzOiB0cnVlXG59KTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlVGFibGVCb3VuZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIgPSB0aGlzLmhhbmRsZU1vdXNlZW50ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyID0gdGhpcy5oYW5kbGVNb3VzZW1vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl90YWJsZU1vdXNlbGVhdmVMaXN0ZW5lciA9IHRoaXMuaGFuZGxlTW91c2VsZWF2ZS5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWVudGVyJywgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIpO1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2Vtb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWxlYXZlJywgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5saXN0ZW5Ub1RvdWNoRXZlbnRzKSB7XG4gICAgICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IHRydWU7XG4gICAgICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6dG91Y2htb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzID0gZmFsc2U7XG4gICAgfVxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlVGFibGVVbmJvdW5kID0gZnVuY3Rpb24ocHJldmlvdXNUYWJsZSkge1xuXG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWVudGVyJywgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2Vtb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWxlYXZlJywgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIpO1xuXG4gICAgaWYgKHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cykge1xuICAgICAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnRvdWNobW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIH1cblxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuZ2V0VmFsdWVGcm9tVGFibGVFdmVudCA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuICAgIHN3aXRjaCAodGhpcy5vcHRpb25zLmxheW91dCkge1xuICAgICAgICBjYXNlICd2ZXJ0aWNhbCc6XG4gICAgICAgICAgICByZXR1cm4gZ2V0VGltZSgpO1xuICAgICAgICBjYXNlICdob3Jpem9udGFsJzpcbiAgICAgICAgICAgIHJldHVybiBnZXRSb3coKTtcbiAgICB9XG59O1xuXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVNb3VzZWVudGVyID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgdGltZSA9IHRoaXMuZ2V0VmFsdWVGcm9tVGFibGVFdmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNob3coKTtcbiAgICAgICAgc2VsZi5zZXRWYWx1ZSh0aW1lKTtcbiAgICB9KTtcblxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2Vtb3ZlID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHRpbWUgPSB0aGlzLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSB0YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuc2V0VmFsdWUodGltZSk7XG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZU1vdXNlbGVhdmUgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICB9KTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RhYmxlTW91c2VUcmFja2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlTWFya2VyIGZyb20gJy4vRDNUYWJsZU1hcmtlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqXG4gKiBAZXh0ZW5kcyB7RDNUYWJsZU1hcmtlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RhYmxlVmFsdWVUcmFja2VyKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlTWFya2VyLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZVZhbHVlVHJhY2tlciwgRDNUYWJsZU1hcmtlcik7XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbU1vZGlmaWVyczogWyd2YWx1ZVRyYWNrZXInXVxufSk7XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlR2V0dGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgIHJldHVybiAwO1xuXG59O1xuXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAgIGQzLnRpbWVyKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuc2V0VmFsdWUoc2VsZi52YWx1ZUdldHRlcigpKTtcblxuICAgICAgICByZXR1cm4gIXNlbGYuZW5hYmxlZDtcblxuICAgIH0pO1xufTtcblxuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZVZhbHVlVHJhY2tlcjtcbiIsIi8qIGdsb2JhbCBjYW5jZWxBbmltYXRpb25GcmFtZSwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IEQzQmxvY2tUYWJsZSBmcm9tICcuL0QzQmxvY2tUYWJsZSc7XG5pbXBvcnQgZDMgZnJvbSAnZDMnO1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGltZWxpbmUob3B0aW9ucykge1xuXG4gICAgRDNCbG9ja1RhYmxlLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPSB0aGlzLm9wdGlvbnMubWluaW11bVRpbWVJbnRlcnZhbDtcbn1cblxuaW5oZXJpdHMoRDNUaW1lbGluZSwgRDNCbG9ja1RhYmxlKTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1CbG9ja05hbWU6ICd0aW1lbGluZScsXG4gICAgYmVtQmxvY2tNb2RpZmllcjogJycsXG4gICAgeEF4aXNUaWNrc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZC5nZXRNaW51dGVzKCkgJSAxNSA/ICcnIDogZDMudGltZS5mb3JtYXQoJyVIOiVNJykoZCk7XG4gICAgfSxcbiAgICB4QXhpc1N0cm9rZVdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkLmdldE1pbnV0ZXMoKSAlMzAgPyAxIDogMjtcbiAgICB9LFxuICAgIG1pbmltdW1Db2x1bW5XaWR0aDogMzAsXG4gICAgbWluaW11bVRpbWVJbnRlcnZhbDogM2U1LFxuICAgIGF2YWlsYWJsZVRpbWVJbnRlcnZhbHM6IFsgNmU0LCAzZTUsIDllNSwgMS44ZTYsIDMuNmU2LCA3LjJlNiwgMS40NGU3LCAyLjg4ZTcsIDQuMzJlNywgOC42NGU3IF1cbn0pO1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS54U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnRpbWUuc2NhbGUoKTtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLnlTY2FsZUZhY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUubGluZWFyKCk7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhU3RhcnQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuc3RhcnQ7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhRW5kID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmVuZDtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLl9jb21wdXRlQ29sdW1uV2lkdGhGcm9tVGltZUludGVydmFsID0gZnVuY3Rpb24odGltZUludGVydmFsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGVzLngobmV3IERhdGUodGltZUludGVydmFsKSkgLSB0aGlzLnNjYWxlcy54KG5ldyBEYXRlKDApKTtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLnVwZGF0ZVhBeGlzSW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBtaW5pbXVtVGltZUludGVydmFsID0gdGhpcy5vcHRpb25zLm1pbmltdW1UaW1lSW50ZXJ2YWw7XG4gICAgdmFyIG1pbmltdW1Db2x1bW5XaWR0aCA9IHRoaXMub3B0aW9ucy5taW5pbXVtQ29sdW1uV2lkdGg7XG4gICAgdmFyIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWw7XG4gICAgdmFyIGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMgPSB0aGlzLm9wdGlvbnMuYXZhaWxhYmxlVGltZUludGVydmFscztcbiAgICB2YXIgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4ID0gYXZhaWxhYmxlVGltZUludGVydmFscy5pbmRleE9mKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuICAgIHZhciBjdXJyZW50Q29sdW1uV2lkdGggPSB0aGlzLl9jb21wdXRlQ29sdW1uV2lkdGhGcm9tVGltZUludGVydmFsKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlVGltZUludGVydmFsKGRlbHRhKSB7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCArPSBkZWx0YTtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbCA9IGF2YWlsYWJsZVRpbWVJbnRlcnZhbHNbY3VycmVudFRpbWVJbnRlcnZhbEluZGV4XTtcbiAgICAgICAgY3VycmVudENvbHVtbldpZHRoID0gc2VsZi5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbChjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB9XG5cbiAgICBpZiAoYXZhaWxhYmxlVGltZUludGVydmFscy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChjdXJyZW50Q29sdW1uV2lkdGggPCBtaW5pbXVtQ29sdW1uV2lkdGgpIHtcbiAgICAgICAgICAgIHdoaWxlKGN1cnJlbnRDb2x1bW5XaWR0aCA8IG1pbmltdW1Db2x1bW5XaWR0aCAmJiBjdXJyZW50VGltZUludGVydmFsSW5kZXggPCBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoKSB7XG4gICAgICAgICAgICB3aGlsZShjdXJyZW50Q29sdW1uV2lkdGggPiBtaW5pbXVtQ29sdW1uV2lkdGggJiYgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbCgtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY3VycmVudFRpbWVJbnRlcnZhbCA8IG1pbmltdW1UaW1lSW50ZXJ2YWwpIHtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbCA9IG1pbmltdW1UaW1lSW50ZXJ2YWw7XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbClcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBNYXRoLmZsb29yKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuICAgIHRoaXMuY29sdW1uV2lkdGggPSBNYXRoLmZsb29yKGN1cnJlbnRDb2x1bW5XaWR0aCk7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gMy42ZTYpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiA2ZTQpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiAxZTMpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuc2V0VGltZVJhbmdlID0gZnVuY3Rpb24obWluRGF0ZSwgbWF4RGF0ZSkge1xuICAgIHJldHVybiB0aGlzLnNldFhSYW5nZShtaW5EYXRlLCBtYXhEYXRlKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEQzVGltZWxpbmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGVWYWx1ZVRyYWNrZXIgZnJvbSAnLi9EM1RhYmxlVmFsdWVUcmFja2VyJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbi8qKlxuICpcbiAqIEBleHRlbmRzIHtEM1RhYmxlVmFsdWVUcmFja2VyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGltZWxpbmVUaW1lVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZVZhbHVlVHJhY2tlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xufVxuXG5pbmhlcml0cyhEM1RpbWVsaW5lVGltZVRyYWNrZXIsIEQzVGFibGVWYWx1ZVRyYWNrZXIpO1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbUJsb2NrTmFtZTogJ3RpbWVsaW5lTWFya2VyJyxcbiAgICBiZW1Nb2RpZmllcnM6IFsndGltZVRyYWNrZXInXSxcbiAgICBsYXlvdXQ6ICd2ZXJ0aWNhbCdcbn0pO1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnRpbWVHZXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudGltZUNvbXBhcmF0b3IgPSBmdW5jdGlvbihhLGIpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZUNvbXBhcmF0b3IoYSxiKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUuc2V0VGltZSA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aW1lKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUuc2V0VGltZWxpbmUgPSBmdW5jdGlvbih0aW1lbGluZSkge1xuICAgIHJldHVybiB0aGlzLnNldFRhYmxlKHRpbWVsaW5lKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudmFsdWVHZXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50aW1lR2V0dGVyKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGltZWxpbmVUaW1lVHJhY2tlcjtcbiJdfQ==
(1)
});
;