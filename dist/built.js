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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9pbmRleC5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL3NyYy9EM0Jsb2NrVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzNELE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOzs7QUNSakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBLFlBQVksQ0FBQzs7Ozs7Ozs7dUJBRU8sV0FBVzs7Ozt3QkFDVixVQUFVOzs7O3NCQUNaLFFBQVE7Ozs7Ozs7Ozs7QUFPM0IsU0FBUyxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQzNCLHlCQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDL0I7O0FBRUQsMkJBQVMsWUFBWSx1QkFBVSxDQUFDOztBQUVoQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyx5QkFBTyxJQUFJLEVBQUUsRUFBRSxFQUFFLHFCQUFRLFNB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QkFBTyxJQUFJLEVBQUUsRUFBRSxFQUFFLGlDQUFvQixTQUFTLENBQUMsUUFBUSxFQUFFO0FBQ2hHLGdCQUFZLEVBQUUsZ0JBQWdCO0FBQzlCLGdCQUFZLEVBQUUsQ0FBQyxhQUFhLENBQUM7QUFDN0IsVUFBTSxFQUFFLFVBQVU7Q0FDckIsQ0FBQyxDQUFDOztBQUVILHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsWUFBVztBQUNwRCxXQUFPLElBQUksSUFBSSxFQUFFLENBQUM7Q0FDckIsQ0FBQzs7QUFFRixxQkFBcUIsQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBRTtBQUMzRCxXQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3BDLENBQUM7O0FBRUYscUJBQXFCLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLElBQUksRUFBRTtBQUNyRCxXQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDOUIsQ0FBQzs7QUFFRixxQkFBcUIsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVMsUUFBUSxFQUFFO0FBQzdELFdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUNsQyxDQUFDOztBQUVGLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBVztBQUNyRCxXQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztDQUM1QixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcscUJBQXFCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZS5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNCbG9ja1RhYmxlID0gcmVxdWlyZSgnLi9zcmMvRDNCbG9ja1RhYmxlLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RpbWVsaW5lID0gcmVxdWlyZSgnLi9zcmMvRDNUaW1lbGluZS5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZU1hcmtlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVNYXJrZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGFibGVNb3VzZVRyYWNrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlTW91c2VUcmFja2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlVmFsdWVUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZVZhbHVlVHJhY2tlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUaW1lbGluZVRpbWVUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUaW1lbGluZVRpbWVUcmFja2VyLmpzJyk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxudmFyIGlzQXJyYXkgPSBmdW5jdGlvbiBpc0FycmF5KGFycikge1xuXHRpZiAodHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpO1xuXHR9XG5cblx0cmV0dXJuIHRvU3RyLmNhbGwoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnZhciBpc1BsYWluT2JqZWN0ID0gZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcblx0aWYgKCFvYmogfHwgdG9TdHIuY2FsbChvYmopICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBoYXNPd25Db25zdHJ1Y3RvciA9IGhhc093bi5jYWxsKG9iaiwgJ2NvbnN0cnVjdG9yJyk7XG5cdHZhciBoYXNJc1Byb3RvdHlwZU9mID0gb2JqLmNvbnN0cnVjdG9yICYmIG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgJiYgaGFzT3duLmNhbGwob2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ2lzUHJvdG90eXBlT2YnKTtcblx0Ly8gTm90IG93biBjb25zdHJ1Y3RvciBwcm9wZXJ0eSBtdXN0IGJlIE9iamVjdFxuXHRpZiAob2JqLmNvbnN0cnVjdG9yICYmICFoYXNPd25Db25zdHJ1Y3RvciAmJiAhaGFzSXNQcm90b3R5cGVPZikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIE93biBwcm9wZXJ0aWVzIGFyZSBlbnVtZXJhdGVkIGZpcnN0bHksIHNvIHRvIHNwZWVkIHVwLFxuXHQvLyBpZiBsYXN0IG9uZSBpcyBvd24sIHRoZW4gYWxsIHByb3BlcnRpZXMgYXJlIG93bi5cblx0dmFyIGtleTtcblx0Zm9yIChrZXkgaW4gb2JqKSB7LyoqL31cblxuXHRyZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3VuZGVmaW5lZCcgfHwgaGFzT3duLmNhbGwob2JqLCBrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZSxcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMF0sXG5cdFx0aSA9IDEsXG5cdFx0bGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcblx0XHRkZWVwID0gZmFsc2U7XG5cblx0Ly8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuXHRpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Jvb2xlYW4nKSB7XG5cdFx0ZGVlcCA9IHRhcmdldDtcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMV0gfHwge307XG5cdFx0Ly8gc2tpcCB0aGUgYm9vbGVhbiBhbmQgdGhlIHRhcmdldFxuXHRcdGkgPSAyO1xuXHR9IGVsc2UgaWYgKCh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nKSB8fCB0YXJnZXQgPT0gbnVsbCkge1xuXHRcdHRhcmdldCA9IHt9O1xuXHR9XG5cblx0Zm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbaV07XG5cdFx0Ly8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xuXHRcdGlmIChvcHRpb25zICE9IG51bGwpIHtcblx0XHRcdC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3Rcblx0XHRcdGZvciAobmFtZSBpbiBvcHRpb25zKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFtuYW1lXTtcblx0XHRcdFx0Y29weSA9IG9wdGlvbnNbbmFtZV07XG5cblx0XHRcdFx0Ly8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxuXHRcdFx0XHRpZiAodGFyZ2V0ICE9PSBjb3B5KSB7XG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdFx0aWYgKGRlZXAgJiYgY29weSAmJiAoaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBpc0FycmF5KGNvcHkpKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGV4dGVuZChkZWVwLCBjbG9uZSwgY29weSk7XG5cblx0XHRcdFx0XHQvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY29weSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGNvcHk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG5cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlIGZyb20gJy4vRDNUYWJsZSc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqXG4gKiBAZXh0ZW5kcyB7RDNUYWJsZX1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM0Jsb2NrVGFibGUob3B0aW9ucykge1xuICAgIEQzVGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcbn1cblxuaW5oZXJpdHMoRDNCbG9ja1RhYmxlLCBEM1RhYmxlKTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBjbGlwRWxlbWVudDogdHJ1ZSxcbiAgICBjbGlwRWxlbWVudEZpbHRlcjogbnVsbCxcbiAgICByZW5kZXJPbkF1dG9tYXRpY1Njcm9sbElkbGU6IHRydWUsXG4gICAgaGlkZVRpY2tzT25BdXRvbWF0aWNTY3JvbGw6IGZhbHNlLFxuICAgIGF1dG9tYXRpY1Njcm9sbFNwZWVkTXVsdGlwbGllcjogMmUtNCxcbiAgICBhdXRvbWF0aWNTY3JvbGxNYXJnaW5EZWx0YTogMzAsXG4gICAgYXBwZW5kVGV4dDogdHJ1ZSxcbiAgICBhbGlnbkxlZnQ6IHRydWUsXG4gICAgYWxpZ25PblRyYW5zbGF0ZTogdHJ1ZSxcbiAgICBtYXhpbXVtQ2xpY2tEcmFnVGltZTogMTAwLFxuICAgIG1heGltdW1DbGlja0RyYWdEaXN0YW5jZTogMTIsXG4gICAgbWluaW11bURyYWdEaXN0YW5jZTogNVxufSk7XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUGF0aElkID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50Q2xpcFBhdGhfJyArIHRoaXMuaW5zdGFuY2VOdW1iZXIgKyAnXycgKyBkLnVpZDtcbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUmVjdExpbmsgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICcjJyArIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdElkKGQpO1xufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBQYXRoTGluayA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gJ3VybCgjJyArIHRoaXMuZ2VuZXJhdGVDbGlwUGF0aElkKGQpICsgJyknO1xufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBSZWN0SWQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRDbGlwUmVjdF8nICsgdGhpcy5pbnN0YW5jZU51bWJlciArICdfJyArIGQudWlkO1xufTtcblxuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50RW50ZXIgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBlbGVtZW50SGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJvd0hlaWdodCAtIHRoaXMub3B0aW9ucy5yb3dQYWRkaW5nICogMjtcblxuICAgIHZhciByZWN0ID0gc2VsZWN0aW9uXG4gICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50QmFja2dyb3VuZCcpXG4gICAgICAgIC5hdHRyKCdoZWlnaHQnLCBlbGVtZW50SGVpZ2h0KTtcblxuICAgIHZhciBnID0gc2VsZWN0aW9uXG4gICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50Q29udGVudCcpO1xuXG4gICAgZy5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50TW92YWJsZUNvbnRlbnQnKTtcblxuXG4gICAgdmFyIGNsaXBFbGVtZW50ID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsaXBFbGVtZW50KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNsaXBFbGVtZW50RmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjbGlwRWxlbWVudCA9ICEhdGhpcy5vcHRpb25zLmNsaXBFbGVtZW50RmlsdGVyLmNhbGwodGhpcywgc2VsZWN0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsaXBFbGVtZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjbGlwRWxlbWVudCkge1xuXG4gICAgICAgIGdcbiAgICAgICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCB0aGlzLmdlbmVyYXRlQ2xpcFBhdGhMaW5rLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHJlY3RcbiAgICAgICAgICAgIC5wcm9wZXJ0eSgnaWQnLCB0aGlzLmdlbmVyYXRlQ2xpcFJlY3RJZC5iaW5kKHRoaXMpKTtcblxuICAgICAgICBzZWxlY3Rpb24uYXBwZW5kKCdjbGlwUGF0aCcpXG4gICAgICAgICAgICAucHJvcGVydHkoJ2lkJywgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoSWQuYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC5hcHBlbmQoJ3VzZScpXG4gICAgICAgICAgICAuYXR0cigneGxpbms6aHJlZicsIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdExpbmsuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgaWYgKCFkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OmNsaWNrJywgc2VsZWN0aW9uLCBudWxsLCBbZF0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZFRleHQpIHtcbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcudGltZWxpbmUtZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgICAgLmNsYXNzZWQoJ3RpbWVsaW5lLWVudGl0eUxhYmVsJywgdHJ1ZSlcbiAgICAgICAgICAgIC5hdHRyKCdkeScsIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQvMiArIDQpO1xuICAgIH1cblxuICAgIHNlbGVjdGlvbi5jYWxsKHRoaXMuZWxlbWVudENvbnRlbnRFbnRlci5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmluZERyYWdBbmREcm9wT25TZWxlY3Rpb24oc2VsZWN0aW9uKTtcblxufTtcblxuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRzVHJhbnNsYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBkKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZFRleHQgJiYgdGhpcy5vcHRpb25zLmFsaWduTGVmdCAmJiB0aGlzLm9wdGlvbnMuYWxpZ25PblRyYW5zbGF0ZSAmJiAhZC5fZGVmYXVsdFByZXZlbnRlZCkge1xuXG4gICAgICAgIHNlbGVjdGlvblxuICAgICAgICAgICAgLnNlbGVjdCgnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50TW92YWJsZUNvbnRlbnQnKVxuICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgTWF0aC5tYXgoLXNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhU3RhcnQoZCkpLCAyKSArICcsMCknXG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbn07XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudENvbnRlbnRFbnRlciA9IGZ1bmN0aW9uKCkge307XG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudENvbnRlbnRVcGRhdGUgPSBmdW5jdGlvbigpIHt9O1xuXG5cbi8vIEB0b2RvIGNsZWFuIHVwXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmJpbmREcmFnQW5kRHJvcE9uU2VsZWN0aW9uID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGJvZHlOb2RlID0gc2VsZi5lbGVtZW50cy5ib2R5Lm5vZGUoKTtcbiAgICB2YXIgZHJhZ1N0YXJ0ZWQgPSBmYWxzZTtcblxuICAgIC8vIHBvc2l0aW9uc1xuICAgIHZhciBjdXJyZW50VHJhbnNmb3JtID0gbnVsbDtcbiAgICB2YXIgb3JpZ2luVHJhbnNmb3JtU3RyaW5nID0gbnVsbDtcbiAgICB2YXIgZHJhZ1N0YXJ0WCA9IDAsIGRyYWdTdGFydFkgPSAwO1xuICAgIHZhciBlbGVtZW50U3RhcnRYID0gMCwgZWxlbWVudFN0YXJ0WSA9IDA7XG4gICAgdmFyIGRyYWdQb3NpdGlvbjtcbiAgICB2YXIgc3RhcnREcmFnUG9zaXRpb247XG5cbiAgICAvLyBtb3ZlbWVudHNcbiAgICB2YXIgdmVydGljYWxNb3ZlID0gMDtcbiAgICB2YXIgaG9yaXpvbnRhbE1vdmUgPSAwO1xuICAgIHZhciB2ZXJ0aWNhbFNwZWVkID0gMDtcbiAgICB2YXIgaG9yaXpvbnRhbFNwZWVkID0gMDtcbiAgICB2YXIgdGltZXJBY3RpdmUgPSBmYWxzZTtcbiAgICB2YXIgbmVlZFRpbWVyU3RvcCA9IGZhbHNlO1xuICAgIHZhciBzdGFydFRpbWU7XG5cbiAgICAvLyByZXNldCBzdGFydCBwb3NpdGlvbjogdG8gY2FsbCBvbiBkcmFnIHN0YXJ0IG9yIHdoZW4gdGhpbmdzIGFyZSByZWRyYXduXG4gICAgZnVuY3Rpb24gc3RvcmVTdGFydCgpIHtcbiAgICAgICAgY3VycmVudFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm1TdHJpbmcgPSBzZWxlY3Rpb24uYXR0cigndHJhbnNmb3JtJykpO1xuICAgICAgICBlbGVtZW50U3RhcnRYID0gY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMF07XG4gICAgICAgIGVsZW1lbnRTdGFydFkgPSBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXTtcbiAgICAgICAgZHJhZ1N0YXJ0WCA9IGRyYWdQb3NpdGlvblswXTtcbiAgICAgICAgZHJhZ1N0YXJ0WSA9IGRyYWdQb3NpdGlvblsxXTtcbiAgICB9XG5cbiAgICAvLyBoYW5kbGUgbmV3IGRyYWcgcG9zaXRpb24gYW5kIG1vdmUgdGhlIGVsZW1lbnRcbiAgICBmdW5jdGlvbiB1cGRhdGVUcmFuc2Zvcm0oZm9yY2VEcmF3KSB7XG5cbiAgICAgICAgdmFyIGRlbHRhWCA9IGRyYWdQb3NpdGlvblswXSAtIGRyYWdTdGFydFg7XG4gICAgICAgIHZhciBkZWx0YVkgPSBkcmFnUG9zaXRpb25bMV0gLSBkcmFnU3RhcnRZO1xuXG4gICAgICAgIGlmIChmb3JjZURyYXcgfHwgIXNlbGYub3B0aW9ucy5yZW5kZXJPbklkbGUpIHtcbiAgICAgICAgICAgIHN0b3JlU3RhcnQoZHJhZ1Bvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzBdID0gZWxlbWVudFN0YXJ0WCArIGRlbHRhWDtcbiAgICAgICAgY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMV0gPSBlbGVtZW50U3RhcnRZICsgZGVsdGFZO1xuXG4gICAgICAgIHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nLCBjdXJyZW50VHJhbnNmb3JtLnRvU3RyaW5nKCkpO1xuXG4gICAgfVxuXG4gICAgLy8gdGFrZSBtaWNybyBzZWNvbmRzIGlmIHBvc3NpYmxlXG4gICAgdmFyIGdldFByZWNpc2VUaW1lID0gd2luZG93LnBlcmZvcm1hbmNlICYmIHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICBwZXJmb3JtYW5jZS5ub3cuYmluZChwZXJmb3JtYW5jZSlcbiAgICAgICAgOiB0eXBlb2YgRGF0ZS5ub3cgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgRGF0ZS5ub3cuYmluZChEYXRlKVxuICAgICAgICAgICAgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKyhuZXcgRGF0ZSgpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAvLyBoYW5kbGUgYXV0b21hdGljIHNjcm9sbCBhcmd1bWVudHNcbiAgICBmdW5jdGlvbiBkb0F1dG9tYXRpY1Njcm9sbCh0aW1lRGVsdGEsIGZvcmNlRHJhdykge1xuXG4gICAgICAgIC8vIGNvbXB1dGUgZGVsdGFzIGJhc2VkIG9uIGRpcmVjdGlvbiwgc3BlZWQgYW5kIHRpbWUgZGVsdGFcbiAgICAgICAgdmFyIHNwZWVkTXVsdGlwbGllciA9IHNlbGYub3B0aW9ucy5hdXRvbWF0aWNTY3JvbGxTcGVlZE11bHRpcGxpZXI7XG4gICAgICAgIHZhciBkZWx0YVggPSBob3Jpem9udGFsTW92ZSAqIGhvcml6b250YWxTcGVlZCAqIHRpbWVEZWx0YSAqIHNwZWVkTXVsdGlwbGllcjtcbiAgICAgICAgdmFyIGRlbHRhWSA9IHZlcnRpY2FsTW92ZSAqIHZlcnRpY2FsU3BlZWQgKiB0aW1lRGVsdGEgKiBzcGVlZE11bHRpcGxpZXI7XG5cbiAgICAgICAgLy8gdGFrZSBncm91cCB0cmFuc2xhdGUgY2FuY2VsbGF0aW9uIHdpdGggZm9yY2VkIHJlZHJhdyBpbnRvIGFjY291bnQsIHNvIHJlZGVmaW5lIHN0YXJ0XG4gICAgICAgIGlmIChmb3JjZURyYXcpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUuc2xpY2UoMCk7XG4gICAgICAgICAgICBlbGVtZW50U3RhcnRYICs9IGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdO1xuICAgICAgICAgICAgZWxlbWVudFN0YXJ0WSArPSBjdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVsxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZWFsTW92ZSA9IHNlbGYubW92ZShkZWx0YVgsIGRlbHRhWSwgZm9yY2VEcmF3LCBmYWxzZSwgIXNlbGYub3B0aW9ucy5oaWRlVGlja3NPbkF1dG9tYXRpY1Njcm9sbCk7XG5cbiAgICAgICAgaWYgKHJlYWxNb3ZlWzJdIHx8IHJlYWxNb3ZlWzNdKSB7XG4gICAgICAgICAgICB1cGRhdGVUcmFuc2Zvcm0oZm9yY2VEcmF3KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnRTdGFydFggLT0gcmVhbE1vdmVbMl07XG4gICAgICAgIGVsZW1lbnRTdGFydFkgLT0gcmVhbE1vdmVbM107XG5cbiAgICAgICAgbmVlZFRpbWVyU3RvcCA9IHJlYWxNb3ZlWzJdID09PSAwICYmIHJlYWxNb3ZlWzNdID09PSAwO1xuICAgIH1cblxuXG4gICAgdmFyIGRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgICAgLm9uKCdkcmFnc3RhcnQnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCkge1xuICAgICAgICAgICAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdGFydERyYWdQb3NpdGlvbiA9IGRyYWdQb3NpdGlvbiA9IGQzLm1vdXNlKGJvZHlOb2RlKTtcblxuICAgICAgICAgICAgc3RhcnRUaW1lID0gK25ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHN0b3JlU3RhcnQoKTtcblxuICAgICAgICAgICAgZGF0YS5fZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLl9mcm96ZW5VaWRzLnB1c2goZGF0YS51aWQpO1xuXG4gICAgICAgIH0pXG4gICAgICAgIC5vbignZHJhZycsIGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgZHJhZ1Bvc2l0aW9uID0gZDMubW91c2UoYm9keU5vZGUpO1xuXG4gICAgICAgICAgICBpZiAoIWRyYWdTdGFydGVkKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGltZURlbHRhID0gK25ldyBEYXRlKCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsRGVsdGFYID0gZHJhZ1Bvc2l0aW9uWzBdIC0gc3RhcnREcmFnUG9zaXRpb25bMF07XG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsRGVsdGFZID0gZHJhZ1Bvc2l0aW9uWzFdIC0gc3RhcnREcmFnUG9zaXRpb25bMV07XG4gICAgICAgICAgICAgICAgdmFyIGRyYWdEaXN0YW5jZSA9IE1hdGguc3FydCh0b3RhbERlbHRhWCp0b3RhbERlbHRhWCt0b3RhbERlbHRhWSp0b3RhbERlbHRhWSk7XG5cbiAgICAgICAgICAgICAgICBkcmFnU3RhcnRlZCA9ICh0aW1lRGVsdGEgPiBzZWxmLm9wdGlvbnMubWF4aW11bUNsaWNrRHJhZ1RpbWUgfHwgZHJhZ0Rpc3RhbmNlID4gc2VsZi5vcHRpb25zLm1heGltdW1DbGlja0RyYWdEaXN0YW5jZSkgJiYgZHJhZ0Rpc3RhbmNlID4gc2VsZi5vcHRpb25zLm1pbmltdW1EcmFnRGlzdGFuY2U7XG5cbiAgICAgICAgICAgICAgICBpZiAoZHJhZ1N0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnc3RhcnQnLCBzZWxlY3Rpb24sIG51bGwsIFtkYXRhXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZHJhZ1N0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OmRyYWcnLCBzZWxlY3Rpb24sIG51bGwsIFtkYXRhXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBtYXJnaW5EZWx0YSA9IHNlbGYub3B0aW9ucy5hdXRvbWF0aWNTY3JvbGxNYXJnaW5EZWx0YTtcbiAgICAgICAgICAgIHZhciBkUmlnaHQgPSBtYXJnaW5EZWx0YSAtIChzZWxmLmRpbWVuc2lvbnMud2lkdGggLSBkcmFnUG9zaXRpb25bMF0pO1xuICAgICAgICAgICAgdmFyIGRMZWZ0ID0gbWFyZ2luRGVsdGEgLSBkcmFnUG9zaXRpb25bMF07XG4gICAgICAgICAgICB2YXIgZEJvdHRvbSA9IG1hcmdpbkRlbHRhIC0gKHNlbGYuZGltZW5zaW9ucy5oZWlnaHQgLSBkcmFnUG9zaXRpb25bMV0pO1xuICAgICAgICAgICAgdmFyIGRUb3AgPSBtYXJnaW5EZWx0YSAtIGRyYWdQb3NpdGlvblsxXTtcblxuICAgICAgICAgICAgaG9yaXpvbnRhbFNwZWVkID0gTWF0aC5wb3coTWF0aC5tYXgoZFJpZ2h0LCBkTGVmdCwgbWFyZ2luRGVsdGEpLCAyKTtcbiAgICAgICAgICAgIHZlcnRpY2FsU3BlZWQgPSBNYXRoLnBvdyhNYXRoLm1heChkQm90dG9tLCBkVG9wLCBtYXJnaW5EZWx0YSksIDIpO1xuXG4gICAgICAgICAgICB2YXIgcHJldmlvdXNIb3Jpem9udGFsTW92ZSA9IGhvcml6b250YWxNb3ZlO1xuICAgICAgICAgICAgdmFyIHByZXZpb3VzVmVydGljYWxNb3ZlID0gdmVydGljYWxNb3ZlO1xuICAgICAgICAgICAgaG9yaXpvbnRhbE1vdmUgPSBkUmlnaHQgPiAwID8gLTEgOiBkTGVmdCA+IDAgPyAxIDogMDtcbiAgICAgICAgICAgIHZlcnRpY2FsTW92ZSA9IGRCb3R0b20gPiAwID8gLTEgOiBkVG9wID4gMCA/IDEgOiAwO1xuXG4gICAgICAgICAgICB2YXIgaGFzQ2hhbmdlZFN0YXRlID0gcHJldmlvdXNIb3Jpem9udGFsTW92ZSAhPT0gaG9yaXpvbnRhbE1vdmUgfHwgcHJldmlvdXNWZXJ0aWNhbE1vdmUgIT09IHZlcnRpY2FsTW92ZTtcblxuICAgICAgICAgICAgaWYgKChob3Jpem9udGFsTW92ZSB8fCB2ZXJ0aWNhbE1vdmUpICYmICF0aW1lckFjdGl2ZSAmJiBoYXNDaGFuZ2VkU3RhdGUpIHtcblxuICAgICAgICAgICAgICAgIHZhciB0aW1lclN0YXJ0VGltZSA9IGdldFByZWNpc2VUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICB0aW1lckFjdGl2ZSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBkMy50aW1lcihmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFRpbWUgPSBnZXRQcmVjaXNlVGltZSgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZURlbHRhID0gY3VycmVudFRpbWUgLSB0aW1lclN0YXJ0VGltZTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZXJXaWxsU3RvcCA9ICF2ZXJ0aWNhbE1vdmUgJiYgIWhvcml6b250YWxNb3ZlIHx8IG5lZWRUaW1lclN0b3A7XG5cbiAgICAgICAgICAgICAgICAgICAgZG9BdXRvbWF0aWNTY3JvbGwodGltZURlbHRhLCBzZWxmLm9wdGlvbnMucmVuZGVyT25BdXRvbWF0aWNTY3JvbGxJZGxlICYmIHRpbWVyV2lsbFN0b3ApO1xuXG4gICAgICAgICAgICAgICAgICAgIHRpbWVyU3RhcnRUaW1lID0gY3VycmVudFRpbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVyV2lsbFN0b3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lZWRUaW1lclN0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVyQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXJXaWxsU3RvcDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNlbGYuX2RyYWdBRikge1xuICAgICAgICAgICAgICAgIHNlbGYuY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2VsZi5fZHJhZ0FGKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5fZHJhZ0FGID0gc2VsZi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlVHJhbnNmb3JtKTtcblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2RyYWdlbmQnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIHNlbGYuY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2VsZi5fZHJhZ0FGKTtcbiAgICAgICAgICAgIHNlbGYuX2RyYWdBRiA9IG51bGw7XG4gICAgICAgICAgICBob3Jpem9udGFsTW92ZSA9IDA7XG4gICAgICAgICAgICB2ZXJ0aWNhbE1vdmUgPSAwO1xuXG4gICAgICAgICAgICBkYXRhLl9kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgICAgICAgICBzZWxmLl9mcm96ZW5VaWRzLnNwbGljZShzZWxmLl9mcm96ZW5VaWRzLmluZGV4T2YoZGF0YS51aWQpLCAxKTtcblxuICAgICAgICAgICAgZDMudGltZXIuZmx1c2goKTtcblxuICAgICAgICAgICAgdmFyIGRlbHRhRnJvbVRvcExlZnRDb3JuZXIgPSBkMy5tb3VzZShzZWxlY3Rpb24ubm9kZSgpKTtcbiAgICAgICAgICAgIHZhciBoYWxmSGVpZ2h0ID0gc2VsZi5vcHRpb25zLnJvd0hlaWdodCAvIDI7XG4gICAgICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLmF0dHIoJ3RyYW5zZm9ybScsIG51bGwpO1xuXG4gICAgICAgICAgICBpZiAoZHJhZ1N0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OmRyYWdlbmQnLCBzZWxlY3Rpb24sIFstZGVsdGFGcm9tVG9wTGVmdENvcm5lclswXSwgLWRlbHRhRnJvbVRvcExlZnRDb3JuZXJbMV0gKyBoYWxmSGVpZ2h0XSwgW2RhdGFdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uLmF0dHIoJ3RyYW5zZm9ybScsIG9yaWdpblRyYW5zZm9ybVN0cmluZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGZcbiAgICAgICAgICAgICAgICAudXBkYXRlWSgpXG4gICAgICAgICAgICAgICAgLmRyYXdZQXhpcygpO1xuXG4gICAgICAgICAgICBkcmFnU3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgIHNlbGVjdGlvbi5jYWxsKGRyYWcpO1xuXG59O1xuXG5cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudFVwZGF0ZSA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZCwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLndyYXBXaXRoQW5pbWF0aW9uKHNlbGVjdGlvbi5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudEJhY2tncm91bmQnKSwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICB5OiB0aGlzLm9wdGlvbnMucm93UGFkZGluZyxcbiAgICAgICAgICAgIHdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhRW5kKGQpKSAtIHNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhU3RhcnQoZCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRUZXh0ICYmIHRoaXMub3B0aW9ucy5hbGlnbkxlZnQgJiYgIWQuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBkID0+ICd0cmFuc2xhdGUoJyArIE1hdGgubWF4KC10aGlzLnNjYWxlcy54KHRoaXMuZ2V0RGF0YVN0YXJ0KGQpKSwgMikgKyAnLDApJyk7XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudENvbnRlbnRVcGRhdGUoc2VsZWN0aW9uLCBkLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH0pO1xuXG59O1xuXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRFeGl0ID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7XG5cbiAgICBzZWxlY3Rpb24ub24oJ2NsaWNrJywgbnVsbCk7XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEQzQmxvY2tUYWJsZTtcbiIsIi8qIGdsb2JhbCBjYW5jZWxBbmltYXRpb25GcmFtZSwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMvZXZlbnRzJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEM1RhYmxlUm93XG4gKiBAcHJvcGVydHkge1N0cmluZ3xOdW1iZXJ9IGlkXG4gKiBAcHJvcGVydHkge1N0cmluZ30gbmFtZVxuICogQHByb3BlcnR5IHtBcnJheTxEM1RhYmxlRWxlbWVudD59IGVsZW1lbnRzXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBEM1RhYmxlRWxlbWVudFxuICogQHByb3BlcnR5IHtTdHJpbmd8TnVtYmVyfSBpZFxuICogQHByb3BlcnR5IHtTdHJpbmd8TnVtYmVyfSB1aWRcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBzdGFydFxuICogQHByb3BlcnR5IHtOdW1iZXJ9IGVuZFxuICogQHByb3BlcnR5IHtOdW1iZXJ9IFtyb3dJbmRleF1cbiAqL1xuXG5cbi8qKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RhYmxlKG9wdGlvbnMpIHtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgRDNUYWJsZS5pbnN0YW5jZXNDb3VudCArPSAxO1xuXG4gICAgdGhpcy5pbnN0YW5jZU51bWJlciA9IEQzVGFibGUuaW5zdGFuY2VzQ291bnQ7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQodHJ1ZSwge30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXk8RDNUYWJsZVJvdz59XG4gICAgICovXG4gICAgdGhpcy5kYXRhID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXk8RDNUYWJsZUVsZW1lbnQ+fVxuICAgICAqL1xuICAgIHRoaXMuZmxhdHRlbmVkRGF0YSA9IFtdO1xuXG5cbiAgICB0aGlzLm1hcmdpbiA9IHtcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICByaWdodDogMCxcbiAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICBsZWZ0OiAwXG4gICAgfTtcblxuICAgIHRoaXMuZGltZW5zaW9ucyA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuXG4gICAgdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IFswLjAsIDAuMF07XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG5cbiAgICB0aGlzLmVsZW1lbnRzID0ge1xuICAgICAgICBib2R5OiBudWxsLFxuICAgICAgICBpbm5lckNvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgeEF4aXNDb250YWluZXI6IG51bGwsXG4gICAgICAgIHgyQXhpc0NvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgeUF4aXNDb250YWluZXI6IG51bGwsXG4gICAgICAgIGRlZnM6IG51bGwsXG4gICAgICAgIGNsaXA6IG51bGxcbiAgICB9O1xuXG4gICAgdGhpcy5zY2FsZXMgPSB7XG4gICAgICAgIHg6IG51bGwsXG4gICAgICAgIHk6IG51bGxcbiAgICB9O1xuXG4gICAgdGhpcy5heGlzZXMgPSB7XG4gICAgICAgIHg6IG51bGwsXG4gICAgICAgIHgyOiBudWxsLFxuICAgICAgICB5OiBudWxsXG4gICAgfTtcblxuICAgIHRoaXMuYmVoYXZpb3JzID0ge1xuICAgICAgICB6b29tOiBudWxsLFxuICAgICAgICB6b29tWDogbnVsbCxcbiAgICAgICAgem9vbVk6IG51bGwsXG4gICAgICAgIHBhbjogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSBudWxsO1xuXG4gICAgdGhpcy5feVNjYWxlID0gMC4wO1xuICAgIHRoaXMuX2RhdGFDaGFuZ2VDb3VudCA9IDA7XG4gICAgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID0gMDtcbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGggPSAwO1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQgPSAwO1xuICAgIHRoaXMuX3ByZXZlbnREcmF3aW5nID0gZmFsc2U7XG4gICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMgPSBbXTtcbiAgICB0aGlzLl9tYXhCb2R5SGVpZ2h0ID0gSW5maW5pdHk7XG4gICAgdGhpcy5fZnJvemVuVWlkcyA9IFtdO1xufVxuXG5pbmhlcml0cyhEM1RhYmxlLCBFdmVudEVtaXR0ZXIpO1xuXG5EM1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcbiAgICBiZW1CbG9ja05hbWU6ICd0YWJsZScsXG4gICAgYmVtQmxvY2tNb2RpZmllcjogJycsXG4gICAgeEF4aXNIZWlnaHQ6IDUwLFxuICAgIHlBeGlzV2lkdGg6IDUwLFxuICAgIHJvd0hlaWdodDogMzAsXG4gICAgcm93UGFkZGluZzogNSxcbiAgICBjb250YWluZXI6ICdib2R5JyxcbiAgICBjdWxsaW5nWDogdHJ1ZSxcbiAgICBjdWxsaW5nWTogdHJ1ZSxcbiAgICBjdWxsaW5nRGlzdGFuY2U6IDEsXG4gICAgcmVuZGVyT25JZGxlOiB0cnVlLFxuICAgIGhpZGVUaWNrc09uWm9vbTogZmFsc2UsXG4gICAgaGlkZVRpY2tzT25EcmFnOiBmYWxzZSxcbiAgICBwYW5ZT25XaGVlbDogdHJ1ZSxcbiAgICB3aGVlbE11bHRpcGxpZXI6IDEsXG4gICAgZW5hYmxlWVRyYW5zaXRpb246IHRydWUsXG4gICAgZW5hYmxlVHJhbnNpdGlvbk9uRXhpdDogdHJ1ZSxcbiAgICB1c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm06IGZhbHNlLFxuICAgIHRyYW5zaXRpb25FYXNpbmc6ICdxdWFkLWluLW91dCcsXG4gICAgeEF4aXNUaWNrc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZDtcbiAgICB9LFxuICAgIHhBeGlzU3Ryb2tlV2lkdGg6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQlMiA/IDEgOiAyO1xuICAgIH0sXG4gICAgeEF4aXMyVGlja3NGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH0sXG4gICAgeUF4aXNGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQgJiYgZC5uYW1lIHx8ICcnO1xuICAgIH0sXG4gICAgcGFkZGluZzogMTAsXG4gICAgdHJhY2tlZERPTUV2ZW50czogWydjbGljaycsICdtb3VzZW1vdmUnLCAndG91Y2htb3ZlJywgJ21vdXNlZW50ZXInLCAnbW91c2VsZWF2ZSddIC8vIG5vdCBkeW5hbWljXG59O1xuXG5EM1RhYmxlLmluc3RhbmNlc0NvdW50ID0gMDtcblxuRDNUYWJsZS5wcm90b3R5cGUubm9vcCA9IGZ1bmN0aW9uKCkge307XG5cbkQzVGFibGUucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIGNvbnRhaW5lclxuICAgIHRoaXMuY29udGFpbmVyID0gZDMuc2VsZWN0KHRoaXMub3B0aW9ucy5jb250YWluZXIpLmFwcGVuZCgnc3ZnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICh0aGlzLm9wdGlvbnMuYmVtQmxvY2tNb2RpZmllciA/ICcgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tNb2RpZmllciA6ICcnKSk7XG5cbiAgICAvLyBkZWZzXG4gICAgdGhpcy5lbGVtZW50cy5kZWZzID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdkZWZzJyk7XG5cbiAgICAvLyBjbGlwIHJlY3QgaW4gZGVmc1xuICAgIHZhciBjbGlwSWQgPSB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1ib2R5Q2xpcFBhdGgtLScgKyBEM1RhYmxlLmluc3RhbmNlc0NvdW50O1xuICAgIHRoaXMuZWxlbWVudHMuY2xpcCA9IHRoaXMuZWxlbWVudHMuZGVmcy5hcHBlbmQoJ2NsaXBQYXRoJylcbiAgICAgICAgLnByb3BlcnR5KCdpZCcsIGNsaXBJZCk7XG4gICAgdGhpcy5lbGVtZW50cy5jbGlwXG4gICAgICAgIC5hcHBlbmQoJ3JlY3QnKTtcblxuICAgIC8vIHN1cnJvdW5kaW5nIHJlY3RcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuY2xhc3NlZCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcsIHRydWUpO1xuXG4gICAgLy8gYXhpc2VzIGNvbnRhaW5lcnNcbiAgICB0aGlzLmVsZW1lbnRzLnhBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teCcpO1xuXG4gICAgdGhpcy5lbGVtZW50cy54MkF4aXNDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS14ICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS1zZWNvbmRhcnknKTtcblxuICAgIHRoaXMuZWxlbWVudHMueUF4aXNDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS15Jyk7XG5cbiAgICAvLyBib2R5IGNvbnRhaW5lciBpbm5lciBjb250YWluZXIgYW5kIHN1cnJvdW5kaW5nIHJlY3RcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xpcC1wYXRoJywgJ3VybCgjJyArIGNsaXBJZCArICcpJyk7XG5cbiAgICAvLyBzdXJyb3VuZGluZyByZWN0XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5jbGFzc2VkKHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JywgdHJ1ZSk7XG5cbiAgICAvLyBpbm5lciBjb250YWluZXJcbiAgICB0aGlzLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyID0gdGhpcy5lbGVtZW50cy5ib2R5LmFwcGVuZCgnZycpO1xuXG4gICAgLy8gc3Vycm91bmRpbmcgcmVjdFxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuY2xhc3NlZCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1ib3VuZGluZ1JlY3QnLCB0cnVlKTtcblxuICAgIHRoaXMudXBkYXRlTWFyZ2lucygpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplRDNJbnN0YW5jZXMoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUV2ZW50TGlzdGVuZXJzKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnhTY2FsZUZhY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUubGluZWFyKCk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS55U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuaW5pdGlhbGl6ZUQzSW5zdGFuY2VzID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLnNjYWxlcy54ID0gdGhpcy54U2NhbGVGYWN0b3J5KCk7XG5cbiAgICB0aGlzLnNjYWxlcy55ID0gdGhpcy55U2NhbGVGYWN0b3J5KCk7XG5cbiAgICB0aGlzLmF4aXNlcy54ID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAuc2NhbGUodGhpcy5zY2FsZXMueClcbiAgICAgICAgLm9yaWVudCgndG9wJylcbiAgICAgICAgLnRpY2tGb3JtYXQodGhpcy5vcHRpb25zLnhBeGlzVGlja3NGb3JtYXR0ZXIuYmluZCh0aGlzKSlcbiAgICAgICAgLm91dGVyVGlja1NpemUoMClcbiAgICAgICAgLnRpY2tQYWRkaW5nKDIwKTtcblxuICAgIHRoaXMuYXhpc2VzLngyID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAuc2NhbGUodGhpcy5zY2FsZXMueClcbiAgICAgICAgLm9yaWVudCgndG9wJylcbiAgICAgICAgLnRpY2tGb3JtYXQodGhpcy5vcHRpb25zLnhBeGlzMlRpY2tzRm9ybWF0dGVyLmJpbmQodGhpcykpXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApXG4gICAgICAgIC5pbm5lclRpY2tTaXplKDApO1xuXG4gICAgdGhpcy5heGlzZXMueSA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgLnNjYWxlKHRoaXMuc2NhbGVzLnkpXG4gICAgICAgIC5vcmllbnQoJ2xlZnQnKVxuICAgICAgICAudGlja0Zvcm1hdChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5faXNSb3VuZChkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLm9wdGlvbnMueUF4aXNGb3JtYXR0ZXIoc2VsZi5kYXRhWyhkfDApXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLm91dGVyVGlja1NpemUoMCk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpXG4gICAgICAgIC5zY2FsZUV4dGVudChbMSwgMTBdKVxuICAgICAgICAub24oJ3pvb20nLCB0aGlzLmhhbmRsZVpvb21pbmcuYmluZCh0aGlzKSlcbiAgICAgICAgLm9uKCd6b29tZW5kJywgdGhpcy5oYW5kbGVab29taW5nRW5kLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVggPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAgICAgLngodGhpcy5zY2FsZXMueClcbiAgICAgICAgLnNjYWxlKDEpXG4gICAgICAgIC5zY2FsZUV4dGVudChbMSwgMTBdKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21ZID0gZDMuYmVoYXZpb3Iuem9vbSgpXG4gICAgICAgIC55KHRoaXMuc2NhbGVzLnkpXG4gICAgICAgIC5zY2FsZSgxKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDFdKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnBhbiA9IGQzLmJlaGF2aW9yLmRyYWcoKVxuICAgICAgICAub24oJ2RyYWcnLCB0aGlzLmhhbmRsZURyYWdnaW5nLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmNhbGwodGhpcy5iZWhhdmlvcnMucGFuKTtcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuY2FsbCh0aGlzLmJlaGF2aW9ycy56b29tKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpO1xuICAgIHRoaXMuX2xhc3RTY2FsZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKTtcbn1cblxuRDNUYWJsZS5wcm90b3R5cGUuaW5pdGlhbGl6ZUV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLm9wdGlvbnMudHJhY2tlZERPTUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuICAgICAgICBzZWxmLmVsZW1lbnRzLmJvZHkub24oZXZlbnROYW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChldmVudE5hbWUgIT09ICdjbGljaycgfHwgIWQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYgZDMuc2VsZWN0KGQzLmV2ZW50LnRhcmdldCkuY2xhc3NlZChzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudChldmVudE5hbWUsIHNlbGYuZWxlbWVudHMuYm9keSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5lbWl0RGV0YWlsZWRFdmVudCA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgZDNUYXJnZXRTZWxlY3Rpb24sIGRlbHRhLCBwcmlvcml0eUFyZ3VtZW50cywgZXh0cmFBcmd1bWVudHMpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwb3NpdGlvbjtcblxuICAgIHZhciBnZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXBvc2l0aW9uKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGQzLm1vdXNlKHNlbGYuZWxlbWVudHMuYm9keS5ub2RlKCkpO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGVsdGEpKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25bMF0gKz0gZGVsdGFbMF07XG4gICAgICAgICAgICAgICAgcG9zaXRpb25bMV0gKz0gZGVsdGFbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH07XG5cbiAgICB2YXIgYXJncyA9IFtcbiAgICAgICAgdGhpcywgLy8gdGhlIHRhYmxlIGluc3RhbmNlXG4gICAgICAgIGQzVGFyZ2V0U2VsZWN0aW9uLCAvLyB0aGUgZDMgc2VsZWN0aW9uIHRhcmdldGVkXG4gICAgICAgIGQzLmV2ZW50LCAvLyB0aGUgZDMgZXZlbnRcbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29sdW1uKCkge1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy54LmludmVydChwb3NpdGlvblswXSk7XG4gICAgICAgIH0sIC8vIGEgY29sdW1uIGdldHRlclxuICAgICAgICBmdW5jdGlvbiBnZXRSb3coKSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBnZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLnkuaW52ZXJ0KHBvc2l0aW9uWzFdKTtcbiAgICAgICAgfSAvLyBhIHJvdyBnZXR0ZXJcbiAgICBdO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocHJpb3JpdHlBcmd1bWVudHMpKSB7XG4gICAgICAgIGFyZ3MgPSBwcmlvcml0eUFyZ3VtZW50cy5jb25jYXQoYXJncyk7XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZXh0cmFBcmd1bWVudHMpKSB7XG4gICAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChleHRyYUFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgYXJncy51bnNoaWZ0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOicgKyBldmVudE5hbWUpOyAvLyB0aGUgZXZlbnQgbmFtZVxuXG4gICAgdGhpcy5lbWl0LmFwcGx5KHRoaXMsIGFyZ3MpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlTWFyZ2lucyA9IGZ1bmN0aW9uKHVwZGF0ZURpbWVuc2lvbnMpIHtcblxuICAgIHRoaXMubWFyZ2luID0ge1xuICAgICAgICB0b3A6IHRoaXMub3B0aW9ucy54QXhpc0hlaWdodCArIHRoaXMub3B0aW9ucy5wYWRkaW5nLFxuICAgICAgICByaWdodDogdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIGJvdHRvbTogdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIGxlZnQ6IHRoaXMub3B0aW9ucy55QXhpc1dpZHRoICsgdGhpcy5vcHRpb25zLnBhZGRpbmdcbiAgICB9O1xuXG4gICAgdmFyIGNvbnRlbnRQb3NpdGlvbiA9IHsgeDogdGhpcy5tYXJnaW4ubGVmdCwgeTogdGhpcy5tYXJnaW4udG9wIH07XG4gICAgdmFyIGNvbnRlbnRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyB0aGlzLm1hcmdpbi5sZWZ0ICsgJywnICsgdGhpcy5tYXJnaW4udG9wICsgJyknO1xuXG4gICAgdGhpcy5jb250YWluZXIuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcpXG4gICAgICAgIC5hdHRyKGNvbnRlbnRQb3NpdGlvbik7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHlcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGNvbnRlbnRUcmFuc2Zvcm0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy54QXhpc0NvbnRhaW5lclxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLngyQXhpc0NvbnRhaW5lclxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyB0aGlzLm1hcmdpbi5sZWZ0ICsgJywnICsgdGhpcy5tYXJnaW4udG9wICsgJyknKTtcblxuICAgIGlmICh1cGRhdGVEaW1lbnNpb25zKSB7XG4gICAgICAgIHRoaXMudXBkYXRlWCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVkoKTtcbiAgICB9XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIHJlbW92ZSBiZWhhdmlvciBsaXN0ZW5lcnNcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLm9uKCd6b29tJywgbnVsbCk7XG5cbiAgICAvLyByZW1vdmUgZG9tIGxpc3RlbmVyc1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5vbignLnpvb20nLCBudWxsKTtcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkub24oJ2NsaWNrJywgbnVsbCk7XG5cbiAgICAvLyByZW1vdmUgcmVmZXJlbmNlc1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLmVsZW1lbnRzID0gbnVsbDtcbiAgICB0aGlzLnNjYWxlcyA9IG51bGw7XG4gICAgdGhpcy5heGlzZXMgPSBudWxsO1xuICAgIHRoaXMuYmVoYXZpb3JzID0gbnVsbDtcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xuICAgIHRoaXMuZmxhdHRlbmVkRGF0YSA9IG51bGw7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5yZXN0b3JlWm9vbSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHRoaXMuX2xhc3RUcmFuc2xhdGUpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUodGhpcy5fbGFzdFNjYWxlKTtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihkeCwgZHksIGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKSB7XG5cbiAgICB2YXIgY3VycmVudFRyYW5zbGF0ZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdmFyIHVwZGF0ZWRUID0gW2N1cnJlbnRUcmFuc2xhdGVbMF0gKyBkeCwgY3VycmVudFRyYW5zbGF0ZVsxXSArIGR5XTtcblxuICAgIHVwZGF0ZWRUID0gdGhpcy5fY2xhbXBUcmFuc2xhdGlvbldpdGhTY2FsZSh1cGRhdGVkVCwgW3RoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSwgdGhpcy5iZWhhdmlvcnMuem9vbVkuc2NhbGUoKV0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVguc2NhbGUodGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWS50cmFuc2xhdGUodXBkYXRlZFQpO1xuXG4gICAgdGhpcy5tb3ZlRWxlbWVudHMoZm9yY2VEcmF3LCBza2lwWEF4aXMsIGZvcmNlVGlja3MpO1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IHVwZGF0ZWRUO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnKTtcblxuICAgIHJldHVybiB1cGRhdGVkVC5jb25jYXQoW3VwZGF0ZWRUWzBdIC0gY3VycmVudFRyYW5zbGF0ZVswXSwgdXBkYXRlZFRbMV0gLSBjdXJyZW50VHJhbnNsYXRlWzFdXSk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5lbnN1cmVJbkRvbWFpbnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tb3ZlKDAsIDAsIGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIHBhbiBYL1kgJiB6b29tIFggaGFuZGxlciAoY2xhbXBlZCBwYW4gWSB3aGVuIHdoZWVsIGlzIHByZXNzZWQgd2l0aG91dCBjdHJsLCB6b29tIFggYW5kIHBhbiBYL1kgb3RoZXJ3aXNlKVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVab29taW5nID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQgJiYgIWQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgJiYgIShkMy5ldmVudC5zb3VyY2VFdmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggPj0gMikpIHtcbiAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnR5cGUgPT09ICd3aGVlbCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFuWU9uV2hlZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVab29tKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVXaGVlbGluZygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVzdG9yZVpvb20oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB0ID0gdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKTtcbiAgICB2YXIgdXBkYXRlZFQgPSBbdFswXSwgdGhpcy5fbGFzdFRyYW5zbGF0ZVsxXV07XG5cbiAgICB1cGRhdGVkVCA9IHRoaXMuX2NsYW1wVHJhbnNsYXRpb25XaXRoU2NhbGUodXBkYXRlZFQsIFt0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCksIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnNjYWxlKCldKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG5cbiAgICB0aGlzLm1vdmVFbGVtZW50cyh0cnVlLCBmYWxzZSwgIXRoaXMub3B0aW9ucy5oaWRlVGlja3NPblpvb20pO1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IHVwZGF0ZWRUO1xuICAgIHRoaXMuX2xhc3RTY2FsZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJyk7XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmhhbmRsZVpvb21pbmdFbmQgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG4gICAgdGhpcy5tb3ZlRWxlbWVudHModHJ1ZSk7XG4gICAgdGhpcy5kcmF3WUF4aXMoKTtcbiAgICB0aGlzLmRyYXdYQXhpcygpO1xufTtcblxuLyoqXG4gKiB3aGVlbCBoYW5kbGVyIChjbGFtcGVkIHBhbiBZKVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVXaGVlbGluZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGV2ZW50ID0gZDMuZXZlbnQuc291cmNlRXZlbnQ7XG5cbiAgICB2YXIgZHggPSAwLCBkeSA9IDA7XG5cbiAgICB2YXIgbW92aW5nWCA9IGV2ZW50ICYmIGV2ZW50LndoZWVsRGVsdGFYIHx8IGV2ZW50LmRlbHRhWDtcblxuICAgIGlmIChtb3ZpbmdYKSB7XG5cbiAgICAgICAgdmFyIG1vdmluZ1JpZ2h0ID0gZXZlbnQud2hlZWxEZWx0YVggPiAwIHx8IGV2ZW50LmRlbHRhWCA8IDA7XG4gICAgICAgIGR4ID0gKG1vdmluZ1JpZ2h0ID8gMSA6IC0xKSAqIHRoaXMuY29sdW1uV2lkdGggKiB0aGlzLm9wdGlvbnMud2hlZWxNdWx0aXBsaWVyO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICB2YXIgbW92aW5nWSA9IGV2ZW50LndoZWVsRGVsdGEgfHwgZXZlbnQud2hlZWxEZWx0YVkgfHwgZXZlbnQuZGV0YWlsIHx8IGV2ZW50LmRlbHRhWTtcblxuICAgICAgICBpZiAobW92aW5nWSkge1xuICAgICAgICAgICAgdmFyIG1vdmluZ0Rvd24gPSBldmVudC53aGVlbERlbHRhID4gMCB8fCBldmVudC53aGVlbERlbHRhWSA+IDAgfHwgZXZlbnQuZGV0YWlsIDwgMCB8fCBldmVudC5kZWx0YVkgPCAwO1xuICAgICAgICAgICAgZHkgPSBtb3ZpbmdZID8gKG1vdmluZ0Rvd24gPyAxIDogLTEpICogdGhpcy5vcHRpb25zLnJvd0hlaWdodCAqIHRoaXMub3B0aW9ucy53aGVlbE11bHRpcGxpZXIgOiAwO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICB0aGlzLm1vdmUoZHgsIGR5LCBmYWxzZSwgIW1vdmluZ1gpO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVEcmFnZ2luZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNoYW5nZWRUb3VjaGVzICYmIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvdWNoZXMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubW92ZShkMy5ldmVudC5keCwgZDMuZXZlbnQuZHksIGZhbHNlLCBmYWxzZSwgIXRoaXMub3B0aW9ucy5oaWRlVGlja3NPbkRyYWcpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudG9nZ2xlRHJhd2luZyA9IGZ1bmN0aW9uKGFjdGl2ZSkge1xuXG4gICAgdGhpcy5fcHJldmVudERyYXdpbmcgPSB0eXBlb2YgYWN0aXZlID09PSAnYm9vbGVhbicgPyAhYWN0aXZlIDogIXRoaXMuX3ByZXZlbnREcmF3aW5nO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0FycmF5PEQzVGFibGVSb3c+fSBkYXRhXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2FuaW1hdGVZXVxuICogQHJldHVybnMge0QzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbihkYXRhLCB0cmFuc2l0aW9uRHVyYXRpb24sIGFuaW1hdGVZKSB7XG5cbiAgICB0aGlzLl9kYXRhQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc1NpemVDaGFuZ2luZyA9IGRhdGEubGVuZ3RoICE9PSB0aGlzLmRhdGEubGVuZ3RoO1xuXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcblxuICAgIHRoaXMuZ2VuZXJhdGVGbGF0dGVuZWREYXRhKCk7XG5cbiAgICBpZiAoaXNTaXplQ2hhbmdpbmcgfHwgdGhpcy5fZGF0YUNoYW5nZUNvdW50ID09PSAxKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgICAgIC51cGRhdGVZKGFuaW1hdGVZID8gdHJhbnNpdGlvbkR1cmF0aW9uIDogdW5kZWZpbmVkKVxuICAgICAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgICAgICAuZHJhd1lBeGlzKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3RWxlbWVudHModHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKiBAcmV0dXJucyB7QXJyYXk8RDNUYWJsZVJvdz59XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRGF0YSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHRoaXMuZGF0YS5tYXAoZnVuY3Rpb24oZCkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7RDNUYWJsZVJvd31cbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSB7fTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZCkge1xuICAgICAgICAgICAgaWYgKGQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICdlbGVtZW50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzW2tleV0gPSBkW2tleV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzW2tleV0gPSBkW2tleV0ubWFwKHNlbGYuY2xvbmVFbGVtZW50LmJpbmQoc2VsZikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFRoaXMgY2xvbmUgbWV0aG9kIGRvZXMgbm90IGNsb25lIHRoZSBlbnRpdGllcyBpdHNlbGZcbiAqIEByZXR1cm5zIHtBcnJheTxEM1RhYmxlRWxlbWVudD59XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRmxhdHRlbmVkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmZsYXR0ZW5lZERhdGEubWFwKGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge0QzVGFibGVFbGVtZW50fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBlKSB7XG4gICAgICAgICAgICBpZiAoZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgcmVzW2tleV0gPSBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKiBAcmV0dXJucyB7RDNUYWJsZUVsZW1lbnR9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRWxlbWVudCA9IGZ1bmN0aW9uKGUpIHtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtEM1RhYmxlRWxlbWVudH1cbiAgICAgKi9cbiAgICB2YXIgcmVzID0ge307XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gZSkge1xuICAgICAgICBpZiAoZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICByZXNba2V5XSA9IGVba2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZXRFbGVtZW50Um93ID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiB0aGlzLl9maW5kKHRoaXMuZGF0YSwgZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIHJldHVybiByb3cuZWxlbWVudHMuaW5kZXhPZihkKSAhPT0gLTE7XG4gICAgfSk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5zdG9yZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnByZXZpb3VzRmxhdHRlbmVkRGF0YSA9IHRoaXMuY2xvbmVGbGF0dGVuZWREYXRhKCk7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMudXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtKSB7XG4gICAgICAgIHRoaXMuc3RvcmVGbGF0dGVuZWREYXRhKCk7XG4gICAgfVxuXG4gICAgdGhpcy5mbGF0dGVuZWREYXRhLmxlbmd0aCA9IDA7XG5cbiAgICB0aGlzLmRhdGEuZm9yRWFjaChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIGQuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LnJvd0luZGV4ID0gaTtcbiAgICAgICAgICAgIGlmIChzZWxmLl9mcm96ZW5VaWRzLmluZGV4T2YoZWxlbWVudC51aWQpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuX2RlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5mbGF0dGVuZWREYXRhLnB1c2goZWxlbWVudCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtEYXRlfSBtaW5YXG4gKiBAcGFyYW0ge0RhdGV9IG1heFhcbiAqIEByZXR1cm5zIHtEM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRYUmFuZ2UgPSBmdW5jdGlvbihtaW5YLCBtYXhYKSB7XG5cbiAgICB0aGlzLm1pblggPSBtaW5YO1xuICAgIHRoaXMubWF4WCA9IG1heFg7XG5cbiAgICB0aGlzLnNjYWxlcy54XG4gICAgICAgIC5kb21haW4oW3RoaXMubWluWCwgdGhpcy5tYXhYXSk7XG5cbiAgICB0aGlzXG4gICAgICAgIC51cGRhdGVYKClcbiAgICAgICAgLnVwZGF0ZVhBeGlzSW50ZXJ2YWwoKVxuICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgIC5kcmF3RWxlbWVudHMoKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuc2V0QXZhaWxhYmxlV2lkdGggPSBmdW5jdGlvbihhdmFpbGFibGVXaWR0aCkge1xuXG4gICAgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNBdmFpbGFibGVXaWR0aENoYW5naW5nID0gYXZhaWxhYmxlV2lkdGggIT09IHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aDtcbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGggPSBhdmFpbGFibGVXaWR0aDtcblxuICAgIHRoaXMuZGltZW5zaW9ucy53aWR0aCA9IHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCAtIHRoaXMubWFyZ2luLmxlZnQgLSB0aGlzLm1hcmdpbi5yaWdodDtcblxuICAgIGlmIChpc0F2YWlsYWJsZVdpZHRoQ2hhbmdpbmcgfHwgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID09PSAxKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVYKClcbiAgICAgICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgICAgICAuZHJhd0VsZW1lbnRzKClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnNldEF2YWlsYWJsZUhlaWdodCA9IGZ1bmN0aW9uKGF2YWlsYWJsZUhlaWdodCkge1xuXG4gICAgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNBdmFpbGFibGVIZWlnaHRDaGFuZ2luZyA9IGF2YWlsYWJsZUhlaWdodCAhPT0gdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodDtcbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0ID0gYXZhaWxhYmxlSGVpZ2h0O1xuXG4gICAgdGhpcy5fbWF4Qm9keUhlaWdodCA9IHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQgLSB0aGlzLm1hcmdpbi50b3AgLSB0aGlzLm1hcmdpbi5ib3R0b207XG5cbiAgICBpZiAoaXNBdmFpbGFibGVIZWlnaHRDaGFuZ2luZyB8fCB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPT09IDEpIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAgICAgLnVwZGF0ZVkoKVxuICAgICAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgICAgICAuZHJhd1lBeGlzKClcbiAgICAgICAgICAgIC5kcmF3RWxlbWVudHMoKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlWCA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdGhpcy5jb250YWluZXIuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGggKyB0aGlzLm1hcmdpbi5sZWZ0ICsgdGhpcy5tYXJnaW4ucmlnaHQpO1xuXG4gICAgdGhpcy5zY2FsZXMueFxuICAgICAgICAuZG9tYWluKFt0aGlzLm1pblgsIHRoaXMubWF4WF0pXG4gICAgICAgIC5yYW5nZShbMCwgdGhpcy5kaW1lbnNpb25zLndpZHRoXSk7XG5cbiAgICB0aGlzLmF4aXNlcy55XG4gICAgICAgIC5pbm5lclRpY2tTaXplKC10aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVhcbiAgICAgICAgLngodGhpcy5zY2FsZXMueClcbiAgICAgICAgLnRyYW5zbGF0ZSh0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpKVxuICAgICAgICAuc2NhbGUodGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICB0aGlzLmNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuICAgIHRoaXMuZWxlbWVudHMuY2xpcC5zZWxlY3QoJ3JlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6cmVzaXplJywgdGhpcywgdGhpcy5jb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGYpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLnB1c2goZik7XG5cbiAgICBpZiAodGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBnO1xuICAgICAgICAgICAgd2hpbGUoZyA9IHNlbGYuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLnNoaWZ0KCkpIGcoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGY7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGYpIHtcblxuICAgIHZhciBpbmRleCA9IHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmxlbmd0aCA+IDAgPyB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5pbmRleE9mKGYpIDogLTE7XG5cbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZHJhd1hBeGlzID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uLCBza2lwVGlja3MpIHtcblxuICAgIGlmICh0aGlzLl9wcmV2ZW50RHJhd2luZykge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLmF4aXNlcy55XG4gICAgICAgIC5pbm5lclRpY2tTaXplKHNraXBUaWNrcyA/IDAgOiAtdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLl94QXhpc0FGKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5feEF4aXNBRik7XG4gICAgfVxuXG4gICAgdGhpcy5feEF4aXNBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy54QXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgLmNhbGwoc2VsZi5heGlzZXMueClcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ2xpbmUnKVxuICAgICAgICAgICAgLnN0eWxlKHtcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogc2VsZi5vcHRpb25zLnhBeGlzU3Ryb2tlV2lkdGguYmluZChzZWxmKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi53cmFwV2l0aEFuaW1hdGlvbihzZWxmLmVsZW1lbnRzLngyQXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgLmNhbGwoc2VsZi5heGlzZXMueDIpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCd0ZXh0JylcbiAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICB4OiBzZWxmLmNvbHVtbldpZHRoIC8gMlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdHlsZSh7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gK2QgPT09ICtzZWxmLm1heFggPyAnbm9uZScgOiAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZHJhd1lBeGlzID0gZnVuY3Rpb24gZHJhd1lBeGlzKHRyYW5zaXRpb25EdXJhdGlvbiwgc2tpcFRpY2tzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5heGlzZXMueFxuICAgICAgICAuaW5uZXJUaWNrU2l6ZShza2lwVGlja3MgPyAwIDogLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgdmFyIGRvbWFpblkgPSB0aGlzLnNjYWxlcy55LmRvbWFpbigpO1xuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAudGlja1ZhbHVlcyh0aGlzLl9yYW5nZShNYXRoLnJvdW5kKGRvbWFpbllbMF0pLCBNYXRoLnJvdW5kKGRvbWFpbllbMV0pLCAxKSk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5feUF4aXNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3lBeGlzQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX3lBeGlzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgY29udGFpbmVyID0gc2VsZi53cmFwV2l0aEFuaW1hdGlvbihzZWxmLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBjb250YWluZXIuY2FsbChzZWxmLmF4aXNlcy55KTtcblxuICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ3RleHQnKS5hdHRyKCd5Jywgc2VsZi5vcHRpb25zLnJvd0hlaWdodCAvIDIpO1xuXG4gICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgLnNlbGVjdEFsbCgnbGluZScpLnN0eWxlKCdkaXNwbGF5JywgZnVuY3Rpb24oZCxpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPyAnJyA6ICdub25lJztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmdldFRyYW5zZm9ybUZyb21EYXRhID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyB0aGlzLnNjYWxlcy54KHRoaXMuZ2V0RGF0YVN0YXJ0KGQpKSArICcsJyArIHRoaXMuc2NhbGVzLnkoZC5yb3dJbmRleCkgKyAnKSc7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5nZXREYXRhU3RhcnQgPSBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuICtkLnN0YXJ0O1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RGF0YUVuZCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gK2QuZW5kO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZHJhd0VsZW1lbnRzID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5zdG9wRWxlbWVudFRyYW5zaXRpb24oKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLl9lbGVtZW50c0FGKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fZWxlbWVudHNBRilcbiAgICB9XG5cbiAgICB2YXIgZW5hYmxlWVRyYW5zaXRpb24gPSB0aGlzLm9wdGlvbnMuZW5hYmxlWVRyYW5zaXRpb247XG5cbiAgICB0aGlzLl9lbGVtZW50c0FGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGRvbWFpblggPSBzZWxmLnNjYWxlcy54LmRvbWFpbigpO1xuICAgICAgICB2YXIgZG9tYWluWFN0YXJ0ID0gZG9tYWluWFswXTtcbiAgICAgICAgdmFyIGRvbWFpblhFbmQgPSBkb21haW5YW2RvbWFpblgubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgdmFyIGRvbWFpblkgPSBzZWxmLnNjYWxlcy55LmRvbWFpbigpO1xuICAgICAgICB2YXIgZG9tYWluWVN0YXJ0ID0gZG9tYWluWVswXTtcbiAgICAgICAgdmFyIGRvbWFpbllFbmQgPSBkb21haW5ZW2RvbWFpblkubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgdmFyIGN1bGxpbmdEaXN0YW5jZSA9IHNlbGYub3B0aW9ucy5jdWxsaW5nRGlzdGFuY2U7XG4gICAgICAgIHZhciBjdWxsaW5nWCA9IHNlbGYub3B0aW9ucy5jdWxsaW5nWDtcbiAgICAgICAgdmFyIGN1bGxpbmdZID0gc2VsZi5vcHRpb25zLmN1bGxpbmdZO1xuXG5cbiAgICAgICAgdmFyIHN0YXJ0VHJhbnNmb3JtTWFwID0ge307XG4gICAgICAgIHZhciBlbmRUcmFuc2Zvcm1NYXAgPSB7fTtcblxuICAgICAgICBpZiAoc2VsZi5vcHRpb25zLnVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybSAmJiB0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5wcmV2aW91c0ZsYXR0ZW5lZERhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnByZXZpb3VzRmxhdHRlbmVkRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzdGFydFRyYW5zZm9ybU1hcFtkLnVpZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VHJhbnNmb3JtTWFwW2QuaWRdID0gc3RhcnRUcmFuc2Zvcm1NYXBbZC51aWRdID0gc2VsZi5nZXRUcmFuc2Zvcm1Gcm9tRGF0YShkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlbGYuZmxhdHRlbmVkRGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmxhdHRlbmVkRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbmRUcmFuc2Zvcm1NYXBbZC51aWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRUcmFuc2Zvcm1NYXBbZC5pZF0gPSBlbmRUcmFuc2Zvcm1NYXBbZC51aWRdID0gc2VsZi5nZXRUcmFuc2Zvcm1Gcm9tRGF0YShkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhdGEgPSBzZWxmLmZsYXR0ZW5lZERhdGEuZmlsdGVyKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBkLl9kZWZhdWx0UHJldmVudGVkIHx8ICghY3VsbGluZ1kgfHwgKGQucm93SW5kZXggPj0gZG9tYWluWVN0YXJ0IC0gY3VsbGluZ0Rpc3RhbmNlICYmIGQucm93SW5kZXggPCBkb21haW5ZRW5kICsgY3VsbGluZ0Rpc3RhbmNlIC0gMSkpXG4gICAgICAgICAgICAgICAgJiYgKCFjdWxsaW5nWCB8fCAhKHNlbGYuZ2V0RGF0YUVuZChkKSA8IGRvbWFpblhTdGFydCB8fCBzZWxmLmdldERhdGFTdGFydChkKSA+IGRvbWFpblhFbmQpKTtcbiAgICAgICAgfSk7XG5cblxuICAgICAgICB2YXIgZyA9IHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuc2VsZWN0QWxsKCdnLicgKyBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JylcbiAgICAgICAgICAgIC5kYXRhKGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZC51aWQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB2YXIgZXhpdGluZyA9IGcuZXhpdCgpO1xuXG4gICAgICAgIGlmIChzZWxmLm9wdGlvbnMuZW5hYmxlVHJhbnNpdGlvbk9uRXhpdCAmJiB0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgICAgICBleGl0aW5nXG4gICAgICAgICAgICAgICAgLmNhbGwoc2VsZi5lbGVtZW50RXhpdC5iaW5kKHNlbGYpKTtcblxuICAgICAgICAgICAgZXhpdGluZy5lYWNoKGZ1bmN0aW9uKGQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBnID0gZDMuc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGV4aXRUcmFuc2Zvcm0gPSBlbmRUcmFuc2Zvcm1NYXBbZC51aWRdIHx8IGVuZFRyYW5zZm9ybU1hcFtkLmlkXTtcblxuICAgICAgICAgICAgICAgIGlmIChleGl0VHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oZywgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGV4aXRUcmFuc2Zvcm0pXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXhpdGluZ1xuICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGcuZW50ZXIoKS5hcHBlbmQoJ2cnKVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuY2FsbChzZWxmLmVsZW1lbnRFbnRlci5iaW5kKHNlbGYpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGcuZWFjaChmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgICAgIHZhciBnID0gZDMuc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgICAgICBpZiAoZC5fZGVmYXVsdFByZXZlbnRlZCkge1xuXG4gICAgICAgICAgICAgICAgc2VsZi5lbGVtZW50VXBkYXRlKGcsIGQsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBoYXNQcmV2aW91c1RyYW5zZm9ybSA9IGcuYXR0cigndHJhbnNmb3JtJykgIT09IG51bGw7XG5cbiAgICAgICAgICAgIHZhciBuZXdUcmFuc2Zvcm0gPSBlbmRUcmFuc2Zvcm1NYXBbZC51aWRdIHx8IGVuZFRyYW5zZm9ybU1hcFtkLmlkXSB8fCBzZWxmLmdldFRyYW5zZm9ybUZyb21EYXRhKGQpO1xuXG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBvcmlnaW5UcmFuc2Zvcm0gPSBzdGFydFRyYW5zZm9ybU1hcFtkLnVpZF0gfHwgc3RhcnRUcmFuc2Zvcm1NYXBbZC5pZF0gfHwgbmV3VHJhbnNmb3JtO1xuICAgICAgICAgICAgICAgIHZhciBtb2RpZmllZE9yaWdpblRyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1ByZXZpb3VzVHJhbnNmb3JtICYmIHNlbGYub3B0aW9ucy51c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpblRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm0gPSBvcmlnaW5UcmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgICAgICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsIG9yaWdpblRyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKGcsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHJUd2VlbihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmlnaW5UcmFuc2Zvcm0gPSBtb2RpZmllZE9yaWdpblRyYW5zZm9ybSB8fCBnLmF0dHIoJ3RyYW5zZm9ybScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuYWJsZVlUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLmludGVycG9sYXRlVHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybSwgbmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXJ0VHJhbnNmb3JtID0gZDMudHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVuZFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShuZXdUcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXSA9IGVuZFRyYW5zZm9ybS50cmFuc2xhdGVbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLmludGVycG9sYXRlVHJhbnNmb3JtKHN0YXJ0VHJhbnNmb3JtLnRvU3RyaW5nKCksIGVuZFRyYW5zZm9ybS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBuZXdUcmFuc2Zvcm0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLmVsZW1lbnRVcGRhdGUoZywgZCwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gWzAuMCwgMC4wXTtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5tb3ZlRWxlbWVudHMgPSBmdW5jdGlvbihmb3JjZURyYXcsIHNraXBYQXhpcywgZm9yY2VUaWNrcykge1xuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMucmVuZGVyT25JZGxlIHx8IGZvcmNlRHJhdykge1xuICAgICAgICB0aGlzLmRyYXdFbGVtZW50cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudHJhbnNsYXRlRWxlbWVudHModGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKSwgdGhpcy5fbGFzdFRyYW5zbGF0ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3WUF4aXModW5kZWZpbmVkLCAhZm9yY2VUaWNrcyk7XG5cbiAgICBpZiAoIXNraXBYQXhpcykge1xuICAgICAgICB0aGlzLnVwZGF0ZVhBeGlzSW50ZXJ2YWwoKTtcbiAgICAgICAgdGhpcy5kcmF3WEF4aXModW5kZWZpbmVkLCAhZm9yY2VUaWNrcyk7XG4gICAgfVxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudHJhbnNsYXRlRWxlbWVudHMgPSBmdW5jdGlvbih0cmFuc2xhdGUsIHByZXZpb3VzVHJhbnNsYXRlKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgdHggPSB0cmFuc2xhdGVbMF0gLSBwcmV2aW91c1RyYW5zbGF0ZVswXTtcbiAgICB2YXIgdHkgPSB0cmFuc2xhdGVbMV0gLSBwcmV2aW91c1RyYW5zbGF0ZVsxXTtcblxuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMF0gPSB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdICsgdHg7XG4gICAgdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVsxXSA9IHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV0gKyB0eTtcblxuXG4gICAgaWYgKHRoaXMuX2VsdHNUcmFuc2xhdGVBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2VsdHNUcmFuc2xhdGVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fZWx0c1RyYW5zbGF0ZUFGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZSgnICsgc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSArICcpJ1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc2VsZi5lbGVtZW50c1RyYW5zbGF0ZSAhPT0gc2VsZi5ub29wKSB7XG4gICAgICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgLnNlbGVjdEFsbCgnLicgKyBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JylcbiAgICAgICAgICAgICAgICAuZWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudHNUcmFuc2xhdGUoZDMuc2VsZWN0KHRoaXMpLCBkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVhBeGlzSW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuY29sdW1uV2lkdGggPSB0aGlzLnNjYWxlcy54KDEpIC0gdGhpcy5zY2FsZXMueCgwKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlWSA9IGZ1bmN0aW9uICh0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcjtcbiAgICB2YXIgY2xpcCA9IHRoaXMuZWxlbWVudHMuY2xpcC5zZWxlY3QoJ3JlY3QnKTtcbiAgICB2YXIgYm91bmRpbmdSZWN0ID0gdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0Jyk7XG5cbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnRhaW5lciA9IGNvbnRhaW5lci50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgY2xpcCA9IGNsaXAudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGJvdW5kaW5nUmVjdCA9IGJvdW5kaW5nUmVjdC50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICB2YXIgZWxlbWVudEFtb3VudCA9IHRoaXMuZGF0YS5sZW5ndGg7XG5cbiAgICAvLyBoYXZlIDEgbW9yZSBlbGVtbnQgdG8gZm9yY2UgcmVwcmVzZW50aW5nIG9uZSBtb3JlIHRpY2tcbiAgICB2YXIgZWxlbWVudHNSYW5nZSA9IFswLCBlbGVtZW50QW1vdW50XTtcblxuICAgIC8vIGNvbXB1dGUgbmV3IGhlaWdodFxuICAgIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgPSBNYXRoLm1pbih0aGlzLmRhdGEubGVuZ3RoICogdGhpcy5vcHRpb25zLnJvd0hlaWdodCwgdGhpcy5fbWF4Qm9keUhlaWdodCk7XG5cbiAgICAvLyBjb21wdXRlIG5ldyBZIHNjYWxlXG4gICAgdGhpcy5feVNjYWxlID0gdGhpcy5vcHRpb25zLnJvd0hlaWdodCAvIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKiBlbGVtZW50QW1vdW50O1xuXG4gICAgLy8gdXBkYXRlIFkgc2NhbGUsIGF4aXMgYW5kIHpvb20gYmVoYXZpb3JcbiAgICB0aGlzLnNjYWxlcy55LmRvbWFpbihlbGVtZW50c1JhbmdlKS5yYW5nZShbMCwgdGhpcy5kaW1lbnNpb25zLmhlaWdodF0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkueSh0aGlzLnNjYWxlcy55KS50cmFuc2xhdGUodGhpcy5fbGFzdFRyYW5zbGF0ZSkuc2NhbGUodGhpcy5feVNjYWxlKTtcblxuICAgIC8vIGFuZCB1cGRhdGUgWCBheGlzIHRpY2tzIGhlaWdodFxuICAgIHRoaXMuYXhpc2VzLnguaW5uZXJUaWNrU2l6ZSgtdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG5cbiAgICAvLyB1cGRhdGUgc3ZnIGhlaWdodFxuICAgIGNvbnRhaW5lci5hdHRyKCdoZWlnaHQnLHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKyB0aGlzLm1hcmdpbi50b3AgKyB0aGlzLm1hcmdpbi5ib3R0b20pO1xuXG4gICAgLy8gdXBkYXRlIGlubmVyIHJlY3QgaGVpZ2h0XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKS5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICBib3VuZGluZ1JlY3QuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgY29udGFpbmVyLnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnKS5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICBjbGlwLmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgdGhpcy5zdG9wRWxlbWVudFRyYW5zaXRpb24oKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLCB0aGlzLmNvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuc3RvcEVsZW1lbnRUcmFuc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5zZWxlY3RBbGwoJ2cuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKS50cmFuc2l0aW9uKClcbiAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgJycpO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudEVudGVyID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRVcGRhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHsgcmV0dXJuIHNlbGVjdGlvbjsgfTtcblxuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudEV4aXQgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHsgcmV0dXJuIHNlbGVjdGlvbjsgfTtcblxuRDNUYWJsZS5wcm90b3R5cGUud3JhcFdpdGhBbmltYXRpb24gPSBmdW5jdGlvbihzZWxlY3Rpb24sIHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgIHJldHVybiBzZWxlY3Rpb24udHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikuZWFzZSh0aGlzLm9wdGlvbnMudHJhbnNpdGlvbkVhc2luZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdGlvbjtcbiAgICB9XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5fZ2V0dGVyID0gZnVuY3Rpb24ocHJvcCkge1xuICAgIHJldHVybiBmdW5jdGlvbihkKSB7IHJldHVybiBkW3Byb3BdOyB9O1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuX2lzUm91bmQgPSBmdW5jdGlvbih2KSB7XG4gICAgdmFyIG4gPSB2fDA7XG4gICAgcmV0dXJuIHYgPiBuIC0gMWUtMyAmJiB2IDwgbiArIDFlLTM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5fcmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgZW5kLCBpbmMpIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgd2hpbGUgKHN0YXJ0IDwgZW5kKSB7XG4gICAgICAgIHJlcy5wdXNoKHN0YXJ0KTtcbiAgICAgICAgc3RhcnQgPSBzdGFydCArIGluYztcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn07XG5cbi8qKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9mci9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PYmpldHNfZ2xvYmF1eC9BcnJheS9maW5kXG4gKiBAdHlwZSB7KnxGdW5jdGlvbn1cbiAqIEBwcml2YXRlXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLl9maW5kID0gZnVuY3Rpb24obGlzdCwgcHJlZGljYXRlKSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3QubGVuZ3RoID4+PiAwO1xuICAgIHZhciB0aGlzQXJnID0gbGlzdDtcbiAgICB2YXIgdmFsdWU7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gbGlzdFtpXTtcbiAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlID0gZnVuY3Rpb24odHJhbnNsYXRlLCBzY2FsZSkge1xuXG4gICAgc2NhbGUgPSBzY2FsZSB8fCBbMSwgMV07XG5cbiAgICBpZiAoIShzY2FsZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICBzY2FsZSA9IFtzY2FsZSwgc2NhbGVdO1xuICAgIH1cblxuICAgIHZhciB0eCA9IHRyYW5zbGF0ZVswXTtcbiAgICB2YXIgdHkgPSB0cmFuc2xhdGVbMV07XG4gICAgdmFyIHN4ID0gc2NhbGVbMF07XG4gICAgdmFyIHN5ID0gc2NhbGVbMV07XG5cbiAgICBpZiAoc3ggPT09IDEpIHtcbiAgICAgICAgdHggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHR4ID0gTWF0aC5taW4oTWF0aC5tYXgoLXRoaXMuZGltZW5zaW9ucy53aWR0aCAqIChzeC0xKSwgdHgpLCAwKTtcbiAgICB9XG5cbiAgICBpZiAoc3kgPT09IDEpIHtcbiAgICAgICAgdHkgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHR5ID0gTWF0aC5taW4oTWF0aC5tYXgoLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKiAoc3ktMSksIHR5KSwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFt0eCwgdHldO1xuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBEM1RhYmxlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cy9ldmVudHMnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcbmltcG9ydCBEM1RhYmxlIGZyb20gJy4vRDNUYWJsZSc7XG5cbmZ1bmN0aW9uIEQzVGFibGVNYXJrZXIob3B0aW9ucykge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQodHJ1ZSwge30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0QzVGFibGV9XG4gICAgICovXG4gICAgdGhpcy50YWJsZSA9IG51bGw7XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5lbGVtZW50cyA9IHtcbiAgICAgICAgbGluZTogbnVsbCxcbiAgICAgICAgbGFiZWw6IG51bGxcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGFibGVSZXNpemVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSBudWxsO1xuXG4gICAgdGhpcy52YWx1ZSA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFRpbWVVcGRhdGVkID0gbnVsbDtcbn1cblxuaW5oZXJpdHMoRDNUYWJsZU1hcmtlciwgRXZlbnRFbWl0dGVyKTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX0hPUklaT05UQUwgPSAnaG9yaXpvbnRhbCc7XG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5MQVlPVVRfVkVSVElDQUwgPSAndmVydGljYWwnO1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcbiAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQ7IH0sXG4gICAgb3V0ZXJUaWNrU2l6ZTogMTAsXG4gICAgdGlja1BhZGRpbmc6IDEwLFxuICAgIHJvdW5kUG9zaXRpb246IGZhbHNlLFxuICAgIGJlbUJsb2NrTmFtZTogJ3RhYmxlTWFya2VyJyxcbiAgICBiZW1Nb2RpZmllcnM6IFtdLFxuICAgIGxheW91dDogRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX1ZFUlRJQ0FMXG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0QzVGFibGV9IHRhYmxlXG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNldFRhYmxlID0gZnVuY3Rpb24odGFibGUpIHtcblxuICAgIHZhciBwcmV2aW91c1RhYmxlID0gdGhpcy50YWJsZTtcblxuICAgIHRoaXMudGFibGUgPSB0YWJsZSAmJiB0YWJsZSBpbnN0YW5jZW9mIEQzVGFibGUgPyB0YWJsZSA6IG51bGw7XG5cbiAgICBpZiAodGhpcy50YWJsZSkge1xuICAgICAgICBpZiAocHJldmlvdXNUYWJsZSAhPT0gdGhpcy50YWJsZSkge1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzVGFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVuYmluZFRhYmxlKHByZXZpb3VzVGFibGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5iaW5kVGFibGUoKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXRoaXMudGFibGUgJiYgcHJldmlvdXNUYWJsZSkge1xuICAgICAgICB0aGlzLnVuYmluZFRhYmxlKHByZXZpb3VzVGFibGUpO1xuICAgIH1cblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUudmFsdWVDb21wYXJhdG9yID0gZnVuY3Rpb24odGltZUEsIHRpbWVCKSB7XG4gICAgcmV0dXJuICt0aW1lQSAhPT0gK3RpbWVCO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuc2V0VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSwgc2lsZW50KSB7XG5cbiAgICB2YXIgcHJldmlvdXNUaW1lVXBkYXRlZCA9IHRoaXMuX2xhc3RUaW1lVXBkYXRlZDtcblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICAgIGlmICh0aGlzLnZhbHVlQ29tcGFyYXRvcihwcmV2aW91c1RpbWVVcGRhdGVkLCB0aGlzLnZhbHVlKSAmJiB0aGlzLnRhYmxlICYmIHRoaXMuY29udGFpbmVyKSB7XG5cbiAgICAgICAgdGhpcy5fbGFzdFRpbWVVcGRhdGVkID0gdGhpcy52YWx1ZTtcblxuICAgICAgICB0aGlzLmNvbnRhaW5lclxuICAgICAgICAgICAgLmRhdHVtKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghc2lsZW50KSB7XG4gICAgICAgICAgICB0aGlzLm1vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEudmFsdWU7XG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5iaW5kVGFibGUgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBjbGFzc05hbWUgPSB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctLScgKyB0aGlzLm9wdGlvbnMubGF5b3V0O1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5iZW1Nb2RpZmllcnMgJiYgQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXJzKSAmJiB0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY2xhc3NOYW1lID0gY2xhc3NOYW1lICsgJyAnICsgdGhpcy5vcHRpb25zLmJlbU1vZGlmaWVycy5tYXAoZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy0tJyArIG1vZGlmaWVyO1xuICAgICAgICB9KS5qb2luKCcgJyk7XG4gICAgfVxuXG4gICAgdGhpcy5jb250YWluZXIgPSB0aGlzLnRhYmxlLmNvbnRhaW5lclxuICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgLmRhdHVtKHtcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnZhbHVlXG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIGNsYXNzTmFtZSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmxpbmUgPSB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctbGluZScpXG4gICAgICAgIC5zdHlsZSgncG9pbnRlci1ldmVudHMnLCAnbm9uZScpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5sYWJlbCA9IHRoaXMuY29udGFpbmVyXG4gICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1sYWJlbCcpO1xuXG4gICAgdGhpcy5zaXplTGluZUFuZExhYmVsKCk7XG5cbiAgICAvLyBvbiB0YWJsZSBtb3ZlLCBtb3ZlIHRoZSBtYXJrZXJcbiAgICB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lciA9IHRoaXMubW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScsIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyKTtcblxuICAgIC8vIG9uIHRhYmxlIHJlc2l6ZSwgcmVzaXplIHRoZSBtYXJrZXIgYW5kIG1vdmUgaXRcbiAgICB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgICAgIHNlbGYucmVzaXplKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIHNlbGYubW92ZSh0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH07XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyKTtcblxuICAgIHRoaXMuZW1pdCgnbWFya2VyOmJvdW5kJyk7XG5cbiAgICB0aGlzLm1vdmUoKTtcblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuc2l6ZUxpbmVBbmRMYWJlbCA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdmFyIGxheW91dCA9IHRoaXMub3B0aW9ucy5sYXlvdXQ7XG5cbiAgICB2YXIgbGluZSA9IHRoaXMuZWxlbWVudHMubGluZTtcbiAgICB2YXIgbGFiZWwgPSB0aGlzLmVsZW1lbnRzLmxhYmVsO1xuXG4gICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgbGluZSA9IGxpbmUudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGxhYmVsID0gbGFiZWwudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfVxuXG4gICAgc3dpdGNoKGxheW91dCkge1xuICAgICAgICBjYXNlIHRoaXMuTEFZT1VUX1ZFUlRJQ0FMOlxuICAgICAgICAgICAgbGluZVxuICAgICAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgeTE6IC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgeTI6IHRoaXMudGFibGUuZGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2R5JywgLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLXRoaXMub3B0aW9ucy50aWNrUGFkZGluZyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0aGlzLkxBWU9VVF9IT1JJWk9OVEFMOlxuICAgICAgICAgICAgbGluZVxuICAgICAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgeDE6IC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgeDI6IHRoaXMudGFibGUuZGltZW5zaW9ucy53aWR0aFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgICAgICAuYXR0cignZHgnLCAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUtdGhpcy5vcHRpb25zLnRpY2tQYWRkaW5nKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsIDQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS51bmJpbmRUYWJsZSA9IGZ1bmN0aW9uKHByZXZpb3VzVGFibGUpIHtcblxuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScsIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIpO1xuXG4gICAgdGhpcy5jb250YWluZXIucmVtb3ZlKCk7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHByZXZpb3VzVGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICAgICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5lbWl0KCdtYXJrZXI6dW5ib3VuZCcsIHByZXZpb3VzVGFibGUpO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICB0aGlzLnRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fbW92ZUFGID0gdGhpcy50YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5tb3ZlU3luYy5iaW5kKHRoaXMpKTtcblxufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUubW92ZVN5bmMgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICghdGhpcy50YWJsZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBsYXlvdXQgPSB0aGlzLm9wdGlvbnMubGF5b3V0O1xuXG4gICAgdGhpcy5jb250YWluZXJcbiAgICAgICAgLmVhY2goZnVuY3Rpb24oZCkge1xuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBzZWxmLmdldFZhbHVlKGQpO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzY2FsZSwgcG9zaXRpb24gPSBbMCwgMF0sIHBvc2l0aW9uSW5kZXg7XG5cbiAgICAgICAgICAgIHN3aXRjaChsYXlvdXQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIHNlbGYuTEFZT1VUX1ZFUlRJQ0FMOlxuICAgICAgICAgICAgICAgICAgICBzY2FsZSA9IHNlbGYudGFibGUuc2NhbGVzLng7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHNlbGYuTEFZT1VUX0hPUklaT05UQUw6XG4gICAgICAgICAgICAgICAgICAgIHNjYWxlID0gc2VsZi50YWJsZS5zY2FsZXMueTtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25JbmRleCA9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdID0gc2NhbGUodmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgcmFuZ2UgPSBzY2FsZS5yYW5nZSgpO1xuICAgICAgICAgICAgdmFyIGlzSW5SYW5nZSA9IHBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdID49IHJhbmdlWzBdICYmIHBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdIDw9IHJhbmdlW3JhbmdlLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgICAgICB2YXIgZyA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgaWYgKGlzSW5SYW5nZSkge1xuXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XG5cbiAgICAgICAgICAgICAgICBnLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysoc2VsZi50YWJsZS5tYXJnaW4ubGVmdCArIHBvc2l0aW9uWzBdID4+IDApKycsJysoc2VsZi50YWJsZS5tYXJnaW4udG9wICsgcG9zaXRpb25bMV0gPj4gMCkrJyknKTtcblxuICAgICAgICAgICAgICAgIGcuc2VsZWN0KCcuJyArIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxhYmVsJylcbiAgICAgICAgICAgICAgICAgICAgLnRleHQoc2VsZi5vcHRpb25zLmZvcm1hdHRlcih2YWx1ZSkpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUoJ2Rpc3BsYXknLCAnJyk7XG59O1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUoJ2Rpc3BsYXknLCAnbm9uZScpO1xufTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB0aGlzLnNpemVMaW5lQW5kTGFiZWwodHJhbnNpdGlvbkR1cmF0aW9uKTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RhYmxlTWFya2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlTWFya2VyIGZyb20gJy4vRDNUYWJsZU1hcmtlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqXG4gKiBAZXh0ZW5kcyB7RDNUYWJsZU1hcmtlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RhYmxlTW91c2VUcmFja2VyKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlTWFya2VyLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl90YWJsZU1vdXNlZW50ZXJMaXN0ZW5lciA9IG51bGw7XG4gICAgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lciA9IG51bGw7XG4gICAgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcblxuICAgIHRoaXMub24oJ21hcmtlcjpib3VuZCcsIHRoaXMuaGFuZGxlVGFibGVCb3VuZC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLm9uKCdtYXJrZXI6dW5ib3VuZCcsIHRoaXMuaGFuZGxlVGFibGVVbmJvdW5kLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzID0gZmFsc2U7XG59XG5cbmluaGVyaXRzKEQzVGFibGVNb3VzZVRyYWNrZXIsIEQzVGFibGVNYXJrZXIpO1xuXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1Nb2RpZmllcnM6IFsnbW91c2VUcmFja2VyJ10sXG4gICAgbGlzdGVuVG9Ub3VjaEV2ZW50czogdHJ1ZVxufSk7XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZVRhYmxlQm91bmQgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyID0gdGhpcy5oYW5kbGVNb3VzZWVudGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lciA9IHRoaXMuaGFuZGxlTW91c2Vtb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIgPSB0aGlzLmhhbmRsZU1vdXNlbGVhdmUuYmluZCh0aGlzKTtcblxuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VlbnRlcicsIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyKTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdXNlbW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VsZWF2ZScsIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubGlzdGVuVG9Ub3VjaEV2ZW50cykge1xuICAgICAgICB0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMgPSB0cnVlO1xuICAgICAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnRvdWNobW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IGZhbHNlO1xuICAgIH1cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZVRhYmxlVW5ib3VuZCA9IGZ1bmN0aW9uKHByZXZpb3VzVGFibGUpIHtcblxuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VlbnRlcicsIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdXNlbW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VsZWF2ZScsIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMpIHtcbiAgICAgICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzp0b3VjaG1vdmUnLCB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyKTtcbiAgICB9XG5cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcbiAgICBzd2l0Y2ggKHRoaXMub3B0aW9ucy5sYXlvdXQpIHtcbiAgICAgICAgY2FzZSAndmVydGljYWwnOlxuICAgICAgICAgICAgcmV0dXJuIGdldFRpbWUoKTtcbiAgICAgICAgY2FzZSAnaG9yaXpvbnRhbCc6XG4gICAgICAgICAgICByZXR1cm4gZ2V0Um93KCk7XG4gICAgfVxufTtcblxuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2VlbnRlciA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHRpbWUgPSB0aGlzLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5zaG93KCk7XG4gICAgICAgIHNlbGYuc2V0VmFsdWUodGltZSk7XG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZU1vdXNlbW92ZSA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciB0aW1lID0gdGhpcy5nZXRWYWx1ZUZyb21UYWJsZUV2ZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fbW92ZUFGID0gdGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNldFZhbHVlKHRpbWUpO1xuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVNb3VzZWxlYXZlID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfSk7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZU1vdXNlVHJhY2tlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZU1hcmtlciBmcm9tICcuL0QzVGFibGVNYXJrZXInO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxuLyoqXG4gKlxuICogQGV4dGVuZHMge0QzVGFibGVNYXJrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUYWJsZVZhbHVlVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZU1hcmtlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG59XG5cbmluaGVyaXRzKEQzVGFibGVWYWx1ZVRyYWNrZXIsIEQzVGFibGVNYXJrZXIpO1xuXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1Nb2RpZmllcnM6IFsndmFsdWVUcmFja2VyJ11cbn0pO1xuXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS52YWx1ZUdldHRlciA9IGZ1bmN0aW9uKCkge1xuXG4gICByZXR1cm4gMDtcblxufTtcblxuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cbiAgICBkMy50aW1lcihmdW5jdGlvbigpIHtcblxuICAgICAgICBzZWxmLnNldFZhbHVlKHNlbGYudmFsdWVHZXR0ZXIoKSk7XG5cbiAgICAgICAgcmV0dXJuICFzZWxmLmVuYWJsZWQ7XG5cbiAgICB9KTtcbn07XG5cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVWYWx1ZVRyYWNrZXI7XG4iLCIvKiBnbG9iYWwgY2FuY2VsQW5pbWF0aW9uRnJhbWUsIHJlcXVlc3RBbmltYXRpb25GcmFtZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBEM0Jsb2NrVGFibGUgZnJvbSAnLi9EM0Jsb2NrVGFibGUnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcblxuLyoqXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RpbWVsaW5lKG9wdGlvbnMpIHtcblxuICAgIEQzQmxvY2tUYWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5jdXJyZW50VGltZUludGVydmFsID0gdGhpcy5vcHRpb25zLm1pbmltdW1UaW1lSW50ZXJ2YWw7XG59XG5cbmluaGVyaXRzKEQzVGltZWxpbmUsIEQzQmxvY2tUYWJsZSk7XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM0Jsb2NrVGFibGUucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtQmxvY2tOYW1lOiAndGltZWxpbmUnLFxuICAgIGJlbUJsb2NrTW9kaWZpZXI6ICcnLFxuICAgIHhBeGlzVGlja3NGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQuZ2V0TWludXRlcygpICUgMTUgPyAnJyA6IGQzLnRpbWUuZm9ybWF0KCclSDolTScpKGQpO1xuICAgIH0sXG4gICAgeEF4aXNTdHJva2VXaWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZC5nZXRNaW51dGVzKCkgJTMwID8gMSA6IDI7XG4gICAgfSxcbiAgICBtaW5pbXVtQ29sdW1uV2lkdGg6IDMwLFxuICAgIG1pbmltdW1UaW1lSW50ZXJ2YWw6IDNlNSxcbiAgICBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzOiBbIDZlNCwgM2U1LCA5ZTUsIDEuOGU2LCAzLjZlNiwgNy4yZTYsIDEuNDRlNywgMi44OGU3LCA0LjMyZTcsIDguNjRlNyBdXG59KTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUueFNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy50aW1lLnNjYWxlKCk7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS55U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpO1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuZ2V0RGF0YVN0YXJ0ID0gZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLnN0YXJ0O1xufTtcblxuRDNUaW1lbGluZS5wcm90b3R5cGUuZ2V0RGF0YUVuZCA9IGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5lbmQ7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVJbnRlcnZhbCkge1xuICAgIHJldHVybiB0aGlzLnNjYWxlcy54KG5ldyBEYXRlKHRpbWVJbnRlcnZhbCkpIC0gdGhpcy5zY2FsZXMueChuZXcgRGF0ZSgwKSk7XG59O1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS51cGRhdGVYQXhpc0ludGVydmFsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgbWluaW11bVRpbWVJbnRlcnZhbCA9IHRoaXMub3B0aW9ucy5taW5pbXVtVGltZUludGVydmFsO1xuICAgIHZhciBtaW5pbXVtQ29sdW1uV2lkdGggPSB0aGlzLm9wdGlvbnMubWluaW11bUNvbHVtbldpZHRoO1xuICAgIHZhciBjdXJyZW50VGltZUludGVydmFsID0gdGhpcy5jdXJyZW50VGltZUludGVydmFsO1xuICAgIHZhciBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzID0gdGhpcy5vcHRpb25zLmF2YWlsYWJsZVRpbWVJbnRlcnZhbHM7XG4gICAgdmFyIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCA9IGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMuaW5kZXhPZihjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB2YXIgY3VycmVudENvbHVtbldpZHRoID0gdGhpcy5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbChjdXJyZW50VGltZUludGVydmFsKTtcblxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbChkZWx0YSkge1xuICAgICAgICBjdXJyZW50VGltZUludGVydmFsSW5kZXggKz0gZGVsdGE7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzW2N1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleF07XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgfVxuXG4gICAgaWYgKGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoY3VycmVudENvbHVtbldpZHRoIDwgbWluaW11bUNvbHVtbldpZHRoKSB7XG4gICAgICAgICAgICB3aGlsZShjdXJyZW50Q29sdW1uV2lkdGggPCBtaW5pbXVtQ29sdW1uV2lkdGggJiYgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4IDwgYXZhaWxhYmxlVGltZUludGVydmFscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlVGltZUludGVydmFsKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRDb2x1bW5XaWR0aCA+IG1pbmltdW1Db2x1bW5XaWR0aCkge1xuICAgICAgICAgICAgd2hpbGUoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoICYmIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJhbnNsYXRlVGltZUludGVydmFsKDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRUaW1lSW50ZXJ2YWwgPCBtaW5pbXVtVGltZUludGVydmFsKSB7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBtaW5pbXVtVGltZUludGVydmFsO1xuICAgICAgICBjdXJyZW50Q29sdW1uV2lkdGggPSBzZWxmLl9jb21wdXRlQ29sdW1uV2lkdGhGcm9tVGltZUludGVydmFsKGN1cnJlbnRUaW1lSW50ZXJ2YWwpXG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50VGltZUludGVydmFsID0gTWF0aC5mbG9vcihjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB0aGlzLmNvbHVtbldpZHRoID0gTWF0aC5mbG9vcihjdXJyZW50Q29sdW1uV2lkdGgpO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA+IDMuNmU2KSB7XG4gICAgICAgIHRoaXMuYXhpc2VzLngudGlja3MoZDMudGltZS5ob3VycywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gMy42ZTYgKTtcbiAgICAgICAgdGhpcy5heGlzZXMueDIudGlja3MoZDMudGltZS5ob3VycywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gMy42ZTYgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gNmU0KSB7XG4gICAgICAgIHRoaXMuYXhpc2VzLngudGlja3MoZDMudGltZS5taW51dGVzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyA2ZTQgKTtcbiAgICAgICAgdGhpcy5heGlzZXMueDIudGlja3MoZDMudGltZS5taW51dGVzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyA2ZTQgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gMWUzKSB7XG4gICAgICAgIHRoaXMuYXhpc2VzLngudGlja3MoZDMudGltZS5zZWNvbmRzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAxZTMgKTtcbiAgICAgICAgdGhpcy5heGlzZXMueDIudGlja3MoZDMudGltZS5zZWNvbmRzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAxZTMgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGltZWxpbmUucHJvdG90eXBlLnNldFRpbWVSYW5nZSA9IGZ1bmN0aW9uKG1pbkRhdGUsIG1heERhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRYUmFuZ2UobWluRGF0ZSwgbWF4RGF0ZSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEM1RpbWVsaW5lO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlVmFsdWVUcmFja2VyIGZyb20gJy4vRDNUYWJsZVZhbHVlVHJhY2tlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqXG4gKiBAZXh0ZW5kcyB7RDNUYWJsZVZhbHVlVHJhY2tlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEM1RpbWVsaW5lVGltZVRyYWNrZXIob3B0aW9ucykge1xuICAgIEQzVGFibGVWYWx1ZVRyYWNrZXIuY2FsbCh0aGlzLCBvcHRpb25zKTtcbn1cblxuaW5oZXJpdHMoRDNUaW1lbGluZVRpbWVUcmFja2VyLCBEM1RhYmxlVmFsdWVUcmFja2VyKTtcblxuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1CbG9ja05hbWU6ICd0aW1lbGluZU1hcmtlcicsXG4gICAgYmVtTW9kaWZpZXJzOiBbJ3RpbWVUcmFja2VyJ10sXG4gICAgbGF5b3V0OiAndmVydGljYWwnXG59KTtcblxuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS50aW1lR2V0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCk7XG59O1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnRpbWVDb21wYXJhdG9yID0gZnVuY3Rpb24oYSxiKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVDb21wYXJhdG9yKGEsYik7XG59O1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnNldFRpbWUgPSBmdW5jdGlvbih0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGltZSk7XG59O1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnNldFRpbWVsaW5lID0gZnVuY3Rpb24odGltZWxpbmUpIHtcbiAgICByZXR1cm4gdGhpcy5zZXRUYWJsZSh0aW1lbGluZSk7XG59O1xuXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlR2V0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudGltZUdldHRlcigpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RpbWVsaW5lVGltZVRyYWNrZXI7XG4iXX0=
(1)
});
;