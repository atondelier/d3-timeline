!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.d3Timeline=e():"undefined"!=typeof global?global.d3Timeline=e():"undefined"!=typeof self&&(self.d3Timeline=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports.D3Table = require('./src/D3Table.js');
module.exports.D3BlockTable = require('./src/D3BlockTable.js');
module.exports.D3Timeline = require('./src/D3Timeline');
module.exports.D3TableStaticMarker = require('./src/D3TableStaticMarker.js');
module.exports.D3TableMarker = require('./src/D3TableMarker.js');
module.exports.D3TableMouseTracker = require('./src/D3TableMouseTracker.js');
module.exports.D3TableValueTracker = require('./src/D3TableValueTracker.js');
module.exports.D3TableScrollBar = require('./src/D3TableScrollBar.js');
module.exports.D3TimelineTimeTracker = require('./src/D3TimelineTimeTracker.js');

},{"./src/D3BlockTable.js":5,"./src/D3Table.js":6,"./src/D3TableMarker.js":7,"./src/D3TableMouseTracker.js":8,"./src/D3TableScrollBar.js":9,"./src/D3TableStaticMarker.js":10,"./src/D3TableValueTracker.js":11,"./src/D3Timeline":12,"./src/D3TimelineTimeTracker.js":13}],2:[function(require,module,exports){
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

var _d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);

var _d32 = _interopRequireDefault(_d3);

var _D3Table = require('./D3Table');

var _D3Table2 = _interopRequireDefault(_D3Table);

var _D3TableStaticMarker = require('./D3TableStaticMarker');

var _D3TableStaticMarker2 = _interopRequireDefault(_D3TableStaticMarker);

var d3Timeline = {};

/**
 * Table marker which knows how to represent itself in a {@link d3Timeline.D3Table#container}
 *
 * @param {d3Timeline.D3TableStaticMarkerOptions} options
 * @extends {d3Timeline.D3TableStaticMarker}
 * @constructor
 */
d3Timeline.D3TableMarker = function D3TableMarker(options) {

    _D3TableStaticMarker2['default'].call(this, options);

    /**
     * @type {Function}
     * @private
     */
    this._tableMoveListener = null;

    this._lastTimeUpdated = null;
};

var D3TableMarker = d3Timeline.D3TableMarker;

(0, _inherits2['default'])(D3TableMarker, _D3TableStaticMarker2['default']);

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

    _D3TableStaticMarker2['default'].prototype.bindTable.apply(this, arguments);

    var self = this;

    // on table move, move the marker
    this._tableMoveListener = function () {
        self.move();
    };
    this.table.on(this.table.options.bemBlockName + ':move', this._tableMoveListener);

    this.move();
};

/**
 * Handle D3Table unbound
 *
 * @param {d3Timeline.D3Table} previousTable
 */
D3TableMarker.prototype.unbindTable = function (previousTable) {

    _D3TableStaticMarker2['default'].prototype.unbindTable.apply(this, arguments);

    previousTable.removeListener(previousTable.options.bemBlockName + ':move', this._tableMoveListener);

    this._tableMoveListener = null;

    this.emit('marker:unbound', previousTable);
};

/**
 * @todo document this
 *
 * @param data
 * @returns {*}
 */
D3TableMarker.prototype.getPosition = function (data) {

    var value = this.getValue(data);

    if (value === null) {
        return null;
    }

    var layout = this.options.layout;
    var scale,
        position = [0, 0],
        positionIndex;

    switch (layout) {
        case this.LAYOUT_VERTICAL:
            scale = this.table.scales.x;
            positionIndex = 0;
            break;
        case this.LAYOUT_HORIZONTAL:
            scale = this.table.scales.y;
            positionIndex = 1;
    }

    position[positionIndex] = scale(value);

    var range = scale.range();
    var isInRange = position[positionIndex] >= range[0] && position[positionIndex] <= range[range.length - 1];

    return isInRange ? position : null;
};

/**
 * Move the marker synchronously
 */
D3TableMarker.prototype.moveSync = function () {

    if (!this.table) {
        return;
    }

    var self = this;

    this.container.each(function (data) {

        var position = self.getPosition(data);

        if (position) {
            var group = _d32['default'].select(this);

            self.show();

            group.attr('transform', 'translate(' + (self.table.margin.left + position[0] >> 0) + ',' + (self.table.margin.top + position[1] >> 0) + ')');

            group.select('.' + self.options.bemBlockName + '-label').text(self.options.formatter.call(self, self.getValue(data)));
        } else {
            self.hide();
        }
    });
};

