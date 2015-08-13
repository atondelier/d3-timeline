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
    minimumDragDistance: 5
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

    selection.on('click', function (d) {
        if (!d3.event.defaultPrevented) {
            self.emitDetailedEvent('element:click', selection, null, [d]);
        }
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

    // positions
    var currentTransform = null;
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

    var drag = d3.behavior.drag().on('dragstart', function () {

        if (d3.event.sourceEvent) {
            d3.event.sourceEvent.stopPropagation();
        }

        startDragPosition = dragPosition = d3.mouse(bodyNode);

        startTime = +new Date();

        storeStart();
    }).on('drag', function () {

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

        var data = selection.datum();
        data._defaultPrevented = true;

        if (self._dragAF) {
            self.cancelAnimationFrame(self._dragAF);
        }

        self._dragAF = self.requestAnimationFrame(updateTransform);
    }).on('dragend', function () {

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

        var totalDeltaX = dragPosition[0] - startDragPosition[0];
        var totalDeltaY = dragPosition[1] - startDragPosition[1];
        var dragDistance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);
        var timeDelta = +new Date() - startTime;

        if ((timeDelta > self.options.maximumClickDragTime || dragDistance > self.options.maximumClickDragDistance) && dragDistance > self.options.minimumDragDistance) {
            self.emitDetailedEvent('element:dragend', selection, [-deltaFromTopLeftCorner[0], -deltaFromTopLeftCorner[1] + halfHeight], [data]);
        }

        self.updateY().drawYAxis();
    });

    selection.call(drag);
};

