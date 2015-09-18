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

        if (data._defaultPrevented) {
            if (d3.event.sourceEvent) {
                d3.event.sourceEvent.preventDefault();
            }
            return;
        }

        if (d3.event.sourceEvent) {
            d3.event.sourceEvent.stopPropagation();
            if (d3.event.sourceEvent.ctrlKey) {
                d3.event.sourceEvent.preventDefault();
            }
            if (!d3.event.sourceEvent.changedTouches && d3.event.sourceEvent.which !== 1) {
                d3.event.sourceEvent.preventDefault();
                return;
            }
        }

        startDragPosition = dragPosition = d3.mouse(bodyNode);

        startTime = +new Date();

        storeStart();

        data._defaultPrevented = true;
        self._frozenUids.push(data.uid);
    }).on('drag', function (data) {

        if (!data._defaultPrevented) {
            return;
        }

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

        if (!data._defaultPrevented) {
            return;
        }

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
        return self.options.yAxisFormatter.call(self, self.data[d | 0], d);
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
        this.updateXY(animateY ? transitionDuration : undefined).updateXAxisInterval().drawXAxis().drawYAxis();
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
        if (isAvailableWidthChanging) {
            this.updateX().updateXAxisInterval();
        }
        if (isAvailableHeightChanging) {
            this.updateY();
        }
        this.drawXAxis().drawYAxis().drawElements();
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
 * @returns {d3Timeline.D3Table}
 */
D3Table.prototype.updateXY = function (transitionDuration) {
    this._preventEventEmission = true;
    this.updateX(transitionDuration);
    this._preventEventEmission = false;
    this.updateY(transitionDuration);
    return this;
};

/**
 * Update elements which depends on x dimension
 *
 * @param {Number} [transitionDuration]
 */
D3Table.prototype.updateX = function (transitionDuration) {

    this.scales.x.domain([this.minX, this.maxX]).range([0, this.dimensions.width]);

    this.axises.y.innerTickSize(-this.dimensions.width);

    this.behaviors.zoomX.x(this.scales.x).translate(this.behaviors.zoom.translate()).scale(this.behaviors.zoom.scale());

    if (!this._preventDrawing) {
        this.container.attr('width', this.dimensions.width + this.margin.left + this.margin.right);
        this.elements.body.select('rect.' + this.options.bemBlockName + '-boundingRect').attr('width', this.dimensions.width);
        this.elements.body.select('rect.' + this.options.bemBlockName + '-contactRect').attr('width', this.dimensions.width);
        this.container.select('rect.' + this.options.bemBlockName + '-backgroundRect').attr('width', this.dimensions.width);
        this.elements.clip.select('rect').attr('width', this.dimensions.width);
    }

    this.emit(this.options.bemBlockName + ':resize', this, this.container, transitionDuration);

    return this;
};

/**
 * Update elements which depends on y dimension
 *
 * @param {Number} [transitionDuration]
 */
D3Table.prototype.updateY = function (transitionDuration) {

    var elementAmount = Math.max(this.data.length, 1);

    // have 1 more elemnt to force representing one more tick
    var elementsRange = [0, elementAmount];

    // compute new height
    this.dimensions.height = Math.min(elementAmount * this.options.rowHeight, this._maxBodyHeight);

    // compute new Y scale
    this._yScale = this.options.rowHeight / this.dimensions.height * elementAmount;

    // update Y scale, axis and zoom behavior
    this.scales.y.domain(elementsRange).range([0, this.dimensions.height]);

    // y scale has been updated so tell the zoom behavior to apply the previous translate and scale on it
    this.behaviors.zoomY.y(this.scales.y).translate(this._lastTranslate).scale(this._yScale);

    // and update X axis ticks height
    this.axises.x.innerTickSize(-this.dimensions.height);

    if (!this._preventDrawing) {

        var container = this.container;
        var clip = this.elements.clip.select('rect');
        var boundingRect = this.elements.body.select('rect.' + this.options.bemBlockName + '-boundingRect');

        if (transitionDuration) {
            container = container.transition().duration(transitionDuration);
            clip = clip.transition().duration(transitionDuration);
            boundingRect = boundingRect.transition().duration(transitionDuration);
        }

        // update svg height
        container.attr('height', this.dimensions.height + this.margin.top + this.margin.bottom);

        // update inner rect height
        this.elements.body.select('rect.' + this.options.bemBlockName + '-contactRect').attr('height', this.dimensions.height);
        boundingRect.attr('height', this.dimensions.height);
        container.select('rect.' + this.options.bemBlockName + '-backgroundRect').attr('height', this.dimensions.height);
        clip.attr('height', this.dimensions.height);
    }

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

D3Table.prototype.cancelAllAnimationFrames = function () {
    this._nextAnimationFrameHandlers.length = 0;
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

D3TableMarker.prototype.INSERT_ON_TOP = 'insertOnTop';
D3TableMarker.prototype.INSERT_BEHIND = 'insertBehind';

/**
 * @type {d3Timeline.D3TableMarkerOptions}
 */
D3TableMarker.prototype.defaults = {
    formatter: function formatter(d) {
        return d;
    },
    insertionMethod: D3TableMarker.prototype.INSERT_ON_TOP,
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

    switch (this.options.insertionMethod) {
        case this.INSERT_BEHIND:
            this.container = this.table.container.insert('g', function () {
                return self.table.elements.body.node();
            });
            break;
        case this.INSERT_ON_TOP:
            this.container = this.table.container.append('g');
            break;
    }

    this.container.datum({
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9pbmRleC5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL3NyYy9EM0Jsb2NrVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3hELE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOzs7QUNSakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBLFlBQVksQ0FBQzs7Ozs7Ozs7dUJBRU8sV0FBVzs7Ozt3QkFDVixVQUFVOzs7O3NCQUNaLFFBQVE7Ozs7QUFFM0IsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDOzs7Ozs7Ozs7Ozs7QUFZcEIsVUFBVSxDQUFDLFlBQVksR0FBRyxTQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUU7QUFDckQseUJBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzs7Ozs7O0NBTS9CLENBQUM7O0FBRUYsSUFBSSxZQUFZLEdBQUcsVUFBVSxDQUFDLFlB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QUFXO0FBQ3BELFNBQU8sSUFBSSxJQUFJLEVBQUUsQ0FBQztDQUNyQixDQUFDOzs7Ozs7O0FBT0YscUJBQXFCLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxZQUFXO0FBQ3JELFNBQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0NBQzVCLENBQUM7Ozs7Ozs7QUFPRixxQkFBcUIsQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLGlDQUFvQixTQUFTLENBQUMsZUFBZSxDQUFDOzs7Ozs7OztBQVEvRixxQkFBcUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBRTtBQUM1RCxTQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ25DLENBQUM7Ozs7Ozs7O0FBUUYscUJBQXFCLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLElBQUksRUFBRTtBQUNyRCxTQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDOUIsQ0FBQzs7Ozs7OztBQU9GLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsaUNBQW9CLFNBQVMsQ0FBQyxRQUFRLENBQUM7O0FBRXJGLE1BQU0sQ0FBQyxPQUFPLEdBQUcscUJBQXFCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZS5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNCbG9ja1RhYmxlID0gcmVxdWlyZSgnLi9zcmMvRDNCbG9ja1RhYmxlLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RpbWVsaW5lID0gcmVxdWlyZSgnLi9zcmMvRDNUaW1lbGluZScpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZU1hcmtlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVNYXJrZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGFibGVNb3VzZVRyYWNrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlTW91c2VUcmFja2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlVmFsdWVUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZVZhbHVlVHJhY2tlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUaW1lbGluZVRpbWVUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUaW1lbGluZVRpbWVUcmFja2VyLmpzJyk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxudmFyIGlzQXJyYXkgPSBmdW5jdGlvbiBpc0FycmF5KGFycikge1xuXHRpZiAodHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheShhcnIpO1xuXHR9XG5cblx0cmV0dXJuIHRvU3RyLmNhbGwoYXJyKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnZhciBpc1BsYWluT2JqZWN0ID0gZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcblx0aWYgKCFvYmogfHwgdG9TdHIuY2FsbChvYmopICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBoYXNPd25Db25zdHJ1Y3RvciA9IGhhc093bi5jYWxsKG9iaiwgJ2NvbnN0cnVjdG9yJyk7XG5cdHZhciBoYXNJc1Byb3RvdHlwZU9mID0gb2JqLmNvbnN0cnVjdG9yICYmIG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgJiYgaGFzT3duLmNhbGwob2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ2lzUHJvdG90eXBlT2YnKTtcblx0Ly8gTm90IG93biBjb25zdHJ1Y3RvciBwcm9wZXJ0eSBtdXN0IGJlIE9iamVjdFxuXHRpZiAob2JqLmNvbnN0cnVjdG9yICYmICFoYXNPd25Db25zdHJ1Y3RvciAmJiAhaGFzSXNQcm90b3R5cGVPZikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIE93biBwcm9wZXJ0aWVzIGFyZSBlbnVtZXJhdGVkIGZpcnN0bHksIHNvIHRvIHNwZWVkIHVwLFxuXHQvLyBpZiBsYXN0IG9uZSBpcyBvd24sIHRoZW4gYWxsIHByb3BlcnRpZXMgYXJlIG93bi5cblx0dmFyIGtleTtcblx0Zm9yIChrZXkgaW4gb2JqKSB7LyoqL31cblxuXHRyZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3VuZGVmaW5lZCcgfHwgaGFzT3duLmNhbGwob2JqLCBrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZSxcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMF0sXG5cdFx0aSA9IDEsXG5cdFx0bGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcblx0XHRkZWVwID0gZmFsc2U7XG5cblx0Ly8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuXHRpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Jvb2xlYW4nKSB7XG5cdFx0ZGVlcCA9IHRhcmdldDtcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMV0gfHwge307XG5cdFx0Ly8gc2tpcCB0aGUgYm9vbGVhbiBhbmQgdGhlIHRhcmdldFxuXHRcdGkgPSAyO1xuXHR9IGVsc2UgaWYgKCh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nKSB8fCB0YXJnZXQgPT0gbnVsbCkge1xuXHRcdHRhcmdldCA9IHt9O1xuXHR9XG5cblx0Zm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbaV07XG5cdFx0Ly8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xuXHRcdGlmIChvcHRpb25zICE9IG51bGwpIHtcblx0XHRcdC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3Rcblx0XHRcdGZvciAobmFtZSBpbiBvcHRpb25zKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFtuYW1lXTtcblx0XHRcdFx0Y29weSA9IG9wdGlvbnNbbmFtZV07XG5cblx0XHRcdFx0Ly8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxuXHRcdFx0XHRpZiAodGFyZ2V0ICE9PSBjb3B5KSB7XG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdFx0aWYgKGRlZXAgJiYgY29weSAmJiAoaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBpc0FycmF5KGNvcHkpKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGV4dGVuZChkZWVwLCBjbG9uZSwgY29weSk7XG5cblx0XHRcdFx0XHQvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY29weSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGNvcHk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG5cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlIGZyb20gJy4vRDNUYWJsZSc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG52YXIgZDNUaW1lbGluZSA9IHt9O1xuXG4vKipcbiAqIEFkZCBiZWhhdmlvcnMgdG8gYSBEM1RhYmxlIHRvIGhhbmRsZSBlbGVtZW50cyBhcyB2aXN1YWwgYmxvY2tzIHdpdGg6XG4gKiAgLSBlbGVtZW50IGRyYWcgKCsgYXV0b21hdGljIHNjcm9sbClcbiAqICAtIGVsZW1lbnQgY2xpcHBpbmdcbiAqICAtIGVsZW1lbnQgdGV4dCAoKyBhbGlnbm1lbnQpXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVCbG9ja09wdGlvbnN9IG9wdGlvbnNcbiAqIEBleHRlbmRzIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZDNUaW1lbGluZS5EM0Jsb2NrVGFibGUgPSBmdW5jdGlvbiBEM0Jsb2NrVGFibGUob3B0aW9ucykge1xuICAgIEQzVGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIEBuYW1lIGQzVGltZWxpbmUuRDNCbG9ja1RhYmxlI29wdGlvbnNcbiAgICAgKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlQmxvY2tPcHRpb25zfVxuICAgICAqL1xufTtcblxudmFyIEQzQmxvY2tUYWJsZSA9IGQzVGltZWxpbmUuRDNCbG9ja1RhYmxlO1xuXG5pbmhlcml0cyhEM0Jsb2NrVGFibGUsIEQzVGFibGUpO1xuXG4vKipcbiAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGVCbG9ja09wdGlvbnN9XG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGUucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgY2xpcEVsZW1lbnQ6IHRydWUsXG4gICAgY2xpcEVsZW1lbnRGaWx0ZXI6IG51bGwsXG4gICAgcmVuZGVyT25BdXRvbWF0aWNTY3JvbGxJZGxlOiB0cnVlLFxuICAgIGhpZGVUaWNrc09uQXV0b21hdGljU2Nyb2xsOiBmYWxzZSxcbiAgICBhdXRvbWF0aWNTY3JvbGxTcGVlZE11bHRpcGxpZXI6IDJlLTQsXG4gICAgYXV0b21hdGljU2Nyb2xsTWFyZ2luRGVsdGE6IDMwLFxuICAgIGFwcGVuZFRleHQ6IHRydWUsXG4gICAgYWxpZ25MZWZ0OiB0cnVlLFxuICAgIGFsaWduT25UcmFuc2xhdGU6IHRydWUsXG4gICAgbWF4aW11bUNsaWNrRHJhZ1RpbWU6IDEwMCxcbiAgICBtYXhpbXVtQ2xpY2tEcmFnRGlzdGFuY2U6IDEyLFxuICAgIG1pbmltdW1EcmFnRGlzdGFuY2U6IDUsXG4gICAgdHJhY2tlZEVsZW1lbnRET01FdmVudHM6IFsnY2xpY2snLCAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJ10gLy8gbm90IGR5bmFtaWNcbn0pO1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIGNsaXAgcGF0aCBpZCBmb3IgZWFjaCBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFBhdGhJZCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENsaXBQYXRoXycgKyB0aGlzLmluc3RhbmNlTnVtYmVyICsgJ18nICsgZWxlbWVudC51aWQ7XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIGNsaXAgcGF0aCBsaW5rIGZvciBlYWNoIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUGF0aExpbmsgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuICd1cmwoIycgKyB0aGlzLmdlbmVyYXRlQ2xpcFBhdGhJZChlbGVtZW50KSArICcpJztcbn07XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgY2xpcCByZWN0IGlkIGZvciBlYWNoIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUmVjdElkID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50Q2xpcFJlY3RfJyArIHRoaXMuaW5zdGFuY2VOdW1iZXIgKyAnXycgKyBlbGVtZW50LnVpZDtcbn07XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgY2xpcCByZWN0IGxpbmsgZm9yIGVhY2ggZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBSZWN0TGluayA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gJyMnICsgdGhpcy5nZW5lcmF0ZUNsaXBSZWN0SWQoZWxlbWVudCk7XG59O1xuXG4vKipcbiAqIEltcGxlbWVudHMgZWxlbWVudCBlbnRlcmluZzpcbiAqICAtIGFwcGVuZCBjbGlwcGVkIHJlY3RcbiAqICAtIGFwcGVuZCB0ZXh0XG4gKiAgLSBjYWxsIHtAbGluayBkM1RpbWVsaW5lLkQzQmxvY2tUYWJsZSNlbGVtZW50Q29udGVudEVudGVyfVxuICogIC0gY2FsbCBjdXN0b20gZHJhZyBiZWhhdmlvclxuICpcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRFbnRlciA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZWxlbWVudCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGVsZW1lbnRIZWlnaHQgPSB0aGlzLm9wdGlvbnMucm93SGVpZ2h0IC0gdGhpcy5vcHRpb25zLnJvd1BhZGRpbmcgKiAyO1xuXG4gICAgdmFyIHJlY3QgPSBzZWxlY3Rpb25cbiAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRCYWNrZ3JvdW5kJylcbiAgICAgICAgLmF0dHIoJ2hlaWdodCcsIGVsZW1lbnRIZWlnaHQpO1xuXG4gICAgdmFyIGcgPSBzZWxlY3Rpb25cbiAgICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRDb250ZW50Jyk7XG5cbiAgICBnLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpO1xuXG5cbiAgICB2YXIgY2xpcEVsZW1lbnQgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xpcEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuY2xpcEVsZW1lbnRGaWx0ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNsaXBFbGVtZW50ID0gISF0aGlzLm9wdGlvbnMuY2xpcEVsZW1lbnRGaWx0ZXIuY2FsbCh0aGlzLCBzZWxlY3Rpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xpcEVsZW1lbnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNsaXBFbGVtZW50KSB7XG5cbiAgICAgICAgZ1xuICAgICAgICAgICAgLmF0dHIoJ2NsaXAtcGF0aCcsIHRoaXMuZ2VuZXJhdGVDbGlwUGF0aExpbmsuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgcmVjdFxuICAgICAgICAgICAgLnByb3BlcnR5KCdpZCcsIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdElkLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHNlbGVjdGlvbi5hcHBlbmQoJ2NsaXBQYXRoJylcbiAgICAgICAgICAgIC5wcm9wZXJ0eSgnaWQnLCB0aGlzLmdlbmVyYXRlQ2xpcFBhdGhJZC5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLmFwcGVuZCgndXNlJylcbiAgICAgICAgICAgIC5hdHRyKCd4bGluazpocmVmJywgdGhpcy5nZW5lcmF0ZUNsaXBSZWN0TGluay5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMudHJhY2tlZEVsZW1lbnRET01FdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudE5hbWUpIHtcbiAgICAgICAgc2VsZWN0aW9uLm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgaWYgKCFkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDonICsgZXZlbnROYW1lLCBzZWxlY3Rpb24sIG51bGwsIFtkYXRhXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRUZXh0KSB7XG4gICAgICAgIHNlbGVjdGlvblxuICAgICAgICAgICAgLnNlbGVjdCgnLnRpbWVsaW5lLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpXG4gICAgICAgICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgICAgIC5jbGFzc2VkKCd0aW1lbGluZS1lbnRpdHlMYWJlbCcsIHRydWUpXG4gICAgICAgICAgICAuYXR0cignZHknLCB0aGlzLm9wdGlvbnMucm93SGVpZ2h0LzIgKyA0KTtcbiAgICB9XG5cbiAgICBzZWxlY3Rpb24uY2FsbCh0aGlzLmVsZW1lbnRDb250ZW50RW50ZXIuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmJpbmREcmFnQW5kRHJvcE9uU2VsZWN0aW9uKHNlbGVjdGlvbiwgZWxlbWVudCk7XG5cbn07XG5cbi8qKlxuICogSW1wbGVtZW50IGVsZW1lbnQgYmVpbmcgdHJhbnNsYXRlZDpcbiAqICAtIGFsaWduIHRleHRcbiAqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqL1xuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50c1RyYW5zbGF0ZSA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZWxlbWVudCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRUZXh0ICYmIHRoaXMub3B0aW9ucy5hbGlnbkxlZnQgJiYgdGhpcy5vcHRpb25zLmFsaWduT25UcmFuc2xhdGUgJiYgIWVsZW1lbnQuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIE1hdGgubWF4KC1zZWxmLnNjYWxlcy54KHNlbGYuZ2V0RGF0YVN0YXJ0KGRhdGEpKSwgMikgKyAnLDApJ1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIEltcGxlbWVudCBlbGVtZW50IGJlaW5nIHVwZGF0ZWQ6XG4gKiAgLSB0cmFuc2l0aW9uIHdpZHRoXG4gKiAgLSBhbGlnbiB0ZXh0XG4gKiAgLSBjYWxsIHtAbGluayBkM1RpbWVsaW5lLkQzQmxvY2tUYWJsZSNlbGVtZW50Q29udGVudFVwZGF0ZX1cbiAqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB0cmFuc2l0aW9uRHVyYXRpb25cbiAqL1xuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50VXBkYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBlbGVtZW50LCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMud3JhcFdpdGhBbmltYXRpb24oc2VsZWN0aW9uLnNlbGVjdCgnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50QmFja2dyb3VuZCcpLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgIHk6IHRoaXMub3B0aW9ucy5yb3dQYWRkaW5nLFxuICAgICAgICAgICAgd2lkdGg6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5zY2FsZXMueChzZWxmLmdldERhdGFFbmQoZCkpIC0gc2VsZi5zY2FsZXMueChzZWxmLmdldERhdGFTdGFydChkKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZFRleHQgJiYgdGhpcy5vcHRpb25zLmFsaWduTGVmdCAmJiAhZWxlbWVudC5fZGVmYXVsdFByZXZlbnRlZCkge1xuXG4gICAgICAgIHNlbGVjdGlvblxuICAgICAgICAgICAgLnNlbGVjdCgnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50TW92YWJsZUNvbnRlbnQnKVxuICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGQgPT4gJ3RyYW5zbGF0ZSgnICsgTWF0aC5tYXgoLXRoaXMuc2NhbGVzLngodGhpcy5nZXREYXRhU3RhcnQoZCkpLCAyKSArICcsMCknKTtcbiAgICB9XG5cbiAgICBzZWxlY3Rpb24uY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5lbGVtZW50Q29udGVudFVwZGF0ZShzZWxlY3Rpb24sIGVsZW1lbnQsIHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfSk7XG5cbn07XG5cbi8qKlxuICogSW1wbGVtZW50IGVsZW1lbnQgZXhpdGluZzpcbiAqICAtIHJlbW92ZSBjbGljayBsaXN0ZW5lclxuICogIC0gcmVtb3ZlIGRyYWcgbGlzdGVuZXJzXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0gc2VsZWN0aW9uXG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudEV4aXQgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpIHtcblxuICAgIHNlbGVjdGlvbi5vbignY2xpY2snLCBudWxsKTtcblxuICAgIGlmIChlbGVtZW50Ll9kcmFnKSB7XG4gICAgICAgIGVsZW1lbnQuX2RyYWcub24oJ2RyYWdzdGFydCcsIG51bGwpO1xuICAgICAgICBlbGVtZW50Ll9kcmFnLm9uKCdkcmFnJywgbnVsbCk7XG4gICAgICAgIGVsZW1lbnQuX2RyYWcub24oJ2RyYWdlbmQnLCBudWxsKTtcbiAgICAgICAgZWxlbWVudC5fZHJhZyA9IG51bGw7XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIFdpbGwgYmUgY2FsbGVkIG9uIHNlbGVjdGlvbiB3aGVuIGVsZW1lbnQgY29udGVudCBlbnRlcnNcbiAqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudENvbnRlbnRFbnRlciA9IGZ1bmN0aW9uKHNlbGVjdGlvbikge307XG5cbi8qKlxuICogV2lsbCBiZSBjYWxsZWQgb24gc2VsZWN0aW9uIHdoZW4gZWxlbWVudCBjb250ZW50IHVwZGF0ZXNcbiAqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudENvbnRlbnRVcGRhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHt9O1xuXG4vKipcbiAqIEltcGxlbWVudCBlbGVtZW50IGRyYWcgd2l0aCBhdXRvbWF0aWMgc2Nyb2xsIG9uIHByb3ZpZGVkIHNlbGVjdGlvblxuICpcbiAqIEB0b2RvIGNsZWFuIHVwXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqL1xuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5iaW5kRHJhZ0FuZERyb3BPblNlbGVjdGlvbiA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZWxlbWVudCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBib2R5Tm9kZSA9IHNlbGYuZWxlbWVudHMuYm9keS5ub2RlKCk7XG4gICAgdmFyIGRyYWdTdGFydGVkID0gZmFsc2U7XG5cbiAgICAvLyBwb3NpdGlvbnNcbiAgICB2YXIgY3VycmVudFRyYW5zZm9ybSA9IG51bGw7XG4gICAgdmFyIG9yaWdpblRyYW5zZm9ybVN0cmluZyA9IG51bGw7XG4gICAgdmFyIGRyYWdTdGFydFggPSAwLCBkcmFnU3RhcnRZID0gMDtcbiAgICB2YXIgZWxlbWVudFN0YXJ0WCA9IDAsIGVsZW1lbnRTdGFydFkgPSAwO1xuICAgIHZhciBkcmFnUG9zaXRpb247XG4gICAgdmFyIHN0YXJ0RHJhZ1Bvc2l0aW9uO1xuXG4gICAgLy8gbW92ZW1lbnRzXG4gICAgdmFyIHZlcnRpY2FsTW92ZSA9IDA7XG4gICAgdmFyIGhvcml6b250YWxNb3ZlID0gMDtcbiAgICB2YXIgdmVydGljYWxTcGVlZCA9IDA7XG4gICAgdmFyIGhvcml6b250YWxTcGVlZCA9IDA7XG4gICAgdmFyIHRpbWVyQWN0aXZlID0gZmFsc2U7XG4gICAgdmFyIG5lZWRUaW1lclN0b3AgPSBmYWxzZTtcbiAgICB2YXIgc3RhcnRUaW1lO1xuXG4gICAgLy8gcmVzZXQgc3RhcnQgcG9zaXRpb246IHRvIGNhbGwgb24gZHJhZyBzdGFydCBvciB3aGVuIHRoaW5ncyBhcmUgcmVkcmF3blxuICAgIGZ1bmN0aW9uIHN0b3JlU3RhcnQoKSB7XG4gICAgICAgIGN1cnJlbnRUcmFuc2Zvcm0gPSBkMy50cmFuc2Zvcm0ob3JpZ2luVHJhbnNmb3JtU3RyaW5nID0gc2VsZWN0aW9uLmF0dHIoJ3RyYW5zZm9ybScpKTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WCA9IGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzBdO1xuICAgICAgICBlbGVtZW50U3RhcnRZID0gY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMV07XG4gICAgICAgIGRyYWdTdGFydFggPSBkcmFnUG9zaXRpb25bMF07XG4gICAgICAgIGRyYWdTdGFydFkgPSBkcmFnUG9zaXRpb25bMV07XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIG5ldyBkcmFnIHBvc2l0aW9uIGFuZCBtb3ZlIHRoZSBlbGVtZW50XG4gICAgZnVuY3Rpb24gdXBkYXRlVHJhbnNmb3JtKGZvcmNlRHJhdykge1xuXG4gICAgICAgIHZhciBkZWx0YVggPSBkcmFnUG9zaXRpb25bMF0gLSBkcmFnU3RhcnRYO1xuICAgICAgICB2YXIgZGVsdGFZID0gZHJhZ1Bvc2l0aW9uWzFdIC0gZHJhZ1N0YXJ0WTtcblxuICAgICAgICBpZiAoZm9yY2VEcmF3IHx8ICFzZWxmLm9wdGlvbnMucmVuZGVyT25JZGxlKSB7XG4gICAgICAgICAgICBzdG9yZVN0YXJ0KGRyYWdQb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVswXSA9IGVsZW1lbnRTdGFydFggKyBkZWx0YVg7XG4gICAgICAgIGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdID0gZWxlbWVudFN0YXJ0WSArIGRlbHRhWTtcblxuICAgICAgICBzZWxlY3Rpb24uYXR0cigndHJhbnNmb3JtJywgY3VycmVudFRyYW5zZm9ybS50b1N0cmluZygpKTtcblxuICAgIH1cblxuICAgIC8vIHRha2UgbWljcm8gc2Vjb25kcyBpZiBwb3NzaWJsZVxuICAgIHZhciBnZXRQcmVjaXNlVGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZSAmJiB0eXBlb2YgcGVyZm9ybWFuY2Uubm93ID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgcGVyZm9ybWFuY2Uubm93LmJpbmQocGVyZm9ybWFuY2UpXG4gICAgICAgIDogdHlwZW9mIERhdGUubm93ID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgICAgIERhdGUubm93LmJpbmQoRGF0ZSlcbiAgICAgICAgICAgIDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICsobmV3IERhdGUoKSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgLy8gaGFuZGxlIGF1dG9tYXRpYyBzY3JvbGwgYXJndW1lbnRzXG4gICAgZnVuY3Rpb24gZG9BdXRvbWF0aWNTY3JvbGwodGltZURlbHRhLCBmb3JjZURyYXcpIHtcblxuICAgICAgICAvLyBjb21wdXRlIGRlbHRhcyBiYXNlZCBvbiBkaXJlY3Rpb24sIHNwZWVkIGFuZCB0aW1lIGRlbHRhXG4gICAgICAgIHZhciBzcGVlZE11bHRpcGxpZXIgPSBzZWxmLm9wdGlvbnMuYXV0b21hdGljU2Nyb2xsU3BlZWRNdWx0aXBsaWVyO1xuICAgICAgICB2YXIgZGVsdGFYID0gaG9yaXpvbnRhbE1vdmUgKiBob3Jpem9udGFsU3BlZWQgKiB0aW1lRGVsdGEgKiBzcGVlZE11bHRpcGxpZXI7XG4gICAgICAgIHZhciBkZWx0YVkgPSB2ZXJ0aWNhbE1vdmUgKiB2ZXJ0aWNhbFNwZWVkICogdGltZURlbHRhICogc3BlZWRNdWx0aXBsaWVyO1xuXG4gICAgICAgIC8vIHRha2UgZ3JvdXAgdHJhbnNsYXRlIGNhbmNlbGxhdGlvbiB3aXRoIGZvcmNlZCByZWRyYXcgaW50byBhY2NvdW50LCBzbyByZWRlZmluZSBzdGFydFxuICAgICAgICBpZiAoZm9yY2VEcmF3KSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgPSBzZWxmLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlLnNsaWNlKDApO1xuICAgICAgICAgICAgZWxlbWVudFN0YXJ0WCArPSBjdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVswXTtcbiAgICAgICAgICAgIGVsZW1lbnRTdGFydFkgKz0gY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVhbE1vdmUgPSBzZWxmLm1vdmUoZGVsdGFYLCBkZWx0YVksIGZvcmNlRHJhdywgZmFsc2UsICFzZWxmLm9wdGlvbnMuaGlkZVRpY2tzT25BdXRvbWF0aWNTY3JvbGwpO1xuXG4gICAgICAgIGlmIChyZWFsTW92ZVsyXSB8fCByZWFsTW92ZVszXSkge1xuICAgICAgICAgICAgdXBkYXRlVHJhbnNmb3JtKGZvcmNlRHJhdyk7XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50U3RhcnRYIC09IHJlYWxNb3ZlWzJdO1xuICAgICAgICBlbGVtZW50U3RhcnRZIC09IHJlYWxNb3ZlWzNdO1xuXG4gICAgICAgIG5lZWRUaW1lclN0b3AgPSByZWFsTW92ZVsyXSA9PT0gMCAmJiByZWFsTW92ZVszXSA9PT0gMDtcbiAgICB9XG5cblxuICAgIHZhciBkcmFnID0gZWxlbWVudC5fZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKTtcblxuICAgIGRyYWdcbiAgICAgICAgLm9uKCdkcmFnc3RhcnQnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIGlmIChkYXRhLl9kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFkMy5ldmVudC5zb3VyY2VFdmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC53aGljaCAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdGFydERyYWdQb3NpdGlvbiA9IGRyYWdQb3NpdGlvbiA9IGQzLm1vdXNlKGJvZHlOb2RlKTtcblxuICAgICAgICAgICAgc3RhcnRUaW1lID0gK25ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHN0b3JlU3RhcnQoKTtcblxuICAgICAgICAgICAgZGF0YS5fZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLl9mcm96ZW5VaWRzLnB1c2goZGF0YS51aWQpO1xuXG4gICAgICAgIH0pXG4gICAgICAgIC5vbignZHJhZycsIGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgaWYgKCFkYXRhLl9kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkcmFnUG9zaXRpb24gPSBkMy5tb3VzZShib2R5Tm9kZSk7XG5cbiAgICAgICAgICAgIGlmICghZHJhZ1N0YXJ0ZWQpIHtcblxuICAgICAgICAgICAgICAgIHZhciB0aW1lRGVsdGEgPSArbmV3IERhdGUoKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICB2YXIgdG90YWxEZWx0YVggPSBkcmFnUG9zaXRpb25bMF0gLSBzdGFydERyYWdQb3NpdGlvblswXTtcbiAgICAgICAgICAgICAgICB2YXIgdG90YWxEZWx0YVkgPSBkcmFnUG9zaXRpb25bMV0gLSBzdGFydERyYWdQb3NpdGlvblsxXTtcbiAgICAgICAgICAgICAgICB2YXIgZHJhZ0Rpc3RhbmNlID0gTWF0aC5zcXJ0KHRvdGFsRGVsdGFYKnRvdGFsRGVsdGFYK3RvdGFsRGVsdGFZKnRvdGFsRGVsdGFZKTtcblxuICAgICAgICAgICAgICAgIGRyYWdTdGFydGVkID0gKHRpbWVEZWx0YSA+IHNlbGYub3B0aW9ucy5tYXhpbXVtQ2xpY2tEcmFnVGltZSB8fCBkcmFnRGlzdGFuY2UgPiBzZWxmLm9wdGlvbnMubWF4aW11bUNsaWNrRHJhZ0Rpc3RhbmNlKSAmJiBkcmFnRGlzdGFuY2UgPiBzZWxmLm9wdGlvbnMubWluaW11bURyYWdEaXN0YW5jZTtcblxuICAgICAgICAgICAgICAgIGlmIChkcmFnU3RhcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OmRyYWdzdGFydCcsIHNlbGVjdGlvbiwgbnVsbCwgW2RhdGFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkcmFnU3RhcnRlZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6ZHJhZycsIHNlbGVjdGlvbiwgbnVsbCwgW2RhdGFdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG1hcmdpbkRlbHRhID0gc2VsZi5vcHRpb25zLmF1dG9tYXRpY1Njcm9sbE1hcmdpbkRlbHRhO1xuICAgICAgICAgICAgdmFyIGRSaWdodCA9IG1hcmdpbkRlbHRhIC0gKHNlbGYuZGltZW5zaW9ucy53aWR0aCAtIGRyYWdQb3NpdGlvblswXSk7XG4gICAgICAgICAgICB2YXIgZExlZnQgPSBtYXJnaW5EZWx0YSAtIGRyYWdQb3NpdGlvblswXTtcbiAgICAgICAgICAgIHZhciBkQm90dG9tID0gbWFyZ2luRGVsdGEgLSAoc2VsZi5kaW1lbnNpb25zLmhlaWdodCAtIGRyYWdQb3NpdGlvblsxXSk7XG4gICAgICAgICAgICB2YXIgZFRvcCA9IG1hcmdpbkRlbHRhIC0gZHJhZ1Bvc2l0aW9uWzFdO1xuXG4gICAgICAgICAgICBob3Jpem9udGFsU3BlZWQgPSBNYXRoLnBvdyhNYXRoLm1heChkUmlnaHQsIGRMZWZ0LCBtYXJnaW5EZWx0YSksIDIpO1xuICAgICAgICAgICAgdmVydGljYWxTcGVlZCA9IE1hdGgucG93KE1hdGgubWF4KGRCb3R0b20sIGRUb3AsIG1hcmdpbkRlbHRhKSwgMik7XG5cbiAgICAgICAgICAgIHZhciBwcmV2aW91c0hvcml6b250YWxNb3ZlID0gaG9yaXpvbnRhbE1vdmU7XG4gICAgICAgICAgICB2YXIgcHJldmlvdXNWZXJ0aWNhbE1vdmUgPSB2ZXJ0aWNhbE1vdmU7XG4gICAgICAgICAgICBob3Jpem9udGFsTW92ZSA9IGRSaWdodCA+IDAgPyAtMSA6IGRMZWZ0ID4gMCA/IDEgOiAwO1xuICAgICAgICAgICAgdmVydGljYWxNb3ZlID0gZEJvdHRvbSA+IDAgPyAtMSA6IGRUb3AgPiAwID8gMSA6IDA7XG5cbiAgICAgICAgICAgIHZhciBoYXNDaGFuZ2VkU3RhdGUgPSBwcmV2aW91c0hvcml6b250YWxNb3ZlICE9PSBob3Jpem9udGFsTW92ZSB8fCBwcmV2aW91c1ZlcnRpY2FsTW92ZSAhPT0gdmVydGljYWxNb3ZlO1xuXG4gICAgICAgICAgICBpZiAoKGhvcml6b250YWxNb3ZlIHx8IHZlcnRpY2FsTW92ZSkgJiYgIXRpbWVyQWN0aXZlICYmIGhhc0NoYW5nZWRTdGF0ZSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHRpbWVyU3RhcnRUaW1lID0gZ2V0UHJlY2lzZVRpbWUoKTtcblxuICAgICAgICAgICAgICAgIHRpbWVyQWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIGQzLnRpbWVyKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VGltZSA9IGdldFByZWNpc2VUaW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lRGVsdGEgPSBjdXJyZW50VGltZSAtIHRpbWVyU3RhcnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lcldpbGxTdG9wID0gIXZlcnRpY2FsTW92ZSAmJiAhaG9yaXpvbnRhbE1vdmUgfHwgbmVlZFRpbWVyU3RvcDtcblxuICAgICAgICAgICAgICAgICAgICBkb0F1dG9tYXRpY1Njcm9sbCh0aW1lRGVsdGEsIHNlbGYub3B0aW9ucy5yZW5kZXJPbkF1dG9tYXRpY1Njcm9sbElkbGUgJiYgdGltZXJXaWxsU3RvcCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGltZXJTdGFydFRpbWUgPSBjdXJyZW50VGltZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZXJXaWxsU3RvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmVlZFRpbWVyU3RvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXJBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lcldpbGxTdG9wO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2VsZi5fZHJhZ0FGKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jYW5jZWxBbmltYXRpb25GcmFtZShzZWxmLl9kcmFnQUYpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLl9kcmFnQUYgPSBzZWxmLnJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGVUcmFuc2Zvcm0pO1xuXG4gICAgICAgIH0pXG4gICAgICAgIC5vbignZHJhZ2VuZCcsIGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgaWYgKCFkYXRhLl9kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHNlbGYuX2RyYWdBRik7XG4gICAgICAgICAgICBzZWxmLl9kcmFnQUYgPSBudWxsO1xuICAgICAgICAgICAgaG9yaXpvbnRhbE1vdmUgPSAwO1xuICAgICAgICAgICAgdmVydGljYWxNb3ZlID0gMDtcblxuICAgICAgICAgICAgZGF0YS5fZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi5fZnJvemVuVWlkcy5zcGxpY2Uoc2VsZi5fZnJvemVuVWlkcy5pbmRleE9mKGRhdGEudWlkKSwgMSk7XG5cbiAgICAgICAgICAgIHZhciBkZWx0YUZyb21Ub3BMZWZ0Q29ybmVyID0gZDMubW91c2Uoc2VsZWN0aW9uLm5vZGUoKSk7XG4gICAgICAgICAgICB2YXIgaGFsZkhlaWdodCA9IHNlbGYub3B0aW9ucy5yb3dIZWlnaHQgLyAyO1xuICAgICAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcblxuICAgICAgICAgICAgaWYgKGRyYWdTdGFydGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnZW5kJywgc2VsZWN0aW9uLCBbLWRlbHRhRnJvbVRvcExlZnRDb3JuZXJbMF0sIC1kZWx0YUZyb21Ub3BMZWZ0Q29ybmVyWzFdICsgaGFsZkhlaWdodF0sIFtkYXRhXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nLCBvcmlnaW5UcmFuc2Zvcm1TdHJpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmXG4gICAgICAgICAgICAgICAgLnVwZGF0ZVkoKVxuICAgICAgICAgICAgICAgIC5kcmF3WUF4aXMoKTtcblxuICAgICAgICAgICAgZHJhZ1N0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICBzZWxlY3Rpb24uY2FsbChkcmFnKTtcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNCbG9ja1RhYmxlO1xuIiwiLyogZ2xvYmFsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cy9ldmVudHMnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcblxudmFyIGQzVGltZWxpbmUgPSB7fTtcblxuXG4vKipcbiAqIEFuIGluc3RhbmNlIG9mIEQzVGFibGUgdXNlcyBkMy5qcyB0byBidWlsZCBhIHN2ZyBncmlkIHdpdGggYXhpc2VzLlxuICogWW91IHNldCBhIGRhdGEgc2V0IHdpdGgge0BsaW5rIGQzVGltZWxpbmUuRDNUYWJsZS5zZXREYXRhfS5cbiAqIEVhY2ggZ3JvdXAgb2YgZWxlbWVudCB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlUm93fSBpcyBkcmF3biBpbiByb3dzICh5IGF4aXMpXG4gKiBhbmQgZWFjaCBlbGVtZW50IHtAbGluayBkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBvZiBhIHJvdyBpcyBkcmF3biBpbiB0aGlzIHJvd1xuICogVGhlcmUgaXMgbm8gZ3JhcGhpY2FsIGVsZW1lbnQgZm9yIHJvd3MuXG4gKlxuICogVGhlIHByb3ZpZGVkIG5lc3RlZCBkYXRhIHNldCBpcyBmaXJzdCBmbGF0dGVuZWQgdG8gZW5hYmxlIHRyYW5zaXRpb24gYmV0d2VlbiBkaWZmZXJlbnRzIHJvd3MuXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVPcHRpb25zfSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZDNUaW1lbGluZS5EM1RhYmxlID0gZnVuY3Rpb24gRDNUYWJsZShvcHRpb25zKSB7XG5cbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIEQzVGFibGUuaW5zdGFuY2VzQ291bnQgKz0gMTtcblxuICAgIHRoaXMuaW5zdGFuY2VOdW1iZXIgPSBEM1RhYmxlLmluc3RhbmNlc0NvdW50O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZU9wdGlvbnN9XG4gICAgICovXG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHRydWUsIHt9LCB0aGlzLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheTxEM1RhYmxlUm93Pn1cbiAgICAgKi9cbiAgICB0aGlzLmRhdGEgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheTxEM1RhYmxlRWxlbWVudD59XG4gICAgICovXG4gICAgdGhpcy5mbGF0dGVuZWREYXRhID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7e3RvcDogbnVtYmVyLCByaWdodDogbnVtYmVyLCBib3R0b206IG51bWJlciwgbGVmdDogbnVtYmVyfX1cbiAgICAgKi9cbiAgICB0aGlzLm1hcmdpbiA9IHtcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICByaWdodDogMCxcbiAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICBsZWZ0OiAwXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAqL1xuICAgIHRoaXMuZGltZW5zaW9ucyA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge251bWJlcltdfVxuICAgICAqL1xuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgPSBbMC4wLCAwLjBdO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge2QzLlNlbGVjdGlvbn1cbiAgICAgKi9cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7e1xuICAgICAqICBib2R5OiBkMy5TZWxlY3Rpb24sXG4gICAgICogIGlubmVyQ29udGFpbmVyOiBkMy5TZWxlY3Rpb24sXG4gICAgICogIHhBeGlzQ29udGFpbmVyOiBkMy5TZWxlY3Rpb24sXG4gICAgICogIHgyQXhpc0NvbnRhaW5lcjogZDMuU2VsZWN0aW9uLFxuICAgICAqICB5QXhpc0NvbnRhaW5lcjogZDMuU2VsZWN0aW9uLFxuICAgICAqICBkZWZzOiBkMy5TZWxlY3Rpb24sXG4gICAgICogIGNsaXA6IGQzLlNlbGVjdGlvblxuICAgICAqIH19XG4gICAgICovXG4gICAgdGhpcy5lbGVtZW50cyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge3tcbiAgICAgKiAgeDogZDMuc2NhbGUuTGluZWFyLFxuICAgICAqICB5OiBkMy5zY2FsZS5MaW5lYXJcbiAgICAgKiB9fVxuICAgICAqL1xuICAgIHRoaXMuc2NhbGVzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7e1xuICAgICAqICB4OiBkMy5zdmcuQXhpcyxcbiAgICAgKiAgeDI6IGQzLnN2Zy5BeGlzLFxuICAgICAqICB5OiBkMy5zdmcuQXhpc1xuICAgICAqIH19XG4gICAgICovXG4gICAgdGhpcy5heGlzZXMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHt7XG4gICAgICogIHpvb206IGQzLmJlaGF2aW9yLlpvb20sXG4gICAgICogIHpvb21YOiBkMy5iZWhhdmlvci5ab29tLFxuICAgICAqICB6b29tWTogZDMuYmVoYXZpb3IuWm9vbSxcbiAgICAgKiAgcGFuOiBkMy5iZWhhdmlvci5EcmFnXG4gICAgICogfX1cbiAgICAgKi9cbiAgICB0aGlzLmJlaGF2aW9ycyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge1tOdW1iZXIsIE51bWJlcl19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtbTnVtYmVyLCBOdW1iZXJdfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fbGFzdFNjYWxlID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl95U2NhbGUgPSAwLjA7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fZGF0YUNoYW5nZUNvdW50ID0gMDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPSAwO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3ByZXZlbnREcmF3aW5nID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXk8RnVuY3Rpb24+fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9tYXhCb2R5SGVpZ2h0ID0gSW5maW5pdHk7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXk8TnVtYmVyfFN0cmluZz59XG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHRoaXMuX2Zyb3plblVpZHMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fcHJldmVudEV2ZW50RW1pc3Npb24gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fZGlzYWJsZWQgPSBmYWxzZTtcbn07XG5cbnZhciBEM1RhYmxlID0gZDNUaW1lbGluZS5EM1RhYmxlO1xuXG5pbmhlcml0cyhEM1RhYmxlLCBFdmVudEVtaXR0ZXIpO1xuXG4vKipcbiAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGVPcHRpb25zfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcbiAgICBiZW1CbG9ja05hbWU6ICd0YWJsZScsXG4gICAgYmVtQmxvY2tNb2RpZmllcjogJycsXG4gICAgeEF4aXNIZWlnaHQ6IDUwLFxuICAgIHlBeGlzV2lkdGg6IDUwLFxuICAgIHJvd0hlaWdodDogMzAsXG4gICAgcm93UGFkZGluZzogNSxcbiAgICB0aWNrUGFkZGluZzogMjAsXG4gICAgY29udGFpbmVyOiAnYm9keScsXG4gICAgY3VsbGluZ1g6IHRydWUsXG4gICAgY3VsbGluZ1k6IHRydWUsXG4gICAgY3VsbGluZ0Rpc3RhbmNlOiAxLFxuICAgIHJlbmRlck9uSWRsZTogdHJ1ZSxcbiAgICBoaWRlVGlja3NPblpvb206IGZhbHNlLFxuICAgIGhpZGVUaWNrc09uRHJhZzogZmFsc2UsXG4gICAgcGFuWU9uV2hlZWw6IHRydWUsXG4gICAgd2hlZWxNdWx0aXBsaWVyOiAxLFxuICAgIGVuYWJsZVlUcmFuc2l0aW9uOiB0cnVlLFxuICAgIGVuYWJsZVRyYW5zaXRpb25PbkV4aXQ6IHRydWUsXG4gICAgdXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtOiBmYWxzZSxcbiAgICB0cmFuc2l0aW9uRWFzaW5nOiAncXVhZC1pbi1vdXQnLFxuICAgIHhBeGlzVGlja3NGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgfSxcbiAgICB4QXhpc1N0cm9rZVdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkJTIgPyAxIDogMjtcbiAgICB9LFxuICAgIHhBeGlzMlRpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9LFxuICAgIHlBeGlzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkICYmIGQubmFtZSB8fCAnJztcbiAgICB9LFxuICAgIHBhZGRpbmc6IDEwLFxuICAgIHRyYWNrZWRET01FdmVudHM6IFsnY2xpY2snLCAnbW91c2Vtb3ZlJywgJ3RvdWNobW92ZScsICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXSAvLyBub3QgZHluYW1pY1xufTtcblxuLyoqXG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5EM1RhYmxlLmluc3RhbmNlc0NvdW50ID0gMDtcblxuLyoqXG4gKiBOb29wIGZ1bmN0aW9uLCB3aGljaCBkb2VzIG5vdGhpbmdcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUubm9vcCA9IGZ1bmN0aW9uKCkge307XG5cbi8qKlxuICogSW5pdGlhbGl6YXRpb24gbWV0aG9kXG4gKiAgLSBjcmVhdGUgdGhlIGVsZW1lbnRzXG4gKiAgLSBpbnN0YW50aWF0ZSBkMyBpbnN0YW5jZXNcbiAqICAtIHJlZ2lzdGVyIGxpc3RlbmVyc1xuICpcbiAqIERhdGEgd2lsbCBiZSBkcmF3biBpbiB0aGUgaW5uZXIgY29udGFpbmVyXG4gKlxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gY29udGFpbmVyXG4gICAgdGhpcy5jb250YWluZXIgPSBkMy5zZWxlY3QodGhpcy5vcHRpb25zLmNvbnRhaW5lcikuYXBwZW5kKCdzdmcnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgKHRoaXMub3B0aW9ucy5iZW1CbG9ja01vZGlmaWVyID8gJyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArIHRoaXMub3B0aW9ucy5iZW1CbG9ja01vZGlmaWVyIDogJycpKTtcblxuXG4gICAgLy8gZGVmcyBhbmQgY2xpcCBpbiBkZWZzXG4gICAgdGhpcy5lbGVtZW50cy5kZWZzID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdkZWZzJyk7XG5cbiAgICB2YXIgY2xpcElkID0gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm9keUNsaXBQYXRoLS0nICsgRDNUYWJsZS5pbnN0YW5jZXNDb3VudDtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXAgPSB0aGlzLmVsZW1lbnRzLmRlZnMuYXBwZW5kKCdjbGlwUGF0aCcpXG4gICAgICAgIC5wcm9wZXJ0eSgnaWQnLCBjbGlwSWQpO1xuICAgIHRoaXMuZWxlbWVudHMuY2xpcFxuICAgICAgICAuYXBwZW5kKCdyZWN0Jyk7XG5cblxuICAgIC8vIGJhY2tncm91bmQgcmVjdCBpbiBjb250YWluZXJcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuY2xhc3NlZCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcsIHRydWUpO1xuXG5cbiAgICAvLyBheGlzZXMgY29udGFpbmVycyBpbiBjb250YWluZXJcbiAgICB0aGlzLmVsZW1lbnRzLnhBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teCcpO1xuXG4gICAgdGhpcy5lbGVtZW50cy54MkF4aXNDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS14ICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS1zZWNvbmRhcnknKTtcblxuICAgIHRoaXMuZWxlbWVudHMueUF4aXNDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS15Jyk7XG5cblxuICAgIC8vIGJvZHkgaW4gY29udGFpbmVyXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5ID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoIycgKyBjbGlwSWQgKyAnKScpO1xuXG5cbiAgICAvLyBjb250YWN0IHJlY3QsIGlubmVyIGNvbnRhaW5lciBhbmQgYm91bmRpbmcgcmVjdCBpbiBib2R5XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5jbGFzc2VkKHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JywgdHJ1ZSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyID0gdGhpcy5lbGVtZW50cy5ib2R5LmFwcGVuZCgnZycpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5jbGFzc2VkKHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcsIHRydWUpO1xuXG5cbiAgICB0aGlzLnVwZGF0ZU1hcmdpbnMoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUQzSW5zdGFuY2VzKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVFdmVudExpc3RlbmVycygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIERlc3Ryb3kgZnVuY3Rpb24sIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBpbnN0YW5jZSBoYXMgdG8gYmUgZGVzdHJveWVkXG4gKiBAdG9kbyBlbnN1cmUgbm8gbWVtb3J5IGxlYWsgd2l0aCB0aGlzIGRlc3Ryb3kgaW1wbGVtZW50YXRpb24sIGVzcGFjaWFsbHkgd2l0aCBkb20gZXZlbnQgbGlzdGVuZXJzXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpkZXN0cm95JywgdGhpcyk7XG5cbiAgICAvLyByZW1vdmUgYmVoYXZpb3IgbGlzdGVuZXJzXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS5vbignem9vbScsIG51bGwpO1xuXG4gICAgLy8gcmVtb3ZlIGRvbSBsaXN0ZW5lcnNcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkub24oJy56b29tJywgbnVsbCk7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5Lm9uKCdjbGljaycsIG51bGwpO1xuXG4gICAgdGhpcy5jb250YWluZXIucmVtb3ZlKCk7XG5cbiAgICAvLyByZW1vdmUgcmVmZXJlbmNlc1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLmVsZW1lbnRzID0gbnVsbDtcbiAgICB0aGlzLnNjYWxlcyA9IG51bGw7XG4gICAgdGhpcy5heGlzZXMgPSBudWxsO1xuICAgIHRoaXMuYmVoYXZpb3JzID0gbnVsbDtcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xuICAgIHRoaXMuZmxhdHRlbmVkRGF0YSA9IG51bGw7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6ZGVzdHJveWVkJywgdGhpcyk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgZDMgaW5zdGFuY2VzIChzY2FsZXMsIGF4aXNlcywgYmVoYXZpb3JzKVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplRDNJbnN0YW5jZXMgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuXG4gICAgLy8gc2NhbGVzXG5cbiAgICB0aGlzLnNjYWxlcy54ID0gdGhpcy54U2NhbGVGYWN0b3J5KCk7XG5cbiAgICB0aGlzLnNjYWxlcy55ID0gdGhpcy55U2NhbGVGYWN0b3J5KCk7XG5cblxuICAgIC8vIGF4aXNlc1xuXG4gICAgdGhpcy5heGlzZXMueCA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgLnNjYWxlKHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5vcmllbnQoJ3RvcCcpXG4gICAgICAgIC50aWNrRm9ybWF0KHRoaXMub3B0aW9ucy54QXhpc1RpY2tzRm9ybWF0dGVyLmJpbmQodGhpcykpXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApXG4gICAgICAgIC50aWNrUGFkZGluZyh0aGlzLm9wdGlvbnMudGlja1BhZGRpbmcpO1xuXG4gICAgdGhpcy5heGlzZXMueDIgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy54KVxuICAgICAgICAub3JpZW50KCd0b3AnKVxuICAgICAgICAudGlja0Zvcm1hdCh0aGlzLm9wdGlvbnMueEF4aXMyVGlja3NGb3JtYXR0ZXIuYmluZCh0aGlzKSlcbiAgICAgICAgLm91dGVyVGlja1NpemUoMClcbiAgICAgICAgLmlubmVyVGlja1NpemUoMCk7XG5cbiAgICB0aGlzLmF4aXNlcy55ID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAuc2NhbGUodGhpcy5zY2FsZXMueSlcbiAgICAgICAgLm9yaWVudCgnbGVmdCcpXG4gICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLm9wdGlvbnMueUF4aXNGb3JtYXR0ZXIuY2FsbChzZWxmLCBzZWxmLmRhdGFbKGR8MCldLCBkKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm91dGVyVGlja1NpemUoMCk7XG5cblxuICAgIC8vIGJlaGF2aW9yc1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSlcbiAgICAgICAgLm9uKCd6b29tJywgdGhpcy5oYW5kbGVab29taW5nLmJpbmQodGhpcykpXG4gICAgICAgIC5vbignem9vbWVuZCcsIHRoaXMuaGFuZGxlWm9vbWluZ0VuZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YID0gZDMuYmVoYXZpb3Iuem9vbSgpXG4gICAgICAgIC54KHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5zY2FsZSgxKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAueSh0aGlzLnNjYWxlcy55KVxuICAgICAgICAuc2NhbGUoMSlcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy5wYW4gPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgICAgLm9uKCdkcmFnJywgdGhpcy5oYW5kbGVEcmFnZ2luZy5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5jYWxsKHRoaXMuYmVoYXZpb3JzLnBhbik7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmNhbGwodGhpcy5iZWhhdmlvcnMuem9vbSk7XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKTtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCk7XG59O1xuXG4vKipcbiAqIHggc2NhbGUgZmFjdG9yeVxuICogQHJldHVybnMge2QzLnNjYWxlLkxpbmVhcn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUueFNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKTtcbn07XG5cbi8qKlxuICogeSBzY2FsZSBmYWN0b3J5XG4gKiBAcmV0dXJucyB7ZDMuc2NhbGUuTGluZWFyfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS55U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpO1xufTtcblxuXG4vKipcbiAqIEluaXRpYWxpemUgZXZlbnQgbGlzdGVuZXJzIGZvciBhbGwgdHJhY2tlZCBET00gZXZlbnRzXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmluaXRpYWxpemVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5vcHRpb25zLnRyYWNrZWRET01FdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudE5hbWUpIHtcblxuICAgICAgICBzZWxmLmVsZW1lbnRzLmJvZHkub24oZXZlbnROYW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChldmVudE5hbWUgIT09ICdjbGljaycgfHwgIWQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYgZDMuc2VsZWN0KGQzLmV2ZW50LnRhcmdldCkuY2xhc3NlZChzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudChldmVudE5hbWUsIHNlbGYuZWxlbWVudHMuYm9keSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn07XG5cblxuLyoqXG4gKiBQYW4gWC9ZICYgem9vbSBYIChjbGFtcGVkIHBhbiBZIHdoZW4gd2hlZWwgaXMgcHJlc3NlZCB3aXRob3V0IGN0cmwsIHpvb20gWCBhbmQgcGFuIFgvWSBvdGhlcndpc2UpXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmhhbmRsZVpvb21pbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIGlmIG5vdCBjdHJsS2V5IGFuZCBub3QgdG91Y2hlcyA+PSAyXG4gICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmICFkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5ICYmICEoZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID49IDIpKSB7XG5cbiAgICAgICAgLy8gaWYgd2hlZWxpbmcsIGF2b2lkIHpvb21pbmcgYW5kIGxldCB0aGUgd2hlZWxpbmcgaGFuZGxlciBwYW5cbiAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnR5cGUgPT09ICd3aGVlbCcpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wYW5ZT25XaGVlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZVpvb20oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVdoZWVsaW5nKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgLy8gZWxzZSBhdm9pZCB6b29taW5nIGFuZCByZXR1cm4gKHRoZSB1c2VyIGdlc3R1cmUgd2lsbCBiZSBoYW5kbGVkIGJ5IHRoZSB0aGUgcGFuIGJlaGF2aW9yXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXN0b3JlWm9vbSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHRyYW5zbGF0ZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdmFyIHVwZGF0ZWRUcmFuc2xhdGUgPSBbdHJhbnNsYXRlWzBdLCB0aGlzLl9sYXN0VHJhbnNsYXRlWzFdXTtcblxuICAgIHVwZGF0ZWRUcmFuc2xhdGUgPSB0aGlzLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlKHVwZGF0ZWRUcmFuc2xhdGUsIFt0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCksIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnNjYWxlKCldKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHVwZGF0ZWRUcmFuc2xhdGUpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnRyYW5zbGF0ZSh1cGRhdGVkVHJhbnNsYXRlKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuXG4gICAgdGhpcy5tb3ZlRWxlbWVudHModHJ1ZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25ab29tKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVHJhbnNsYXRlO1xuICAgIHRoaXMuX2xhc3RTY2FsZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJyk7XG5cbn07XG5cbi8qKlxuICogRm9yY2UgZHJhd2luZyBlbGVtZW50cywgbnVsbGlmeSBvcHRpbWl6ZWQgaW5uZXIgY29udGFpbmVyIHRyYW5zZm9ybSBhbmQgcmVkcmF3IGF4aXNlc1xuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVab29taW5nRW5kID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuICAgIHRoaXMubW92ZUVsZW1lbnRzKHRydWUpO1xuICAgIHRoaXMuZHJhd1lBeGlzKCk7XG4gICAgdGhpcy5kcmF3WEF4aXMoKTtcbn07XG5cbi8qKlxuICogQ2xhbXBlZCBwYW4gWVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVXaGVlbGluZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGV2ZW50ID0gZDMuZXZlbnQuc291cmNlRXZlbnQ7XG5cbiAgICB2YXIgZGVsdGFYID0gMCwgZGVsdGFZID0gMDtcblxuICAgIHZhciBtb3ZpbmdYID0gZXZlbnQgJiYgZXZlbnQud2hlZWxEZWx0YVggfHwgZXZlbnQuZGVsdGFYO1xuXG4gICAgLy8gaWYgbW92aW5nIHgsIGlnbm9yZSB5IGFuZCBjb21wdXRlIHggZGVsdGFcbiAgICBpZiAobW92aW5nWCkge1xuXG4gICAgICAgIHZhciBtb3ZpbmdSaWdodCA9IGV2ZW50LndoZWVsRGVsdGFYID4gMCB8fCBldmVudC5kZWx0YVggPCAwO1xuICAgICAgICBkZWx0YVggPSAobW92aW5nUmlnaHQgPyAxIDogLTEpICogdGhpcy5jb2x1bW5XaWR0aCAqIHRoaXMub3B0aW9ucy53aGVlbE11bHRpcGxpZXI7XG5cbiAgICB9XG4gICAgLy8gaWYgbm90IG1vdmluZyB4XG4gICAgZWxzZSB7XG5cbiAgICAgICAgdmFyIG1vdmluZ1kgPSBldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LndoZWVsRGVsdGFZIHx8IGV2ZW50LmRldGFpbCB8fCBldmVudC5kZWx0YVk7XG5cbiAgICAgICAgLy8gaWYgbW92aW5nIHksIGNvbXB1dGUgeSBkZWx0YVxuICAgICAgICBpZiAobW92aW5nWSkge1xuICAgICAgICAgICAgdmFyIG1vdmluZ0Rvd24gPSBldmVudC53aGVlbERlbHRhID4gMCB8fCBldmVudC53aGVlbERlbHRhWSA+IDAgfHwgZXZlbnQuZGV0YWlsIDwgMCB8fCBldmVudC5kZWx0YVkgPCAwO1xuICAgICAgICAgICAgZGVsdGFZID0gbW92aW5nWSA/IChtb3ZpbmdEb3duID8gMSA6IC0xKSAqIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgKiB0aGlzLm9wdGlvbnMud2hlZWxNdWx0aXBsaWVyIDogMDtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLy8gZmluYWxseSBtb3ZlIHRoZSBlbGVtZW50c1xuICAgIHRoaXMubW92ZShkZWx0YVgsIGRlbHRhWSwgZmFsc2UsICFtb3ZpbmdYLCB0cnVlKTtcblxufTtcblxuLyoqXG4gKiBEaXJlY3RseSB1c2UgZXZlbnQgeCBhbmQgeSBkZWx0YSB0byBtb3ZlIGVsZW1lbnRzXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmhhbmRsZURyYWdnaW5nID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBpZiBtb3JlIHRoYW4gMiB0b3VjaGVzLCByZXR1cm5cbiAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQudG91Y2hlcyAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b3VjaGVzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm1vdmUoZDMuZXZlbnQuZHgsIGQzLmV2ZW50LmR5LCBmYWxzZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25EcmFnKTtcbn07XG5cbi8qKlxuICogUmVzdG9yZSBwcmV2aW91cyB6b29tIHRyYW5zbGF0ZSBhbmQgc2NhbGUgdGh1cyBjYW5jZWxsaW5nIHRoZSB6b29tIGJlaGF2aW9yIGhhbmRsaW5nXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnJlc3RvcmVab29tID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUodGhpcy5fbGFzdFRyYW5zbGF0ZSk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSh0aGlzLl9sYXN0U2NhbGUpO1xufTtcblxuLyoqXG4gKiBGaXJlIGFuIGV2ZW50IGV2ZW50IHdpdGggdGhlIGdpdmVuIGV2ZW50TmFtZSBwcmVmaXhlZCB3aXRoIHRoZSBiZW0gYmxvY2sgbmFtZVxuICogVGhlIGZvbGxvd2luZyBhcmd1bWVudHMgYXJlIHBhc3NlZCB0byB0aGUgbGlzdGVuZXJzOlxuICogIC0gLi4ucHJpb3JpdHlBcmd1bWVudHNcbiAqICAtIHRoaXM6IHRoZSBEM1RhYmxlIGluc3RhbmNlXG4gKiAgLSBkM1RhcmdldFNlbGVjdGlvblxuICogIC0gZDMuZXZlbnRcbiAqICAtIGdldENvbHVtbigpOiBhIGZ1bmN0aW9uIHRvIGdldCB0aGUgeCB2YWx1ZSBpbiBkYXRhIHNwYWNlXG4gKiAgLSBnZXRSb3coKTogYSBmdW5jdGlvbiB0byBnZXQgdGhlIHkgdmFsdWUgaW4gZGF0YSBzcGFjZVxuICogIC0gLi4uZXh0cmFBcmd1bWVudHNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gW2QzVGFyZ2V0U2VsZWN0aW9uXVxuICogQHBhcmFtIHtbTnVtYmVyLE51bWJlcl19IFtkZWx0YV1cbiAqIEBwYXJhbSB7QXJyYXk8Kj59IFtwcmlvcml0eUFyZ3VtZW50c11cbiAqIEBwYXJhbSB7QXJyYXk8Kj59IFtleHRyYUFyZ3VtZW50c11cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZW1pdERldGFpbGVkRXZlbnQgPSBmdW5jdGlvbihldmVudE5hbWUsIGQzVGFyZ2V0U2VsZWN0aW9uLCBkZWx0YSwgcHJpb3JpdHlBcmd1bWVudHMsIGV4dHJhQXJndW1lbnRzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudEV2ZW50RW1pc3Npb24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwb3NpdGlvbjtcblxuICAgIHZhciBnZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXBvc2l0aW9uKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGQzLm1vdXNlKHNlbGYuZWxlbWVudHMuYm9keS5ub2RlKCkpO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGVsdGEpKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25bMF0gKz0gZGVsdGFbMF07XG4gICAgICAgICAgICAgICAgcG9zaXRpb25bMV0gKz0gZGVsdGFbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH07XG5cbiAgICB2YXIgYXJncyA9IFtcbiAgICAgICAgdGhpcywgLy8gdGhlIHRhYmxlIGluc3RhbmNlXG4gICAgICAgIGQzVGFyZ2V0U2VsZWN0aW9uLCAvLyB0aGUgZDMgc2VsZWN0aW9uIHRhcmdldGVkXG4gICAgICAgIGQzLmV2ZW50LCAvLyB0aGUgZDMgZXZlbnRcbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29sdW1uKCkge1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy54LmludmVydChwb3NpdGlvblswXSk7XG4gICAgICAgIH0sIC8vIGEgY29sdW1uIGdldHRlclxuICAgICAgICBmdW5jdGlvbiBnZXRSb3coKSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBnZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLnkuaW52ZXJ0KHBvc2l0aW9uWzFdKTtcbiAgICAgICAgfSAvLyBhIHJvdyBnZXR0ZXJcbiAgICBdO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocHJpb3JpdHlBcmd1bWVudHMpKSB7XG4gICAgICAgIGFyZ3MgPSBwcmlvcml0eUFyZ3VtZW50cy5jb25jYXQoYXJncyk7XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZXh0cmFBcmd1bWVudHMpKSB7XG4gICAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChleHRyYUFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgYXJncy51bnNoaWZ0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOicgKyBldmVudE5hbWUpOyAvLyB0aGUgZXZlbnQgbmFtZVxuXG4gICAgdGhpcy5lbWl0LmFwcGx5KHRoaXMsIGFyZ3MpO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgbWFyZ2lucyBhbmQgdXBkYXRlIHRyYW5zZm9ybXNcbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt1cGRhdGVEaW1lbnNpb25zXSBUcnVlIG1lYW5zIGl0IGhhcyB0byB1cGRhdGUgWCBhbmQgWVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVNYXJnaW5zID0gZnVuY3Rpb24odXBkYXRlRGltZW5zaW9ucykge1xuXG4gICAgdGhpcy5tYXJnaW4gPSB7XG4gICAgICAgIHRvcDogdGhpcy5vcHRpb25zLnhBeGlzSGVpZ2h0ICsgdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIHJpZ2h0OiB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgYm90dG9tOiB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgbGVmdDogdGhpcy5vcHRpb25zLnlBeGlzV2lkdGggKyB0aGlzLm9wdGlvbnMucGFkZGluZ1xuICAgIH07XG5cbiAgICB2YXIgY29udGVudFBvc2l0aW9uID0geyB4OiB0aGlzLm1hcmdpbi5sZWZ0LCB5OiB0aGlzLm1hcmdpbi50b3AgfTtcbiAgICB2YXIgY29udGVudFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHRoaXMubWFyZ2luLmxlZnQgKyAnLCcgKyB0aGlzLm1hcmdpbi50b3AgKyAnKSc7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JylcbiAgICAgICAgLmF0dHIoY29udGVudFBvc2l0aW9uKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keVxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnhBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueDJBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueUF4aXNDb250YWluZXJcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIHRoaXMubWFyZ2luLmxlZnQgKyAnLCcgKyB0aGlzLm1hcmdpbi50b3AgKyAnKScpO1xuXG4gICAgaWYgKHVwZGF0ZURpbWVuc2lvbnMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVYWSgpO1xuICAgIH1cblxufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtBcnJheTxEM1RhYmxlUm93Pn0gZGF0YVxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFthbmltYXRlWV1cbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbihkYXRhLCB0cmFuc2l0aW9uRHVyYXRpb24sIGFuaW1hdGVZKSB7XG5cbiAgICB0aGlzLl9kYXRhQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc1NpemVDaGFuZ2luZyA9IGRhdGEubGVuZ3RoICE9PSB0aGlzLmRhdGEubGVuZ3RoO1xuXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcblxuICAgIHRoaXMuZ2VuZXJhdGVGbGF0dGVuZWREYXRhKCk7XG5cbiAgICBpZiAoaXNTaXplQ2hhbmdpbmcgfHwgdGhpcy5fZGF0YUNoYW5nZUNvdW50ID09PSAxKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVYWShhbmltYXRlWSA/IHRyYW5zaXRpb25EdXJhdGlvbiA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd0VsZW1lbnRzKHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gbWluWFxuICogQHBhcmFtIHtEYXRlfSBtYXhYXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRYUmFuZ2UgPSBmdW5jdGlvbihtaW5YLCBtYXhYKSB7XG5cbiAgICB0aGlzLm1pblggPSBtaW5YO1xuICAgIHRoaXMubWF4WCA9IG1heFg7XG5cbiAgICB0aGlzLnNjYWxlcy54XG4gICAgICAgIC5kb21haW4oW3RoaXMubWluWCwgdGhpcy5tYXhYXSk7XG5cbiAgICB0aGlzXG4gICAgICAgIC51cGRhdGVYKClcbiAgICAgICAgLnVwZGF0ZVhBeGlzSW50ZXJ2YWwoKVxuICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgIC5kcmF3RWxlbWVudHMoKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgYXZhaWxhYmxlIHdpZHRoIGFuZCBoZWlnaHQgc28gdGhhdCBldmVyeSB0aGluZyB1cGRhdGUgY29ycmVzcG9uZGluZ2x5XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGF2YWlsYWJsZVdpZHRoXG4gKiBAcGFyYW0ge051bWJlcn0gYXZhaWxhYmxlSGVpZ2h0XG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRBdmFpbGFibGVEaW1lbnNpb25zID0gZnVuY3Rpb24oYXZhaWxhYmxlV2lkdGgsIGF2YWlsYWJsZUhlaWdodCkge1xuXG4gICAgdGhpcy5fZGlzYWJsZWQgPSB0cnVlO1xuICAgIHZhciBfbGFzdEF2YWlsYWJsZVdpZHRoID0gdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoO1xuICAgIHZhciBfbGFzdEF2YWlsYWJsZUhlaWdodCA9IHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQ7XG4gICAgdGhpcy5zZXRBdmFpbGFibGVXaWR0aChhdmFpbGFibGVXaWR0aCk7XG4gICAgdGhpcy5zZXRBdmFpbGFibGVIZWlnaHQoYXZhaWxhYmxlSGVpZ2h0KTtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGZhbHNlO1xuXG4gICAgdmFyIGlzQXZhaWxhYmxlV2lkdGhDaGFuZ2luZyA9IF9sYXN0QXZhaWxhYmxlV2lkdGggIT09IHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aDtcbiAgICB2YXIgaXNBdmFpbGFibGVIZWlnaHRDaGFuZ2luZyA9IF9sYXN0QXZhaWxhYmxlSGVpZ2h0ICE9PSB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0O1xuXG4gICAgaWYgKGlzQXZhaWxhYmxlV2lkdGhDaGFuZ2luZyB8fCBpc0F2YWlsYWJsZUhlaWdodENoYW5naW5nIHx8IHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9PT0gMikge1xuICAgICAgICBpZiAoaXNBdmFpbGFibGVXaWR0aENoYW5naW5nKSB7XG4gICAgICAgICAgICB0aGlzXG4gICAgICAgICAgICAgICAgLnVwZGF0ZVgoKVxuICAgICAgICAgICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcpIHtcbiAgICAgICAgICAgIHRoaXNcbiAgICAgICAgICAgICAgICAudXBkYXRlWSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgICAgICAuZHJhd0VsZW1lbnRzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBhdmFpbGFibGUgd2lkdGggc28gdGhhdCBldmVyeSB0aGluZyB1cGRhdGUgY29ycmVzcG9uZGluZ2x5XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGF2YWlsYWJsZVdpZHRoXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRBdmFpbGFibGVXaWR0aCA9IGZ1bmN0aW9uKGF2YWlsYWJsZVdpZHRoKSB7XG5cbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc0F2YWlsYWJsZVdpZHRoQ2hhbmdpbmcgPSBhdmFpbGFibGVXaWR0aCAhPT0gdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoO1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCA9IGF2YWlsYWJsZVdpZHRoO1xuXG4gICAgdGhpcy5kaW1lbnNpb25zLndpZHRoID0gdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoIC0gdGhpcy5tYXJnaW4ubGVmdCAtIHRoaXMubWFyZ2luLnJpZ2h0O1xuXG4gICAgaWYgKCF0aGlzLl9kaXNhYmxlZCAmJiAoaXNBdmFpbGFibGVXaWR0aENoYW5naW5nIHx8IHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9PT0gMSkpIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAgICAgLnVwZGF0ZVgoKVxuICAgICAgICAgICAgLnVwZGF0ZVhBeGlzSW50ZXJ2YWwoKVxuICAgICAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgICAgICAuZHJhd1lBeGlzKClcbiAgICAgICAgICAgIC5kcmF3RWxlbWVudHMoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGF2YWlsYWJsZSBoZWlnaHQgc28gdGhhdCBldmVyeSB0aGluZyB1cGRhdGUgY29ycmVzcG9uZGluZ2x5XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGF2YWlsYWJsZUhlaWdodFxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc2V0QXZhaWxhYmxlSGVpZ2h0ID0gZnVuY3Rpb24oYXZhaWxhYmxlSGVpZ2h0KSB7XG5cbiAgICB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgKz0gMTtcblxuICAgIHZhciBpc0F2YWlsYWJsZUhlaWdodENoYW5naW5nID0gYXZhaWxhYmxlSGVpZ2h0ICE9PSB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0O1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQgPSBhdmFpbGFibGVIZWlnaHQ7XG5cbiAgICB0aGlzLl9tYXhCb2R5SGVpZ2h0ID0gdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCAtIHRoaXMubWFyZ2luLnRvcCAtIHRoaXMubWFyZ2luLmJvdHRvbTtcblxuICAgIGlmICghdGhpcy5fZGlzYWJsZWQgJiYgKGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgfHwgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID09PSAxKSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWSgpXG4gICAgICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAgICAgLmRyYXdFbGVtZW50cygpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgZWxlbWVudHMgd2hpY2ggZGVwZW5kcyBvbiB4IGFuZCB5IGRpbWVuc2lvbnNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVhZID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgdGhpcy5fcHJldmVudEV2ZW50RW1pc3Npb24gPSB0cnVlO1xuICAgIHRoaXMudXBkYXRlWCh0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIHRoaXMuX3ByZXZlbnRFdmVudEVtaXNzaW9uID0gZmFsc2U7XG4gICAgdGhpcy51cGRhdGVZKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBlbGVtZW50cyB3aGljaCBkZXBlbmRzIG9uIHggZGltZW5zaW9uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVggPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHRoaXMuc2NhbGVzLnhcbiAgICAgICAgLmRvbWFpbihbdGhpcy5taW5YLCB0aGlzLm1heFhdKVxuICAgICAgICAucmFuZ2UoWzAsIHRoaXMuZGltZW5zaW9ucy53aWR0aF0pO1xuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZSgtdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YXG4gICAgICAgIC54KHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC50cmFuc2xhdGUodGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKSlcbiAgICAgICAgLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG5cbiAgICBpZiAoIXRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoICsgdGhpcy5tYXJnaW4ubGVmdCArIHRoaXMubWFyZ2luLnJpZ2h0KTtcbiAgICAgICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuICAgICAgICB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50cy5jbGlwLnNlbGVjdCgncmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICB9XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6cmVzaXplJywgdGhpcywgdGhpcy5jb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVXBkYXRlIGVsZW1lbnRzIHdoaWNoIGRlcGVuZHMgb24geSBkaW1lbnNpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlWSA9IGZ1bmN0aW9uICh0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBlbGVtZW50QW1vdW50ID0gTWF0aC5tYXgodGhpcy5kYXRhLmxlbmd0aCwgMSk7XG5cbiAgICAvLyBoYXZlIDEgbW9yZSBlbGVtbnQgdG8gZm9yY2UgcmVwcmVzZW50aW5nIG9uZSBtb3JlIHRpY2tcbiAgICB2YXIgZWxlbWVudHNSYW5nZSA9IFswLCBlbGVtZW50QW1vdW50XTtcblxuICAgIC8vIGNvbXB1dGUgbmV3IGhlaWdodFxuICAgIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgPSBNYXRoLm1pbihlbGVtZW50QW1vdW50ICogdGhpcy5vcHRpb25zLnJvd0hlaWdodCwgdGhpcy5fbWF4Qm9keUhlaWdodCk7XG5cbiAgICAvLyBjb21wdXRlIG5ldyBZIHNjYWxlXG4gICAgdGhpcy5feVNjYWxlID0gdGhpcy5vcHRpb25zLnJvd0hlaWdodCAvIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKiBlbGVtZW50QW1vdW50O1xuXG4gICAgLy8gdXBkYXRlIFkgc2NhbGUsIGF4aXMgYW5kIHpvb20gYmVoYXZpb3JcbiAgICB0aGlzLnNjYWxlcy55LmRvbWFpbihlbGVtZW50c1JhbmdlKS5yYW5nZShbMCwgdGhpcy5kaW1lbnNpb25zLmhlaWdodF0pO1xuXG4gICAgLy8geSBzY2FsZSBoYXMgYmVlbiB1cGRhdGVkIHNvIHRlbGwgdGhlIHpvb20gYmVoYXZpb3IgdG8gYXBwbHkgdGhlIHByZXZpb3VzIHRyYW5zbGF0ZSBhbmQgc2NhbGUgb24gaXRcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWS55KHRoaXMuc2NhbGVzLnkpLnRyYW5zbGF0ZSh0aGlzLl9sYXN0VHJhbnNsYXRlKS5zY2FsZSh0aGlzLl95U2NhbGUpO1xuXG4gICAgLy8gYW5kIHVwZGF0ZSBYIGF4aXMgdGlja3MgaGVpZ2h0XG4gICAgdGhpcy5heGlzZXMueC5pbm5lclRpY2tTaXplKC10aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIGlmICghdGhpcy5fcHJldmVudERyYXdpbmcpIHtcblxuICAgICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXI7XG4gICAgICAgIHZhciBjbGlwID0gdGhpcy5lbGVtZW50cy5jbGlwLnNlbGVjdCgncmVjdCcpO1xuICAgICAgICB2YXIgYm91bmRpbmdSZWN0ID0gdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0Jyk7XG5cbiAgICAgICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgICAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICAgICAgY2xpcCA9IGNsaXAudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgICAgICBib3VuZGluZ1JlY3QgPSBib3VuZGluZ1JlY3QudHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgc3ZnIGhlaWdodFxuICAgICAgICBjb250YWluZXIuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCArIHRoaXMubWFyZ2luLnRvcCArIHRoaXMubWFyZ2luLmJvdHRvbSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIGlubmVyIHJlY3QgaGVpZ2h0XG4gICAgICAgIHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JykuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgICAgIGJvdW5kaW5nUmVjdC5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICAgICAgY29udGFpbmVyLnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnKS5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICAgICAgY2xpcC5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIH1cblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6cmVzaXplJywgdGhpcywgdGhpcy5jb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVXBkYXRlIGNvbHVtbiB3aXRoLCBiYXNpY2FsbHkgdGhlIHdpZHRoIGNvcnJlc3BvbmRpbmcgdG8gMSB1bml0IGluIHggZGF0YSBkaW1lbnNpb25cbiAqXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVYQXhpc0ludGVydmFsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmNvbHVtbldpZHRoID0gdGhpcy5zY2FsZXMueCgxKSAtIHRoaXMuc2NhbGVzLngoMCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRHJhdyB0aGUgeCBheGlzZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3NraXBUaWNrc10gU2hvdWxkIG5vdCBkcmF3IHRpY2sgbGluZXNcbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmRyYXdYQXhpcyA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbiwgc2tpcFRpY2tzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZShza2lwVGlja3MgPyAwIDogLXRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5feEF4aXNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3hBeGlzQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX3hBeGlzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKHNlbGYuZWxlbWVudHMueEF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5jYWxsKHNlbGYuYXhpc2VzLngpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdsaW5lJylcbiAgICAgICAgICAgIC5zdHlsZSh7XG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IHNlbGYub3B0aW9ucy54QXhpc1N0cm9rZVdpZHRoLmJpbmQoc2VsZilcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy54MkF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5jYWxsKHNlbGYuYXhpc2VzLngyKVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgndGV4dCcpXG4gICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgeDogc2VsZi5jb2x1bW5XaWR0aCAvIDJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3R5bGUoe1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICtkID09PSArc2VsZi5tYXhYID8gJ25vbmUnIDogJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRHJhdyB0aGUgeSBheGlzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtza2lwVGlja3NdIFNob3VsZCBub3QgZHJhdyB0aWNrIGxpbmVzXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5kcmF3WUF4aXMgPSBmdW5jdGlvbiBkcmF3WUF4aXModHJhbnNpdGlvbkR1cmF0aW9uLCBza2lwVGlja3MpIHtcblxuICAgIGlmICh0aGlzLl9wcmV2ZW50RHJhd2luZykge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLmF4aXNlcy54XG4gICAgICAgIC5pbm5lclRpY2tTaXplKHNraXBUaWNrcyA/IDAgOiAtdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG5cbiAgICB2YXIgZG9tYWluWSA9IHRoaXMuc2NhbGVzLnkuZG9tYWluKCk7XG5cbiAgICB0aGlzLmF4aXNlcy55XG4gICAgICAgIC50aWNrVmFsdWVzKGQzLnJhbmdlKE1hdGgucm91bmQoZG9tYWluWVswXSksIE1hdGgucm91bmQoZG9tYWluWVsxXSksIDEpKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLl95QXhpc0FGKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5feUF4aXNBRik7XG4gICAgfVxuXG4gICAgdGhpcy5feUF4aXNBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBjb250YWluZXIgPSBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKHNlbGYuZWxlbWVudHMueUF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIGNvbnRhaW5lci5jYWxsKHNlbGYuYXhpc2VzLnkpO1xuXG4gICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgLnNlbGVjdEFsbCgndGV4dCcpLmF0dHIoJ3knLCBzZWxmLm9wdGlvbnMucm93SGVpZ2h0IC8gMik7XG5cbiAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdsaW5lJykuc3R5bGUoJ2Rpc3BsYXknLCBmdW5jdGlvbihkLGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA/ICcnIDogJ25vbmUnO1xuICAgICAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKlxuICogQHJldHVybnMge0FycmF5PEQzVGFibGVSb3c+fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZURhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiB0aGlzLmRhdGEubWFwKGZ1bmN0aW9uKGQpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZVJvd31cbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSB7fTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZCkge1xuICAgICAgICAgICAgaWYgKGQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICdlbGVtZW50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzW2tleV0gPSBkW2tleV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzW2tleV0gPSBkW2tleV0ubWFwKHNlbGYuY2xvbmVFbGVtZW50LmJpbmQoc2VsZikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFRoaXMgY2xvbmUgbWV0aG9kIGRvZXMgbm90IGNsb25lIHRoZSBlbnRpdGllcyBpdHNlbGZcbiAqXG4gKiBAcmV0dXJucyB7QXJyYXk8RDNUYWJsZUVsZW1lbnQ+fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5mbGF0dGVuZWREYXRhLm1hcChmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBlKSB7XG4gICAgICAgICAgICBpZiAoZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgcmVzW2tleV0gPSBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKlxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRWxlbWVudCA9IGZ1bmN0aW9uKGUpIHtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fVxuICAgICAqL1xuICAgIHZhciByZXMgPSB7fTtcblxuICAgIGZvciAodmFyIGtleSBpbiBlKSB7XG4gICAgICAgIGlmIChlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIHJlc1trZXldID0gZVtrZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbi8qKlxuICogR2V0IHRoZSByb3cgaG9sZGluZyB0aGUgcHJvdmlkZWQgZWxlbWVudCAocmVmZXJlbmNlIGVxdWFsaXR5IHRlc3QpXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlUm93fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5nZXRFbGVtZW50Um93ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHJldHVybiB0aGlzLl9maW5kKHRoaXMuZGF0YSwgZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIHJldHVybiByb3cuZWxlbWVudHMuaW5kZXhPZihlbGVtZW50KSAhPT0gLTE7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFN0b3JlIGEgY2xvbmUgb2YgdGhlIGN1cnJlbnRseSBib3VuZCBmbGF0dGVuZWQgZGF0YVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zdG9yZUZsYXR0ZW5lZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnByZXZpb3VzRmxhdHRlbmVkRGF0YSA9IHRoaXMuY2xvbmVGbGF0dGVuZWREYXRhKCk7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlIHRoZSBuZXcgc2V0IG9mIGZsYXR0ZW5lZCBkYXRhLCBzdG9yaW5nIHByZXZpb3VzIHNldCBpZiBjb25maWd1cmVkIHNvIGFuZCBwcmVzZXJ2aW5nIGVsZW1lbnQgZmxhZ3NcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybSkge1xuICAgICAgICB0aGlzLnN0b3JlRmxhdHRlbmVkRGF0YSgpO1xuICAgIH1cblxuICAgIHRoaXMuZmxhdHRlbmVkRGF0YS5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5kYXRhLmZvckVhY2goZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICBkLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5yb3dJbmRleCA9IGk7XG4gICAgICAgICAgICBpZiAoc2VsZi5fZnJvemVuVWlkcy5pbmRleE9mKGVsZW1lbnQudWlkKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9kZWZhdWx0UHJldmVudGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuZmxhdHRlbmVkRGF0YS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgdHJhbnNmb3JtIHN0cmluZyBmb3IgYSBnaXZlbiBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm1Gcm9tRGF0YSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgdGhpcy5zY2FsZXMueCh0aGlzLmdldERhdGFTdGFydChlbGVtZW50KSkgKyAnLCcgKyB0aGlzLnNjYWxlcy55KGVsZW1lbnQucm93SW5kZXgpICsgJyknO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGVsZW1lbnQgd2l0aCB0aGUgcHJvdmlkZWQgYm91bmQgZGF0YSBzaG91bGQgYmUgY3VsbGVkXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBkYXRhXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuY3VsbGluZ0ZpbHRlciA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIHZhciBkb21haW5YID0gdGhpcy5zY2FsZXMueC5kb21haW4oKTtcbiAgICB2YXIgZG9tYWluWFN0YXJ0ID0gZG9tYWluWFswXTtcbiAgICB2YXIgZG9tYWluWEVuZCA9IGRvbWFpblhbZG9tYWluWC5sZW5ndGggLSAxXTtcblxuICAgIHZhciBkb21haW5ZID0gdGhpcy5zY2FsZXMueS5kb21haW4oKTtcbiAgICB2YXIgZG9tYWluWVN0YXJ0ID0gZG9tYWluWVswXTtcbiAgICB2YXIgZG9tYWluWUVuZCA9IGRvbWFpbllbZG9tYWluWS5sZW5ndGggLSAxXTtcblxuICAgIHJldHVybiBkYXRhLl9kZWZhdWx0UHJldmVudGVkIHx8XG4gICAgICAgIC8vIE5PVCB4IGN1bGxpbmcgQU5EIE5PVCB5IGN1bGxpbmdcbiAgICAgICAgKFxuICAgICAgICAgICAgLy8gTk9UIHggY3VsbGluZ1xuICAgICAgICAgICAgKCF0aGlzLm9wdGlvbnMuY3VsbGluZ1ggfHwgISh0aGlzLmdldERhdGFFbmQoZGF0YSkgPCBkb21haW5YU3RhcnQgfHwgdGhpcy5nZXREYXRhU3RhcnQoZGF0YSkgPiBkb21haW5YRW5kKSlcbiAgICAgICAgICAgICYmXG4gICAgICAgICAgICAvLyBOT1QgeSBjdWxsaW5nXG4gICAgICAgICAgICAoIXRoaXMub3B0aW9ucy5jdWxsaW5nWSB8fCAoZGF0YS5yb3dJbmRleCA+PSBkb21haW5ZU3RhcnQgLSB0aGlzLm9wdGlvbnMuY3VsbGluZ0Rpc3RhbmNlICYmIGRhdGEucm93SW5kZXggPCBkb21haW5ZRW5kICsgdGhpcy5vcHRpb25zLmN1bGxpbmdEaXN0YW5jZSAtIDEpKVxuICAgICAgICApO1xufTtcblxuLyoqXG4gKiBHZXQgc3RhcnQgdmFsdWUgb2YgdGhlIHByb3ZpZGVkIGRhdGEsIHVzZWQgdG8gcmVwcmVzZW50IGVsZW1lbnQgc3RhcnRcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGRhdGFcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmdldERhdGFTdGFydCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gK2RhdGEuc3RhcnQ7XG59O1xuXG4vKipcbiAqIEdldCBlbmQgdmFsdWUgb2YgdGhlIHByb3ZpZGVkIGRhdGEsIHVzZWQgdG8gcmVwcmVzZW50IGVsZW1lbnQgZW5kXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBkYXRhXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5nZXREYXRhRW5kID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiArZGF0YS5lbmQ7XG59O1xuXG4vKipcbiAqIE1vdmUgdGhlIGVsZW1lbnRzIHdpdGggY2xhbXBpbmcgdGhlIGFza2VkIG1vdmUgYW5kIHJldHVybmVkIHdoYXQgaXQgZmluYWxseSBkaWQgd2l0aCB0aGUgYXNrZWQgeCBhbmQgeSBkZWx0YVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbZHhdIEFza2VkIHggbW92ZSBkZWx0YVxuICogQHBhcmFtIHtOdW1iZXJ9IFtkeV0gQXNrZWQgeSBtb3ZlIGRlbHRhXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZURyYXddIFNob3VsZCB0aGUgZWxlbWVudHMgYmUgcmVkcmF3biBpbnN0ZWFkIG9mIHRyYW5zbGF0aW5nIHRoZSBpbm5lciBjb250YWluZXJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3NraXBYQXhpc10gU2hvdWxkIHRoZSB4IGF4aXMgbm90IGJlIHJlZHJhd25cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlVGlja3NdIFNob3VsZCB0aGUgdGljayBsaW5lcyBiZSBkcmF3blxuICogQHJldHVybnMge1tOdW1iZXIsIE51bWJlciwgTnVtYmVyLCBOdW1iZXJdfSBGaW5hbCB0cmFuc2xhdGUgeCwgZmluYWwgdHJhbnNsYXRlIHksIHRyYW5zbGF0ZSB4IGRlbHRhLCB0cmFuc2xhdGUgeSBkZWx0YVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oZHgsIGR5LCBmb3JjZURyYXcsIHNraXBYQXhpcywgZm9yY2VUaWNrcykge1xuXG4gICAgZHggPSBkeCB8fCAwO1xuICAgIGR5ID0gZHkgfHwgMDtcblxuICAgIHZhciBjdXJyZW50VHJhbnNsYXRlID0gdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKTtcbiAgICB2YXIgdXBkYXRlZFQgPSBbY3VycmVudFRyYW5zbGF0ZVswXSArIGR4LCBjdXJyZW50VHJhbnNsYXRlWzFdICsgZHldO1xuXG4gICAgdXBkYXRlZFQgPSB0aGlzLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlKHVwZGF0ZWRULCBbdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpLCB0aGlzLmJlaGF2aW9ycy56b29tWS5zY2FsZSgpXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVgudHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG5cbiAgICB0aGlzLm1vdmVFbGVtZW50cyhmb3JjZURyYXcsIHNraXBYQXhpcywgZm9yY2VUaWNrcyk7XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gdXBkYXRlZFQ7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScpO1xuXG4gICAgcmV0dXJuIHVwZGF0ZWRULmNvbmNhdChbdXBkYXRlZFRbMF0gLSBjdXJyZW50VHJhbnNsYXRlWzBdLCB1cGRhdGVkVFsxXSAtIGN1cnJlbnRUcmFuc2xhdGVbMV1dKTtcbn07XG5cbi8qKlxuICogTW92ZSBlbGVtZW50cywgc3dpdGNoaW5nIGJldHdlZW4gZHJhd2luZyBtZXRob2RzIGRlcGVuZGluZyBvbiBhcmd1bWVudHNcbiAqIEJhc2ljYWxseSwgaXQgc2hvdWxkIGJlIHVzZWQgdG8gdGhhdCBpcyBjaG9vc2VzIG9wdGltaXplZCBkcmF3aW5nICh0cmFuc2xhdGluZyB0aGUgaW5uZXIgY29udGFpbmVyKSBpcyB0aGVyZSBpcyBubyBzY2FsZSBjaGFuZ2UuXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VEcmF3XSBGb3JjZSB0aGUgZWxlbWVudHMgdG8gYmUgZHJhd24gd2l0aG91dCB0cmFuc2xhdGlvbiBvcHRpbWl6YXRpb25cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3NraXBYQXhpc10gU2tpcCB4IGF4aXMgYmVpbmcgcmVkcmF3biAoYWx3YXlzIHRoZSBjYXNlIHdoZW4gdGhlIHNjYWxlIGRvZXMgbm90IGNoYW5nZSBvbiBtb3ZlKVxuICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VUaWNrc10gRm9yY2UgdGlja3MgdG8gYmUgcmVkcmF3bjsgaWYgZmFsc2UgdGhlbiB0aGV5IHdpbGwgYmUgaGlkZGVuXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLm1vdmVFbGVtZW50cyA9IGZ1bmN0aW9uKGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKSB7XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5yZW5kZXJPbklkbGUgfHwgZm9yY2VEcmF3KSB7XG4gICAgICAgIHRoaXMuZHJhd0VsZW1lbnRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50cmFuc2xhdGVFbGVtZW50cyh0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpLCB0aGlzLl9sYXN0VHJhbnNsYXRlKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyYXdZQXhpcyh1bmRlZmluZWQsICFmb3JjZVRpY2tzKTtcblxuICAgIGlmICghc2tpcFhBeGlzKSB7XG4gICAgICAgIHRoaXMudXBkYXRlWEF4aXNJbnRlcnZhbCgpO1xuICAgICAgICB0aGlzLmRyYXdYQXhpcyh1bmRlZmluZWQsICFmb3JjZVRpY2tzKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIERyYXcgZWxlbWVudHMgKGVudGVyaW5nLCBleGl0aW5nLCB1cGRhdGluZylcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmRyYXdFbGVtZW50cyA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5fZWxlbWVudHNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2VsZW1lbnRzQUYpXG4gICAgfVxuXG4gICAgdGhpcy5fZWxlbWVudHNBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1hcCBvZiBzdGFydCB0cmFuc2Zvcm0gc3RyaW5ncyBmb3IgYWxsIGVsZW1lbnRzXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3Q8U3RyaW5nPn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBzdGFydFRyYW5zZm9ybU1hcCA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXAgb2YgZW5kIHRyYW5zZm9ybSBzdHJpbmdzIGZvciBhbGwgZWxlbWVudHNcbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUge09iamVjdDxTdHJpbmc+fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGVuZFRyYW5zZm9ybU1hcCA9IHt9O1xuXG5cbiAgICAgICAgLy8gZmlsbCBib3RoIHRyYW5zZm9ybSBzdHJpbmcgbWFwc1xuXG4gICAgICAgIGlmIChzZWxmLm9wdGlvbnMudXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtICYmIHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgICAgIGlmIChzZWxmLnByZXZpb3VzRmxhdHRlbmVkRGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYucHJldmlvdXNGbGF0dGVuZWREYXRhLmZvckVhY2goXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc3RhcnRUcmFuc2Zvcm1NYXBbZGF0YS51aWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUcmFuc2Zvcm1NYXBbZGF0YS5pZF0gPSBzdGFydFRyYW5zZm9ybU1hcFtkYXRhLnVpZF0gPSBzZWxmLmdldFRyYW5zZm9ybUZyb21EYXRhKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWxmLmZsYXR0ZW5lZERhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZsYXR0ZW5lZERhdGEuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZGF0YVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlbmRUcmFuc2Zvcm1NYXBbZGF0YS51aWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kVHJhbnNmb3JtTWFwW2RhdGEuaWRdID0gZW5kVHJhbnNmb3JtTWFwW2RhdGEudWlkXSA9IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmlsdGVyIHdpdGggY3VsbGluZyBsb2dpY1xuICAgICAgICB2YXIgZGF0YSA9IHNlbGYuZmxhdHRlbmVkRGF0YS5maWx0ZXIoc2VsZi5jdWxsaW5nRmlsdGVyLmJpbmQoc2VsZikpO1xuXG4gICAgICAgIHZhciBncm91cHMgPSBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLnNlbGVjdEFsbCgnZy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAuZGF0YShkYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQudWlkO1xuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAvLyBoYW5kbGUgZXhpdGluZyBlbGVtZW50c1xuXG4gICAgICAgIHZhciBleGl0aW5nID0gZ3JvdXBzLmV4aXQoKTtcblxuICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmVuYWJsZVRyYW5zaXRpb25PbkV4aXQgJiYgdHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuXG4gICAgICAgICAgICBleGl0aW5nLmVhY2goXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBkYXRhXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBncm91cCA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRFeGl0KGdyb3VwLCBkYXRhKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmbGFnIHRoZSBlbGVtZW50IGFzIHJlbW92ZWRcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5fcmVtb3ZlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4aXRUcmFuc2Zvcm0gPSBlbmRUcmFuc2Zvcm1NYXBbZGF0YS51aWRdIHx8IGVuZFRyYW5zZm9ybU1hcFtkYXRhLmlkXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZXhpdFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi53cmFwV2l0aEFuaW1hdGlvbihncm91cCwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBleGl0VHJhbnNmb3JtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpyZW1vdmUnLCBncm91cCwgbnVsbCwgW2RhdGFdKTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleGl0aW5nXG4gICAgICAgICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyBoYW5kbGUgZW50ZXJpbmcgZWxlbWVudHNcblxuICAgICAgICBncm91cHMuZW50ZXIoKS5hcHBlbmQoJ2cnKVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAuZWFjaChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbGVtZW50RW50ZXIoZDMuc2VsZWN0KHRoaXMpLCBkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgLy8gaGFuZGxlIGFsbCBlbGVtZW50cyBleGlzdGluZyBhZnRlciBlbnRlcmluZ1xuXG4gICAgICAgIGdyb3Vwcy5lYWNoKFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGRhdGFcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuX3JlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBncm91cCA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIGlmIChkYXRhLl9kZWZhdWx0UHJldmVudGVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5lbGVtZW50VXBkYXRlKGdyb3VwLCBkYXRhLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgaXNVcGRhdGUgPSBkYXRhLl9wb3NpdGlvbmVkO1xuXG4gICAgICAgICAgICAgICAgdmFyIG5ld1RyYW5zZm9ybSA9IGVuZFRyYW5zZm9ybU1hcFtkYXRhLnVpZF0gfHwgZW5kVHJhbnNmb3JtTWFwW2RhdGEuaWRdIHx8IHNlbGYuZ2V0VHJhbnNmb3JtRnJvbURhdGEoZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcmlnaW5UcmFuc2Zvcm0gPSBzdGFydFRyYW5zZm9ybU1hcFtkYXRhLnVpZF0gfHwgc3RhcnRUcmFuc2Zvcm1NYXBbZGF0YS5pZF0gfHwgbmV3VHJhbnNmb3JtO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1VwZGF0ZSAmJiBzZWxmLm9wdGlvbnMudXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ2luVHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRPcmlnaW5UcmFuc2Zvcm0gPSBvcmlnaW5UcmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXAuYXR0cigndHJhbnNmb3JtJywgb3JpZ2luVHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oZ3JvdXAsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyVHdlZW4oXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9yaWdpblRyYW5zZm9ybSA9IG1vZGlmaWVkT3JpZ2luVHJhbnNmb3JtIHx8IGdyb3VwLmF0dHIoJ3RyYW5zZm9ybScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm9wdGlvbnMuZW5hYmxlWVRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLmludGVycG9sYXRlVHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybSwgbmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnRUcmFuc2Zvcm0gPSBkMy50cmFuc2Zvcm0ob3JpZ2luVHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVuZFRyYW5zZm9ybSA9IGQzLnRyYW5zZm9ybShuZXdUcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRyYW5zZm9ybS50cmFuc2xhdGVbMV0gPSBlbmRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZDMuaW50ZXJwb2xhdGVUcmFuc2Zvcm0oc3RhcnRUcmFuc2Zvcm0udG9TdHJpbmcoKSwgZW5kVHJhbnNmb3JtLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBuZXdUcmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRhdGEuX3Bvc2l0aW9uZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5lbGVtZW50VXBkYXRlKGdyb3VwLCBkYXRhLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IFswLjAsIDAuMF07XG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG5cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuRDNUYWJsZS5wcm90b3R5cGUudHJhbnNsYXRlRWxlbWVudHMgPSBmdW5jdGlvbih0cmFuc2xhdGUsIHByZXZpb3VzVHJhbnNsYXRlKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgdHggPSB0cmFuc2xhdGVbMF0gLSBwcmV2aW91c1RyYW5zbGF0ZVswXTtcbiAgICB2YXIgdHkgPSB0cmFuc2xhdGVbMV0gLSBwcmV2aW91c1RyYW5zbGF0ZVsxXTtcblxuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMF0gPSB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdICsgdHg7XG4gICAgdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVsxXSA9IHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV0gKyB0eTtcblxuXG4gICAgaWYgKHRoaXMuX2VsdHNUcmFuc2xhdGVBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2VsdHNUcmFuc2xhdGVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fZWx0c1RyYW5zbGF0ZUFGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZSgnICsgc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSArICcpJ1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc2VsZi5lbGVtZW50c1RyYW5zbGF0ZSAhPT0gc2VsZi5ub29wKSB7XG4gICAgICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgLnNlbGVjdEFsbCgnLicgKyBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JylcbiAgICAgICAgICAgICAgICAuZWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudHNUcmFuc2xhdGUoZDMuc2VsZWN0KHRoaXMpLCBkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnN0b3BFbGVtZW50VHJhbnNpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWxlbWVudHMuaW5uZXJDb250YWluZXIuc2VsZWN0QWxsKCdnLicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JykudHJhbnNpdGlvbigpO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtkMy5TZWxlY3Rpb259XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRFbnRlciA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZWxlbWVudCkgeyByZXR1cm4gc2VsZWN0aW9uOyB9O1xuXG4vKipcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHRyYW5zaXRpb25EdXJhdGlvblxuICogQHJldHVybnMge2QzLlNlbGVjdGlvbn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudFVwZGF0ZSA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZWxlbWVudCwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbi8qKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7ZDMuU2VsZWN0aW9ufVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5lbGVtZW50RXhpdCA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZWxlbWVudCkgeyByZXR1cm4gc2VsZWN0aW9uOyB9O1xuXG4vKipcbiAqIFdyYXAgdGhlIHNlbGVjdGlvbiB3aXRoIGEgZDMgdHJhbnNpdGlvbiBpZiB0aGUgdHJhbnNpdGlvbiBkdXJhdGlvbiBpcyBncmVhdGVyIHRoYW4gMFxuICpcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICogQHJldHVybnMge2QzLlNlbGVjdGlvbnxkMy5UcmFuc2l0aW9ufVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS53cmFwV2l0aEFuaW1hdGlvbiA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdGlvbi50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKS5lYXNlKHRoaXMub3B0aW9ucy50cmFuc2l0aW9uRWFzaW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2VsZWN0aW9uO1xuICAgIH1cbn07XG5cbi8qKlxuICogUHJveHkgdG8gcmVxdWVzdCBhbmltYXRpb24gZnJhbWVzXG4gKiBFbnN1cmUgYWxsIGxpc3RlbmVycyByZWdpc3RlciBiZWZvcmUgdGhlIG5leHQgZnJhbWUgYXJlIHBsYXllZCBpbiB0aGUgc2FtZSBzZXF1ZW5jZVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5wdXNoKGxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGc7XG4gICAgICAgICAgICB3aGlsZShnID0gc2VsZi5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMuc2hpZnQoKSkgZygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGlzdGVuZXI7XG59O1xuXG4vKipcbiAqIFByb3h5IHRvIGNhbmNlbCBhbmltYXRpb24gZnJhbWVcbiAqIFJlbW92ZSB0aGUgbGlzdGVuZXIgZnJvbSB0aGUgbGlzdCBvZiBmdW5jdGlvbnMgdG8gYmUgcGxheWVkIG9uIG5leHQgYW5pbWF0aW9uIGZyYW1lXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihsaXN0ZW5lcikge1xuXG4gICAgdmFyIGluZGV4ID0gdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMubGVuZ3RoID4gMCA/IHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmluZGV4T2YobGlzdGVuZXIpIDogLTE7XG5cbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxufTtcblxuRDNUYWJsZS5wcm90b3R5cGUuY2FuY2VsQWxsQW5pbWF0aW9uRnJhbWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMubGVuZ3RoID0gMDtcbn07XG5cbi8qKlxuICogQ2FsbCBhIG1vdmUgZm9yY2luZyB0aGUgZHJhd2luZ3MgdG8gZml0IHdpdGhpbiBzY2FsZSBkb21haW5zXG4gKlxuICogQHJldHVybnMge1tOdW1iZXIsTnVtYmVyLE51bWJlcixOdW1iZXJdfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5lbnN1cmVJbkRvbWFpbnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tb3ZlKDAsIDAsIGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIFRvZ2dsZSBpbnRlcm5hbCBkcmF3aW5nIHByZXZlbnQgZmxhZ1xuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2FjdGl2ZV0gSWYgbm90IHByb3ZpZGVkLCBpdCBuZWdhdGVzIHRoZSBjdXJyZW50IGZsYWcgdmFsdWVcbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnRvZ2dsZURyYXdpbmcgPSBmdW5jdGlvbihhY3RpdmUpIHtcblxuICAgIHRoaXMuX3ByZXZlbnREcmF3aW5nID0gdHlwZW9mIGFjdGl2ZSA9PT0gJ2Jvb2xlYW4nID8gIWFjdGl2ZSA6ICF0aGlzLl9wcmV2ZW50RHJhd2luZztcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2ZyL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL09iamV0c19nbG9iYXV4L0FycmF5L2ZpbmRcbiAqIEB0eXBlIHsqfEZ1bmN0aW9ufVxuICogQHByaXZhdGVcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuX2ZpbmQgPSBmdW5jdGlvbihsaXN0LCBwcmVkaWNhdGUpIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGggPj4+IDA7XG4gICAgdmFyIHRoaXNBcmcgPSBsaXN0O1xuICAgIHZhciB2YWx1ZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBsaXN0W2ldO1xuICAgICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIGxpc3QpKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBDbGFtcGVkIHByb3ZpZGVkIHRyYW5zbGF0aW9uIGJhc2VkIG9uIGRpbWVuc2lvbnMgYW5kIGN1cnJlbnQgcHJvdmlkZWQgc2NhbGVzXG4gKlxuICogQHBhcmFtIHtbTnVtYmVyLE51bWJlcl19IHRyYW5zbGF0ZVxuICogQHBhcmFtIHtbTnVtYmVyLE51bWJlcl19IHNjYWxlXG4gKiBAcmV0dXJucyB7W051bWJlcixOdW1iZXJdfVxuICogQHByaXZhdGVcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuX2NsYW1wVHJhbnNsYXRpb25XaXRoU2NhbGUgPSBmdW5jdGlvbih0cmFuc2xhdGUsIHNjYWxlKSB7XG5cbiAgICBzY2FsZSA9IHNjYWxlIHx8IFsxLCAxXTtcblxuICAgIGlmICghKHNjYWxlIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICAgIHNjYWxlID0gW3NjYWxlLCBzY2FsZV07XG4gICAgfVxuXG4gICAgdmFyIHR4ID0gdHJhbnNsYXRlWzBdO1xuICAgIHZhciB0eSA9IHRyYW5zbGF0ZVsxXTtcbiAgICB2YXIgc3ggPSBzY2FsZVswXTtcbiAgICB2YXIgc3kgPSBzY2FsZVsxXTtcblxuICAgIGlmIChzeCA9PT0gMSkge1xuICAgICAgICB0eCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdHggPSBNYXRoLm1pbihNYXRoLm1heCgtdGhpcy5kaW1lbnNpb25zLndpZHRoICogKHN4LTEpLCB0eCksIDApO1xuICAgIH1cblxuICAgIGlmIChzeSA9PT0gMSkge1xuICAgICAgICB0eSA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdHkgPSBNYXRoLm1pbihNYXRoLm1heCgtdGhpcy5kaW1lbnNpb25zLmhlaWdodCAqIChzeS0xKSwgdHkpLCAwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3R4LCB0eV07XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEQzVGFibGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzL2V2ZW50cyc7XG5pbXBvcnQgZDMgZnJvbSAnZDMnO1xuaW1wb3J0IEQzVGFibGUgZnJvbSAnLi9EM1RhYmxlJztcblxudmFyIGQzVGltZWxpbmUgPSB7fTtcblxuLyoqXG4gKiBUYWJsZSBtYXJrZXIgb3B0aW9ucyB3aGljaCBrbm93cyBob3cgdG8gcmVwcmVzZW50IGl0c2VsZiBpbiBhIHtAbGluayBkM1RpbWVsaW5lLkQzVGFibGUjY29udGFpbmVyfVxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlTWFya2VyT3B0aW9uc30gb3B0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmQzVGltZWxpbmUuRDNUYWJsZU1hcmtlciA9IGZ1bmN0aW9uIEQzVGFibGVNYXJrZXIob3B0aW9ucykge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQodHJ1ZSwge30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAgICAgKi9cbiAgICB0aGlzLnRhYmxlID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtkMy5TZWxlY3Rpb259XG4gICAgICovXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge3tsaW5lOiBkMy5TZWxlY3Rpb24sIGxhYmVsOiBkMy5TZWxlY3Rpb259fVxuICAgICAqL1xuICAgIHRoaXMuZWxlbWVudHMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy52YWx1ZSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3RhYmxlRGVzdHJveUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuX21vdmVBRiA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFRpbWVVcGRhdGVkID0gbnVsbDtcbn07XG5cbnZhciBEM1RhYmxlTWFya2VyID0gZDNUaW1lbGluZS5EM1RhYmxlTWFya2VyO1xuXG5pbmhlcml0cyhEM1RhYmxlTWFya2VyLCBFdmVudEVtaXR0ZXIpO1xuXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5MQVlPVVRfSE9SSVpPTlRBTCA9ICdob3Jpem9udGFsJztcbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLkxBWU9VVF9WRVJUSUNBTCA9ICd2ZXJ0aWNhbCc7XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLklOU0VSVF9PTl9UT1AgPSAnaW5zZXJ0T25Ub3AnO1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuSU5TRVJUX0JFSElORCA9ICdpbnNlcnRCZWhpbmQnO1xuXG4vKipcbiAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGVNYXJrZXJPcHRpb25zfVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcbiAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQ7IH0sXG4gICAgaW5zZXJ0aW9uTWV0aG9kOiBEM1RhYmxlTWFya2VyLnByb3RvdHlwZS5JTlNFUlRfT05fVE9QLFxuICAgIG91dGVyVGlja1NpemU6IDEwLFxuICAgIHRpY2tQYWRkaW5nOiAzLFxuICAgIHJvdW5kUG9zaXRpb246IGZhbHNlLFxuICAgIGJlbUJsb2NrTmFtZTogJ3RhYmxlTWFya2VyJyxcbiAgICBiZW1Nb2RpZmllcnM6IFtdLFxuICAgIGxheW91dDogRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX1ZFUlRJQ0FMLFxuICAgIGxpbmVTaGFwZTogJ2xpbmUnLFxuICAgIHJlY3RUaGlja25lc3M6IEQzVGFibGUucHJvdG90eXBlLmRlZmF1bHRzLnJvd0hlaWdodFxufTtcblxuLyoqXG4gKiBTZXQgdGhlIHRhYmxlIGl0IHNob3VsZCBkcmF3IGl0c2VsZiBvbnRvXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZX0gdGFibGVcbiAqL1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuc2V0VGFibGUgPSBmdW5jdGlvbih0YWJsZSkge1xuXG4gICAgdmFyIHByZXZpb3VzVGFibGUgPSB0aGlzLnRhYmxlO1xuXG4gICAgdGhpcy50YWJsZSA9IHRhYmxlICYmIHRhYmxlIGluc3RhbmNlb2YgRDNUYWJsZSA/IHRhYmxlIDogbnVsbDtcblxuICAgIGlmICh0aGlzLnRhYmxlKSB7XG4gICAgICAgIGlmIChwcmV2aW91c1RhYmxlICE9PSB0aGlzLnRhYmxlKSB7XG4gICAgICAgICAgICBpZiAocHJldmlvdXNUYWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudW5iaW5kVGFibGUocHJldmlvdXNUYWJsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJpbmRUYWJsZSgpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICghdGhpcy50YWJsZSAmJiBwcmV2aW91c1RhYmxlKSB7XG4gICAgICAgIHRoaXMudW5iaW5kVGFibGUocHJldmlvdXNUYWJsZSk7XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIENvbXBhcmUgdHdvIHZhbHVlc1xuICogVG8gYmUgb3ZlcnJpZGRlbiBpZiB5b3Ugd2lzaCB0aGUgbWFya2VyIG5vdCB0byBiZSBtb3ZlZCBmb3Igc29tZSB2YWx1ZSBjaGFuZ2VzIHdoaWNoIHNob3VsZCBub3QgaW1wYWN0IHRoZSBtYXJrZXIgcG9zaXRpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYVxuICogQHBhcmFtIHtOdW1iZXJ9IGJcbiAqIEByZXR1cm5zIHtCb29sZWFufVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS52YWx1ZUNvbXBhcmF0b3IgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuICthICE9PSArYjtcbn07XG5cbi8qKlxuICogU2V0IHRoZSB2YWx1ZSBmb3IgdGhlIG1hcmtlciwgd2hpY2ggdXBkYXRlcyBpZiBpdCBuZWVkcyB0b1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICogQHBhcmFtIHtCb29sZWFufSBbc2lsZW50XVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlLCBzaWxlbnQpIHtcblxuICAgIHZhciBwcmV2aW91c1RpbWVVcGRhdGVkID0gdGhpcy5fbGFzdFRpbWVVcGRhdGVkO1xuXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXG4gICAgaWYgKHRoaXMudmFsdWVDb21wYXJhdG9yKHByZXZpb3VzVGltZVVwZGF0ZWQsIHRoaXMudmFsdWUpICYmIHRoaXMudGFibGUgJiYgdGhpcy5jb250YWluZXIpIHtcblxuICAgICAgICB0aGlzLl9sYXN0VGltZVVwZGF0ZWQgPSB0aGlzLnZhbHVlO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyXG4gICAgICAgICAgICAuZGF0dW0oe1xuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgICAgICAgIHRoaXMubW92ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIFZhbHVlIGdldHRlciBmcm9tIGQzIHNlbGVjdGlvbiBkYXR1bSB3aGljaCBzaG91bGQgYmUgbWFkZSBvZiBhIHZhbHVlXG4gKiBUbyBiZSBvdmVycmlkZGVuIGlmIHlvdSB3aXNoIHRvIGFsdGVyIHRoaXMgdmFsdWUgZHluYW1pY2FsbHlcbiAqXG4gKiBAcGFyYW0ge3ZhbHVlOiBOdW1iZXJ9IGRhdGFcbiAqIEByZXR1cm5zIHsqfVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YS52YWx1ZTtcbn07XG5cbi8qKlxuICogSGFuZGxlIGEgRDNUYWJsZSBiZWluZyBib3VuZFxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5iaW5kVGFibGUgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBjbGFzc05hbWUgPSB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctLScgKyB0aGlzLm9wdGlvbnMubGF5b3V0O1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5iZW1Nb2RpZmllcnMgJiYgQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXJzKSAmJiB0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY2xhc3NOYW1lID0gY2xhc3NOYW1lICsgJyAnICsgdGhpcy5vcHRpb25zLmJlbU1vZGlmaWVycy5tYXAoZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy0tJyArIG1vZGlmaWVyO1xuICAgICAgICB9KS5qb2luKCcgJyk7XG4gICAgfVxuXG4gICAgc3dpdGNoKHRoaXMub3B0aW9ucy5pbnNlcnRpb25NZXRob2QpIHtcbiAgICAgICAgY2FzZSB0aGlzLklOU0VSVF9CRUhJTkQ6XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMudGFibGUuY29udGFpbmVyXG4gICAgICAgICAgICAgICAgLmluc2VydCgnZycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi50YWJsZS5lbGVtZW50cy5ib2R5Lm5vZGUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRoaXMuSU5TRVJUX09OX1RPUDpcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy50YWJsZS5jb250YWluZXJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCdnJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuZGF0dW0oe1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMudmFsdWVcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgY2xhc3NOYW1lKTtcblxuICAgIHN3aXRjaCh0aGlzLm9wdGlvbnMubGluZVNoYXBlKSB7XG4gICAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICAgICAgdGhpcy5lbGVtZW50cy5saW5lID0gdGhpcy5jb250YWluZXJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1saW5lJylcbiAgICAgICAgICAgICAgICAuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZWN0JzpcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMubGluZSA9IHRoaXMuY29udGFpbmVyXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctcmVjdCcpXG4gICAgICAgICAgICAgICAgLnN0eWxlKCdwb2ludGVyLWV2ZW50cycsICdub25lJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnRzLmxhYmVsID0gdGhpcy5jb250YWluZXJcbiAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxhYmVsJyk7XG5cbiAgICB0aGlzLnNpemVMaW5lQW5kTGFiZWwoKTtcblxuICAgIC8vIG9uIHRhYmxlIG1vdmUsIG1vdmUgdGhlIG1hcmtlclxuICAgIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyID0gdGhpcy5tb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJywgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIpO1xuXG4gICAgLy8gb24gdGFibGUgcmVzaXplLCByZXNpemUgdGhlIG1hcmtlciBhbmQgbW92ZSBpdFxuICAgIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICAgICAgc2VsZi5yZXNpemUodHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgc2VsZi5tb3ZlKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIpO1xuXG4gICAgdGhpcy5fdGFibGVEZXN0cm95TGlzdGVuZXIgPSBmdW5jdGlvbih0YWJsZSkge1xuICAgICAgICBzZWxmLnVuYmluZFRhYmxlKHRhYmxlKTtcbiAgICB9O1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6ZGVzdHJveScsIHRoaXMuX3RhYmxlRGVzdHJveUxpc3RlbmVyKTtcblxuICAgIHRoaXMuZW1pdCgnbWFya2VyOmJvdW5kJyk7XG5cbiAgICB0aGlzLm1vdmUoKTtcblxufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvcnJlY3QgZGltZW5zaW9ucyBhbmQgbGFiZWwgY29udGVudFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zaXplTGluZUFuZExhYmVsID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgbGF5b3V0ID0gdGhpcy5vcHRpb25zLmxheW91dDtcblxuICAgIHZhciBsaW5lID0gdGhpcy5lbGVtZW50cy5saW5lO1xuICAgIHZhciBsYWJlbCA9IHRoaXMuZWxlbWVudHMubGFiZWw7XG5cbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICBsaW5lID0gbGluZS50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgbGFiZWwgPSBsYWJlbC50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBzd2l0Y2gobGF5b3V0KSB7XG5cbiAgICAgICAgY2FzZSB0aGlzLkxBWU9VVF9WRVJUSUNBTDpcblxuICAgICAgICAgICAgc3dpdGNoKHRoaXMub3B0aW9ucy5saW5lU2hhcGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkxOiAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTI6IHRoaXMudGFibGUuZGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgbGluZS5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IC10aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzcy8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMub3B0aW9ucy5yZWN0VGhpY2tuZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSArIHRoaXMudGFibGUuZGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsIC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZS10aGlzLm9wdGlvbnMudGlja1BhZGRpbmcpO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRoaXMuTEFZT1VUX0hPUklaT05UQUw6XG5cbiAgICAgICAgICAgIHN3aXRjaCh0aGlzLm9wdGlvbnMubGluZVNoYXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgICAgICAgICAgICAgIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MTogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgyOiB0aGlzLnRhYmxlLmRpbWVuc2lvbnMud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgbGluZS5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzcy8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplICsgdGhpcy50YWJsZS5kaW1lbnNpb25zLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2R4JywgLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLXRoaXMub3B0aW9ucy50aWNrUGFkZGluZylcbiAgICAgICAgICAgICAgICAuYXR0cignZHknLCA0KTtcblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIEhhbmRsZSBEM1RhYmxlIHVuYm91bmRcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZX0gcHJldmlvdXNUYWJsZVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS51bmJpbmRUYWJsZSA9IGZ1bmN0aW9uKHByZXZpb3VzVGFibGUpIHtcblxuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScsIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6ZGVzdHJveScsIHRoaXMuX3RhYmxlRGVzdHJveUxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLmNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHByZXZpb3VzVGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICAgICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5lbWl0KCdtYXJrZXI6dW5ib3VuZCcsIHByZXZpb3VzVGFibGUpO1xufTtcblxuLyoqXG4gKiBNb3ZlIHRoZSBtYXJrZXIgcmVxdWVzdGluZyBhbiBhbmltYXRpb24gZnJhbWVcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqL1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICB0aGlzLnRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fbW92ZUFGID0gdGhpcy50YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5tb3ZlU3luYy5iaW5kKHRoaXMpKTtcblxufTtcblxuLyoqXG4gKiBNb3ZlIHRoZSBtYXJrZXIgc3luY2hyb25vdXNseVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5tb3ZlU3luYyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKCF0aGlzLnRhYmxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGxheW91dCA9IHRoaXMub3B0aW9ucy5sYXlvdXQ7XG5cbiAgICB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuZWFjaChmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNlbGYuZ2V0VmFsdWUoZGF0YSk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHNjYWxlLCBwb3NpdGlvbiA9IFswLCAwXSwgcG9zaXRpb25JbmRleDtcblxuICAgICAgICAgICAgc3dpdGNoKGxheW91dCkge1xuICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5MQVlPVVRfVkVSVElDQUw6XG4gICAgICAgICAgICAgICAgICAgIHNjYWxlID0gc2VsZi50YWJsZS5zY2FsZXMueDtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25JbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5MQVlPVVRfSE9SSVpPTlRBTDpcbiAgICAgICAgICAgICAgICAgICAgc2NhbGUgPSBzZWxmLnRhYmxlLnNjYWxlcy55O1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkluZGV4ID0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcG9zaXRpb25bcG9zaXRpb25JbmRleF0gPSBzY2FsZSh2YWx1ZSk7XG5cbiAgICAgICAgICAgIHZhciByYW5nZSA9IHNjYWxlLnJhbmdlKCk7XG4gICAgICAgICAgICB2YXIgaXNJblJhbmdlID0gcG9zaXRpb25bcG9zaXRpb25JbmRleF0gPj0gcmFuZ2VbMF0gJiYgcG9zaXRpb25bcG9zaXRpb25JbmRleF0gPD0gcmFuZ2VbcmFuZ2UubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgICAgIHZhciBncm91cCA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgaWYgKGlzSW5SYW5nZSkge1xuXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XG5cbiAgICAgICAgICAgICAgICBncm91cC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrKHNlbGYudGFibGUubWFyZ2luLmxlZnQgKyBwb3NpdGlvblswXSA+PiAwKSsnLCcrKHNlbGYudGFibGUubWFyZ2luLnRvcCArIHBvc2l0aW9uWzFdID4+IDApKycpJyk7XG5cbiAgICAgICAgICAgICAgICBncm91cC5zZWxlY3QoJy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctbGFiZWwnKVxuICAgICAgICAgICAgICAgICAgICAudGV4dChzZWxmLm9wdGlvbnMuZm9ybWF0dGVyLmNhbGwoc2VsZiwgdmFsdWUpKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxufTtcblxuLyoqXG4gKiBTaG93IHRoZSBtYXJrZXJcbiAqL1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZSgnZGlzcGxheScsICcnKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEhpZGUgdGhlIG1hcmtlclxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuY29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnN0eWxlKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEltcGxlbWVudCByZXNpemluZyB0aGUgbWFya2VyLCB3aGljaCBzaG91bGQgYmUgY2FsbGVkIG9uIEQzVGFibGUgcmVzaXplIGV2ZW50XG4gKlxuICogQHBhcmFtIHRyYW5zaXRpb25EdXJhdGlvblxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHRoaXMuc2l6ZUxpbmVBbmRMYWJlbCh0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVNYXJrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGVNYXJrZXIgZnJvbSAnLi9EM1RhYmxlTWFya2VyJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbnZhciBkM1RpbWVsaW5lID0ge307XG5cbi8qKlxuICogTW91c2UgcG9zaXRpb24gdHJhY2tlciB3aGljaCByZXNwb25kcyB0byBEM1RhYmxlIGV2ZW50cyAod2hpY2ggbGlzdGVucyBpdHNlbGYgdG8gbW91c2UgZXZlbnRzKVxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlTW91c2VUcmFja2VyT3B0aW9uc30gb3B0aW9uc1xuICogQGV4dGVuZHMge2QzVGltZWxpbmUuRDNUYWJsZU1hcmtlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5kM1RpbWVsaW5lLkQzVGFibGVNb3VzZVRyYWNrZXIgPSBmdW5jdGlvbiBEM1RhYmxlTW91c2VUcmFja2VyKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlTWFya2VyLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl90YWJsZU1vdXNlZW50ZXJMaXN0ZW5lciA9IG51bGw7XG4gICAgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lciA9IG51bGw7XG4gICAgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fbW92ZUFGID0gbnVsbDtcblxuICAgIHRoaXMub24oJ21hcmtlcjpib3VuZCcsIHRoaXMuaGFuZGxlVGFibGVCb3VuZC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLm9uKCdtYXJrZXI6dW5ib3VuZCcsIHRoaXMuaGFuZGxlVGFibGVVbmJvdW5kLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAbmFtZSBkM1RpbWVsaW5lLkQzVGFibGVNb3VzZVRyYWNrZXIjb3B0aW9uc1xuICAgICAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGVNb3VzZVRyYWNrZXJPcHRpb25zfVxuICAgICAqL1xufTtcblxudmFyIEQzVGFibGVNb3VzZVRyYWNrZXIgPSBkM1RpbWVsaW5lLkQzVGFibGVNb3VzZVRyYWNrZXI7XG5cbmluaGVyaXRzKEQzVGFibGVNb3VzZVRyYWNrZXIsIEQzVGFibGVNYXJrZXIpO1xuXG4vKipcbiAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGVNb3VzZVRyYWNrZXJPcHRpb25zfVxuICovXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1Nb2RpZmllcnM6IFsnbW91c2VUcmFja2VyJ10sXG4gICAgbGlzdGVuVG9Ub3VjaEV2ZW50czogdHJ1ZVxufSk7XG5cbi8qKlxuICogSW1wbGVtZW50IHRoZSBsaXN0ZW5lciBmb3IgRDNUYWJsZSBiZWluZyBib3VuZFxuICovXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVUYWJsZUJvdW5kID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLl90YWJsZU1vdXNlZW50ZXJMaXN0ZW5lciA9IHRoaXMuaGFuZGxlTW91c2VlbnRlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIgPSB0aGlzLmhhbmRsZU1vdXNlbW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyID0gdGhpcy5oYW5kbGVNb3VzZWxlYXZlLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdXNlZW50ZXInLCB0aGlzLl90YWJsZU1vdXNlZW50ZXJMaXN0ZW5lcik7XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZW1vdmUnLCB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyKTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdXNlbGVhdmUnLCB0aGlzLl90YWJsZU1vdXNlbGVhdmVMaXN0ZW5lcik7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmxpc3RlblRvVG91Y2hFdmVudHMpIHtcbiAgICAgICAgdGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzp0b3VjaG1vdmUnLCB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMgPSBmYWxzZTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEltcGxlbWVudCB0aGUgbGlzdGVuZXIgZm9yIEQzVGFibGUgYmVpbmcgdW5ib3VuZFxuICovXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVUYWJsZVVuYm91bmQgPSBmdW5jdGlvbihwcmV2aW91c1RhYmxlKSB7XG5cbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdXNlZW50ZXInLCB0aGlzLl90YWJsZU1vdXNlZW50ZXJMaXN0ZW5lcik7XG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZW1vdmUnLCB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdXNlbGVhdmUnLCB0aGlzLl90YWJsZU1vdXNlbGVhdmVMaXN0ZW5lcik7XG5cbiAgICBpZiAodGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzKSB7XG4gICAgICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6dG91Y2htb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIEltcGxlbWVudCBnZXR0aW5nIHggYW5kIHkgcG9zaXRpb25zIGZyb20gRDNUYWJsZSBldmVudFxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlfSB0YWJsZVxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkMy5FdmVudH0gZDNFdmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0VGltZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0Um93XG4gKlxuICogQHNlZSBkM1RpbWVsaW5lLkQzVGFibGUjZW1pdERldGFpbGVkRXZlbnQgZm9yIGFyZ3VtZW50cyBkZXNjcmlwdGlvblxuICogQHJldHVybnMgeyp9XG4gKi9cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcbiAgICBzd2l0Y2ggKHRoaXMub3B0aW9ucy5sYXlvdXQpIHtcbiAgICAgICAgY2FzZSAndmVydGljYWwnOlxuICAgICAgICAgICAgcmV0dXJuIGdldFRpbWUoKTtcbiAgICAgICAgY2FzZSAnaG9yaXpvbnRhbCc6XG4gICAgICAgICAgICByZXR1cm4gZ2V0Um93KCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgbW91c2UgZW50ZXIgaGFuZGxpbmdcbiAqICAtIHNob3cgdGhlIG1hcmtlciBhbmQgc2V0IHRoZSB2YWx1ZSBmcm9tIG1vdXNlIHBvc2l0aW9uXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGV9IHRhYmxlXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge2QzLkV2ZW50fSBkM0V2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXRUaW1lXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXRSb3dcbiAqXG4gKiBAc2VlIGQzVGltZWxpbmUuRDNUYWJsZSNlbWl0RGV0YWlsZWRFdmVudCBmb3IgYXJndW1lbnRzIGRlc2NyaXB0aW9uXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2VlbnRlciA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHRpbWUgPSB0aGlzLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5zaG93KCk7XG4gICAgICAgIHNlbGYuc2V0VmFsdWUodGltZSk7XG4gICAgfSk7XG5cbn07XG5cbi8qKlxuICogSW1wbGVtZW50IG1vdXNlIG1vdmUgaGFuZGxpbmdcbiAqICAtIHNldCB0aGUgdmFsdWUgZnJvbSBtb3VzZSBwb3NpdGlvblxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlfSB0YWJsZVxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkMy5FdmVudH0gZDNFdmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0VGltZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0Um93XG4gKlxuICogQHNlZSBkM1RpbWVsaW5lLkQzVGFibGUjZW1pdERldGFpbGVkRXZlbnQgZm9yIGFyZ3VtZW50cyBkZXNjcmlwdGlvblxuICogQHJldHVybnMgeyp9XG4gKi9cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZU1vdXNlbW92ZSA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciB0aW1lID0gdGhpcy5nZXRWYWx1ZUZyb21UYWJsZUV2ZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdGhpcy5fbW92ZUFGID0gdGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNldFZhbHVlKHRpbWUpO1xuICAgIH0pO1xuXG59O1xuXG4vKipcbiAqIEltcGxlbWVudCBtb3VzZSBsZWF2ZSBoYW5kbGluZ1xuICogIC0gaGlkZSB0aGUgbWFya2VyIGFuZCBzZXQgdGhlIHZhbHVlIGZyb20gbW91c2UgcG9zaXRpb25cbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZX0gdGFibGVcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7ZDMuRXZlbnR9IGQzRXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFRpbWVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFJvd1xuICpcbiAqIEBzZWUgZDNUaW1lbGluZS5EM1RhYmxlI2VtaXREZXRhaWxlZEV2ZW50IGZvciBhcmd1bWVudHMgZGVzY3JpcHRpb25cbiAqIEByZXR1cm5zIHsqfVxuICovXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVNb3VzZWxlYXZlID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICBpZiAodGhpcy5fbW92ZUFGKSB7XG4gICAgICAgIHRhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5oaWRlKCk7XG4gICAgfSk7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZU1vdXNlVHJhY2tlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZU1hcmtlciBmcm9tICcuL0QzVGFibGVNYXJrZXInO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxudmFyIGQzVGltZWxpbmUgPSB7fTtcblxuLyoqXG4gKiBBIEQzVGFibGVWYWx1ZVRyYWNrZXIgaXMgYSBEM1RhYmxlTWFya2VyIHdoaWNoIGJlaGF2ZXMgYWxvbmUgYW5kIGNhbiBiZSBzdGFydGVkIGFuZCBzdG9wcGVkLFxuICogZ2V0dGluZyBpdHMgdmFsdWUgZnJvbSB0aGUgaW1wbGVtZW50ZWQgdmFsdWVHZXR0ZXJcbiAqXG4gKiBAc2VlIGQzLnRpbWVyIHRvIHVuZGVyc3RhbmQgaG93IGl0IGJlaGF2ZXMgYXV0b21hdGljYWxseVxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVNYXJrZXJPcHRpb25zfSBvcHRpb25zXG4gKiBAZXh0ZW5kcyB7ZDNUaW1lbGluZS5EM1RhYmxlTWFya2VyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmQzVGltZWxpbmUuRDNUYWJsZVZhbHVlVHJhY2tlciA9IGZ1bmN0aW9uIEQzVGFibGVWYWx1ZVRyYWNrZXIob3B0aW9ucykge1xuICAgIEQzVGFibGVNYXJrZXIuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xufTtcblxudmFyIEQzVGFibGVWYWx1ZVRyYWNrZXIgPSBkM1RpbWVsaW5lLkQzVGFibGVWYWx1ZVRyYWNrZXI7XG5cbmluaGVyaXRzKEQzVGFibGVWYWx1ZVRyYWNrZXIsIEQzVGFibGVNYXJrZXIpO1xuXG4vKipcbiAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGVNYXJrZXJPcHRpb25zfVxuICovXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1Nb2RpZmllcnM6IFsndmFsdWVUcmFja2VyJ11cbn0pO1xuXG4vKipcbiAqIEJ5IGRlZmF1bHQsIHRoZSB2YWx1ZSBpdCBnZXRzIGlzIDBcbiAqXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICovXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS52YWx1ZUdldHRlciA9IGZ1bmN0aW9uKCkge1xuXG4gICByZXR1cm4gMDtcblxufTtcblxuLyoqXG4gKiBTdGFydCB0aGUgdHJhY2tlclxuICovXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAgIGQzLnRpbWVyKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuc2V0VmFsdWUoc2VsZi52YWx1ZUdldHRlcigpKTtcblxuICAgICAgICByZXR1cm4gIXNlbGYuZW5hYmxlZDtcblxuICAgIH0pO1xufTtcblxuLyoqXG4gKiBTdG9wIHRoZSB0cmFja2VyXG4gKi9cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVWYWx1ZVRyYWNrZXI7XG4iLCIvKiBnbG9iYWwgY2FuY2VsQW5pbWF0aW9uRnJhbWUsIHJlcXVlc3RBbmltYXRpb25GcmFtZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBEM0Jsb2NrVGFibGUgZnJvbSAnLi9EM0Jsb2NrVGFibGUnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcblxudmFyIGQzVGltZWxpbmUgPSB7fTtcblxuLyoqXG4gKiBUaW1lbGluZSB2ZXJzaW9uIG9mIGEgRDNCbG9ja1RhYmxlIHdpdGhcbiAqICAtIHRpbWUgc2NhbGUgYXMgeCBzY2FsZVxuICogIC0gYW5kIHNwZWNpYWwgbWV0aG9kcyBwcm94eWluZyB0byBEM0Jsb2NrVGFibGUgbWV0aG9kc1xuICpcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUaW1lbGluZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMge2QzVGltZWxpbmUuRDNCbG9ja1RhYmxlfVxuICovXG5kM1RpbWVsaW5lLkQzVGltZWxpbmUgPSBmdW5jdGlvbiBEM1RpbWVsaW5lKG9wdGlvbnMpIHtcblxuICAgIEQzQmxvY2tUYWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5jdXJyZW50VGltZUludGVydmFsID0gdGhpcy5vcHRpb25zLm1pbmltdW1UaW1lSW50ZXJ2YWw7XG5cbiAgICAvKipcbiAgICAgKiBAbmFtZSBkM1RpbWVsaW5lLkQzVGltZWxpbmUjb3B0aW9uc1xuICAgICAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGltZWxpbmVPcHRpb25zfVxuICAgICAqL1xufTtcblxudmFyIEQzVGltZWxpbmUgPSBkM1RpbWVsaW5lLkQzVGltZWxpbmU7XG5cbmluaGVyaXRzKEQzVGltZWxpbmUsIEQzQmxvY2tUYWJsZSk7XG5cbi8qKlxuICogQHR5cGUge2QzVGltZWxpbmUuRDNUaW1lbGluZU9wdGlvbnN9XG4gKi9cbkQzVGltZWxpbmUucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM0Jsb2NrVGFibGUucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtQmxvY2tOYW1lOiAndGltZWxpbmUnLFxuICAgIGJlbUJsb2NrTW9kaWZpZXI6ICcnLFxuICAgIHhBeGlzVGlja3NGb3JtYXR0ZXI6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQuZ2V0TWludXRlcygpICUgMTUgPyAnJyA6IGQzLnRpbWUuZm9ybWF0KCclSDolTScpKGQpO1xuICAgIH0sXG4gICAgeEF4aXNTdHJva2VXaWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZC5nZXRNaW51dGVzKCkgJTMwID8gMSA6IDI7XG4gICAgfSxcbiAgICBtaW5pbXVtQ29sdW1uV2lkdGg6IDMwLFxuICAgIG1pbmltdW1UaW1lSW50ZXJ2YWw6IDNlNSxcbiAgICBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzOiBbIDZlNCwgM2U1LCA5ZTUsIDEuOGU2LCAzLjZlNiwgNy4yZTYsIDEuNDRlNywgMi44OGU3LCA0LjMyZTcsIDguNjRlNyBdXG59KTtcblxuLyoqXG4gKiBUaW1lIHNjYWxlIGFzIHggc2NhbGVcbiAqIEByZXR1cm5zIHtkMy50aW1lLlNjYWxlfVxuICovXG5EM1RpbWVsaW5lLnByb3RvdHlwZS54U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnRpbWUuc2NhbGUoKTtcbn07XG5cbi8qKlxuICogVXNlIGRhdGEgc3RhcnQgcHJvcGVydHkgd2l0aG91dCBjYXN0aW5nXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBkYXRhXG4gKiBAcmV0dXJucyB7c3RhcnR8YW55fVxuICovXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhU3RhcnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEuc3RhcnQ7XG59O1xuXG4vKipcbiAqIFVzZSBkYXRhIGVuZCBwcm9wZXJ0eSB3aXRob3V0IGNhc3RpbmdcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGRhdGFcbiAqIEByZXR1cm5zIHtzdGFydHxhbnl9XG4gKi9cbkQzVGltZWxpbmUucHJvdG90eXBlLmdldERhdGFFbmQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEuZW5kO1xufTtcblxuLyoqXG4gKiBPdmVycmlkZSB1cGRhdGUgeCBheGlzIGludGVydmFsIGltcGxlbWVudCB3aXRoIGNvbHVtbiB3aWR0aCB1cGRhdGUgYmFzZWQgb24gaW5zdGFuY2Ugb3B0aW9uczpcbiAqICAtIG1pbmltdW1Db2x1bW5XaWR0aDogdGhlIGNvbHVtbiB3aWR0aCBzaG91bGQgbmV2ZXIgYmUgbG93ZXIgdGhhbiB0aGF0XG4gKiAgLSBtaW5pbXVtVGltZUludGVydmFsOiB0aGUgdGltZSBpbnRlcnZhbCBzaG91bGQgbmV2ZXIgYmUgbG93ZXIgdGhhbiB0aGF0XG4gKiAgLSBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzOiB0aGUgbGlzdCBvZiBhdmFpbGFibGUgdGltZSBpbnRlcnZhbHNcbiAqXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RpbWVsaW5lfVxuICovXG5EM1RpbWVsaW5lLnByb3RvdHlwZS51cGRhdGVYQXhpc0ludGVydmFsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgbWluaW11bVRpbWVJbnRlcnZhbCA9IHRoaXMub3B0aW9ucy5taW5pbXVtVGltZUludGVydmFsO1xuICAgIHZhciBtaW5pbXVtQ29sdW1uV2lkdGggPSB0aGlzLm9wdGlvbnMubWluaW11bUNvbHVtbldpZHRoO1xuICAgIHZhciBjdXJyZW50VGltZUludGVydmFsID0gdGhpcy5jdXJyZW50VGltZUludGVydmFsO1xuICAgIHZhciBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzID0gdGhpcy5vcHRpb25zLmF2YWlsYWJsZVRpbWVJbnRlcnZhbHM7XG4gICAgdmFyIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCA9IGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMuaW5kZXhPZihjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB2YXIgY3VycmVudENvbHVtbldpZHRoID0gdGhpcy5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbChjdXJyZW50VGltZUludGVydmFsKTtcblxuICAgIC8vIHByaXZhdGUgZnVuY3Rpb24gdG8gaW5jcmVhc2UvZGVjcmVhc2UgdGltZSBpbnRlcnZhbCBieSBpbmRleCBkZWx0YSBpbiB0aGUgYXZhaWxhYmxlIHRpbWUgaW50ZXJ2YWxzIGFuZCB1cGRhdGUgdGltZSBpbnRlcnZhbCBhbmQgY29sdW1uIHdpZHRoXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlVGltZUludGVydmFsKGRlbHRhKSB7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCArPSBkZWx0YTtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbCA9IGF2YWlsYWJsZVRpbWVJbnRlcnZhbHNbY3VycmVudFRpbWVJbnRlcnZhbEluZGV4XTtcbiAgICAgICAgY3VycmVudENvbHVtbldpZHRoID0gc2VsZi5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbChjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB9XG5cbiAgICBpZiAoYXZhaWxhYmxlVGltZUludGVydmFscy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIGlmIGxvd2VyLCBpbmNyZWFzZVxuICAgICAgICBpZiAoY3VycmVudENvbHVtbldpZHRoIDwgbWluaW11bUNvbHVtbldpZHRoKSB7XG4gICAgICAgICAgICAvLyBzdG9wIHdoZW4gaXQncyBoaWdoZXJcbiAgICAgICAgICAgIHdoaWxlKGN1cnJlbnRDb2x1bW5XaWR0aCA8IG1pbmltdW1Db2x1bW5XaWR0aCAmJiBjdXJyZW50VGltZUludGVydmFsSW5kZXggPCBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgZ3JlYXRlciBkZWNyZWFzZVxuICAgICAgICBlbHNlIGlmIChjdXJyZW50Q29sdW1uV2lkdGggPiBtaW5pbXVtQ29sdW1uV2lkdGgpIHtcbiAgICAgICAgICAgIC8vIHN0b3Agd2hlbiBpdCdzIGxvd2VyXG4gICAgICAgICAgICB3aGlsZShjdXJyZW50Q29sdW1uV2lkdGggPiBtaW5pbXVtQ29sdW1uV2lkdGggJiYgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbCgtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0aGVuIGluY3JlYXNlIG9uY2VcbiAgICAgICAgICAgIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbCgxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIHRpbWUgaW50ZXJ2YWwgaXMgbG93ZXIgdGhhbiB0aGUgbWluaW11bSwgc2V0IGl0IHRvIHRoZSBtaW5pbXVtIGFuZCBjb21wdXRlIGNvbHVtbiB3aWR0aFxuICAgIGlmIChjdXJyZW50VGltZUludGVydmFsIDwgbWluaW11bVRpbWVJbnRlcnZhbCkge1xuICAgICAgICBjdXJyZW50VGltZUludGVydmFsID0gbWluaW11bVRpbWVJbnRlcnZhbDtcbiAgICAgICAgY3VycmVudENvbHVtbldpZHRoID0gc2VsZi5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbChjdXJyZW50VGltZUludGVydmFsKVxuICAgIH1cblxuICAgIC8vIGtlZXAgZmxvb3IgdmFsdWVzXG4gICAgdGhpcy5jdXJyZW50VGltZUludGVydmFsID0gTWF0aC5mbG9vcihjdXJyZW50VGltZUludGVydmFsKTtcbiAgICB0aGlzLmNvbHVtbldpZHRoID0gTWF0aC5mbG9vcihjdXJyZW50Q29sdW1uV2lkdGgpO1xuXG4gICAgLy8gdXBkYXRlIGF4aXNlcyB0aWNrc1xuICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiAzLjZlNikge1xuICAgICAgICB0aGlzLmF4aXNlcy54LnRpY2tzKGQzLnRpbWUuaG91cnMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDMuNmU2ICk7XG4gICAgICAgIHRoaXMuYXhpc2VzLngyLnRpY2tzKGQzLnRpbWUuaG91cnMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDMuNmU2ICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA+IDZlNCkge1xuICAgICAgICB0aGlzLmF4aXNlcy54LnRpY2tzKGQzLnRpbWUubWludXRlcywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gNmU0ICk7XG4gICAgICAgIHRoaXMuYXhpc2VzLngyLnRpY2tzKGQzLnRpbWUubWludXRlcywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gNmU0ICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA+IDFlMykge1xuICAgICAgICB0aGlzLmF4aXNlcy54LnRpY2tzKGQzLnRpbWUuc2Vjb25kcywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gMWUzICk7XG4gICAgICAgIHRoaXMuYXhpc2VzLngyLnRpY2tzKGQzLnRpbWUuc2Vjb25kcywgdGhpcy5jdXJyZW50VGltZUludGVydmFsIC8gMWUzICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFByb3h5IHRvIHtAbGluayBkM1RpbWVsaW5lLkQzVGFibGUjc2V0WFJhbmdlfVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gbWluRGF0ZVxuICogQHBhcmFtIHtEYXRlfSBtYXhEYXRlXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RpbWVsaW5lfVxuICovXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5zZXRUaW1lUmFuZ2UgPSBmdW5jdGlvbihtaW5EYXRlLCBtYXhEYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFJhbmdlKG1pbkRhdGUsIG1heERhdGUpO1xufTtcblxuLyoqXG4gKiBDb21wdXRlIGNvbHVtbiB3aWR0aCBmcm9tIGEgcHJvdmlkZWQgdGltZSBpbnRlcnZhbFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lSW50ZXJ2YWxcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gKiBAcHJpdmF0ZVxuICovXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVJbnRlcnZhbCkge1xuICAgIHJldHVybiB0aGlzLnNjYWxlcy54KG5ldyBEYXRlKHRpbWVJbnRlcnZhbCkpIC0gdGhpcy5zY2FsZXMueChuZXcgRGF0ZSgwKSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEM1RpbWVsaW5lO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlVmFsdWVUcmFja2VyIGZyb20gJy4vRDNUYWJsZVZhbHVlVHJhY2tlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG52YXIgZDNUaW1lbGluZSA9IHt9O1xuXG4vKipcbiAqIFRpbWVsaW5lIHRpbWUgdHJhY2tlciB3aGljaCBjYW4gYmUgc3RhcnRlZCBhbmQgc3RvcHBlZCBhcyBpdCBpcyBhIHtAbGluayBkM1RpbWVsaW5lLkQzVGFibGVWYWx1ZVRyYWNrZXJ9XG4gKlxuICogQGV4dGVuZHMge2QzVGltZWxpbmUuRDNUYWJsZVZhbHVlVHJhY2tlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5kM1RpbWVsaW5lLkQzVGltZWxpbmVUaW1lVHJhY2tlciA9IGZ1bmN0aW9uIEQzVGltZWxpbmVUaW1lVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZVZhbHVlVHJhY2tlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgLyoqXG4gICAgICogQG5hbWUgZDNUaW1lbGluZS5EM1RpbWVsaW5lVGltZVRyYWNrZXIjdmFsdWVcbiAgICAgKiBAdHlwZSB7RGF0ZX1cbiAgICAgKi9cbn07XG5cbnZhciBEM1RpbWVsaW5lVGltZVRyYWNrZXIgPSBkM1RpbWVsaW5lLkQzVGltZWxpbmVUaW1lVHJhY2tlcjtcblxuaW5oZXJpdHMoRDNUaW1lbGluZVRpbWVUcmFja2VyLCBEM1RhYmxlVmFsdWVUcmFja2VyKTtcblxuLyoqXG4gKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlTWFya2VyT3B0aW9uc31cbiAqL1xuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBiZW1CbG9ja05hbWU6ICd0aW1lbGluZU1hcmtlcicsXG4gICAgYmVtTW9kaWZpZXJzOiBbJ3RpbWVUcmFja2VyJ10sXG4gICAgbGF5b3V0OiAndmVydGljYWwnXG59KTtcblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgdGltZVxuICogVG8gYmUgb3ZlcnJpZGRlbiBpZiB5b3Ugd2lzaCB0byByZXByZXNlbnQgYSBiaWFzZWQgdGltZSBmb3IgZXhhbXBsZVxuICpcbiAqIEByZXR1cm5zIHtEYXRlfVxuICovXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnRpbWVHZXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbn07XG5cbi8qKlxuICogUHJveHkgdG8ge0BsaW5rIGQzVGltZWxpbmUuRDNUYWJsZVZhbHVlVHJhY2tlciN0aW1lR2V0dGVyfVxuICpcbiAqIEByZXR1cm5zIHtEYXRlfVxuICovXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlR2V0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudGltZUdldHRlcigpO1xufTtcblxuLyoqXG4gKiBDb21wYXJlIHRpbWVzLCBkZWZhdWx0cyB0byB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlVmFsdWVUcmFja2VyI3ZhbHVlQ29tcGFyYXRvcn1cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb258Kn1cbiAqL1xuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS50aW1lQ29tcGFyYXRvciA9IEQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlQ29tcGFyYXRvcjtcblxuLyoqXG4gKiBQcm94eSB0byB7QGxpbmsgZDNUaW1lbGluZS5EM1RpbWVsaW5lVGltZVRyYWNrZXIudGltZUNvbXBhcmF0b3J9XG4gKlxuICogQHBhcmFtIHtEYXRlfSBhXG4gKiBAcGFyYW0ge0RhdGV9IGJcbiAqL1xuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS52YWx1ZUNvbXBhcmF0b3IgPSBmdW5jdGlvbihhLGIpIHtcbiAgICByZXR1cm4gdGhpcy50aW1lQ29tcGFyYXRvcihhLGIpO1xufTtcblxuLyoqXG4gKiBQcm94eSB0byB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlVmFsdWVUcmFja2VyI3NldFZhbHVlfVxuICogVG8gYmUgb3ZlcnJpZGRlbiBpZiB5b3Ugd2hpY2ggdG8gYWx0ZXIgdGhlIHZhbHVlIHNldFxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gdGltZVxuICovXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnNldFRpbWUgPSBmdW5jdGlvbih0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGltZSk7XG59O1xuXG4vKipcbiAqIFByb3h5IHRvIHtAbGluayBkM1RpbWVsaW5lLkQzVGFibGVWYWx1ZVRyYWNrZXIjc2V0VGFibGV9XG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGltZWxpbmV9IHRpbWVsaW5lXG4gKi9cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUuc2V0VGltZWxpbmUgPSBEM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5zZXRUYWJsZTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RpbWVsaW5lVGltZVRyYWNrZXI7XG4iXX0=
(1)
});
;