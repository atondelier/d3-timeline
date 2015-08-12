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
    alignOnTranslate: true
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

        dragPosition = d3.mouse(bodyNode);

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

        self.emitDetailedEvent('element:dragend', selection, [-deltaFromTopLeftCorner[0], -deltaFromTopLeftCorner[1] + halfHeight], [data]);

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

    selection.call(this.elementContentUpdate.bind(this));
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

D3Table.prototype.emitDetailedEvent = function (eventName, d3TargetSelection, delta, priorityArguments) {

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

    this._currentScaleConfig = null;

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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9pbmRleC5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL3NyYy9EM0Jsb2NrVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzNELE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOzs7QUNSakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBLFlBQVksQ0FBQzs7Ozs7Ozs7dUJBRU8sV0FBVzs7Ozt3QkFDVixVQUFVOzs7O3NCQUNaLFFBQVE7Ozs7Ozs7Ozs7QUFPM0IsU0FBUyxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQzNCLHlCQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDL0I7O0FBRUQsMkJBQVMsWUFBWSx1QkFBVSxDQUFDOztBQUVoQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyx5QkFBTyxJQUFJLEVBQUUsRUFBRSxFQUFFLHFCQUFRLFNB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QzNELFdBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcEMsQ0FBQTs7QUFFRCxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ3JELFdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM5QixDQUFDOztBQUVGLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBVztBQUNyRCxXQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztDQUM1QixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcscUJBQXFCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZS5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNCbG9ja1RhYmxlID0gcmVxdWlyZSgnLi9zcmMvRDNCbG9ja1RhYmxlLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RpbWVsaW5lID0gcmVxdWlyZSgnLi9zcmMvRDNUaW1lbGluZS5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZU1hcmtlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVNYXJrZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGFibGVNb3VzZVRyYWNrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlTW91c2VUcmFja2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlVmFsdWVUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZVZhbHVlVHJhY2tlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUaW1lbGluZVRpbWVUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUaW1lbGluZVRpbWVUcmFja2VyLmpzJyk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxudmFyIGlzQXJyYXkgPSBmdW5jdGlvbiBpc0FycmF5KGFycikge1xuXHRpZiAodHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpO1xuXHR9XG5cblx0cmV0dXJuIHRvU3RyLmNhbGwoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnZhciBpc1BsYWluT2JqZWN0ID0gZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcblx0aWYgKCFvYmogfHwgdG9TdHIuY2FsbChvYmopICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBoYXNPd25Db25zdHJ1Y3RvciA9IGhhc093bi5jYWxsKG9iaiwgJ2NvbnN0cnVjdG9yJyk7XG5cdHZhciBoYXNJc1Byb3RvdHlwZU9mID0gb2JqLmNvbnN0cnVjdG9yICYmIG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgJiYgaGFzT3duLmNhbGwob2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ2lzUHJvdG90eXBlT2YnKTtcblx0Ly8gTm90IG93biBjb25zdHJ1Y3RvciBwcm9wZXJ0eSBtdXN0IGJlIE9iamVjdFxuXHRpZiAob2JqLmNvbnN0cnVjdG9yICYmICFoYXNPd25Db25zdHJ1Y3RvciAmJiAhaGFzSXNQcm90b3R5cGVPZikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIE93biBwcm9wZXJ0aWVzIGFyZSBlbnVtZXJhdGVkIGZpcnN0bHksIHNvIHRvIHNwZWVkIHVwLFxuXHQvLyBpZiBsYXN0IG9uZSBpcyBvd24sIHRoZW4gYWxsIHByb3BlcnRpZXMgYXJlIG93bi5cblx0dmFyIGtleTtcblx0Zm9yIChrZXkgaW4gb2JqKSB7LyoqL31cblxuXHRyZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3VuZGVmaW5lZCcgfHwgaGFzT3duLmNhbGwob2JqLCBrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZSxcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMF0sXG5cdFx0aSA9IDEsXG5cdFx0bGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcblx0XHRkZWVwID0gZmFsc2U7XG5cblx0Ly8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuXHRpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Jvb2xlYW4nKSB7XG5cdFx0ZGVlcCA9IHRhcmdldDtcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMV0gfHwge307XG5cdFx0Ly8gc2tpcCB0aGUgYm9vbGVhbiBhbmQgdGhlIHRhcmdldFxuXHRcdGkgPSAyO1xuXHR9IGVsc2UgaWYgKCh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nKSB8fCB0YXJnZXQgPT0gbnVsbCkge1xuXHRcdHRhcmdldCA9IHt9O1xuXHR9XG5cblx0Zm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbaV07XG5cdFx0Ly8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xuXHRcdGlmIChvcHRpb25zICE9IG51bGwpIHtcblx0XHRcdC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3Rcblx0XHRcdGZvciAobmFtZSBpbiBvcHRpb25zKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFtuYW1lXTtcblx0XHRcdFx0Y29weSA9IG9wdGlvbnNbbmFtZV07XG5cblx0XHRcdFx0Ly8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxuXHRcdFx0XHRpZiAodGFyZ2V0ICE9PSBjb3B5KSB7XG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdFx0aWYgKGRlZXAgJiYgY29weSAmJiAoaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBpc0FycmF5KGNvcHkpKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGV4dGVuZChkZWVwLCBjbG9uZSwgY29weSk7XG5cblx0XHRcdFx0XHQvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY29weSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGNvcHk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG5cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlIGZyb20gJy4vRDNUYWJsZSc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqXG4gKiBAZXh0ZW5kcyB7RDNUYWJsZX1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM0Jsb2NrVGFibGUob3B0aW9ucykge1xuICAgIEQzVGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcbn1cblxuaW5oZXJpdHMoRDNCbG9ja1RhYmxlLCBEM1RhYmxlKTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBjbGlwRWxlbWVudDogdHJ1ZSxcbiAgICBjbGlwRWxlbWVudEZpbHRlcjogbnVsbCxcbiAgICByZW5kZXJPbkF1dG9tYXRpY1Njcm9sbElkbGU6IHRydWUsXG4gICAgaGlkZVRpY2tzT25BdXRvbWF0aWNTY3JvbGw6IGZhbHNlLFxuICAgIGF1dG9tYXRpY1Njcm9sbFNwZWVkTXVsdGlwbGllcjogMmUtNCxcbiAgICBhdXRvbWF0aWNTY3JvbGxNYXJnaW5EZWx0YTogMzAsXG4gICAgYXBwZW5kVGV4dDogdHJ1ZSxcbiAgICBhbGlnbkxlZnQ6IHRydWUsXG4gICAgYWxpZ25PblRyYW5zbGF0ZTogdHJ1ZVxufSk7XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUGF0aElkID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50Q2xpcFBhdGhfJyArIHRoaXMuaW5zdGFuY2VOdW1iZXIgKyAnXycgKyBkLnVpZDtcbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUmVjdExpbmsgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICcjJyArIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdElkKGQpO1xufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBQYXRoTGluayA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gJ3VybCgjJyArIHRoaXMuZ2VuZXJhdGVDbGlwUGF0aElkKGQpICsgJyknO1xufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBSZWN0SWQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRDbGlwUmVjdF8nICsgdGhpcy5pbnN0YW5jZU51bWJlciArICdfJyArIGQudWlkO1xufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50RW50ZXIgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBlbGVtZW50SGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJvd0hlaWdodCAtIHRoaXMub3B0aW9ucy5yb3dQYWRkaW5nICogMjtcblxuICAgIHZhciByZWN0ID0gc2VsZWN0aW9uXG4gICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50QmFja2dyb3VuZCcpXG4gICAgICAgIC5hdHRyKCdoZWlnaHQnLCBlbGVtZW50SGVpZ2h0KTtcblxuICAgIHZhciBnID0gc2VsZWN0aW9uXG4gICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50Q29udGVudCcpO1xuXG4gICAgZy5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50TW92YWJsZUNvbnRlbnQnKTtcblxuXG4gICAgdmFyIGNsaXBFbGVtZW50ID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsaXBFbGVtZW50KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNsaXBFbGVtZW50RmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjbGlwRWxlbWVudCA9ICEhdGhpcy5vcHRpb25zLmNsaXBFbGVtZW50RmlsdGVyLmNhbGwodGhpcywgc2VsZWN0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsaXBFbGVtZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjbGlwRWxlbWVudCkge1xuXG4gICAgICAgIGdcbiAgICAgICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCB0aGlzLmdlbmVyYXRlQ2xpcFBhdGhMaW5rLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHJlY3RcbiAgICAgICAgICAgIC5wcm9wZXJ0eSgnaWQnLCB0aGlzLmdlbmVyYXRlQ2xpcFJlY3RJZC5iaW5kKHRoaXMpKTtcblxuICAgICAgICBzZWxlY3Rpb24uYXBwZW5kKCdjbGlwUGF0aCcpXG4gICAgICAgICAgICAucHJvcGVydHkoJ2lkJywgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoSWQuYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC5hcHBlbmQoJ3VzZScpXG4gICAgICAgICAgICAuYXR0cigneGxpbms6aHJlZicsIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdExpbmsuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgaWYgKCFkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OmNsaWNrJywgc2VsZWN0aW9uLCBudWxsLCBbZF0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZFRleHQpIHtcbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcudGltZWxpbmUtZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgICAgLmNsYXNzZWQoJ3RpbWVsaW5lLWVudGl0eUxhYmVsJywgdHJ1ZSlcbiAgICAgICAgICAgIC5hdHRyKCdkeScsIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQvMiArIDQpO1xuICAgIH1cblxuICAgIHNlbGVjdGlvbi5jYWxsKHRoaXMuZWxlbWVudENvbnRlbnRFbnRlci5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmluZERyYWdBbmREcm9wT25TZWxlY3Rpb24oc2VsZWN0aW9uKTtcblxufTtcblxuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRzVHJhbnNsYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBkKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZFRleHQgJiYgdGhpcy5vcHRpb25zLmFsaWduTGVmdCAmJiB0aGlzLm9wdGlvbnMuYWxpZ25PblRyYW5zbGF0ZSAmJiAhZC5fZGVmYXVsdFByZXZlbnRlZCkge1xuXG4gICAgICAgIHNlbGVjdGlvblxuICAgICAgICAgICAgLnNlbGVjdCgnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50TW92YWJsZUNvbnRlbnQnKVxuICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgTWF0aC5tYXgoLXNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhU3RhcnQoZCkpLCAyKSArICcsMCknXG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudENvbnRlbnRFbnRlciA9IGZ1bmN0aW9uKCkge307XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudENvbnRlbnRVcGRhdGUgPSBmdW5jdGlvbigpIHt9O1xuXG5cbi8vIEB0b2RvIGNsZWFuIHVwXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmJpbmREcmFnQW5kRHJvcE9uU2VsZWN0aW9uID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGJvZHlOb2RlID0gc2VsZi5lbGVtZW50cy5ib2R5Lm5vZGUoKTtcblxuICAgIC8vIHBvc2l0aW9uc1xuICAgIHZhciBjdXJyZW50VHJhbnNmb3JtID0gbnVsbDtcbiAgICB2YXIgZHJhZ1N0YXJ0WCA9IDAsIGRyYWdTdGFydFkgPSAwO1xuICAgIHZhciBlbGVtZW50U3RhcnRYID0gMCwgZWxlbWVudFN0YXJ0WSA9IDA7XG4gICAgdmFyIGRyYWdQb3NpdGlvbjtcblxuICAgIC8vIG1vdmVtZW50c1xuICAgIHZhciB2ZXJ0aWNhbE1vdmUgPSAwO1xuICAgIHZhciBob3Jpem9udGFsTW92ZSA9IDA7XG4gICAgdmFyIHZlcnRpY2FsU3BlZWQgPSAwO1xuICAgIHZhciBob3Jpem9udGFsU3BlZWQgPSAwO1xuICAgIHZhciB0aW1lckFjdGl2ZSA9IGZhbHNlO1xuICAgIHZhciBuZWVkVGltZXJTdG9wID0gZmFsc2U7XG5cbiAgICAvLyByZXNldCBzdGFydCBwb3NpdGlvbjogdG8gY2FsbCBvbiBkcmFnIHN0YXJ0IG9yIHdoZW4gdGhpbmdzIGFyZSByZWRyYXduXG4gICAgZnVuY3Rpb24gc3RvcmVTdGFydCgpIHtcbiAgICAgICAgY3VycmVudFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShzZWxlY3Rpb24uYXR0cigndHJhbnNmb3JtJykpO1xuICAgICAgICBlbGVtZW50U3RhcnRYID0gY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMF07XG4gICAgICAgIGVsZW1lbnRTdGFydFkgPSBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXTtcbiAgICAgICAgZHJhZ1N0YXJ0WCA9IGRyYWdQb3NpdGlvblswXTtcbiAgICAgICAgZHJhZ1N0YXJ0WSA9IGRyYWdQb3NpdGlvblsxXTtcbiAgICB9XG5cbiAgICAvLyBoYW5kbGUgbmV3IGRyYWcgcG9zaXRpb24gYW5kIG1vdmUgdGhlIGVsZW1lbnRcbiAgICBmdW5jdGlvbiB1cGRhdGVUcmFuc2Zvcm0oZm9yY2VEcmF3KSB7XG5cbiAgICAgICAgdmFyIGRlbHRhWCA9IGRyYWdQb3NpdGlvblswXSAtIGRyYWdTdGFydFg7XG4gICAgICAgIHZhciBkZWx0YVkgPSBkcmFnUG9zaXRpb25bMV0gLSBkcmFnU3RhcnRZO1xuXG4gICAgICAgIGlmIChmb3JjZURyYXcgfHwgIXNlbGYub3B0aW9ucy5yZW5kZXJPbklkbGUpIHtcbiAgICAgICAgICAgIHN0b3JlU3RhcnQoZHJhZ1Bvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzBdID0gZWxlbWVudFN0YXJ0WCArIGRlbHRhWDtcbiAgICAgICAgY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMV0gPSBlbGVtZW50U3RhcnRZICsgZGVsdGFZO1xuXG4gICAgICAgIHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nLCBjdXJyZW50VHJhbnNmb3JtLnRvU3RyaW5nKCkpO1xuXG4gICAgfVxuXG4gICAgLy8gdGFrZSBtaWNybyBzZWNvbmRzIGlmIHBvc3NpYmxlXG4gICAgdmFyIGdldFByZWNpc2VUaW1lID0gd2luZG93LnBlcmZvcm1hbmNlICYmIHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICBwZXJmb3JtYW5jZS5ub3cuYmluZChwZXJmb3JtYW5jZSlcbiAgICAgICAgOiB0eXBlb2YgRGF0ZS5ub3cgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgRGF0ZS5ub3cuYmluZChEYXRlKVxuICAgICAgICAgICAgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKyhuZXcgRGF0ZSgpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAvLyBoYW5kbGUgYXV0b21hdGljIHNjcm9sbCBhcmd1bWVudHNcbiAgICBmdW5jdGlvbiBkb0F1dG9tYXRpY1Njcm9sbCh0aW1lRGVsdGEsIGZvcmNlRHJhdykge1xuXG4gICAgICAgIC8vIGNvbXB1dGUgZGVsdGFzIGJhc2VkIG9uIGRpcmVjdGlvbiwgc3BlZWQgYW5kIHRpbWUgZGVsdGFcbiAgICAgICAgdmFyIHNwZWVkTXVsdGlwbGllciA9IHNlbGYub3B0aW9ucy5hdXRvbWF0aWNTY3JvbGxTcGVlZE11bHRpcGxpZXI7XG4gICAgICAgIHZhciBkZWx0YVggPSBob3Jpem9udGFsTW92ZSAqIGhvcml6b250YWxTcGVlZCAqIHRpbWVEZWx0YSAqIHNwZWVkTXVsdGlwbGllcjtcbiAgICAgICAgdmFyIGRlbHRhWSA9IHZlcnRpY2FsTW92ZSAqIHZlcnRpY2FsU3BlZWQgKiB0aW1lRGVsdGEgKiBzcGVlZE11bHRpcGxpZXI7XG5cbiAgICAgICAgLy8gdGFrZSBncm91cCB0cmFuc2xhdGUgY2FuY2VsbGF0aW9uIHdpdGggZm9yY2VkIHJlZHJhdyBpbnRvIGFjY291bnQsIHNvIHJlZGVmaW5lIHN0YXJ0XG4gICAgICAgIGlmIChmb3JjZURyYXcpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUuc2xpY2UoMCk7XG4gICAgICAgICAgICBlbGVtZW50U3RhcnRYICs9IGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdO1xuICAgICAgICAgICAgZWxlbWVudFN0YXJ0WSArPSBjdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVsxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZWFsTW92ZSA9IHNlbGYubW92ZShkZWx0YVgsIGRlbHRhWSwgZm9yY2VEcmF3LCBmYWxzZSwgIXNlbGYub3B0aW9ucy5oaWRlVGlja3NPbkF1dG9tYXRpY1Njcm9sbCk7XG5cbiAgICAgICAgaWYgKHJlYWxNb3ZlWzJdIHx8IHJlYWxNb3ZlWzNdKSB7XG4gICAgICAgICAgICB1cGRhdGVUcmFuc2Zvcm0oZm9yY2VEcmF3KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnRTdGFydFggLT0gcmVhbE1vdmVbMl07XG4gICAgICAgIGVsZW1lbnRTdGFydFkgLT0gcmVhbE1vdmVbM107XG5cbiAgICAgICAgbmVlZFRpbWVyU3RvcCA9IHJlYWxNb3ZlWzJdID09PSAwICYmIHJlYWxNb3ZlWzNdID09PSAwO1xuICAgIH1cblxuICAgIHZhciBkcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgIC5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCkge1xuICAgICAgICAgICAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkcmFnUG9zaXRpb24gPSBkMy5tb3VzZShib2R5Tm9kZSk7XG5cbiAgICAgICAgICAgIHN0b3JlU3RhcnQoKTtcblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2RyYWcnLCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgZHJhZ1Bvc2l0aW9uID0gZDMubW91c2UoYm9keU5vZGUpO1xuXG4gICAgICAgICAgICB2YXIgbWFyZ2luRGVsdGEgPSBzZWxmLm9wdGlvbnMuYXV0b21hdGljU2Nyb2xsTWFyZ2luRGVsdGE7XG4gICAgICAgICAgICB2YXIgZFJpZ2h0ID0gbWFyZ2luRGVsdGEgLSAoc2VsZi5kaW1lbnNpb25zLndpZHRoIC0gZHJhZ1Bvc2l0aW9uWzBdKTtcbiAgICAgICAgICAgIHZhciBkTGVmdCA9IG1hcmdpbkRlbHRhIC0gZHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICAgICAgdmFyIGRCb3R0b20gPSBtYXJnaW5EZWx0YSAtIChzZWxmLmRpbWVuc2lvbnMuaGVpZ2h0IC0gZHJhZ1Bvc2l0aW9uWzFdKTtcbiAgICAgICAgICAgIHZhciBkVG9wID0gbWFyZ2luRGVsdGEgLSBkcmFnUG9zaXRpb25bMV07XG5cbiAgICAgICAgICAgIGhvcml6b250YWxTcGVlZCA9IE1hdGgucG93KE1hdGgubWF4KGRSaWdodCwgZExlZnQsIG1hcmdpbkRlbHRhKSwgMik7XG4gICAgICAgICAgICB2ZXJ0aWNhbFNwZWVkID0gTWF0aC5wb3coTWF0aC5tYXgoZEJvdHRvbSwgZFRvcCwgbWFyZ2luRGVsdGEpLCAyKTtcblxuICAgICAgICAgICAgdmFyIHByZXZpb3VzSG9yaXpvbnRhbE1vdmUgPSBob3Jpem9udGFsTW92ZTtcbiAgICAgICAgICAgIHZhciBwcmV2aW91c1ZlcnRpY2FsTW92ZSA9IHZlcnRpY2FsTW92ZTtcbiAgICAgICAgICAgIGhvcml6b250YWxNb3ZlID0gZFJpZ2h0ID4gMCA/IC0xIDogZExlZnQgPiAwID8gMSA6IDA7XG4gICAgICAgICAgICB2ZXJ0aWNhbE1vdmUgPSBkQm90dG9tID4gMCA/IC0xIDogZFRvcCA+IDAgPyAxIDogMDtcblxuICAgICAgICAgICAgdmFyIGhhc0NoYW5nZWRTdGF0ZSA9IHByZXZpb3VzSG9yaXpvbnRhbE1vdmUgIT09IGhvcml6b250YWxNb3ZlIHx8IHByZXZpb3VzVmVydGljYWxNb3ZlICE9PSB2ZXJ0aWNhbE1vdmU7XG5cbiAgICAgICAgICAgIGlmICgoaG9yaXpvbnRhbE1vdmUgfHwgdmVydGljYWxNb3ZlKSAmJiAhdGltZXJBY3RpdmUgJiYgaGFzQ2hhbmdlZFN0YXRlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGltZXJTdGFydFRpbWUgPSBnZXRQcmVjaXNlVGltZSgpO1xuXG4gICAgICAgICAgICAgICAgdGltZXJBY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgZDMudGltZXIoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRUaW1lID0gZ2V0UHJlY2lzZVRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVEZWx0YSA9IGN1cnJlbnRUaW1lIC0gdGltZXJTdGFydFRpbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVyV2lsbFN0b3AgPSAhdmVydGljYWxNb3ZlICYmICFob3Jpem9udGFsTW92ZSB8fCBuZWVkVGltZXJTdG9wO1xuXG4gICAgICAgICAgICAgICAgICAgIGRvQXV0b21hdGljU2Nyb2xsKHRpbWVEZWx0YSwgc2VsZi5vcHRpb25zLnJlbmRlck9uQXV0b21hdGljU2Nyb2xsSWRsZSAmJiB0aW1lcldpbGxTdG9wKTtcblxuICAgICAgICAgICAgICAgICAgICB0aW1lclN0YXJ0VGltZSA9IGN1cnJlbnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lcldpbGxTdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZWVkVGltZXJTdG9wID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lckFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVyV2lsbFN0b3A7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBkYXRhID0gc2VsZWN0aW9uLmRhdHVtKCk7XG4gICAgICAgICAgICBkYXRhLl9kZWZhdWx0UHJldmVudGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHNlbGYuX2RyYWdBRikge1xuICAgICAgICAgICAgICAgIHNlbGYuY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2VsZi5fZHJhZ0FGKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5fZHJhZ0FGID0gc2VsZi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlVHJhbnNmb3JtKTtcblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2RyYWdlbmQnLCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgc2VsZi5jYW5jZWxBbmltYXRpb25GcmFtZShzZWxmLl9kcmFnQUYpO1xuICAgICAgICAgICAgc2VsZi5fZHJhZ0FGID0gbnVsbDtcbiAgICAgICAgICAgIGhvcml6b250YWxNb3ZlID0gMDtcbiAgICAgICAgICAgIHZlcnRpY2FsTW92ZSA9IDA7XG5cbiAgICAgICAgICAgIHZhciBkYXRhID0gc2VsZWN0aW9uLmRhdHVtKCk7XG4gICAgICAgICAgICBkYXRhLl9kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGQzLnRpbWVyLmZsdXNoKCk7XG5cbiAgICAgICAgICAgIHZhciBkZWx0YUZyb21Ub3BMZWZ0Q29ybmVyID0gZDMubW91c2Uoc2VsZWN0aW9uLm5vZGUoKSk7XG4gICAgICAgICAgICB2YXIgaGFsZkhlaWdodCA9IHNlbGYub3B0aW9ucy5yb3dIZWlnaHQgLyAyO1xuICAgICAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcblxuICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnZW5kJywgc2VsZWN0aW9uLCBbLWRlbHRhRnJvbVRvcExlZnRDb3JuZXJbMF0sIC1kZWx0YUZyb21Ub3BMZWZ0Q29ybmVyWzFdICsgaGFsZkhlaWdodF0sIFtkYXRhXSk7XG5cbiAgICAgICAgICAgIHNlbGZcbiAgICAgICAgICAgICAgICAudXBkYXRlWSgpXG4gICAgICAgICAgICAgICAgLmRyYXdZQXhpcygpO1xuICAgICAgICB9KTtcblxuICAgIHNlbGVjdGlvbi5jYWxsKGRyYWcpO1xuXG59O1xuXG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudFVwZGF0ZSA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZCwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl93cmFwV2l0aEFuaW1hdGlvbihzZWxlY3Rpb24uc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRCYWNrZ3JvdW5kJyksIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgeTogdGhpcy5vcHRpb25zLnJvd1BhZGRpbmcsXG4gICAgICAgICAgICB3aWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy54KHNlbGYuZ2V0RGF0YUVuZChkKSkgLSBzZWxmLnNjYWxlcy54KHNlbGYuZ2V0RGF0YVN0YXJ0KGQpKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kVGV4dCAmJiB0aGlzLm9wdGlvbnMuYWxpZ25MZWZ0ICYmICFkLl9kZWZhdWx0UHJldmVudGVkKSB7XG5cbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpXG4gICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZCA9PiAndHJhbnNsYXRlKCcgKyBNYXRoLm1heCgtdGhpcy5zY2FsZXMueCh0aGlzLmdldERhdGFTdGFydChkKSksIDIpICsgJywwKScpO1xuICAgIH1cblxuICAgIHNlbGVjdGlvbi5jYWxsKHRoaXMuZWxlbWVudENvbnRlbnRVcGRhdGUuYmluZCh0aGlzKSk7XG5cbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudEV4aXQgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHtcblxuICAgIHNlbGVjdGlvbi5vbignY2xpY2snLCBudWxsKTtcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNCbG9ja1RhYmxlO1xuIiwiLyogZ2xvYmFsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cy9ldmVudHMnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcblxuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEQzVGFibGVSb3dcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfE51bWJlcn0gaWRcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBuYW1lXG4gKiBAcHJvcGVydHkge0FycmF5PEQzVGFibGVFbGVtZW50Pn0gZWxlbWVudHNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEQzVGFibGVFbGVtZW50XG4gKiBAcHJvcGVydHkge1N0cmluZ3xOdW1iZXJ9IGlkXG4gKiBAcHJvcGVydHkge1N0cmluZ3xOdW1iZXJ9IHVpZFxuICogQHByb3BlcnR5IHtOdW1iZXJ9IHN0YXJ0XG4gKiBAcHJvcGVydHkge051bWJlcn0gZW5kXG4gKiBAcHJvcGVydHkge051bWJlcn0gW3Jvd0luZGV4XVxuICovXG5cblxuLyoqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGFibGUob3B0aW9ucykge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICBEM1RhYmxlLmluc3RhbmNlc0NvdW50ICs9IDE7XG5cbiAgICB0aGlzLmluc3RhbmNlTnVtYmVyID0gRDNUYWJsZS5pbnN0YW5jZXNDb3VudDtcblxuICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZCh0cnVlLCB7fSwgdGhpcy5kZWZhdWx0cywgb3B0aW9ucyk7XG5cblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheTxEM1RhYmxlUm93Pn1cbiAgICAgKi9cbiAgICB0aGlzLmRhdGEgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheTxEM1RhYmxlRWxlbWVudD59XG4gICAgICovXG4gICAgdGhpcy5mbGF0dGVuZWREYXRhID0gW107XG5cblxuICAgIHRoaXMubWFyZ2luID0ge1xuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICBib3R0b206IDAsXG4gICAgICAgIGxlZnQ6IDBcbiAgICB9O1xuXG4gICAgdGhpcy5kaW1lbnNpb25zID0geyB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG5cbiAgICB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gWzAuMCwgMC4wXTtcblxuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcblxuICAgIHRoaXMuZWxlbWVudHMgPSB7XG4gICAgICAgIGJvZHk6IG51bGwsXG4gICAgICAgIGlubmVyQ29udGFpbmVyOiBudWxsLFxuICAgICAgICB4QXhpc0NvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgeDJBeGlzQ29udGFpbmVyOiBudWxsLFxuICAgICAgICB5QXhpc0NvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgZGVmczogbnVsbCxcbiAgICAgICAgY2xpcDogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLnNjYWxlcyA9IHtcbiAgICAgICAgeDogbnVsbCxcbiAgICAgICAgeTogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLmF4aXNlcyA9IHtcbiAgICAgICAgeDogbnVsbCxcbiAgICAgICAgeDI6IG51bGwsXG4gICAgICAgIHk6IG51bGxcbiAgICB9O1xuXG4gICAgdGhpcy5iZWhhdmlvcnMgPSB7XG4gICAgICAgIHpvb206IG51bGwsXG4gICAgICAgIHpvb21YOiBudWxsLFxuICAgICAgICB6b29tWTogbnVsbCxcbiAgICAgICAgcGFuOiBudWxsXG4gICAgfTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RTY2FsZSA9IG51bGw7XG5cbiAgICB0aGlzLl95U2NhbGUgPSAwLjA7XG4gICAgdGhpcy5fZGF0YUNoYW5nZUNvdW50ID0gMDtcbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPSAwO1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCA9IDA7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCA9IDA7XG4gICAgdGhpcy5fcHJldmVudERyYXdpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycyA9IFtdO1xuICAgIHRoaXMuX21heEJvZHlIZWlnaHQgPSBJbmZpbml0eTtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZSwgRXZlbnRFbWl0dGVyKTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMgPSB7XG4gICAgYmVtQmxvY2tOYW1lOiAndGFibGUnLFxuICAgIGJlbUJsb2NrTW9kaWZpZXI6ICcnLFxuICAgIHhBeGlzSGVpZ2h0OiA1MCxcbiAgICB5QXhpc1dpZHRoOiA1MCxcbiAgICByb3dIZWlnaHQ6IDMwLFxuICAgIHJvd1BhZGRpbmc6IDUsXG4gICAgY29udGFpbmVyOiAnYm9keScsXG4gICAgY3VsbGluZ1g6IHRydWUsXG4gICAgY3VsbGluZ1k6IHRydWUsXG4gICAgY3VsbGluZ0Rpc3RhbmNlOiAxLFxuICAgIHJlbmRlck9uSWRsZTogdHJ1ZSxcbiAgICBoaWRlVGlja3NPblpvb206IGZhbHNlLFxuICAgIGhpZGVUaWNrc09uRHJhZzogZmFsc2UsXG4gICAgcGFuWU9uV2hlZWw6IHRydWUsXG4gICAgd2hlZWxNdWx0aXBsaWVyOiAxLFxuICAgIGVuYWJsZVlUcmFuc2l0aW9uOiB0cnVlLFxuICAgIGVuYWJsZVRyYW5zaXRpb25PbkV4aXQ6IHRydWUsXG4gICAgdXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtOiBmYWxzZSxcbiAgICB0cmFuc2l0aW9uRWFzaW5nOiAncXVhZC1pbi1vdXQnLFxuICAgIHhBeGlzVGlja3NGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgfSxcbiAgICB4QXhpc1N0cm9rZVdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkJTIgPyAxIDogMjtcbiAgICB9LFxuICAgIHhBeGlzMlRpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9LFxuICAgIHlBeGlzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkICYmIGQubmFtZSB8fCAnJztcbiAgICB9LFxuICAgIHBhZGRpbmc6IDEwLFxuICAgIHRyYWNrZWRET01FdmVudHM6IFsnY2xpY2snLCAnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZScsICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXSAvLyBub3QgZHluYW1pY1xufTtcblxuRDNUYWJsZS5pbnN0YW5jZXNDb3VudCA9IDA7XG5cbkQzVGFibGUucHJvdG90eXBlLm5vb3AgPSBmdW5jdGlvbigpIHt9O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBjb250YWluZXJcbiAgICB0aGlzLmNvbnRhaW5lciA9IGQzLnNlbGVjdCh0aGlzLm9wdGlvbnMuY29udGFpbmVyKS5hcHBlbmQoJ3N2ZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAodGhpcy5vcHRpb25zLmJlbUJsb2NrTW9kaWZpZXIgPyAnICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTW9kaWZpZXIgOiAnJykpO1xuXG4gICAgLy8gZGVmc1xuICAgIHRoaXMuZWxlbWVudHMuZGVmcyA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZGVmcycpO1xuXG4gICAgLy8gY2xpcCByZWN0IGluIGRlZnNcbiAgICB2YXIgY2xpcElkID0gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm9keUNsaXBQYXRoLS0nICsgRDNUYWJsZS5pbnN0YW5jZXNDb3VudDtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXAgPSB0aGlzLmVsZW1lbnRzLmRlZnMuYXBwZW5kKCdjbGlwUGF0aCcpXG4gICAgICAgIC5wcm9wZXJ0eSgnaWQnLCBjbGlwSWQpO1xuICAgIHRoaXMuZWxlbWVudHMuY2xpcFxuICAgICAgICAuYXBwZW5kKCdyZWN0Jyk7XG5cbiAgICAvLyBzdXJyb3VuZGluZyByZWN0XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnLCB0cnVlKTtcblxuICAgIC8vIGF4aXNlcyBjb250YWluZXJzXG4gICAgdGhpcy5lbGVtZW50cy54QXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXgnKTtcblxuICAgIHRoaXMuZWxlbWVudHMueDJBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teCAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0tc2Vjb25kYXJ5Jyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teScpO1xuXG4gICAgLy8gYm9keSBjb250YWluZXIgaW5uZXIgY29udGFpbmVyIGFuZCBzdXJyb3VuZGluZyByZWN0XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5ID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoIycgKyBjbGlwSWQgKyAnKScpO1xuXG4gICAgLy8gc3Vycm91bmRpbmcgcmVjdFxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuY2xhc3NlZCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcsIHRydWUpO1xuXG4gICAgLy8gaW5uZXIgY29udGFpbmVyXG4gICAgdGhpcy5lbGVtZW50cy5pbm5lckNvbnRhaW5lciA9IHRoaXMuZWxlbWVudHMuYm9keS5hcHBlbmQoJ2cnKTtcblxuICAgIC8vIHN1cnJvdW5kaW5nIHJlY3RcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0JywgdHJ1ZSk7XG5cbiAgICB0aGlzLnVwZGF0ZU1hcmdpbnMoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUQzSW5zdGFuY2VzKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVFdmVudExpc3RlbmVycygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS54U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUueVNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmluaXRpYWxpemVEM0luc3RhbmNlcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5zY2FsZXMueCA9IHRoaXMueFNjYWxlRmFjdG9yeSgpO1xuXG4gICAgdGhpcy5zY2FsZXMueSA9IHRoaXMueVNjYWxlRmFjdG9yeSgpO1xuXG4gICAgdGhpcy5heGlzZXMueCA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgLnNjYWxlKHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5vcmllbnQoJ3RvcCcpXG4gICAgICAgIC50aWNrRm9ybWF0KHRoaXMub3B0aW9ucy54QXhpc1RpY2tzRm9ybWF0dGVyLmJpbmQodGhpcykpXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApXG4gICAgICAgIC50aWNrUGFkZGluZygyMCk7XG5cbiAgICB0aGlzLmF4aXNlcy54MiA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgLnNjYWxlKHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5vcmllbnQoJ3RvcCcpXG4gICAgICAgIC50aWNrRm9ybWF0KHRoaXMub3B0aW9ucy54QXhpczJUaWNrc0Zvcm1hdHRlci5iaW5kKHRoaXMpKVxuICAgICAgICAub3V0ZXJUaWNrU2l6ZSgwKVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZSgwKTtcblxuICAgIHRoaXMuYXhpc2VzLnkgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy55KVxuICAgICAgICAub3JpZW50KCdsZWZ0JylcbiAgICAgICAgLnRpY2tGb3JtYXQoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuX2lzUm91bmQoZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5vcHRpb25zLnlBeGlzRm9ybWF0dGVyKHNlbGYuZGF0YVsoZHwwKV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSlcbiAgICAgICAgLm9uKCd6b29tJywgdGhpcy5oYW5kbGVab29taW5nLmJpbmQodGhpcykpXG4gICAgICAgIC5vbignem9vbWVuZCcsIHRoaXMuaGFuZGxlWm9vbWluZ0VuZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YID0gZDMuYmVoYXZpb3Iuem9vbSgpXG4gICAgICAgIC54KHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5zY2FsZSgxKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAueSh0aGlzLnNjYWxlcy55KVxuICAgICAgICAuc2NhbGUoMSlcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy5wYW4gPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgICAgLm9uKCdkcmFnJywgdGhpcy5oYW5kbGVEcmFnZ2luZy5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5jYWxsKHRoaXMuYmVoYXZpb3JzLnBhbik7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmNhbGwodGhpcy5iZWhhdmlvcnMuem9vbSk7XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKTtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCk7XG59XG5cbkQzVGFibGUucHJvdG90eXBlLmluaXRpYWxpemVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5vcHRpb25zLnRyYWNrZWRET01FdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudE5hbWUpIHtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5ib2R5Lm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnROYW1lICE9PSAnY2xpY2snIHx8ICFkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkICYmIGQzLnNlbGVjdChkMy5ldmVudC50YXJnZXQpLmNsYXNzZWQoc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoZXZlbnROYW1lLCBzZWxmLmVsZW1lbnRzLmJvZHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZW1pdERldGFpbGVkRXZlbnQgPSBmdW5jdGlvbihldmVudE5hbWUsIGQzVGFyZ2V0U2VsZWN0aW9uLCBkZWx0YSwgcHJpb3JpdHlBcmd1bWVudHMpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwb3NpdGlvbjtcblxuICAgIHZhciBnZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXBvc2l0aW9uKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGQzLm1vdXNlKHNlbGYuZWxlbWVudHMuYm9keS5ub2RlKCkpO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGVsdGEpKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25bMF0gKz0gZGVsdGFbMF07XG4gICAgICAgICAgICAgICAgcG9zaXRpb25bMV0gKz0gZGVsdGFbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH07XG5cbiAgICB2YXIgYXJncyA9IFtcbiAgICAgICAgdGhpcywgLy8gdGhlIHRhYmxlIGluc3RhbmNlXG4gICAgICAgIGQzVGFyZ2V0U2VsZWN0aW9uLCAvLyB0aGUgZDMgc2VsZWN0aW9uIHRhcmdldGVkXG4gICAgICAgIGQzLmV2ZW50LCAvLyB0aGUgZDMgZXZlbnRcbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29sdW1uKCkge1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy54LmludmVydChwb3NpdGlvblswXSk7XG4gICAgICAgIH0sIC8vIGEgY29sdW1uIGdldHRlclxuICAgICAgICBmdW5jdGlvbiBnZXRSb3coKSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBnZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZGF0YVtzZWxmLnNjYWxlcy55LmludmVydChwb3NpdGlvblsxXSkgPj4gMF07XG4gICAgICAgIH0gLy8gYSByb3cgZ2V0dGVyXG4gICAgXTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KHByaW9yaXR5QXJndW1lbnRzKSkge1xuICAgICAgICBhcmdzID0gcHJpb3JpdHlBcmd1bWVudHMuY29uY2F0KGFyZ3MpO1xuICAgIH1cblxuICAgIGFyZ3MudW5zaGlmdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzonICsgZXZlbnROYW1lKTsgLy8gdGhlIGV2ZW50IG5hbWVcblxuICAgIHRoaXMuZW1pdC5hcHBseSh0aGlzLCBhcmdzKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZU1hcmdpbnMgPSBmdW5jdGlvbih1cGRhdGVEaW1lbnNpb25zKSB7XG5cbiAgICB0aGlzLm1hcmdpbiA9IHtcbiAgICAgICAgdG9wOiB0aGlzLm9wdGlvbnMueEF4aXNIZWlnaHQgKyB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgcmlnaHQ6IHRoaXMub3B0aW9ucy5wYWRkaW5nLFxuICAgICAgICBib3R0b206IHRoaXMub3B0aW9ucy5wYWRkaW5nLFxuICAgICAgICBsZWZ0OiB0aGlzLm9wdGlvbnMueUF4aXNXaWR0aCArIHRoaXMub3B0aW9ucy5wYWRkaW5nXG4gICAgfTtcblxuICAgIHZhciBjb250ZW50UG9zaXRpb24gPSB7IHg6IHRoaXMubWFyZ2luLmxlZnQsIHk6IHRoaXMubWFyZ2luLnRvcCB9O1xuICAgIHZhciBjb250ZW50VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgdGhpcy5tYXJnaW4ubGVmdCArICcsJyArIHRoaXMubWFyZ2luLnRvcCArICcpJztcblxuICAgIHRoaXMuY29udGFpbmVyLnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnKVxuICAgICAgICAuYXR0cihjb250ZW50UG9zaXRpb24pO1xuXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5XG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueEF4aXNDb250YWluZXJcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGNvbnRlbnRUcmFuc2Zvcm0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy54MkF4aXNDb250YWluZXJcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGNvbnRlbnRUcmFuc2Zvcm0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy55QXhpc0NvbnRhaW5lclxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgdGhpcy5tYXJnaW4ubGVmdCArICcsJyArIHRoaXMubWFyZ2luLnRvcCArICcpJyk7XG5cbiAgICBpZiAodXBkYXRlRGltZW5zaW9ucykge1xuICAgICAgICB0aGlzLnVwZGF0ZVgoKTtcbiAgICAgICAgdGhpcy51cGRhdGVZKCk7XG4gICAgfVxuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyByZW1vdmUgYmVoYXZpb3IgbGlzdGVuZXJzXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS5vbignem9vbScsIG51bGwpO1xuXG4gICAgLy8gcmVtb3ZlIGRvbSBsaXN0ZW5lcnNcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkub24oJy56b29tJywgbnVsbCk7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5Lm9uKCdjbGljaycsIG51bGwpO1xuXG4gICAgLy8gcmVtb3ZlIHJlZmVyZW5jZXNcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5lbGVtZW50cyA9IG51bGw7XG4gICAgdGhpcy5zY2FsZXMgPSBudWxsO1xuICAgIHRoaXMuYXhpc2VzID0gbnVsbDtcbiAgICB0aGlzLmJlaGF2aW9ycyA9IG51bGw7XG4gICAgdGhpcy5kYXRhID0gbnVsbDtcbiAgICB0aGlzLmZsYXR0ZW5lZERhdGEgPSBudWxsO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUucmVzdG9yZVpvb20gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSh0aGlzLl9sYXN0VHJhbnNsYXRlKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKHRoaXMuX2xhc3RTY2FsZSk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oZHgsIGR5LCBmb3JjZURyYXcsIHNraXBYQXhpcywgZm9yY2VUaWNrcykge1xuXG4gICAgdmFyIGN1cnJlbnRUcmFuc2xhdGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpO1xuICAgIHZhciB1cGRhdGVkVCA9IFtjdXJyZW50VHJhbnNsYXRlWzBdICsgZHgsIGN1cnJlbnRUcmFuc2xhdGVbMV0gKyBkeV07XG5cbiAgICB1cGRhdGVkVCA9IHRoaXMuX2NsYW1wVHJhbnNsYXRpb25XaXRoU2NhbGUodXBkYXRlZFQsIFt0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCksIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnNjYWxlKCldKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkudHJhbnNsYXRlKHVwZGF0ZWRUKTtcblxuICAgIHRoaXMubW92ZUVsZW1lbnRzKGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVDtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJyk7XG5cbiAgICByZXR1cm4gdXBkYXRlZFQuY29uY2F0KFt1cGRhdGVkVFswXSAtIGN1cnJlbnRUcmFuc2xhdGVbMF0sIHVwZGF0ZWRUWzFdIC0gY3VycmVudFRyYW5zbGF0ZVsxXV0pO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZW5zdXJlSW5Eb21haW5zID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubW92ZSgwLCAwLCBmYWxzZSwgZmFsc2UsIHRydWUpO1xufTtcblxuLyoqXG4gKiBwYW4gWC9ZICYgem9vbSBYIGhhbmRsZXIgKGNsYW1wZWQgcGFuIFkgd2hlbiB3aGVlbCBpcyBwcmVzc2VkIHdpdGhvdXQgY3RybCwgem9vbSBYIGFuZCBwYW4gWC9ZIG90aGVyd2lzZSlcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlWm9vbWluZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmICFkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5ICYmICEoZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID49IDIpKSB7XG4gICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC50eXBlID09PSAnd2hlZWwnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBhbllPbldoZWVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlWm9vbSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlV2hlZWxpbmcoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlc3RvcmVab29tKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdCA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdmFyIHVwZGF0ZWRUID0gW3RbMF0sIHRoaXMuX2xhc3RUcmFuc2xhdGVbMV1dO1xuXG4gICAgdXBkYXRlZFQgPSB0aGlzLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlKHVwZGF0ZWRULCBbdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpLCB0aGlzLmJlaGF2aW9ycy56b29tWS5zY2FsZSgpXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVgudHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuXG4gICAgdGhpcy5tb3ZlRWxlbWVudHModHJ1ZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25ab29tKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVDtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScpO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVab29taW5nRW5kID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuICAgIHRoaXMubW92ZUVsZW1lbnRzKHRydWUpO1xuICAgIHRoaXMuZHJhd1lBeGlzKCk7XG4gICAgdGhpcy5kcmF3WEF4aXMoKTtcbn07XG5cbi8qKlxuICogd2hlZWwgaGFuZGxlciAoY2xhbXBlZCBwYW4gWSlcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlV2hlZWxpbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBldmVudCA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50O1xuXG4gICAgdmFyIGR4ID0gMCwgZHkgPSAwO1xuXG4gICAgdmFyIG1vdmluZ1ggPSBldmVudCAmJiBldmVudC53aGVlbERlbHRhWCB8fCBldmVudC5kZWx0YVg7XG5cbiAgICBpZiAobW92aW5nWCkge1xuXG4gICAgICAgIHZhciBtb3ZpbmdSaWdodCA9IGV2ZW50LndoZWVsRGVsdGFYID4gMCB8fCBldmVudC5kZWx0YVggPCAwO1xuICAgICAgICBkeCA9IChtb3ZpbmdSaWdodCA/IDEgOiAtMSkgKiB0aGlzLmNvbHVtbldpZHRoICogdGhpcy5vcHRpb25zLndoZWVsTXVsdGlwbGllcjtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdmFyIG1vdmluZ1kgPSBldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LndoZWVsRGVsdGFZIHx8IGV2ZW50LmRldGFpbCB8fCBldmVudC5kZWx0YVk7XG5cbiAgICAgICAgaWYgKG1vdmluZ1kpIHtcbiAgICAgICAgICAgIHZhciBtb3ZpbmdEb3duID0gZXZlbnQud2hlZWxEZWx0YSA+IDAgfHwgZXZlbnQud2hlZWxEZWx0YVkgPiAwIHx8IGV2ZW50LmRldGFpbCA8IDAgfHwgZXZlbnQuZGVsdGFZIDwgMDtcbiAgICAgICAgICAgIGR5ID0gbW92aW5nWSA/IChtb3ZpbmdEb3duID8gMSA6IC0xKSAqIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgKiB0aGlzLm9wdGlvbnMud2hlZWxNdWx0aXBsaWVyIDogMDtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgdGhpcy5tb3ZlKGR4LCBkeSwgZmFsc2UsICFtb3ZpbmdYKTtcblxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlRHJhZ2dpbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b3VjaGVzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm1vdmUoZDMuZXZlbnQuZHgsIGQzLmV2ZW50LmR5LCBmYWxzZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25EcmFnKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnRvZ2dsZURyYXdpbmcgPSBmdW5jdGlvbihhY3RpdmUpIHtcblxuICAgIHRoaXMuX3ByZXZlbnREcmF3aW5nID0gdHlwZW9mIGFjdGl2ZSA9PT0gJ2Jvb2xlYW4nID8gIWFjdGl2ZSA6ICF0aGlzLl9wcmV2ZW50RHJhd2luZztcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtBcnJheTxEM1RhYmxlUm93Pn0gZGF0YVxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFthbmltYXRlWV1cbiAqIEByZXR1cm5zIHtEM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24oZGF0YSwgdHJhbnNpdGlvbkR1cmF0aW9uLCBhbmltYXRlWSkge1xuXG4gICAgdGhpcy5fZGF0YUNoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNTaXplQ2hhbmdpbmcgPSBkYXRhLmxlbmd0aCAhPT0gdGhpcy5kYXRhLmxlbmd0aDtcblxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICB0aGlzLmdlbmVyYXRlRmxhdHRlbmVkRGF0YSgpO1xuXG4gICAgaWYgKGlzU2l6ZUNoYW5naW5nIHx8IHRoaXMuX2RhdGFDaGFuZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgICAgICAudXBkYXRlWShhbmltYXRlWSA/IHRyYW5zaXRpb25EdXJhdGlvbiA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd0VsZW1lbnRzKHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICogQHJldHVybnMge0FycmF5PEQzVGFibGVSb3c+fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZURhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiB0aGlzLmRhdGEubWFwKGZ1bmN0aW9uKGQpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge0QzVGFibGVSb3d9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0ge307XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIGQpIHtcbiAgICAgICAgICAgIGlmIChkLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAnZWxlbWVudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc1trZXldID0gZFtrZXldO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc1trZXldID0gZFtrZXldLm1hcChzZWxmLmNsb25lRWxlbWVudC5iaW5kKHNlbGYpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKiBAcmV0dXJucyB7QXJyYXk8RDNUYWJsZUVsZW1lbnQ+fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5mbGF0dGVuZWREYXRhLm1hcChmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtEM1RhYmxlRWxlbWVudH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSB7fTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZSkge1xuICAgICAgICAgICAgaWYgKGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHJlc1trZXldID0gZVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICogQHJldHVybnMge0QzVGFibGVFbGVtZW50fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZUVsZW1lbnQgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RDNUYWJsZUVsZW1lbnR9XG4gICAgICovXG4gICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgZm9yICh2YXIga2V5IGluIGUpIHtcbiAgICAgICAgaWYgKGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgcmVzW2tleV0gPSBlW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RWxlbWVudFJvdyA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmluZCh0aGlzLmRhdGEsIGZ1bmN0aW9uKHJvdykge1xuICAgICAgICByZXR1cm4gcm93LmVsZW1lbnRzLmluZGV4T2YoZCkgIT09IC0xO1xuICAgIH0pO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuc3RvcmVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wcmV2aW91c0ZsYXR0ZW5lZERhdGEgPSB0aGlzLmNsb25lRmxhdHRlbmVkRGF0YSgpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybSkge1xuICAgICAgICB0aGlzLnN0b3JlRmxhdHRlbmVkRGF0YSgpO1xuICAgIH1cblxuICAgIHRoaXMuZmxhdHRlbmVkRGF0YS5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5kYXRhLmZvckVhY2goZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICBkLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5yb3dJbmRleCA9IGk7XG4gICAgICAgICAgICBzZWxmLmZsYXR0ZW5lZERhdGEucHVzaChlKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IG1pblhcbiAqIEBwYXJhbSB7RGF0ZX0gbWF4WFxuICogQHJldHVybnMge0QzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnNldFhSYW5nZSA9IGZ1bmN0aW9uKG1pblgsIG1heFgpIHtcblxuICAgIHRoaXMubWluWCA9IG1pblg7XG4gICAgdGhpcy5tYXhYID0gbWF4WDtcblxuICAgIHRoaXMuc2NhbGVzLnhcbiAgICAgICAgLmRvbWFpbihbdGhpcy5taW5YLCB0aGlzLm1heFhdKTtcblxuICAgIHRoaXNcbiAgICAgICAgLnVwZGF0ZVgoKVxuICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAuZHJhd1lBeGlzKClcbiAgICAgICAgLmRyYXdFbGVtZW50cygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRBdmFpbGFibGVXaWR0aCA9IGZ1bmN0aW9uKGF2YWlsYWJsZVdpZHRoKSB7XG5cbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc0F2YWlsYWJsZVdpZHRoQ2hhbmdpbmcgPSBhdmFpbGFibGVXaWR0aCAhPT0gdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoO1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCA9IGF2YWlsYWJsZVdpZHRoO1xuXG4gICAgdGhpcy5kaW1lbnNpb25zLndpZHRoID0gdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoIC0gdGhpcy5tYXJnaW4ubGVmdCAtIHRoaXMubWFyZ2luLnJpZ2h0O1xuXG4gICAgaWYgKGlzQXZhaWxhYmxlV2lkdGhDaGFuZ2luZyB8fCB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPT09IDEpIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAgICAgLnVwZGF0ZVgoKVxuICAgICAgICAgICAgLnVwZGF0ZVhBeGlzSW50ZXJ2YWwoKVxuICAgICAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgICAgICAuZHJhd1lBeGlzKClcbiAgICAgICAgICAgIC5kcmF3RWxlbWVudHMoKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuc2V0QXZhaWxhYmxlSGVpZ2h0ID0gZnVuY3Rpb24oYXZhaWxhYmxlSGVpZ2h0KSB7XG5cbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc0F2YWlsYWJsZUhlaWdodENoYW5naW5nID0gYXZhaWxhYmxlSGVpZ2h0ICE9PSB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0O1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQgPSBhdmFpbGFibGVIZWlnaHQ7XG5cbiAgICB0aGlzLl9tYXhCb2R5SGVpZ2h0ID0gdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCAtIHRoaXMubWFyZ2luLnRvcCAtIHRoaXMubWFyZ2luLmJvdHRvbTtcblxuICAgIGlmIChpc0F2YWlsYWJsZUhlaWdodENoYW5naW5nIHx8IHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWSgpXG4gICAgICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAgICAgLmRyYXdFbGVtZW50cygpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVYID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCArIHRoaXMubWFyZ2luLmxlZnQgKyB0aGlzLm1hcmdpbi5yaWdodCk7XG5cbiAgICB0aGlzLnNjYWxlcy54XG4gICAgICAgIC5kb21haW4oW3RoaXMubWluWCwgdGhpcy5tYXhYXSlcbiAgICAgICAgLnJhbmdlKFswLCB0aGlzLmRpbWVuc2lvbnMud2lkdGhdKTtcblxuICAgIHRoaXMuYXhpc2VzLnlcbiAgICAgICAgLmlubmVyVGlja1NpemUoLXRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWFxuICAgICAgICAueCh0aGlzLnNjYWxlcy54KVxuICAgICAgICAudHJhbnNsYXRlKHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCkpXG4gICAgICAgIC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuICAgIHRoaXMuY29udGFpbmVyLnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgdGhpcy5lbGVtZW50cy5jbGlwLnNlbGVjdCgncmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLCB0aGlzLmNvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oZikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMucHVzaChmKTtcblxuICAgIGlmICh0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGc7XG4gICAgICAgICAgICB3aGlsZShnID0gc2VsZi5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMuc2hpZnQoKSkgZygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZjtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oZikge1xuXG4gICAgdmFyIGluZGV4ID0gdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMubGVuZ3RoID4gMCA/IHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmluZGV4T2YoZikgOiAtMTtcblxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5kcmF3WEF4aXMgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24sIHNraXBUaWNrcykge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuYXhpc2VzLnlcbiAgICAgICAgLmlubmVyVGlja1NpemUoc2tpcFRpY2tzID8gMCA6IC10aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX3hBeGlzQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl94QXhpc0FGKTtcbiAgICB9XG5cbiAgICB0aGlzLl94QXhpc0FGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgc2VsZi5fd3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy54QXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgLmNhbGwoc2VsZi5heGlzZXMueClcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ2xpbmUnKVxuICAgICAgICAgICAgLnN0eWxlKHtcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogc2VsZi5vcHRpb25zLnhBeGlzU3Ryb2tlV2lkdGguYmluZChzZWxmKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5fd3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy54MkF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5jYWxsKHNlbGYuYXhpc2VzLngyKVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgndGV4dCcpXG4gICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgeDogc2VsZi5jb2x1bW5XaWR0aCAvIDJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3R5bGUoe1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICtkID09PSArc2VsZi5tYXhYID8gJ25vbmUnIDogJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRyYXdZQXhpcyA9IGZ1bmN0aW9uIGRyYXdZQXhpcyh0cmFuc2l0aW9uRHVyYXRpb24sIHNraXBUaWNrcykge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuYXhpc2VzLnhcbiAgICAgICAgLmlubmVyVGlja1NpemUoc2tpcFRpY2tzID8gMCA6IC10aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIHZhciBkb21haW5ZID0gdGhpcy5zY2FsZXMueS5kb21haW4oKTtcblxuICAgIHRoaXMuYXhpc2VzLnlcbiAgICAgICAgLnRpY2tWYWx1ZXModGhpcy5fcmFuZ2UoTWF0aC5yb3VuZChkb21haW5ZWzBdKSwgTWF0aC5yb3VuZChkb21haW5ZWzFdKSwgMSkpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX3lBeGlzQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl95QXhpc0FGKTtcbiAgICB9XG5cbiAgICB0aGlzLl95QXhpc0FGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHNlbGYuX3dyYXBXaXRoQW5pbWF0aW9uKHNlbGYuZWxlbWVudHMueUF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGNvbnRhaW5lci5jYWxsKHNlbGYuYXhpc2VzLnkpO1xuXG4gICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgLnNlbGVjdEFsbCgndGV4dCcpLmF0dHIoJ3knLCBzZWxmLm9wdGlvbnMucm93SGVpZ2h0IC8gMik7XG5cbiAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdsaW5lJykuc3R5bGUoJ2Rpc3BsYXknLCBmdW5jdGlvbihkLGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA/ICcnIDogJ25vbmUnO1xuICAgICAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtRnJvbURhdGEgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIHRoaXMuc2NhbGVzLngodGhpcy5nZXREYXRhU3RhcnQoZCkpICsgJywnICsgdGhpcy5zY2FsZXMueShkLnJvd0luZGV4KSArICcpJztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmdldERhdGFTdGFydCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gK2Quc3RhcnQ7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZXREYXRhRW5kID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiArZC5lbmQ7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5kcmF3RWxlbWVudHMgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIGlmICh0aGlzLl9wcmV2ZW50RHJhd2luZykge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX2VsZW1lbnRzQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9lbGVtZW50c0FGKVxuICAgIH1cblxuICAgIHZhciBlbmFibGVZVHJhbnNpdGlvbiA9IHRoaXMub3B0aW9ucy5lbmFibGVZVHJhbnNpdGlvbjtcblxuICAgIHRoaXMuX2VsZW1lbnRzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgZG9tYWluWCA9IHNlbGYuc2NhbGVzLnguZG9tYWluKCk7XG4gICAgICAgIHZhciBkb21haW5YU3RhcnQgPSBkb21haW5YWzBdO1xuICAgICAgICB2YXIgZG9tYWluWEVuZCA9IGRvbWFpblhbZG9tYWluWC5sZW5ndGggLSAxXTtcblxuICAgICAgICB2YXIgZG9tYWluWSA9IHNlbGYuc2NhbGVzLnkuZG9tYWluKCk7XG4gICAgICAgIHZhciBkb21haW5ZU3RhcnQgPSBkb21haW5ZWzBdO1xuICAgICAgICB2YXIgZG9tYWluWUVuZCA9IGRvbWFpbllbZG9tYWluWS5sZW5ndGggLSAxXTtcblxuICAgICAgICB2YXIgY3VsbGluZ0Rpc3RhbmNlID0gc2VsZi5vcHRpb25zLmN1bGxpbmdEaXN0YW5jZTtcbiAgICAgICAgdmFyIGN1bGxpbmdYID0gc2VsZi5vcHRpb25zLmN1bGxpbmdYO1xuICAgICAgICB2YXIgY3VsbGluZ1kgPSBzZWxmLm9wdGlvbnMuY3VsbGluZ1k7XG5cblxuICAgICAgICB2YXIgc3RhcnRUcmFuc2Zvcm1NYXAgPSB7fTtcbiAgICAgICAgdmFyIGVuZFRyYW5zZm9ybU1hcCA9IHt9O1xuXG4gICAgICAgIGlmIChzZWxmLm9wdGlvbnMudXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtICYmIHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgICAgIGlmIChzZWxmLnByZXZpb3VzRmxhdHRlbmVkRGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYucHJldmlvdXNGbGF0dGVuZWREYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXN0YXJ0VHJhbnNmb3JtTWFwW2QudWlkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUcmFuc2Zvcm1NYXBbZC5pZF0gPSBzdGFydFRyYW5zZm9ybU1hcFtkLnVpZF0gPSBzZWxmLmdldFRyYW5zZm9ybUZyb21EYXRhKGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2VsZi5mbGF0dGVuZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5mbGF0dGVuZWREYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWVuZFRyYW5zZm9ybU1hcFtkLnVpZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZFRyYW5zZm9ybU1hcFtkLmlkXSA9IGVuZFRyYW5zZm9ybU1hcFtkLnVpZF0gPSBzZWxmLmdldFRyYW5zZm9ybUZyb21EYXRhKGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0YSA9IHNlbGYuZmxhdHRlbmVkRGF0YS5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgcmV0dXJuIGQuX2RlZmF1bHRQcmV2ZW50ZWQgfHwgKCFjdWxsaW5nWSB8fCAoZC5yb3dJbmRleCA+PSBkb21haW5ZU3RhcnQgLSBjdWxsaW5nRGlzdGFuY2UgJiYgZC5yb3dJbmRleCA8IGRvbWFpbllFbmQgKyBjdWxsaW5nRGlzdGFuY2UgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiAoIWN1bGxpbmdYIHx8ICEoc2VsZi5nZXREYXRhRW5kKGQpIDwgZG9tYWluWFN0YXJ0IHx8IHNlbGYuZ2V0RGF0YVN0YXJ0KGQpID4gZG9tYWluWEVuZCkpO1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIHZhciBnID0gc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5zZWxlY3RBbGwoJ2cuJyArIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKVxuICAgICAgICAgICAgLmRhdGEoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkLnVpZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBleGl0aW5nID0gZy5leGl0KCk7XG5cbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5lbmFibGVUcmFuc2l0aW9uT25FeGl0ICYmIHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgICAgIGV4aXRpbmdcbiAgICAgICAgICAgICAgICAuY2FsbChzZWxmLmVsZW1lbnRFeGl0LmJpbmQoc2VsZikpO1xuXG4gICAgICAgICAgICBleGl0aW5nLmVhY2goZnVuY3Rpb24oZCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGcgPSBkMy5zZWxlY3QodGhpcyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgZXhpdFRyYW5zZm9ybSA9IGVuZFRyYW5zZm9ybU1hcFtkLnVpZF0gfHwgZW5kVHJhbnNmb3JtTWFwW2QuaWRdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGV4aXRUcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fd3JhcFdpdGhBbmltYXRpb24oZywgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGV4aXRUcmFuc2Zvcm0pXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXhpdGluZ1xuICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGcuZW50ZXIoKS5hcHBlbmQoJ2cnKVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuY2FsbChzZWxmLmVsZW1lbnRFbnRlci5iaW5kKHNlbGYpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGcuZWFjaChmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgICAgIHZhciBnID0gZDMuc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgICAgICBpZiAoZC5fZGVmYXVsdFByZXZlbnRlZCkge1xuXG4gICAgICAgICAgICAgICAgc2VsZi5lbGVtZW50VXBkYXRlKGcsIGQsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBoYXNQcmV2aW91c1RyYW5zZm9ybSA9IGcuYXR0cigndHJhbnNmb3JtJykgIT09IG51bGw7XG5cbiAgICAgICAgICAgIHZhciBuZXdUcmFuc2Zvcm0gPSBlbmRUcmFuc2Zvcm1NYXBbZC51aWRdIHx8IGVuZFRyYW5zZm9ybU1hcFtkLmlkXSB8fCBzZWxmLmdldFRyYW5zZm9ybUZyb21EYXRhKGQpO1xuXG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBvcmlnaW5UcmFuc2Zvcm0gPSBzdGFydFRyYW5zZm9ybU1hcFtkLnVpZF0gfHwgc3RhcnRUcmFuc2Zvcm1NYXBbZC5pZF0gfHwgbmV3VHJhbnNmb3JtO1xuICAgICAgICAgICAgICAgIHZhciBtb2RpZmllZE9yaWdpblRyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1ByZXZpb3VzVHJhbnNmb3JtICYmIHNlbGYub3B0aW9ucy51c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpblRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm0gPSBvcmlnaW5UcmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgICAgICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsIG9yaWdpblRyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLl93cmFwV2l0aEFuaW1hdGlvbihnLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyVHdlZW4oXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3JpZ2luVHJhbnNmb3JtID0gbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm0gfHwgZy5hdHRyKCd0cmFuc2Zvcm0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbmFibGVZVHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5pbnRlcnBvbGF0ZVRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm0sIG5ld1RyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGFydFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbmRUcmFuc2Zvcm0gPSBkMy50cmFuc2Zvcm0obmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRyYW5zZm9ybS50cmFuc2xhdGVbMV0gPSBlbmRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5pbnRlcnBvbGF0ZVRyYW5zZm9ybShzdGFydFRyYW5zZm9ybS50b1N0cmluZygpLCBlbmRUcmFuc2Zvcm0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ1xuICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgbmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5lbGVtZW50VXBkYXRlKGcsIGQsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IFswLjAsIDAuMF07XG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG5cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUubW92ZUVsZW1lbnRzID0gZnVuY3Rpb24oZm9yY2VEcmF3LCBza2lwWEF4aXMsIGZvcmNlVGlja3MpIHtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLnJlbmRlck9uSWRsZSB8fCBmb3JjZURyYXcpIHtcbiAgICAgICAgdGhpcy5kcmF3RWxlbWVudHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRyYW5zbGF0ZUVsZW1lbnRzKHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCksIHRoaXMuX2xhc3RUcmFuc2xhdGUpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd1lBeGlzKHVuZGVmaW5lZCwgIWZvcmNlVGlja3MpO1xuXG4gICAgaWYgKCFza2lwWEF4aXMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVYQXhpc0ludGVydmFsKCk7XG4gICAgICAgIHRoaXMuZHJhd1hBeGlzKHVuZGVmaW5lZCwgIWZvcmNlVGlja3MpO1xuICAgIH1cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnRyYW5zbGF0ZUVsZW1lbnRzID0gZnVuY3Rpb24odHJhbnNsYXRlLCBwcmV2aW91c1RyYW5zbGF0ZSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHR4ID0gdHJhbnNsYXRlWzBdIC0gcHJldmlvdXNUcmFuc2xhdGVbMF07XG4gICAgdmFyIHR5ID0gdHJhbnNsYXRlWzFdIC0gcHJldmlvdXNUcmFuc2xhdGVbMV07XG5cbiAgICB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdID0gdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVswXSArIHR4O1xuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV0gPSB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdICsgdHk7XG5cblxuICAgIGlmICh0aGlzLl9lbHRzVHJhbnNsYXRlQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9lbHRzVHJhbnNsYXRlQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX2VsdHNUcmFuc2xhdGVBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cih7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoJyArIHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgKyAnKSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHNlbGYuZWxlbWVudHNUcmFuc2xhdGUgIT09IHNlbGYubm9vcCkge1xuICAgICAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoJy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRzVHJhbnNsYXRlKGQzLnNlbGVjdCh0aGlzKSwgZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVYQXhpc0ludGVydmFsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmNvbHVtbldpZHRoID0gdGhpcy5zY2FsZXMueCgxKSAtIHRoaXMuc2NhbGVzLngoMCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVkgPSBmdW5jdGlvbiAodHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXI7XG4gICAgdmFyIGNsaXAgPSB0aGlzLmVsZW1lbnRzLmNsaXAuc2VsZWN0KCdyZWN0Jyk7XG4gICAgdmFyIGJvdW5kaW5nUmVjdCA9IHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcpO1xuXG4gICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgICAgICBjb250YWluZXIgPSBjb250YWluZXIudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGNsaXAgPSBjbGlwLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBib3VuZGluZ1JlY3QgPSBib3VuZGluZ1JlY3QudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfVxuXG4gICAgdmFyIGVsZW1lbnRBbW91bnQgPSB0aGlzLmRhdGEubGVuZ3RoO1xuXG4gICAgLy8gaGF2ZSAxIG1vcmUgZWxlbW50IHRvIGZvcmNlIHJlcHJlc2VudGluZyBvbmUgbW9yZSB0aWNrXG4gICAgdmFyIGVsZW1lbnRzUmFuZ2UgPSBbMCwgZWxlbWVudEFtb3VudF07XG5cbiAgICAvLyBjb21wdXRlIG5ldyBoZWlnaHRcbiAgICB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ID0gTWF0aC5taW4odGhpcy5kYXRhLmxlbmd0aCAqIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQsIHRoaXMuX21heEJvZHlIZWlnaHQpO1xuXG4gICAgLy8gY29tcHV0ZSBuZXcgWSBzY2FsZVxuICAgIHRoaXMuX3lTY2FsZSA9IHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgLyB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICogZWxlbWVudEFtb3VudDtcblxuICAgIC8vIHVwZGF0ZSBZIHNjYWxlLCBheGlzIGFuZCB6b29tIGJlaGF2aW9yXG4gICAgdGhpcy5zY2FsZXMueS5kb21haW4oZWxlbWVudHNSYW5nZSkucmFuZ2UoWzAsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHRdKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnkodGhpcy5zY2FsZXMueSkudHJhbnNsYXRlKHRoaXMuX2xhc3RUcmFuc2xhdGUpLnNjYWxlKHRoaXMuX3lTY2FsZSk7XG5cbiAgICAvLyBhbmQgdXBkYXRlIFggYXhpcyB0aWNrcyBoZWlnaHRcbiAgICB0aGlzLmF4aXNlcy54LmlubmVyVGlja1NpemUoLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgLy8gdXBkYXRlIHN2ZyBoZWlnaHRcbiAgICBjb250YWluZXIuYXR0cignaGVpZ2h0Jyx0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICsgdGhpcy5tYXJnaW4udG9wICsgdGhpcy5tYXJnaW4uYm90dG9tKTtcblxuICAgIC8vIHVwZGF0ZSBpbm5lciByZWN0IGhlaWdodFxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JykuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgYm91bmRpbmdSZWN0LmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuICAgIGNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JykuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgY2xpcC5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6cmVzaXplJywgdGhpcywgdGhpcy5jb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnN0b3BFbGVtZW50VHJhbnNpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWxlbWVudHMuaW5uZXJDb250YWluZXIuc2VsZWN0QWxsKCdnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JykudHJhbnNpdGlvbigpXG4gICAgICAgIC5zdHlsZSgnb3BhY2l0eScsICcnKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRFbnRlciA9IGZ1bmN0aW9uKHNlbGVjdGlvbikgeyByZXR1cm4gc2VsZWN0aW9uOyB9O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5lbGVtZW50VXBkYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRFeGl0ID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbkQzVGFibGUucHJvdG90eXBlLl93cmFwV2l0aEFuaW1hdGlvbiA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdGlvbi50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKS5lYXNlKHRoaXMub3B0aW9ucy50cmFuc2l0aW9uRWFzaW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2VsZWN0aW9uO1xuICAgIH1cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLl9nZXR0ZXIgPSBmdW5jdGlvbihwcm9wKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbcHJvcF07IH07XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5faXNSb3VuZCA9IGZ1bmN0aW9uKHYpIHtcbiAgICB2YXIgbiA9IHZ8MDtcbiAgICByZXR1cm4gdiA+IG4gLSAxZS0zICYmIHYgPCBuICsgMWUtMztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLl9yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQsIGluYykge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICB3aGlsZSAoc3RhcnQgPCBlbmQpIHtcbiAgICAgICAgcmVzLnB1c2goc3RhcnQpO1xuICAgICAgICBzdGFydCA9IHN0YXJ0ICsgaW5jO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufTtcblxuLyoqXG4gKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2ZyL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL09iamV0c19nbG9iYXV4L0FycmF5L2ZpbmRcbiAqIEB0eXBlIHsqfEZ1bmN0aW9ufVxuICogQHByaXZhdGVcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuX2ZpbmQgPSBmdW5jdGlvbihsaXN0LCBwcmVkaWNhdGUpIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGggPj4+IDA7XG4gICAgdmFyIHRoaXNBcmcgPSBsaXN0O1xuICAgIHZhciB2YWx1ZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIGxpc3QpKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX2NsYW1wVHJhbnNsYXRpb25XaXRoU2NhbGUgPSBmdW5jdGlvbih0cmFuc2xhdGUsIHNjYWxlKSB7XG5cbiAgICBzY2FsZSA9IHNjYWxlIHx8IFsxLCAxXTtcblxuICAgIGlmICghKHNjYWxlIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICAgIHNjYWxlID0gW3NjYWxlLCBzY2FsZV07XG4gICAgfVxuXG4gICAgdmFyIHR4ID0gdHJhbnNsYXRlWzBdO1xuICAgIHZhciB0eSA9IHRyYW5zbGF0ZVsxXTtcbiAgICB2YXIgc3ggPSBzY2FsZVswXTtcbiAgICB2YXIgc3kgPSBzY2FsZVsxXTtcblxuICAgIGlmIChzeCA9PT0gMSkge1xuICAgICAgICB0eCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdHggPSBNYXRoLm1pbihNYXRoLm1heCgtdGhpcy5kaW1lbnNpb25zLndpZHRoICogKHN4LTEpLCB0eCksIDApO1xuICAgIH1cblxuICAgIGlmIChzeSA9PT0gMSkge1xuICAgICAgICB0eSA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdHkgPSBNYXRoLm1pbihNYXRoLm1heCgtdGhpcy5kaW1lbnNpb25zLmhlaWdodCAqIChzeS0xKSwgdHkpLCAwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3R4LCB0eV07XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEQzVGFibGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzL2V2ZW50cyc7XG5pbXBvcnQgZDMgZnJvbSAnZDMnO1xuaW1wb3J0IEQzVGltZWxpbmUgZnJvbSAnLi9EM1RpbWVsaW5lJztcblxuZnVuY3Rpb24gRDNUYWJsZU1hcmtlcihvcHRpb25zKSB7XG5cbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZCh0cnVlLCB7fSwgdGhpcy5kZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RDNUaW1lbGluZX1cbiAgICAgKi9cbiAgICB0aGlzLnRpbWVsaW5lID0gbnVsbDtcblxuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3RpbWVsaW5lTW92ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3RpbWVsaW5lUmVzaXplTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcblxuICAgIHRoaXMudmFsdWUgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RUaW1lVXBkYXRlZCA9IG51bGw7XG59XG5cbmluaGVyaXRzKEQzVGFibGVNYXJrZXIsIEV2ZW50RW1pdHRlcik7XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmRlZmF1bHRzID0ge1xuICAgIHhGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQ7IH0sXG4gICAgb3V0ZXJUaWNrU2l6ZTogMTAsXG4gICAgdGlja1BhZGRpbmc6IDEwLFxuICAgIHJvdW5kUG9zaXRpb246IGZhbHNlLFxuICAgIGJlbUJsb2NrTmFtZTogJ3RhYmxlTWFya2VyJyxcbiAgICBiZW1Nb2RpZmllcjogJydcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7RDNUaW1lbGluZX0gdGltZWxpbmVcbiAqL1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuc2V0VGltZWxpbmUgPSBmdW5jdGlvbih0aW1lbGluZSkge1xuXG4gICAgdmFyIHByZXZpb3VzVGltZWxpbmUgPSB0aGlzLnRpbWVsaW5lO1xuXG4gICAgdGhpcy50aW1lbGluZSA9IHRpbWVsaW5lICYmIHRpbWVsaW5lIGluc3RhbmNlb2YgRDNUaW1lbGluZSA/IHRpbWVsaW5lIDogbnVsbDtcblxuICAgIGlmICh0aGlzLnRpbWVsaW5lKSB7XG4gICAgICAgIGlmIChwcmV2aW91c1RpbWVsaW5lICE9PSB0aGlzLnRpbWVsaW5lKSB7XG4gICAgICAgICAgICBpZiAocHJldmlvdXNUaW1lbGluZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudW5iaW5kVGltZWxpbmUocHJldmlvdXNUaW1lbGluZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJpbmRUaW1lbGluZSgpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICghdGhpcy50aW1lbGluZSAmJiBwcmV2aW91c1RpbWVsaW5lKSB7XG4gICAgICAgIHRoaXMudW5iaW5kVGltZWxpbmUocHJldmlvdXNUaW1lbGluZSk7XG4gICAgfVxuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS52YWx1ZUNvbXBhcmF0b3IgPSBmdW5jdGlvbih0aW1lQSwgdGltZUIpIHtcbiAgICByZXR1cm4gK3RpbWVBICE9PSArdGltZUI7XG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cbiAgICB2YXIgcHJldmlvdXNUaW1lVXBkYXRlZCA9IHRoaXMuX2xhc3RUaW1lVXBkYXRlZDtcblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICAgIGlmICh0aGlzLnZhbHVlQ29tcGFyYXRvcihwcmV2aW91c1RpbWVVcGRhdGVkLCB0aGlzLnZhbHVlKSAmJiB0aGlzLnRpbWVsaW5lICYmIHRoaXMuY29udGFpbmVyKSB7XG5cbiAgICAgICAgdGhpcy5fbGFzdFRpbWVVcGRhdGVkID0gdGhpcy52YWx1ZTtcblxuICAgICAgICB0aGlzLmNvbnRhaW5lclxuICAgICAgICAgICAgLmRhdHVtKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubW92ZSgpO1xuICAgIH1cblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuYmluZFRpbWVsaW5lID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMudGltZWxpbmUuY29udGFpbmVyXG4gICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAuZGF0dW0oe1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMudmFsdWVcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICh0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXIgPyAnICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgdGhpcy5vcHRpb25zLmJlbU1vZGlmaWVyIDogJycpKTtcblxuICAgIHRoaXMuY29udGFpbmVyXG4gICAgICAgIC5hcHBlbmQoJ2xpbmUnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1saW5lJylcbiAgICAgICAgLnN0eWxlKCdwb2ludGVyLWV2ZW50cycsICdub25lJylcbiAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgeTE6IC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSxcbiAgICAgICAgICAgIHkyOiB0aGlzLnRpbWVsaW5lLmRpbWVuc2lvbnMuaGVpZ2h0XG4gICAgICAgIH0pO1xuXG4gICAgdGhpcy5jb250YWluZXJcbiAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxhYmVsJylcbiAgICAgICAgLmF0dHIoJ2R5JywgLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLXRoaXMub3B0aW9ucy50aWNrUGFkZGluZyk7XG5cbiAgICAvLyBvbiB0aW1lbGluZSBtb3ZlLCBtb3ZlIHRoZSBtYXJrZXJcbiAgICB0aGlzLl90aW1lbGluZU1vdmVMaXN0ZW5lciA9IHRoaXMubW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMudGltZWxpbmUub24odGhpcy50aW1lbGluZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScsIHRoaXMuX3RpbWVsaW5lTW92ZUxpc3RlbmVyKTtcblxuICAgIC8vIG9uIHRpbWVsaW5lIHJlc2l6ZSwgcmVzaXplIHRoZSBtYXJrZXIgYW5kIG1vdmUgaXRcbiAgICB0aGlzLl90aW1lbGluZVJlc2l6ZUxpc3RlbmVyID0gZnVuY3Rpb24odGltZWxpbmUsIHNlbGVjdGlvbiwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgICAgIHNlbGYucmVzaXplKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIHNlbGYubW92ZSh0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH07XG4gICAgdGhpcy50aW1lbGluZS5vbih0aGlzLnRpbWVsaW5lLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLl90aW1lbGluZVJlc2l6ZUxpc3RlbmVyKTtcblxuICAgIHRoaXMuZW1pdCgnbWFya2VyOmJvdW5kJyk7XG5cbiAgICB0aGlzLm1vdmUoKTtcblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUudW5iaW5kVGltZWxpbmUgPSBmdW5jdGlvbihwcmV2aW91c1RpbWVsaW5lKSB7XG5cbiAgICBwcmV2aW91c1RpbWVsaW5lLnJlbW92ZUxpc3RlbmVyKHRoaXMudGltZWxpbmUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnLCB0aGlzLl90aW1lbGluZU1vdmVMaXN0ZW5lcik7XG4gICAgcHJldmlvdXNUaW1lbGluZS5yZW1vdmVMaXN0ZW5lcih0aGlzLnRpbWVsaW5lLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLl90aW1lbGluZVJlc2l6ZUxpc3RlbmVyKTtcblxuICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZSgpO1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICBwcmV2aW91c1RpbWVsaW5lLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgICAgIHRoaXMuX21vdmVBRiA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMuX3RpbWVsaW5lTW92ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuZW1pdCgnbWFya2VyOnVuYm91bmQnLCBwcmV2aW91c1RpbWVsaW5lKTtcbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGhpcy50aW1lbGluZS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9tb3ZlQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX21vdmVBRiA9IHRoaXMudGltZWxpbmUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuY29udGFpbmVyXG4gICAgICAgICAgICAuZWFjaChmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgeFNjYWxlID0gc2VsZi50aW1lbGluZS5zY2FsZXMueDtcbiAgICAgICAgICAgICAgICB2YXIgeFJhbmdlID0geFNjYWxlLnJhbmdlKCk7XG4gICAgICAgICAgICAgICAgdmFyIGxlZnQgPSBzZWxmLnRpbWVsaW5lLnNjYWxlcy54KGQudmFsdWUpO1xuICAgICAgICAgICAgICAgIHZhciBpc0luUmFuZ2UgPSBsZWZ0ID49IHhSYW5nZVswXSAmJiBsZWZ0IDw9IHhSYW5nZVt4UmFuZ2UubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgICAgICAgICB2YXIgZyA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIGlmIChpc0luUmFuZ2UpIHtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcblxuICAgICAgICAgICAgICAgICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysoc2VsZi50aW1lbGluZS5tYXJnaW4ubGVmdCArIGxlZnQgPj4gMCkrJywnK3NlbGYudGltZWxpbmUubWFyZ2luLnRvcCsnKScpO1xuXG4gICAgICAgICAgICAgICAgICAgIGcuc2VsZWN0KCcuJyArIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxhYmVsJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50ZXh0KGQgPT4gc2VsZi5vcHRpb25zLnhGb3JtYXR0ZXIoZC52YWx1ZSkpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUoJ2Rpc3BsYXknLCAnJyk7XG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUoJ2Rpc3BsYXknLCAnbm9uZScpO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXI7XG5cbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBjb250YWluZXJcbiAgICAgICAgLnNlbGVjdCgnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1saW5lJylcbiAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgeTE6IC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSxcbiAgICAgICAgICAgIHkyOiB0aGlzLnRpbWVsaW5lLmRpbWVuc2lvbnMuaGVpZ2h0XG4gICAgICAgIH0pO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVNYXJrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGVNYXJrZXIgZnJvbSAnLi9EM1RhYmxlTWFya2VyJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbi8qKlxuICpcbiAqIEBleHRlbmRzIHtEM1RhYmxlTWFya2VyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGFibGVNb3VzZVRyYWNrZXIob3B0aW9ucykge1xuICAgIEQzVGFibGVNYXJrZXIuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX3RpbWVsaW5lTW91c2VlbnRlckxpc3RlbmVyID0gbnVsbDtcbiAgICB0aGlzLl90aW1lbGluZU1vdXNlbW92ZUxpc3RlbmVyID0gbnVsbDtcbiAgICB0aGlzLl90aW1lbGluZU1vdXNlbGVhdmVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSBudWxsO1xuXG4gICAgdGhpcy5vbignbWFya2VyOmJvdW5kJywgdGhpcy5oYW5kbGVUaW1lbGluZUJvdW5kLmJpbmQodGhpcykpO1xuICAgIHRoaXMub24oJ21hcmtlcjp1bmJvdW5kJywgdGhpcy5oYW5kbGVUaW1lbGluZVVuYm91bmQuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMgPSBmYWxzZTtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZU1vdXNlVHJhY2tlciwgRDNUYWJsZU1hcmtlcik7XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbU1vZGlmaWVyOiAnLS1tb3VzZVRyYWNrZXInLFxuICAgIGxpc3RlblRvVG91Y2hFdmVudHM6IHRydWVcbn0pO1xuXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVUaW1lbGluZUJvdW5kID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLl90aW1lbGluZU1vdXNlZW50ZXJMaXN0ZW5lciA9IHRoaXMuaGFuZGxlTW91c2VlbnRlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3RpbWVsaW5lTW91c2Vtb3ZlTGlzdGVuZXIgPSB0aGlzLmhhbmRsZU1vdXNlbW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3RpbWVsaW5lTW91c2VsZWF2ZUxpc3RlbmVyID0gdGhpcy5oYW5kbGVNb3VzZWxlYXZlLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLnRpbWVsaW5lLm9uKCd0aW1lbGluZTptb3VzZWVudGVyJywgdGhpcy5fdGltZWxpbmVNb3VzZWVudGVyTGlzdGVuZXIpO1xuICAgIHRoaXMudGltZWxpbmUub24oJ3RpbWVsaW5lOm1vdXNlbW92ZScsIHRoaXMuX3RpbWVsaW5lTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIHRoaXMudGltZWxpbmUub24oJ3RpbWVsaW5lOm1vdXNlbGVhdmUnLCB0aGlzLl90aW1lbGluZU1vdXNlbGVhdmVMaXN0ZW5lcik7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmxpc3RlblRvVG91Y2hFdmVudHMpIHtcbiAgICAgICAgdGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50aW1lbGluZS5vbigndGltZWxpbmU6dG91Y2htb3ZlJywgdGhpcy5fdGltZWxpbmVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzID0gZmFsc2U7XG4gICAgfVxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlVGltZWxpbmVVbmJvdW5kID0gZnVuY3Rpb24ocHJldmlvdXNUaW1lbGluZSkge1xuXG4gICAgcHJldmlvdXNUaW1lbGluZS5yZW1vdmVMaXN0ZW5lcigndGltZWxpbmU6bW91c2VlbnRlcicsIHRoaXMuX3RpbWVsaW5lTW91c2VlbnRlckxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RpbWVsaW5lLnJlbW92ZUxpc3RlbmVyKCd0aW1lbGluZTptb3VzZW1vdmUnLCB0aGlzLl90aW1lbGluZU1vdXNlbW92ZUxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RpbWVsaW5lLnJlbW92ZUxpc3RlbmVyKCd0aW1lbGluZTptb3VzZWxlYXZlJywgdGhpcy5fdGltZWxpbmVNb3VzZWxlYXZlTGlzdGVuZXIpO1xuXG4gICAgaWYgKHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cykge1xuICAgICAgICBwcmV2aW91c1RpbWVsaW5lLnJlbW92ZUxpc3RlbmVyKCd0aW1lbGluZTp0b3VjaG1vdmUnLCB0aGlzLl90aW1lbGluZU1vdXNlbW92ZUxpc3RlbmVyKTtcbiAgICB9XG5cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZU1vdXNlZW50ZXIgPSBmdW5jdGlvbih0aW1lbGluZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciB0aW1lID0gZ2V0VGltZSgpO1xuXG4gICAgdGltZWxpbmUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNob3coKTtcbiAgICAgICAgc2VsZi5zZXRWYWx1ZSh0aW1lKTtcbiAgICB9KTtcblxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2Vtb3ZlID0gZnVuY3Rpb24odGltZWxpbmUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHRpbWUgPSBnZXRUaW1lKCk7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHRpbWVsaW5lLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fbW92ZUFGID0gdGltZWxpbmUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNldFZhbHVlKHRpbWUpO1xuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVNb3VzZWxlYXZlID0gZnVuY3Rpb24odGltZWxpbmUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHRpbWVsaW5lLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRpbWVsaW5lLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfSk7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZU1vdXNlVHJhY2tlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZU1hcmtlciBmcm9tICcuL0QzVGFibGVNYXJrZXInO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxuLyoqXG4gKlxuICogQGV4dGVuZHMge0QzVGFibGVNYXJrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUYWJsZVZhbHVlVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZU1hcmtlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG59XG5cbmluaGVyaXRzKEQzVGFibGVWYWx1ZVRyYWNrZXIsIEQzVGFibGVNYXJrZXIpO1xuXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1Nb2RpZmllcjogJy0tdmFsdWVUcmFja2VyJ1xufSk7XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlR2V0dGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgIHJldHVybiAwO1xuXG59O1xuXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAgIGQzLnRpbWVyKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuc2V0VmFsdWUoc2VsZi50aW1lR2V0dGVyKCkpO1xuXG4gICAgICAgIHJldHVybiAhc2VsZi5lbmFibGVkO1xuXG4gICAgfSk7XG59O1xuXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RhYmxlVmFsdWVUcmFja2VyO1xuIiwiLyogZ2xvYmFsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRDNCbG9ja1RhYmxlIGZyb20gJy4vRDNCbG9ja1RhYmxlJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUaW1lbGluZShvcHRpb25zKSB7XG5cbiAgICBEM0Jsb2NrVGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2N1cnJlbnRTY2FsZUNvbmZpZyA9IG51bGw7XG5cbiAgICB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPSB0aGlzLm9wdGlvbnMubWluaW11bVRpbWVJbnRlcnZhbDtcbn1cblxuaW5oZXJpdHMoRDNUaW1lbGluZSwgRDNCbG9ja1RhYmxlKTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1CbG9ja05hbWU6ICd0aW1lbGluZScsXG4gICAgYmVtQmxvY2tNb2RpZmllcjogJycsXG4gICAgeEF4aXNUaWNrc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZC5nZXRNaW51dGVzKCkgJSAxNSA/ICcnIDogZDMudGltZS5mb3JtYXQoJyVIOiVNJykoZCk7XG4gICAgfSxcbiAgICB4QXhpc1N0cm9rZVdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkLmdldE1pbnV0ZXMoKSAlMzAgPyAxIDogMjtcbiAgICB9LFxuICAgIG1pbmltdW1Db2x1bW5XaWR0aDogMzAsXG4gICAgbWluaW11bVRpbWVJbnRlcnZhbDogM2U1LFxuICAgIGF2YWlsYWJsZVRpbWVJbnRlcnZhbHM6IFsgNmU0LCAzZTUsIDllNSwgMS44ZTYsIDMuNmU2LCA3LjJlNiwgMS40NGU3LCAyLjg4ZTcsIDQuMzJlNywgOC42NGU3IF1cbn0pO1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS54U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnRpbWUuc2NhbGUoKTtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLnlTY2FsZUZhY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUubGluZWFyKCk7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhU3RhcnQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuc3RhcnQ7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhRW5kID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmVuZDtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLl9jb21wdXRlQ29sdW1uV2lkdGhGcm9tVGltZUludGVydmFsID0gZnVuY3Rpb24odGltZUludGVydmFsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGVzLngobmV3IERhdGUodGltZUludGVydmFsKSkgLSB0aGlzLnNjYWxlcy54KG5ldyBEYXRlKDApKTtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLnVwZGF0ZVhBeGlzSW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBtaW5pbXVtVGltZUludGVydmFsID0gdGhpcy5vcHRpb25zLm1pbmltdW1UaW1lSW50ZXJ2YWw7XG4gICAgdmFyIG1pbmltdW1Db2x1bW5XaWR0aCA9IHRoaXMub3B0aW9ucy5taW5pbXVtQ29sdW1uV2lkdGg7XG4gICAgdmFyIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWw7XG4gICAgdmFyIGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMgPSB0aGlzLm9wdGlvbnMuYXZhaWxhYmxlVGltZUludGVydmFscztcbiAgICB2YXIgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4ID0gYXZhaWxhYmxlVGltZUludGVydmFscy5pbmRleE9mKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuICAgIHZhciBjdXJyZW50Q29sdW1uV2lkdGggPSB0aGlzLl9jb21wdXRlQ29sdW1uV2lkdGhGcm9tVGltZUludGVydmFsKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlVGltZUludGVydmFsKGRlbHRhKSB7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCArPSBkZWx0YTtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbCA9IGF2YWlsYWJsZVRpbWVJbnRlcnZhbHNbY3VycmVudFRpbWVJbnRlcnZhbEluZGV4XTtcbiAgICAgICAgY3VycmVudENvbHVtbldpZHRoID0gc2VsZi5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbChjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB9XG5cbiAgICBpZiAoYXZhaWxhYmxlVGltZUludGVydmFscy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChjdXJyZW50Q29sdW1uV2lkdGggPCBtaW5pbXVtQ29sdW1uV2lkdGgpIHtcbiAgICAgICAgICAgIHdoaWxlKGN1cnJlbnRDb2x1bW5XaWR0aCA8IG1pbmltdW1Db2x1bW5XaWR0aCAmJiBjdXJyZW50VGltZUludGVydmFsSW5kZXggPCBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoKSB7XG4gICAgICAgICAgICB3aGlsZShjdXJyZW50Q29sdW1uV2lkdGggPiBtaW5pbXVtQ29sdW1uV2lkdGggJiYgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbCgtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY3VycmVudFRpbWVJbnRlcnZhbCA8IG1pbmltdW1UaW1lSW50ZXJ2YWwpIHtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbCA9IG1pbmltdW1UaW1lSW50ZXJ2YWw7XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbClcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBNYXRoLmZsb29yKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuICAgIHRoaXMuY29sdW1uV2lkdGggPSBNYXRoLmZsb29yKGN1cnJlbnRDb2x1bW5XaWR0aCk7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gMy42ZTYpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiA2ZTQpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiAxZTMpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuc2V0VGltZVJhbmdlID0gZnVuY3Rpb24obWluRGF0ZSwgbWF4RGF0ZSkge1xuICAgIHJldHVybiB0aGlzLnNldFhSYW5nZShtaW5EYXRlLCBtYXhEYXRlKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEQzVGltZWxpbmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGVWYWx1ZVRyYWNrZXIgZnJvbSAnLi9EM1RhYmxlVmFsdWVUcmFja2VyJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbi8qKlxuICpcbiAqIEBleHRlbmRzIHtEM1RhYmxlVmFsdWVUcmFja2VyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGltZWxpbmVUaW1lVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZVZhbHVlVHJhY2tlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xufVxuXG5pbmhlcml0cyhEM1RpbWVsaW5lVGltZVRyYWNrZXIsIEQzVGFibGVWYWx1ZVRyYWNrZXIpO1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbUJsb2NrTmFtZTogJ3RpbWVsaW5lTWFya2VyJyxcbiAgICBiZW1Nb2RpZmllcjogJy0tdGltZVRyYWNrZXInXG59KTtcblxuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS50aW1lR2V0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCk7XG59O1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnRpbWVDb21wYXJhdG9yID0gZnVuY3Rpb24oYSxiKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVDb21wYXJhdG9yKGEsYik7XG59XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUuc2V0VGltZSA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aW1lKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudmFsdWVHZXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50aW1lR2V0dGVyKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGltZWxpbmVUaW1lVHJhY2tlcjtcbiJdfQ==
(1)
});
;