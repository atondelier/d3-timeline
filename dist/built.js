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

        var timeDelta = +new Date() - startTime;

        if (!dragStarted && timeDelta > self.options.maximumClickDragTime) {
            dragStarted = true;
            self.emitDetailedEvent('element:dragstart', selection, null, [data]);
        }

        if (dragStarted) {
            self.emitDetailedEvent('element:drag', selection, null, [data]);
        }

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

        if (self._dragAF) {
            self.cancelAnimationFrame(self._dragAF);
        }

        self._dragAF = self.requestAnimationFrame(updateTransform);
    }).on('dragend', function (data) {

        dragStarted = false;

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

        var totalDeltaX = dragPosition[0] - startDragPosition[0];
        var totalDeltaY = dragPosition[1] - startDragPosition[1];
        var dragDistance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);
        var timeDelta = +new Date() - startTime;

        if ((timeDelta > self.options.maximumClickDragTime || dragDistance > self.options.maximumClickDragDistance) && dragDistance > self.options.minimumDragDistance) {
            self.emitDetailedEvent('element:dragend', selection, [-deltaFromTopLeftCorner[0], -deltaFromTopLeftCorner[1] + halfHeight], [data]);
        } else {
            selection.attr('transform', originTransformString);
        }

        self.updateY().drawYAxis();
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
    tickPadding: 10,
    roundPosition: false,
    bemBlockName: 'tableMarker',
    bemModifier: '',
    layout: D3TableMarker.prototype.LAYOUT_VERTICAL
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

D3TableMarker.prototype.setValue = function (value) {

    var previousTimeUpdated = this._lastTimeUpdated;

    this.value = value;

    if (this.valueComparator(previousTimeUpdated, this.value) && this.table && this.container) {

        this._lastTimeUpdated = this.value;

        this.container.datum({
            value: value
        });

        this.move();
    }
};

D3TableMarker.prototype.getValue = function (data) {
    return data.value;
};

D3TableMarker.prototype.bindTable = function () {

    var self = this;

    this.container = this.table.container.append('g').datum({
        value: this.value
    }).attr('class', this.options.bemBlockName + (this.options.bemModifier ? ' ' + this.options.bemBlockName + this.options.bemModifier : '') + ' ' + this.options.bemBlockName + '--' + this.options.layout);

    this.elements.line = this.container.append('line').attr('class', this.options.bemBlockName + '-line').style('pointer-events', 'none');

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
            line.attr({
                y1: -this.options.outerTickSize,
                y2: this.table.dimensions.height
            });
            label.attr('dy', -this.options.outerTickSize - this.options.tickPadding);
            break;
        case this.LAYOUT_HORIZONTAL:
            line.attr({
                x1: -this.options.outerTickSize,
                x2: this.table.dimensions.width
            });
            label.attr('dx', -this.options.outerTickSize - this.options.tickPadding).attr('dy', 4);
            break;
    }
};

D3TableMarker.prototype.unbindTable = function (previousTable) {

    previousTable.removeListener(previousTable.options.bemBlockName + ':move', this._tableMoveListener);
    previousTable.removeListener(previousTable.options.bemBlockName + ':resize', this._tableResizeListener);

    this.container.remove();

    if (this._moveAF) {
        previousTable.cancelAnimationFrame(this._moveAF);
        this._moveAF = null;
    }

    this.container = null;
    this._tableMoveListener = null;

    this.emit('marker:unbound', previousTable);
};

