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
    tickPadding: 10,
    roundPosition: false,
    bemBlockName: 'tableMarker',
    bemModifiers: [],
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
    previousTable.removeListener(previousTable.options.bemBlockName + ':destroy', this._tableDestroyListener);

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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9pbmRleC5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL3NyYy9EM0Jsb2NrVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzNELE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOzs7QUNSakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBLFlBQVksQ0FBQzs7Ozs7Ozs7dUJBRU8sV0FBVzs7Ozt3QkFDVixVQUFVOzs7O3NCQUNaLFFBQVE7Ozs7Ozs7Ozs7QUFPM0IsU0FBUyxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQzNCLHlCQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDL0I7O0FBRUQsMkJBQVMsWUFBWSx1QkFBVSxDQUFDOztBQUVoQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyx5QkFBTyxJQUFJLEVBQUUsRUFBRSxFQUFFLHFCQUFRLFNB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TyxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ3JELFdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM5QixDQUFDOztBQUVGLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBUyxRQUFRLEVBQUU7QUFDN0QsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ2xDLENBQUM7O0FBRUYscUJBQXFCLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxZQUFXO0FBQ3JELFdBQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0NBQzVCLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzLkQzVGFibGUgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM0Jsb2NrVGFibGUgPSByZXF1aXJlKCcuL3NyYy9EM0Jsb2NrVGFibGUuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGltZWxpbmUgPSByZXF1aXJlKCcuL3NyYy9EM1RpbWVsaW5lLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlTWFya2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZU1hcmtlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZU1vdXNlVHJhY2tlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGFibGVWYWx1ZVRyYWNrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlVmFsdWVUcmFja2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RpbWVsaW5lVGltZVRyYWNrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RpbWVsaW5lVGltZVRyYWNrZXIuanMnKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIGlzQXJyYXkoYXJyKSB7XG5cdGlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGFycik7XG5cdH1cblxuXHRyZXR1cm4gdG9TdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRpZiAoIW9iaiB8fCB0b1N0ci5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGhhc093bkNvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc0lzUHJvdG90eXBlT2YgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc093bkNvbnN0cnVjdG9yICYmICFoYXNJc1Byb3RvdHlwZU9mKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gT3duIHByb3BlcnRpZXMgYXJlIGVudW1lcmF0ZWQgZmlyc3RseSwgc28gdG8gc3BlZWQgdXAsXG5cdC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBvYmopIHsvKiovfVxuXG5cdHJldHVybiB0eXBlb2Yga2V5ID09PSAndW5kZWZpbmVkJyB8fCBoYXNPd24uY2FsbChvYmosIGtleSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCgpIHtcblx0dmFyIG9wdGlvbnMsIG5hbWUsIHNyYywgY29weSwgY29weUlzQXJyYXksIGNsb25lLFxuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1swXSxcblx0XHRpID0gMSxcblx0XHRsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuXHRcdGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH0gZWxzZSBpZiAoKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnICYmIHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicpIHx8IHRhcmdldCA9PSBudWxsKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdH1cblxuXHRmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1tpXTtcblx0XHQvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG5cdFx0aWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuXHRcdFx0Ly8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuXHRcdFx0Zm9yIChuYW1lIGluIG9wdGlvbnMpIHtcblx0XHRcdFx0c3JjID0gdGFyZ2V0W25hbWVdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG5cdFx0XHRcdGlmICh0YXJnZXQgIT09IGNvcHkpIHtcblx0XHRcdFx0XHQvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBhcnJheXNcblx0XHRcdFx0XHRpZiAoZGVlcCAmJiBjb3B5ICYmIChpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IGlzQXJyYXkoY29weSkpKSkge1xuXHRcdFx0XHRcdFx0aWYgKGNvcHlJc0FycmF5KSB7XG5cdFx0XHRcdFx0XHRcdGNvcHlJc0FycmF5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIE5ldmVyIG1vdmUgb3JpZ2luYWwgb2JqZWN0cywgY2xvbmUgdGhlbVxuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gZXh0ZW5kKGRlZXAsIGNsb25lLCBjb3B5KTtcblxuXHRcdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb3B5ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gY29weTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGUgZnJvbSAnLi9EM1RhYmxlJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbi8qKlxuICpcbiAqIEBleHRlbmRzIHtEM1RhYmxlfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzQmxvY2tUYWJsZShvcHRpb25zKSB7XG4gICAgRDNUYWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xufVxuXG5pbmhlcml0cyhEM0Jsb2NrVGFibGUsIEQzVGFibGUpO1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGNsaXBFbGVtZW50OiB0cnVlLFxuICAgIGNsaXBFbGVtZW50RmlsdGVyOiBudWxsLFxuICAgIHJlbmRlck9uQXV0b21hdGljU2Nyb2xsSWRsZTogdHJ1ZSxcbiAgICBoaWRlVGlja3NPbkF1dG9tYXRpY1Njcm9sbDogZmFsc2UsXG4gICAgYXV0b21hdGljU2Nyb2xsU3BlZWRNdWx0aXBsaWVyOiAyZS00LFxuICAgIGF1dG9tYXRpY1Njcm9sbE1hcmdpbkRlbHRhOiAzMCxcbiAgICBhcHBlbmRUZXh0OiB0cnVlLFxuICAgIGFsaWduTGVmdDogdHJ1ZSxcbiAgICBhbGlnbk9uVHJhbnNsYXRlOiB0cnVlLFxuICAgIG1heGltdW1DbGlja0RyYWdUaW1lOiAxMDAsXG4gICAgbWF4aW11bUNsaWNrRHJhZ0Rpc3RhbmNlOiAxMixcbiAgICBtaW5pbXVtRHJhZ0Rpc3RhbmNlOiA1XG59KTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBQYXRoSWQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRDbGlwUGF0aF8nICsgdGhpcy5pbnN0YW5jZU51bWJlciArICdfJyArIGQudWlkO1xufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBSZWN0TGluayA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gJyMnICsgdGhpcy5nZW5lcmF0ZUNsaXBSZWN0SWQoZCk7XG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFBhdGhMaW5rID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiAndXJsKCMnICsgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoSWQoZCkgKyAnKSc7XG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFJlY3RJZCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENsaXBSZWN0XycgKyB0aGlzLmluc3RhbmNlTnVtYmVyICsgJ18nICsgZC51aWQ7XG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRFbnRlciA9IGZ1bmN0aW9uKHNlbGVjdGlvbikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGVsZW1lbnRIZWlnaHQgPSB0aGlzLm9wdGlvbnMucm93SGVpZ2h0IC0gdGhpcy5vcHRpb25zLnJvd1BhZGRpbmcgKiAyO1xuXG4gICAgdmFyIHJlY3QgPSBzZWxlY3Rpb25cbiAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRCYWNrZ3JvdW5kJylcbiAgICAgICAgLmF0dHIoJ2hlaWdodCcsIGVsZW1lbnRIZWlnaHQpO1xuXG4gICAgdmFyIGcgPSBzZWxlY3Rpb25cbiAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRDb250ZW50Jyk7XG5cbiAgICBnLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpO1xuXG5cbiAgICB2YXIgY2xpcEVsZW1lbnQgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xpcEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuY2xpcEVsZW1lbnRGaWx0ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNsaXBFbGVtZW50ID0gISF0aGlzLm9wdGlvbnMuY2xpcEVsZW1lbnRGaWx0ZXIuY2FsbCh0aGlzLCBzZWxlY3Rpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xpcEVsZW1lbnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNsaXBFbGVtZW50KSB7XG5cbiAgICAgICAgZ1xuICAgICAgICAgICAgLmF0dHIoJ2NsaXAtcGF0aCcsIHRoaXMuZ2VuZXJhdGVDbGlwUGF0aExpbmsuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgcmVjdFxuICAgICAgICAgICAgLnByb3BlcnR5KCdpZCcsIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdElkLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHNlbGVjdGlvbi5hcHBlbmQoJ2NsaXBQYXRoJylcbiAgICAgICAgICAgIC5wcm9wZXJ0eSgnaWQnLCB0aGlzLmdlbmVyYXRlQ2xpcFBhdGhJZC5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLmFwcGVuZCgndXNlJylcbiAgICAgICAgICAgIC5hdHRyKCd4bGluazpocmVmJywgdGhpcy5nZW5lcmF0ZUNsaXBSZWN0TGluay5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBzZWxlY3Rpb24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZCkge1xuICAgICAgICBpZiAoIWQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6Y2xpY2snLCBzZWxlY3Rpb24sIG51bGwsIFtkXSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kVGV4dCkge1xuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy50aW1lbGluZS1lbGVtZW50TW92YWJsZUNvbnRlbnQnKVxuICAgICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAuY2xhc3NlZCgndGltZWxpbmUtZW50aXR5TGFiZWwnLCB0cnVlKVxuICAgICAgICAgICAgLmF0dHIoJ2R5JywgdGhpcy5vcHRpb25zLnJvd0hlaWdodC8yICsgNCk7XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uLmNhbGwodGhpcy5lbGVtZW50Q29udGVudEVudGVyLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5iaW5kRHJhZ0FuZERyb3BPblNlbGVjdGlvbihzZWxlY3Rpb24pO1xuXG59O1xuXG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudHNUcmFuc2xhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kVGV4dCAmJiB0aGlzLm9wdGlvbnMuYWxpZ25MZWZ0ICYmIHRoaXMub3B0aW9ucy5hbGlnbk9uVHJhbnNsYXRlICYmICFkLl9kZWZhdWx0UHJldmVudGVkKSB7XG5cbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpXG4gICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyBNYXRoLm1heCgtc2VsZi5zY2FsZXMueChzZWxmLmdldERhdGFTdGFydChkKSksIDIpICsgJywwKSdcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50Q29udGVudEVudGVyID0gZnVuY3Rpb24oKSB7fTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50Q29udGVudFVwZGF0ZSA9IGZ1bmN0aW9uKCkge307XG5cblxuLy8gQHRvZG8gY2xlYW4gdXBcbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuYmluZERyYWdBbmREcm9wT25TZWxlY3Rpb24gPSBmdW5jdGlvbihzZWxlY3Rpb24pIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYm9keU5vZGUgPSBzZWxmLmVsZW1lbnRzLmJvZHkubm9kZSgpO1xuICAgIHZhciBkcmFnU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgLy8gcG9zaXRpb25zXG4gICAgdmFyIGN1cnJlbnRUcmFuc2Zvcm0gPSBudWxsO1xuICAgIHZhciBvcmlnaW5UcmFuc2Zvcm1TdHJpbmcgPSBudWxsO1xuICAgIHZhciBkcmFnU3RhcnRYID0gMCwgZHJhZ1N0YXJ0WSA9IDA7XG4gICAgdmFyIGVsZW1lbnRTdGFydFggPSAwLCBlbGVtZW50U3RhcnRZID0gMDtcbiAgICB2YXIgZHJhZ1Bvc2l0aW9uO1xuICAgIHZhciBzdGFydERyYWdQb3NpdGlvbjtcblxuICAgIC8vIG1vdmVtZW50c1xuICAgIHZhciB2ZXJ0aWNhbE1vdmUgPSAwO1xuICAgIHZhciBob3Jpem9udGFsTW92ZSA9IDA7XG4gICAgdmFyIHZlcnRpY2FsU3BlZWQgPSAwO1xuICAgIHZhciBob3Jpem9udGFsU3BlZWQgPSAwO1xuICAgIHZhciB0aW1lckFjdGl2ZSA9IGZhbHNlO1xuICAgIHZhciBuZWVkVGltZXJTdG9wID0gZmFsc2U7XG4gICAgdmFyIHN0YXJ0VGltZTtcblxuICAgIC8vIHJlc2V0IHN0YXJ0IHBvc2l0aW9uOiB0byBjYWxsIG9uIGRyYWcgc3RhcnQgb3Igd2hlbiB0aGluZ3MgYXJlIHJlZHJhd25cbiAgICBmdW5jdGlvbiBzdG9yZVN0YXJ0KCkge1xuICAgICAgICBjdXJyZW50VHJhbnNmb3JtID0gZDMudHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybVN0cmluZyA9IHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nKSk7XG4gICAgICAgIGVsZW1lbnRTdGFydFggPSBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVswXTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WSA9IGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdO1xuICAgICAgICBkcmFnU3RhcnRYID0gZHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICBkcmFnU3RhcnRZID0gZHJhZ1Bvc2l0aW9uWzFdO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBuZXcgZHJhZyBwb3NpdGlvbiBhbmQgbW92ZSB0aGUgZWxlbWVudFxuICAgIGZ1bmN0aW9uIHVwZGF0ZVRyYW5zZm9ybShmb3JjZURyYXcpIHtcblxuICAgICAgICB2YXIgZGVsdGFYID0gZHJhZ1Bvc2l0aW9uWzBdIC0gZHJhZ1N0YXJ0WDtcbiAgICAgICAgdmFyIGRlbHRhWSA9IGRyYWdQb3NpdGlvblsxXSAtIGRyYWdTdGFydFk7XG5cbiAgICAgICAgaWYgKGZvcmNlRHJhdyB8fCAhc2VsZi5vcHRpb25zLnJlbmRlck9uSWRsZSkge1xuICAgICAgICAgICAgc3RvcmVTdGFydChkcmFnUG9zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMF0gPSBlbGVtZW50U3RhcnRYICsgZGVsdGFYO1xuICAgICAgICBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXSA9IGVsZW1lbnRTdGFydFkgKyBkZWx0YVk7XG5cbiAgICAgICAgc2VsZWN0aW9uLmF0dHIoJ3RyYW5zZm9ybScsIGN1cnJlbnRUcmFuc2Zvcm0udG9TdHJpbmcoKSk7XG5cbiAgICB9XG5cbiAgICAvLyB0YWtlIG1pY3JvIHNlY29uZHMgaWYgcG9zc2libGVcbiAgICB2YXIgZ2V0UHJlY2lzZVRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2UgJiYgdHlwZW9mIHBlcmZvcm1hbmNlLm5vdyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIHBlcmZvcm1hbmNlLm5vdy5iaW5kKHBlcmZvcm1hbmNlKVxuICAgICAgICA6IHR5cGVvZiBEYXRlLm5vdyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICBEYXRlLm5vdy5iaW5kKERhdGUpXG4gICAgICAgICAgICA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiArKG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgfTtcblxuICAgIC8vIGhhbmRsZSBhdXRvbWF0aWMgc2Nyb2xsIGFyZ3VtZW50c1xuICAgIGZ1bmN0aW9uIGRvQXV0b21hdGljU2Nyb2xsKHRpbWVEZWx0YSwgZm9yY2VEcmF3KSB7XG5cbiAgICAgICAgLy8gY29tcHV0ZSBkZWx0YXMgYmFzZWQgb24gZGlyZWN0aW9uLCBzcGVlZCBhbmQgdGltZSBkZWx0YVxuICAgICAgICB2YXIgc3BlZWRNdWx0aXBsaWVyID0gc2VsZi5vcHRpb25zLmF1dG9tYXRpY1Njcm9sbFNwZWVkTXVsdGlwbGllcjtcbiAgICAgICAgdmFyIGRlbHRhWCA9IGhvcml6b250YWxNb3ZlICogaG9yaXpvbnRhbFNwZWVkICogdGltZURlbHRhICogc3BlZWRNdWx0aXBsaWVyO1xuICAgICAgICB2YXIgZGVsdGFZID0gdmVydGljYWxNb3ZlICogdmVydGljYWxTcGVlZCAqIHRpbWVEZWx0YSAqIHNwZWVkTXVsdGlwbGllcjtcblxuICAgICAgICAvLyB0YWtlIGdyb3VwIHRyYW5zbGF0ZSBjYW5jZWxsYXRpb24gd2l0aCBmb3JjZWQgcmVkcmF3IGludG8gYWNjb3VudCwgc28gcmVkZWZpbmUgc3RhcnRcbiAgICAgICAgaWYgKGZvcmNlRHJhdykge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZS5zbGljZSgwKTtcbiAgICAgICAgICAgIGVsZW1lbnRTdGFydFggKz0gY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMF07XG4gICAgICAgICAgICBlbGVtZW50U3RhcnRZICs9IGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlYWxNb3ZlID0gc2VsZi5tb3ZlKGRlbHRhWCwgZGVsdGFZLCBmb3JjZURyYXcsIGZhbHNlLCAhc2VsZi5vcHRpb25zLmhpZGVUaWNrc09uQXV0b21hdGljU2Nyb2xsKTtcblxuICAgICAgICBpZiAocmVhbE1vdmVbMl0gfHwgcmVhbE1vdmVbM10pIHtcbiAgICAgICAgICAgIHVwZGF0ZVRyYW5zZm9ybShmb3JjZURyYXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudFN0YXJ0WCAtPSByZWFsTW92ZVsyXTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WSAtPSByZWFsTW92ZVszXTtcblxuICAgICAgICBuZWVkVGltZXJTdG9wID0gcmVhbE1vdmVbMl0gPT09IDAgJiYgcmVhbE1vdmVbM10gPT09IDA7XG4gICAgfVxuXG5cbiAgICB2YXIgZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKVxuICAgICAgICAub24oJ2RyYWdzdGFydCcsIGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0YXJ0RHJhZ1Bvc2l0aW9uID0gZHJhZ1Bvc2l0aW9uID0gZDMubW91c2UoYm9keU5vZGUpO1xuXG4gICAgICAgICAgICBzdGFydFRpbWUgPSArbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgc3RvcmVTdGFydCgpO1xuXG4gICAgICAgICAgICBkYXRhLl9kZWZhdWx0UHJldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYuX2Zyb3plblVpZHMucHVzaChkYXRhLnVpZCk7XG5cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdkcmFnJywgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICBkcmFnUG9zaXRpb24gPSBkMy5tb3VzZShib2R5Tm9kZSk7XG5cbiAgICAgICAgICAgIGlmICghZHJhZ1N0YXJ0ZWQpIHtcblxuICAgICAgICAgICAgICAgIHZhciB0aW1lRGVsdGEgPSArbmV3IERhdGUoKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICB2YXIgdG90YWxEZWx0YVggPSBkcmFnUG9zaXRpb25bMF0gLSBzdGFydERyYWdQb3NpdGlvblswXTtcbiAgICAgICAgICAgICAgICB2YXIgdG90YWxEZWx0YVkgPSBkcmFnUG9zaXRpb25bMV0gLSBzdGFydERyYWdQb3NpdGlvblsxXTtcbiAgICAgICAgICAgICAgICB2YXIgZHJhZ0Rpc3RhbmNlID0gTWF0aC5zcXJ0KHRvdGFsRGVsdGFYKnRvdGFsRGVsdGFYK3RvdGFsRGVsdGFZKnRvdGFsRGVsdGFZKTtcblxuICAgICAgICAgICAgICAgIGRyYWdTdGFydGVkID0gKHRpbWVEZWx0YSA+IHNlbGYub3B0aW9ucy5tYXhpbXVtQ2xpY2tEcmFnVGltZSB8fCBkcmFnRGlzdGFuY2UgPiBzZWxmLm9wdGlvbnMubWF4aW11bUNsaWNrRHJhZ0Rpc3RhbmNlKSAmJiBkcmFnRGlzdGFuY2UgPiBzZWxmLm9wdGlvbnMubWluaW11bURyYWdEaXN0YW5jZTtcblxuICAgICAgICAgICAgICAgIGlmIChkcmFnU3RhcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OmRyYWdzdGFydCcsIHNlbGVjdGlvbiwgbnVsbCwgW2RhdGFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkcmFnU3RhcnRlZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6ZHJhZycsIHNlbGVjdGlvbiwgbnVsbCwgW2RhdGFdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG1hcmdpbkRlbHRhID0gc2VsZi5vcHRpb25zLmF1dG9tYXRpY1Njcm9sbE1hcmdpbkRlbHRhO1xuICAgICAgICAgICAgdmFyIGRSaWdodCA9IG1hcmdpbkRlbHRhIC0gKHNlbGYuZGltZW5zaW9ucy53aWR0aCAtIGRyYWdQb3NpdGlvblswXSk7XG4gICAgICAgICAgICB2YXIgZExlZnQgPSBtYXJnaW5EZWx0YSAtIGRyYWdQb3NpdGlvblswXTtcbiAgICAgICAgICAgIHZhciBkQm90dG9tID0gbWFyZ2luRGVsdGEgLSAoc2VsZi5kaW1lbnNpb25zLmhlaWdodCAtIGRyYWdQb3NpdGlvblsxXSk7XG4gICAgICAgICAgICB2YXIgZFRvcCA9IG1hcmdpbkRlbHRhIC0gZHJhZ1Bvc2l0aW9uWzFdO1xuXG4gICAgICAgICAgICBob3Jpem9udGFsU3BlZWQgPSBNYXRoLnBvdyhNYXRoLm1heChkUmlnaHQsIGRMZWZ0LCBtYXJnaW5EZWx0YSksIDIpO1xuICAgICAgICAgICAgdmVydGljYWxTcGVlZCA9IE1hdGgucG93KE1hdGgubWF4KGRCb3R0b20sIGRUb3AsIG1hcmdpbkRlbHRhKSwgMik7XG5cbiAgICAgICAgICAgIHZhciBwcmV2aW91c0hvcml6b250YWxNb3ZlID0gaG9yaXpvbnRhbE1vdmU7XG4gICAgICAgICAgICB2YXIgcHJldmlvdXNWZXJ0aWNhbE1vdmUgPSB2ZXJ0aWNhbE1vdmU7XG4gICAgICAgICAgICBob3Jpem9udGFsTW92ZSA9IGRSaWdodCA+IDAgPyAtMSA6IGRMZWZ0ID4gMCA/IDEgOiAwO1xuICAgICAgICAgICAgdmVydGljYWxNb3ZlID0gZEJvdHRvbSA+IDAgPyAtMSA6IGRUb3AgPiAwID8gMSA6IDA7XG5cbiAgICAgICAgICAgIHZhciBoYXNDaGFuZ2VkU3RhdGUgPSBwcmV2aW91c0hvcml6b250YWxNb3ZlICE9PSBob3Jpem9udGFsTW92ZSB8fCBwcmV2aW91c1ZlcnRpY2FsTW92ZSAhPT0gdmVydGljYWxNb3ZlO1xuXG4gICAgICAgICAgICBpZiAoKGhvcml6b250YWxNb3ZlIHx8IHZlcnRpY2FsTW92ZSkgJiYgIXRpbWVyQWN0aXZlICYmIGhhc0NoYW5nZWRTdGF0ZSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHRpbWVyU3RhcnRUaW1lID0gZ2V0UHJlY2lzZVRpbWUoKTtcblxuICAgICAgICAgICAgICAgIHRpbWVyQWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIGQzLnRpbWVyKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VGltZSA9IGdldFByZWNpc2VUaW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lRGVsdGEgPSBjdXJyZW50VGltZSAtIHRpbWVyU3RhcnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lcldpbGxTdG9wID0gIXZlcnRpY2FsTW92ZSAmJiAhaG9yaXpvbnRhbE1vdmUgfHwgbmVlZFRpbWVyU3RvcDtcblxuICAgICAgICAgICAgICAgICAgICBkb0F1dG9tYXRpY1Njcm9sbCh0aW1lRGVsdGEsIHNlbGYub3B0aW9ucy5yZW5kZXJPbkF1dG9tYXRpY1Njcm9sbElkbGUgJiYgdGltZXJXaWxsU3RvcCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGltZXJTdGFydFRpbWUgPSBjdXJyZW50VGltZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZXJXaWxsU3RvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmVlZFRpbWVyU3RvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXJBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lcldpbGxTdG9wO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2VsZi5fZHJhZ0FGKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYW5jZWxBbmltYXRpb25GcmFtZShzZWxmLl9kcmFnQUYpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLl9kcmFnQUYgPSBzZWxmLnJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGVUcmFuc2Zvcm0pO1xuXG4gICAgICAgIH0pXG4gICAgICAgIC5vbignZHJhZ2VuZCcsIGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgc2VsZi5jYW5jZWxBbmltYXRpb25GcmFtZShzZWxmLl9kcmFnQUYpO1xuICAgICAgICAgICAgc2VsZi5fZHJhZ0FGID0gbnVsbDtcbiAgICAgICAgICAgIGhvcml6b250YWxNb3ZlID0gMDtcbiAgICAgICAgICAgIHZlcnRpY2FsTW92ZSA9IDA7XG5cbiAgICAgICAgICAgIGRhdGEuX2RlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHNlbGYuX2Zyb3plblVpZHMuc3BsaWNlKHNlbGYuX2Zyb3plblVpZHMuaW5kZXhPZihkYXRhLnVpZCksIDEpO1xuXG4gICAgICAgICAgICBkMy50aW1lci5mbHVzaCgpO1xuXG4gICAgICAgICAgICB2YXIgZGVsdGFGcm9tVG9wTGVmdENvcm5lciA9IGQzLm1vdXNlKHNlbGVjdGlvbi5ub2RlKCkpO1xuICAgICAgICAgICAgdmFyIGhhbGZIZWlnaHQgPSBzZWxmLm9wdGlvbnMucm93SGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG5cbiAgICAgICAgICAgIGlmIChkcmFnU3RhcnRlZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6ZHJhZ2VuZCcsIHNlbGVjdGlvbiwgWy1kZWx0YUZyb21Ub3BMZWZ0Q29ybmVyWzBdLCAtZGVsdGFGcm9tVG9wTGVmdENvcm5lclsxXSArIGhhbGZIZWlnaHRdLCBbZGF0YV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24uYXR0cigndHJhbnNmb3JtJywgb3JpZ2luVHJhbnNmb3JtU3RyaW5nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZlxuICAgICAgICAgICAgICAgIC51cGRhdGVZKClcbiAgICAgICAgICAgICAgICAuZHJhd1lBeGlzKCk7XG5cbiAgICAgICAgICAgIGRyYWdTdGFydGVkID0gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgc2VsZWN0aW9uLmNhbGwoZHJhZyk7XG5cbn07XG5cblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50VXBkYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBkLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMud3JhcFdpdGhBbmltYXRpb24oc2VsZWN0aW9uLnNlbGVjdCgnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50QmFja2dyb3VuZCcpLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgIHk6IHRoaXMub3B0aW9ucy5yb3dQYWRkaW5nLFxuICAgICAgICAgICAgd2lkdGg6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5zY2FsZXMueChzZWxmLmdldERhdGFFbmQoZCkpIC0gc2VsZi5zY2FsZXMueChzZWxmLmdldERhdGFTdGFydChkKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZFRleHQgJiYgdGhpcy5vcHRpb25zLmFsaWduTGVmdCAmJiAhZC5fZGVmYXVsdFByZXZlbnRlZCkge1xuXG4gICAgICAgIHNlbGVjdGlvblxuICAgICAgICAgICAgLnNlbGVjdCgnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50TW92YWJsZUNvbnRlbnQnKVxuICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGQgPT4gJ3RyYW5zbGF0ZSgnICsgTWF0aC5tYXgoLXRoaXMuc2NhbGVzLngodGhpcy5nZXREYXRhU3RhcnQoZCkpLCAyKSArICcsMCknKTtcbiAgICB9XG5cbiAgICBzZWxlY3Rpb24uY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5lbGVtZW50Q29udGVudFVwZGF0ZShzZWxlY3Rpb24sIGQsIHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfSk7XG5cbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudEV4aXQgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHtcblxuICAgIHNlbGVjdGlvbi5vbignY2xpY2snLCBudWxsKTtcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNCbG9ja1RhYmxlO1xuIiwiLyogZ2xvYmFsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cy9ldmVudHMnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcblxuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEQzVGFibGVSb3dcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfE51bWJlcn0gaWRcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBuYW1lXG4gKiBAcHJvcGVydHkge0FycmF5PEQzVGFibGVFbGVtZW50Pn0gZWxlbWVudHNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEQzVGFibGVFbGVtZW50XG4gKiBAcHJvcGVydHkge1N0cmluZ3xOdW1iZXJ9IGlkXG4gKiBAcHJvcGVydHkge1N0cmluZ3xOdW1iZXJ9IHVpZFxuICogQHByb3BlcnR5IHtOdW1iZXJ9IHN0YXJ0XG4gKiBAcHJvcGVydHkge051bWJlcn0gZW5kXG4gKiBAcHJvcGVydHkge051bWJlcn0gW3Jvd0luZGV4XVxuICovXG5cblxuLyoqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGFibGUob3B0aW9ucykge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICBEM1RhYmxlLmluc3RhbmNlc0NvdW50ICs9IDE7XG5cbiAgICB0aGlzLmluc3RhbmNlTnVtYmVyID0gRDNUYWJsZS5pbnN0YW5jZXNDb3VudDtcblxuICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZCh0cnVlLCB7fSwgdGhpcy5kZWZhdWx0cywgb3B0aW9ucyk7XG5cblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheTxEM1RhYmxlUm93Pn1cbiAgICAgKi9cbiAgICB0aGlzLmRhdGEgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheTxEM1RhYmxlRWxlbWVudD59XG4gICAgICovXG4gICAgdGhpcy5mbGF0dGVuZWREYXRhID0gW107XG5cblxuICAgIHRoaXMubWFyZ2luID0ge1xuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICBib3R0b206IDAsXG4gICAgICAgIGxlZnQ6IDBcbiAgICB9O1xuXG4gICAgdGhpcy5kaW1lbnNpb25zID0geyB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG5cbiAgICB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gWzAuMCwgMC4wXTtcblxuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcblxuICAgIHRoaXMuZWxlbWVudHMgPSB7XG4gICAgICAgIGJvZHk6IG51bGwsXG4gICAgICAgIGlubmVyQ29udGFpbmVyOiBudWxsLFxuICAgICAgICB4QXhpc0NvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgeDJBeGlzQ29udGFpbmVyOiBudWxsLFxuICAgICAgICB5QXhpc0NvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgZGVmczogbnVsbCxcbiAgICAgICAgY2xpcDogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLnNjYWxlcyA9IHtcbiAgICAgICAgeDogbnVsbCxcbiAgICAgICAgeTogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLmF4aXNlcyA9IHtcbiAgICAgICAgeDogbnVsbCxcbiAgICAgICAgeDI6IG51bGwsXG4gICAgICAgIHk6IG51bGxcbiAgICB9O1xuXG4gICAgdGhpcy5iZWhhdmlvcnMgPSB7XG4gICAgICAgIHpvb206IG51bGwsXG4gICAgICAgIHpvb21YOiBudWxsLFxuICAgICAgICB6b29tWTogbnVsbCxcbiAgICAgICAgcGFuOiBudWxsXG4gICAgfTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RTY2FsZSA9IG51bGw7XG5cbiAgICB0aGlzLl95U2NhbGUgPSAwLjA7XG4gICAgdGhpcy5fZGF0YUNoYW5nZUNvdW50ID0gMDtcbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPSAwO1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCA9IDA7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCA9IDA7XG4gICAgdGhpcy5fcHJldmVudERyYXdpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycyA9IFtdO1xuICAgIHRoaXMuX21heEJvZHlIZWlnaHQgPSBJbmZpbml0eTtcbiAgICB0aGlzLl9mcm96ZW5VaWRzID0gW107XG59XG5cbmluaGVyaXRzKEQzVGFibGUsIEV2ZW50RW1pdHRlcik7XG5cbkQzVGFibGUucHJvdG90eXBlLmRlZmF1bHRzID0ge1xuICAgIGJlbUJsb2NrTmFtZTogJ3RhYmxlJyxcbiAgICBiZW1CbG9ja01vZGlmaWVyOiAnJyxcbiAgICB4QXhpc0hlaWdodDogNTAsXG4gICAgeUF4aXNXaWR0aDogNTAsXG4gICAgcm93SGVpZ2h0OiAzMCxcbiAgICByb3dQYWRkaW5nOiA1LFxuICAgIGNvbnRhaW5lcjogJ2JvZHknLFxuICAgIGN1bGxpbmdYOiB0cnVlLFxuICAgIGN1bGxpbmdZOiB0cnVlLFxuICAgIGN1bGxpbmdEaXN0YW5jZTogMSxcbiAgICByZW5kZXJPbklkbGU6IHRydWUsXG4gICAgaGlkZVRpY2tzT25ab29tOiBmYWxzZSxcbiAgICBoaWRlVGlja3NPbkRyYWc6IGZhbHNlLFxuICAgIHBhbllPbldoZWVsOiB0cnVlLFxuICAgIHdoZWVsTXVsdGlwbGllcjogMSxcbiAgICBlbmFibGVZVHJhbnNpdGlvbjogdHJ1ZSxcbiAgICBlbmFibGVUcmFuc2l0aW9uT25FeGl0OiB0cnVlLFxuICAgIHVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybTogZmFsc2UsXG4gICAgdHJhbnNpdGlvbkVhc2luZzogJ3F1YWQtaW4tb3V0JyxcbiAgICB4QXhpc1RpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkO1xuICAgIH0sXG4gICAgeEF4aXNTdHJva2VXaWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCUyID8gMSA6IDI7XG4gICAgfSxcbiAgICB4QXhpczJUaWNrc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfSxcbiAgICB5QXhpc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCAmJiBkLm5hbWUgfHwgJyc7XG4gICAgfSxcbiAgICBwYWRkaW5nOiAxMCxcbiAgICB0cmFja2VkRE9NRXZlbnRzOiBbJ2NsaWNrJywgJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnLCAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJ10gLy8gbm90IGR5bmFtaWNcbn07XG5cbkQzVGFibGUuaW5zdGFuY2VzQ291bnQgPSAwO1xuXG5EM1RhYmxlLnByb3RvdHlwZS5ub29wID0gZnVuY3Rpb24oKSB7fTtcblxuRDNUYWJsZS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gY29udGFpbmVyXG4gICAgdGhpcy5jb250YWluZXIgPSBkMy5zZWxlY3QodGhpcy5vcHRpb25zLmNvbnRhaW5lcikuYXBwZW5kKCdzdmcnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgKHRoaXMub3B0aW9ucy5iZW1CbG9ja01vZGlmaWVyID8gJyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArIHRoaXMub3B0aW9ucy5iZW1CbG9ja01vZGlmaWVyIDogJycpKTtcblxuICAgIC8vIGRlZnNcbiAgICB0aGlzLmVsZW1lbnRzLmRlZnMgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2RlZnMnKTtcblxuICAgIC8vIGNsaXAgcmVjdCBpbiBkZWZzXG4gICAgdmFyIGNsaXBJZCA9IHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvZHlDbGlwUGF0aC0tJyArIEQzVGFibGUuaW5zdGFuY2VzQ291bnQ7XG4gICAgdGhpcy5lbGVtZW50cy5jbGlwID0gdGhpcy5lbGVtZW50cy5kZWZzLmFwcGVuZCgnY2xpcFBhdGgnKVxuICAgICAgICAucHJvcGVydHkoJ2lkJywgY2xpcElkKTtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXBcbiAgICAgICAgLmFwcGVuZCgncmVjdCcpO1xuXG4gICAgLy8gc3Vycm91bmRpbmcgcmVjdFxuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5jbGFzc2VkKHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JywgdHJ1ZSk7XG5cbiAgICAvLyBheGlzZXMgY29udGFpbmVyc1xuICAgIHRoaXMuZWxlbWVudHMueEF4aXNDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS14Jyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLngyQXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXggJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXNlY29uZGFyeScpO1xuXG4gICAgdGhpcy5lbGVtZW50cy55QXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXknKTtcblxuICAgIC8vIGJvZHkgY29udGFpbmVyIGlubmVyIGNvbnRhaW5lciBhbmQgc3Vycm91bmRpbmcgcmVjdFxuICAgIHRoaXMuZWxlbWVudHMuYm9keSA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCMnICsgY2xpcElkICsgJyknKTtcblxuICAgIC8vIHN1cnJvdW5kaW5nIHJlY3RcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnLCB0cnVlKTtcblxuICAgIC8vIGlubmVyIGNvbnRhaW5lclxuICAgIHRoaXMuZWxlbWVudHMuaW5uZXJDb250YWluZXIgPSB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdnJyk7XG5cbiAgICAvLyBzdXJyb3VuZGluZyByZWN0XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5jbGFzc2VkKHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcsIHRydWUpO1xuXG4gICAgdGhpcy51cGRhdGVNYXJnaW5zKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVEM0luc3RhbmNlcygpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplRXZlbnRMaXN0ZW5lcnMoKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUueFNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnlTY2FsZUZhY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUubGluZWFyKCk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplRDNJbnN0YW5jZXMgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuc2NhbGVzLnggPSB0aGlzLnhTY2FsZUZhY3RvcnkoKTtcblxuICAgIHRoaXMuc2NhbGVzLnkgPSB0aGlzLnlTY2FsZUZhY3RvcnkoKTtcblxuICAgIHRoaXMuYXhpc2VzLnggPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy54KVxuICAgICAgICAub3JpZW50KCd0b3AnKVxuICAgICAgICAudGlja0Zvcm1hdCh0aGlzLm9wdGlvbnMueEF4aXNUaWNrc0Zvcm1hdHRlci5iaW5kKHRoaXMpKVxuICAgICAgICAub3V0ZXJUaWNrU2l6ZSgwKVxuICAgICAgICAudGlja1BhZGRpbmcoMjApO1xuXG4gICAgdGhpcy5heGlzZXMueDIgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy54KVxuICAgICAgICAub3JpZW50KCd0b3AnKVxuICAgICAgICAudGlja0Zvcm1hdCh0aGlzLm9wdGlvbnMueEF4aXMyVGlja3NGb3JtYXR0ZXIuYmluZCh0aGlzKSlcbiAgICAgICAgLm91dGVyVGlja1NpemUoMClcbiAgICAgICAgLmlubmVyVGlja1NpemUoMCk7XG5cbiAgICB0aGlzLmF4aXNlcy55ID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAuc2NhbGUodGhpcy5zY2FsZXMueSlcbiAgICAgICAgLm9yaWVudCgnbGVmdCcpXG4gICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9pc1JvdW5kKGQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYub3B0aW9ucy55QXhpc0Zvcm1hdHRlcihzZWxmLmRhdGFbKGR8MCldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAub3V0ZXJUaWNrU2l6ZSgwKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20gPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pXG4gICAgICAgIC5vbignem9vbScsIHRoaXMuaGFuZGxlWm9vbWluZy5iaW5kKHRoaXMpKVxuICAgICAgICAub24oJ3pvb21lbmQnLCB0aGlzLmhhbmRsZVpvb21pbmdFbmQuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWCA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAueCh0aGlzLnNjYWxlcy54KVxuICAgICAgICAuc2NhbGUoMSlcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkgPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAgICAgLnkodGhpcy5zY2FsZXMueSlcbiAgICAgICAgLnNjYWxlKDEpXG4gICAgICAgIC5zY2FsZUV4dGVudChbMSwgMV0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMucGFuID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgIC5vbignZHJhZycsIHRoaXMuaGFuZGxlRHJhZ2dpbmcuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuY2FsbCh0aGlzLmJlaGF2aW9ycy5wYW4pO1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5jYWxsKHRoaXMuYmVoYXZpb3JzLnpvb20pO1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdGhpcy5fbGFzdFNjYWxlID0gdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpO1xufVxuXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMub3B0aW9ucy50cmFja2VkRE9NRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuYm9keS5vbihldmVudE5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50TmFtZSAhPT0gJ2NsaWNrJyB8fCAhZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiBkMy5zZWxlY3QoZDMuZXZlbnQudGFyZ2V0KS5jbGFzc2VkKHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JykpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KGV2ZW50TmFtZSwgc2VsZi5lbGVtZW50cy5ib2R5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmVtaXREZXRhaWxlZEV2ZW50ID0gZnVuY3Rpb24oZXZlbnROYW1lLCBkM1RhcmdldFNlbGVjdGlvbiwgZGVsdGEsIHByaW9yaXR5QXJndW1lbnRzLCBleHRyYUFyZ3VtZW50cykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHBvc2l0aW9uO1xuXG4gICAgdmFyIGdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghcG9zaXRpb24pIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gZDMubW91c2Uoc2VsZi5lbGVtZW50cy5ib2R5Lm5vZGUoKSk7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkZWx0YSkpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblswXSArPSBkZWx0YVswXTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblsxXSArPSBkZWx0YVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfTtcblxuICAgIHZhciBhcmdzID0gW1xuICAgICAgICB0aGlzLCAvLyB0aGUgdGFibGUgaW5zdGFuY2VcbiAgICAgICAgZDNUYXJnZXRTZWxlY3Rpb24sIC8vIHRoZSBkMyBzZWxlY3Rpb24gdGFyZ2V0ZWRcbiAgICAgICAgZDMuZXZlbnQsIC8vIHRoZSBkMyBldmVudFxuICAgICAgICBmdW5jdGlvbiBnZXRDb2x1bW4oKSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBnZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLnguaW52ZXJ0KHBvc2l0aW9uWzBdKTtcbiAgICAgICAgfSwgLy8gYSBjb2x1bW4gZ2V0dGVyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJvdygpIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IGdldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5zY2FsZXMueS5pbnZlcnQocG9zaXRpb25bMV0pO1xuICAgICAgICB9IC8vIGEgcm93IGdldHRlclxuICAgIF07XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShwcmlvcml0eUFyZ3VtZW50cykpIHtcbiAgICAgICAgYXJncyA9IHByaW9yaXR5QXJndW1lbnRzLmNvbmNhdChhcmdzKTtcbiAgICB9XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShleHRyYUFyZ3VtZW50cykpIHtcbiAgICAgICAgYXJncyA9IGFyZ3MuY29uY2F0KGV4dHJhQXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBhcmdzLnVuc2hpZnQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6JyArIGV2ZW50TmFtZSk7IC8vIHRoZSBldmVudCBuYW1lXG5cbiAgICB0aGlzLmVtaXQuYXBwbHkodGhpcywgYXJncyk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVNYXJnaW5zID0gZnVuY3Rpb24odXBkYXRlRGltZW5zaW9ucykge1xuXG4gICAgdGhpcy5tYXJnaW4gPSB7XG4gICAgICAgIHRvcDogdGhpcy5vcHRpb25zLnhBeGlzSGVpZ2h0ICsgdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIHJpZ2h0OiB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgYm90dG9tOiB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgbGVmdDogdGhpcy5vcHRpb25zLnlBeGlzV2lkdGggKyB0aGlzLm9wdGlvbnMucGFkZGluZ1xuICAgIH07XG5cbiAgICB2YXIgY29udGVudFBvc2l0aW9uID0geyB4OiB0aGlzLm1hcmdpbi5sZWZ0LCB5OiB0aGlzLm1hcmdpbi50b3AgfTtcbiAgICB2YXIgY29udGVudFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHRoaXMubWFyZ2luLmxlZnQgKyAnLCcgKyB0aGlzLm1hcmdpbi50b3AgKyAnKSc7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JylcbiAgICAgICAgLmF0dHIoY29udGVudFBvc2l0aW9uKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keVxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnhBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueDJBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueUF4aXNDb250YWluZXJcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIHRoaXMubWFyZ2luLmxlZnQgKyAnLCcgKyB0aGlzLm1hcmdpbi50b3AgKyAnKScpO1xuXG4gICAgaWYgKHVwZGF0ZURpbWVuc2lvbnMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVYKCk7XG4gICAgICAgIHRoaXMudXBkYXRlWSgpO1xuICAgIH1cblxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOmRlc3Ryb3knLCB0aGlzKTtcblxuICAgIC8vIHJlbW92ZSBiZWhhdmlvciBsaXN0ZW5lcnNcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLm9uKCd6b29tJywgbnVsbCk7XG5cbiAgICAvLyByZW1vdmUgZG9tIGxpc3RlbmVyc1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5vbignLnpvb20nLCBudWxsKTtcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkub24oJ2NsaWNrJywgbnVsbCk7XG5cbiAgICAvLyByZW1vdmUgcmVmZXJlbmNlc1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLmVsZW1lbnRzID0gbnVsbDtcbiAgICB0aGlzLnNjYWxlcyA9IG51bGw7XG4gICAgdGhpcy5heGlzZXMgPSBudWxsO1xuICAgIHRoaXMuYmVoYXZpb3JzID0gbnVsbDtcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xuICAgIHRoaXMuZmxhdHRlbmVkRGF0YSA9IG51bGw7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6ZGVzdHJveWVkJywgdGhpcyk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5yZXN0b3JlWm9vbSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHRoaXMuX2xhc3RUcmFuc2xhdGUpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUodGhpcy5fbGFzdFNjYWxlKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihkeCwgZHksIGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKSB7XG5cbiAgICB2YXIgY3VycmVudFRyYW5zbGF0ZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdmFyIHVwZGF0ZWRUID0gW2N1cnJlbnRUcmFuc2xhdGVbMF0gKyBkeCwgY3VycmVudFRyYW5zbGF0ZVsxXSArIGR5XTtcblxuICAgIHVwZGF0ZWRUID0gdGhpcy5fY2xhbXBUcmFuc2xhdGlvbldpdGhTY2FsZSh1cGRhdGVkVCwgW3RoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSwgdGhpcy5iZWhhdmlvcnMuem9vbVkuc2NhbGUoKV0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVguc2NhbGUodGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWS50cmFuc2xhdGUodXBkYXRlZFQpO1xuXG4gICAgdGhpcy5tb3ZlRWxlbWVudHMoZm9yY2VEcmF3LCBza2lwWEF4aXMsIGZvcmNlVGlja3MpO1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IHVwZGF0ZWRUO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnKTtcblxuICAgIHJldHVybiB1cGRhdGVkVC5jb25jYXQoW3VwZGF0ZWRUWzBdIC0gY3VycmVudFRyYW5zbGF0ZVswXSwgdXBkYXRlZFRbMV0gLSBjdXJyZW50VHJhbnNsYXRlWzFdXSk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5lbnN1cmVJbkRvbWFpbnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tb3ZlKDAsIDAsIGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIHBhbiBYL1kgJiB6b29tIFggaGFuZGxlciAoY2xhbXBlZCBwYW4gWSB3aGVuIHdoZWVsIGlzIHByZXNzZWQgd2l0aG91dCBjdHJsLCB6b29tIFggYW5kIHBhbiBYL1kgb3RoZXJ3aXNlKVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVab29taW5nID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQgJiYgIWQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgJiYgIShkMy5ldmVudC5zb3VyY2VFdmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggPj0gMikpIHtcbiAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnR5cGUgPT09ICd3aGVlbCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFuWU9uV2hlZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVab29tKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVXaGVlbGluZygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVzdG9yZVpvb20oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB0ID0gdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKTtcbiAgICB2YXIgdXBkYXRlZFQgPSBbdFswXSwgdGhpcy5fbGFzdFRyYW5zbGF0ZVsxXV07XG5cbiAgICB1cGRhdGVkVCA9IHRoaXMuX2NsYW1wVHJhbnNsYXRpb25XaXRoU2NhbGUodXBkYXRlZFQsIFt0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCksIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnNjYWxlKCldKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG5cbiAgICB0aGlzLm1vdmVFbGVtZW50cyh0cnVlLCBmYWxzZSwgIXRoaXMub3B0aW9ucy5oaWRlVGlja3NPblpvb20pO1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IHVwZGF0ZWRUO1xuICAgIHRoaXMuX2xhc3RTY2FsZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJyk7XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmhhbmRsZVpvb21pbmdFbmQgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG4gICAgdGhpcy5tb3ZlRWxlbWVudHModHJ1ZSk7XG4gICAgdGhpcy5kcmF3WUF4aXMoKTtcbiAgICB0aGlzLmRyYXdYQXhpcygpO1xufTtcblxuLyoqXG4gKiB3aGVlbCBoYW5kbGVyIChjbGFtcGVkIHBhbiBZKVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVXaGVlbGluZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGV2ZW50ID0gZDMuZXZlbnQuc291cmNlRXZlbnQ7XG5cbiAgICB2YXIgZHggPSAwLCBkeSA9IDA7XG5cbiAgICB2YXIgbW92aW5nWCA9IGV2ZW50ICYmIGV2ZW50LndoZWVsRGVsdGFYIHx8IGV2ZW50LmRlbHRhWDtcblxuICAgIGlmIChtb3ZpbmdYKSB7XG5cbiAgICAgICAgdmFyIG1vdmluZ1JpZ2h0ID0gZXZlbnQud2hlZWxEZWx0YVggPiAwIHx8IGV2ZW50LmRlbHRhWCA8IDA7XG4gICAgICAgIGR4ID0gKG1vdmluZ1JpZ2h0ID8gMSA6IC0xKSAqIHRoaXMuY29sdW1uV2lkdGggKiB0aGlzLm9wdGlvbnMud2hlZWxNdWx0aXBsaWVyO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICB2YXIgbW92aW5nWSA9IGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQud2hlZWxEZWx0YVkgfHwgZXZlbnQuZGV0YWlsIHx8IGV2ZW50LmRlbHRhWTtcblxuICAgICAgICBpZiAobW92aW5nWSkge1xuICAgICAgICAgICAgdmFyIG1vdmluZ0Rvd24gPSBldmVudC53aGVlbERlbHRhID4gMCB8fCBldmVudC53aGVlbERlbHRhWSA+IDAgfHwgZXZlbnQuZGV0YWlsIDwgMCB8fCBldmVudC5kZWx0YVkgPCAwO1xuICAgICAgICAgICAgZHkgPSBtb3ZpbmdZID8gKG1vdmluZ0Rvd24gPyAxIDogLTEpICogdGhpcy5vcHRpb25zLnJvd0hlaWdodCAqIHRoaXMub3B0aW9ucy53aGVlbE11bHRpcGxpZXIgOiAwO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICB0aGlzLm1vdmUoZHgsIGR5LCBmYWxzZSwgIW1vdmluZ1gpO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVEcmFnZ2luZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNoYW5nZWRUb3VjaGVzICYmIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvdWNoZXMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubW92ZShkMy5ldmVudC5keCwgZDMuZXZlbnQuZHksIGZhbHNlLCBmYWxzZSwgIXRoaXMub3B0aW9ucy5oaWRlVGlja3NPbkRyYWcpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudG9nZ2xlRHJhd2luZyA9IGZ1bmN0aW9uKGFjdGl2ZSkge1xuXG4gICAgdGhpcy5fcHJldmVudERyYXdpbmcgPSB0eXBlb2YgYWN0aXZlID09PSAnYm9vbGVhbicgPyAhYWN0aXZlIDogIXRoaXMuX3ByZXZlbnREcmF3aW5nO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0FycmF5PEQzVGFibGVSb3c+fSBkYXRhXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2FuaW1hdGVZXVxuICogQHJldHVybnMge0QzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbihkYXRhLCB0cmFuc2l0aW9uRHVyYXRpb24sIGFuaW1hdGVZKSB7XG5cbiAgICB0aGlzLl9kYXRhQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc1NpemVDaGFuZ2luZyA9IGRhdGEubGVuZ3RoICE9PSB0aGlzLmRhdGEubGVuZ3RoO1xuXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcblxuICAgIHRoaXMuZ2VuZXJhdGVGbGF0dGVuZWREYXRhKCk7XG5cbiAgICBpZiAoaXNTaXplQ2hhbmdpbmcgfHwgdGhpcy5fZGF0YUNoYW5nZUNvdW50ID09PSAxKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgICAgIC51cGRhdGVZKGFuaW1hdGVZID8gdHJhbnNpdGlvbkR1cmF0aW9uIDogdW5kZWZpbmVkKVxuICAgICAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgICAgICAuZHJhd1lBeGlzKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3RWxlbWVudHModHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKiBAcmV0dXJucyB7QXJyYXk8RDNUYWJsZVJvdz59XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRGF0YSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHRoaXMuZGF0YS5tYXAoZnVuY3Rpb24oZCkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7RDNUYWJsZVJvd31cbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSB7fTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZCkge1xuICAgICAgICAgICAgaWYgKGQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICdlbGVtZW50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzW2tleV0gPSBkW2tleV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzW2tleV0gPSBkW2tleV0ubWFwKHNlbGYuY2xvbmVFbGVtZW50LmJpbmQoc2VsZikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFRoaXMgY2xvbmUgbWV0aG9kIGRvZXMgbm90IGNsb25lIHRoZSBlbnRpdGllcyBpdHNlbGZcbiAqIEByZXR1cm5zIHtBcnJheTxEM1RhYmxlRWxlbWVudD59XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRmxhdHRlbmVkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmZsYXR0ZW5lZERhdGEubWFwKGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge0QzVGFibGVFbGVtZW50fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBlKSB7XG4gICAgICAgICAgICBpZiAoZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgcmVzW2tleV0gPSBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKiBAcmV0dXJucyB7RDNUYWJsZUVsZW1lbnR9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRWxlbWVudCA9IGZ1bmN0aW9uKGUpIHtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtEM1RhYmxlRWxlbWVudH1cbiAgICAgKi9cbiAgICB2YXIgcmVzID0ge307XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gZSkge1xuICAgICAgICBpZiAoZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICByZXNba2V5XSA9IGVba2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZXRFbGVtZW50Um93ID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiB0aGlzLl9maW5kKHRoaXMuZGF0YSwgZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIHJldHVybiByb3cuZWxlbWVudHMuaW5kZXhPZihkKSAhPT0gLTE7XG4gICAgfSk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5zdG9yZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnByZXZpb3VzRmxhdHRlbmVkRGF0YSA9IHRoaXMuY2xvbmVGbGF0dGVuZWREYXRhKCk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMudXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtKSB7XG4gICAgICAgIHRoaXMuc3RvcmVGbGF0dGVuZWREYXRhKCk7XG4gICAgfVxuXG4gICAgdGhpcy5mbGF0dGVuZWREYXRhLmxlbmd0aCA9IDA7XG5cbiAgICB0aGlzLmRhdGEuZm9yRWFjaChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIGQuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LnJvd0luZGV4ID0gaTtcbiAgICAgICAgICAgIGlmIChzZWxmLl9mcm96ZW5VaWRzLmluZGV4T2YoZWxlbWVudC51aWQpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuX2RlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5mbGF0dGVuZWREYXRhLnB1c2goZWxlbWVudCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtEYXRlfSBtaW5YXG4gKiBAcGFyYW0ge0RhdGV9IG1heFhcbiAqIEByZXR1cm5zIHtEM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRYUmFuZ2UgPSBmdW5jdGlvbihtaW5YLCBtYXhYKSB7XG5cbiAgICB0aGlzLm1pblggPSBtaW5YO1xuICAgIHRoaXMubWF4WCA9IG1heFg7XG5cbiAgICB0aGlzLnNjYWxlcy54XG4gICAgICAgIC5kb21haW4oW3RoaXMubWluWCwgdGhpcy5tYXhYXSk7XG5cbiAgICB0aGlzXG4gICAgICAgIC51cGRhdGVYKClcbiAgICAgICAgLnVwZGF0ZVhBeGlzSW50ZXJ2YWwoKVxuICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgIC5kcmF3RWxlbWVudHMoKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuc2V0QXZhaWxhYmxlV2lkdGggPSBmdW5jdGlvbihhdmFpbGFibGVXaWR0aCkge1xuXG4gICAgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNBdmFpbGFibGVXaWR0aENoYW5naW5nID0gYXZhaWxhYmxlV2lkdGggIT09IHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aDtcbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGggPSBhdmFpbGFibGVXaWR0aDtcblxuICAgIHRoaXMuZGltZW5zaW9ucy53aWR0aCA9IHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCAtIHRoaXMubWFyZ2luLmxlZnQgLSB0aGlzLm1hcmdpbi5yaWdodDtcblxuICAgIGlmIChpc0F2YWlsYWJsZVdpZHRoQ2hhbmdpbmcgfHwgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID09PSAxKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVYKClcbiAgICAgICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgICAgICAuZHJhd0VsZW1lbnRzKClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnNldEF2YWlsYWJsZUhlaWdodCA9IGZ1bmN0aW9uKGF2YWlsYWJsZUhlaWdodCkge1xuXG4gICAgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNBdmFpbGFibGVIZWlnaHRDaGFuZ2luZyA9IGF2YWlsYWJsZUhlaWdodCAhPT0gdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodDtcbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0ID0gYXZhaWxhYmxlSGVpZ2h0O1xuXG4gICAgdGhpcy5fbWF4Qm9keUhlaWdodCA9IHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQgLSB0aGlzLm1hcmdpbi50b3AgLSB0aGlzLm1hcmdpbi5ib3R0b207XG5cbiAgICBpZiAoaXNBdmFpbGFibGVIZWlnaHRDaGFuZ2luZyB8fCB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPT09IDEpIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAgICAgLnVwZGF0ZVkoKVxuICAgICAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgICAgICAuZHJhd1lBeGlzKClcbiAgICAgICAgICAgIC5kcmF3RWxlbWVudHMoKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlWCA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdGhpcy5jb250YWluZXIuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGggKyB0aGlzLm1hcmdpbi5sZWZ0ICsgdGhpcy5tYXJnaW4ucmlnaHQpO1xuXG4gICAgdGhpcy5zY2FsZXMueFxuICAgICAgICAuZG9tYWluKFt0aGlzLm1pblgsIHRoaXMubWF4WF0pXG4gICAgICAgIC5yYW5nZShbMCwgdGhpcy5kaW1lbnNpb25zLndpZHRoXSk7XG5cbiAgICB0aGlzLmF4aXNlcy55XG4gICAgICAgIC5pbm5lclRpY2tTaXplKC10aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVhcbiAgICAgICAgLngodGhpcy5zY2FsZXMueClcbiAgICAgICAgLnRyYW5zbGF0ZSh0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpKVxuICAgICAgICAuc2NhbGUodGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICB0aGlzLmNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuICAgIHRoaXMuZWxlbWVudHMuY2xpcC5zZWxlY3QoJ3JlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6cmVzaXplJywgdGhpcywgdGhpcy5jb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGYpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLnB1c2goZik7XG5cbiAgICBpZiAodGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBnO1xuICAgICAgICAgICAgd2hpbGUoZyA9IHNlbGYuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLnNoaWZ0KCkpIGcoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGY7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGYpIHtcblxuICAgIHZhciBpbmRleCA9IHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmxlbmd0aCA+IDAgPyB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5pbmRleE9mKGYpIDogLTE7XG5cbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZHJhd1hBeGlzID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uLCBza2lwVGlja3MpIHtcblxuICAgIGlmICh0aGlzLl9wcmV2ZW50RHJhd2luZykge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLmF4aXNlcy55XG4gICAgICAgIC5pbm5lclRpY2tTaXplKHNraXBUaWNrcyA/IDAgOiAtdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLl94QXhpc0FGKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5feEF4aXNBRik7XG4gICAgfVxuXG4gICAgdGhpcy5feEF4aXNBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy54QXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgLmNhbGwoc2VsZi5heGlzZXMueClcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ2xpbmUnKVxuICAgICAgICAgICAgLnN0eWxlKHtcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogc2VsZi5vcHRpb25zLnhBeGlzU3Ryb2tlV2lkdGguYmluZChzZWxmKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi53cmFwV2l0aEFuaW1hdGlvbihzZWxmLmVsZW1lbnRzLngyQXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgLmNhbGwoc2VsZi5heGlzZXMueDIpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCd0ZXh0JylcbiAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICB4OiBzZWxmLmNvbHVtbldpZHRoIC8gMlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdHlsZSh7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gK2QgPT09ICtzZWxmLm1heFggPyAnbm9uZScgOiAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZHJhd1lBeGlzID0gZnVuY3Rpb24gZHJhd1lBeGlzKHRyYW5zaXRpb25EdXJhdGlvbiwgc2tpcFRpY2tzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5heGlzZXMueFxuICAgICAgICAuaW5uZXJUaWNrU2l6ZShza2lwVGlja3MgPyAwIDogLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgdmFyIGRvbWFpblkgPSB0aGlzLnNjYWxlcy55LmRvbWFpbigpO1xuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAudGlja1ZhbHVlcyh0aGlzLl9yYW5nZShNYXRoLnJvdW5kKGRvbWFpbllbMF0pLCBNYXRoLnJvdW5kKGRvbWFpbllbMV0pLCAxKSk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5feUF4aXNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3lBeGlzQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX3lBeGlzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgY29udGFpbmVyID0gc2VsZi53cmFwV2l0aEFuaW1hdGlvbihzZWxmLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBjb250YWluZXIuY2FsbChzZWxmLmF4aXNlcy55KTtcblxuICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ3RleHQnKS5hdHRyKCd5Jywgc2VsZi5vcHRpb25zLnJvd0hlaWdodCAvIDIpO1xuXG4gICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgLnNlbGVjdEFsbCgnbGluZScpLnN0eWxlKCdkaXNwbGF5JywgZnVuY3Rpb24oZCxpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPyAnJyA6ICdub25lJztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmdldFRyYW5zZm9ybUZyb21EYXRhID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyB0aGlzLnNjYWxlcy54KHRoaXMuZ2V0RGF0YVN0YXJ0KGQpKSArICcsJyArIHRoaXMuc2NhbGVzLnkoZC5yb3dJbmRleCkgKyAnKSc7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZXREYXRhU3RhcnQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICtkLnN0YXJ0O1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RGF0YUVuZCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gK2QuZW5kO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZHJhd0VsZW1lbnRzID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5zdG9wRWxlbWVudFRyYW5zaXRpb24oKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLl9lbGVtZW50c0FGKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fZWxlbWVudHNBRilcbiAgICB9XG5cbiAgICB2YXIgZW5hYmxlWVRyYW5zaXRpb24gPSB0aGlzLm9wdGlvbnMuZW5hYmxlWVRyYW5zaXRpb247XG5cbiAgICB0aGlzLl9lbGVtZW50c0FGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGRvbWFpblggPSBzZWxmLnNjYWxlcy54LmRvbWFpbigpO1xuICAgICAgICB2YXIgZG9tYWluWFN0YXJ0ID0gZG9tYWluWFswXTtcbiAgICAgICAgdmFyIGRvbWFpblhFbmQgPSBkb21haW5YW2RvbWFpblgubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgdmFyIGRvbWFpblkgPSBzZWxmLnNjYWxlcy55LmRvbWFpbigpO1xuICAgICAgICB2YXIgZG9tYWluWVN0YXJ0ID0gZG9tYWluWVswXTtcbiAgICAgICAgdmFyIGRvbWFpbllFbmQgPSBkb21haW5ZW2RvbWFpblkubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgdmFyIGN1bGxpbmdEaXN0YW5jZSA9IHNlbGYub3B0aW9ucy5jdWxsaW5nRGlzdGFuY2U7XG4gICAgICAgIHZhciBjdWxsaW5nWCA9IHNlbGYub3B0aW9ucy5jdWxsaW5nWDtcbiAgICAgICAgdmFyIGN1bGxpbmdZID0gc2VsZi5vcHRpb25zLmN1bGxpbmdZO1xuXG5cbiAgICAgICAgdmFyIHN0YXJ0VHJhbnNmb3JtTWFwID0ge307XG4gICAgICAgIHZhciBlbmRUcmFuc2Zvcm1NYXAgPSB7fTtcblxuICAgICAgICBpZiAoc2VsZi5vcHRpb25zLnVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybSAmJiB0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5wcmV2aW91c0ZsYXR0ZW5lZERhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnByZXZpb3VzRmxhdHRlbmVkRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzdGFydFRyYW5zZm9ybU1hcFtkLnVpZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VHJhbnNmb3JtTWFwW2QuaWRdID0gc3RhcnRUcmFuc2Zvcm1NYXBbZC51aWRdID0gc2VsZi5nZXRUcmFuc2Zvcm1Gcm9tRGF0YShkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlbGYuZmxhdHRlbmVkRGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmxhdHRlbmVkRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbmRUcmFuc2Zvcm1NYXBbZC51aWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRUcmFuc2Zvcm1NYXBbZC5pZF0gPSBlbmRUcmFuc2Zvcm1NYXBbZC51aWRdID0gc2VsZi5nZXRUcmFuc2Zvcm1Gcm9tRGF0YShkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhdGEgPSBzZWxmLmZsYXR0ZW5lZERhdGEuZmlsdGVyKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBkLl9kZWZhdWx0UHJldmVudGVkIHx8ICghY3VsbGluZ1kgfHwgKGQucm93SW5kZXggPj0gZG9tYWluWVN0YXJ0IC0gY3VsbGluZ0Rpc3RhbmNlICYmIGQucm93SW5kZXggPCBkb21haW5ZRW5kICsgY3VsbGluZ0Rpc3RhbmNlIC0gMSkpXG4gICAgICAgICAgICAgICAgJiYgKCFjdWxsaW5nWCB8fCAhKHNlbGYuZ2V0RGF0YUVuZChkKSA8IGRvbWFpblhTdGFydCB8fCBzZWxmLmdldERhdGFTdGFydChkKSA+IGRvbWFpblhFbmQpKTtcbiAgICAgICAgfSk7XG5cblxuICAgICAgICB2YXIgZyA9IHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuc2VsZWN0QWxsKCdnLicgKyBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JylcbiAgICAgICAgICAgIC5kYXRhKGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZC51aWQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB2YXIgZXhpdGluZyA9IGcuZXhpdCgpO1xuXG4gICAgICAgIGlmIChzZWxmLm9wdGlvbnMuZW5hYmxlVHJhbnNpdGlvbk9uRXhpdCAmJiB0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgICAgICBleGl0aW5nXG4gICAgICAgICAgICAgICAgLmNhbGwoc2VsZi5lbGVtZW50RXhpdC5iaW5kKHNlbGYpKTtcblxuICAgICAgICAgICAgZXhpdGluZy5lYWNoKGZ1bmN0aW9uKGQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBnID0gZDMuc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGV4aXRUcmFuc2Zvcm0gPSBlbmRUcmFuc2Zvcm1NYXBbZC51aWRdIHx8IGVuZFRyYW5zZm9ybU1hcFtkLmlkXTtcblxuICAgICAgICAgICAgICAgIGlmIChleGl0VHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oZywgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGV4aXRUcmFuc2Zvcm0pXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXhpdGluZ1xuICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGcuZW50ZXIoKS5hcHBlbmQoJ2cnKVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuY2FsbChzZWxmLmVsZW1lbnRFbnRlci5iaW5kKHNlbGYpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGcuZWFjaChmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgICAgIHZhciBnID0gZDMuc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgICAgICBpZiAoZC5fZGVmYXVsdFByZXZlbnRlZCkge1xuXG4gICAgICAgICAgICAgICAgc2VsZi5lbGVtZW50VXBkYXRlKGcsIGQsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBoYXNQcmV2aW91c1RyYW5zZm9ybSA9IGcuYXR0cigndHJhbnNmb3JtJykgIT09IG51bGw7XG5cbiAgICAgICAgICAgIHZhciBuZXdUcmFuc2Zvcm0gPSBlbmRUcmFuc2Zvcm1NYXBbZC51aWRdIHx8IGVuZFRyYW5zZm9ybU1hcFtkLmlkXSB8fCBzZWxmLmdldFRyYW5zZm9ybUZyb21EYXRhKGQpO1xuXG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBvcmlnaW5UcmFuc2Zvcm0gPSBzdGFydFRyYW5zZm9ybU1hcFtkLnVpZF0gfHwgc3RhcnRUcmFuc2Zvcm1NYXBbZC5pZF0gfHwgbmV3VHJhbnNmb3JtO1xuICAgICAgICAgICAgICAgIHZhciBtb2RpZmllZE9yaWdpblRyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1ByZXZpb3VzVHJhbnNmb3JtICYmIHNlbGYub3B0aW9ucy51c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpblRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm0gPSBvcmlnaW5UcmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgICAgICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsIG9yaWdpblRyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKGcsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHJUd2VlbihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmlnaW5UcmFuc2Zvcm0gPSBtb2RpZmllZE9yaWdpblRyYW5zZm9ybSB8fCBnLmF0dHIoJ3RyYW5zZm9ybScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuYWJsZVlUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLmludGVycG9sYXRlVHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybSwgbmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXJ0VHJhbnNmb3JtID0gZDMudHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVuZFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShuZXdUcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXSA9IGVuZFRyYW5zZm9ybS50cmFuc2xhdGVbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLmludGVycG9sYXRlVHJhbnNmb3JtKHN0YXJ0VHJhbnNmb3JtLnRvU3RyaW5nKCksIGVuZFRyYW5zZm9ybS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBuZXdUcmFuc2Zvcm0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLmVsZW1lbnRVcGRhdGUoZywgZCwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gWzAuMCwgMC4wXTtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5tb3ZlRWxlbWVudHMgPSBmdW5jdGlvbihmb3JjZURyYXcsIHNraXBYQXhpcywgZm9yY2VUaWNrcykge1xuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMucmVuZGVyT25JZGxlIHx8IGZvcmNlRHJhdykge1xuICAgICAgICB0aGlzLmRyYXdFbGVtZW50cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudHJhbnNsYXRlRWxlbWVudHModGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKSwgdGhpcy5fbGFzdFRyYW5zbGF0ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3WUF4aXModW5kZWZpbmVkLCAhZm9yY2VUaWNrcyk7XG5cbiAgICBpZiAoIXNraXBYQXhpcykge1xuICAgICAgICB0aGlzLnVwZGF0ZVhBeGlzSW50ZXJ2YWwoKTtcbiAgICAgICAgdGhpcy5kcmF3WEF4aXModW5kZWZpbmVkLCAhZm9yY2VUaWNrcyk7XG4gICAgfVxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudHJhbnNsYXRlRWxlbWVudHMgPSBmdW5jdGlvbih0cmFuc2xhdGUsIHByZXZpb3VzVHJhbnNsYXRlKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgdHggPSB0cmFuc2xhdGVbMF0gLSBwcmV2aW91c1RyYW5zbGF0ZVswXTtcbiAgICB2YXIgdHkgPSB0cmFuc2xhdGVbMV0gLSBwcmV2aW91c1RyYW5zbGF0ZVsxXTtcblxuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMF0gPSB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdICsgdHg7XG4gICAgdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVsxXSA9IHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV0gKyB0eTtcblxuXG4gICAgaWYgKHRoaXMuX2VsdHNUcmFuc2xhdGVBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2VsdHNUcmFuc2xhdGVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fZWx0c1RyYW5zbGF0ZUFGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZSgnICsgc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSArICcpJ1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc2VsZi5lbGVtZW50c1RyYW5zbGF0ZSAhPT0gc2VsZi5ub29wKSB7XG4gICAgICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgLnNlbGVjdEFsbCgnLicgKyBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JylcbiAgICAgICAgICAgICAgICAuZWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudHNUcmFuc2xhdGUoZDMuc2VsZWN0KHRoaXMpLCBkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVhBeGlzSW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuY29sdW1uV2lkdGggPSB0aGlzLnNjYWxlcy54KDEpIC0gdGhpcy5zY2FsZXMueCgwKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlWSA9IGZ1bmN0aW9uICh0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcjtcbiAgICB2YXIgY2xpcCA9IHRoaXMuZWxlbWVudHMuY2xpcC5zZWxlY3QoJ3JlY3QnKTtcbiAgICB2YXIgYm91bmRpbmdSZWN0ID0gdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0Jyk7XG5cbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnRhaW5lciA9IGNvbnRhaW5lci50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgY2xpcCA9IGNsaXAudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGJvdW5kaW5nUmVjdCA9IGJvdW5kaW5nUmVjdC50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICB2YXIgZWxlbWVudEFtb3VudCA9IHRoaXMuZGF0YS5sZW5ndGg7XG5cbiAgICAvLyBoYXZlIDEgbW9yZSBlbGVtbnQgdG8gZm9yY2UgcmVwcmVzZW50aW5nIG9uZSBtb3JlIHRpY2tcbiAgICB2YXIgZWxlbWVudHNSYW5nZSA9IFswLCBlbGVtZW50QW1vdW50XTtcblxuICAgIC8vIGNvbXB1dGUgbmV3IGhlaWdodFxuICAgIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgPSBNYXRoLm1pbih0aGlzLmRhdGEubGVuZ3RoICogdGhpcy5vcHRpb25zLnJvd0hlaWdodCwgdGhpcy5fbWF4Qm9keUhlaWdodCk7XG5cbiAgICAvLyBjb21wdXRlIG5ldyBZIHNjYWxlXG4gICAgdGhpcy5feVNjYWxlID0gdGhpcy5vcHRpb25zLnJvd0hlaWdodCAvIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKiBlbGVtZW50QW1vdW50O1xuXG4gICAgLy8gdXBkYXRlIFkgc2NhbGUsIGF4aXMgYW5kIHpvb20gYmVoYXZpb3JcbiAgICB0aGlzLnNjYWxlcy55LmRvbWFpbihlbGVtZW50c1JhbmdlKS5yYW5nZShbMCwgdGhpcy5kaW1lbnNpb25zLmhlaWdodF0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkueSh0aGlzLnNjYWxlcy55KS50cmFuc2xhdGUodGhpcy5fbGFzdFRyYW5zbGF0ZSkuc2NhbGUodGhpcy5feVNjYWxlKTtcblxuICAgIC8vIGFuZCB1cGRhdGUgWCBheGlzIHRpY2tzIGhlaWdodFxuICAgIHRoaXMuYXhpc2VzLnguaW5uZXJUaWNrU2l6ZSgtdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG5cbiAgICAvLyB1cGRhdGUgc3ZnIGhlaWdodFxuICAgIGNvbnRhaW5lci5hdHRyKCdoZWlnaHQnLHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKyB0aGlzLm1hcmdpbi50b3AgKyB0aGlzLm1hcmdpbi5ib3R0b20pO1xuXG4gICAgLy8gdXBkYXRlIGlubmVyIHJlY3QgaGVpZ2h0XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKS5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICBib3VuZGluZ1JlY3QuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgY29udGFpbmVyLnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnKS5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICBjbGlwLmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgdGhpcy5zdG9wRWxlbWVudFRyYW5zaXRpb24oKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLCB0aGlzLmNvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuc3RvcEVsZW1lbnRUcmFuc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5zZWxlY3RBbGwoJ2cuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKS50cmFuc2l0aW9uKClcbiAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgJycpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudEVudGVyID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRVcGRhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHsgcmV0dXJuIHNlbGVjdGlvbjsgfTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudEV4aXQgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHsgcmV0dXJuIHNlbGVjdGlvbjsgfTtcblxuRDNUYWJsZS5wcm90b3R5cGUud3JhcFdpdGhBbmltYXRpb24gPSBmdW5jdGlvbihzZWxlY3Rpb24sIHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgIHJldHVybiBzZWxlY3Rpb24udHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikuZWFzZSh0aGlzLm9wdGlvbnMudHJhbnNpdGlvbkVhc2luZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdGlvbjtcbiAgICB9XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5fZ2V0dGVyID0gZnVuY3Rpb24ocHJvcCkge1xuICAgIHJldHVybiBmdW5jdGlvbihkKSB7IHJldHVybiBkW3Byb3BdOyB9O1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX2lzUm91bmQgPSBmdW5jdGlvbih2KSB7XG4gICAgdmFyIG4gPSB2fDA7XG4gICAgcmV0dXJuIHYgPiBuIC0gMWUtMyAmJiB2IDwgbiArIDFlLTM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5fcmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgZW5kLCBpbmMpIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgd2hpbGUgKHN0YXJ0IDwgZW5kKSB7XG4gICAgICAgIHJlcy5wdXNoKHN0YXJ0KTtcbiAgICAgICAgc3RhcnQgPSBzdGFydCArIGluYztcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn07XG5cbi8qKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9mci9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PYmpldHNfZ2xvYmF1eC9BcnJheS9maW5kXG4gKiBAdHlwZSB7KnxGdW5jdGlvbn1cbiAqIEBwcml2YXRlXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLl9maW5kID0gZnVuY3Rpb24obGlzdCwgcHJlZGljYXRlKSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3QubGVuZ3RoID4+PiAwO1xuICAgIHZhciB0aGlzQXJnID0gbGlzdDtcbiAgICB2YXIgdmFsdWU7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gbGlzdFtpXTtcbiAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlID0gZnVuY3Rpb24odHJhbnNsYXRlLCBzY2FsZSkge1xuXG4gICAgc2NhbGUgPSBzY2FsZSB8fCBbMSwgMV07XG5cbiAgICBpZiAoIShzY2FsZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICBzY2FsZSA9IFtzY2FsZSwgc2NhbGVdO1xuICAgIH1cblxuICAgIHZhciB0eCA9IHRyYW5zbGF0ZVswXTtcbiAgICB2YXIgdHkgPSB0cmFuc2xhdGVbMV07XG4gICAgdmFyIHN4ID0gc2NhbGVbMF07XG4gICAgdmFyIHN5ID0gc2NhbGVbMV07XG5cbiAgICBpZiAoc3ggPT09IDEpIHtcbiAgICAgICAgdHggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHR4ID0gTWF0aC5taW4oTWF0aC5tYXgoLXRoaXMuZGltZW5zaW9ucy53aWR0aCAqIChzeC0xKSwgdHgpLCAwKTtcbiAgICB9XG5cbiAgICBpZiAoc3kgPT09IDEpIHtcbiAgICAgICAgdHkgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHR5ID0gTWF0aC5taW4oTWF0aC5tYXgoLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKiAoc3ktMSksIHR5KSwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFt0eCwgdHldO1xuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBEM1RhYmxlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cy9ldmVudHMnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcbmltcG9ydCBEM1RhYmxlIGZyb20gJy4vRDNUYWJsZSc7XG5cbmZ1bmN0aW9uIEQzVGFibGVNYXJrZXIob3B0aW9ucykge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQodHJ1ZSwge30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0QzVGFibGV9XG4gICAgICovXG4gICAgdGhpcy50YWJsZSA9IG51bGw7XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5lbGVtZW50cyA9IHtcbiAgICAgICAgbGluZTogbnVsbCxcbiAgICAgICAgbGFiZWw6IG51bGxcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGFibGVSZXNpemVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl90YWJsZURlc3Ryb3lMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSBudWxsO1xuXG4gICAgdGhpcy52YWx1ZSA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFRpbWVVcGRhdGVkID0gbnVsbDtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZU1hcmtlciwgRXZlbnRFbWl0dGVyKTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX0hPUklaT05UQUwgPSAnaG9yaXpvbnRhbCc7XG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5MQVlPVVRfVkVSVElDQUwgPSAndmVydGljYWwnO1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcbiAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQ7IH0sXG4gICAgb3V0ZXJUaWNrU2l6ZTogMTAsXG4gICAgdGlja1BhZGRpbmc6IDEwLFxuICAgIHJvdW5kUG9zaXRpb246IGZhbHNlLFxuICAgIGJlbUJsb2NrTmFtZTogJ3RhYmxlTWFya2VyJyxcbiAgICBiZW1Nb2RpZmllcnM6IFtdLFxuICAgIGxheW91dDogRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX1ZFUlRJQ0FMXG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0QzVGFibGV9IHRhYmxlXG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNldFRhYmxlID0gZnVuY3Rpb24odGFibGUpIHtcblxuICAgIHZhciBwcmV2aW91c1RhYmxlID0gdGhpcy50YWJsZTtcblxuICAgIHRoaXMudGFibGUgPSB0YWJsZSAmJiB0YWJsZSBpbnN0YW5jZW9mIEQzVGFibGUgPyB0YWJsZSA6IG51bGw7XG5cbiAgICBpZiAodGhpcy50YWJsZSkge1xuICAgICAgICBpZiAocHJldmlvdXNUYWJsZSAhPT0gdGhpcy50YWJsZSkge1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzVGFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVuYmluZFRhYmxlKHByZXZpb3VzVGFibGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5iaW5kVGFibGUoKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXRoaXMudGFibGUgJiYgcHJldmlvdXNUYWJsZSkge1xuICAgICAgICB0aGlzLnVuYmluZFRhYmxlKHByZXZpb3VzVGFibGUpO1xuICAgIH1cblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUudmFsdWVDb21wYXJhdG9yID0gZnVuY3Rpb24odGltZUEsIHRpbWVCKSB7XG4gICAgcmV0dXJuICt0aW1lQSAhPT0gK3RpbWVCO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuc2V0VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSwgc2lsZW50KSB7XG5cbiAgICB2YXIgcHJldmlvdXNUaW1lVXBkYXRlZCA9IHRoaXMuX2xhc3RUaW1lVXBkYXRlZDtcblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICAgIGlmICh0aGlzLnZhbHVlQ29tcGFyYXRvcihwcmV2aW91c1RpbWVVcGRhdGVkLCB0aGlzLnZhbHVlKSAmJiB0aGlzLnRhYmxlICYmIHRoaXMuY29udGFpbmVyKSB7XG5cbiAgICAgICAgdGhpcy5fbGFzdFRpbWVVcGRhdGVkID0gdGhpcy52YWx1ZTtcblxuICAgICAgICB0aGlzLmNvbnRhaW5lclxuICAgICAgICAgICAgLmRhdHVtKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghc2lsZW50KSB7XG4gICAgICAgICAgICB0aGlzLm1vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEudmFsdWU7XG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5iaW5kVGFibGUgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBjbGFzc05hbWUgPSB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctLScgKyB0aGlzLm9wdGlvbnMubGF5b3V0O1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5iZW1Nb2RpZmllcnMgJiYgQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXJzKSAmJiB0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY2xhc3NOYW1lID0gY2xhc3NOYW1lICsgJyAnICsgdGhpcy5vcHRpb25zLmJlbU1vZGlmaWVycy5tYXAoZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy0tJyArIG1vZGlmaWVyO1xuICAgICAgICB9KS5qb2luKCcgJyk7XG4gICAgfVxuXG4gICAgdGhpcy5jb250YWluZXIgPSB0aGlzLnRhYmxlLmNvbnRhaW5lclxuICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgLmRhdHVtKHtcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnZhbHVlXG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIGNsYXNzTmFtZSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmxpbmUgPSB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctbGluZScpXG4gICAgICAgIC5zdHlsZSgncG9pbnRlci1ldmVudHMnLCAnbm9uZScpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5sYWJlbCA9IHRoaXMuY29udGFpbmVyXG4gICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1sYWJlbCcpO1xuXG4gICAgdGhpcy5zaXplTGluZUFuZExhYmVsKCk7XG5cbiAgICAvLyBvbiB0YWJsZSBtb3ZlLCBtb3ZlIHRoZSBtYXJrZXJcbiAgICB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lciA9IHRoaXMubW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScsIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyKTtcblxuICAgIC8vIG9uIHRhYmxlIHJlc2l6ZSwgcmVzaXplIHRoZSBtYXJrZXIgYW5kIG1vdmUgaXRcbiAgICB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgICAgIHNlbGYucmVzaXplKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIHNlbGYubW92ZSh0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH07XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyKTtcblxuICAgIHRoaXMuX3RhYmxlRGVzdHJveUxpc3RlbmVyID0gZnVuY3Rpb24odGFibGUpIHtcbiAgICAgICAgc2VsZi51bmJpbmRUYWJsZSh0YWJsZSk7XG4gICAgfTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOmRlc3Ryb3knLCB0aGlzLl90YWJsZURlc3Ryb3lMaXN0ZW5lcik7XG5cbiAgICB0aGlzLmVtaXQoJ21hcmtlcjpib3VuZCcpO1xuXG4gICAgdGhpcy5tb3ZlKCk7XG5cbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNpemVMaW5lQW5kTGFiZWwgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBsYXlvdXQgPSB0aGlzLm9wdGlvbnMubGF5b3V0O1xuXG4gICAgdmFyIGxpbmUgPSB0aGlzLmVsZW1lbnRzLmxpbmU7XG4gICAgdmFyIGxhYmVsID0gdGhpcy5lbGVtZW50cy5sYWJlbDtcblxuICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgIGxpbmUgPSBsaW5lLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBsYWJlbCA9IGxhYmVsLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH1cblxuICAgIHN3aXRjaChsYXlvdXQpIHtcbiAgICAgICAgY2FzZSB0aGlzLkxBWU9VVF9WRVJUSUNBTDpcbiAgICAgICAgICAgIGxpbmVcbiAgICAgICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgIHkxOiAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUsXG4gICAgICAgICAgICAgICAgICAgIHkyOiB0aGlzLnRhYmxlLmRpbWVuc2lvbnMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsIC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZS10aGlzLm9wdGlvbnMudGlja1BhZGRpbmcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdGhpcy5MQVlPVVRfSE9SSVpPTlRBTDpcbiAgICAgICAgICAgIGxpbmVcbiAgICAgICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgIHgxOiAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUsXG4gICAgICAgICAgICAgICAgICAgIHgyOiB0aGlzLnRhYmxlLmRpbWVuc2lvbnMud2lkdGhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2R4JywgLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLXRoaXMub3B0aW9ucy50aWNrUGFkZGluZylcbiAgICAgICAgICAgICAgICAuYXR0cignZHknLCA0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUudW5iaW5kVGFibGUgPSBmdW5jdGlvbihwcmV2aW91c1RhYmxlKSB7XG5cbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnLCB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lcik7XG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOmRlc3Ryb3knLCB0aGlzLl90YWJsZURlc3Ryb3lMaXN0ZW5lcik7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgcHJldmlvdXNUYWJsZS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9tb3ZlQUYpO1xuICAgICAgICB0aGlzLl9tb3ZlQUYgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLmVtaXQoJ21hcmtlcjp1bmJvdW5kJywgcHJldmlvdXNUYWJsZSk7XG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHRoaXMudGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSB0aGlzLnRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm1vdmVTeW5jLmJpbmQodGhpcykpO1xuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5tb3ZlU3luYyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKCF0aGlzLnRhYmxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGxheW91dCA9IHRoaXMub3B0aW9ucy5sYXlvdXQ7XG5cbiAgICB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuZWFjaChmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNlbGYuZ2V0VmFsdWUoZCk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHNjYWxlLCBwb3NpdGlvbiA9IFswLCAwXSwgcG9zaXRpb25JbmRleDtcblxuICAgICAgICAgICAgc3dpdGNoKGxheW91dCkge1xuICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5MQVlPVVRfVkVSVElDQUw6XG4gICAgICAgICAgICAgICAgICAgIHNjYWxlID0gc2VsZi50YWJsZS5zY2FsZXMueDtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25JbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5MQVlPVVRfSE9SSVpPTlRBTDpcbiAgICAgICAgICAgICAgICAgICAgc2NhbGUgPSBzZWxmLnRhYmxlLnNjYWxlcy55O1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkluZGV4ID0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcG9zaXRpb25bcG9zaXRpb25JbmRleF0gPSBzY2FsZSh2YWx1ZSk7XG5cbiAgICAgICAgICAgIHZhciByYW5nZSA9IHNjYWxlLnJhbmdlKCk7XG4gICAgICAgICAgICB2YXIgaXNJblJhbmdlID0gcG9zaXRpb25bcG9zaXRpb25JbmRleF0gPj0gcmFuZ2VbMF0gJiYgcG9zaXRpb25bcG9zaXRpb25JbmRleF0gPD0gcmFuZ2VbcmFuZ2UubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgICAgIHZhciBnID0gZDMuc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgICAgICBpZiAoaXNJblJhbmdlKSB7XG5cbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcblxuICAgICAgICAgICAgICAgIGcuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyhzZWxmLnRhYmxlLm1hcmdpbi5sZWZ0ICsgcG9zaXRpb25bMF0gPj4gMCkrJywnKyhzZWxmLnRhYmxlLm1hcmdpbi50b3AgKyBwb3NpdGlvblsxXSA+PiAwKSsnKScpO1xuXG4gICAgICAgICAgICAgICAgZy5zZWxlY3QoJy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctbGFiZWwnKVxuICAgICAgICAgICAgICAgICAgICAudGV4dChzZWxmLm9wdGlvbnMuZm9ybWF0dGVyKHZhbHVlKSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5zdHlsZSgnZGlzcGxheScsICcnKTtcbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5zdHlsZSgnZGlzcGxheScsICdub25lJyk7XG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHRoaXMuc2l6ZUxpbmVBbmRMYWJlbCh0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVNYXJrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGVNYXJrZXIgZnJvbSAnLi9EM1RhYmxlTWFya2VyJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbi8qKlxuICpcbiAqIEBleHRlbmRzIHtEM1RhYmxlTWFya2VyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGFibGVNb3VzZVRyYWNrZXIob3B0aW9ucykge1xuICAgIEQzVGFibGVNYXJrZXIuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyID0gbnVsbDtcbiAgICB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyID0gbnVsbDtcbiAgICB0aGlzLl90YWJsZU1vdXNlbGVhdmVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSBudWxsO1xuXG4gICAgdGhpcy5vbignbWFya2VyOmJvdW5kJywgdGhpcy5oYW5kbGVUYWJsZUJvdW5kLmJpbmQodGhpcykpO1xuICAgIHRoaXMub24oJ21hcmtlcjp1bmJvdW5kJywgdGhpcy5oYW5kbGVUYWJsZVVuYm91bmQuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMgPSBmYWxzZTtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZU1vdXNlVHJhY2tlciwgRDNUYWJsZU1hcmtlcik7XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbU1vZGlmaWVyczogWydtb3VzZVRyYWNrZXInXSxcbiAgICBsaXN0ZW5Ub1RvdWNoRXZlbnRzOiB0cnVlXG59KTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlVGFibGVCb3VuZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIgPSB0aGlzLmhhbmRsZU1vdXNlZW50ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyID0gdGhpcy5oYW5kbGVNb3VzZW1vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl90YWJsZU1vdXNlbGVhdmVMaXN0ZW5lciA9IHRoaXMuaGFuZGxlTW91c2VsZWF2ZS5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWVudGVyJywgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIpO1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2Vtb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWxlYXZlJywgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5saXN0ZW5Ub1RvdWNoRXZlbnRzKSB7XG4gICAgICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IHRydWU7XG4gICAgICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6dG91Y2htb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzID0gZmFsc2U7XG4gICAgfVxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlVGFibGVVbmJvdW5kID0gZnVuY3Rpb24ocHJldmlvdXNUYWJsZSkge1xuXG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWVudGVyJywgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2Vtb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWxlYXZlJywgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIpO1xuXG4gICAgaWYgKHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cykge1xuICAgICAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnRvdWNobW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIH1cblxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuZ2V0VmFsdWVGcm9tVGFibGVFdmVudCA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuICAgIHN3aXRjaCAodGhpcy5vcHRpb25zLmxheW91dCkge1xuICAgICAgICBjYXNlICd2ZXJ0aWNhbCc6XG4gICAgICAgICAgICByZXR1cm4gZ2V0VGltZSgpO1xuICAgICAgICBjYXNlICdob3Jpem9udGFsJzpcbiAgICAgICAgICAgIHJldHVybiBnZXRSb3coKTtcbiAgICB9XG59O1xuXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVNb3VzZWVudGVyID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgdGltZSA9IHRoaXMuZ2V0VmFsdWVGcm9tVGFibGVFdmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNob3coKTtcbiAgICAgICAgc2VsZi5zZXRWYWx1ZSh0aW1lKTtcbiAgICB9KTtcblxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2Vtb3ZlID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHRpbWUgPSB0aGlzLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSB0YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuc2V0VmFsdWUodGltZSk7XG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZU1vdXNlbGVhdmUgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICB9KTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RhYmxlTW91c2VUcmFja2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlTWFya2VyIGZyb20gJy4vRDNUYWJsZU1hcmtlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqXG4gKiBAZXh0ZW5kcyB7RDNUYWJsZU1hcmtlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RhYmxlVmFsdWVUcmFja2VyKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlTWFya2VyLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZVZhbHVlVHJhY2tlciwgRDNUYWJsZU1hcmtlcik7XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbU1vZGlmaWVyczogWyd2YWx1ZVRyYWNrZXInXVxufSk7XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlR2V0dGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgIHJldHVybiAwO1xuXG59O1xuXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAgIGQzLnRpbWVyKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuc2V0VmFsdWUoc2VsZi52YWx1ZUdldHRlcigpKTtcblxuICAgICAgICByZXR1cm4gIXNlbGYuZW5hYmxlZDtcblxuICAgIH0pO1xufTtcblxuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZVZhbHVlVHJhY2tlcjtcbiIsIi8qIGdsb2JhbCBjYW5jZWxBbmltYXRpb25GcmFtZSwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IEQzQmxvY2tUYWJsZSBmcm9tICcuL0QzQmxvY2tUYWJsZSc7XG5pbXBvcnQgZDMgZnJvbSAnZDMnO1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGltZWxpbmUob3B0aW9ucykge1xuXG4gICAgRDNCbG9ja1RhYmxlLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPSB0aGlzLm9wdGlvbnMubWluaW11bVRpbWVJbnRlcnZhbDtcbn1cblxuaW5oZXJpdHMoRDNUaW1lbGluZSwgRDNCbG9ja1RhYmxlKTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1CbG9ja05hbWU6ICd0aW1lbGluZScsXG4gICAgYmVtQmxvY2tNb2RpZmllcjogJycsXG4gICAgeEF4aXNUaWNrc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZC5nZXRNaW51dGVzKCkgJSAxNSA/ICcnIDogZDMudGltZS5mb3JtYXQoJyVIOiVNJykoZCk7XG4gICAgfSxcbiAgICB4QXhpc1N0cm9rZVdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkLmdldE1pbnV0ZXMoKSAlMzAgPyAxIDogMjtcbiAgICB9LFxuICAgIG1pbmltdW1Db2x1bW5XaWR0aDogMzAsXG4gICAgbWluaW11bVRpbWVJbnRlcnZhbDogM2U1LFxuICAgIGF2YWlsYWJsZVRpbWVJbnRlcnZhbHM6IFsgNmU0LCAzZTUsIDllNSwgMS44ZTYsIDMuNmU2LCA3LjJlNiwgMS40NGU3LCAyLjg4ZTcsIDQuMzJlNywgOC42NGU3IF1cbn0pO1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS54U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnRpbWUuc2NhbGUoKTtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLnlTY2FsZUZhY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUubGluZWFyKCk7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhU3RhcnQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuc3RhcnQ7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhRW5kID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmVuZDtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLl9jb21wdXRlQ29sdW1uV2lkdGhGcm9tVGltZUludGVydmFsID0gZnVuY3Rpb24odGltZUludGVydmFsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGVzLngobmV3IERhdGUodGltZUludGVydmFsKSkgLSB0aGlzLnNjYWxlcy54KG5ldyBEYXRlKDApKTtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLnVwZGF0ZVhBeGlzSW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBtaW5pbXVtVGltZUludGVydmFsID0gdGhpcy5vcHRpb25zLm1pbmltdW1UaW1lSW50ZXJ2YWw7XG4gICAgdmFyIG1pbmltdW1Db2x1bW5XaWR0aCA9IHRoaXMub3B0aW9ucy5taW5pbXVtQ29sdW1uV2lkdGg7XG4gICAgdmFyIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWw7XG4gICAgdmFyIGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMgPSB0aGlzLm9wdGlvbnMuYXZhaWxhYmxlVGltZUludGVydmFscztcbiAgICB2YXIgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4ID0gYXZhaWxhYmxlVGltZUludGVydmFscy5pbmRleE9mKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuICAgIHZhciBjdXJyZW50Q29sdW1uV2lkdGggPSB0aGlzLl9jb21wdXRlQ29sdW1uV2lkdGhGcm9tVGltZUludGVydmFsKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlVGltZUludGVydmFsKGRlbHRhKSB7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCArPSBkZWx0YTtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbCA9IGF2YWlsYWJsZVRpbWVJbnRlcnZhbHNbY3VycmVudFRpbWVJbnRlcnZhbEluZGV4XTtcbiAgICAgICAgY3VycmVudENvbHVtbldpZHRoID0gc2VsZi5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbChjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB9XG5cbiAgICBpZiAoYXZhaWxhYmxlVGltZUludGVydmFscy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChjdXJyZW50Q29sdW1uV2lkdGggPCBtaW5pbXVtQ29sdW1uV2lkdGgpIHtcbiAgICAgICAgICAgIHdoaWxlKGN1cnJlbnRDb2x1bW5XaWR0aCA8IG1pbmltdW1Db2x1bW5XaWR0aCAmJiBjdXJyZW50VGltZUludGVydmFsSW5kZXggPCBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoKSB7XG4gICAgICAgICAgICB3aGlsZShjdXJyZW50Q29sdW1uV2lkdGggPiBtaW5pbXVtQ29sdW1uV2lkdGggJiYgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbCgtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY3VycmVudFRpbWVJbnRlcnZhbCA8IG1pbmltdW1UaW1lSW50ZXJ2YWwpIHtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbCA9IG1pbmltdW1UaW1lSW50ZXJ2YWw7XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbClcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBNYXRoLmZsb29yKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuICAgIHRoaXMuY29sdW1uV2lkdGggPSBNYXRoLmZsb29yKGN1cnJlbnRDb2x1bW5XaWR0aCk7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gMy42ZTYpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiA2ZTQpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiAxZTMpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuc2V0VGltZVJhbmdlID0gZnVuY3Rpb24obWluRGF0ZSwgbWF4RGF0ZSkge1xuICAgIHJldHVybiB0aGlzLnNldFhSYW5nZShtaW5EYXRlLCBtYXhEYXRlKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEQzVGltZWxpbmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGVWYWx1ZVRyYWNrZXIgZnJvbSAnLi9EM1RhYmxlVmFsdWVUcmFja2VyJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbi8qKlxuICpcbiAqIEBleHRlbmRzIHtEM1RhYmxlVmFsdWVUcmFja2VyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGltZWxpbmVUaW1lVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZVZhbHVlVHJhY2tlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xufVxuXG5pbmhlcml0cyhEM1RpbWVsaW5lVGltZVRyYWNrZXIsIEQzVGFibGVWYWx1ZVRyYWNrZXIpO1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbUJsb2NrTmFtZTogJ3RpbWVsaW5lTWFya2VyJyxcbiAgICBiZW1Nb2RpZmllcnM6IFsndGltZVRyYWNrZXInXSxcbiAgICBsYXlvdXQ6ICd2ZXJ0aWNhbCdcbn0pO1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnRpbWVHZXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudGltZUNvbXBhcmF0b3IgPSBmdW5jdGlvbihhLGIpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZUNvbXBhcmF0b3IoYSxiKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUuc2V0VGltZSA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aW1lKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUuc2V0VGltZWxpbmUgPSBmdW5jdGlvbih0aW1lbGluZSkge1xuICAgIHJldHVybiB0aGlzLnNldFRhYmxlKHRpbWVsaW5lKTtcbn07XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudmFsdWVHZXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50aW1lR2V0dGVyKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGltZWxpbmVUaW1lVHJhY2tlcjtcbiJdfQ==
(1)
});
;