!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.d3Timeline=e():"undefined"!=typeof global?global.d3Timeline=e():"undefined"!=typeof self&&(self.d3Timeline=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports.D3Table = require('./src/D3Table.js');
module.exports.D3BlockTable = require('./src/D3BlockTable.js');
module.exports.D3Timeline = require('./src/D3Timeline');
module.exports.D3TableMarker = require('./src/D3TableMarker.js');
module.exports.D3TableMouseTracker = require('./src/D3TableMouseTracker.js');
module.exports.D3TableValueTracker = require('./src/D3TableValueTracker.js');
module.exports.D3TimelineTimeTracker = require('./src/D3TimelineTimeTracker.js');

},{"./src/D3BlockTable.js":5,"./src/D3Table.js":6,"./src/D3TableMarker.js":7,"./src/D3TableMouseTracker.js":8,"./src/D3TableValueTracker.js":9,"./src/D3Timeline":10,"./src/D3TimelineTimeTracker.js":11}],2:[function(require,module,exports){
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

var _extend2 = _interopRequireDefault(_extend);

var d3Timeline = {};

/**
 * Add behaviors to a D3Table to handle elements as visual blocks with:
 *  - element drag (+ automatic scroll)
 *  - element clipping
 *  - element text (+ alignment)
 *
 * @param {d3Timeline.D3TableBlockOptions} options
 * @extends {d3Timeline.D3Table}
 * @constructor
 */
d3Timeline.D3BlockTable = function D3BlockTable(options) {
    _D3Table2['default'].call(this, options);

    /**
     * @name d3Timeline.D3BlockTable#options
     * @type {d3Timeline.D3TableBlockOptions}
     */
};

var D3BlockTable = d3Timeline.D3BlockTable;

(0, _inherits2['default'])(D3BlockTable, _D3Table2['default']);

/**
 * @type {d3Timeline.D3TableBlockOptions}
 */
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

/**
 * Compute the clip path id for each element
 *
 * @param {d3Timeline.D3TableElement} element
 * @returns {String}
 */
D3BlockTable.prototype.generateClipPathId = function (element) {
    return this.options.bemBlockName + '-elementClipPath_' + this.instanceNumber + '_' + element.uid;
};

/**
 * Compute the clip path link for each element
 *
 * @param {d3Timeline.D3TableElement} element
 * @returns {String}
 */
D3BlockTable.prototype.generateClipPathLink = function (element) {
    return 'url(#' + this.generateClipPathId(element) + ')';
};

/**
 * Compute the clip rect id for each element
 *
 * @param {d3Timeline.D3TableElement} element
 * @returns {String}
 */
D3BlockTable.prototype.generateClipRectId = function (element) {
    return this.options.bemBlockName + '-elementClipRect_' + this.instanceNumber + '_' + element.uid;
};

/**
 * Compute the clip rect link for each element
 *
 * @param {d3Timeline.D3TableElement} element
 * @returns {String}
 */
D3BlockTable.prototype.generateClipRectLink = function (element) {
    return '#' + this.generateClipRectId(element);
};

/**
 * Implements element entering:
 *  - append clipped rect
 *  - append text
 *  - call {@link d3Timeline.D3BlockTable#elementContentEnter}
 *  - call custom drag behavior
 *
 * @param {d3.Selection} selection
 * @param {d3Timeline.D3TableElement} element
 */
D3BlockTable.prototype.elementEnter = function (selection, element) {

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
        selection.on(eventName, function (data) {
            if (!d3.event.defaultPrevented) {
                self.emitDetailedEvent('element:' + eventName, selection, null, [data]);
            }
        });
    });

    if (this.options.appendText) {
        selection.select('.timeline-elementMovableContent').append('text').classed('timeline-entityLabel', true).attr('dy', this.options.rowHeight / 2 + 4);
    }

    selection.call(this.elementContentEnter.bind(this));

    this.bindDragAndDropOnSelection(selection, element);
};

/**
 * Implement element being translated:
 *  - align text
 *
 * @param {d3.Selection} selection
 * @param {d3Timeline.D3TableElement} element
 */
D3BlockTable.prototype.elementsTranslate = function (selection, element) {

    var self = this;

    if (this.options.appendText && this.options.alignLeft && this.options.alignOnTranslate && !element._defaultPrevented) {

        selection.select('.' + this.options.bemBlockName + '-elementMovableContent').attr('transform', function (data) {
            return 'translate(' + Math.max(-self.scales.x(self.getDataStart(data)), 2) + ',0)';
        });
    }
};

/**
 * Implement element being updated:
 *  - transition width
 *  - align text
 *  - call {@link d3Timeline.D3BlockTable#elementContentUpdate}
 *
 * @param {d3.Selection} selection
 * @param {d3Timeline.D3TableElement} element
 * @param transitionDuration
 */
D3BlockTable.prototype.elementUpdate = function (selection, element, transitionDuration) {
    var _this = this;

    var self = this;

    this.wrapWithAnimation(selection.select('.' + this.options.bemBlockName + '-elementBackground'), transitionDuration).attr({
        y: this.options.rowPadding,
        width: function width(d) {
            return self.scales.x(self.getDataEnd(d)) - self.scales.x(self.getDataStart(d));
        }
    });

    if (this.options.appendText && this.options.alignLeft && !element._defaultPrevented) {

        selection.select('.' + this.options.bemBlockName + '-elementMovableContent').attr('transform', function (d) {
            return 'translate(' + Math.max(-_this.scales.x(_this.getDataStart(d)), 2) + ',0)';
        });
    }

    selection.call(function () {
        self.elementContentUpdate(selection, element, transitionDuration);
    });
};

/**
 * Implement element exiting:
 *  - remove click listener
 *  - remove drag listeners
 *
 * @param {d3Timeline.D3TableElement} element
 * @param selection
 */
D3BlockTable.prototype.elementExit = function (selection, element) {

    selection.on('click', null);

    if (element._drag) {
        element._drag.on('dragstart', null);
        element._drag.on('drag', null);
        element._drag.on('dragend', null);
        element._drag = null;
    }
};

/**
 * Will be called on selection when element content enters
 *
 * @param {d3.Selection} selection
 */
D3BlockTable.prototype.elementContentEnter = function (selection) {};

/**
 * Will be called on selection when element content updates
 *
 * @param {d3.Selection} selection
 */
D3BlockTable.prototype.elementContentUpdate = function (selection) {};

/**
 * Implement element drag with automatic scroll on provided selection
 *
 * @todo clean up
 * @param {d3.Selection} selection
 * @param {d3Timeline.D3TableElement} element
 */