D3BlockTable.prototype.elementUpdate = function (selection, d, transitionDuration) {
    var _this = this;

    var self = this;

    this._wrapWithAnimation(selection.select('.' + this.options.bemBlockName + '-elementBackground'), transitionDuration).attr({
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
}

(0, _inherits2['default'])(D3Table, _eventsEvents2['default']);

D3Table.prototype.defaults = {
    bemBlockName: 'table',
    bemBlockModifier: '',
    xAxisHeight: 50,
    yAxisWidth: 50,
    rowHeight: 30,
    rowPadding: 5,
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

    this.axises.x = _d32['default'].svg.axis().scale(this.scales.x).orient('top').tickFormat(this.options.xAxisTicksFormatter.bind(this)).outerTickSize(0).tickPadding(20);

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
        return self.data[self.scales.y.invert(position[1]) >> 0];
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
        d.elements.forEach(function (e) {
            e.rowIndex = i;
            self.flattenedData.push(e);
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

        self._wrapWithAnimation(self.elements.xAxisContainer, transitionDuration).call(self.axises.x).selectAll('line').style({
            'stroke-width': self.options.xAxisStrokeWidth.bind(self)
        });

        self._wrapWithAnimation(self.elements.x2AxisContainer, transitionDuration).call(self.axises.x2).selectAll('text').attr({
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

        var container = self._wrapWithAnimation(self.elements.yAxisContainer, transitionDuration);
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
                    self._wrapWithAnimation(g, transitionDuration).attr('transform', exitTransform).remove();
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

                self._wrapWithAnimation(g, transitionDuration).attrTween("transform", function () {
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

D3Table.prototype._wrapWithAnimation = function (selection, transitionDuration) {
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

var _D3Timeline = require('./D3Timeline');

var _D3Timeline2 = _interopRequireDefault(_D3Timeline);

function D3TableMarker(options) {

    _eventsEvents2['default'].call(this);

    this.options = (0, _extend2['default'])(true, {}, this.defaults, options);

    /**
     * @type {D3Timeline}
     */
    this.timeline = null;

    this.container = null;

    /**
     * @type {Function}
     * @private
     */
    this._timelineMoveListener = null;

    /**
     * @type {Function}
     * @private
     */
    this._timelineResizeListener = null;

    this._moveAF = null;

    this.value = null;
    this._lastTimeUpdated = null;
}

(0, _inherits2['default'])(D3TableMarker, _eventsEvents2['default']);

D3TableMarker.prototype.defaults = {
    xFormatter: function xFormatter(d) {
        return d;
    },
    outerTickSize: 10,
    tickPadding: 10,
    roundPosition: false,
    bemBlockName: 'tableMarker',
    bemModifier: ''
};

/**
 *
 * @param {D3Timeline} timeline
 */
D3TableMarker.prototype.setTimeline = function (timeline) {

    var previousTimeline = this.timeline;

    this.timeline = timeline && timeline instanceof _D3Timeline2['default'] ? timeline : null;

    if (this.timeline) {
        if (previousTimeline !== this.timeline) {
            if (previousTimeline) {
                this.unbindTimeline(previousTimeline);
            }
            this.bindTimeline();
        }
    } else if (!this.timeline && previousTimeline) {
        this.unbindTimeline(previousTimeline);
    }
};

D3TableMarker.prototype.valueComparator = function (timeA, timeB) {
    return +timeA !== +timeB;
};

D3TableMarker.prototype.setValue = function (value) {

    var previousTimeUpdated = this._lastTimeUpdated;

    this.value = value;

    if (this.valueComparator(previousTimeUpdated, this.value) && this.timeline && this.container) {

        this._lastTimeUpdated = this.value;

        this.container.datum({
            value: value
        });

        this.move();
    }
};

D3TableMarker.prototype.bindTimeline = function () {

    var self = this;

    this.container = this.timeline.container.append('g').datum({
        value: this.value
    }).attr('class', this.options.bemBlockName + (this.options.bemModifier ? ' ' + this.options.bemBlockName + this.options.bemModifier : ''));

    this.container.append('line').attr('class', this.options.bemBlockName + '-line').style('pointer-events', 'none').attr({
        y1: -this.options.outerTickSize,
        y2: this.timeline.dimensions.height
    });

    this.container.append('text').attr('class', this.options.bemBlockName + '-label').attr('dy', -this.options.outerTickSize - this.options.tickPadding);

    // on timeline move, move the marker
    this._timelineMoveListener = this.move.bind(this);
    this.timeline.on(this.timeline.options.bemBlockName + ':move', this._timelineMoveListener);

    // on timeline resize, resize the marker and move it
    this._timelineResizeListener = function (timeline, selection, transitionDuration) {
        self.resize(transitionDuration);
        self.move(transitionDuration);
    };
    this.timeline.on(this.timeline.options.bemBlockName + ':resize', this._timelineResizeListener);

    this.emit('marker:bound');

    this.move();
};

D3TableMarker.prototype.unbindTimeline = function (previousTimeline) {

    previousTimeline.removeListener(this.timeline.options.bemBlockName + ':move', this._timelineMoveListener);
    previousTimeline.removeListener(this.timeline.options.bemBlockName + ':resize', this._timelineResizeListener);

    this.container.remove();

    if (this._moveAF) {
        previousTimeline.cancelAnimationFrame(this._moveAF);
        this._moveAF = null;
    }

    this.container = null;
    this._timelineMoveListener = null;

    this.emit('marker:unbound', previousTimeline);
};

D3TableMarker.prototype.move = function (transitionDuration) {

    var self = this;

    if (this._moveAF) {
        this.timeline.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = this.timeline.requestAnimationFrame(function () {

        self.container.each(function (d) {

            var xScale = self.timeline.scales.x;
            var xRange = xScale.range();
            var left = self.timeline.scales.x(d.value);
            var isInRange = left >= xRange[0] && left <= xRange[xRange.length - 1];

            var g = _d32['default'].select(this);

            if (isInRange) {

                self.show();

                g.attr('transform', 'translate(' + (self.timeline.margin.left + left >> 0) + ',' + self.timeline.margin.top + ')');

                g.select('.' + self.options.bemBlockName + '-label').text(function (d) {
                    return self.options.xFormatter(d.value);
                });
            } else {
                self.hide();
            }
        });
    });
};

D3TableMarker.prototype.show = function () {
    this.container.style('display', '');
};

D3TableMarker.prototype.hide = function () {
    this.container.style('display', 'none');
};

D3TableMarker.prototype.resize = function (transitionDuration) {

    var container = this.container;

    if (transitionDuration > 0) {
        container = this.container.transition().duration(transitionDuration);
    }

    container.select('.' + this.options.bemBlockName + '-line').attr({
        y1: -this.options.outerTickSize,
        y2: this.timeline.dimensions.height
    });
};

module.exports = D3TableMarker;

},{"./D3Timeline":10,"events/events":2,"extend":3,"inherits":4}],8:[function(require,module,exports){
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

    this._timelineMouseenterListener = null;
    this._timelineMousemoveListener = null;
    this._timelineMouseleaveListener = null;

    this._moveAF = null;

    this.on('marker:bound', this.handleTimelineBound.bind(this));
    this.on('marker:unbound', this.handleTimelineUnbound.bind(this));

    this._isListeningToTouchEvents = false;
}

(0, _inherits2['default'])(D3TableMouseTracker, _D3TableMarker2['default']);

D3TableMouseTracker.prototype.defaults = (0, _extend2['default'])(true, {}, _D3TableMarker2['default'].prototype.defaults, {
    bemModifier: '--mouseTracker',
    listenToTouchEvents: true
});

D3TableMouseTracker.prototype.handleTimelineBound = function () {

    this._timelineMouseenterListener = this.handleMouseenter.bind(this);
    this._timelineMousemoveListener = this.handleMousemove.bind(this);
    this._timelineMouseleaveListener = this.handleMouseleave.bind(this);

    this.timeline.on('timeline:mouseenter', this._timelineMouseenterListener);
    this.timeline.on('timeline:mousemove', this._timelineMousemoveListener);
    this.timeline.on('timeline:mouseleave', this._timelineMouseleaveListener);

    if (this.options.listenToTouchEvents) {
        this._isListeningToTouchEvents = true;
        this.timeline.on('timeline:touchmove', this._timelineMousemoveListener);
    } else {
        this._isListeningToTouchEvents = false;
    }
};

D3TableMouseTracker.prototype.handleTimelineUnbound = function (previousTimeline) {

    previousTimeline.removeListener('timeline:mouseenter', this._timelineMouseenterListener);
    previousTimeline.removeListener('timeline:mousemove', this._timelineMousemoveListener);
    previousTimeline.removeListener('timeline:mouseleave', this._timelineMouseleaveListener);

    if (this._isListeningToTouchEvents) {
        previousTimeline.removeListener('timeline:touchmove', this._timelineMousemoveListener);
    }
};

D3TableMouseTracker.prototype.handleMouseenter = function (timeline, selection, d3Event, getTime, getRow) {

    var self = this;

    var time = getTime();

    timeline.requestAnimationFrame(function () {
        self.show();
        self.setValue(time);
    });
};

D3TableMouseTracker.prototype.handleMousemove = function (timeline, selection, d3Event, getTime, getRow) {

    var self = this;
    var time = getTime();

    if (this._moveAF) {
        timeline.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = timeline.requestAnimationFrame(function () {
        self.setValue(time);
    });
};

D3TableMouseTracker.prototype.handleMouseleave = function (timeline, selection, d3Event, getTime, getRow) {

    if (this._moveAF) {
        timeline.cancelAnimationFrame(this._moveAF);
    }

    var self = this;
    timeline.requestAnimationFrame(function () {
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
    bemModifier: '--valueTracker'
});

D3TableValueTracker.prototype.valueGetter = function () {

    return 0;
};

D3TableValueTracker.prototype.start = function () {

    var self = this;

    this.enabled = true;

    d3.timer(function () {

        self.setValue(self.timeGetter());

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
    bemModifier: '--timeTracker'
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

D3TimelineTimeTracker.prototype.valueGetter = function () {
    return this.timeGetter();
};

module.exports = D3TimelineTimeTracker;

},{"./D3TableValueTracker":9,"extend":3,"inherits":4}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9pbmRleC5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL3NyYy9EM0Jsb2NrVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzNELE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOzs7QUNSakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBLFlBQVksQ0FBQzs7Ozs7Ozs7dUJBRU8sV0FBVzs7Ozt3QkFDVixVQUFVOzs7O3NCQUNaLFFBQVE7Ozs7Ozs7Ozs7QUFPM0IsU0FBUyxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQzNCLHlCQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDL0I7O0FBRUQsMkJBQVMsWUFBWSx1QkFBVSxDQUFDOztBQUVoQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyx5QkFBTyxJQUFJLEVBQUUsRUFBRSxFQUFFLHFCQUFRLFNB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cUIsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFlBQVc7QUFDckQsV0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Q0FDNUIsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLHFCQUFxQixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMuRDNUYWJsZSA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGUuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzQmxvY2tUYWJsZSA9IHJlcXVpcmUoJy4vc3JjL0QzQmxvY2tUYWJsZS5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUaW1lbGluZSA9IHJlcXVpcmUoJy4vc3JjL0QzVGltZWxpbmUuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGFibGVNYXJrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlTWFya2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlTW91c2VUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZU1vdXNlVHJhY2tlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZVZhbHVlVHJhY2tlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGltZWxpbmVUaW1lVHJhY2tlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcycpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgey8qKi99XG5cblx0cmV0dXJuIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmUsXG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzBdLFxuXHRcdGkgPSAxLFxuXHRcdGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0ZGVlcCA9IGZhbHNlO1xuXG5cdC8vIEhhbmRsZSBhIGRlZXAgY29weSBzaXR1YXRpb25cblx0aWYgKHR5cGVvZiB0YXJnZXQgPT09ICdib29sZWFuJykge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuXHRcdC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcblx0XHRpID0gMjtcblx0fSBlbHNlIGlmICgodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJykgfHwgdGFyZ2V0ID09IG51bGwpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAob3B0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbbmFtZV07XG5cdFx0XHRcdGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKHRhcmdldCAhPT0gY29weSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRcdGlmIChkZWVwICYmIGNvcHkgJiYgKGlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gaXNBcnJheShjb3B5KSkpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29weUlzQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvcHkgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZSBmcm9tICcuL0QzVGFibGUnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxuLyoqXG4gKlxuICogQGV4dGVuZHMge0QzVGFibGV9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNCbG9ja1RhYmxlKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlLmNhbGwodGhpcywgb3B0aW9ucyk7XG59XG5cbmluaGVyaXRzKEQzQmxvY2tUYWJsZSwgRDNUYWJsZSk7XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGUucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgY2xpcEVsZW1lbnQ6IHRydWUsXG4gICAgY2xpcEVsZW1lbnRGaWx0ZXI6IG51bGwsXG4gICAgcmVuZGVyT25BdXRvbWF0aWNTY3JvbGxJZGxlOiB0cnVlLFxuICAgIGhpZGVUaWNrc09uQXV0b21hdGljU2Nyb2xsOiBmYWxzZSxcbiAgICBhdXRvbWF0aWNTY3JvbGxTcGVlZE11bHRpcGxpZXI6IDJlLTQsXG4gICAgYXV0b21hdGljU2Nyb2xsTWFyZ2luRGVsdGE6IDMwLFxuICAgIGFwcGVuZFRleHQ6IHRydWUsXG4gICAgYWxpZ25MZWZ0OiB0cnVlLFxuICAgIGFsaWduT25UcmFuc2xhdGU6IHRydWUsXG4gICAgbWF4aW11bUNsaWNrRHJhZ1RpbWU6IDEwMCxcbiAgICBtYXhpbXVtQ2xpY2tEcmFnRGlzdGFuY2U6IDEyLFxuICAgIG1pbmltdW1EcmFnRGlzdGFuY2U6IDVcbn0pO1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFBhdGhJZCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENsaXBQYXRoXycgKyB0aGlzLmluc3RhbmNlTnVtYmVyICsgJ18nICsgZC51aWQ7XG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFJlY3RMaW5rID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiAnIycgKyB0aGlzLmdlbmVyYXRlQ2xpcFJlY3RJZChkKTtcbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUGF0aExpbmsgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICd1cmwoIycgKyB0aGlzLmdlbmVyYXRlQ2xpcFBhdGhJZChkKSArICcpJztcbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUmVjdElkID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50Q2xpcFJlY3RfJyArIHRoaXMuaW5zdGFuY2VOdW1iZXIgKyAnXycgKyBkLnVpZDtcbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudEVudGVyID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgZWxlbWVudEhlaWdodCA9IHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgLSB0aGlzLm9wdGlvbnMucm93UGFkZGluZyAqIDI7XG5cbiAgICB2YXIgcmVjdCA9IHNlbGVjdGlvblxuICAgICAgICAuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudEJhY2tncm91bmQnKVxuICAgICAgICAuYXR0cignaGVpZ2h0JywgZWxlbWVudEhlaWdodCk7XG5cbiAgICB2YXIgZyA9IHNlbGVjdGlvblxuICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENvbnRlbnQnKTtcblxuICAgIGcuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50Jyk7XG5cblxuICAgIHZhciBjbGlwRWxlbWVudCA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbGlwRWxlbWVudCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5jbGlwRWxlbWVudEZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2xpcEVsZW1lbnQgPSAhIXRoaXMub3B0aW9ucy5jbGlwRWxlbWVudEZpbHRlci5jYWxsKHRoaXMsIHNlbGVjdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGlwRWxlbWVudCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2xpcEVsZW1lbnQpIHtcblxuICAgICAgICBnXG4gICAgICAgICAgICAuYXR0cignY2xpcC1wYXRoJywgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoTGluay5iaW5kKHRoaXMpKTtcblxuICAgICAgICByZWN0XG4gICAgICAgICAgICAucHJvcGVydHkoJ2lkJywgdGhpcy5nZW5lcmF0ZUNsaXBSZWN0SWQuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgc2VsZWN0aW9uLmFwcGVuZCgnY2xpcFBhdGgnKVxuICAgICAgICAgICAgLnByb3BlcnR5KCdpZCcsIHRoaXMuZ2VuZXJhdGVDbGlwUGF0aElkLmJpbmQodGhpcykpXG4gICAgICAgICAgICAuYXBwZW5kKCd1c2UnKVxuICAgICAgICAgICAgLmF0dHIoJ3hsaW5rOmhyZWYnLCB0aGlzLmdlbmVyYXRlQ2xpcFJlY3RMaW5rLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHNlbGVjdGlvbi5vbignY2xpY2snLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIGlmICghZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpjbGljaycsIHNlbGVjdGlvbiwgbnVsbCwgW2RdKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRUZXh0KSB7XG4gICAgICAgIHNlbGVjdGlvblxuICAgICAgICAgICAgLnNlbGVjdCgnLnRpbWVsaW5lLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpXG4gICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgIC5jbGFzc2VkKCd0aW1lbGluZS1lbnRpdHlMYWJlbCcsIHRydWUpXG4gICAgICAgICAgICAuYXR0cignZHknLCB0aGlzLm9wdGlvbnMucm93SGVpZ2h0LzIgKyA0KTtcbiAgICB9XG5cbiAgICBzZWxlY3Rpb24uY2FsbCh0aGlzLmVsZW1lbnRDb250ZW50RW50ZXIuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmJpbmREcmFnQW5kRHJvcE9uU2VsZWN0aW9uKHNlbGVjdGlvbik7XG5cbn07XG5cblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50c1RyYW5zbGF0ZSA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRUZXh0ICYmIHRoaXMub3B0aW9ucy5hbGlnbkxlZnQgJiYgdGhpcy5vcHRpb25zLmFsaWduT25UcmFuc2xhdGUgJiYgIWQuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIE1hdGgubWF4KC1zZWxmLnNjYWxlcy54KHNlbGYuZ2V0RGF0YVN0YXJ0KGQpKSwgMikgKyAnLDApJ1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRDb250ZW50RW50ZXIgPSBmdW5jdGlvbigpIHt9O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRDb250ZW50VXBkYXRlID0gZnVuY3Rpb24oKSB7fTtcblxuXG4vLyBAdG9kbyBjbGVhbiB1cFxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5iaW5kRHJhZ0FuZERyb3BPblNlbGVjdGlvbiA9IGZ1bmN0aW9uKHNlbGVjdGlvbikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBib2R5Tm9kZSA9IHNlbGYuZWxlbWVudHMuYm9keS5ub2RlKCk7XG5cbiAgICAvLyBwb3NpdGlvbnNcbiAgICB2YXIgY3VycmVudFRyYW5zZm9ybSA9IG51bGw7XG4gICAgdmFyIGRyYWdTdGFydFggPSAwLCBkcmFnU3RhcnRZID0gMDtcbiAgICB2YXIgZWxlbWVudFN0YXJ0WCA9IDAsIGVsZW1lbnRTdGFydFkgPSAwO1xuICAgIHZhciBkcmFnUG9zaXRpb247XG4gICAgdmFyIHN0YXJ0RHJhZ1Bvc2l0aW9uO1xuXG4gICAgLy8gbW92ZW1lbnRzXG4gICAgdmFyIHZlcnRpY2FsTW92ZSA9IDA7XG4gICAgdmFyIGhvcml6b250YWxNb3ZlID0gMDtcbiAgICB2YXIgdmVydGljYWxTcGVlZCA9IDA7XG4gICAgdmFyIGhvcml6b250YWxTcGVlZCA9IDA7XG4gICAgdmFyIHRpbWVyQWN0aXZlID0gZmFsc2U7XG4gICAgdmFyIG5lZWRUaW1lclN0b3AgPSBmYWxzZTtcbiAgICB2YXIgc3RhcnRUaW1lO1xuXG4gICAgLy8gcmVzZXQgc3RhcnQgcG9zaXRpb246IHRvIGNhbGwgb24gZHJhZyBzdGFydCBvciB3aGVuIHRoaW5ncyBhcmUgcmVkcmF3blxuICAgIGZ1bmN0aW9uIHN0b3JlU3RhcnQoKSB7XG4gICAgICAgIGN1cnJlbnRUcmFuc2Zvcm0gPSBkMy50cmFuc2Zvcm0oc2VsZWN0aW9uLmF0dHIoJ3RyYW5zZm9ybScpKTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WCA9IGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzBdO1xuICAgICAgICBlbGVtZW50U3RhcnRZID0gY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMV07XG4gICAgICAgIGRyYWdTdGFydFggPSBkcmFnUG9zaXRpb25bMF07XG4gICAgICAgIGRyYWdTdGFydFkgPSBkcmFnUG9zaXRpb25bMV07XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIG5ldyBkcmFnIHBvc2l0aW9uIGFuZCBtb3ZlIHRoZSBlbGVtZW50XG4gICAgZnVuY3Rpb24gdXBkYXRlVHJhbnNmb3JtKGZvcmNlRHJhdykge1xuXG4gICAgICAgIHZhciBkZWx0YVggPSBkcmFnUG9zaXRpb25bMF0gLSBkcmFnU3RhcnRYO1xuICAgICAgICB2YXIgZGVsdGFZID0gZHJhZ1Bvc2l0aW9uWzFdIC0gZHJhZ1N0YXJ0WTtcblxuICAgICAgICBpZiAoZm9yY2VEcmF3IHx8ICFzZWxmLm9wdGlvbnMucmVuZGVyT25JZGxlKSB7XG4gICAgICAgICAgICBzdG9yZVN0YXJ0KGRyYWdQb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVswXSA9IGVsZW1lbnRTdGFydFggKyBkZWx0YVg7XG4gICAgICAgIGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdID0gZWxlbWVudFN0YXJ0WSArIGRlbHRhWTtcblxuICAgICAgICBzZWxlY3Rpb24uYXR0cigndHJhbnNmb3JtJywgY3VycmVudFRyYW5zZm9ybS50b1N0cmluZygpKTtcblxuICAgIH1cblxuICAgIC8vIHRha2UgbWljcm8gc2Vjb25kcyBpZiBwb3NzaWJsZVxuICAgIHZhciBnZXRQcmVjaXNlVGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZSAmJiB0eXBlb2YgcGVyZm9ybWFuY2Uubm93ID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgcGVyZm9ybWFuY2Uubm93LmJpbmQocGVyZm9ybWFuY2UpXG4gICAgICAgIDogdHlwZW9mIERhdGUubm93ID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgICAgIERhdGUubm93LmJpbmQoRGF0ZSlcbiAgICAgICAgICAgIDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICsobmV3IERhdGUoKSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgLy8gaGFuZGxlIGF1dG9tYXRpYyBzY3JvbGwgYXJndW1lbnRzXG4gICAgZnVuY3Rpb24gZG9BdXRvbWF0aWNTY3JvbGwodGltZURlbHRhLCBmb3JjZURyYXcpIHtcblxuICAgICAgICAvLyBjb21wdXRlIGRlbHRhcyBiYXNlZCBvbiBkaXJlY3Rpb24sIHNwZWVkIGFuZCB0aW1lIGRlbHRhXG4gICAgICAgIHZhciBzcGVlZE11bHRpcGxpZXIgPSBzZWxmLm9wdGlvbnMuYXV0b21hdGljU2Nyb2xsU3BlZWRNdWx0aXBsaWVyO1xuICAgICAgICB2YXIgZGVsdGFYID0gaG9yaXpvbnRhbE1vdmUgKiBob3Jpem9udGFsU3BlZWQgKiB0aW1lRGVsdGEgKiBzcGVlZE11bHRpcGxpZXI7XG4gICAgICAgIHZhciBkZWx0YVkgPSB2ZXJ0aWNhbE1vdmUgKiB2ZXJ0aWNhbFNwZWVkICogdGltZURlbHRhICogc3BlZWRNdWx0aXBsaWVyO1xuXG4gICAgICAgIC8vIHRha2UgZ3JvdXAgdHJhbnNsYXRlIGNhbmNlbGxhdGlvbiB3aXRoIGZvcmNlZCByZWRyYXcgaW50byBhY2NvdW50LCBzbyByZWRlZmluZSBzdGFydFxuICAgICAgICBpZiAoZm9yY2VEcmF3KSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgPSBzZWxmLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlLnNsaWNlKDApO1xuICAgICAgICAgICAgZWxlbWVudFN0YXJ0WCArPSBjdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVswXTtcbiAgICAgICAgICAgIGVsZW1lbnRTdGFydFkgKz0gY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVhbE1vdmUgPSBzZWxmLm1vdmUoZGVsdGFYLCBkZWx0YVksIGZvcmNlRHJhdywgZmFsc2UsICFzZWxmLm9wdGlvbnMuaGlkZVRpY2tzT25BdXRvbWF0aWNTY3JvbGwpO1xuXG4gICAgICAgIGlmIChyZWFsTW92ZVsyXSB8fCByZWFsTW92ZVszXSkge1xuICAgICAgICAgICAgdXBkYXRlVHJhbnNmb3JtKGZvcmNlRHJhdyk7XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50U3RhcnRYIC09IHJlYWxNb3ZlWzJdO1xuICAgICAgICBlbGVtZW50U3RhcnRZIC09IHJlYWxNb3ZlWzNdO1xuXG4gICAgICAgIG5lZWRUaW1lclN0b3AgPSByZWFsTW92ZVsyXSA9PT0gMCAmJiByZWFsTW92ZVszXSA9PT0gMDtcbiAgICB9XG5cbiAgICB2YXIgZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKVxuICAgICAgICAub24oJ2RyYWdzdGFydCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhcnREcmFnUG9zaXRpb24gPSBkcmFnUG9zaXRpb24gPSBkMy5tb3VzZShib2R5Tm9kZSk7XG5cbiAgICAgICAgICAgIHN0YXJ0VGltZSA9ICtuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICBzdG9yZVN0YXJ0KCk7XG5cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdkcmFnJywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIGRyYWdQb3NpdGlvbiA9IGQzLm1vdXNlKGJvZHlOb2RlKTtcblxuICAgICAgICAgICAgdmFyIG1hcmdpbkRlbHRhID0gc2VsZi5vcHRpb25zLmF1dG9tYXRpY1Njcm9sbE1hcmdpbkRlbHRhO1xuICAgICAgICAgICAgdmFyIGRSaWdodCA9IG1hcmdpbkRlbHRhIC0gKHNlbGYuZGltZW5zaW9ucy53aWR0aCAtIGRyYWdQb3NpdGlvblswXSk7XG4gICAgICAgICAgICB2YXIgZExlZnQgPSBtYXJnaW5EZWx0YSAtIGRyYWdQb3NpdGlvblswXTtcbiAgICAgICAgICAgIHZhciBkQm90dG9tID0gbWFyZ2luRGVsdGEgLSAoc2VsZi5kaW1lbnNpb25zLmhlaWdodCAtIGRyYWdQb3NpdGlvblsxXSk7XG4gICAgICAgICAgICB2YXIgZFRvcCA9IG1hcmdpbkRlbHRhIC0gZHJhZ1Bvc2l0aW9uWzFdO1xuXG4gICAgICAgICAgICBob3Jpem9udGFsU3BlZWQgPSBNYXRoLnBvdyhNYXRoLm1heChkUmlnaHQsIGRMZWZ0LCBtYXJnaW5EZWx0YSksIDIpO1xuICAgICAgICAgICAgdmVydGljYWxTcGVlZCA9IE1hdGgucG93KE1hdGgubWF4KGRCb3R0b20sIGRUb3AsIG1hcmdpbkRlbHRhKSwgMik7XG5cbiAgICAgICAgICAgIHZhciBwcmV2aW91c0hvcml6b250YWxNb3ZlID0gaG9yaXpvbnRhbE1vdmU7XG4gICAgICAgICAgICB2YXIgcHJldmlvdXNWZXJ0aWNhbE1vdmUgPSB2ZXJ0aWNhbE1vdmU7XG4gICAgICAgICAgICBob3Jpem9udGFsTW92ZSA9IGRSaWdodCA+IDAgPyAtMSA6IGRMZWZ0ID4gMCA/IDEgOiAwO1xuICAgICAgICAgICAgdmVydGljYWxNb3ZlID0gZEJvdHRvbSA+IDAgPyAtMSA6IGRUb3AgPiAwID8gMSA6IDA7XG5cbiAgICAgICAgICAgIHZhciBoYXNDaGFuZ2VkU3RhdGUgPSBwcmV2aW91c0hvcml6b250YWxNb3ZlICE9PSBob3Jpem9udGFsTW92ZSB8fCBwcmV2aW91c1ZlcnRpY2FsTW92ZSAhPT0gdmVydGljYWxNb3ZlO1xuXG4gICAgICAgICAgICBpZiAoKGhvcml6b250YWxNb3ZlIHx8IHZlcnRpY2FsTW92ZSkgJiYgIXRpbWVyQWN0aXZlICYmIGhhc0NoYW5nZWRTdGF0ZSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHRpbWVyU3RhcnRUaW1lID0gZ2V0UHJlY2lzZVRpbWUoKTtcblxuICAgICAgICAgICAgICAgIHRpbWVyQWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIGQzLnRpbWVyKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VGltZSA9IGdldFByZWNpc2VUaW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lRGVsdGEgPSBjdXJyZW50VGltZSAtIHRpbWVyU3RhcnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lcldpbGxTdG9wID0gIXZlcnRpY2FsTW92ZSAmJiAhaG9yaXpvbnRhbE1vdmUgfHwgbmVlZFRpbWVyU3RvcDtcblxuICAgICAgICAgICAgICAgICAgICBkb0F1dG9tYXRpY1Njcm9sbCh0aW1lRGVsdGEsIHNlbGYub3B0aW9ucy5yZW5kZXJPbkF1dG9tYXRpY1Njcm9sbElkbGUgJiYgdGltZXJXaWxsU3RvcCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGltZXJTdGFydFRpbWUgPSBjdXJyZW50VGltZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZXJXaWxsU3RvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmVlZFRpbWVyU3RvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXJBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lcldpbGxTdG9wO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHNlbGVjdGlvbi5kYXR1bSgpO1xuICAgICAgICAgICAgZGF0YS5fZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChzZWxmLl9kcmFnQUYpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHNlbGYuX2RyYWdBRik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuX2RyYWdBRiA9IHNlbGYucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZVRyYW5zZm9ybSk7XG5cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdkcmFnZW5kJywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHNlbGYuY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2VsZi5fZHJhZ0FGKTtcbiAgICAgICAgICAgIHNlbGYuX2RyYWdBRiA9IG51bGw7XG4gICAgICAgICAgICBob3Jpem9udGFsTW92ZSA9IDA7XG4gICAgICAgICAgICB2ZXJ0aWNhbE1vdmUgPSAwO1xuXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHNlbGVjdGlvbi5kYXR1bSgpO1xuICAgICAgICAgICAgZGF0YS5fZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBkMy50aW1lci5mbHVzaCgpO1xuXG4gICAgICAgICAgICB2YXIgZGVsdGFGcm9tVG9wTGVmdENvcm5lciA9IGQzLm1vdXNlKHNlbGVjdGlvbi5ub2RlKCkpO1xuICAgICAgICAgICAgdmFyIGhhbGZIZWlnaHQgPSBzZWxmLm9wdGlvbnMucm93SGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG5cbiAgICAgICAgICAgIHZhciB0b3RhbERlbHRhWCA9IGRyYWdQb3NpdGlvblswXSAtIHN0YXJ0RHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICAgICAgdmFyIHRvdGFsRGVsdGFZID0gZHJhZ1Bvc2l0aW9uWzFdIC0gc3RhcnREcmFnUG9zaXRpb25bMV07XG4gICAgICAgICAgICB2YXIgZHJhZ0Rpc3RhbmNlID0gTWF0aC5zcXJ0KHRvdGFsRGVsdGFYKnRvdGFsRGVsdGFYK3RvdGFsRGVsdGFZKnRvdGFsRGVsdGFZKTtcbiAgICAgICAgICAgIHZhciB0aW1lRGVsdGEgPSArbmV3IERhdGUoKSAtIHN0YXJ0VGltZTtcblxuICAgICAgICAgICAgaWYgKCh0aW1lRGVsdGEgPiBzZWxmLm9wdGlvbnMubWF4aW11bUNsaWNrRHJhZ1RpbWUgfHwgZHJhZ0Rpc3RhbmNlID4gc2VsZi5vcHRpb25zLm1heGltdW1DbGlja0RyYWdEaXN0YW5jZSkgJiYgZHJhZ0Rpc3RhbmNlID4gc2VsZi5vcHRpb25zLm1pbmltdW1EcmFnRGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OmRyYWdlbmQnLCBzZWxlY3Rpb24sIFstZGVsdGFGcm9tVG9wTGVmdENvcm5lclswXSwgLWRlbHRhRnJvbVRvcExlZnRDb3JuZXJbMV0gKyBoYWxmSGVpZ2h0XSwgW2RhdGFdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZlxuICAgICAgICAgICAgICAgIC51cGRhdGVZKClcbiAgICAgICAgICAgICAgICAuZHJhd1lBeGlzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgc2VsZWN0aW9uLmNhbGwoZHJhZyk7XG5cbn07XG5cblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50VXBkYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBkLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX3dyYXBXaXRoQW5pbWF0aW9uKHNlbGVjdGlvbi5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudEJhY2tncm91bmQnKSwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICB5OiB0aGlzLm9wdGlvbnMucm93UGFkZGluZyxcbiAgICAgICAgICAgIHdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhRW5kKGQpKSAtIHNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhU3RhcnQoZCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRUZXh0ICYmIHRoaXMub3B0aW9ucy5hbGlnbkxlZnQgJiYgIWQuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBkID0+ICd0cmFuc2xhdGUoJyArIE1hdGgubWF4KC10aGlzLnNjYWxlcy54KHRoaXMuZ2V0RGF0YVN0YXJ0KGQpKSwgMikgKyAnLDApJyk7XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudENvbnRlbnRVcGRhdGUoc2VsZWN0aW9uLCBkLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH0pO1xuXG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRFeGl0ID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7XG5cbiAgICBzZWxlY3Rpb24ub24oJ2NsaWNrJywgbnVsbCk7XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEQzQmxvY2tUYWJsZTtcbiIsIi8qIGdsb2JhbCBjYW5jZWxBbmltYXRpb25GcmFtZSwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMvZXZlbnRzJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEM1RhYmxlUm93XG4gKiBAcHJvcGVydHkge1N0cmluZ3xOdW1iZXJ9IGlkXG4gKiBAcHJvcGVydHkge1N0cmluZ30gbmFtZVxuICogQHByb3BlcnR5IHtBcnJheTxEM1RhYmxlRWxlbWVudD59IGVsZW1lbnRzXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEM1RhYmxlRWxlbWVudFxuICogQHByb3BlcnR5IHtTdHJpbmd8TnVtYmVyfSBpZFxuICogQHByb3BlcnR5IHtTdHJpbmd8TnVtYmVyfSB1aWRcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBzdGFydFxuICogQHByb3BlcnR5IHtOdW1iZXJ9IGVuZFxuICogQHByb3BlcnR5IHtOdW1iZXJ9IFtyb3dJbmRleF1cbiAqL1xuXG5cbi8qKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RhYmxlKG9wdGlvbnMpIHtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgRDNUYWJsZS5pbnN0YW5jZXNDb3VudCArPSAxO1xuXG4gICAgdGhpcy5pbnN0YW5jZU51bWJlciA9IEQzVGFibGUuaW5zdGFuY2VzQ291bnQ7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQodHJ1ZSwge30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXk8RDNUYWJsZVJvdz59XG4gICAgICovXG4gICAgdGhpcy5kYXRhID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXk8RDNUYWJsZUVsZW1lbnQ+fVxuICAgICAqL1xuICAgIHRoaXMuZmxhdHRlbmVkRGF0YSA9IFtdO1xuXG5cbiAgICB0aGlzLm1hcmdpbiA9IHtcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICByaWdodDogMCxcbiAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICBsZWZ0OiAwXG4gICAgfTtcblxuICAgIHRoaXMuZGltZW5zaW9ucyA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuXG4gICAgdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IFswLjAsIDAuMF07XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG5cbiAgICB0aGlzLmVsZW1lbnRzID0ge1xuICAgICAgICBib2R5OiBudWxsLFxuICAgICAgICBpbm5lckNvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgeEF4aXNDb250YWluZXI6IG51bGwsXG4gICAgICAgIHgyQXhpc0NvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgeUF4aXNDb250YWluZXI6IG51bGwsXG4gICAgICAgIGRlZnM6IG51bGwsXG4gICAgICAgIGNsaXA6IG51bGxcbiAgICB9O1xuXG4gICAgdGhpcy5zY2FsZXMgPSB7XG4gICAgICAgIHg6IG51bGwsXG4gICAgICAgIHk6IG51bGxcbiAgICB9O1xuXG4gICAgdGhpcy5heGlzZXMgPSB7XG4gICAgICAgIHg6IG51bGwsXG4gICAgICAgIHgyOiBudWxsLFxuICAgICAgICB5OiBudWxsXG4gICAgfTtcblxuICAgIHRoaXMuYmVoYXZpb3JzID0ge1xuICAgICAgICB6b29tOiBudWxsLFxuICAgICAgICB6b29tWDogbnVsbCxcbiAgICAgICAgem9vbVk6IG51bGwsXG4gICAgICAgIHBhbjogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSBudWxsO1xuXG4gICAgdGhpcy5feVNjYWxlID0gMC4wO1xuICAgIHRoaXMuX2RhdGFDaGFuZ2VDb3VudCA9IDA7XG4gICAgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID0gMDtcbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGggPSAwO1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQgPSAwO1xuICAgIHRoaXMuX3ByZXZlbnREcmF3aW5nID0gZmFsc2U7XG4gICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMgPSBbXTtcbiAgICB0aGlzLl9tYXhCb2R5SGVpZ2h0ID0gSW5maW5pdHk7XG59XG5cbmluaGVyaXRzKEQzVGFibGUsIEV2ZW50RW1pdHRlcik7XG5cbkQzVGFibGUucHJvdG90eXBlLmRlZmF1bHRzID0ge1xuICAgIGJlbUJsb2NrTmFtZTogJ3RhYmxlJyxcbiAgICBiZW1CbG9ja01vZGlmaWVyOiAnJyxcbiAgICB4QXhpc0hlaWdodDogNTAsXG4gICAgeUF4aXNXaWR0aDogNTAsXG4gICAgcm93SGVpZ2h0OiAzMCxcbiAgICByb3dQYWRkaW5nOiA1LFxuICAgIGNvbnRhaW5lcjogJ2JvZHknLFxuICAgIGN1bGxpbmdYOiB0cnVlLFxuICAgIGN1bGxpbmdZOiB0cnVlLFxuICAgIGN1bGxpbmdEaXN0YW5jZTogMSxcbiAgICByZW5kZXJPbklkbGU6IHRydWUsXG4gICAgaGlkZVRpY2tzT25ab29tOiBmYWxzZSxcbiAgICBoaWRlVGlja3NPbkRyYWc6IGZhbHNlLFxuICAgIHBhbllPbldoZWVsOiB0cnVlLFxuICAgIHdoZWVsTXVsdGlwbGllcjogMSxcbiAgICBlbmFibGVZVHJhbnNpdGlvbjogdHJ1ZSxcbiAgICBlbmFibGVUcmFuc2l0aW9uT25FeGl0OiB0cnVlLFxuICAgIHVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybTogZmFsc2UsXG4gICAgdHJhbnNpdGlvbkVhc2luZzogJ3F1YWQtaW4tb3V0JyxcbiAgICB4QXhpc1RpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkO1xuICAgIH0sXG4gICAgeEF4aXNTdHJva2VXaWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCUyID8gMSA6IDI7XG4gICAgfSxcbiAgICB4QXhpczJUaWNrc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfSxcbiAgICB5QXhpc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCAmJiBkLm5hbWUgfHwgJyc7XG4gICAgfSxcbiAgICBwYWRkaW5nOiAxMCxcbiAgICB0cmFja2VkRE9NRXZlbnRzOiBbJ2NsaWNrJywgJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnLCAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJ10gLy8gbm90IGR5bmFtaWNcbn07XG5cbkQzVGFibGUuaW5zdGFuY2VzQ291bnQgPSAwO1xuXG5EM1RhYmxlLnByb3RvdHlwZS5ub29wID0gZnVuY3Rpb24oKSB7fTtcblxuRDNUYWJsZS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gY29udGFpbmVyXG4gICAgdGhpcy5jb250YWluZXIgPSBkMy5zZWxlY3QodGhpcy5vcHRpb25zLmNvbnRhaW5lcikuYXBwZW5kKCdzdmcnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgKHRoaXMub3B0aW9ucy5iZW1CbG9ja01vZGlmaWVyID8gJyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArIHRoaXMub3B0aW9ucy5iZW1CbG9ja01vZGlmaWVyIDogJycpKTtcblxuICAgIC8vIGRlZnNcbiAgICB0aGlzLmVsZW1lbnRzLmRlZnMgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2RlZnMnKTtcblxuICAgIC8vIGNsaXAgcmVjdCBpbiBkZWZzXG4gICAgdmFyIGNsaXBJZCA9IHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvZHlDbGlwUGF0aC0tJyArIEQzVGFibGUuaW5zdGFuY2VzQ291bnQ7XG4gICAgdGhpcy5lbGVtZW50cy5jbGlwID0gdGhpcy5lbGVtZW50cy5kZWZzLmFwcGVuZCgnY2xpcFBhdGgnKVxuICAgICAgICAucHJvcGVydHkoJ2lkJywgY2xpcElkKTtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXBcbiAgICAgICAgLmFwcGVuZCgncmVjdCcpO1xuXG4gICAgLy8gc3Vycm91bmRpbmcgcmVjdFxuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5jbGFzc2VkKHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JywgdHJ1ZSk7XG5cbiAgICAvLyBheGlzZXMgY29udGFpbmVyc1xuICAgIHRoaXMuZWxlbWVudHMueEF4aXNDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS14Jyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLngyQXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXggJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXNlY29uZGFyeScpO1xuXG4gICAgdGhpcy5lbGVtZW50cy55QXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXknKTtcblxuICAgIC8vIGJvZHkgY29udGFpbmVyIGlubmVyIGNvbnRhaW5lciBhbmQgc3Vycm91bmRpbmcgcmVjdFxuICAgIHRoaXMuZWxlbWVudHMuYm9keSA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCMnICsgY2xpcElkICsgJyknKTtcblxuICAgIC8vIHN1cnJvdW5kaW5nIHJlY3RcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnLCB0cnVlKTtcblxuICAgIC8vIGlubmVyIGNvbnRhaW5lclxuICAgIHRoaXMuZWxlbWVudHMuaW5uZXJDb250YWluZXIgPSB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdnJyk7XG5cbiAgICAvLyBzdXJyb3VuZGluZyByZWN0XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5jbGFzc2VkKHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcsIHRydWUpO1xuXG4gICAgdGhpcy51cGRhdGVNYXJnaW5zKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVEM0luc3RhbmNlcygpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplRXZlbnRMaXN0ZW5lcnMoKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUueFNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnlTY2FsZUZhY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUubGluZWFyKCk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplRDNJbnN0YW5jZXMgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuc2NhbGVzLnggPSB0aGlzLnhTY2FsZUZhY3RvcnkoKTtcblxuICAgIHRoaXMuc2NhbGVzLnkgPSB0aGlzLnlTY2FsZUZhY3RvcnkoKTtcblxuICAgIHRoaXMuYXhpc2VzLnggPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy54KVxuICAgICAgICAub3JpZW50KCd0b3AnKVxuICAgICAgICAudGlja0Zvcm1hdCh0aGlzLm9wdGlvbnMueEF4aXNUaWNrc0Zvcm1hdHRlci5iaW5kKHRoaXMpKVxuICAgICAgICAub3V0ZXJUaWNrU2l6ZSgwKVxuICAgICAgICAudGlja1BhZGRpbmcoMjApO1xuXG4gICAgdGhpcy5heGlzZXMueDIgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy54KVxuICAgICAgICAub3JpZW50KCd0b3AnKVxuICAgICAgICAudGlja0Zvcm1hdCh0aGlzLm9wdGlvbnMueEF4aXMyVGlja3NGb3JtYXR0ZXIuYmluZCh0aGlzKSlcbiAgICAgICAgLm91dGVyVGlja1NpemUoMClcbiAgICAgICAgLmlubmVyVGlja1NpemUoMCk7XG5cbiAgICB0aGlzLmF4aXNlcy55ID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAuc2NhbGUodGhpcy5zY2FsZXMueSlcbiAgICAgICAgLm9yaWVudCgnbGVmdCcpXG4gICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9pc1JvdW5kKGQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYub3B0aW9ucy55QXhpc0Zvcm1hdHRlcihzZWxmLmRhdGFbKGR8MCldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAub3V0ZXJUaWNrU2l6ZSgwKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20gPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pXG4gICAgICAgIC5vbignem9vbScsIHRoaXMuaGFuZGxlWm9vbWluZy5iaW5kKHRoaXMpKVxuICAgICAgICAub24oJ3pvb21lbmQnLCB0aGlzLmhhbmRsZVpvb21pbmdFbmQuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWCA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAueCh0aGlzLnNjYWxlcy54KVxuICAgICAgICAuc2NhbGUoMSlcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkgPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAgICAgLnkodGhpcy5zY2FsZXMueSlcbiAgICAgICAgLnNjYWxlKDEpXG4gICAgICAgIC5zY2FsZUV4dGVudChbMSwgMV0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMucGFuID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgIC5vbignZHJhZycsIHRoaXMuaGFuZGxlRHJhZ2dpbmcuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuY2FsbCh0aGlzLmJlaGF2aW9ycy5wYW4pO1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5jYWxsKHRoaXMuYmVoYXZpb3JzLnpvb20pO1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdGhpcy5fbGFzdFNjYWxlID0gdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpO1xufVxuXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMub3B0aW9ucy50cmFja2VkRE9NRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuYm9keS5vbihldmVudE5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50TmFtZSAhPT0gJ2NsaWNrJyB8fCAhZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiBkMy5zZWxlY3QoZDMuZXZlbnQudGFyZ2V0KS5jbGFzc2VkKHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JykpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KGV2ZW50TmFtZSwgc2VsZi5lbGVtZW50cy5ib2R5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmVtaXREZXRhaWxlZEV2ZW50ID0gZnVuY3Rpb24oZXZlbnROYW1lLCBkM1RhcmdldFNlbGVjdGlvbiwgZGVsdGEsIHByaW9yaXR5QXJndW1lbnRzLCBleHRyYUFyZ3VtZW50cykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHBvc2l0aW9uO1xuXG4gICAgdmFyIGdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghcG9zaXRpb24pIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gZDMubW91c2Uoc2VsZi5lbGVtZW50cy5ib2R5Lm5vZGUoKSk7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkZWx0YSkpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblswXSArPSBkZWx0YVswXTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblsxXSArPSBkZWx0YVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfTtcblxuICAgIHZhciBhcmdzID0gW1xuICAgICAgICB0aGlzLCAvLyB0aGUgdGFibGUgaW5zdGFuY2VcbiAgICAgICAgZDNUYXJnZXRTZWxlY3Rpb24sIC8vIHRoZSBkMyBzZWxlY3Rpb24gdGFyZ2V0ZWRcbiAgICAgICAgZDMuZXZlbnQsIC8vIHRoZSBkMyBldmVudFxuICAgICAgICBmdW5jdGlvbiBnZXRDb2x1bW4oKSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBnZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLnguaW52ZXJ0KHBvc2l0aW9uWzBdKTtcbiAgICAgICAgfSwgLy8gYSBjb2x1bW4gZ2V0dGVyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJvdygpIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IGdldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5kYXRhW3NlbGYuc2NhbGVzLnkuaW52ZXJ0KHBvc2l0aW9uWzFdKSA+PiAwXTtcbiAgICAgICAgfSAvLyBhIHJvdyBnZXR0ZXJcbiAgICBdO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocHJpb3JpdHlBcmd1bWVudHMpKSB7XG4gICAgICAgIGFyZ3MgPSBwcmlvcml0eUFyZ3VtZW50cy5jb25jYXQoYXJncyk7XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZXh0cmFBcmd1bWVudHMpKSB7XG4gICAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChleHRyYUFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgYXJncy51bnNoaWZ0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOicgKyBldmVudE5hbWUpOyAvLyB0aGUgZXZlbnQgbmFtZVxuXG4gICAgdGhpcy5lbWl0LmFwcGx5KHRoaXMsIGFyZ3MpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlTWFyZ2lucyA9IGZ1bmN0aW9uKHVwZGF0ZURpbWVuc2lvbnMpIHtcblxuICAgIHRoaXMubWFyZ2luID0ge1xuICAgICAgICB0b3A6IHRoaXMub3B0aW9ucy54QXhpc0hlaWdodCArIHRoaXMub3B0aW9ucy5wYWRkaW5nLFxuICAgICAgICByaWdodDogdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIGJvdHRvbTogdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIGxlZnQ6IHRoaXMub3B0aW9ucy55QXhpc1dpZHRoICsgdGhpcy5vcHRpb25zLnBhZGRpbmdcbiAgICB9O1xuXG4gICAgdmFyIGNvbnRlbnRQb3NpdGlvbiA9IHsgeDogdGhpcy5tYXJnaW4ubGVmdCwgeTogdGhpcy5tYXJnaW4udG9wIH07XG4gICAgdmFyIGNvbnRlbnRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyB0aGlzLm1hcmdpbi5sZWZ0ICsgJywnICsgdGhpcy5tYXJnaW4udG9wICsgJyknO1xuXG4gICAgdGhpcy5jb250YWluZXIuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcpXG4gICAgICAgIC5hdHRyKGNvbnRlbnRQb3NpdGlvbik7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHlcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGNvbnRlbnRUcmFuc2Zvcm0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy54QXhpc0NvbnRhaW5lclxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLngyQXhpc0NvbnRhaW5lclxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyB0aGlzLm1hcmdpbi5sZWZ0ICsgJywnICsgdGhpcy5tYXJnaW4udG9wICsgJyknKTtcblxuICAgIGlmICh1cGRhdGVEaW1lbnNpb25zKSB7XG4gICAgICAgIHRoaXMudXBkYXRlWCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVkoKTtcbiAgICB9XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIHJlbW92ZSBiZWhhdmlvciBsaXN0ZW5lcnNcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLm9uKCd6b29tJywgbnVsbCk7XG5cbiAgICAvLyByZW1vdmUgZG9tIGxpc3RlbmVyc1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5vbignLnpvb20nLCBudWxsKTtcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkub24oJ2NsaWNrJywgbnVsbCk7XG5cbiAgICAvLyByZW1vdmUgcmVmZXJlbmNlc1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLmVsZW1lbnRzID0gbnVsbDtcbiAgICB0aGlzLnNjYWxlcyA9IG51bGw7XG4gICAgdGhpcy5heGlzZXMgPSBudWxsO1xuICAgIHRoaXMuYmVoYXZpb3JzID0gbnVsbDtcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xuICAgIHRoaXMuZmxhdHRlbmVkRGF0YSA9IG51bGw7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5yZXN0b3JlWm9vbSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHRoaXMuX2xhc3RUcmFuc2xhdGUpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUodGhpcy5fbGFzdFNjYWxlKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihkeCwgZHksIGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKSB7XG5cbiAgICB2YXIgY3VycmVudFRyYW5zbGF0ZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdmFyIHVwZGF0ZWRUID0gW2N1cnJlbnRUcmFuc2xhdGVbMF0gKyBkeCwgY3VycmVudFRyYW5zbGF0ZVsxXSArIGR5XTtcblxuICAgIHVwZGF0ZWRUID0gdGhpcy5fY2xhbXBUcmFuc2xhdGlvbldpdGhTY2FsZSh1cGRhdGVkVCwgW3RoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSwgdGhpcy5iZWhhdmlvcnMuem9vbVkuc2NhbGUoKV0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVguc2NhbGUodGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWS50cmFuc2xhdGUodXBkYXRlZFQpO1xuXG4gICAgdGhpcy5tb3ZlRWxlbWVudHMoZm9yY2VEcmF3LCBza2lwWEF4aXMsIGZvcmNlVGlja3MpO1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IHVwZGF0ZWRUO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnKTtcblxuICAgIHJldHVybiB1cGRhdGVkVC5jb25jYXQoW3VwZGF0ZWRUWzBdIC0gY3VycmVudFRyYW5zbGF0ZVswXSwgdXBkYXRlZFRbMV0gLSBjdXJyZW50VHJhbnNsYXRlWzFdXSk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5lbnN1cmVJbkRvbWFpbnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tb3ZlKDAsIDAsIGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIHBhbiBYL1kgJiB6b29tIFggaGFuZGxlciAoY2xhbXBlZCBwYW4gWSB3aGVuIHdoZWVsIGlzIHByZXNzZWQgd2l0aG91dCBjdHJsLCB6b29tIFggYW5kIHBhbiBYL1kgb3RoZXJ3aXNlKVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVab29taW5nID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQgJiYgIWQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgJiYgIShkMy5ldmVudC5zb3VyY2VFdmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggPj0gMikpIHtcbiAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnR5cGUgPT09ICd3aGVlbCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFuWU9uV2hlZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVab29tKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVXaGVlbGluZygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVzdG9yZVpvb20oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB0ID0gdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKTtcbiAgICB2YXIgdXBkYXRlZFQgPSBbdFswXSwgdGhpcy5fbGFzdFRyYW5zbGF0ZVsxXV07XG5cbiAgICB1cGRhdGVkVCA9IHRoaXMuX2NsYW1wVHJhbnNsYXRpb25XaXRoU2NhbGUodXBkYXRlZFQsIFt0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCksIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnNjYWxlKCldKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG5cbiAgICB0aGlzLm1vdmVFbGVtZW50cyh0cnVlLCBmYWxzZSwgIXRoaXMub3B0aW9ucy5oaWRlVGlja3NPblpvb20pO1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IHVwZGF0ZWRUO1xuICAgIHRoaXMuX2xhc3RTY2FsZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJyk7XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmhhbmRsZVpvb21pbmdFbmQgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG4gICAgdGhpcy5tb3ZlRWxlbWVudHModHJ1ZSk7XG4gICAgdGhpcy5kcmF3WUF4aXMoKTtcbiAgICB0aGlzLmRyYXdYQXhpcygpO1xufTtcblxuLyoqXG4gKiB3aGVlbCBoYW5kbGVyIChjbGFtcGVkIHBhbiBZKVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVXaGVlbGluZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGV2ZW50ID0gZDMuZXZlbnQuc291cmNlRXZlbnQ7XG5cbiAgICB2YXIgZHggPSAwLCBkeSA9IDA7XG5cbiAgICB2YXIgbW92aW5nWCA9IGV2ZW50ICYmIGV2ZW50LndoZWVsRGVsdGFYIHx8IGV2ZW50LmRlbHRhWDtcblxuICAgIGlmIChtb3ZpbmdYKSB7XG5cbiAgICAgICAgdmFyIG1vdmluZ1JpZ2h0ID0gZXZlbnQud2hlZWxEZWx0YVggPiAwIHx8IGV2ZW50LmRlbHRhWCA8IDA7XG4gICAgICAgIGR4ID0gKG1vdmluZ1JpZ2h0ID8gMSA6IC0xKSAqIHRoaXMuY29sdW1uV2lkdGggKiB0aGlzLm9wdGlvbnMud2hlZWxNdWx0aXBsaWVyO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICB2YXIgbW92aW5nWSA9IGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQud2hlZWxEZWx0YVkgfHwgZXZlbnQuZGV0YWlsIHx8IGV2ZW50LmRlbHRhWTtcblxuICAgICAgICBpZiAobW92aW5nWSkge1xuICAgICAgICAgICAgdmFyIG1vdmluZ0Rvd24gPSBldmVudC53aGVlbERlbHRhID4gMCB8fCBldmVudC53aGVlbERlbHRhWSA+IDAgfHwgZXZlbnQuZGV0YWlsIDwgMCB8fCBldmVudC5kZWx0YVkgPCAwO1xuICAgICAgICAgICAgZHkgPSBtb3ZpbmdZID8gKG1vdmluZ0Rvd24gPyAxIDogLTEpICogdGhpcy5vcHRpb25zLnJvd0hlaWdodCAqIHRoaXMub3B0aW9ucy53aGVlbE11bHRpcGxpZXIgOiAwO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICB0aGlzLm1vdmUoZHgsIGR5LCBmYWxzZSwgIW1vdmluZ1gpO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVEcmFnZ2luZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNoYW5nZWRUb3VjaGVzICYmIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvdWNoZXMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubW92ZShkMy5ldmVudC5keCwgZDMuZXZlbnQuZHksIGZhbHNlLCBmYWxzZSwgIXRoaXMub3B0aW9ucy5oaWRlVGlja3NPbkRyYWcpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudG9nZ2xlRHJhd2luZyA9IGZ1bmN0aW9uKGFjdGl2ZSkge1xuXG4gICAgdGhpcy5fcHJldmVudERyYXdpbmcgPSB0eXBlb2YgYWN0aXZlID09PSAnYm9vbGVhbicgPyAhYWN0aXZlIDogIXRoaXMuX3ByZXZlbnREcmF3aW5nO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0FycmF5PEQzVGFibGVSb3c+fSBkYXRhXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2FuaW1hdGVZXVxuICogQHJldHVybnMge0QzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbihkYXRhLCB0cmFuc2l0aW9uRHVyYXRpb24sIGFuaW1hdGVZKSB7XG5cbiAgICB0aGlzLl9kYXRhQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc1NpemVDaGFuZ2luZyA9IGRhdGEubGVuZ3RoICE9PSB0aGlzLmRhdGEubGVuZ3RoO1xuXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcblxuICAgIHRoaXMuZ2VuZXJhdGVGbGF0dGVuZWREYXRhKCk7XG5cbiAgICBpZiAoaXNTaXplQ2hhbmdpbmcgfHwgdGhpcy5fZGF0YUNoYW5nZUNvdW50ID09PSAxKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgICAgIC51cGRhdGVZKGFuaW1hdGVZID8gdHJhbnNpdGlvbkR1cmF0aW9uIDogdW5kZWZpbmVkKVxuICAgICAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgICAgICAuZHJhd1lBeGlzKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3RWxlbWVudHModHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKiBAcmV0dXJucyB7QXJyYXk8RDNUYWJsZVJvdz59XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRGF0YSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHRoaXMuZGF0YS5tYXAoZnVuY3Rpb24oZCkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7RDNUYWJsZVJvd31cbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSB7fTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZCkge1xuICAgICAgICAgICAgaWYgKGQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICdlbGVtZW50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzW2tleV0gPSBkW2tleV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzW2tleV0gPSBkW2tleV0ubWFwKHNlbGYuY2xvbmVFbGVtZW50LmJpbmQoc2VsZikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFRoaXMgY2xvbmUgbWV0aG9kIGRvZXMgbm90IGNsb25lIHRoZSBlbnRpdGllcyBpdHNlbGZcbiAqIEByZXR1cm5zIHtBcnJheTxEM1RhYmxlRWxlbWVudD59XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRmxhdHRlbmVkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmZsYXR0ZW5lZERhdGEubWFwKGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge0QzVGFibGVFbGVtZW50fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBlKSB7XG4gICAgICAgICAgICBpZiAoZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgcmVzW2tleV0gPSBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKiBAcmV0dXJucyB7RDNUYWJsZUVsZW1lbnR9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRWxlbWVudCA9IGZ1bmN0aW9uKGUpIHtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtEM1RhYmxlRWxlbWVudH1cbiAgICAgKi9cbiAgICB2YXIgcmVzID0ge307XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gZSkge1xuICAgICAgICBpZiAoZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICByZXNba2V5XSA9IGVba2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZXRFbGVtZW50Um93ID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiB0aGlzLl9maW5kKHRoaXMuZGF0YSwgZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIHJldHVybiByb3cuZWxlbWVudHMuaW5kZXhPZihkKSAhPT0gLTE7XG4gICAgfSk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5zdG9yZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnByZXZpb3VzRmxhdHRlbmVkRGF0YSA9IHRoaXMuY2xvbmVGbGF0dGVuZWREYXRhKCk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMudXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtKSB7XG4gICAgICAgIHRoaXMuc3RvcmVGbGF0dGVuZWREYXRhKCk7XG4gICAgfVxuXG4gICAgdGhpcy5mbGF0dGVuZWREYXRhLmxlbmd0aCA9IDA7XG5cbiAgICB0aGlzLmRhdGEuZm9yRWFjaChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIGQuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnJvd0luZGV4ID0gaTtcbiAgICAgICAgICAgIHNlbGYuZmxhdHRlbmVkRGF0YS5wdXNoKGUpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gbWluWFxuICogQHBhcmFtIHtEYXRlfSBtYXhYXG4gKiBAcmV0dXJucyB7RDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc2V0WFJhbmdlID0gZnVuY3Rpb24obWluWCwgbWF4WCkge1xuXG4gICAgdGhpcy5taW5YID0gbWluWDtcbiAgICB0aGlzLm1heFggPSBtYXhYO1xuXG4gICAgdGhpcy5zY2FsZXMueFxuICAgICAgICAuZG9tYWluKFt0aGlzLm1pblgsIHRoaXMubWF4WF0pO1xuXG4gICAgdGhpc1xuICAgICAgICAudXBkYXRlWCgpXG4gICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAuZHJhd0VsZW1lbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnNldEF2YWlsYWJsZVdpZHRoID0gZnVuY3Rpb24oYXZhaWxhYmxlV2lkdGgpIHtcblxuICAgIHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCArPSAxO1xuXG4gICAgdmFyIGlzQXZhaWxhYmxlV2lkdGhDaGFuZ2luZyA9IGF2YWlsYWJsZVdpZHRoICE9PSB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGg7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoID0gYXZhaWxhYmxlV2lkdGg7XG5cbiAgICB0aGlzLmRpbWVuc2lvbnMud2lkdGggPSB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGggLSB0aGlzLm1hcmdpbi5sZWZ0IC0gdGhpcy5tYXJnaW4ucmlnaHQ7XG5cbiAgICBpZiAoaXNBdmFpbGFibGVXaWR0aENoYW5naW5nIHx8IHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWCgpXG4gICAgICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAgICAgLmRyYXdFbGVtZW50cygpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRBdmFpbGFibGVIZWlnaHQgPSBmdW5jdGlvbihhdmFpbGFibGVIZWlnaHQpIHtcblxuICAgIHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCArPSAxO1xuXG4gICAgdmFyIGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgPSBhdmFpbGFibGVIZWlnaHQgIT09IHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQ7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCA9IGF2YWlsYWJsZUhlaWdodDtcblxuICAgIHRoaXMuX21heEJvZHlIZWlnaHQgPSB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0IC0gdGhpcy5tYXJnaW4udG9wIC0gdGhpcy5tYXJnaW4uYm90dG9tO1xuXG4gICAgaWYgKGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgfHwgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID09PSAxKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVZKClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgICAgICAuZHJhd0VsZW1lbnRzKClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVggPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHRoaXMuY29udGFpbmVyLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoICsgdGhpcy5tYXJnaW4ubGVmdCArIHRoaXMubWFyZ2luLnJpZ2h0KTtcblxuICAgIHRoaXMuc2NhbGVzLnhcbiAgICAgICAgLmRvbWFpbihbdGhpcy5taW5YLCB0aGlzLm1heFhdKVxuICAgICAgICAucmFuZ2UoWzAsIHRoaXMuZGltZW5zaW9ucy53aWR0aF0pO1xuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZSgtdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YXG4gICAgICAgIC54KHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC50cmFuc2xhdGUodGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKSlcbiAgICAgICAgLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1ib3VuZGluZ1JlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgdGhpcy5jb250YWluZXIuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXAuc2VsZWN0KCdyZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMsIHRoaXMuY29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihmKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5wdXNoKGYpO1xuXG4gICAgaWYgKHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZztcbiAgICAgICAgICAgIHdoaWxlKGcgPSBzZWxmLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5zaGlmdCgpKSBnKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihmKSB7XG5cbiAgICB2YXIgaW5kZXggPSB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5sZW5ndGggPiAwID8gdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMuaW5kZXhPZihmKSA6IC0xO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRyYXdYQXhpcyA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbiwgc2tpcFRpY2tzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZShza2lwVGlja3MgPyAwIDogLXRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5feEF4aXNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3hBeGlzQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX3hBeGlzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICBzZWxmLl93cmFwV2l0aEFuaW1hdGlvbihzZWxmLmVsZW1lbnRzLnhBeGlzQ29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAuY2FsbChzZWxmLmF4aXNlcy54KVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgnbGluZScpXG4gICAgICAgICAgICAuc3R5bGUoe1xuICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiBzZWxmLm9wdGlvbnMueEF4aXNTdHJva2VXaWR0aC5iaW5kKHNlbGYpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLl93cmFwV2l0aEFuaW1hdGlvbihzZWxmLmVsZW1lbnRzLngyQXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgLmNhbGwoc2VsZi5heGlzZXMueDIpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCd0ZXh0JylcbiAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICB4OiBzZWxmLmNvbHVtbldpZHRoIC8gMlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdHlsZSh7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gK2QgPT09ICtzZWxmLm1heFggPyAnbm9uZScgOiAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZHJhd1lBeGlzID0gZnVuY3Rpb24gZHJhd1lBeGlzKHRyYW5zaXRpb25EdXJhdGlvbiwgc2tpcFRpY2tzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5heGlzZXMueFxuICAgICAgICAuaW5uZXJUaWNrU2l6ZShza2lwVGlja3MgPyAwIDogLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgdmFyIGRvbWFpblkgPSB0aGlzLnNjYWxlcy55LmRvbWFpbigpO1xuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAudGlja1ZhbHVlcyh0aGlzLl9yYW5nZShNYXRoLnJvdW5kKGRvbWFpbllbMF0pLCBNYXRoLnJvdW5kKGRvbWFpbllbMV0pLCAxKSk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5feUF4aXNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3lBeGlzQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX3lBeGlzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgY29udGFpbmVyID0gc2VsZi5fd3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy55QXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgY29udGFpbmVyLmNhbGwoc2VsZi5heGlzZXMueSk7XG5cbiAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCd0ZXh0JykuYXR0cigneScsIHNlbGYub3B0aW9ucy5yb3dIZWlnaHQgLyAyKTtcblxuICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ2xpbmUnKS5zdHlsZSgnZGlzcGxheScsIGZ1bmN0aW9uKGQsaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpID8gJycgOiAnbm9uZSc7XG4gICAgICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm1Gcm9tRGF0YSA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgdGhpcy5zY2FsZXMueCh0aGlzLmdldERhdGFTdGFydChkKSkgKyAnLCcgKyB0aGlzLnNjYWxlcy55KGQucm93SW5kZXgpICsgJyknO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RGF0YVN0YXJ0ID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiArZC5zdGFydDtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmdldERhdGFFbmQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICtkLmVuZDtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRyYXdFbGVtZW50cyA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5fZWxlbWVudHNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2VsZW1lbnRzQUYpXG4gICAgfVxuXG4gICAgdmFyIGVuYWJsZVlUcmFuc2l0aW9uID0gdGhpcy5vcHRpb25zLmVuYWJsZVlUcmFuc2l0aW9uO1xuXG4gICAgdGhpcy5fZWxlbWVudHNBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBkb21haW5YID0gc2VsZi5zY2FsZXMueC5kb21haW4oKTtcbiAgICAgICAgdmFyIGRvbWFpblhTdGFydCA9IGRvbWFpblhbMF07XG4gICAgICAgIHZhciBkb21haW5YRW5kID0gZG9tYWluWFtkb21haW5YLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIHZhciBkb21haW5ZID0gc2VsZi5zY2FsZXMueS5kb21haW4oKTtcbiAgICAgICAgdmFyIGRvbWFpbllTdGFydCA9IGRvbWFpbllbMF07XG4gICAgICAgIHZhciBkb21haW5ZRW5kID0gZG9tYWluWVtkb21haW5ZLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIHZhciBjdWxsaW5nRGlzdGFuY2UgPSBzZWxmLm9wdGlvbnMuY3VsbGluZ0Rpc3RhbmNlO1xuICAgICAgICB2YXIgY3VsbGluZ1ggPSBzZWxmLm9wdGlvbnMuY3VsbGluZ1g7XG4gICAgICAgIHZhciBjdWxsaW5nWSA9IHNlbGYub3B0aW9ucy5jdWxsaW5nWTtcblxuXG4gICAgICAgIHZhciBzdGFydFRyYW5zZm9ybU1hcCA9IHt9O1xuICAgICAgICB2YXIgZW5kVHJhbnNmb3JtTWFwID0ge307XG5cbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy51c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm0gJiYgdHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgaWYgKHNlbGYucHJldmlvdXNGbGF0dGVuZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wcmV2aW91c0ZsYXR0ZW5lZERhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RhcnRUcmFuc2Zvcm1NYXBbZC51aWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRyYW5zZm9ybU1hcFtkLmlkXSA9IHN0YXJ0VHJhbnNmb3JtTWFwW2QudWlkXSA9IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWxmLmZsYXR0ZW5lZERhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZsYXR0ZW5lZERhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZW5kVHJhbnNmb3JtTWFwW2QudWlkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVHJhbnNmb3JtTWFwW2QuaWRdID0gZW5kVHJhbnNmb3JtTWFwW2QudWlkXSA9IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhID0gc2VsZi5mbGF0dGVuZWREYXRhLmZpbHRlcihmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gZC5fZGVmYXVsdFByZXZlbnRlZCB8fCAoIWN1bGxpbmdZIHx8IChkLnJvd0luZGV4ID49IGRvbWFpbllTdGFydCAtIGN1bGxpbmdEaXN0YW5jZSAmJiBkLnJvd0luZGV4IDwgZG9tYWluWUVuZCArIGN1bGxpbmdEaXN0YW5jZSAtIDEpKVxuICAgICAgICAgICAgICAgICYmICghY3VsbGluZ1ggfHwgIShzZWxmLmdldERhdGFFbmQoZCkgPCBkb21haW5YU3RhcnQgfHwgc2VsZi5nZXREYXRhU3RhcnQoZCkgPiBkb21haW5YRW5kKSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgdmFyIGcgPSBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLnNlbGVjdEFsbCgnZy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAuZGF0YShkYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQudWlkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGV4aXRpbmcgPSBnLmV4aXQoKTtcblxuICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmVuYWJsZVRyYW5zaXRpb25PbkV4aXQgJiYgdHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgZXhpdGluZ1xuICAgICAgICAgICAgICAgIC5jYWxsKHNlbGYuZWxlbWVudEV4aXQuYmluZChzZWxmKSk7XG5cbiAgICAgICAgICAgIGV4aXRpbmcuZWFjaChmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZyA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIHZhciBleGl0VHJhbnNmb3JtID0gZW5kVHJhbnNmb3JtTWFwW2QudWlkXSB8fCBlbmRUcmFuc2Zvcm1NYXBbZC5pZF07XG5cbiAgICAgICAgICAgICAgICBpZiAoZXhpdFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl93cmFwV2l0aEFuaW1hdGlvbihnLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZXhpdFRyYW5zZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBnLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleGl0aW5nXG4gICAgICAgICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZy5lbnRlcigpLmFwcGVuZCgnZycpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JylcbiAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5jYWxsKHNlbGYuZWxlbWVudEVudGVyLmJpbmQoc2VsZikpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZy5lYWNoKGZ1bmN0aW9uKGQpIHtcblxuICAgICAgICAgICAgdmFyIGcgPSBkMy5zZWxlY3QodGhpcyk7XG5cbiAgICAgICAgICAgIGlmIChkLl9kZWZhdWx0UHJldmVudGVkKSB7XG5cbiAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRVcGRhdGUoZywgZCwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGhhc1ByZXZpb3VzVHJhbnNmb3JtID0gZy5hdHRyKCd0cmFuc2Zvcm0nKSAhPT0gbnVsbDtcblxuICAgICAgICAgICAgdmFyIG5ld1RyYW5zZm9ybSA9IGVuZFRyYW5zZm9ybU1hcFtkLnVpZF0gfHwgZW5kVHJhbnNmb3JtTWFwW2QuaWRdIHx8IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZCk7XG5cbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWdpblRyYW5zZm9ybSA9IHN0YXJ0VHJhbnNmb3JtTWFwW2QudWlkXSB8fCBzdGFydFRyYW5zZm9ybU1hcFtkLmlkXSB8fCBuZXdUcmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgdmFyIG1vZGlmaWVkT3JpZ2luVHJhbnNmb3JtO1xuICAgICAgICAgICAgICAgIGlmICghaGFzUHJldmlvdXNUcmFuc2Zvcm0gJiYgc2VsZi5vcHRpb25zLnVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ2luVHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RpZmllZE9yaWdpblRyYW5zZm9ybSA9IG9yaWdpblRyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGcuYXR0cigndHJhbnNmb3JtJywgb3JpZ2luVHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlbGYuX3dyYXBXaXRoQW5pbWF0aW9uKGcsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHJUd2VlbihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmlnaW5UcmFuc2Zvcm0gPSBtb2RpZmllZE9yaWdpblRyYW5zZm9ybSB8fCBnLmF0dHIoJ3RyYW5zZm9ybScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuYWJsZVlUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLmludGVycG9sYXRlVHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybSwgbmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXJ0VHJhbnNmb3JtID0gZDMudHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVuZFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShuZXdUcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXSA9IGVuZFRyYW5zZm9ybS50cmFuc2xhdGVbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLmludGVycG9sYXRlVHJhbnNmb3JtKHN0YXJ0VHJhbnNmb3JtLnRvU3RyaW5nKCksIGVuZFRyYW5zZm9ybS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBuZXdUcmFuc2Zvcm0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLmVsZW1lbnRVcGRhdGUoZywgZCwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gWzAuMCwgMC4wXTtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5tb3ZlRWxlbWVudHMgPSBmdW5jdGlvbihmb3JjZURyYXcsIHNraXBYQXhpcywgZm9yY2VUaWNrcykge1xuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMucmVuZGVyT25JZGxlIHx8IGZvcmNlRHJhdykge1xuICAgICAgICB0aGlzLmRyYXdFbGVtZW50cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudHJhbnNsYXRlRWxlbWVudHModGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKSwgdGhpcy5fbGFzdFRyYW5zbGF0ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3WUF4aXModW5kZWZpbmVkLCAhZm9yY2VUaWNrcyk7XG5cbiAgICBpZiAoIXNraXBYQXhpcykge1xuICAgICAgICB0aGlzLnVwZGF0ZVhBeGlzSW50ZXJ2YWwoKTtcbiAgICAgICAgdGhpcy5kcmF3WEF4aXModW5kZWZpbmVkLCAhZm9yY2VUaWNrcyk7XG4gICAgfVxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudHJhbnNsYXRlRWxlbWVudHMgPSBmdW5jdGlvbih0cmFuc2xhdGUsIHByZXZpb3VzVHJhbnNsYXRlKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgdHggPSB0cmFuc2xhdGVbMF0gLSBwcmV2aW91c1RyYW5zbGF0ZVswXTtcbiAgICB2YXIgdHkgPSB0cmFuc2xhdGVbMV0gLSBwcmV2aW91c1RyYW5zbGF0ZVsxXTtcblxuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMF0gPSB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdICsgdHg7XG4gICAgdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVsxXSA9IHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV0gKyB0eTtcblxuXG4gICAgaWYgKHRoaXMuX2VsdHNUcmFuc2xhdGVBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2VsdHNUcmFuc2xhdGVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fZWx0c1RyYW5zbGF0ZUFGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZSgnICsgc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSArICcpJ1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc2VsZi5lbGVtZW50c1RyYW5zbGF0ZSAhPT0gc2VsZi5ub29wKSB7XG4gICAgICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgLnNlbGVjdEFsbCgnLicgKyBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JylcbiAgICAgICAgICAgICAgICAuZWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudHNUcmFuc2xhdGUoZDMuc2VsZWN0KHRoaXMpLCBkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVhBeGlzSW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuY29sdW1uV2lkdGggPSB0aGlzLnNjYWxlcy54KDEpIC0gdGhpcy5zY2FsZXMueCgwKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlWSA9IGZ1bmN0aW9uICh0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcjtcbiAgICB2YXIgY2xpcCA9IHRoaXMuZWxlbWVudHMuY2xpcC5zZWxlY3QoJ3JlY3QnKTtcbiAgICB2YXIgYm91bmRpbmdSZWN0ID0gdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0Jyk7XG5cbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnRhaW5lciA9IGNvbnRhaW5lci50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgY2xpcCA9IGNsaXAudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGJvdW5kaW5nUmVjdCA9IGJvdW5kaW5nUmVjdC50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICB2YXIgZWxlbWVudEFtb3VudCA9IHRoaXMuZGF0YS5sZW5ndGg7XG5cbiAgICAvLyBoYXZlIDEgbW9yZSBlbGVtbnQgdG8gZm9yY2UgcmVwcmVzZW50aW5nIG9uZSBtb3JlIHRpY2tcbiAgICB2YXIgZWxlbWVudHNSYW5nZSA9IFswLCBlbGVtZW50QW1vdW50XTtcblxuICAgIC8vIGNvbXB1dGUgbmV3IGhlaWdodFxuICAgIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgPSBNYXRoLm1pbih0aGlzLmRhdGEubGVuZ3RoICogdGhpcy5vcHRpb25zLnJvd0hlaWdodCwgdGhpcy5fbWF4Qm9keUhlaWdodCk7XG5cbiAgICAvLyBjb21wdXRlIG5ldyBZIHNjYWxlXG4gICAgdGhpcy5feVNjYWxlID0gdGhpcy5vcHRpb25zLnJvd0hlaWdodCAvIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKiBlbGVtZW50QW1vdW50O1xuXG4gICAgLy8gdXBkYXRlIFkgc2NhbGUsIGF4aXMgYW5kIHpvb20gYmVoYXZpb3JcbiAgICB0aGlzLnNjYWxlcy55LmRvbWFpbihlbGVtZW50c1JhbmdlKS5yYW5nZShbMCwgdGhpcy5kaW1lbnNpb25zLmhlaWdodF0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkueSh0aGlzLnNjYWxlcy55KS50cmFuc2xhdGUodGhpcy5fbGFzdFRyYW5zbGF0ZSkuc2NhbGUodGhpcy5feVNjYWxlKTtcblxuICAgIC8vIGFuZCB1cGRhdGUgWCBheGlzIHRpY2tzIGhlaWdodFxuICAgIHRoaXMuYXhpc2VzLnguaW5uZXJUaWNrU2l6ZSgtdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG5cbiAgICAvLyB1cGRhdGUgc3ZnIGhlaWdodFxuICAgIGNvbnRhaW5lci5hdHRyKCdoZWlnaHQnLHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKyB0aGlzLm1hcmdpbi50b3AgKyB0aGlzLm1hcmdpbi5ib3R0b20pO1xuXG4gICAgLy8gdXBkYXRlIGlubmVyIHJlY3QgaGVpZ2h0XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKS5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICBib3VuZGluZ1JlY3QuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgY29udGFpbmVyLnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnKS5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICBjbGlwLmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgdGhpcy5zdG9wRWxlbWVudFRyYW5zaXRpb24oKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLCB0aGlzLmNvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuc3RvcEVsZW1lbnRUcmFuc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5zZWxlY3RBbGwoJ2cuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKS50cmFuc2l0aW9uKClcbiAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgJycpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudEVudGVyID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRVcGRhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHsgcmV0dXJuIHNlbGVjdGlvbjsgfTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudEV4aXQgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHsgcmV0dXJuIHNlbGVjdGlvbjsgfTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX3dyYXBXaXRoQW5pbWF0aW9uID0gZnVuY3Rpb24oc2VsZWN0aW9uLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICByZXR1cm4gc2VsZWN0aW9uLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pLmVhc2UodGhpcy5vcHRpb25zLnRyYW5zaXRpb25FYXNpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZWxlY3Rpb247XG4gICAgfVxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX2dldHRlciA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtwcm9wXTsgfTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLl9pc1JvdW5kID0gZnVuY3Rpb24odikge1xuICAgIHZhciBuID0gdnwwO1xuICAgIHJldHVybiB2ID4gbiAtIDFlLTMgJiYgdiA8IG4gKyAxZS0zO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX3JhbmdlID0gZnVuY3Rpb24oc3RhcnQsIGVuZCwgaW5jKSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIHdoaWxlIChzdGFydCA8IGVuZCkge1xuICAgICAgICByZXMucHVzaChzdGFydCk7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQgKyBpbmM7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59O1xuXG4vKipcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZnIvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvT2JqZXRzX2dsb2JhdXgvQXJyYXkvZmluZFxuICogQHR5cGUgeyp8RnVuY3Rpb259XG4gKiBAcHJpdmF0ZVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5fZmluZCA9IGZ1bmN0aW9uKGxpc3QsIHByZWRpY2F0ZSkge1xuICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aCA+Pj4gMDtcbiAgICB2YXIgdGhpc0FyZyA9IGxpc3Q7XG4gICAgdmFyIHZhbHVlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IGxpc3RbaV07XG4gICAgICAgIGlmIChwcmVkaWNhdGUuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaSwgbGlzdCkpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5fY2xhbXBUcmFuc2xhdGlvbldpdGhTY2FsZSA9IGZ1bmN0aW9uKHRyYW5zbGF0ZSwgc2NhbGUpIHtcblxuICAgIHNjYWxlID0gc2NhbGUgfHwgWzEsIDFdO1xuXG4gICAgaWYgKCEoc2NhbGUgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgICAgc2NhbGUgPSBbc2NhbGUsIHNjYWxlXTtcbiAgICB9XG5cbiAgICB2YXIgdHggPSB0cmFuc2xhdGVbMF07XG4gICAgdmFyIHR5ID0gdHJhbnNsYXRlWzFdO1xuICAgIHZhciBzeCA9IHNjYWxlWzBdO1xuICAgIHZhciBzeSA9IHNjYWxlWzFdO1xuXG4gICAgaWYgKHN4ID09PSAxKSB7XG4gICAgICAgIHR4ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0eCA9IE1hdGgubWluKE1hdGgubWF4KC10aGlzLmRpbWVuc2lvbnMud2lkdGggKiAoc3gtMSksIHR4KSwgMCk7XG4gICAgfVxuXG4gICAgaWYgKHN5ID09PSAxKSB7XG4gICAgICAgIHR5ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0eSA9IE1hdGgubWluKE1hdGgubWF4KC10aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICogKHN5LTEpLCB0eSksIDApO1xuICAgIH1cblxuICAgIHJldHVybiBbdHgsIHR5XTtcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNUYWJsZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMvZXZlbnRzJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5pbXBvcnQgRDNUaW1lbGluZSBmcm9tICcuL0QzVGltZWxpbmUnO1xuXG5mdW5jdGlvbiBEM1RhYmxlTWFya2VyKG9wdGlvbnMpIHtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtEM1RpbWVsaW5lfVxuICAgICAqL1xuICAgIHRoaXMudGltZWxpbmUgPSBudWxsO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGltZWxpbmVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGltZWxpbmVSZXNpemVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSBudWxsO1xuXG4gICAgdGhpcy52YWx1ZSA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFRpbWVVcGRhdGVkID0gbnVsbDtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZU1hcmtlciwgRXZlbnRFbWl0dGVyKTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZGVmYXVsdHMgPSB7XG4gICAgeEZvcm1hdHRlcjogZnVuY3Rpb24oZCkgeyByZXR1cm4gZDsgfSxcbiAgICBvdXRlclRpY2tTaXplOiAxMCxcbiAgICB0aWNrUGFkZGluZzogMTAsXG4gICAgcm91bmRQb3NpdGlvbjogZmFsc2UsXG4gICAgYmVtQmxvY2tOYW1lOiAndGFibGVNYXJrZXInLFxuICAgIGJlbU1vZGlmaWVyOiAnJ1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtEM1RpbWVsaW5lfSB0aW1lbGluZVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zZXRUaW1lbGluZSA9IGZ1bmN0aW9uKHRpbWVsaW5lKSB7XG5cbiAgICB2YXIgcHJldmlvdXNUaW1lbGluZSA9IHRoaXMudGltZWxpbmU7XG5cbiAgICB0aGlzLnRpbWVsaW5lID0gdGltZWxpbmUgJiYgdGltZWxpbmUgaW5zdGFuY2VvZiBEM1RpbWVsaW5lID8gdGltZWxpbmUgOiBudWxsO1xuXG4gICAgaWYgKHRoaXMudGltZWxpbmUpIHtcbiAgICAgICAgaWYgKHByZXZpb3VzVGltZWxpbmUgIT09IHRoaXMudGltZWxpbmUpIHtcbiAgICAgICAgICAgIGlmIChwcmV2aW91c1RpbWVsaW5lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51bmJpbmRUaW1lbGluZShwcmV2aW91c1RpbWVsaW5lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYmluZFRpbWVsaW5lKCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCF0aGlzLnRpbWVsaW5lICYmIHByZXZpb3VzVGltZWxpbmUpIHtcbiAgICAgICAgdGhpcy51bmJpbmRUaW1lbGluZShwcmV2aW91c1RpbWVsaW5lKTtcbiAgICB9XG5cbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnZhbHVlQ29tcGFyYXRvciA9IGZ1bmN0aW9uKHRpbWVBLCB0aW1lQikge1xuICAgIHJldHVybiArdGltZUEgIT09ICt0aW1lQjtcbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24odmFsdWUpIHtcblxuICAgIHZhciBwcmV2aW91c1RpbWVVcGRhdGVkID0gdGhpcy5fbGFzdFRpbWVVcGRhdGVkO1xuXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXG4gICAgaWYgKHRoaXMudmFsdWVDb21wYXJhdG9yKHByZXZpb3VzVGltZVVwZGF0ZWQsIHRoaXMudmFsdWUpICYmIHRoaXMudGltZWxpbmUgJiYgdGhpcy5jb250YWluZXIpIHtcblxuICAgICAgICB0aGlzLl9sYXN0VGltZVVwZGF0ZWQgPSB0aGlzLnZhbHVlO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyXG4gICAgICAgICAgICAuZGF0dW0oe1xuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5tb3ZlKCk7XG4gICAgfVxuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5iaW5kVGltZWxpbmUgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy50aW1lbGluZS5jb250YWluZXJcbiAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgIC5kYXR1bSh7XG4gICAgICAgICAgICB2YWx1ZTogdGhpcy52YWx1ZVxuICAgICAgICB9KVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgKHRoaXMub3B0aW9ucy5iZW1Nb2RpZmllciA/ICcgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyB0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXIgOiAnJykpO1xuXG4gICAgdGhpcy5jb250YWluZXJcbiAgICAgICAgLmFwcGVuZCgnbGluZScpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxpbmUnKVxuICAgICAgICAuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKVxuICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICB5MTogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgeTI6IHRoaXMudGltZWxpbmUuZGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgfSk7XG5cbiAgICB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctbGFiZWwnKVxuICAgICAgICAuYXR0cignZHknLCAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUtdGhpcy5vcHRpb25zLnRpY2tQYWRkaW5nKTtcblxuICAgIC8vIG9uIHRpbWVsaW5lIG1vdmUsIG1vdmUgdGhlIG1hcmtlclxuICAgIHRoaXMuX3RpbWVsaW5lTW92ZUxpc3RlbmVyID0gdGhpcy5tb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy50aW1lbGluZS5vbih0aGlzLnRpbWVsaW5lLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJywgdGhpcy5fdGltZWxpbmVNb3ZlTGlzdGVuZXIpO1xuXG4gICAgLy8gb24gdGltZWxpbmUgcmVzaXplLCByZXNpemUgdGhlIG1hcmtlciBhbmQgbW92ZSBpdFxuICAgIHRoaXMuX3RpbWVsaW5lUmVzaXplTGlzdGVuZXIgPSBmdW5jdGlvbih0aW1lbGluZSwgc2VsZWN0aW9uLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICAgICAgc2VsZi5yZXNpemUodHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgc2VsZi5tb3ZlKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfTtcbiAgICB0aGlzLnRpbWVsaW5lLm9uKHRoaXMudGltZWxpbmUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMuX3RpbWVsaW5lUmVzaXplTGlzdGVuZXIpO1xuXG4gICAgdGhpcy5lbWl0KCdtYXJrZXI6Ym91bmQnKTtcblxuICAgIHRoaXMubW92ZSgpO1xuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS51bmJpbmRUaW1lbGluZSA9IGZ1bmN0aW9uKHByZXZpb3VzVGltZWxpbmUpIHtcblxuICAgIHByZXZpb3VzVGltZWxpbmUucmVtb3ZlTGlzdGVuZXIodGhpcy50aW1lbGluZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScsIHRoaXMuX3RpbWVsaW5lTW92ZUxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RpbWVsaW5lLnJlbW92ZUxpc3RlbmVyKHRoaXMudGltZWxpbmUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMuX3RpbWVsaW5lUmVzaXplTGlzdGVuZXIpO1xuXG4gICAgdGhpcy5jb250YWluZXIucmVtb3ZlKCk7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHByZXZpb3VzVGltZWxpbmUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICAgICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5fdGltZWxpbmVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5lbWl0KCdtYXJrZXI6dW5ib3VuZCcsIHByZXZpb3VzVGltZWxpbmUpO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICB0aGlzLnRpbWVsaW5lLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fbW92ZUFGID0gdGhpcy50aW1lbGluZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgc2VsZi5jb250YWluZXJcbiAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKGQpIHtcblxuICAgICAgICAgICAgICAgIHZhciB4U2NhbGUgPSBzZWxmLnRpbWVsaW5lLnNjYWxlcy54O1xuICAgICAgICAgICAgICAgIHZhciB4UmFuZ2UgPSB4U2NhbGUucmFuZ2UoKTtcbiAgICAgICAgICAgICAgICB2YXIgbGVmdCA9IHNlbGYudGltZWxpbmUuc2NhbGVzLngoZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgdmFyIGlzSW5SYW5nZSA9IGxlZnQgPj0geFJhbmdlWzBdICYmIGxlZnQgPD0geFJhbmdlW3hSYW5nZS5sZW5ndGggLSAxXTtcblxuICAgICAgICAgICAgICAgIHZhciBnID0gZDMuc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzSW5SYW5nZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xuXG4gICAgICAgICAgICAgICAgICAgIGcuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyhzZWxmLnRpbWVsaW5lLm1hcmdpbi5sZWZ0ICsgbGVmdCA+PiAwKSsnLCcrc2VsZi50aW1lbGluZS5tYXJnaW4udG9wKycpJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZy5zZWxlY3QoJy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctbGFiZWwnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoZCA9PiBzZWxmLm9wdGlvbnMueEZvcm1hdHRlcihkLnZhbHVlKSk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5zdHlsZSgnZGlzcGxheScsICcnKTtcbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5zdHlsZSgnZGlzcGxheScsICdub25lJyk7XG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcjtcblxuICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgIGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH1cblxuICAgIGNvbnRhaW5lclxuICAgICAgICAuc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxpbmUnKVxuICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICB5MTogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgeTI6IHRoaXMudGltZWxpbmUuZGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgfSk7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZU1hcmtlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZU1hcmtlciBmcm9tICcuL0QzVGFibGVNYXJrZXInO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxuLyoqXG4gKlxuICogQGV4dGVuZHMge0QzVGFibGVNYXJrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUYWJsZU1vdXNlVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZU1hcmtlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5fdGltZWxpbmVNb3VzZWVudGVyTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RpbWVsaW5lTW91c2Vtb3ZlTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RpbWVsaW5lTW91c2VsZWF2ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuX21vdmVBRiA9IG51bGw7XG5cbiAgICB0aGlzLm9uKCdtYXJrZXI6Ym91bmQnLCB0aGlzLmhhbmRsZVRpbWVsaW5lQm91bmQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5vbignbWFya2VyOnVuYm91bmQnLCB0aGlzLmhhbmRsZVRpbWVsaW5lVW5ib3VuZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IGZhbHNlO1xufVxuXG5pbmhlcml0cyhEM1RhYmxlTW91c2VUcmFja2VyLCBEM1RhYmxlTWFya2VyKTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGVNYXJrZXIucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtTW9kaWZpZXI6ICctLW1vdXNlVHJhY2tlcicsXG4gICAgbGlzdGVuVG9Ub3VjaEV2ZW50czogdHJ1ZVxufSk7XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZVRpbWVsaW5lQm91bmQgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuX3RpbWVsaW5lTW91c2VlbnRlckxpc3RlbmVyID0gdGhpcy5oYW5kbGVNb3VzZWVudGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGltZWxpbmVNb3VzZW1vdmVMaXN0ZW5lciA9IHRoaXMuaGFuZGxlTW91c2Vtb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGltZWxpbmVNb3VzZWxlYXZlTGlzdGVuZXIgPSB0aGlzLmhhbmRsZU1vdXNlbGVhdmUuYmluZCh0aGlzKTtcblxuICAgIHRoaXMudGltZWxpbmUub24oJ3RpbWVsaW5lOm1vdXNlZW50ZXInLCB0aGlzLl90aW1lbGluZU1vdXNlZW50ZXJMaXN0ZW5lcik7XG4gICAgdGhpcy50aW1lbGluZS5vbigndGltZWxpbmU6bW91c2Vtb3ZlJywgdGhpcy5fdGltZWxpbmVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgdGhpcy50aW1lbGluZS5vbigndGltZWxpbmU6bW91c2VsZWF2ZScsIHRoaXMuX3RpbWVsaW5lTW91c2VsZWF2ZUxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubGlzdGVuVG9Ub3VjaEV2ZW50cykge1xuICAgICAgICB0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMgPSB0cnVlO1xuICAgICAgICB0aGlzLnRpbWVsaW5lLm9uKCd0aW1lbGluZTp0b3VjaG1vdmUnLCB0aGlzLl90aW1lbGluZU1vdXNlbW92ZUxpc3RlbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMgPSBmYWxzZTtcbiAgICB9XG59O1xuXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVUaW1lbGluZVVuYm91bmQgPSBmdW5jdGlvbihwcmV2aW91c1RpbWVsaW5lKSB7XG5cbiAgICBwcmV2aW91c1RpbWVsaW5lLnJlbW92ZUxpc3RlbmVyKCd0aW1lbGluZTptb3VzZWVudGVyJywgdGhpcy5fdGltZWxpbmVNb3VzZWVudGVyTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGltZWxpbmUucmVtb3ZlTGlzdGVuZXIoJ3RpbWVsaW5lOm1vdXNlbW92ZScsIHRoaXMuX3RpbWVsaW5lTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGltZWxpbmUucmVtb3ZlTGlzdGVuZXIoJ3RpbWVsaW5lOm1vdXNlbGVhdmUnLCB0aGlzLl90aW1lbGluZU1vdXNlbGVhdmVMaXN0ZW5lcik7XG5cbiAgICBpZiAodGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzKSB7XG4gICAgICAgIHByZXZpb3VzVGltZWxpbmUucmVtb3ZlTGlzdGVuZXIoJ3RpbWVsaW5lOnRvdWNobW92ZScsIHRoaXMuX3RpbWVsaW5lTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIH1cblxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2VlbnRlciA9IGZ1bmN0aW9uKHRpbWVsaW5lLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHRpbWUgPSBnZXRUaW1lKCk7XG5cbiAgICB0aW1lbGluZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuc2hvdygpO1xuICAgICAgICBzZWxmLnNldFZhbHVlKHRpbWUpO1xuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVNb3VzZW1vdmUgPSBmdW5jdGlvbih0aW1lbGluZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgdGltZSA9IGdldFRpbWUoKTtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGltZWxpbmUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSB0aW1lbGluZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuc2V0VmFsdWUodGltZSk7XG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZU1vdXNlbGVhdmUgPSBmdW5jdGlvbih0aW1lbGluZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGltZWxpbmUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGltZWxpbmUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICB9KTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RhYmxlTW91c2VUcmFja2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlTWFya2VyIGZyb20gJy4vRDNUYWJsZU1hcmtlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqXG4gKiBAZXh0ZW5kcyB7RDNUYWJsZU1hcmtlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RhYmxlVmFsdWVUcmFja2VyKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlTWFya2VyLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZVZhbHVlVHJhY2tlciwgRDNUYWJsZU1hcmtlcik7XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbU1vZGlmaWVyOiAnLS12YWx1ZVRyYWNrZXInXG59KTtcblxuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUudmFsdWVHZXR0ZXIgPSBmdW5jdGlvbigpIHtcblxuICAgcmV0dXJuIDA7XG5cbn07XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG4gICAgZDMudGltZXIoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgc2VsZi5zZXRWYWx1ZShzZWxmLnRpbWVHZXR0ZXIoKSk7XG5cbiAgICAgICAgcmV0dXJuICFzZWxmLmVuYWJsZWQ7XG5cbiAgICB9KTtcbn07XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVWYWx1ZVRyYWNrZXI7XG4iLCIvKiBnbG9iYWwgY2FuY2VsQW5pbWF0aW9uRnJhbWUsIHJlcXVlc3RBbmltYXRpb25GcmFtZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBEM0Jsb2NrVGFibGUgZnJvbSAnLi9EM0Jsb2NrVGFibGUnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcblxuLyoqXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RpbWVsaW5lKG9wdGlvbnMpIHtcblxuICAgIEQzQmxvY2tUYWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5jdXJyZW50VGltZUludGVydmFsID0gdGhpcy5vcHRpb25zLm1pbmltdW1UaW1lSW50ZXJ2YWw7XG59XG5cbmluaGVyaXRzKEQzVGltZWxpbmUsIEQzQmxvY2tUYWJsZSk7XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM0Jsb2NrVGFibGUucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtQmxvY2tOYW1lOiAndGltZWxpbmUnLFxuICAgIGJlbUJsb2NrTW9kaWZpZXI6ICcnLFxuICAgIHhBeGlzVGlja3NGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQuZ2V0TWludXRlcygpICUgMTUgPyAnJyA6IGQzLnRpbWUuZm9ybWF0KCclSDolTScpKGQpO1xuICAgIH0sXG4gICAgeEF4aXNTdHJva2VXaWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZC5nZXRNaW51dGVzKCkgJTMwID8gMSA6IDI7XG4gICAgfSxcbiAgICBtaW5pbXVtQ29sdW1uV2lkdGg6IDMwLFxuICAgIG1pbmltdW1UaW1lSW50ZXJ2YWw6IDNlNSxcbiAgICBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzOiBbIDZlNCwgM2U1LCA5ZTUsIDEuOGU2LCAzLjZlNiwgNy4yZTYsIDEuNDRlNywgMi44OGU3LCA0LjMyZTcsIDguNjRlNyBdXG59KTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUueFNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy50aW1lLnNjYWxlKCk7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS55U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpO1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuZ2V0RGF0YVN0YXJ0ID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLnN0YXJ0O1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuZ2V0RGF0YUVuZCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5lbmQ7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVJbnRlcnZhbCkge1xuICAgIHJldHVybiB0aGlzLnNjYWxlcy54KG5ldyBEYXRlKHRpbWVJbnRlcnZhbCkpIC0gdGhpcy5zY2FsZXMueChuZXcgRGF0ZSgwKSk7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS51cGRhdGVYQXhpc0ludGVydmFsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgbWluaW11bVRpbWVJbnRlcnZhbCA9IHRoaXMub3B0aW9ucy5taW5pbXVtVGltZUludGVydmFsO1xuICAgIHZhciBtaW5pbXVtQ29sdW1uV2lkdGggPSB0aGlzLm9wdGlvbnMubWluaW11bUNvbHVtbldpZHRoO1xuICAgIHZhciBjdXJyZW50VGltZUludGVydmFsID0gdGhpcy5jdXJyZW50VGltZUludGVydmFsO1xuICAgIHZhciBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzID0gdGhpcy5vcHRpb25zLmF2YWlsYWJsZVRpbWVJbnRlcnZhbHM7XG4gICAgdmFyIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCA9IGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMuaW5kZXhPZihjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB2YXIgY3VycmVudENvbHVtbldpZHRoID0gdGhpcy5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbChjdXJyZW50VGltZUludGVydmFsKTtcblxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbChkZWx0YSkge1xuICAgICAgICBjdXJyZW50VGltZUludGVydmFsSW5kZXggKz0gZGVsdGE7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzW2N1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleF07XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgfVxuXG4gICAgaWYgKGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoY3VycmVudENvbHVtbldpZHRoIDwgbWluaW11bUNvbHVtbldpZHRoKSB7XG4gICAgICAgICAgICB3aGlsZShjdXJyZW50Q29sdW1uV2lkdGggPCBtaW5pbXVtQ29sdW1uV2lkdGggJiYgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4IDwgYXZhaWxhYmxlVGltZUludGVydmFscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlVGltZUludGVydmFsKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRDb2x1bW5XaWR0aCA+IG1pbmltdW1Db2x1bW5XaWR0aCkge1xuICAgICAgICAgICAgd2hpbGUoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoICYmIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJhbnNsYXRlVGltZUludGVydmFsKDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRUaW1lSW50ZXJ2YWwgPCBtaW5pbXVtVGltZUludGVydmFsKSB7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBtaW5pbXVtVGltZUludGVydmFsO1xuICAgICAgICBjdXJyZW50Q29sdW1uV2lkdGggPSBzZWxmLl9jb21wdXRlQ29sdW1uV2lkdGhGcm9tVGltZUludGVydmFsKGN1cnJlbnRUaW1lSW50ZXJ2YWwpXG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50VGltZUludGVydmFsID0gTWF0aC5mbG9vcihjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB0aGlzLmNvbHVtbldpZHRoID0gTWF0aC5mbG9vcihjdXJyZW50Q29sdW1uV2lkdGgpO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA+IDMuNmU2KSB7XG4gICAgICAgIHRoaXMuYXhpc2VzLngudGlja3MoZDMudGltZS5ob3VycywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gMy42ZTYgKTtcbiAgICAgICAgdGhpcy5heGlzZXMueDIudGlja3MoZDMudGltZS5ob3VycywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gMy42ZTYgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gNmU0KSB7XG4gICAgICAgIHRoaXMuYXhpc2VzLngudGlja3MoZDMudGltZS5taW51dGVzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyA2ZTQgKTtcbiAgICAgICAgdGhpcy5heGlzZXMueDIudGlja3MoZDMudGltZS5taW51dGVzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyA2ZTQgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gMWUzKSB7XG4gICAgICAgIHRoaXMuYXhpc2VzLngudGlja3MoZDMudGltZS5zZWNvbmRzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAxZTMgKTtcbiAgICAgICAgdGhpcy5heGlzZXMueDIudGlja3MoZDMudGltZS5zZWNvbmRzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAxZTMgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLnNldFRpbWVSYW5nZSA9IGZ1bmN0aW9uKG1pbkRhdGUsIG1heERhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRYUmFuZ2UobWluRGF0ZSwgbWF4RGF0ZSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEM1RpbWVsaW5lO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlVmFsdWVUcmFja2VyIGZyb20gJy4vRDNUYWJsZVZhbHVlVHJhY2tlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqXG4gKiBAZXh0ZW5kcyB7RDNUYWJsZVZhbHVlVHJhY2tlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RpbWVsaW5lVGltZVRyYWNrZXIob3B0aW9ucykge1xuICAgIEQzVGFibGVWYWx1ZVRyYWNrZXIuY2FsbCh0aGlzLCBvcHRpb25zKTtcbn1cblxuaW5oZXJpdHMoRDNUaW1lbGluZVRpbWVUcmFja2VyLCBEM1RhYmxlVmFsdWVUcmFja2VyKTtcblxuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1CbG9ja05hbWU6ICd0aW1lbGluZU1hcmtlcicsXG4gICAgYmVtTW9kaWZpZXI6ICctLXRpbWVUcmFja2VyJ1xufSk7XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudGltZUdldHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpO1xufTtcblxuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS50aW1lQ29tcGFyYXRvciA9IGZ1bmN0aW9uKGEsYikge1xuICAgIHJldHVybiB0aGlzLnZhbHVlQ29tcGFyYXRvcihhLGIpO1xufVxuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnNldFRpbWUgPSBmdW5jdGlvbih0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGltZSk7XG59O1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlR2V0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudGltZUdldHRlcigpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RpbWVsaW5lVGltZVRyYWNrZXI7XG4iXX0=
(1)
});
;