module.exports = D3TableMarker;

},{"./D3Table":6,"./D3TableStaticMarker":10,"extend":3,"inherits":4}],8:[function(require,module,exports){
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
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);

var _d32 = _interopRequireDefault(_d3);

var _D3Table = require('./D3Table');

var _D3Table2 = _interopRequireDefault(_D3Table);

var _D3TableStaticMarker = require('./D3TableStaticMarker');

var _D3TableStaticMarker2 = _interopRequireDefault(_D3TableStaticMarker);

var d3Timeline = {};

/**
 * Table marker which knows how to represent itself in a {@link d3Timeline.D3Table#container}
 *
 * @param {d3Timeline.D3TableStaticMarkerOptions} options
 * @extends {d3Timeline.D3TableStaticMarker}
 * @constructor
 */
d3Timeline.D3TableScrollBar = function D3TableScrollBar(options) {

    _D3TableStaticMarker2['default'].call(this, options);

    /**
     * @type {Function}
     * @private
     */
    this._tableMoveListener = null;
};

var D3TableScrollBar = d3Timeline.D3TableScrollBar;

(0, _inherits2['default'])(D3TableScrollBar, _D3TableStaticMarker2['default']);

/**
 * @type {d3Timeline.D3TableStaticMarkerOptions}
 */
D3TableScrollBar.prototype.defaults = (0, _extend2['default'])(true, {}, _D3TableStaticMarker2['default'].prototype.defaults, {
    bemModifiers: ['scrollBar']
});

/**
 * Handle a D3Table being bound
 */
D3TableScrollBar.prototype.bindTable = function () {

    _D3TableStaticMarker2['default'].prototype.bindTable.apply(this, arguments);

    var self = this;

    // on table move, move the marker
    this._tableMoveListener = function () {
        self.updateSize();
    };
    this.table.on(this.table.options.bemBlockName + ':move', this._tableMoveListener);

    this.move();
};

/**
 * Handle D3Table unbound
 *
 * @param {d3Timeline.D3Table} previousTable
 */
D3TableScrollBar.prototype.unbindTable = function (previousTable) {

    _D3TableStaticMarker2['default'].prototype.unbindTable.apply(this, arguments);

    previousTable.removeListener(previousTable.options.bemBlockName + ':move', this._tableMoveListener);

    this._tableMoveListener = null;

    this.emit('marker:unbound', previousTable);
};

/**
 * @todo document this
 *
 * @returns {*}
 */
D3TableScrollBar.prototype.getPosition = function () {

    switch (this.options.layout) {
        case this.LAYOUT_VERTICAL:
            return [this.table.dimensions.width - this.options.rectThickness / 2, 0];
        case this.LAYOUT_HORIZONTAL:
            return [0, this.table.dimensions.height - this.options.rectThickness / 2];
    }
};

/**
 * Move the marker synchronously
 */
D3TableScrollBar.prototype.moveSync = function () {

    if (!this.table) {
        return;
    }

    var self = this;

    this.container.each(function () {

        var position = self.getPosition();

        if (position) {
            var group = _d32['default'].select(this);

            self.show();

            group.attr('transform', 'translate(' + (self.table.margin.left + position[0] >> 0) + ',' + (self.table.margin.top + position[1] >> 0) + ')');
        } else {
            self.hide();
        }
    });

    this.updateSize();
};

/**
 * Update the scroll bar size
 */
D3TableScrollBar.prototype.updateSize = function () {

    var scale, start, end, min, quantity, domain, multiplier, positionRule, sizeRule;

    switch (this.options.layout) {

        case this.LAYOUT_VERTICAL:

            var data = this.table.data;
            scale = this.table.scales.y;
            domain = scale.domain();
            start = domain[0];
            end = domain[1];

            if (start == 0 && end == data.length) {
                this.hide();
                return;
            } else {
                this.show();
            }

            min = 0;
            quantity = data.length;
            multiplier = this.table.dimensions.height / quantity;
            positionRule = 'y';
            sizeRule = 'height';

            break;

        case this.LAYOUT_HORIZONTAL:

            scale = this.table.scales.x;
            domain = scale.domain();
            start = domain[0];
            end = domain[1];

            if (+start == +this.table.minX && +end == +this.table.maxX) {
                this.hide();
                return;
            } else {
                this.show();
            }

            min = this.table.minX;
            quantity = +this.table.maxX - this.table.minX;
            multiplier = this.table.dimensions.width / quantity;
            positionRule = 'x';
            sizeRule = 'width';

            break;
    }

    this.container.select('rect').attr(positionRule, (+start - min) * multiplier).attr(sizeRule, (end - start) * multiplier);
};

module.exports = D3TableScrollBar;

},{"./D3Table":6,"./D3TableStaticMarker":10,"extend":3,"inherits":4}],10:[function(require,module,exports){
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
 * Table static marker which knows how to represent itself in a {@link d3Timeline.D3Table#container}
 *
 * @param {d3Timeline.D3TableStaticMarkerOptions} options
 * @extends {EventEmitter}
 * @constructor
 */
d3Timeline.D3TableStaticMarker = function D3TableStaticMarker(options) {

    _eventsEvents2['default'].call(this);

    /**
     * @type {d3Timeline.D3TableStaticMarkerOptions}
     */
    this.options = (0, _extend2['default'])(true, {}, this.defaults, options);

    /**
     * @type {d3Timeline.D3Table}
     */
    this.table = null;

    /**
     * @type {Boolean}
     */
    this.visible = true;

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
    this._tableResizeListener = null;

    /**
     * @type {Function}
     * @private
     */
    this._tableDestroyListener = null;

    this._moveAF = null;
};

var D3TableStaticMarker = d3Timeline.D3TableStaticMarker;

(0, _inherits2['default'])(D3TableStaticMarker, _eventsEvents2['default']);

D3TableStaticMarker.prototype.LAYOUT_HORIZONTAL = 'horizontal';
D3TableStaticMarker.prototype.LAYOUT_VERTICAL = 'vertical';

D3TableStaticMarker.prototype.INSERT_ON_TOP = 'insertOnTop';
D3TableStaticMarker.prototype.INSERT_BEHIND = 'insertBehind';

/**
 * @type {d3Timeline.D3TableStaticMarkerOptions}
 */
D3TableStaticMarker.prototype.defaults = {
    formatter: function formatter(d) {
        return d;
    },
    insertionMethod: D3TableStaticMarker.prototype.INSERT_ON_TOP,
    outerTickSize: 10,
    tickPadding: 3,
    roundPosition: false,
    bemBlockName: 'tableMarker',
    bemModifiers: [],
    layout: D3TableStaticMarker.prototype.LAYOUT_VERTICAL,
    lineShape: 'line',
    rectThickness: _D3Table2['default'].prototype.defaults.rowHeight
};

/**
 * Set the table it should draw itself onto
 * @param {d3Timeline.D3Table} table
 */
D3TableStaticMarker.prototype.setTable = function (table) {

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
 * Handle a D3Table being bound
 */
D3TableStaticMarker.prototype.bindTable = function () {

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
};

/**
 * Set the correct dimensions and label content
 *
 * @param {Number} [transitionDuration]
 */
D3TableStaticMarker.prototype.sizeLineAndLabel = function (transitionDuration) {

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
D3TableStaticMarker.prototype.unbindTable = function (previousTable) {

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
    this._tableResizeListener = null;
    this._tableDestroyListener = null;

    this.emit('marker:unbound', previousTable);
};

/**
 * Move the marker requesting an animation frame
 */
D3TableStaticMarker.prototype.move = function () {

    if (this._moveAF) {
        this.table.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = this.table.requestAnimationFrame(this.moveSync.bind(this));
};

/**
 * @todo document this
 *
 * @returns {*}
 */
D3TableStaticMarker.prototype.getPosition = function () {
    return null;
};

/**
 * Move the marker synchronously
 */
D3TableStaticMarker.prototype.moveSync = function () {

    if (!this.table) {
        return;
    }

    var self = this;
    var layout = this.options.layout;

    var position = this.getPosition();

    this.container.each(function () {

        var finalPosition = [0, 0],
            positionIndex;

        switch (layout) {
            case self.LAYOUT_VERTICAL:
                positionIndex = 0;
                break;
            case self.LAYOUT_HORIZONTAL:
                positionIndex = 1;
        }

        finalPosition[positionIndex] = position;

        var group = _d32['default'].select(this);

        self.show();

        group.attr('transform', 'translate(' + (self.table.margin.left + finalPosition[0] >> 0) + ',' + (self.table.margin.top + finalPosition[1] >> 0) + ')');

        group.select('.' + self.options.bemBlockName + '-label').text(self.options.formatter.call(self, finalPosition));
    });
};

/**
 * Show the marker
 */
D3TableStaticMarker.prototype.show = function () {
    if (!this.visible && this.container) {
        this.visible = true;
        this.container.style('display', '');
    }
};

/**
 * Hide the marker
 */
D3TableStaticMarker.prototype.hide = function () {
    if (this.visible && this.container) {
        this.visible = false;
        this.container.style('display', 'none');
    }
};

/**
 * Implement resizing the marker, which should be called on D3Table resize event
 *
 * @param transitionDuration
 */
D3TableStaticMarker.prototype.resize = function (transitionDuration) {

    this.sizeLineAndLabel(transitionDuration);
};

module.exports = D3TableStaticMarker;

},{"./D3Table":6,"events/events":2,"extend":3,"inherits":4}],11:[function(require,module,exports){
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
 * @param {d3Timeline.D3TableStaticMarkerOptions} options
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
 * @type {d3Timeline.D3TableStaticMarkerOptions}
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

},{"./D3TableMarker":7,"extend":3,"inherits":4}],12:[function(require,module,exports){
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

},{"./D3BlockTable":5,"extend":3,"inherits":4}],13:[function(require,module,exports){
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
 * @type {d3Timeline.D3TableStaticMarkerOptions}
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

},{"./D3TableValueTracker":11,"extend":3,"inherits":4}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9pbmRleC5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL3NyYy9EM0Jsb2NrVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVTY3JvbGxCYXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVTdGF0aWNNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3hELE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDakUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQzdFLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDdkUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsR0FBRyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQzs7O0FDVmpGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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cUJBQXFCLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyx5QkFBTyxJQUFJLEVBQUUsRUFBRSxFQUFFLGlDQUFvQixTQUFTLENBQUMsUUFBUSxFQUFFO0FBQ2hHLGNBQVksRUFBRSxnQkFBZ0I7QUFDOUIsY0FBWSxFQUFFLENBQUMsYUFBYSxDQUFDO0FBQzdCLFFBQU0sRUFBRSxVQUFVO0NBQ3JCLENBQUMsQ0FBQzs7Ozs7Ozs7QUFRSCxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFlBQVc7QUFDcEQsU0FBTyxJQUFJLElBQUksRUFBRSxDQUFDO0NBQ3JCLENBQUM7Ozs7Ozs7QUFPRixxQkFBcUIsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFlBQVc7QUFDckQsU0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Q0FDNUIsQ0FBQzs7Ozs7OztBQU9GLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsaUNBQW9CLFNBQVMsQ0FBQyxlQUFlLENBQUM7Ozs7Ozs7O0FBUS9GLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsVUFBUyxDQUFDLEVBQUMsQ0FBQyxFQUFFO0FBQzVELFNBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbkMsQ0FBQzs7Ozs7Ozs7QUFRRixxQkFBcUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ3JELFNBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM5QixDQUFDOzs7Ozs7O0FBT0YscUJBQXFCLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxpQ0FBb0IsU0FBUyxDQUFDLFFBQVEsQ0FBQzs7QUFFckYsTUFBTSxDQUFDLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzLkQzVGFibGUgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM0Jsb2NrVGFibGUgPSByZXF1aXJlKCcuL3NyYy9EM0Jsb2NrVGFibGUuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGltZWxpbmUgPSByZXF1aXJlKCcuL3NyYy9EM1RpbWVsaW5lJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlU3RhdGljTWFya2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZVN0YXRpY01hcmtlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZU1hcmtlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVNYXJrZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGFibGVNb3VzZVRyYWNrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlTW91c2VUcmFja2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlVmFsdWVUcmFja2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZVZhbHVlVHJhY2tlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZVNjcm9sbEJhciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVTY3JvbGxCYXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGltZWxpbmVUaW1lVHJhY2tlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcycpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgey8qKi99XG5cblx0cmV0dXJuIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmUsXG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzBdLFxuXHRcdGkgPSAxLFxuXHRcdGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0ZGVlcCA9IGZhbHNlO1xuXG5cdC8vIEhhbmRsZSBhIGRlZXAgY29weSBzaXR1YXRpb25cblx0aWYgKHR5cGVvZiB0YXJnZXQgPT09ICdib29sZWFuJykge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuXHRcdC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcblx0XHRpID0gMjtcblx0fSBlbHNlIGlmICgodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJykgfHwgdGFyZ2V0ID09IG51bGwpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAob3B0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbbmFtZV07XG5cdFx0XHRcdGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKHRhcmdldCAhPT0gY29weSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRcdGlmIChkZWVwICYmIGNvcHkgJiYgKGlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gaXNBcnJheShjb3B5KSkpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29weUlzQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvcHkgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZSBmcm9tICcuL0QzVGFibGUnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxudmFyIGQzVGltZWxpbmUgPSB7fTtcblxuLyoqXG4gKiBBZGQgYmVoYXZpb3JzIHRvIGEgRDNUYWJsZSB0byBoYW5kbGUgZWxlbWVudHMgYXMgdmlzdWFsIGJsb2NrcyB3aXRoOlxuICogIC0gZWxlbWVudCBkcmFnICgrIGF1dG9tYXRpYyBzY3JvbGwpXG4gKiAgLSBlbGVtZW50IGNsaXBwaW5nXG4gKiAgLSBlbGVtZW50IHRleHQgKCsgYWxpZ25tZW50KVxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlQmxvY2tPcHRpb25zfSBvcHRpb25zXG4gKiBAZXh0ZW5kcyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmQzVGltZWxpbmUuRDNCbG9ja1RhYmxlID0gZnVuY3Rpb24gRDNCbG9ja1RhYmxlKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICAvKipcbiAgICAgKiBAbmFtZSBkM1RpbWVsaW5lLkQzQmxvY2tUYWJsZSNvcHRpb25zXG4gICAgICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZUJsb2NrT3B0aW9uc31cbiAgICAgKi9cbn07XG5cbnZhciBEM0Jsb2NrVGFibGUgPSBkM1RpbWVsaW5lLkQzQmxvY2tUYWJsZTtcblxuaW5oZXJpdHMoRDNCbG9ja1RhYmxlLCBEM1RhYmxlKTtcblxuLyoqXG4gKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlQmxvY2tPcHRpb25zfVxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGNsaXBFbGVtZW50OiB0cnVlLFxuICAgIGNsaXBFbGVtZW50RmlsdGVyOiBudWxsLFxuICAgIHJlbmRlck9uQXV0b21hdGljU2Nyb2xsSWRsZTogdHJ1ZSxcbiAgICBoaWRlVGlja3NPbkF1dG9tYXRpY1Njcm9sbDogZmFsc2UsXG4gICAgYXV0b21hdGljU2Nyb2xsU3BlZWRNdWx0aXBsaWVyOiAyZS00LFxuICAgIGF1dG9tYXRpY1Njcm9sbE1hcmdpbkRlbHRhOiAzMCxcbiAgICBhcHBlbmRUZXh0OiB0cnVlLFxuICAgIGFsaWduTGVmdDogdHJ1ZSxcbiAgICBhbGlnbk9uVHJhbnNsYXRlOiB0cnVlLFxuICAgIG1heGltdW1DbGlja0RyYWdUaW1lOiAxMDAsXG4gICAgbWF4aW11bUNsaWNrRHJhZ0Rpc3RhbmNlOiAxMixcbiAgICBtaW5pbXVtRHJhZ0Rpc3RhbmNlOiA1LFxuICAgIHRyYWNrZWRFbGVtZW50RE9NRXZlbnRzOiBbJ2NsaWNrJywgJ21vdXNlZW50ZXInLCAnbW91c2VsZWF2ZSddIC8vIG5vdCBkeW5hbWljXG59KTtcblxuLyoqXG4gKiBDb21wdXRlIHRoZSBjbGlwIHBhdGggaWQgZm9yIGVhY2ggZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBQYXRoSWQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRDbGlwUGF0aF8nICsgdGhpcy5pbnN0YW5jZU51bWJlciArICdfJyArIGVsZW1lbnQudWlkO1xufTtcblxuLyoqXG4gKiBDb21wdXRlIHRoZSBjbGlwIHBhdGggbGluayBmb3IgZWFjaCBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFBhdGhMaW5rID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHJldHVybiAndXJsKCMnICsgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoSWQoZWxlbWVudCkgKyAnKSc7XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIGNsaXAgcmVjdCBpZCBmb3IgZWFjaCBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFJlY3RJZCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENsaXBSZWN0XycgKyB0aGlzLmluc3RhbmNlTnVtYmVyICsgJ18nICsgZWxlbWVudC51aWQ7XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIGNsaXAgcmVjdCBsaW5rIGZvciBlYWNoIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZ2VuZXJhdGVDbGlwUmVjdExpbmsgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuICcjJyArIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdElkKGVsZW1lbnQpO1xufTtcblxuLyoqXG4gKiBJbXBsZW1lbnRzIGVsZW1lbnQgZW50ZXJpbmc6XG4gKiAgLSBhcHBlbmQgY2xpcHBlZCByZWN0XG4gKiAgLSBhcHBlbmQgdGV4dFxuICogIC0gY2FsbCB7QGxpbmsgZDNUaW1lbGluZS5EM0Jsb2NrVGFibGUjZWxlbWVudENvbnRlbnRFbnRlcn1cbiAqICAtIGNhbGwgY3VzdG9tIGRyYWcgYmVoYXZpb3JcbiAqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqL1xuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50RW50ZXIgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBlbGVtZW50SGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJvd0hlaWdodCAtIHRoaXMub3B0aW9ucy5yb3dQYWRkaW5nICogMjtcblxuICAgIHZhciByZWN0ID0gc2VsZWN0aW9uXG4gICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50QmFja2dyb3VuZCcpXG4gICAgICAgIC5hdHRyKCdoZWlnaHQnLCBlbGVtZW50SGVpZ2h0KTtcblxuICAgIHZhciBnID0gc2VsZWN0aW9uXG4gICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50Q29udGVudCcpO1xuXG4gICAgZy5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50TW92YWJsZUNvbnRlbnQnKTtcblxuXG4gICAgdmFyIGNsaXBFbGVtZW50ID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsaXBFbGVtZW50KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNsaXBFbGVtZW50RmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjbGlwRWxlbWVudCA9ICEhdGhpcy5vcHRpb25zLmNsaXBFbGVtZW50RmlsdGVyLmNhbGwodGhpcywgc2VsZWN0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsaXBFbGVtZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjbGlwRWxlbWVudCkge1xuXG4gICAgICAgIGdcbiAgICAgICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCB0aGlzLmdlbmVyYXRlQ2xpcFBhdGhMaW5rLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHJlY3RcbiAgICAgICAgICAgIC5wcm9wZXJ0eSgnaWQnLCB0aGlzLmdlbmVyYXRlQ2xpcFJlY3RJZC5iaW5kKHRoaXMpKTtcblxuICAgICAgICBzZWxlY3Rpb24uYXBwZW5kKCdjbGlwUGF0aCcpXG4gICAgICAgICAgICAucHJvcGVydHkoJ2lkJywgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoSWQuYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC5hcHBlbmQoJ3VzZScpXG4gICAgICAgICAgICAuYXR0cigneGxpbms6aHJlZicsIHRoaXMuZ2VuZXJhdGVDbGlwUmVjdExpbmsuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zLnRyYWNrZWRFbGVtZW50RE9NRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gICAgICAgIHNlbGVjdGlvbi5vbihldmVudE5hbWUsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGlmICghZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6JyArIGV2ZW50TmFtZSwgc2VsZWN0aW9uLCBudWxsLCBbZGF0YV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kVGV4dCkge1xuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy50aW1lbGluZS1lbGVtZW50TW92YWJsZUNvbnRlbnQnKVxuICAgICAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgICAgICAuY2xhc3NlZCgndGltZWxpbmUtZW50aXR5TGFiZWwnLCB0cnVlKVxuICAgICAgICAgICAgLmF0dHIoJ2R5JywgdGhpcy5vcHRpb25zLnJvd0hlaWdodC8yICsgNCk7XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uLmNhbGwodGhpcy5lbGVtZW50Q29udGVudEVudGVyLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5iaW5kRHJhZ0FuZERyb3BPblNlbGVjdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpO1xuXG59O1xuXG4vKipcbiAqIEltcGxlbWVudCBlbGVtZW50IGJlaW5nIHRyYW5zbGF0ZWQ6XG4gKiAgLSBhbGlnbiB0ZXh0XG4gKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudHNUcmFuc2xhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kVGV4dCAmJiB0aGlzLm9wdGlvbnMuYWxpZ25MZWZ0ICYmIHRoaXMub3B0aW9ucy5hbGlnbk9uVHJhbnNsYXRlICYmICFlbGVtZW50Ll9kZWZhdWx0UHJldmVudGVkKSB7XG5cbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpXG4gICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyBNYXRoLm1heCgtc2VsZi5zY2FsZXMueChzZWxmLmdldERhdGFTdGFydChkYXRhKSksIDIpICsgJywwKSdcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgZWxlbWVudCBiZWluZyB1cGRhdGVkOlxuICogIC0gdHJhbnNpdGlvbiB3aWR0aFxuICogIC0gYWxpZ24gdGV4dFxuICogIC0gY2FsbCB7QGxpbmsgZDNUaW1lbGluZS5EM0Jsb2NrVGFibGUjZWxlbWVudENvbnRlbnRVcGRhdGV9XG4gKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0gdHJhbnNpdGlvbkR1cmF0aW9uXG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudFVwZGF0ZSA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZWxlbWVudCwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLndyYXBXaXRoQW5pbWF0aW9uKHNlbGVjdGlvbi5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudEJhY2tncm91bmQnKSwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICB5OiB0aGlzLm9wdGlvbnMucm93UGFkZGluZyxcbiAgICAgICAgICAgIHdpZHRoOiBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhRW5kKGQpKSAtIHNlbGYuc2NhbGVzLngoc2VsZi5nZXREYXRhU3RhcnQoZCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRUZXh0ICYmIHRoaXMub3B0aW9ucy5hbGlnbkxlZnQgJiYgIWVsZW1lbnQuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBkID0+ICd0cmFuc2xhdGUoJyArIE1hdGgubWF4KC10aGlzLnNjYWxlcy54KHRoaXMuZ2V0RGF0YVN0YXJ0KGQpKSwgMikgKyAnLDApJyk7XG4gICAgfVxuXG4gICAgc2VsZWN0aW9uLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudENvbnRlbnRVcGRhdGUoc2VsZWN0aW9uLCBlbGVtZW50LCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH0pO1xuXG59O1xuXG4vKipcbiAqIEltcGxlbWVudCBlbGVtZW50IGV4aXRpbmc6XG4gKiAgLSByZW1vdmUgY2xpY2sgbGlzdGVuZXJcbiAqICAtIHJlbW92ZSBkcmFnIGxpc3RlbmVyc1xuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHNlbGVjdGlvblxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRFeGl0ID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBlbGVtZW50KSB7XG5cbiAgICBzZWxlY3Rpb24ub24oJ2NsaWNrJywgbnVsbCk7XG5cbiAgICBpZiAoZWxlbWVudC5fZHJhZykge1xuICAgICAgICBlbGVtZW50Ll9kcmFnLm9uKCdkcmFnc3RhcnQnLCBudWxsKTtcbiAgICAgICAgZWxlbWVudC5fZHJhZy5vbignZHJhZycsIG51bGwpO1xuICAgICAgICBlbGVtZW50Ll9kcmFnLm9uKCdkcmFnZW5kJywgbnVsbCk7XG4gICAgICAgIGVsZW1lbnQuX2RyYWcgPSBudWxsO1xuICAgIH1cblxufTtcblxuLyoqXG4gKiBXaWxsIGJlIGNhbGxlZCBvbiBzZWxlY3Rpb24gd2hlbiBlbGVtZW50IGNvbnRlbnQgZW50ZXJzXG4gKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRDb250ZW50RW50ZXIgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHt9O1xuXG4vKipcbiAqIFdpbGwgYmUgY2FsbGVkIG9uIHNlbGVjdGlvbiB3aGVuIGVsZW1lbnQgY29udGVudCB1cGRhdGVzXG4gKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRDb250ZW50VXBkYXRlID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7fTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgZWxlbWVudCBkcmFnIHdpdGggYXV0b21hdGljIHNjcm9sbCBvbiBwcm92aWRlZCBzZWxlY3Rpb25cbiAqXG4gKiBAdG9kbyBjbGVhbiB1cFxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuYmluZERyYWdBbmREcm9wT25TZWxlY3Rpb24gPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYm9keU5vZGUgPSBzZWxmLmVsZW1lbnRzLmJvZHkubm9kZSgpO1xuICAgIHZhciBkcmFnU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgLy8gcG9zaXRpb25zXG4gICAgdmFyIGN1cnJlbnRUcmFuc2Zvcm0gPSBudWxsO1xuICAgIHZhciBvcmlnaW5UcmFuc2Zvcm1TdHJpbmcgPSBudWxsO1xuICAgIHZhciBkcmFnU3RhcnRYID0gMCwgZHJhZ1N0YXJ0WSA9IDA7XG4gICAgdmFyIGVsZW1lbnRTdGFydFggPSAwLCBlbGVtZW50U3RhcnRZID0gMDtcbiAgICB2YXIgZHJhZ1Bvc2l0aW9uO1xuICAgIHZhciBzdGFydERyYWdQb3NpdGlvbjtcblxuICAgIC8vIG1vdmVtZW50c1xuICAgIHZhciB2ZXJ0aWNhbE1vdmUgPSAwO1xuICAgIHZhciBob3Jpem9udGFsTW92ZSA9IDA7XG4gICAgdmFyIHZlcnRpY2FsU3BlZWQgPSAwO1xuICAgIHZhciBob3Jpem9udGFsU3BlZWQgPSAwO1xuICAgIHZhciB0aW1lckFjdGl2ZSA9IGZhbHNlO1xuICAgIHZhciBuZWVkVGltZXJTdG9wID0gZmFsc2U7XG4gICAgdmFyIHN0YXJ0VGltZTtcblxuICAgIC8vIHJlc2V0IHN0YXJ0IHBvc2l0aW9uOiB0byBjYWxsIG9uIGRyYWcgc3RhcnQgb3Igd2hlbiB0aGluZ3MgYXJlIHJlZHJhd25cbiAgICBmdW5jdGlvbiBzdG9yZVN0YXJ0KCkge1xuICAgICAgICBjdXJyZW50VHJhbnNmb3JtID0gZDMudHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybVN0cmluZyA9IHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nKSk7XG4gICAgICAgIGVsZW1lbnRTdGFydFggPSBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVswXTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WSA9IGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdO1xuICAgICAgICBkcmFnU3RhcnRYID0gZHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICBkcmFnU3RhcnRZID0gZHJhZ1Bvc2l0aW9uWzFdO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBuZXcgZHJhZyBwb3NpdGlvbiBhbmQgbW92ZSB0aGUgZWxlbWVudFxuICAgIGZ1bmN0aW9uIHVwZGF0ZVRyYW5zZm9ybShmb3JjZURyYXcpIHtcblxuICAgICAgICB2YXIgZGVsdGFYID0gZHJhZ1Bvc2l0aW9uWzBdIC0gZHJhZ1N0YXJ0WDtcbiAgICAgICAgdmFyIGRlbHRhWSA9IGRyYWdQb3NpdGlvblsxXSAtIGRyYWdTdGFydFk7XG5cbiAgICAgICAgaWYgKGZvcmNlRHJhdyB8fCAhc2VsZi5vcHRpb25zLnJlbmRlck9uSWRsZSkge1xuICAgICAgICAgICAgc3RvcmVTdGFydChkcmFnUG9zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMF0gPSBlbGVtZW50U3RhcnRYICsgZGVsdGFYO1xuICAgICAgICBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXSA9IGVsZW1lbnRTdGFydFkgKyBkZWx0YVk7XG5cbiAgICAgICAgc2VsZWN0aW9uLmF0dHIoJ3RyYW5zZm9ybScsIGN1cnJlbnRUcmFuc2Zvcm0udG9TdHJpbmcoKSk7XG5cbiAgICB9XG5cbiAgICAvLyB0YWtlIG1pY3JvIHNlY29uZHMgaWYgcG9zc2libGVcbiAgICB2YXIgZ2V0UHJlY2lzZVRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2UgJiYgdHlwZW9mIHBlcmZvcm1hbmNlLm5vdyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIHBlcmZvcm1hbmNlLm5vdy5iaW5kKHBlcmZvcm1hbmNlKVxuICAgICAgICA6IHR5cGVvZiBEYXRlLm5vdyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICBEYXRlLm5vdy5iaW5kKERhdGUpXG4gICAgICAgICAgICA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiArKG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgfTtcblxuICAgIC8vIGhhbmRsZSBhdXRvbWF0aWMgc2Nyb2xsIGFyZ3VtZW50c1xuICAgIGZ1bmN0aW9uIGRvQXV0b21hdGljU2Nyb2xsKHRpbWVEZWx0YSwgZm9yY2VEcmF3KSB7XG5cbiAgICAgICAgLy8gY29tcHV0ZSBkZWx0YXMgYmFzZWQgb24gZGlyZWN0aW9uLCBzcGVlZCBhbmQgdGltZSBkZWx0YVxuICAgICAgICB2YXIgc3BlZWRNdWx0aXBsaWVyID0gc2VsZi5vcHRpb25zLmF1dG9tYXRpY1Njcm9sbFNwZWVkTXVsdGlwbGllcjtcbiAgICAgICAgdmFyIGRlbHRhWCA9IGhvcml6b250YWxNb3ZlICogaG9yaXpvbnRhbFNwZWVkICogdGltZURlbHRhICogc3BlZWRNdWx0aXBsaWVyO1xuICAgICAgICB2YXIgZGVsdGFZID0gdmVydGljYWxNb3ZlICogdmVydGljYWxTcGVlZCAqIHRpbWVEZWx0YSAqIHNwZWVkTXVsdGlwbGllcjtcblxuICAgICAgICAvLyB0YWtlIGdyb3VwIHRyYW5zbGF0ZSBjYW5jZWxsYXRpb24gd2l0aCBmb3JjZWQgcmVkcmF3IGludG8gYWNjb3VudCwgc28gcmVkZWZpbmUgc3RhcnRcbiAgICAgICAgaWYgKGZvcmNlRHJhdykge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZS5zbGljZSgwKTtcbiAgICAgICAgICAgIGVsZW1lbnRTdGFydFggKz0gY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMF07XG4gICAgICAgICAgICBlbGVtZW50U3RhcnRZICs9IGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlYWxNb3ZlID0gc2VsZi5tb3ZlKGRlbHRhWCwgZGVsdGFZLCBmb3JjZURyYXcsIGZhbHNlLCAhc2VsZi5vcHRpb25zLmhpZGVUaWNrc09uQXV0b21hdGljU2Nyb2xsKTtcblxuICAgICAgICBpZiAocmVhbE1vdmVbMl0gfHwgcmVhbE1vdmVbM10pIHtcbiAgICAgICAgICAgIHVwZGF0ZVRyYW5zZm9ybShmb3JjZURyYXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudFN0YXJ0WCAtPSByZWFsTW92ZVsyXTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WSAtPSByZWFsTW92ZVszXTtcblxuICAgICAgICBuZWVkVGltZXJTdG9wID0gcmVhbE1vdmVbMl0gPT09IDAgJiYgcmVhbE1vdmVbM10gPT09IDA7XG4gICAgfVxuXG5cbiAgICB2YXIgZHJhZyA9IGVsZW1lbnQuX2RyYWcgPSBkMy5iZWhhdmlvci5kcmFnKCk7XG5cbiAgICBkcmFnXG4gICAgICAgIC5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICBpZiAoZGF0YS5fZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCkge1xuICAgICAgICAgICAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQud2hpY2ggIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhcnREcmFnUG9zaXRpb24gPSBkcmFnUG9zaXRpb24gPSBkMy5tb3VzZShib2R5Tm9kZSk7XG5cbiAgICAgICAgICAgIHN0YXJ0VGltZSA9ICtuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICBzdG9yZVN0YXJ0KCk7XG5cbiAgICAgICAgICAgIGRhdGEuX2RlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5fZnJvemVuVWlkcy5wdXNoKGRhdGEudWlkKTtcblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2RyYWcnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIGlmICghZGF0YS5fZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZHJhZ1Bvc2l0aW9uID0gZDMubW91c2UoYm9keU5vZGUpO1xuXG4gICAgICAgICAgICBpZiAoIWRyYWdTdGFydGVkKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGltZURlbHRhID0gK25ldyBEYXRlKCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsRGVsdGFYID0gZHJhZ1Bvc2l0aW9uWzBdIC0gc3RhcnREcmFnUG9zaXRpb25bMF07XG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsRGVsdGFZID0gZHJhZ1Bvc2l0aW9uWzFdIC0gc3RhcnREcmFnUG9zaXRpb25bMV07XG4gICAgICAgICAgICAgICAgdmFyIGRyYWdEaXN0YW5jZSA9IE1hdGguc3FydCh0b3RhbERlbHRhWCp0b3RhbERlbHRhWCt0b3RhbERlbHRhWSp0b3RhbERlbHRhWSk7XG5cbiAgICAgICAgICAgICAgICBkcmFnU3RhcnRlZCA9ICh0aW1lRGVsdGEgPiBzZWxmLm9wdGlvbnMubWF4aW11bUNsaWNrRHJhZ1RpbWUgfHwgZHJhZ0Rpc3RhbmNlID4gc2VsZi5vcHRpb25zLm1heGltdW1DbGlja0RyYWdEaXN0YW5jZSkgJiYgZHJhZ0Rpc3RhbmNlID4gc2VsZi5vcHRpb25zLm1pbmltdW1EcmFnRGlzdGFuY2U7XG5cbiAgICAgICAgICAgICAgICBpZiAoZHJhZ1N0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnc3RhcnQnLCBzZWxlY3Rpb24sIG51bGwsIFtkYXRhXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZHJhZ1N0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OmRyYWcnLCBzZWxlY3Rpb24sIG51bGwsIFtkYXRhXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBtYXJnaW5EZWx0YSA9IHNlbGYub3B0aW9ucy5hdXRvbWF0aWNTY3JvbGxNYXJnaW5EZWx0YTtcbiAgICAgICAgICAgIHZhciBkUmlnaHQgPSBtYXJnaW5EZWx0YSAtIChzZWxmLmRpbWVuc2lvbnMud2lkdGggLSBkcmFnUG9zaXRpb25bMF0pO1xuICAgICAgICAgICAgdmFyIGRMZWZ0ID0gbWFyZ2luRGVsdGEgLSBkcmFnUG9zaXRpb25bMF07XG4gICAgICAgICAgICB2YXIgZEJvdHRvbSA9IG1hcmdpbkRlbHRhIC0gKHNlbGYuZGltZW5zaW9ucy5oZWlnaHQgLSBkcmFnUG9zaXRpb25bMV0pO1xuICAgICAgICAgICAgdmFyIGRUb3AgPSBtYXJnaW5EZWx0YSAtIGRyYWdQb3NpdGlvblsxXTtcblxuICAgICAgICAgICAgaG9yaXpvbnRhbFNwZWVkID0gTWF0aC5wb3coTWF0aC5tYXgoZFJpZ2h0LCBkTGVmdCwgbWFyZ2luRGVsdGEpLCAyKTtcbiAgICAgICAgICAgIHZlcnRpY2FsU3BlZWQgPSBNYXRoLnBvdyhNYXRoLm1heChkQm90dG9tLCBkVG9wLCBtYXJnaW5EZWx0YSksIDIpO1xuXG4gICAgICAgICAgICB2YXIgcHJldmlvdXNIb3Jpem9udGFsTW92ZSA9IGhvcml6b250YWxNb3ZlO1xuICAgICAgICAgICAgdmFyIHByZXZpb3VzVmVydGljYWxNb3ZlID0gdmVydGljYWxNb3ZlO1xuICAgICAgICAgICAgaG9yaXpvbnRhbE1vdmUgPSBkUmlnaHQgPiAwID8gLTEgOiBkTGVmdCA+IDAgPyAxIDogMDtcbiAgICAgICAgICAgIHZlcnRpY2FsTW92ZSA9IGRCb3R0b20gPiAwID8gLTEgOiBkVG9wID4gMCA/IDEgOiAwO1xuXG4gICAgICAgICAgICB2YXIgaGFzQ2hhbmdlZFN0YXRlID0gcHJldmlvdXNIb3Jpem9udGFsTW92ZSAhPT0gaG9yaXpvbnRhbE1vdmUgfHwgcHJldmlvdXNWZXJ0aWNhbE1vdmUgIT09IHZlcnRpY2FsTW92ZTtcblxuICAgICAgICAgICAgaWYgKChob3Jpem9udGFsTW92ZSB8fCB2ZXJ0aWNhbE1vdmUpICYmICF0aW1lckFjdGl2ZSAmJiBoYXNDaGFuZ2VkU3RhdGUpIHtcblxuICAgICAgICAgICAgICAgIHZhciB0aW1lclN0YXJ0VGltZSA9IGdldFByZWNpc2VUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICB0aW1lckFjdGl2ZSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBkMy50aW1lcihmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFRpbWUgPSBnZXRQcmVjaXNlVGltZSgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZURlbHRhID0gY3VycmVudFRpbWUgLSB0aW1lclN0YXJ0VGltZTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZXJXaWxsU3RvcCA9ICF2ZXJ0aWNhbE1vdmUgJiYgIWhvcml6b250YWxNb3ZlIHx8IG5lZWRUaW1lclN0b3A7XG5cbiAgICAgICAgICAgICAgICAgICAgZG9BdXRvbWF0aWNTY3JvbGwodGltZURlbHRhLCBzZWxmLm9wdGlvbnMucmVuZGVyT25BdXRvbWF0aWNTY3JvbGxJZGxlICYmIHRpbWVyV2lsbFN0b3ApO1xuXG4gICAgICAgICAgICAgICAgICAgIHRpbWVyU3RhcnRUaW1lID0gY3VycmVudFRpbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVyV2lsbFN0b3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lZWRUaW1lclN0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVyQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZXJXaWxsU3RvcDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNlbGYuX2RyYWdBRikge1xuICAgICAgICAgICAgICAgIHNlbGYuY2FuY2VsQW5pbWF0aW9uRnJhbWUoc2VsZi5fZHJhZ0FGKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5fZHJhZ0FGID0gc2VsZi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlVHJhbnNmb3JtKTtcblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2RyYWdlbmQnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIGlmICghZGF0YS5fZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5jYW5jZWxBbmltYXRpb25GcmFtZShzZWxmLl9kcmFnQUYpO1xuICAgICAgICAgICAgc2VsZi5fZHJhZ0FGID0gbnVsbDtcbiAgICAgICAgICAgIGhvcml6b250YWxNb3ZlID0gMDtcbiAgICAgICAgICAgIHZlcnRpY2FsTW92ZSA9IDA7XG5cbiAgICAgICAgICAgIGRhdGEuX2RlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHNlbGYuX2Zyb3plblVpZHMuc3BsaWNlKHNlbGYuX2Zyb3plblVpZHMuaW5kZXhPZihkYXRhLnVpZCksIDEpO1xuXG4gICAgICAgICAgICB2YXIgZGVsdGFGcm9tVG9wTGVmdENvcm5lciA9IGQzLm1vdXNlKHNlbGVjdGlvbi5ub2RlKCkpO1xuICAgICAgICAgICAgdmFyIGhhbGZIZWlnaHQgPSBzZWxmLm9wdGlvbnMucm93SGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG5cbiAgICAgICAgICAgIGlmIChkcmFnU3RhcnRlZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6ZHJhZ2VuZCcsIHNlbGVjdGlvbiwgWy1kZWx0YUZyb21Ub3BMZWZ0Q29ybmVyWzBdLCAtZGVsdGFGcm9tVG9wTGVmdENvcm5lclsxXSArIGhhbGZIZWlnaHRdLCBbZGF0YV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24uYXR0cigndHJhbnNmb3JtJywgb3JpZ2luVHJhbnNmb3JtU3RyaW5nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZlxuICAgICAgICAgICAgICAgIC51cGRhdGVZKClcbiAgICAgICAgICAgICAgICAuZHJhd1lBeGlzKCk7XG5cbiAgICAgICAgICAgIGRyYWdTdGFydGVkID0gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgc2VsZWN0aW9uLmNhbGwoZHJhZyk7XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEQzQmxvY2tUYWJsZTtcbiIsIi8qIGdsb2JhbCBjYW5jZWxBbmltYXRpb25GcmFtZSwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMvZXZlbnRzJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5cbnZhciBkM1RpbWVsaW5lID0ge307XG5cblxuLyoqXG4gKiBBbiBpbnN0YW5jZSBvZiBEM1RhYmxlIHVzZXMgZDMuanMgdG8gYnVpbGQgYSBzdmcgZ3JpZCB3aXRoIGF4aXNlcy5cbiAqIFlvdSBzZXQgYSBkYXRhIHNldCB3aXRoIHtAbGluayBkM1RpbWVsaW5lLkQzVGFibGUuc2V0RGF0YX0uXG4gKiBFYWNoIGdyb3VwIG9mIGVsZW1lbnQge0BsaW5rIGQzVGltZWxpbmUuRDNUYWJsZVJvd30gaXMgZHJhd24gaW4gcm93cyAoeSBheGlzKVxuICogYW5kIGVhY2ggZWxlbWVudCB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gb2YgYSByb3cgaXMgZHJhd24gaW4gdGhpcyByb3dcbiAqIFRoZXJlIGlzIG5vIGdyYXBoaWNhbCBlbGVtZW50IGZvciByb3dzLlxuICpcbiAqIFRoZSBwcm92aWRlZCBuZXN0ZWQgZGF0YSBzZXQgaXMgZmlyc3QgZmxhdHRlbmVkIHRvIGVuYWJsZSB0cmFuc2l0aW9uIGJldHdlZW4gZGlmZmVyZW50cyByb3dzLlxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlT3B0aW9uc30gb3B0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmQzVGltZWxpbmUuRDNUYWJsZSA9IGZ1bmN0aW9uIEQzVGFibGUob3B0aW9ucykge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICBEM1RhYmxlLmluc3RhbmNlc0NvdW50ICs9IDE7XG5cbiAgICB0aGlzLmluc3RhbmNlTnVtYmVyID0gRDNUYWJsZS5pbnN0YW5jZXNDb3VudDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGVPcHRpb25zfVxuICAgICAqL1xuICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZCh0cnVlLCB7fSwgdGhpcy5kZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXk8RDNUYWJsZVJvdz59XG4gICAgICovXG4gICAgdGhpcy5kYXRhID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7QXJyYXk8RDNUYWJsZUVsZW1lbnQ+fVxuICAgICAqL1xuICAgIHRoaXMuZmxhdHRlbmVkRGF0YSA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge3t0b3A6IG51bWJlciwgcmlnaHQ6IG51bWJlciwgYm90dG9tOiBudW1iZXIsIGxlZnQ6IG51bWJlcn19XG4gICAgICovXG4gICAgdGhpcy5tYXJnaW4gPSB7XG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgbGVmdDogMFxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfX1cbiAgICAgKi9cbiAgICB0aGlzLmRpbWVuc2lvbnMgPSB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtudW1iZXJbXX1cbiAgICAgKi9cbiAgICB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gWzAuMCwgMC4wXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtkMy5TZWxlY3Rpb259XG4gICAgICovXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge3tcbiAgICAgKiAgYm9keTogZDMuU2VsZWN0aW9uLFxuICAgICAqICBpbm5lckNvbnRhaW5lcjogZDMuU2VsZWN0aW9uLFxuICAgICAqICB4QXhpc0NvbnRhaW5lcjogZDMuU2VsZWN0aW9uLFxuICAgICAqICB4MkF4aXNDb250YWluZXI6IGQzLlNlbGVjdGlvbixcbiAgICAgKiAgeUF4aXNDb250YWluZXI6IGQzLlNlbGVjdGlvbixcbiAgICAgKiAgZGVmczogZDMuU2VsZWN0aW9uLFxuICAgICAqICBjbGlwOiBkMy5TZWxlY3Rpb25cbiAgICAgKiB9fVxuICAgICAqL1xuICAgIHRoaXMuZWxlbWVudHMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHt7XG4gICAgICogIHg6IGQzLnNjYWxlLkxpbmVhcixcbiAgICAgKiAgeTogZDMuc2NhbGUuTGluZWFyXG4gICAgICogfX1cbiAgICAgKi9cbiAgICB0aGlzLnNjYWxlcyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge3tcbiAgICAgKiAgeDogZDMuc3ZnLkF4aXMsXG4gICAgICogIHgyOiBkMy5zdmcuQXhpcyxcbiAgICAgKiAgeTogZDMuc3ZnLkF4aXNcbiAgICAgKiB9fVxuICAgICAqL1xuICAgIHRoaXMuYXhpc2VzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7e1xuICAgICAqICB6b29tOiBkMy5iZWhhdmlvci5ab29tLFxuICAgICAqICB6b29tWDogZDMuYmVoYXZpb3IuWm9vbSxcbiAgICAgKiAgem9vbVk6IGQzLmJlaGF2aW9yLlpvb20sXG4gICAgICogIHBhbjogZDMuYmVoYXZpb3IuRHJhZ1xuICAgICAqIH19XG4gICAgICovXG4gICAgdGhpcy5iZWhhdmlvcnMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtbTnVtYmVyLCBOdW1iZXJdfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7W051bWJlciwgTnVtYmVyXX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2xhc3RTY2FsZSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5feVNjYWxlID0gMC4wO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2RhdGFDaGFuZ2VDb3VudCA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID0gMDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGggPSAwO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQgPSAwO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9wcmV2ZW50RHJhd2luZyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0FycmF5PEZ1bmN0aW9uPn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fbWF4Qm9keUhlaWdodCA9IEluZmluaXR5O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0FycmF5PE51bWJlcnxTdHJpbmc+fVxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICB0aGlzLl9mcm96ZW5VaWRzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3ByZXZlbnRFdmVudEVtaXNzaW9uID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2Rpc2FibGVkID0gZmFsc2U7XG59O1xuXG52YXIgRDNUYWJsZSA9IGQzVGltZWxpbmUuRDNUYWJsZTtcblxuaW5oZXJpdHMoRDNUYWJsZSwgRXZlbnRFbWl0dGVyKTtcblxuLyoqXG4gKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlT3B0aW9uc31cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMgPSB7XG4gICAgYmVtQmxvY2tOYW1lOiAndGFibGUnLFxuICAgIGJlbUJsb2NrTW9kaWZpZXI6ICcnLFxuICAgIHhBeGlzSGVpZ2h0OiA1MCxcbiAgICB5QXhpc1dpZHRoOiA1MCxcbiAgICByb3dIZWlnaHQ6IDMwLFxuICAgIHJvd1BhZGRpbmc6IDUsXG4gICAgdGlja1BhZGRpbmc6IDIwLFxuICAgIGNvbnRhaW5lcjogJ2JvZHknLFxuICAgIGN1bGxpbmdYOiB0cnVlLFxuICAgIGN1bGxpbmdZOiB0cnVlLFxuICAgIGN1bGxpbmdEaXN0YW5jZTogMSxcbiAgICByZW5kZXJPbklkbGU6IHRydWUsXG4gICAgaGlkZVRpY2tzT25ab29tOiBmYWxzZSxcbiAgICBoaWRlVGlja3NPbkRyYWc6IGZhbHNlLFxuICAgIHBhbllPbldoZWVsOiB0cnVlLFxuICAgIHdoZWVsTXVsdGlwbGllcjogMSxcbiAgICBlbmFibGVZVHJhbnNpdGlvbjogdHJ1ZSxcbiAgICBlbmFibGVUcmFuc2l0aW9uT25FeGl0OiB0cnVlLFxuICAgIHVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybTogZmFsc2UsXG4gICAgdHJhbnNpdGlvbkVhc2luZzogJ3F1YWQtaW4tb3V0JyxcbiAgICB4QXhpc1RpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkO1xuICAgIH0sXG4gICAgeEF4aXNTdHJva2VXaWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCUyID8gMSA6IDI7XG4gICAgfSxcbiAgICB4QXhpczJUaWNrc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfSxcbiAgICB5QXhpc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCAmJiBkLm5hbWUgfHwgJyc7XG4gICAgfSxcbiAgICBwYWRkaW5nOiAxMCxcbiAgICB0cmFja2VkRE9NRXZlbnRzOiBbJ2NsaWNrJywgJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnLCAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJ10gLy8gbm90IGR5bmFtaWNcbn07XG5cbi8qKlxuICogQHR5cGUge251bWJlcn1cbiAqL1xuRDNUYWJsZS5pbnN0YW5jZXNDb3VudCA9IDA7XG5cbi8qKlxuICogTm9vcCBmdW5jdGlvbiwgd2hpY2ggZG9lcyBub3RoaW5nXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLm5vb3AgPSBmdW5jdGlvbigpIHt9O1xuXG4vKipcbiAqIEluaXRpYWxpemF0aW9uIG1ldGhvZFxuICogIC0gY3JlYXRlIHRoZSBlbGVtZW50c1xuICogIC0gaW5zdGFudGlhdGUgZDMgaW5zdGFuY2VzXG4gKiAgLSByZWdpc3RlciBsaXN0ZW5lcnNcbiAqXG4gKiBEYXRhIHdpbGwgYmUgZHJhd24gaW4gdGhlIGlubmVyIGNvbnRhaW5lclxuICpcbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIGNvbnRhaW5lclxuICAgIHRoaXMuY29udGFpbmVyID0gZDMuc2VsZWN0KHRoaXMub3B0aW9ucy5jb250YWluZXIpLmFwcGVuZCgnc3ZnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICh0aGlzLm9wdGlvbnMuYmVtQmxvY2tNb2RpZmllciA/ICcgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tNb2RpZmllciA6ICcnKSk7XG5cblxuICAgIC8vIGRlZnMgYW5kIGNsaXAgaW4gZGVmc1xuICAgIHRoaXMuZWxlbWVudHMuZGVmcyA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZGVmcycpO1xuXG4gICAgdmFyIGNsaXBJZCA9IHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvZHlDbGlwUGF0aC0tJyArIEQzVGFibGUuaW5zdGFuY2VzQ291bnQ7XG4gICAgdGhpcy5lbGVtZW50cy5jbGlwID0gdGhpcy5lbGVtZW50cy5kZWZzLmFwcGVuZCgnY2xpcFBhdGgnKVxuICAgICAgICAucHJvcGVydHkoJ2lkJywgY2xpcElkKTtcbiAgICB0aGlzLmVsZW1lbnRzLmNsaXBcbiAgICAgICAgLmFwcGVuZCgncmVjdCcpO1xuXG5cbiAgICAvLyBiYWNrZ3JvdW5kIHJlY3QgaW4gY29udGFpbmVyXG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnLCB0cnVlKTtcblxuXG4gICAgLy8gYXhpc2VzIGNvbnRhaW5lcnMgaW4gY29udGFpbmVyXG4gICAgdGhpcy5lbGVtZW50cy54QXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXgnKTtcblxuICAgIHRoaXMuZWxlbWVudHMueDJBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teCAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0tc2Vjb25kYXJ5Jyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyID0gdGhpcy5jb250YWluZXIuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYXhpcy0teScpO1xuXG5cbiAgICAvLyBib2R5IGluIGNvbnRhaW5lclxuICAgIHRoaXMuZWxlbWVudHMuYm9keSA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCMnICsgY2xpcElkICsgJyknKTtcblxuXG4gICAgLy8gY29udGFjdCByZWN0LCBpbm5lciBjb250YWluZXIgYW5kIGJvdW5kaW5nIHJlY3QgaW4gYm9keVxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuY2xhc3NlZCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcsIHRydWUpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5pbm5lckNvbnRhaW5lciA9IHRoaXMuZWxlbWVudHMuYm9keS5hcHBlbmQoJ2cnKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuY2xhc3NlZCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1ib3VuZGluZ1JlY3QnLCB0cnVlKTtcblxuXG4gICAgdGhpcy51cGRhdGVNYXJnaW5zKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVEM0luc3RhbmNlcygpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplRXZlbnRMaXN0ZW5lcnMoKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEZXN0cm95IGZ1bmN0aW9uLCB0byBiZSBjYWxsZWQgd2hlbiB0aGUgaW5zdGFuY2UgaGFzIHRvIGJlIGRlc3Ryb3llZFxuICogQHRvZG8gZW5zdXJlIG5vIG1lbW9yeSBsZWFrIHdpdGggdGhpcyBkZXN0cm95IGltcGxlbWVudGF0aW9uLCBlc3BhY2lhbGx5IHdpdGggZG9tIGV2ZW50IGxpc3RlbmVyc1xuICovXG5EM1RhYmxlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6ZGVzdHJveScsIHRoaXMpO1xuXG4gICAgLy8gcmVtb3ZlIGJlaGF2aW9yIGxpc3RlbmVyc1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20ub24oJ3pvb20nLCBudWxsKTtcblxuICAgIC8vIHJlbW92ZSBkb20gbGlzdGVuZXJzXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5Lm9uKCcuem9vbScsIG51bGwpO1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5vbignY2xpY2snLCBudWxsKTtcblxuICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZSgpO1xuXG4gICAgLy8gcmVtb3ZlIHJlZmVyZW5jZXNcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5lbGVtZW50cyA9IG51bGw7XG4gICAgdGhpcy5zY2FsZXMgPSBudWxsO1xuICAgIHRoaXMuYXhpc2VzID0gbnVsbDtcbiAgICB0aGlzLmJlaGF2aW9ycyA9IG51bGw7XG4gICAgdGhpcy5kYXRhID0gbnVsbDtcbiAgICB0aGlzLmZsYXR0ZW5lZERhdGEgPSBudWxsO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOmRlc3Ryb3llZCcsIHRoaXMpO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGQzIGluc3RhbmNlcyAoc2NhbGVzLCBheGlzZXMsIGJlaGF2aW9ycylcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaW5pdGlhbGl6ZUQzSW5zdGFuY2VzID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cblxuICAgIC8vIHNjYWxlc1xuXG4gICAgdGhpcy5zY2FsZXMueCA9IHRoaXMueFNjYWxlRmFjdG9yeSgpO1xuXG4gICAgdGhpcy5zY2FsZXMueSA9IHRoaXMueVNjYWxlRmFjdG9yeSgpO1xuXG5cbiAgICAvLyBheGlzZXNcblxuICAgIHRoaXMuYXhpc2VzLnggPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy54KVxuICAgICAgICAub3JpZW50KCd0b3AnKVxuICAgICAgICAudGlja0Zvcm1hdCh0aGlzLm9wdGlvbnMueEF4aXNUaWNrc0Zvcm1hdHRlci5iaW5kKHRoaXMpKVxuICAgICAgICAub3V0ZXJUaWNrU2l6ZSgwKVxuICAgICAgICAudGlja1BhZGRpbmcodGhpcy5vcHRpb25zLnRpY2tQYWRkaW5nKTtcblxuICAgIHRoaXMuYXhpc2VzLngyID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAuc2NhbGUodGhpcy5zY2FsZXMueClcbiAgICAgICAgLm9yaWVudCgndG9wJylcbiAgICAgICAgLnRpY2tGb3JtYXQodGhpcy5vcHRpb25zLnhBeGlzMlRpY2tzRm9ybWF0dGVyLmJpbmQodGhpcykpXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApXG4gICAgICAgIC5pbm5lclRpY2tTaXplKDApO1xuXG4gICAgdGhpcy5heGlzZXMueSA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgLnNjYWxlKHRoaXMuc2NhbGVzLnkpXG4gICAgICAgIC5vcmllbnQoJ2xlZnQnKVxuICAgICAgICAudGlja0Zvcm1hdChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5vcHRpb25zLnlBeGlzRm9ybWF0dGVyLmNhbGwoc2VsZiwgc2VsZi5kYXRhWyhkfDApXSwgZCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApO1xuXG5cbiAgICAvLyBiZWhhdmlvcnNcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20gPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pXG4gICAgICAgIC5vbignem9vbScsIHRoaXMuaGFuZGxlWm9vbWluZy5iaW5kKHRoaXMpKVxuICAgICAgICAub24oJ3pvb21lbmQnLCB0aGlzLmhhbmRsZVpvb21pbmdFbmQuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWCA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAueCh0aGlzLnNjYWxlcy54KVxuICAgICAgICAuc2NhbGUoMSlcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkgPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAgICAgLnkodGhpcy5zY2FsZXMueSlcbiAgICAgICAgLnNjYWxlKDEpXG4gICAgICAgIC5zY2FsZUV4dGVudChbMSwgMV0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMucGFuID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgIC5vbignZHJhZycsIHRoaXMuaGFuZGxlRHJhZ2dpbmcuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuY2FsbCh0aGlzLmJlaGF2aW9ycy5wYW4pO1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5jYWxsKHRoaXMuYmVoYXZpb3JzLnpvb20pO1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdGhpcy5fbGFzdFNjYWxlID0gdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpO1xufTtcblxuLyoqXG4gKiB4IHNjYWxlIGZhY3RvcnlcbiAqIEByZXR1cm5zIHtkMy5zY2FsZS5MaW5lYXJ9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnhTY2FsZUZhY3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUubGluZWFyKCk7XG59O1xuXG4vKipcbiAqIHkgc2NhbGUgZmFjdG9yeVxuICogQHJldHVybnMge2QzLnNjYWxlLkxpbmVhcn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUueVNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKTtcbn07XG5cblxuLyoqXG4gKiBJbml0aWFsaXplIGV2ZW50IGxpc3RlbmVycyBmb3IgYWxsIHRyYWNrZWQgRE9NIGV2ZW50c1xuICovXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMub3B0aW9ucy50cmFja2VkRE9NRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnROYW1lKSB7XG5cbiAgICAgICAgc2VsZi5lbGVtZW50cy5ib2R5Lm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnROYW1lICE9PSAnY2xpY2snIHx8ICFkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkICYmIGQzLnNlbGVjdChkMy5ldmVudC50YXJnZXQpLmNsYXNzZWQoc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoZXZlbnROYW1lLCBzZWxmLmVsZW1lbnRzLmJvZHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59O1xuXG5cbi8qKlxuICogUGFuIFgvWSAmIHpvb20gWCAoY2xhbXBlZCBwYW4gWSB3aGVuIHdoZWVsIGlzIHByZXNzZWQgd2l0aG91dCBjdHJsLCB6b29tIFggYW5kIHBhbiBYL1kgb3RoZXJ3aXNlKVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVab29taW5nID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBpZiBub3QgY3RybEtleSBhbmQgbm90IHRvdWNoZXMgPj0gMlxuICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudCAmJiAhZDMuZXZlbnQuc291cmNlRXZlbnQuY3RybEtleSAmJiAhKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNoYW5nZWRUb3VjaGVzICYmIGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aCA+PSAyKSkge1xuXG4gICAgICAgIC8vIGlmIHdoZWVsaW5nLCBhdm9pZCB6b29taW5nIGFuZCBsZXQgdGhlIHdoZWVsaW5nIGhhbmRsZXIgcGFuXG4gICAgICAgIGlmIChkMy5ldmVudC5zb3VyY2VFdmVudC50eXBlID09PSAnd2hlZWwnKSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFuWU9uV2hlZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RvcmVab29tKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVXaGVlbGluZygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIC8vIGVsc2UgYXZvaWQgem9vbWluZyBhbmQgcmV0dXJuICh0aGUgdXNlciBnZXN0dXJlIHdpbGwgYmUgaGFuZGxlZCBieSB0aGUgdGhlIHBhbiBiZWhhdmlvclxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVzdG9yZVpvb20oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB0cmFuc2xhdGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpO1xuICAgIHZhciB1cGRhdGVkVHJhbnNsYXRlID0gW3RyYW5zbGF0ZVswXSwgdGhpcy5fbGFzdFRyYW5zbGF0ZVsxXV07XG5cbiAgICB1cGRhdGVkVHJhbnNsYXRlID0gdGhpcy5fY2xhbXBUcmFuc2xhdGlvbldpdGhTY2FsZSh1cGRhdGVkVHJhbnNsYXRlLCBbdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpLCB0aGlzLmJlaGF2aW9ycy56b29tWS5zY2FsZSgpXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSh1cGRhdGVkVHJhbnNsYXRlKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC50cmFuc2xhdGUodXBkYXRlZFRyYW5zbGF0ZSk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVguc2NhbGUodGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpKTtcblxuICAgIHRoaXMubW92ZUVsZW1lbnRzKHRydWUsIGZhbHNlLCAhdGhpcy5vcHRpb25zLmhpZGVUaWNrc09uWm9vbSk7XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gdXBkYXRlZFRyYW5zbGF0ZTtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCk7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW92ZScpO1xuXG59O1xuXG4vKipcbiAqIEZvcmNlIGRyYXdpbmcgZWxlbWVudHMsIG51bGxpZnkgb3B0aW1pemVkIGlubmVyIGNvbnRhaW5lciB0cmFuc2Zvcm0gYW5kIHJlZHJhdyBheGlzZXNcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlWm9vbWluZ0VuZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLmF0dHIoJ3RyYW5zZm9ybScsIG51bGwpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdG9wRWxlbWVudFRyYW5zaXRpb24oKTtcbiAgICB0aGlzLm1vdmVFbGVtZW50cyh0cnVlKTtcbiAgICB0aGlzLmRyYXdZQXhpcygpO1xuICAgIHRoaXMuZHJhd1hBeGlzKCk7XG59O1xuXG4vKipcbiAqIENsYW1wZWQgcGFuIFlcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuaGFuZGxlV2hlZWxpbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBldmVudCA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50O1xuXG4gICAgdmFyIGRlbHRhWCA9IDAsIGRlbHRhWSA9IDA7XG5cbiAgICB2YXIgbW92aW5nWCA9IGV2ZW50ICYmIGV2ZW50LndoZWVsRGVsdGFYIHx8IGV2ZW50LmRlbHRhWDtcblxuICAgIC8vIGlmIG1vdmluZyB4LCBpZ25vcmUgeSBhbmQgY29tcHV0ZSB4IGRlbHRhXG4gICAgaWYgKG1vdmluZ1gpIHtcblxuICAgICAgICB2YXIgbW92aW5nUmlnaHQgPSBldmVudC53aGVlbERlbHRhWCA+IDAgfHwgZXZlbnQuZGVsdGFYIDwgMDtcbiAgICAgICAgZGVsdGFYID0gKG1vdmluZ1JpZ2h0ID8gMSA6IC0xKSAqIHRoaXMuY29sdW1uV2lkdGggKiB0aGlzLm9wdGlvbnMud2hlZWxNdWx0aXBsaWVyO1xuXG4gICAgfVxuICAgIC8vIGlmIG5vdCBtb3ZpbmcgeFxuICAgIGVsc2Uge1xuXG4gICAgICAgIHZhciBtb3ZpbmdZID0gZXZlbnQud2hlZWxEZWx0YSB8fCBldmVudC53aGVlbERlbHRhWSB8fCBldmVudC5kZXRhaWwgfHwgZXZlbnQuZGVsdGFZO1xuXG4gICAgICAgIC8vIGlmIG1vdmluZyB5LCBjb21wdXRlIHkgZGVsdGFcbiAgICAgICAgaWYgKG1vdmluZ1kpIHtcbiAgICAgICAgICAgIHZhciBtb3ZpbmdEb3duID0gZXZlbnQud2hlZWxEZWx0YSA+IDAgfHwgZXZlbnQud2hlZWxEZWx0YVkgPiAwIHx8IGV2ZW50LmRldGFpbCA8IDAgfHwgZXZlbnQuZGVsdGFZIDwgMDtcbiAgICAgICAgICAgIGRlbHRhWSA9IG1vdmluZ1kgPyAobW92aW5nRG93biA/IDEgOiAtMSkgKiB0aGlzLm9wdGlvbnMucm93SGVpZ2h0ICogdGhpcy5vcHRpb25zLndoZWVsTXVsdGlwbGllciA6IDA7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8vIGZpbmFsbHkgbW92ZSB0aGUgZWxlbWVudHNcbiAgICB0aGlzLm1vdmUoZGVsdGFYLCBkZWx0YVksIGZhbHNlLCAhbW92aW5nWCwgdHJ1ZSk7XG5cbn07XG5cbi8qKlxuICogRGlyZWN0bHkgdXNlIGV2ZW50IHggYW5kIHkgZGVsdGEgdG8gbW92ZSBlbGVtZW50c1xuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVEcmFnZ2luZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gaWYgbW9yZSB0aGFuIDIgdG91Y2hlcywgcmV0dXJuXG4gICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnRvdWNoZXMgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQudG91Y2hlcy5sZW5ndGggPj0gMikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tb3ZlKGQzLmV2ZW50LmR4LCBkMy5ldmVudC5keSwgZmFsc2UsIGZhbHNlLCAhdGhpcy5vcHRpb25zLmhpZGVUaWNrc09uRHJhZyk7XG59O1xuXG4vKipcbiAqIFJlc3RvcmUgcHJldmlvdXMgem9vbSB0cmFuc2xhdGUgYW5kIHNjYWxlIHRodXMgY2FuY2VsbGluZyB0aGUgem9vbSBiZWhhdmlvciBoYW5kbGluZ1xuICovXG5EM1RhYmxlLnByb3RvdHlwZS5yZXN0b3JlWm9vbSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHRoaXMuX2xhc3RUcmFuc2xhdGUpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUodGhpcy5fbGFzdFNjYWxlKTtcbn07XG5cbi8qKlxuICogRmlyZSBhbiBldmVudCBldmVudCB3aXRoIHRoZSBnaXZlbiBldmVudE5hbWUgcHJlZml4ZWQgd2l0aCB0aGUgYmVtIGJsb2NrIG5hbWVcbiAqIFRoZSBmb2xsb3dpbmcgYXJndW1lbnRzIGFyZSBwYXNzZWQgdG8gdGhlIGxpc3RlbmVyczpcbiAqICAtIC4uLnByaW9yaXR5QXJndW1lbnRzXG4gKiAgLSB0aGlzOiB0aGUgRDNUYWJsZSBpbnN0YW5jZVxuICogIC0gZDNUYXJnZXRTZWxlY3Rpb25cbiAqICAtIGQzLmV2ZW50XG4gKiAgLSBnZXRDb2x1bW4oKTogYSBmdW5jdGlvbiB0byBnZXQgdGhlIHggdmFsdWUgaW4gZGF0YSBzcGFjZVxuICogIC0gZ2V0Um93KCk6IGEgZnVuY3Rpb24gdG8gZ2V0IHRoZSB5IHZhbHVlIGluIGRhdGEgc3BhY2VcbiAqICAtIC4uLmV4dHJhQXJndW1lbnRzXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IFtkM1RhcmdldFNlbGVjdGlvbl1cbiAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfSBbZGVsdGFdXG4gKiBAcGFyYW0ge0FycmF5PCo+fSBbcHJpb3JpdHlBcmd1bWVudHNdXG4gKiBAcGFyYW0ge0FycmF5PCo+fSBbZXh0cmFBcmd1bWVudHNdXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmVtaXREZXRhaWxlZEV2ZW50ID0gZnVuY3Rpb24oZXZlbnROYW1lLCBkM1RhcmdldFNlbGVjdGlvbiwgZGVsdGEsIHByaW9yaXR5QXJndW1lbnRzLCBleHRyYUFyZ3VtZW50cykge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnRFdmVudEVtaXNzaW9uKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcG9zaXRpb247XG5cbiAgICB2YXIgZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFwb3NpdGlvbikge1xuICAgICAgICAgICAgcG9zaXRpb24gPSBkMy5tb3VzZShzZWxmLmVsZW1lbnRzLmJvZHkubm9kZSgpKTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRlbHRhKSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uWzBdICs9IGRlbHRhWzBdO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uWzFdICs9IGRlbHRhWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9O1xuXG4gICAgdmFyIGFyZ3MgPSBbXG4gICAgICAgIHRoaXMsIC8vIHRoZSB0YWJsZSBpbnN0YW5jZVxuICAgICAgICBkM1RhcmdldFNlbGVjdGlvbiwgLy8gdGhlIGQzIHNlbGVjdGlvbiB0YXJnZXRlZFxuICAgICAgICBkMy5ldmVudCwgLy8gdGhlIGQzIGV2ZW50XG4gICAgICAgIGZ1bmN0aW9uIGdldENvbHVtbigpIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IGdldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5zY2FsZXMueC5pbnZlcnQocG9zaXRpb25bMF0pO1xuICAgICAgICB9LCAvLyBhIGNvbHVtbiBnZXR0ZXJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Um93KCkge1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy55LmludmVydChwb3NpdGlvblsxXSk7XG4gICAgICAgIH0gLy8gYSByb3cgZ2V0dGVyXG4gICAgXTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KHByaW9yaXR5QXJndW1lbnRzKSkge1xuICAgICAgICBhcmdzID0gcHJpb3JpdHlBcmd1bWVudHMuY29uY2F0KGFyZ3MpO1xuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGV4dHJhQXJndW1lbnRzKSkge1xuICAgICAgICBhcmdzID0gYXJncy5jb25jYXQoZXh0cmFBcmd1bWVudHMpO1xuICAgIH1cblxuICAgIGFyZ3MudW5zaGlmdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzonICsgZXZlbnROYW1lKTsgLy8gdGhlIGV2ZW50IG5hbWVcblxuICAgIHRoaXMuZW1pdC5hcHBseSh0aGlzLCBhcmdzKTtcbn07XG5cbi8qKlxuICogVXBkYXRlIG1hcmdpbnMgYW5kIHVwZGF0ZSB0cmFuc2Zvcm1zXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBbdXBkYXRlRGltZW5zaW9uc10gVHJ1ZSBtZWFucyBpdCBoYXMgdG8gdXBkYXRlIFggYW5kIFlcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlTWFyZ2lucyA9IGZ1bmN0aW9uKHVwZGF0ZURpbWVuc2lvbnMpIHtcblxuICAgIHRoaXMubWFyZ2luID0ge1xuICAgICAgICB0b3A6IHRoaXMub3B0aW9ucy54QXhpc0hlaWdodCArIHRoaXMub3B0aW9ucy5wYWRkaW5nLFxuICAgICAgICByaWdodDogdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIGJvdHRvbTogdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIGxlZnQ6IHRoaXMub3B0aW9ucy55QXhpc1dpZHRoICsgdGhpcy5vcHRpb25zLnBhZGRpbmdcbiAgICB9O1xuXG4gICAgdmFyIGNvbnRlbnRQb3NpdGlvbiA9IHsgeDogdGhpcy5tYXJnaW4ubGVmdCwgeTogdGhpcy5tYXJnaW4udG9wIH07XG4gICAgdmFyIGNvbnRlbnRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyB0aGlzLm1hcmdpbi5sZWZ0ICsgJywnICsgdGhpcy5tYXJnaW4udG9wICsgJyknO1xuXG4gICAgdGhpcy5jb250YWluZXIuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcpXG4gICAgICAgIC5hdHRyKGNvbnRlbnRQb3NpdGlvbik7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHlcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGNvbnRlbnRUcmFuc2Zvcm0pO1xuXG4gICAgdGhpcy5lbGVtZW50cy54QXhpc0NvbnRhaW5lclxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLngyQXhpc0NvbnRhaW5lclxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyB0aGlzLm1hcmdpbi5sZWZ0ICsgJywnICsgdGhpcy5tYXJnaW4udG9wICsgJyknKTtcblxuICAgIGlmICh1cGRhdGVEaW1lbnNpb25zKSB7XG4gICAgICAgIHRoaXMudXBkYXRlWFkoKTtcbiAgICB9XG5cbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8RDNUYWJsZVJvdz59IGRhdGFcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICogQHBhcmFtIHtCb29sZWFufSBbYW5pbWF0ZVldXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24oZGF0YSwgdHJhbnNpdGlvbkR1cmF0aW9uLCBhbmltYXRlWSkge1xuXG4gICAgdGhpcy5fZGF0YUNoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNTaXplQ2hhbmdpbmcgPSBkYXRhLmxlbmd0aCAhPT0gdGhpcy5kYXRhLmxlbmd0aDtcblxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICB0aGlzLmdlbmVyYXRlRmxhdHRlbmVkRGF0YSgpO1xuXG4gICAgaWYgKGlzU2l6ZUNoYW5naW5nIHx8IHRoaXMuX2RhdGFDaGFuZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWFkoYW5pbWF0ZVkgPyB0cmFuc2l0aW9uRHVyYXRpb24gOiB1bmRlZmluZWQpXG4gICAgICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgICAgIC5kcmF3WUF4aXMoKTtcbiAgICB9XG5cbiAgICB0aGlzLmRyYXdFbGVtZW50cyh0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IG1pblhcbiAqIEBwYXJhbSB7RGF0ZX0gbWF4WFxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc2V0WFJhbmdlID0gZnVuY3Rpb24obWluWCwgbWF4WCkge1xuXG4gICAgdGhpcy5taW5YID0gbWluWDtcbiAgICB0aGlzLm1heFggPSBtYXhYO1xuXG4gICAgdGhpcy5zY2FsZXMueFxuICAgICAgICAuZG9tYWluKFt0aGlzLm1pblgsIHRoaXMubWF4WF0pO1xuXG4gICAgdGhpc1xuICAgICAgICAudXBkYXRlWCgpXG4gICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAuZHJhd0VsZW1lbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGF2YWlsYWJsZSB3aWR0aCBhbmQgaGVpZ2h0IHNvIHRoYXQgZXZlcnkgdGhpbmcgdXBkYXRlIGNvcnJlc3BvbmRpbmdseVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBhdmFpbGFibGVXaWR0aFxuICogQHBhcmFtIHtOdW1iZXJ9IGF2YWlsYWJsZUhlaWdodFxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc2V0QXZhaWxhYmxlRGltZW5zaW9ucyA9IGZ1bmN0aW9uKGF2YWlsYWJsZVdpZHRoLCBhdmFpbGFibGVIZWlnaHQpIHtcblxuICAgIHRoaXMuX2Rpc2FibGVkID0gdHJ1ZTtcbiAgICB2YXIgX2xhc3RBdmFpbGFibGVXaWR0aCA9IHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aDtcbiAgICB2YXIgX2xhc3RBdmFpbGFibGVIZWlnaHQgPSB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0O1xuICAgIHRoaXMuc2V0QXZhaWxhYmxlV2lkdGgoYXZhaWxhYmxlV2lkdGgpO1xuICAgIHRoaXMuc2V0QXZhaWxhYmxlSGVpZ2h0KGF2YWlsYWJsZUhlaWdodCk7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgIHZhciBpc0F2YWlsYWJsZVdpZHRoQ2hhbmdpbmcgPSBfbGFzdEF2YWlsYWJsZVdpZHRoICE9PSB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGg7XG4gICAgdmFyIGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgPSBfbGFzdEF2YWlsYWJsZUhlaWdodCAhPT0gdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodDtcblxuICAgIGlmIChpc0F2YWlsYWJsZVdpZHRoQ2hhbmdpbmcgfHwgaXNBdmFpbGFibGVIZWlnaHRDaGFuZ2luZyB8fCB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPT09IDIpIHtcbiAgICAgICAgaWYgKGlzQXZhaWxhYmxlV2lkdGhDaGFuZ2luZykge1xuICAgICAgICAgICAgdGhpc1xuICAgICAgICAgICAgICAgIC51cGRhdGVYKClcbiAgICAgICAgICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0F2YWlsYWJsZUhlaWdodENoYW5naW5nKSB7XG4gICAgICAgICAgICB0aGlzXG4gICAgICAgICAgICAgICAgLnVwZGF0ZVkoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzXG4gICAgICAgICAgICAuZHJhd1hBeGlzKClcbiAgICAgICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAgICAgLmRyYXdFbGVtZW50cygpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgYXZhaWxhYmxlIHdpZHRoIHNvIHRoYXQgZXZlcnkgdGhpbmcgdXBkYXRlIGNvcnJlc3BvbmRpbmdseVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBhdmFpbGFibGVXaWR0aFxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc2V0QXZhaWxhYmxlV2lkdGggPSBmdW5jdGlvbihhdmFpbGFibGVXaWR0aCkge1xuXG4gICAgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNBdmFpbGFibGVXaWR0aENoYW5naW5nID0gYXZhaWxhYmxlV2lkdGggIT09IHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aDtcbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGggPSBhdmFpbGFibGVXaWR0aDtcblxuICAgIHRoaXMuZGltZW5zaW9ucy53aWR0aCA9IHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCAtIHRoaXMubWFyZ2luLmxlZnQgLSB0aGlzLm1hcmdpbi5yaWdodDtcblxuICAgIGlmICghdGhpcy5fZGlzYWJsZWQgJiYgKGlzQXZhaWxhYmxlV2lkdGhDaGFuZ2luZyB8fCB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPT09IDEpKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVYKClcbiAgICAgICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgICAgICAuZHJhd0VsZW1lbnRzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBhdmFpbGFibGUgaGVpZ2h0IHNvIHRoYXQgZXZlcnkgdGhpbmcgdXBkYXRlIGNvcnJlc3BvbmRpbmdseVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBhdmFpbGFibGVIZWlnaHRcbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnNldEF2YWlsYWJsZUhlaWdodCA9IGZ1bmN0aW9uKGF2YWlsYWJsZUhlaWdodCkge1xuXG4gICAgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNBdmFpbGFibGVIZWlnaHRDaGFuZ2luZyA9IGF2YWlsYWJsZUhlaWdodCAhPT0gdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodDtcbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0ID0gYXZhaWxhYmxlSGVpZ2h0O1xuXG4gICAgdGhpcy5fbWF4Qm9keUhlaWdodCA9IHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQgLSB0aGlzLm1hcmdpbi50b3AgLSB0aGlzLm1hcmdpbi5ib3R0b207XG5cbiAgICBpZiAoIXRoaXMuX2Rpc2FibGVkICYmIChpc0F2YWlsYWJsZUhlaWdodENoYW5naW5nIHx8IHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9PT0gMSkpIHtcbiAgICAgICAgdGhpc1xuICAgICAgICAgICAgLnVwZGF0ZVkoKVxuICAgICAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgICAgICAuZHJhd1lBeGlzKClcbiAgICAgICAgICAgIC5kcmF3RWxlbWVudHMoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVXBkYXRlIGVsZW1lbnRzIHdoaWNoIGRlcGVuZHMgb24geCBhbmQgeSBkaW1lbnNpb25zXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVYWSA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgIHRoaXMuX3ByZXZlbnRFdmVudEVtaXNzaW9uID0gdHJ1ZTtcbiAgICB0aGlzLnVwZGF0ZVgodHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB0aGlzLl9wcmV2ZW50RXZlbnRFbWlzc2lvbiA9IGZhbHNlO1xuICAgIHRoaXMudXBkYXRlWSh0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgZWxlbWVudHMgd2hpY2ggZGVwZW5kcyBvbiB4IGRpbWVuc2lvblxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVYID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB0aGlzLnNjYWxlcy54XG4gICAgICAgIC5kb21haW4oW3RoaXMubWluWCwgdGhpcy5tYXhYXSlcbiAgICAgICAgLnJhbmdlKFswLCB0aGlzLmRpbWVuc2lvbnMud2lkdGhdKTtcblxuICAgIHRoaXMuYXhpc2VzLnlcbiAgICAgICAgLmlubmVyVGlja1NpemUoLXRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWFxuICAgICAgICAueCh0aGlzLnNjYWxlcy54KVxuICAgICAgICAudHJhbnNsYXRlKHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCkpXG4gICAgICAgIC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuXG4gICAgaWYgKCF0aGlzLl9wcmV2ZW50RHJhd2luZykge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCArIHRoaXMubWFyZ2luLmxlZnQgKyB0aGlzLm1hcmdpbi5yaWdodCk7XG4gICAgICAgIHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgICAgIHRoaXMuZWxlbWVudHMuY2xpcC5zZWxlY3QoJ3JlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgfVxuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMsIHRoaXMuY29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBlbGVtZW50cyB3aGljaCBkZXBlbmRzIG9uIHkgZGltZW5zaW9uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVkgPSBmdW5jdGlvbiAodHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgZWxlbWVudEFtb3VudCA9IE1hdGgubWF4KHRoaXMuZGF0YS5sZW5ndGgsIDEpO1xuXG4gICAgLy8gaGF2ZSAxIG1vcmUgZWxlbW50IHRvIGZvcmNlIHJlcHJlc2VudGluZyBvbmUgbW9yZSB0aWNrXG4gICAgdmFyIGVsZW1lbnRzUmFuZ2UgPSBbMCwgZWxlbWVudEFtb3VudF07XG5cbiAgICAvLyBjb21wdXRlIG5ldyBoZWlnaHRcbiAgICB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ID0gTWF0aC5taW4oZWxlbWVudEFtb3VudCAqIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQsIHRoaXMuX21heEJvZHlIZWlnaHQpO1xuXG4gICAgLy8gY29tcHV0ZSBuZXcgWSBzY2FsZVxuICAgIHRoaXMuX3lTY2FsZSA9IHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgLyB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0ICogZWxlbWVudEFtb3VudDtcblxuICAgIC8vIHVwZGF0ZSBZIHNjYWxlLCBheGlzIGFuZCB6b29tIGJlaGF2aW9yXG4gICAgdGhpcy5zY2FsZXMueS5kb21haW4oZWxlbWVudHNSYW5nZSkucmFuZ2UoWzAsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHRdKTtcblxuICAgIC8vIHkgc2NhbGUgaGFzIGJlZW4gdXBkYXRlZCBzbyB0ZWxsIHRoZSB6b29tIGJlaGF2aW9yIHRvIGFwcGx5IHRoZSBwcmV2aW91cyB0cmFuc2xhdGUgYW5kIHNjYWxlIG9uIGl0XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkueSh0aGlzLnNjYWxlcy55KS50cmFuc2xhdGUodGhpcy5fbGFzdFRyYW5zbGF0ZSkuc2NhbGUodGhpcy5feVNjYWxlKTtcblxuICAgIC8vIGFuZCB1cGRhdGUgWCBheGlzIHRpY2tzIGhlaWdodFxuICAgIHRoaXMuYXhpc2VzLnguaW5uZXJUaWNrU2l6ZSgtdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG5cbiAgICBpZiAoIXRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG5cbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyO1xuICAgICAgICB2YXIgY2xpcCA9IHRoaXMuZWxlbWVudHMuY2xpcC5zZWxlY3QoJ3JlY3QnKTtcbiAgICAgICAgdmFyIGJvdW5kaW5nUmVjdCA9IHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJvdW5kaW5nUmVjdCcpO1xuXG4gICAgICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IGNvbnRhaW5lci50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgICAgIGNsaXAgPSBjbGlwLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICAgICAgYm91bmRpbmdSZWN0ID0gYm91bmRpbmdSZWN0LnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIHN2ZyBoZWlnaHRcbiAgICAgICAgY29udGFpbmVyLmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKyB0aGlzLm1hcmdpbi50b3AgKyB0aGlzLm1hcmdpbi5ib3R0b20pO1xuXG4gICAgICAgIC8vIHVwZGF0ZSBpbm5lciByZWN0IGhlaWdodFxuICAgICAgICB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcpLmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuICAgICAgICBib3VuZGluZ1JlY3QuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgICAgIGNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JykuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG4gICAgICAgIGNsaXAuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG5cbiAgICB9XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMsIHRoaXMuY29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBjb2x1bW4gd2l0aCwgYmFzaWNhbGx5IHRoZSB3aWR0aCBjb3JyZXNwb25kaW5nIHRvIDEgdW5pdCBpbiB4IGRhdGEgZGltZW5zaW9uXG4gKlxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUudXBkYXRlWEF4aXNJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5jb2x1bW5XaWR0aCA9IHRoaXMuc2NhbGVzLngoMSkgLSB0aGlzLnNjYWxlcy54KDApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIERyYXcgdGhlIHggYXhpc2VzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtza2lwVGlja3NdIFNob3VsZCBub3QgZHJhdyB0aWNrIGxpbmVzXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5kcmF3WEF4aXMgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24sIHNraXBUaWNrcykge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuYXhpc2VzLnlcbiAgICAgICAgLmlubmVyVGlja1NpemUoc2tpcFRpY2tzID8gMCA6IC10aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX3hBeGlzQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl94QXhpc0FGKTtcbiAgICB9XG5cbiAgICB0aGlzLl94QXhpc0FGID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgc2VsZi53cmFwV2l0aEFuaW1hdGlvbihzZWxmLmVsZW1lbnRzLnhBeGlzQ29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAuY2FsbChzZWxmLmF4aXNlcy54KVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgnbGluZScpXG4gICAgICAgICAgICAuc3R5bGUoe1xuICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiBzZWxmLm9wdGlvbnMueEF4aXNTdHJva2VXaWR0aC5iaW5kKHNlbGYpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKHNlbGYuZWxlbWVudHMueDJBeGlzQ29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAuY2FsbChzZWxmLmF4aXNlcy54MilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ3RleHQnKVxuICAgICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgICAgIHg6IHNlbGYuY29sdW1uV2lkdGggLyAyXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0eWxlKHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiArZCA9PT0gK3NlbGYubWF4WCA/ICdub25lJyA6ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIERyYXcgdGhlIHkgYXhpc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICogQHBhcmFtIHtCb29sZWFufSBbc2tpcFRpY2tzXSBTaG91bGQgbm90IGRyYXcgdGljayBsaW5lc1xuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZHJhd1lBeGlzID0gZnVuY3Rpb24gZHJhd1lBeGlzKHRyYW5zaXRpb25EdXJhdGlvbiwgc2tpcFRpY2tzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5heGlzZXMueFxuICAgICAgICAuaW5uZXJUaWNrU2l6ZShza2lwVGlja3MgPyAwIDogLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgdmFyIGRvbWFpblkgPSB0aGlzLnNjYWxlcy55LmRvbWFpbigpO1xuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAudGlja1ZhbHVlcyhkMy5yYW5nZShNYXRoLnJvdW5kKGRvbWFpbllbMF0pLCBNYXRoLnJvdW5kKGRvbWFpbllbMV0pLCAxKSk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5feUF4aXNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3lBeGlzQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX3lBeGlzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgY29udGFpbmVyID0gc2VsZi53cmFwV2l0aEFuaW1hdGlvbihzZWxmLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBjb250YWluZXIuY2FsbChzZWxmLmF4aXNlcy55KTtcblxuICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ3RleHQnKS5hdHRyKCd5Jywgc2VsZi5vcHRpb25zLnJvd0hlaWdodCAvIDIpO1xuXG4gICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgLnNlbGVjdEFsbCgnbGluZScpLnN0eWxlKCdkaXNwbGF5JywgZnVuY3Rpb24oZCxpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPyAnJyA6ICdub25lJztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICpcbiAqIEByZXR1cm5zIHtBcnJheTxEM1RhYmxlUm93Pn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuY2xvbmVEYXRhID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gdGhpcy5kYXRhLm1hcChmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGFibGVSb3d9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgcmVzID0ge307XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIGQpIHtcbiAgICAgICAgICAgIGlmIChkLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAnZWxlbWVudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc1trZXldID0gZFtrZXldO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc1trZXldID0gZFtrZXldLm1hcChzZWxmLmNsb25lRWxlbWVudC5iaW5kKHNlbGYpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKlxuICogQHJldHVybnMge0FycmF5PEQzVGFibGVFbGVtZW50Pn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuY2xvbmVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZmxhdHRlbmVkRGF0YS5tYXAoZnVuY3Rpb24oZSkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH1cbiAgICAgICAgICovXG4gICAgICAgIHZhciByZXMgPSB7fTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZSkge1xuICAgICAgICAgICAgaWYgKGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHJlc1trZXldID0gZVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICpcbiAqIEByZXR1cm5zIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZUVsZW1lbnQgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH1cbiAgICAgKi9cbiAgICB2YXIgcmVzID0ge307XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gZSkge1xuICAgICAgICBpZiAoZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICByZXNba2V5XSA9IGVba2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXM7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgcm93IGhvbGRpbmcgdGhlIHByb3ZpZGVkIGVsZW1lbnQgKHJlZmVyZW5jZSBlcXVhbGl0eSB0ZXN0KVxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUYWJsZVJvd31cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RWxlbWVudFJvdyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmluZCh0aGlzLmRhdGEsIGZ1bmN0aW9uKHJvdykge1xuICAgICAgICByZXR1cm4gcm93LmVsZW1lbnRzLmluZGV4T2YoZWxlbWVudCkgIT09IC0xO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBTdG9yZSBhIGNsb25lIG9mIHRoZSBjdXJyZW50bHkgYm91bmQgZmxhdHRlbmVkIGRhdGFcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc3RvcmVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wcmV2aW91c0ZsYXR0ZW5lZERhdGEgPSB0aGlzLmNsb25lRmxhdHRlbmVkRGF0YSgpO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgbmV3IHNldCBvZiBmbGF0dGVuZWQgZGF0YSwgc3RvcmluZyBwcmV2aW91cyBzZXQgaWYgY29uZmlndXJlZCBzbyBhbmQgcHJlc2VydmluZyBlbGVtZW50IGZsYWdzXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmdlbmVyYXRlRmxhdHRlbmVkRGF0YSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy51c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm0pIHtcbiAgICAgICAgdGhpcy5zdG9yZUZsYXR0ZW5lZERhdGEoKTtcbiAgICB9XG5cbiAgICB0aGlzLmZsYXR0ZW5lZERhdGEubGVuZ3RoID0gMDtcblxuICAgIHRoaXMuZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgZC5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucm93SW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHNlbGYuX2Zyb3plblVpZHMuaW5kZXhPZihlbGVtZW50LnVpZCkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5fZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLmZsYXR0ZW5lZERhdGEucHVzaChlbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIHRyYW5zZm9ybSBzdHJpbmcgZm9yIGEgZ2l2ZW4gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtRnJvbURhdGEgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIHRoaXMuc2NhbGVzLngodGhpcy5nZXREYXRhU3RhcnQoZWxlbWVudCkpICsgJywnICsgdGhpcy5zY2FsZXMueShlbGVtZW50LnJvd0luZGV4KSArICcpJztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBlbGVtZW50IHdpdGggdGhlIHByb3ZpZGVkIGJvdW5kIGRhdGEgc2hvdWxkIGJlIGN1bGxlZFxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZGF0YVxuICogQHJldHVybnMge0Jvb2xlYW59XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmN1bGxpbmdGaWx0ZXIgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICB2YXIgZG9tYWluWCA9IHRoaXMuc2NhbGVzLnguZG9tYWluKCk7XG4gICAgdmFyIGRvbWFpblhTdGFydCA9IGRvbWFpblhbMF07XG4gICAgdmFyIGRvbWFpblhFbmQgPSBkb21haW5YW2RvbWFpblgubGVuZ3RoIC0gMV07XG5cbiAgICB2YXIgZG9tYWluWSA9IHRoaXMuc2NhbGVzLnkuZG9tYWluKCk7XG4gICAgdmFyIGRvbWFpbllTdGFydCA9IGRvbWFpbllbMF07XG4gICAgdmFyIGRvbWFpbllFbmQgPSBkb21haW5ZW2RvbWFpblkubGVuZ3RoIC0gMV07XG5cbiAgICByZXR1cm4gZGF0YS5fZGVmYXVsdFByZXZlbnRlZCB8fFxuICAgICAgICAvLyBOT1QgeCBjdWxsaW5nIEFORCBOT1QgeSBjdWxsaW5nXG4gICAgICAgIChcbiAgICAgICAgICAgIC8vIE5PVCB4IGN1bGxpbmdcbiAgICAgICAgICAgICghdGhpcy5vcHRpb25zLmN1bGxpbmdYIHx8ICEodGhpcy5nZXREYXRhRW5kKGRhdGEpIDwgZG9tYWluWFN0YXJ0IHx8IHRoaXMuZ2V0RGF0YVN0YXJ0KGRhdGEpID4gZG9tYWluWEVuZCkpXG4gICAgICAgICAgICAmJlxuICAgICAgICAgICAgLy8gTk9UIHkgY3VsbGluZ1xuICAgICAgICAgICAgKCF0aGlzLm9wdGlvbnMuY3VsbGluZ1kgfHwgKGRhdGEucm93SW5kZXggPj0gZG9tYWluWVN0YXJ0IC0gdGhpcy5vcHRpb25zLmN1bGxpbmdEaXN0YW5jZSAmJiBkYXRhLnJvd0luZGV4IDwgZG9tYWluWUVuZCArIHRoaXMub3B0aW9ucy5jdWxsaW5nRGlzdGFuY2UgLSAxKSlcbiAgICAgICAgKTtcbn07XG5cbi8qKlxuICogR2V0IHN0YXJ0IHZhbHVlIG9mIHRoZSBwcm92aWRlZCBkYXRhLCB1c2VkIHRvIHJlcHJlc2VudCBlbGVtZW50IHN0YXJ0XG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBkYXRhXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5nZXREYXRhU3RhcnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuICtkYXRhLnN0YXJ0O1xufTtcblxuLyoqXG4gKiBHZXQgZW5kIHZhbHVlIG9mIHRoZSBwcm92aWRlZCBkYXRhLCB1c2VkIHRvIHJlcHJlc2VudCBlbGVtZW50IGVuZFxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZGF0YVxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RGF0YUVuZCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gK2RhdGEuZW5kO1xufTtcblxuLyoqXG4gKiBNb3ZlIHRoZSBlbGVtZW50cyB3aXRoIGNsYW1waW5nIHRoZSBhc2tlZCBtb3ZlIGFuZCByZXR1cm5lZCB3aGF0IGl0IGZpbmFsbHkgZGlkIHdpdGggdGhlIGFza2VkIHggYW5kIHkgZGVsdGFcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW2R4XSBBc2tlZCB4IG1vdmUgZGVsdGFcbiAqIEBwYXJhbSB7TnVtYmVyfSBbZHldIEFza2VkIHkgbW92ZSBkZWx0YVxuICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VEcmF3XSBTaG91bGQgdGhlIGVsZW1lbnRzIGJlIHJlZHJhd24gaW5zdGVhZCBvZiB0cmFuc2xhdGluZyB0aGUgaW5uZXIgY29udGFpbmVyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtza2lwWEF4aXNdIFNob3VsZCB0aGUgeCBheGlzIG5vdCBiZSByZWRyYXduXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZVRpY2tzXSBTaG91bGQgdGhlIHRpY2sgbGluZXMgYmUgZHJhd25cbiAqIEByZXR1cm5zIHtbTnVtYmVyLCBOdW1iZXIsIE51bWJlciwgTnVtYmVyXX0gRmluYWwgdHJhbnNsYXRlIHgsIGZpbmFsIHRyYW5zbGF0ZSB5LCB0cmFuc2xhdGUgeCBkZWx0YSwgdHJhbnNsYXRlIHkgZGVsdGFcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGR4LCBkeSwgZm9yY2VEcmF3LCBza2lwWEF4aXMsIGZvcmNlVGlja3MpIHtcblxuICAgIGR4ID0gZHggfHwgMDtcbiAgICBkeSA9IGR5IHx8IDA7XG5cbiAgICB2YXIgY3VycmVudFRyYW5zbGF0ZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdmFyIHVwZGF0ZWRUID0gW2N1cnJlbnRUcmFuc2xhdGVbMF0gKyBkeCwgY3VycmVudFRyYW5zbGF0ZVsxXSArIGR5XTtcblxuICAgIHVwZGF0ZWRUID0gdGhpcy5fY2xhbXBUcmFuc2xhdGlvbldpdGhTY2FsZSh1cGRhdGVkVCwgW3RoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSwgdGhpcy5iZWhhdmlvcnMuem9vbVkuc2NhbGUoKV0pO1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnRyYW5zbGF0ZSh1cGRhdGVkVCk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVguc2NhbGUodGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSgpKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWS50cmFuc2xhdGUodXBkYXRlZFQpO1xuXG4gICAgdGhpcy5tb3ZlRWxlbWVudHMoZm9yY2VEcmF3LCBza2lwWEF4aXMsIGZvcmNlVGlja3MpO1xuXG4gICAgdGhpcy5fbGFzdFRyYW5zbGF0ZSA9IHVwZGF0ZWRUO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnKTtcblxuICAgIHJldHVybiB1cGRhdGVkVC5jb25jYXQoW3VwZGF0ZWRUWzBdIC0gY3VycmVudFRyYW5zbGF0ZVswXSwgdXBkYXRlZFRbMV0gLSBjdXJyZW50VHJhbnNsYXRlWzFdXSk7XG59O1xuXG4vKipcbiAqIE1vdmUgZWxlbWVudHMsIHN3aXRjaGluZyBiZXR3ZWVuIGRyYXdpbmcgbWV0aG9kcyBkZXBlbmRpbmcgb24gYXJndW1lbnRzXG4gKiBCYXNpY2FsbHksIGl0IHNob3VsZCBiZSB1c2VkIHRvIHRoYXQgaXMgY2hvb3NlcyBvcHRpbWl6ZWQgZHJhd2luZyAodHJhbnNsYXRpbmcgdGhlIGlubmVyIGNvbnRhaW5lcikgaXMgdGhlcmUgaXMgbm8gc2NhbGUgY2hhbmdlLlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlRHJhd10gRm9yY2UgdGhlIGVsZW1lbnRzIHRvIGJlIGRyYXduIHdpdGhvdXQgdHJhbnNsYXRpb24gb3B0aW1pemF0aW9uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtza2lwWEF4aXNdIFNraXAgeCBheGlzIGJlaW5nIHJlZHJhd24gKGFsd2F5cyB0aGUgY2FzZSB3aGVuIHRoZSBzY2FsZSBkb2VzIG5vdCBjaGFuZ2Ugb24gbW92ZSlcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlVGlja3NdIEZvcmNlIHRpY2tzIHRvIGJlIHJlZHJhd247IGlmIGZhbHNlIHRoZW4gdGhleSB3aWxsIGJlIGhpZGRlblxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5tb3ZlRWxlbWVudHMgPSBmdW5jdGlvbihmb3JjZURyYXcsIHNraXBYQXhpcywgZm9yY2VUaWNrcykge1xuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMucmVuZGVyT25JZGxlIHx8IGZvcmNlRHJhdykge1xuICAgICAgICB0aGlzLmRyYXdFbGVtZW50cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudHJhbnNsYXRlRWxlbWVudHModGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKSwgdGhpcy5fbGFzdFRyYW5zbGF0ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3WUF4aXModW5kZWZpbmVkLCAhZm9yY2VUaWNrcyk7XG5cbiAgICBpZiAoIXNraXBYQXhpcykge1xuICAgICAgICB0aGlzLnVwZGF0ZVhBeGlzSW50ZXJ2YWwoKTtcbiAgICAgICAgdGhpcy5kcmF3WEF4aXModW5kZWZpbmVkLCAhZm9yY2VUaWNrcyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBEcmF3IGVsZW1lbnRzIChlbnRlcmluZywgZXhpdGluZywgdXBkYXRpbmcpXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5kcmF3RWxlbWVudHMgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIGlmICh0aGlzLl9wcmV2ZW50RHJhd2luZykge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX2VsZW1lbnRzQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9lbGVtZW50c0FGKVxuICAgIH1cblxuICAgIHRoaXMuX2VsZW1lbnRzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXAgb2Ygc3RhcnQgdHJhbnNmb3JtIHN0cmluZ3MgZm9yIGFsbCBlbGVtZW50c1xuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0PFN0cmluZz59XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgc3RhcnRUcmFuc2Zvcm1NYXAgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTWFwIG9mIGVuZCB0cmFuc2Zvcm0gc3RyaW5ncyBmb3IgYWxsIGVsZW1lbnRzXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3Q8U3RyaW5nPn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBlbmRUcmFuc2Zvcm1NYXAgPSB7fTtcblxuXG4gICAgICAgIC8vIGZpbGwgYm90aCB0cmFuc2Zvcm0gc3RyaW5nIG1hcHNcblxuICAgICAgICBpZiAoc2VsZi5vcHRpb25zLnVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybSAmJiB0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5wcmV2aW91c0ZsYXR0ZW5lZERhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnByZXZpb3VzRmxhdHRlbmVkRGF0YS5mb3JFYWNoKFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXN0YXJ0VHJhbnNmb3JtTWFwW2RhdGEudWlkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VHJhbnNmb3JtTWFwW2RhdGEuaWRdID0gc3RhcnRUcmFuc2Zvcm1NYXBbZGF0YS51aWRdID0gc2VsZi5nZXRUcmFuc2Zvcm1Gcm9tRGF0YShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2VsZi5mbGF0dGVuZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5mbGF0dGVuZWREYXRhLmZvckVhY2goXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZW5kVHJhbnNmb3JtTWFwW2RhdGEudWlkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZFRyYW5zZm9ybU1hcFtkYXRhLmlkXSA9IGVuZFRyYW5zZm9ybU1hcFtkYXRhLnVpZF0gPSBzZWxmLmdldFRyYW5zZm9ybUZyb21EYXRhKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpbHRlciB3aXRoIGN1bGxpbmcgbG9naWNcbiAgICAgICAgdmFyIGRhdGEgPSBzZWxmLmZsYXR0ZW5lZERhdGEuZmlsdGVyKHNlbGYuY3VsbGluZ0ZpbHRlci5iaW5kKHNlbGYpKTtcblxuICAgICAgICB2YXIgZ3JvdXBzID0gc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5zZWxlY3RBbGwoJ2cuJyArIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKVxuICAgICAgICAgICAgLmRhdGEoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkLnVpZDtcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgLy8gaGFuZGxlIGV4aXRpbmcgZWxlbWVudHNcblxuICAgICAgICB2YXIgZXhpdGluZyA9IGdyb3Vwcy5leGl0KCk7XG5cbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5lbmFibGVUcmFuc2l0aW9uT25FeGl0ICYmIHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcblxuICAgICAgICAgICAgZXhpdGluZy5lYWNoKFxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZGF0YVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSBkMy5zZWxlY3QodGhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5lbGVtZW50RXhpdChncm91cCwgZGF0YSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZmxhZyB0aGUgZWxlbWVudCBhcyByZW1vdmVkXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuX3JlbW92ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBleGl0VHJhbnNmb3JtID0gZW5kVHJhbnNmb3JtTWFwW2RhdGEudWlkXSB8fCBlbmRUcmFuc2Zvcm1NYXBbZGF0YS5pZF07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXRUcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oZ3JvdXAsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZXhpdFRyYW5zZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6cmVtb3ZlJywgZ3JvdXAsIG51bGwsIFtkYXRhXSk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXhpdGluZ1xuICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLy8gaGFuZGxlIGVudGVyaW5nIGVsZW1lbnRzXG5cbiAgICAgICAgZ3JvdXBzLmVudGVyKCkuYXBwZW5kKCdnJylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnQnKVxuICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudEVudGVyKGQzLnNlbGVjdCh0aGlzKSwgZGF0YSk7XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIC8vIGhhbmRsZSBhbGwgZWxlbWVudHMgZXhpc3RpbmcgYWZ0ZXIgZW50ZXJpbmdcblxuICAgICAgICBncm91cHMuZWFjaChcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBkYXRhXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgIGlmIChkYXRhLl9yZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSBkMy5zZWxlY3QodGhpcyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5fZGVmYXVsdFByZXZlbnRlZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudFVwZGF0ZShncm91cCwgZGF0YSwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGlzVXBkYXRlID0gZGF0YS5fcG9zaXRpb25lZDtcblxuICAgICAgICAgICAgICAgIHZhciBuZXdUcmFuc2Zvcm0gPSBlbmRUcmFuc2Zvcm1NYXBbZGF0YS51aWRdIHx8IGVuZFRyYW5zZm9ybU1hcFtkYXRhLmlkXSB8fCBzZWxmLmdldFRyYW5zZm9ybUZyb21EYXRhKGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgb3JpZ2luVHJhbnNmb3JtID0gc3RhcnRUcmFuc2Zvcm1NYXBbZGF0YS51aWRdIHx8IHN0YXJ0VHJhbnNmb3JtTWFwW2RhdGEuaWRdIHx8IG5ld1RyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1vZGlmaWVkT3JpZ2luVHJhbnNmb3JtO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNVcGRhdGUgJiYgc2VsZi5vcHRpb25zLnVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpblRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkT3JpZ2luVHJhbnNmb3JtID0gb3JpZ2luVHJhbnNmb3JtO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwLmF0dHIoJ3RyYW5zZm9ybScsIG9yaWdpblRyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKGdyb3VwLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0clR3ZWVuKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmlnaW5UcmFuc2Zvcm0gPSBtb2RpZmllZE9yaWdpblRyYW5zZm9ybSB8fCBncm91cC5hdHRyKCd0cmFuc2Zvcm0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmVuYWJsZVlUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5pbnRlcnBvbGF0ZVRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm0sIG5ld1RyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXJ0VHJhbnNmb3JtID0gZDMudHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbmRUcmFuc2Zvcm0gPSBkMy50cmFuc2Zvcm0obmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdID0gZW5kVHJhbnNmb3JtLnRyYW5zbGF0ZVsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLmludGVycG9sYXRlVHJhbnNmb3JtKHN0YXJ0VHJhbnNmb3JtLnRvU3RyaW5nKCksIGVuZFRyYW5zZm9ybS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgbmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkYXRhLl9wb3NpdGlvbmVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudFVwZGF0ZShncm91cCwgZGF0YSwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgPSBbMC4wLCAwLjBdO1xuICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLmF0dHIoJ3RyYW5zZm9ybScsIG51bGwpO1xuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnRyYW5zbGF0ZUVsZW1lbnRzID0gZnVuY3Rpb24odHJhbnNsYXRlLCBwcmV2aW91c1RyYW5zbGF0ZSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHR4ID0gdHJhbnNsYXRlWzBdIC0gcHJldmlvdXNUcmFuc2xhdGVbMF07XG4gICAgdmFyIHR5ID0gdHJhbnNsYXRlWzFdIC0gcHJldmlvdXNUcmFuc2xhdGVbMV07XG5cbiAgICB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdID0gdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVswXSArIHR4O1xuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV0gPSB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdICsgdHk7XG5cblxuICAgIGlmICh0aGlzLl9lbHRzVHJhbnNsYXRlQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9lbHRzVHJhbnNsYXRlQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX2VsdHNUcmFuc2xhdGVBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cih7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoJyArIHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgKyAnKSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHNlbGYuZWxlbWVudHNUcmFuc2xhdGUgIT09IHNlbGYubm9vcCkge1xuICAgICAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoJy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRzVHJhbnNsYXRlKGQzLnNlbGVjdCh0aGlzKSwgZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5zdG9wRWxlbWVudFRyYW5zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLnNlbGVjdEFsbCgnZy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpLnRyYW5zaXRpb24oKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7ZDMuU2VsZWN0aW9ufVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5lbGVtZW50RW50ZXIgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpIHsgcmV0dXJuIHNlbGVjdGlvbjsgfTtcblxuLyoqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0cmFuc2l0aW9uRHVyYXRpb25cbiAqIEByZXR1cm5zIHtkMy5TZWxlY3Rpb259XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmVsZW1lbnRVcGRhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQsIHRyYW5zaXRpb25EdXJhdGlvbikgeyByZXR1cm4gc2VsZWN0aW9uOyB9O1xuXG4vKipcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge2QzLlNlbGVjdGlvbn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudEV4aXQgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpIHsgcmV0dXJuIHNlbGVjdGlvbjsgfTtcblxuLyoqXG4gKiBXcmFwIHRoZSBzZWxlY3Rpb24gd2l0aCBhIGQzIHRyYW5zaXRpb24gaWYgdGhlIHRyYW5zaXRpb24gZHVyYXRpb24gaXMgZ3JlYXRlciB0aGFuIDBcbiAqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqIEByZXR1cm5zIHtkMy5TZWxlY3Rpb258ZDMuVHJhbnNpdGlvbn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUud3JhcFdpdGhBbmltYXRpb24gPSBmdW5jdGlvbihzZWxlY3Rpb24sIHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgIHJldHVybiBzZWxlY3Rpb24udHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikuZWFzZSh0aGlzLm9wdGlvbnMudHJhbnNpdGlvbkVhc2luZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdGlvbjtcbiAgICB9XG59O1xuXG4vKipcbiAqIFByb3h5IHRvIHJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lc1xuICogRW5zdXJlIGFsbCBsaXN0ZW5lcnMgcmVnaXN0ZXIgYmVmb3JlIHRoZSBuZXh0IGZyYW1lIGFyZSBwbGF5ZWQgaW4gdGhlIHNhbWUgc2VxdWVuY2VcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihsaXN0ZW5lcikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMucHVzaChsaXN0ZW5lcik7XG5cbiAgICBpZiAodGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBnO1xuICAgICAgICAgICAgd2hpbGUoZyA9IHNlbGYuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLnNoaWZ0KCkpIGcoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpc3RlbmVyO1xufTtcblxuLyoqXG4gKiBQcm94eSB0byBjYW5jZWwgYW5pbWF0aW9uIGZyYW1lXG4gKiBSZW1vdmUgdGhlIGxpc3RlbmVyIGZyb20gdGhlIGxpc3Qgb2YgZnVuY3Rpb25zIHRvIGJlIHBsYXllZCBvbiBuZXh0IGFuaW1hdGlvbiBmcmFtZVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24obGlzdGVuZXIpIHtcblxuICAgIHZhciBpbmRleCA9IHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmxlbmd0aCA+IDAgPyB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5pbmRleE9mKGxpc3RlbmVyKSA6IC0xO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbn07XG5cbkQzVGFibGUucHJvdG90eXBlLmNhbmNlbEFsbEFuaW1hdGlvbkZyYW1lcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmxlbmd0aCA9IDA7XG59O1xuXG4vKipcbiAqIENhbGwgYSBtb3ZlIGZvcmNpbmcgdGhlIGRyYXdpbmdzIHRvIGZpdCB3aXRoaW4gc2NhbGUgZG9tYWluc1xuICpcbiAqIEByZXR1cm5zIHtbTnVtYmVyLE51bWJlcixOdW1iZXIsTnVtYmVyXX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZW5zdXJlSW5Eb21haW5zID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubW92ZSgwLCAwLCBmYWxzZSwgZmFsc2UsIHRydWUpO1xufTtcblxuLyoqXG4gKiBUb2dnbGUgaW50ZXJuYWwgZHJhd2luZyBwcmV2ZW50IGZsYWdcbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFthY3RpdmVdIElmIG5vdCBwcm92aWRlZCwgaXQgbmVnYXRlcyB0aGUgY3VycmVudCBmbGFnIHZhbHVlXG4gKiBAcmV0dXJucyB7ZDNUaW1lbGluZS5EM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS50b2dnbGVEcmF3aW5nID0gZnVuY3Rpb24oYWN0aXZlKSB7XG5cbiAgICB0aGlzLl9wcmV2ZW50RHJhd2luZyA9IHR5cGVvZiBhY3RpdmUgPT09ICdib29sZWFuJyA/ICFhY3RpdmUgOiAhdGhpcy5fcHJldmVudERyYXdpbmc7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9mci9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PYmpldHNfZ2xvYmF1eC9BcnJheS9maW5kXG4gKiBAdHlwZSB7KnxGdW5jdGlvbn1cbiAqIEBwcml2YXRlXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLl9maW5kID0gZnVuY3Rpb24obGlzdCwgcHJlZGljYXRlKSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3QubGVuZ3RoID4+PiAwO1xuICAgIHZhciB0aGlzQXJnID0gbGlzdDtcbiAgICB2YXIgdmFsdWU7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gbGlzdFtpXTtcbiAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogQ2xhbXBlZCBwcm92aWRlZCB0cmFuc2xhdGlvbiBiYXNlZCBvbiBkaW1lbnNpb25zIGFuZCBjdXJyZW50IHByb3ZpZGVkIHNjYWxlc1xuICpcbiAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfSB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfSBzY2FsZVxuICogQHJldHVybnMge1tOdW1iZXIsTnVtYmVyXX1cbiAqIEBwcml2YXRlXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlID0gZnVuY3Rpb24odHJhbnNsYXRlLCBzY2FsZSkge1xuXG4gICAgc2NhbGUgPSBzY2FsZSB8fCBbMSwgMV07XG5cbiAgICBpZiAoIShzY2FsZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICBzY2FsZSA9IFtzY2FsZSwgc2NhbGVdO1xuICAgIH1cblxuICAgIHZhciB0eCA9IHRyYW5zbGF0ZVswXTtcbiAgICB2YXIgdHkgPSB0cmFuc2xhdGVbMV07XG4gICAgdmFyIHN4ID0gc2NhbGVbMF07XG4gICAgdmFyIHN5ID0gc2NhbGVbMV07XG5cbiAgICBpZiAoc3ggPT09IDEpIHtcbiAgICAgICAgdHggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHR4ID0gTWF0aC5taW4oTWF0aC5tYXgoLXRoaXMuZGltZW5zaW9ucy53aWR0aCAqIChzeC0xKSwgdHgpLCAwKTtcbiAgICB9XG5cbiAgICBpZiAoc3kgPT09IDEpIHtcbiAgICAgICAgdHkgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHR5ID0gTWF0aC5taW4oTWF0aC5tYXgoLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKiAoc3ktMSksIHR5KSwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFt0eCwgdHldO1xuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBEM1RhYmxlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZDMgZnJvbSAnZDMnO1xuaW1wb3J0IEQzVGFibGUgZnJvbSAnLi9EM1RhYmxlJztcbmltcG9ydCBEM1RhYmxlU3RhdGljTWFya2VyIGZyb20gJy4vRDNUYWJsZVN0YXRpY01hcmtlcic7XG5cbnZhciBkM1RpbWVsaW5lID0ge307XG5cbi8qKlxuICogVGFibGUgbWFya2VyIHdoaWNoIGtub3dzIGhvdyB0byByZXByZXNlbnQgaXRzZWxmIGluIGEge0BsaW5rIGQzVGltZWxpbmUuRDNUYWJsZSNjb250YWluZXJ9XG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVTdGF0aWNNYXJrZXJPcHRpb25zfSBvcHRpb25zXG4gKiBAZXh0ZW5kcyB7ZDNUaW1lbGluZS5EM1RhYmxlU3RhdGljTWFya2VyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmQzVGltZWxpbmUuRDNUYWJsZU1hcmtlciA9IGZ1bmN0aW9uIEQzVGFibGVNYXJrZXIob3B0aW9ucykge1xuXG4gICAgRDNUYWJsZVN0YXRpY01hcmtlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fbGFzdFRpbWVVcGRhdGVkID0gbnVsbDtcbn07XG5cbnZhciBEM1RhYmxlTWFya2VyID0gZDNUaW1lbGluZS5EM1RhYmxlTWFya2VyO1xuXG5pbmhlcml0cyhEM1RhYmxlTWFya2VyLCBEM1RhYmxlU3RhdGljTWFya2VyKTtcblxuXG4vKipcbiAqIENvbXBhcmUgdHdvIHZhbHVlc1xuICogVG8gYmUgb3ZlcnJpZGRlbiBpZiB5b3Ugd2lzaCB0aGUgbWFya2VyIG5vdCB0byBiZSBtb3ZlZCBmb3Igc29tZSB2YWx1ZSBjaGFuZ2VzIHdoaWNoIHNob3VsZCBub3QgaW1wYWN0IHRoZSBtYXJrZXIgcG9zaXRpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYVxuICogQHBhcmFtIHtOdW1iZXJ9IGJcbiAqIEByZXR1cm5zIHtCb29sZWFufVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS52YWx1ZUNvbXBhcmF0b3IgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuICthICE9PSArYjtcbn07XG5cbi8qKlxuICogU2V0IHRoZSB2YWx1ZSBmb3IgdGhlIG1hcmtlciwgd2hpY2ggdXBkYXRlcyBpZiBpdCBuZWVkcyB0b1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICogQHBhcmFtIHtCb29sZWFufSBbc2lsZW50XVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlLCBzaWxlbnQpIHtcblxuICAgIHZhciBwcmV2aW91c1RpbWVVcGRhdGVkID0gdGhpcy5fbGFzdFRpbWVVcGRhdGVkO1xuXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXG4gICAgaWYgKHRoaXMudmFsdWVDb21wYXJhdG9yKHByZXZpb3VzVGltZVVwZGF0ZWQsIHRoaXMudmFsdWUpICYmIHRoaXMudGFibGUgJiYgdGhpcy5jb250YWluZXIpIHtcblxuICAgICAgICB0aGlzLl9sYXN0VGltZVVwZGF0ZWQgPSB0aGlzLnZhbHVlO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyXG4gICAgICAgICAgICAuZGF0dW0oe1xuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgICAgICAgIHRoaXMubW92ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIFZhbHVlIGdldHRlciBmcm9tIGQzIHNlbGVjdGlvbiBkYXR1bSB3aGljaCBzaG91bGQgYmUgbWFkZSBvZiBhIHZhbHVlXG4gKiBUbyBiZSBvdmVycmlkZGVuIGlmIHlvdSB3aXNoIHRvIGFsdGVyIHRoaXMgdmFsdWUgZHluYW1pY2FsbHlcbiAqXG4gKiBAcGFyYW0ge3ZhbHVlOiBOdW1iZXJ9IGRhdGFcbiAqIEByZXR1cm5zIHsqfVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YS52YWx1ZTtcbn07XG5cbi8qKlxuICogSGFuZGxlIGEgRDNUYWJsZSBiZWluZyBib3VuZFxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5iaW5kVGFibGUgPSBmdW5jdGlvbigpIHtcblxuICAgIEQzVGFibGVTdGF0aWNNYXJrZXIucHJvdG90eXBlLmJpbmRUYWJsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gb24gdGFibGUgbW92ZSwgbW92ZSB0aGUgbWFya2VyXG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5tb3ZlKCk7XG4gICAgfTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnLCB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lcik7XG5cbiAgICB0aGlzLm1vdmUoKTtcblxufTtcblxuLyoqXG4gKiBIYW5kbGUgRDNUYWJsZSB1bmJvdW5kXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGV9IHByZXZpb3VzVGFibGVcbiAqL1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUudW5iaW5kVGFibGUgPSBmdW5jdGlvbihwcmV2aW91c1RhYmxlKSB7XG5cbiAgICBEM1RhYmxlU3RhdGljTWFya2VyLnByb3RvdHlwZS51bmJpbmRUYWJsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJywgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIpO1xuXG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5lbWl0KCdtYXJrZXI6dW5ib3VuZCcsIHByZXZpb3VzVGFibGUpO1xufTtcblxuLyoqXG4gKiBAdG9kbyBkb2N1bWVudCB0aGlzXG4gKlxuICogQHBhcmFtIGRhdGFcbiAqIEByZXR1cm5zIHsqfVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoZGF0YSk7XG5cbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxheW91dCA9IHRoaXMub3B0aW9ucy5sYXlvdXQ7XG4gICAgdmFyIHNjYWxlLCBwb3NpdGlvbiA9IFswLCAwXSwgcG9zaXRpb25JbmRleDtcblxuICAgIHN3aXRjaChsYXlvdXQpIHtcbiAgICAgICAgY2FzZSB0aGlzLkxBWU9VVF9WRVJUSUNBTDpcbiAgICAgICAgICAgIHNjYWxlID0gdGhpcy50YWJsZS5zY2FsZXMueDtcbiAgICAgICAgICAgIHBvc2l0aW9uSW5kZXggPSAwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdGhpcy5MQVlPVVRfSE9SSVpPTlRBTDpcbiAgICAgICAgICAgIHNjYWxlID0gdGhpcy50YWJsZS5zY2FsZXMueTtcbiAgICAgICAgICAgIHBvc2l0aW9uSW5kZXggPSAxO1xuICAgIH1cblxuICAgIHBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdID0gc2NhbGUodmFsdWUpO1xuXG4gICAgdmFyIHJhbmdlID0gc2NhbGUucmFuZ2UoKTtcbiAgICB2YXIgaXNJblJhbmdlID0gcG9zaXRpb25bcG9zaXRpb25JbmRleF0gPj0gcmFuZ2VbMF0gJiYgcG9zaXRpb25bcG9zaXRpb25JbmRleF0gPD0gcmFuZ2VbcmFuZ2UubGVuZ3RoIC0gMV07XG5cbiAgICByZXR1cm4gaXNJblJhbmdlID8gcG9zaXRpb24gOiBudWxsO1xufTtcblxuLyoqXG4gKiBNb3ZlIHRoZSBtYXJrZXIgc3luY2hyb25vdXNseVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5tb3ZlU3luYyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKCF0aGlzLnRhYmxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuZWFjaChmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHNlbGYuZ2V0UG9zaXRpb24oZGF0YSk7XG5cbiAgICAgICAgICAgIGlmIChwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBncm91cCA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xuXG4gICAgICAgICAgICAgICAgZ3JvdXAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyhzZWxmLnRhYmxlLm1hcmdpbi5sZWZ0ICsgcG9zaXRpb25bMF0gPj4gMCkrJywnKyhzZWxmLnRhYmxlLm1hcmdpbi50b3AgKyBwb3NpdGlvblsxXSA+PiAwKSsnKScpO1xuXG4gICAgICAgICAgICAgICAgZ3JvdXAuc2VsZWN0KCcuJyArIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxhYmVsJylcbiAgICAgICAgICAgICAgICAgICAgLnRleHQoc2VsZi5vcHRpb25zLmZvcm1hdHRlci5jYWxsKHNlbGYsIHNlbGYuZ2V0VmFsdWUoZGF0YSkpKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RhYmxlTWFya2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlTWFya2VyIGZyb20gJy4vRDNUYWJsZU1hcmtlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG52YXIgZDNUaW1lbGluZSA9IHt9O1xuXG4vKipcbiAqIE1vdXNlIHBvc2l0aW9uIHRyYWNrZXIgd2hpY2ggcmVzcG9uZHMgdG8gRDNUYWJsZSBldmVudHMgKHdoaWNoIGxpc3RlbnMgaXRzZWxmIHRvIG1vdXNlIGV2ZW50cylcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZU1vdXNlVHJhY2tlck9wdGlvbnN9IG9wdGlvbnNcbiAqIEBleHRlbmRzIHtkM1RpbWVsaW5lLkQzVGFibGVNYXJrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZDNUaW1lbGluZS5EM1RhYmxlTW91c2VUcmFja2VyID0gZnVuY3Rpb24gRDNUYWJsZU1vdXNlVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZU1hcmtlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuX21vdmVBRiA9IG51bGw7XG5cbiAgICB0aGlzLm9uKCdtYXJrZXI6Ym91bmQnLCB0aGlzLmhhbmRsZVRhYmxlQm91bmQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5vbignbWFya2VyOnVuYm91bmQnLCB0aGlzLmhhbmRsZVRhYmxlVW5ib3VuZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQG5hbWUgZDNUaW1lbGluZS5EM1RhYmxlTW91c2VUcmFja2VyI29wdGlvbnNcbiAgICAgKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlTW91c2VUcmFja2VyT3B0aW9uc31cbiAgICAgKi9cbn07XG5cbnZhciBEM1RhYmxlTW91c2VUcmFja2VyID0gZDNUaW1lbGluZS5EM1RhYmxlTW91c2VUcmFja2VyO1xuXG5pbmhlcml0cyhEM1RhYmxlTW91c2VUcmFja2VyLCBEM1RhYmxlTWFya2VyKTtcblxuLyoqXG4gKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlTW91c2VUcmFja2VyT3B0aW9uc31cbiAqL1xuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGVNYXJrZXIucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtTW9kaWZpZXJzOiBbJ21vdXNlVHJhY2tlciddLFxuICAgIGxpc3RlblRvVG91Y2hFdmVudHM6IHRydWVcbn0pO1xuXG4vKipcbiAqIEltcGxlbWVudCB0aGUgbGlzdGVuZXIgZm9yIEQzVGFibGUgYmVpbmcgYm91bmRcbiAqL1xuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlVGFibGVCb3VuZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIgPSB0aGlzLmhhbmRsZU1vdXNlZW50ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyID0gdGhpcy5oYW5kbGVNb3VzZW1vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl90YWJsZU1vdXNlbGVhdmVMaXN0ZW5lciA9IHRoaXMuaGFuZGxlTW91c2VsZWF2ZS5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWVudGVyJywgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIpO1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2Vtb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWxlYXZlJywgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5saXN0ZW5Ub1RvdWNoRXZlbnRzKSB7XG4gICAgICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IHRydWU7XG4gICAgICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6dG91Y2htb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faXNMaXN0ZW5pbmdUb1RvdWNoRXZlbnRzID0gZmFsc2U7XG4gICAgfVxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgdGhlIGxpc3RlbmVyIGZvciBEM1RhYmxlIGJlaW5nIHVuYm91bmRcbiAqL1xuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlVGFibGVVbmJvdW5kID0gZnVuY3Rpb24ocHJldmlvdXNUYWJsZSkge1xuXG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWVudGVyJywgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2Vtb3ZlJywgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lcik7XG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3VzZWxlYXZlJywgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIpO1xuXG4gICAgaWYgKHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cykge1xuICAgICAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnRvdWNobW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIH1cblxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgZ2V0dGluZyB4IGFuZCB5IHBvc2l0aW9ucyBmcm9tIEQzVGFibGUgZXZlbnRcbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZX0gdGFibGVcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7ZDMuRXZlbnR9IGQzRXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFRpbWVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFJvd1xuICpcbiAqIEBzZWUgZDNUaW1lbGluZS5EM1RhYmxlI2VtaXREZXRhaWxlZEV2ZW50IGZvciBhcmd1bWVudHMgZGVzY3JpcHRpb25cbiAqIEByZXR1cm5zIHsqfVxuICovXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5nZXRWYWx1ZUZyb21UYWJsZUV2ZW50ID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG4gICAgc3dpdGNoICh0aGlzLm9wdGlvbnMubGF5b3V0KSB7XG4gICAgICAgIGNhc2UgJ3ZlcnRpY2FsJzpcbiAgICAgICAgICAgIHJldHVybiBnZXRUaW1lKCk7XG4gICAgICAgIGNhc2UgJ2hvcml6b250YWwnOlxuICAgICAgICAgICAgcmV0dXJuIGdldFJvdygpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSW1wbGVtZW50IG1vdXNlIGVudGVyIGhhbmRsaW5nXG4gKiAgLSBzaG93IHRoZSBtYXJrZXIgYW5kIHNldCB0aGUgdmFsdWUgZnJvbSBtb3VzZSBwb3NpdGlvblxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlfSB0YWJsZVxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkMy5FdmVudH0gZDNFdmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0VGltZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0Um93XG4gKlxuICogQHNlZSBkM1RpbWVsaW5lLkQzVGFibGUjZW1pdERldGFpbGVkRXZlbnQgZm9yIGFyZ3VtZW50cyBkZXNjcmlwdGlvblxuICogQHJldHVybnMgeyp9XG4gKi9cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZU1vdXNlZW50ZXIgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciB0aW1lID0gdGhpcy5nZXRWYWx1ZUZyb21UYWJsZUV2ZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuc2hvdygpO1xuICAgICAgICBzZWxmLnNldFZhbHVlKHRpbWUpO1xuICAgIH0pO1xuXG59O1xuXG4vKipcbiAqIEltcGxlbWVudCBtb3VzZSBtb3ZlIGhhbmRsaW5nXG4gKiAgLSBzZXQgdGhlIHZhbHVlIGZyb20gbW91c2UgcG9zaXRpb25cbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZX0gdGFibGVcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7ZDMuRXZlbnR9IGQzRXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFRpbWVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFJvd1xuICpcbiAqIEBzZWUgZDNUaW1lbGluZS5EM1RhYmxlI2VtaXREZXRhaWxlZEV2ZW50IGZvciBhcmd1bWVudHMgZGVzY3JpcHRpb25cbiAqIEByZXR1cm5zIHsqfVxuICovXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5oYW5kbGVNb3VzZW1vdmUgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCBkM0V2ZW50LCBnZXRUaW1lLCBnZXRSb3cpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgdGltZSA9IHRoaXMuZ2V0VmFsdWVGcm9tVGFibGVFdmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICB0YWJsZS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9tb3ZlQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX21vdmVBRiA9IHRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5zZXRWYWx1ZSh0aW1lKTtcbiAgICB9KTtcblxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgbW91c2UgbGVhdmUgaGFuZGxpbmdcbiAqICAtIGhpZGUgdGhlIG1hcmtlciBhbmQgc2V0IHRoZSB2YWx1ZSBmcm9tIG1vdXNlIHBvc2l0aW9uXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGV9IHRhYmxlXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge2QzLkV2ZW50fSBkM0V2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXRUaW1lXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXRSb3dcbiAqXG4gKiBAc2VlIGQzVGltZWxpbmUuRDNUYWJsZSNlbWl0RGV0YWlsZWRFdmVudCBmb3IgYXJndW1lbnRzIGRlc2NyaXB0aW9uXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2VsZWF2ZSA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICB0YWJsZS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9tb3ZlQUYpO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH0pO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVNb3VzZVRyYWNrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5pbXBvcnQgRDNUYWJsZSBmcm9tICcuL0QzVGFibGUnO1xuaW1wb3J0IEQzVGFibGVTdGF0aWNNYXJrZXIgZnJvbSAnLi9EM1RhYmxlU3RhdGljTWFya2VyJztcblxudmFyIGQzVGltZWxpbmUgPSB7fTtcblxuLyoqXG4gKiBUYWJsZSBtYXJrZXIgd2hpY2gga25vd3MgaG93IHRvIHJlcHJlc2VudCBpdHNlbGYgaW4gYSB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlI2NvbnRhaW5lcn1cbiAqXG4gKiBAcGFyYW0ge2QzVGltZWxpbmUuRDNUYWJsZVN0YXRpY01hcmtlck9wdGlvbnN9IG9wdGlvbnNcbiAqIEBleHRlbmRzIHtkM1RpbWVsaW5lLkQzVGFibGVTdGF0aWNNYXJrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZDNUaW1lbGluZS5EM1RhYmxlU2Nyb2xsQmFyID0gZnVuY3Rpb24gRDNUYWJsZVNjcm9sbEJhcihvcHRpb25zKSB7XG5cbiAgICBEM1RhYmxlU3RhdGljTWFya2VyLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lciA9IG51bGw7XG59O1xuXG52YXIgRDNUYWJsZVNjcm9sbEJhciA9IGQzVGltZWxpbmUuRDNUYWJsZVNjcm9sbEJhcjtcblxuaW5oZXJpdHMoRDNUYWJsZVNjcm9sbEJhciwgRDNUYWJsZVN0YXRpY01hcmtlcik7XG5cbi8qKlxuICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZVN0YXRpY01hcmtlck9wdGlvbnN9XG4gKi9cbkQzVGFibGVTY3JvbGxCYXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlU3RhdGljTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbU1vZGlmaWVyczogWydzY3JvbGxCYXInXVxufSk7XG5cbi8qKlxuICogSGFuZGxlIGEgRDNUYWJsZSBiZWluZyBib3VuZFxuICovXG5EM1RhYmxlU2Nyb2xsQmFyLnByb3RvdHlwZS5iaW5kVGFibGUgPSBmdW5jdGlvbigpIHtcblxuICAgIEQzVGFibGVTdGF0aWNNYXJrZXIucHJvdG90eXBlLmJpbmRUYWJsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gb24gdGFibGUgbW92ZSwgbW92ZSB0aGUgbWFya2VyXG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi51cGRhdGVTaXplKCk7XG4gICAgfTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnLCB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lcik7XG5cbiAgICB0aGlzLm1vdmUoKTtcblxufTtcblxuLyoqXG4gKiBIYW5kbGUgRDNUYWJsZSB1bmJvdW5kXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGV9IHByZXZpb3VzVGFibGVcbiAqL1xuRDNUYWJsZVNjcm9sbEJhci5wcm90b3R5cGUudW5iaW5kVGFibGUgPSBmdW5jdGlvbihwcmV2aW91c1RhYmxlKSB7XG5cbiAgICBEM1RhYmxlU3RhdGljTWFya2VyLnByb3RvdHlwZS51bmJpbmRUYWJsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJywgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIpO1xuXG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgdGhpcy5lbWl0KCdtYXJrZXI6dW5ib3VuZCcsIHByZXZpb3VzVGFibGUpO1xufTtcblxuLyoqXG4gKiBAdG9kbyBkb2N1bWVudCB0aGlzXG4gKlxuICogQHJldHVybnMgeyp9XG4gKi9cbkQzVGFibGVTY3JvbGxCYXIucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICBzd2l0Y2godGhpcy5vcHRpb25zLmxheW91dCkge1xuICAgICAgICBjYXNlIHRoaXMuTEFZT1VUX1ZFUlRJQ0FMOlxuICAgICAgICAgICAgcmV0dXJuIFt0aGlzLnRhYmxlLmRpbWVuc2lvbnMud2lkdGggLSB0aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzcyAvIDIsIDBdO1xuICAgICAgICBjYXNlIHRoaXMuTEFZT1VUX0hPUklaT05UQUw6XG4gICAgICAgICAgICByZXR1cm4gWzAsIHRoaXMudGFibGUuZGltZW5zaW9ucy5oZWlnaHQgLSB0aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzcyAvIDJdO1xuICAgIH1cblxufTtcblxuLyoqXG4gKiBNb3ZlIHRoZSBtYXJrZXIgc3luY2hyb25vdXNseVxuICovXG5EM1RhYmxlU2Nyb2xsQmFyLnByb3RvdHlwZS5tb3ZlU3luYyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYgKCF0aGlzLnRhYmxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuZWFjaChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gc2VsZi5nZXRQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICBpZiAocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSBkMy5zZWxlY3QodGhpcyk7XG5cbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcblxuICAgICAgICAgICAgICAgIGdyb3VwLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysoc2VsZi50YWJsZS5tYXJnaW4ubGVmdCArIHBvc2l0aW9uWzBdID4+IDApKycsJysoc2VsZi50YWJsZS5tYXJnaW4udG9wICsgcG9zaXRpb25bMV0gPj4gMCkrJyknKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlU2l6ZSgpO1xuXG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgc2Nyb2xsIGJhciBzaXplXG4gKi9cbkQzVGFibGVTY3JvbGxCYXIucHJvdG90eXBlLnVwZGF0ZVNpemUgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzY2FsZSwgc3RhcnQsIGVuZCwgbWluLCBxdWFudGl0eSwgZG9tYWluLCBtdWx0aXBsaWVyLCBwb3NpdGlvblJ1bGUsIHNpemVSdWxlO1xuXG4gICAgc3dpdGNoKHRoaXMub3B0aW9ucy5sYXlvdXQpIHtcblxuICAgICAgICBjYXNlIHRoaXMuTEFZT1VUX1ZFUlRJQ0FMOlxuXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMudGFibGUuZGF0YTtcbiAgICAgICAgICAgIHNjYWxlID0gdGhpcy50YWJsZS5zY2FsZXMueTtcbiAgICAgICAgICAgIGRvbWFpbiA9IHNjYWxlLmRvbWFpbigpO1xuICAgICAgICAgICAgc3RhcnQgPSBkb21haW5bMF07XG4gICAgICAgICAgICBlbmQgPSBkb21haW5bMV07XG5cbiAgICAgICAgICAgIGlmIChzdGFydCA9PSAwICYmIGVuZCA9PSBkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1pbiA9IDA7XG4gICAgICAgICAgICBxdWFudGl0eSA9IGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgbXVsdGlwbGllciA9IHRoaXMudGFibGUuZGltZW5zaW9ucy5oZWlnaHQgLyBxdWFudGl0eTtcbiAgICAgICAgICAgIHBvc2l0aW9uUnVsZSA9ICd5JztcbiAgICAgICAgICAgIHNpemVSdWxlID0gJ2hlaWdodCc7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdGhpcy5MQVlPVVRfSE9SSVpPTlRBTDpcblxuICAgICAgICAgICAgc2NhbGUgPSB0aGlzLnRhYmxlLnNjYWxlcy54O1xuICAgICAgICAgICAgZG9tYWluID0gc2NhbGUuZG9tYWluKCk7XG4gICAgICAgICAgICBzdGFydCA9IGRvbWFpblswXTtcbiAgICAgICAgICAgIGVuZCA9IGRvbWFpblsxXTtcblxuICAgICAgICAgICAgaWYgKCtzdGFydCA9PSArdGhpcy50YWJsZS5taW5YICYmICtlbmQgPT0gK3RoaXMudGFibGUubWF4WCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1pbiA9IHRoaXMudGFibGUubWluWDtcbiAgICAgICAgICAgIHF1YW50aXR5ID0gK3RoaXMudGFibGUubWF4WCAtIHRoaXMudGFibGUubWluWDtcbiAgICAgICAgICAgIG11bHRpcGxpZXIgPSB0aGlzLnRhYmxlLmRpbWVuc2lvbnMud2lkdGggLyBxdWFudGl0eTtcbiAgICAgICAgICAgIHBvc2l0aW9uUnVsZSA9ICd4JztcbiAgICAgICAgICAgIHNpemVSdWxlID0gJ3dpZHRoJztcblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5jb250YWluZXIuc2VsZWN0KCdyZWN0JylcbiAgICAgICAgLmF0dHIocG9zaXRpb25SdWxlLCAoK3N0YXJ0IC0gbWluKSAqIG11bHRpcGxpZXIpXG4gICAgICAgIC5hdHRyKHNpemVSdWxlLCAoZW5kIC0gc3RhcnQpICogbXVsdGlwbGllcik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVTY3JvbGxCYXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzL2V2ZW50cyc7XG5pbXBvcnQgZDMgZnJvbSAnZDMnO1xuaW1wb3J0IEQzVGFibGUgZnJvbSAnLi9EM1RhYmxlJztcblxudmFyIGQzVGltZWxpbmUgPSB7fTtcblxuLyoqXG4gKiBUYWJsZSBzdGF0aWMgbWFya2VyIHdoaWNoIGtub3dzIGhvdyB0byByZXByZXNlbnQgaXRzZWxmIGluIGEge0BsaW5rIGQzVGltZWxpbmUuRDNUYWJsZSNjb250YWluZXJ9XG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVTdGF0aWNNYXJrZXJPcHRpb25zfSBvcHRpb25zXG4gKiBAZXh0ZW5kcyB7RXZlbnRFbWl0dGVyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmQzVGltZWxpbmUuRDNUYWJsZVN0YXRpY01hcmtlciA9IGZ1bmN0aW9uIEQzVGFibGVTdGF0aWNNYXJrZXIob3B0aW9ucykge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlU3RhdGljTWFya2VyT3B0aW9uc31cbiAgICAgKi9cbiAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQodHJ1ZSwge30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZX1cbiAgICAgKi9cbiAgICB0aGlzLnRhYmxlID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqL1xuICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7ZDMuU2VsZWN0aW9ufVxuICAgICAqL1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHt7bGluZTogZDMuU2VsZWN0aW9uLCBsYWJlbDogZDMuU2VsZWN0aW9ufX1cbiAgICAgKi9cbiAgICB0aGlzLmVsZW1lbnRzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMudmFsdWUgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGFibGVSZXNpemVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl90YWJsZURlc3Ryb3lMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSBudWxsO1xufTtcblxudmFyIEQzVGFibGVTdGF0aWNNYXJrZXIgPSBkM1RpbWVsaW5lLkQzVGFibGVTdGF0aWNNYXJrZXI7XG5cbmluaGVyaXRzKEQzVGFibGVTdGF0aWNNYXJrZXIsIEV2ZW50RW1pdHRlcik7XG5cbkQzVGFibGVTdGF0aWNNYXJrZXIucHJvdG90eXBlLkxBWU9VVF9IT1JJWk9OVEFMID0gJ2hvcml6b250YWwnO1xuRDNUYWJsZVN0YXRpY01hcmtlci5wcm90b3R5cGUuTEFZT1VUX1ZFUlRJQ0FMID0gJ3ZlcnRpY2FsJztcblxuRDNUYWJsZVN0YXRpY01hcmtlci5wcm90b3R5cGUuSU5TRVJUX09OX1RPUCA9ICdpbnNlcnRPblRvcCc7XG5EM1RhYmxlU3RhdGljTWFya2VyLnByb3RvdHlwZS5JTlNFUlRfQkVISU5EID0gJ2luc2VydEJlaGluZCc7XG5cbi8qKlxuICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZVN0YXRpY01hcmtlck9wdGlvbnN9XG4gKi9cbkQzVGFibGVTdGF0aWNNYXJrZXIucHJvdG90eXBlLmRlZmF1bHRzID0ge1xuICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZCkgeyByZXR1cm4gZDsgfSxcbiAgICBpbnNlcnRpb25NZXRob2Q6IEQzVGFibGVTdGF0aWNNYXJrZXIucHJvdG90eXBlLklOU0VSVF9PTl9UT1AsXG4gICAgb3V0ZXJUaWNrU2l6ZTogMTAsXG4gICAgdGlja1BhZGRpbmc6IDMsXG4gICAgcm91bmRQb3NpdGlvbjogZmFsc2UsXG4gICAgYmVtQmxvY2tOYW1lOiAndGFibGVNYXJrZXInLFxuICAgIGJlbU1vZGlmaWVyczogW10sXG4gICAgbGF5b3V0OiBEM1RhYmxlU3RhdGljTWFya2VyLnByb3RvdHlwZS5MQVlPVVRfVkVSVElDQUwsXG4gICAgbGluZVNoYXBlOiAnbGluZScsXG4gICAgcmVjdFRoaWNrbmVzczogRDNUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMucm93SGVpZ2h0XG59O1xuXG4vKipcbiAqIFNldCB0aGUgdGFibGUgaXQgc2hvdWxkIGRyYXcgaXRzZWxmIG9udG9cbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlfSB0YWJsZVxuICovXG5EM1RhYmxlU3RhdGljTWFya2VyLnByb3RvdHlwZS5zZXRUYWJsZSA9IGZ1bmN0aW9uKHRhYmxlKSB7XG5cbiAgICB2YXIgcHJldmlvdXNUYWJsZSA9IHRoaXMudGFibGU7XG5cbiAgICB0aGlzLnRhYmxlID0gdGFibGUgJiYgdGFibGUgaW5zdGFuY2VvZiBEM1RhYmxlID8gdGFibGUgOiBudWxsO1xuXG4gICAgaWYgKHRoaXMudGFibGUpIHtcbiAgICAgICAgaWYgKHByZXZpb3VzVGFibGUgIT09IHRoaXMudGFibGUpIHtcbiAgICAgICAgICAgIGlmIChwcmV2aW91c1RhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51bmJpbmRUYWJsZShwcmV2aW91c1RhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYmluZFRhYmxlKCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCF0aGlzLnRhYmxlICYmIHByZXZpb3VzVGFibGUpIHtcbiAgICAgICAgdGhpcy51bmJpbmRUYWJsZShwcmV2aW91c1RhYmxlKTtcbiAgICB9XG5cbn07XG5cbi8qKlxuICogSGFuZGxlIGEgRDNUYWJsZSBiZWluZyBib3VuZFxuICovXG5EM1RhYmxlU3RhdGljTWFya2VyLnByb3RvdHlwZS5iaW5kVGFibGUgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBjbGFzc05hbWUgPSB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJyAnICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctLScgKyB0aGlzLm9wdGlvbnMubGF5b3V0O1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5iZW1Nb2RpZmllcnMgJiYgQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXJzKSAmJiB0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY2xhc3NOYW1lID0gY2xhc3NOYW1lICsgJyAnICsgdGhpcy5vcHRpb25zLmJlbU1vZGlmaWVycy5tYXAoZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy0tJyArIG1vZGlmaWVyO1xuICAgICAgICB9KS5qb2luKCcgJyk7XG4gICAgfVxuXG4gICAgc3dpdGNoKHRoaXMub3B0aW9ucy5pbnNlcnRpb25NZXRob2QpIHtcbiAgICAgICAgY2FzZSB0aGlzLklOU0VSVF9CRUhJTkQ6XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMudGFibGUuY29udGFpbmVyXG4gICAgICAgICAgICAgICAgLmluc2VydCgnZycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi50YWJsZS5lbGVtZW50cy5ib2R5Lm5vZGUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRoaXMuSU5TRVJUX09OX1RPUDpcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy50YWJsZS5jb250YWluZXJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCdnJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lclxuICAgICAgICAuZGF0dW0oe1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMudmFsdWVcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgY2xhc3NOYW1lKTtcblxuICAgIHN3aXRjaCh0aGlzLm9wdGlvbnMubGluZVNoYXBlKSB7XG4gICAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICAgICAgdGhpcy5lbGVtZW50cy5saW5lID0gdGhpcy5jb250YWluZXJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1saW5lJylcbiAgICAgICAgICAgICAgICAuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZWN0JzpcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMubGluZSA9IHRoaXMuY29udGFpbmVyXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctcmVjdCcpXG4gICAgICAgICAgICAgICAgLnN0eWxlKCdwb2ludGVyLWV2ZW50cycsICdub25lJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnRzLmxhYmVsID0gdGhpcy5jb250YWluZXJcbiAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxhYmVsJyk7XG5cbiAgICB0aGlzLnNpemVMaW5lQW5kTGFiZWwoKTtcblxuICAgIC8vIG9uIHRhYmxlIHJlc2l6ZSwgcmVzaXplIHRoZSBtYXJrZXIgYW5kIG1vdmUgaXRcbiAgICB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XG4gICAgICAgIHNlbGYucmVzaXplKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgICAgIHNlbGYubW92ZSh0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH07XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyKTtcblxuICAgIHRoaXMuX3RhYmxlRGVzdHJveUxpc3RlbmVyID0gZnVuY3Rpb24odGFibGUpIHtcbiAgICAgICAgc2VsZi51bmJpbmRUYWJsZSh0YWJsZSk7XG4gICAgfTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOmRlc3Ryb3knLCB0aGlzLl90YWJsZURlc3Ryb3lMaXN0ZW5lcik7XG5cbiAgICB0aGlzLmVtaXQoJ21hcmtlcjpib3VuZCcpO1xuXG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29ycmVjdCBkaW1lbnNpb25zIGFuZCBsYWJlbCBjb250ZW50XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKi9cbkQzVGFibGVTdGF0aWNNYXJrZXIucHJvdG90eXBlLnNpemVMaW5lQW5kTGFiZWwgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHZhciBsYXlvdXQgPSB0aGlzLm9wdGlvbnMubGF5b3V0O1xuXG4gICAgdmFyIGxpbmUgPSB0aGlzLmVsZW1lbnRzLmxpbmU7XG4gICAgdmFyIGxhYmVsID0gdGhpcy5lbGVtZW50cy5sYWJlbDtcblxuICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgIGxpbmUgPSBsaW5lLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBsYWJlbCA9IGxhYmVsLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH1cblxuICAgIHN3aXRjaChsYXlvdXQpIHtcblxuICAgICAgICBjYXNlIHRoaXMuTEFZT1VUX1ZFUlRJQ0FMOlxuXG4gICAgICAgICAgICBzd2l0Y2godGhpcy5vcHRpb25zLmxpbmVTaGFwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICBsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTE6IC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5MjogdGhpcy50YWJsZS5kaW1lbnNpb25zLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JlY3QnOlxuICAgICAgICAgICAgICAgICAgICBsaW5lLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogLXRoaXMub3B0aW9ucy5yZWN0VGhpY2tuZXNzLzIsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5vcHRpb25zLnJlY3RUaGlja25lc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplICsgdGhpcy50YWJsZS5kaW1lbnNpb25zLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2R5JywgLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLXRoaXMub3B0aW9ucy50aWNrUGFkZGluZyk7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdGhpcy5MQVlPVVRfSE9SSVpPTlRBTDpcblxuICAgICAgICAgICAgc3dpdGNoKHRoaXMub3B0aW9ucy5saW5lU2hhcGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgxOiAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDI6IHRoaXMudGFibGUuZGltZW5zaW9ucy53aWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JlY3QnOlxuICAgICAgICAgICAgICAgICAgICBsaW5lLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMub3B0aW9ucy5yZWN0VGhpY2tuZXNzLzIsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUgKyB0aGlzLnRhYmxlLmRpbWVuc2lvbnMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXMub3B0aW9ucy5yZWN0VGhpY2tuZXNzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgICAgICAuYXR0cignZHgnLCAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUtdGhpcy5vcHRpb25zLnRpY2tQYWRkaW5nKVxuICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsIDQpO1xuXG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbn07XG5cbi8qKlxuICogSGFuZGxlIEQzVGFibGUgdW5ib3VuZFxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlfSBwcmV2aW91c1RhYmxlXG4gKi9cbkQzVGFibGVTdGF0aWNNYXJrZXIucHJvdG90eXBlLnVuYmluZFRhYmxlID0gZnVuY3Rpb24ocHJldmlvdXNUYWJsZSkge1xuXG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOmRlc3Ryb3knLCB0aGlzLl90YWJsZURlc3Ryb3lMaXN0ZW5lcik7XG5cbiAgICBpZiAodGhpcy5jb250YWluZXIpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICBwcmV2aW91c1RhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgICAgIHRoaXMuX21vdmVBRiA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlRGVzdHJveUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuZW1pdCgnbWFya2VyOnVuYm91bmQnLCBwcmV2aW91c1RhYmxlKTtcbn07XG5cbi8qKlxuICogTW92ZSB0aGUgbWFya2VyIHJlcXVlc3RpbmcgYW4gYW5pbWF0aW9uIGZyYW1lXG4gKi9cbkQzVGFibGVTdGF0aWNNYXJrZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGhpcy50YWJsZS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9tb3ZlQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX21vdmVBRiA9IHRoaXMudGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubW92ZVN5bmMuYmluZCh0aGlzKSk7XG5cbn07XG5cblxuLyoqXG4gKiBAdG9kbyBkb2N1bWVudCB0aGlzXG4gKlxuICogQHJldHVybnMgeyp9XG4gKi9cbkQzVGFibGVTdGF0aWNNYXJrZXIucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIE1vdmUgdGhlIG1hcmtlciBzeW5jaHJvbm91c2x5XG4gKi9cbkQzVGFibGVTdGF0aWNNYXJrZXIucHJvdG90eXBlLm1vdmVTeW5jID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoIXRoaXMudGFibGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbGF5b3V0ID0gdGhpcy5vcHRpb25zLmxheW91dDtcblxuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb24oKTtcblxuICAgIHRoaXMuY29udGFpbmVyXG4gICAgICAgIC5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgZmluYWxQb3NpdGlvbiA9IFswLCAwXSwgcG9zaXRpb25JbmRleDtcblxuICAgICAgICAgICAgc3dpdGNoKGxheW91dCkge1xuICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5MQVlPVVRfVkVSVElDQUw6XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHNlbGYuTEFZT1VUX0hPUklaT05UQUw6XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uSW5kZXggPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaW5hbFBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdID0gcG9zaXRpb247XG5cbiAgICAgICAgICAgIHZhciBncm91cCA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgc2VsZi5zaG93KCk7XG5cbiAgICAgICAgICAgIGdyb3VwLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysoc2VsZi50YWJsZS5tYXJnaW4ubGVmdCArIGZpbmFsUG9zaXRpb25bMF0gPj4gMCkrJywnKyhzZWxmLnRhYmxlLm1hcmdpbi50b3AgKyBmaW5hbFBvc2l0aW9uWzFdID4+IDApKycpJyk7XG5cbiAgICAgICAgICAgIGdyb3VwLnNlbGVjdCgnLicgKyBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1sYWJlbCcpXG4gICAgICAgICAgICAgICAgLnRleHQoc2VsZi5vcHRpb25zLmZvcm1hdHRlci5jYWxsKHNlbGYsIGZpbmFsUG9zaXRpb24pKTtcblxuICAgICAgICB9KTtcblxuXG59O1xuXG4vKipcbiAqIFNob3cgdGhlIG1hcmtlclxuICovXG5EM1RhYmxlU3RhdGljTWFya2VyLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLnZpc2libGUgJiYgdGhpcy5jb250YWluZXIpIHtcbiAgICAgICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUoJ2Rpc3BsYXknLCAnJyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBIaWRlIHRoZSBtYXJrZXJcbiAqL1xuRDNUYWJsZVN0YXRpY01hcmtlci5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnZpc2libGUgJiYgdGhpcy5jb250YWluZXIpIHtcbiAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnN0eWxlKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEltcGxlbWVudCByZXNpemluZyB0aGUgbWFya2VyLCB3aGljaCBzaG91bGQgYmUgY2FsbGVkIG9uIEQzVGFibGUgcmVzaXplIGV2ZW50XG4gKlxuICogQHBhcmFtIHRyYW5zaXRpb25EdXJhdGlvblxuICovXG5EM1RhYmxlU3RhdGljTWFya2VyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIHRoaXMuc2l6ZUxpbmVBbmRMYWJlbCh0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVTdGF0aWNNYXJrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGVNYXJrZXIgZnJvbSAnLi9EM1RhYmxlTWFya2VyJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbnZhciBkM1RpbWVsaW5lID0ge307XG5cbi8qKlxuICogQSBEM1RhYmxlVmFsdWVUcmFja2VyIGlzIGEgRDNUYWJsZU1hcmtlciB3aGljaCBiZWhhdmVzIGFsb25lIGFuZCBjYW4gYmUgc3RhcnRlZCBhbmQgc3RvcHBlZCxcbiAqIGdldHRpbmcgaXRzIHZhbHVlIGZyb20gdGhlIGltcGxlbWVudGVkIHZhbHVlR2V0dGVyXG4gKlxuICogQHNlZSBkMy50aW1lciB0byB1bmRlcnN0YW5kIGhvdyBpdCBiZWhhdmVzIGF1dG9tYXRpY2FsbHlcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlU3RhdGljTWFya2VyT3B0aW9uc30gb3B0aW9uc1xuICogQGV4dGVuZHMge2QzVGltZWxpbmUuRDNUYWJsZU1hcmtlcn1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5kM1RpbWVsaW5lLkQzVGFibGVWYWx1ZVRyYWNrZXIgPSBmdW5jdGlvbiBEM1RhYmxlVmFsdWVUcmFja2VyKG9wdGlvbnMpIHtcbiAgICBEM1RhYmxlTWFya2VyLmNhbGwodGhpcywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbn07XG5cbnZhciBEM1RhYmxlVmFsdWVUcmFja2VyID0gZDNUaW1lbGluZS5EM1RhYmxlVmFsdWVUcmFja2VyO1xuXG5pbmhlcml0cyhEM1RhYmxlVmFsdWVUcmFja2VyLCBEM1RhYmxlTWFya2VyKTtcblxuLyoqXG4gKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RhYmxlU3RhdGljTWFya2VyT3B0aW9uc31cbiAqL1xuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGVNYXJrZXIucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtTW9kaWZpZXJzOiBbJ3ZhbHVlVHJhY2tlciddXG59KTtcblxuLyoqXG4gKiBCeSBkZWZhdWx0LCB0aGUgdmFsdWUgaXQgZ2V0cyBpcyAwXG4gKlxuICogQHJldHVybnMge051bWJlcn1cbiAqL1xuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUudmFsdWVHZXR0ZXIgPSBmdW5jdGlvbigpIHtcblxuICAgcmV0dXJuIDA7XG5cbn07XG5cbi8qKlxuICogU3RhcnQgdGhlIHRyYWNrZXJcbiAqL1xuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cbiAgICBkMy50aW1lcihmdW5jdGlvbigpIHtcblxuICAgICAgICBzZWxmLnNldFZhbHVlKHNlbGYudmFsdWVHZXR0ZXIoKSk7XG5cbiAgICAgICAgcmV0dXJuICFzZWxmLmVuYWJsZWQ7XG5cbiAgICB9KTtcbn07XG5cbi8qKlxuICogU3RvcCB0aGUgdHJhY2tlclxuICovXG5EM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEM1RhYmxlVmFsdWVUcmFja2VyO1xuIiwiLyogZ2xvYmFsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRDNCbG9ja1RhYmxlIGZyb20gJy4vRDNCbG9ja1RhYmxlJztcbmltcG9ydCBkMyBmcm9tICdkMyc7XG5cbnZhciBkM1RpbWVsaW5lID0ge307XG5cbi8qKlxuICogVGltZWxpbmUgdmVyc2lvbiBvZiBhIEQzQmxvY2tUYWJsZSB3aXRoXG4gKiAgLSB0aW1lIHNjYWxlIGFzIHggc2NhbGVcbiAqICAtIGFuZCBzcGVjaWFsIG1ldGhvZHMgcHJveHlpbmcgdG8gRDNCbG9ja1RhYmxlIG1ldGhvZHNcbiAqXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGltZWxpbmVPcHRpb25zfSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIHtkM1RpbWVsaW5lLkQzQmxvY2tUYWJsZX1cbiAqL1xuZDNUaW1lbGluZS5EM1RpbWVsaW5lID0gZnVuY3Rpb24gRDNUaW1lbGluZShvcHRpb25zKSB7XG5cbiAgICBEM0Jsb2NrVGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA9IHRoaXMub3B0aW9ucy5taW5pbXVtVGltZUludGVydmFsO1xuXG4gICAgLyoqXG4gICAgICogQG5hbWUgZDNUaW1lbGluZS5EM1RpbWVsaW5lI29wdGlvbnNcbiAgICAgKiBAdHlwZSB7ZDNUaW1lbGluZS5EM1RpbWVsaW5lT3B0aW9uc31cbiAgICAgKi9cbn07XG5cbnZhciBEM1RpbWVsaW5lID0gZDNUaW1lbGluZS5EM1RpbWVsaW5lO1xuXG5pbmhlcml0cyhEM1RpbWVsaW5lLCBEM0Jsb2NrVGFibGUpO1xuXG4vKipcbiAqIEB0eXBlIHtkM1RpbWVsaW5lLkQzVGltZWxpbmVPcHRpb25zfVxuICovXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbUJsb2NrTmFtZTogJ3RpbWVsaW5lJyxcbiAgICBiZW1CbG9ja01vZGlmaWVyOiAnJyxcbiAgICB4QXhpc1RpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkLmdldE1pbnV0ZXMoKSAlIDE1ID8gJycgOiBkMy50aW1lLmZvcm1hdCgnJUg6JU0nKShkKTtcbiAgICB9LFxuICAgIHhBeGlzU3Ryb2tlV2lkdGg6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQuZ2V0TWludXRlcygpICUzMCA/IDEgOiAyO1xuICAgIH0sXG4gICAgbWluaW11bUNvbHVtbldpZHRoOiAzMCxcbiAgICBtaW5pbXVtVGltZUludGVydmFsOiAzZTUsXG4gICAgYXZhaWxhYmxlVGltZUludGVydmFsczogWyA2ZTQsIDNlNSwgOWU1LCAxLjhlNiwgMy42ZTYsIDcuMmU2LCAxLjQ0ZTcsIDIuODhlNywgNC4zMmU3LCA4LjY0ZTcgXVxufSk7XG5cbi8qKlxuICogVGltZSBzY2FsZSBhcyB4IHNjYWxlXG4gKiBAcmV0dXJucyB7ZDMudGltZS5TY2FsZX1cbiAqL1xuRDNUaW1lbGluZS5wcm90b3R5cGUueFNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy50aW1lLnNjYWxlKCk7XG59O1xuXG4vKipcbiAqIFVzZSBkYXRhIHN0YXJ0IHByb3BlcnR5IHdpdGhvdXQgY2FzdGluZ1xuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RhYmxlRWxlbWVudH0gZGF0YVxuICogQHJldHVybnMge3N0YXJ0fGFueX1cbiAqL1xuRDNUaW1lbGluZS5wcm90b3R5cGUuZ2V0RGF0YVN0YXJ0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBkYXRhLnN0YXJ0O1xufTtcblxuLyoqXG4gKiBVc2UgZGF0YSBlbmQgcHJvcGVydHkgd2l0aG91dCBjYXN0aW5nXG4gKlxuICogQHBhcmFtIHtkM1RpbWVsaW5lLkQzVGFibGVFbGVtZW50fSBkYXRhXG4gKiBAcmV0dXJucyB7c3RhcnR8YW55fVxuICovXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5nZXREYXRhRW5kID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBkYXRhLmVuZDtcbn07XG5cbi8qKlxuICogT3ZlcnJpZGUgdXBkYXRlIHggYXhpcyBpbnRlcnZhbCBpbXBsZW1lbnQgd2l0aCBjb2x1bW4gd2lkdGggdXBkYXRlIGJhc2VkIG9uIGluc3RhbmNlIG9wdGlvbnM6XG4gKiAgLSBtaW5pbXVtQ29sdW1uV2lkdGg6IHRoZSBjb2x1bW4gd2lkdGggc2hvdWxkIG5ldmVyIGJlIGxvd2VyIHRoYW4gdGhhdFxuICogIC0gbWluaW11bVRpbWVJbnRlcnZhbDogdGhlIHRpbWUgaW50ZXJ2YWwgc2hvdWxkIG5ldmVyIGJlIGxvd2VyIHRoYW4gdGhhdFxuICogIC0gYXZhaWxhYmxlVGltZUludGVydmFsczogdGhlIGxpc3Qgb2YgYXZhaWxhYmxlIHRpbWUgaW50ZXJ2YWxzXG4gKlxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUaW1lbGluZX1cbiAqL1xuRDNUaW1lbGluZS5wcm90b3R5cGUudXBkYXRlWEF4aXNJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIG1pbmltdW1UaW1lSW50ZXJ2YWwgPSB0aGlzLm9wdGlvbnMubWluaW11bVRpbWVJbnRlcnZhbDtcbiAgICB2YXIgbWluaW11bUNvbHVtbldpZHRoID0gdGhpcy5vcHRpb25zLm1pbmltdW1Db2x1bW5XaWR0aDtcbiAgICB2YXIgY3VycmVudFRpbWVJbnRlcnZhbCA9IHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbDtcbiAgICB2YXIgYXZhaWxhYmxlVGltZUludGVydmFscyA9IHRoaXMub3B0aW9ucy5hdmFpbGFibGVUaW1lSW50ZXJ2YWxzO1xuICAgIHZhciBjdXJyZW50VGltZUludGVydmFsSW5kZXggPSBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzLmluZGV4T2YoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgdmFyIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHRoaXMuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbCk7XG5cbiAgICAvLyBwcml2YXRlIGZ1bmN0aW9uIHRvIGluY3JlYXNlL2RlY3JlYXNlIHRpbWUgaW50ZXJ2YWwgYnkgaW5kZXggZGVsdGEgaW4gdGhlIGF2YWlsYWJsZSB0aW1lIGludGVydmFscyBhbmQgdXBkYXRlIHRpbWUgaW50ZXJ2YWwgYW5kIGNvbHVtbiB3aWR0aFxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbChkZWx0YSkge1xuICAgICAgICBjdXJyZW50VGltZUludGVydmFsSW5kZXggKz0gZGVsdGE7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzW2N1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleF07XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgfVxuXG4gICAgaWYgKGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBpZiBsb3dlciwgaW5jcmVhc2VcbiAgICAgICAgaWYgKGN1cnJlbnRDb2x1bW5XaWR0aCA8IG1pbmltdW1Db2x1bW5XaWR0aCkge1xuICAgICAgICAgICAgLy8gc3RvcCB3aGVuIGl0J3MgaGlnaGVyXG4gICAgICAgICAgICB3aGlsZShjdXJyZW50Q29sdW1uV2lkdGggPCBtaW5pbXVtQ29sdW1uV2lkdGggJiYgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4IDwgYXZhaWxhYmxlVGltZUludGVydmFscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlVGltZUludGVydmFsKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGlmIGdyZWF0ZXIgZGVjcmVhc2VcbiAgICAgICAgZWxzZSBpZiAoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoKSB7XG4gICAgICAgICAgICAvLyBzdG9wIHdoZW4gaXQncyBsb3dlclxuICAgICAgICAgICAgd2hpbGUoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoICYmIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGhlbiBpbmNyZWFzZSBvbmNlXG4gICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB0aW1lIGludGVydmFsIGlzIGxvd2VyIHRoYW4gdGhlIG1pbmltdW0sIHNldCBpdCB0byB0aGUgbWluaW11bSBhbmQgY29tcHV0ZSBjb2x1bW4gd2lkdGhcbiAgICBpZiAoY3VycmVudFRpbWVJbnRlcnZhbCA8IG1pbmltdW1UaW1lSW50ZXJ2YWwpIHtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbCA9IG1pbmltdW1UaW1lSW50ZXJ2YWw7XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbClcbiAgICB9XG5cbiAgICAvLyBrZWVwIGZsb29yIHZhbHVlc1xuICAgIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA9IE1hdGguZmxvb3IoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgdGhpcy5jb2x1bW5XaWR0aCA9IE1hdGguZmxvb3IoY3VycmVudENvbHVtbldpZHRoKTtcblxuICAgIC8vIHVwZGF0ZSBheGlzZXMgdGlja3NcbiAgICBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gMy42ZTYpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiA2ZTQpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiAxZTMpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQcm94eSB0byB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlI3NldFhSYW5nZX1cbiAqXG4gKiBAcGFyYW0ge0RhdGV9IG1pbkRhdGVcbiAqIEBwYXJhbSB7RGF0ZX0gbWF4RGF0ZVxuICogQHJldHVybnMge2QzVGltZWxpbmUuRDNUaW1lbGluZX1cbiAqL1xuRDNUaW1lbGluZS5wcm90b3R5cGUuc2V0VGltZVJhbmdlID0gZnVuY3Rpb24obWluRGF0ZSwgbWF4RGF0ZSkge1xuICAgIHJldHVybiB0aGlzLnNldFhSYW5nZShtaW5EYXRlLCBtYXhEYXRlKTtcbn07XG5cbi8qKlxuICogQ29tcHV0ZSBjb2x1bW4gd2lkdGggZnJvbSBhIHByb3ZpZGVkIHRpbWUgaW50ZXJ2YWxcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZUludGVydmFsXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICogQHByaXZhdGVcbiAqL1xuRDNUaW1lbGluZS5wcm90b3R5cGUuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwgPSBmdW5jdGlvbih0aW1lSW50ZXJ2YWwpIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsZXMueChuZXcgRGF0ZSh0aW1lSW50ZXJ2YWwpKSAtIHRoaXMuc2NhbGVzLngobmV3IERhdGUoMCkpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNUaW1lbGluZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZVZhbHVlVHJhY2tlciBmcm9tICcuL0QzVGFibGVWYWx1ZVRyYWNrZXInO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxudmFyIGQzVGltZWxpbmUgPSB7fTtcblxuLyoqXG4gKiBUaW1lbGluZSB0aW1lIHRyYWNrZXIgd2hpY2ggY2FuIGJlIHN0YXJ0ZWQgYW5kIHN0b3BwZWQgYXMgaXQgaXMgYSB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlVmFsdWVUcmFja2VyfVxuICpcbiAqIEBleHRlbmRzIHtkM1RpbWVsaW5lLkQzVGFibGVWYWx1ZVRyYWNrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZDNUaW1lbGluZS5EM1RpbWVsaW5lVGltZVRyYWNrZXIgPSBmdW5jdGlvbiBEM1RpbWVsaW5lVGltZVRyYWNrZXIob3B0aW9ucykge1xuICAgIEQzVGFibGVWYWx1ZVRyYWNrZXIuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIC8qKlxuICAgICAqIEBuYW1lIGQzVGltZWxpbmUuRDNUaW1lbGluZVRpbWVUcmFja2VyI3ZhbHVlXG4gICAgICogQHR5cGUge0RhdGV9XG4gICAgICovXG59O1xuXG52YXIgRDNUaW1lbGluZVRpbWVUcmFja2VyID0gZDNUaW1lbGluZS5EM1RpbWVsaW5lVGltZVRyYWNrZXI7XG5cbmluaGVyaXRzKEQzVGltZWxpbmVUaW1lVHJhY2tlciwgRDNUYWJsZVZhbHVlVHJhY2tlcik7XG5cbi8qKlxuICogQHR5cGUge2QzVGltZWxpbmUuRDNUYWJsZVN0YXRpY01hcmtlck9wdGlvbnN9XG4gKi9cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUuZGVmYXVsdHMgPSBleHRlbmQodHJ1ZSwge30sIEQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzLCB7XG4gICAgYmVtQmxvY2tOYW1lOiAndGltZWxpbmVNYXJrZXInLFxuICAgIGJlbU1vZGlmaWVyczogWyd0aW1lVHJhY2tlciddLFxuICAgIGxheW91dDogJ3ZlcnRpY2FsJ1xufSk7XG5cbi8qKlxuICogR2V0IHRoZSBjdXJyZW50IHRpbWVcbiAqIFRvIGJlIG92ZXJyaWRkZW4gaWYgeW91IHdpc2ggdG8gcmVwcmVzZW50IGEgYmlhc2VkIHRpbWUgZm9yIGV4YW1wbGVcbiAqXG4gKiBAcmV0dXJucyB7RGF0ZX1cbiAqL1xuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS50aW1lR2V0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCk7XG59O1xuXG4vKipcbiAqIFByb3h5IHRvIHtAbGluayBkM1RpbWVsaW5lLkQzVGFibGVWYWx1ZVRyYWNrZXIjdGltZUdldHRlcn1cbiAqXG4gKiBAcmV0dXJucyB7RGF0ZX1cbiAqL1xuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS52YWx1ZUdldHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRpbWVHZXR0ZXIoKTtcbn07XG5cbi8qKlxuICogQ29tcGFyZSB0aW1lcywgZGVmYXVsdHMgdG8ge0BsaW5rIGQzVGltZWxpbmUuRDNUYWJsZVZhbHVlVHJhY2tlciN2YWx1ZUNvbXBhcmF0b3J9XG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufCp9XG4gKi9cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudGltZUNvbXBhcmF0b3IgPSBEM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS52YWx1ZUNvbXBhcmF0b3I7XG5cbi8qKlxuICogUHJveHkgdG8ge0BsaW5rIGQzVGltZWxpbmUuRDNUaW1lbGluZVRpbWVUcmFja2VyLnRpbWVDb21wYXJhdG9yfVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gYVxuICogQHBhcmFtIHtEYXRlfSBiXG4gKi9cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudmFsdWVDb21wYXJhdG9yID0gZnVuY3Rpb24oYSxiKSB7XG4gICAgcmV0dXJuIHRoaXMudGltZUNvbXBhcmF0b3IoYSxiKTtcbn07XG5cbi8qKlxuICogUHJveHkgdG8ge0BsaW5rIGQzVGltZWxpbmUuRDNUYWJsZVZhbHVlVHJhY2tlciNzZXRWYWx1ZX1cbiAqIFRvIGJlIG92ZXJyaWRkZW4gaWYgeW91IHdoaWNoIHRvIGFsdGVyIHRoZSB2YWx1ZSBzZXRcbiAqXG4gKiBAcGFyYW0ge0RhdGV9IHRpbWVcbiAqL1xuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS5zZXRUaW1lID0gZnVuY3Rpb24odGltZSkge1xuICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRpbWUpO1xufTtcblxuLyoqXG4gKiBQcm94eSB0byB7QGxpbmsgZDNUaW1lbGluZS5EM1RhYmxlVmFsdWVUcmFja2VyI3NldFRhYmxlfVxuICpcbiAqIEBwYXJhbSB7ZDNUaW1lbGluZS5EM1RpbWVsaW5lfSB0aW1lbGluZVxuICovXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnNldFRpbWVsaW5lID0gRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuc2V0VGFibGU7XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUaW1lbGluZVRpbWVUcmFja2VyO1xuIl19
(1)
});
;