D3BlockTable.prototype.bindDragAndDropOnSelection = function (selection, element) {

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

    var drag = element._drag = d3.behavior.drag();

    drag.on('dragstart', function (data) {

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

var _d32 = _interopRequireDefault(_d3);

var d3Timeline = {};

/**
 * An instance of D3Table uses d3.js to build a svg grid with axises.
 * You set a data set with {@link d3Timeline.D3Table.setData}.
 * Each group of element {@link d3Timeline.D3TableRow} is drawn in rows (y axis)
 * and each element {@link d3Timeline.D3TableElement} of a row is drawn in this row
 * There is no graphical element for rows.
 *
 * The provided nested data set is first flattened to enable transition between differents rows.
 *
 * @param {d3Timeline.D3TableOptions} options
 * @constructor
 */
d3Timeline.D3Table = function D3Table(options) {

    _eventsEvents2['default'].call(this);

    D3Table.instancesCount += 1;

    this.instanceNumber = D3Table.instancesCount;

    /**
     * @type {d3Timeline.D3TableOptions}
     */
    this.options = (0, _extend2['default'])(true, {}, this.defaults, options);

    /**
     * @type {Array<D3TableRow>}
     */
    this.data = [];

    /**
     * @type {Array<D3TableElement>}
     */
    this.flattenedData = [];

    /**
     * @type {{top: number, right: number, bottom: number, left: number}}
     */
    this.margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    /**
     * @type {{width: number, height: number}}
     */
    this.dimensions = { width: 0, height: 0 };

    /**
     * @type {number[]}
     */
    this.currentElementsGroupTranslate = [0.0, 0.0];

    /**
     * @type {d3.Selection}
     */
    this.container = null;

    /**
     * @type {{
     *  body: d3.Selection,
     *  innerContainer: d3.Selection,
     *  xAxisContainer: d3.Selection,
     *  x2AxisContainer: d3.Selection,
     *  yAxisContainer: d3.Selection,
     *  defs: d3.Selection,
     *  clip: d3.Selection
     * }}
     */
    this.elements = {};

    /**
     * @type {{
     *  x: d3.scale.Linear,
     *  y: d3.scale.Linear
     * }}
     */
    this.scales = {};

    /**
     * @type {{
     *  x: d3.svg.Axis,
     *  x2: d3.svg.Axis,
     *  y: d3.svg.Axis
     * }}
     */
    this.axises = {};

    /**
     * @type {{
     *  zoom: d3.behavior.Zoom,
     *  zoomX: d3.behavior.Zoom,
     *  zoomY: d3.behavior.Zoom,
     *  pan: d3.behavior.Drag
     * }}
     */
    this.behaviors = {};

    /**
     * @type {[Number, Number]}
     * @private
     */
    this._lastTranslate = null;

    /**
     * @type {[Number, Number]}
     * @private
     */
    this._lastScale = null;

    /**
     * @type {Number}
     * @private
     */
    this._yScale = 0.0;

    /**
     * @type {Number}
     * @private
     */
    this._dataChangeCount = 0;

    /**
     * @type {Number}
     * @private
     */
    this._dimensionsChangeCount = 0;

    /**
     * @type {Number}
     * @private
     */
    this._lastAvailableWidth = 0;

    /**
     * @type {Number}
     * @private
     */
    this._lastAvailableHeight = 0;

    /**
     * @type {Boolean}
     * @private
     */
    this._preventDrawing = false;

    /**
     * @type {Array<Function>}
     * @private
     */
    this._nextAnimationFrameHandlers = [];

    /**
     * @type {Number}
     * @private
     */
    this._maxBodyHeight = Infinity;

    /**
     * @type {Array<Number|String>}
     * @protected
     */
    this._frozenUids = [];

    /**
     * @type {Boolean}
     * @private
     */
    this._preventEventEmission = false;

    /**
     * @type {boolean}
     * @private
     */
    this._disabled = false;
};

var D3Table = d3Timeline.D3Table;

(0, _inherits2['default'])(D3Table, _eventsEvents2['default']);

/**
 * @type {d3Timeline.D3TableOptions}
 */
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

/**
 * @type {number}
 */
D3Table.instancesCount = 0;

/**
 * Noop function, which does nothing
 */
D3Table.prototype.noop = function () {};

/**
 * Initialization method
 *  - create the elements
 *  - instantiate d3 instances
 *  - register listeners
 *
 * Data will be drawn in the inner container
 *
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.initialize = function () {

    // container
    this.container = _d32['default'].select(this.options.container).append('svg').attr('class', this.options.bemBlockName + (this.options.bemBlockModifier ? ' ' + this.options.bemBlockName + this.options.bemBlockModifier : ''));

    // defs and clip in defs
    this.elements.defs = this.container.append('defs');

    var clipId = this.options.bemBlockName + '-bodyClipPath--' + D3Table.instancesCount;
    this.elements.clip = this.elements.defs.append('clipPath').property('id', clipId);
    this.elements.clip.append('rect');

    // background rect in container
    this.container.append('rect').classed(this.options.bemBlockName + '-backgroundRect', true);

    // axises containers in container
    this.elements.xAxisContainer = this.container.append('g').attr('class', this.options.bemBlockName + '-axis ' + this.options.bemBlockName + '-axis--x');

    this.elements.x2AxisContainer = this.container.append('g').attr('class', this.options.bemBlockName + '-axis ' + this.options.bemBlockName + '-axis--x ' + this.options.bemBlockName + '-axis--secondary');

    this.elements.yAxisContainer = this.container.append('g').attr('class', this.options.bemBlockName + '-axis ' + this.options.bemBlockName + '-axis--y');

    // body in container
    this.elements.body = this.container.append('g').attr('clip-path', 'url(#' + clipId + ')');

    // contact rect, inner container and bounding rect in body
    this.elements.body.append('rect').classed(this.options.bemBlockName + '-contactRect', true);

    this.elements.innerContainer = this.elements.body.append('g');

    this.elements.body.append('rect').classed(this.options.bemBlockName + '-boundingRect', true);

    this.updateMargins();

    this.initializeD3Instances();

    this.initializeEventListeners();

    return this;
};

/**
 * Destroy function, to be called when the instance has to be destroyed
 * @todo ensure no memory leak with this destroy implementation, espacially with dom event listeners
 */
D3Table.prototype.destroy = function () {

    this.emit(this.options.bemBlockName + ':destroy', this);

    // remove behavior listeners
    this.behaviors.zoom.on('zoom', null);

    // remove dom listeners
    this.elements.body.on('.zoom', null);
    this.elements.body.on('click', null);

    this.container.remove();

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

/**
 * Initialize d3 instances (scales, axises, behaviors)
 */
D3Table.prototype.initializeD3Instances = function () {

    var self = this;

    // scales

    this.scales.x = this.xScaleFactory();

    this.scales.y = this.yScaleFactory();

    // axises

    this.axises.x = _d32['default'].svg.axis().scale(this.scales.x).orient('top').tickFormat(this.options.xAxisTicksFormatter.bind(this)).outerTickSize(0).tickPadding(this.options.tickPadding);

    this.axises.x2 = _d32['default'].svg.axis().scale(this.scales.x).orient('top').tickFormat(this.options.xAxis2TicksFormatter.bind(this)).outerTickSize(0).innerTickSize(0);

    this.axises.y = _d32['default'].svg.axis().scale(this.scales.y).orient('left').tickFormat(function (d) {
        return self.options.yAxisFormatter.call(self, self.data[d | 0]);
    }).outerTickSize(0);

    // behaviors

    this.behaviors.zoom = _d32['default'].behavior.zoom().scaleExtent([1, 10]).on('zoom', this.handleZooming.bind(this)).on('zoomend', this.handleZoomingEnd.bind(this));

    this.behaviors.zoomX = _d32['default'].behavior.zoom().x(this.scales.x).scale(1).scaleExtent([1, 10]);

    this.behaviors.zoomY = _d32['default'].behavior.zoom().y(this.scales.y).scale(1).scaleExtent([1, 1]);

    this.behaviors.pan = _d32['default'].behavior.drag().on('drag', this.handleDragging.bind(this));

    this.elements.body.call(this.behaviors.pan);
    this.elements.body.call(this.behaviors.zoom);

    this._lastTranslate = this.behaviors.zoom.translate();
    this._lastScale = this.behaviors.zoom.scale();
};

/**
 * x scale factory
 * @returns {d3.scale.Linear}
 */
D3Table.prototype.xScaleFactory = function () {
    return _d32['default'].scale.linear();
};

/**
 * y scale factory
 * @returns {d3.scale.Linear}
 */
D3Table.prototype.yScaleFactory = function () {
    return _d32['default'].scale.linear();
};

/**
 * Initialize event listeners for all tracked DOM events
 */
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

/**
 * Pan X/Y & zoom X (clamped pan Y when wheel is pressed without ctrl, zoom X and pan X/Y otherwise)
 */
D3Table.prototype.handleZooming = function () {

    // if not ctrlKey and not touches >= 2
    if (_d32['default'].event.sourceEvent && !_d32['default'].event.sourceEvent.ctrlKey && !(_d32['default'].event.sourceEvent.changedTouches && _d32['default'].event.sourceEvent.changedTouches.length >= 2)) {

        // if wheeling, avoid zooming and let the wheeling handler pan
        if (_d32['default'].event.sourceEvent.type === 'wheel') {

            if (this.options.panYOnWheel) {
                this.restoreZoom();
                this.handleWheeling();
                return;
            }
        }
        // else avoid zooming and return (the user gesture will be handled by the the pan behavior
        else {
                this.restoreZoom();
                return;
            }
    }

    var translate = this.behaviors.zoom.translate();
    var updatedTranslate = [translate[0], this._lastTranslate[1]];

    updatedTranslate = this._clampTranslationWithScale(updatedTranslate, [this.behaviors.zoom.scale(), this.behaviors.zoomY.scale()]);

    this.behaviors.zoom.translate(updatedTranslate);
    this.behaviors.zoomX.translate(updatedTranslate);
    this.behaviors.zoomX.scale(this.behaviors.zoom.scale());

    this.moveElements(true, false, !this.options.hideTicksOnZoom);

    this._lastTranslate = updatedTranslate;
    this._lastScale = this.behaviors.zoom.scale();

    this.emit(this.options.bemBlockName + ':move');
};

/**
 * Force drawing elements, nullify optimized inner container transform and redraw axises
 */
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
 * Clamped pan Y
 */
D3Table.prototype.handleWheeling = function () {

    var event = _d32['default'].event.sourceEvent;

    var deltaX = 0,
        deltaY = 0;

    var movingX = event && event.wheelDeltaX || event.deltaX;

    // if moving x, ignore y and compute x delta
    if (movingX) {

        var movingRight = event.wheelDeltaX > 0 || event.deltaX < 0;
        deltaX = (movingRight ? 1 : -1) * this.columnWidth * this.options.wheelMultiplier;
    }
    // if not moving x
    else {

            var movingY = event.wheelDelta || event.wheelDeltaY || event.detail || event.deltaY;

            // if moving y, compute y delta
            if (movingY) {
                var movingDown = event.wheelDelta > 0 || event.wheelDeltaY > 0 || event.detail < 0 || event.deltaY < 0;
                deltaY = movingY ? (movingDown ? 1 : -1) * this.options.rowHeight * this.options.wheelMultiplier : 0;
            }
        }

    // finally move the elements
    this.move(deltaX, deltaY, false, !movingX, true);
};

/**
 * Directly use event x and y delta to move elements
 */
D3Table.prototype.handleDragging = function () {

    // if more than 2 touches, return
    if (_d32['default'].event.sourceEvent.touches && _d32['default'].event.sourceEvent.touches.length >= 2) {
        return;
    }

    this.move(_d32['default'].event.dx, _d32['default'].event.dy, false, false, !this.options.hideTicksOnDrag);
};

/**
 * Restore previous zoom translate and scale thus cancelling the zoom behavior handling
 */
D3Table.prototype.restoreZoom = function () {
    this.behaviors.zoom.translate(this._lastTranslate);
    this.behaviors.zoom.scale(this._lastScale);
};

/**
 * Fire an event event with the given eventName prefixed with the bem block name
 * The following arguments are passed to the listeners:
 *  - ...priorityArguments
 *  - this: the D3Table instance
 *  - d3TargetSelection
 *  - d3.event
 *  - getColumn(): a function to get the x value in data space
 *  - getRow(): a function to get the y value in data space
 *  - ...extraArguments
 *
 * @param {String} eventName
 * @param {d3.Selection} [d3TargetSelection]
 * @param {[Number,Number]} [delta]
 * @param {Array<*>} [priorityArguments]
 * @param {Array<*>} [extraArguments]
 */
D3Table.prototype.emitDetailedEvent = function (eventName, d3TargetSelection, delta, priorityArguments, extraArguments) {

    if (this._preventEventEmission) {
        return;
    }

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

/**
 * Update margins and update transforms
 *
 * @param {Boolean} [updateDimensions] True means it has to update X and Y
 */
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
        this.updateXY();
    }
};

/**
 *
 * @param {Array<D3TableRow>} data
 * @param {Number} [transitionDuration]
 * @param {Boolean} [animateY]
 * @returns {d3Timeline.D3Table}
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
 *
 * @param {Date} minX
 * @param {Date} maxX
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.setXRange = function (minX, maxX) {

    this.minX = minX;
    this.maxX = maxX;

    this.scales.x.domain([this.minX, this.maxX]);

    this.updateX().updateXAxisInterval().drawXAxis().drawYAxis().drawElements();

    return this;
};

/**
 * Set available width and height so that every thing update correspondingly
 *
 * @param {Number} availableWidth
 * @param {Number} availableHeight
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.setAvailableDimensions = function (availableWidth, availableHeight) {

    this._disabled = true;
    var _lastAvailableWidth = this._lastAvailableWidth;
    var _lastAvailableHeight = this._lastAvailableHeight;
    this.setAvailableWidth(availableWidth);
    this.setAvailableHeight(availableHeight);
    this._disabled = false;

    var isAvailableWidthChanging = _lastAvailableWidth !== this._lastAvailableWidth;
    var isAvailableHeightChanging = _lastAvailableHeight !== this._lastAvailableHeight;

    if (isAvailableWidthChanging || isAvailableHeightChanging || this._dimensionsChangeCount === 2) {
        this.updateX().updateXAxisInterval().drawXAxis().drawYAxis().drawElements();
    }

    return this;
};

/**
 * Set available width so that every thing update correspondingly
 *
 * @param {Number} availableWidth
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.setAvailableWidth = function (availableWidth) {

    this._dimensionsChangeCount += 1;

    var isAvailableWidthChanging = availableWidth !== this._lastAvailableWidth;
    this._lastAvailableWidth = availableWidth;

    this.dimensions.width = this._lastAvailableWidth - this.margin.left - this.margin.right;

    if (!this._disabled && (isAvailableWidthChanging || this._dimensionsChangeCount === 1)) {
        this.updateX().updateXAxisInterval().drawXAxis().drawYAxis().drawElements();
    }

    return this;
};

/**
 * Set available height so that every thing update correspondingly
 *
 * @param {Number} availableHeight
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.setAvailableHeight = function (availableHeight) {

    this._dimensionsChangeCount += 1;

    var isAvailableHeightChanging = availableHeight !== this._lastAvailableHeight;
    this._lastAvailableHeight = availableHeight;

    this._maxBodyHeight = this._lastAvailableHeight - this.margin.top - this.margin.bottom;

    if (!this._disabled && (isAvailableHeightChanging || this._dimensionsChangeCount === 1)) {
        this.updateY().drawXAxis().drawYAxis().drawElements();
    }

    return this;
};

/**
 * Update elements which depends on x and y dimensions
 *
 * @param {Number} [transitionDuration]
 */
D3Table.prototype.updateXY = function (transitionDuration) {
    this._preventEventEmission = true;
    this.updateX(transitionDuration);
    this._preventEventEmission = false;
    this.updateY(transitionDuration);
};

/**
 * Update elements which depends on x dimension
 *
 * @param {Number} [transitionDuration]
 */
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

/**
 * Update elements which depends on y dimension
 *
 * @param {Number} [transitionDuration]
 */
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

/**
 * Update column with, basically the width corresponding to 1 unit in x data dimension
 *
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.updateXAxisInterval = function () {

    this.columnWidth = this.scales.x(1) - this.scales.x(0);

    return this;
};

/**
 * Draw the x axises
 *
 * @param {Number} [transitionDuration]
 * @param {Boolean} [skipTicks] Should not draw tick lines
 * @returns {d3Timeline.D3Table}
 */
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

/**
 * Draw the y axis
 *
 * @param {Number} [transitionDuration]
 * @param {Boolean} [skipTicks] Should not draw tick lines
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.drawYAxis = function drawYAxis(transitionDuration, skipTicks) {

    if (this._preventDrawing) {
        return this;
    }

    this.axises.x.innerTickSize(skipTicks ? 0 : -this.dimensions.height);

    var domainY = this.scales.y.domain();

    this.axises.y.tickValues(_d32['default'].range(Math.round(domainY[0]), Math.round(domainY[1]), 1));

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

/**
 * This clone method does not clone the entities itself
 *
 * @returns {Array<D3TableRow>}
 */
D3Table.prototype.cloneData = function () {

    var self = this;

    return this.data.map(function (d) {

        /**
         * @type {d3Timeline.D3TableRow}
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
 *
 * @returns {Array<D3TableElement>}
 */
D3Table.prototype.cloneFlattenedData = function () {
    return this.flattenedData.map(function (e) {

        /**
         * @type {d3Timeline.D3TableElement}
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
 *
 * @returns {d3Timeline.D3TableElement}
 */
D3Table.prototype.cloneElement = function (e) {

    /**
     * @type {d3Timeline.D3TableElement}
     */
    var res = {};

    for (var key in e) {
        if (e.hasOwnProperty(key)) {
            res[key] = e[key];
        }
    }

    return res;
};

/**
 * Get the row holding the provided element (reference equality test)
 *
 * @param {d3Timeline.D3TableElement} element
 * @returns {d3Timeline.D3TableRow}
 */
D3Table.prototype.getElementRow = function (element) {
    return this._find(this.data, function (row) {
        return row.elements.indexOf(element) !== -1;
    });
};

/**
 * Store a clone of the currently bound flattened data
 */
D3Table.prototype.storeFlattenedData = function () {
    this.previousFlattenedData = this.cloneFlattenedData();
};

/**
 * Generate the new set of flattened data, storing previous set if configured so and preserving element flags
 */
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
 * Compute the transform string for a given element
 *
 * @param {d3Timeline.D3TableElement} element
 * @returns {string}
 */
D3Table.prototype.getTransformFromData = function (element) {
    return 'translate(' + this.scales.x(this.getDataStart(element)) + ',' + this.scales.y(element.rowIndex) + ')';
};

/**
 * Returns true if the element with the provided bound data should be culled
 *
 * @param {d3Timeline.D3TableElement} data
 * @returns {Boolean}
 */
D3Table.prototype.cullingFilter = function (data) {

    var domainX = this.scales.x.domain();
    var domainXStart = domainX[0];
    var domainXEnd = domainX[domainX.length - 1];

    var domainY = this.scales.y.domain();
    var domainYStart = domainY[0];
    var domainYEnd = domainY[domainY.length - 1];

    return data._defaultPrevented ||
    // NOT x culling AND NOT y culling

    // NOT x culling
    (!this.options.cullingX || !(this.getDataEnd(data) < domainXStart || this.getDataStart(data) > domainXEnd)) && (
    // NOT y culling
    !this.options.cullingY || data.rowIndex >= domainYStart - this.options.cullingDistance && data.rowIndex < domainYEnd + this.options.cullingDistance - 1);
};

/**
 * Get start value of the provided data, used to represent element start
 *
 * @param {d3Timeline.D3TableElement} data
 * @returns {number}
 */
D3Table.prototype.getDataStart = function (data) {
    return +data.start;
};

/**
 * Get end value of the provided data, used to represent element end
 *
 * @param {d3Timeline.D3TableElement} data
 * @returns {number}
 */
D3Table.prototype.getDataEnd = function (data) {
    return +data.end;
};

/**
 * Move the elements with clamping the asked move and returned what it finally did with the asked x and y delta
 *
 * @param {Number} [dx] Asked x move delta
 * @param {Number} [dy] Asked y move delta
 * @param {Boolean} [forceDraw] Should the elements be redrawn instead of translating the inner container
 * @param {Boolean} [skipXAxis] Should the x axis not be redrawn
 * @param {Boolean} [forceTicks] Should the tick lines be drawn
 * @returns {[Number, Number, Number, Number]} Final translate x, final translate y, translate x delta, translate y delta
 */
D3Table.prototype.move = function (dx, dy, forceDraw, skipXAxis, forceTicks) {

    dx = dx || 0;
    dy = dy || 0;

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

/**
 * Move elements, switching between drawing methods depending on arguments
 * Basically, it should be used to that is chooses optimized drawing (translating the inner container) is there is no scale change.
 *
 * @param {Boolean} [forceDraw] Force the elements to be drawn without translation optimization
 * @param {Boolean} [skipXAxis] Skip x axis being redrawn (always the case when the scale does not change on move)
 * @param {Boolean} [forceTicks] Force ticks to be redrawn; if false then they will be hidden
 */
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

/**
 * Draw elements (entering, exiting, updating)
 *
 * @param {Number} [transitionDuration]
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.drawElements = function (transitionDuration) {

    if (this._preventDrawing) {
        return this;
    }

    this.stopElementTransition();

    var self = this;

    if (this._elementsAF) {
        this.cancelAnimationFrame(this._elementsAF);
    }

    this._elementsAF = this.requestAnimationFrame(function () {

        /**
         * Map of start transform strings for all elements
         *
         * @type {Object<String>}
         */
        var startTransformMap = {};

        /**
         * Map of end transform strings for all elements
         *
         * @type {Object<String>}
         */
        var endTransformMap = {};

        // fill both transform string maps

        if (self.options.usePreviousDataForTransform && transitionDuration > 0) {
            if (self.previousFlattenedData) {
                self.previousFlattenedData.forEach(
                /**
                 * @param {d3Timeline.D3TableElement} data
                 */
                function (data) {
                    if (!startTransformMap[data.uid]) {
                        startTransformMap[data.id] = startTransformMap[data.uid] = self.getTransformFromData(data);
                    }
                });
            }
            if (self.flattenedData) {
                self.flattenedData.forEach(
                /**
                 * @param {d3Timeline.D3TableElement} data
                 */
                function (data) {
                    if (!endTransformMap[data.uid]) {
                        endTransformMap[data.id] = endTransformMap[data.uid] = self.getTransformFromData(data);
                    }
                });
            }
        }

        // filter with culling logic
        var data = self.flattenedData.filter(self.cullingFilter.bind(self));

        var groups = self.elements.innerContainer.selectAll('g.' + self.options.bemBlockName + '-element').data(data, function (d) {
            return d.uid;
        });

        // handle exiting elements

        var exiting = groups.exit();

        if (self.options.enableTransitionOnExit && transitionDuration > 0) {

            exiting.each(
            /**
             * @param {d3Timeline.D3TableElement} data
             */
            function (data) {

                var group = _d32['default'].select(this);

                self.elementExit(group, data);

                // flag the element as removed
                data._removed = true;

                var exitTransform = endTransformMap[data.uid] || endTransformMap[data.id];

                if (exitTransform) {
                    self.wrapWithAnimation(group, transitionDuration).attr('transform', exitTransform).remove();
                } else {
                    group.remove();
                }

                self.emitDetailedEvent('element:remove', group, null, [data]);
            });
        } else {
            exiting.remove();
        }

        // handle entering elements

        groups.enter().append('g').attr('class', self.options.bemBlockName + '-element').each(function (data) {
            self.elementEnter(_d32['default'].select(this), data);
        });

        // handle all elements existing after entering

        groups.each(
        /**
         * @param {d3Timeline.D3TableElement} data
         */
        function (data) {

            if (data._removed) {
                return;
            }

            var group = _d32['default'].select(this);

            if (data._defaultPrevented) {

                self.elementUpdate(group, data, transitionDuration);

                return;
            }

            var isUpdate = data._positioned;

            var newTransform = endTransformMap[data.uid] || endTransformMap[data.id] || self.getTransformFromData(data);

            if (transitionDuration > 0) {

                var originTransform = startTransformMap[data.uid] || startTransformMap[data.id] || newTransform;
                var modifiedOriginTransform;

                if (!isUpdate && self.options.usePreviousDataForTransform) {
                    if (originTransform) {
                        modifiedOriginTransform = originTransform;
                        group.attr('transform', originTransform);
                    }
                }

                self.wrapWithAnimation(group, transitionDuration).attrTween("transform", function () {
                    var originTransform = modifiedOriginTransform || group.attr('transform');
                    if (self.options.enableYTransition) {
                        return _d32['default'].interpolateTransform(originTransform, newTransform);
                    } else {
                        var startTransform = _d32['default'].transform(originTransform);
                        var endTransform = _d32['default'].transform(newTransform);
                        startTransform.translate[1] = endTransform.translate[1];
                        return _d32['default'].interpolateTransform(startTransform.toString(), endTransform.toString());
                    }
                });
            } else {
                group.attr('transform', newTransform);
            }

            data._positioned = true;

            self.elementUpdate(group, data, transitionDuration);
        });

        self.currentElementsGroupTranslate = [0.0, 0.0];
        self.elements.innerContainer.attr('transform', null);
    });

    return this;
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

D3Table.prototype.stopElementTransition = function () {
    this.elements.innerContainer.selectAll('g.' + this.options.bemBlockName + '-element').transition();
};

/**
 * @param {d3.Selection} selection
 * @param {d3Timeline.D3TableElement} element
 * @returns {d3.Selection}
 */
D3Table.prototype.elementEnter = function (selection, element) {
    return selection;
};

/**
 * @param {d3.Selection} selection
 * @param {d3Timeline.D3TableElement} element
 * @param {Number} transitionDuration
 * @returns {d3.Selection}
 */
D3Table.prototype.elementUpdate = function (selection, element, transitionDuration) {
    return selection;
};

/**
 * @param {d3.Selection} selection
 * @param {d3Timeline.D3TableElement} element
 * @returns {d3.Selection}
 */
D3Table.prototype.elementExit = function (selection, element) {
    return selection;
};

/**
 * Wrap the selection with a d3 transition if the transition duration is greater than 0
 *
 * @param {d3.Selection} selection
 * @param {Number} [transitionDuration]
 * @returns {d3.Selection|d3.Transition}
 */
D3Table.prototype.wrapWithAnimation = function (selection, transitionDuration) {
    if (transitionDuration > 0) {
        return selection.transition().duration(transitionDuration).ease(this.options.transitionEasing);
    } else {
        return selection;
    }
};

/**
 * Proxy to request animation frames
 * Ensure all listeners register before the next frame are played in the same sequence
 *
 * @param {Function} listener
 * @returns {Function}
 */
D3Table.prototype.requestAnimationFrame = function (listener) {

    var self = this;

    this._nextAnimationFrameHandlers.push(listener);

    if (this._nextAnimationFrameHandlers.length === 1) {
        requestAnimationFrame(function () {
            var g;
            while (g = self._nextAnimationFrameHandlers.shift()) g();
        });
    }

    return listener;
};

/**
 * Proxy to cancel animation frame
 * Remove the listener from the list of functions to be played on next animation frame
 *
 * @param {Function} listener
 */
D3Table.prototype.cancelAnimationFrame = function (listener) {

    var index = this._nextAnimationFrameHandlers.length > 0 ? this._nextAnimationFrameHandlers.indexOf(listener) : -1;

    if (index !== -1) {
        this._nextAnimationFrameHandlers.splice(index, 1);
    }
};

/**
 * Call a move forcing the drawings to fit within scale domains
 *
 * @returns {[Number,Number,Number,Number]}
 */
D3Table.prototype.ensureInDomains = function () {
    return this.move(0, 0, false, false, true);
};

/**
 * Toggle internal drawing prevent flag
 *
 * @param {Boolean} [active] If not provided, it negates the current flag value
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.toggleDrawing = function (active) {

    this._preventDrawing = typeof active === 'boolean' ? !active : !this._preventDrawing;

    return this;
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

/**
 * Clamped provided translation based on dimensions and current provided scales
 *
 * @param {[Number,Number]} translate
 * @param {[Number,Number]} scale
 * @returns {[Number,Number]}
 * @private
 */
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

var d3Timeline = {};

/**
 * Table marker options which knows how to represent itself in a {@link d3Timeline.D3Table#container}
 *
 * @param {d3Timeline.D3TableMarkerOptions} options
 * @constructor
 */
d3Timeline.D3TableMarker = function D3TableMarker(options) {

    _eventsEvents2['default'].call(this);

    this.options = (0, _extend2['default'])(true, {}, this.defaults, options);

    /**
     * @type {d3Timeline.D3Table}
     */
    this.table = null;

    /**
     * @type {d3.Selection}
     */
    this.container = null;

    /**
     * @type {{line: d3.Selection, label: d3.Selection}}
     */
    this.elements = {};

    /**
     * @type {Number}
     */
    this.value = null;

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
    this._lastTimeUpdated = null;
};

var D3TableMarker = d3Timeline.D3TableMarker;

(0, _inherits2['default'])(D3TableMarker, _eventsEvents2['default']);

D3TableMarker.prototype.LAYOUT_HORIZONTAL = 'horizontal';
D3TableMarker.prototype.LAYOUT_VERTICAL = 'vertical';

/**
 * @type {d3Timeline.D3TableMarkerOptions}
 */
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
 * Set the table it should draw itself onto
 * @param {d3Timeline.D3Table} table
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

/**
 * Compare two values
 * To be overridden if you wish the marker not to be moved for some value changes which should not impact the marker position
 *
 * @param {Number} a
 * @param {Number} b
 * @returns {Boolean}
 */
D3TableMarker.prototype.valueComparator = function (a, b) {
    return +a !== +b;
};

/**
 * Set the value for the marker, which updates if it needs to
 *
 * @param {Number} value
 * @param {Boolean} [silent]
 */
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

/**
 * Value getter from d3 selection datum which should be made of a value
 * To be overridden if you wish to alter this value dynamically
 *
 * @param {value: Number} data
 * @returns {*}
 */
D3TableMarker.prototype.getValue = function (data) {
    return data.value;
};

/**
 * Handle a D3Table being bound
 */
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

/**
 * Set the correct dimensions and label content
 *
 * @param {Number} [transitionDuration]
 */
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

/**
 * Handle D3Table unbound
 *
 * @param {d3Timeline.D3Table} previousTable
 */
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

/**
 * Move the marker requesting an animation frame
 *
 * @param {Number} [transitionDuration]
 */
D3TableMarker.prototype.move = function (transitionDuration) {

    if (this._moveAF) {
        this.table.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = this.table.requestAnimationFrame(this.moveSync.bind(this));
};

/**
 * Move the marker synchronously
 */
D3TableMarker.prototype.moveSync = function () {

    if (!this.table) {
        return;
    }

    var self = this;
    var layout = this.options.layout;

    this.container.each(function (data) {

        var value = self.getValue(data);

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

        var group = _d32['default'].select(this);

        if (isInRange) {

            self.show();

            group.attr('transform', 'translate(' + (self.table.margin.left + position[0] >> 0) + ',' + (self.table.margin.top + position[1] >> 0) + ')');

            group.select('.' + self.options.bemBlockName + '-label').text(self.options.formatter.call(self, value));
        } else {
            self.hide();
        }
    });
};

/**
 * Show the marker
 */
D3TableMarker.prototype.show = function () {
    if (this.container) {
        this.container.style('display', '');
    }
};

/**
 * Hide the marker
 */
D3TableMarker.prototype.hide = function () {
    if (this.container) {
        this.container.style('display', 'none');
        this.container.datum({
            value: null
        });
    }
};

/**
 * Implement resizing the marker, which should be called on D3Table resize event
 *
 * @param transitionDuration
 */
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

var _extend2 = _interopRequireDefault(_extend);

var d3Timeline = {};

/**
 * Mouse position tracker which responds to D3Table events (which listens itself to mouse events)
 *
 * @param {d3Timeline.D3TableMouseTrackerOptions} options
 * @extends {d3Timeline.D3TableMarker}
 * @constructor
 */
d3Timeline.D3TableMouseTracker = function D3TableMouseTracker(options) {
    _D3TableMarker2['default'].call(this, options);

    this._tableMouseenterListener = null;
    this._tableMousemoveListener = null;
    this._tableMouseleaveListener = null;

    this._moveAF = null;

    this.on('marker:bound', this.handleTableBound.bind(this));
    this.on('marker:unbound', this.handleTableUnbound.bind(this));

    this._isListeningToTouchEvents = false;

    /**
     * @name d3Timeline.D3TableMouseTracker#options
     * @type {d3Timeline.D3TableMouseTrackerOptions}
     */
};

var D3TableMouseTracker = d3Timeline.D3TableMouseTracker;

(0, _inherits2['default'])(D3TableMouseTracker, _D3TableMarker2['default']);

/**
 * @type {d3Timeline.D3TableMouseTrackerOptions}
 */
D3TableMouseTracker.prototype.defaults = (0, _extend2['default'])(true, {}, _D3TableMarker2['default'].prototype.defaults, {
    bemModifiers: ['mouseTracker'],
    listenToTouchEvents: true
});

/**
 * Implement the listener for D3Table being bound
 */
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

/**
 * Implement the listener for D3Table being unbound
 */
D3TableMouseTracker.prototype.handleTableUnbound = function (previousTable) {

    previousTable.removeListener(previousTable.options.bemBlockName + ':mouseenter', this._tableMouseenterListener);
    previousTable.removeListener(previousTable.options.bemBlockName + ':mousemove', this._tableMousemoveListener);
    previousTable.removeListener(previousTable.options.bemBlockName + ':mouseleave', this._tableMouseleaveListener);

    if (this._isListeningToTouchEvents) {
        previousTable.removeListener(previousTable.options.bemBlockName + ':touchmove', this._tableMousemoveListener);
    }
};

/**
 * Implement getting x and y positions from D3Table event
 *
 * @param {d3Timeline.D3Table} table
 * @param {d3.Selection} selection
 * @param {d3.Event} d3Event
 * @param {Function} getTime
 * @param {Function} getRow
 *
 * @see d3Timeline.D3Table#emitDetailedEvent for arguments description
 * @returns {*}
 */
D3TableMouseTracker.prototype.getValueFromTableEvent = function (table, selection, d3Event, getTime, getRow) {
    switch (this.options.layout) {
        case 'vertical':
            return getTime();
        case 'horizontal':
            return getRow();
    }
};

/**
 * Implement mouse enter handling
 *  - show the marker and set the value from mouse position
 *
 * @param {d3Timeline.D3Table} table
 * @param {d3.Selection} selection
 * @param {d3.Event} d3Event
 * @param {Function} getTime
 * @param {Function} getRow
 *
 * @see d3Timeline.D3Table#emitDetailedEvent for arguments description
 * @returns {*}
 */
D3TableMouseTracker.prototype.handleMouseenter = function (table, selection, d3Event, getTime, getRow) {

    var self = this;

    var time = this.getValueFromTableEvent.apply(this, arguments);

    table.requestAnimationFrame(function () {
        self.show();
        self.setValue(time);
    });
};

/**
 * Implement mouse move handling
 *  - set the value from mouse position
 *
 * @param {d3Timeline.D3Table} table
 * @param {d3.Selection} selection
 * @param {d3.Event} d3Event
 * @param {Function} getTime
 * @param {Function} getRow
 *
 * @see d3Timeline.D3Table#emitDetailedEvent for arguments description
 * @returns {*}
 */
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

/**
 * Implement mouse leave handling
 *  - hide the marker and set the value from mouse position
 *
 * @param {d3Timeline.D3Table} table
 * @param {d3.Selection} selection
 * @param {d3.Event} d3Event
 * @param {Function} getTime
 * @param {Function} getRow
 *
 * @see d3Timeline.D3Table#emitDetailedEvent for arguments description
 * @returns {*}
 */
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

var _extend2 = _interopRequireDefault(_extend);

var d3Timeline = {};

/**
 * A D3TableValueTracker is a D3TableMarker which behaves alone and can be started and stopped,
 * getting its value from the implemented valueGetter
 *
 * @see d3.timer to understand how it behaves automatically
 * @param {d3Timeline.D3TableMarkerOptions} options
 * @extends {d3Timeline.D3TableMarker}
 * @constructor
 */
d3Timeline.D3TableValueTracker = function D3TableValueTracker(options) {
  _D3TableMarker2['default'].call(this, options);

  this.enabled = false;
};

var D3TableValueTracker = d3Timeline.D3TableValueTracker;

(0, _inherits2['default'])(D3TableValueTracker, _D3TableMarker2['default']);

/**
 * @type {d3Timeline.D3TableMarkerOptions}
 */
D3TableValueTracker.prototype.defaults = (0, _extend2['default'])(true, {}, _D3TableMarker2['default'].prototype.defaults, {
  bemModifiers: ['valueTracker']
});

/**
 * By default, the value it gets is 0
 *
 * @returns {Number}
 */
D3TableValueTracker.prototype.valueGetter = function () {

  return 0;
};

/**
 * Start the tracker
 */
D3TableValueTracker.prototype.start = function () {

  var self = this;

  this.enabled = true;

  d3.timer(function () {

    self.setValue(self.valueGetter());

    return !self.enabled;
  });
};

/**
 * Stop the tracker
 */
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

var _d32 = _interopRequireDefault(_d3);

var d3Timeline = {};

/**
 * Timeline version of a D3BlockTable with
 *  - time scale as x scale
 *  - and special methods proxying to D3BlockTable methods
 *
 *
 * @param {d3Timeline.D3TimelineOptions} options
 * @constructor
 * @extends {d3Timeline.D3BlockTable}
 */
d3Timeline.D3Timeline = function D3Timeline(options) {

    _D3BlockTable2['default'].call(this, options);

    this.currentTimeInterval = this.options.minimumTimeInterval;

    /**
     * @name d3Timeline.D3Timeline#options
     * @type {d3Timeline.D3TimelineOptions}
     */
};

var D3Timeline = d3Timeline.D3Timeline;

(0, _inherits2['default'])(D3Timeline, _D3BlockTable2['default']);

/**
 * @type {d3Timeline.D3TimelineOptions}
 */
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

/**
 * Time scale as x scale
 * @returns {d3.time.Scale}
 */
D3Timeline.prototype.xScaleFactory = function () {
    return _d32['default'].time.scale();
};

/**
 * Use data start property without casting
 *
 * @param {d3Timeline.D3TableElement} data
 * @returns {start|any}
 */
D3Timeline.prototype.getDataStart = function (data) {
    return data.start;
};

/**
 * Use data end property without casting
 *
 * @param {d3Timeline.D3TableElement} data
 * @returns {start|any}
 */
D3Timeline.prototype.getDataEnd = function (data) {
    return data.end;
};

/**
 * Override update x axis interval implement with column width update based on instance options:
 *  - minimumColumnWidth: the column width should never be lower than that
 *  - minimumTimeInterval: the time interval should never be lower than that
 *  - availableTimeIntervals: the list of available time intervals
 *
 * @returns {d3Timeline.D3Timeline}
 */
D3Timeline.prototype.updateXAxisInterval = function () {

    var self = this;

    var minimumTimeInterval = this.options.minimumTimeInterval;
    var minimumColumnWidth = this.options.minimumColumnWidth;
    var currentTimeInterval = this.currentTimeInterval;
    var availableTimeIntervals = this.options.availableTimeIntervals;
    var currentTimeIntervalIndex = availableTimeIntervals.indexOf(currentTimeInterval);
    var currentColumnWidth = this._computeColumnWidthFromTimeInterval(currentTimeInterval);

    // private function to increase/decrease time interval by index delta in the available time intervals and update time interval and column width
    function translateTimeInterval(delta) {
        currentTimeIntervalIndex += delta;
        currentTimeInterval = availableTimeIntervals[currentTimeIntervalIndex];
        currentColumnWidth = self._computeColumnWidthFromTimeInterval(currentTimeInterval);
    }

    if (availableTimeIntervals.length > 0) {
        // if lower, increase
        if (currentColumnWidth < minimumColumnWidth) {
            // stop when it's higher
            while (currentColumnWidth < minimumColumnWidth && currentTimeIntervalIndex < availableTimeIntervals.length - 1) {
                translateTimeInterval(1);
            }
        }
        // if greater decrease
        else if (currentColumnWidth > minimumColumnWidth) {
                // stop when it's lower
                while (currentColumnWidth > minimumColumnWidth && currentTimeIntervalIndex > 0) {
                    translateTimeInterval(-1);
                }
                // then increase once
                translateTimeInterval(1);
            }
    }

    // if time interval is lower than the minimum, set it to the minimum and compute column width
    if (currentTimeInterval < minimumTimeInterval) {
        currentTimeInterval = minimumTimeInterval;
        currentColumnWidth = self._computeColumnWidthFromTimeInterval(currentTimeInterval);
    }

    // keep floor values
    this.currentTimeInterval = Math.floor(currentTimeInterval);
    this.columnWidth = Math.floor(currentColumnWidth);

    // update axises ticks
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

/**
 * Proxy to {@link d3Timeline.D3Table#setXRange}
 *
 * @param {Date} minDate
 * @param {Date} maxDate
 * @returns {d3Timeline.D3Timeline}
 */
D3Timeline.prototype.setTimeRange = function (minDate, maxDate) {
    return this.setXRange(minDate, maxDate);
};

/**
 * Compute column width from a provided time interval
 *
 * @param {Number} timeInterval
 * @returns {Number}
 * @private
 */
D3Timeline.prototype._computeColumnWidthFromTimeInterval = function (timeInterval) {
    return this.scales.x(new Date(timeInterval)) - this.scales.x(new Date(0));
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

var _extend2 = _interopRequireDefault(_extend);

var d3Timeline = {};

/**
 * Timeline time tracker which can be started and stopped as it is a {@link d3Timeline.D3TableValueTracker}
 *
 * @extends {d3Timeline.D3TableValueTracker}
 * @constructor
 */
d3Timeline.D3TimelineTimeTracker = function D3TimelineTimeTracker(options) {
  _D3TableValueTracker2['default'].call(this, options);

  /**
   * @name d3Timeline.D3TimelineTimeTracker#value
   * @type {Date}
   */
};

var D3TimelineTimeTracker = d3Timeline.D3TimelineTimeTracker;

(0, _inherits2['default'])(D3TimelineTimeTracker, _D3TableValueTracker2['default']);

/**
 * @type {d3Timeline.D3TableMarkerOptions}
 */
D3TimelineTimeTracker.prototype.defaults = (0, _extend2['default'])(true, {}, _D3TableValueTracker2['default'].prototype.defaults, {
  bemBlockName: 'timelineMarker',
  bemModifiers: ['timeTracker'],
  layout: 'vertical'
});

/**
 * Get the current time
 * To be overridden if you wish to represent a biased time for example
 *
 * @returns {Date}
 */
D3TimelineTimeTracker.prototype.timeGetter = function () {
  return new Date();
};

/**
 * Proxy to {@link d3Timeline.D3TableValueTracker#timeGetter}
 *
 * @returns {Date}
 */
D3TimelineTimeTracker.prototype.valueGetter = function () {
  return this.timeGetter();
};

/**
 * Compare times, defaults to {@link d3Timeline.D3TableValueTracker#valueComparator}
 *
 * @type {Function|*}
 */
D3TimelineTimeTracker.prototype.timeComparator = _D3TableValueTracker2['default'].prototype.valueComparator;

/**
 * Proxy to {@link d3Timeline.D3TimelineTimeTracker.timeComparator}
 *
 * @param {Date} a
 * @param {Date} b
 */
D3TimelineTimeTracker.prototype.valueComparator = function (a, b) {
  return this.timeComparator(a, b);
};

/**
 * Proxy to {@link d3Timeline.D3TableValueTracker#setValue}
 * To be overridden if you which to alter the value set
 *
 * @param {Date} time
 */
D3TimelineTimeTracker.prototype.setTime = function (time) {
  return this.setValue(time);
};

/**
 * Proxy to {@link d3Timeline.D3TableValueTracker#setTable}
 *
 * @param {d3Timeline.D3Timeline} timeline
 */
D3TimelineTimeTracker.prototype.setTimeline = _D3TableValueTracker2['default'].prototype.setTable;

module.exports = D3TimelineTimeTracker;

},{"./D3TableValueTracker":9,"extend":3,"inherits":4}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9pbmRleC5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL3NyYy9EM0Jsb2NrVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3hELE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOzs7QUNSakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBLFlBQVksQ0FBQzs7Ozs7Ozs7dUJBRU8sV0FBVzs7Ozt3QkFDVixVQUFVOzs7O3NCQUNaLFFBQVE7Ozs7QUFFM0IsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDOzs7Ozs7Ozs7Ozs7QUFZcEIsVUFBVSxDQUFDLFlBQVksR0FBRyxTQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUU7QUFDckQseUJBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzs7Ozs7O0NBTS9CLENBQUM7O0FBRUYsSUFBSSxZQUFZLEdBQUcsVUFBVSxDQUFDLFlB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QUFxQixDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDckQsU0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzlCLENBQUM7Ozs7Ozs7QUFPRixxQkFBcUIsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLGlDQUFvQixTQUFTLENBQUMsUUFBUSxDQUFDOztBQUVyRixNQUFNLENBQUMsT0FBTyxHQUFHLHFCQUFxQixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMuRDNUYWJsZSA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGUuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzQmxvY2tUYWJsZSA9IHJlcXVpcmUoJy4vc3JjL0QzQmxvY2tUYWJsZS5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUaW1lbGluZSA9IHJlcXVpcmUoJy4vc3JjL0QzVGltZWxpbmUnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGFibGVNYXJrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlTWFya2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlTW91c2VUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZU1vdXNlVHJhY2tlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZVZhbHVlVHJhY2tlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGltZWxpbmVUaW1lVHJhY2tlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcycpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgey8qKi99XG5cblx0cmV0dXJuIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmUsXG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzBdLFxuXHRcdGkgPSAxLFxuXHRcdGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0ZGVlcCA9IGZhbHNlO1xuXG5cdC8vIEhhbmRsZSBhIGRlZXAgY29weSBzaXR1YXRpb25cblx0aWYgKHR5cGVvZiB0YXJnZXQgPT09ICdib29sZWFuJykge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuXHRcdC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcblx0XHRpID0gMjtcblx0fSBlbHNlIGlmICgodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJykgfHwgdGFyZ2V0ID09IG51bGwpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAob3B0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbbmFtZV07XG5cdFx0XHRcdGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKHRhcmdldCAhPT0gY29weSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRcdGlmIChkZWVwICYmIGNvcHkgJiYgKGlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gaXNBcnJheShjb3B5KSkpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29weUlzQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvcHkgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZSBmcm9tICcuL0QzVGFibGUnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxudmFyIGQzVGltZWxpbmUgPSB7fTtcblxuLyoqXG4gKiBBZGQgYmVoYXZpb3JzIHRvIGEgRDNUYWJsZSB0byBoYW5kbGUgZWxlbWVudHMgYXMgdmlzdWFsIGJsb2NrcyB3aXRoOlxuICogIC0gZWxlbWVudCBkcmFnICgrIGF1dG9tYXRpYyBzY3JvbGwpXG4gKiAgLSBlbGVtZW50IGNsaXBwaW5nXG4gKiAgLSBlbGVtZW50IHRleHQgKCsgYWxpZ25tZW50KVxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlQmxvY2tPcHRpb25zfSBvcHRpb25zXG4gKiBAZXh0ZW5kcyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmQzVGltZWxpbmUuRDNCbG9ja1RhYmxlID0gZnVuY3Rpb24gRDNCbG9ja1RhYmxlKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICAvKipcbiAgICAgKiBAbmFtZSBkM1RpbWVsaW5lLkQzQmxvY2tUYWJsZSNvcHRpb25zXG4gICAgICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZUJsb2NrT3B0aW9uc31cbiAgICAgKi9cbn07XG5cbnZhciBEM0Jsb2NrVGFibGUgPSBkM1RpbWVsaW5lLkQzQmxvY2tUYWJsZTtcblxuaW5oZXJpdHMoRDNCbG9ja1RhYmxlLCBEM1RhYmxlKTtcblxuLyoqXG4gKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlQmxvY2tPcHRpb25zfVxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGNsaXBFbGVtZW50OiB0cnVlLFxuICAgIGNsaXBFbGVtZW50RmlsdGVyOiBudWxsLFxuICAgIHJlbmRlck9uQXV0b21hdGljU2Nyb2xsSWRsZTogdHJ1ZSxcbiAgICBoaWRlVGlja3NPbkF1dG9tYXRpY1Njcm9sbDogZmFsc2UsXG4gICAgYXV0b21hdGljU2Nyb2xsU3BlZWRNdWx0aXBsaWVyOiAyZS00LFxuICAgIGF1dG9tYXRpY1Njcm9sbE1hcmdpbkRlbHRhOiAzMCxcbiAgICBhcHBlbmRUZXh0OiB0cnVlLFxuICAgIGFsaWduTGVmdDogdHJ1ZSxcbiAgICBhbGlnbk9uVHJhbnNsYXRlOiB0cnVlLFxuICAgIG1heGltdW1DbGlja0RyYWdUaW1lOiAxMDAsXG4gICAgbWF4aW11bUNsaWNrRHJhZ0Rpc3RhbmNlOiAxMixcbiAgICBtaW5pbXVtRHJhZ0Rpc3RhbmNlOiA1LFxuICAgIHRyYWNrZWRFbGVtZW50RE9NRXZlbnRzOiBbJ2NsaWNrJywgJ21vdXNlZW50ZXInLCAnbW91c2VsZWF2ZSddIC8vIG5vdCBkeW5hbWljXG59KTtcblxuLyoqXG4gKiBDb21wdXRlIHRoZSBjbGlwIHBhdGggaWQgZm9yIGVhY2ggZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBQYXRoSWQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRDbGlwUGF0aF8nICsgdGhpcy5pbnN0YW5jZU51bWJlciArICdfJyArIGVsZW1lbnQudWlkO1xufTtcblxuLyoqXG4gKiBDb21wdXRlIHRoZSBjbGlwIHBhdGggbGluayBmb3IgZWFjaCBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFBhdGhMaW5rID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHJldHVybiAndXJsKCMnICsgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoSWQoZWxlbWVudCkgKyAnKSc7XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIGNsaXAgcmVjdCBpZCBmb3IgZWFjaCBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFJlY3RJZCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENsaXBSZWN0XycgKyB0aGlzLmluc3RhbmNlTnVtYmVyICsgJ18nICsgZWxlbWVudC51aWQ7XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIGNsaXAgcmVjdCBsaW5rIGZvciBlYWNoIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUmVjdExpbmsgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuICcjJyArIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdElkKGVsZW1lbnQpO1xufTtcblxuLyoqXG4gKiBJbXBsZW1lbnRzIGVsZW1lbnQgZW50ZXJpbmc6XG4gKiAgLSBhcHBlbmQgY2xpcHBlZCByZWN0XG4gKiAgLSBhcHBlbmQgdGV4dFxuICogIC0gY2FsbCB7QGxpbmsgZDNUaW1lbGluZS5EM0Jsb2NrVGFibGUjZWxlbWVudENvbnRlbnRFbnRlcn1cbiAqICAtIGNhbGwgY3VzdG9tIGRyYWcgYmVoYXZpb3JcbiAqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqL1xuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50RW50ZXIgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBlbGVtZW50SGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJvd0hlaWdodCAtIHRoaXMub3B0aW9ucy5yb3dQYWRkaW5nICogMjtcblxuICAgIHZhciByZWN0ID0gc2VsZWN0aW9uXG4gICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50QmFja2dyb3VuZCcpXG4gICAgICAgIC5hdHRyKCdoZWlnaHQnLCBlbGVtZW50SGVpZ2h0KTtcblxuICAgIHZhciBnID0gc2VsZWN0aW9uXG4gICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50Q29udGVudCcpO1xuXG4gICAgZy5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50TW92YWJsZUNvbnRlbnQnKTtcblxuXG4gICAgdmFyIGNsaXBFbGVtZW50ID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsaXBFbGVtZW50KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNsaXBFbGVtZW50RmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjbGlwRWxlbWVudCA9ICEhdGhpcy5vcHRpb25zLmNsaXBFbGVtZW50RmlsdGVyLmNhbGwodGhpcywgc2VsZWN0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsaXBFbGVtZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjbGlwRWxlbWVudCkge1xuXG4gICAgICAgIGdcbiAgICAgICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCB0aGlzLmdlbmVyYXRlQ2xpcFBhdGhMaW5rLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHJlY3RcbiAgICAgICAgICAgIC5wcm9wZXJ0eSgnaWQnLCB0aGlzLmdlbmVyYXRlQ2xpcFJlY3RJZC5iaW5kKHRoaXMpKTtcblxuICAgICAgICBzZWxlY3Rpb24uYXBwZW5kKCdjbGlwUGF0aCcpXG4gICAgICAgICAgICAucHJvcGVydHkoJ2lkJywgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoSWQuYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC5hcHBlbmQoJ3VzZScpXG4gICAgICAgICAgICAuYXR0cigneGxpbms6aHJlZicsIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdExpbmsuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zLnRyYWNrZWRFbGVtZW50RE9NRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gICAgICAgIHNlbGVjdGlvbi5vbihldmVudE5hbWUsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGlmICghZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6JyArIGV2ZW50TmFtZSwgc2VsZWN0aW9uLCBudWxsLCBbZGF0YV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kVGV4dCkge1xuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy50aW1lbGluZS1lbGVtZW50TW92YWJsZUNvbnRlbnQnKVxuICAgICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAuY2xhc3NlZCgndGltZWxpbmUtZW50aXR5TGFiZWwnLCB0cnVlKVxuICAgICAgICAgICAgLmF0dHIoJ2R5JywgdGhpcy5vcHRpb25zLnJvd0hlaWdodC8yICsgNCk7XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uLmNhbGwodGhpcy5lbGVtZW50Q29udGVudEVudGVyLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5iaW5kRHJhZ0FuZERyb3BPblNlbGVjdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpO1xuXG59O1xuXG4vKipcbiAqIEltcGxlbWVudCBlbGVtZW50IGJlaW5nIHRyYW5zbGF0ZWQ6XG4gKiAgLSBhbGlnbiB0ZXh0XG4gKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudHNUcmFuc2xhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kVGV4dCAmJiB0aGlzLm9wdGlvbnMuYWxpZ25MZWZ0ICYmIHRoaXMub3B0aW9ucy5hbGlnbk9uVHJhbnNsYXRlICYmICFlbGVtZW50Ll9kZWZhdWx0UHJldmVudGVkKSB7XG5cbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpXG4gICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyBNYXRoLm1heCgtc2VsZi5zY2FsZXMueChzZWxmLmdldERhdGFTdGFydChkYXRhKSksIDIpICsgJywwKSdcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgZWxlbWVudCBiZWluZyB1cGRhdGVkOlxuICogIC0gdHJhbnNpdGlvbiB3aWR0aFxuICogIC0gYWxpZ24gdGV4dFxuICogIC0gY2FsbCB7QGxpbmsgZDNUaW1lbGluZS5EM0Jsb2NrVGFibGUjZWxlbWVudENvbnRlbnRVcGRhdGV9XG4gKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0gdHJhbnNpdGlvbkR1cmF0aW9uXG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudFVwZGF0ZSA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZWxlbWVudCwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLndyYXBXaXRoQW5pbWF0aW9uKHNlbGVjdGlvbi5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudEJhY2tncm91bmQnKSwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICB5OiB0aGlzLm9wdGlvbnMucm93UGFkZGluZyxcbiAgICAgICAgICAgIHdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhRW5kKGQpKSAtIHNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhU3RhcnQoZCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRUZXh0ICYmIHRoaXMub3B0aW9ucy5hbGlnbkxlZnQgJiYgIWVsZW1lbnQuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBkID0+ICd0cmFuc2xhdGUoJyArIE1hdGgubWF4KC10aGlzLnNjYWxlcy54KHRoaXMuZ2V0RGF0YVN0YXJ0KGQpKSwgMikgKyAnLDApJyk7XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudENvbnRlbnRVcGRhdGUoc2VsZWN0aW9uLCBlbGVtZW50LCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH0pO1xuXG59O1xuXG4vKipcbiAqIEltcGxlbWVudCBlbGVtZW50IGV4aXRpbmc6XG4gKiAgLSByZW1vdmUgY2xpY2sgbGlzdGVuZXJcbiAqICAtIHJlbW92ZSBkcmFnIGxpc3RlbmVyc1xuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHNlbGVjdGlvblxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRFeGl0ID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBlbGVtZW50KSB7XG5cbiAgICBzZWxlY3Rpb24ub24oJ2NsaWNrJywgbnVsbCk7XG5cbiAgICBpZiAoZWxlbWVudC5fZHJhZykge1xuICAgICAgICBlbGVtZW50Ll9kcmFnLm9uKCdkcmFnc3RhcnQnLCBudWxsKTtcbiAgICAgICAgZWxlbWVudC5fZHJhZy5vbignZHJhZycsIG51bGwpO1xuICAgICAgICBlbGVtZW50Ll9kcmFnLm9uKCdkcmFnZW5kJywgbnVsbCk7XG4gICAgICAgIGVsZW1lbnQuX2RyYWcgPSBudWxsO1xuICAgIH1cblxufTtcblxuLyoqXG4gKiBXaWxsIGJlIGNhbGxlZCBvbiBzZWxlY3Rpb24gd2hlbiBlbGVtZW50IGNvbnRlbnQgZW50ZXJzXG4gKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRDb250ZW50RW50ZXIgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHt9O1xuXG4vKipcbiAqIFdpbGwgYmUgY2FsbGVkIG9uIHNlbGVjdGlvbiB3aGVuIGVsZW1lbnQgY29udGVudCB1cGRhdGVzXG4gKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRDb250ZW50VXBkYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7fTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgZWxlbWVudCBkcmFnIHdpdGggYXV0b21hdGljIHNjcm9sbCBvbiBwcm92aWRlZCBzZWxlY3Rpb25cbiAqXG4gKiBAdG9kbyBjbGVhbiB1cFxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuYmluZERyYWdBbmREcm9wT25TZWxlY3Rpb24gPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYm9keU5vZGUgPSBzZWxmLmVsZW1lbnRzLmJvZHkubm9kZSgpO1xuICAgIHZhciBkcmFnU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgLy8gcG9zaXRpb25zXG4gICAgdmFyIGN1cnJlbnRUcmFuc2Zvcm0gPSBudWxsO1xuICAgIHZhciBvcmlnaW5UcmFuc2Zvcm1TdHJpbmcgPSBudWxsO1xuICAgIHZhciBkcmFnU3RhcnRYID0gMCwgZHJhZ1N0YXJ0WSA9IDA7XG4gICAgdmFyIGVsZW1lbnRTdGFydFggPSAwLCBlbGVtZW50U3RhcnRZID0gMDtcbiAgICB2YXIgZHJhZ1Bvc2l0aW9uO1xuICAgIHZhciBzdGFydERyYWdQb3NpdGlvbjtcblxuICAgIC8vIG1vdmVtZW50c1xuICAgIHZhciB2ZXJ0aWNhbE1vdmUgPSAwO1xuICAgIHZhciBob3Jpem9udGFsTW92ZSA9IDA7XG4gICAgdmFyIHZlcnRpY2FsU3BlZWQgPSAwO1xuICAgIHZhciBob3Jpem9udGFsU3BlZWQgPSAwO1xuICAgIHZhciB0aW1lckFjdGl2ZSA9IGZhbHNlO1xuICAgIHZhciBuZWVkVGltZXJTdG9wID0gZmFsc2U7XG4gICAgdmFyIHN0YXJ0VGltZTtcblxuICAgIC8vIHJlc2V0IHN0YXJ0IHBvc2l0aW9uOiB0byBjYWxsIG9uIGRyYWcgc3RhcnQgb3Igd2hlbiB0aGluZ3MgYXJlIHJlZHJhd25cbiAgICBmdW5jdGlvbiBzdG9yZVN0YXJ0KCkge1xuICAgICAgICBjdXJyZW50VHJhbnNmb3JtID0gZDMudHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybVN0cmluZyA9IHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nKSk7XG4gICAgICAgIGVsZW1lbnRTdGFydFggPSBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVswXTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WSA9IGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdO1xuICAgICAgICBkcmFnU3RhcnRYID0gZHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICBkcmFnU3RhcnRZID0gZHJhZ1Bvc2l0aW9uWzFdO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBuZXcgZHJhZyBwb3NpdGlvbiBhbmQgbW92ZSB0aGUgZWxlbWVudFxuICAgIGZ1bmN0aW9uIHVwZGF0ZVRyYW5zZm9ybShmb3JjZURyYXcpIHtcblxuICAgICAgICB2YXIgZGVsdGFYID0gZHJhZ1Bvc2l0aW9uWzBdIC0gZHJhZ1N0YXJ0WDtcbiAgICAgICAgdmFyIGRlbHRhWSA9IGRyYWdQb3NpdGlvblsxXSAtIGRyYWdTdGFydFk7XG5cbiAgICAgICAgaWYgKGZvcmNlRHJhdyB8fCAhc2VsZi5vcHRpb25zLnJlbmRlck9uSWRsZSkge1xuICAgICAgICAgICAgc3RvcmVTdGFydChkcmFnUG9zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMF0gPSBlbGVtZW50U3RhcnRYICsgZGVsdGFYO1xuICAgICAgICBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXSA9IGVsZW1lbnRTdGFydFkgKyBkZWx0YVk7XG5cbiAgICAgICAgc2VsZWN0aW9uLmF0dHIoJ3RyYW5zZm9ybScsIGN1cnJlbnRUcmFuc2Zvcm0udG9TdHJpbmcoKSk7XG5cbiAgICB9XG5cbiAgICAvLyB0YWtlIG1pY3JvIHNlY29uZHMgaWYgcG9zc2libGVcbiAgICB2YXIgZ2V0UHJlY2lzZVRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2UgJiYgdHlwZW9mIHBlcmZvcm1hbmNlLm5vdyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIHBlcmZvcm1hbmNlLm5vdy5iaW5kKHBlcmZvcm1hbmNlKVxuICAgICAgICA6IHR5cGVvZiBEYXRlLm5vdyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICBEYXRlLm5vdy5iaW5kKERhdGUpXG4gICAgICAgICAgICA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiArKG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgfTtcblxuICAgIC8vIGhhbmRsZSBhdXRvbWF0aWMgc2Nyb2xsIGFyZ3VtZW50c1xuICAgIGZ1bmN0aW9uIGRvQXV0b21hdGljU2Nyb2xsKHRpbWVEZWx0YSwgZm9yY2VEcmF3KSB7XG5cbiAgICAgICAgLy8gY29tcHV0ZSBkZWx0YXMgYmFzZWQgb24gZGlyZWN0aW9uLCBzcGVlZCBhbmQgdGltZSBkZWx0YVxuICAgICAgICB2YXIgc3BlZWRNdWx0aXBsaWVyID0gc2VsZi5vcHRpb25zLmF1dG9tYXRpY1Njcm9sbFNwZWVkTXVsdGlwbGllcjtcbiAgICAgICAgdmFyIGRlbHRhWCA9IGhvcml6b250YWxNb3ZlICogaG9yaXpvbnRhbFNwZWVkICogdGltZURlbHRhICogc3BlZWRNdWx0aXBsaWVyO1xuICAgICAgICB2YXIgZGVsdGFZID0gdmVydGljYWxNb3ZlICogdmVydGljYWxTcGVlZCAqIHRpbWVEZWx0YSAqIHNwZWVkTXVsdGlwbGllcjtcblxuICAgICAgICAvLyB0YWtlIGdyb3VwIHRyYW5zbGF0ZSBjYW5jZWxsYXRpb24gd2l0aCBmb3JjZWQgcmVkcmF3IGludG8gYWNjb3VudCwgc28gcmVkZWZpbmUgc3RhcnRcbiAgICAgICAgaWYgKGZvcmNlRHJhdykge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZS5zbGljZSgwKTtcbiAgICAgICAgICAgIGVsZW1lbnRTdGFydFggKz0gY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMF07XG4gICAgICAgICAgICBlbGVtZW50U3RhcnRZICs9IGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlYWxNb3ZlID0gc2VsZi5tb3ZlKGRlbHRhWCwgZGVsdGFZLCBmb3JjZURyYXcsIGZhbHNlLCAhc2VsZi5vcHRpb25zLmhpZGVUaWNrc09uQXV0b21hdGljU2Nyb2xsKTtcblxuICAgICAgICBpZiAocmVhbE1vdmVbMl0gfHwgcmVhbE1vdmVbM10pIHtcbiAgICAgICAgICAgIHVwZGF0ZVRyYW5zZm9ybShmb3JjZURyYXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudFN0YXJ0WCAtPSByZWFsTW92ZVsyXTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WSAtPSByZWFsTW92ZVszXTtcblxuICAgICAgICBuZWVkVGltZXJTdG9wID0gcmVhbE1vdmVbMl0gPT09IDAgJiYgcmVhbE1vdmVbM10gPT09IDA7XG4gICAgfVxuXG5cbiAgICB2YXIgZHJhZyA9IGVsZW1lbnQuX2RyYWcgPSBkMy5iZWhhdmlvci5kcmFnKCk7XG5cbiAgICBkcmFnXG4gICAgICAgIC5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhcnREcmFnUG9zaXRpb24gPSBkcmFnUG9zaXRpb24gPSBkMy5tb3VzZShib2R5Tm9kZSk7XG5cbiAgICAgICAgICAgIHN0YXJ0VGltZSA9ICtuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICBzdG9yZVN0YXJ0KCk7XG5cbiAgICAgICAgICAgIGRhdGEuX2RlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5fZnJvemVuVWlkcy5wdXNoKGRhdGEudWlkKTtcblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2RyYWcnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIGRyYWdQb3NpdGlvbiA9IGQzLm1vdXNlKGJvZHlOb2RlKTtcblxuICAgICAgICAgICAgaWYgKCFkcmFnU3RhcnRlZCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHRpbWVEZWx0YSA9ICtuZXcgRGF0ZSgpIC0gc3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgIHZhciB0b3RhbERlbHRhWCA9IGRyYWdQb3NpdGlvblswXSAtIHN0YXJ0RHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICAgICAgICAgIHZhciB0b3RhbERlbHRhWSA9IGRyYWdQb3NpdGlvblsxXSAtIHN0YXJ0RHJhZ1Bvc2l0aW9uWzFdO1xuICAgICAgICAgICAgICAgIHZhciBkcmFnRGlzdGFuY2UgPSBNYXRoLnNxcnQodG90YWxEZWx0YVgqdG90YWxEZWx0YVgrdG90YWxEZWx0YVkqdG90YWxEZWx0YVkpO1xuXG4gICAgICAgICAgICAgICAgZHJhZ1N0YXJ0ZWQgPSAodGltZURlbHRhID4gc2VsZi5vcHRpb25zLm1heGltdW1DbGlja0RyYWdUaW1lIHx8IGRyYWdEaXN0YW5jZSA+IHNlbGYub3B0aW9ucy5tYXhpbXVtQ2xpY2tEcmFnRGlzdGFuY2UpICYmIGRyYWdEaXN0YW5jZSA+IHNlbGYub3B0aW9ucy5taW5pbXVtRHJhZ0Rpc3RhbmNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdTdGFydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6ZHJhZ3N0YXJ0Jywgc2VsZWN0aW9uLCBudWxsLCBbZGF0YV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRyYWdTdGFydGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnJywgc2VsZWN0aW9uLCBudWxsLCBbZGF0YV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbWFyZ2luRGVsdGEgPSBzZWxmLm9wdGlvbnMuYXV0b21hdGljU2Nyb2xsTWFyZ2luRGVsdGE7XG4gICAgICAgICAgICB2YXIgZFJpZ2h0ID0gbWFyZ2luRGVsdGEgLSAoc2VsZi5kaW1lbnNpb25zLndpZHRoIC0gZHJhZ1Bvc2l0aW9uWzBdKTtcbiAgICAgICAgICAgIHZhciBkTGVmdCA9IG1hcmdpbkRlbHRhIC0gZHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICAgICAgdmFyIGRCb3R0b20gPSBtYXJnaW5EZWx0YSAtIChzZWxmLmRpbWVuc2lvbnMuaGVpZ2h0IC0gZHJhZ1Bvc2l0aW9uWzFdKTtcbiAgICAgICAgICAgIHZhciBkVG9wID0gbWFyZ2luRGVsdGEgLSBkcmFnUG9zaXRpb25bMV07XG5cbiAgICAgICAgICAgIGhvcml6b250YWxTcGVlZCA9IE1hdGgucG93KE1hdGgubWF4KGRSaWdodCwgZExlZnQsIG1hcmdpbkRlbHRhKSwgMik7XG4gICAgICAgICAgICB2ZXJ0aWNhbFNwZWVkID0gTWF0aC5wb3coTWF0aC5tYXgoZEJvdHRvbSwgZFRvcCwgbWFyZ2luRGVsdGEpLCAyKTtcblxuICAgICAgICAgICAgdmFyIHByZXZpb3VzSG9yaXpvbnRhbE1vdmUgPSBob3Jpem9udGFsTW92ZTtcbiAgICAgICAgICAgIHZhciBwcmV2aW91c1ZlcnRpY2FsTW92ZSA9IHZlcnRpY2FsTW92ZTtcbiAgICAgICAgICAgIGhvcml6b250YWxNb3ZlID0gZFJpZ2h0ID4gMCA/IC0xIDogZExlZnQgPiAwID8gMSA6IDA7XG4gICAgICAgICAgICB2ZXJ0aWNhbE1vdmUgPSBkQm90dG9tID4gMCA/IC0xIDogZFRvcCA+IDAgPyAxIDogMDtcblxuICAgICAgICAgICAgdmFyIGhhc0NoYW5nZWRTdGF0ZSA9IHByZXZpb3VzSG9yaXpvbnRhbE1vdmUgIT09IGhvcml6b250YWxNb3ZlIHx8IHByZXZpb3VzVmVydGljYWxNb3ZlICE9PSB2ZXJ0aWNhbE1vdmU7XG5cbiAgICAgICAgICAgIGlmICgoaG9yaXpvbnRhbE1vdmUgfHwgdmVydGljYWxNb3ZlKSAmJiAhdGltZXJBY3RpdmUgJiYgaGFzQ2hhbmdlZFN0YXRlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGltZXJTdGFydFRpbWUgPSBnZXRQcmVjaXNlVGltZSgpO1xuXG4gICAgICAgICAgICAgICAgdGltZXJBY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgZDMudGltZXIoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRUaW1lID0gZ2V0UHJlY2lzZVRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVEZWx0YSA9IGN1cnJlbnRUaW1lIC0gdGltZXJTdGFydFRpbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVyV2lsbFN0b3AgPSAhdmVydGljYWxNb3ZlICYmICFob3Jpem9udGFsTW92ZSB8fCBuZWVkVGltZXJTdG9wO1xuXG4gICAgICAgICAgICAgICAgICAgIGRvQXV0b21hdGljU2Nyb2xsKHRpbWVEZWx0YSwgc2VsZi5vcHRpb25zLnJlbmRlck9uQXV0b21hdGljU2Nyb2xsSWRsZSAmJiB0aW1lcldpbGxTdG9wKTtcblxuICAgICAgICAgICAgICAgICAgICB0aW1lclN0YXJ0VGltZSA9IGN1cnJlbnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lcldpbGxTdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZWVkVGltZXJTdG9wID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lckFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVyV2lsbFN0b3A7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZWxmLl9kcmFnQUYpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHNlbGYuX2RyYWdBRik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuX2RyYWdBRiA9IHNlbGYucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZVRyYW5zZm9ybSk7XG5cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdkcmFnZW5kJywgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICBzZWxmLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHNlbGYuX2RyYWdBRik7XG4gICAgICAgICAgICBzZWxmLl9kcmFnQUYgPSBudWxsO1xuICAgICAgICAgICAgaG9yaXpvbnRhbE1vdmUgPSAwO1xuICAgICAgICAgICAgdmVydGljYWxNb3ZlID0gMDtcblxuICAgICAgICAgICAgZGF0YS5fZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi5fZnJvemVuVWlkcy5zcGxpY2Uoc2VsZi5fZnJvemVuVWlkcy5pbmRleE9mKGRhdGEudWlkKSwgMSk7XG5cbiAgICAgICAgICAgIHZhciBkZWx0YUZyb21Ub3BMZWZ0Q29ybmVyID0gZDMubW91c2Uoc2VsZWN0aW9uLm5vZGUoKSk7XG4gICAgICAgICAgICB2YXIgaGFsZkhlaWdodCA9IHNlbGYub3B0aW9ucy5yb3dIZWlnaHQgLyAyO1xuICAgICAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcblxuICAgICAgICAgICAgaWYgKGRyYWdTdGFydGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnZW5kJywgc2VsZWN0aW9uLCBbLWRlbHRhRnJvbVRvcExlZnRDb3JuZXJbMF0sIC1kZWx0YUZyb21Ub3BMZWZ0Q29ybmVyWzFdICsgaGFsZkhlaWdodF0sIFtkYXRhXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nLCBvcmlnaW5UcmFuc2Zvcm1TdHJpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmXG4gICAgICAgICAgICAgICAgLnVwZGF0ZVkoKVxuICAgICAgICAgICAgICAgIC5kcmF3WUF4aXMoKTtcblxuICAgICAgICAgICAgZHJhZ1N0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICBzZWxlY3Rpb24uY2FsbChkcmFnKTtcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNCbG9ja1RhYmxlO1xuIiwiLyogZ2xvYmFsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cy9ldmVudHMnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcblxudmFyIGQzVGltZWxpbmUgPSB7fTtcblxuXG4vKipcbiAqIEFuIGluc3RhbmNlIG9mIEQzVGFibGUgdXNlcyBkMy5qcyB0byBidWlsZCBhIHN2ZyBncmlkIHdpdGggYXhpc2VzLlxuICogWW91IHNldCBhIGRhdGEgc2V0IHdpdGgge0BsaW5rIGQzVGltZWxpbmUuRDNUYWJsZS5zZXREYXRhfS5cbiAqIEVhY2ggZ3JvdXAgb2YgZWxlbWVudCB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlUm93fSBpcyBkcmF3biBpbiByb3dzICh5IGF4aXMpXG4gKiBhbmQgZWFjaCBlbGVtZW50IHtAbGluayBkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBvZiBhIHJvdyBpcyBkcmF3biBpbiB0aGlzIHJvd1xuICogVGhlcmUgaXMgbm8gZ3JhcGhpY2FsIGVsZW1lbnQgZm9yIHJvd3MuXG4gKlxuICogVGhlIHByb3ZpZGVkIG5lc3RlZCBkYXRhIHNldCBpcyBmaXJzdCBmbGF0dGVuZWQgdG8gZW5hYmxlIHRyYW5zaXRpb24gYmV0d2VlbiBkaWZmZXJlbnRzIHJvd3MuXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVPcHRpb25zfSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZDNUaW1lbGluZS5EM1RhYmxlID0gZnVuY3Rpb24gRDNUYWJsZShvcHRpb25zKSB7XG5cbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIEQzVGFibGUuaW5zdGFuY2VzQ291bnQgKz0gMTtcblxuICAgIHRoaXMuaW5zdGFuY2VOdW1iZXIgPSBEM1RhYmxlLmluc3RhbmNlc0NvdW50O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZU9wdGlvbnN9XG4gICAgICovXG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheTxEM1RhYmxlUm93Pn1cbiAgICAgKi9cbiAgICB0aGlzLmRhdGEgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheTxEM1RhYmxlRWxlbWVudD59XG4gICAgICovXG4gICAgdGhpcy5mbGF0dGVuZWREYXRhID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7e3RvcDogbnVtYmVyLCByaWdodDogbnVtYmVyLCBib3R0b206IG51bWJlciwgbGVmdDogbnVtYmVyfX1cbiAgICAgKi9cbiAgICB0aGlzLm1hcmdpbiA9IHtcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICByaWdodDogMCxcbiAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICBsZWZ0OiAwXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqL1xuICAgIHRoaXMuZGltZW5zaW9ucyA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge251bWJlcltdfVxuICAgICAqL1xuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgPSBbMC4wLCAwLjBdO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge2QzLlNlbGVjdGlvbn1cbiAgICAgKi9cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7e1xuICAgICAqICBib2R5OiBkMy5TZWxlY3Rpb24sXG4gICAgICogIGlubmVyQ29udGFpbmVyOiBkMy5TZWxlY3Rpb24sXG4gICAgICogIHhBeGlzQ29udGFpbmVyOiBkMy5TZWxlY3Rpb24sXG4gICAgICogIHgyQXhpc0NvbnRhaW5lcjogZDMuU2VsZWN0aW9uLFxuICAgICAqICB5QXhpc0NvbnRhaW5lcjogZDMuU2VsZWN0aW9uLFxuICAgICAqICBkZWZzOiBkMy5TZWxlY3Rpb24sXG4gICAgICogIGNsaXA6IGQzLlNlbGVjdGlvblxuICAgICAqIH19XG4gICAgICovXG4gICAgdGhpcy5lbGVtZW50cyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge3tcbiAgICAgKiAgeDogZDMuc2NhbGUuTGluZWFyLFxuICAgICAqICB5OiBkMy5zY2FsZS5MaW5lYXJcbiAgICAgKiB9fVxuICAgICAqL1xuICAgIHRoaXMuc2NhbGVzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7e1xuICAgICAqICB4OiBkMy5zdmcuQXhpcyxcbiAgICAgKiAgeDI6IGQzLnN2Zy5BeGlzLFxuICAgICAqICB5OiBkMy5zdmcuQXhpc1xuICAgICAqIH19XG4gICAgICovXG4gICAgdGhpcy5heGlzZXMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHt7XG4gICAgICogIHpvb206IGQzLmJlaGF2aW9yLlpvb20sXG4gICAgICogIHpvb21YOiBkMy5iZWhhdmlvci5ab29tLFxuICAgICAqICB6b29tWTogZDMuYmVoYXZpb3IuWm9vbSxcbiAgICAgKiAgcGFuOiBkMy5iZWhhdmlvci5EcmFnXG4gICAgICogfX1cbiAgICAgKi9cbiAgICB0aGlzLmJlaGF2aW9ycyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge1tOdW1iZXIsIE51bWJlcl19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtbTnVtYmVyLCBOdW1iZXJdfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fbGFzdFNjYWxlID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl95U2NhbGUgPSAwLjA7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fZGF0YUNoYW5nZUNvdW50ID0gMDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPSAwO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3ByZXZlbnREcmF3aW5nID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXk8RnVuY3Rpb24+fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9tYXhCb2R5SGVpZ2h0ID0gSW5maW5pdHk7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXk8TnVtYmVyfFN0cmluZz59XG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHRoaXMuX2Zyb3plblVpZHMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fcHJldmVudEV2ZW50RW1pc3Npb24gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fZGlzYWJsZWQgPSBmYWxzZTtcbn07XG5cbnZhciBEM1RhYmxlID0gZDNUaW1lbGluZS5EM1RhYmxlO1xuXG5pbmhlcml0cyhEM1RhYmxlLCBFdmVudEVtaXR0ZXIpO1xuXG4vKipcbiAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGVPcHRpb25zfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcbiAgICBiZW1CbG9ja05hbWU6ICd0YWJsZScsXG4gICAgYmVtQmxvY2tNb2RpZmllcjogJycsXG4gICAgeEF4aXNIZWlnaHQ6IDUwLFxuICAgIHlBeGlzV2lkdGg6IDUwLFxuICAgIHJvd0hlaWdodDogMzAsXG4gICAgcm93UGFkZGluZzogNSxcbiAgICB0aWNrUGFkZGluZzogMjAsXG4gICAgY29udGFpbmVyOiAnYm9keScsXG4gICAgY3VsbGluZ1g6IHRydWUsXG4gICAgY3VsbGluZ1k6IHRydWUsXG4gICAgY3VsbGluZ0Rpc3RhbmNlOiAxLFxuICAgIHJlbmRlck9uSWRsZTogdHJ1ZSxcbiAgICBoaWRlVGlja3NPblpvb206IGZhbHNlLFxuICAgIGhpZGVUaWNrc09uRHJhZzogZmFsc2UsXG4gICAgcGFuWU9uV2hlZWw6IHRydWUsXG4gICAgd2hlZWxNdWx0aXBsaWVyOiAxLFxuICAgIGVuYWJsZVlUcmFuc2l0aW9uOiB0cnVlLFxuICAgIGVuYWJsZVRyYW5zaXRpb25PbkV4aXQ6IHRydWUsXG4gICAgdXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtOiBmYWxzZSxcbiAgICB0cmFuc2l0aW9uRWFzaW5nOiAncXVhZC1pbi1vdXQnLFxuICAgIHhBeGlzVGlja3NGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgfSxcbiAgICB4QXhpc1N0cm9rZVdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkJTIgPyAxIDogMjtcbiAgICB9LFxuICAgIHhBeGlzMlRpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9LFxuICAgIHlBeGlzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkICYmIGQubmFtZSB8fCAnJztcbiAgICB9LFxuICAgIHBhZGRpbmc6IDEwLFxuICAgIHRyYWNrZWRET01FdmVudHM6IFsnY2xpY2snLCAnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZScsICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXSAvLyBub3QgZHluYW1pY1xufTtcblxuLyoqXG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5EM1RhYmxlLmluc3RhbmNlc0NvdW50ID0gMDtcblxuLyoqXG4gKiBOb29wIGZ1bmN0aW9uLCB3aGljaCBkb2VzIG5vdGhpbmdcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUubm9vcCA9IGZ1bmN0aW9uKCkge307XG5cbi8qKlxuICogSW5pdGlhbGl6YXRpb24gbWV0aG9kXG4gKiAgLSBjcmVhdGUgdGhlIGVsZW1lbnRzXG4gKiAgLSBpbnN0YW50aWF0ZSBkMyBpbnN0YW5jZXNcbiAqICAtIHJlZ2lzdGVyIGxpc3RlbmVyc1xuICpcbiAqIERhdGEgd2lsbCBiZSBkcmF3biBpbiB0aGUgaW5uZXIgY29udGFpbmVyXG4gKlxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gY29udGFpbmVyXG4gICAgdGhpcy5jb250YWluZXIgPSBkMy5zZWxlY3QodGhpcy5vcHRpb25zLmNvbnRhaW5lcikuYXBwZW5kKCdzdmcnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgKHRoaXMub3B0aW9ucy5iZW1CbG9ja01vZGlmaWVyID8gJyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArIHRoaXMub3B0aW9ucy5iZW1CbG9ja01vZGlmaWVyIDogJycpKTtcblxuXG4gICAgLy8gZGVmcyBhbmQgY2xpcCBpbiBkZWZzXG4gICAgdGhpcy5lbGVtZW50cy5kZWZzID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdkZWZzJyk7XG5cbiAgICB2YXIgY2xpcElkID0gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm9keUNsaXBQYXRoLS0nICsgRDNUYWJsZS5pbnN0YW5jZXNDb3VudDtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXAgPSB0aGlzLmVsZW1lbnRzLmRlZnMuYXBwZW5kKCdjbGlwUGF0aCcpXG4gICAgICAgIC5wcm9wZXJ0eSgnaWQnLCBjbGlwSWQpO1xuICAgIHRoaXMuZWxlbWVudHMuY2xpcFxuICAgICAgICAuYXBwZW5kKCdyZWN0Jyk7XG5cblxuICAgIC8vIGJhY2tncm91bmQgcmVjdCBpbiBjb250YWluZXJcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuY2xhc3NlZCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcsIHRydWUpO1xuXG5cbiAgICAvLyBheGlzZXMgY29udGFpbmVycyBpbiBjb250YWluZXJcbiAgICB0aGlzLmVsZW1lbnRzLnhBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teCcpO1xuXG4gICAgdGhpcy5lbGVtZW50cy54MkF4aXNDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS14ICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS1zZWNvbmRhcnknKTtcblxuICAgIHRoaXMuZWxlbWVudHMueUF4aXNDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS15Jyk7XG5cblxuICAgIC8vIGJvZHkgaW4gY29udGFpbmVyXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5ID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoIycgKyBjbGlwSWQgKyAnKScpO1xuXG5cbiAgICAvLyBjb250YWN0IHJlY3QsIGlubmVyIGNvbnRhaW5lciBhbmQgYm91bmRpbmcgcmVjdCBpbiBib2R5XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5jbGFzc2VkKHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JywgdHJ1ZSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyID0gdGhpcy5lbGVtZW50cy5ib2R5LmFwcGVuZCgnZycpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5jbGFzc2VkKHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcsIHRydWUpO1xuXG5cbiAgICB0aGlzLnVwZGF0ZU1hcmdpbnMoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUQzSW5zdGFuY2VzKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVFdmVudExpc3RlbmVycygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIERlc3Ryb3kgZnVuY3Rpb24sIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBpbnN0YW5jZSBoYXMgdG8gYmUgZGVzdHJveWVkXG4gKiBAdG9kbyBlbnN1cmUgbm8gbWVtb3J5IGxlYWsgd2l0aCB0aGlzIGRlc3Ryb3kgaW1wbGVtZW50YXRpb24sIGVzcGFjaWFsbHkgd2l0aCBkb20gZXZlbnQgbGlzdGVuZXJzXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpkZXN0cm95JywgdGhpcyk7XG5cbiAgICAvLyByZW1vdmUgYmVoYXZpb3IgbGlzdGVuZXJzXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS5vbignem9vbScsIG51bGwpO1xuXG4gICAgLy8gcmVtb3ZlIGRvbSBsaXN0ZW5lcnNcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkub24oJy56b29tJywgbnVsbCk7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5Lm9uKCdjbGljaycsIG51bGwpO1xuXG4gICAgdGhpcy5jb250YWluZXIucmVtb3ZlKCk7XG5cbiAgICAvLyByZW1vdmUgcmVmZXJlbmNlc1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLmVsZW1lbnRzID0gbnVsbDtcbiAgICB0aGlzLnNjYWxlcyA9IG51bGw7XG4gICAgdGhpcy5heGlzZXMgPSBudWxsO1xuICAgIHRoaXMuYmVoYXZpb3JzID0gbnVsbDtcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xuICAgIHRoaXMuZmxhdHRlbmVkRGF0YSA9IG51bGw7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6ZGVzdHJveWVkJywgdGhpcyk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgZDMgaW5zdGFuY2VzIChzY2FsZXMsIGF4aXNlcywgYmVoYXZpb3JzKVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplRDNJbnN0YW5jZXMgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuXG4gICAgLy8gc2NhbGVzXG5cbiAgICB0aGlzLnNjYWxlcy54ID0gdGhpcy54U2NhbGVGYWN0b3J5KCk7XG5cbiAgICB0aGlzLnNjYWxlcy55ID0gdGhpcy55U2NhbGVGYWN0b3J5KCk7XG5cblxuICAgIC8vIGF4aXNlc1xuXG4gICAgdGhpcy5heGlzZXMueCA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgLnNjYWxlKHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5vcmllbnQoJ3RvcCcpXG4gICAgICAgIC50aWNrRm9ybWF0KHRoaXMub3B0aW9ucy54QXhpc1RpY2tzRm9ybWF0dGVyLmJpbmQodGhpcykpXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApXG4gICAgICAgIC50aWNrUGFkZGluZyh0aGlzLm9wdGlvbnMudGlja1BhZGRpbmcpO1xuXG4gICAgdGhpcy5heGlzZXMueDIgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy54KVxuICAgICAgICAub3JpZW50KCd0b3AnKVxuICAgICAgICAudGlja0Zvcm1hdCh0aGlzLm9wdGlvbnMueEF4aXMyVGlja3NGb3JtYXR0ZXIuYmluZCh0aGlzKSlcbiAgICAgICAgLm91dGVyVGlja1NpemUoMClcbiAgICAgICAgLmlubmVyVGlja1NpemUoMCk7XG5cbiAgICB0aGlzLmF4aXNlcy55ID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAuc2NhbGUodGhpcy5zY2FsZXMueSlcbiAgICAgICAgLm9yaWVudCgnbGVmdCcpXG4gICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLm9wdGlvbnMueUF4aXNGb3JtYXR0ZXIuY2FsbChzZWxmLCBzZWxmLmRhdGFbKGR8MCldKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm91dGVyVGlja1NpemUoMCk7XG5cblxuICAgIC8vIGJlaGF2aW9yc1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSlcbiAgICAgICAgLm9uKCd6b29tJywgdGhpcy5oYW5kbGVab29taW5nLmJpbmQodGhpcykpXG4gICAgICAgIC5vbignem9vbWVuZCcsIHRoaXMuaGFuZGxlWm9vbWluZ0VuZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YID0gZDMuYmVoYXZpb3Iuem9vbSgpXG4gICAgICAgIC54KHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5zY2FsZSgxKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAueSh0aGlzLnNjYWxlcy55KVxuICAgICAgICAuc2NhbGUoMSlcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy5wYW4gPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgICAgLm9uKCdkcmFnJywgdGhpcy5oYW5kbGVEcmFnZ2luZy5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5jYWxsKHRoaXMuYmVoYXZpb3JzLnBhbik7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmNhbGwodGhpcy5iZWhhdmlvcnMuem9vbSk7XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKTtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCk7XG59O1xuXG4vKipcbiAqIHggc2NhbGUgZmFjdG9yeVxuICogQHJldHVybnMge2QzLnNjYWxlLkxpbmVhcn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUueFNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKTtcbn07XG5cbi8qKlxuICogeSBzY2FsZSBmYWN0b3J5XG4gKiBAcmV0dXJucyB7ZDMuc2NhbGUuTGluZWFyfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS55U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpO1xufTtcblxuXG4vKipcbiAqIEluaXRpYWxpemUgZXZlbnQgbGlzdGVuZXJzIGZvciBhbGwgdHJhY2tlZCBET00gZXZlbnRzXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmluaXRpYWxpemVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5vcHRpb25zLnRyYWNrZWRET01FdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudE5hbWUpIHtcblxuICAgICAgICBzZWxmLmVsZW1lbnRzLmJvZHkub24oZXZlbnROYW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChldmVudE5hbWUgIT09ICdjbGljaycgfHwgIWQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYgZDMuc2VsZWN0KGQzLmV2ZW50LnRhcmdldCkuY2xhc3NlZChzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudChldmVudE5hbWUsIHNlbGYuZWxlbWVudHMuYm9keSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn07XG5cblxuLyoqXG4gKiBQYW4gWC9ZICYgem9vbSBYIChjbGFtcGVkIHBhbiBZIHdoZW4gd2hlZWwgaXMgcHJlc3NlZCB3aXRob3V0IGN0cmwsIHpvb20gWCBhbmQgcGFuIFgvWSBvdGhlcndpc2UpXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmhhbmRsZVpvb21pbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIGlmIG5vdCBjdHJsS2V5IGFuZCBub3QgdG91Y2hlcyA+PSAyXG4gICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmICFkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5ICYmICEoZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID49IDIpKSB7XG5cbiAgICAgICAgLy8gaWYgd2hlZWxpbmcsIGF2b2lkIHpvb21pbmcgYW5kIGxldCB0aGUgd2hlZWxpbmcgaGFuZGxlciBwYW5cbiAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnR5cGUgPT09ICd3aGVlbCcpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wYW5ZT25XaGVlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZVpvb20oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVdoZWVsaW5nKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgLy8gZWxzZSBhdm9pZCB6b29taW5nIGFuZCByZXR1cm4gKHRoZSB1c2VyIGdlc3R1cmUgd2lsbCBiZSBoYW5kbGVkIGJ5IHRoZSB0aGUgcGFuIGJlaGF2aW9yXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXN0b3JlWm9vbSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHRyYW5zbGF0ZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdmFyIHVwZGF0ZWRUcmFuc2xhdGUgPSBbdHJhbnNsYXRlWzBdLCB0aGlzLl9sYXN0VHJhbnNsYXRlWzFdXTtcblxuICAgIHVwZGF0ZWRUcmFuc2xhdGUgPSB0aGlzLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlKHVwZGF0ZWRUcmFuc2xhdGUsIFt0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCksIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnNjYWxlKCldKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHVwZGF0ZWRUcmFuc2xhdGUpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnRyYW5zbGF0ZSh1cGRhdGVkVHJhbnNsYXRlKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuXG4gICAgdGhpcy5tb3ZlRWxlbWVudHModHJ1ZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25ab29tKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVHJhbnNsYXRlO1xuICAgIHRoaXMuX2xhc3RTY2FsZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJyk7XG5cbn07XG5cbi8qKlxuICogRm9yY2UgZHJhd2luZyBlbGVtZW50cywgbnVsbGlmeSBvcHRpbWl6ZWQgaW5uZXIgY29udGFpbmVyIHRyYW5zZm9ybSBhbmQgcmVkcmF3IGF4aXNlc1xuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVab29taW5nRW5kID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuICAgIHRoaXMubW92ZUVsZW1lbnRzKHRydWUpO1xuICAgIHRoaXMuZHJhd1lBeGlzKCk7XG4gICAgdGhpcy5kcmF3WEF4aXMoKTtcbn07XG5cbi8qKlxuICogQ2xhbXBlZCBwYW4gWVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVXaGVlbGluZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGV2ZW50ID0gZDMuZXZlbnQuc291cmNlRXZlbnQ7XG5cbiAgICB2YXIgZGVsdGFYID0gMCwgZGVsdGFZID0gMDtcblxuICAgIHZhciBtb3ZpbmdYID0gZXZlbnQgJiYgZXZlbnQud2hlZWxEZWx0YVggfHwgZXZlbnQuZGVsdGFYO1xuXG4gICAgLy8gaWYgbW92aW5nIHgsIGlnbm9yZSB5IGFuZCBjb21wdXRlIHggZGVsdGFcbiAgICBpZiAobW92aW5nWCkge1xuXG4gICAgICAgIHZhciBtb3ZpbmdSaWdodCA9IGV2ZW50LndoZWVsRGVsdGFYID4gMCB8fCBldmVudC5kZWx0YVggPCAwO1xuICAgICAgICBkZWx0YVggPSAobW92aW5nUmlnaHQgPyAxIDogLTEpICogdGhpcy5jb2x1bW5XaWR0aCAqIHRoaXMub3B0aW9ucy53aGVlbE11bHRpcGxpZXI7XG5cbiAgICB9XG4gICAgLy8gaWYgbm90IG1vdmluZyB4XG4gICAgZWxzZSB7XG5cbiAgICAgICAgdmFyIG1vdmluZ1kgPSBldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LndoZWVsRGVsdGFZIHx8IGV2ZW50LmRldGFpbCB8fCBldmVudC5kZWx0YVk7XG5cbiAgICAgICAgLy8gaWYgbW92aW5nIHksIGNvbXB1dGUgeSBkZWx0YVxuICAgICAgICBpZiAobW92aW5nWSkge1xuICAgICAgICAgICAgdmFyIG1vdmluZ0Rvd24gPSBldmVudC53aGVlbERlbHRhID4gMCB8fCBldmVudC53aGVlbERlbHRhWSA+IDAgfHwgZXZlbnQuZGV0YWlsIDwgMCB8fCBldmVudC5kZWx0YVkgPCAwO1xuICAgICAgICAgICAgZGVsdGFZID0gbW92aW5nWSA/IChtb3ZpbmdEb3duID8gMSA6IC0xKSAqIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgKiB0aGlzLm9wdGlvbnMud2hlZWxNdWx0aXBsaWVyIDogMDtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLy8gZmluYWxseSBtb3ZlIHRoZSBlbGVtZW50c1xuICAgIHRoaXMubW92ZShkZWx0YVgsIGRlbHRhWSwgZmFsc2UsICFtb3ZpbmdYLCB0cnVlKTtcblxufTtcblxuLyoqXG4gKiBEaXJlY3RseSB1c2UgZXZlbnQgeCBhbmQgeSBkZWx0YSB0byBtb3ZlIGVsZW1lbnRzXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmhhbmRsZURyYWdnaW5nID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBpZiBtb3JlIHRoYW4gMiB0b3VjaGVzLCByZXR1cm5cbiAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQudG91Y2hlcyAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b3VjaGVzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm1vdmUoZDMuZXZlbnQuZHgsIGQzLmV2ZW50LmR5LCBmYWxzZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25EcmFnKTtcbn07XG5cbi8qKlxuICogUmVzdG9yZSBwcmV2aW91cyB6b29tIHRyYW5zbGF0ZSBhbmQgc2NhbGUgdGh1cyBjYW5jZWxsaW5nIHRoZSB6b29tIGJlaGF2aW9yIGhhbmRsaW5nXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnJlc3RvcmVab29tID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUodGhpcy5fbGFzdFRyYW5zbGF0ZSk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSh0aGlzLl9sYXN0U2NhbGUpO1xufTtcblxuLyoqXG4gKiBGaXJlIGFuIGV2ZW50IGV2ZW50IHdpdGggdGhlIGdpdmVuIGV2ZW50TmFtZSBwcmVmaXhlZCB3aXRoIHRoZSBiZW0gYmxvY2sgbmFtZVxuICogVGhlIGZvbGxvd2luZyBhcmd1bWVudHMgYXJlIHBhc3NlZCB0byB0aGUgbGlzdGVuZXJzOlxuICogIC0gLi4ucHJpb3JpdHlBcmd1bWVudHNcbiAqICAtIHRoaXM6IHRoZSBEM1RhYmxlIGluc3RhbmNlXG4gKiAgLSBkM1RhcmdldFNlbGVjdGlvblxuICogIC0gZDMuZXZlbnRcbiAqICAtIGdldENvbHVtbigpOiBhIGZ1bmN0aW9uIHRvIGdldCB0aGUgeCB2YWx1ZSBpbiBkYXRhIHNwYWNlXG4gKiAgLSBnZXRSb3coKTogYSBmdW5jdGlvbiB0byBnZXQgdGhlIHkgdmFsdWUgaW4gZGF0YSBzcGFjZVxuICogIC0gLi4uZXh0cmFBcmd1bWVudHNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gW2QzVGFyZ2V0U2VsZWN0aW9uXVxuICogQHBhcmFtIHtbTnVtYmVyLE51bWJlcl19IFtkZWx0YV1cbiAqIEBwYXJhbSB7QXJyYXk8Kj59IFtwcmlvcml0eUFyZ3VtZW50c11cbiAqIEBwYXJhbSB7QXJyYXk8Kj59IFtleHRyYUFyZ3VtZW50c11cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZW1pdERldGFpbGVkRXZlbnQgPSBmdW5jdGlvbihldmVudE5hbWUsIGQzVGFyZ2V0U2VsZWN0aW9uLCBkZWx0YSwgcHJpb3JpdHlBcmd1bWVudHMsIGV4dHJhQXJndW1lbnRzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudEV2ZW50RW1pc3Npb24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwb3NpdGlvbjtcblxuICAgIHZhciBnZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXBvc2l0aW9uKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGQzLm1vdXNlKHNlbGYuZWxlbWVudHMuYm9keS5ub2RlKCkpO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGVsdGEpKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25bMF0gKz0gZGVsdGFbMF07XG4gICAgICAgICAgICAgICAgcG9zaXRpb25bMV0gKz0gZGVsdGFbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH07XG5cbiAgICB2YXIgYXJncyA9IFtcbiAgICAgICAgdGhpcywgLy8gdGhlIHRhYmxlIGluc3RhbmNlXG4gICAgICAgIGQzVGFyZ2V0U2VsZWN0aW9uLCAvLyB0aGUgZDMgc2VsZWN0aW9uIHRhcmdldGVkXG4gICAgICAgIGQzLmV2ZW50LCAvLyB0aGUgZDMgZXZlbnRcbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29sdW1uKCkge1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy54LmludmVydChwb3NpdGlvblswXSk7XG4gICAgICAgIH0sIC8vIGEgY29sdW1uIGdldHRlclxuICAgICAgICBmdW5jdGlvbiBnZXRSb3coKSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBnZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLnkuaW52ZXJ0KHBvc2l0aW9uWzFdKTtcbiAgICAgICAgfSAvLyBhIHJvdyBnZXR0ZXJcbiAgICBdO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocHJpb3JpdHlBcmd1bWVudHMpKSB7XG4gICAgICAgIGFyZ3MgPSBwcmlvcml0eUFyZ3VtZW50cy5jb25jYXQoYXJncyk7XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZXh0cmFBcmd1bWVudHMpKSB7XG4gICAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChleHRyYUFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgYXJncy51bnNoaWZ0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOicgKyBldmVudE5hbWUpOyAvLyB0aGUgZXZlbnQgbmFtZVxuXG4gICAgdGhpcy5lbWl0LmFwcGx5KHRoaXMsIGFyZ3MpO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgbWFyZ2lucyBhbmQgdXBkYXRlIHRyYW5zZm9ybXNcbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt1cGRhdGVEaW1lbnNpb25zXSBUcnVlIG1lYW5zIGl0IGhhcyB0byB1cGRhdGUgWCBhbmQgWVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVNYXJnaW5zID0gZnVuY3Rpb24odXBkYXRlRGltZW5zaW9ucykge1xuXG4gICAgdGhpcy5tYXJnaW4gPSB7XG4gICAgICAgIHRvcDogdGhpcy5vcHRpb25zLnhBeGlzSGVpZ2h0ICsgdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIHJpZ2h0OiB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgYm90dG9tOiB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgbGVmdDogdGhpcy5vcHRpb25zLnlBeGlzV2lkdGggKyB0aGlzLm9wdGlvbnMucGFkZGluZ1xuICAgIH07XG5cbiAgICB2YXIgY29udGVudFBvc2l0aW9uID0geyB4OiB0aGlzLm1hcmdpbi5sZWZ0LCB5OiB0aGlzLm1hcmdpbi50b3AgfTtcbiAgICB2YXIgY29udGVudFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHRoaXMubWFyZ2luLmxlZnQgKyAnLCcgKyB0aGlzLm1hcmdpbi50b3AgKyAnKSc7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JylcbiAgICAgICAgLmF0dHIoY29udGVudFBvc2l0aW9uKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keVxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnhBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueDJBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueUF4aXNDb250YWluZXJcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIHRoaXMubWFyZ2luLmxlZnQgKyAnLCcgKyB0aGlzLm1hcmdpbi50b3AgKyAnKScpO1xuXG4gICAgaWYgKHVwZGF0ZURpbWVuc2lvbnMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVYWSgpO1xuICAgIH1cblxufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtBcnJheTxEM1RhYmxlUm93Pn0gZGF0YVxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFthbmltYXRlWV1cbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbihkYXRhLCB0cmFuc2l0aW9uRHVyYXRpb24sIGFuaW1hdGVZKSB7XG5cbiAgICB0aGlzLl9kYXRhQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc1NpemVDaGFuZ2luZyA9IGRhdGEubGVuZ3RoICE9PSB0aGlzLmRhdGEubGVuZ3RoO1xuXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcblxuICAgIHRoaXMuZ2VuZXJhdGVGbGF0dGVuZWREYXRhKCk7XG5cbiAgICBpZiAoaXNTaXplQ2hhbmdpbmcgfHwgdGhpcy5fZGF0YUNoYW5nZUNvdW50ID09PSAxKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgICAgIC51cGRhdGVZKGFuaW1hdGVZID8gdHJhbnNpdGlvbkR1cmF0aW9uIDogdW5kZWZpbmVkKVxuICAgICAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgICAgICAuZHJhd1lBeGlzKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3RWxlbWVudHModHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtEYXRlfSBtaW5YXG4gKiBAcGFyYW0ge0RhdGV9IG1heFhcbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnNldFhSYW5nZSA9IGZ1bmN0aW9uKG1pblgsIG1heFgpIHtcblxuICAgIHRoaXMubWluWCA9IG1pblg7XG4gICAgdGhpcy5tYXhYID0gbWF4WDtcblxuICAgIHRoaXMuc2NhbGVzLnhcbiAgICAgICAgLmRvbWFpbihbdGhpcy5taW5YLCB0aGlzLm1heFhdKTtcblxuICAgIHRoaXNcbiAgICAgICAgLnVwZGF0ZVgoKVxuICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAuZHJhd1lBeGlzKClcbiAgICAgICAgLmRyYXdFbGVtZW50cygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBhdmFpbGFibGUgd2lkdGggYW5kIGhlaWdodCBzbyB0aGF0IGV2ZXJ5IHRoaW5nIHVwZGF0ZSBjb3JyZXNwb25kaW5nbHlcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYXZhaWxhYmxlV2lkdGhcbiAqIEBwYXJhbSB7TnVtYmVyfSBhdmFpbGFibGVIZWlnaHRcbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnNldEF2YWlsYWJsZURpbWVuc2lvbnMgPSBmdW5jdGlvbihhdmFpbGFibGVXaWR0aCwgYXZhaWxhYmxlSGVpZ2h0KSB7XG5cbiAgICB0aGlzLl9kaXNhYmxlZCA9IHRydWU7XG4gICAgdmFyIF9sYXN0QXZhaWxhYmxlV2lkdGggPSB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGg7XG4gICAgdmFyIF9sYXN0QXZhaWxhYmxlSGVpZ2h0ID0gdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodDtcbiAgICB0aGlzLnNldEF2YWlsYWJsZVdpZHRoKGF2YWlsYWJsZVdpZHRoKTtcbiAgICB0aGlzLnNldEF2YWlsYWJsZUhlaWdodChhdmFpbGFibGVIZWlnaHQpO1xuICAgIHRoaXMuX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgICB2YXIgaXNBdmFpbGFibGVXaWR0aENoYW5naW5nID0gX2xhc3RBdmFpbGFibGVXaWR0aCAhPT0gdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoO1xuICAgIHZhciBpc0F2YWlsYWJsZUhlaWdodENoYW5naW5nID0gX2xhc3RBdmFpbGFibGVIZWlnaHQgIT09IHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQ7XG5cbiAgICBpZiAoaXNBdmFpbGFibGVXaWR0aENoYW5naW5nIHx8IGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgfHwgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID09PSAyKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVYKClcbiAgICAgICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgICAgICAuZHJhd0VsZW1lbnRzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBhdmFpbGFibGUgd2lkdGggc28gdGhhdCBldmVyeSB0aGluZyB1cGRhdGUgY29ycmVzcG9uZGluZ2x5XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGF2YWlsYWJsZVdpZHRoXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRBdmFpbGFibGVXaWR0aCA9IGZ1bmN0aW9uKGF2YWlsYWJsZVdpZHRoKSB7XG5cbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc0F2YWlsYWJsZVdpZHRoQ2hhbmdpbmcgPSBhdmFpbGFibGVXaWR0aCAhPT0gdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoO1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCA9IGF2YWlsYWJsZVdpZHRoO1xuXG4gICAgdGhpcy5kaW1lbnNpb25zLndpZHRoID0gdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoIC0gdGhpcy5tYXJnaW4ubGVmdCAtIHRoaXMubWFyZ2luLnJpZ2h0O1xuXG4gICAgaWYgKCF0aGlzLl9kaXNhYmxlZCAmJiAoaXNBdmFpbGFibGVXaWR0aENoYW5naW5nIHx8IHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9PT0gMSkpIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAgICAgLnVwZGF0ZVgoKVxuICAgICAgICAgICAgLnVwZGF0ZVhBeGlzSW50ZXJ2YWwoKVxuICAgICAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgICAgICAuZHJhd1lBeGlzKClcbiAgICAgICAgICAgIC5kcmF3RWxlbWVudHMoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGF2YWlsYWJsZSBoZWlnaHQgc28gdGhhdCBldmVyeSB0aGluZyB1cGRhdGUgY29ycmVzcG9uZGluZ2x5XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGF2YWlsYWJsZUhlaWdodFxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc2V0QXZhaWxhYmxlSGVpZ2h0ID0gZnVuY3Rpb24oYXZhaWxhYmxlSGVpZ2h0KSB7XG5cbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc0F2YWlsYWJsZUhlaWdodENoYW5naW5nID0gYXZhaWxhYmxlSGVpZ2h0ICE9PSB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0O1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQgPSBhdmFpbGFibGVIZWlnaHQ7XG5cbiAgICB0aGlzLl9tYXhCb2R5SGVpZ2h0ID0gdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCAtIHRoaXMubWFyZ2luLnRvcCAtIHRoaXMubWFyZ2luLmJvdHRvbTtcblxuICAgIGlmICghdGhpcy5fZGlzYWJsZWQgJiYgKGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgfHwgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID09PSAxKSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWSgpXG4gICAgICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAgICAgLmRyYXdFbGVtZW50cygpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgZWxlbWVudHMgd2hpY2ggZGVwZW5kcyBvbiB4IGFuZCB5IGRpbWVuc2lvbnNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlWFkgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICB0aGlzLl9wcmV2ZW50RXZlbnRFbWlzc2lvbiA9IHRydWU7XG4gICAgdGhpcy51cGRhdGVYKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgdGhpcy5fcHJldmVudEV2ZW50RW1pc3Npb24gPSBmYWxzZTtcbiAgICB0aGlzLnVwZGF0ZVkodHJhbnNpdGlvbkR1cmF0aW9uKTtcbn07XG5cbi8qKlxuICogVXBkYXRlIGVsZW1lbnRzIHdoaWNoIGRlcGVuZHMgb24geCBkaW1lbnNpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlWCA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdGhpcy5jb250YWluZXIuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGggKyB0aGlzLm1hcmdpbi5sZWZ0ICsgdGhpcy5tYXJnaW4ucmlnaHQpO1xuXG4gICAgdGhpcy5zY2FsZXMueFxuICAgICAgICAuZG9tYWluKFt0aGlzLm1pblgsIHRoaXMubWF4WF0pXG4gICAgICAgIC5yYW5nZShbMCwgdGhpcy5kaW1lbnNpb25zLndpZHRoXSk7XG5cbiAgICB0aGlzLmF4aXNlcy55XG4gICAgICAgIC5pbm5lclRpY2tTaXplKC10aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVhcbiAgICAgICAgLngodGhpcy5zY2FsZXMueClcbiAgICAgICAgLnRyYW5zbGF0ZSh0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpKVxuICAgICAgICAuc2NhbGUodGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICB0aGlzLmNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuICAgIHRoaXMuZWxlbWVudHMuY2xpcC5zZWxlY3QoJ3JlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6cmVzaXplJywgdGhpcywgdGhpcy5jb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVXBkYXRlIGVsZW1lbnRzIHdoaWNoIGRlcGVuZHMgb24geSBkaW1lbnNpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlWSA9IGZ1bmN0aW9uICh0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcjtcbiAgICB2YXIgY2xpcCA9IHRoaXMuZWxlbWVudHMuY2xpcC5zZWxlY3QoJ3JlY3QnKTtcbiAgICB2YXIgYm91bmRpbmdSZWN0ID0gdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0Jyk7XG5cbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnRhaW5lciA9IGNvbnRhaW5lci50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgY2xpcCA9IGNsaXAudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGJvdW5kaW5nUmVjdCA9IGJvdW5kaW5nUmVjdC50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICB2YXIgZWxlbWVudEFtb3VudCA9IHRoaXMuZGF0YS5sZW5ndGg7XG5cbiAgICAvLyBoYXZlIDEgbW9yZSBlbGVtbnQgdG8gZm9yY2UgcmVwcmVzZW50aW5nIG9uZSBtb3JlIHRpY2tcbiAgICB2YXIgZWxlbWVudHNSYW5nZSA9IFswLCBlbGVtZW50QW1vdW50XTtcblxuICAgIC8vIGNvbXB1dGUgbmV3IGhlaWdodFxuICAgIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgPSBNYXRoLm1pbih0aGlzLmRhdGEubGVuZ3RoICogdGhpcy5vcHRpb25zLnJvd0hlaWdodCwgdGhpcy5fbWF4Qm9keUhlaWdodCk7XG5cbiAgICAvLyBjb21wdXRlIG5ldyBZIHNjYWxlXG4gICAgdGhpcy5feVNjYWxlID0gdGhpcy5vcHRpb25zLnJvd0hlaWdodCAvIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKiBlbGVtZW50QW1vdW50O1xuXG4gICAgLy8gdXBkYXRlIFkgc2NhbGUsIGF4aXMgYW5kIHpvb20gYmVoYXZpb3JcbiAgICB0aGlzLnNjYWxlcy55LmRvbWFpbihlbGVtZW50c1JhbmdlKS5yYW5nZShbMCwgdGhpcy5kaW1lbnNpb25zLmhlaWdodF0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkueSh0aGlzLnNjYWxlcy55KS50cmFuc2xhdGUodGhpcy5fbGFzdFRyYW5zbGF0ZSkuc2NhbGUodGhpcy5feVNjYWxlKTtcblxuICAgIC8vIGFuZCB1cGRhdGUgWCBheGlzIHRpY2tzIGhlaWdodFxuICAgIHRoaXMuYXhpc2VzLnguaW5uZXJUaWNrU2l6ZSgtdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG5cbiAgICAvLyB1cGRhdGUgc3ZnIGhlaWdodFxuICAgIGNvbnRhaW5lci5hdHRyKCdoZWlnaHQnLHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKyB0aGlzLm1hcmdpbi50b3AgKyB0aGlzLm1hcmdpbi5ib3R0b20pO1xuXG4gICAgLy8gdXBkYXRlIGlubmVyIHJlY3QgaGVpZ2h0XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKS5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICBib3VuZGluZ1JlY3QuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgY29udGFpbmVyLnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnKS5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICBjbGlwLmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgdGhpcy5zdG9wRWxlbWVudFRyYW5zaXRpb24oKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLCB0aGlzLmNvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgY29sdW1uIHdpdGgsIGJhc2ljYWxseSB0aGUgd2lkdGggY29ycmVzcG9uZGluZyB0byAxIHVuaXQgaW4geCBkYXRhIGRpbWVuc2lvblxuICpcbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVhBeGlzSW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuY29sdW1uV2lkdGggPSB0aGlzLnNjYWxlcy54KDEpIC0gdGhpcy5zY2FsZXMueCgwKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEcmF3IHRoZSB4IGF4aXNlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICogQHBhcmFtIHtCb29sZWFufSBbc2tpcFRpY2tzXSBTaG91bGQgbm90IGRyYXcgdGljayBsaW5lc1xuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZHJhd1hBeGlzID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uLCBza2lwVGlja3MpIHtcblxuICAgIGlmICh0aGlzLl9wcmV2ZW50RHJhd2luZykge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLmF4aXNlcy55XG4gICAgICAgIC5pbm5lclRpY2tTaXplKHNraXBUaWNrcyA/IDAgOiAtdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLl94QXhpc0FGKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5feEF4aXNBRik7XG4gICAgfVxuXG4gICAgdGhpcy5feEF4aXNBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy54QXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgLmNhbGwoc2VsZi5heGlzZXMueClcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ2xpbmUnKVxuICAgICAgICAgICAgLnN0eWxlKHtcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogc2VsZi5vcHRpb25zLnhBeGlzU3Ryb2tlV2lkdGguYmluZChzZWxmKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi53cmFwV2l0aEFuaW1hdGlvbihzZWxmLmVsZW1lbnRzLngyQXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgLmNhbGwoc2VsZi5heGlzZXMueDIpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCd0ZXh0JylcbiAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICB4OiBzZWxmLmNvbHVtbldpZHRoIC8gMlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdHlsZSh7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gK2QgPT09ICtzZWxmLm1heFggPyAnbm9uZScgOiAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEcmF3IHRoZSB5IGF4aXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3NraXBUaWNrc10gU2hvdWxkIG5vdCBkcmF3IHRpY2sgbGluZXNcbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmRyYXdZQXhpcyA9IGZ1bmN0aW9uIGRyYXdZQXhpcyh0cmFuc2l0aW9uRHVyYXRpb24sIHNraXBUaWNrcykge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuYXhpc2VzLnhcbiAgICAgICAgLmlubmVyVGlja1NpemUoc2tpcFRpY2tzID8gMCA6IC10aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIHZhciBkb21haW5ZID0gdGhpcy5zY2FsZXMueS5kb21haW4oKTtcblxuICAgIHRoaXMuYXhpc2VzLnlcbiAgICAgICAgLnRpY2tWYWx1ZXMoZDMucmFuZ2UoTWF0aC5yb3VuZChkb21haW5ZWzBdKSwgTWF0aC5yb3VuZChkb21haW5ZWzFdKSwgMSkpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX3lBeGlzQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl95QXhpc0FGKTtcbiAgICB9XG5cbiAgICB0aGlzLl95QXhpc0FGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHNlbGYud3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy55QXhpc0NvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgY29udGFpbmVyLmNhbGwoc2VsZi5heGlzZXMueSk7XG5cbiAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCd0ZXh0JykuYXR0cigneScsIHNlbGYub3B0aW9ucy5yb3dIZWlnaHQgLyAyKTtcblxuICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ2xpbmUnKS5zdHlsZSgnZGlzcGxheScsIGZ1bmN0aW9uKGQsaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpID8gJycgOiAnbm9uZSc7XG4gICAgICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFRoaXMgY2xvbmUgbWV0aG9kIGRvZXMgbm90IGNsb25lIHRoZSBlbnRpdGllcyBpdHNlbGZcbiAqXG4gKiBAcmV0dXJucyB7QXJyYXk8RDNUYWJsZVJvdz59XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRGF0YSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHRoaXMuZGF0YS5tYXAoZnVuY3Rpb24oZCkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlUm93fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBkKSB7XG4gICAgICAgICAgICBpZiAoZC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleSAhPT0gJ2VsZW1lbnRzJykge1xuICAgICAgICAgICAgICAgICAgICByZXNba2V5XSA9IGRba2V5XTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNba2V5XSA9IGRba2V5XS5tYXAoc2VsZi5jbG9uZUVsZW1lbnQuYmluZChzZWxmKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICpcbiAqIEByZXR1cm5zIHtBcnJheTxEM1RhYmxlRWxlbWVudD59XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRmxhdHRlbmVkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmZsYXR0ZW5lZERhdGEubWFwKGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0ge307XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIGUpIHtcbiAgICAgICAgICAgIGlmIChlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICByZXNba2V5XSA9IGVba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFRoaXMgY2xvbmUgbWV0aG9kIGRvZXMgbm90IGNsb25lIHRoZSBlbnRpdGllcyBpdHNlbGZcbiAqXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuY2xvbmVFbGVtZW50ID0gZnVuY3Rpb24oZSkge1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9XG4gICAgICovXG4gICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgZm9yICh2YXIga2V5IGluIGUpIHtcbiAgICAgICAgaWYgKGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgcmVzW2tleV0gPSBlW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHJvdyBob2xkaW5nIHRoZSBwcm92aWRlZCBlbGVtZW50IChyZWZlcmVuY2UgZXF1YWxpdHkgdGVzdClcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGVSb3d9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmdldEVsZW1lbnRSb3cgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbmQodGhpcy5kYXRhLCBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgcmV0dXJuIHJvdy5lbGVtZW50cy5pbmRleE9mKGVsZW1lbnQpICE9PSAtMTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogU3RvcmUgYSBjbG9uZSBvZiB0aGUgY3VycmVudGx5IGJvdW5kIGZsYXR0ZW5lZCBkYXRhXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnN0b3JlRmxhdHRlbmVkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucHJldmlvdXNGbGF0dGVuZWREYXRhID0gdGhpcy5jbG9uZUZsYXR0ZW5lZERhdGEoKTtcbn07XG5cbi8qKlxuICogR2VuZXJhdGUgdGhlIG5ldyBzZXQgb2YgZmxhdHRlbmVkIGRhdGEsIHN0b3JpbmcgcHJldmlvdXMgc2V0IGlmIGNvbmZpZ3VyZWQgc28gYW5kIHByZXNlcnZpbmcgZWxlbWVudCBmbGFnc1xuICovXG5EM1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMudXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtKSB7XG4gICAgICAgIHRoaXMuc3RvcmVGbGF0dGVuZWREYXRhKCk7XG4gICAgfVxuXG4gICAgdGhpcy5mbGF0dGVuZWREYXRhLmxlbmd0aCA9IDA7XG5cbiAgICB0aGlzLmRhdGEuZm9yRWFjaChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIGQuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LnJvd0luZGV4ID0gaTtcbiAgICAgICAgICAgIGlmIChzZWxmLl9mcm96ZW5VaWRzLmluZGV4T2YoZWxlbWVudC51aWQpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuX2RlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5mbGF0dGVuZWREYXRhLnB1c2goZWxlbWVudCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBDb21wdXRlIHRoZSB0cmFuc2Zvcm0gc3RyaW5nIGZvciBhIGdpdmVuIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmdldFRyYW5zZm9ybUZyb21EYXRhID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyB0aGlzLnNjYWxlcy54KHRoaXMuZ2V0RGF0YVN0YXJ0KGVsZW1lbnQpKSArICcsJyArIHRoaXMuc2NhbGVzLnkoZWxlbWVudC5yb3dJbmRleCkgKyAnKSc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZWxlbWVudCB3aXRoIHRoZSBwcm92aWRlZCBib3VuZCBkYXRhIHNob3VsZCBiZSBjdWxsZWRcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGRhdGFcbiAqIEByZXR1cm5zIHtCb29sZWFufVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jdWxsaW5nRmlsdGVyID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgdmFyIGRvbWFpblggPSB0aGlzLnNjYWxlcy54LmRvbWFpbigpO1xuICAgIHZhciBkb21haW5YU3RhcnQgPSBkb21haW5YWzBdO1xuICAgIHZhciBkb21haW5YRW5kID0gZG9tYWluWFtkb21haW5YLmxlbmd0aCAtIDFdO1xuXG4gICAgdmFyIGRvbWFpblkgPSB0aGlzLnNjYWxlcy55LmRvbWFpbigpO1xuICAgIHZhciBkb21haW5ZU3RhcnQgPSBkb21haW5ZWzBdO1xuICAgIHZhciBkb21haW5ZRW5kID0gZG9tYWluWVtkb21haW5ZLmxlbmd0aCAtIDFdO1xuXG4gICAgcmV0dXJuIGRhdGEuX2RlZmF1bHRQcmV2ZW50ZWQgfHxcbiAgICAgICAgLy8gTk9UIHggY3VsbGluZyBBTkQgTk9UIHkgY3VsbGluZ1xuICAgICAgICAoXG4gICAgICAgICAgICAvLyBOT1QgeCBjdWxsaW5nXG4gICAgICAgICAgICAoIXRoaXMub3B0aW9ucy5jdWxsaW5nWCB8fCAhKHRoaXMuZ2V0RGF0YUVuZChkYXRhKSA8IGRvbWFpblhTdGFydCB8fCB0aGlzLmdldERhdGFTdGFydChkYXRhKSA+IGRvbWFpblhFbmQpKVxuICAgICAgICAgICAgJiZcbiAgICAgICAgICAgIC8vIE5PVCB5IGN1bGxpbmdcbiAgICAgICAgICAgICghdGhpcy5vcHRpb25zLmN1bGxpbmdZIHx8IChkYXRhLnJvd0luZGV4ID49IGRvbWFpbllTdGFydCAtIHRoaXMub3B0aW9ucy5jdWxsaW5nRGlzdGFuY2UgJiYgZGF0YS5yb3dJbmRleCA8IGRvbWFpbllFbmQgKyB0aGlzLm9wdGlvbnMuY3VsbGluZ0Rpc3RhbmNlIC0gMSkpXG4gICAgICAgICk7XG59O1xuXG4vKipcbiAqIEdldCBzdGFydCB2YWx1ZSBvZiB0aGUgcHJvdmlkZWQgZGF0YSwgdXNlZCB0byByZXByZXNlbnQgZWxlbWVudCBzdGFydFxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZGF0YVxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RGF0YVN0YXJ0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiArZGF0YS5zdGFydDtcbn07XG5cbi8qKlxuICogR2V0IGVuZCB2YWx1ZSBvZiB0aGUgcHJvdmlkZWQgZGF0YSwgdXNlZCB0byByZXByZXNlbnQgZWxlbWVudCBlbmRcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGRhdGFcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmdldERhdGFFbmQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuICtkYXRhLmVuZDtcbn07XG5cbi8qKlxuICogTW92ZSB0aGUgZWxlbWVudHMgd2l0aCBjbGFtcGluZyB0aGUgYXNrZWQgbW92ZSBhbmQgcmV0dXJuZWQgd2hhdCBpdCBmaW5hbGx5IGRpZCB3aXRoIHRoZSBhc2tlZCB4IGFuZCB5IGRlbHRhXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtkeF0gQXNrZWQgeCBtb3ZlIGRlbHRhXG4gKiBAcGFyYW0ge051bWJlcn0gW2R5XSBBc2tlZCB5IG1vdmUgZGVsdGFcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlRHJhd10gU2hvdWxkIHRoZSBlbGVtZW50cyBiZSByZWRyYXduIGluc3RlYWQgb2YgdHJhbnNsYXRpbmcgdGhlIGlubmVyIGNvbnRhaW5lclxuICogQHBhcmFtIHtCb29sZWFufSBbc2tpcFhBeGlzXSBTaG91bGQgdGhlIHggYXhpcyBub3QgYmUgcmVkcmF3blxuICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VUaWNrc10gU2hvdWxkIHRoZSB0aWNrIGxpbmVzIGJlIGRyYXduXG4gKiBAcmV0dXJucyB7W051bWJlciwgTnVtYmVyLCBOdW1iZXIsIE51bWJlcl19IEZpbmFsIHRyYW5zbGF0ZSB4LCBmaW5hbCB0cmFuc2xhdGUgeSwgdHJhbnNsYXRlIHggZGVsdGEsIHRyYW5zbGF0ZSB5IGRlbHRhXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihkeCwgZHksIGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKSB7XG5cbiAgICBkeCA9IGR4IHx8IDA7XG4gICAgZHkgPSBkeSB8fCAwO1xuXG4gICAgdmFyIGN1cnJlbnRUcmFuc2xhdGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpO1xuICAgIHZhciB1cGRhdGVkVCA9IFtjdXJyZW50VHJhbnNsYXRlWzBdICsgZHgsIGN1cnJlbnRUcmFuc2xhdGVbMV0gKyBkeV07XG5cbiAgICB1cGRhdGVkVCA9IHRoaXMuX2NsYW1wVHJhbnNsYXRpb25XaXRoU2NhbGUodXBkYXRlZFQsIFt0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCksIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnNjYWxlKCldKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkudHJhbnNsYXRlKHVwZGF0ZWRUKTtcblxuICAgIHRoaXMubW92ZUVsZW1lbnRzKGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVDtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJyk7XG5cbiAgICByZXR1cm4gdXBkYXRlZFQuY29uY2F0KFt1cGRhdGVkVFswXSAtIGN1cnJlbnRUcmFuc2xhdGVbMF0sIHVwZGF0ZWRUWzFdIC0gY3VycmVudFRyYW5zbGF0ZVsxXV0pO1xufTtcblxuLyoqXG4gKiBNb3ZlIGVsZW1lbnRzLCBzd2l0Y2hpbmcgYmV0d2VlbiBkcmF3aW5nIG1ldGhvZHMgZGVwZW5kaW5nIG9uIGFyZ3VtZW50c1xuICogQmFzaWNhbGx5LCBpdCBzaG91bGQgYmUgdXNlZCB0byB0aGF0IGlzIGNob29zZXMgb3B0aW1pemVkIGRyYXdpbmcgKHRyYW5zbGF0aW5nIHRoZSBpbm5lciBjb250YWluZXIpIGlzIHRoZXJlIGlzIG5vIHNjYWxlIGNoYW5nZS5cbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZURyYXddIEZvcmNlIHRoZSBlbGVtZW50cyB0byBiZSBkcmF3biB3aXRob3V0IHRyYW5zbGF0aW9uIG9wdGltaXphdGlvblxuICogQHBhcmFtIHtCb29sZWFufSBbc2tpcFhBeGlzXSBTa2lwIHggYXhpcyBiZWluZyByZWRyYXduIChhbHdheXMgdGhlIGNhc2Ugd2hlbiB0aGUgc2NhbGUgZG9lcyBub3QgY2hhbmdlIG9uIG1vdmUpXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZVRpY2tzXSBGb3JjZSB0aWNrcyB0byBiZSByZWRyYXduOyBpZiBmYWxzZSB0aGVuIHRoZXkgd2lsbCBiZSBoaWRkZW5cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUubW92ZUVsZW1lbnRzID0gZnVuY3Rpb24oZm9yY2VEcmF3LCBza2lwWEF4aXMsIGZvcmNlVGlja3MpIHtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLnJlbmRlck9uSWRsZSB8fCBmb3JjZURyYXcpIHtcbiAgICAgICAgdGhpcy5kcmF3RWxlbWVudHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRyYW5zbGF0ZUVsZW1lbnRzKHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCksIHRoaXMuX2xhc3RUcmFuc2xhdGUpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd1lBeGlzKHVuZGVmaW5lZCwgIWZvcmNlVGlja3MpO1xuXG4gICAgaWYgKCFza2lwWEF4aXMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVYQXhpc0ludGVydmFsKCk7XG4gICAgICAgIHRoaXMuZHJhd1hBeGlzKHVuZGVmaW5lZCwgIWZvcmNlVGlja3MpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRHJhdyBlbGVtZW50cyAoZW50ZXJpbmcsIGV4aXRpbmcsIHVwZGF0aW5nKVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZHJhd0VsZW1lbnRzID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5zdG9wRWxlbWVudFRyYW5zaXRpb24oKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLl9lbGVtZW50c0FGKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fZWxlbWVudHNBRilcbiAgICB9XG5cbiAgICB0aGlzLl9lbGVtZW50c0FGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogTWFwIG9mIHN0YXJ0IHRyYW5zZm9ybSBzdHJpbmdzIGZvciBhbGwgZWxlbWVudHNcbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUge09iamVjdDxTdHJpbmc+fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHN0YXJ0VHJhbnNmb3JtTWFwID0ge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1hcCBvZiBlbmQgdHJhbnNmb3JtIHN0cmluZ3MgZm9yIGFsbCBlbGVtZW50c1xuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0PFN0cmluZz59XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZW5kVHJhbnNmb3JtTWFwID0ge307XG5cblxuICAgICAgICAvLyBmaWxsIGJvdGggdHJhbnNmb3JtIHN0cmluZyBtYXBzXG5cbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy51c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm0gJiYgdHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgaWYgKHNlbGYucHJldmlvdXNGbGF0dGVuZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wcmV2aW91c0ZsYXR0ZW5lZERhdGEuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZGF0YVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzdGFydFRyYW5zZm9ybU1hcFtkYXRhLnVpZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRyYW5zZm9ybU1hcFtkYXRhLmlkXSA9IHN0YXJ0VHJhbnNmb3JtTWFwW2RhdGEudWlkXSA9IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlbGYuZmxhdHRlbmVkRGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmxhdHRlbmVkRGF0YS5mb3JFYWNoKFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVuZFRyYW5zZm9ybU1hcFtkYXRhLnVpZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRUcmFuc2Zvcm1NYXBbZGF0YS5pZF0gPSBlbmRUcmFuc2Zvcm1NYXBbZGF0YS51aWRdID0gc2VsZi5nZXRUcmFuc2Zvcm1Gcm9tRGF0YShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmaWx0ZXIgd2l0aCBjdWxsaW5nIGxvZ2ljXG4gICAgICAgIHZhciBkYXRhID0gc2VsZi5mbGF0dGVuZWREYXRhLmZpbHRlcihzZWxmLmN1bGxpbmdGaWx0ZXIuYmluZChzZWxmKSk7XG5cbiAgICAgICAgdmFyIGdyb3VwcyA9IHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuc2VsZWN0QWxsKCdnLicgKyBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JylcbiAgICAgICAgICAgIC5kYXRhKGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZC51aWQ7XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIC8vIGhhbmRsZSBleGl0aW5nIGVsZW1lbnRzXG5cbiAgICAgICAgdmFyIGV4aXRpbmcgPSBncm91cHMuZXhpdCgpO1xuXG4gICAgICAgIGlmIChzZWxmLm9wdGlvbnMuZW5hYmxlVHJhbnNpdGlvbk9uRXhpdCAmJiB0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG5cbiAgICAgICAgICAgIGV4aXRpbmcuZWFjaChcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGRhdGFcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gZDMuc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudEV4aXQoZ3JvdXAsIGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZsYWcgdGhlIGVsZW1lbnQgYXMgcmVtb3ZlZFxuICAgICAgICAgICAgICAgICAgICBkYXRhLl9yZW1vdmVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgZXhpdFRyYW5zZm9ybSA9IGVuZFRyYW5zZm9ybU1hcFtkYXRhLnVpZF0gfHwgZW5kVHJhbnNmb3JtTWFwW2RhdGEuaWRdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChleGl0VHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKGdyb3VwLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGV4aXRUcmFuc2Zvcm0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXAucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OnJlbW92ZScsIGdyb3VwLCBudWxsLCBbZGF0YV0pO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4aXRpbmdcbiAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIGhhbmRsZSBlbnRlcmluZyBlbGVtZW50c1xuXG4gICAgICAgIGdyb3Vwcy5lbnRlcigpLmFwcGVuZCgnZycpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JylcbiAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRFbnRlcihkMy5zZWxlY3QodGhpcyksIGRhdGEpO1xuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAvLyBoYW5kbGUgYWxsIGVsZW1lbnRzIGV4aXN0aW5nIGFmdGVyIGVudGVyaW5nXG5cbiAgICAgICAgZ3JvdXBzLmVhY2goXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZGF0YVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5fcmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gZDMuc2VsZWN0KHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRVcGRhdGUoZ3JvdXAsIGRhdGEsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBpc1VwZGF0ZSA9IGRhdGEuX3Bvc2l0aW9uZWQ7XG5cbiAgICAgICAgICAgICAgICB2YXIgbmV3VHJhbnNmb3JtID0gZW5kVHJhbnNmb3JtTWFwW2RhdGEudWlkXSB8fCBlbmRUcmFuc2Zvcm1NYXBbZGF0YS5pZF0gfHwgc2VsZi5nZXRUcmFuc2Zvcm1Gcm9tRGF0YShkYXRhKTtcblxuICAgICAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9yaWdpblRyYW5zZm9ybSA9IHN0YXJ0VHJhbnNmb3JtTWFwW2RhdGEudWlkXSB8fCBzdGFydFRyYW5zZm9ybU1hcFtkYXRhLmlkXSB8fCBuZXdUcmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgICAgIHZhciBtb2RpZmllZE9yaWdpblRyYW5zZm9ybTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzVXBkYXRlICYmIHNlbGYub3B0aW9ucy51c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5UcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RpZmllZE9yaWdpblRyYW5zZm9ybSA9IG9yaWdpblRyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm91cC5hdHRyKCd0cmFuc2Zvcm0nLCBvcmlnaW5UcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi53cmFwV2l0aEFuaW1hdGlvbihncm91cCwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHJUd2VlbihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3JpZ2luVHJhbnNmb3JtID0gbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm0gfHwgZ3JvdXAuYXR0cigndHJhbnNmb3JtJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5lbmFibGVZVHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZDMuaW50ZXJwb2xhdGVUcmFuc2Zvcm0ob3JpZ2luVHJhbnNmb3JtLCBuZXdUcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGFydFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW5kVHJhbnNmb3JtID0gZDMudHJhbnNmb3JtKG5ld1RyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXSA9IGVuZFRyYW5zZm9ybS50cmFuc2xhdGVbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5pbnRlcnBvbGF0ZVRyYW5zZm9ybShzdGFydFRyYW5zZm9ybS50b1N0cmluZygpLCBlbmRUcmFuc2Zvcm0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBncm91cFxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIG5ld1RyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGF0YS5fcG9zaXRpb25lZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRVcGRhdGUoZ3JvdXAsIGRhdGEsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBzZWxmLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gWzAuMCwgMC4wXTtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS50cmFuc2xhdGVFbGVtZW50cyA9IGZ1bmN0aW9uKHRyYW5zbGF0ZSwgcHJldmlvdXNUcmFuc2xhdGUpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciB0eCA9IHRyYW5zbGF0ZVswXSAtIHByZXZpb3VzVHJhbnNsYXRlWzBdO1xuICAgIHZhciB0eSA9IHRyYW5zbGF0ZVsxXSAtIHByZXZpb3VzVHJhbnNsYXRlWzFdO1xuXG4gICAgdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVswXSA9IHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMF0gKyB0eDtcbiAgICB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdID0gdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVsxXSArIHR5O1xuXG5cbiAgICBpZiAodGhpcy5fZWx0c1RyYW5zbGF0ZUFGKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fZWx0c1RyYW5zbGF0ZUFGKTtcbiAgICB9XG5cbiAgICB0aGlzLl9lbHRzVHJhbnNsYXRlQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLmF0dHIoe1xuICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlKCcgKyBzZWxmLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlICsgJyknXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChzZWxmLmVsZW1lbnRzVHJhbnNsYXRlICE9PSBzZWxmLm5vb3ApIHtcbiAgICAgICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXJcbiAgICAgICAgICAgICAgICAuc2VsZWN0QWxsKCcuJyArIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKVxuICAgICAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5lbGVtZW50c1RyYW5zbGF0ZShkMy5zZWxlY3QodGhpcyksIGQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuc3RvcEVsZW1lbnRUcmFuc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5zZWxlY3RBbGwoJ2cuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKS50cmFuc2l0aW9uKCk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge2QzLlNlbGVjdGlvbn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudEVudGVyID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBlbGVtZW50KSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbi8qKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdHJhbnNpdGlvbkR1cmF0aW9uXG4gKiBAcmV0dXJucyB7ZDMuU2VsZWN0aW9ufVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5lbGVtZW50VXBkYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBlbGVtZW50LCB0cmFuc2l0aW9uRHVyYXRpb24pIHsgcmV0dXJuIHNlbGVjdGlvbjsgfTtcblxuLyoqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtkMy5TZWxlY3Rpb259XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRFeGl0ID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBlbGVtZW50KSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbi8qKlxuICogV3JhcCB0aGUgc2VsZWN0aW9uIHdpdGggYSBkMyB0cmFuc2l0aW9uIGlmIHRoZSB0cmFuc2l0aW9uIGR1cmF0aW9uIGlzIGdyZWF0ZXIgdGhhbiAwXG4gKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcmV0dXJucyB7ZDMuU2VsZWN0aW9ufGQzLlRyYW5zaXRpb259XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLndyYXBXaXRoQW5pbWF0aW9uID0gZnVuY3Rpb24oc2VsZWN0aW9uLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICByZXR1cm4gc2VsZWN0aW9uLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pLmVhc2UodGhpcy5vcHRpb25zLnRyYW5zaXRpb25FYXNpbmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZWxlY3Rpb247XG4gICAgfVxufTtcblxuLyoqXG4gKiBQcm94eSB0byByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZXNcbiAqIEVuc3VyZSBhbGwgbGlzdGVuZXJzIHJlZ2lzdGVyIGJlZm9yZSB0aGUgbmV4dCBmcmFtZSBhcmUgcGxheWVkIGluIHRoZSBzYW1lIHNlcXVlbmNlXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24obGlzdGVuZXIpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLnB1c2gobGlzdGVuZXIpO1xuXG4gICAgaWYgKHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZztcbiAgICAgICAgICAgIHdoaWxlKGcgPSBzZWxmLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5zaGlmdCgpKSBnKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBsaXN0ZW5lcjtcbn07XG5cbi8qKlxuICogUHJveHkgdG8gY2FuY2VsIGFuaW1hdGlvbiBmcmFtZVxuICogUmVtb3ZlIHRoZSBsaXN0ZW5lciBmcm9tIHRoZSBsaXN0IG9mIGZ1bmN0aW9ucyB0byBiZSBwbGF5ZWQgb24gbmV4dCBhbmltYXRpb24gZnJhbWVcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG5cbiAgICB2YXIgaW5kZXggPSB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5sZW5ndGggPiAwID8gdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMuaW5kZXhPZihsaXN0ZW5lcikgOiAtMTtcblxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIENhbGwgYSBtb3ZlIGZvcmNpbmcgdGhlIGRyYXdpbmdzIHRvIGZpdCB3aXRoaW4gc2NhbGUgZG9tYWluc1xuICpcbiAqIEByZXR1cm5zIHtbTnVtYmVyLE51bWJlcixOdW1iZXIsTnVtYmVyXX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZW5zdXJlSW5Eb21haW5zID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubW92ZSgwLCAwLCBmYWxzZSwgZmFsc2UsIHRydWUpO1xufTtcblxuLyoqXG4gKiBUb2dnbGUgaW50ZXJuYWwgZHJhd2luZyBwcmV2ZW50IGZsYWdcbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFthY3RpdmVdIElmIG5vdCBwcm92aWRlZCwgaXQgbmVnYXRlcyB0aGUgY3VycmVudCBmbGFnIHZhbHVlXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS50b2dnbGVEcmF3aW5nID0gZnVuY3Rpb24oYWN0aXZlKSB7XG5cbiAgICB0aGlzLl9wcmV2ZW50RHJhd2luZyA9IHR5cGVvZiBhY3RpdmUgPT09ICdib29sZWFuJyA/ICFhY3RpdmUgOiAhdGhpcy5fcHJldmVudERyYXdpbmc7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9mci9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PYmpldHNfZ2xvYmF1eC9BcnJheS9maW5kXG4gKiBAdHlwZSB7KnxGdW5jdGlvbn1cbiAqIEBwcml2YXRlXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLl9maW5kID0gZnVuY3Rpb24obGlzdCwgcHJlZGljYXRlKSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3QubGVuZ3RoID4+PiAwO1xuICAgIHZhciB0aGlzQXJnID0gbGlzdDtcbiAgICB2YXIgdmFsdWU7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gbGlzdFtpXTtcbiAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogQ2xhbXBlZCBwcm92aWRlZCB0cmFuc2xhdGlvbiBiYXNlZCBvbiBkaW1lbnNpb25zIGFuZCBjdXJyZW50IHByb3ZpZGVkIHNjYWxlc1xuICpcbiAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfSB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfSBzY2FsZVxuICogQHJldHVybnMge1tOdW1iZXIsTnVtYmVyXX1cbiAqIEBwcml2YXRlXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlID0gZnVuY3Rpb24odHJhbnNsYXRlLCBzY2FsZSkge1xuXG4gICAgc2NhbGUgPSBzY2FsZSB8fCBbMSwgMV07XG5cbiAgICBpZiAoIShzY2FsZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICBzY2FsZSA9IFtzY2FsZSwgc2NhbGVdO1xuICAgIH1cblxuICAgIHZhciB0eCA9IHRyYW5zbGF0ZVswXTtcbiAgICB2YXIgdHkgPSB0cmFuc2xhdGVbMV07XG4gICAgdmFyIHN4ID0gc2NhbGVbMF07XG4gICAgdmFyIHN5ID0gc2NhbGVbMV07XG5cbiAgICBpZiAoc3ggPT09IDEpIHtcbiAgICAgICAgdHggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHR4ID0gTWF0aC5taW4oTWF0aC5tYXgoLXRoaXMuZGltZW5zaW9ucy53aWR0aCAqIChzeC0xKSwgdHgpLCAwKTtcbiAgICB9XG5cbiAgICBpZiAoc3kgPT09IDEpIHtcbiAgICAgICAgdHkgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHR5ID0gTWF0aC5taW4oTWF0aC5tYXgoLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKiAoc3ktMSksIHR5KSwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFt0eCwgdHldO1xuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBEM1RhYmxlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cy9ldmVudHMnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcbmltcG9ydCBEM1RhYmxlIGZyb20gJy4vRDNUYWJsZSc7XG5cbnZhciBkM1RpbWVsaW5lID0ge307XG5cbi8qKlxuICogVGFibGUgbWFya2VyIG9wdGlvbnMgd2hpY2gga25vd3MgaG93IHRvIHJlcHJlc2VudCBpdHNlbGYgaW4gYSB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlI2NvbnRhaW5lcn1cbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZU1hcmtlck9wdGlvbnN9IG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5kM1RpbWVsaW5lLkQzVGFibGVNYXJrZXIgPSBmdW5jdGlvbiBEM1RhYmxlTWFya2VyKG9wdGlvbnMpIHtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gICAgICovXG4gICAgdGhpcy50YWJsZSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7ZDMuU2VsZWN0aW9ufVxuICAgICAqL1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHt7bGluZTogZDMuU2VsZWN0aW9uLCBsYWJlbDogZDMuU2VsZWN0aW9ufX1cbiAgICAgKi9cbiAgICB0aGlzLmVsZW1lbnRzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMudmFsdWUgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGFibGVSZXNpemVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl90YWJsZURlc3Ryb3lMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RUaW1lVXBkYXRlZCA9IG51bGw7XG59O1xuXG52YXIgRDNUYWJsZU1hcmtlciA9IGQzVGltZWxpbmUuRDNUYWJsZU1hcmtlcjtcblxuaW5oZXJpdHMoRDNUYWJsZU1hcmtlciwgRXZlbnRFbWl0dGVyKTtcblxuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX0hPUklaT05UQUwgPSAnaG9yaXpvbnRhbCc7XG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5MQVlPVVRfVkVSVElDQUwgPSAndmVydGljYWwnO1xuXG4vKipcbiAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGVNYXJrZXJPcHRpb25zfVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcbiAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQ7IH0sXG4gICAgb3V0ZXJUaWNrU2l6ZTogMTAsXG4gICAgdGlja1BhZGRpbmc6IDMsXG4gICAgcm91bmRQb3NpdGlvbjogZmFsc2UsXG4gICAgYmVtQmxvY2tOYW1lOiAndGFibGVNYXJrZXInLFxuICAgIGJlbU1vZGlmaWVyczogW10sXG4gICAgbGF5b3V0OiBEM1RhYmxlTWFya2VyLnByb3RvdHlwZS5MQVlPVVRfVkVSVElDQUwsXG4gICAgbGluZVNoYXBlOiAnbGluZScsXG4gICAgcmVjdFRoaWNrbmVzczogRDNUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMucm93SGVpZ2h0XG59O1xuXG4vKipcbiAqIFNldCB0aGUgdGFibGUgaXQgc2hvdWxkIGRyYXcgaXRzZWxmIG9udG9cbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlfSB0YWJsZVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zZXRUYWJsZSA9IGZ1bmN0aW9uKHRhYmxlKSB7XG5cbiAgICB2YXIgcHJldmlvdXNUYWJsZSA9IHRoaXMudGFibGU7XG5cbiAgICB0aGlzLnRhYmxlID0gdGFibGUgJiYgdGFibGUgaW5zdGFuY2VvZiBEM1RhYmxlID8gdGFibGUgOiBudWxsO1xuXG4gICAgaWYgKHRoaXMudGFibGUpIHtcbiAgICAgICAgaWYgKHByZXZpb3VzVGFibGUgIT09IHRoaXMudGFibGUpIHtcbiAgICAgICAgICAgIGlmIChwcmV2aW91c1RhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51bmJpbmRUYWJsZShwcmV2aW91c1RhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYmluZFRhYmxlKCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCF0aGlzLnRhYmxlICYmIHByZXZpb3VzVGFibGUpIHtcbiAgICAgICAgdGhpcy51bmJpbmRUYWJsZShwcmV2aW91c1RhYmxlKTtcbiAgICB9XG5cbn07XG5cbi8qKlxuICogQ29tcGFyZSB0d28gdmFsdWVzXG4gKiBUbyBiZSBvdmVycmlkZGVuIGlmIHlvdSB3aXNoIHRoZSBtYXJrZXIgbm90IHRvIGJlIG1vdmVkIGZvciBzb21lIHZhbHVlIGNoYW5nZXMgd2hpY2ggc2hvdWxkIG5vdCBpbXBhY3QgdGhlIG1hcmtlciBwb3NpdGlvblxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBhXG4gKiBAcGFyYW0ge051bWJlcn0gYlxuICogQHJldHVybnMge0Jvb2xlYW59XG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnZhbHVlQ29tcGFyYXRvciA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gK2EgIT09ICtiO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIHZhbHVlIGZvciB0aGUgbWFya2VyLCB3aGljaCB1cGRhdGVzIGlmIGl0IG5lZWRzIHRvXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtzaWxlbnRdXG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24odmFsdWUsIHNpbGVudCkge1xuXG4gICAgdmFyIHByZXZpb3VzVGltZVVwZGF0ZWQgPSB0aGlzLl9sYXN0VGltZVVwZGF0ZWQ7XG5cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy52YWx1ZUNvbXBhcmF0b3IocHJldmlvdXNUaW1lVXBkYXRlZCwgdGhpcy52YWx1ZSkgJiYgdGhpcy50YWJsZSAmJiB0aGlzLmNvbnRhaW5lcikge1xuXG4gICAgICAgIHRoaXMuX2xhc3RUaW1lVXBkYXRlZCA9IHRoaXMudmFsdWU7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJcbiAgICAgICAgICAgIC5kYXR1bSh7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXNpbGVudCkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn07XG5cbi8qKlxuICogVmFsdWUgZ2V0dGVyIGZyb20gZDMgc2VsZWN0aW9uIGRhdHVtIHdoaWNoIHNob3VsZCBiZSBtYWRlIG9mIGEgdmFsdWVcbiAqIFRvIGJlIG92ZXJyaWRkZW4gaWYgeW91IHdpc2ggdG8gYWx0ZXIgdGhpcyB2YWx1ZSBkeW5hbWljYWxseVxuICpcbiAqIEBwYXJhbSB7dmFsdWU6IE51bWJlcn0gZGF0YVxuICogQHJldHVybnMgeyp9XG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBkYXRhLnZhbHVlO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgYSBEM1RhYmxlIGJlaW5nIGJvdW5kXG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmJpbmRUYWJsZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy0tJyArIHRoaXMub3B0aW9ucy5sYXlvdXQ7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmJlbU1vZGlmaWVycyAmJiBBcnJheS5pc0FycmF5KHRoaXMub3B0aW9ucy5iZW1Nb2RpZmllcnMpICYmIHRoaXMub3B0aW9ucy5iZW1Nb2RpZmllcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBjbGFzc05hbWUgPSBjbGFzc05hbWUgKyAnICcgKyB0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXJzLm1hcChmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLS0nICsgbW9kaWZpZXI7XG4gICAgICAgIH0pLmpvaW4oJyAnKTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMudGFibGUuY29udGFpbmVyXG4gICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAuZGF0dW0oe1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMudmFsdWVcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgY2xhc3NOYW1lKTtcblxuICAgIHN3aXRjaCh0aGlzLm9wdGlvbnMubGluZVNoYXBlKSB7XG4gICAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICAgICAgdGhpcy5lbGVtZW50cy5saW5lID0gdGhpcy5jb250YWluZXJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1saW5lJylcbiAgICAgICAgICAgICAgICAuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZWN0JzpcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMubGluZSA9IHRoaXMuY29udGFpbmVyXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctcmVjdCcpXG4gICAgICAgICAgICAgICAgLnN0eWxlKCdwb2ludGVyLWV2ZW50cycsICdub25lJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnRzLmxhYmVsID0gdGhpcy5jb250YWluZXJcbiAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxhYmVsJyk7XG5cbiAgICB0aGlzLnNpemVMaW5lQW5kTGFiZWwoKTtcblxuICAgIC8vIG9uIHRhYmxlIG1vdmUsIG1vdmUgdGhlIG1hcmtlclxuICAgIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyID0gdGhpcy5tb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJywgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIpO1xuXG4gICAgLy8gb24gdGFibGUgcmVzaXplLCByZXNpemUgdGhlIG1hcmtlciBhbmQgbW92ZSBpdFxuICAgIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICAgICAgc2VsZi5yZXNpemUodHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgc2VsZi5tb3ZlKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIpO1xuXG4gICAgdGhpcy5fdGFibGVEZXN0cm95TGlzdGVuZXIgPSBmdW5jdGlvbih0YWJsZSkge1xuICAgICAgICBzZWxmLnVuYmluZFRhYmxlKHRhYmxlKTtcbiAgICB9O1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6ZGVzdHJveScsIHRoaXMuX3RhYmxlRGVzdHJveUxpc3RlbmVyKTtcblxuICAgIHRoaXMuZW1pdCgnbWFya2VyOmJvdW5kJyk7XG5cbiAgICB0aGlzLm1vdmUoKTtcblxufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvcnJlY3QgZGltZW5zaW9ucyBhbmQgbGFiZWwgY29udGVudFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zaXplTGluZUFuZExhYmVsID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgbGF5b3V0ID0gdGhpcy5vcHRpb25zLmxheW91dDtcblxuICAgIHZhciBsaW5lID0gdGhpcy5lbGVtZW50cy5saW5lO1xuICAgIHZhciBsYWJlbCA9IHRoaXMuZWxlbWVudHMubGFiZWw7XG5cbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICBsaW5lID0gbGluZS50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgbGFiZWwgPSBsYWJlbC50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBzd2l0Y2gobGF5b3V0KSB7XG5cbiAgICAgICAgY2FzZSB0aGlzLkxBWU9VVF9WRVJUSUNBTDpcblxuICAgICAgICAgICAgc3dpdGNoKHRoaXMub3B0aW9ucy5saW5lU2hhcGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkxOiAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTI6IHRoaXMudGFibGUuZGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgbGluZS5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IC10aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzcy8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMub3B0aW9ucy5yZWN0VGhpY2tuZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSArIHRoaXMudGFibGUuZGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsIC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZS10aGlzLm9wdGlvbnMudGlja1BhZGRpbmcpO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRoaXMuTEFZT1VUX0hPUklaT05UQUw6XG5cbiAgICAgICAgICAgIHN3aXRjaCh0aGlzLm9wdGlvbnMubGluZVNoYXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgICAgICAgICAgICAgIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MTogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgyOiB0aGlzLnRhYmxlLmRpbWVuc2lvbnMud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgbGluZS5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzcy8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplICsgdGhpcy50YWJsZS5kaW1lbnNpb25zLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2R4JywgLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLXRoaXMub3B0aW9ucy50aWNrUGFkZGluZylcbiAgICAgICAgICAgICAgICAuYXR0cignZHknLCA0KTtcblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIEhhbmRsZSBEM1RhYmxlIHVuYm91bmRcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZX0gcHJldmlvdXNUYWJsZVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS51bmJpbmRUYWJsZSA9IGZ1bmN0aW9uKHByZXZpb3VzVGFibGUpIHtcblxuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScsIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6ZGVzdHJveScsIHRoaXMuX3RhYmxlRGVzdHJveUxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLmNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHByZXZpb3VzVGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICAgICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5lbWl0KCdtYXJrZXI6dW5ib3VuZCcsIHByZXZpb3VzVGFibGUpO1xufTtcblxuLyoqXG4gKiBNb3ZlIHRoZSBtYXJrZXIgcmVxdWVzdGluZyBhbiBhbmltYXRpb24gZnJhbWVcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqL1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICB0aGlzLnRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fbW92ZUFGID0gdGhpcy50YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5tb3ZlU3luYy5iaW5kKHRoaXMpKTtcblxufTtcblxuLyoqXG4gKiBNb3ZlIHRoZSBtYXJrZXIgc3luY2hyb25vdXNseVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5tb3ZlU3luYyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKCF0aGlzLnRhYmxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGxheW91dCA9IHRoaXMub3B0aW9ucy5sYXlvdXQ7XG5cbiAgICB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuZWFjaChmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNlbGYuZ2V0VmFsdWUoZGF0YSk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHNjYWxlLCBwb3NpdGlvbiA9IFswLCAwXSwgcG9zaXRpb25JbmRleDtcblxuICAgICAgICAgICAgc3dpdGNoKGxheW91dCkge1xuICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5MQVlPVVRfVkVSVElDQUw6XG4gICAgICAgICAgICAgICAgICAgIHNjYWxlID0gc2VsZi50YWJsZS5zY2FsZXMueDtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25JbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5MQVlPVVRfSE9SSVpPTlRBTDpcbiAgICAgICAgICAgICAgICAgICAgc2NhbGUgPSBzZWxmLnRhYmxlLnNjYWxlcy55O1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkluZGV4ID0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcG9zaXRpb25bcG9zaXRpb25JbmRleF0gPSBzY2FsZSh2YWx1ZSk7XG5cbiAgICAgICAgICAgIHZhciByYW5nZSA9IHNjYWxlLnJhbmdlKCk7XG4gICAgICAgICAgICB2YXIgaXNJblJhbmdlID0gcG9zaXRpb25bcG9zaXRpb25JbmRleF0gPj0gcmFuZ2VbMF0gJiYgcG9zaXRpb25bcG9zaXRpb25JbmRleF0gPD0gcmFuZ2VbcmFuZ2UubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgICAgIHZhciBncm91cCA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgaWYgKGlzSW5SYW5nZSkge1xuXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XG5cbiAgICAgICAgICAgICAgICBncm91cC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrKHNlbGYudGFibGUubWFyZ2luLmxlZnQgKyBwb3NpdGlvblswXSA+PiAwKSsnLCcrKHNlbGYudGFibGUubWFyZ2luLnRvcCArIHBvc2l0aW9uWzFdID4+IDApKycpJyk7XG5cbiAgICAgICAgICAgICAgICBncm91cC5zZWxlY3QoJy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctbGFiZWwnKVxuICAgICAgICAgICAgICAgICAgICAudGV4dChzZWxmLm9wdGlvbnMuZm9ybWF0dGVyLmNhbGwoc2VsZiwgdmFsdWUpKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxufTtcblxuLyoqXG4gKiBTaG93IHRoZSBtYXJrZXJcbiAqL1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZSgnZGlzcGxheScsICcnKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEhpZGUgdGhlIG1hcmtlclxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuY29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnN0eWxlKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuZGF0dW0oe1xuICAgICAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgcmVzaXppbmcgdGhlIG1hcmtlciwgd2hpY2ggc2hvdWxkIGJlIGNhbGxlZCBvbiBEM1RhYmxlIHJlc2l6ZSBldmVudFxuICpcbiAqIEBwYXJhbSB0cmFuc2l0aW9uRHVyYXRpb25cbiAqL1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB0aGlzLnNpemVMaW5lQW5kTGFiZWwodHJhbnNpdGlvbkR1cmF0aW9uKTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RhYmxlTWFya2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlTWFya2VyIGZyb20gJy4vRDNUYWJsZU1hcmtlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG52YXIgZDNUaW1lbGluZSA9IHt9O1xuXG4vKipcbiAqIE1vdXNlIHBvc2l0aW9uIHRyYWNrZXIgd2hpY2ggcmVzcG9uZHMgdG8gRDNUYWJsZSBldmVudHMgKHdoaWNoIGxpc3RlbnMgaXRzZWxmIHRvIG1vdXNlIGV2ZW50cylcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZU1vdXNlVHJhY2tlck9wdGlvbnN9IG9wdGlvbnNcbiAqIEBleHRlbmRzIHtkM1RpbWVsaW5lLkQzVGFibGVNYXJrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZDNUaW1lbGluZS5EM1RhYmxlTW91c2VUcmFja2VyID0gZnVuY3Rpb24gRDNUYWJsZU1vdXNlVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZU1hcmtlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuX21vdmVBRiA9IG51bGw7XG5cbiAgICB0aGlzLm9uKCdtYXJrZXI6Ym91bmQnLCB0aGlzLmhhbmRsZVRhYmxlQm91bmQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5vbignbWFya2VyOnVuYm91bmQnLCB0aGlzLmhhbmRsZVRhYmxlVW5ib3VuZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQG5hbWUgZDNUaW1lbGluZS5EM1RhYmxlTW91c2VUcmFja2VyI29wdGlvbnNcbiAgICAgKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlTW91c2VUcmFja2VyT3B0aW9uc31cbiAgICAgKi9cbn07XG5cbnZhciBEM1RhYmxlTW91c2VUcmFja2VyID0gZDNUaW1lbGluZS5EM1RhYmxlTW91c2VUcmFja2VyO1xuXG5pbmhlcml0cyhEM1RhYmxlTW91c2VUcmFja2VyLCBEM1RhYmxlTWFya2VyKTtcblxuLyoqXG4gKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlTW91c2VUcmFja2VyT3B0aW9uc31cbiAqL1xuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGVNYXJrZXIucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtTW9kaWZpZXJzOiBbJ21vdXNlVHJhY2tlciddLFxuICAgIGxpc3RlblRvVG91Y2hFdmVudHM6IHRydWVcbn0pO1xuXG4vKipcbiAqIEltcGxlbWVudCB0aGUgbGlzdGVuZXIgZm9yIEQzVGFibGUgYmVpbmcgYm91bmRcbiAqL1xuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlVGFibGVCb3VuZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIgPSB0aGlzLmhhbmRsZU1vdXNlZW50ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyID0gdGhpcy5oYW5kbGVNb3VzZW1vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl90YWJsZU1vdXNlbGVhdmVMaXN0ZW5lciA9IHRoaXMuaGFuZGxlTW91c2VsZWF2ZS5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWVudGVyJywgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIpO1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2Vtb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWxlYXZlJywgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5saXN0ZW5Ub1RvdWNoRXZlbnRzKSB7XG4gICAgICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IHRydWU7XG4gICAgICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6dG91Y2htb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzID0gZmFsc2U7XG4gICAgfVxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgdGhlIGxpc3RlbmVyIGZvciBEM1RhYmxlIGJlaW5nIHVuYm91bmRcbiAqL1xuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlVGFibGVVbmJvdW5kID0gZnVuY3Rpb24ocHJldmlvdXNUYWJsZSkge1xuXG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWVudGVyJywgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2Vtb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWxlYXZlJywgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIpO1xuXG4gICAgaWYgKHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cykge1xuICAgICAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnRvdWNobW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIH1cblxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgZ2V0dGluZyB4IGFuZCB5IHBvc2l0aW9ucyBmcm9tIEQzVGFibGUgZXZlbnRcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZX0gdGFibGVcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7ZDMuRXZlbnR9IGQzRXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFRpbWVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFJvd1xuICpcbiAqIEBzZWUgZDNUaW1lbGluZS5EM1RhYmxlI2VtaXREZXRhaWxlZEV2ZW50IGZvciBhcmd1bWVudHMgZGVzY3JpcHRpb25cbiAqIEByZXR1cm5zIHsqfVxuICovXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5nZXRWYWx1ZUZyb21UYWJsZUV2ZW50ID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG4gICAgc3dpdGNoICh0aGlzLm9wdGlvbnMubGF5b3V0KSB7XG4gICAgICAgIGNhc2UgJ3ZlcnRpY2FsJzpcbiAgICAgICAgICAgIHJldHVybiBnZXRUaW1lKCk7XG4gICAgICAgIGNhc2UgJ2hvcml6b250YWwnOlxuICAgICAgICAgICAgcmV0dXJuIGdldFJvdygpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSW1wbGVtZW50IG1vdXNlIGVudGVyIGhhbmRsaW5nXG4gKiAgLSBzaG93IHRoZSBtYXJrZXIgYW5kIHNldCB0aGUgdmFsdWUgZnJvbSBtb3VzZSBwb3NpdGlvblxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlfSB0YWJsZVxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkMy5FdmVudH0gZDNFdmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0VGltZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0Um93XG4gKlxuICogQHNlZSBkM1RpbWVsaW5lLkQzVGFibGUjZW1pdERldGFpbGVkRXZlbnQgZm9yIGFyZ3VtZW50cyBkZXNjcmlwdGlvblxuICogQHJldHVybnMgeyp9XG4gKi9cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZU1vdXNlZW50ZXIgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciB0aW1lID0gdGhpcy5nZXRWYWx1ZUZyb21UYWJsZUV2ZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuc2hvdygpO1xuICAgICAgICBzZWxmLnNldFZhbHVlKHRpbWUpO1xuICAgIH0pO1xuXG59O1xuXG4vKipcbiAqIEltcGxlbWVudCBtb3VzZSBtb3ZlIGhhbmRsaW5nXG4gKiAgLSBzZXQgdGhlIHZhbHVlIGZyb20gbW91c2UgcG9zaXRpb25cbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZX0gdGFibGVcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7ZDMuRXZlbnR9IGQzRXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFRpbWVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFJvd1xuICpcbiAqIEBzZWUgZDNUaW1lbGluZS5EM1RhYmxlI2VtaXREZXRhaWxlZEV2ZW50IGZvciBhcmd1bWVudHMgZGVzY3JpcHRpb25cbiAqIEByZXR1cm5zIHsqfVxuICovXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVNb3VzZW1vdmUgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgdGltZSA9IHRoaXMuZ2V0VmFsdWVGcm9tVGFibGVFdmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICB0YWJsZS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9tb3ZlQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX21vdmVBRiA9IHRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5zZXRWYWx1ZSh0aW1lKTtcbiAgICB9KTtcblxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgbW91c2UgbGVhdmUgaGFuZGxpbmdcbiAqICAtIGhpZGUgdGhlIG1hcmtlciBhbmQgc2V0IHRoZSB2YWx1ZSBmcm9tIG1vdXNlIHBvc2l0aW9uXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGV9IHRhYmxlXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge2QzLkV2ZW50fSBkM0V2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXRUaW1lXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXRSb3dcbiAqXG4gKiBAc2VlIGQzVGltZWxpbmUuRDNUYWJsZSNlbWl0RGV0YWlsZWRFdmVudCBmb3IgYXJndW1lbnRzIGRlc2NyaXB0aW9uXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2VsZWF2ZSA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICB0YWJsZS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9tb3ZlQUYpO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH0pO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVNb3VzZVRyYWNrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGVNYXJrZXIgZnJvbSAnLi9EM1RhYmxlTWFya2VyJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbnZhciBkM1RpbWVsaW5lID0ge307XG5cbi8qKlxuICogQSBEM1RhYmxlVmFsdWVUcmFja2VyIGlzIGEgRDNUYWJsZU1hcmtlciB3aGljaCBiZWhhdmVzIGFsb25lIGFuZCBjYW4gYmUgc3RhcnRlZCBhbmQgc3RvcHBlZCxcbiAqIGdldHRpbmcgaXRzIHZhbHVlIGZyb20gdGhlIGltcGxlbWVudGVkIHZhbHVlR2V0dGVyXG4gKlxuICogQHNlZSBkMy50aW1lciB0byB1bmRlcnN0YW5kIGhvdyBpdCBiZWhhdmVzIGF1dG9tYXRpY2FsbHlcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlTWFya2VyT3B0aW9uc30gb3B0aW9uc1xuICogQGV4dGVuZHMge2QzVGltZWxpbmUuRDNUYWJsZU1hcmtlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5kM1RpbWVsaW5lLkQzVGFibGVWYWx1ZVRyYWNrZXIgPSBmdW5jdGlvbiBEM1RhYmxlVmFsdWVUcmFja2VyKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlTWFya2VyLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbn07XG5cbnZhciBEM1RhYmxlVmFsdWVUcmFja2VyID0gZDNUaW1lbGluZS5EM1RhYmxlVmFsdWVUcmFja2VyO1xuXG5pbmhlcml0cyhEM1RhYmxlVmFsdWVUcmFja2VyLCBEM1RhYmxlTWFya2VyKTtcblxuLyoqXG4gKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlTWFya2VyT3B0aW9uc31cbiAqL1xuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGVNYXJrZXIucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtTW9kaWZpZXJzOiBbJ3ZhbHVlVHJhY2tlciddXG59KTtcblxuLyoqXG4gKiBCeSBkZWZhdWx0LCB0aGUgdmFsdWUgaXQgZ2V0cyBpcyAwXG4gKlxuICogQHJldHVybnMge051bWJlcn1cbiAqL1xuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUudmFsdWVHZXR0ZXIgPSBmdW5jdGlvbigpIHtcblxuICAgcmV0dXJuIDA7XG5cbn07XG5cbi8qKlxuICogU3RhcnQgdGhlIHRyYWNrZXJcbiAqL1xuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cbiAgICBkMy50aW1lcihmdW5jdGlvbigpIHtcblxuICAgICAgICBzZWxmLnNldFZhbHVlKHNlbGYudmFsdWVHZXR0ZXIoKSk7XG5cbiAgICAgICAgcmV0dXJuICFzZWxmLmVuYWJsZWQ7XG5cbiAgICB9KTtcbn07XG5cbi8qKlxuICogU3RvcCB0aGUgdHJhY2tlclxuICovXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RhYmxlVmFsdWVUcmFja2VyO1xuIiwiLyogZ2xvYmFsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRDNCbG9ja1RhYmxlIGZyb20gJy4vRDNCbG9ja1RhYmxlJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5cbnZhciBkM1RpbWVsaW5lID0ge307XG5cbi8qKlxuICogVGltZWxpbmUgdmVyc2lvbiBvZiBhIEQzQmxvY2tUYWJsZSB3aXRoXG4gKiAgLSB0aW1lIHNjYWxlIGFzIHggc2NhbGVcbiAqICAtIGFuZCBzcGVjaWFsIG1ldGhvZHMgcHJveHlpbmcgdG8gRDNCbG9ja1RhYmxlIG1ldGhvZHNcbiAqXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGltZWxpbmVPcHRpb25zfSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIHtkM1RpbWVsaW5lLkQzQmxvY2tUYWJsZX1cbiAqL1xuZDNUaW1lbGluZS5EM1RpbWVsaW5lID0gZnVuY3Rpb24gRDNUaW1lbGluZShvcHRpb25zKSB7XG5cbiAgICBEM0Jsb2NrVGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA9IHRoaXMub3B0aW9ucy5taW5pbXVtVGltZUludGVydmFsO1xuXG4gICAgLyoqXG4gICAgICogQG5hbWUgZDNUaW1lbGluZS5EM1RpbWVsaW5lI29wdGlvbnNcbiAgICAgKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RpbWVsaW5lT3B0aW9uc31cbiAgICAgKi9cbn07XG5cbnZhciBEM1RpbWVsaW5lID0gZDNUaW1lbGluZS5EM1RpbWVsaW5lO1xuXG5pbmhlcml0cyhEM1RpbWVsaW5lLCBEM0Jsb2NrVGFibGUpO1xuXG4vKipcbiAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGltZWxpbmVPcHRpb25zfVxuICovXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbUJsb2NrTmFtZTogJ3RpbWVsaW5lJyxcbiAgICBiZW1CbG9ja01vZGlmaWVyOiAnJyxcbiAgICB4QXhpc1RpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkLmdldE1pbnV0ZXMoKSAlIDE1ID8gJycgOiBkMy50aW1lLmZvcm1hdCgnJUg6JU0nKShkKTtcbiAgICB9LFxuICAgIHhBeGlzU3Ryb2tlV2lkdGg6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQuZ2V0TWludXRlcygpICUzMCA/IDEgOiAyO1xuICAgIH0sXG4gICAgbWluaW11bUNvbHVtbldpZHRoOiAzMCxcbiAgICBtaW5pbXVtVGltZUludGVydmFsOiAzZTUsXG4gICAgYXZhaWxhYmxlVGltZUludGVydmFsczogWyA2ZTQsIDNlNSwgOWU1LCAxLjhlNiwgMy42ZTYsIDcuMmU2LCAxLjQ0ZTcsIDIuODhlNywgNC4zMmU3LCA4LjY0ZTcgXVxufSk7XG5cbi8qKlxuICogVGltZSBzY2FsZSBhcyB4IHNjYWxlXG4gKiBAcmV0dXJucyB7ZDMudGltZS5TY2FsZX1cbiAqL1xuRDNUaW1lbGluZS5wcm90b3R5cGUueFNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy50aW1lLnNjYWxlKCk7XG59O1xuXG4vKipcbiAqIFVzZSBkYXRhIHN0YXJ0IHByb3BlcnR5IHdpdGhvdXQgY2FzdGluZ1xuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZGF0YVxuICogQHJldHVybnMge3N0YXJ0fGFueX1cbiAqL1xuRDNUaW1lbGluZS5wcm90b3R5cGUuZ2V0RGF0YVN0YXJ0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBkYXRhLnN0YXJ0O1xufTtcblxuLyoqXG4gKiBVc2UgZGF0YSBlbmQgcHJvcGVydHkgd2l0aG91dCBjYXN0aW5nXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBkYXRhXG4gKiBAcmV0dXJucyB7c3RhcnR8YW55fVxuICovXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhRW5kID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBkYXRhLmVuZDtcbn07XG5cbi8qKlxuICogT3ZlcnJpZGUgdXBkYXRlIHggYXhpcyBpbnRlcnZhbCBpbXBsZW1lbnQgd2l0aCBjb2x1bW4gd2lkdGggdXBkYXRlIGJhc2VkIG9uIGluc3RhbmNlIG9wdGlvbnM6XG4gKiAgLSBtaW5pbXVtQ29sdW1uV2lkdGg6IHRoZSBjb2x1bW4gd2lkdGggc2hvdWxkIG5ldmVyIGJlIGxvd2VyIHRoYW4gdGhhdFxuICogIC0gbWluaW11bVRpbWVJbnRlcnZhbDogdGhlIHRpbWUgaW50ZXJ2YWwgc2hvdWxkIG5ldmVyIGJlIGxvd2VyIHRoYW4gdGhhdFxuICogIC0gYXZhaWxhYmxlVGltZUludGVydmFsczogdGhlIGxpc3Qgb2YgYXZhaWxhYmxlIHRpbWUgaW50ZXJ2YWxzXG4gKlxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUaW1lbGluZX1cbiAqL1xuRDNUaW1lbGluZS5wcm90b3R5cGUudXBkYXRlWEF4aXNJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIG1pbmltdW1UaW1lSW50ZXJ2YWwgPSB0aGlzLm9wdGlvbnMubWluaW11bVRpbWVJbnRlcnZhbDtcbiAgICB2YXIgbWluaW11bUNvbHVtbldpZHRoID0gdGhpcy5vcHRpb25zLm1pbmltdW1Db2x1bW5XaWR0aDtcbiAgICB2YXIgY3VycmVudFRpbWVJbnRlcnZhbCA9IHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbDtcbiAgICB2YXIgYXZhaWxhYmxlVGltZUludGVydmFscyA9IHRoaXMub3B0aW9ucy5hdmFpbGFibGVUaW1lSW50ZXJ2YWxzO1xuICAgIHZhciBjdXJyZW50VGltZUludGVydmFsSW5kZXggPSBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzLmluZGV4T2YoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgdmFyIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHRoaXMuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbCk7XG5cbiAgICAvLyBwcml2YXRlIGZ1bmN0aW9uIHRvIGluY3JlYXNlL2RlY3JlYXNlIHRpbWUgaW50ZXJ2YWwgYnkgaW5kZXggZGVsdGEgaW4gdGhlIGF2YWlsYWJsZSB0aW1lIGludGVydmFscyBhbmQgdXBkYXRlIHRpbWUgaW50ZXJ2YWwgYW5kIGNvbHVtbiB3aWR0aFxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbChkZWx0YSkge1xuICAgICAgICBjdXJyZW50VGltZUludGVydmFsSW5kZXggKz0gZGVsdGE7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzW2N1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleF07XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgfVxuXG4gICAgaWYgKGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBpZiBsb3dlciwgaW5jcmVhc2VcbiAgICAgICAgaWYgKGN1cnJlbnRDb2x1bW5XaWR0aCA8IG1pbmltdW1Db2x1bW5XaWR0aCkge1xuICAgICAgICAgICAgLy8gc3RvcCB3aGVuIGl0J3MgaGlnaGVyXG4gICAgICAgICAgICB3aGlsZShjdXJyZW50Q29sdW1uV2lkdGggPCBtaW5pbXVtQ29sdW1uV2lkdGggJiYgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4IDwgYXZhaWxhYmxlVGltZUludGVydmFscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlVGltZUludGVydmFsKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGlmIGdyZWF0ZXIgZGVjcmVhc2VcbiAgICAgICAgZWxzZSBpZiAoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoKSB7XG4gICAgICAgICAgICAvLyBzdG9wIHdoZW4gaXQncyBsb3dlclxuICAgICAgICAgICAgd2hpbGUoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoICYmIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGhlbiBpbmNyZWFzZSBvbmNlXG4gICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB0aW1lIGludGVydmFsIGlzIGxvd2VyIHRoYW4gdGhlIG1pbmltdW0sIHNldCBpdCB0byB0aGUgbWluaW11bSBhbmQgY29tcHV0ZSBjb2x1bW4gd2lkdGhcbiAgICBpZiAoY3VycmVudFRpbWVJbnRlcnZhbCA8IG1pbmltdW1UaW1lSW50ZXJ2YWwpIHtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbCA9IG1pbmltdW1UaW1lSW50ZXJ2YWw7XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbClcbiAgICB9XG5cbiAgICAvLyBrZWVwIGZsb29yIHZhbHVlc1xuICAgIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA9IE1hdGguZmxvb3IoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgdGhpcy5jb2x1bW5XaWR0aCA9IE1hdGguZmxvb3IoY3VycmVudENvbHVtbldpZHRoKTtcblxuICAgIC8vIHVwZGF0ZSBheGlzZXMgdGlja3NcbiAgICBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gMy42ZTYpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiA2ZTQpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiAxZTMpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQcm94eSB0byB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlI3NldFhSYW5nZX1cbiAqXG4gKiBAcGFyYW0ge0RhdGV9IG1pbkRhdGVcbiAqIEBwYXJhbSB7RGF0ZX0gbWF4RGF0ZVxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUaW1lbGluZX1cbiAqL1xuRDNUaW1lbGluZS5wcm90b3R5cGUuc2V0VGltZVJhbmdlID0gZnVuY3Rpb24obWluRGF0ZSwgbWF4RGF0ZSkge1xuICAgIHJldHVybiB0aGlzLnNldFhSYW5nZShtaW5EYXRlLCBtYXhEYXRlKTtcbn07XG5cbi8qKlxuICogQ29tcHV0ZSBjb2x1bW4gd2lkdGggZnJvbSBhIHByb3ZpZGVkIHRpbWUgaW50ZXJ2YWxcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZUludGVydmFsXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICogQHByaXZhdGVcbiAqL1xuRDNUaW1lbGluZS5wcm90b3R5cGUuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwgPSBmdW5jdGlvbih0aW1lSW50ZXJ2YWwpIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsZXMueChuZXcgRGF0ZSh0aW1lSW50ZXJ2YWwpKSAtIHRoaXMuc2NhbGVzLngobmV3IERhdGUoMCkpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNUaW1lbGluZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZVZhbHVlVHJhY2tlciBmcm9tICcuL0QzVGFibGVWYWx1ZVRyYWNrZXInO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxudmFyIGQzVGltZWxpbmUgPSB7fTtcblxuLyoqXG4gKiBUaW1lbGluZSB0aW1lIHRyYWNrZXIgd2hpY2ggY2FuIGJlIHN0YXJ0ZWQgYW5kIHN0b3BwZWQgYXMgaXQgaXMgYSB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlVmFsdWVUcmFja2VyfVxuICpcbiAqIEBleHRlbmRzIHtkM1RpbWVsaW5lLkQzVGFibGVWYWx1ZVRyYWNrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZDNUaW1lbGluZS5EM1RpbWVsaW5lVGltZVRyYWNrZXIgPSBmdW5jdGlvbiBEM1RpbWVsaW5lVGltZVRyYWNrZXIob3B0aW9ucykge1xuICAgIEQzVGFibGVWYWx1ZVRyYWNrZXIuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIEBuYW1lIGQzVGltZWxpbmUuRDNUaW1lbGluZVRpbWVUcmFja2VyI3ZhbHVlXG4gICAgICogQHR5cGUge0RhdGV9XG4gICAgICovXG59O1xuXG52YXIgRDNUaW1lbGluZVRpbWVUcmFja2VyID0gZDNUaW1lbGluZS5EM1RpbWVsaW5lVGltZVRyYWNrZXI7XG5cbmluaGVyaXRzKEQzVGltZWxpbmVUaW1lVHJhY2tlciwgRDNUYWJsZVZhbHVlVHJhY2tlcik7XG5cbi8qKlxuICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZU1hcmtlck9wdGlvbnN9XG4gKi9cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtQmxvY2tOYW1lOiAndGltZWxpbmVNYXJrZXInLFxuICAgIGJlbU1vZGlmaWVyczogWyd0aW1lVHJhY2tlciddLFxuICAgIGxheW91dDogJ3ZlcnRpY2FsJ1xufSk7XG5cbi8qKlxuICogR2V0IHRoZSBjdXJyZW50IHRpbWVcbiAqIFRvIGJlIG92ZXJyaWRkZW4gaWYgeW91IHdpc2ggdG8gcmVwcmVzZW50IGEgYmlhc2VkIHRpbWUgZm9yIGV4YW1wbGVcbiAqXG4gKiBAcmV0dXJucyB7RGF0ZX1cbiAqL1xuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS50aW1lR2V0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCk7XG59O1xuXG4vKipcbiAqIFByb3h5IHRvIHtAbGluayBkM1RpbWVsaW5lLkQzVGFibGVWYWx1ZVRyYWNrZXIjdGltZUdldHRlcn1cbiAqXG4gKiBAcmV0dXJucyB7RGF0ZX1cbiAqL1xuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS52YWx1ZUdldHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRpbWVHZXR0ZXIoKTtcbn07XG5cbi8qKlxuICogQ29tcGFyZSB0aW1lcywgZGVmYXVsdHMgdG8ge0BsaW5rIGQzVGltZWxpbmUuRDNUYWJsZVZhbHVlVHJhY2tlciN2YWx1ZUNvbXBhcmF0b3J9XG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufCp9XG4gKi9cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudGltZUNvbXBhcmF0b3IgPSBEM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS52YWx1ZUNvbXBhcmF0b3I7XG5cbi8qKlxuICogUHJveHkgdG8ge0BsaW5rIGQzVGltZWxpbmUuRDNUaW1lbGluZVRpbWVUcmFja2VyLnRpbWVDb21wYXJhdG9yfVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gYVxuICogQHBhcmFtIHtEYXRlfSBiXG4gKi9cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudmFsdWVDb21wYXJhdG9yID0gZnVuY3Rpb24oYSxiKSB7XG4gICAgcmV0dXJuIHRoaXMudGltZUNvbXBhcmF0b3IoYSxiKTtcbn07XG5cbi8qKlxuICogUHJveHkgdG8ge0BsaW5rIGQzVGltZWxpbmUuRDNUYWJsZVZhbHVlVHJhY2tlciNzZXRWYWx1ZX1cbiAqIFRvIGJlIG92ZXJyaWRkZW4gaWYgeW91IHdoaWNoIHRvIGFsdGVyIHRoZSB2YWx1ZSBzZXRcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IHRpbWVcbiAqL1xuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS5zZXRUaW1lID0gZnVuY3Rpb24odGltZSkge1xuICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRpbWUpO1xufTtcblxuLyoqXG4gKiBQcm94eSB0byB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlVmFsdWVUcmFja2VyI3NldFRhYmxlfVxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RpbWVsaW5lfSB0aW1lbGluZVxuICovXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnNldFRpbWVsaW5lID0gRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuc2V0VGFibGU7XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUaW1lbGluZVRpbWVUcmFja2VyO1xuIl19
(1)
});
;