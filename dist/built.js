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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9pbmRleC5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL3NyYy9EM0Jsb2NrVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzNELE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOzs7QUNSakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBLFlBQVksQ0FBQzs7Ozs7Ozs7dUJBRU8sV0FBVzs7Ozt3QkFDVixVQUFVOzs7O3NCQUNaLFFBQVE7Ozs7Ozs7Ozs7QUFPM0IsU0FBUyxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQzNCLHlCQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDL0I7O0FBRUQsMkJBQVMsWUFBWSx1QkFBVSxDQUFDOztBQUVoQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyx5QkFBTyxJQUFJLEVBQUUsRUFBRSxFQUFFLHFCQUFRLFNBQVMsQ0FBQyxRQUFRLEVBQUU7QUFDM0UsZUFBVyxFQUFFLElBQUk7QUFDakIscUJBQWlCLEVBQUUsSUFBSTtBQUN2QiwrQkFBMkIsRUFBRSxJQUFJO0FBQ2pDLDhCQUEwQixFQUFFLEtBQUs7QUFDakMsa0NBQThCLEVBQUUsSUFBSTtBQUNwQyw4QkFBMEIsRUFBRSxFQUFFO0FBQzlCLGNBQVUsRUFBRSxJQUFJO0FBQ2hCLGFBQVMsRUFBRSxJQUFJO0FBQ2Ysb0JBQWdCLEVBQUUsSUFBSTtBQUN0Qix3QkFBb0IsRUFBRSxHQUFHO0FBQ3pCLDRCQUF3QixFQUFFLEVBQUU7QUFDNUIsdUJBQW1CLEVBQUUsQ0FBQztDQUN6QixDQUFDLENBQUM7O0FBRUgsWUFBWSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxVQUFTLENBQUMsRUFBRTtBQUNwRCxXQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLG1CQUFtQixHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7Q0FDOUYsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLG9CQUFvQixHQUFHLFVBQVMsQ0FBQyxFQUFFO0FBQ3RELFdBQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMzQyxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEdBQUcsVUFBUyxDQUFDLEVBQUU7QUFDdEQsV0FBTyxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztDQUNyRCxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEdBQUcsVUFBUyxDQUFDLEVBQUU7QUFDcEQsV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO0NBQzlGLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBUyxTQUFTLEVBQUU7O0FBRXRELFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFaEIsUUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDOztBQUV6RSxRQUFJLElBQUksR0FBRyxTQUFTLENBQ2YsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNkLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsb0JBQW9CLENBQUMsQ0FDL0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQzs7QUFFbkMsUUFBSSxDQUFDLEdBQUcsU0FBUyxDQUNaLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDWCxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLGlCQUFpQixDQUFDLENBQUM7O0FBRWxFLEtBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQ1IsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyx3QkFBd0IsQ0FBQyxDQUFDOztBQUd6RSxRQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7O0FBRXhCLFFBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7QUFDMUIsWUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEtBQUssVUFBVSxFQUFFO0FBQ3RELHVCQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztTQUN4RSxNQUFNO0FBQ0gsdUJBQVcsR0FBRyxJQUFJLENBQUM7U0FDdEI7S0FDSjs7QUFFRCxRQUFJLFdBQVcsRUFBRTs7QUFFYixTQUFDLENBQ0ksSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O0FBRTdELFlBQUksQ0FDQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFeEQsaUJBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQ3ZCLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUNsRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQ2IsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDakU7O0FBRUQsYUFBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBUyxDQUFDLEVBQUU7QUFDOUIsWUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7QUFDNUIsZ0JBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakU7S0FDSixDQUFDLENBQUM7O0FBRUgsUUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtBQUN6QixpQkFBUyxDQUNKLE1BQU0sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUN6QyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQ2QsT0FBTyxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxDQUNyQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNqRDs7QUFFRCxhQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFcEQsUUFBSSxDQUFDLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0NBRTlDLENBQUM7O0FBR0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxVQUFTLFNBQVMsRUFBRSxDQUFDLEVBQUU7O0FBRTlELFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFaEIsUUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixFQUFFOztBQUU1RyxpQkFBUyxDQUNKLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsd0JBQXdCLENBQUMsQ0FDbEUsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFTLENBQUMsRUFBRTtBQUMzQixtQkFBTyxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7U0FDbEYsQ0FBQyxDQUFDO0tBQ1Y7Q0FFSixDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEdBQUcsWUFBVyxFQUFFLENBQUM7O0FBRTNELFlBQVksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEdBQUcsWUFBVyxFQUFFLENBQUM7OztBQUk1RCxZQUFZLENBQUMsU0FBUyxDQUFDLDBCQUEwQixHQUFHLFVBQVMsU0FBUyxFQUFFOztBQUVwRSxRQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsUUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDekMsUUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDOzs7QUFHeEIsUUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDNUIsUUFBSSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7QUFDakMsUUFBSSxVQUFVLEdBQUcsQ0FBQztRQUFFLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDbkMsUUFBSSxhQUFhLEdBQUcsQ0FBQztRQUFFLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFDekMsUUFBSSxZQUFZLENBQUM7QUFDakIsUUFBSSxpQkFBaUIsQ0FBQzs7O0FBR3RCLFFBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztBQUNyQixRQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDdkIsUUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLFFBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztBQUN4QixRQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDeEIsUUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzFCLFFBQUksU0FBUyxDQUFDOzs7QUFHZCxhQUFTLFVBQVUsR0FBRztBQUNsQix3QkFBZ0IsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLHFCQUFxQixHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztBQUNyRixxQkFBYSxHQUFHLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QyxxQkFBYSxHQUFHLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QyxrQkFBVSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixrQkFBVSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNoQzs7O0FBR0QsYUFBUyxlQUFlLENBQUMsU0FBUyxFQUFFOztBQUVoQyxZQUFJLE1BQU0sR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDO0FBQzFDLFlBQUksTUFBTSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUM7O0FBRTFDLFlBQUksU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUU7QUFDekMsc0JBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUM1Qjs7QUFFRCx3QkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxHQUFHLE1BQU0sQ0FBQztBQUN2RCx3QkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxHQUFHLE1BQU0sQ0FBQzs7QUFFdkQsaUJBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7S0FFNUQ7OztBQUdELFFBQUksY0FBYyxHQUFHLE1BQU0sQ0FBQyxXQUFXLElBQUksT0FBTyxXQUFXLENBQUMsR0FBRyxLQUFLLFVBQVUsR0FDNUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQy9CLE9BQU8sSUFBSSxDQUFDLEdBQUcsS0FBSyxVQUFVLEdBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUNqQixZQUFXO0FBQ1QsZUFBTyxDQUFFLElBQUksSUFBSSxFQUFFLEFBQUMsQ0FBQztLQUN4QixDQUFDOzs7QUFHVixhQUFTLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUU7OztBQUc3QyxZQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDO0FBQ2xFLFlBQUksTUFBTSxHQUFHLGNBQWMsR0FBRyxlQUFlLEdBQUcsU0FBUyxHQUFHLGVBQWUsQ0FBQztBQUM1RSxZQUFJLE1BQU0sR0FBRyxZQUFZLEdBQUcsYUFBYSxHQUFHLFNBQVMsR0FBRyxlQUFlLENBQUM7OztBQUd4RSxZQUFJLFNBQVMsRUFBRTtBQUNYLGdCQUFJLDZCQUE2QixHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEYseUJBQWEsSUFBSSw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCx5QkFBYSxJQUFJLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3JEOztBQUVELFlBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDOztBQUVyRyxZQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDNUIsMkJBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM5Qjs7QUFFRCxxQkFBYSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixxQkFBYSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFN0IscUJBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDMUQ7O0FBR0QsUUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FDeEIsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFTLElBQUksRUFBRTs7QUFFNUIsWUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRTtBQUN0QixjQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUMxQzs7QUFFRCx5QkFBaUIsR0FBRyxZQUFZLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFdEQsaUJBQVMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7O0FBRXhCLGtCQUFVLEVBQUUsQ0FBQzs7QUFFYixZQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0FBQzlCLFlBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUVuQyxDQUFDLENBQ0QsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFTLElBQUksRUFBRTs7QUFFdkIsb0JBQVksR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUVsQyxZQUFJLENBQUMsV0FBVyxFQUFFOztBQUVkLGdCQUFJLFNBQVMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDO0FBQ3hDLGdCQUFJLFdBQVcsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekQsZ0JBQUksV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RCxnQkFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUMsV0FBVyxHQUFDLFdBQVcsR0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFOUUsdUJBQVcsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFBLElBQUssWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7O0FBRXpLLGdCQUFJLFdBQVcsRUFBRTtBQUNiLG9CQUFJLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDeEU7U0FDSjs7QUFFRCxZQUFJLFdBQVcsRUFBRTtBQUNiLGdCQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ25FOztBQUVELFlBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUM7QUFDMUQsWUFBSSxNQUFNLEdBQUcsV0FBVyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUM7QUFDckUsWUFBSSxLQUFLLEdBQUcsV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQyxZQUFJLE9BQU8sR0FBRyxXQUFXLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUN2RSxZQUFJLElBQUksR0FBRyxXQUFXLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV6Qyx1QkFBZSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLHFCQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRWxFLFlBQUksc0JBQXNCLEdBQUcsY0FBYyxDQUFDO0FBQzVDLFlBQUksb0JBQW9CLEdBQUcsWUFBWSxDQUFDO0FBQ3hDLHNCQUFjLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckQsb0JBQVksR0FBRyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFbkQsWUFBSSxlQUFlLEdBQUcsc0JBQXNCLEtBQUssY0FBYyxJQUFJLG9CQUFvQixLQUFLLFlBQVksQ0FBQzs7QUFFekcsWUFBSSxDQUFDLGNBQWMsSUFBSSxZQUFZLENBQUEsSUFBSyxDQUFDLFdBQVcsSUFBSSxlQUFlLEVBQUU7O0FBRXJFLGdCQUFJLGNBQWMsR0FBRyxjQUFjLEVBQUUsQ0FBQzs7QUFFdEMsdUJBQVcsR0FBRyxJQUFJLENBQUM7O0FBRW5CLGNBQUUsQ0FBQyxLQUFLLENBQUMsWUFBVzs7QUFFaEIsb0JBQUksV0FBVyxHQUFHLGNBQWMsRUFBRSxDQUFDO0FBQ25DLG9CQUFJLFNBQVMsR0FBRyxXQUFXLEdBQUcsY0FBYyxDQUFDOztBQUU3QyxvQkFBSSxhQUFhLEdBQUcsQ0FBQyxZQUFZLElBQUksQ0FBQyxjQUFjLElBQUksYUFBYSxDQUFDOztBQUV0RSxpQ0FBaUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsSUFBSSxhQUFhLENBQUMsQ0FBQzs7QUFFeEYsOEJBQWMsR0FBRyxXQUFXLENBQUM7O0FBRTdCLG9CQUFJLGFBQWEsRUFBRTtBQUNmLGlDQUFhLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLCtCQUFXLEdBQUcsS0FBSyxDQUFDO2lCQUN2Qjs7QUFFRCx1QkFBTyxhQUFhLENBQUM7YUFDeEIsQ0FBQyxDQUFDO1NBQ047O0FBRUQsWUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2QsZ0JBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDM0M7O0FBRUQsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsZUFBZSxDQUFDLENBQUM7S0FFOUQsQ0FBQyxDQUNELEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBUyxJQUFJLEVBQUU7O0FBRTFCLFlBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDeEMsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDcEIsc0JBQWMsR0FBRyxDQUFDLENBQUM7QUFDbkIsb0JBQVksR0FBRyxDQUFDLENBQUM7O0FBRWpCLFlBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7QUFDL0IsWUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUUvRCxVQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUVqQixZQUFJLHNCQUFzQixHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDeEQsWUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLFlBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXJELFlBQUksV0FBVyxFQUFFO0FBQ2IsZ0JBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ3ZJLE1BQU07QUFDSCxxQkFBUyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUscUJBQXFCLENBQUMsQ0FBQztTQUN0RDs7QUFFRCxZQUFJLENBQ0MsT0FBTyxFQUFFLENBQ1QsU0FBUyxFQUFFLENBQUM7O0FBRWpCLG1CQUFXLEdBQUcsS0FBSyxDQUFDO0tBQ3ZCLENBQUMsQ0FBQzs7QUFFUCxhQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBRXhCLENBQUM7O0FBR0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsVUFBUyxTQUFTLEVBQUUsQ0FBQyxFQUFFLGtCQUFrQixFQUFFOzs7QUFFOUUsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixRQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsb0JBQW9CLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUMvRyxJQUFJLENBQUM7QUFDRixTQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVO0FBQzFCLGFBQUssRUFBRSxlQUFTLENBQUMsRUFBRTtBQUNmLG1CQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDakY7S0FDSixDQUFDLENBQUM7O0FBRVAsUUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsRUFBRTs7QUFFM0UsaUJBQVMsQ0FDSixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLHdCQUF3QixDQUFDLENBQ2xFLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBQSxDQUFDO21CQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSztTQUFBLENBQUMsQ0FBQztLQUN6Rzs7QUFFRCxhQUFTLENBQUMsSUFBSSxDQUFDLFlBQVc7QUFDdEIsWUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztLQUMvRCxDQUFDLENBQUM7Q0FFTixDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVMsU0FBUyxFQUFFOztBQUVyRCxhQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztDQUUvQixDQUFDOztxQkFFYSxZQUFZOzs7Ozs7QUNsWDNCLFlBQVksQ0FBQzs7Ozs7Ozs7c0JBRU0sUUFBUTs7Ozt3QkFDTixVQUFVOzs7OzRCQUNOLGVBQWU7Ozs7a0JBQ3pCLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3Qm5CLFNBQVMsT0FBTyxDQUFDLE9BQU8sRUFBRTs7QUFFdEIsOEJBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV4QixXQUFPLENBQUMsY0FBYyxJQUFJLENBQUMsQ0FBQzs7QUFFNUIsUUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDOztBQUU3QyxRQUFJLENBQUMsT0FBTyxHQUFHLHlCQUFPLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQzs7Ozs7QUFNeEQsUUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7Ozs7O0FBS2YsUUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7O0FBR3hCLFFBQUksQ0FBQyxNQUFNLEdBQUc7QUFDVixXQUFHLEVBQUUsQ0FBQztBQUNOLGFBQUssRUFBRSxDQUFDO0FBQ1IsY0FBTSxFQUFFLENBQUM7QUFDVCxZQUFJLEVBQUUsQ0FBQztLQUNWLENBQUM7O0FBRUYsUUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDOztBQUUxQyxRQUFJLENBQUMsNkJBQTZCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7O0FBRWhELFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOztBQUV0QixRQUFJLENBQUMsUUFBUSxHQUFHO0FBQ1osWUFBSSxFQUFFLElBQUk7QUFDVixzQkFBYyxFQUFFLElBQUk7QUFDcEIsc0JBQWMsRUFBRSxJQUFJO0FBQ3BCLHVCQUFlLEVBQUUsSUFBSTtBQUNyQixzQkFBYyxFQUFFLElBQUk7QUFDcEIsWUFBSSxFQUFFLElBQUk7QUFDVixZQUFJLEVBQUUsSUFBSTtLQUNiLENBQUM7O0FBRUYsUUFBSSxDQUFDLE1BQU0sR0FBRztBQUNWLFNBQUMsRUFBRSxJQUFJO0FBQ1AsU0FBQyxFQUFFLElBQUk7S0FDVixDQUFDOztBQUVGLFFBQUksQ0FBQyxNQUFNLEdBQUc7QUFDVixTQUFDLEVBQUUsSUFBSTtBQUNQLFVBQUUsRUFBRSxJQUFJO0FBQ1IsU0FBQyxFQUFFLElBQUk7S0FDVixDQUFDOztBQUVGLFFBQUksQ0FBQyxTQUFTLEdBQUc7QUFDYixZQUFJLEVBQUUsSUFBSTtBQUNWLGFBQUssRUFBRSxJQUFJO0FBQ1gsYUFBSyxFQUFFLElBQUk7QUFDWCxXQUFHLEVBQUUsSUFBSTtLQUNaLENBQUM7O0FBRUYsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDM0IsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ25CLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFDMUIsUUFBSSxDQUFDLHNCQUFzQixHQUFHLENBQUMsQ0FBQztBQUNoQyxRQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLENBQUM7QUFDOUIsUUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7QUFDN0IsUUFBSSxDQUFDLDJCQUEyQixHQUFHLEVBQUUsQ0FBQztBQUN0QyxRQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQztBQUMvQixRQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztDQUN6Qjs7QUFFRCwyQkFBUyxPQUFPLDRCQUFlLENBQUM7O0FBRWhDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHO0FBQ3pCLGdCQUFZLEVBQUUsT0FBTztBQUNyQixvQkFBZ0IsRUFBRSxFQUFFO0FBQ3BCLGVBQVcsRUFBRSxFQUFFO0FBQ2YsY0FBVSxFQUFFLEVBQUU7QUFDZCxhQUFTLEVBQUUsRUFBRTtBQUNiLGNBQVUsRUFBRSxDQUFDO0FBQ2IsYUFBUyxFQUFFLE1BQU07QUFDakIsWUFBUSxFQUFFLElBQUk7QUFDZCxZQUFRLEVBQUUsSUFBSTtBQUNkLG1CQUFlLEVBQUUsQ0FBQztBQUNsQixnQkFBWSxFQUFFLElBQUk7QUFDbEIsbUJBQWUsRUFBRSxLQUFLO0FBQ3RCLG1CQUFlLEVBQUUsS0FBSztBQUN0QixlQUFXLEVBQUUsSUFBSTtBQUNqQixtQkFBZSxFQUFFLENBQUM7QUFDbEIscUJBQWlCLEVBQUUsSUFBSTtBQUN2QiwwQkFBc0IsRUFBRSxJQUFJO0FBQzVCLCtCQUEyQixFQUFFLEtBQUs7QUFDbEMsb0JBQWdCLEVBQUUsYUFBYTtBQUMvQix1QkFBbUIsRUFBRSw2QkFBUyxDQUFDLEVBQUU7QUFDN0IsZUFBTyxDQUFDLENBQUM7S0FDWjtBQUNELG9CQUFnQixFQUFFLDBCQUFTLENBQUMsRUFBRTtBQUMxQixlQUFPLENBQUMsR0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN0QjtBQUNELHdCQUFvQixFQUFFLDhCQUFTLENBQUMsRUFBRTtBQUM5QixlQUFPLEVBQUUsQ0FBQztLQUNiO0FBQ0Qsa0JBQWMsRUFBRSx3QkFBUyxDQUFDLEVBQUU7QUFDeEIsZUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7S0FDNUI7QUFDRCxXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFlBQVksQ0FBQztDQUNwRixDQUFDOztBQUVGLE9BQU8sQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDOztBQUUzQixPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxZQUFXLEVBQUUsQ0FBQzs7QUFFdkMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsWUFBVzs7O0FBR3RDLFFBQUksQ0FBQyxTQUFTLEdBQUcsZ0JBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUMzRCxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFBLEFBQUMsQ0FBQyxDQUFDOzs7QUFHdkosUUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7OztBQUduRCxRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxpQkFBaUIsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDO0FBQ3BGLFFBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FDckQsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM1QixRQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FDYixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7OztBQUdwQixRQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDOzs7QUFHbEUsUUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQ3BELElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxDQUFDOztBQUVsRyxRQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDckQsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLGtCQUFrQixDQUFDLENBQUM7O0FBRXBKLFFBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUNwRCxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsQ0FBQzs7O0FBR2xHLFFBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUMxQyxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7OztBQUcvQyxRQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQzVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7OztBQUcvRCxRQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7OztBQUc5RCxRQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQzVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRWhFLFFBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFckIsUUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7O0FBRTdCLFFBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDOztBQUVoQyxXQUFPLElBQUksQ0FBQztDQUNmLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsWUFBVztBQUN6QyxXQUFPLGdCQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztDQUM1QixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFlBQVc7QUFDekMsV0FBTyxnQkFBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Q0FDNUIsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLHFCQUFxQixHQUFHLFlBQVc7O0FBRWpELFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFaEIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUVyQyxRQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O0FBRXJDLFFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLGdCQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FDeEIsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQ3BCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDYixVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDdkQsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUNoQixXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRXJCLFFBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLGdCQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FDekIsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQ3BCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDYixVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDeEQsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUNoQixhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXRCLFFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLGdCQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FDeEIsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQ3BCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDZCxVQUFVLENBQUMsVUFBUyxDQUFDLEVBQUU7QUFDcEIsWUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ2xCLG1CQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBRSxDQUFDLENBQUM7U0FDeEQsTUFBTTtBQUNILG1CQUFPLEVBQUUsQ0FBQztTQUNiO0tBQ0osQ0FBQyxDQUNELGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFdEIsUUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsZ0JBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUNuQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FDcEIsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUN6QyxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFckQsUUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsZ0JBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUNwQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FDaEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUNSLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUUxQixRQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxnQkFBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQ3BDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUNoQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQ1IsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXpCLFFBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLGdCQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FDbEMsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUVoRCxRQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QyxRQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFN0MsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN0RCxRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQ2pELENBQUE7O0FBRUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsR0FBRyxZQUFXOztBQUVwRCxRQUFJLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWhCLFFBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVMsU0FBUyxFQUFFO0FBQ3RELFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsWUFBVztBQUN4QyxnQkFBSSxTQUFTLEtBQUssT0FBTyxJQUFJLENBQUMsZ0JBQUcsS0FBSyxDQUFDLGdCQUFnQixJQUFJLGdCQUFHLE1BQU0sQ0FBQyxnQkFBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQyxFQUFFO0FBQ3ZJLG9CQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDekQ7U0FDSixDQUFDLENBQUM7S0FDTixDQUFDLENBQUM7Q0FFTixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEdBQUcsVUFBUyxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFLGNBQWMsRUFBRTs7QUFFbkgsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixRQUFJLFFBQVEsQ0FBQzs7QUFFYixRQUFJLFdBQVcsR0FBRyxTQUFkLFdBQVcsR0FBYztBQUN6QixZQUFJLENBQUMsUUFBUSxFQUFFO0FBQ1gsb0JBQVEsR0FBRyxnQkFBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUMvQyxnQkFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3RCLHdCQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLHdCQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNCO1NBQ0o7QUFDRCxlQUFPLFFBQVEsQ0FBQztLQUNuQixDQUFDOztBQUVGLFFBQUksSUFBSSxHQUFHLENBQ1AsSUFBSTtBQUNKLHFCQUFpQjtBQUNqQixvQkFBRyxLQUFLO0FBQ1IsYUFBUyxTQUFTLEdBQUc7QUFDakIsWUFBSSxRQUFRLEdBQUcsV0FBVyxFQUFFLENBQUM7QUFDN0IsZUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUM7QUFDRCxhQUFTLE1BQU0sR0FBRztBQUNkLFlBQUksUUFBUSxHQUFHLFdBQVcsRUFBRSxDQUFDO0FBQzdCLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVDO0tBQ0osQ0FBQzs7QUFFRixRQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRTtBQUNsQyxZQUFJLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3pDOztBQUVELFFBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRTtBQUMvQixZQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN0Qzs7QUFFRCxRQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUMsQ0FBQzs7QUFFMUQsUUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQy9CLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsVUFBUyxnQkFBZ0IsRUFBRTs7QUFFekQsUUFBSSxDQUFDLE1BQU0sR0FBRztBQUNWLFdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU87QUFDcEQsYUFBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTztBQUMzQixjQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPO0FBQzVCLFlBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU87S0FDdkQsQ0FBQzs7QUFFRixRQUFJLGVBQWUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNsRSxRQUFJLGdCQUFnQixHQUFHLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDOztBQUVyRixRQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsaUJBQWlCLENBQUMsQ0FDekUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDOztBQUUzQixRQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FDYixJQUFJLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUM7O0FBRXpDLFFBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUN2QixJQUFJLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUM7O0FBRXpDLFFBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUN4QixJQUFJLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUM7O0FBRXpDLFFBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUN2QixJQUFJLENBQUMsV0FBVyxFQUFFLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7O0FBRXRGLFFBQUksZ0JBQWdCLEVBQUU7QUFDbEIsWUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2YsWUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2xCO0NBRUosQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFXOzs7QUFHbkMsUUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzs7O0FBR3JDLFFBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckMsUUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzs7O0FBR3JDLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0NBQzdCLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBVztBQUN2QyxRQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ25ELFFBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDOUMsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxVQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUU7O0FBRXhFLFFBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDdkQsUUFBSSxRQUFRLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7O0FBRXBFLFlBQVEsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVsSCxRQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEMsUUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLFFBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELFFBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFekMsUUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDOztBQUVwRCxRQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQzs7QUFFL0IsUUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsQ0FBQzs7QUFFL0MsV0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbEcsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBRyxZQUFXO0FBQzNDLFdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDOUMsQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxZQUFXOztBQUV6QyxRQUFJLGdCQUFHLEtBQUssQ0FBQyxXQUFXLElBQUksQ0FBQyxnQkFBRyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sSUFBSSxFQUFFLGdCQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsY0FBYyxJQUFJLGdCQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUEsQUFBQyxFQUFFO0FBQ3BKLFlBQUksZ0JBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO0FBQ3ZDLGdCQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO0FBQzFCLG9CQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDbkIsb0JBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN0Qix1QkFBTzthQUNWO1NBQ0osTUFBTTtBQUNILGdCQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDbkIsbUJBQU87U0FDVjtLQUNKOztBQUVELFFBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3hDLFFBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFOUMsWUFBUSxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRWxILFFBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4QyxRQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekMsUUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7O0FBRXhELFFBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRTlELFFBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO0FBQy9CLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRTlDLFFBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUM7Q0FFbEQsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLFlBQVc7O0FBRTVDLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixRQUFJLENBQUMscUJBQXFCLENBQUMsWUFBVztBQUNsQyxZQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3hELENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUM3QixRQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNqQixRQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Q0FDcEIsQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxZQUFXOztBQUUxQyxRQUFJLEtBQUssR0FBRyxnQkFBRyxLQUFLLENBQUMsV0FBVyxDQUFDOztBQUVqQyxRQUFJLEVBQUUsR0FBRyxDQUFDO1FBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFbkIsUUFBSSxPQUFPLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxXQUFXLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFFekQsUUFBSSxPQUFPLEVBQUU7O0FBRVQsWUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDNUQsVUFBRSxHQUFHLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7S0FFakYsTUFBTTs7QUFFSCxZQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxXQUFXLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDOztBQUVwRixZQUFJLE9BQU8sRUFBRTtBQUNULGdCQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN2RyxjQUFFLEdBQUcsT0FBTyxHQUFHLENBQUMsVUFBVSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztTQUNwRztLQUVKOztBQUVELFFBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUV0QyxDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFlBQVc7O0FBRTFDLFFBQUksZ0JBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxjQUFjLElBQUksZ0JBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtBQUNqRixlQUFPO0tBQ1Y7O0FBRUQsUUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBRyxLQUFLLENBQUMsRUFBRSxFQUFFLGdCQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7Q0FDcEYsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxVQUFTLE1BQU0sRUFBRTs7QUFFL0MsUUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLE1BQU0sS0FBSyxTQUFTLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDOztBQUVyRixXQUFPLElBQUksQ0FBQztDQUNmLENBQUM7Ozs7Ozs7OztBQVNGLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLFFBQVEsRUFBRTs7QUFFckUsUUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsQ0FBQzs7QUFFM0IsUUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7QUFFdEQsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWpCLFFBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDOztBQUU3QixRQUFJLGNBQWMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEtBQUssQ0FBQyxFQUFFO0FBQy9DLFlBQUksQ0FDQyxtQkFBbUIsRUFBRSxDQUNyQixPQUFPLENBQUMsUUFBUSxHQUFHLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxDQUNsRCxTQUFTLEVBQUUsQ0FDWCxTQUFTLEVBQUUsQ0FBQztLQUNwQjs7QUFFRCxRQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUM7O0FBRXRDLFdBQU8sSUFBSSxDQUFDO0NBQ2YsQ0FBQzs7Ozs7O0FBTUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsWUFBVzs7QUFFckMsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixXQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVMsQ0FBQyxFQUFFOzs7OztBQUs3QixZQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7O0FBRWIsYUFBSyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUU7QUFDZixnQkFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3ZCLG9CQUFJLEdBQUcsS0FBSyxVQUFVLEVBQUU7QUFDcEIsdUJBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3JCLE1BQU07QUFDSCx1QkFBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDdkQ7YUFDSjtTQUNKOztBQUVELGVBQU8sR0FBRyxDQUFDO0tBQ2QsQ0FBQyxDQUFDO0NBQ04sQ0FBQzs7Ozs7O0FBTUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxZQUFXO0FBQzlDLFdBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBUyxDQUFDLEVBQUU7Ozs7O0FBS3RDLFlBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQzs7QUFFYixhQUFLLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtBQUNmLGdCQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDdkIsbUJBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDckI7U0FDSjs7QUFFRCxlQUFPLEdBQUcsQ0FBQztLQUNkLENBQUMsQ0FBQztDQUNOLENBQUM7Ozs7OztBQU1GLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVMsQ0FBQyxFQUFFOzs7OztBQUt6QyxRQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7O0FBRWIsU0FBSyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUU7QUFDZixZQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDdkIsZUFBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyQjtLQUNKOztBQUVELFdBQU8sR0FBRyxDQUFDO0NBQ2QsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxVQUFTLENBQUMsRUFBRTtBQUMxQyxXQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFTLEdBQUcsRUFBRTtBQUN2QyxlQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ3pDLENBQUMsQ0FBQztDQUNOLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxZQUFXO0FBQzlDLFFBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztDQUMxRCxDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMscUJBQXFCLEdBQUcsWUFBVzs7QUFFakQsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixRQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUU7QUFDMUMsWUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7S0FDN0I7O0FBRUQsUUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOztBQUU5QixRQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDN0IsU0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUU7QUFDakMsbUJBQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLGdCQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUM5Qyx1QkFBTyxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQzthQUNwQztBQUNELGdCQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNwQyxDQUFDLENBQUM7S0FDTixDQUFDLENBQUM7Q0FDTixDQUFDOzs7Ozs7OztBQVFGLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsSUFBSSxFQUFFLElBQUksRUFBRTs7QUFFL0MsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWpCLFFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUNSLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O0FBRXBDLFFBQUksQ0FDQyxPQUFPLEVBQUUsQ0FDVCxtQkFBbUIsRUFBRSxDQUNyQixTQUFTLEVBQUUsQ0FDWCxTQUFTLEVBQUUsQ0FDWCxZQUFZLEVBQUUsQ0FBQzs7QUFFcEIsV0FBTyxJQUFJLENBQUM7Q0FDZixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEdBQUcsVUFBUyxjQUFjLEVBQUU7O0FBRTNELFFBQUksQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLENBQUM7O0FBRWpDLFFBQUksd0JBQXdCLEdBQUcsY0FBYyxLQUFLLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztBQUMzRSxRQUFJLENBQUMsbUJBQW1CLEdBQUcsY0FBYyxDQUFDOztBQUUxQyxRQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7O0FBRXhGLFFBQUksd0JBQXdCLElBQUksSUFBSSxDQUFDLHNCQUFzQixLQUFLLENBQUMsRUFBRTtBQUMvRCxZQUFJLENBQ0MsT0FBTyxFQUFFLENBQ1QsbUJBQW1CLEVBQUUsQ0FDckIsU0FBUyxFQUFFLENBQ1gsU0FBUyxFQUFFLENBQ1gsWUFBWSxFQUFFLENBQUE7S0FDdEI7O0FBRUQsV0FBTyxJQUFJLENBQUM7Q0FDZixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEdBQUcsVUFBUyxlQUFlLEVBQUU7O0FBRTdELFFBQUksQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLENBQUM7O0FBRWpDLFFBQUkseUJBQXlCLEdBQUcsZUFBZSxLQUFLLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztBQUM5RSxRQUFJLENBQUMsb0JBQW9CLEdBQUcsZUFBZSxDQUFDOztBQUU1QyxRQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQzs7QUFFdkYsUUFBSSx5QkFBeUIsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEtBQUssQ0FBQyxFQUFFO0FBQ2hFLFlBQUksQ0FDQyxPQUFPLEVBQUUsQ0FDVCxTQUFTLEVBQUUsQ0FDWCxTQUFTLEVBQUUsQ0FDWCxZQUFZLEVBQUUsQ0FBQTtLQUN0Qjs7QUFFRCxXQUFPLElBQUksQ0FBQztDQUNmLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxrQkFBa0IsRUFBRTs7QUFFckQsUUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTNGLFFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUNSLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQzlCLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7O0FBRXZDLFFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUNSLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTNDLFFBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUNmLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUNoQixTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FDMUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7O0FBRXhDLFFBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RILFFBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JILFFBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNwSCxRQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV2RSxRQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDOztBQUUzRixXQUFPLElBQUksQ0FBQztDQUNmLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsR0FBRyxVQUFTLENBQUMsRUFBRTs7QUFFbEQsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixRQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV6QyxRQUFJLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQy9DLDZCQUFxQixDQUFDLFlBQVc7QUFDN0IsZ0JBQUksQ0FBQyxDQUFDO0FBQ04sbUJBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztTQUMzRCxDQUFDLENBQUM7S0FDTjs7QUFFRCxXQUFPLENBQUMsQ0FBQztDQUNaLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsR0FBRyxVQUFTLENBQUMsRUFBRTs7QUFFakQsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFM0csUUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDZCxZQUFJLENBQUMsMkJBQTJCLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNyRDtDQUNKLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsVUFBUyxrQkFBa0IsRUFBRSxTQUFTLEVBQUU7O0FBRWxFLFFBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUN0QixlQUFPLElBQUksQ0FBQztLQUNmOztBQUVELFFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUNSLGFBQWEsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFM0QsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixRQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDZixZQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzVDOztBQUVELFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVc7O0FBRWxELFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FDbkIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUNqQixLQUFLLENBQUM7QUFDSCwwQkFBYyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztTQUMzRCxDQUFDLENBQUM7O0FBRVAsWUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLGtCQUFrQixDQUFDLENBQ3BFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUNwQixTQUFTLENBQUMsTUFBTSxDQUFDLENBQ2pCLElBQUksQ0FBQztBQUNGLGFBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUM7U0FDMUIsQ0FBQyxDQUNELEtBQUssQ0FBQztBQUNILG1CQUFPLEVBQUUsaUJBQVMsQ0FBQyxFQUFFO0FBQ2pCLHVCQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFDO2FBQzFDO1NBQ0osQ0FBQyxDQUFDO0tBQ1YsQ0FBQyxDQUFDOztBQUVILFdBQU8sSUFBSSxDQUFDO0NBQ2YsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxTQUFTLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLEVBQUU7O0FBRTVFLFFBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUN0QixlQUFPLElBQUksQ0FBQztLQUNmOztBQUVELFFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUNSLGFBQWEsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFNUQsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRXJDLFFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUNSLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVoRixRQUFJLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWhCLFFBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNmLFlBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDNUM7O0FBRUQsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBVzs7QUFFbEQsWUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDekYsaUJBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFOUIsaUJBQVMsQ0FDSixTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFN0QsaUJBQVMsQ0FDSixTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUU7QUFDOUMsbUJBQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUM7U0FDMUIsQ0FBQyxDQUFDO0tBRVYsQ0FBQyxDQUFDOztBQUVILFdBQU8sSUFBSSxDQUFDO0NBQ2YsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLG9CQUFvQixHQUFHLFVBQVMsQ0FBQyxFQUFFO0FBQ2pELFdBQU8sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQztDQUNyRyxDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVMsQ0FBQyxFQUFFO0FBQ3pDLFdBQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0NBQ25CLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBUyxDQUFDLEVBQUU7QUFDdkMsV0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7Q0FDakIsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFTLGtCQUFrQixFQUFFOztBQUUxRCxRQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7QUFDdEIsZUFBTyxJQUFJLENBQUM7S0FDZjs7QUFFRCxRQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7QUFFN0IsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixRQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDbEIsWUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtLQUM5Qzs7QUFFRCxRQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7O0FBRXZELFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVc7O0FBRXJELFlBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3JDLFlBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QixZQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFN0MsWUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDckMsWUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFlBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUU3QyxZQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQztBQUNuRCxZQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztBQUNyQyxZQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQzs7QUFHckMsWUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7QUFDM0IsWUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDOztBQUV6QixZQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsMkJBQTJCLElBQUksa0JBQWtCLEdBQUcsQ0FBQyxFQUFFO0FBQ3BFLGdCQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtBQUM1QixvQkFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxVQUFTLENBQUMsRUFBRTtBQUMzQyx3QkFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUMzQix5Q0FBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDckY7aUJBQ0osQ0FBQyxDQUFDO2FBQ047QUFDRCxnQkFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3BCLG9CQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFTLENBQUMsRUFBRTtBQUNuQyx3QkFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDekIsdUNBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2pGO2lCQUNKLENBQUMsQ0FBQzthQUNOO1NBQ0o7O0FBRUQsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsVUFBUyxDQUFDLEVBQUU7QUFDN0MsbUJBQU8sQ0FBQyxDQUFDLGlCQUFpQixJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUssQ0FBQyxDQUFDLFFBQVEsSUFBSSxZQUFZLEdBQUcsZUFBZSxJQUFJLENBQUMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxHQUFHLGVBQWUsR0FBRyxDQUFDLENBQUMsS0FDbkksQ0FBQyxRQUFRLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQSxBQUFDLENBQUEsQUFBQyxDQUFDO1NBQ25HLENBQUMsQ0FBQzs7QUFHSCxZQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxDQUN4RixJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVMsQ0FBQyxFQUFFO0FBQ3BCLG1CQUFPLENBQUMsQ0FBQyxHQUFHLENBQUM7U0FDaEIsQ0FBQyxDQUFDOztBQUVQLFlBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFdkIsWUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixJQUFJLGtCQUFrQixHQUFHLENBQUMsRUFBRTtBQUMvRCxtQkFBTyxDQUNGLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUV2QyxtQkFBTyxDQUFDLElBQUksQ0FBQyxVQUFTLENBQUMsRUFBRTs7QUFFckIsb0JBQUksQ0FBQyxHQUFHLGdCQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFeEIsb0JBQUksYUFBYSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFcEUsb0JBQUksYUFBYSxFQUFFO0FBQ2Ysd0JBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FDeEMsSUFBSSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FDaEMsTUFBTSxFQUFFLENBQUM7aUJBQ2pCLE1BQU07QUFDSCxxQkFBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUNkO2FBRUosQ0FBQyxDQUFDO1NBQ04sTUFBTTtBQUNILG1CQUFPLENBQ0YsTUFBTSxFQUFFLENBQUM7U0FDakI7O0FBRUQsU0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDaEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsQ0FDckQsSUFBSSxDQUFDLFlBQVc7QUFDYiw0QkFBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDdEQsQ0FBQyxDQUFDOztBQUVQLFNBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUU7O0FBRWYsZ0JBQUksQ0FBQyxHQUFHLGdCQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFeEIsZ0JBQUksQ0FBQyxDQUFDLGlCQUFpQixFQUFFOztBQUVyQixvQkFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLENBQUM7O0FBRTdDLHVCQUFPO2FBQ1Y7O0FBRUQsZ0JBQUksb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLENBQUM7O0FBRXhELGdCQUFJLFlBQVksR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVuRyxnQkFBSSxrQkFBa0IsR0FBRyxDQUFDLEVBQUU7QUFDeEIsb0JBQUksZUFBZSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksWUFBWSxDQUFDO0FBQzFGLG9CQUFJLHVCQUF1QixDQUFDO0FBQzVCLG9CQUFJLENBQUMsb0JBQW9CLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRTtBQUNuRSx3QkFBSSxlQUFlLEVBQUU7QUFDakIsK0NBQXVCLEdBQUcsZUFBZSxDQUFDO0FBQzFDLHlCQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxlQUFlLENBQUMsQ0FBQztxQkFDeEM7aUJBQ0o7O0FBRUQsb0JBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FDeEMsU0FBUyxDQUFDLFdBQVcsRUFBRSxZQUFXO0FBQy9CLHdCQUFJLGVBQWUsR0FBRyx1QkFBdUIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3JFLHdCQUFJLGlCQUFpQixFQUFFO0FBQ25CLCtCQUFPLGdCQUFHLG9CQUFvQixDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztxQkFDakUsTUFBTTtBQUNILDRCQUFJLGNBQWMsR0FBRyxnQkFBRyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDbkQsNEJBQUksWUFBWSxHQUFHLGdCQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM5QyxzQ0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hELCtCQUFPLGdCQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztxQkFDdEY7aUJBQ0osQ0FBQyxDQUFDO2FBQ1YsTUFDSTtBQUNELGlCQUFDLENBQ0ksSUFBSSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUN4Qzs7QUFFRCxnQkFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLENBQUM7U0FFaEQsQ0FBQyxDQUFDOztBQUVILFlBQUksQ0FBQyw2QkFBNkIsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNoRCxZQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBRXhELENBQUMsQ0FBQzs7QUFFSCxXQUFPLElBQUksQ0FBQztDQUNmLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBUyxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRTs7QUFFeEUsUUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxJQUFJLFNBQVMsRUFBRTtBQUN6QyxZQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDdkIsTUFBTTtBQUNILFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDaEY7O0FBRUQsUUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFdkMsUUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNaLFlBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNCLFlBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDMUM7Q0FDSixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEdBQUcsVUFBUyxTQUFTLEVBQUUsaUJBQWlCLEVBQUU7O0FBRXpFLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFaEIsUUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDLFFBQUksRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFN0MsUUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbkYsUUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7O0FBR25GLFFBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUNwRDs7QUFFRCxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVc7O0FBRTFELFlBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztBQUM5QixxQkFBUyxFQUFFLFlBQVksR0FBRyxJQUFJLENBQUMsNkJBQTZCLEdBQUcsR0FBRztTQUNyRSxDQUFDLENBQUM7O0FBRUgsWUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssSUFBSSxDQUFDLElBQUksRUFBRTtBQUN0QyxnQkFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQ3ZCLFNBQVMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDLENBQ3ZELElBQUksQ0FBQyxVQUFTLENBQUMsRUFBRTtBQUNkLG9CQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzlDLENBQUMsQ0FBQztTQUNWO0tBRUosQ0FBQyxDQUFDO0NBRU4sQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLG1CQUFtQixHQUFHLFlBQVc7O0FBRS9DLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXZELFdBQU8sSUFBSSxDQUFDO0NBQ2YsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLGtCQUFrQixFQUFFOztBQUV0RCxRQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQy9CLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QyxRQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLGVBQWUsQ0FBQyxDQUFDOztBQUVwRyxRQUFJLGtCQUFrQixFQUFFO0FBQ3BCLGlCQUFTLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ2hFLFlBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDdEQsb0JBQVksR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7S0FDekU7O0FBRUQsUUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7OztBQUdyQyxRQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQzs7O0FBR3ZDLFFBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDOzs7QUFHbEcsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUM7OztBQUcvRSxRQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7QUFFdkUsUUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7QUFHekYsUUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7O0FBR3JELGFBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7OztBQUd2RixRQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN2SCxnQkFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwRCxhQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqSCxRQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUU1QyxRQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7QUFFN0IsUUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzs7QUFFM0YsV0FBTyxJQUFJLENBQUM7Q0FDZixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMscUJBQXFCLEdBQUcsWUFBVztBQUNqRCxRQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUM3RixLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQzdCLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBUyxTQUFTLEVBQUU7QUFBRSxXQUFPLFNBQVMsQ0FBQztDQUFFLENBQUM7O0FBRTNFLE9BQU8sQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFVBQVMsU0FBUyxFQUFFO0FBQUUsV0FBTyxTQUFTLENBQUM7Q0FBRSxDQUFDOztBQUU1RSxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFTLFNBQVMsRUFBRTtBQUFFLFdBQU8sU0FBUyxDQUFDO0NBQUUsQ0FBQzs7QUFFMUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxVQUFTLFNBQVMsRUFBRSxrQkFBa0IsRUFBRTtBQUMxRSxRQUFJLGtCQUFrQixHQUFHLENBQUMsRUFBRTtBQUN4QixlQUFPLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQ2xHLE1BQU07QUFDSCxlQUFPLFNBQVMsQ0FBQztLQUNwQjtDQUNKLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDdkMsV0FBTyxVQUFTLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQUUsQ0FBQztDQUMxQyxDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsQ0FBQyxFQUFFO0FBQ3JDLFFBQUksQ0FBQyxHQUFHLENBQUMsR0FBQyxDQUFDLENBQUM7QUFDWixXQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0NBQ3ZDLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBUyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUNqRCxRQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDYixXQUFPLEtBQUssR0FBRyxHQUFHLEVBQUU7QUFDaEIsV0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoQixhQUFLLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQztLQUN2QjtBQUNELFdBQU8sR0FBRyxDQUFDO0NBQ2QsQ0FBQzs7Ozs7OztBQU9GLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVMsSUFBSSxFQUFFLFNBQVMsRUFBRTtBQUNoRCxRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztBQUMvQixRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDbkIsUUFBSSxLQUFLLENBQUM7O0FBRVYsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM3QixhQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hCLFlBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRTtBQUN6QyxtQkFBTyxLQUFLLENBQUM7U0FDaEI7S0FDSjs7QUFFRCxXQUFPLFNBQVMsQ0FBQztDQUNwQixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsMEJBQTBCLEdBQUcsVUFBUyxTQUFTLEVBQUUsS0FBSyxFQUFFOztBQUV0RSxTQUFLLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUV4QixRQUFJLEVBQUUsS0FBSyxZQUFZLEtBQUssQ0FBQSxBQUFDLEVBQUU7QUFDM0IsYUFBSyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzFCOztBQUVELFFBQUksRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QixRQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsUUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFbEIsUUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBQ1YsVUFBRSxHQUFHLENBQUMsQ0FBQztLQUNWLE1BQU07QUFDSCxVQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRSxHQUFDLENBQUMsQ0FBQSxBQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDbkU7O0FBRUQsUUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBQ1YsVUFBRSxHQUFHLENBQUMsQ0FBQztLQUNWLE1BQU07QUFDSCxVQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksRUFBRSxHQUFDLENBQUMsQ0FBQSxBQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDcEU7O0FBRUQsV0FBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUVuQixDQUFDOztxQkFFYSxPQUFPOzs7O0FDaHFDdEIsWUFBWSxDQUFDOzs7O3NCQUVNLFFBQVE7Ozs7d0JBQ04sVUFBVTs7Ozs0QkFDTixlQUFlOzs7O2tCQUN6QixJQUFJOzs7O3VCQUNDLFdBQVc7Ozs7QUFFL0IsU0FBUyxhQUFhLENBQUMsT0FBTyxFQUFFOztBQUU1Qiw4QkFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXhCLFFBQUksQ0FBQyxPQUFPLEdBQUcseUJBQU8sSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDOzs7OztBQUt4RCxRQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQzs7QUFFbEIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDdEIsUUFBSSxDQUFDLFFBQVEsR0FBRztBQUNaLFlBQUksRUFBRSxJQUFJO0FBQ1YsYUFBSyxFQUFFLElBQUk7S0FDZCxDQUFDOzs7Ozs7QUFNRixRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUFNL0IsUUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQzs7QUFFakMsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7O0FBRXBCLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7Q0FDaEM7O0FBRUQsMkJBQVMsYUFBYSw0QkFBZSxDQUFDOztBQUV0QyxhQUFhLENBQUMsU0FBUyxDQUFDLGlCQUFpQixHQUFHLFlBQVksQ0FBQztBQUN6RCxhQUFhLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUM7O0FBRXJELGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHO0FBQy9CLGFBQVMsRUFBRSxtQkFBUyxDQUFDLEVBQUU7QUFBRSxlQUFPLENBQUMsQ0FBQztLQUFFO0FBQ3BDLGlCQUFhLEVBQUUsRUFBRTtBQUNqQixlQUFXLEVBQUUsRUFBRTtBQUNmLGlCQUFhLEVBQUUsS0FBSztBQUNwQixnQkFBWSxFQUFFLGFBQWE7QUFDM0IsZUFBVyxFQUFFLEVBQUU7QUFDZixVQUFNLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxlQUFlO0NBQ2xELENBQUM7Ozs7OztBQU1GLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsS0FBSyxFQUFFOztBQUUvQyxRQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOztBQUUvQixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLGdDQUFtQixHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7O0FBRTlELFFBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNaLFlBQUksYUFBYSxLQUFLLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDOUIsZ0JBQUksYUFBYSxFQUFFO0FBQ2Ysb0JBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDbkM7QUFDRCxnQkFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ3BCO0tBQ0osTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxhQUFhLEVBQUU7QUFDckMsWUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNuQztDQUVKLENBQUM7O0FBRUYsYUFBYSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsVUFBUyxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQzdELFdBQU8sQ0FBQyxLQUFLLEtBQUssQ0FBQyxLQUFLLENBQUM7Q0FDNUIsQ0FBQzs7QUFFRixhQUFhLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLEtBQUssRUFBRSxNQUFNLEVBQUU7O0FBRXZELFFBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDOztBQUVoRCxRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzs7QUFFbkIsUUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7O0FBRXZGLFlBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOztBQUVuQyxZQUFJLENBQUMsU0FBUyxDQUNULEtBQUssQ0FBQztBQUNILGlCQUFLLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQzs7QUFFUCxZQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1QsZ0JBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNmO0tBQ0o7Q0FFSixDQUFDOztBQUVGLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQzlDLFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztDQUNyQixDQUFDOztBQUVGLGFBQWEsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFlBQVc7O0FBRTNDLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFaEIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDaEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUNYLEtBQUssQ0FBQztBQUNILGFBQUssRUFBRSxJQUFJLENBQUMsS0FBSztLQUNwQixDQUFDLENBQ0QsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFBLEFBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTVNLFFBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDZCxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUNsRCxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRXJDLFFBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQy9CLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDZCxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxDQUFDOztBQUV6RCxRQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs7O0FBR3hCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQyxRQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOzs7QUFHbEYsUUFBSSxDQUFDLG9CQUFvQixHQUFHLFVBQVMsS0FBSyxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsRUFBRTtBQUN2RSxZQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDaEMsWUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0tBQ2pDLENBQUM7QUFDRixRQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsU0FBUyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUV0RixRQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDOztBQUUxQixRQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FFZixDQUFDOztBQUVGLGFBQWEsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxrQkFBa0IsRUFBRTs7QUFFcEUsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0FBRWpDLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0FBQzlCLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDOztBQUVoQyxRQUFJLGtCQUFrQixHQUFHLENBQUMsRUFBRTtBQUN4QixZQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3RELGFBQUssR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7S0FDM0Q7O0FBRUQsWUFBTyxNQUFNO0FBQ1QsYUFBSyxJQUFJLENBQUMsZUFBZTtBQUNyQixnQkFBSSxDQUNDLElBQUksQ0FBQztBQUNGLGtCQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWE7QUFDL0Isa0JBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNO2FBQ25DLENBQUMsQ0FBQztBQUNQLGlCQUFLLENBQ0EsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdEUsa0JBQU07QUFBQSxBQUNWLGFBQUssSUFBSSxDQUFDLGlCQUFpQjtBQUN2QixnQkFBSSxDQUNDLElBQUksQ0FBQztBQUNGLGtCQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWE7QUFDL0Isa0JBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLO2FBQ2xDLENBQUMsQ0FBQztBQUNQLGlCQUFLLENBQ0EsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQ2hFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbkIsa0JBQU07QUFBQSxLQUNiO0NBRUosQ0FBQzs7QUFFRixhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFTLGFBQWEsRUFBRTs7QUFFMUQsaUJBQWEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3BHLGlCQUFhLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFNBQVMsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFeEcsUUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7QUFFeEIsUUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2QscUJBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDakQsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7S0FDdkI7O0FBRUQsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDdEIsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQzs7QUFFL0IsUUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsQ0FBQztDQUM5QyxDQUFDOztBQUVGLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBQVMsa0JBQWtCLEVBQUU7O0FBRXhELFFBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNkLFlBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2pEOztBQUVELFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBRTdFLENBQUM7O0FBRUYsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsWUFBVzs7QUFFMUMsUUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDYixlQUFPO0tBQ1Y7O0FBRUQsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDOztBQUVqQyxRQUFJLENBQUMsU0FBUyxDQUNULElBQUksQ0FBQyxVQUFTLENBQUMsRUFBRTs7QUFFZCxZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU3QixZQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7QUFDaEIsZ0JBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNaLG1CQUFPO1NBQ1Y7O0FBRUQsWUFBSSxLQUFLO1lBQUUsUUFBUSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUFFLGFBQWEsQ0FBQzs7QUFFNUMsZ0JBQU8sTUFBTTtBQUNULGlCQUFLLElBQUksQ0FBQyxlQUFlO0FBQ3JCLHFCQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzVCLDZCQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLHNCQUFNO0FBQUEsQUFDVixpQkFBSyxJQUFJLENBQUMsaUJBQWlCO0FBQ3ZCLHFCQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzVCLDZCQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQUEsU0FDekI7O0FBRUQsZ0JBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXZDLFlBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMxQixZQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFMUcsWUFBSSxDQUFDLEdBQUcsZ0JBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV4QixZQUFJLFNBQVMsRUFBRTs7QUFFWCxnQkFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztBQUVaLGFBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFlBQVksSUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQSxBQUFDLEdBQUMsR0FBRyxJQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBLEFBQUMsR0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFakksYUFBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLENBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBRTVDLE1BQU07QUFDSCxnQkFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2Y7S0FFSixDQUFDLENBQUM7Q0FFVixDQUFDOztBQUVGLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFlBQVc7QUFDdEMsUUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQ3ZDLENBQUM7O0FBRUYsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN0QyxRQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDM0MsQ0FBQzs7QUFFRixhQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFTLGtCQUFrQixFQUFFOztBQUUxRCxRQUFJLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztDQUU3QyxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDOzs7QUMzUi9CLFlBQVksQ0FBQzs7Ozs2QkFFYSxpQkFBaUI7Ozs7d0JBQ3RCLFVBQVU7Ozs7c0JBQ1osUUFBUTs7Ozs7Ozs7OztBQU8zQixTQUFTLG1CQUFtQixDQUFDLE9BQU8sRUFBRTtBQUNsQywrQkFBYyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUVsQyxRQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLFFBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUM7QUFDcEMsUUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQzs7QUFFckMsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7O0FBRXBCLFFBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMxRCxRQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFOUQsUUFBSSxDQUFDLHlCQUF5QixHQUFHLEtBQUssQ0FBQztDQUMxQzs7QUFFRCwyQkFBUyxtQkFBbUIsNkJBQWdCLENBQUM7O0FBRTdDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcseUJBQU8sSUFBSSxFQUFFLEVBQUUsRUFBRSwyQkFBYyxTQUFTLENBQUMsUUFBUSxFQUFFO0FBQ3hGLGVBQVcsRUFBRSxnQkFBZ0I7QUFDN0IsdUJBQW1CLEVBQUUsSUFBSTtDQUM1QixDQUFDLENBQUM7O0FBRUgsbUJBQW1CLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLFlBQVc7O0FBRXhELFFBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pFLFFBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvRCxRQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFakUsUUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLGFBQWEsRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUM5RixRQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsWUFBWSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQzVGLFFBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxhQUFhLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7O0FBRTlGLFFBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRTtBQUNsQyxZQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDO0FBQ3RDLFlBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxZQUFZLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7S0FDL0YsTUFBTTtBQUNILFlBQUksQ0FBQyx5QkFBeUIsR0FBRyxLQUFLLENBQUM7S0FDMUM7Q0FDSixDQUFDOztBQUVGLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxVQUFTLGFBQWEsRUFBRTs7QUFFdkUsaUJBQWEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsYUFBYSxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2hILGlCQUFhLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFlBQVksRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUM5RyxpQkFBYSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxhQUFhLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7O0FBRWhILFFBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFO0FBQ2hDLHFCQUFhLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFlBQVksRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztLQUNqSDtDQUVKLENBQUM7O0FBRUYsbUJBQW1CLENBQUMsU0FBUyxDQUFDLHNCQUFzQixHQUFHLFVBQVMsS0FBSyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUN4RyxZQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTtBQUN2QixhQUFLLFVBQVU7QUFDWCxtQkFBTyxPQUFPLEVBQUUsQ0FBQztBQUFBLEFBQ3JCLGFBQUssWUFBWTtBQUNiLG1CQUFPLE1BQU0sRUFBRSxDQUFDO0FBQUEsS0FDdkI7Q0FDSixDQUFDOztBQUVGLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxVQUFTLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7O0FBRWxHLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFaEIsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7O0FBRTlELFNBQUssQ0FBQyxxQkFBcUIsQ0FBQyxZQUFXO0FBQ25DLFlBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNaLFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkIsQ0FBQyxDQUFDO0NBRU4sQ0FBQzs7QUFFRixtQkFBbUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLFVBQVMsS0FBSyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRTs7QUFFakcsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDOztBQUU5RCxRQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDZCxhQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzVDOztBQUVELFFBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFlBQVc7QUFDbEQsWUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN2QixDQUFDLENBQUM7Q0FFTixDQUFDOztBQUVGLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxVQUFTLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7O0FBRWxHLFFBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNkLGFBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDNUM7O0FBRUQsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFNBQUssQ0FBQyxxQkFBcUIsQ0FBQyxZQUFXO0FBQ25DLFlBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNmLENBQUMsQ0FBQztDQUVOLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQzs7O0FDakhyQyxZQUFZLENBQUM7Ozs7NkJBRWEsaUJBQWlCOzs7O3dCQUN0QixVQUFVOzs7O3NCQUNaLFFBQVE7Ozs7Ozs7Ozs7QUFPM0IsU0FBUyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUU7QUFDbEMsK0JBQWMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFbEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7Q0FDeEI7O0FBRUQsMkJBQVMsbUJBQW1CLDZCQUFnQixDQUFDOztBQUU3QyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLHlCQUFPLElBQUksRUFBRSxFQUFFLEVBQUUsMkJBQWMsU0FBUyxDQUFDLFFBQVEsRUFBRTtBQUN4RixlQUFXLEVBQUUsZ0JBQWdCO0NBQ2hDLENBQUMsQ0FBQzs7QUFFSCxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFlBQVc7O0FBRXBELFdBQU8sQ0FBQyxDQUFDO0NBRVgsQ0FBQzs7QUFFRixtQkFBbUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFlBQVc7O0FBRTdDLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFaEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7O0FBRXBCLE1BQUUsQ0FBQyxLQUFLLENBQUMsWUFBVzs7QUFFaEIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzs7QUFFbEMsZUFBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7S0FFeEIsQ0FBQyxDQUFDO0NBQ04sQ0FBQzs7QUFFRixtQkFBbUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFlBQVc7O0FBRTVDLFFBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0NBRXhCLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQzs7Ozs7QUNoRHJDLFlBQVksQ0FBQzs7Ozs7Ozs7c0JBRU0sUUFBUTs7Ozt3QkFDTixVQUFVOzs7OzRCQUNOLGdCQUFnQjs7OztrQkFDMUIsSUFBSTs7Ozs7Ozs7OztBQU9uQixTQUFTLFVBQVUsQ0FBQyxPQUFPLEVBQUU7O0FBRXpCLDhCQUFhLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRWpDLFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDO0NBQy9EOztBQUVELDJCQUFTLFVBQVUsNEJBQWUsQ0FBQzs7QUFFbkMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcseUJBQU8sSUFBSSxFQUFFLEVBQUUsRUFBRSwwQkFBYSxTQUFTLENBQUMsUUFBUSxFQUFFO0FBQzlFLGdCQUFZLEVBQUUsVUFBVTtBQUN4QixvQkFBZ0IsRUFBRSxFQUFFO0FBQ3BCLHVCQUFtQixFQUFFLDZCQUFTLENBQUMsRUFBRTtBQUM3QixlQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLGdCQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEU7QUFDRCxvQkFBZ0IsRUFBRSwwQkFBUyxDQUFDLEVBQUU7QUFDMUIsZUFBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEdBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDckM7QUFDRCxzQkFBa0IsRUFBRSxFQUFFO0FBQ3RCLHVCQUFtQixFQUFFLEdBQUc7QUFDeEIsMEJBQXNCLEVBQUUsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUU7Q0FDakcsQ0FBQyxDQUFDOztBQUVILFVBQVUsQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFlBQVc7QUFDNUMsV0FBTyxnQkFBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDMUIsQ0FBQzs7QUFFRixVQUFVLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxZQUFXO0FBQzVDLFdBQU8sZ0JBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQzVCLENBQUM7O0FBRUYsVUFBVSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBUyxDQUFDLEVBQUU7QUFDNUMsV0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDO0NBQ2xCLENBQUM7O0FBRUYsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBUyxDQUFDLEVBQUU7QUFDMUMsV0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDO0NBQ2hCLENBQUM7O0FBRUYsVUFBVSxDQUFDLFNBQVMsQ0FBQyxtQ0FBbUMsR0FBRyxVQUFTLFlBQVksRUFBRTtBQUM5RSxXQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM3RSxDQUFDOztBQUVGLFVBQVUsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEdBQUcsWUFBVzs7QUFFbEQsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixRQUFJLG1CQUFtQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7QUFDM0QsUUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDO0FBQ3pELFFBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0FBQ25ELFFBQUksc0JBQXNCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQztBQUNqRSxRQUFJLHdCQUF3QixHQUFHLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ25GLFFBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLG1CQUFtQixDQUFDLENBQUM7O0FBRXZGLGFBQVMscUJBQXFCLENBQUMsS0FBSyxFQUFFO0FBQ2xDLGdDQUF3QixJQUFJLEtBQUssQ0FBQztBQUNsQywyQkFBbUIsR0FBRyxzQkFBc0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ3ZFLDBCQUFrQixHQUFHLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0tBQ3RGOztBQUVELFFBQUksc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUNuQyxZQUFJLGtCQUFrQixHQUFHLGtCQUFrQixFQUFFO0FBQ3pDLG1CQUFNLGtCQUFrQixHQUFHLGtCQUFrQixJQUFJLHdCQUF3QixHQUFHLHNCQUFzQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDM0cscUNBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDNUI7U0FDSixNQUFNLElBQUksa0JBQWtCLEdBQUcsa0JBQWtCLEVBQUU7QUFDaEQsbUJBQU0sa0JBQWtCLEdBQUcsa0JBQWtCLElBQUksd0JBQXdCLEdBQUcsQ0FBQyxFQUFFO0FBQzNFLHFDQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDN0I7QUFDRCxpQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM1QjtLQUNKOztBQUVELFFBQUksbUJBQW1CLEdBQUcsbUJBQW1CLEVBQUU7QUFDM0MsMkJBQW1CLEdBQUcsbUJBQW1CLENBQUM7QUFDMUMsMEJBQWtCLEdBQUcsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLG1CQUFtQixDQUFDLENBQUE7S0FDckY7O0FBRUQsUUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUMzRCxRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7QUFFbEQsUUFBSSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxFQUFFO0FBQ2xDLFlBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxnQkFBRyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUUsQ0FBQztBQUN0RSxZQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsZ0JBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFFLENBQUM7S0FDMUUsTUFDSSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxHQUFHLEVBQUU7QUFDckMsWUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGdCQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBRSxDQUFDO0FBQ3RFLFlBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxnQkFBRyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxHQUFHLENBQUUsQ0FBQztLQUMxRSxNQUNJLElBQUksSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsRUFBRTtBQUNyQyxZQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZ0JBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsR0FBRyxDQUFFLENBQUM7QUFDdEUsWUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGdCQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBRSxDQUFDO0tBQzFFOztBQUVELFdBQU8sSUFBSSxDQUFDO0NBQ2YsQ0FBQzs7QUFFRixVQUFVLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFTLE9BQU8sRUFBRSxPQUFPLEVBQUU7QUFDM0QsV0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztDQUMzQyxDQUFDOztxQkFFYSxVQUFVOzs7O0FDbkh6QixZQUFZLENBQUM7Ozs7bUNBRW1CLHVCQUF1Qjs7Ozt3QkFDbEMsVUFBVTs7OztzQkFDWixRQUFROzs7Ozs7Ozs7O0FBTzNCLFNBQVMscUJBQXFCLENBQUMsT0FBTyxFQUFFO0FBQ3BDLHFDQUFvQixJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQzNDOztBQUVELDJCQUFTLHFCQUFxQixtQ0FBc0IsQ0FBQzs7QUFFckQscUJBQXFCLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyx5QkFBTyxJQUFJLEVBQUUsRUFBRSxFQUFFLGlDQUFvQixTQUFTLENBQUMsUUFBUSxFQUFFO0FBQ2hHLGdCQUFZLEVBQUUsZ0JBQWdCO0FBQzlCLGVBQVcsRUFBRSxlQUFlO0FBQzVCLFVBQU0sRUFBRSxVQUFVO0NBQ3JCLENBQUMsQ0FBQzs7QUFFSCxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFlBQVc7QUFDcEQsV0FBTyxJQUFJLElBQUksRUFBRSxDQUFDO0NBQ3JCLENBQUM7O0FBRUYscUJBQXFCLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUU7QUFDM0QsV0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztDQUNwQyxDQUFDOztBQUVGLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDckQsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzlCLENBQUM7O0FBRUYscUJBQXFCLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFTLFFBQVEsRUFBRTtBQUM3RCxXQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDbEMsQ0FBQzs7QUFFRixxQkFBcUIsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFlBQVc7QUFDckQsV0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Q0FDNUIsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLHFCQUFxQixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMuRDNUYWJsZSA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGUuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzQmxvY2tUYWJsZSA9IHJlcXVpcmUoJy4vc3JjL0QzQmxvY2tUYWJsZS5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUaW1lbGluZSA9IHJlcXVpcmUoJy4vc3JjL0QzVGltZWxpbmUuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGFibGVNYXJrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlTWFya2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlTW91c2VUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZU1vdXNlVHJhY2tlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZVZhbHVlVHJhY2tlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGltZWxpbmVUaW1lVHJhY2tlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcycpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgey8qKi99XG5cblx0cmV0dXJuIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmUsXG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzBdLFxuXHRcdGkgPSAxLFxuXHRcdGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0ZGVlcCA9IGZhbHNlO1xuXG5cdC8vIEhhbmRsZSBhIGRlZXAgY29weSBzaXR1YXRpb25cblx0aWYgKHR5cGVvZiB0YXJnZXQgPT09ICdib29sZWFuJykge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuXHRcdC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcblx0XHRpID0gMjtcblx0fSBlbHNlIGlmICgodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJykgfHwgdGFyZ2V0ID09IG51bGwpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAob3B0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbbmFtZV07XG5cdFx0XHRcdGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKHRhcmdldCAhPT0gY29weSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRcdGlmIChkZWVwICYmIGNvcHkgJiYgKGlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gaXNBcnJheShjb3B5KSkpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29weUlzQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvcHkgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZSBmcm9tICcuL0QzVGFibGUnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxuLyoqXG4gKlxuICogQGV4dGVuZHMge0QzVGFibGV9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNCbG9ja1RhYmxlKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlLmNhbGwodGhpcywgb3B0aW9ucyk7XG59XG5cbmluaGVyaXRzKEQzQmxvY2tUYWJsZSwgRDNUYWJsZSk7XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGUucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgY2xpcEVsZW1lbnQ6IHRydWUsXG4gICAgY2xpcEVsZW1lbnRGaWx0ZXI6IG51bGwsXG4gICAgcmVuZGVyT25BdXRvbWF0aWNTY3JvbGxJZGxlOiB0cnVlLFxuICAgIGhpZGVUaWNrc09uQXV0b21hdGljU2Nyb2xsOiBmYWxzZSxcbiAgICBhdXRvbWF0aWNTY3JvbGxTcGVlZE11bHRpcGxpZXI6IDJlLTQsXG4gICAgYXV0b21hdGljU2Nyb2xsTWFyZ2luRGVsdGE6IDMwLFxuICAgIGFwcGVuZFRleHQ6IHRydWUsXG4gICAgYWxpZ25MZWZ0OiB0cnVlLFxuICAgIGFsaWduT25UcmFuc2xhdGU6IHRydWUsXG4gICAgbWF4aW11bUNsaWNrRHJhZ1RpbWU6IDEwMCxcbiAgICBtYXhpbXVtQ2xpY2tEcmFnRGlzdGFuY2U6IDEyLFxuICAgIG1pbmltdW1EcmFnRGlzdGFuY2U6IDVcbn0pO1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFBhdGhJZCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENsaXBQYXRoXycgKyB0aGlzLmluc3RhbmNlTnVtYmVyICsgJ18nICsgZC51aWQ7XG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFJlY3RMaW5rID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiAnIycgKyB0aGlzLmdlbmVyYXRlQ2xpcFJlY3RJZChkKTtcbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUGF0aExpbmsgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICd1cmwoIycgKyB0aGlzLmdlbmVyYXRlQ2xpcFBhdGhJZChkKSArICcpJztcbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUmVjdElkID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50Q2xpcFJlY3RfJyArIHRoaXMuaW5zdGFuY2VOdW1iZXIgKyAnXycgKyBkLnVpZDtcbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudEVudGVyID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgZWxlbWVudEhlaWdodCA9IHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgLSB0aGlzLm9wdGlvbnMucm93UGFkZGluZyAqIDI7XG5cbiAgICB2YXIgcmVjdCA9IHNlbGVjdGlvblxuICAgICAgICAuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudEJhY2tncm91bmQnKVxuICAgICAgICAuYXR0cignaGVpZ2h0JywgZWxlbWVudEhlaWdodCk7XG5cbiAgICB2YXIgZyA9IHNlbGVjdGlvblxuICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENvbnRlbnQnKTtcblxuICAgIGcuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50Jyk7XG5cblxuICAgIHZhciBjbGlwRWxlbWVudCA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbGlwRWxlbWVudCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5jbGlwRWxlbWVudEZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2xpcEVsZW1lbnQgPSAhIXRoaXMub3B0aW9ucy5jbGlwRWxlbWVudEZpbHRlci5jYWxsKHRoaXMsIHNlbGVjdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGlwRWxlbWVudCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2xpcEVsZW1lbnQpIHtcblxuICAgICAgICBnXG4gICAgICAgICAgICAuYXR0cignY2xpcC1wYXRoJywgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoTGluay5iaW5kKHRoaXMpKTtcblxuICAgICAgICByZWN0XG4gICAgICAgICAgICAucHJvcGVydHkoJ2lkJywgdGhpcy5nZW5lcmF0ZUNsaXBSZWN0SWQuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgc2VsZWN0aW9uLmFwcGVuZCgnY2xpcFBhdGgnKVxuICAgICAgICAgICAgLnByb3BlcnR5KCdpZCcsIHRoaXMuZ2VuZXJhdGVDbGlwUGF0aElkLmJpbmQodGhpcykpXG4gICAgICAgICAgICAuYXBwZW5kKCd1c2UnKVxuICAgICAgICAgICAgLmF0dHIoJ3hsaW5rOmhyZWYnLCB0aGlzLmdlbmVyYXRlQ2xpcFJlY3RMaW5rLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHNlbGVjdGlvbi5vbignY2xpY2snLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIGlmICghZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpjbGljaycsIHNlbGVjdGlvbiwgbnVsbCwgW2RdKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRUZXh0KSB7XG4gICAgICAgIHNlbGVjdGlvblxuICAgICAgICAgICAgLnNlbGVjdCgnLnRpbWVsaW5lLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpXG4gICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgIC5jbGFzc2VkKCd0aW1lbGluZS1lbnRpdHlMYWJlbCcsIHRydWUpXG4gICAgICAgICAgICAuYXR0cignZHknLCB0aGlzLm9wdGlvbnMucm93SGVpZ2h0LzIgKyA0KTtcbiAgICB9XG5cbiAgICBzZWxlY3Rpb24uY2FsbCh0aGlzLmVsZW1lbnRDb250ZW50RW50ZXIuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmJpbmREcmFnQW5kRHJvcE9uU2VsZWN0aW9uKHNlbGVjdGlvbik7XG5cbn07XG5cblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50c1RyYW5zbGF0ZSA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRUZXh0ICYmIHRoaXMub3B0aW9ucy5hbGlnbkxlZnQgJiYgdGhpcy5vcHRpb25zLmFsaWduT25UcmFuc2xhdGUgJiYgIWQuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIE1hdGgubWF4KC1zZWxmLnNjYWxlcy54KHNlbGYuZ2V0RGF0YVN0YXJ0KGQpKSwgMikgKyAnLDApJ1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRDb250ZW50RW50ZXIgPSBmdW5jdGlvbigpIHt9O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRDb250ZW50VXBkYXRlID0gZnVuY3Rpb24oKSB7fTtcblxuXG4vLyBAdG9kbyBjbGVhbiB1cFxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5iaW5kRHJhZ0FuZERyb3BPblNlbGVjdGlvbiA9IGZ1bmN0aW9uKHNlbGVjdGlvbikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBib2R5Tm9kZSA9IHNlbGYuZWxlbWVudHMuYm9keS5ub2RlKCk7XG4gICAgdmFyIGRyYWdTdGFydGVkID0gZmFsc2U7XG5cbiAgICAvLyBwb3NpdGlvbnNcbiAgICB2YXIgY3VycmVudFRyYW5zZm9ybSA9IG51bGw7XG4gICAgdmFyIG9yaWdpblRyYW5zZm9ybVN0cmluZyA9IG51bGw7XG4gICAgdmFyIGRyYWdTdGFydFggPSAwLCBkcmFnU3RhcnRZID0gMDtcbiAgICB2YXIgZWxlbWVudFN0YXJ0WCA9IDAsIGVsZW1lbnRTdGFydFkgPSAwO1xuICAgIHZhciBkcmFnUG9zaXRpb247XG4gICAgdmFyIHN0YXJ0RHJhZ1Bvc2l0aW9uO1xuXG4gICAgLy8gbW92ZW1lbnRzXG4gICAgdmFyIHZlcnRpY2FsTW92ZSA9IDA7XG4gICAgdmFyIGhvcml6b250YWxNb3ZlID0gMDtcbiAgICB2YXIgdmVydGljYWxTcGVlZCA9IDA7XG4gICAgdmFyIGhvcml6b250YWxTcGVlZCA9IDA7XG4gICAgdmFyIHRpbWVyQWN0aXZlID0gZmFsc2U7XG4gICAgdmFyIG5lZWRUaW1lclN0b3AgPSBmYWxzZTtcbiAgICB2YXIgc3RhcnRUaW1lO1xuXG4gICAgLy8gcmVzZXQgc3RhcnQgcG9zaXRpb246IHRvIGNhbGwgb24gZHJhZyBzdGFydCBvciB3aGVuIHRoaW5ncyBhcmUgcmVkcmF3blxuICAgIGZ1bmN0aW9uIHN0b3JlU3RhcnQoKSB7XG4gICAgICAgIGN1cnJlbnRUcmFuc2Zvcm0gPSBkMy50cmFuc2Zvcm0ob3JpZ2luVHJhbnNmb3JtU3RyaW5nID0gc2VsZWN0aW9uLmF0dHIoJ3RyYW5zZm9ybScpKTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WCA9IGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzBdO1xuICAgICAgICBlbGVtZW50U3RhcnRZID0gY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMV07XG4gICAgICAgIGRyYWdTdGFydFggPSBkcmFnUG9zaXRpb25bMF07XG4gICAgICAgIGRyYWdTdGFydFkgPSBkcmFnUG9zaXRpb25bMV07XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIG5ldyBkcmFnIHBvc2l0aW9uIGFuZCBtb3ZlIHRoZSBlbGVtZW50XG4gICAgZnVuY3Rpb24gdXBkYXRlVHJhbnNmb3JtKGZvcmNlRHJhdykge1xuXG4gICAgICAgIHZhciBkZWx0YVggPSBkcmFnUG9zaXRpb25bMF0gLSBkcmFnU3RhcnRYO1xuICAgICAgICB2YXIgZGVsdGFZID0gZHJhZ1Bvc2l0aW9uWzFdIC0gZHJhZ1N0YXJ0WTtcblxuICAgICAgICBpZiAoZm9yY2VEcmF3IHx8ICFzZWxmLm9wdGlvbnMucmVuZGVyT25JZGxlKSB7XG4gICAgICAgICAgICBzdG9yZVN0YXJ0KGRyYWdQb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVswXSA9IGVsZW1lbnRTdGFydFggKyBkZWx0YVg7XG4gICAgICAgIGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdID0gZWxlbWVudFN0YXJ0WSArIGRlbHRhWTtcblxuICAgICAgICBzZWxlY3Rpb24uYXR0cigndHJhbnNmb3JtJywgY3VycmVudFRyYW5zZm9ybS50b1N0cmluZygpKTtcblxuICAgIH1cblxuICAgIC8vIHRha2UgbWljcm8gc2Vjb25kcyBpZiBwb3NzaWJsZVxuICAgIHZhciBnZXRQcmVjaXNlVGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZSAmJiB0eXBlb2YgcGVyZm9ybWFuY2Uubm93ID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgcGVyZm9ybWFuY2Uubm93LmJpbmQocGVyZm9ybWFuY2UpXG4gICAgICAgIDogdHlwZW9mIERhdGUubm93ID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgICAgIERhdGUubm93LmJpbmQoRGF0ZSlcbiAgICAgICAgICAgIDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICsobmV3IERhdGUoKSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgLy8gaGFuZGxlIGF1dG9tYXRpYyBzY3JvbGwgYXJndW1lbnRzXG4gICAgZnVuY3Rpb24gZG9BdXRvbWF0aWNTY3JvbGwodGltZURlbHRhLCBmb3JjZURyYXcpIHtcblxuICAgICAgICAvLyBjb21wdXRlIGRlbHRhcyBiYXNlZCBvbiBkaXJlY3Rpb24sIHNwZWVkIGFuZCB0aW1lIGRlbHRhXG4gICAgICAgIHZhciBzcGVlZE11bHRpcGxpZXIgPSBzZWxmLm9wdGlvbnMuYXV0b21hdGljU2Nyb2xsU3BlZWRNdWx0aXBsaWVyO1xuICAgICAgICB2YXIgZGVsdGFYID0gaG9yaXpvbnRhbE1vdmUgKiBob3Jpem9udGFsU3BlZWQgKiB0aW1lRGVsdGEgKiBzcGVlZE11bHRpcGxpZXI7XG4gICAgICAgIHZhciBkZWx0YVkgPSB2ZXJ0aWNhbE1vdmUgKiB2ZXJ0aWNhbFNwZWVkICogdGltZURlbHRhICogc3BlZWRNdWx0aXBsaWVyO1xuXG4gICAgICAgIC8vIHRha2UgZ3JvdXAgdHJhbnNsYXRlIGNhbmNlbGxhdGlvbiB3aXRoIGZvcmNlZCByZWRyYXcgaW50byBhY2NvdW50LCBzbyByZWRlZmluZSBzdGFydFxuICAgICAgICBpZiAoZm9yY2VEcmF3KSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgPSBzZWxmLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlLnNsaWNlKDApO1xuICAgICAgICAgICAgZWxlbWVudFN0YXJ0WCArPSBjdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVswXTtcbiAgICAgICAgICAgIGVsZW1lbnRTdGFydFkgKz0gY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVhbE1vdmUgPSBzZWxmLm1vdmUoZGVsdGFYLCBkZWx0YVksIGZvcmNlRHJhdywgZmFsc2UsICFzZWxmLm9wdGlvbnMuaGlkZVRpY2tzT25BdXRvbWF0aWNTY3JvbGwpO1xuXG4gICAgICAgIGlmIChyZWFsTW92ZVsyXSB8fCByZWFsTW92ZVszXSkge1xuICAgICAgICAgICAgdXBkYXRlVHJhbnNmb3JtKGZvcmNlRHJhdyk7XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50U3RhcnRYIC09IHJlYWxNb3ZlWzJdO1xuICAgICAgICBlbGVtZW50U3RhcnRZIC09IHJlYWxNb3ZlWzNdO1xuXG4gICAgICAgIG5lZWRUaW1lclN0b3AgPSByZWFsTW92ZVsyXSA9PT0gMCAmJiByZWFsTW92ZVszXSA9PT0gMDtcbiAgICB9XG5cblxuICAgIHZhciBkcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgIC5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhcnREcmFnUG9zaXRpb24gPSBkcmFnUG9zaXRpb24gPSBkMy5tb3VzZShib2R5Tm9kZSk7XG5cbiAgICAgICAgICAgIHN0YXJ0VGltZSA9ICtuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICBzdG9yZVN0YXJ0KCk7XG5cbiAgICAgICAgICAgIGRhdGEuX2RlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5fZnJvemVuVWlkcy5wdXNoKGRhdGEudWlkKTtcblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2RyYWcnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIGRyYWdQb3NpdGlvbiA9IGQzLm1vdXNlKGJvZHlOb2RlKTtcblxuICAgICAgICAgICAgaWYgKCFkcmFnU3RhcnRlZCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHRpbWVEZWx0YSA9ICtuZXcgRGF0ZSgpIC0gc3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgIHZhciB0b3RhbERlbHRhWCA9IGRyYWdQb3NpdGlvblswXSAtIHN0YXJ0RHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICAgICAgICAgIHZhciB0b3RhbERlbHRhWSA9IGRyYWdQb3NpdGlvblsxXSAtIHN0YXJ0RHJhZ1Bvc2l0aW9uWzFdO1xuICAgICAgICAgICAgICAgIHZhciBkcmFnRGlzdGFuY2UgPSBNYXRoLnNxcnQodG90YWxEZWx0YVgqdG90YWxEZWx0YVgrdG90YWxEZWx0YVkqdG90YWxEZWx0YVkpO1xuXG4gICAgICAgICAgICAgICAgZHJhZ1N0YXJ0ZWQgPSAodGltZURlbHRhID4gc2VsZi5vcHRpb25zLm1heGltdW1DbGlja0RyYWdUaW1lIHx8IGRyYWdEaXN0YW5jZSA+IHNlbGYub3B0aW9ucy5tYXhpbXVtQ2xpY2tEcmFnRGlzdGFuY2UpICYmIGRyYWdEaXN0YW5jZSA+IHNlbGYub3B0aW9ucy5taW5pbXVtRHJhZ0Rpc3RhbmNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdTdGFydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6ZHJhZ3N0YXJ0Jywgc2VsZWN0aW9uLCBudWxsLCBbZGF0YV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRyYWdTdGFydGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnJywgc2VsZWN0aW9uLCBudWxsLCBbZGF0YV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbWFyZ2luRGVsdGEgPSBzZWxmLm9wdGlvbnMuYXV0b21hdGljU2Nyb2xsTWFyZ2luRGVsdGE7XG4gICAgICAgICAgICB2YXIgZFJpZ2h0ID0gbWFyZ2luRGVsdGEgLSAoc2VsZi5kaW1lbnNpb25zLndpZHRoIC0gZHJhZ1Bvc2l0aW9uWzBdKTtcbiAgICAgICAgICAgIHZhciBkTGVmdCA9IG1hcmdpbkRlbHRhIC0gZHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICAgICAgdmFyIGRCb3R0b20gPSBtYXJnaW5EZWx0YSAtIChzZWxmLmRpbWVuc2lvbnMuaGVpZ2h0IC0gZHJhZ1Bvc2l0aW9uWzFdKTtcbiAgICAgICAgICAgIHZhciBkVG9wID0gbWFyZ2luRGVsdGEgLSBkcmFnUG9zaXRpb25bMV07XG5cbiAgICAgICAgICAgIGhvcml6b250YWxTcGVlZCA9IE1hdGgucG93KE1hdGgubWF4KGRSaWdodCwgZExlZnQsIG1hcmdpbkRlbHRhKSwgMik7XG4gICAgICAgICAgICB2ZXJ0aWNhbFNwZWVkID0gTWF0aC5wb3coTWF0aC5tYXgoZEJvdHRvbSwgZFRvcCwgbWFyZ2luRGVsdGEpLCAyKTtcblxuICAgICAgICAgICAgdmFyIHByZXZpb3VzSG9yaXpvbnRhbE1vdmUgPSBob3Jpem9udGFsTW92ZTtcbiAgICAgICAgICAgIHZhciBwcmV2aW91c1ZlcnRpY2FsTW92ZSA9IHZlcnRpY2FsTW92ZTtcbiAgICAgICAgICAgIGhvcml6b250YWxNb3ZlID0gZFJpZ2h0ID4gMCA/IC0xIDogZExlZnQgPiAwID8gMSA6IDA7XG4gICAgICAgICAgICB2ZXJ0aWNhbE1vdmUgPSBkQm90dG9tID4gMCA/IC0xIDogZFRvcCA+IDAgPyAxIDogMDtcblxuICAgICAgICAgICAgdmFyIGhhc0NoYW5nZWRTdGF0ZSA9IHByZXZpb3VzSG9yaXpvbnRhbE1vdmUgIT09IGhvcml6b250YWxNb3ZlIHx8IHByZXZpb3VzVmVydGljYWxNb3ZlICE9PSB2ZXJ0aWNhbE1vdmU7XG5cbiAgICAgICAgICAgIGlmICgoaG9yaXpvbnRhbE1vdmUgfHwgdmVydGljYWxNb3ZlKSAmJiAhdGltZXJBY3RpdmUgJiYgaGFzQ2hhbmdlZFN0YXRlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGltZXJTdGFydFRpbWUgPSBnZXRQcmVjaXNlVGltZSgpO1xuXG4gICAgICAgICAgICAgICAgdGltZXJBY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgZDMudGltZXIoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRUaW1lID0gZ2V0UHJlY2lzZVRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVEZWx0YSA9IGN1cnJlbnRUaW1lIC0gdGltZXJTdGFydFRpbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVyV2lsbFN0b3AgPSAhdmVydGljYWxNb3ZlICYmICFob3Jpem9udGFsTW92ZSB8fCBuZWVkVGltZXJTdG9wO1xuXG4gICAgICAgICAgICAgICAgICAgIGRvQXV0b21hdGljU2Nyb2xsKHRpbWVEZWx0YSwgc2VsZi5vcHRpb25zLnJlbmRlck9uQXV0b21hdGljU2Nyb2xsSWRsZSAmJiB0aW1lcldpbGxTdG9wKTtcblxuICAgICAgICAgICAgICAgICAgICB0aW1lclN0YXJ0VGltZSA9IGN1cnJlbnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lcldpbGxTdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZWVkVGltZXJTdG9wID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lckFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVyV2lsbFN0b3A7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZWxmLl9kcmFnQUYpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHNlbGYuX2RyYWdBRik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuX2RyYWdBRiA9IHNlbGYucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZVRyYW5zZm9ybSk7XG5cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdkcmFnZW5kJywgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICBzZWxmLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHNlbGYuX2RyYWdBRik7XG4gICAgICAgICAgICBzZWxmLl9kcmFnQUYgPSBudWxsO1xuICAgICAgICAgICAgaG9yaXpvbnRhbE1vdmUgPSAwO1xuICAgICAgICAgICAgdmVydGljYWxNb3ZlID0gMDtcblxuICAgICAgICAgICAgZGF0YS5fZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi5fZnJvemVuVWlkcy5zcGxpY2Uoc2VsZi5fZnJvemVuVWlkcy5pbmRleE9mKGRhdGEudWlkKSwgMSk7XG5cbiAgICAgICAgICAgIGQzLnRpbWVyLmZsdXNoKCk7XG5cbiAgICAgICAgICAgIHZhciBkZWx0YUZyb21Ub3BMZWZ0Q29ybmVyID0gZDMubW91c2Uoc2VsZWN0aW9uLm5vZGUoKSk7XG4gICAgICAgICAgICB2YXIgaGFsZkhlaWdodCA9IHNlbGYub3B0aW9ucy5yb3dIZWlnaHQgLyAyO1xuICAgICAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcblxuICAgICAgICAgICAgaWYgKGRyYWdTdGFydGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnZW5kJywgc2VsZWN0aW9uLCBbLWRlbHRhRnJvbVRvcExlZnRDb3JuZXJbMF0sIC1kZWx0YUZyb21Ub3BMZWZ0Q29ybmVyWzFdICsgaGFsZkhlaWdodF0sIFtkYXRhXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nLCBvcmlnaW5UcmFuc2Zvcm1TdHJpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmXG4gICAgICAgICAgICAgICAgLnVwZGF0ZVkoKVxuICAgICAgICAgICAgICAgIC5kcmF3WUF4aXMoKTtcblxuICAgICAgICAgICAgZHJhZ1N0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICBzZWxlY3Rpb24uY2FsbChkcmFnKTtcblxufTtcblxuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRVcGRhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGQsIHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy53cmFwV2l0aEFuaW1hdGlvbihzZWxlY3Rpb24uc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRCYWNrZ3JvdW5kJyksIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgeTogdGhpcy5vcHRpb25zLnJvd1BhZGRpbmcsXG4gICAgICAgICAgICB3aWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy54KHNlbGYuZ2V0RGF0YUVuZChkKSkgLSBzZWxmLnNjYWxlcy54KHNlbGYuZ2V0RGF0YVN0YXJ0KGQpKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kVGV4dCAmJiB0aGlzLm9wdGlvbnMuYWxpZ25MZWZ0ICYmICFkLl9kZWZhdWx0UHJldmVudGVkKSB7XG5cbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpXG4gICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZCA9PiAndHJhbnNsYXRlKCcgKyBNYXRoLm1heCgtdGhpcy5zY2FsZXMueCh0aGlzLmdldERhdGFTdGFydChkKSksIDIpICsgJywwKScpO1xuICAgIH1cblxuICAgIHNlbGVjdGlvbi5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmVsZW1lbnRDb250ZW50VXBkYXRlKHNlbGVjdGlvbiwgZCwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9KTtcblxufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50RXhpdCA9IGZ1bmN0aW9uKHNlbGVjdGlvbikge1xuXG4gICAgc2VsZWN0aW9uLm9uKCdjbGljaycsIG51bGwpO1xuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBEM0Jsb2NrVGFibGU7XG4iLCIvKiBnbG9iYWwgY2FuY2VsQW5pbWF0aW9uRnJhbWUsIHJlcXVlc3RBbmltYXRpb25GcmFtZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzL2V2ZW50cyc7XG5pbXBvcnQgZDMgZnJvbSAnZDMnO1xuXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gRDNUYWJsZVJvd1xuICogQHByb3BlcnR5IHtTdHJpbmd8TnVtYmVyfSBpZFxuICogQHByb3BlcnR5IHtTdHJpbmd9IG5hbWVcbiAqIEBwcm9wZXJ0eSB7QXJyYXk8RDNUYWJsZUVsZW1lbnQ+fSBlbGVtZW50c1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gRDNUYWJsZUVsZW1lbnRcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfE51bWJlcn0gaWRcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfE51bWJlcn0gdWlkXG4gKiBAcHJvcGVydHkge051bWJlcn0gc3RhcnRcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBlbmRcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBbcm93SW5kZXhdXG4gKi9cblxuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUYWJsZShvcHRpb25zKSB7XG5cbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIEQzVGFibGUuaW5zdGFuY2VzQ291bnQgKz0gMTtcblxuICAgIHRoaXMuaW5zdGFuY2VOdW1iZXIgPSBEM1RhYmxlLmluc3RhbmNlc0NvdW50O1xuXG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0FycmF5PEQzVGFibGVSb3c+fVxuICAgICAqL1xuICAgIHRoaXMuZGF0YSA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0FycmF5PEQzVGFibGVFbGVtZW50Pn1cbiAgICAgKi9cbiAgICB0aGlzLmZsYXR0ZW5lZERhdGEgPSBbXTtcblxuXG4gICAgdGhpcy5tYXJnaW4gPSB7XG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgbGVmdDogMFxuICAgIH07XG5cbiAgICB0aGlzLmRpbWVuc2lvbnMgPSB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcblxuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgPSBbMC4wLCAwLjBdO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuXG4gICAgdGhpcy5lbGVtZW50cyA9IHtcbiAgICAgICAgYm9keTogbnVsbCxcbiAgICAgICAgaW5uZXJDb250YWluZXI6IG51bGwsXG4gICAgICAgIHhBeGlzQ29udGFpbmVyOiBudWxsLFxuICAgICAgICB4MkF4aXNDb250YWluZXI6IG51bGwsXG4gICAgICAgIHlBeGlzQ29udGFpbmVyOiBudWxsLFxuICAgICAgICBkZWZzOiBudWxsLFxuICAgICAgICBjbGlwOiBudWxsXG4gICAgfTtcblxuICAgIHRoaXMuc2NhbGVzID0ge1xuICAgICAgICB4OiBudWxsLFxuICAgICAgICB5OiBudWxsXG4gICAgfTtcblxuICAgIHRoaXMuYXhpc2VzID0ge1xuICAgICAgICB4OiBudWxsLFxuICAgICAgICB4MjogbnVsbCxcbiAgICAgICAgeTogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLmJlaGF2aW9ycyA9IHtcbiAgICAgICAgem9vbTogbnVsbCxcbiAgICAgICAgem9vbVg6IG51bGwsXG4gICAgICAgIHpvb21ZOiBudWxsLFxuICAgICAgICBwYW46IG51bGxcbiAgICB9O1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFNjYWxlID0gbnVsbDtcblxuICAgIHRoaXMuX3lTY2FsZSA9IDAuMDtcbiAgICB0aGlzLl9kYXRhQ2hhbmdlQ291bnQgPSAwO1xuICAgIHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9IDA7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoID0gMDtcbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0ID0gMDtcbiAgICB0aGlzLl9wcmV2ZW50RHJhd2luZyA9IGZhbHNlO1xuICAgIHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzID0gW107XG4gICAgdGhpcy5fbWF4Qm9keUhlaWdodCA9IEluZmluaXR5O1xuICAgIHRoaXMuX2Zyb3plblVpZHMgPSBbXTtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZSwgRXZlbnRFbWl0dGVyKTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMgPSB7XG4gICAgYmVtQmxvY2tOYW1lOiAndGFibGUnLFxuICAgIGJlbUJsb2NrTW9kaWZpZXI6ICcnLFxuICAgIHhBeGlzSGVpZ2h0OiA1MCxcbiAgICB5QXhpc1dpZHRoOiA1MCxcbiAgICByb3dIZWlnaHQ6IDMwLFxuICAgIHJvd1BhZGRpbmc6IDUsXG4gICAgY29udGFpbmVyOiAnYm9keScsXG4gICAgY3VsbGluZ1g6IHRydWUsXG4gICAgY3VsbGluZ1k6IHRydWUsXG4gICAgY3VsbGluZ0Rpc3RhbmNlOiAxLFxuICAgIHJlbmRlck9uSWRsZTogdHJ1ZSxcbiAgICBoaWRlVGlja3NPblpvb206IGZhbHNlLFxuICAgIGhpZGVUaWNrc09uRHJhZzogZmFsc2UsXG4gICAgcGFuWU9uV2hlZWw6IHRydWUsXG4gICAgd2hlZWxNdWx0aXBsaWVyOiAxLFxuICAgIGVuYWJsZVlUcmFuc2l0aW9uOiB0cnVlLFxuICAgIGVuYWJsZVRyYW5zaXRpb25PbkV4aXQ6IHRydWUsXG4gICAgdXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtOiBmYWxzZSxcbiAgICB0cmFuc2l0aW9uRWFzaW5nOiAncXVhZC1pbi1vdXQnLFxuICAgIHhBeGlzVGlja3NGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgfSxcbiAgICB4QXhpc1N0cm9rZVdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkJTIgPyAxIDogMjtcbiAgICB9LFxuICAgIHhBeGlzMlRpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9LFxuICAgIHlBeGlzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkICYmIGQubmFtZSB8fCAnJztcbiAgICB9LFxuICAgIHBhZGRpbmc6IDEwLFxuICAgIHRyYWNrZWRET01FdmVudHM6IFsnY2xpY2snLCAnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZScsICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXSAvLyBub3QgZHluYW1pY1xufTtcblxuRDNUYWJsZS5pbnN0YW5jZXNDb3VudCA9IDA7XG5cbkQzVGFibGUucHJvdG90eXBlLm5vb3AgPSBmdW5jdGlvbigpIHt9O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBjb250YWluZXJcbiAgICB0aGlzLmNvbnRhaW5lciA9IGQzLnNlbGVjdCh0aGlzLm9wdGlvbnMuY29udGFpbmVyKS5hcHBlbmQoJ3N2ZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAodGhpcy5vcHRpb25zLmJlbUJsb2NrTW9kaWZpZXIgPyAnICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTW9kaWZpZXIgOiAnJykpO1xuXG4gICAgLy8gZGVmc1xuICAgIHRoaXMuZWxlbWVudHMuZGVmcyA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZGVmcycpO1xuXG4gICAgLy8gY2xpcCByZWN0IGluIGRlZnNcbiAgICB2YXIgY2xpcElkID0gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm9keUNsaXBQYXRoLS0nICsgRDNUYWJsZS5pbnN0YW5jZXNDb3VudDtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXAgPSB0aGlzLmVsZW1lbnRzLmRlZnMuYXBwZW5kKCdjbGlwUGF0aCcpXG4gICAgICAgIC5wcm9wZXJ0eSgnaWQnLCBjbGlwSWQpO1xuICAgIHRoaXMuZWxlbWVudHMuY2xpcFxuICAgICAgICAuYXBwZW5kKCdyZWN0Jyk7XG5cbiAgICAvLyBzdXJyb3VuZGluZyByZWN0XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnLCB0cnVlKTtcblxuICAgIC8vIGF4aXNlcyBjb250YWluZXJzXG4gICAgdGhpcy5lbGVtZW50cy54QXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXgnKTtcblxuICAgIHRoaXMuZWxlbWVudHMueDJBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teCAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0tc2Vjb25kYXJ5Jyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teScpO1xuXG4gICAgLy8gYm9keSBjb250YWluZXIgaW5uZXIgY29udGFpbmVyIGFuZCBzdXJyb3VuZGluZyByZWN0XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5ID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoIycgKyBjbGlwSWQgKyAnKScpO1xuXG4gICAgLy8gc3Vycm91bmRpbmcgcmVjdFxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuY2xhc3NlZCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcsIHRydWUpO1xuXG4gICAgLy8gaW5uZXIgY29udGFpbmVyXG4gICAgdGhpcy5lbGVtZW50cy5pbm5lckNvbnRhaW5lciA9IHRoaXMuZWxlbWVudHMuYm9keS5hcHBlbmQoJ2cnKTtcblxuICAgIC8vIHN1cnJvdW5kaW5nIHJlY3RcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0JywgdHJ1ZSk7XG5cbiAgICB0aGlzLnVwZGF0ZU1hcmdpbnMoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUQzSW5zdGFuY2VzKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVFdmVudExpc3RlbmVycygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS54U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUueVNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmluaXRpYWxpemVEM0luc3RhbmNlcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5zY2FsZXMueCA9IHRoaXMueFNjYWxlRmFjdG9yeSgpO1xuXG4gICAgdGhpcy5zY2FsZXMueSA9IHRoaXMueVNjYWxlRmFjdG9yeSgpO1xuXG4gICAgdGhpcy5heGlzZXMueCA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgLnNjYWxlKHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5vcmllbnQoJ3RvcCcpXG4gICAgICAgIC50aWNrRm9ybWF0KHRoaXMub3B0aW9ucy54QXhpc1RpY2tzRm9ybWF0dGVyLmJpbmQodGhpcykpXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApXG4gICAgICAgIC50aWNrUGFkZGluZygyMCk7XG5cbiAgICB0aGlzLmF4aXNlcy54MiA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgLnNjYWxlKHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5vcmllbnQoJ3RvcCcpXG4gICAgICAgIC50aWNrRm9ybWF0KHRoaXMub3B0aW9ucy54QXhpczJUaWNrc0Zvcm1hdHRlci5iaW5kKHRoaXMpKVxuICAgICAgICAub3V0ZXJUaWNrU2l6ZSgwKVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZSgwKTtcblxuICAgIHRoaXMuYXhpc2VzLnkgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy55KVxuICAgICAgICAub3JpZW50KCdsZWZ0JylcbiAgICAgICAgLnRpY2tGb3JtYXQoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuX2lzUm91bmQoZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5vcHRpb25zLnlBeGlzRm9ybWF0dGVyKHNlbGYuZGF0YVsoZHwwKV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSlcbiAgICAgICAgLm9uKCd6b29tJywgdGhpcy5oYW5kbGVab29taW5nLmJpbmQodGhpcykpXG4gICAgICAgIC5vbignem9vbWVuZCcsIHRoaXMuaGFuZGxlWm9vbWluZ0VuZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YID0gZDMuYmVoYXZpb3Iuem9vbSgpXG4gICAgICAgIC54KHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5zY2FsZSgxKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAueSh0aGlzLnNjYWxlcy55KVxuICAgICAgICAuc2NhbGUoMSlcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy5wYW4gPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgICAgLm9uKCdkcmFnJywgdGhpcy5oYW5kbGVEcmFnZ2luZy5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5jYWxsKHRoaXMuYmVoYXZpb3JzLnBhbik7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmNhbGwodGhpcy5iZWhhdmlvcnMuem9vbSk7XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKTtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCk7XG59XG5cbkQzVGFibGUucHJvdG90eXBlLmluaXRpYWxpemVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5vcHRpb25zLnRyYWNrZWRET01FdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudE5hbWUpIHtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5ib2R5Lm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnROYW1lICE9PSAnY2xpY2snIHx8ICFkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkICYmIGQzLnNlbGVjdChkMy5ldmVudC50YXJnZXQpLmNsYXNzZWQoc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoZXZlbnROYW1lLCBzZWxmLmVsZW1lbnRzLmJvZHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZW1pdERldGFpbGVkRXZlbnQgPSBmdW5jdGlvbihldmVudE5hbWUsIGQzVGFyZ2V0U2VsZWN0aW9uLCBkZWx0YSwgcHJpb3JpdHlBcmd1bWVudHMsIGV4dHJhQXJndW1lbnRzKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcG9zaXRpb247XG5cbiAgICB2YXIgZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFwb3NpdGlvbikge1xuICAgICAgICAgICAgcG9zaXRpb24gPSBkMy5tb3VzZShzZWxmLmVsZW1lbnRzLmJvZHkubm9kZSgpKTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRlbHRhKSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uWzBdICs9IGRlbHRhWzBdO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uWzFdICs9IGRlbHRhWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9O1xuXG4gICAgdmFyIGFyZ3MgPSBbXG4gICAgICAgIHRoaXMsIC8vIHRoZSB0YWJsZSBpbnN0YW5jZVxuICAgICAgICBkM1RhcmdldFNlbGVjdGlvbiwgLy8gdGhlIGQzIHNlbGVjdGlvbiB0YXJnZXRlZFxuICAgICAgICBkMy5ldmVudCwgLy8gdGhlIGQzIGV2ZW50XG4gICAgICAgIGZ1bmN0aW9uIGdldENvbHVtbigpIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IGdldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5zY2FsZXMueC5pbnZlcnQocG9zaXRpb25bMF0pO1xuICAgICAgICB9LCAvLyBhIGNvbHVtbiBnZXR0ZXJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Um93KCkge1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy55LmludmVydChwb3NpdGlvblsxXSk7XG4gICAgICAgIH0gLy8gYSByb3cgZ2V0dGVyXG4gICAgXTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KHByaW9yaXR5QXJndW1lbnRzKSkge1xuICAgICAgICBhcmdzID0gcHJpb3JpdHlBcmd1bWVudHMuY29uY2F0KGFyZ3MpO1xuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGV4dHJhQXJndW1lbnRzKSkge1xuICAgICAgICBhcmdzID0gYXJncy5jb25jYXQoZXh0cmFBcmd1bWVudHMpO1xuICAgIH1cblxuICAgIGFyZ3MudW5zaGlmdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzonICsgZXZlbnROYW1lKTsgLy8gdGhlIGV2ZW50IG5hbWVcblxuICAgIHRoaXMuZW1pdC5hcHBseSh0aGlzLCBhcmdzKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZU1hcmdpbnMgPSBmdW5jdGlvbih1cGRhdGVEaW1lbnNpb25zKSB7XG5cbiAgICB0aGlzLm1hcmdpbiA9IHtcbiAgICAgICAgdG9wOiB0aGlzLm9wdGlvbnMueEF4aXNIZWlnaHQgKyB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgcmlnaHQ6IHRoaXMub3B0aW9ucy5wYWRkaW5nLFxuICAgICAgICBib3R0b206IHRoaXMub3B0aW9ucy5wYWRkaW5nLFxuICAgICAgICBsZWZ0OiB0aGlzLm9wdGlvbnMueUF4aXNXaWR0aCArIHRoaXMub3B0aW9ucy5wYWRkaW5nXG4gICAgfTtcblxuICAgIHZhciBjb250ZW50UG9zaXRpb24gPSB7IHg6IHRoaXMubWFyZ2luLmxlZnQsIHk6IHRoaXMubWFyZ2luLnRvcCB9O1xuICAgIHZhciBjb250ZW50VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgdGhpcy5tYXJnaW4ubGVmdCArICcsJyArIHRoaXMubWFyZ2luLnRvcCArICcpJztcblxuICAgIHRoaXMuY29udGFpbmVyLnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnKVxuICAgICAgICAuYXR0cihjb250ZW50UG9zaXRpb24pO1xuXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5XG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueEF4aXNDb250YWluZXJcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGNvbnRlbnRUcmFuc2Zvcm0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy54MkF4aXNDb250YWluZXJcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGNvbnRlbnRUcmFuc2Zvcm0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy55QXhpc0NvbnRhaW5lclxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgdGhpcy5tYXJnaW4ubGVmdCArICcsJyArIHRoaXMubWFyZ2luLnRvcCArICcpJyk7XG5cbiAgICBpZiAodXBkYXRlRGltZW5zaW9ucykge1xuICAgICAgICB0aGlzLnVwZGF0ZVgoKTtcbiAgICAgICAgdGhpcy51cGRhdGVZKCk7XG4gICAgfVxuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyByZW1vdmUgYmVoYXZpb3IgbGlzdGVuZXJzXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS5vbignem9vbScsIG51bGwpO1xuXG4gICAgLy8gcmVtb3ZlIGRvbSBsaXN0ZW5lcnNcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkub24oJy56b29tJywgbnVsbCk7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5Lm9uKCdjbGljaycsIG51bGwpO1xuXG4gICAgLy8gcmVtb3ZlIHJlZmVyZW5jZXNcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5lbGVtZW50cyA9IG51bGw7XG4gICAgdGhpcy5zY2FsZXMgPSBudWxsO1xuICAgIHRoaXMuYXhpc2VzID0gbnVsbDtcbiAgICB0aGlzLmJlaGF2aW9ycyA9IG51bGw7XG4gICAgdGhpcy5kYXRhID0gbnVsbDtcbiAgICB0aGlzLmZsYXR0ZW5lZERhdGEgPSBudWxsO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUucmVzdG9yZVpvb20gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSh0aGlzLl9sYXN0VHJhbnNsYXRlKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKHRoaXMuX2xhc3RTY2FsZSk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oZHgsIGR5LCBmb3JjZURyYXcsIHNraXBYQXhpcywgZm9yY2VUaWNrcykge1xuXG4gICAgdmFyIGN1cnJlbnRUcmFuc2xhdGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpO1xuICAgIHZhciB1cGRhdGVkVCA9IFtjdXJyZW50VHJhbnNsYXRlWzBdICsgZHgsIGN1cnJlbnRUcmFuc2xhdGVbMV0gKyBkeV07XG5cbiAgICB1cGRhdGVkVCA9IHRoaXMuX2NsYW1wVHJhbnNsYXRpb25XaXRoU2NhbGUodXBkYXRlZFQsIFt0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCksIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnNjYWxlKCldKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkudHJhbnNsYXRlKHVwZGF0ZWRUKTtcblxuICAgIHRoaXMubW92ZUVsZW1lbnRzKGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVDtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJyk7XG5cbiAgICByZXR1cm4gdXBkYXRlZFQuY29uY2F0KFt1cGRhdGVkVFswXSAtIGN1cnJlbnRUcmFuc2xhdGVbMF0sIHVwZGF0ZWRUWzFdIC0gY3VycmVudFRyYW5zbGF0ZVsxXV0pO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZW5zdXJlSW5Eb21haW5zID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubW92ZSgwLCAwLCBmYWxzZSwgZmFsc2UsIHRydWUpO1xufTtcblxuLyoqXG4gKiBwYW4gWC9ZICYgem9vbSBYIGhhbmRsZXIgKGNsYW1wZWQgcGFuIFkgd2hlbiB3aGVlbCBpcyBwcmVzc2VkIHdpdGhvdXQgY3RybCwgem9vbSBYIGFuZCBwYW4gWC9ZIG90aGVyd2lzZSlcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlWm9vbWluZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmICFkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5ICYmICEoZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID49IDIpKSB7XG4gICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC50eXBlID09PSAnd2hlZWwnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBhbllPbldoZWVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlWm9vbSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlV2hlZWxpbmcoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlc3RvcmVab29tKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdCA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdmFyIHVwZGF0ZWRUID0gW3RbMF0sIHRoaXMuX2xhc3RUcmFuc2xhdGVbMV1dO1xuXG4gICAgdXBkYXRlZFQgPSB0aGlzLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlKHVwZGF0ZWRULCBbdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpLCB0aGlzLmJlaGF2aW9ycy56b29tWS5zY2FsZSgpXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVgudHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuXG4gICAgdGhpcy5tb3ZlRWxlbWVudHModHJ1ZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25ab29tKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVDtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScpO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVab29taW5nRW5kID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuICAgIHRoaXMubW92ZUVsZW1lbnRzKHRydWUpO1xuICAgIHRoaXMuZHJhd1lBeGlzKCk7XG4gICAgdGhpcy5kcmF3WEF4aXMoKTtcbn07XG5cbi8qKlxuICogd2hlZWwgaGFuZGxlciAoY2xhbXBlZCBwYW4gWSlcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlV2hlZWxpbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBldmVudCA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50O1xuXG4gICAgdmFyIGR4ID0gMCwgZHkgPSAwO1xuXG4gICAgdmFyIG1vdmluZ1ggPSBldmVudCAmJiBldmVudC53aGVlbERlbHRhWCB8fCBldmVudC5kZWx0YVg7XG5cbiAgICBpZiAobW92aW5nWCkge1xuXG4gICAgICAgIHZhciBtb3ZpbmdSaWdodCA9IGV2ZW50LndoZWVsRGVsdGFYID4gMCB8fCBldmVudC5kZWx0YVggPCAwO1xuICAgICAgICBkeCA9IChtb3ZpbmdSaWdodCA/IDEgOiAtMSkgKiB0aGlzLmNvbHVtbldpZHRoICogdGhpcy5vcHRpb25zLndoZWVsTXVsdGlwbGllcjtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdmFyIG1vdmluZ1kgPSBldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LndoZWVsRGVsdGFZIHx8IGV2ZW50LmRldGFpbCB8fCBldmVudC5kZWx0YVk7XG5cbiAgICAgICAgaWYgKG1vdmluZ1kpIHtcbiAgICAgICAgICAgIHZhciBtb3ZpbmdEb3duID0gZXZlbnQud2hlZWxEZWx0YSA+IDAgfHwgZXZlbnQud2hlZWxEZWx0YVkgPiAwIHx8IGV2ZW50LmRldGFpbCA8IDAgfHwgZXZlbnQuZGVsdGFZIDwgMDtcbiAgICAgICAgICAgIGR5ID0gbW92aW5nWSA/IChtb3ZpbmdEb3duID8gMSA6IC0xKSAqIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgKiB0aGlzLm9wdGlvbnMud2hlZWxNdWx0aXBsaWVyIDogMDtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgdGhpcy5tb3ZlKGR4LCBkeSwgZmFsc2UsICFtb3ZpbmdYKTtcblxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlRHJhZ2dpbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b3VjaGVzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm1vdmUoZDMuZXZlbnQuZHgsIGQzLmV2ZW50LmR5LCBmYWxzZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25EcmFnKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnRvZ2dsZURyYXdpbmcgPSBmdW5jdGlvbihhY3RpdmUpIHtcblxuICAgIHRoaXMuX3ByZXZlbnREcmF3aW5nID0gdHlwZW9mIGFjdGl2ZSA9PT0gJ2Jvb2xlYW4nID8gIWFjdGl2ZSA6ICF0aGlzLl9wcmV2ZW50RHJhd2luZztcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtBcnJheTxEM1RhYmxlUm93Pn0gZGF0YVxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFthbmltYXRlWV1cbiAqIEByZXR1cm5zIHtEM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24oZGF0YSwgdHJhbnNpdGlvbkR1cmF0aW9uLCBhbmltYXRlWSkge1xuXG4gICAgdGhpcy5fZGF0YUNoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNTaXplQ2hhbmdpbmcgPSBkYXRhLmxlbmd0aCAhPT0gdGhpcy5kYXRhLmxlbmd0aDtcblxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICB0aGlzLmdlbmVyYXRlRmxhdHRlbmVkRGF0YSgpO1xuXG4gICAgaWYgKGlzU2l6ZUNoYW5naW5nIHx8IHRoaXMuX2RhdGFDaGFuZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgICAgICAudXBkYXRlWShhbmltYXRlWSA/IHRyYW5zaXRpb25EdXJhdGlvbiA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd0VsZW1lbnRzKHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICogQHJldHVybnMge0FycmF5PEQzVGFibGVSb3c+fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZURhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiB0aGlzLmRhdGEubWFwKGZ1bmN0aW9uKGQpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge0QzVGFibGVSb3d9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0ge307XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIGQpIHtcbiAgICAgICAgICAgIGlmIChkLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAnZWxlbWVudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc1trZXldID0gZFtrZXldO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc1trZXldID0gZFtrZXldLm1hcChzZWxmLmNsb25lRWxlbWVudC5iaW5kKHNlbGYpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKiBAcmV0dXJucyB7QXJyYXk8RDNUYWJsZUVsZW1lbnQ+fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5mbGF0dGVuZWREYXRhLm1hcChmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtEM1RhYmxlRWxlbWVudH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSB7fTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZSkge1xuICAgICAgICAgICAgaWYgKGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHJlc1trZXldID0gZVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICogQHJldHVybnMge0QzVGFibGVFbGVtZW50fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZUVsZW1lbnQgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RDNUYWJsZUVsZW1lbnR9XG4gICAgICovXG4gICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgZm9yICh2YXIga2V5IGluIGUpIHtcbiAgICAgICAgaWYgKGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgcmVzW2tleV0gPSBlW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RWxlbWVudFJvdyA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmluZCh0aGlzLmRhdGEsIGZ1bmN0aW9uKHJvdykge1xuICAgICAgICByZXR1cm4gcm93LmVsZW1lbnRzLmluZGV4T2YoZCkgIT09IC0xO1xuICAgIH0pO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuc3RvcmVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wcmV2aW91c0ZsYXR0ZW5lZERhdGEgPSB0aGlzLmNsb25lRmxhdHRlbmVkRGF0YSgpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybSkge1xuICAgICAgICB0aGlzLnN0b3JlRmxhdHRlbmVkRGF0YSgpO1xuICAgIH1cblxuICAgIHRoaXMuZmxhdHRlbmVkRGF0YS5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5kYXRhLmZvckVhY2goZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICBkLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5yb3dJbmRleCA9IGk7XG4gICAgICAgICAgICBpZiAoc2VsZi5fZnJvemVuVWlkcy5pbmRleE9mKGVsZW1lbnQudWlkKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9kZWZhdWx0UHJldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuZmxhdHRlbmVkRGF0YS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gbWluWFxuICogQHBhcmFtIHtEYXRlfSBtYXhYXG4gKiBAcmV0dXJucyB7RDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc2V0WFJhbmdlID0gZnVuY3Rpb24obWluWCwgbWF4WCkge1xuXG4gICAgdGhpcy5taW5YID0gbWluWDtcbiAgICB0aGlzLm1heFggPSBtYXhYO1xuXG4gICAgdGhpcy5zY2FsZXMueFxuICAgICAgICAuZG9tYWluKFt0aGlzLm1pblgsIHRoaXMubWF4WF0pO1xuXG4gICAgdGhpc1xuICAgICAgICAudXBkYXRlWCgpXG4gICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAuZHJhd0VsZW1lbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnNldEF2YWlsYWJsZVdpZHRoID0gZnVuY3Rpb24oYXZhaWxhYmxlV2lkdGgpIHtcblxuICAgIHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCArPSAxO1xuXG4gICAgdmFyIGlzQXZhaWxhYmxlV2lkdGhDaGFuZ2luZyA9IGF2YWlsYWJsZVdpZHRoICE9PSB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGg7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoID0gYXZhaWxhYmxlV2lkdGg7XG5cbiAgICB0aGlzLmRpbWVuc2lvbnMud2lkdGggPSB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGggLSB0aGlzLm1hcmdpbi5sZWZ0IC0gdGhpcy5tYXJnaW4ucmlnaHQ7XG5cbiAgICBpZiAoaXNBdmFpbGFibGVXaWR0aENoYW5naW5nIHx8IHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWCgpXG4gICAgICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAgICAgLmRyYXdFbGVtZW50cygpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRBdmFpbGFibGVIZWlnaHQgPSBmdW5jdGlvbihhdmFpbGFibGVIZWlnaHQpIHtcblxuICAgIHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCArPSAxO1xuXG4gICAgdmFyIGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgPSBhdmFpbGFibGVIZWlnaHQgIT09IHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQ7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCA9IGF2YWlsYWJsZUhlaWdodDtcblxuICAgIHRoaXMuX21heEJvZHlIZWlnaHQgPSB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0IC0gdGhpcy5tYXJnaW4udG9wIC0gdGhpcy5tYXJnaW4uYm90dG9tO1xuXG4gICAgaWYgKGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgfHwgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID09PSAxKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVZKClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgICAgICAuZHJhd0VsZW1lbnRzKClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVggPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHRoaXMuY29udGFpbmVyLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoICsgdGhpcy5tYXJnaW4ubGVmdCArIHRoaXMubWFyZ2luLnJpZ2h0KTtcblxuICAgIHRoaXMuc2NhbGVzLnhcbiAgICAgICAgLmRvbWFpbihbdGhpcy5taW5YLCB0aGlzLm1heFhdKVxuICAgICAgICAucmFuZ2UoWzAsIHRoaXMuZGltZW5zaW9ucy53aWR0aF0pO1xuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZSgtdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YXG4gICAgICAgIC54KHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC50cmFuc2xhdGUodGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKSlcbiAgICAgICAgLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1ib3VuZGluZ1JlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgdGhpcy5jb250YWluZXIuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXAuc2VsZWN0KCdyZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMsIHRoaXMuY29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihmKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5wdXNoKGYpO1xuXG4gICAgaWYgKHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZztcbiAgICAgICAgICAgIHdoaWxlKGcgPSBzZWxmLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5zaGlmdCgpKSBnKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihmKSB7XG5cbiAgICB2YXIgaW5kZXggPSB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5sZW5ndGggPiAwID8gdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMuaW5kZXhPZihmKSA6IC0xO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRyYXdYQXhpcyA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbiwgc2tpcFRpY2tzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZShza2lwVGlja3MgPyAwIDogLXRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5feEF4aXNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3hBeGlzQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX3hBeGlzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKHNlbGYuZWxlbWVudHMueEF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5jYWxsKHNlbGYuYXhpc2VzLngpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdsaW5lJylcbiAgICAgICAgICAgIC5zdHlsZSh7XG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IHNlbGYub3B0aW9ucy54QXhpc1N0cm9rZVdpZHRoLmJpbmQoc2VsZilcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy54MkF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5jYWxsKHNlbGYuYXhpc2VzLngyKVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgndGV4dCcpXG4gICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgeDogc2VsZi5jb2x1bW5XaWR0aCAvIDJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3R5bGUoe1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICtkID09PSArc2VsZi5tYXhYID8gJ25vbmUnIDogJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRyYXdZQXhpcyA9IGZ1bmN0aW9uIGRyYXdZQXhpcyh0cmFuc2l0aW9uRHVyYXRpb24sIHNraXBUaWNrcykge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuYXhpc2VzLnhcbiAgICAgICAgLmlubmVyVGlja1NpemUoc2tpcFRpY2tzID8gMCA6IC10aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIHZhciBkb21haW5ZID0gdGhpcy5zY2FsZXMueS5kb21haW4oKTtcblxuICAgIHRoaXMuYXhpc2VzLnlcbiAgICAgICAgLnRpY2tWYWx1ZXModGhpcy5fcmFuZ2UoTWF0aC5yb3VuZChkb21haW5ZWzBdKSwgTWF0aC5yb3VuZChkb21haW5ZWzFdKSwgMSkpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX3lBeGlzQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl95QXhpc0FGKTtcbiAgICB9XG5cbiAgICB0aGlzLl95QXhpc0FGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHNlbGYud3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy55QXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgY29udGFpbmVyLmNhbGwoc2VsZi5heGlzZXMueSk7XG5cbiAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCd0ZXh0JykuYXR0cigneScsIHNlbGYub3B0aW9ucy5yb3dIZWlnaHQgLyAyKTtcblxuICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ2xpbmUnKS5zdHlsZSgnZGlzcGxheScsIGZ1bmN0aW9uKGQsaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpID8gJycgOiAnbm9uZSc7XG4gICAgICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm1Gcm9tRGF0YSA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgdGhpcy5zY2FsZXMueCh0aGlzLmdldERhdGFTdGFydChkKSkgKyAnLCcgKyB0aGlzLnNjYWxlcy55KGQucm93SW5kZXgpICsgJyknO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RGF0YVN0YXJ0ID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiArZC5zdGFydDtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmdldERhdGFFbmQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICtkLmVuZDtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRyYXdFbGVtZW50cyA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5fZWxlbWVudHNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2VsZW1lbnRzQUYpXG4gICAgfVxuXG4gICAgdmFyIGVuYWJsZVlUcmFuc2l0aW9uID0gdGhpcy5vcHRpb25zLmVuYWJsZVlUcmFuc2l0aW9uO1xuXG4gICAgdGhpcy5fZWxlbWVudHNBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBkb21haW5YID0gc2VsZi5zY2FsZXMueC5kb21haW4oKTtcbiAgICAgICAgdmFyIGRvbWFpblhTdGFydCA9IGRvbWFpblhbMF07XG4gICAgICAgIHZhciBkb21haW5YRW5kID0gZG9tYWluWFtkb21haW5YLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIHZhciBkb21haW5ZID0gc2VsZi5zY2FsZXMueS5kb21haW4oKTtcbiAgICAgICAgdmFyIGRvbWFpbllTdGFydCA9IGRvbWFpbllbMF07XG4gICAgICAgIHZhciBkb21haW5ZRW5kID0gZG9tYWluWVtkb21haW5ZLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIHZhciBjdWxsaW5nRGlzdGFuY2UgPSBzZWxmLm9wdGlvbnMuY3VsbGluZ0Rpc3RhbmNlO1xuICAgICAgICB2YXIgY3VsbGluZ1ggPSBzZWxmLm9wdGlvbnMuY3VsbGluZ1g7XG4gICAgICAgIHZhciBjdWxsaW5nWSA9IHNlbGYub3B0aW9ucy5jdWxsaW5nWTtcblxuXG4gICAgICAgIHZhciBzdGFydFRyYW5zZm9ybU1hcCA9IHt9O1xuICAgICAgICB2YXIgZW5kVHJhbnNmb3JtTWFwID0ge307XG5cbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy51c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm0gJiYgdHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgaWYgKHNlbGYucHJldmlvdXNGbGF0dGVuZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wcmV2aW91c0ZsYXR0ZW5lZERhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RhcnRUcmFuc2Zvcm1NYXBbZC51aWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRyYW5zZm9ybU1hcFtkLmlkXSA9IHN0YXJ0VHJhbnNmb3JtTWFwW2QudWlkXSA9IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWxmLmZsYXR0ZW5lZERhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZsYXR0ZW5lZERhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZW5kVHJhbnNmb3JtTWFwW2QudWlkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVHJhbnNmb3JtTWFwW2QuaWRdID0gZW5kVHJhbnNmb3JtTWFwW2QudWlkXSA9IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhID0gc2VsZi5mbGF0dGVuZWREYXRhLmZpbHRlcihmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gZC5fZGVmYXVsdFByZXZlbnRlZCB8fCAoIWN1bGxpbmdZIHx8IChkLnJvd0luZGV4ID49IGRvbWFpbllTdGFydCAtIGN1bGxpbmdEaXN0YW5jZSAmJiBkLnJvd0luZGV4IDwgZG9tYWluWUVuZCArIGN1bGxpbmdEaXN0YW5jZSAtIDEpKVxuICAgICAgICAgICAgICAgICYmICghY3VsbGluZ1ggfHwgIShzZWxmLmdldERhdGFFbmQoZCkgPCBkb21haW5YU3RhcnQgfHwgc2VsZi5nZXREYXRhU3RhcnQoZCkgPiBkb21haW5YRW5kKSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgdmFyIGcgPSBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLnNlbGVjdEFsbCgnZy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAuZGF0YShkYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQudWlkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGV4aXRpbmcgPSBnLmV4aXQoKTtcblxuICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmVuYWJsZVRyYW5zaXRpb25PbkV4aXQgJiYgdHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgZXhpdGluZ1xuICAgICAgICAgICAgICAgIC5jYWxsKHNlbGYuZWxlbWVudEV4aXQuYmluZChzZWxmKSk7XG5cbiAgICAgICAgICAgIGV4aXRpbmcuZWFjaChmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZyA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIHZhciBleGl0VHJhbnNmb3JtID0gZW5kVHJhbnNmb3JtTWFwW2QudWlkXSB8fCBlbmRUcmFuc2Zvcm1NYXBbZC5pZF07XG5cbiAgICAgICAgICAgICAgICBpZiAoZXhpdFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKGcsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBleGl0VHJhbnNmb3JtKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGcucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4aXRpbmdcbiAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBnLmVudGVyKCkuYXBwZW5kKCdnJylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKVxuICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNhbGwoc2VsZi5lbGVtZW50RW50ZXIuYmluZChzZWxmKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBnLmVhY2goZnVuY3Rpb24oZCkge1xuXG4gICAgICAgICAgICB2YXIgZyA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgaWYgKGQuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudFVwZGF0ZShnLCBkLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaGFzUHJldmlvdXNUcmFuc2Zvcm0gPSBnLmF0dHIoJ3RyYW5zZm9ybScpICE9PSBudWxsO1xuXG4gICAgICAgICAgICB2YXIgbmV3VHJhbnNmb3JtID0gZW5kVHJhbnNmb3JtTWFwW2QudWlkXSB8fCBlbmRUcmFuc2Zvcm1NYXBbZC5pZF0gfHwgc2VsZi5nZXRUcmFuc2Zvcm1Gcm9tRGF0YShkKTtcblxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgb3JpZ2luVHJhbnNmb3JtID0gc3RhcnRUcmFuc2Zvcm1NYXBbZC51aWRdIHx8IHN0YXJ0VHJhbnNmb3JtTWFwW2QuaWRdIHx8IG5ld1RyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICB2YXIgbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNQcmV2aW91c1RyYW5zZm9ybSAmJiBzZWxmLm9wdGlvbnMudXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5UcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkT3JpZ2luVHJhbnNmb3JtID0gb3JpZ2luVHJhbnNmb3JtO1xuICAgICAgICAgICAgICAgICAgICAgICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCBvcmlnaW5UcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi53cmFwV2l0aEFuaW1hdGlvbihnLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyVHdlZW4oXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3JpZ2luVHJhbnNmb3JtID0gbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm0gfHwgZy5hdHRyKCd0cmFuc2Zvcm0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbmFibGVZVHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5pbnRlcnBvbGF0ZVRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm0sIG5ld1RyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGFydFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbmRUcmFuc2Zvcm0gPSBkMy50cmFuc2Zvcm0obmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRyYW5zZm9ybS50cmFuc2xhdGVbMV0gPSBlbmRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5pbnRlcnBvbGF0ZVRyYW5zZm9ybShzdGFydFRyYW5zZm9ybS50b1N0cmluZygpLCBlbmRUcmFuc2Zvcm0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ1xuICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgbmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5lbGVtZW50VXBkYXRlKGcsIGQsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IFswLjAsIDAuMF07XG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG5cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUubW92ZUVsZW1lbnRzID0gZnVuY3Rpb24oZm9yY2VEcmF3LCBza2lwWEF4aXMsIGZvcmNlVGlja3MpIHtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLnJlbmRlck9uSWRsZSB8fCBmb3JjZURyYXcpIHtcbiAgICAgICAgdGhpcy5kcmF3RWxlbWVudHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRyYW5zbGF0ZUVsZW1lbnRzKHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCksIHRoaXMuX2xhc3RUcmFuc2xhdGUpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd1lBeGlzKHVuZGVmaW5lZCwgIWZvcmNlVGlja3MpO1xuXG4gICAgaWYgKCFza2lwWEF4aXMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVYQXhpc0ludGVydmFsKCk7XG4gICAgICAgIHRoaXMuZHJhd1hBeGlzKHVuZGVmaW5lZCwgIWZvcmNlVGlja3MpO1xuICAgIH1cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnRyYW5zbGF0ZUVsZW1lbnRzID0gZnVuY3Rpb24odHJhbnNsYXRlLCBwcmV2aW91c1RyYW5zbGF0ZSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHR4ID0gdHJhbnNsYXRlWzBdIC0gcHJldmlvdXNUcmFuc2xhdGVbMF07XG4gICAgdmFyIHR5ID0gdHJhbnNsYXRlWzFdIC0gcHJldmlvdXNUcmFuc2xhdGVbMV07XG5cbiAgICB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdID0gdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVswXSArIHR4O1xuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV0gPSB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdICsgdHk7XG5cblxuICAgIGlmICh0aGlzLl9lbHRzVHJhbnNsYXRlQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9lbHRzVHJhbnNsYXRlQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX2VsdHNUcmFuc2xhdGVBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cih7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoJyArIHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgKyAnKSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHNlbGYuZWxlbWVudHNUcmFuc2xhdGUgIT09IHNlbGYubm9vcCkge1xuICAgICAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoJy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRzVHJhbnNsYXRlKGQzLnNlbGVjdCh0aGlzKSwgZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVYQXhpc0ludGVydmFsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmNvbHVtbldpZHRoID0gdGhpcy5zY2FsZXMueCgxKSAtIHRoaXMuc2NhbGVzLngoMCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVkgPSBmdW5jdGlvbiAodHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXI7XG4gICAgdmFyIGNsaXAgPSB0aGlzLmVsZW1lbnRzLmNsaXAuc2VsZWN0KCdyZWN0Jyk7XG4gICAgdmFyIGJvdW5kaW5nUmVjdCA9IHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcpO1xuXG4gICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgICAgICBjb250YWluZXIgPSBjb250YWluZXIudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGNsaXAgPSBjbGlwLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBib3VuZGluZ1JlY3QgPSBib3VuZGluZ1JlY3QudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfVxuXG4gICAgdmFyIGVsZW1lbnRBbW91bnQgPSB0aGlzLmRhdGEubGVuZ3RoO1xuXG4gICAgLy8gaGF2ZSAxIG1vcmUgZWxlbW50IHRvIGZvcmNlIHJlcHJlc2VudGluZyBvbmUgbW9yZSB0aWNrXG4gICAgdmFyIGVsZW1lbnRzUmFuZ2UgPSBbMCwgZWxlbWVudEFtb3VudF07XG5cbiAgICAvLyBjb21wdXRlIG5ldyBoZWlnaHRcbiAgICB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ID0gTWF0aC5taW4odGhpcy5kYXRhLmxlbmd0aCAqIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQsIHRoaXMuX21heEJvZHlIZWlnaHQpO1xuXG4gICAgLy8gY29tcHV0ZSBuZXcgWSBzY2FsZVxuICAgIHRoaXMuX3lTY2FsZSA9IHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgLyB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICogZWxlbWVudEFtb3VudDtcblxuICAgIC8vIHVwZGF0ZSBZIHNjYWxlLCBheGlzIGFuZCB6b29tIGJlaGF2aW9yXG4gICAgdGhpcy5zY2FsZXMueS5kb21haW4oZWxlbWVudHNSYW5nZSkucmFuZ2UoWzAsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHRdKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnkodGhpcy5zY2FsZXMueSkudHJhbnNsYXRlKHRoaXMuX2xhc3RUcmFuc2xhdGUpLnNjYWxlKHRoaXMuX3lTY2FsZSk7XG5cbiAgICAvLyBhbmQgdXBkYXRlIFggYXhpcyB0aWNrcyBoZWlnaHRcbiAgICB0aGlzLmF4aXNlcy54LmlubmVyVGlja1NpemUoLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgLy8gdXBkYXRlIHN2ZyBoZWlnaHRcbiAgICBjb250YWluZXIuYXR0cignaGVpZ2h0Jyx0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICsgdGhpcy5tYXJnaW4udG9wICsgdGhpcy5tYXJnaW4uYm90dG9tKTtcblxuICAgIC8vIHVwZGF0ZSBpbm5lciByZWN0IGhlaWdodFxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JykuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgYm91bmRpbmdSZWN0LmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuICAgIGNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JykuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgY2xpcC5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6cmVzaXplJywgdGhpcywgdGhpcy5jb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnN0b3BFbGVtZW50VHJhbnNpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWxlbWVudHMuaW5uZXJDb250YWluZXIuc2VsZWN0QWxsKCdnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JykudHJhbnNpdGlvbigpXG4gICAgICAgIC5zdHlsZSgnb3BhY2l0eScsICcnKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRFbnRlciA9IGZ1bmN0aW9uKHNlbGVjdGlvbikgeyByZXR1cm4gc2VsZWN0aW9uOyB9O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5lbGVtZW50VXBkYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRFeGl0ID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbkQzVGFibGUucHJvdG90eXBlLndyYXBXaXRoQW5pbWF0aW9uID0gZnVuY3Rpb24oc2VsZWN0aW9uLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICByZXR1cm4gc2VsZWN0aW9uLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pLmVhc2UodGhpcy5vcHRpb25zLnRyYW5zaXRpb25FYXNpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZWxlY3Rpb247XG4gICAgfVxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX2dldHRlciA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtwcm9wXTsgfTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLl9pc1JvdW5kID0gZnVuY3Rpb24odikge1xuICAgIHZhciBuID0gdnwwO1xuICAgIHJldHVybiB2ID4gbiAtIDFlLTMgJiYgdiA8IG4gKyAxZS0zO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX3JhbmdlID0gZnVuY3Rpb24oc3RhcnQsIGVuZCwgaW5jKSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIHdoaWxlIChzdGFydCA8IGVuZCkge1xuICAgICAgICByZXMucHVzaChzdGFydCk7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQgKyBpbmM7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59O1xuXG4vKipcbiAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZnIvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvT2JqZXRzX2dsb2JhdXgvQXJyYXkvZmluZFxuICogQHR5cGUgeyp8RnVuY3Rpb259XG4gKiBAcHJpdmF0ZVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5fZmluZCA9IGZ1bmN0aW9uKGxpc3QsIHByZWRpY2F0ZSkge1xuICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aCA+Pj4gMDtcbiAgICB2YXIgdGhpc0FyZyA9IGxpc3Q7XG4gICAgdmFyIHZhbHVlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IGxpc3RbaV07XG4gICAgICAgIGlmIChwcmVkaWNhdGUuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaSwgbGlzdCkpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5fY2xhbXBUcmFuc2xhdGlvbldpdGhTY2FsZSA9IGZ1bmN0aW9uKHRyYW5zbGF0ZSwgc2NhbGUpIHtcblxuICAgIHNjYWxlID0gc2NhbGUgfHwgWzEsIDFdO1xuXG4gICAgaWYgKCEoc2NhbGUgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgICAgc2NhbGUgPSBbc2NhbGUsIHNjYWxlXTtcbiAgICB9XG5cbiAgICB2YXIgdHggPSB0cmFuc2xhdGVbMF07XG4gICAgdmFyIHR5ID0gdHJhbnNsYXRlWzFdO1xuICAgIHZhciBzeCA9IHNjYWxlWzBdO1xuICAgIHZhciBzeSA9IHNjYWxlWzFdO1xuXG4gICAgaWYgKHN4ID09PSAxKSB7XG4gICAgICAgIHR4ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0eCA9IE1hdGgubWluKE1hdGgubWF4KC10aGlzLmRpbWVuc2lvbnMud2lkdGggKiAoc3gtMSksIHR4KSwgMCk7XG4gICAgfVxuXG4gICAgaWYgKHN5ID09PSAxKSB7XG4gICAgICAgIHR5ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0eSA9IE1hdGgubWluKE1hdGgubWF4KC10aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICogKHN5LTEpLCB0eSksIDApO1xuICAgIH1cblxuICAgIHJldHVybiBbdHgsIHR5XTtcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNUYWJsZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMvZXZlbnRzJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5pbXBvcnQgRDNUYWJsZSBmcm9tICcuL0QzVGFibGUnO1xuXG5mdW5jdGlvbiBEM1RhYmxlTWFya2VyKG9wdGlvbnMpIHtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtEM1RhYmxlfVxuICAgICAqL1xuICAgIHRoaXMudGFibGUgPSBudWxsO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMuZWxlbWVudHMgPSB7XG4gICAgICAgIGxpbmU6IG51bGwsXG4gICAgICAgIGxhYmVsOiBudWxsXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcblxuICAgIHRoaXMudmFsdWUgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RUaW1lVXBkYXRlZCA9IG51bGw7XG59XG5cbmluaGVyaXRzKEQzVGFibGVNYXJrZXIsIEV2ZW50RW1pdHRlcik7XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLkxBWU9VVF9IT1JJWk9OVEFMID0gJ2hvcml6b250YWwnO1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX1ZFUlRJQ0FMID0gJ3ZlcnRpY2FsJztcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZGVmYXVsdHMgPSB7XG4gICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7IHJldHVybiBkOyB9LFxuICAgIG91dGVyVGlja1NpemU6IDEwLFxuICAgIHRpY2tQYWRkaW5nOiAxMCxcbiAgICByb3VuZFBvc2l0aW9uOiBmYWxzZSxcbiAgICBiZW1CbG9ja05hbWU6ICd0YWJsZU1hcmtlcicsXG4gICAgYmVtTW9kaWZpZXI6ICcnLFxuICAgIGxheW91dDogRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX1ZFUlRJQ0FMXG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0QzVGFibGV9IHRhYmxlXG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNldFRhYmxlID0gZnVuY3Rpb24odGFibGUpIHtcblxuICAgIHZhciBwcmV2aW91c1RhYmxlID0gdGhpcy50YWJsZTtcblxuICAgIHRoaXMudGFibGUgPSB0YWJsZSAmJiB0YWJsZSBpbnN0YW5jZW9mIEQzVGFibGUgPyB0YWJsZSA6IG51bGw7XG5cbiAgICBpZiAodGhpcy50YWJsZSkge1xuICAgICAgICBpZiAocHJldmlvdXNUYWJsZSAhPT0gdGhpcy50YWJsZSkge1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzVGFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVuYmluZFRhYmxlKHByZXZpb3VzVGFibGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5iaW5kVGFibGUoKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXRoaXMudGFibGUgJiYgcHJldmlvdXNUYWJsZSkge1xuICAgICAgICB0aGlzLnVuYmluZFRhYmxlKHByZXZpb3VzVGFibGUpO1xuICAgIH1cblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUudmFsdWVDb21wYXJhdG9yID0gZnVuY3Rpb24odGltZUEsIHRpbWVCKSB7XG4gICAgcmV0dXJuICt0aW1lQSAhPT0gK3RpbWVCO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuc2V0VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSwgc2lsZW50KSB7XG5cbiAgICB2YXIgcHJldmlvdXNUaW1lVXBkYXRlZCA9IHRoaXMuX2xhc3RUaW1lVXBkYXRlZDtcblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICAgIGlmICh0aGlzLnZhbHVlQ29tcGFyYXRvcihwcmV2aW91c1RpbWVVcGRhdGVkLCB0aGlzLnZhbHVlKSAmJiB0aGlzLnRhYmxlICYmIHRoaXMuY29udGFpbmVyKSB7XG5cbiAgICAgICAgdGhpcy5fbGFzdFRpbWVVcGRhdGVkID0gdGhpcy52YWx1ZTtcblxuICAgICAgICB0aGlzLmNvbnRhaW5lclxuICAgICAgICAgICAgLmRhdHVtKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghc2lsZW50KSB7XG4gICAgICAgICAgICB0aGlzLm1vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEudmFsdWU7XG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5iaW5kVGFibGUgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy50YWJsZS5jb250YWluZXJcbiAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgIC5kYXR1bSh7XG4gICAgICAgICAgICB2YWx1ZTogdGhpcy52YWx1ZVxuICAgICAgICB9KVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgKHRoaXMub3B0aW9ucy5iZW1Nb2RpZmllciA/ICcgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyB0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXIgOiAnJykgKyAnICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy0tJyArIHRoaXMub3B0aW9ucy5sYXlvdXQpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5saW5lID0gdGhpcy5jb250YWluZXJcbiAgICAgICAgLmFwcGVuZCgnbGluZScpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxpbmUnKVxuICAgICAgICAuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKTtcblxuICAgIHRoaXMuZWxlbWVudHMubGFiZWwgPSB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctbGFiZWwnKTtcblxuICAgIHRoaXMuc2l6ZUxpbmVBbmRMYWJlbCgpO1xuXG4gICAgLy8gb24gdGFibGUgbW92ZSwgbW92ZSB0aGUgbWFya2VyXG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSB0aGlzLm1vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnLCB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lcik7XG5cbiAgICAvLyBvbiB0YWJsZSByZXNpemUsIHJlc2l6ZSB0aGUgbWFya2VyIGFuZCBtb3ZlIGl0XG4gICAgdGhpcy5fdGFibGVSZXNpemVMaXN0ZW5lciA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgICAgICBzZWxmLnJlc2l6ZSh0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBzZWxmLm1vdmUodHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9O1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6cmVzaXplJywgdGhpcy5fdGFibGVSZXNpemVMaXN0ZW5lcik7XG5cbiAgICB0aGlzLmVtaXQoJ21hcmtlcjpib3VuZCcpO1xuXG4gICAgdGhpcy5tb3ZlKCk7XG5cbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNpemVMaW5lQW5kTGFiZWwgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBsYXlvdXQgPSB0aGlzLm9wdGlvbnMubGF5b3V0O1xuXG4gICAgdmFyIGxpbmUgPSB0aGlzLmVsZW1lbnRzLmxpbmU7XG4gICAgdmFyIGxhYmVsID0gdGhpcy5lbGVtZW50cy5sYWJlbDtcblxuICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgIGxpbmUgPSBsaW5lLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBsYWJlbCA9IGxhYmVsLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH1cblxuICAgIHN3aXRjaChsYXlvdXQpIHtcbiAgICAgICAgY2FzZSB0aGlzLkxBWU9VVF9WRVJUSUNBTDpcbiAgICAgICAgICAgIGxpbmVcbiAgICAgICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgIHkxOiAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUsXG4gICAgICAgICAgICAgICAgICAgIHkyOiB0aGlzLnRhYmxlLmRpbWVuc2lvbnMuaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsIC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZS10aGlzLm9wdGlvbnMudGlja1BhZGRpbmcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdGhpcy5MQVlPVVRfSE9SSVpPTlRBTDpcbiAgICAgICAgICAgIGxpbmVcbiAgICAgICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgIHgxOiAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUsXG4gICAgICAgICAgICAgICAgICAgIHgyOiB0aGlzLnRhYmxlLmRpbWVuc2lvbnMud2lkdGhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2R4JywgLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLXRoaXMub3B0aW9ucy50aWNrUGFkZGluZylcbiAgICAgICAgICAgICAgICAuYXR0cignZHknLCA0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUudW5iaW5kVGFibGUgPSBmdW5jdGlvbihwcmV2aW91c1RhYmxlKSB7XG5cbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnLCB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lcik7XG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyKTtcblxuICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZSgpO1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICBwcmV2aW91c1RhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgICAgIHRoaXMuX21vdmVBRiA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuZW1pdCgnbWFya2VyOnVuYm91bmQnLCBwcmV2aW91c1RhYmxlKTtcbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGhpcy50YWJsZS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9tb3ZlQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX21vdmVBRiA9IHRoaXMudGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubW92ZVN5bmMuYmluZCh0aGlzKSk7XG5cbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLm1vdmVTeW5jID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoIXRoaXMudGFibGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbGF5b3V0ID0gdGhpcy5vcHRpb25zLmxheW91dDtcblxuICAgIHRoaXMuY29udGFpbmVyXG4gICAgICAgIC5lYWNoKGZ1bmN0aW9uKGQpIHtcblxuICAgICAgICAgICAgdmFyIHZhbHVlID0gc2VsZi5nZXRWYWx1ZShkKTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc2NhbGUsIHBvc2l0aW9uID0gWzAsIDBdLCBwb3NpdGlvbkluZGV4O1xuXG4gICAgICAgICAgICBzd2l0Y2gobGF5b3V0KSB7XG4gICAgICAgICAgICAgICAgY2FzZSBzZWxmLkxBWU9VVF9WRVJUSUNBTDpcbiAgICAgICAgICAgICAgICAgICAgc2NhbGUgPSBzZWxmLnRhYmxlLnNjYWxlcy54O1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBzZWxmLkxBWU9VVF9IT1JJWk9OVEFMOlxuICAgICAgICAgICAgICAgICAgICBzY2FsZSA9IHNlbGYudGFibGUuc2NhbGVzLnk7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uSW5kZXggPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwb3NpdGlvbltwb3NpdGlvbkluZGV4XSA9IHNjYWxlKHZhbHVlKTtcblxuICAgICAgICAgICAgdmFyIHJhbmdlID0gc2NhbGUucmFuZ2UoKTtcbiAgICAgICAgICAgIHZhciBpc0luUmFuZ2UgPSBwb3NpdGlvbltwb3NpdGlvbkluZGV4XSA+PSByYW5nZVswXSAmJiBwb3NpdGlvbltwb3NpdGlvbkluZGV4XSA8PSByYW5nZVtyYW5nZS5sZW5ndGggLSAxXTtcblxuICAgICAgICAgICAgdmFyIGcgPSBkMy5zZWxlY3QodGhpcyk7XG5cbiAgICAgICAgICAgIGlmIChpc0luUmFuZ2UpIHtcblxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xuXG4gICAgICAgICAgICAgICAgZy5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrKHNlbGYudGFibGUubWFyZ2luLmxlZnQgKyBwb3NpdGlvblswXSA+PiAwKSsnLCcrKHNlbGYudGFibGUubWFyZ2luLnRvcCArIHBvc2l0aW9uWzFdID4+IDApKycpJyk7XG5cbiAgICAgICAgICAgICAgICBnLnNlbGVjdCgnLicgKyBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1sYWJlbCcpXG4gICAgICAgICAgICAgICAgICAgIC50ZXh0KHNlbGYub3B0aW9ucy5mb3JtYXR0ZXIodmFsdWUpKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29udGFpbmVyLnN0eWxlKCdkaXNwbGF5JywgJycpO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29udGFpbmVyLnN0eWxlKCdkaXNwbGF5JywgJ25vbmUnKTtcbn07XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdGhpcy5zaXplTGluZUFuZExhYmVsKHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZU1hcmtlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZU1hcmtlciBmcm9tICcuL0QzVGFibGVNYXJrZXInO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxuLyoqXG4gKlxuICogQGV4dGVuZHMge0QzVGFibGVNYXJrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUYWJsZU1vdXNlVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZU1hcmtlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuX21vdmVBRiA9IG51bGw7XG5cbiAgICB0aGlzLm9uKCdtYXJrZXI6Ym91bmQnLCB0aGlzLmhhbmRsZVRhYmxlQm91bmQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5vbignbWFya2VyOnVuYm91bmQnLCB0aGlzLmhhbmRsZVRhYmxlVW5ib3VuZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IGZhbHNlO1xufVxuXG5pbmhlcml0cyhEM1RhYmxlTW91c2VUcmFja2VyLCBEM1RhYmxlTWFya2VyKTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGVNYXJrZXIucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtTW9kaWZpZXI6ICctLW1vdXNlVHJhY2tlcicsXG4gICAgbGlzdGVuVG9Ub3VjaEV2ZW50czogdHJ1ZVxufSk7XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZVRhYmxlQm91bmQgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyID0gdGhpcy5oYW5kbGVNb3VzZWVudGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lciA9IHRoaXMuaGFuZGxlTW91c2Vtb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIgPSB0aGlzLmhhbmRsZU1vdXNlbGVhdmUuYmluZCh0aGlzKTtcblxuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VlbnRlcicsIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyKTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdXNlbW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VsZWF2ZScsIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubGlzdGVuVG9Ub3VjaEV2ZW50cykge1xuICAgICAgICB0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMgPSB0cnVlO1xuICAgICAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnRvdWNobW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IGZhbHNlO1xuICAgIH1cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZVRhYmxlVW5ib3VuZCA9IGZ1bmN0aW9uKHByZXZpb3VzVGFibGUpIHtcblxuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VlbnRlcicsIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdXNlbW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VsZWF2ZScsIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMpIHtcbiAgICAgICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzp0b3VjaG1vdmUnLCB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyKTtcbiAgICB9XG5cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcbiAgICBzd2l0Y2ggKHRoaXMub3B0aW9ucy5sYXlvdXQpIHtcbiAgICAgICAgY2FzZSAndmVydGljYWwnOlxuICAgICAgICAgICAgcmV0dXJuIGdldFRpbWUoKTtcbiAgICAgICAgY2FzZSAnaG9yaXpvbnRhbCc6XG4gICAgICAgICAgICByZXR1cm4gZ2V0Um93KCk7XG4gICAgfVxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2VlbnRlciA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHRpbWUgPSB0aGlzLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5zaG93KCk7XG4gICAgICAgIHNlbGYuc2V0VmFsdWUodGltZSk7XG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZU1vdXNlbW92ZSA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciB0aW1lID0gdGhpcy5nZXRWYWx1ZUZyb21UYWJsZUV2ZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fbW92ZUFGID0gdGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNldFZhbHVlKHRpbWUpO1xuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVNb3VzZWxlYXZlID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfSk7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZU1vdXNlVHJhY2tlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZU1hcmtlciBmcm9tICcuL0QzVGFibGVNYXJrZXInO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxuLyoqXG4gKlxuICogQGV4dGVuZHMge0QzVGFibGVNYXJrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUYWJsZVZhbHVlVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZU1hcmtlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG59XG5cbmluaGVyaXRzKEQzVGFibGVWYWx1ZVRyYWNrZXIsIEQzVGFibGVNYXJrZXIpO1xuXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1Nb2RpZmllcjogJy0tdmFsdWVUcmFja2VyJ1xufSk7XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlR2V0dGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgIHJldHVybiAwO1xuXG59O1xuXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAgIGQzLnRpbWVyKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuc2V0VmFsdWUoc2VsZi52YWx1ZUdldHRlcigpKTtcblxuICAgICAgICByZXR1cm4gIXNlbGYuZW5hYmxlZDtcblxuICAgIH0pO1xufTtcblxuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZVZhbHVlVHJhY2tlcjtcbiIsIi8qIGdsb2JhbCBjYW5jZWxBbmltYXRpb25GcmFtZSwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IEQzQmxvY2tUYWJsZSBmcm9tICcuL0QzQmxvY2tUYWJsZSc7XG5pbXBvcnQgZDMgZnJvbSAnZDMnO1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGltZWxpbmUob3B0aW9ucykge1xuXG4gICAgRDNCbG9ja1RhYmxlLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPSB0aGlzLm9wdGlvbnMubWluaW11bVRpbWVJbnRlcnZhbDtcbn1cblxuaW5oZXJpdHMoRDNUaW1lbGluZSwgRDNCbG9ja1RhYmxlKTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1CbG9ja05hbWU6ICd0aW1lbGluZScsXG4gICAgYmVtQmxvY2tNb2RpZmllcjogJycsXG4gICAgeEF4aXNUaWNrc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZC5nZXRNaW51dGVzKCkgJSAxNSA/ICcnIDogZDMudGltZS5mb3JtYXQoJyVIOiVNJykoZCk7XG4gICAgfSxcbiAgICB4QXhpc1N0cm9rZVdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkLmdldE1pbnV0ZXMoKSAlMzAgPyAxIDogMjtcbiAgICB9LFxuICAgIG1pbmltdW1Db2x1bW5XaWR0aDogMzAsXG4gICAgbWluaW11bVRpbWVJbnRlcnZhbDogM2U1LFxuICAgIGF2YWlsYWJsZVRpbWVJbnRlcnZhbHM6IFsgNmU0LCAzZTUsIDllNSwgMS44ZTYsIDMuNmU2LCA3LjJlNiwgMS40NGU3LCAyLjg4ZTcsIDQuMzJlNywgOC42NGU3IF1cbn0pO1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS54U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnRpbWUuc2NhbGUoKTtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLnlTY2FsZUZhY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUubGluZWFyKCk7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhU3RhcnQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuc3RhcnQ7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhRW5kID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmVuZDtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLl9jb21wdXRlQ29sdW1uV2lkdGhGcm9tVGltZUludGVydmFsID0gZnVuY3Rpb24odGltZUludGVydmFsKSB7XG4gICAgcmV0dXJuIHRoaXMuc2NhbGVzLngobmV3IERhdGUodGltZUludGVydmFsKSkgLSB0aGlzLnNjYWxlcy54KG5ldyBEYXRlKDApKTtcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLnVwZGF0ZVhBeGlzSW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBtaW5pbXVtVGltZUludGVydmFsID0gdGhpcy5vcHRpb25zLm1pbmltdW1UaW1lSW50ZXJ2YWw7XG4gICAgdmFyIG1pbmltdW1Db2x1bW5XaWR0aCA9IHRoaXMub3B0aW9ucy5taW5pbXVtQ29sdW1uV2lkdGg7XG4gICAgdmFyIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWw7XG4gICAgdmFyIGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMgPSB0aGlzLm9wdGlvbnMuYXZhaWxhYmxlVGltZUludGVydmFscztcbiAgICB2YXIgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4ID0gYXZhaWxhYmxlVGltZUludGVydmFscy5pbmRleE9mKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuICAgIHZhciBjdXJyZW50Q29sdW1uV2lkdGggPSB0aGlzLl9jb21wdXRlQ29sdW1uV2lkdGhGcm9tVGltZUludGVydmFsKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlVGltZUludGVydmFsKGRlbHRhKSB7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCArPSBkZWx0YTtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbCA9IGF2YWlsYWJsZVRpbWVJbnRlcnZhbHNbY3VycmVudFRpbWVJbnRlcnZhbEluZGV4XTtcbiAgICAgICAgY3VycmVudENvbHVtbldpZHRoID0gc2VsZi5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbChjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB9XG5cbiAgICBpZiAoYXZhaWxhYmxlVGltZUludGVydmFscy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChjdXJyZW50Q29sdW1uV2lkdGggPCBtaW5pbXVtQ29sdW1uV2lkdGgpIHtcbiAgICAgICAgICAgIHdoaWxlKGN1cnJlbnRDb2x1bW5XaWR0aCA8IG1pbmltdW1Db2x1bW5XaWR0aCAmJiBjdXJyZW50VGltZUludGVydmFsSW5kZXggPCBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoKSB7XG4gICAgICAgICAgICB3aGlsZShjdXJyZW50Q29sdW1uV2lkdGggPiBtaW5pbXVtQ29sdW1uV2lkdGggJiYgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbCgtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY3VycmVudFRpbWVJbnRlcnZhbCA8IG1pbmltdW1UaW1lSW50ZXJ2YWwpIHtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbCA9IG1pbmltdW1UaW1lSW50ZXJ2YWw7XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbClcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBNYXRoLmZsb29yKGN1cnJlbnRUaW1lSW50ZXJ2YWwpO1xuICAgIHRoaXMuY29sdW1uV2lkdGggPSBNYXRoLmZsb29yKGN1cnJlbnRDb2x1bW5XaWR0aCk7XG5cbiAgICBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gMy42ZTYpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiA2ZTQpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiAxZTMpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuc2V0VGltZVJhbmdlID0gZnVuY3Rpb24obWluRGF0ZSwgbWF4RGF0ZSkge1xuICAgIHJldHVybiB0aGlzLnNldFhSYW5nZShtaW5EYXRlLCBtYXhEYXRlKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEQzVGltZWxpbmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGVWYWx1ZVRyYWNrZXIgZnJvbSAnLi9EM1RhYmxlVmFsdWVUcmFja2VyJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbi8qKlxuICpcbiAqIEBleHRlbmRzIHtEM1RhYmxlVmFsdWVUcmFja2VyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGltZWxpbmVUaW1lVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZVZhbHVlVHJhY2tlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xufVxuXG5pbmhlcml0cyhEM1RpbWVsaW5lVGltZVRyYWNrZXIsIEQzVGFibGVWYWx1ZVRyYWNrZXIpO1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbUJsb2NrTmFtZTogJ3RpbWVsaW5lTWFya2VyJyxcbiAgICBiZW1Nb2RpZmllcjogJy0tdGltZVRyYWNrZXInLFxuICAgIGxheW91dDogJ3ZlcnRpY2FsJ1xufSk7XG5cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudGltZUdldHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpO1xufTtcblxuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS50aW1lQ29tcGFyYXRvciA9IGZ1bmN0aW9uKGEsYikge1xuICAgIHJldHVybiB0aGlzLnZhbHVlQ29tcGFyYXRvcihhLGIpO1xufTtcblxuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS5zZXRUaW1lID0gZnVuY3Rpb24odGltZSkge1xuICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRpbWUpO1xufTtcblxuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS5zZXRUaW1lbGluZSA9IGZ1bmN0aW9uKHRpbWVsaW5lKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0VGFibGUodGltZWxpbmUpO1xufTtcblxuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS52YWx1ZUdldHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRpbWVHZXR0ZXIoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUaW1lbGluZVRpbWVUcmFja2VyO1xuIl19
(1)
});
;