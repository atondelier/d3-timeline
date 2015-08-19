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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9pbmRleC5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL3NyYy9EM0Jsb2NrVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzNELE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOzs7QUNSakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBLFlBQVksQ0FBQzs7Ozs7Ozs7dUJBRU8sV0FBVzs7Ozt3QkFDVixVQUFVOzs7O3NCQUNaLFFBQVE7Ozs7Ozs7Ozs7QUFPM0IsU0FBUyxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQzNCLHlCQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDL0I7O0FBRUQsMkJBQVMsWUFBWSx1QkFBVSxDQUFDOztBQUVoQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyx5QkFBTyxJQUFJLEVBQUUsRUFBRSxFQUFFLHFCQUFRLFNB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QUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ3JELFdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM5QixDQUFDOztBQUVGLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBUyxRQUFRLEVBQUU7QUFDN0QsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ2xDLENBQUM7O0FBRUYscUJBQXFCLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxZQUFXO0FBQ3JELFdBQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0NBQzVCLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzLkQzVGFibGUgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM0Jsb2NrVGFibGUgPSByZXF1aXJlKCcuL3NyYy9EM0Jsb2NrVGFibGUuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGltZWxpbmUgPSByZXF1aXJlKCcuL3NyYy9EM1RpbWVsaW5lLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlTWFya2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZU1hcmtlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZU1vdXNlVHJhY2tlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGFibGVWYWx1ZVRyYWNrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlVmFsdWVUcmFja2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RpbWVsaW5lVGltZVRyYWNrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RpbWVsaW5lVGltZVRyYWNrZXIuanMnKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIGlzQXJyYXkoYXJyKSB7XG5cdGlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGFycik7XG5cdH1cblxuXHRyZXR1cm4gdG9TdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRpZiAoIW9iaiB8fCB0b1N0ci5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGhhc093bkNvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc0lzUHJvdG90eXBlT2YgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc093bkNvbnN0cnVjdG9yICYmICFoYXNJc1Byb3RvdHlwZU9mKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gT3duIHByb3BlcnRpZXMgYXJlIGVudW1lcmF0ZWQgZmlyc3RseSwgc28gdG8gc3BlZWQgdXAsXG5cdC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBvYmopIHsvKiovfVxuXG5cdHJldHVybiB0eXBlb2Yga2V5ID09PSAndW5kZWZpbmVkJyB8fCBoYXNPd24uY2FsbChvYmosIGtleSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCgpIHtcblx0dmFyIG9wdGlvbnMsIG5hbWUsIHNyYywgY29weSwgY29weUlzQXJyYXksIGNsb25lLFxuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1swXSxcblx0XHRpID0gMSxcblx0XHRsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuXHRcdGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH0gZWxzZSBpZiAoKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnICYmIHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicpIHx8IHRhcmdldCA9PSBudWxsKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdH1cblxuXHRmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1tpXTtcblx0XHQvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG5cdFx0aWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuXHRcdFx0Ly8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuXHRcdFx0Zm9yIChuYW1lIGluIG9wdGlvbnMpIHtcblx0XHRcdFx0c3JjID0gdGFyZ2V0W25hbWVdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG5cdFx0XHRcdGlmICh0YXJnZXQgIT09IGNvcHkpIHtcblx0XHRcdFx0XHQvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBhcnJheXNcblx0XHRcdFx0XHRpZiAoZGVlcCAmJiBjb3B5ICYmIChpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IGlzQXJyYXkoY29weSkpKSkge1xuXHRcdFx0XHRcdFx0aWYgKGNvcHlJc0FycmF5KSB7XG5cdFx0XHRcdFx0XHRcdGNvcHlJc0FycmF5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIE5ldmVyIG1vdmUgb3JpZ2luYWwgb2JqZWN0cywgY2xvbmUgdGhlbVxuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gZXh0ZW5kKGRlZXAsIGNsb25lLCBjb3B5KTtcblxuXHRcdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb3B5ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gY29weTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGUgZnJvbSAnLi9EM1RhYmxlJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbi8qKlxuICpcbiAqIEBleHRlbmRzIHtEM1RhYmxlfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzQmxvY2tUYWJsZShvcHRpb25zKSB7XG4gICAgRDNUYWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xufVxuXG5pbmhlcml0cyhEM0Jsb2NrVGFibGUsIEQzVGFibGUpO1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGNsaXBFbGVtZW50OiB0cnVlLFxuICAgIGNsaXBFbGVtZW50RmlsdGVyOiBudWxsLFxuICAgIHJlbmRlck9uQXV0b21hdGljU2Nyb2xsSWRsZTogdHJ1ZSxcbiAgICBoaWRlVGlja3NPbkF1dG9tYXRpY1Njcm9sbDogZmFsc2UsXG4gICAgYXV0b21hdGljU2Nyb2xsU3BlZWRNdWx0aXBsaWVyOiAyZS00LFxuICAgIGF1dG9tYXRpY1Njcm9sbE1hcmdpbkRlbHRhOiAzMCxcbiAgICBhcHBlbmRUZXh0OiB0cnVlLFxuICAgIGFsaWduTGVmdDogdHJ1ZSxcbiAgICBhbGlnbk9uVHJhbnNsYXRlOiB0cnVlLFxuICAgIG1heGltdW1DbGlja0RyYWdUaW1lOiAxMDAsXG4gICAgbWF4aW11bUNsaWNrRHJhZ0Rpc3RhbmNlOiAxMixcbiAgICBtaW5pbXVtRHJhZ0Rpc3RhbmNlOiA1XG59KTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBQYXRoSWQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRDbGlwUGF0aF8nICsgdGhpcy5pbnN0YW5jZU51bWJlciArICdfJyArIGQudWlkO1xufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBSZWN0TGluayA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gJyMnICsgdGhpcy5nZW5lcmF0ZUNsaXBSZWN0SWQoZCk7XG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFBhdGhMaW5rID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiAndXJsKCMnICsgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoSWQoZCkgKyAnKSc7XG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFJlY3RJZCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENsaXBSZWN0XycgKyB0aGlzLmluc3RhbmNlTnVtYmVyICsgJ18nICsgZC51aWQ7XG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRFbnRlciA9IGZ1bmN0aW9uKHNlbGVjdGlvbikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGVsZW1lbnRIZWlnaHQgPSB0aGlzLm9wdGlvbnMucm93SGVpZ2h0IC0gdGhpcy5vcHRpb25zLnJvd1BhZGRpbmcgKiAyO1xuXG4gICAgdmFyIHJlY3QgPSBzZWxlY3Rpb25cbiAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRCYWNrZ3JvdW5kJylcbiAgICAgICAgLmF0dHIoJ2hlaWdodCcsIGVsZW1lbnRIZWlnaHQpO1xuXG4gICAgdmFyIGcgPSBzZWxlY3Rpb25cbiAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRDb250ZW50Jyk7XG5cbiAgICBnLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpO1xuXG5cbiAgICB2YXIgY2xpcEVsZW1lbnQgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xpcEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuY2xpcEVsZW1lbnRGaWx0ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNsaXBFbGVtZW50ID0gISF0aGlzLm9wdGlvbnMuY2xpcEVsZW1lbnRGaWx0ZXIuY2FsbCh0aGlzLCBzZWxlY3Rpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xpcEVsZW1lbnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNsaXBFbGVtZW50KSB7XG5cbiAgICAgICAgZ1xuICAgICAgICAgICAgLmF0dHIoJ2NsaXAtcGF0aCcsIHRoaXMuZ2VuZXJhdGVDbGlwUGF0aExpbmsuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgcmVjdFxuICAgICAgICAgICAgLnByb3BlcnR5KCdpZCcsIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdElkLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHNlbGVjdGlvbi5hcHBlbmQoJ2NsaXBQYXRoJylcbiAgICAgICAgICAgIC5wcm9wZXJ0eSgnaWQnLCB0aGlzLmdlbmVyYXRlQ2xpcFBhdGhJZC5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLmFwcGVuZCgndXNlJylcbiAgICAgICAgICAgIC5hdHRyKCd4bGluazpocmVmJywgdGhpcy5nZW5lcmF0ZUNsaXBSZWN0TGluay5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBzZWxlY3Rpb24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZCkge1xuICAgICAgICBpZiAoIWQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6Y2xpY2snLCBzZWxlY3Rpb24sIG51bGwsIFtkXSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kVGV4dCkge1xuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy50aW1lbGluZS1lbGVtZW50TW92YWJsZUNvbnRlbnQnKVxuICAgICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAuY2xhc3NlZCgndGltZWxpbmUtZW50aXR5TGFiZWwnLCB0cnVlKVxuICAgICAgICAgICAgLmF0dHIoJ2R5JywgdGhpcy5vcHRpb25zLnJvd0hlaWdodC8yICsgNCk7XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uLmNhbGwodGhpcy5lbGVtZW50Q29udGVudEVudGVyLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5iaW5kRHJhZ0FuZERyb3BPblNlbGVjdGlvbihzZWxlY3Rpb24pO1xuXG59O1xuXG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudHNUcmFuc2xhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kVGV4dCAmJiB0aGlzLm9wdGlvbnMuYWxpZ25MZWZ0ICYmIHRoaXMub3B0aW9ucy5hbGlnbk9uVHJhbnNsYXRlICYmICFkLl9kZWZhdWx0UHJldmVudGVkKSB7XG5cbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpXG4gICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyBNYXRoLm1heCgtc2VsZi5zY2FsZXMueChzZWxmLmdldERhdGFTdGFydChkKSksIDIpICsgJywwKSdcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50Q29udGVudEVudGVyID0gZnVuY3Rpb24oKSB7fTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50Q29udGVudFVwZGF0ZSA9IGZ1bmN0aW9uKCkge307XG5cblxuLy8gQHRvZG8gY2xlYW4gdXBcbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuYmluZERyYWdBbmREcm9wT25TZWxlY3Rpb24gPSBmdW5jdGlvbihzZWxlY3Rpb24pIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYm9keU5vZGUgPSBzZWxmLmVsZW1lbnRzLmJvZHkubm9kZSgpO1xuICAgIHZhciBkcmFnU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgLy8gcG9zaXRpb25zXG4gICAgdmFyIGN1cnJlbnRUcmFuc2Zvcm0gPSBudWxsO1xuICAgIHZhciBvcmlnaW5UcmFuc2Zvcm1TdHJpbmcgPSBudWxsO1xuICAgIHZhciBkcmFnU3RhcnRYID0gMCwgZHJhZ1N0YXJ0WSA9IDA7XG4gICAgdmFyIGVsZW1lbnRTdGFydFggPSAwLCBlbGVtZW50U3RhcnRZID0gMDtcbiAgICB2YXIgZHJhZ1Bvc2l0aW9uO1xuICAgIHZhciBzdGFydERyYWdQb3NpdGlvbjtcblxuICAgIC8vIG1vdmVtZW50c1xuICAgIHZhciB2ZXJ0aWNhbE1vdmUgPSAwO1xuICAgIHZhciBob3Jpem9udGFsTW92ZSA9IDA7XG4gICAgdmFyIHZlcnRpY2FsU3BlZWQgPSAwO1xuICAgIHZhciBob3Jpem9udGFsU3BlZWQgPSAwO1xuICAgIHZhciB0aW1lckFjdGl2ZSA9IGZhbHNlO1xuICAgIHZhciBuZWVkVGltZXJTdG9wID0gZmFsc2U7XG4gICAgdmFyIHN0YXJ0VGltZTtcblxuICAgIC8vIHJlc2V0IHN0YXJ0IHBvc2l0aW9uOiB0byBjYWxsIG9uIGRyYWcgc3RhcnQgb3Igd2hlbiB0aGluZ3MgYXJlIHJlZHJhd25cbiAgICBmdW5jdGlvbiBzdG9yZVN0YXJ0KCkge1xuICAgICAgICBjdXJyZW50VHJhbnNmb3JtID0gZDMudHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybVN0cmluZyA9IHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nKSk7XG4gICAgICAgIGVsZW1lbnRTdGFydFggPSBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVswXTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WSA9IGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdO1xuICAgICAgICBkcmFnU3RhcnRYID0gZHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICBkcmFnU3RhcnRZID0gZHJhZ1Bvc2l0aW9uWzFdO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBuZXcgZHJhZyBwb3NpdGlvbiBhbmQgbW92ZSB0aGUgZWxlbWVudFxuICAgIGZ1bmN0aW9uIHVwZGF0ZVRyYW5zZm9ybShmb3JjZURyYXcpIHtcblxuICAgICAgICB2YXIgZGVsdGFYID0gZHJhZ1Bvc2l0aW9uWzBdIC0gZHJhZ1N0YXJ0WDtcbiAgICAgICAgdmFyIGRlbHRhWSA9IGRyYWdQb3NpdGlvblsxXSAtIGRyYWdTdGFydFk7XG5cbiAgICAgICAgaWYgKGZvcmNlRHJhdyB8fCAhc2VsZi5vcHRpb25zLnJlbmRlck9uSWRsZSkge1xuICAgICAgICAgICAgc3RvcmVTdGFydChkcmFnUG9zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMF0gPSBlbGVtZW50U3RhcnRYICsgZGVsdGFYO1xuICAgICAgICBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXSA9IGVsZW1lbnRTdGFydFkgKyBkZWx0YVk7XG5cbiAgICAgICAgc2VsZWN0aW9uLmF0dHIoJ3RyYW5zZm9ybScsIGN1cnJlbnRUcmFuc2Zvcm0udG9TdHJpbmcoKSk7XG5cbiAgICB9XG5cbiAgICAvLyB0YWtlIG1pY3JvIHNlY29uZHMgaWYgcG9zc2libGVcbiAgICB2YXIgZ2V0UHJlY2lzZVRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2UgJiYgdHlwZW9mIHBlcmZvcm1hbmNlLm5vdyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIHBlcmZvcm1hbmNlLm5vdy5iaW5kKHBlcmZvcm1hbmNlKVxuICAgICAgICA6IHR5cGVvZiBEYXRlLm5vdyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICBEYXRlLm5vdy5iaW5kKERhdGUpXG4gICAgICAgICAgICA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiArKG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgfTtcblxuICAgIC8vIGhhbmRsZSBhdXRvbWF0aWMgc2Nyb2xsIGFyZ3VtZW50c1xuICAgIGZ1bmN0aW9uIGRvQXV0b21hdGljU2Nyb2xsKHRpbWVEZWx0YSwgZm9yY2VEcmF3KSB7XG5cbiAgICAgICAgLy8gY29tcHV0ZSBkZWx0YXMgYmFzZWQgb24gZGlyZWN0aW9uLCBzcGVlZCBhbmQgdGltZSBkZWx0YVxuICAgICAgICB2YXIgc3BlZWRNdWx0aXBsaWVyID0gc2VsZi5vcHRpb25zLmF1dG9tYXRpY1Njcm9sbFNwZWVkTXVsdGlwbGllcjtcbiAgICAgICAgdmFyIGRlbHRhWCA9IGhvcml6b250YWxNb3ZlICogaG9yaXpvbnRhbFNwZWVkICogdGltZURlbHRhICogc3BlZWRNdWx0aXBsaWVyO1xuICAgICAgICB2YXIgZGVsdGFZID0gdmVydGljYWxNb3ZlICogdmVydGljYWxTcGVlZCAqIHRpbWVEZWx0YSAqIHNwZWVkTXVsdGlwbGllcjtcblxuICAgICAgICAvLyB0YWtlIGdyb3VwIHRyYW5zbGF0ZSBjYW5jZWxsYXRpb24gd2l0aCBmb3JjZWQgcmVkcmF3IGludG8gYWNjb3VudCwgc28gcmVkZWZpbmUgc3RhcnRcbiAgICAgICAgaWYgKGZvcmNlRHJhdykge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZS5zbGljZSgwKTtcbiAgICAgICAgICAgIGVsZW1lbnRTdGFydFggKz0gY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMF07XG4gICAgICAgICAgICBlbGVtZW50U3RhcnRZICs9IGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlYWxNb3ZlID0gc2VsZi5tb3ZlKGRlbHRhWCwgZGVsdGFZLCBmb3JjZURyYXcsIGZhbHNlLCAhc2VsZi5vcHRpb25zLmhpZGVUaWNrc09uQXV0b21hdGljU2Nyb2xsKTtcblxuICAgICAgICBpZiAocmVhbE1vdmVbMl0gfHwgcmVhbE1vdmVbM10pIHtcbiAgICAgICAgICAgIHVwZGF0ZVRyYW5zZm9ybShmb3JjZURyYXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudFN0YXJ0WCAtPSByZWFsTW92ZVsyXTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WSAtPSByZWFsTW92ZVszXTtcblxuICAgICAgICBuZWVkVGltZXJTdG9wID0gcmVhbE1vdmVbMl0gPT09IDAgJiYgcmVhbE1vdmVbM10gPT09IDA7XG4gICAgfVxuXG5cbiAgICB2YXIgZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKVxuICAgICAgICAub24oJ2RyYWdzdGFydCcsIGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0YXJ0RHJhZ1Bvc2l0aW9uID0gZHJhZ1Bvc2l0aW9uID0gZDMubW91c2UoYm9keU5vZGUpO1xuXG4gICAgICAgICAgICBzdGFydFRpbWUgPSArbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgc3RvcmVTdGFydCgpO1xuXG4gICAgICAgICAgICBkYXRhLl9kZWZhdWx0UHJldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYuX2Zyb3plblVpZHMucHVzaChkYXRhLnVpZCk7XG5cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdkcmFnJywgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICB2YXIgdGltZURlbHRhID0gK25ldyBEYXRlKCkgLSBzdGFydFRpbWU7XG5cbiAgICAgICAgICAgIGlmICghZHJhZ1N0YXJ0ZWQgJiYgKHRpbWVEZWx0YSA+IHNlbGYub3B0aW9ucy5tYXhpbXVtQ2xpY2tEcmFnVGltZSkpIHtcbiAgICAgICAgICAgICAgICBkcmFnU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnc3RhcnQnLCBzZWxlY3Rpb24sIG51bGwsIFtkYXRhXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkcmFnU3RhcnRlZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6ZHJhZycsIHNlbGVjdGlvbiwgbnVsbCwgW2RhdGFdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZHJhZ1Bvc2l0aW9uID0gZDMubW91c2UoYm9keU5vZGUpO1xuXG4gICAgICAgICAgICB2YXIgbWFyZ2luRGVsdGEgPSBzZWxmLm9wdGlvbnMuYXV0b21hdGljU2Nyb2xsTWFyZ2luRGVsdGE7XG4gICAgICAgICAgICB2YXIgZFJpZ2h0ID0gbWFyZ2luRGVsdGEgLSAoc2VsZi5kaW1lbnNpb25zLndpZHRoIC0gZHJhZ1Bvc2l0aW9uWzBdKTtcbiAgICAgICAgICAgIHZhciBkTGVmdCA9IG1hcmdpbkRlbHRhIC0gZHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICAgICAgdmFyIGRCb3R0b20gPSBtYXJnaW5EZWx0YSAtIChzZWxmLmRpbWVuc2lvbnMuaGVpZ2h0IC0gZHJhZ1Bvc2l0aW9uWzFdKTtcbiAgICAgICAgICAgIHZhciBkVG9wID0gbWFyZ2luRGVsdGEgLSBkcmFnUG9zaXRpb25bMV07XG5cbiAgICAgICAgICAgIGhvcml6b250YWxTcGVlZCA9IE1hdGgucG93KE1hdGgubWF4KGRSaWdodCwgZExlZnQsIG1hcmdpbkRlbHRhKSwgMik7XG4gICAgICAgICAgICB2ZXJ0aWNhbFNwZWVkID0gTWF0aC5wb3coTWF0aC5tYXgoZEJvdHRvbSwgZFRvcCwgbWFyZ2luRGVsdGEpLCAyKTtcblxuICAgICAgICAgICAgdmFyIHByZXZpb3VzSG9yaXpvbnRhbE1vdmUgPSBob3Jpem9udGFsTW92ZTtcbiAgICAgICAgICAgIHZhciBwcmV2aW91c1ZlcnRpY2FsTW92ZSA9IHZlcnRpY2FsTW92ZTtcbiAgICAgICAgICAgIGhvcml6b250YWxNb3ZlID0gZFJpZ2h0ID4gMCA/IC0xIDogZExlZnQgPiAwID8gMSA6IDA7XG4gICAgICAgICAgICB2ZXJ0aWNhbE1vdmUgPSBkQm90dG9tID4gMCA/IC0xIDogZFRvcCA+IDAgPyAxIDogMDtcblxuICAgICAgICAgICAgdmFyIGhhc0NoYW5nZWRTdGF0ZSA9IHByZXZpb3VzSG9yaXpvbnRhbE1vdmUgIT09IGhvcml6b250YWxNb3ZlIHx8IHByZXZpb3VzVmVydGljYWxNb3ZlICE9PSB2ZXJ0aWNhbE1vdmU7XG5cbiAgICAgICAgICAgIGlmICgoaG9yaXpvbnRhbE1vdmUgfHwgdmVydGljYWxNb3ZlKSAmJiAhdGltZXJBY3RpdmUgJiYgaGFzQ2hhbmdlZFN0YXRlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGltZXJTdGFydFRpbWUgPSBnZXRQcmVjaXNlVGltZSgpO1xuXG4gICAgICAgICAgICAgICAgdGltZXJBY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgZDMudGltZXIoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRUaW1lID0gZ2V0UHJlY2lzZVRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVEZWx0YSA9IGN1cnJlbnRUaW1lIC0gdGltZXJTdGFydFRpbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVyV2lsbFN0b3AgPSAhdmVydGljYWxNb3ZlICYmICFob3Jpem9udGFsTW92ZSB8fCBuZWVkVGltZXJTdG9wO1xuXG4gICAgICAgICAgICAgICAgICAgIGRvQXV0b21hdGljU2Nyb2xsKHRpbWVEZWx0YSwgc2VsZi5vcHRpb25zLnJlbmRlck9uQXV0b21hdGljU2Nyb2xsSWRsZSAmJiB0aW1lcldpbGxTdG9wKTtcblxuICAgICAgICAgICAgICAgICAgICB0aW1lclN0YXJ0VGltZSA9IGN1cnJlbnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lcldpbGxTdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZWVkVGltZXJTdG9wID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lckFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVyV2lsbFN0b3A7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZWxmLl9kcmFnQUYpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHNlbGYuX2RyYWdBRik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuX2RyYWdBRiA9IHNlbGYucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZVRyYW5zZm9ybSk7XG5cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdkcmFnZW5kJywgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICBkcmFnU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxmLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHNlbGYuX2RyYWdBRik7XG4gICAgICAgICAgICBzZWxmLl9kcmFnQUYgPSBudWxsO1xuICAgICAgICAgICAgaG9yaXpvbnRhbE1vdmUgPSAwO1xuICAgICAgICAgICAgdmVydGljYWxNb3ZlID0gMDtcblxuICAgICAgICAgICAgZGF0YS5fZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi5fZnJvemVuVWlkcy5zcGxpY2Uoc2VsZi5fZnJvemVuVWlkcy5pbmRleE9mKGRhdGEudWlkKSwgMSk7XG5cbiAgICAgICAgICAgIGQzLnRpbWVyLmZsdXNoKCk7XG5cbiAgICAgICAgICAgIHZhciBkZWx0YUZyb21Ub3BMZWZ0Q29ybmVyID0gZDMubW91c2Uoc2VsZWN0aW9uLm5vZGUoKSk7XG4gICAgICAgICAgICB2YXIgaGFsZkhlaWdodCA9IHNlbGYub3B0aW9ucy5yb3dIZWlnaHQgLyAyO1xuICAgICAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcblxuICAgICAgICAgICAgdmFyIHRvdGFsRGVsdGFYID0gZHJhZ1Bvc2l0aW9uWzBdIC0gc3RhcnREcmFnUG9zaXRpb25bMF07XG4gICAgICAgICAgICB2YXIgdG90YWxEZWx0YVkgPSBkcmFnUG9zaXRpb25bMV0gLSBzdGFydERyYWdQb3NpdGlvblsxXTtcbiAgICAgICAgICAgIHZhciBkcmFnRGlzdGFuY2UgPSBNYXRoLnNxcnQodG90YWxEZWx0YVgqdG90YWxEZWx0YVgrdG90YWxEZWx0YVkqdG90YWxEZWx0YVkpO1xuICAgICAgICAgICAgdmFyIHRpbWVEZWx0YSA9ICtuZXcgRGF0ZSgpIC0gc3RhcnRUaW1lO1xuXG4gICAgICAgICAgICBpZiAoKHRpbWVEZWx0YSA+IHNlbGYub3B0aW9ucy5tYXhpbXVtQ2xpY2tEcmFnVGltZSB8fCBkcmFnRGlzdGFuY2UgPiBzZWxmLm9wdGlvbnMubWF4aW11bUNsaWNrRHJhZ0Rpc3RhbmNlKSAmJiBkcmFnRGlzdGFuY2UgPiBzZWxmLm9wdGlvbnMubWluaW11bURyYWdEaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6ZHJhZ2VuZCcsIHNlbGVjdGlvbiwgWy1kZWx0YUZyb21Ub3BMZWZ0Q29ybmVyWzBdLCAtZGVsdGFGcm9tVG9wTGVmdENvcm5lclsxXSArIGhhbGZIZWlnaHRdLCBbZGF0YV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24uYXR0cigndHJhbnNmb3JtJywgb3JpZ2luVHJhbnNmb3JtU3RyaW5nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZlxuICAgICAgICAgICAgICAgIC51cGRhdGVZKClcbiAgICAgICAgICAgICAgICAuZHJhd1lBeGlzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgc2VsZWN0aW9uLmNhbGwoZHJhZyk7XG5cbn07XG5cblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50VXBkYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBkLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMud3JhcFdpdGhBbmltYXRpb24oc2VsZWN0aW9uLnNlbGVjdCgnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50QmFja2dyb3VuZCcpLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgIHk6IHRoaXMub3B0aW9ucy5yb3dQYWRkaW5nLFxuICAgICAgICAgICAgd2lkdGg6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5zY2FsZXMueChzZWxmLmdldERhdGFFbmQoZCkpIC0gc2VsZi5zY2FsZXMueChzZWxmLmdldERhdGFTdGFydChkKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZFRleHQgJiYgdGhpcy5vcHRpb25zLmFsaWduTGVmdCAmJiAhZC5fZGVmYXVsdFByZXZlbnRlZCkge1xuXG4gICAgICAgIHNlbGVjdGlvblxuICAgICAgICAgICAgLnNlbGVjdCgnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50TW92YWJsZUNvbnRlbnQnKVxuICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGQgPT4gJ3RyYW5zbGF0ZSgnICsgTWF0aC5tYXgoLXRoaXMuc2NhbGVzLngodGhpcy5nZXREYXRhU3RhcnQoZCkpLCAyKSArICcsMCknKTtcbiAgICB9XG5cbiAgICBzZWxlY3Rpb24uY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5lbGVtZW50Q29udGVudFVwZGF0ZShzZWxlY3Rpb24sIGQsIHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfSk7XG5cbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudEV4aXQgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHtcblxuICAgIHNlbGVjdGlvbi5vbignY2xpY2snLCBudWxsKTtcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNCbG9ja1RhYmxlO1xuIiwiLyogZ2xvYmFsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cy9ldmVudHMnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcblxuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEQzVGFibGVSb3dcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfE51bWJlcn0gaWRcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBuYW1lXG4gKiBAcHJvcGVydHkge0FycmF5PEQzVGFibGVFbGVtZW50Pn0gZWxlbWVudHNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEQzVGFibGVFbGVtZW50XG4gKiBAcHJvcGVydHkge1N0cmluZ3xOdW1iZXJ9IGlkXG4gKiBAcHJvcGVydHkge1N0cmluZ3xOdW1iZXJ9IHVpZFxuICogQHByb3BlcnR5IHtOdW1iZXJ9IHN0YXJ0XG4gKiBAcHJvcGVydHkge051bWJlcn0gZW5kXG4gKiBAcHJvcGVydHkge051bWJlcn0gW3Jvd0luZGV4XVxuICovXG5cblxuLyoqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGFibGUob3B0aW9ucykge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICBEM1RhYmxlLmluc3RhbmNlc0NvdW50ICs9IDE7XG5cbiAgICB0aGlzLmluc3RhbmNlTnVtYmVyID0gRDNUYWJsZS5pbnN0YW5jZXNDb3VudDtcblxuICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZCh0cnVlLCB7fSwgdGhpcy5kZWZhdWx0cywgb3B0aW9ucyk7XG5cblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheTxEM1RhYmxlUm93Pn1cbiAgICAgKi9cbiAgICB0aGlzLmRhdGEgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheTxEM1RhYmxlRWxlbWVudD59XG4gICAgICovXG4gICAgdGhpcy5mbGF0dGVuZWREYXRhID0gW107XG5cblxuICAgIHRoaXMubWFyZ2luID0ge1xuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICBib3R0b206IDAsXG4gICAgICAgIGxlZnQ6IDBcbiAgICB9O1xuXG4gICAgdGhpcy5kaW1lbnNpb25zID0geyB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG5cbiAgICB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gWzAuMCwgMC4wXTtcblxuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcblxuICAgIHRoaXMuZWxlbWVudHMgPSB7XG4gICAgICAgIGJvZHk6IG51bGwsXG4gICAgICAgIGlubmVyQ29udGFpbmVyOiBudWxsLFxuICAgICAgICB4QXhpc0NvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgeDJBeGlzQ29udGFpbmVyOiBudWxsLFxuICAgICAgICB5QXhpc0NvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgZGVmczogbnVsbCxcbiAgICAgICAgY2xpcDogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLnNjYWxlcyA9IHtcbiAgICAgICAgeDogbnVsbCxcbiAgICAgICAgeTogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLmF4aXNlcyA9IHtcbiAgICAgICAgeDogbnVsbCxcbiAgICAgICAgeDI6IG51bGwsXG4gICAgICAgIHk6IG51bGxcbiAgICB9O1xuXG4gICAgdGhpcy5iZWhhdmlvcnMgPSB7XG4gICAgICAgIHpvb206IG51bGwsXG4gICAgICAgIHpvb21YOiBudWxsLFxuICAgICAgICB6b29tWTogbnVsbCxcbiAgICAgICAgcGFuOiBudWxsXG4gICAgfTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RTY2FsZSA9IG51bGw7XG5cbiAgICB0aGlzLl95U2NhbGUgPSAwLjA7XG4gICAgdGhpcy5fZGF0YUNoYW5nZUNvdW50ID0gMDtcbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPSAwO1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCA9IDA7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCA9IDA7XG4gICAgdGhpcy5fcHJldmVudERyYXdpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycyA9IFtdO1xuICAgIHRoaXMuX21heEJvZHlIZWlnaHQgPSBJbmZpbml0eTtcbiAgICB0aGlzLl9mcm96ZW5VaWRzID0gW107XG59XG5cbmluaGVyaXRzKEQzVGFibGUsIEV2ZW50RW1pdHRlcik7XG5cbkQzVGFibGUucHJvdG90eXBlLmRlZmF1bHRzID0ge1xuICAgIGJlbUJsb2NrTmFtZTogJ3RhYmxlJyxcbiAgICBiZW1CbG9ja01vZGlmaWVyOiAnJyxcbiAgICB4QXhpc0hlaWdodDogNTAsXG4gICAgeUF4aXNXaWR0aDogNTAsXG4gICAgcm93SGVpZ2h0OiAzMCxcbiAgICByb3dQYWRkaW5nOiA1LFxuICAgIGNvbnRhaW5lcjogJ2JvZHknLFxuICAgIGN1bGxpbmdYOiB0cnVlLFxuICAgIGN1bGxpbmdZOiB0cnVlLFxuICAgIGN1bGxpbmdEaXN0YW5jZTogMSxcbiAgICByZW5kZXJPbklkbGU6IHRydWUsXG4gICAgaGlkZVRpY2tzT25ab29tOiBmYWxzZSxcbiAgICBoaWRlVGlja3NPbkRyYWc6IGZhbHNlLFxuICAgIHBhbllPbldoZWVsOiB0cnVlLFxuICAgIHdoZWVsTXVsdGlwbGllcjogMSxcbiAgICBlbmFibGVZVHJhbnNpdGlvbjogdHJ1ZSxcbiAgICBlbmFibGVUcmFuc2l0aW9uT25FeGl0OiB0cnVlLFxuICAgIHVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybTogZmFsc2UsXG4gICAgdHJhbnNpdGlvbkVhc2luZzogJ3F1YWQtaW4tb3V0JyxcbiAgICB4QXhpc1RpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkO1xuICAgIH0sXG4gICAgeEF4aXNTdHJva2VXaWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCUyID8gMSA6IDI7XG4gICAgfSxcbiAgICB4QXhpczJUaWNrc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfSxcbiAgICB5QXhpc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCAmJiBkLm5hbWUgfHwgJyc7XG4gICAgfSxcbiAgICBwYWRkaW5nOiAxMCxcbiAgICB0cmFja2VkRE9NRXZlbnRzOiBbJ2NsaWNrJywgJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnLCAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJ10gLy8gbm90IGR5bmFtaWNcbn07XG5cbkQzVGFibGUuaW5zdGFuY2VzQ291bnQgPSAwO1xuXG5EM1RhYmxlLnByb3RvdHlwZS5ub29wID0gZnVuY3Rpb24oKSB7fTtcblxuRDNUYWJsZS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gY29udGFpbmVyXG4gICAgdGhpcy5jb250YWluZXIgPSBkMy5zZWxlY3QodGhpcy5vcHRpb25zLmNvbnRhaW5lcikuYXBwZW5kKCdzdmcnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgKHRoaXMub3B0aW9ucy5iZW1CbG9ja01vZGlmaWVyID8gJyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArIHRoaXMub3B0aW9ucy5iZW1CbG9ja01vZGlmaWVyIDogJycpKTtcblxuICAgIC8vIGRlZnNcbiAgICB0aGlzLmVsZW1lbnRzLmRlZnMgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2RlZnMnKTtcblxuICAgIC8vIGNsaXAgcmVjdCBpbiBkZWZzXG4gICAgdmFyIGNsaXBJZCA9IHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvZHlDbGlwUGF0aC0tJyArIEQzVGFibGUuaW5zdGFuY2VzQ291bnQ7XG4gICAgdGhpcy5lbGVtZW50cy5jbGlwID0gdGhpcy5lbGVtZW50cy5kZWZzLmFwcGVuZCgnY2xpcFBhdGgnKVxuICAgICAgICAucHJvcGVydHkoJ2lkJywgY2xpcElkKTtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXBcbiAgICAgICAgLmFwcGVuZCgncmVjdCcpO1xuXG4gICAgLy8gc3Vycm91bmRpbmcgcmVjdFxuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5jbGFzc2VkKHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JywgdHJ1ZSk7XG5cbiAgICAvLyBheGlzZXMgY29udGFpbmVyc1xuICAgIHRoaXMuZWxlbWVudHMueEF4aXNDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS14Jyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLngyQXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXggJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXNlY29uZGFyeScpO1xuXG4gICAgdGhpcy5lbGVtZW50cy55QXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXknKTtcblxuICAgIC8vIGJvZHkgY29udGFpbmVyIGlubmVyIGNvbnRhaW5lciBhbmQgc3Vycm91bmRpbmcgcmVjdFxuICAgIHRoaXMuZWxlbWVudHMuYm9keSA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCMnICsgY2xpcElkICsgJyknKTtcblxuICAgIC8vIHN1cnJvdW5kaW5nIHJlY3RcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnLCB0cnVlKTtcblxuICAgIC8vIGlubmVyIGNvbnRhaW5lclxuICAgIHRoaXMuZWxlbWVudHMuaW5uZXJDb250YWluZXIgPSB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdnJyk7XG5cbiAgICAvLyBzdXJyb3VuZGluZyByZWN0XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5jbGFzc2VkKHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcsIHRydWUpO1xuXG4gICAgdGhpcy51cGRhdGVNYXJnaW5zKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVEM0luc3RhbmNlcygpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplRXZlbnRMaXN0ZW5lcnMoKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUueFNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnlTY2FsZUZhY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUubGluZWFyKCk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplRDNJbnN0YW5jZXMgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuc2NhbGVzLnggPSB0aGlzLnhTY2FsZUZhY3RvcnkoKTtcblxuICAgIHRoaXMuc2NhbGVzLnkgPSB0aGlzLnlTY2FsZUZhY3RvcnkoKTtcblxuICAgIHRoaXMuYXhpc2VzLnggPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy54KVxuICAgICAgICAub3JpZW50KCd0b3AnKVxuICAgICAgICAudGlja0Zvcm1hdCh0aGlzLm9wdGlvbnMueEF4aXNUaWNrc0Zvcm1hdHRlci5iaW5kKHRoaXMpKVxuICAgICAgICAub3V0ZXJUaWNrU2l6ZSgwKVxuICAgICAgICAudGlja1BhZGRpbmcoMjApO1xuXG4gICAgdGhpcy5heGlzZXMueDIgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy54KVxuICAgICAgICAub3JpZW50KCd0b3AnKVxuICAgICAgICAudGlja0Zvcm1hdCh0aGlzLm9wdGlvbnMueEF4aXMyVGlja3NGb3JtYXR0ZXIuYmluZCh0aGlzKSlcbiAgICAgICAgLm91dGVyVGlja1NpemUoMClcbiAgICAgICAgLmlubmVyVGlja1NpemUoMCk7XG5cbiAgICB0aGlzLmF4aXNlcy55ID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAuc2NhbGUodGhpcy5zY2FsZXMueSlcbiAgICAgICAgLm9yaWVudCgnbGVmdCcpXG4gICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9pc1JvdW5kKGQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYub3B0aW9ucy55QXhpc0Zvcm1hdHRlcihzZWxmLmRhdGFbKGR8MCldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAub3V0ZXJUaWNrU2l6ZSgwKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20gPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pXG4gICAgICAgIC5vbignem9vbScsIHRoaXMuaGFuZGxlWm9vbWluZy5iaW5kKHRoaXMpKVxuICAgICAgICAub24oJ3pvb21lbmQnLCB0aGlzLmhhbmRsZVpvb21pbmdFbmQuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWCA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAueCh0aGlzLnNjYWxlcy54KVxuICAgICAgICAuc2NhbGUoMSlcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkgPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAgICAgLnkodGhpcy5zY2FsZXMueSlcbiAgICAgICAgLnNjYWxlKDEpXG4gICAgICAgIC5zY2FsZUV4dGVudChbMSwgMV0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMucGFuID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgIC5vbignZHJhZycsIHRoaXMuaGFuZGxlRHJhZ2dpbmcuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuY2FsbCh0aGlzLmJlaGF2aW9ycy5wYW4pO1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5jYWxsKHRoaXMuYmVoYXZpb3JzLnpvb20pO1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdGhpcy5fbGFzdFNjYWxlID0gdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpO1xufVxuXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMub3B0aW9ucy50cmFja2VkRE9NRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuYm9keS5vbihldmVudE5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50TmFtZSAhPT0gJ2NsaWNrJyB8fCAhZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiBkMy5zZWxlY3QoZDMuZXZlbnQudGFyZ2V0KS5jbGFzc2VkKHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JykpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KGV2ZW50TmFtZSwgc2VsZi5lbGVtZW50cy5ib2R5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmVtaXREZXRhaWxlZEV2ZW50ID0gZnVuY3Rpb24oZXZlbnROYW1lLCBkM1RhcmdldFNlbGVjdGlvbiwgZGVsdGEsIHByaW9yaXR5QXJndW1lbnRzLCBleHRyYUFyZ3VtZW50cykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHBvc2l0aW9uO1xuXG4gICAgdmFyIGdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghcG9zaXRpb24pIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gZDMubW91c2Uoc2VsZi5lbGVtZW50cy5ib2R5Lm5vZGUoKSk7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkZWx0YSkpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblswXSArPSBkZWx0YVswXTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblsxXSArPSBkZWx0YVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfTtcblxuICAgIHZhciBhcmdzID0gW1xuICAgICAgICB0aGlzLCAvLyB0aGUgdGFibGUgaW5zdGFuY2VcbiAgICAgICAgZDNUYXJnZXRTZWxlY3Rpb24sIC8vIHRoZSBkMyBzZWxlY3Rpb24gdGFyZ2V0ZWRcbiAgICAgICAgZDMuZXZlbnQsIC8vIHRoZSBkMyBldmVudFxuICAgICAgICBmdW5jdGlvbiBnZXRDb2x1bW4oKSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBnZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLnguaW52ZXJ0KHBvc2l0aW9uWzBdKTtcbiAgICAgICAgfSwgLy8gYSBjb2x1bW4gZ2V0dGVyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJvdygpIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IGdldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5zY2FsZXMueS5pbnZlcnQocG9zaXRpb25bMV0pO1xuICAgICAgICB9IC8vIGEgcm93IGdldHRlclxuICAgIF07XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShwcmlvcml0eUFyZ3VtZW50cykpIHtcbiAgICAgICAgYXJncyA9IHByaW9yaXR5QXJndW1lbnRzLmNvbmNhdChhcmdzKTtcbiAgICB9XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShleHRyYUFyZ3VtZW50cykpIHtcbiAgICAgICAgYXJncyA9IGFyZ3MuY29uY2F0KGV4dHJhQXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBhcmdzLnVuc2hpZnQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6JyArIGV2ZW50TmFtZSk7IC8vIHRoZSBldmVudCBuYW1lXG5cbiAgICB0aGlzLmVtaXQuYXBwbHkodGhpcywgYXJncyk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVNYXJnaW5zID0gZnVuY3Rpb24odXBkYXRlRGltZW5zaW9ucykge1xuXG4gICAgdGhpcy5tYXJnaW4gPSB7XG4gICAgICAgIHRvcDogdGhpcy5vcHRpb25zLnhBeGlzSGVpZ2h0ICsgdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIHJpZ2h0OiB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgYm90dG9tOiB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgbGVmdDogdGhpcy5vcHRpb25zLnlBeGlzV2lkdGggKyB0aGlzLm9wdGlvbnMucGFkZGluZ1xuICAgIH07XG5cbiAgICB2YXIgY29udGVudFBvc2l0aW9uID0geyB4OiB0aGlzLm1hcmdpbi5sZWZ0LCB5OiB0aGlzLm1hcmdpbi50b3AgfTtcbiAgICB2YXIgY29udGVudFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHRoaXMubWFyZ2luLmxlZnQgKyAnLCcgKyB0aGlzLm1hcmdpbi50b3AgKyAnKSc7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JylcbiAgICAgICAgLmF0dHIoY29udGVudFBvc2l0aW9uKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keVxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnhBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueDJBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueUF4aXNDb250YWluZXJcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIHRoaXMubWFyZ2luLmxlZnQgKyAnLCcgKyB0aGlzLm1hcmdpbi50b3AgKyAnKScpO1xuXG4gICAgaWYgKHVwZGF0ZURpbWVuc2lvbnMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVYKCk7XG4gICAgICAgIHRoaXMudXBkYXRlWSgpO1xuICAgIH1cblxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gcmVtb3ZlIGJlaGF2aW9yIGxpc3RlbmVyc1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20ub24oJ3pvb20nLCBudWxsKTtcblxuICAgIC8vIHJlbW92ZSBkb20gbGlzdGVuZXJzXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5Lm9uKCcuem9vbScsIG51bGwpO1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5vbignY2xpY2snLCBudWxsKTtcblxuICAgIC8vIHJlbW92ZSByZWZlcmVuY2VzXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMuZWxlbWVudHMgPSBudWxsO1xuICAgIHRoaXMuc2NhbGVzID0gbnVsbDtcbiAgICB0aGlzLmF4aXNlcyA9IG51bGw7XG4gICAgdGhpcy5iZWhhdmlvcnMgPSBudWxsO1xuICAgIHRoaXMuZGF0YSA9IG51bGw7XG4gICAgdGhpcy5mbGF0dGVuZWREYXRhID0gbnVsbDtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnJlc3RvcmVab29tID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUodGhpcy5fbGFzdFRyYW5zbGF0ZSk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSh0aGlzLl9sYXN0U2NhbGUpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGR4LCBkeSwgZm9yY2VEcmF3LCBza2lwWEF4aXMsIGZvcmNlVGlja3MpIHtcblxuICAgIHZhciBjdXJyZW50VHJhbnNsYXRlID0gdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKTtcbiAgICB2YXIgdXBkYXRlZFQgPSBbY3VycmVudFRyYW5zbGF0ZVswXSArIGR4LCBjdXJyZW50VHJhbnNsYXRlWzFdICsgZHldO1xuXG4gICAgdXBkYXRlZFQgPSB0aGlzLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlKHVwZGF0ZWRULCBbdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpLCB0aGlzLmJlaGF2aW9ycy56b29tWS5zY2FsZSgpXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVgudHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG5cbiAgICB0aGlzLm1vdmVFbGVtZW50cyhmb3JjZURyYXcsIHNraXBYQXhpcywgZm9yY2VUaWNrcyk7XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gdXBkYXRlZFQ7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScpO1xuXG4gICAgcmV0dXJuIHVwZGF0ZWRULmNvbmNhdChbdXBkYXRlZFRbMF0gLSBjdXJyZW50VHJhbnNsYXRlWzBdLCB1cGRhdGVkVFsxXSAtIGN1cnJlbnRUcmFuc2xhdGVbMV1dKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmVuc3VyZUluRG9tYWlucyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1vdmUoMCwgMCwgZmFsc2UsIGZhbHNlLCB0cnVlKTtcbn07XG5cbi8qKlxuICogcGFuIFgvWSAmIHpvb20gWCBoYW5kbGVyIChjbGFtcGVkIHBhbiBZIHdoZW4gd2hlZWwgaXMgcHJlc3NlZCB3aXRob3V0IGN0cmwsIHpvb20gWCBhbmQgcGFuIFgvWSBvdGhlcndpc2UpXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmhhbmRsZVpvb21pbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCAmJiAhZDMuZXZlbnQuc291cmNlRXZlbnQuY3RybEtleSAmJiAhKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNoYW5nZWRUb3VjaGVzICYmIGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aCA+PSAyKSkge1xuICAgICAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQudHlwZSA9PT0gJ3doZWVsJykge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wYW5ZT25XaGVlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZVpvb20oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVdoZWVsaW5nKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXN0b3JlWm9vbSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHQgPSB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpO1xuICAgIHZhciB1cGRhdGVkVCA9IFt0WzBdLCB0aGlzLl9sYXN0VHJhbnNsYXRlWzFdXTtcblxuICAgIHVwZGF0ZWRUID0gdGhpcy5fY2xhbXBUcmFuc2xhdGlvbldpdGhTY2FsZSh1cGRhdGVkVCwgW3RoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSwgdGhpcy5iZWhhdmlvcnMuem9vbVkuc2NhbGUoKV0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVguc2NhbGUodGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpKTtcblxuICAgIHRoaXMubW92ZUVsZW1lbnRzKHRydWUsIGZhbHNlLCAhdGhpcy5vcHRpb25zLmhpZGVUaWNrc09uWm9vbSk7XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gdXBkYXRlZFQ7XG4gICAgdGhpcy5fbGFzdFNjYWxlID0gdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnKTtcblxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlWm9vbWluZ0VuZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLmF0dHIoJ3RyYW5zZm9ybScsIG51bGwpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdG9wRWxlbWVudFRyYW5zaXRpb24oKTtcbiAgICB0aGlzLm1vdmVFbGVtZW50cyh0cnVlKTtcbiAgICB0aGlzLmRyYXdZQXhpcygpO1xuICAgIHRoaXMuZHJhd1hBeGlzKCk7XG59O1xuXG4vKipcbiAqIHdoZWVsIGhhbmRsZXIgKGNsYW1wZWQgcGFuIFkpXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmhhbmRsZVdoZWVsaW5nID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZXZlbnQgPSBkMy5ldmVudC5zb3VyY2VFdmVudDtcblxuICAgIHZhciBkeCA9IDAsIGR5ID0gMDtcblxuICAgIHZhciBtb3ZpbmdYID0gZXZlbnQgJiYgZXZlbnQud2hlZWxEZWx0YVggfHwgZXZlbnQuZGVsdGFYO1xuXG4gICAgaWYgKG1vdmluZ1gpIHtcblxuICAgICAgICB2YXIgbW92aW5nUmlnaHQgPSBldmVudC53aGVlbERlbHRhWCA+IDAgfHwgZXZlbnQuZGVsdGFYIDwgMDtcbiAgICAgICAgZHggPSAobW92aW5nUmlnaHQgPyAxIDogLTEpICogdGhpcy5jb2x1bW5XaWR0aCAqIHRoaXMub3B0aW9ucy53aGVlbE11bHRpcGxpZXI7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIHZhciBtb3ZpbmdZID0gZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC53aGVlbERlbHRhWSB8fCBldmVudC5kZXRhaWwgfHwgZXZlbnQuZGVsdGFZO1xuXG4gICAgICAgIGlmIChtb3ZpbmdZKSB7XG4gICAgICAgICAgICB2YXIgbW92aW5nRG93biA9IGV2ZW50LndoZWVsRGVsdGEgPiAwIHx8IGV2ZW50LndoZWVsRGVsdGFZID4gMCB8fCBldmVudC5kZXRhaWwgPCAwIHx8IGV2ZW50LmRlbHRhWSA8IDA7XG4gICAgICAgICAgICBkeSA9IG1vdmluZ1kgPyAobW92aW5nRG93biA/IDEgOiAtMSkgKiB0aGlzLm9wdGlvbnMucm93SGVpZ2h0ICogdGhpcy5vcHRpb25zLndoZWVsTXVsdGlwbGllciA6IDA7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHRoaXMubW92ZShkeCwgZHksIGZhbHNlLCAhbW92aW5nWCk7XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmhhbmRsZURyYWdnaW5nID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQudG91Y2hlcy5sZW5ndGggPj0gMikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tb3ZlKGQzLmV2ZW50LmR4LCBkMy5ldmVudC5keSwgZmFsc2UsIGZhbHNlLCAhdGhpcy5vcHRpb25zLmhpZGVUaWNrc09uRHJhZyk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS50b2dnbGVEcmF3aW5nID0gZnVuY3Rpb24oYWN0aXZlKSB7XG5cbiAgICB0aGlzLl9wcmV2ZW50RHJhd2luZyA9IHR5cGVvZiBhY3RpdmUgPT09ICdib29sZWFuJyA/ICFhY3RpdmUgOiAhdGhpcy5fcHJldmVudERyYXdpbmc7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8RDNUYWJsZVJvdz59IGRhdGFcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICogQHBhcmFtIHtCb29sZWFufSBbYW5pbWF0ZVldXG4gKiBAcmV0dXJucyB7RDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc2V0RGF0YSA9IGZ1bmN0aW9uKGRhdGEsIHRyYW5zaXRpb25EdXJhdGlvbiwgYW5pbWF0ZVkpIHtcblxuICAgIHRoaXMuX2RhdGFDaGFuZ2VDb3VudCArPSAxO1xuXG4gICAgdmFyIGlzU2l6ZUNoYW5naW5nID0gZGF0YS5sZW5ndGggIT09IHRoaXMuZGF0YS5sZW5ndGg7XG5cbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuXG4gICAgdGhpcy5nZW5lcmF0ZUZsYXR0ZW5lZERhdGEoKTtcblxuICAgIGlmIChpc1NpemVDaGFuZ2luZyB8fCB0aGlzLl9kYXRhQ2hhbmdlQ291bnQgPT09IDEpIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAgICAgLnVwZGF0ZVhBeGlzSW50ZXJ2YWwoKVxuICAgICAgICAgICAgLnVwZGF0ZVkoYW5pbWF0ZVkgPyB0cmFuc2l0aW9uRHVyYXRpb24gOiB1bmRlZmluZWQpXG4gICAgICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgICAgIC5kcmF3WUF4aXMoKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyYXdFbGVtZW50cyh0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFRoaXMgY2xvbmUgbWV0aG9kIGRvZXMgbm90IGNsb25lIHRoZSBlbnRpdGllcyBpdHNlbGZcbiAqIEByZXR1cm5zIHtBcnJheTxEM1RhYmxlUm93Pn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuY2xvbmVEYXRhID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gdGhpcy5kYXRhLm1hcChmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtEM1RhYmxlUm93fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBkKSB7XG4gICAgICAgICAgICBpZiAoZC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleSAhPT0gJ2VsZW1lbnRzJykge1xuICAgICAgICAgICAgICAgICAgICByZXNba2V5XSA9IGRba2V5XTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNba2V5XSA9IGRba2V5XS5tYXAoc2VsZi5jbG9uZUVsZW1lbnQuYmluZChzZWxmKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICogQHJldHVybnMge0FycmF5PEQzVGFibGVFbGVtZW50Pn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuY2xvbmVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZmxhdHRlbmVkRGF0YS5tYXAoZnVuY3Rpb24oZSkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7RDNUYWJsZUVsZW1lbnR9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0ge307XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIGUpIHtcbiAgICAgICAgICAgIGlmIChlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICByZXNba2V5XSA9IGVba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFRoaXMgY2xvbmUgbWV0aG9kIGRvZXMgbm90IGNsb25lIHRoZSBlbnRpdGllcyBpdHNlbGZcbiAqIEByZXR1cm5zIHtEM1RhYmxlRWxlbWVudH1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuY2xvbmVFbGVtZW50ID0gZnVuY3Rpb24oZSkge1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0QzVGFibGVFbGVtZW50fVxuICAgICAqL1xuICAgIHZhciByZXMgPSB7fTtcblxuICAgIGZvciAodmFyIGtleSBpbiBlKSB7XG4gICAgICAgIGlmIChlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIHJlc1trZXldID0gZVtrZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmdldEVsZW1lbnRSb3cgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbmQodGhpcy5kYXRhLCBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgcmV0dXJuIHJvdy5lbGVtZW50cy5pbmRleE9mKGQpICE9PSAtMTtcbiAgICB9KTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnN0b3JlRmxhdHRlbmVkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucHJldmlvdXNGbGF0dGVuZWREYXRhID0gdGhpcy5jbG9uZUZsYXR0ZW5lZERhdGEoKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmdlbmVyYXRlRmxhdHRlbmVkRGF0YSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy51c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm0pIHtcbiAgICAgICAgdGhpcy5zdG9yZUZsYXR0ZW5lZERhdGEoKTtcbiAgICB9XG5cbiAgICB0aGlzLmZsYXR0ZW5lZERhdGEubGVuZ3RoID0gMDtcblxuICAgIHRoaXMuZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgZC5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucm93SW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHNlbGYuX2Zyb3plblVpZHMuaW5kZXhPZihlbGVtZW50LnVpZCkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5fZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLmZsYXR0ZW5lZERhdGEucHVzaChlbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IG1pblhcbiAqIEBwYXJhbSB7RGF0ZX0gbWF4WFxuICogQHJldHVybnMge0QzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnNldFhSYW5nZSA9IGZ1bmN0aW9uKG1pblgsIG1heFgpIHtcblxuICAgIHRoaXMubWluWCA9IG1pblg7XG4gICAgdGhpcy5tYXhYID0gbWF4WDtcblxuICAgIHRoaXMuc2NhbGVzLnhcbiAgICAgICAgLmRvbWFpbihbdGhpcy5taW5YLCB0aGlzLm1heFhdKTtcblxuICAgIHRoaXNcbiAgICAgICAgLnVwZGF0ZVgoKVxuICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAuZHJhd1lBeGlzKClcbiAgICAgICAgLmRyYXdFbGVtZW50cygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRBdmFpbGFibGVXaWR0aCA9IGZ1bmN0aW9uKGF2YWlsYWJsZVdpZHRoKSB7XG5cbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc0F2YWlsYWJsZVdpZHRoQ2hhbmdpbmcgPSBhdmFpbGFibGVXaWR0aCAhPT0gdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoO1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCA9IGF2YWlsYWJsZVdpZHRoO1xuXG4gICAgdGhpcy5kaW1lbnNpb25zLndpZHRoID0gdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoIC0gdGhpcy5tYXJnaW4ubGVmdCAtIHRoaXMubWFyZ2luLnJpZ2h0O1xuXG4gICAgaWYgKGlzQXZhaWxhYmxlV2lkdGhDaGFuZ2luZyB8fCB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPT09IDEpIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAgICAgLnVwZGF0ZVgoKVxuICAgICAgICAgICAgLnVwZGF0ZVhBeGlzSW50ZXJ2YWwoKVxuICAgICAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgICAgICAuZHJhd1lBeGlzKClcbiAgICAgICAgICAgIC5kcmF3RWxlbWVudHMoKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuc2V0QXZhaWxhYmxlSGVpZ2h0ID0gZnVuY3Rpb24oYXZhaWxhYmxlSGVpZ2h0KSB7XG5cbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc0F2YWlsYWJsZUhlaWdodENoYW5naW5nID0gYXZhaWxhYmxlSGVpZ2h0ICE9PSB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0O1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQgPSBhdmFpbGFibGVIZWlnaHQ7XG5cbiAgICB0aGlzLl9tYXhCb2R5SGVpZ2h0ID0gdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCAtIHRoaXMubWFyZ2luLnRvcCAtIHRoaXMubWFyZ2luLmJvdHRvbTtcblxuICAgIGlmIChpc0F2YWlsYWJsZUhlaWdodENoYW5naW5nIHx8IHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWSgpXG4gICAgICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAgICAgLmRyYXdFbGVtZW50cygpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVYID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCArIHRoaXMubWFyZ2luLmxlZnQgKyB0aGlzLm1hcmdpbi5yaWdodCk7XG5cbiAgICB0aGlzLnNjYWxlcy54XG4gICAgICAgIC5kb21haW4oW3RoaXMubWluWCwgdGhpcy5tYXhYXSlcbiAgICAgICAgLnJhbmdlKFswLCB0aGlzLmRpbWVuc2lvbnMud2lkdGhdKTtcblxuICAgIHRoaXMuYXhpc2VzLnlcbiAgICAgICAgLmlubmVyVGlja1NpemUoLXRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWFxuICAgICAgICAueCh0aGlzLnNjYWxlcy54KVxuICAgICAgICAudHJhbnNsYXRlKHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCkpXG4gICAgICAgIC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuICAgIHRoaXMuY29udGFpbmVyLnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgdGhpcy5lbGVtZW50cy5jbGlwLnNlbGVjdCgncmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLCB0aGlzLmNvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oZikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMucHVzaChmKTtcblxuICAgIGlmICh0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGc7XG4gICAgICAgICAgICB3aGlsZShnID0gc2VsZi5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMuc2hpZnQoKSkgZygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZjtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oZikge1xuXG4gICAgdmFyIGluZGV4ID0gdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMubGVuZ3RoID4gMCA/IHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmluZGV4T2YoZikgOiAtMTtcblxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5kcmF3WEF4aXMgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24sIHNraXBUaWNrcykge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuYXhpc2VzLnlcbiAgICAgICAgLmlubmVyVGlja1NpemUoc2tpcFRpY2tzID8gMCA6IC10aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX3hBeGlzQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl94QXhpc0FGKTtcbiAgICB9XG5cbiAgICB0aGlzLl94QXhpc0FGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgc2VsZi53cmFwV2l0aEFuaW1hdGlvbihzZWxmLmVsZW1lbnRzLnhBeGlzQ29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAuY2FsbChzZWxmLmF4aXNlcy54KVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgnbGluZScpXG4gICAgICAgICAgICAuc3R5bGUoe1xuICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiBzZWxmLm9wdGlvbnMueEF4aXNTdHJva2VXaWR0aC5iaW5kKHNlbGYpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKHNlbGYuZWxlbWVudHMueDJBeGlzQ29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAuY2FsbChzZWxmLmF4aXNlcy54MilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ3RleHQnKVxuICAgICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgICAgIHg6IHNlbGYuY29sdW1uV2lkdGggLyAyXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0eWxlKHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiArZCA9PT0gK3NlbGYubWF4WCA/ICdub25lJyA6ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5kcmF3WUF4aXMgPSBmdW5jdGlvbiBkcmF3WUF4aXModHJhbnNpdGlvbkR1cmF0aW9uLCBza2lwVGlja3MpIHtcblxuICAgIGlmICh0aGlzLl9wcmV2ZW50RHJhd2luZykge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLmF4aXNlcy54XG4gICAgICAgIC5pbm5lclRpY2tTaXplKHNraXBUaWNrcyA/IDAgOiAtdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG5cbiAgICB2YXIgZG9tYWluWSA9IHRoaXMuc2NhbGVzLnkuZG9tYWluKCk7XG5cbiAgICB0aGlzLmF4aXNlcy55XG4gICAgICAgIC50aWNrVmFsdWVzKHRoaXMuX3JhbmdlKE1hdGgucm91bmQoZG9tYWluWVswXSksIE1hdGgucm91bmQoZG9tYWluWVsxXSksIDEpKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLl95QXhpc0FGKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5feUF4aXNBRik7XG4gICAgfVxuXG4gICAgdGhpcy5feUF4aXNBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBjb250YWluZXIgPSBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKHNlbGYuZWxlbWVudHMueUF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGNvbnRhaW5lci5jYWxsKHNlbGYuYXhpc2VzLnkpO1xuXG4gICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgLnNlbGVjdEFsbCgndGV4dCcpLmF0dHIoJ3knLCBzZWxmLm9wdGlvbnMucm93SGVpZ2h0IC8gMik7XG5cbiAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdsaW5lJykuc3R5bGUoJ2Rpc3BsYXknLCBmdW5jdGlvbihkLGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA/ICcnIDogJ25vbmUnO1xuICAgICAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtRnJvbURhdGEgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIHRoaXMuc2NhbGVzLngodGhpcy5nZXREYXRhU3RhcnQoZCkpICsgJywnICsgdGhpcy5zY2FsZXMueShkLnJvd0luZGV4KSArICcpJztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmdldERhdGFTdGFydCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gK2Quc3RhcnQ7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZXREYXRhRW5kID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiArZC5lbmQ7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5kcmF3RWxlbWVudHMgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIGlmICh0aGlzLl9wcmV2ZW50RHJhd2luZykge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX2VsZW1lbnRzQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9lbGVtZW50c0FGKVxuICAgIH1cblxuICAgIHZhciBlbmFibGVZVHJhbnNpdGlvbiA9IHRoaXMub3B0aW9ucy5lbmFibGVZVHJhbnNpdGlvbjtcblxuICAgIHRoaXMuX2VsZW1lbnRzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgZG9tYWluWCA9IHNlbGYuc2NhbGVzLnguZG9tYWluKCk7XG4gICAgICAgIHZhciBkb21haW5YU3RhcnQgPSBkb21haW5YWzBdO1xuICAgICAgICB2YXIgZG9tYWluWEVuZCA9IGRvbWFpblhbZG9tYWluWC5sZW5ndGggLSAxXTtcblxuICAgICAgICB2YXIgZG9tYWluWSA9IHNlbGYuc2NhbGVzLnkuZG9tYWluKCk7XG4gICAgICAgIHZhciBkb21haW5ZU3RhcnQgPSBkb21haW5ZWzBdO1xuICAgICAgICB2YXIgZG9tYWluWUVuZCA9IGRvbWFpbllbZG9tYWluWS5sZW5ndGggLSAxXTtcblxuICAgICAgICB2YXIgY3VsbGluZ0Rpc3RhbmNlID0gc2VsZi5vcHRpb25zLmN1bGxpbmdEaXN0YW5jZTtcbiAgICAgICAgdmFyIGN1bGxpbmdYID0gc2VsZi5vcHRpb25zLmN1bGxpbmdYO1xuICAgICAgICB2YXIgY3VsbGluZ1kgPSBzZWxmLm9wdGlvbnMuY3VsbGluZ1k7XG5cblxuICAgICAgICB2YXIgc3RhcnRUcmFuc2Zvcm1NYXAgPSB7fTtcbiAgICAgICAgdmFyIGVuZFRyYW5zZm9ybU1hcCA9IHt9O1xuXG4gICAgICAgIGlmIChzZWxmLm9wdGlvbnMudXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtICYmIHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgICAgIGlmIChzZWxmLnByZXZpb3VzRmxhdHRlbmVkRGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYucHJldmlvdXNGbGF0dGVuZWREYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXN0YXJ0VHJhbnNmb3JtTWFwW2QudWlkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUcmFuc2Zvcm1NYXBbZC5pZF0gPSBzdGFydFRyYW5zZm9ybU1hcFtkLnVpZF0gPSBzZWxmLmdldFRyYW5zZm9ybUZyb21EYXRhKGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2VsZi5mbGF0dGVuZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5mbGF0dGVuZWREYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWVuZFRyYW5zZm9ybU1hcFtkLnVpZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZFRyYW5zZm9ybU1hcFtkLmlkXSA9IGVuZFRyYW5zZm9ybU1hcFtkLnVpZF0gPSBzZWxmLmdldFRyYW5zZm9ybUZyb21EYXRhKGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0YSA9IHNlbGYuZmxhdHRlbmVkRGF0YS5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgcmV0dXJuIGQuX2RlZmF1bHRQcmV2ZW50ZWQgfHwgKCFjdWxsaW5nWSB8fCAoZC5yb3dJbmRleCA+PSBkb21haW5ZU3RhcnQgLSBjdWxsaW5nRGlzdGFuY2UgJiYgZC5yb3dJbmRleCA8IGRvbWFpbllFbmQgKyBjdWxsaW5nRGlzdGFuY2UgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiAoIWN1bGxpbmdYIHx8ICEoc2VsZi5nZXREYXRhRW5kKGQpIDwgZG9tYWluWFN0YXJ0IHx8IHNlbGYuZ2V0RGF0YVN0YXJ0KGQpID4gZG9tYWluWEVuZCkpO1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIHZhciBnID0gc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5zZWxlY3RBbGwoJ2cuJyArIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKVxuICAgICAgICAgICAgLmRhdGEoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkLnVpZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBleGl0aW5nID0gZy5leGl0KCk7XG5cbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5lbmFibGVUcmFuc2l0aW9uT25FeGl0ICYmIHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgICAgIGV4aXRpbmdcbiAgICAgICAgICAgICAgICAuY2FsbChzZWxmLmVsZW1lbnRFeGl0LmJpbmQoc2VsZikpO1xuXG4gICAgICAgICAgICBleGl0aW5nLmVhY2goZnVuY3Rpb24oZCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGcgPSBkMy5zZWxlY3QodGhpcyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgZXhpdFRyYW5zZm9ybSA9IGVuZFRyYW5zZm9ybU1hcFtkLnVpZF0gfHwgZW5kVHJhbnNmb3JtTWFwW2QuaWRdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGV4aXRUcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi53cmFwV2l0aEFuaW1hdGlvbihnLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZXhpdFRyYW5zZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBnLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleGl0aW5nXG4gICAgICAgICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZy5lbnRlcigpLmFwcGVuZCgnZycpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JylcbiAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5jYWxsKHNlbGYuZWxlbWVudEVudGVyLmJpbmQoc2VsZikpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZy5lYWNoKGZ1bmN0aW9uKGQpIHtcblxuICAgICAgICAgICAgdmFyIGcgPSBkMy5zZWxlY3QodGhpcyk7XG5cbiAgICAgICAgICAgIGlmIChkLl9kZWZhdWx0UHJldmVudGVkKSB7XG5cbiAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRVcGRhdGUoZywgZCwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGhhc1ByZXZpb3VzVHJhbnNmb3JtID0gZy5hdHRyKCd0cmFuc2Zvcm0nKSAhPT0gbnVsbDtcblxuICAgICAgICAgICAgdmFyIG5ld1RyYW5zZm9ybSA9IGVuZFRyYW5zZm9ybU1hcFtkLnVpZF0gfHwgZW5kVHJhbnNmb3JtTWFwW2QuaWRdIHx8IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZCk7XG5cbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWdpblRyYW5zZm9ybSA9IHN0YXJ0VHJhbnNmb3JtTWFwW2QudWlkXSB8fCBzdGFydFRyYW5zZm9ybU1hcFtkLmlkXSB8fCBuZXdUcmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgdmFyIG1vZGlmaWVkT3JpZ2luVHJhbnNmb3JtO1xuICAgICAgICAgICAgICAgIGlmICghaGFzUHJldmlvdXNUcmFuc2Zvcm0gJiYgc2VsZi5vcHRpb25zLnVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ2luVHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RpZmllZE9yaWdpblRyYW5zZm9ybSA9IG9yaWdpblRyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGcuYXR0cigndHJhbnNmb3JtJywgb3JpZ2luVHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oZywgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAuYXR0clR3ZWVuKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9yaWdpblRyYW5zZm9ybSA9IG1vZGlmaWVkT3JpZ2luVHJhbnNmb3JtIHx8IGcuYXR0cigndHJhbnNmb3JtJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW5hYmxlWVRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZDMuaW50ZXJwb2xhdGVUcmFuc2Zvcm0ob3JpZ2luVHJhbnNmb3JtLCBuZXdUcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnRUcmFuc2Zvcm0gPSBkMy50cmFuc2Zvcm0ob3JpZ2luVHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW5kVHJhbnNmb3JtID0gZDMudHJhbnNmb3JtKG5ld1RyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdID0gZW5kVHJhbnNmb3JtLnRyYW5zbGF0ZVsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZDMuaW50ZXJwb2xhdGVUcmFuc2Zvcm0oc3RhcnRUcmFuc2Zvcm0udG9TdHJpbmcoKSwgZW5kVHJhbnNmb3JtLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIG5ld1RyYW5zZm9ybSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuZWxlbWVudFVwZGF0ZShnLCBkLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgPSBbMC4wLCAwLjBdO1xuICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLmF0dHIoJ3RyYW5zZm9ybScsIG51bGwpO1xuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLm1vdmVFbGVtZW50cyA9IGZ1bmN0aW9uKGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKSB7XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5yZW5kZXJPbklkbGUgfHwgZm9yY2VEcmF3KSB7XG4gICAgICAgIHRoaXMuZHJhd0VsZW1lbnRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50cmFuc2xhdGVFbGVtZW50cyh0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpLCB0aGlzLl9sYXN0VHJhbnNsYXRlKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyYXdZQXhpcyh1bmRlZmluZWQsICFmb3JjZVRpY2tzKTtcblxuICAgIGlmICghc2tpcFhBeGlzKSB7XG4gICAgICAgIHRoaXMudXBkYXRlWEF4aXNJbnRlcnZhbCgpO1xuICAgICAgICB0aGlzLmRyYXdYQXhpcyh1bmRlZmluZWQsICFmb3JjZVRpY2tzKTtcbiAgICB9XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS50cmFuc2xhdGVFbGVtZW50cyA9IGZ1bmN0aW9uKHRyYW5zbGF0ZSwgcHJldmlvdXNUcmFuc2xhdGUpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciB0eCA9IHRyYW5zbGF0ZVswXSAtIHByZXZpb3VzVHJhbnNsYXRlWzBdO1xuICAgIHZhciB0eSA9IHRyYW5zbGF0ZVsxXSAtIHByZXZpb3VzVHJhbnNsYXRlWzFdO1xuXG4gICAgdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVswXSA9IHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMF0gKyB0eDtcbiAgICB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdID0gdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVsxXSArIHR5O1xuXG5cbiAgICBpZiAodGhpcy5fZWx0c1RyYW5zbGF0ZUFGKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fZWx0c1RyYW5zbGF0ZUFGKTtcbiAgICB9XG5cbiAgICB0aGlzLl9lbHRzVHJhbnNsYXRlQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLmF0dHIoe1xuICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlKCcgKyBzZWxmLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlICsgJyknXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChzZWxmLmVsZW1lbnRzVHJhbnNsYXRlICE9PSBzZWxmLm5vb3ApIHtcbiAgICAgICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXJcbiAgICAgICAgICAgICAgICAuc2VsZWN0QWxsKCcuJyArIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKVxuICAgICAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5lbGVtZW50c1RyYW5zbGF0ZShkMy5zZWxlY3QodGhpcyksIGQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlWEF4aXNJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5jb2x1bW5XaWR0aCA9IHRoaXMuc2NhbGVzLngoMSkgLSB0aGlzLnNjYWxlcy54KDApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVZID0gZnVuY3Rpb24gKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyO1xuICAgIHZhciBjbGlwID0gdGhpcy5lbGVtZW50cy5jbGlwLnNlbGVjdCgncmVjdCcpO1xuICAgIHZhciBib3VuZGluZ1JlY3QgPSB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1ib3VuZGluZ1JlY3QnKTtcblxuICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBjbGlwID0gY2xpcC50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgYm91bmRpbmdSZWN0ID0gYm91bmRpbmdSZWN0LnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH1cblxuICAgIHZhciBlbGVtZW50QW1vdW50ID0gdGhpcy5kYXRhLmxlbmd0aDtcblxuICAgIC8vIGhhdmUgMSBtb3JlIGVsZW1udCB0byBmb3JjZSByZXByZXNlbnRpbmcgb25lIG1vcmUgdGlja1xuICAgIHZhciBlbGVtZW50c1JhbmdlID0gWzAsIGVsZW1lbnRBbW91bnRdO1xuXG4gICAgLy8gY29tcHV0ZSBuZXcgaGVpZ2h0XG4gICAgdGhpcy5kaW1lbnNpb25zLmhlaWdodCA9IE1hdGgubWluKHRoaXMuZGF0YS5sZW5ndGggKiB0aGlzLm9wdGlvbnMucm93SGVpZ2h0LCB0aGlzLl9tYXhCb2R5SGVpZ2h0KTtcblxuICAgIC8vIGNvbXB1dGUgbmV3IFkgc2NhbGVcbiAgICB0aGlzLl95U2NhbGUgPSB0aGlzLm9wdGlvbnMucm93SGVpZ2h0IC8gdGhpcy5kaW1lbnNpb25zLmhlaWdodCAqIGVsZW1lbnRBbW91bnQ7XG5cbiAgICAvLyB1cGRhdGUgWSBzY2FsZSwgYXhpcyBhbmQgem9vbSBiZWhhdmlvclxuICAgIHRoaXMuc2NhbGVzLnkuZG9tYWluKGVsZW1lbnRzUmFuZ2UpLnJhbmdlKFswLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0XSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWS55KHRoaXMuc2NhbGVzLnkpLnRyYW5zbGF0ZSh0aGlzLl9sYXN0VHJhbnNsYXRlKS5zY2FsZSh0aGlzLl95U2NhbGUpO1xuXG4gICAgLy8gYW5kIHVwZGF0ZSBYIGF4aXMgdGlja3MgaGVpZ2h0XG4gICAgdGhpcy5heGlzZXMueC5pbm5lclRpY2tTaXplKC10aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIC8vIHVwZGF0ZSBzdmcgaGVpZ2h0XG4gICAgY29udGFpbmVyLmF0dHIoJ2hlaWdodCcsdGhpcy5kaW1lbnNpb25zLmhlaWdodCArIHRoaXMubWFyZ2luLnRvcCArIHRoaXMubWFyZ2luLmJvdHRvbSk7XG5cbiAgICAvLyB1cGRhdGUgaW5uZXIgcmVjdCBoZWlnaHRcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcpLmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuICAgIGJvdW5kaW5nUmVjdC5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICBjb250YWluZXIuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcpLmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuICAgIGNsaXAuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMsIHRoaXMuY29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5zdG9wRWxlbWVudFRyYW5zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLnNlbGVjdEFsbCgnZy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpLnRyYW5zaXRpb24oKVxuICAgICAgICAuc3R5bGUoJ29wYWNpdHknLCAnJyk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5lbGVtZW50RW50ZXIgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHsgcmV0dXJuIHNlbGVjdGlvbjsgfTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudFVwZGF0ZSA9IGZ1bmN0aW9uKHNlbGVjdGlvbikgeyByZXR1cm4gc2VsZWN0aW9uOyB9O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5lbGVtZW50RXhpdCA9IGZ1bmN0aW9uKHNlbGVjdGlvbikgeyByZXR1cm4gc2VsZWN0aW9uOyB9O1xuXG5EM1RhYmxlLnByb3RvdHlwZS53cmFwV2l0aEFuaW1hdGlvbiA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdGlvbi50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKS5lYXNlKHRoaXMub3B0aW9ucy50cmFuc2l0aW9uRWFzaW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2VsZWN0aW9uO1xuICAgIH1cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLl9nZXR0ZXIgPSBmdW5jdGlvbihwcm9wKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbcHJvcF07IH07XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5faXNSb3VuZCA9IGZ1bmN0aW9uKHYpIHtcbiAgICB2YXIgbiA9IHZ8MDtcbiAgICByZXR1cm4gdiA+IG4gLSAxZS0zICYmIHYgPCBuICsgMWUtMztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLl9yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQsIGluYykge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICB3aGlsZSAoc3RhcnQgPCBlbmQpIHtcbiAgICAgICAgcmVzLnB1c2goc3RhcnQpO1xuICAgICAgICBzdGFydCA9IHN0YXJ0ICsgaW5jO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufTtcblxuLyoqXG4gKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2ZyL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL09iamV0c19nbG9iYXV4L0FycmF5L2ZpbmRcbiAqIEB0eXBlIHsqfEZ1bmN0aW9ufVxuICogQHByaXZhdGVcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuX2ZpbmQgPSBmdW5jdGlvbihsaXN0LCBwcmVkaWNhdGUpIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGggPj4+IDA7XG4gICAgdmFyIHRoaXNBcmcgPSBsaXN0O1xuICAgIHZhciB2YWx1ZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIGxpc3QpKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX2NsYW1wVHJhbnNsYXRpb25XaXRoU2NhbGUgPSBmdW5jdGlvbih0cmFuc2xhdGUsIHNjYWxlKSB7XG5cbiAgICBzY2FsZSA9IHNjYWxlIHx8IFsxLCAxXTtcblxuICAgIGlmICghKHNjYWxlIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICAgIHNjYWxlID0gW3NjYWxlLCBzY2FsZV07XG4gICAgfVxuXG4gICAgdmFyIHR4ID0gdHJhbnNsYXRlWzBdO1xuICAgIHZhciB0eSA9IHRyYW5zbGF0ZVsxXTtcbiAgICB2YXIgc3ggPSBzY2FsZVswXTtcbiAgICB2YXIgc3kgPSBzY2FsZVsxXTtcblxuICAgIGlmIChzeCA9PT0gMSkge1xuICAgICAgICB0eCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdHggPSBNYXRoLm1pbihNYXRoLm1heCgtdGhpcy5kaW1lbnNpb25zLndpZHRoICogKHN4LTEpLCB0eCksIDApO1xuICAgIH1cblxuICAgIGlmIChzeSA9PT0gMSkge1xuICAgICAgICB0eSA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdHkgPSBNYXRoLm1pbihNYXRoLm1heCgtdGhpcy5kaW1lbnNpb25zLmhlaWdodCAqIChzeS0xKSwgdHkpLCAwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3R4LCB0eV07XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEQzVGFibGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzL2V2ZW50cyc7XG5pbXBvcnQgZDMgZnJvbSAnZDMnO1xuaW1wb3J0IEQzVGFibGUgZnJvbSAnLi9EM1RhYmxlJztcblxuZnVuY3Rpb24gRDNUYWJsZU1hcmtlcihvcHRpb25zKSB7XG5cbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZCh0cnVlLCB7fSwgdGhpcy5kZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RDNUYWJsZX1cbiAgICAgKi9cbiAgICB0aGlzLnRhYmxlID0gbnVsbDtcblxuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLmVsZW1lbnRzID0ge1xuICAgICAgICBsaW5lOiBudWxsLFxuICAgICAgICBsYWJlbDogbnVsbFxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuX21vdmVBRiA9IG51bGw7XG5cbiAgICB0aGlzLnZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0VGltZVVwZGF0ZWQgPSBudWxsO1xufVxuXG5pbmhlcml0cyhEM1RhYmxlTWFya2VyLCBFdmVudEVtaXR0ZXIpO1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5MQVlPVVRfSE9SSVpPTlRBTCA9ICdob3Jpem9udGFsJztcbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLkxBWU9VVF9WRVJUSUNBTCA9ICd2ZXJ0aWNhbCc7XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmRlZmF1bHRzID0ge1xuICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZCkgeyByZXR1cm4gZDsgfSxcbiAgICBvdXRlclRpY2tTaXplOiAxMCxcbiAgICB0aWNrUGFkZGluZzogMTAsXG4gICAgcm91bmRQb3NpdGlvbjogZmFsc2UsXG4gICAgYmVtQmxvY2tOYW1lOiAndGFibGVNYXJrZXInLFxuICAgIGJlbU1vZGlmaWVyOiAnJyxcbiAgICBsYXlvdXQ6IEQzVGFibGVNYXJrZXIucHJvdG90eXBlLkxBWU9VVF9WRVJUSUNBTFxufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtEM1RhYmxlfSB0YWJsZVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zZXRUYWJsZSA9IGZ1bmN0aW9uKHRhYmxlKSB7XG5cbiAgICB2YXIgcHJldmlvdXNUYWJsZSA9IHRoaXMudGFibGU7XG5cbiAgICB0aGlzLnRhYmxlID0gdGFibGUgJiYgdGFibGUgaW5zdGFuY2VvZiBEM1RhYmxlID8gdGFibGUgOiBudWxsO1xuXG4gICAgaWYgKHRoaXMudGFibGUpIHtcbiAgICAgICAgaWYgKHByZXZpb3VzVGFibGUgIT09IHRoaXMudGFibGUpIHtcbiAgICAgICAgICAgIGlmIChwcmV2aW91c1RhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51bmJpbmRUYWJsZShwcmV2aW91c1RhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYmluZFRhYmxlKCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCF0aGlzLnRhYmxlICYmIHByZXZpb3VzVGFibGUpIHtcbiAgICAgICAgdGhpcy51bmJpbmRUYWJsZShwcmV2aW91c1RhYmxlKTtcbiAgICB9XG5cbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnZhbHVlQ29tcGFyYXRvciA9IGZ1bmN0aW9uKHRpbWVBLCB0aW1lQikge1xuICAgIHJldHVybiArdGltZUEgIT09ICt0aW1lQjtcbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24odmFsdWUpIHtcblxuICAgIHZhciBwcmV2aW91c1RpbWVVcGRhdGVkID0gdGhpcy5fbGFzdFRpbWVVcGRhdGVkO1xuXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXG4gICAgaWYgKHRoaXMudmFsdWVDb21wYXJhdG9yKHByZXZpb3VzVGltZVVwZGF0ZWQsIHRoaXMudmFsdWUpICYmIHRoaXMudGFibGUgJiYgdGhpcy5jb250YWluZXIpIHtcblxuICAgICAgICB0aGlzLl9sYXN0VGltZVVwZGF0ZWQgPSB0aGlzLnZhbHVlO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyXG4gICAgICAgICAgICAuZGF0dW0oe1xuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5tb3ZlKCk7XG4gICAgfVxuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YS52YWx1ZTtcbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmJpbmRUYWJsZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSB0aGlzLnRhYmxlLmNvbnRhaW5lclxuICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgLmRhdHVtKHtcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnZhbHVlXG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAodGhpcy5vcHRpb25zLmJlbU1vZGlmaWVyID8gJyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArIHRoaXMub3B0aW9ucy5iZW1Nb2RpZmllciA6ICcnKSArICcgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLS0nICsgdGhpcy5vcHRpb25zLmxheW91dCk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmxpbmUgPSB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctbGluZScpXG4gICAgICAgIC5zdHlsZSgncG9pbnRlci1ldmVudHMnLCAnbm9uZScpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5sYWJlbCA9IHRoaXMuY29udGFpbmVyXG4gICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1sYWJlbCcpO1xuXG4gICAgdGhpcy5zaXplTGluZUFuZExhYmVsKCk7XG5cbiAgICAvLyBvbiB0YWJsZSBtb3ZlLCBtb3ZlIHRoZSBtYXJrZXJcbiAgICB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lciA9IHRoaXMubW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScsIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyKTtcblxuICAgIC8vIG9uIHRhYmxlIHJlc2l6ZSwgcmVzaXplIHRoZSBtYXJrZXIgYW5kIG1vdmUgaXRcbiAgICB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgICAgIHNlbGYucmVzaXplKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIHNlbGYubW92ZSh0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH07XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyKTtcblxuICAgIHRoaXMuZW1pdCgnbWFya2VyOmJvdW5kJyk7XG5cbiAgICB0aGlzLm1vdmUoKTtcblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuc2l6ZUxpbmVBbmRMYWJlbCA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdmFyIGxheW91dCA9IHRoaXMub3B0aW9ucy5sYXlvdXQ7XG5cbiAgICB2YXIgbGluZSA9IHRoaXMuZWxlbWVudHMubGluZTtcbiAgICB2YXIgbGFiZWwgPSB0aGlzLmVsZW1lbnRzLmxhYmVsO1xuXG4gICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgbGluZSA9IGxpbmUudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGxhYmVsID0gbGFiZWwudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfVxuXG4gICAgc3dpdGNoKGxheW91dCkge1xuICAgICAgICBjYXNlIHRoaXMuTEFZT1VUX1ZFUlRJQ0FMOlxuICAgICAgICAgICAgbGluZVxuICAgICAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgeTE6IC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgeTI6IHRoaXMudGFibGUuZGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2R5JywgLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLXRoaXMub3B0aW9ucy50aWNrUGFkZGluZyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0aGlzLkxBWU9VVF9IT1JJWk9OVEFMOlxuICAgICAgICAgICAgbGluZVxuICAgICAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgeDE6IC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgeDI6IHRoaXMudGFibGUuZGltZW5zaW9ucy53aWR0aFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgICAgICAuYXR0cignZHgnLCAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUtdGhpcy5vcHRpb25zLnRpY2tQYWRkaW5nKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsIDQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS51bmJpbmRUYWJsZSA9IGZ1bmN0aW9uKHByZXZpb3VzVGFibGUpIHtcblxuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScsIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIpO1xuXG4gICAgdGhpcy5jb250YWluZXIucmVtb3ZlKCk7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHByZXZpb3VzVGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICAgICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5lbWl0KCdtYXJrZXI6dW5ib3VuZCcsIHByZXZpb3VzVGFibGUpO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBsYXlvdXQgPSB0aGlzLm9wdGlvbnMubGF5b3V0O1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICB0aGlzLnRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fbW92ZUFGID0gdGhpcy50YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgc2VsZi5jb250YWluZXJcbiAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKGQpIHtcblxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNlbGYuZ2V0VmFsdWUoZCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgc2NhbGUsIHBvc2l0aW9uID0gWzAsIDBdLCBwb3NpdGlvbkluZGV4O1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoKGxheW91dCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHNlbGYuTEFZT1VUX1ZFUlRJQ0FMOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGUgPSBzZWxmLnRhYmxlLnNjYWxlcy54O1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25JbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBzZWxmLkxBWU9VVF9IT1JJWk9OVEFMOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGUgPSBzZWxmLnRhYmxlLnNjYWxlcy55O1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25JbmRleCA9IDE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcG9zaXRpb25bcG9zaXRpb25JbmRleF0gPSBzY2FsZSh2YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmFuZ2UgPSBzY2FsZS5yYW5nZSgpO1xuICAgICAgICAgICAgICAgIHZhciBpc0luUmFuZ2UgPSBwb3NpdGlvbltwb3NpdGlvbkluZGV4XSA+PSByYW5nZVswXSAmJiBwb3NpdGlvbltwb3NpdGlvbkluZGV4XSA8PSByYW5nZVtyYW5nZS5sZW5ndGggLSAxXTtcblxuICAgICAgICAgICAgICAgIHZhciBnID0gZDMuc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzSW5SYW5nZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xuXG4gICAgICAgICAgICAgICAgICAgIGcuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyhzZWxmLnRhYmxlLm1hcmdpbi5sZWZ0ICsgcG9zaXRpb25bMF0gPj4gMCkrJywnKyhzZWxmLnRhYmxlLm1hcmdpbi50b3AgKyBwb3NpdGlvblsxXSA+PiAwKSsnKScpO1xuXG4gICAgICAgICAgICAgICAgICAgIGcuc2VsZWN0KCcuJyArIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxhYmVsJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50ZXh0KHNlbGYub3B0aW9ucy5mb3JtYXR0ZXIodmFsdWUpKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29udGFpbmVyLnN0eWxlKCdkaXNwbGF5JywgJycpO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29udGFpbmVyLnN0eWxlKCdkaXNwbGF5JywgJ25vbmUnKTtcbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdGhpcy5zaXplTGluZUFuZExhYmVsKHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZU1hcmtlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZU1hcmtlciBmcm9tICcuL0QzVGFibGVNYXJrZXInO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxuLyoqXG4gKlxuICogQGV4dGVuZHMge0QzVGFibGVNYXJrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUYWJsZU1vdXNlVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZU1hcmtlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuX21vdmVBRiA9IG51bGw7XG5cbiAgICB0aGlzLm9uKCdtYXJrZXI6Ym91bmQnLCB0aGlzLmhhbmRsZVRhYmxlQm91bmQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5vbignbWFya2VyOnVuYm91bmQnLCB0aGlzLmhhbmRsZVRhYmxlVW5ib3VuZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IGZhbHNlO1xufVxuXG5pbmhlcml0cyhEM1RhYmxlTW91c2VUcmFja2VyLCBEM1RhYmxlTWFya2VyKTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGVNYXJrZXIucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtTW9kaWZpZXI6ICctLW1vdXNlVHJhY2tlcicsXG4gICAgbGlzdGVuVG9Ub3VjaEV2ZW50czogdHJ1ZVxufSk7XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZVRhYmxlQm91bmQgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyID0gdGhpcy5oYW5kbGVNb3VzZWVudGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lciA9IHRoaXMuaGFuZGxlTW91c2Vtb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIgPSB0aGlzLmhhbmRsZU1vdXNlbGVhdmUuYmluZCh0aGlzKTtcblxuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VlbnRlcicsIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyKTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdXNlbW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VsZWF2ZScsIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubGlzdGVuVG9Ub3VjaEV2ZW50cykge1xuICAgICAgICB0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMgPSB0cnVlO1xuICAgICAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnRvdWNobW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IGZhbHNlO1xuICAgIH1cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZVRhYmxlVW5ib3VuZCA9IGZ1bmN0aW9uKHByZXZpb3VzVGFibGUpIHtcblxuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VlbnRlcicsIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdXNlbW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VsZWF2ZScsIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMpIHtcbiAgICAgICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzp0b3VjaG1vdmUnLCB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyKTtcbiAgICB9XG5cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcbiAgICBzd2l0Y2ggKHRoaXMub3B0aW9ucy5sYXlvdXQpIHtcbiAgICAgICAgY2FzZSAndmVydGljYWwnOlxuICAgICAgICAgICAgcmV0dXJuIGdldFRpbWUoKTtcbiAgICAgICAgY2FzZSAnaG9yaXpvbnRhbCc6XG4gICAgICAgICAgICByZXR1cm4gZ2V0Um93KCk7XG4gICAgfVxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2VlbnRlciA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHRpbWUgPSB0aGlzLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5zaG93KCk7XG4gICAgICAgIHNlbGYuc2V0VmFsdWUodGltZSk7XG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZU1vdXNlbW92ZSA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciB0aW1lID0gdGhpcy5nZXRWYWx1ZUZyb21UYWJsZUV2ZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fbW92ZUFGID0gdGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNldFZhbHVlKHRpbWUpO1xuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVNb3VzZWxlYXZlID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfSk7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZU1vdXNlVHJhY2tlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZU1hcmtlciBmcm9tICcuL0QzVGFibGVNYXJrZXInO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxuLyoqXG4gKlxuICogQGV4dGVuZHMge0QzVGFibGVNYXJrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUYWJsZVZhbHVlVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZU1hcmtlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG59XG5cbmluaGVyaXRzKEQzVGFibGVWYWx1ZVRyYWNrZXIsIEQzVGFibGVNYXJrZXIpO1xuXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1Nb2RpZmllcjogJy0tdmFsdWVUcmFja2VyJ1xufSk7XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlR2V0dGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgIHJldHVybiAwO1xuXG59O1xuXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAgIGQzLnRpbWVyKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuc2V0VmFsdWUoc2VsZi50aW1lR2V0dGVyKCkpO1xuXG4gICAgICAgIHJldHVybiAhc2VsZi5lbmFibGVkO1xuXG4gICAgfSk7XG59O1xuXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RhYmxlVmFsdWVUcmFja2VyO1xuIiwiLyogZ2xvYmFsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRDNCbG9ja1RhYmxlIGZyb20gJy4vRDNCbG9ja1RhYmxlJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUaW1lbGluZShvcHRpb25zKSB7XG5cbiAgICBEM0Jsb2NrVGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA9IHRoaXMub3B0aW9ucy5taW5pbXVtVGltZUludGVydmFsO1xufVxuXG5pbmhlcml0cyhEM1RpbWVsaW5lLCBEM0Jsb2NrVGFibGUpO1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbUJsb2NrTmFtZTogJ3RpbWVsaW5lJyxcbiAgICBiZW1CbG9ja01vZGlmaWVyOiAnJyxcbiAgICB4QXhpc1RpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkLmdldE1pbnV0ZXMoKSAlIDE1ID8gJycgOiBkMy50aW1lLmZvcm1hdCgnJUg6JU0nKShkKTtcbiAgICB9LFxuICAgIHhBeGlzU3Ryb2tlV2lkdGg6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQuZ2V0TWludXRlcygpICUzMCA/IDEgOiAyO1xuICAgIH0sXG4gICAgbWluaW11bUNvbHVtbldpZHRoOiAzMCxcbiAgICBtaW5pbXVtVGltZUludGVydmFsOiAzZTUsXG4gICAgYXZhaWxhYmxlVGltZUludGVydmFsczogWyA2ZTQsIDNlNSwgOWU1LCAxLjhlNiwgMy42ZTYsIDcuMmU2LCAxLjQ0ZTcsIDIuODhlNywgNC4zMmU3LCA4LjY0ZTcgXVxufSk7XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLnhTY2FsZUZhY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMudGltZS5zY2FsZSgpO1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUueVNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKTtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLmdldERhdGFTdGFydCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5zdGFydDtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLmdldERhdGFFbmQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZW5kO1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwgPSBmdW5jdGlvbih0aW1lSW50ZXJ2YWwpIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsZXMueChuZXcgRGF0ZSh0aW1lSW50ZXJ2YWwpKSAtIHRoaXMuc2NhbGVzLngobmV3IERhdGUoMCkpO1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUudXBkYXRlWEF4aXNJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIG1pbmltdW1UaW1lSW50ZXJ2YWwgPSB0aGlzLm9wdGlvbnMubWluaW11bVRpbWVJbnRlcnZhbDtcbiAgICB2YXIgbWluaW11bUNvbHVtbldpZHRoID0gdGhpcy5vcHRpb25zLm1pbmltdW1Db2x1bW5XaWR0aDtcbiAgICB2YXIgY3VycmVudFRpbWVJbnRlcnZhbCA9IHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbDtcbiAgICB2YXIgYXZhaWxhYmxlVGltZUludGVydmFscyA9IHRoaXMub3B0aW9ucy5hdmFpbGFibGVUaW1lSW50ZXJ2YWxzO1xuICAgIHZhciBjdXJyZW50VGltZUludGVydmFsSW5kZXggPSBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzLmluZGV4T2YoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgdmFyIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHRoaXMuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbCk7XG5cbiAgICBmdW5jdGlvbiB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoZGVsdGEpIHtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4ICs9IGRlbHRhO1xuICAgICAgICBjdXJyZW50VGltZUludGVydmFsID0gYXZhaWxhYmxlVGltZUludGVydmFsc1tjdXJyZW50VGltZUludGVydmFsSW5kZXhdO1xuICAgICAgICBjdXJyZW50Q29sdW1uV2lkdGggPSBzZWxmLl9jb21wdXRlQ29sdW1uV2lkdGhGcm9tVGltZUludGVydmFsKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuICAgIH1cblxuICAgIGlmIChhdmFpbGFibGVUaW1lSW50ZXJ2YWxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKGN1cnJlbnRDb2x1bW5XaWR0aCA8IG1pbmltdW1Db2x1bW5XaWR0aCkge1xuICAgICAgICAgICAgd2hpbGUoY3VycmVudENvbHVtbldpZHRoIDwgbWluaW11bUNvbHVtbldpZHRoICYmIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCA8IGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbCgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50Q29sdW1uV2lkdGggPiBtaW5pbXVtQ29sdW1uV2lkdGgpIHtcbiAgICAgICAgICAgIHdoaWxlKGN1cnJlbnRDb2x1bW5XaWR0aCA+IG1pbmltdW1Db2x1bW5XaWR0aCAmJiBjdXJyZW50VGltZUludGVydmFsSW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlVGltZUludGVydmFsKC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbCgxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjdXJyZW50VGltZUludGVydmFsIDwgbWluaW11bVRpbWVJbnRlcnZhbCkge1xuICAgICAgICBjdXJyZW50VGltZUludGVydmFsID0gbWluaW11bVRpbWVJbnRlcnZhbDtcbiAgICAgICAgY3VycmVudENvbHVtbldpZHRoID0gc2VsZi5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbChjdXJyZW50VGltZUludGVydmFsKVxuICAgIH1cblxuICAgIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA9IE1hdGguZmxvb3IoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgdGhpcy5jb2x1bW5XaWR0aCA9IE1hdGguZmxvb3IoY3VycmVudENvbHVtbldpZHRoKTtcblxuICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiAzLjZlNikge1xuICAgICAgICB0aGlzLmF4aXNlcy54LnRpY2tzKGQzLnRpbWUuaG91cnMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDMuNmU2ICk7XG4gICAgICAgIHRoaXMuYXhpc2VzLngyLnRpY2tzKGQzLnRpbWUuaG91cnMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDMuNmU2ICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA+IDZlNCkge1xuICAgICAgICB0aGlzLmF4aXNlcy54LnRpY2tzKGQzLnRpbWUubWludXRlcywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gNmU0ICk7XG4gICAgICAgIHRoaXMuYXhpc2VzLngyLnRpY2tzKGQzLnRpbWUubWludXRlcywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gNmU0ICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA+IDFlMykge1xuICAgICAgICB0aGlzLmF4aXNlcy54LnRpY2tzKGQzLnRpbWUuc2Vjb25kcywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gMWUzICk7XG4gICAgICAgIHRoaXMuYXhpc2VzLngyLnRpY2tzKGQzLnRpbWUuc2Vjb25kcywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gMWUzICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5zZXRUaW1lUmFuZ2UgPSBmdW5jdGlvbihtaW5EYXRlLCBtYXhEYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFJhbmdlKG1pbkRhdGUsIG1heERhdGUpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNUaW1lbGluZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZVZhbHVlVHJhY2tlciBmcm9tICcuL0QzVGFibGVWYWx1ZVRyYWNrZXInO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxuLyoqXG4gKlxuICogQGV4dGVuZHMge0QzVGFibGVWYWx1ZVRyYWNrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUaW1lbGluZVRpbWVUcmFja2VyKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlVmFsdWVUcmFja2VyLmNhbGwodGhpcywgb3B0aW9ucyk7XG59XG5cbmluaGVyaXRzKEQzVGltZWxpbmVUaW1lVHJhY2tlciwgRDNUYWJsZVZhbHVlVHJhY2tlcik7XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtQmxvY2tOYW1lOiAndGltZWxpbmVNYXJrZXInLFxuICAgIGJlbU1vZGlmaWVyOiAnLS10aW1lVHJhY2tlcicsXG4gICAgbGF5b3V0OiAndmVydGljYWwnXG59KTtcblxuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS50aW1lR2V0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCk7XG59O1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnRpbWVDb21wYXJhdG9yID0gZnVuY3Rpb24oYSxiKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVDb21wYXJhdG9yKGEsYik7XG59O1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnNldFRpbWUgPSBmdW5jdGlvbih0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGltZSk7XG59O1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnNldFRpbWVsaW5lID0gZnVuY3Rpb24odGltZWxpbmUpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRUYWJsZSh0aW1lbGluZSk7XG59O1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlR2V0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudGltZUdldHRlcigpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RpbWVsaW5lVGltZVRyYWNrZXI7XG4iXX0=
(1)
});
;