D3TableMarker.prototype.move = function (transitionDuration) {

    var self = this;
    var layout = this.options.layout;

    if (this._moveAF) {
        this.table.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = this.table.requestAnimationFrame(function () {

        self.container.each(function (d) {

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
    });
};

D3TableMarker.prototype.show = function () {
    this.container.style('display', '');
};

D3TableMarker.prototype.hide = function () {
    this.container.style('display', 'none');
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
    bemModifier: '--mouseTracker',
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

    previousTable.removeListener(this.table.options.bemBlockName + ':mouseenter', this._tableMouseenterListener);
    previousTable.removeListener(this.table.options.bemBlockName + ':mousemove', this._tableMousemoveListener);
    previousTable.removeListener(this.table.options.bemBlockName + ':mouseleave', this._tableMouseleaveListener);

    if (this._isListeningToTouchEvents) {
        previousTable.removeListener(this.table.options.bemBlockName + ':touchmove', this._tableMousemoveListener);
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
    bemModifier: '--timeTracker',
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9pbmRleC5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL3NyYy9EM0Jsb2NrVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzNELE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOzs7QUNSakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBLFlBQVksQ0FBQzs7Ozs7Ozs7dUJBRU8sV0FBVzs7Ozt3QkFDVixVQUFVOzs7O3NCQUNaLFFBQVE7Ozs7Ozs7Ozs7QUFPM0IsU0FBUyxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQzNCLHlCQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDL0I7O0FBRUQsMkJBQVMsWUFBWSx1QkFBVSxDQUFDOztBQUVoQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyx5QkFBTyxJQUFJLEVBQUUsRUFBRSxFQUFFLHFCQUFRLFNB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Q0FBQyxDQUFDO0NBQ3BDLENBQUM7O0FBRUYscUJBQXFCLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLElBQUksRUFBRTtBQUNyRCxXQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDOUIsQ0FBQzs7QUFFRixxQkFBcUIsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVMsUUFBUSxFQUFFO0FBQzdELFdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUNsQyxDQUFDOztBQUVGLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBVztBQUNyRCxXQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztDQUM1QixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcscUJBQXFCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZS5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNCbG9ja1RhYmxlID0gcmVxdWlyZSgnLi9zcmMvRDNCbG9ja1RhYmxlLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RpbWVsaW5lID0gcmVxdWlyZSgnLi9zcmMvRDNUaW1lbGluZS5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZU1hcmtlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVNYXJrZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGFibGVNb3VzZVRyYWNrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlTW91c2VUcmFja2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlVmFsdWVUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZVZhbHVlVHJhY2tlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUaW1lbGluZVRpbWVUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUaW1lbGluZVRpbWVUcmFja2VyLmpzJyk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxudmFyIGlzQXJyYXkgPSBmdW5jdGlvbiBpc0FycmF5KGFycikge1xuXHRpZiAodHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpO1xuXHR9XG5cblx0cmV0dXJuIHRvU3RyLmNhbGwoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnZhciBpc1BsYWluT2JqZWN0ID0gZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcblx0aWYgKCFvYmogfHwgdG9TdHIuY2FsbChvYmopICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBoYXNPd25Db25zdHJ1Y3RvciA9IGhhc093bi5jYWxsKG9iaiwgJ2NvbnN0cnVjdG9yJyk7XG5cdHZhciBoYXNJc1Byb3RvdHlwZU9mID0gb2JqLmNvbnN0cnVjdG9yICYmIG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgJiYgaGFzT3duLmNhbGwob2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ2lzUHJvdG90eXBlT2YnKTtcblx0Ly8gTm90IG93biBjb25zdHJ1Y3RvciBwcm9wZXJ0eSBtdXN0IGJlIE9iamVjdFxuXHRpZiAob2JqLmNvbnN0cnVjdG9yICYmICFoYXNPd25Db25zdHJ1Y3RvciAmJiAhaGFzSXNQcm90b3R5cGVPZikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIE93biBwcm9wZXJ0aWVzIGFyZSBlbnVtZXJhdGVkIGZpcnN0bHksIHNvIHRvIHNwZWVkIHVwLFxuXHQvLyBpZiBsYXN0IG9uZSBpcyBvd24sIHRoZW4gYWxsIHByb3BlcnRpZXMgYXJlIG93bi5cblx0dmFyIGtleTtcblx0Zm9yIChrZXkgaW4gb2JqKSB7LyoqL31cblxuXHRyZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3VuZGVmaW5lZCcgfHwgaGFzT3duLmNhbGwob2JqLCBrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZSxcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMF0sXG5cdFx0aSA9IDEsXG5cdFx0bGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcblx0XHRkZWVwID0gZmFsc2U7XG5cblx0Ly8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuXHRpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Jvb2xlYW4nKSB7XG5cdFx0ZGVlcCA9IHRhcmdldDtcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMV0gfHwge307XG5cdFx0Ly8gc2tpcCB0aGUgYm9vbGVhbiBhbmQgdGhlIHRhcmdldFxuXHRcdGkgPSAyO1xuXHR9IGVsc2UgaWYgKCh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nKSB8fCB0YXJnZXQgPT0gbnVsbCkge1xuXHRcdHRhcmdldCA9IHt9O1xuXHR9XG5cblx0Zm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbaV07XG5cdFx0Ly8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xuXHRcdGlmIChvcHRpb25zICE9IG51bGwpIHtcblx0XHRcdC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3Rcblx0XHRcdGZvciAobmFtZSBpbiBvcHRpb25zKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFtuYW1lXTtcblx0XHRcdFx0Y29weSA9IG9wdGlvbnNbbmFtZV07XG5cblx0XHRcdFx0Ly8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxuXHRcdFx0XHRpZiAodGFyZ2V0ICE9PSBjb3B5KSB7XG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdFx0aWYgKGRlZXAgJiYgY29weSAmJiAoaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBpc0FycmF5KGNvcHkpKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGV4dGVuZChkZWVwLCBjbG9uZSwgY29weSk7XG5cblx0XHRcdFx0XHQvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY29weSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGNvcHk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG5cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlIGZyb20gJy4vRDNUYWJsZSc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqXG4gKiBAZXh0ZW5kcyB7RDNUYWJsZX1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM0Jsb2NrVGFibGUob3B0aW9ucykge1xuICAgIEQzVGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcbn1cblxuaW5oZXJpdHMoRDNCbG9ja1RhYmxlLCBEM1RhYmxlKTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBjbGlwRWxlbWVudDogdHJ1ZSxcbiAgICBjbGlwRWxlbWVudEZpbHRlcjogbnVsbCxcbiAgICByZW5kZXJPbkF1dG9tYXRpY1Njcm9sbElkbGU6IHRydWUsXG4gICAgaGlkZVRpY2tzT25BdXRvbWF0aWNTY3JvbGw6IGZhbHNlLFxuICAgIGF1dG9tYXRpY1Njcm9sbFNwZWVkTXVsdGlwbGllcjogMmUtNCxcbiAgICBhdXRvbWF0aWNTY3JvbGxNYXJnaW5EZWx0YTogMzAsXG4gICAgYXBwZW5kVGV4dDogdHJ1ZSxcbiAgICBhbGlnbkxlZnQ6IHRydWUsXG4gICAgYWxpZ25PblRyYW5zbGF0ZTogdHJ1ZSxcbiAgICBtYXhpbXVtQ2xpY2tEcmFnVGltZTogMTAwLFxuICAgIG1heGltdW1DbGlja0RyYWdEaXN0YW5jZTogMTIsXG4gICAgbWluaW11bURyYWdEaXN0YW5jZTogNVxufSk7XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUGF0aElkID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50Q2xpcFBhdGhfJyArIHRoaXMuaW5zdGFuY2VOdW1iZXIgKyAnXycgKyBkLnVpZDtcbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUmVjdExpbmsgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICcjJyArIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdElkKGQpO1xufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBQYXRoTGluayA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gJ3VybCgjJyArIHRoaXMuZ2VuZXJhdGVDbGlwUGF0aElkKGQpICsgJyknO1xufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBSZWN0SWQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRDbGlwUmVjdF8nICsgdGhpcy5pbnN0YW5jZU51bWJlciArICdfJyArIGQudWlkO1xufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50RW50ZXIgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBlbGVtZW50SGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJvd0hlaWdodCAtIHRoaXMub3B0aW9ucy5yb3dQYWRkaW5nICogMjtcblxuICAgIHZhciByZWN0ID0gc2VsZWN0aW9uXG4gICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50QmFja2dyb3VuZCcpXG4gICAgICAgIC5hdHRyKCdoZWlnaHQnLCBlbGVtZW50SGVpZ2h0KTtcblxuICAgIHZhciBnID0gc2VsZWN0aW9uXG4gICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50Q29udGVudCcpO1xuXG4gICAgZy5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50TW92YWJsZUNvbnRlbnQnKTtcblxuXG4gICAgdmFyIGNsaXBFbGVtZW50ID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsaXBFbGVtZW50KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNsaXBFbGVtZW50RmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjbGlwRWxlbWVudCA9ICEhdGhpcy5vcHRpb25zLmNsaXBFbGVtZW50RmlsdGVyLmNhbGwodGhpcywgc2VsZWN0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsaXBFbGVtZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjbGlwRWxlbWVudCkge1xuXG4gICAgICAgIGdcbiAgICAgICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCB0aGlzLmdlbmVyYXRlQ2xpcFBhdGhMaW5rLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHJlY3RcbiAgICAgICAgICAgIC5wcm9wZXJ0eSgnaWQnLCB0aGlzLmdlbmVyYXRlQ2xpcFJlY3RJZC5iaW5kKHRoaXMpKTtcblxuICAgICAgICBzZWxlY3Rpb24uYXBwZW5kKCdjbGlwUGF0aCcpXG4gICAgICAgICAgICAucHJvcGVydHkoJ2lkJywgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoSWQuYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC5hcHBlbmQoJ3VzZScpXG4gICAgICAgICAgICAuYXR0cigneGxpbms6aHJlZicsIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdExpbmsuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgaWYgKCFkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OmNsaWNrJywgc2VsZWN0aW9uLCBudWxsLCBbZF0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZFRleHQpIHtcbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcudGltZWxpbmUtZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgICAgLmNsYXNzZWQoJ3RpbWVsaW5lLWVudGl0eUxhYmVsJywgdHJ1ZSlcbiAgICAgICAgICAgIC5hdHRyKCdkeScsIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQvMiArIDQpO1xuICAgIH1cblxuICAgIHNlbGVjdGlvbi5jYWxsKHRoaXMuZWxlbWVudENvbnRlbnRFbnRlci5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmluZERyYWdBbmREcm9wT25TZWxlY3Rpb24oc2VsZWN0aW9uKTtcblxufTtcblxuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRzVHJhbnNsYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBkKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZFRleHQgJiYgdGhpcy5vcHRpb25zLmFsaWduTGVmdCAmJiB0aGlzLm9wdGlvbnMuYWxpZ25PblRyYW5zbGF0ZSAmJiAhZC5fZGVmYXVsdFByZXZlbnRlZCkge1xuXG4gICAgICAgIHNlbGVjdGlvblxuICAgICAgICAgICAgLnNlbGVjdCgnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50TW92YWJsZUNvbnRlbnQnKVxuICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgTWF0aC5tYXgoLXNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhU3RhcnQoZCkpLCAyKSArICcsMCknXG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudENvbnRlbnRFbnRlciA9IGZ1bmN0aW9uKCkge307XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudENvbnRlbnRVcGRhdGUgPSBmdW5jdGlvbigpIHt9O1xuXG5cbi8vIEB0b2RvIGNsZWFuIHVwXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmJpbmREcmFnQW5kRHJvcE9uU2VsZWN0aW9uID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGJvZHlOb2RlID0gc2VsZi5lbGVtZW50cy5ib2R5Lm5vZGUoKTtcbiAgICB2YXIgZHJhZ1N0YXJ0ZWQgPSBmYWxzZTtcblxuICAgIC8vIHBvc2l0aW9uc1xuICAgIHZhciBjdXJyZW50VHJhbnNmb3JtID0gbnVsbDtcbiAgICB2YXIgb3JpZ2luVHJhbnNmb3JtU3RyaW5nID0gbnVsbDtcbiAgICB2YXIgZHJhZ1N0YXJ0WCA9IDAsIGRyYWdTdGFydFkgPSAwO1xuICAgIHZhciBlbGVtZW50U3RhcnRYID0gMCwgZWxlbWVudFN0YXJ0WSA9IDA7XG4gICAgdmFyIGRyYWdQb3NpdGlvbjtcbiAgICB2YXIgc3RhcnREcmFnUG9zaXRpb247XG5cbiAgICAvLyBtb3ZlbWVudHNcbiAgICB2YXIgdmVydGljYWxNb3ZlID0gMDtcbiAgICB2YXIgaG9yaXpvbnRhbE1vdmUgPSAwO1xuICAgIHZhciB2ZXJ0aWNhbFNwZWVkID0gMDtcbiAgICB2YXIgaG9yaXpvbnRhbFNwZWVkID0gMDtcbiAgICB2YXIgdGltZXJBY3RpdmUgPSBmYWxzZTtcbiAgICB2YXIgbmVlZFRpbWVyU3RvcCA9IGZhbHNlO1xuICAgIHZhciBzdGFydFRpbWU7XG5cbiAgICAvLyByZXNldCBzdGFydCBwb3NpdGlvbjogdG8gY2FsbCBvbiBkcmFnIHN0YXJ0IG9yIHdoZW4gdGhpbmdzIGFyZSByZWRyYXduXG4gICAgZnVuY3Rpb24gc3RvcmVTdGFydCgpIHtcbiAgICAgICAgY3VycmVudFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm1TdHJpbmcgPSBzZWxlY3Rpb24uYXR0cigndHJhbnNmb3JtJykpO1xuICAgICAgICBlbGVtZW50U3RhcnRYID0gY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMF07XG4gICAgICAgIGVsZW1lbnRTdGFydFkgPSBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXTtcbiAgICAgICAgZHJhZ1N0YXJ0WCA9IGRyYWdQb3NpdGlvblswXTtcbiAgICAgICAgZHJhZ1N0YXJ0WSA9IGRyYWdQb3NpdGlvblsxXTtcbiAgICB9XG5cbiAgICAvLyBoYW5kbGUgbmV3IGRyYWcgcG9zaXRpb24gYW5kIG1vdmUgdGhlIGVsZW1lbnRcbiAgICBmdW5jdGlvbiB1cGRhdGVUcmFuc2Zvcm0oZm9yY2VEcmF3KSB7XG5cbiAgICAgICAgdmFyIGRlbHRhWCA9IGRyYWdQb3NpdGlvblswXSAtIGRyYWdTdGFydFg7XG4gICAgICAgIHZhciBkZWx0YVkgPSBkcmFnUG9zaXRpb25bMV0gLSBkcmFnU3RhcnRZO1xuXG4gICAgICAgIGlmIChmb3JjZURyYXcgfHwgIXNlbGYub3B0aW9ucy5yZW5kZXJPbklkbGUpIHtcbiAgICAgICAgICAgIHN0b3JlU3RhcnQoZHJhZ1Bvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzBdID0gZWxlbWVudFN0YXJ0WCArIGRlbHRhWDtcbiAgICAgICAgY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMV0gPSBlbGVtZW50U3RhcnRZICsgZGVsdGFZO1xuXG4gICAgICAgIHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nLCBjdXJyZW50VHJhbnNmb3JtLnRvU3RyaW5nKCkpO1xuXG4gICAgfVxuXG4gICAgLy8gdGFrZSBtaWNybyBzZWNvbmRzIGlmIHBvc3NpYmxlXG4gICAgdmFyIGdldFByZWNpc2VUaW1lID0gd2luZG93LnBlcmZvcm1hbmNlICYmIHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICBwZXJmb3JtYW5jZS5ub3cuYmluZChwZXJmb3JtYW5jZSlcbiAgICAgICAgOiB0eXBlb2YgRGF0ZS5ub3cgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgRGF0ZS5ub3cuYmluZChEYXRlKVxuICAgICAgICAgICAgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKyhuZXcgRGF0ZSgpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAvLyBoYW5kbGUgYXV0b21hdGljIHNjcm9sbCBhcmd1bWVudHNcbiAgICBmdW5jdGlvbiBkb0F1dG9tYXRpY1Njcm9sbCh0aW1lRGVsdGEsIGZvcmNlRHJhdykge1xuXG4gICAgICAgIC8vIGNvbXB1dGUgZGVsdGFzIGJhc2VkIG9uIGRpcmVjdGlvbiwgc3BlZWQgYW5kIHRpbWUgZGVsdGFcbiAgICAgICAgdmFyIHNwZWVkTXVsdGlwbGllciA9IHNlbGYub3B0aW9ucy5hdXRvbWF0aWNTY3JvbGxTcGVlZE11bHRpcGxpZXI7XG4gICAgICAgIHZhciBkZWx0YVggPSBob3Jpem9udGFsTW92ZSAqIGhvcml6b250YWxTcGVlZCAqIHRpbWVEZWx0YSAqIHNwZWVkTXVsdGlwbGllcjtcbiAgICAgICAgdmFyIGRlbHRhWSA9IHZlcnRpY2FsTW92ZSAqIHZlcnRpY2FsU3BlZWQgKiB0aW1lRGVsdGEgKiBzcGVlZE11bHRpcGxpZXI7XG5cbiAgICAgICAgLy8gdGFrZSBncm91cCB0cmFuc2xhdGUgY2FuY2VsbGF0aW9uIHdpdGggZm9yY2VkIHJlZHJhdyBpbnRvIGFjY291bnQsIHNvIHJlZGVmaW5lIHN0YXJ0XG4gICAgICAgIGlmIChmb3JjZURyYXcpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUuc2xpY2UoMCk7XG4gICAgICAgICAgICBlbGVtZW50U3RhcnRYICs9IGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdO1xuICAgICAgICAgICAgZWxlbWVudFN0YXJ0WSArPSBjdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVsxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZWFsTW92ZSA9IHNlbGYubW92ZShkZWx0YVgsIGRlbHRhWSwgZm9yY2VEcmF3LCBmYWxzZSwgIXNlbGYub3B0aW9ucy5oaWRlVGlja3NPbkF1dG9tYXRpY1Njcm9sbCk7XG5cbiAgICAgICAgaWYgKHJlYWxNb3ZlWzJdIHx8IHJlYWxNb3ZlWzNdKSB7XG4gICAgICAgICAgICB1cGRhdGVUcmFuc2Zvcm0oZm9yY2VEcmF3KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnRTdGFydFggLT0gcmVhbE1vdmVbMl07XG4gICAgICAgIGVsZW1lbnRTdGFydFkgLT0gcmVhbE1vdmVbM107XG5cbiAgICAgICAgbmVlZFRpbWVyU3RvcCA9IHJlYWxNb3ZlWzJdID09PSAwICYmIHJlYWxNb3ZlWzNdID09PSAwO1xuICAgIH1cblxuICAgIFxuICAgIHZhciBkcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgIC5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhcnREcmFnUG9zaXRpb24gPSBkcmFnUG9zaXRpb24gPSBkMy5tb3VzZShib2R5Tm9kZSk7XG5cbiAgICAgICAgICAgIHN0YXJ0VGltZSA9ICtuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICBzdG9yZVN0YXJ0KCk7XG5cbiAgICAgICAgICAgIGRhdGEuX2RlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5fZnJvemVuVWlkcy5wdXNoKGRhdGEudWlkKTtcblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2RyYWcnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIHZhciB0aW1lRGVsdGEgPSArbmV3IERhdGUoKSAtIHN0YXJ0VGltZTtcblxuICAgICAgICAgICAgaWYgKCFkcmFnU3RhcnRlZCAmJiAodGltZURlbHRhID4gc2VsZi5vcHRpb25zLm1heGltdW1DbGlja0RyYWdUaW1lKSkge1xuICAgICAgICAgICAgICAgIGRyYWdTdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OmRyYWdzdGFydCcsIHNlbGVjdGlvbiwgbnVsbCwgW2RhdGFdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRyYWdTdGFydGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnJywgc2VsZWN0aW9uLCBudWxsLCBbZGF0YV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkcmFnUG9zaXRpb24gPSBkMy5tb3VzZShib2R5Tm9kZSk7XG5cbiAgICAgICAgICAgIHZhciBtYXJnaW5EZWx0YSA9IHNlbGYub3B0aW9ucy5hdXRvbWF0aWNTY3JvbGxNYXJnaW5EZWx0YTtcbiAgICAgICAgICAgIHZhciBkUmlnaHQgPSBtYXJnaW5EZWx0YSAtIChzZWxmLmRpbWVuc2lvbnMud2lkdGggLSBkcmFnUG9zaXRpb25bMF0pO1xuICAgICAgICAgICAgdmFyIGRMZWZ0ID0gbWFyZ2luRGVsdGEgLSBkcmFnUG9zaXRpb25bMF07XG4gICAgICAgICAgICB2YXIgZEJvdHRvbSA9IG1hcmdpbkRlbHRhIC0gKHNlbGYuZGltZW5zaW9ucy5oZWlnaHQgLSBkcmFnUG9zaXRpb25bMV0pO1xuICAgICAgICAgICAgdmFyIGRUb3AgPSBtYXJnaW5EZWx0YSAtIGRyYWdQb3NpdGlvblsxXTtcblxuICAgICAgICAgICAgaG9yaXpvbnRhbFNwZWVkID0gTWF0aC5wb3coTWF0aC5tYXgoZFJpZ2h0LCBkTGVmdCwgbWFyZ2luRGVsdGEpLCAyKTtcbiAgICAgICAgICAgIHZlcnRpY2FsU3BlZWQgPSBNYXRoLnBvdyhNYXRoLm1heChkQm90dG9tLCBkVG9wLCBtYXJnaW5EZWx0YSksIDIpO1xuXG4gICAgICAgICAgICB2YXIgcHJldmlvdXNIb3Jpem9udGFsTW92ZSA9IGhvcml6b250YWxNb3ZlO1xuICAgICAgICAgICAgdmFyIHByZXZpb3VzVmVydGljYWxNb3ZlID0gdmVydGljYWxNb3ZlO1xuICAgICAgICAgICAgaG9yaXpvbnRhbE1vdmUgPSBkUmlnaHQgPiAwID8gLTEgOiBkTGVmdCA+IDAgPyAxIDogMDtcbiAgICAgICAgICAgIHZlcnRpY2FsTW92ZSA9IGRCb3R0b20gPiAwID8gLTEgOiBkVG9wID4gMCA/IDEgOiAwO1xuXG4gICAgICAgICAgICB2YXIgaGFzQ2hhbmdlZFN0YXRlID0gcHJldmlvdXNIb3Jpem9udGFsTW92ZSAhPT0gaG9yaXpvbnRhbE1vdmUgfHwgcHJldmlvdXNWZXJ0aWNhbE1vdmUgIT09IHZlcnRpY2FsTW92ZTtcblxuICAgICAgICAgICAgaWYgKChob3Jpem9udGFsTW92ZSB8fCB2ZXJ0aWNhbE1vdmUpICYmICF0aW1lckFjdGl2ZSAmJiBoYXNDaGFuZ2VkU3RhdGUpIHtcblxuICAgICAgICAgICAgICAgIHZhciB0aW1lclN0YXJ0VGltZSA9IGdldFByZWNpc2VUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICB0aW1lckFjdGl2ZSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBkMy50aW1lcihmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFRpbWUgPSBnZXRQcmVjaXNlVGltZSgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZURlbHRhID0gY3VycmVudFRpbWUgLSB0aW1lclN0YXJ0VGltZTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZXJXaWxsU3RvcCA9ICF2ZXJ0aWNhbE1vdmUgJiYgIWhvcml6b250YWxNb3ZlIHx8IG5lZWRUaW1lclN0b3A7XG5cbiAgICAgICAgICAgICAgICAgICAgZG9BdXRvbWF0aWNTY3JvbGwodGltZURlbHRhLCBzZWxmLm9wdGlvbnMucmVuZGVyT25BdXRvbWF0aWNTY3JvbGxJZGxlICYmIHRpbWVyV2lsbFN0b3ApO1xuXG4gICAgICAgICAgICAgICAgICAgIHRpbWVyU3RhcnRUaW1lID0gY3VycmVudFRpbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVyV2lsbFN0b3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lZWRUaW1lclN0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVyQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXJXaWxsU3RvcDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNlbGYuX2RyYWdBRikge1xuICAgICAgICAgICAgICAgIHNlbGYuY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2VsZi5fZHJhZ0FGKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5fZHJhZ0FGID0gc2VsZi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlVHJhbnNmb3JtKTtcblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2RyYWdlbmQnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIGRyYWdTdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHNlbGYuY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2VsZi5fZHJhZ0FGKTtcbiAgICAgICAgICAgIHNlbGYuX2RyYWdBRiA9IG51bGw7XG4gICAgICAgICAgICBob3Jpem9udGFsTW92ZSA9IDA7XG4gICAgICAgICAgICB2ZXJ0aWNhbE1vdmUgPSAwO1xuXG4gICAgICAgICAgICBkYXRhLl9kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgICAgICAgICBzZWxmLl9mcm96ZW5VaWRzLnNwbGljZShzZWxmLl9mcm96ZW5VaWRzLmluZGV4T2YoZGF0YS51aWQpLCAxKTtcblxuICAgICAgICAgICAgZDMudGltZXIuZmx1c2goKTtcblxuICAgICAgICAgICAgdmFyIGRlbHRhRnJvbVRvcExlZnRDb3JuZXIgPSBkMy5tb3VzZShzZWxlY3Rpb24ubm9kZSgpKTtcbiAgICAgICAgICAgIHZhciBoYWxmSGVpZ2h0ID0gc2VsZi5vcHRpb25zLnJvd0hlaWdodCAvIDI7XG4gICAgICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLmF0dHIoJ3RyYW5zZm9ybScsIG51bGwpO1xuXG4gICAgICAgICAgICB2YXIgdG90YWxEZWx0YVggPSBkcmFnUG9zaXRpb25bMF0gLSBzdGFydERyYWdQb3NpdGlvblswXTtcbiAgICAgICAgICAgIHZhciB0b3RhbERlbHRhWSA9IGRyYWdQb3NpdGlvblsxXSAtIHN0YXJ0RHJhZ1Bvc2l0aW9uWzFdO1xuICAgICAgICAgICAgdmFyIGRyYWdEaXN0YW5jZSA9IE1hdGguc3FydCh0b3RhbERlbHRhWCp0b3RhbERlbHRhWCt0b3RhbERlbHRhWSp0b3RhbERlbHRhWSk7XG4gICAgICAgICAgICB2YXIgdGltZURlbHRhID0gK25ldyBEYXRlKCkgLSBzdGFydFRpbWU7XG5cbiAgICAgICAgICAgIGlmICgodGltZURlbHRhID4gc2VsZi5vcHRpb25zLm1heGltdW1DbGlja0RyYWdUaW1lIHx8IGRyYWdEaXN0YW5jZSA+IHNlbGYub3B0aW9ucy5tYXhpbXVtQ2xpY2tEcmFnRGlzdGFuY2UpICYmIGRyYWdEaXN0YW5jZSA+IHNlbGYub3B0aW9ucy5taW5pbXVtRHJhZ0Rpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnZW5kJywgc2VsZWN0aW9uLCBbLWRlbHRhRnJvbVRvcExlZnRDb3JuZXJbMF0sIC1kZWx0YUZyb21Ub3BMZWZ0Q29ybmVyWzFdICsgaGFsZkhlaWdodF0sIFtkYXRhXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nLCBvcmlnaW5UcmFuc2Zvcm1TdHJpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmXG4gICAgICAgICAgICAgICAgLnVwZGF0ZVkoKVxuICAgICAgICAgICAgICAgIC5kcmF3WUF4aXMoKTtcbiAgICAgICAgfSk7XG5cbiAgICBzZWxlY3Rpb24uY2FsbChkcmFnKTtcblxufTtcblxuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRVcGRhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGQsIHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy53cmFwV2l0aEFuaW1hdGlvbihzZWxlY3Rpb24uc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRCYWNrZ3JvdW5kJyksIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgeTogdGhpcy5vcHRpb25zLnJvd1BhZGRpbmcsXG4gICAgICAgICAgICB3aWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy54KHNlbGYuZ2V0RGF0YUVuZChkKSkgLSBzZWxmLnNjYWxlcy54KHNlbGYuZ2V0RGF0YVN0YXJ0KGQpKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kVGV4dCAmJiB0aGlzLm9wdGlvbnMuYWxpZ25MZWZ0ICYmICFkLl9kZWZhdWx0UHJldmVudGVkKSB7XG5cbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpXG4gICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZCA9PiAndHJhbnNsYXRlKCcgKyBNYXRoLm1heCgtdGhpcy5zY2FsZXMueCh0aGlzLmdldERhdGFTdGFydChkKSksIDIpICsgJywwKScpO1xuICAgIH1cblxuICAgIHNlbGVjdGlvbi5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmVsZW1lbnRDb250ZW50VXBkYXRlKHNlbGVjdGlvbiwgZCwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9KTtcblxufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50RXhpdCA9IGZ1bmN0aW9uKHNlbGVjdGlvbikge1xuXG4gICAgc2VsZWN0aW9uLm9uKCdjbGljaycsIG51bGwpO1xuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBEM0Jsb2NrVGFibGU7XG4iLCIvKiBnbG9iYWwgY2FuY2VsQW5pbWF0aW9uRnJhbWUsIHJlcXVlc3RBbmltYXRpb25GcmFtZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzL2V2ZW50cyc7XG5pbXBvcnQgZDMgZnJvbSAnZDMnO1xuXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gRDNUYWJsZVJvd1xuICogQHByb3BlcnR5IHtTdHJpbmd8TnVtYmVyfSBpZFxuICogQHByb3BlcnR5IHtTdHJpbmd9IG5hbWVcbiAqIEBwcm9wZXJ0eSB7QXJyYXk8RDNUYWJsZUVsZW1lbnQ+fSBlbGVtZW50c1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gRDNUYWJsZUVsZW1lbnRcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfE51bWJlcn0gaWRcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfE51bWJlcn0gdWlkXG4gKiBAcHJvcGVydHkge051bWJlcn0gc3RhcnRcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBlbmRcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBbcm93SW5kZXhdXG4gKi9cblxuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUYWJsZShvcHRpb25zKSB7XG5cbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIEQzVGFibGUuaW5zdGFuY2VzQ291bnQgKz0gMTtcblxuICAgIHRoaXMuaW5zdGFuY2VOdW1iZXIgPSBEM1RhYmxlLmluc3RhbmNlc0NvdW50O1xuXG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0FycmF5PEQzVGFibGVSb3c+fVxuICAgICAqL1xuICAgIHRoaXMuZGF0YSA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0FycmF5PEQzVGFibGVFbGVtZW50Pn1cbiAgICAgKi9cbiAgICB0aGlzLmZsYXR0ZW5lZERhdGEgPSBbXTtcblxuXG4gICAgdGhpcy5tYXJnaW4gPSB7XG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgbGVmdDogMFxuICAgIH07XG5cbiAgICB0aGlzLmRpbWVuc2lvbnMgPSB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcblxuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgPSBbMC4wLCAwLjBdO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuXG4gICAgdGhpcy5lbGVtZW50cyA9IHtcbiAgICAgICAgYm9keTogbnVsbCxcbiAgICAgICAgaW5uZXJDb250YWluZXI6IG51bGwsXG4gICAgICAgIHhBeGlzQ29udGFpbmVyOiBudWxsLFxuICAgICAgICB4MkF4aXNDb250YWluZXI6IG51bGwsXG4gICAgICAgIHlBeGlzQ29udGFpbmVyOiBudWxsLFxuICAgICAgICBkZWZzOiBudWxsLFxuICAgICAgICBjbGlwOiBudWxsXG4gICAgfTtcblxuICAgIHRoaXMuc2NhbGVzID0ge1xuICAgICAgICB4OiBudWxsLFxuICAgICAgICB5OiBudWxsXG4gICAgfTtcblxuICAgIHRoaXMuYXhpc2VzID0ge1xuICAgICAgICB4OiBudWxsLFxuICAgICAgICB4MjogbnVsbCxcbiAgICAgICAgeTogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLmJlaGF2aW9ycyA9IHtcbiAgICAgICAgem9vbTogbnVsbCxcbiAgICAgICAgem9vbVg6IG51bGwsXG4gICAgICAgIHpvb21ZOiBudWxsLFxuICAgICAgICBwYW46IG51bGxcbiAgICB9O1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFNjYWxlID0gbnVsbDtcblxuICAgIHRoaXMuX3lTY2FsZSA9IDAuMDtcbiAgICB0aGlzLl9kYXRhQ2hhbmdlQ291bnQgPSAwO1xuICAgIHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9IDA7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoID0gMDtcbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0ID0gMDtcbiAgICB0aGlzLl9wcmV2ZW50RHJhd2luZyA9IGZhbHNlO1xuICAgIHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzID0gW107XG4gICAgdGhpcy5fbWF4Qm9keUhlaWdodCA9IEluZmluaXR5O1xuICAgIHRoaXMuX2Zyb3plblVpZHMgPSBbXTtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZSwgRXZlbnRFbWl0dGVyKTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMgPSB7XG4gICAgYmVtQmxvY2tOYW1lOiAndGFibGUnLFxuICAgIGJlbUJsb2NrTW9kaWZpZXI6ICcnLFxuICAgIHhBeGlzSGVpZ2h0OiA1MCxcbiAgICB5QXhpc1dpZHRoOiA1MCxcbiAgICByb3dIZWlnaHQ6IDMwLFxuICAgIHJvd1BhZGRpbmc6IDUsXG4gICAgY29udGFpbmVyOiAnYm9keScsXG4gICAgY3VsbGluZ1g6IHRydWUsXG4gICAgY3VsbGluZ1k6IHRydWUsXG4gICAgY3VsbGluZ0Rpc3RhbmNlOiAxLFxuICAgIHJlbmRlck9uSWRsZTogdHJ1ZSxcbiAgICBoaWRlVGlja3NPblpvb206IGZhbHNlLFxuICAgIGhpZGVUaWNrc09uRHJhZzogZmFsc2UsXG4gICAgcGFuWU9uV2hlZWw6IHRydWUsXG4gICAgd2hlZWxNdWx0aXBsaWVyOiAxLFxuICAgIGVuYWJsZVlUcmFuc2l0aW9uOiB0cnVlLFxuICAgIGVuYWJsZVRyYW5zaXRpb25PbkV4aXQ6IHRydWUsXG4gICAgdXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtOiBmYWxzZSxcbiAgICB0cmFuc2l0aW9uRWFzaW5nOiAncXVhZC1pbi1vdXQnLFxuICAgIHhBeGlzVGlja3NGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgfSxcbiAgICB4QXhpc1N0cm9rZVdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkJTIgPyAxIDogMjtcbiAgICB9LFxuICAgIHhBeGlzMlRpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9LFxuICAgIHlBeGlzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkICYmIGQubmFtZSB8fCAnJztcbiAgICB9LFxuICAgIHBhZGRpbmc6IDEwLFxuICAgIHRyYWNrZWRET01FdmVudHM6IFsnY2xpY2snLCAnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZScsICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXSAvLyBub3QgZHluYW1pY1xufTtcblxuRDNUYWJsZS5pbnN0YW5jZXNDb3VudCA9IDA7XG5cbkQzVGFibGUucHJvdG90eXBlLm5vb3AgPSBmdW5jdGlvbigpIHt9O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBjb250YWluZXJcbiAgICB0aGlzLmNvbnRhaW5lciA9IGQzLnNlbGVjdCh0aGlzLm9wdGlvbnMuY29udGFpbmVyKS5hcHBlbmQoJ3N2ZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAodGhpcy5vcHRpb25zLmJlbUJsb2NrTW9kaWZpZXIgPyAnICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTW9kaWZpZXIgOiAnJykpO1xuXG4gICAgLy8gZGVmc1xuICAgIHRoaXMuZWxlbWVudHMuZGVmcyA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZGVmcycpO1xuXG4gICAgLy8gY2xpcCByZWN0IGluIGRlZnNcbiAgICB2YXIgY2xpcElkID0gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm9keUNsaXBQYXRoLS0nICsgRDNUYWJsZS5pbnN0YW5jZXNDb3VudDtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXAgPSB0aGlzLmVsZW1lbnRzLmRlZnMuYXBwZW5kKCdjbGlwUGF0aCcpXG4gICAgICAgIC5wcm9wZXJ0eSgnaWQnLCBjbGlwSWQpO1xuICAgIHRoaXMuZWxlbWVudHMuY2xpcFxuICAgICAgICAuYXBwZW5kKCdyZWN0Jyk7XG5cbiAgICAvLyBzdXJyb3VuZGluZyByZWN0XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnLCB0cnVlKTtcblxuICAgIC8vIGF4aXNlcyBjb250YWluZXJzXG4gICAgdGhpcy5lbGVtZW50cy54QXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXgnKTtcblxuICAgIHRoaXMuZWxlbWVudHMueDJBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teCAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0tc2Vjb25kYXJ5Jyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teScpO1xuXG4gICAgLy8gYm9keSBjb250YWluZXIgaW5uZXIgY29udGFpbmVyIGFuZCBzdXJyb3VuZGluZyByZWN0XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5ID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoIycgKyBjbGlwSWQgKyAnKScpO1xuXG4gICAgLy8gc3Vycm91bmRpbmcgcmVjdFxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuY2xhc3NlZCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcsIHRydWUpO1xuXG4gICAgLy8gaW5uZXIgY29udGFpbmVyXG4gICAgdGhpcy5lbGVtZW50cy5pbm5lckNvbnRhaW5lciA9IHRoaXMuZWxlbWVudHMuYm9keS5hcHBlbmQoJ2cnKTtcblxuICAgIC8vIHN1cnJvdW5kaW5nIHJlY3RcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0JywgdHJ1ZSk7XG5cbiAgICB0aGlzLnVwZGF0ZU1hcmdpbnMoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUQzSW5zdGFuY2VzKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVFdmVudExpc3RlbmVycygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS54U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUueVNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmluaXRpYWxpemVEM0luc3RhbmNlcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5zY2FsZXMueCA9IHRoaXMueFNjYWxlRmFjdG9yeSgpO1xuXG4gICAgdGhpcy5zY2FsZXMueSA9IHRoaXMueVNjYWxlRmFjdG9yeSgpO1xuXG4gICAgdGhpcy5heGlzZXMueCA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgLnNjYWxlKHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5vcmllbnQoJ3RvcCcpXG4gICAgICAgIC50aWNrRm9ybWF0KHRoaXMub3B0aW9ucy54QXhpc1RpY2tzRm9ybWF0dGVyLmJpbmQodGhpcykpXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApXG4gICAgICAgIC50aWNrUGFkZGluZygyMCk7XG5cbiAgICB0aGlzLmF4aXNlcy54MiA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgLnNjYWxlKHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5vcmllbnQoJ3RvcCcpXG4gICAgICAgIC50aWNrRm9ybWF0KHRoaXMub3B0aW9ucy54QXhpczJUaWNrc0Zvcm1hdHRlci5iaW5kKHRoaXMpKVxuICAgICAgICAub3V0ZXJUaWNrU2l6ZSgwKVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZSgwKTtcblxuICAgIHRoaXMuYXhpc2VzLnkgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy55KVxuICAgICAgICAub3JpZW50KCdsZWZ0JylcbiAgICAgICAgLnRpY2tGb3JtYXQoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuX2lzUm91bmQoZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5vcHRpb25zLnlBeGlzRm9ybWF0dGVyKHNlbGYuZGF0YVsoZHwwKV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSlcbiAgICAgICAgLm9uKCd6b29tJywgdGhpcy5oYW5kbGVab29taW5nLmJpbmQodGhpcykpXG4gICAgICAgIC5vbignem9vbWVuZCcsIHRoaXMuaGFuZGxlWm9vbWluZ0VuZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YID0gZDMuYmVoYXZpb3Iuem9vbSgpXG4gICAgICAgIC54KHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5zY2FsZSgxKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAueSh0aGlzLnNjYWxlcy55KVxuICAgICAgICAuc2NhbGUoMSlcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy5wYW4gPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgICAgLm9uKCdkcmFnJywgdGhpcy5oYW5kbGVEcmFnZ2luZy5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5jYWxsKHRoaXMuYmVoYXZpb3JzLnBhbik7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmNhbGwodGhpcy5iZWhhdmlvcnMuem9vbSk7XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKTtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCk7XG59XG5cbkQzVGFibGUucHJvdG90eXBlLmluaXRpYWxpemVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5vcHRpb25zLnRyYWNrZWRET01FdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudE5hbWUpIHtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5ib2R5Lm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnROYW1lICE9PSAnY2xpY2snIHx8ICFkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkICYmIGQzLnNlbGVjdChkMy5ldmVudC50YXJnZXQpLmNsYXNzZWQoc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoZXZlbnROYW1lLCBzZWxmLmVsZW1lbnRzLmJvZHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZW1pdERldGFpbGVkRXZlbnQgPSBmdW5jdGlvbihldmVudE5hbWUsIGQzVGFyZ2V0U2VsZWN0aW9uLCBkZWx0YSwgcHJpb3JpdHlBcmd1bWVudHMsIGV4dHJhQXJndW1lbnRzKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcG9zaXRpb247XG5cbiAgICB2YXIgZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFwb3NpdGlvbikge1xuICAgICAgICAgICAgcG9zaXRpb24gPSBkMy5tb3VzZShzZWxmLmVsZW1lbnRzLmJvZHkubm9kZSgpKTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRlbHRhKSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uWzBdICs9IGRlbHRhWzBdO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uWzFdICs9IGRlbHRhWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9O1xuXG4gICAgdmFyIGFyZ3MgPSBbXG4gICAgICAgIHRoaXMsIC8vIHRoZSB0YWJsZSBpbnN0YW5jZVxuICAgICAgICBkM1RhcmdldFNlbGVjdGlvbiwgLy8gdGhlIGQzIHNlbGVjdGlvbiB0YXJnZXRlZFxuICAgICAgICBkMy5ldmVudCwgLy8gdGhlIGQzIGV2ZW50XG4gICAgICAgIGZ1bmN0aW9uIGdldENvbHVtbigpIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IGdldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5zY2FsZXMueC5pbnZlcnQocG9zaXRpb25bMF0pO1xuICAgICAgICB9LCAvLyBhIGNvbHVtbiBnZXR0ZXJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Um93KCkge1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy55LmludmVydChwb3NpdGlvblsxXSk7XG4gICAgICAgIH0gLy8gYSByb3cgZ2V0dGVyXG4gICAgXTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KHByaW9yaXR5QXJndW1lbnRzKSkge1xuICAgICAgICBhcmdzID0gcHJpb3JpdHlBcmd1bWVudHMuY29uY2F0KGFyZ3MpO1xuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGV4dHJhQXJndW1lbnRzKSkge1xuICAgICAgICBhcmdzID0gYXJncy5jb25jYXQoZXh0cmFBcmd1bWVudHMpO1xuICAgIH1cblxuICAgIGFyZ3MudW5zaGlmdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzonICsgZXZlbnROYW1lKTsgLy8gdGhlIGV2ZW50IG5hbWVcblxuICAgIHRoaXMuZW1pdC5hcHBseSh0aGlzLCBhcmdzKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZU1hcmdpbnMgPSBmdW5jdGlvbih1cGRhdGVEaW1lbnNpb25zKSB7XG5cbiAgICB0aGlzLm1hcmdpbiA9IHtcbiAgICAgICAgdG9wOiB0aGlzLm9wdGlvbnMueEF4aXNIZWlnaHQgKyB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgcmlnaHQ6IHRoaXMub3B0aW9ucy5wYWRkaW5nLFxuICAgICAgICBib3R0b206IHRoaXMub3B0aW9ucy5wYWRkaW5nLFxuICAgICAgICBsZWZ0OiB0aGlzLm9wdGlvbnMueUF4aXNXaWR0aCArIHRoaXMub3B0aW9ucy5wYWRkaW5nXG4gICAgfTtcblxuICAgIHZhciBjb250ZW50UG9zaXRpb24gPSB7IHg6IHRoaXMubWFyZ2luLmxlZnQsIHk6IHRoaXMubWFyZ2luLnRvcCB9O1xuICAgIHZhciBjb250ZW50VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgdGhpcy5tYXJnaW4ubGVmdCArICcsJyArIHRoaXMubWFyZ2luLnRvcCArICcpJztcblxuICAgIHRoaXMuY29udGFpbmVyLnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnKVxuICAgICAgICAuYXR0cihjb250ZW50UG9zaXRpb24pO1xuXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5XG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueEF4aXNDb250YWluZXJcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGNvbnRlbnRUcmFuc2Zvcm0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy54MkF4aXNDb250YWluZXJcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGNvbnRlbnRUcmFuc2Zvcm0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy55QXhpc0NvbnRhaW5lclxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgdGhpcy5tYXJnaW4ubGVmdCArICcsJyArIHRoaXMubWFyZ2luLnRvcCArICcpJyk7XG5cbiAgICBpZiAodXBkYXRlRGltZW5zaW9ucykge1xuICAgICAgICB0aGlzLnVwZGF0ZVgoKTtcbiAgICAgICAgdGhpcy51cGRhdGVZKCk7XG4gICAgfVxuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyByZW1vdmUgYmVoYXZpb3IgbGlzdGVuZXJzXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS5vbignem9vbScsIG51bGwpO1xuXG4gICAgLy8gcmVtb3ZlIGRvbSBsaXN0ZW5lcnNcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkub24oJy56b29tJywgbnVsbCk7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5Lm9uKCdjbGljaycsIG51bGwpO1xuXG4gICAgLy8gcmVtb3ZlIHJlZmVyZW5jZXNcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5lbGVtZW50cyA9IG51bGw7XG4gICAgdGhpcy5zY2FsZXMgPSBudWxsO1xuICAgIHRoaXMuYXhpc2VzID0gbnVsbDtcbiAgICB0aGlzLmJlaGF2aW9ycyA9IG51bGw7XG4gICAgdGhpcy5kYXRhID0gbnVsbDtcbiAgICB0aGlzLmZsYXR0ZW5lZERhdGEgPSBudWxsO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUucmVzdG9yZVpvb20gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSh0aGlzLl9sYXN0VHJhbnNsYXRlKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKHRoaXMuX2xhc3RTY2FsZSk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oZHgsIGR5LCBmb3JjZURyYXcsIHNraXBYQXhpcywgZm9yY2VUaWNrcykge1xuXG4gICAgdmFyIGN1cnJlbnRUcmFuc2xhdGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpO1xuICAgIHZhciB1cGRhdGVkVCA9IFtjdXJyZW50VHJhbnNsYXRlWzBdICsgZHgsIGN1cnJlbnRUcmFuc2xhdGVbMV0gKyBkeV07XG5cbiAgICB1cGRhdGVkVCA9IHRoaXMuX2NsYW1wVHJhbnNsYXRpb25XaXRoU2NhbGUodXBkYXRlZFQsIFt0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCksIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnNjYWxlKCldKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkudHJhbnNsYXRlKHVwZGF0ZWRUKTtcblxuICAgIHRoaXMubW92ZUVsZW1lbnRzKGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVDtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJyk7XG5cbiAgICByZXR1cm4gdXBkYXRlZFQuY29uY2F0KFt1cGRhdGVkVFswXSAtIGN1cnJlbnRUcmFuc2xhdGVbMF0sIHVwZGF0ZWRUWzFdIC0gY3VycmVudFRyYW5zbGF0ZVsxXV0pO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZW5zdXJlSW5Eb21haW5zID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubW92ZSgwLCAwLCBmYWxzZSwgZmFsc2UsIHRydWUpO1xufTtcblxuLyoqXG4gKiBwYW4gWC9ZICYgem9vbSBYIGhhbmRsZXIgKGNsYW1wZWQgcGFuIFkgd2hlbiB3aGVlbCBpcyBwcmVzc2VkIHdpdGhvdXQgY3RybCwgem9vbSBYIGFuZCBwYW4gWC9ZIG90aGVyd2lzZSlcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlWm9vbWluZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmICFkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5ICYmICEoZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID49IDIpKSB7XG4gICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC50eXBlID09PSAnd2hlZWwnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBhbllPbldoZWVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlWm9vbSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlV2hlZWxpbmcoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlc3RvcmVab29tKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdCA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdmFyIHVwZGF0ZWRUID0gW3RbMF0sIHRoaXMuX2xhc3RUcmFuc2xhdGVbMV1dO1xuXG4gICAgdXBkYXRlZFQgPSB0aGlzLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlKHVwZGF0ZWRULCBbdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpLCB0aGlzLmJlaGF2aW9ycy56b29tWS5zY2FsZSgpXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVgudHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuXG4gICAgdGhpcy5tb3ZlRWxlbWVudHModHJ1ZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25ab29tKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVDtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScpO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVab29taW5nRW5kID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuICAgIHRoaXMubW92ZUVsZW1lbnRzKHRydWUpO1xuICAgIHRoaXMuZHJhd1lBeGlzKCk7XG4gICAgdGhpcy5kcmF3WEF4aXMoKTtcbn07XG5cbi8qKlxuICogd2hlZWwgaGFuZGxlciAoY2xhbXBlZCBwYW4gWSlcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlV2hlZWxpbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBldmVudCA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50O1xuXG4gICAgdmFyIGR4ID0gMCwgZHkgPSAwO1xuXG4gICAgdmFyIG1vdmluZ1ggPSBldmVudCAmJiBldmVudC53aGVlbERlbHRhWCB8fCBldmVudC5kZWx0YVg7XG5cbiAgICBpZiAobW92aW5nWCkge1xuXG4gICAgICAgIHZhciBtb3ZpbmdSaWdodCA9IGV2ZW50LndoZWVsRGVsdGFYID4gMCB8fCBldmVudC5kZWx0YVggPCAwO1xuICAgICAgICBkeCA9IChtb3ZpbmdSaWdodCA/IDEgOiAtMSkgKiB0aGlzLmNvbHVtbldpZHRoICogdGhpcy5vcHRpb25zLndoZWVsTXVsdGlwbGllcjtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdmFyIG1vdmluZ1kgPSBldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LndoZWVsRGVsdGFZIHx8IGV2ZW50LmRldGFpbCB8fCBldmVudC5kZWx0YVk7XG5cbiAgICAgICAgaWYgKG1vdmluZ1kpIHtcbiAgICAgICAgICAgIHZhciBtb3ZpbmdEb3duID0gZXZlbnQud2hlZWxEZWx0YSA+IDAgfHwgZXZlbnQud2hlZWxEZWx0YVkgPiAwIHx8IGV2ZW50LmRldGFpbCA8IDAgfHwgZXZlbnQuZGVsdGFZIDwgMDtcbiAgICAgICAgICAgIGR5ID0gbW92aW5nWSA/IChtb3ZpbmdEb3duID8gMSA6IC0xKSAqIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgKiB0aGlzLm9wdGlvbnMud2hlZWxNdWx0aXBsaWVyIDogMDtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgdGhpcy5tb3ZlKGR4LCBkeSwgZmFsc2UsICFtb3ZpbmdYKTtcblxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlRHJhZ2dpbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b3VjaGVzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm1vdmUoZDMuZXZlbnQuZHgsIGQzLmV2ZW50LmR5LCBmYWxzZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25EcmFnKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnRvZ2dsZURyYXdpbmcgPSBmdW5jdGlvbihhY3RpdmUpIHtcblxuICAgIHRoaXMuX3ByZXZlbnREcmF3aW5nID0gdHlwZW9mIGFjdGl2ZSA9PT0gJ2Jvb2xlYW4nID8gIWFjdGl2ZSA6ICF0aGlzLl9wcmV2ZW50RHJhd2luZztcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtBcnJheTxEM1RhYmxlUm93Pn0gZGF0YVxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFthbmltYXRlWV1cbiAqIEByZXR1cm5zIHtEM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24oZGF0YSwgdHJhbnNpdGlvbkR1cmF0aW9uLCBhbmltYXRlWSkge1xuXG4gICAgdGhpcy5fZGF0YUNoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNTaXplQ2hhbmdpbmcgPSBkYXRhLmxlbmd0aCAhPT0gdGhpcy5kYXRhLmxlbmd0aDtcblxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICB0aGlzLmdlbmVyYXRlRmxhdHRlbmVkRGF0YSgpO1xuXG4gICAgaWYgKGlzU2l6ZUNoYW5naW5nIHx8IHRoaXMuX2RhdGFDaGFuZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgICAgICAudXBkYXRlWShhbmltYXRlWSA/IHRyYW5zaXRpb25EdXJhdGlvbiA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd0VsZW1lbnRzKHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICogQHJldHVybnMge0FycmF5PEQzVGFibGVSb3c+fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZURhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiB0aGlzLmRhdGEubWFwKGZ1bmN0aW9uKGQpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge0QzVGFibGVSb3d9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0ge307XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIGQpIHtcbiAgICAgICAgICAgIGlmIChkLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAnZWxlbWVudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc1trZXldID0gZFtrZXldO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc1trZXldID0gZFtrZXldLm1hcChzZWxmLmNsb25lRWxlbWVudC5iaW5kKHNlbGYpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKiBAcmV0dXJucyB7QXJyYXk8RDNUYWJsZUVsZW1lbnQ+fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5mbGF0dGVuZWREYXRhLm1hcChmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtEM1RhYmxlRWxlbWVudH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSB7fTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZSkge1xuICAgICAgICAgICAgaWYgKGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHJlc1trZXldID0gZVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICogQHJldHVybnMge0QzVGFibGVFbGVtZW50fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZUVsZW1lbnQgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RDNUYWJsZUVsZW1lbnR9XG4gICAgICovXG4gICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgZm9yICh2YXIga2V5IGluIGUpIHtcbiAgICAgICAgaWYgKGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgcmVzW2tleV0gPSBlW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RWxlbWVudFJvdyA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmluZCh0aGlzLmRhdGEsIGZ1bmN0aW9uKHJvdykge1xuICAgICAgICByZXR1cm4gcm93LmVsZW1lbnRzLmluZGV4T2YoZCkgIT09IC0xO1xuICAgIH0pO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuc3RvcmVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wcmV2aW91c0ZsYXR0ZW5lZERhdGEgPSB0aGlzLmNsb25lRmxhdHRlbmVkRGF0YSgpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybSkge1xuICAgICAgICB0aGlzLnN0b3JlRmxhdHRlbmVkRGF0YSgpO1xuICAgIH1cblxuICAgIHRoaXMuZmxhdHRlbmVkRGF0YS5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5kYXRhLmZvckVhY2goZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICBkLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5yb3dJbmRleCA9IGk7XG4gICAgICAgICAgICBpZiAoc2VsZi5fZnJvemVuVWlkcy5pbmRleE9mKGVsZW1lbnQudWlkKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9kZWZhdWx0UHJldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuZmxhdHRlbmVkRGF0YS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gbWluWFxuICogQHBhcmFtIHtEYXRlfSBtYXhYXG4gKiBAcmV0dXJucyB7RDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc2V0WFJhbmdlID0gZnVuY3Rpb24obWluWCwgbWF4WCkge1xuXG4gICAgdGhpcy5taW5YID0gbWluWDtcbiAgICB0aGlzLm1heFggPSBtYXhYO1xuXG4gICAgdGhpcy5zY2FsZXMueFxuICAgICAgICAuZG9tYWluKFt0aGlzLm1pblgsIHRoaXMubWF4WF0pO1xuXG4gICAgdGhpc1xuICAgICAgICAudXBkYXRlWCgpXG4gICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAuZHJhd0VsZW1lbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnNldEF2YWlsYWJsZVdpZHRoID0gZnVuY3Rpb24oYXZhaWxhYmxlV2lkdGgpIHtcblxuICAgIHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCArPSAxO1xuXG4gICAgdmFyIGlzQXZhaWxhYmxlV2lkdGhDaGFuZ2luZyA9IGF2YWlsYWJsZVdpZHRoICE9PSB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGg7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoID0gYXZhaWxhYmxlV2lkdGg7XG5cbiAgICB0aGlzLmRpbWVuc2lvbnMud2lkdGggPSB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGggLSB0aGlzLm1hcmdpbi5sZWZ0IC0gdGhpcy5tYXJnaW4ucmlnaHQ7XG5cbiAgICBpZiAoaXNBdmFpbGFibGVXaWR0aENoYW5naW5nIHx8IHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWCgpXG4gICAgICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAgICAgLmRyYXdFbGVtZW50cygpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRBdmFpbGFibGVIZWlnaHQgPSBmdW5jdGlvbihhdmFpbGFibGVIZWlnaHQpIHtcblxuICAgIHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCArPSAxO1xuXG4gICAgdmFyIGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgPSBhdmFpbGFibGVIZWlnaHQgIT09IHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQ7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCA9IGF2YWlsYWJsZUhlaWdodDtcblxuICAgIHRoaXMuX21heEJvZHlIZWlnaHQgPSB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0IC0gdGhpcy5tYXJnaW4udG9wIC0gdGhpcy5tYXJnaW4uYm90dG9tO1xuXG4gICAgaWYgKGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgfHwgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID09PSAxKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVZKClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgICAgICAuZHJhd0VsZW1lbnRzKClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVggPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHRoaXMuY29udGFpbmVyLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoICsgdGhpcy5tYXJnaW4ubGVmdCArIHRoaXMubWFyZ2luLnJpZ2h0KTtcblxuICAgIHRoaXMuc2NhbGVzLnhcbiAgICAgICAgLmRvbWFpbihbdGhpcy5taW5YLCB0aGlzLm1heFhdKVxuICAgICAgICAucmFuZ2UoWzAsIHRoaXMuZGltZW5zaW9ucy53aWR0aF0pO1xuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZSgtdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YXG4gICAgICAgIC54KHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC50cmFuc2xhdGUodGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKSlcbiAgICAgICAgLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1ib3VuZGluZ1JlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgdGhpcy5jb250YWluZXIuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXAuc2VsZWN0KCdyZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMsIHRoaXMuY29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihmKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5wdXNoKGYpO1xuXG4gICAgaWYgKHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZztcbiAgICAgICAgICAgIHdoaWxlKGcgPSBzZWxmLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5zaGlmdCgpKSBnKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihmKSB7XG5cbiAgICB2YXIgaW5kZXggPSB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5sZW5ndGggPiAwID8gdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMuaW5kZXhPZihmKSA6IC0xO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRyYXdYQXhpcyA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbiwgc2tpcFRpY2tzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZShza2lwVGlja3MgPyAwIDogLXRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5feEF4aXNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3hBeGlzQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX3hBeGlzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKHNlbGYuZWxlbWVudHMueEF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5jYWxsKHNlbGYuYXhpc2VzLngpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdsaW5lJylcbiAgICAgICAgICAgIC5zdHlsZSh7XG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IHNlbGYub3B0aW9ucy54QXhpc1N0cm9rZVdpZHRoLmJpbmQoc2VsZilcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy54MkF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5jYWxsKHNlbGYuYXhpc2VzLngyKVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgndGV4dCcpXG4gICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgeDogc2VsZi5jb2x1bW5XaWR0aCAvIDJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3R5bGUoe1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICtkID09PSArc2VsZi5tYXhYID8gJ25vbmUnIDogJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRyYXdZQXhpcyA9IGZ1bmN0aW9uIGRyYXdZQXhpcyh0cmFuc2l0aW9uRHVyYXRpb24sIHNraXBUaWNrcykge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuYXhpc2VzLnhcbiAgICAgICAgLmlubmVyVGlja1NpemUoc2tpcFRpY2tzID8gMCA6IC10aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIHZhciBkb21haW5ZID0gdGhpcy5zY2FsZXMueS5kb21haW4oKTtcblxuICAgIHRoaXMuYXhpc2VzLnlcbiAgICAgICAgLnRpY2tWYWx1ZXModGhpcy5fcmFuZ2UoTWF0aC5yb3VuZChkb21haW5ZWzBdKSwgTWF0aC5yb3VuZChkb21haW5ZWzFdKSwgMSkpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX3lBeGlzQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl95QXhpc0FGKTtcbiAgICB9XG5cbiAgICB0aGlzLl95QXhpc0FGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHNlbGYud3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy55QXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgY29udGFpbmVyLmNhbGwoc2VsZi5heGlzZXMueSk7XG5cbiAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCd0ZXh0JykuYXR0cigneScsIHNlbGYub3B0aW9ucy5yb3dIZWlnaHQgLyAyKTtcblxuICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ2xpbmUnKS5zdHlsZSgnZGlzcGxheScsIGZ1bmN0aW9uKGQsaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpID8gJycgOiAnbm9uZSc7XG4gICAgICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm1Gcm9tRGF0YSA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgdGhpcy5zY2FsZXMueCh0aGlzLmdldERhdGFTdGFydChkKSkgKyAnLCcgKyB0aGlzLnNjYWxlcy55KGQucm93SW5kZXgpICsgJyknO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RGF0YVN0YXJ0ID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiArZC5zdGFydDtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmdldERhdGFFbmQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICtkLmVuZDtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRyYXdFbGVtZW50cyA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5fZWxlbWVudHNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2VsZW1lbnRzQUYpXG4gICAgfVxuXG4gICAgdmFyIGVuYWJsZVlUcmFuc2l0aW9uID0gdGhpcy5vcHRpb25zLmVuYWJsZVlUcmFuc2l0aW9uO1xuXG4gICAgdGhpcy5fZWxlbWVudHNBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBkb21haW5YID0gc2VsZi5zY2FsZXMueC5kb21haW4oKTtcbiAgICAgICAgdmFyIGRvbWFpblhTdGFydCA9IGRvbWFpblhbMF07XG4gICAgICAgIHZhciBkb21haW5YRW5kID0gZG9tYWluWFtkb21haW5YLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIHZhciBkb21haW5ZID0gc2VsZi5zY2FsZXMueS5kb21haW4oKTtcbiAgICAgICAgdmFyIGRvbWFpbllTdGFydCA9IGRvbWFpbllbMF07XG4gICAgICAgIHZhciBkb21haW5ZRW5kID0gZG9tYWluWVtkb21haW5ZLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIHZhciBjdWxsaW5nRGlzdGFuY2UgPSBzZWxmLm9wdGlvbnMuY3VsbGluZ0Rpc3RhbmNlO1xuICAgICAgICB2YXIgY3VsbGluZ1ggPSBzZWxmLm9wdGlvbnMuY3VsbGluZ1g7XG4gICAgICAgIHZhciBjdWxsaW5nWSA9IHNlbGYub3B0aW9ucy5jdWxsaW5nWTtcblxuXG4gICAgICAgIHZhciBzdGFydFRyYW5zZm9ybU1hcCA9IHt9O1xuICAgICAgICB2YXIgZW5kVHJhbnNmb3JtTWFwID0ge307XG5cbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy51c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm0gJiYgdHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgaWYgKHNlbGYucHJldmlvdXNGbGF0dGVuZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wcmV2aW91c0ZsYXR0ZW5lZERhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RhcnRUcmFuc2Zvcm1NYXBbZC51aWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRyYW5zZm9ybU1hcFtkLmlkXSA9IHN0YXJ0VHJhbnNmb3JtTWFwW2QudWlkXSA9IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWxmLmZsYXR0ZW5lZERhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZsYXR0ZW5lZERhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZW5kVHJhbnNmb3JtTWFwW2QudWlkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVHJhbnNmb3JtTWFwW2QuaWRdID0gZW5kVHJhbnNmb3JtTWFwW2QudWlkXSA9IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhID0gc2VsZi5mbGF0dGVuZWREYXRhLmZpbHRlcihmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gZC5fZGVmYXVsdFByZXZlbnRlZCB8fCAoIWN1bGxpbmdZIHx8IChkLnJvd0luZGV4ID49IGRvbWFpbllTdGFydCAtIGN1bGxpbmdEaXN0YW5jZSAmJiBkLnJvd0luZGV4IDwgZG9tYWluWUVuZCArIGN1bGxpbmdEaXN0YW5jZSAtIDEpKVxuICAgICAgICAgICAgICAgICYmICghY3VsbGluZ1ggfHwgIShzZWxmLmdldERhdGFFbmQoZCkgPCBkb21haW5YU3RhcnQgfHwgc2VsZi5nZXREYXRhU3RhcnQoZCkgPiBkb21haW5YRW5kKSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgdmFyIGcgPSBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLnNlbGVjdEFsbCgnZy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAuZGF0YShkYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQudWlkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGV4aXRpbmcgPSBnLmV4aXQoKTtcblxuICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmVuYWJsZVRyYW5zaXRpb25PbkV4aXQgJiYgdHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgZXhpdGluZ1xuICAgICAgICAgICAgICAgIC5jYWxsKHNlbGYuZWxlbWVudEV4aXQuYmluZChzZWxmKSk7XG5cbiAgICAgICAgICAgIGV4aXRpbmcuZWFjaChmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZyA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIHZhciBleGl0VHJhbnNmb3JtID0gZW5kVHJhbnNmb3JtTWFwW2QudWlkXSB8fCBlbmRUcmFuc2Zvcm1NYXBbZC5pZF07XG5cbiAgICAgICAgICAgICAgICBpZiAoZXhpdFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKGcsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBleGl0VHJhbnNmb3JtKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGcucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4aXRpbmdcbiAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBnLmVudGVyKCkuYXBwZW5kKCdnJylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKVxuICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNhbGwoc2VsZi5lbGVtZW50RW50ZXIuYmluZChzZWxmKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBnLmVhY2goZnVuY3Rpb24oZCkge1xuXG4gICAgICAgICAgICB2YXIgZyA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgaWYgKGQuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudFVwZGF0ZShnLCBkLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaGFzUHJldmlvdXNUcmFuc2Zvcm0gPSBnLmF0dHIoJ3RyYW5zZm9ybScpICE9PSBudWxsO1xuXG4gICAgICAgICAgICB2YXIgbmV3VHJhbnNmb3JtID0gZW5kVHJhbnNmb3JtTWFwW2QudWlkXSB8fCBlbmRUcmFuc2Zvcm1NYXBbZC5pZF0gfHwgc2VsZi5nZXRUcmFuc2Zvcm1Gcm9tRGF0YShkKTtcblxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgb3JpZ2luVHJhbnNmb3JtID0gc3RhcnRUcmFuc2Zvcm1NYXBbZC51aWRdIHx8IHN0YXJ0VHJhbnNmb3JtTWFwW2QuaWRdIHx8IG5ld1RyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICB2YXIgbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNQcmV2aW91c1RyYW5zZm9ybSAmJiBzZWxmLm9wdGlvbnMudXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5UcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkT3JpZ2luVHJhbnNmb3JtID0gb3JpZ2luVHJhbnNmb3JtO1xuICAgICAgICAgICAgICAgICAgICAgICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCBvcmlnaW5UcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi53cmFwV2l0aEFuaW1hdGlvbihnLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyVHdlZW4oXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3JpZ2luVHJhbnNmb3JtID0gbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm0gfHwgZy5hdHRyKCd0cmFuc2Zvcm0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbmFibGVZVHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5pbnRlcnBvbGF0ZVRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm0sIG5ld1RyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGFydFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbmRUcmFuc2Zvcm0gPSBkMy50cmFuc2Zvcm0obmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRyYW5zZm9ybS50cmFuc2xhdGVbMV0gPSBlbmRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5pbnRlcnBvbGF0ZVRyYW5zZm9ybShzdGFydFRyYW5zZm9ybS50b1N0cmluZygpLCBlbmRUcmFuc2Zvcm0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ1xuICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgbmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5lbGVtZW50VXBkYXRlKGcsIGQsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IFswLjAsIDAuMF07XG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG5cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUubW92ZUVsZW1lbnRzID0gZnVuY3Rpb24oZm9yY2VEcmF3LCBza2lwWEF4aXMsIGZvcmNlVGlja3MpIHtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLnJlbmRlck9uSWRsZSB8fCBmb3JjZURyYXcpIHtcbiAgICAgICAgdGhpcy5kcmF3RWxlbWVudHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRyYW5zbGF0ZUVsZW1lbnRzKHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCksIHRoaXMuX2xhc3RUcmFuc2xhdGUpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd1lBeGlzKHVuZGVmaW5lZCwgIWZvcmNlVGlja3MpO1xuXG4gICAgaWYgKCFza2lwWEF4aXMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVYQXhpc0ludGVydmFsKCk7XG4gICAgICAgIHRoaXMuZHJhd1hBeGlzKHVuZGVmaW5lZCwgIWZvcmNlVGlja3MpO1xuICAgIH1cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnRyYW5zbGF0ZUVsZW1lbnRzID0gZnVuY3Rpb24odHJhbnNsYXRlLCBwcmV2aW91c1RyYW5zbGF0ZSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHR4ID0gdHJhbnNsYXRlWzBdIC0gcHJldmlvdXNUcmFuc2xhdGVbMF07XG4gICAgdmFyIHR5ID0gdHJhbnNsYXRlWzFdIC0gcHJldmlvdXNUcmFuc2xhdGVbMV07XG5cbiAgICB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdID0gdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVswXSArIHR4O1xuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV0gPSB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdICsgdHk7XG5cblxuICAgIGlmICh0aGlzLl9lbHRzVHJhbnNsYXRlQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9lbHRzVHJhbnNsYXRlQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX2VsdHNUcmFuc2xhdGVBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cih7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoJyArIHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgKyAnKSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHNlbGYuZWxlbWVudHNUcmFuc2xhdGUgIT09IHNlbGYubm9vcCkge1xuICAgICAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoJy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRzVHJhbnNsYXRlKGQzLnNlbGVjdCh0aGlzKSwgZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVYQXhpc0ludGVydmFsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmNvbHVtbldpZHRoID0gdGhpcy5zY2FsZXMueCgxKSAtIHRoaXMuc2NhbGVzLngoMCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVkgPSBmdW5jdGlvbiAodHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXI7XG4gICAgdmFyIGNsaXAgPSB0aGlzLmVsZW1lbnRzLmNsaXAuc2VsZWN0KCdyZWN0Jyk7XG4gICAgdmFyIGJvdW5kaW5nUmVjdCA9IHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcpO1xuXG4gICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgICAgICBjb250YWluZXIgPSBjb250YWluZXIudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGNsaXAgPSBjbGlwLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBib3VuZGluZ1JlY3QgPSBib3VuZGluZ1JlY3QudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfVxuXG4gICAgdmFyIGVsZW1lbnRBbW91bnQgPSB0aGlzLmRhdGEubGVuZ3RoO1xuXG4gICAgLy8gaGF2ZSAxIG1vcmUgZWxlbW50IHRvIGZvcmNlIHJlcHJlc2VudGluZyBvbmUgbW9yZSB0aWNrXG4gICAgdmFyIGVsZW1lbnRzUmFuZ2UgPSBbMCwgZWxlbWVudEFtb3VudF07XG5cbiAgICAvLyBjb21wdXRlIG5ldyBoZWlnaHRcbiAgICB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ID0gTWF0aC5taW4odGhpcy5kYXRhLmxlbmd0aCAqIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQsIHRoaXMuX21heEJvZHlIZWlnaHQpO1xuXG4gICAgLy8gY29tcHV0ZSBuZXcgWSBzY2FsZVxuICAgIHRoaXMuX3lTY2FsZSA9IHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgLyB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICogZWxlbWVudEFtb3VudDtcblxuICAgIC8vIHVwZGF0ZSBZIHNjYWxlLCBheGlzIGFuZCB6b29tIGJlaGF2aW9yXG4gICAgdGhpcy5zY2FsZXMueS5kb21haW4oZWxlbWVudHNSYW5nZSkucmFuZ2UoWzAsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHRdKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnkodGhpcy5zY2FsZXMueSkudHJhbnNsYXRlKHRoaXMuX2xhc3RUcmFuc2xhdGUpLnNjYWxlKHRoaXMuX3lTY2FsZSk7XG5cbiAgICAvLyBhbmQgdXBkYXRlIFggYXhpcyB0aWNrcyBoZWlnaHRcbiAgICB0aGlzLmF4aXNlcy54LmlubmVyVGlja1NpemUoLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgLy8gdXBkYXRlIHN2ZyBoZWlnaHRcbiAgICBjb250YWluZXIuYXR0cignaGVpZ2h0Jyx0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICsgdGhpcy5tYXJnaW4udG9wICsgdGhpcy5tYXJnaW4uYm90dG9tKTtcblxuICAgIC8vIHVwZGF0ZSBpbm5lciByZWN0IGhlaWdodFxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JykuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgYm91bmRpbmdSZWN0LmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuICAgIGNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JykuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgY2xpcC5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6cmVzaXplJywgdGhpcywgdGhpcy5jb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnN0b3BFbGVtZW50VHJhbnNpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWxlbWVudHMuaW5uZXJDb250YWluZXIuc2VsZWN0QWxsKCdnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JykudHJhbnNpdGlvbigpXG4gICAgICAgIC5zdHlsZSgnb3BhY2l0eScsICcnKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRFbnRlciA9IGZ1bmN0aW9uKHNlbGVjdGlvbikgeyByZXR1cm4gc2VsZWN0aW9uOyB9O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5lbGVtZW50VXBkYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRFeGl0ID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbkQzVGFibGUucHJvdG90eXBlLndyYXBXaXRoQW5pbWF0aW9uID0gZnVuY3Rpb24oc2VsZWN0aW9uLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICByZXR1cm4gc2VsZWN0aW9uLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pLmVhc2UodGhpcy5vcHRpb25zLnRyYW5zaXRpb25FYXNpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZWxlY3Rpb247XG4gICAgfVxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX2dldHRlciA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtwcm9wXTsgfTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLl9pc1JvdW5kID0gZnVuY3Rpb24odikge1xuICAgIHZhciBuID0gdnwwO1xuICAgIHJldHVybiB2ID4gbiAtIDFlLTMgJiYgdiA8IG4gKyAxZS0zO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX3JhbmdlID0gZnVuY3Rpb24oc3RhcnQsIGVuZCwgaW5jKSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIHdoaWxlIChzdGFydCA8IGVuZCkge1xuICAgICAgICByZXMucHVzaChzdGFydCk7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQgKyBpbmM7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59O1xuXG4vKipcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZnIvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvT2JqZXRzX2dsb2JhdXgvQXJyYXkvZmluZFxuICogQHR5cGUgeyp8RnVuY3Rpb259XG4gKiBAcHJpdmF0ZVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5fZmluZCA9IGZ1bmN0aW9uKGxpc3QsIHByZWRpY2F0ZSkge1xuICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aCA+Pj4gMDtcbiAgICB2YXIgdGhpc0FyZyA9IGxpc3Q7XG4gICAgdmFyIHZhbHVlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IGxpc3RbaV07XG4gICAgICAgIGlmIChwcmVkaWNhdGUuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaSwgbGlzdCkpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5fY2xhbXBUcmFuc2xhdGlvbldpdGhTY2FsZSA9IGZ1bmN0aW9uKHRyYW5zbGF0ZSwgc2NhbGUpIHtcblxuICAgIHNjYWxlID0gc2NhbGUgfHwgWzEsIDFdO1xuXG4gICAgaWYgKCEoc2NhbGUgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgICAgc2NhbGUgPSBbc2NhbGUsIHNjYWxlXTtcbiAgICB9XG5cbiAgICB2YXIgdHggPSB0cmFuc2xhdGVbMF07XG4gICAgdmFyIHR5ID0gdHJhbnNsYXRlWzFdO1xuICAgIHZhciBzeCA9IHNjYWxlWzBdO1xuICAgIHZhciBzeSA9IHNjYWxlWzFdO1xuXG4gICAgaWYgKHN4ID09PSAxKSB7XG4gICAgICAgIHR4ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0eCA9IE1hdGgubWluKE1hdGgubWF4KC10aGlzLmRpbWVuc2lvbnMud2lkdGggKiAoc3gtMSksIHR4KSwgMCk7XG4gICAgfVxuXG4gICAgaWYgKHN5ID09PSAxKSB7XG4gICAgICAgIHR5ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0eSA9IE1hdGgubWluKE1hdGgubWF4KC10aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICogKHN5LTEpLCB0eSksIDApO1xuICAgIH1cblxuICAgIHJldHVybiBbdHgsIHR5XTtcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNUYWJsZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMvZXZlbnRzJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5pbXBvcnQgRDNUYWJsZSBmcm9tICcuL0QzVGFibGUnO1xuXG5mdW5jdGlvbiBEM1RhYmxlTWFya2VyKG9wdGlvbnMpIHtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtEM1RhYmxlfVxuICAgICAqL1xuICAgIHRoaXMudGFibGUgPSBudWxsO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMuZWxlbWVudHMgPSB7XG4gICAgICAgIGxpbmU6IG51bGwsXG4gICAgICAgIGxhYmVsOiBudWxsXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcblxuICAgIHRoaXMudmFsdWUgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RUaW1lVXBkYXRlZCA9IG51bGw7XG59XG5cbmluaGVyaXRzKEQzVGFibGVNYXJrZXIsIEV2ZW50RW1pdHRlcik7XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLkxBWU9VVF9IT1JJWk9OVEFMID0gJ2hvcml6b250YWwnO1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX1ZFUlRJQ0FMID0gJ3ZlcnRpY2FsJztcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZGVmYXVsdHMgPSB7XG4gICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7IHJldHVybiBkOyB9LFxuICAgIG91dGVyVGlja1NpemU6IDEwLFxuICAgIHRpY2tQYWRkaW5nOiAxMCxcbiAgICByb3VuZFBvc2l0aW9uOiBmYWxzZSxcbiAgICBiZW1CbG9ja05hbWU6ICd0YWJsZU1hcmtlcicsXG4gICAgYmVtTW9kaWZpZXI6ICcnLFxuICAgIGxheW91dDogRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX1ZFUlRJQ0FMXG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0QzVGFibGV9IHRhYmxlXG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNldFRhYmxlID0gZnVuY3Rpb24odGFibGUpIHtcblxuICAgIHZhciBwcmV2aW91c1RhYmxlID0gdGhpcy50YWJsZTtcblxuICAgIHRoaXMudGFibGUgPSB0YWJsZSAmJiB0YWJsZSBpbnN0YW5jZW9mIEQzVGFibGUgPyB0YWJsZSA6IG51bGw7XG5cbiAgICBpZiAodGhpcy50YWJsZSkge1xuICAgICAgICBpZiAocHJldmlvdXNUYWJsZSAhPT0gdGhpcy50YWJsZSkge1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzVGFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVuYmluZFRhYmxlKHByZXZpb3VzVGFibGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5iaW5kVGFibGUoKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXRoaXMudGFibGUgJiYgcHJldmlvdXNUYWJsZSkge1xuICAgICAgICB0aGlzLnVuYmluZFRhYmxlKHByZXZpb3VzVGFibGUpO1xuICAgIH1cblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUudmFsdWVDb21wYXJhdG9yID0gZnVuY3Rpb24odGltZUEsIHRpbWVCKSB7XG4gICAgcmV0dXJuICt0aW1lQSAhPT0gK3RpbWVCO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuc2V0VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXG4gICAgdmFyIHByZXZpb3VzVGltZVVwZGF0ZWQgPSB0aGlzLl9sYXN0VGltZVVwZGF0ZWQ7XG5cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy52YWx1ZUNvbXBhcmF0b3IocHJldmlvdXNUaW1lVXBkYXRlZCwgdGhpcy52YWx1ZSkgJiYgdGhpcy50YWJsZSAmJiB0aGlzLmNvbnRhaW5lcikge1xuXG4gICAgICAgIHRoaXMuX2xhc3RUaW1lVXBkYXRlZCA9IHRoaXMudmFsdWU7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJcbiAgICAgICAgICAgIC5kYXR1bSh7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm1vdmUoKTtcbiAgICB9XG5cbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBkYXRhLnZhbHVlO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuYmluZFRhYmxlID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMudGFibGUuY29udGFpbmVyXG4gICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAuZGF0dW0oe1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMudmFsdWVcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICh0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXIgPyAnICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgdGhpcy5vcHRpb25zLmJlbU1vZGlmaWVyIDogJycpICsgJyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctLScgKyB0aGlzLm9wdGlvbnMubGF5b3V0KTtcblxuICAgIHRoaXMuZWxlbWVudHMubGluZSA9IHRoaXMuY29udGFpbmVyXG4gICAgICAgIC5hcHBlbmQoJ2xpbmUnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1saW5lJylcbiAgICAgICAgLnN0eWxlKCdwb2ludGVyLWV2ZW50cycsICdub25lJyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmxhYmVsID0gdGhpcy5jb250YWluZXJcbiAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxhYmVsJyk7XG5cbiAgICB0aGlzLnNpemVMaW5lQW5kTGFiZWwoKTtcblxuICAgIC8vIG9uIHRhYmxlIG1vdmUsIG1vdmUgdGhlIG1hcmtlclxuICAgIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyID0gdGhpcy5tb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJywgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIpO1xuXG4gICAgLy8gb24gdGFibGUgcmVzaXplLCByZXNpemUgdGhlIG1hcmtlciBhbmQgbW92ZSBpdFxuICAgIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICAgICAgc2VsZi5yZXNpemUodHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgc2VsZi5tb3ZlKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIpO1xuXG4gICAgdGhpcy5lbWl0KCdtYXJrZXI6Ym91bmQnKTtcblxuICAgIHRoaXMubW92ZSgpO1xuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zaXplTGluZUFuZExhYmVsID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgbGF5b3V0ID0gdGhpcy5vcHRpb25zLmxheW91dDtcblxuICAgIHZhciBsaW5lID0gdGhpcy5lbGVtZW50cy5saW5lO1xuICAgIHZhciBsYWJlbCA9IHRoaXMuZWxlbWVudHMubGFiZWw7XG5cbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICBsaW5lID0gbGluZS50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgbGFiZWwgPSBsYWJlbC50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBzd2l0Y2gobGF5b3V0KSB7XG4gICAgICAgIGNhc2UgdGhpcy5MQVlPVVRfVkVSVElDQUw6XG4gICAgICAgICAgICBsaW5lXG4gICAgICAgICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICB5MTogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgICAgICAgICB5MjogdGhpcy50YWJsZS5kaW1lbnNpb25zLmhlaWdodFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgICAgICAuYXR0cignZHknLCAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUtdGhpcy5vcHRpb25zLnRpY2tQYWRkaW5nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRoaXMuTEFZT1VUX0hPUklaT05UQUw6XG4gICAgICAgICAgICBsaW5lXG4gICAgICAgICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICB4MTogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgICAgICAgICB4MjogdGhpcy50YWJsZS5kaW1lbnNpb25zLndpZHRoXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgICAgIC5hdHRyKCdkeCcsIC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZS10aGlzLm9wdGlvbnMudGlja1BhZGRpbmcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2R5JywgNCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnVuYmluZFRhYmxlID0gZnVuY3Rpb24ocHJldmlvdXNUYWJsZSkge1xuXG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJywgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6cmVzaXplJywgdGhpcy5fdGFibGVSZXNpemVMaXN0ZW5lcik7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgcHJldmlvdXNUYWJsZS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9tb3ZlQUYpO1xuICAgICAgICB0aGlzLl9tb3ZlQUYgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLmVtaXQoJ21hcmtlcjp1bmJvdW5kJywgcHJldmlvdXNUYWJsZSk7XG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGxheW91dCA9IHRoaXMub3B0aW9ucy5sYXlvdXQ7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHRoaXMudGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSB0aGlzLnRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICBzZWxmLmNvbnRhaW5lclxuICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oZCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gc2VsZi5nZXRWYWx1ZShkKTtcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBzY2FsZSwgcG9zaXRpb24gPSBbMCwgMF0sIHBvc2l0aW9uSW5kZXg7XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2gobGF5b3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5MQVlPVVRfVkVSVElDQUw6XG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZSA9IHNlbGYudGFibGUuc2NhbGVzLng7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHNlbGYuTEFZT1VUX0hPUklaT05UQUw6XG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZSA9IHNlbGYudGFibGUuc2NhbGVzLnk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkluZGV4ID0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwb3NpdGlvbltwb3NpdGlvbkluZGV4XSA9IHNjYWxlKHZhbHVlKTtcblxuICAgICAgICAgICAgICAgIHZhciByYW5nZSA9IHNjYWxlLnJhbmdlKCk7XG4gICAgICAgICAgICAgICAgdmFyIGlzSW5SYW5nZSA9IHBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdID49IHJhbmdlWzBdICYmIHBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdIDw9IHJhbmdlW3JhbmdlLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgICAgICAgICAgdmFyIGcgPSBkMy5zZWxlY3QodGhpcyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNJblJhbmdlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrKHNlbGYudGFibGUubWFyZ2luLmxlZnQgKyBwb3NpdGlvblswXSA+PiAwKSsnLCcrKHNlbGYudGFibGUubWFyZ2luLnRvcCArIHBvc2l0aW9uWzFdID4+IDApKycpJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZy5zZWxlY3QoJy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctbGFiZWwnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoc2VsZi5vcHRpb25zLmZvcm1hdHRlcih2YWx1ZSkpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUoJ2Rpc3BsYXknLCAnJyk7XG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUoJ2Rpc3BsYXknLCAnbm9uZScpO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB0aGlzLnNpemVMaW5lQW5kTGFiZWwodHJhbnNpdGlvbkR1cmF0aW9uKTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RhYmxlTWFya2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlTWFya2VyIGZyb20gJy4vRDNUYWJsZU1hcmtlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqXG4gKiBAZXh0ZW5kcyB7RDNUYWJsZU1hcmtlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RhYmxlTW91c2VUcmFja2VyKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlTWFya2VyLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl90YWJsZU1vdXNlZW50ZXJMaXN0ZW5lciA9IG51bGw7XG4gICAgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lciA9IG51bGw7XG4gICAgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcblxuICAgIHRoaXMub24oJ21hcmtlcjpib3VuZCcsIHRoaXMuaGFuZGxlVGFibGVCb3VuZC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLm9uKCdtYXJrZXI6dW5ib3VuZCcsIHRoaXMuaGFuZGxlVGFibGVVbmJvdW5kLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzID0gZmFsc2U7XG59XG5cbmluaGVyaXRzKEQzVGFibGVNb3VzZVRyYWNrZXIsIEQzVGFibGVNYXJrZXIpO1xuXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1Nb2RpZmllcjogJy0tbW91c2VUcmFja2VyJyxcbiAgICBsaXN0ZW5Ub1RvdWNoRXZlbnRzOiB0cnVlXG59KTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlVGFibGVCb3VuZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIgPSB0aGlzLmhhbmRsZU1vdXNlZW50ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyID0gdGhpcy5oYW5kbGVNb3VzZW1vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl90YWJsZU1vdXNlbGVhdmVMaXN0ZW5lciA9IHRoaXMuaGFuZGxlTW91c2VsZWF2ZS5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWVudGVyJywgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIpO1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2Vtb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWxlYXZlJywgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5saXN0ZW5Ub1RvdWNoRXZlbnRzKSB7XG4gICAgICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IHRydWU7XG4gICAgICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6dG91Y2htb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzID0gZmFsc2U7XG4gICAgfVxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlVGFibGVVbmJvdW5kID0gZnVuY3Rpb24ocHJldmlvdXNUYWJsZSkge1xuXG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWVudGVyJywgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIodGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2Vtb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWxlYXZlJywgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIpO1xuXG4gICAgaWYgKHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cykge1xuICAgICAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnRvdWNobW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIH1cblxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuZ2V0VmFsdWVGcm9tVGFibGVFdmVudCA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuICAgIHN3aXRjaCAodGhpcy5vcHRpb25zLmxheW91dCkge1xuICAgICAgICBjYXNlICd2ZXJ0aWNhbCc6XG4gICAgICAgICAgICByZXR1cm4gZ2V0VGltZSgpO1xuICAgICAgICBjYXNlICdob3Jpem9udGFsJzpcbiAgICAgICAgICAgIHJldHVybiBnZXRSb3coKTtcbiAgICB9XG59O1xuXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVNb3VzZWVudGVyID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgdGltZSA9IHRoaXMuZ2V0VmFsdWVGcm9tVGFibGVFdmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNob3coKTtcbiAgICAgICAgc2VsZi5zZXRWYWx1ZSh0aW1lKTtcbiAgICB9KTtcblxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2Vtb3ZlID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHRpbWUgPSB0aGlzLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSB0YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuc2V0VmFsdWUodGltZSk7XG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZU1vdXNlbGVhdmUgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICB9KTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RhYmxlTW91c2VUcmFja2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlTWFya2VyIGZyb20gJy4vRDNUYWJsZU1hcmtlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqXG4gKiBAZXh0ZW5kcyB7RDNUYWJsZU1hcmtlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RhYmxlVmFsdWVUcmFja2VyKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlTWFya2VyLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZVZhbHVlVHJhY2tlciwgRDNUYWJsZU1hcmtlcik7XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbU1vZGlmaWVyOiAnLS12YWx1ZVRyYWNrZXInXG59KTtcblxuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUudmFsdWVHZXR0ZXIgPSBmdW5jdGlvbigpIHtcblxuICAgcmV0dXJuIDA7XG5cbn07XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG4gICAgZDMudGltZXIoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgc2VsZi5zZXRWYWx1ZShzZWxmLnRpbWVHZXR0ZXIoKSk7XG5cbiAgICAgICAgcmV0dXJuICFzZWxmLmVuYWJsZWQ7XG5cbiAgICB9KTtcbn07XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVWYWx1ZVRyYWNrZXI7XG4iLCIvKiBnbG9iYWwgY2FuY2VsQW5pbWF0aW9uRnJhbWUsIHJlcXVlc3RBbmltYXRpb25GcmFtZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBEM0Jsb2NrVGFibGUgZnJvbSAnLi9EM0Jsb2NrVGFibGUnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcblxuLyoqXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RpbWVsaW5lKG9wdGlvbnMpIHtcblxuICAgIEQzQmxvY2tUYWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5jdXJyZW50VGltZUludGVydmFsID0gdGhpcy5vcHRpb25zLm1pbmltdW1UaW1lSW50ZXJ2YWw7XG59XG5cbmluaGVyaXRzKEQzVGltZWxpbmUsIEQzQmxvY2tUYWJsZSk7XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM0Jsb2NrVGFibGUucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtQmxvY2tOYW1lOiAndGltZWxpbmUnLFxuICAgIGJlbUJsb2NrTW9kaWZpZXI6ICcnLFxuICAgIHhBeGlzVGlja3NGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQuZ2V0TWludXRlcygpICUgMTUgPyAnJyA6IGQzLnRpbWUuZm9ybWF0KCclSDolTScpKGQpO1xuICAgIH0sXG4gICAgeEF4aXNTdHJva2VXaWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZC5nZXRNaW51dGVzKCkgJTMwID8gMSA6IDI7XG4gICAgfSxcbiAgICBtaW5pbXVtQ29sdW1uV2lkdGg6IDMwLFxuICAgIG1pbmltdW1UaW1lSW50ZXJ2YWw6IDNlNSxcbiAgICBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzOiBbIDZlNCwgM2U1LCA5ZTUsIDEuOGU2LCAzLjZlNiwgNy4yZTYsIDEuNDRlNywgMi44OGU3LCA0LjMyZTcsIDguNjRlNyBdXG59KTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUueFNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy50aW1lLnNjYWxlKCk7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS55U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpO1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuZ2V0RGF0YVN0YXJ0ID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLnN0YXJ0O1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuZ2V0RGF0YUVuZCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5lbmQ7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVJbnRlcnZhbCkge1xuICAgIHJldHVybiB0aGlzLnNjYWxlcy54KG5ldyBEYXRlKHRpbWVJbnRlcnZhbCkpIC0gdGhpcy5zY2FsZXMueChuZXcgRGF0ZSgwKSk7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS51cGRhdGVYQXhpc0ludGVydmFsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgbWluaW11bVRpbWVJbnRlcnZhbCA9IHRoaXMub3B0aW9ucy5taW5pbXVtVGltZUludGVydmFsO1xuICAgIHZhciBtaW5pbXVtQ29sdW1uV2lkdGggPSB0aGlzLm9wdGlvbnMubWluaW11bUNvbHVtbldpZHRoO1xuICAgIHZhciBjdXJyZW50VGltZUludGVydmFsID0gdGhpcy5jdXJyZW50VGltZUludGVydmFsO1xuICAgIHZhciBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzID0gdGhpcy5vcHRpb25zLmF2YWlsYWJsZVRpbWVJbnRlcnZhbHM7XG4gICAgdmFyIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCA9IGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMuaW5kZXhPZihjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB2YXIgY3VycmVudENvbHVtbldpZHRoID0gdGhpcy5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbChjdXJyZW50VGltZUludGVydmFsKTtcblxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbChkZWx0YSkge1xuICAgICAgICBjdXJyZW50VGltZUludGVydmFsSW5kZXggKz0gZGVsdGE7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzW2N1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleF07XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgfVxuXG4gICAgaWYgKGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoY3VycmVudENvbHVtbldpZHRoIDwgbWluaW11bUNvbHVtbldpZHRoKSB7XG4gICAgICAgICAgICB3aGlsZShjdXJyZW50Q29sdW1uV2lkdGggPCBtaW5pbXVtQ29sdW1uV2lkdGggJiYgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4IDwgYXZhaWxhYmxlVGltZUludGVydmFscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlVGltZUludGVydmFsKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRDb2x1bW5XaWR0aCA+IG1pbmltdW1Db2x1bW5XaWR0aCkge1xuICAgICAgICAgICAgd2hpbGUoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoICYmIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJhbnNsYXRlVGltZUludGVydmFsKDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRUaW1lSW50ZXJ2YWwgPCBtaW5pbXVtVGltZUludGVydmFsKSB7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBtaW5pbXVtVGltZUludGVydmFsO1xuICAgICAgICBjdXJyZW50Q29sdW1uV2lkdGggPSBzZWxmLl9jb21wdXRlQ29sdW1uV2lkdGhGcm9tVGltZUludGVydmFsKGN1cnJlbnRUaW1lSW50ZXJ2YWwpXG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50VGltZUludGVydmFsID0gTWF0aC5mbG9vcihjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB0aGlzLmNvbHVtbldpZHRoID0gTWF0aC5mbG9vcihjdXJyZW50Q29sdW1uV2lkdGgpO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA+IDMuNmU2KSB7XG4gICAgICAgIHRoaXMuYXhpc2VzLngudGlja3MoZDMudGltZS5ob3VycywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gMy42ZTYgKTtcbiAgICAgICAgdGhpcy5heGlzZXMueDIudGlja3MoZDMudGltZS5ob3VycywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gMy42ZTYgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gNmU0KSB7XG4gICAgICAgIHRoaXMuYXhpc2VzLngudGlja3MoZDMudGltZS5taW51dGVzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyA2ZTQgKTtcbiAgICAgICAgdGhpcy5heGlzZXMueDIudGlja3MoZDMudGltZS5taW51dGVzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyA2ZTQgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gMWUzKSB7XG4gICAgICAgIHRoaXMuYXhpc2VzLngudGlja3MoZDMudGltZS5zZWNvbmRzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAxZTMgKTtcbiAgICAgICAgdGhpcy5heGlzZXMueDIudGlja3MoZDMudGltZS5zZWNvbmRzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAxZTMgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLnNldFRpbWVSYW5nZSA9IGZ1bmN0aW9uKG1pbkRhdGUsIG1heERhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRYUmFuZ2UobWluRGF0ZSwgbWF4RGF0ZSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEM1RpbWVsaW5lO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlVmFsdWVUcmFja2VyIGZyb20gJy4vRDNUYWJsZVZhbHVlVHJhY2tlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqXG4gKiBAZXh0ZW5kcyB7RDNUYWJsZVZhbHVlVHJhY2tlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RpbWVsaW5lVGltZVRyYWNrZXIob3B0aW9ucykge1xuICAgIEQzVGFibGVWYWx1ZVRyYWNrZXIuY2FsbCh0aGlzLCBvcHRpb25zKTtcbn1cblxuaW5oZXJpdHMoRDNUaW1lbGluZVRpbWVUcmFja2VyLCBEM1RhYmxlVmFsdWVUcmFja2VyKTtcblxuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1CbG9ja05hbWU6ICd0aW1lbGluZU1hcmtlcicsXG4gICAgYmVtTW9kaWZpZXI6ICctLXRpbWVUcmFja2VyJyxcbiAgICBsYXlvdXQ6ICd2ZXJ0aWNhbCdcbn0pO1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnRpbWVHZXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudGltZUNvbXBhcmF0b3IgPSBmdW5jdGlvbihhLGIpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZUNvbXBhcmF0b3IoYSxiKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUuc2V0VGltZSA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aW1lKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUuc2V0VGltZWxpbmUgPSBmdW5jdGlvbih0aW1lbGluZSkge1xuICAgIHJldHVybiB0aGlzLnNldFRhYmxlKHRpbWVsaW5lKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudmFsdWVHZXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50aW1lR2V0dGVyKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGltZWxpbmVUaW1lVHJhY2tlcjtcbiJdfQ==
(1)
});
;