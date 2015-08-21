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
 * Add behaviors to a D3Table to handle elements as visual blocks with:
 *  - element drag (+ automatic scroll)
 *  - element clipping
 *  - element text (+ alignment)
 *
 * @param {D3TableBlockOptions} options
 * @extends {D3Table}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3BlockTable(options) {
    _D3Table2['default'].call(this, options);

    /**
     * @name D3BlockTable#options
     * @type {D3TableBlockOptions}
     */
}

(0, _inherits2['default'])(D3BlockTable, _D3Table2['default']);

/**
 * @type {D3TableBlockOptions}
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
 * @param {D3TableElement} element
 * @returns {String}
 */
D3BlockTable.prototype.generateClipPathId = function (element) {
    return this.options.bemBlockName + '-elementClipPath_' + this.instanceNumber + '_' + element.uid;
};

/**
 * Compute the clip path link for each element
 *
 * @param {D3TableElement} element
 * @returns {String}
 */
D3BlockTable.prototype.generateClipPathLink = function (element) {
    return 'url(#' + this.generateClipPathId(element) + ')';
};

/**
 * Compute the clip rect id for each element
 *
 * @param {D3TableElement} element
 * @returns {String}
 */
D3BlockTable.prototype.generateClipRectId = function (element) {
    return this.options.bemBlockName + '-elementClipRect_' + this.instanceNumber + '_' + element.uid;
};

/**
 * Compute the clip rect link for each element
 *
 * @param {D3TableElement} element
 * @returns {String}
 */
D3BlockTable.prototype.generateClipRectLink = function (element) {
    return '#' + this.generateClipRectId(element);
};

/**
 * Implements element entering:
 *  - append clipped rect
 *  - append text
 *  - call {@link D3BlockTable#elementContentEnter}
 *  - call custom drag behavior
 *
 * @param {d3.Selection} selection
 * @param {D3TableElement} element
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
 * @param {D3TableElement} element
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
 *  - call {@link D3BlockTable#elementContentUpdate}
 *
 * @param {d3.Selection} selection
 * @param {D3TableElement} element
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
 * @param {D3TableElement} element
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
 * @param {D3TableElement} element
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
 * An instance of D3Table uses d3.js to build a svg grid with axises.
 * You set a data set with {@link D3Table.setData}.
 * Each group of element {@link D3TableRow} is drawn in rows (y axis)
 * and each element {@link D3TableElement} of a row is drawn in this row
 * There is no graphical element for rows.
 *
 * The provided nested data set is first flattened to enable transition between differents rows.
 *
 * @param {D3TableOptions} options
 * @constructor
 */

var _d32 = _interopRequireDefault(_d3);

function D3Table(options) {

    _eventsEvents2['default'].call(this);

    D3Table.instancesCount += 1;

    this.instanceNumber = D3Table.instancesCount;

    /**
     * @type {D3TableOptions}
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
}

(0, _inherits2['default'])(D3Table, _eventsEvents2['default']);

/**
 * @type {D3TableOptions}
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
 * @returns {D3Table}
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

/**
 * Set available width and height so that every thing update correspondingly
 *
 * @param {Number} availableWidth
 * @param {Number} availableHeight
 * @returns {D3Table}
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
 * @returns {D3Table}
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
 * @returns {D3Table}
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
 * @returns {D3Table}
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
 * @returns {D3Table}
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
 * @returns {D3Table}
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
 *
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
 *
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

/**
 * Get the row holding the provided element (reference equality test)
 *
 * @param {D3TableElement} element
 * @returns {D3TableRow}
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
 * @param {D3TableElement} element
 * @returns {string}
 */
D3Table.prototype.getTransformFromData = function (element) {
    return 'translate(' + this.scales.x(this.getDataStart(element)) + ',' + this.scales.y(element.rowIndex) + ')';
};

/**
 * Returns true if the element with the provided bound data should be culled
 *
 * @param {D3TableElement} data
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
 * @param {D3TableElement} data
 * @returns {number}
 */
D3Table.prototype.getDataStart = function (data) {
    return +data.start;
};

/**
 * Get end value of the provided data, used to represent element end
 *
 * @param {D3TableElement} data
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
 * @returns {D3Table}
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
                 * @param {D3TableElement} data
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
                 * @param {D3TableElement} data
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
             * @param {D3TableElement} data
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
         * @param {D3TableElement} data
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
 * @param {D3TableElement} element
 * @returns {d3.Selection}
 */
D3Table.prototype.elementEnter = function (selection, element) {
    return selection;
};

/**
 * @param {d3.Selection} selection
 * @param {D3TableElement} element
 * @param {Number} transitionDuration
 * @returns {d3.Selection}
 */
D3Table.prototype.elementUpdate = function (selection, element, transitionDuration) {
    return selection;
};

/**
 * @param {d3.Selection} selection
 * @param {D3TableElement} element
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
 * @returns {D3Table}
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

/**
 * Table marker options which knows how to represent itself in a {@link D3Table#container}
 *
 * @param {D3TableMarkerOptions} options
 * @constructor
 */

var _D3Table2 = _interopRequireDefault(_D3Table);

function D3TableMarker(options) {

    _eventsEvents2['default'].call(this);

    this.options = (0, _extend2['default'])(true, {}, this.defaults, options);

    /**
     * @type {D3Table}
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
}

(0, _inherits2['default'])(D3TableMarker, _eventsEvents2['default']);

D3TableMarker.prototype.LAYOUT_HORIZONTAL = 'horizontal';
D3TableMarker.prototype.LAYOUT_VERTICAL = 'vertical';

/**
 * @type {D3TableMarkerOptions}
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
 * @param {D3Table} previousTable
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

/**
 * Mouse position tracker which responds to D3Table events (which listens itself to mouse events)
 *
 * @param {D3TableMouseTrackerOptions} options
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

    /**
     * @name D3TableMouseTracker#options
     * @type {D3TableMouseTrackerOptions}
     */
}

(0, _inherits2['default'])(D3TableMouseTracker, _D3TableMarker2['default']);

/**
 * @type {D3TableMouseTrackerOptions}
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
 * @param {D3Table} table
 * @param {d3.Selection} selection
 * @param {d3.Event} d3Event
 * @param {Function} getTime
 * @param {Function} getRow
 *
 * @see D3Table#emitDetailedEvent for arguments description
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
 * @param {D3Table} table
 * @param {d3.Selection} selection
 * @param {d3.Event} d3Event
 * @param {Function} getTime
 * @param {Function} getRow
 *
 * @see D3Table#emitDetailedEvent for arguments description
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
 * @param {D3Table} table
 * @param {d3.Selection} selection
 * @param {d3.Event} d3Event
 * @param {Function} getTime
 * @param {Function} getRow
 *
 * @see D3Table#emitDetailedEvent for arguments description
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
 * @param {D3Table} table
 * @param {d3.Selection} selection
 * @param {d3.Event} d3Event
 * @param {Function} getTime
 * @param {Function} getRow
 *
 * @see D3Table#emitDetailedEvent for arguments description
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

/**
 * A D3TableValueTracker is a D3TableMarker which behaves alone and can be started and stopped,
 * getting its value from the implemented valueGetter
 *
 * @see d3.timer to understand how it behaves automatically
 * @param {D3TableMarkerOptions} options
 * @extends {D3TableMarker}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3TableValueTracker(options) {
  _D3TableMarker2['default'].call(this, options);

  this.enabled = false;
}

(0, _inherits2['default'])(D3TableValueTracker, _D3TableMarker2['default']);

/**
 * @type {D3TableMarkerOptions}
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

/**
 * Timeline version of a D3BlockTable with
 *  - time scale as x scale
 *  - and special methods proxying to D3BlockTable methods
 *
 *
 * @param {D3TimelineOptions} options
 * @constructor
 * @extends {D3BlockTable}
 */

var _d32 = _interopRequireDefault(_d3);

function D3Timeline(options) {

    _D3BlockTable2['default'].call(this, options);

    this.currentTimeInterval = this.options.minimumTimeInterval;

    /**
     * @name D3Timeline#options
     * @type {D3TimelineOptions}
     */
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
 * @param {D3TableElement} data
 * @returns {start|any}
 */
D3Timeline.prototype.getDataStart = function (data) {
    return data.start;
};

/**
 * Use data end property without casting
 *
 * @param {D3TableElement} data
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
 * @returns {D3Timeline}
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
 * Proxy to {@link D3Table#setXRange}
 *
 * @param {Date} minDate
 * @param {Date} maxDate
 * @returns {D3Timeline}
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

/**
 * Timeline time tracker which can be started and stopped as it is a {@link D3TableValueTracker}
 *
 * @extends {D3TableValueTracker}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3TimelineTimeTracker(options) {
  _D3TableValueTracker2['default'].call(this, options);

  /**
   * @name D3TimelineTimeTracker#value
   * @type {Date}
   */
}

(0, _inherits2['default'])(D3TimelineTimeTracker, _D3TableValueTracker2['default']);

/**
 * @type {D3TableMarkerOptions}
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
 * Proxy to {@link D3TableValueTracker#timeGetter}
 *
 * @returns {Date}
 */
D3TimelineTimeTracker.prototype.valueGetter = D3TimelineTimeTracker.prototype.timeGetter;

/**
 * Compare times, defaults to {@link D3TableValueTracker#valueComparator}
 *
 * @type {Function|*}
 */
D3TimelineTimeTracker.prototype.timeComparator = _D3TableValueTracker2['default'].prototype.valueComparator;

/**
 * Proxy to {@link D3TimelineTimeTracker.timeComparator}
 *
 * @param {Date} a
 * @param {Date} b
 */
D3TimelineTimeTracker.prototype.valueComparator = function (a, b) {
  return this.timeComparator(a, b);
};

/**
 * Proxy to {@link D3TableValueTracker#setValue}
 * To be overridden if you which to alter the value set
 *
 * @param {Date} time
 */
D3TimelineTimeTracker.prototype.setTime = _D3TableValueTracker2['default'].prototype.setValue;

/**
 * Proxy to {@link D3TableValueTracker#setTable}
 *
 * @param {D3Timeline} timeline
 */
D3TimelineTimeTracker.prototype.setTimeline = _D3TableValueTracker2['default'].prototype.setTable;

module.exports = D3TimelineTimeTracker;

},{"./D3TableValueTracker":9,"extend":3,"inherits":4}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9pbmRleC5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9ob21lL2FkbWluaXN0cmF0ZXVyL3dvcmtzcGFjZS9kMy10aW1lbGluZS9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL2hvbWUvYWRtaW5pc3RyYXRldXIvd29ya3NwYWNlL2QzLXRpbWVsaW5lL3NyYy9EM0Jsb2NrVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNYXJrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGFibGVWYWx1ZVRyYWNrZXIuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmUuanMiLCIvaG9tZS9hZG1pbmlzdHJhdGV1ci93b3Jrc3BhY2UvZDMtdGltZWxpbmUvc3JjL0QzVGltZWxpbmVUaW1lVHJhY2tlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3JELE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzNELE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOzs7QUNSakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBLFlBQVksQ0FBQzs7Ozs7Ozs7dUJBRU8sV0FBVzs7Ozt3QkFDVixVQUFVOzs7O3NCQUNaLFFBQVE7Ozs7Ozs7Ozs7Ozs7OztBQVkzQixTQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUU7QUFDM0IseUJBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzs7Ozs7O0NBTS9COztBQUVELDJCQUFTLFlBQVksdUJBQVUsQ0FBQzs7Ozs7QUFLaEMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcseUJBQU8sSUFBSSxFQUFFLEVBQUUs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b0IsU0FBUyxDQUFDLGVBQWUsQ0FBQzs7Ozs7Ozs7QUFRL0YscUJBQXFCLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBRyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUU7QUFDNUQsU0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztDQUNuQyxDQUFDOzs7Ozs7OztBQVFGLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsaUNBQW9CLFNBQVMsQ0FBQyxRQUFRLENBQUM7Ozs7Ozs7QUFPakYscUJBQXFCLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxpQ0FBb0IsU0FBUyxDQUFDLFFBQVEsQ0FBQzs7QUFFckYsTUFBTSxDQUFDLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzLkQzVGFibGUgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM0Jsb2NrVGFibGUgPSByZXF1aXJlKCcuL3NyYy9EM0Jsb2NrVGFibGUuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGltZWxpbmUgPSByZXF1aXJlKCcuL3NyYy9EM1RpbWVsaW5lLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RhYmxlTWFya2VyID0gcmVxdWlyZSgnLi9zcmMvRDNUYWJsZU1hcmtlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuRDNUYWJsZU1vdXNlVHJhY2tlciA9IHJlcXVpcmUoJy4vc3JjL0QzVGFibGVNb3VzZVRyYWNrZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkQzVGFibGVWYWx1ZVRyYWNrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RhYmxlVmFsdWVUcmFja2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5EM1RpbWVsaW5lVGltZVRyYWNrZXIgPSByZXF1aXJlKCcuL3NyYy9EM1RpbWVsaW5lVGltZVRyYWNrZXIuanMnKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIGlzQXJyYXkoYXJyKSB7XG5cdGlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGFycik7XG5cdH1cblxuXHRyZXR1cm4gdG9TdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRpZiAoIW9iaiB8fCB0b1N0ci5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGhhc093bkNvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc0lzUHJvdG90eXBlT2YgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc093bkNvbnN0cnVjdG9yICYmICFoYXNJc1Byb3RvdHlwZU9mKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gT3duIHByb3BlcnRpZXMgYXJlIGVudW1lcmF0ZWQgZmlyc3RseSwgc28gdG8gc3BlZWQgdXAsXG5cdC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBvYmopIHsvKiovfVxuXG5cdHJldHVybiB0eXBlb2Yga2V5ID09PSAndW5kZWZpbmVkJyB8fCBoYXNPd24uY2FsbChvYmosIGtleSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCgpIHtcblx0dmFyIG9wdGlvbnMsIG5hbWUsIHNyYywgY29weSwgY29weUlzQXJyYXksIGNsb25lLFxuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1swXSxcblx0XHRpID0gMSxcblx0XHRsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuXHRcdGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH0gZWxzZSBpZiAoKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnICYmIHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicpIHx8IHRhcmdldCA9PSBudWxsKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdH1cblxuXHRmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3VtZW50c1tpXTtcblx0XHQvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG5cdFx0aWYgKG9wdGlvbnMgIT0gbnVsbCkge1xuXHRcdFx0Ly8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuXHRcdFx0Zm9yIChuYW1lIGluIG9wdGlvbnMpIHtcblx0XHRcdFx0c3JjID0gdGFyZ2V0W25hbWVdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG5cdFx0XHRcdGlmICh0YXJnZXQgIT09IGNvcHkpIHtcblx0XHRcdFx0XHQvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBhcnJheXNcblx0XHRcdFx0XHRpZiAoZGVlcCAmJiBjb3B5ICYmIChpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IGlzQXJyYXkoY29weSkpKSkge1xuXHRcdFx0XHRcdFx0aWYgKGNvcHlJc0FycmF5KSB7XG5cdFx0XHRcdFx0XHRcdGNvcHlJc0FycmF5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIE5ldmVyIG1vdmUgb3JpZ2luYWwgb2JqZWN0cywgY2xvbmUgdGhlbVxuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gZXh0ZW5kKGRlZXAsIGNsb25lLCBjb3B5KTtcblxuXHRcdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb3B5ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gY29weTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGUgZnJvbSAnLi9EM1RhYmxlJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbi8qKlxuICogQWRkIGJlaGF2aW9ycyB0byBhIEQzVGFibGUgdG8gaGFuZGxlIGVsZW1lbnRzIGFzIHZpc3VhbCBibG9ja3Mgd2l0aDpcbiAqICAtIGVsZW1lbnQgZHJhZyAoKyBhdXRvbWF0aWMgc2Nyb2xsKVxuICogIC0gZWxlbWVudCBjbGlwcGluZ1xuICogIC0gZWxlbWVudCB0ZXh0ICgrIGFsaWdubWVudClcbiAqXG4gKiBAcGFyYW0ge0QzVGFibGVCbG9ja09wdGlvbnN9IG9wdGlvbnNcbiAqIEBleHRlbmRzIHtEM1RhYmxlfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzQmxvY2tUYWJsZShvcHRpb25zKSB7XG4gICAgRDNUYWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgLyoqXG4gICAgICogQG5hbWUgRDNCbG9ja1RhYmxlI29wdGlvbnNcbiAgICAgKiBAdHlwZSB7RDNUYWJsZUJsb2NrT3B0aW9uc31cbiAgICAgKi9cbn1cblxuaW5oZXJpdHMoRDNCbG9ja1RhYmxlLCBEM1RhYmxlKTtcblxuLyoqXG4gKiBAdHlwZSB7RDNUYWJsZUJsb2NrT3B0aW9uc31cbiAqL1xuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMsIHtcbiAgICBjbGlwRWxlbWVudDogdHJ1ZSxcbiAgICBjbGlwRWxlbWVudEZpbHRlcjogbnVsbCxcbiAgICByZW5kZXJPbkF1dG9tYXRpY1Njcm9sbElkbGU6IHRydWUsXG4gICAgaGlkZVRpY2tzT25BdXRvbWF0aWNTY3JvbGw6IGZhbHNlLFxuICAgIGF1dG9tYXRpY1Njcm9sbFNwZWVkTXVsdGlwbGllcjogMmUtNCxcbiAgICBhdXRvbWF0aWNTY3JvbGxNYXJnaW5EZWx0YTogMzAsXG4gICAgYXBwZW5kVGV4dDogdHJ1ZSxcbiAgICBhbGlnbkxlZnQ6IHRydWUsXG4gICAgYWxpZ25PblRyYW5zbGF0ZTogdHJ1ZSxcbiAgICBtYXhpbXVtQ2xpY2tEcmFnVGltZTogMTAwLFxuICAgIG1heGltdW1DbGlja0RyYWdEaXN0YW5jZTogMTIsXG4gICAgbWluaW11bURyYWdEaXN0YW5jZTogNSxcbiAgICB0cmFja2VkRWxlbWVudERPTUV2ZW50czogWydjbGljaycsICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXSAvLyBub3QgZHluYW1pY1xufSk7XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgY2xpcCBwYXRoIGlkIGZvciBlYWNoIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0QzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFBhdGhJZCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENsaXBQYXRoXycgKyB0aGlzLmluc3RhbmNlTnVtYmVyICsgJ18nICsgZWxlbWVudC51aWQ7XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIGNsaXAgcGF0aCBsaW5rIGZvciBlYWNoIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0QzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmdlbmVyYXRlQ2xpcFBhdGhMaW5rID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHJldHVybiAndXJsKCMnICsgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoSWQoZWxlbWVudCkgKyAnKSc7XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIGNsaXAgcmVjdCBpZCBmb3IgZWFjaCBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtEM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBSZWN0SWQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRDbGlwUmVjdF8nICsgdGhpcy5pbnN0YW5jZU51bWJlciArICdfJyArIGVsZW1lbnQudWlkO1xufTtcblxuLyoqXG4gKiBDb21wdXRlIHRoZSBjbGlwIHJlY3QgbGluayBmb3IgZWFjaCBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtEM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5nZW5lcmF0ZUNsaXBSZWN0TGluayA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gJyMnICsgdGhpcy5nZW5lcmF0ZUNsaXBSZWN0SWQoZWxlbWVudCk7XG59O1xuXG4vKipcbiAqIEltcGxlbWVudHMgZWxlbWVudCBlbnRlcmluZzpcbiAqICAtIGFwcGVuZCBjbGlwcGVkIHJlY3RcbiAqICAtIGFwcGVuZCB0ZXh0XG4gKiAgLSBjYWxsIHtAbGluayBEM0Jsb2NrVGFibGUjZWxlbWVudENvbnRlbnRFbnRlcn1cbiAqICAtIGNhbGwgY3VzdG9tIGRyYWcgYmVoYXZpb3JcbiAqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge0QzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudEVudGVyID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBlbGVtZW50KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgZWxlbWVudEhlaWdodCA9IHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgLSB0aGlzLm9wdGlvbnMucm93UGFkZGluZyAqIDI7XG5cbiAgICB2YXIgcmVjdCA9IHNlbGVjdGlvblxuICAgICAgICAuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudEJhY2tncm91bmQnKVxuICAgICAgICAuYXR0cignaGVpZ2h0JywgZWxlbWVudEhlaWdodCk7XG5cbiAgICB2YXIgZyA9IHNlbGVjdGlvblxuICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudENvbnRlbnQnKTtcblxuICAgIGcuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50Jyk7XG5cblxuICAgIHZhciBjbGlwRWxlbWVudCA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jbGlwRWxlbWVudCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5jbGlwRWxlbWVudEZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2xpcEVsZW1lbnQgPSAhIXRoaXMub3B0aW9ucy5jbGlwRWxlbWVudEZpbHRlci5jYWxsKHRoaXMsIHNlbGVjdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGlwRWxlbWVudCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2xpcEVsZW1lbnQpIHtcblxuICAgICAgICBnXG4gICAgICAgICAgICAuYXR0cignY2xpcC1wYXRoJywgdGhpcy5nZW5lcmF0ZUNsaXBQYXRoTGluay5iaW5kKHRoaXMpKTtcblxuICAgICAgICByZWN0XG4gICAgICAgICAgICAucHJvcGVydHkoJ2lkJywgdGhpcy5nZW5lcmF0ZUNsaXBSZWN0SWQuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgc2VsZWN0aW9uLmFwcGVuZCgnY2xpcFBhdGgnKVxuICAgICAgICAgICAgLnByb3BlcnR5KCdpZCcsIHRoaXMuZ2VuZXJhdGVDbGlwUGF0aElkLmJpbmQodGhpcykpXG4gICAgICAgICAgICAuYXBwZW5kKCd1c2UnKVxuICAgICAgICAgICAgLmF0dHIoJ3hsaW5rOmhyZWYnLCB0aGlzLmdlbmVyYXRlQ2xpcFJlY3RMaW5rLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucy50cmFja2VkRWxlbWVudERPTUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuICAgICAgICBzZWxlY3Rpb24ub24oZXZlbnROYW1lLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBpZiAoIWQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXREZXRhaWxlZEV2ZW50KCdlbGVtZW50OicgKyBldmVudE5hbWUsIHNlbGVjdGlvbiwgbnVsbCwgW2RhdGFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZFRleHQpIHtcbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcudGltZWxpbmUtZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgICAgLmNsYXNzZWQoJ3RpbWVsaW5lLWVudGl0eUxhYmVsJywgdHJ1ZSlcbiAgICAgICAgICAgIC5hdHRyKCdkeScsIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQvMiArIDQpO1xuICAgIH1cblxuICAgIHNlbGVjdGlvbi5jYWxsKHRoaXMuZWxlbWVudENvbnRlbnRFbnRlci5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmluZERyYWdBbmREcm9wT25TZWxlY3Rpb24oc2VsZWN0aW9uLCBlbGVtZW50KTtcblxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgZWxlbWVudCBiZWluZyB0cmFuc2xhdGVkOlxuICogIC0gYWxpZ24gdGV4dFxuICpcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7RDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqL1xuRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5lbGVtZW50c1RyYW5zbGF0ZSA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZWxlbWVudCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRUZXh0ICYmIHRoaXMub3B0aW9ucy5hbGlnbkxlZnQgJiYgdGhpcy5vcHRpb25zLmFsaWduT25UcmFuc2xhdGUgJiYgIWVsZW1lbnQuX2RlZmF1bHRQcmV2ZW50ZWQpIHtcblxuICAgICAgICBzZWxlY3Rpb25cbiAgICAgICAgICAgIC5zZWxlY3QoJy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudE1vdmFibGVDb250ZW50JylcbiAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIE1hdGgubWF4KC1zZWxmLnNjYWxlcy54KHNlbGYuZ2V0RGF0YVN0YXJ0KGRhdGEpKSwgMikgKyAnLDApJ1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIEltcGxlbWVudCBlbGVtZW50IGJlaW5nIHVwZGF0ZWQ6XG4gKiAgLSB0cmFuc2l0aW9uIHdpZHRoXG4gKiAgLSBhbGlnbiB0ZXh0XG4gKiAgLSBjYWxsIHtAbGluayBEM0Jsb2NrVGFibGUjZWxlbWVudENvbnRlbnRVcGRhdGV9XG4gKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtEM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHRyYW5zaXRpb25EdXJhdGlvblxuICovXG5EM0Jsb2NrVGFibGUucHJvdG90eXBlLmVsZW1lbnRVcGRhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQsIHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy53cmFwV2l0aEFuaW1hdGlvbihzZWxlY3Rpb24uc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRCYWNrZ3JvdW5kJyksIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgeTogdGhpcy5vcHRpb25zLnJvd1BhZGRpbmcsXG4gICAgICAgICAgICB3aWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy54KHNlbGYuZ2V0RGF0YUVuZChkKSkgLSBzZWxmLnNjYWxlcy54KHNlbGYuZ2V0RGF0YVN0YXJ0KGQpKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kVGV4dCAmJiB0aGlzLm9wdGlvbnMuYWxpZ25MZWZ0ICYmICFlbGVtZW50Ll9kZWZhdWx0UHJldmVudGVkKSB7XG5cbiAgICAgICAgc2VsZWN0aW9uXG4gICAgICAgICAgICAuc2VsZWN0KCcuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWVsZW1lbnRNb3ZhYmxlQ29udGVudCcpXG4gICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgZCA9PiAndHJhbnNsYXRlKCcgKyBNYXRoLm1heCgtdGhpcy5zY2FsZXMueCh0aGlzLmdldERhdGFTdGFydChkKSksIDIpICsgJywwKScpO1xuICAgIH1cblxuICAgIHNlbGVjdGlvbi5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmVsZW1lbnRDb250ZW50VXBkYXRlKHNlbGVjdGlvbiwgZWxlbWVudCwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9KTtcblxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgZWxlbWVudCBleGl0aW5nOlxuICogIC0gcmVtb3ZlIGNsaWNrIGxpc3RlbmVyXG4gKiAgLSByZW1vdmUgZHJhZyBsaXN0ZW5lcnNcbiAqXG4gKiBAcGFyYW0ge0QzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0gc2VsZWN0aW9uXG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudEV4aXQgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpIHtcblxuICAgIHNlbGVjdGlvbi5vbignY2xpY2snLCBudWxsKTtcblxuICAgIGlmIChlbGVtZW50Ll9kcmFnKSB7XG4gICAgICAgIGVsZW1lbnQuX2RyYWcub24oJ2RyYWdzdGFydCcsIG51bGwpO1xuICAgICAgICBlbGVtZW50Ll9kcmFnLm9uKCdkcmFnJywgbnVsbCk7XG4gICAgICAgIGVsZW1lbnQuX2RyYWcub24oJ2RyYWdlbmQnLCBudWxsKTtcbiAgICAgICAgZWxlbWVudC5fZHJhZyA9IG51bGw7XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIFdpbGwgYmUgY2FsbGVkIG9uIHNlbGVjdGlvbiB3aGVuIGVsZW1lbnQgY29udGVudCBlbnRlcnNcbiAqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudENvbnRlbnRFbnRlciA9IGZ1bmN0aW9uKHNlbGVjdGlvbikge307XG5cbi8qKlxuICogV2lsbCBiZSBjYWxsZWQgb24gc2VsZWN0aW9uIHdoZW4gZWxlbWVudCBjb250ZW50IHVwZGF0ZXNcbiAqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuZWxlbWVudENvbnRlbnRVcGRhdGUgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHt9O1xuXG4vKipcbiAqIEltcGxlbWVudCBlbGVtZW50IGRyYWcgd2l0aCBhdXRvbWF0aWMgc2Nyb2xsIG9uIHByb3ZpZGVkIHNlbGVjdGlvblxuICpcbiAqIEB0b2RvIGNsZWFuIHVwXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge0QzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKi9cbkQzQmxvY2tUYWJsZS5wcm90b3R5cGUuYmluZERyYWdBbmREcm9wT25TZWxlY3Rpb24gPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYm9keU5vZGUgPSBzZWxmLmVsZW1lbnRzLmJvZHkubm9kZSgpO1xuICAgIHZhciBkcmFnU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgLy8gcG9zaXRpb25zXG4gICAgdmFyIGN1cnJlbnRUcmFuc2Zvcm0gPSBudWxsO1xuICAgIHZhciBvcmlnaW5UcmFuc2Zvcm1TdHJpbmcgPSBudWxsO1xuICAgIHZhciBkcmFnU3RhcnRYID0gMCwgZHJhZ1N0YXJ0WSA9IDA7XG4gICAgdmFyIGVsZW1lbnRTdGFydFggPSAwLCBlbGVtZW50U3RhcnRZID0gMDtcbiAgICB2YXIgZHJhZ1Bvc2l0aW9uO1xuICAgIHZhciBzdGFydERyYWdQb3NpdGlvbjtcblxuICAgIC8vIG1vdmVtZW50c1xuICAgIHZhciB2ZXJ0aWNhbE1vdmUgPSAwO1xuICAgIHZhciBob3Jpem9udGFsTW92ZSA9IDA7XG4gICAgdmFyIHZlcnRpY2FsU3BlZWQgPSAwO1xuICAgIHZhciBob3Jpem9udGFsU3BlZWQgPSAwO1xuICAgIHZhciB0aW1lckFjdGl2ZSA9IGZhbHNlO1xuICAgIHZhciBuZWVkVGltZXJTdG9wID0gZmFsc2U7XG4gICAgdmFyIHN0YXJ0VGltZTtcblxuICAgIC8vIHJlc2V0IHN0YXJ0IHBvc2l0aW9uOiB0byBjYWxsIG9uIGRyYWcgc3RhcnQgb3Igd2hlbiB0aGluZ3MgYXJlIHJlZHJhd25cbiAgICBmdW5jdGlvbiBzdG9yZVN0YXJ0KCkge1xuICAgICAgICBjdXJyZW50VHJhbnNmb3JtID0gZDMudHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybVN0cmluZyA9IHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nKSk7XG4gICAgICAgIGVsZW1lbnRTdGFydFggPSBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVswXTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WSA9IGN1cnJlbnRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdO1xuICAgICAgICBkcmFnU3RhcnRYID0gZHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICBkcmFnU3RhcnRZID0gZHJhZ1Bvc2l0aW9uWzFdO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBuZXcgZHJhZyBwb3NpdGlvbiBhbmQgbW92ZSB0aGUgZWxlbWVudFxuICAgIGZ1bmN0aW9uIHVwZGF0ZVRyYW5zZm9ybShmb3JjZURyYXcpIHtcblxuICAgICAgICB2YXIgZGVsdGFYID0gZHJhZ1Bvc2l0aW9uWzBdIC0gZHJhZ1N0YXJ0WDtcbiAgICAgICAgdmFyIGRlbHRhWSA9IGRyYWdQb3NpdGlvblsxXSAtIGRyYWdTdGFydFk7XG5cbiAgICAgICAgaWYgKGZvcmNlRHJhdyB8fCAhc2VsZi5vcHRpb25zLnJlbmRlck9uSWRsZSkge1xuICAgICAgICAgICAgc3RvcmVTdGFydChkcmFnUG9zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudFRyYW5zZm9ybS50cmFuc2xhdGVbMF0gPSBlbGVtZW50U3RhcnRYICsgZGVsdGFYO1xuICAgICAgICBjdXJyZW50VHJhbnNmb3JtLnRyYW5zbGF0ZVsxXSA9IGVsZW1lbnRTdGFydFkgKyBkZWx0YVk7XG5cbiAgICAgICAgc2VsZWN0aW9uLmF0dHIoJ3RyYW5zZm9ybScsIGN1cnJlbnRUcmFuc2Zvcm0udG9TdHJpbmcoKSk7XG5cbiAgICB9XG5cbiAgICAvLyB0YWtlIG1pY3JvIHNlY29uZHMgaWYgcG9zc2libGVcbiAgICB2YXIgZ2V0UHJlY2lzZVRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2UgJiYgdHlwZW9mIHBlcmZvcm1hbmNlLm5vdyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIHBlcmZvcm1hbmNlLm5vdy5iaW5kKHBlcmZvcm1hbmNlKVxuICAgICAgICA6IHR5cGVvZiBEYXRlLm5vdyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICBEYXRlLm5vdy5iaW5kKERhdGUpXG4gICAgICAgICAgICA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiArKG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgfTtcblxuICAgIC8vIGhhbmRsZSBhdXRvbWF0aWMgc2Nyb2xsIGFyZ3VtZW50c1xuICAgIGZ1bmN0aW9uIGRvQXV0b21hdGljU2Nyb2xsKHRpbWVEZWx0YSwgZm9yY2VEcmF3KSB7XG5cbiAgICAgICAgLy8gY29tcHV0ZSBkZWx0YXMgYmFzZWQgb24gZGlyZWN0aW9uLCBzcGVlZCBhbmQgdGltZSBkZWx0YVxuICAgICAgICB2YXIgc3BlZWRNdWx0aXBsaWVyID0gc2VsZi5vcHRpb25zLmF1dG9tYXRpY1Njcm9sbFNwZWVkTXVsdGlwbGllcjtcbiAgICAgICAgdmFyIGRlbHRhWCA9IGhvcml6b250YWxNb3ZlICogaG9yaXpvbnRhbFNwZWVkICogdGltZURlbHRhICogc3BlZWRNdWx0aXBsaWVyO1xuICAgICAgICB2YXIgZGVsdGFZID0gdmVydGljYWxNb3ZlICogdmVydGljYWxTcGVlZCAqIHRpbWVEZWx0YSAqIHNwZWVkTXVsdGlwbGllcjtcblxuICAgICAgICAvLyB0YWtlIGdyb3VwIHRyYW5zbGF0ZSBjYW5jZWxsYXRpb24gd2l0aCBmb3JjZWQgcmVkcmF3IGludG8gYWNjb3VudCwgc28gcmVkZWZpbmUgc3RhcnRcbiAgICAgICAgaWYgKGZvcmNlRHJhdykge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlID0gc2VsZi5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZS5zbGljZSgwKTtcbiAgICAgICAgICAgIGVsZW1lbnRTdGFydFggKz0gY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMF07XG4gICAgICAgICAgICBlbGVtZW50U3RhcnRZICs9IGN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlYWxNb3ZlID0gc2VsZi5tb3ZlKGRlbHRhWCwgZGVsdGFZLCBmb3JjZURyYXcsIGZhbHNlLCAhc2VsZi5vcHRpb25zLmhpZGVUaWNrc09uQXV0b21hdGljU2Nyb2xsKTtcblxuICAgICAgICBpZiAocmVhbE1vdmVbMl0gfHwgcmVhbE1vdmVbM10pIHtcbiAgICAgICAgICAgIHVwZGF0ZVRyYW5zZm9ybShmb3JjZURyYXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudFN0YXJ0WCAtPSByZWFsTW92ZVsyXTtcbiAgICAgICAgZWxlbWVudFN0YXJ0WSAtPSByZWFsTW92ZVszXTtcblxuICAgICAgICBuZWVkVGltZXJTdG9wID0gcmVhbE1vdmVbMl0gPT09IDAgJiYgcmVhbE1vdmVbM10gPT09IDA7XG4gICAgfVxuXG5cbiAgICB2YXIgZHJhZyA9IGVsZW1lbnQuX2RyYWcgPSBkMy5iZWhhdmlvci5kcmFnKCk7XG5cbiAgICBkcmFnXG4gICAgICAgIC5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhcnREcmFnUG9zaXRpb24gPSBkcmFnUG9zaXRpb24gPSBkMy5tb3VzZShib2R5Tm9kZSk7XG5cbiAgICAgICAgICAgIHN0YXJ0VGltZSA9ICtuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICBzdG9yZVN0YXJ0KCk7XG5cbiAgICAgICAgICAgIGRhdGEuX2RlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5fZnJvemVuVWlkcy5wdXNoKGRhdGEudWlkKTtcblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2RyYWcnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIGRyYWdQb3NpdGlvbiA9IGQzLm1vdXNlKGJvZHlOb2RlKTtcblxuICAgICAgICAgICAgaWYgKCFkcmFnU3RhcnRlZCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHRpbWVEZWx0YSA9ICtuZXcgRGF0ZSgpIC0gc3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgIHZhciB0b3RhbERlbHRhWCA9IGRyYWdQb3NpdGlvblswXSAtIHN0YXJ0RHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICAgICAgICAgIHZhciB0b3RhbERlbHRhWSA9IGRyYWdQb3NpdGlvblsxXSAtIHN0YXJ0RHJhZ1Bvc2l0aW9uWzFdO1xuICAgICAgICAgICAgICAgIHZhciBkcmFnRGlzdGFuY2UgPSBNYXRoLnNxcnQodG90YWxEZWx0YVgqdG90YWxEZWx0YVgrdG90YWxEZWx0YVkqdG90YWxEZWx0YVkpO1xuXG4gICAgICAgICAgICAgICAgZHJhZ1N0YXJ0ZWQgPSAodGltZURlbHRhID4gc2VsZi5vcHRpb25zLm1heGltdW1DbGlja0RyYWdUaW1lIHx8IGRyYWdEaXN0YW5jZSA+IHNlbGYub3B0aW9ucy5tYXhpbXVtQ2xpY2tEcmFnRGlzdGFuY2UpICYmIGRyYWdEaXN0YW5jZSA+IHNlbGYub3B0aW9ucy5taW5pbXVtRHJhZ0Rpc3RhbmNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdTdGFydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdERldGFpbGVkRXZlbnQoJ2VsZW1lbnQ6ZHJhZ3N0YXJ0Jywgc2VsZWN0aW9uLCBudWxsLCBbZGF0YV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRyYWdTdGFydGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnJywgc2VsZWN0aW9uLCBudWxsLCBbZGF0YV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbWFyZ2luRGVsdGEgPSBzZWxmLm9wdGlvbnMuYXV0b21hdGljU2Nyb2xsTWFyZ2luRGVsdGE7XG4gICAgICAgICAgICB2YXIgZFJpZ2h0ID0gbWFyZ2luRGVsdGEgLSAoc2VsZi5kaW1lbnNpb25zLndpZHRoIC0gZHJhZ1Bvc2l0aW9uWzBdKTtcbiAgICAgICAgICAgIHZhciBkTGVmdCA9IG1hcmdpbkRlbHRhIC0gZHJhZ1Bvc2l0aW9uWzBdO1xuICAgICAgICAgICAgdmFyIGRCb3R0b20gPSBtYXJnaW5EZWx0YSAtIChzZWxmLmRpbWVuc2lvbnMuaGVpZ2h0IC0gZHJhZ1Bvc2l0aW9uWzFdKTtcbiAgICAgICAgICAgIHZhciBkVG9wID0gbWFyZ2luRGVsdGEgLSBkcmFnUG9zaXRpb25bMV07XG5cbiAgICAgICAgICAgIGhvcml6b250YWxTcGVlZCA9IE1hdGgucG93KE1hdGgubWF4KGRSaWdodCwgZExlZnQsIG1hcmdpbkRlbHRhKSwgMik7XG4gICAgICAgICAgICB2ZXJ0aWNhbFNwZWVkID0gTWF0aC5wb3coTWF0aC5tYXgoZEJvdHRvbSwgZFRvcCwgbWFyZ2luRGVsdGEpLCAyKTtcblxuICAgICAgICAgICAgdmFyIHByZXZpb3VzSG9yaXpvbnRhbE1vdmUgPSBob3Jpem9udGFsTW92ZTtcbiAgICAgICAgICAgIHZhciBwcmV2aW91c1ZlcnRpY2FsTW92ZSA9IHZlcnRpY2FsTW92ZTtcbiAgICAgICAgICAgIGhvcml6b250YWxNb3ZlID0gZFJpZ2h0ID4gMCA/IC0xIDogZExlZnQgPiAwID8gMSA6IDA7XG4gICAgICAgICAgICB2ZXJ0aWNhbE1vdmUgPSBkQm90dG9tID4gMCA/IC0xIDogZFRvcCA+IDAgPyAxIDogMDtcblxuICAgICAgICAgICAgdmFyIGhhc0NoYW5nZWRTdGF0ZSA9IHByZXZpb3VzSG9yaXpvbnRhbE1vdmUgIT09IGhvcml6b250YWxNb3ZlIHx8IHByZXZpb3VzVmVydGljYWxNb3ZlICE9PSB2ZXJ0aWNhbE1vdmU7XG5cbiAgICAgICAgICAgIGlmICgoaG9yaXpvbnRhbE1vdmUgfHwgdmVydGljYWxNb3ZlKSAmJiAhdGltZXJBY3RpdmUgJiYgaGFzQ2hhbmdlZFN0YXRlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgdGltZXJTdGFydFRpbWUgPSBnZXRQcmVjaXNlVGltZSgpO1xuXG4gICAgICAgICAgICAgICAgdGltZXJBY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgZDMudGltZXIoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRUaW1lID0gZ2V0UHJlY2lzZVRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVEZWx0YSA9IGN1cnJlbnRUaW1lIC0gdGltZXJTdGFydFRpbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVyV2lsbFN0b3AgPSAhdmVydGljYWxNb3ZlICYmICFob3Jpem9udGFsTW92ZSB8fCBuZWVkVGltZXJTdG9wO1xuXG4gICAgICAgICAgICAgICAgICAgIGRvQXV0b21hdGljU2Nyb2xsKHRpbWVEZWx0YSwgc2VsZi5vcHRpb25zLnJlbmRlck9uQXV0b21hdGljU2Nyb2xsSWRsZSAmJiB0aW1lcldpbGxTdG9wKTtcblxuICAgICAgICAgICAgICAgICAgICB0aW1lclN0YXJ0VGltZSA9IGN1cnJlbnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lcldpbGxTdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZWVkVGltZXJTdG9wID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lckFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVyV2lsbFN0b3A7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZWxmLl9kcmFnQUYpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHNlbGYuX2RyYWdBRik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuX2RyYWdBRiA9IHNlbGYucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZVRyYW5zZm9ybSk7XG5cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdkcmFnZW5kJywgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICBzZWxmLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHNlbGYuX2RyYWdBRik7XG4gICAgICAgICAgICBzZWxmLl9kcmFnQUYgPSBudWxsO1xuICAgICAgICAgICAgaG9yaXpvbnRhbE1vdmUgPSAwO1xuICAgICAgICAgICAgdmVydGljYWxNb3ZlID0gMDtcblxuICAgICAgICAgICAgZGF0YS5fZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi5fZnJvemVuVWlkcy5zcGxpY2Uoc2VsZi5fZnJvemVuVWlkcy5pbmRleE9mKGRhdGEudWlkKSwgMSk7XG5cbiAgICAgICAgICAgIGQzLnRpbWVyLmZsdXNoKCk7XG5cbiAgICAgICAgICAgIHZhciBkZWx0YUZyb21Ub3BMZWZ0Q29ybmVyID0gZDMubW91c2Uoc2VsZWN0aW9uLm5vZGUoKSk7XG4gICAgICAgICAgICB2YXIgaGFsZkhlaWdodCA9IHNlbGYub3B0aW9ucy5yb3dIZWlnaHQgLyAyO1xuICAgICAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lci5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcblxuICAgICAgICAgICAgaWYgKGRyYWdTdGFydGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpkcmFnZW5kJywgc2VsZWN0aW9uLCBbLWRlbHRhRnJvbVRvcExlZnRDb3JuZXJbMF0sIC1kZWx0YUZyb21Ub3BMZWZ0Q29ybmVyWzFdICsgaGFsZkhlaWdodF0sIFtkYXRhXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5hdHRyKCd0cmFuc2Zvcm0nLCBvcmlnaW5UcmFuc2Zvcm1TdHJpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmXG4gICAgICAgICAgICAgICAgLnVwZGF0ZVkoKVxuICAgICAgICAgICAgICAgIC5kcmF3WUF4aXMoKTtcblxuICAgICAgICAgICAgZHJhZ1N0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICBzZWxlY3Rpb24uY2FsbChkcmFnKTtcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRDNCbG9ja1RhYmxlO1xuIiwiLyogZ2xvYmFsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cy9ldmVudHMnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcblxuXG4vKipcbiAqIEFuIGluc3RhbmNlIG9mIEQzVGFibGUgdXNlcyBkMy5qcyB0byBidWlsZCBhIHN2ZyBncmlkIHdpdGggYXhpc2VzLlxuICogWW91IHNldCBhIGRhdGEgc2V0IHdpdGgge0BsaW5rIEQzVGFibGUuc2V0RGF0YX0uXG4gKiBFYWNoIGdyb3VwIG9mIGVsZW1lbnQge0BsaW5rIEQzVGFibGVSb3d9IGlzIGRyYXduIGluIHJvd3MgKHkgYXhpcylcbiAqIGFuZCBlYWNoIGVsZW1lbnQge0BsaW5rIEQzVGFibGVFbGVtZW50fSBvZiBhIHJvdyBpcyBkcmF3biBpbiB0aGlzIHJvd1xuICogVGhlcmUgaXMgbm8gZ3JhcGhpY2FsIGVsZW1lbnQgZm9yIHJvd3MuXG4gKlxuICogVGhlIHByb3ZpZGVkIG5lc3RlZCBkYXRhIHNldCBpcyBmaXJzdCBmbGF0dGVuZWQgdG8gZW5hYmxlIHRyYW5zaXRpb24gYmV0d2VlbiBkaWZmZXJlbnRzIHJvd3MuXG4gKlxuICogQHBhcmFtIHtEM1RhYmxlT3B0aW9uc30gb3B0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGFibGUob3B0aW9ucykge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICBEM1RhYmxlLmluc3RhbmNlc0NvdW50ICs9IDE7XG5cbiAgICB0aGlzLmluc3RhbmNlTnVtYmVyID0gRDNUYWJsZS5pbnN0YW5jZXNDb3VudDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtEM1RhYmxlT3B0aW9uc31cbiAgICAgKi9cbiAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQodHJ1ZSwge30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0FycmF5PEQzVGFibGVSb3c+fVxuICAgICAqL1xuICAgIHRoaXMuZGF0YSA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0FycmF5PEQzVGFibGVFbGVtZW50Pn1cbiAgICAgKi9cbiAgICB0aGlzLmZsYXR0ZW5lZERhdGEgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHt7dG9wOiBudW1iZXIsIHJpZ2h0OiBudW1iZXIsIGJvdHRvbTogbnVtYmVyLCBsZWZ0OiBudW1iZXJ9fVxuICAgICAqL1xuICAgIHRoaXMubWFyZ2luID0ge1xuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICBib3R0b206IDAsXG4gICAgICAgIGxlZnQ6IDBcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gICAgICovXG4gICAgdGhpcy5kaW1lbnNpb25zID0geyB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7bnVtYmVyW119XG4gICAgICovXG4gICAgdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZSA9IFswLjAsIDAuMF07XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7ZDMuU2VsZWN0aW9ufVxuICAgICAqL1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHt7XG4gICAgICogIGJvZHk6IGQzLlNlbGVjdGlvbixcbiAgICAgKiAgaW5uZXJDb250YWluZXI6IGQzLlNlbGVjdGlvbixcbiAgICAgKiAgeEF4aXNDb250YWluZXI6IGQzLlNlbGVjdGlvbixcbiAgICAgKiAgeDJBeGlzQ29udGFpbmVyOiBkMy5TZWxlY3Rpb24sXG4gICAgICogIHlBeGlzQ29udGFpbmVyOiBkMy5TZWxlY3Rpb24sXG4gICAgICogIGRlZnM6IGQzLlNlbGVjdGlvbixcbiAgICAgKiAgY2xpcDogZDMuU2VsZWN0aW9uXG4gICAgICogfX1cbiAgICAgKi9cbiAgICB0aGlzLmVsZW1lbnRzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7e1xuICAgICAqICB4OiBkMy5zY2FsZS5MaW5lYXIsXG4gICAgICogIHk6IGQzLnNjYWxlLkxpbmVhclxuICAgICAqIH19XG4gICAgICovXG4gICAgdGhpcy5zY2FsZXMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHt7XG4gICAgICogIHg6IGQzLnN2Zy5BeGlzLFxuICAgICAqICB4MjogZDMuc3ZnLkF4aXMsXG4gICAgICogIHk6IGQzLnN2Zy5BeGlzXG4gICAgICogfX1cbiAgICAgKi9cbiAgICB0aGlzLmF4aXNlcyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge3tcbiAgICAgKiAgem9vbTogZDMuYmVoYXZpb3IuWm9vbSxcbiAgICAgKiAgem9vbVg6IGQzLmJlaGF2aW9yLlpvb20sXG4gICAgICogIHpvb21ZOiBkMy5iZWhhdmlvci5ab29tLFxuICAgICAqICBwYW46IGQzLmJlaGF2aW9yLkRyYWdcbiAgICAgKiB9fVxuICAgICAqL1xuICAgIHRoaXMuYmVoYXZpb3JzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7W051bWJlciwgTnVtYmVyXX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge1tOdW1iZXIsIE51bWJlcl19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9sYXN0U2NhbGUgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX3lTY2FsZSA9IDAuMDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9kYXRhQ2hhbmdlQ291bnQgPSAwO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoID0gMDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0ID0gMDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fcHJldmVudERyYXdpbmcgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheTxGdW5jdGlvbj59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX21heEJvZHlIZWlnaHQgPSBJbmZpbml0eTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtBcnJheTxOdW1iZXJ8U3RyaW5nPn1cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgdGhpcy5fZnJvemVuVWlkcyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9wcmV2ZW50RXZlbnRFbWlzc2lvbiA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9kaXNhYmxlZCA9IGZhbHNlO1xufVxuXG5pbmhlcml0cyhEM1RhYmxlLCBFdmVudEVtaXR0ZXIpO1xuXG4vKipcbiAqIEB0eXBlIHtEM1RhYmxlT3B0aW9uc31cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZGVmYXVsdHMgPSB7XG4gICAgYmVtQmxvY2tOYW1lOiAndGFibGUnLFxuICAgIGJlbUJsb2NrTW9kaWZpZXI6ICcnLFxuICAgIHhBeGlzSGVpZ2h0OiA1MCxcbiAgICB5QXhpc1dpZHRoOiA1MCxcbiAgICByb3dIZWlnaHQ6IDMwLFxuICAgIHJvd1BhZGRpbmc6IDUsXG4gICAgdGlja1BhZGRpbmc6IDIwLFxuICAgIGNvbnRhaW5lcjogJ2JvZHknLFxuICAgIGN1bGxpbmdYOiB0cnVlLFxuICAgIGN1bGxpbmdZOiB0cnVlLFxuICAgIGN1bGxpbmdEaXN0YW5jZTogMSxcbiAgICByZW5kZXJPbklkbGU6IHRydWUsXG4gICAgaGlkZVRpY2tzT25ab29tOiBmYWxzZSxcbiAgICBoaWRlVGlja3NPbkRyYWc6IGZhbHNlLFxuICAgIHBhbllPbldoZWVsOiB0cnVlLFxuICAgIHdoZWVsTXVsdGlwbGllcjogMSxcbiAgICBlbmFibGVZVHJhbnNpdGlvbjogdHJ1ZSxcbiAgICBlbmFibGVUcmFuc2l0aW9uT25FeGl0OiB0cnVlLFxuICAgIHVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybTogZmFsc2UsXG4gICAgdHJhbnNpdGlvbkVhc2luZzogJ3F1YWQtaW4tb3V0JyxcbiAgICB4QXhpc1RpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkO1xuICAgIH0sXG4gICAgeEF4aXNTdHJva2VXaWR0aDogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCUyID8gMSA6IDI7XG4gICAgfSxcbiAgICB4QXhpczJUaWNrc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfSxcbiAgICB5QXhpc0Zvcm1hdHRlcjogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCAmJiBkLm5hbWUgfHwgJyc7XG4gICAgfSxcbiAgICBwYWRkaW5nOiAxMCxcbiAgICB0cmFja2VkRE9NRXZlbnRzOiBbJ2NsaWNrJywgJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnLCAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJ10gLy8gbm90IGR5bmFtaWNcbn07XG5cbi8qKlxuICogQHR5cGUge251bWJlcn1cbiAqL1xuRDNUYWJsZS5pbnN0YW5jZXNDb3VudCA9IDA7XG5cbi8qKlxuICogTm9vcCBmdW5jdGlvbiwgd2hpY2ggZG9lcyBub3RoaW5nXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLm5vb3AgPSBmdW5jdGlvbigpIHt9O1xuXG4vKipcbiAqIEluaXRpYWxpemF0aW9uIG1ldGhvZFxuICogIC0gY3JlYXRlIHRoZSBlbGVtZW50c1xuICogIC0gaW5zdGFudGlhdGUgZDMgaW5zdGFuY2VzXG4gKiAgLSByZWdpc3RlciBsaXN0ZW5lcnNcbiAqXG4gKiBEYXRhIHdpbGwgYmUgZHJhd24gaW4gdGhlIGlubmVyIGNvbnRhaW5lclxuICpcbiAqIEByZXR1cm5zIHtEM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBjb250YWluZXJcbiAgICB0aGlzLmNvbnRhaW5lciA9IGQzLnNlbGVjdCh0aGlzLm9wdGlvbnMuY29udGFpbmVyKS5hcHBlbmQoJ3N2ZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAodGhpcy5vcHRpb25zLmJlbUJsb2NrTW9kaWZpZXIgPyAnICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTW9kaWZpZXIgOiAnJykpO1xuXG5cbiAgICAvLyBkZWZzIGFuZCBjbGlwIGluIGRlZnNcbiAgICB0aGlzLmVsZW1lbnRzLmRlZnMgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2RlZnMnKTtcblxuICAgIHZhciBjbGlwSWQgPSB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1ib2R5Q2xpcFBhdGgtLScgKyBEM1RhYmxlLmluc3RhbmNlc0NvdW50O1xuICAgIHRoaXMuZWxlbWVudHMuY2xpcCA9IHRoaXMuZWxlbWVudHMuZGVmcy5hcHBlbmQoJ2NsaXBQYXRoJylcbiAgICAgICAgLnByb3BlcnR5KCdpZCcsIGNsaXBJZCk7XG4gICAgdGhpcy5lbGVtZW50cy5jbGlwXG4gICAgICAgIC5hcHBlbmQoJ3JlY3QnKTtcblxuXG4gICAgLy8gYmFja2dyb3VuZCByZWN0IGluIGNvbnRhaW5lclxuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5jbGFzc2VkKHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JywgdHJ1ZSk7XG5cblxuICAgIC8vIGF4aXNlcyBjb250YWluZXJzIGluIGNvbnRhaW5lclxuICAgIHRoaXMuZWxlbWVudHMueEF4aXNDb250YWluZXIgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1heGlzLS14Jyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLngyQXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXggJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXNlY29uZGFyeScpO1xuXG4gICAgdGhpcy5lbGVtZW50cy55QXhpc0NvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLmFwcGVuZCgnZycpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMgJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWF4aXMtLXknKTtcblxuXG4gICAgLy8gYm9keSBpbiBjb250YWluZXJcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkgPSB0aGlzLmNvbnRhaW5lci5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cignY2xpcC1wYXRoJywgJ3VybCgjJyArIGNsaXBJZCArICcpJyk7XG5cblxuICAgIC8vIGNvbnRhY3QgcmVjdCwgaW5uZXIgY29udGFpbmVyIGFuZCBib3VuZGluZyByZWN0IGluIGJvZHlcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctY29udGFjdFJlY3QnLCB0cnVlKTtcblxuICAgIHRoaXMuZWxlbWVudHMuaW5uZXJDb250YWluZXIgPSB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdnJyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgLmNsYXNzZWQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0JywgdHJ1ZSk7XG5cblxuICAgIHRoaXMudXBkYXRlTWFyZ2lucygpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplRDNJbnN0YW5jZXMoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUV2ZW50TGlzdGVuZXJzKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGVzdHJveSBmdW5jdGlvbiwgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGluc3RhbmNlIGhhcyB0byBiZSBkZXN0cm95ZWRcbiAqIEB0b2RvIGVuc3VyZSBubyBtZW1vcnkgbGVhayB3aXRoIHRoaXMgZGVzdHJveSBpbXBsZW1lbnRhdGlvbiwgZXNwYWNpYWxseSB3aXRoIGRvbSBldmVudCBsaXN0ZW5lcnNcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOmRlc3Ryb3knLCB0aGlzKTtcblxuICAgIC8vIHJlbW92ZSBiZWhhdmlvciBsaXN0ZW5lcnNcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tLm9uKCd6b29tJywgbnVsbCk7XG5cbiAgICAvLyByZW1vdmUgZG9tIGxpc3RlbmVyc1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5vbignLnpvb20nLCBudWxsKTtcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkub24oJ2NsaWNrJywgbnVsbCk7XG5cbiAgICAvLyByZW1vdmUgcmVmZXJlbmNlc1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLmVsZW1lbnRzID0gbnVsbDtcbiAgICB0aGlzLnNjYWxlcyA9IG51bGw7XG4gICAgdGhpcy5heGlzZXMgPSBudWxsO1xuICAgIHRoaXMuYmVoYXZpb3JzID0gbnVsbDtcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xuICAgIHRoaXMuZmxhdHRlbmVkRGF0YSA9IG51bGw7XG5cbiAgICB0aGlzLmVtaXQodGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6ZGVzdHJveWVkJywgdGhpcyk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgZDMgaW5zdGFuY2VzIChzY2FsZXMsIGF4aXNlcywgYmVoYXZpb3JzKVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5pbml0aWFsaXplRDNJbnN0YW5jZXMgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuXG4gICAgLy8gc2NhbGVzXG5cbiAgICB0aGlzLnNjYWxlcy54ID0gdGhpcy54U2NhbGVGYWN0b3J5KCk7XG5cbiAgICB0aGlzLnNjYWxlcy55ID0gdGhpcy55U2NhbGVGYWN0b3J5KCk7XG5cblxuICAgIC8vIGF4aXNlc1xuXG4gICAgdGhpcy5heGlzZXMueCA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgLnNjYWxlKHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5vcmllbnQoJ3RvcCcpXG4gICAgICAgIC50aWNrRm9ybWF0KHRoaXMub3B0aW9ucy54QXhpc1RpY2tzRm9ybWF0dGVyLmJpbmQodGhpcykpXG4gICAgICAgIC5vdXRlclRpY2tTaXplKDApXG4gICAgICAgIC50aWNrUGFkZGluZyh0aGlzLm9wdGlvbnMudGlja1BhZGRpbmcpO1xuXG4gICAgdGhpcy5heGlzZXMueDIgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgIC5zY2FsZSh0aGlzLnNjYWxlcy54KVxuICAgICAgICAub3JpZW50KCd0b3AnKVxuICAgICAgICAudGlja0Zvcm1hdCh0aGlzLm9wdGlvbnMueEF4aXMyVGlja3NGb3JtYXR0ZXIuYmluZCh0aGlzKSlcbiAgICAgICAgLm91dGVyVGlja1NpemUoMClcbiAgICAgICAgLmlubmVyVGlja1NpemUoMCk7XG5cbiAgICB0aGlzLmF4aXNlcy55ID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAuc2NhbGUodGhpcy5zY2FsZXMueSlcbiAgICAgICAgLm9yaWVudCgnbGVmdCcpXG4gICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLm9wdGlvbnMueUF4aXNGb3JtYXR0ZXIuY2FsbChzZWxmLCBzZWxmLmRhdGFbKGR8MCldKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm91dGVyVGlja1NpemUoMCk7XG5cblxuICAgIC8vIGJlaGF2aW9yc1xuXG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSlcbiAgICAgICAgLm9uKCd6b29tJywgdGhpcy5oYW5kbGVab29taW5nLmJpbmQodGhpcykpXG4gICAgICAgIC5vbignem9vbWVuZCcsIHRoaXMuaGFuZGxlWm9vbWluZ0VuZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YID0gZDMuYmVoYXZpb3Iuem9vbSgpXG4gICAgICAgIC54KHRoaXMuc2NhbGVzLngpXG4gICAgICAgIC5zY2FsZSgxKVxuICAgICAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgICAgICAueSh0aGlzLnNjYWxlcy55KVxuICAgICAgICAuc2NhbGUoMSlcbiAgICAgICAgLnNjYWxlRXh0ZW50KFsxLCAxXSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy5wYW4gPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgICAgLm9uKCdkcmFnJywgdGhpcy5oYW5kbGVEcmFnZ2luZy5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keS5jYWxsKHRoaXMuYmVoYXZpb3JzLnBhbik7XG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LmNhbGwodGhpcy5iZWhhdmlvcnMuem9vbSk7XG5cbiAgICB0aGlzLl9sYXN0VHJhbnNsYXRlID0gdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUoKTtcbiAgICB0aGlzLl9sYXN0U2NhbGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCk7XG59O1xuXG4vKipcbiAqIHggc2NhbGUgZmFjdG9yeVxuICogQHJldHVybnMge2QzLnNjYWxlLkxpbmVhcn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUueFNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5saW5lYXIoKTtcbn07XG5cbi8qKlxuICogeSBzY2FsZSBmYWN0b3J5XG4gKiBAcmV0dXJucyB7ZDMuc2NhbGUuTGluZWFyfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS55U2NhbGVGYWN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLmxpbmVhcigpO1xufTtcblxuXG4vKipcbiAqIEluaXRpYWxpemUgZXZlbnQgbGlzdGVuZXJzIGZvciBhbGwgdHJhY2tlZCBET00gZXZlbnRzXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmluaXRpYWxpemVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5vcHRpb25zLnRyYWNrZWRET01FdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudE5hbWUpIHtcblxuICAgICAgICBzZWxmLmVsZW1lbnRzLmJvZHkub24oZXZlbnROYW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChldmVudE5hbWUgIT09ICdjbGljaycgfHwgIWQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYgZDMuc2VsZWN0KGQzLmV2ZW50LnRhcmdldCkuY2xhc3NlZChzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudChldmVudE5hbWUsIHNlbGYuZWxlbWVudHMuYm9keSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn07XG5cblxuLyoqXG4gKiBQYW4gWC9ZICYgem9vbSBYIChjbGFtcGVkIHBhbiBZIHdoZW4gd2hlZWwgaXMgcHJlc3NlZCB3aXRob3V0IGN0cmwsIHpvb20gWCBhbmQgcGFuIFgvWSBvdGhlcndpc2UpXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmhhbmRsZVpvb21pbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIGlmIG5vdCBjdHJsS2V5IGFuZCBub3QgdG91Y2hlcyA+PSAyXG4gICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50ICYmICFkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5ICYmICEoZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZDMuZXZlbnQuc291cmNlRXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID49IDIpKSB7XG5cbiAgICAgICAgLy8gaWYgd2hlZWxpbmcsIGF2b2lkIHpvb21pbmcgYW5kIGxldCB0aGUgd2hlZWxpbmcgaGFuZGxlciBwYW5cbiAgICAgICAgaWYgKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnR5cGUgPT09ICd3aGVlbCcpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wYW5ZT25XaGVlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZVpvb20oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVdoZWVsaW5nKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgLy8gZWxzZSBhdm9pZCB6b29taW5nIGFuZCByZXR1cm4gKHRoZSB1c2VyIGdlc3R1cmUgd2lsbCBiZSBoYW5kbGVkIGJ5IHRoZSB0aGUgcGFuIGJlaGF2aW9yXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXN0b3JlWm9vbSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHRyYW5zbGF0ZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCk7XG4gICAgdmFyIHVwZGF0ZWRUcmFuc2xhdGUgPSBbdHJhbnNsYXRlWzBdLCB0aGlzLl9sYXN0VHJhbnNsYXRlWzFdXTtcblxuICAgIHVwZGF0ZWRUcmFuc2xhdGUgPSB0aGlzLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlKHVwZGF0ZWRUcmFuc2xhdGUsIFt0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCksIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnNjYWxlKCldKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHVwZGF0ZWRUcmFuc2xhdGUpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnRyYW5zbGF0ZSh1cGRhdGVkVHJhbnNsYXRlKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuXG4gICAgdGhpcy5tb3ZlRWxlbWVudHModHJ1ZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25ab29tKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVHJhbnNsYXRlO1xuICAgIHRoaXMuX2xhc3RTY2FsZSA9IHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJyk7XG5cbn07XG5cbi8qKlxuICogRm9yY2UgZHJhd2luZyBlbGVtZW50cywgbnVsbGlmeSBvcHRpbWl6ZWQgaW5uZXIgY29udGFpbmVyIHRyYW5zZm9ybSBhbmQgcmVkcmF3IGF4aXNlc1xuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVab29taW5nRW5kID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuICAgIHRoaXMubW92ZUVsZW1lbnRzKHRydWUpO1xuICAgIHRoaXMuZHJhd1lBeGlzKCk7XG4gICAgdGhpcy5kcmF3WEF4aXMoKTtcbn07XG5cbi8qKlxuICogQ2xhbXBlZCBwYW4gWVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5oYW5kbGVXaGVlbGluZyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGV2ZW50ID0gZDMuZXZlbnQuc291cmNlRXZlbnQ7XG5cbiAgICB2YXIgZGVsdGFYID0gMCwgZGVsdGFZID0gMDtcblxuICAgIHZhciBtb3ZpbmdYID0gZXZlbnQgJiYgZXZlbnQud2hlZWxEZWx0YVggfHwgZXZlbnQuZGVsdGFYO1xuXG4gICAgLy8gaWYgbW92aW5nIHgsIGlnbm9yZSB5IGFuZCBjb21wdXRlIHggZGVsdGFcbiAgICBpZiAobW92aW5nWCkge1xuXG4gICAgICAgIHZhciBtb3ZpbmdSaWdodCA9IGV2ZW50LndoZWVsRGVsdGFYID4gMCB8fCBldmVudC5kZWx0YVggPCAwO1xuICAgICAgICBkZWx0YVggPSAobW92aW5nUmlnaHQgPyAxIDogLTEpICogdGhpcy5jb2x1bW5XaWR0aCAqIHRoaXMub3B0aW9ucy53aGVlbE11bHRpcGxpZXI7XG5cbiAgICB9XG4gICAgLy8gaWYgbm90IG1vdmluZyB4XG4gICAgZWxzZSB7XG5cbiAgICAgICAgdmFyIG1vdmluZ1kgPSBldmVudC53aGVlbERlbHRhIHx8IGV2ZW50LndoZWVsRGVsdGFZIHx8IGV2ZW50LmRldGFpbCB8fCBldmVudC5kZWx0YVk7XG5cbiAgICAgICAgLy8gaWYgbW92aW5nIHksIGNvbXB1dGUgeSBkZWx0YVxuICAgICAgICBpZiAobW92aW5nWSkge1xuICAgICAgICAgICAgdmFyIG1vdmluZ0Rvd24gPSBldmVudC53aGVlbERlbHRhID4gMCB8fCBldmVudC53aGVlbERlbHRhWSA+IDAgfHwgZXZlbnQuZGV0YWlsIDwgMCB8fCBldmVudC5kZWx0YVkgPCAwO1xuICAgICAgICAgICAgZGVsdGFZID0gbW92aW5nWSA/IChtb3ZpbmdEb3duID8gMSA6IC0xKSAqIHRoaXMub3B0aW9ucy5yb3dIZWlnaHQgKiB0aGlzLm9wdGlvbnMud2hlZWxNdWx0aXBsaWVyIDogMDtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLy8gZmluYWxseSBtb3ZlIHRoZSBlbGVtZW50c1xuICAgIHRoaXMubW92ZShkZWx0YVgsIGRlbHRhWSwgZmFsc2UsICFtb3ZpbmdYLCB0cnVlKTtcblxufTtcblxuLyoqXG4gKiBEaXJlY3RseSB1c2UgZXZlbnQgeCBhbmQgeSBkZWx0YSB0byBtb3ZlIGVsZW1lbnRzXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmhhbmRsZURyYWdnaW5nID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBpZiBtb3JlIHRoYW4gMiB0b3VjaGVzLCByZXR1cm5cbiAgICBpZiAoZDMuZXZlbnQuc291cmNlRXZlbnQudG91Y2hlcyAmJiBkMy5ldmVudC5zb3VyY2VFdmVudC50b3VjaGVzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm1vdmUoZDMuZXZlbnQuZHgsIGQzLmV2ZW50LmR5LCBmYWxzZSwgZmFsc2UsICF0aGlzLm9wdGlvbnMuaGlkZVRpY2tzT25EcmFnKTtcbn07XG5cbi8qKlxuICogUmVzdG9yZSBwcmV2aW91cyB6b29tIHRyYW5zbGF0ZSBhbmQgc2NhbGUgdGh1cyBjYW5jZWxsaW5nIHRoZSB6b29tIGJlaGF2aW9yIGhhbmRsaW5nXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnJlc3RvcmVab29tID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS50cmFuc2xhdGUodGhpcy5fbGFzdFRyYW5zbGF0ZSk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbS5zY2FsZSh0aGlzLl9sYXN0U2NhbGUpO1xufTtcblxuLyoqXG4gKiBGaXJlIGFuIGV2ZW50IGV2ZW50IHdpdGggdGhlIGdpdmVuIGV2ZW50TmFtZSBwcmVmaXhlZCB3aXRoIHRoZSBiZW0gYmxvY2sgbmFtZVxuICogVGhlIGZvbGxvd2luZyBhcmd1bWVudHMgYXJlIHBhc3NlZCB0byB0aGUgbGlzdGVuZXJzOlxuICogIC0gLi4ucHJpb3JpdHlBcmd1bWVudHNcbiAqICAtIHRoaXM6IHRoZSBEM1RhYmxlIGluc3RhbmNlXG4gKiAgLSBkM1RhcmdldFNlbGVjdGlvblxuICogIC0gZDMuZXZlbnRcbiAqICAtIGdldENvbHVtbigpOiBhIGZ1bmN0aW9uIHRvIGdldCB0aGUgeCB2YWx1ZSBpbiBkYXRhIHNwYWNlXG4gKiAgLSBnZXRSb3coKTogYSBmdW5jdGlvbiB0byBnZXQgdGhlIHkgdmFsdWUgaW4gZGF0YSBzcGFjZVxuICogIC0gLi4uZXh0cmFBcmd1bWVudHNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gW2QzVGFyZ2V0U2VsZWN0aW9uXVxuICogQHBhcmFtIHtbTnVtYmVyLE51bWJlcl19IFtkZWx0YV1cbiAqIEBwYXJhbSB7QXJyYXk8Kj59IFtwcmlvcml0eUFyZ3VtZW50c11cbiAqIEBwYXJhbSB7QXJyYXk8Kj59IFtleHRyYUFyZ3VtZW50c11cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZW1pdERldGFpbGVkRXZlbnQgPSBmdW5jdGlvbihldmVudE5hbWUsIGQzVGFyZ2V0U2VsZWN0aW9uLCBkZWx0YSwgcHJpb3JpdHlBcmd1bWVudHMsIGV4dHJhQXJndW1lbnRzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudEV2ZW50RW1pc3Npb24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBwb3NpdGlvbjtcblxuICAgIHZhciBnZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXBvc2l0aW9uKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGQzLm1vdXNlKHNlbGYuZWxlbWVudHMuYm9keS5ub2RlKCkpO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGVsdGEpKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25bMF0gKz0gZGVsdGFbMF07XG4gICAgICAgICAgICAgICAgcG9zaXRpb25bMV0gKz0gZGVsdGFbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH07XG5cbiAgICB2YXIgYXJncyA9IFtcbiAgICAgICAgdGhpcywgLy8gdGhlIHRhYmxlIGluc3RhbmNlXG4gICAgICAgIGQzVGFyZ2V0U2VsZWN0aW9uLCAvLyB0aGUgZDMgc2VsZWN0aW9uIHRhcmdldGVkXG4gICAgICAgIGQzLmV2ZW50LCAvLyB0aGUgZDMgZXZlbnRcbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29sdW1uKCkge1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLnNjYWxlcy54LmludmVydChwb3NpdGlvblswXSk7XG4gICAgICAgIH0sIC8vIGEgY29sdW1uIGdldHRlclxuICAgICAgICBmdW5jdGlvbiBnZXRSb3coKSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBnZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2NhbGVzLnkuaW52ZXJ0KHBvc2l0aW9uWzFdKTtcbiAgICAgICAgfSAvLyBhIHJvdyBnZXR0ZXJcbiAgICBdO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocHJpb3JpdHlBcmd1bWVudHMpKSB7XG4gICAgICAgIGFyZ3MgPSBwcmlvcml0eUFyZ3VtZW50cy5jb25jYXQoYXJncyk7XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZXh0cmFBcmd1bWVudHMpKSB7XG4gICAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChleHRyYUFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgYXJncy51bnNoaWZ0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOicgKyBldmVudE5hbWUpOyAvLyB0aGUgZXZlbnQgbmFtZVxuXG4gICAgdGhpcy5lbWl0LmFwcGx5KHRoaXMsIGFyZ3MpO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgbWFyZ2lucyBhbmQgdXBkYXRlIHRyYW5zZm9ybXNcbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt1cGRhdGVEaW1lbnNpb25zXSBUcnVlIG1lYW5zIGl0IGhhcyB0byB1cGRhdGUgWCBhbmQgWVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVNYXJnaW5zID0gZnVuY3Rpb24odXBkYXRlRGltZW5zaW9ucykge1xuXG4gICAgdGhpcy5tYXJnaW4gPSB7XG4gICAgICAgIHRvcDogdGhpcy5vcHRpb25zLnhBeGlzSGVpZ2h0ICsgdGhpcy5vcHRpb25zLnBhZGRpbmcsXG4gICAgICAgIHJpZ2h0OiB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgYm90dG9tOiB0aGlzLm9wdGlvbnMucGFkZGluZyxcbiAgICAgICAgbGVmdDogdGhpcy5vcHRpb25zLnlBeGlzV2lkdGggKyB0aGlzLm9wdGlvbnMucGFkZGluZ1xuICAgIH07XG5cbiAgICB2YXIgY29udGVudFBvc2l0aW9uID0geyB4OiB0aGlzLm1hcmdpbi5sZWZ0LCB5OiB0aGlzLm1hcmdpbi50b3AgfTtcbiAgICB2YXIgY29udGVudFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIHRoaXMubWFyZ2luLmxlZnQgKyAnLCcgKyB0aGlzLm1hcmdpbi50b3AgKyAnKSc7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWJhY2tncm91bmRSZWN0JylcbiAgICAgICAgLmF0dHIoY29udGVudFBvc2l0aW9uKTtcblxuICAgIHRoaXMuZWxlbWVudHMuYm9keVxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgY29udGVudFRyYW5zZm9ybSk7XG5cbiAgICB0aGlzLmVsZW1lbnRzLnhBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueDJBeGlzQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBjb250ZW50VHJhbnNmb3JtKTtcblxuICAgIHRoaXMuZWxlbWVudHMueUF4aXNDb250YWluZXJcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIHRoaXMubWFyZ2luLmxlZnQgKyAnLCcgKyB0aGlzLm1hcmdpbi50b3AgKyAnKScpO1xuXG4gICAgaWYgKHVwZGF0ZURpbWVuc2lvbnMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVYWSgpO1xuICAgIH1cblxufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtBcnJheTxEM1RhYmxlUm93Pn0gZGF0YVxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFthbmltYXRlWV1cbiAqIEByZXR1cm5zIHtEM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24oZGF0YSwgdHJhbnNpdGlvbkR1cmF0aW9uLCBhbmltYXRlWSkge1xuXG4gICAgdGhpcy5fZGF0YUNoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNTaXplQ2hhbmdpbmcgPSBkYXRhLmxlbmd0aCAhPT0gdGhpcy5kYXRhLmxlbmd0aDtcblxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICB0aGlzLmdlbmVyYXRlRmxhdHRlbmVkRGF0YSgpO1xuXG4gICAgaWYgKGlzU2l6ZUNoYW5naW5nIHx8IHRoaXMuX2RhdGFDaGFuZ2VDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAudXBkYXRlWEF4aXNJbnRlcnZhbCgpXG4gICAgICAgICAgICAudXBkYXRlWShhbmltYXRlWSA/IHRyYW5zaXRpb25EdXJhdGlvbiA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd0VsZW1lbnRzKHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gbWluWFxuICogQHBhcmFtIHtEYXRlfSBtYXhYXG4gKiBAcmV0dXJucyB7RDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc2V0WFJhbmdlID0gZnVuY3Rpb24obWluWCwgbWF4WCkge1xuXG4gICAgdGhpcy5taW5YID0gbWluWDtcbiAgICB0aGlzLm1heFggPSBtYXhYO1xuXG4gICAgdGhpcy5zY2FsZXMueFxuICAgICAgICAuZG9tYWluKFt0aGlzLm1pblgsIHRoaXMubWF4WF0pO1xuXG4gICAgdGhpc1xuICAgICAgICAudXBkYXRlWCgpXG4gICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgLmRyYXdYQXhpcygpXG4gICAgICAgIC5kcmF3WUF4aXMoKVxuICAgICAgICAuZHJhd0VsZW1lbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGF2YWlsYWJsZSB3aWR0aCBhbmQgaGVpZ2h0IHNvIHRoYXQgZXZlcnkgdGhpbmcgdXBkYXRlIGNvcnJlc3BvbmRpbmdseVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBhdmFpbGFibGVXaWR0aFxuICogQHBhcmFtIHtOdW1iZXJ9IGF2YWlsYWJsZUhlaWdodFxuICogQHJldHVybnMge0QzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnNldEF2YWlsYWJsZURpbWVuc2lvbnMgPSBmdW5jdGlvbihhdmFpbGFibGVXaWR0aCwgYXZhaWxhYmxlSGVpZ2h0KSB7XG5cbiAgICB0aGlzLl9kaXNhYmxlZCA9IHRydWU7XG4gICAgdmFyIF9sYXN0QXZhaWxhYmxlV2lkdGggPSB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGg7XG4gICAgdmFyIF9sYXN0QXZhaWxhYmxlSGVpZ2h0ID0gdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodDtcbiAgICB0aGlzLnNldEF2YWlsYWJsZVdpZHRoKGF2YWlsYWJsZVdpZHRoKTtcbiAgICB0aGlzLnNldEF2YWlsYWJsZUhlaWdodChhdmFpbGFibGVIZWlnaHQpO1xuICAgIHRoaXMuX2Rpc2FibGVkID0gZmFsc2U7XG5cbiAgICB2YXIgaXNBdmFpbGFibGVXaWR0aENoYW5naW5nID0gX2xhc3RBdmFpbGFibGVXaWR0aCAhPT0gdGhpcy5fbGFzdEF2YWlsYWJsZVdpZHRoO1xuICAgIHZhciBpc0F2YWlsYWJsZUhlaWdodENoYW5naW5nID0gX2xhc3RBdmFpbGFibGVIZWlnaHQgIT09IHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQ7XG5cbiAgICBpZiAoaXNBdmFpbGFibGVXaWR0aENoYW5naW5nIHx8IGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgfHwgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ID09PSAyKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVYKClcbiAgICAgICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgICAgICAuZHJhd0VsZW1lbnRzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBhdmFpbGFibGUgd2lkdGggc28gdGhhdCBldmVyeSB0aGluZyB1cGRhdGUgY29ycmVzcG9uZGluZ2x5XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGF2YWlsYWJsZVdpZHRoXG4gKiBAcmV0dXJucyB7RDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc2V0QXZhaWxhYmxlV2lkdGggPSBmdW5jdGlvbihhdmFpbGFibGVXaWR0aCkge1xuXG4gICAgdGhpcy5fZGltZW5zaW9uc0NoYW5nZUNvdW50ICs9IDE7XG5cbiAgICB2YXIgaXNBdmFpbGFibGVXaWR0aENoYW5naW5nID0gYXZhaWxhYmxlV2lkdGggIT09IHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aDtcbiAgICB0aGlzLl9sYXN0QXZhaWxhYmxlV2lkdGggPSBhdmFpbGFibGVXaWR0aDtcblxuICAgIHRoaXMuZGltZW5zaW9ucy53aWR0aCA9IHRoaXMuX2xhc3RBdmFpbGFibGVXaWR0aCAtIHRoaXMubWFyZ2luLmxlZnQgLSB0aGlzLm1hcmdpbi5yaWdodDtcblxuICAgIGlmICghdGhpcy5fZGlzYWJsZWQgJiYgKGlzQXZhaWxhYmxlV2lkdGhDaGFuZ2luZyB8fCB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPT09IDEpKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVYKClcbiAgICAgICAgICAgIC51cGRhdGVYQXhpc0ludGVydmFsKClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgICAgICAuZHJhd0VsZW1lbnRzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBhdmFpbGFibGUgaGVpZ2h0IHNvIHRoYXQgZXZlcnkgdGhpbmcgdXBkYXRlIGNvcnJlc3BvbmRpbmdseVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBhdmFpbGFibGVIZWlnaHRcbiAqIEByZXR1cm5zIHtEM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5zZXRBdmFpbGFibGVIZWlnaHQgPSBmdW5jdGlvbihhdmFpbGFibGVIZWlnaHQpIHtcblxuICAgIHRoaXMuX2RpbWVuc2lvbnNDaGFuZ2VDb3VudCArPSAxO1xuXG4gICAgdmFyIGlzQXZhaWxhYmxlSGVpZ2h0Q2hhbmdpbmcgPSBhdmFpbGFibGVIZWlnaHQgIT09IHRoaXMuX2xhc3RBdmFpbGFibGVIZWlnaHQ7XG4gICAgdGhpcy5fbGFzdEF2YWlsYWJsZUhlaWdodCA9IGF2YWlsYWJsZUhlaWdodDtcblxuICAgIHRoaXMuX21heEJvZHlIZWlnaHQgPSB0aGlzLl9sYXN0QXZhaWxhYmxlSGVpZ2h0IC0gdGhpcy5tYXJnaW4udG9wIC0gdGhpcy5tYXJnaW4uYm90dG9tO1xuXG4gICAgaWYgKCF0aGlzLl9kaXNhYmxlZCAmJiAoaXNBdmFpbGFibGVIZWlnaHRDaGFuZ2luZyB8fCB0aGlzLl9kaW1lbnNpb25zQ2hhbmdlQ291bnQgPT09IDEpKSB7XG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC51cGRhdGVZKClcbiAgICAgICAgICAgIC5kcmF3WEF4aXMoKVxuICAgICAgICAgICAgLmRyYXdZQXhpcygpXG4gICAgICAgICAgICAuZHJhd0VsZW1lbnRzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBlbGVtZW50cyB3aGljaCBkZXBlbmRzIG9uIHggYW5kIHkgZGltZW5zaW9uc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVYWSA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgIHRoaXMuX3ByZXZlbnRFdmVudEVtaXNzaW9uID0gdHJ1ZTtcbiAgICB0aGlzLnVwZGF0ZVgodHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB0aGlzLl9wcmV2ZW50RXZlbnRFbWlzc2lvbiA9IGZhbHNlO1xuICAgIHRoaXMudXBkYXRlWSh0cmFuc2l0aW9uRHVyYXRpb24pO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgZWxlbWVudHMgd2hpY2ggZGVwZW5kcyBvbiB4IGRpbWVuc2lvblxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVYID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCArIHRoaXMubWFyZ2luLmxlZnQgKyB0aGlzLm1hcmdpbi5yaWdodCk7XG5cbiAgICB0aGlzLnNjYWxlcy54XG4gICAgICAgIC5kb21haW4oW3RoaXMubWluWCwgdGhpcy5tYXhYXSlcbiAgICAgICAgLnJhbmdlKFswLCB0aGlzLmRpbWVuc2lvbnMud2lkdGhdKTtcblxuICAgIHRoaXMuYXhpc2VzLnlcbiAgICAgICAgLmlubmVyVGlja1NpemUoLXRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWFxuICAgICAgICAueCh0aGlzLnNjYWxlcy54KVxuICAgICAgICAudHJhbnNsYXRlKHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCkpXG4gICAgICAgIC5zY2FsZSh0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCkpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5ib2R5LnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYm91bmRpbmdSZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuICAgIHRoaXMuZWxlbWVudHMuYm9keS5zZWxlY3QoJ3JlY3QuJyArIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWNvbnRhY3RSZWN0JykuYXR0cignd2lkdGgnLCB0aGlzLmRpbWVuc2lvbnMud2lkdGgpO1xuICAgIHRoaXMuY29udGFpbmVyLnNlbGVjdCgncmVjdC4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctYmFja2dyb3VuZFJlY3QnKS5hdHRyKCd3aWR0aCcsIHRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG4gICAgdGhpcy5lbGVtZW50cy5jbGlwLnNlbGVjdCgncmVjdCcpLmF0dHIoJ3dpZHRoJywgdGhpcy5kaW1lbnNpb25zLndpZHRoKTtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLCB0aGlzLmNvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgZWxlbWVudHMgd2hpY2ggZGVwZW5kcyBvbiB5IGRpbWVuc2lvblxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS51cGRhdGVZID0gZnVuY3Rpb24gKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyO1xuICAgIHZhciBjbGlwID0gdGhpcy5lbGVtZW50cy5jbGlwLnNlbGVjdCgncmVjdCcpO1xuICAgIHZhciBib3VuZGluZ1JlY3QgPSB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1ib3VuZGluZ1JlY3QnKTtcblxuICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBjbGlwID0gY2xpcC50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgYm91bmRpbmdSZWN0ID0gYm91bmRpbmdSZWN0LnRyYW5zaXRpb24oKS5kdXJhdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgIH1cblxuICAgIHZhciBlbGVtZW50QW1vdW50ID0gdGhpcy5kYXRhLmxlbmd0aDtcblxuICAgIC8vIGhhdmUgMSBtb3JlIGVsZW1udCB0byBmb3JjZSByZXByZXNlbnRpbmcgb25lIG1vcmUgdGlja1xuICAgIHZhciBlbGVtZW50c1JhbmdlID0gWzAsIGVsZW1lbnRBbW91bnRdO1xuXG4gICAgLy8gY29tcHV0ZSBuZXcgaGVpZ2h0XG4gICAgdGhpcy5kaW1lbnNpb25zLmhlaWdodCA9IE1hdGgubWluKHRoaXMuZGF0YS5sZW5ndGggKiB0aGlzLm9wdGlvbnMucm93SGVpZ2h0LCB0aGlzLl9tYXhCb2R5SGVpZ2h0KTtcblxuICAgIC8vIGNvbXB1dGUgbmV3IFkgc2NhbGVcbiAgICB0aGlzLl95U2NhbGUgPSB0aGlzLm9wdGlvbnMucm93SGVpZ2h0IC8gdGhpcy5kaW1lbnNpb25zLmhlaWdodCAqIGVsZW1lbnRBbW91bnQ7XG5cbiAgICAvLyB1cGRhdGUgWSBzY2FsZSwgYXhpcyBhbmQgem9vbSBiZWhhdmlvclxuICAgIHRoaXMuc2NhbGVzLnkuZG9tYWluKGVsZW1lbnRzUmFuZ2UpLnJhbmdlKFswLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0XSk7XG5cbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWS55KHRoaXMuc2NhbGVzLnkpLnRyYW5zbGF0ZSh0aGlzLl9sYXN0VHJhbnNsYXRlKS5zY2FsZSh0aGlzLl95U2NhbGUpO1xuXG4gICAgLy8gYW5kIHVwZGF0ZSBYIGF4aXMgdGlja3MgaGVpZ2h0XG4gICAgdGhpcy5heGlzZXMueC5pbm5lclRpY2tTaXplKC10aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcblxuICAgIC8vIHVwZGF0ZSBzdmcgaGVpZ2h0XG4gICAgY29udGFpbmVyLmF0dHIoJ2hlaWdodCcsdGhpcy5kaW1lbnNpb25zLmhlaWdodCArIHRoaXMubWFyZ2luLnRvcCArIHRoaXMubWFyZ2luLmJvdHRvbSk7XG5cbiAgICAvLyB1cGRhdGUgaW5uZXIgcmVjdCBoZWlnaHRcbiAgICB0aGlzLmVsZW1lbnRzLmJvZHkuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1jb250YWN0UmVjdCcpLmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuICAgIGJvdW5kaW5nUmVjdC5hdHRyKCdoZWlnaHQnLCB0aGlzLmRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICBjb250YWluZXIuc2VsZWN0KCdyZWN0LicgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1iYWNrZ3JvdW5kUmVjdCcpLmF0dHIoJ2hlaWdodCcsIHRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuICAgIGNsaXAuYXR0cignaGVpZ2h0JywgdGhpcy5kaW1lbnNpb25zLmhlaWdodCk7XG5cbiAgICB0aGlzLnN0b3BFbGVtZW50VHJhbnNpdGlvbigpO1xuXG4gICAgdGhpcy5lbWl0KHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMsIHRoaXMuY29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBjb2x1bW4gd2l0aCwgYmFzaWNhbGx5IHRoZSB3aWR0aCBjb3JyZXNwb25kaW5nIHRvIDEgdW5pdCBpbiB4IGRhdGEgZGltZW5zaW9uXG4gKlxuICogQHJldHVybnMge0QzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLnVwZGF0ZVhBeGlzSW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuY29sdW1uV2lkdGggPSB0aGlzLnNjYWxlcy54KDEpIC0gdGhpcy5zY2FsZXMueCgwKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEcmF3IHRoZSB4IGF4aXNlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICogQHBhcmFtIHtCb29sZWFufSBbc2tpcFRpY2tzXSBTaG91bGQgbm90IGRyYXcgdGljayBsaW5lc1xuICogQHJldHVybnMge0QzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmRyYXdYQXhpcyA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbiwgc2tpcFRpY2tzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAuaW5uZXJUaWNrU2l6ZShza2lwVGlja3MgPyAwIDogLXRoaXMuZGltZW5zaW9ucy53aWR0aCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5feEF4aXNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3hBeGlzQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX3hBeGlzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKHNlbGYuZWxlbWVudHMueEF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5jYWxsKHNlbGYuYXhpc2VzLngpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdsaW5lJylcbiAgICAgICAgICAgIC5zdHlsZSh7XG4gICAgICAgICAgICAgICAgJ3N0cm9rZS13aWR0aCc6IHNlbGYub3B0aW9ucy54QXhpc1N0cm9rZVdpZHRoLmJpbmQoc2VsZilcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYud3JhcFdpdGhBbmltYXRpb24oc2VsZi5lbGVtZW50cy54MkF4aXNDb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5jYWxsKHNlbGYuYXhpc2VzLngyKVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgndGV4dCcpXG4gICAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAgICAgeDogc2VsZi5jb2x1bW5XaWR0aCAvIDJcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3R5bGUoe1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICtkID09PSArc2VsZi5tYXhYID8gJ25vbmUnIDogJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRHJhdyB0aGUgeSBheGlzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtza2lwVGlja3NdIFNob3VsZCBub3QgZHJhdyB0aWNrIGxpbmVzXG4gKiBAcmV0dXJucyB7RDNUYWJsZX1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZHJhd1lBeGlzID0gZnVuY3Rpb24gZHJhd1lBeGlzKHRyYW5zaXRpb25EdXJhdGlvbiwgc2tpcFRpY2tzKSB7XG5cbiAgICBpZiAodGhpcy5fcHJldmVudERyYXdpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5heGlzZXMueFxuICAgICAgICAuaW5uZXJUaWNrU2l6ZShza2lwVGlja3MgPyAwIDogLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQpO1xuXG4gICAgdmFyIGRvbWFpblkgPSB0aGlzLnNjYWxlcy55LmRvbWFpbigpO1xuXG4gICAgdGhpcy5heGlzZXMueVxuICAgICAgICAudGlja1ZhbHVlcyhkMy5yYW5nZShNYXRoLnJvdW5kKGRvbWFpbllbMF0pLCBNYXRoLnJvdW5kKGRvbWFpbllbMV0pLCAxKSk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5feUF4aXNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3lBeGlzQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX3lBeGlzQUYgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgY29udGFpbmVyID0gc2VsZi53cmFwV2l0aEFuaW1hdGlvbihzZWxmLmVsZW1lbnRzLnlBeGlzQ29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xuICAgICAgICBjb250YWluZXIuY2FsbChzZWxmLmF4aXNlcy55KTtcblxuICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ3RleHQnKS5hdHRyKCd5Jywgc2VsZi5vcHRpb25zLnJvd0hlaWdodCAvIDIpO1xuXG4gICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgLnNlbGVjdEFsbCgnbGluZScpLnN0eWxlKCdkaXNwbGF5JywgZnVuY3Rpb24oZCxpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPyAnJyA6ICdub25lJztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICpcbiAqIEByZXR1cm5zIHtBcnJheTxEM1RhYmxlUm93Pn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuY2xvbmVEYXRhID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gdGhpcy5kYXRhLm1hcChmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtEM1RhYmxlUm93fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBkKSB7XG4gICAgICAgICAgICBpZiAoZC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleSAhPT0gJ2VsZW1lbnRzJykge1xuICAgICAgICAgICAgICAgICAgICByZXNba2V5XSA9IGRba2V5XTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNba2V5XSA9IGRba2V5XS5tYXAoc2VsZi5jbG9uZUVsZW1lbnQuYmluZChzZWxmKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9KTtcbn07XG5cbi8qKlxuICogVGhpcyBjbG9uZSBtZXRob2QgZG9lcyBub3QgY2xvbmUgdGhlIGVudGl0aWVzIGl0c2VsZlxuICpcbiAqIEByZXR1cm5zIHtBcnJheTxEM1RhYmxlRWxlbWVudD59XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNsb25lRmxhdHRlbmVkRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmZsYXR0ZW5lZERhdGEubWFwKGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge0QzVGFibGVFbGVtZW50fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBlKSB7XG4gICAgICAgICAgICBpZiAoZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgcmVzW2tleV0gPSBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUaGlzIGNsb25lIG1ldGhvZCBkb2VzIG5vdCBjbG9uZSB0aGUgZW50aXRpZXMgaXRzZWxmXG4gKlxuICogQHJldHVybnMge0QzVGFibGVFbGVtZW50fVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5jbG9uZUVsZW1lbnQgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RDNUYWJsZUVsZW1lbnR9XG4gICAgICovXG4gICAgdmFyIHJlcyA9IHt9O1xuXG4gICAgZm9yICh2YXIga2V5IGluIGUpIHtcbiAgICAgICAgaWYgKGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgcmVzW2tleV0gPSBlW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHJvdyBob2xkaW5nIHRoZSBwcm92aWRlZCBlbGVtZW50IChyZWZlcmVuY2UgZXF1YWxpdHkgdGVzdClcbiAqXG4gKiBAcGFyYW0ge0QzVGFibGVFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7RDNUYWJsZVJvd31cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZ2V0RWxlbWVudFJvdyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmluZCh0aGlzLmRhdGEsIGZ1bmN0aW9uKHJvdykge1xuICAgICAgICByZXR1cm4gcm93LmVsZW1lbnRzLmluZGV4T2YoZWxlbWVudCkgIT09IC0xO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBTdG9yZSBhIGNsb25lIG9mIHRoZSBjdXJyZW50bHkgYm91bmQgZmxhdHRlbmVkIGRhdGFcbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuc3RvcmVGbGF0dGVuZWREYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wcmV2aW91c0ZsYXR0ZW5lZERhdGEgPSB0aGlzLmNsb25lRmxhdHRlbmVkRGF0YSgpO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgbmV3IHNldCBvZiBmbGF0dGVuZWQgZGF0YSwgc3RvcmluZyBwcmV2aW91cyBzZXQgaWYgY29uZmlndXJlZCBzbyBhbmQgcHJlc2VydmluZyBlbGVtZW50IGZsYWdzXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmdlbmVyYXRlRmxhdHRlbmVkRGF0YSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy51c2VQcmV2aW91c0RhdGFGb3JUcmFuc2Zvcm0pIHtcbiAgICAgICAgdGhpcy5zdG9yZUZsYXR0ZW5lZERhdGEoKTtcbiAgICB9XG5cbiAgICB0aGlzLmZsYXR0ZW5lZERhdGEubGVuZ3RoID0gMDtcblxuICAgIHRoaXMuZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgZC5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucm93SW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHNlbGYuX2Zyb3plblVpZHMuaW5kZXhPZihlbGVtZW50LnVpZCkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5fZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLmZsYXR0ZW5lZERhdGEucHVzaChlbGVtZW50KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIHRyYW5zZm9ybSBzdHJpbmcgZm9yIGEgZ2l2ZW4gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7RDNUYWJsZUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmdldFRyYW5zZm9ybUZyb21EYXRhID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyB0aGlzLnNjYWxlcy54KHRoaXMuZ2V0RGF0YVN0YXJ0KGVsZW1lbnQpKSArICcsJyArIHRoaXMuc2NhbGVzLnkoZWxlbWVudC5yb3dJbmRleCkgKyAnKSc7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZWxlbWVudCB3aXRoIHRoZSBwcm92aWRlZCBib3VuZCBkYXRhIHNob3VsZCBiZSBjdWxsZWRcbiAqXG4gKiBAcGFyYW0ge0QzVGFibGVFbGVtZW50fSBkYXRhXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuY3VsbGluZ0ZpbHRlciA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIHZhciBkb21haW5YID0gdGhpcy5zY2FsZXMueC5kb21haW4oKTtcbiAgICB2YXIgZG9tYWluWFN0YXJ0ID0gZG9tYWluWFswXTtcbiAgICB2YXIgZG9tYWluWEVuZCA9IGRvbWFpblhbZG9tYWluWC5sZW5ndGggLSAxXTtcblxuICAgIHZhciBkb21haW5ZID0gdGhpcy5zY2FsZXMueS5kb21haW4oKTtcbiAgICB2YXIgZG9tYWluWVN0YXJ0ID0gZG9tYWluWVswXTtcbiAgICB2YXIgZG9tYWluWUVuZCA9IGRvbWFpbllbZG9tYWluWS5sZW5ndGggLSAxXTtcblxuICAgIHJldHVybiBkYXRhLl9kZWZhdWx0UHJldmVudGVkIHx8XG4gICAgICAgIC8vIE5PVCB4IGN1bGxpbmcgQU5EIE5PVCB5IGN1bGxpbmdcbiAgICAgICAgKFxuICAgICAgICAgICAgLy8gTk9UIHggY3VsbGluZ1xuICAgICAgICAgICAgKCF0aGlzLm9wdGlvbnMuY3VsbGluZ1ggfHwgISh0aGlzLmdldERhdGFFbmQoZGF0YSkgPCBkb21haW5YU3RhcnQgfHwgdGhpcy5nZXREYXRhU3RhcnQoZGF0YSkgPiBkb21haW5YRW5kKSlcbiAgICAgICAgICAgICYmXG4gICAgICAgICAgICAvLyBOT1QgeSBjdWxsaW5nXG4gICAgICAgICAgICAoIXRoaXMub3B0aW9ucy5jdWxsaW5nWSB8fCAoZGF0YS5yb3dJbmRleCA+PSBkb21haW5ZU3RhcnQgLSB0aGlzLm9wdGlvbnMuY3VsbGluZ0Rpc3RhbmNlICYmIGRhdGEucm93SW5kZXggPCBkb21haW5ZRW5kICsgdGhpcy5vcHRpb25zLmN1bGxpbmdEaXN0YW5jZSAtIDEpKVxuICAgICAgICApO1xufTtcblxuLyoqXG4gKiBHZXQgc3RhcnQgdmFsdWUgb2YgdGhlIHByb3ZpZGVkIGRhdGEsIHVzZWQgdG8gcmVwcmVzZW50IGVsZW1lbnQgc3RhcnRcbiAqXG4gKiBAcGFyYW0ge0QzVGFibGVFbGVtZW50fSBkYXRhXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5nZXREYXRhU3RhcnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuICtkYXRhLnN0YXJ0O1xufTtcblxuLyoqXG4gKiBHZXQgZW5kIHZhbHVlIG9mIHRoZSBwcm92aWRlZCBkYXRhLCB1c2VkIHRvIHJlcHJlc2VudCBlbGVtZW50IGVuZFxuICpcbiAqIEBwYXJhbSB7RDNUYWJsZUVsZW1lbnR9IGRhdGFcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmdldERhdGFFbmQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuICtkYXRhLmVuZDtcbn07XG5cbi8qKlxuICogTW92ZSB0aGUgZWxlbWVudHMgd2l0aCBjbGFtcGluZyB0aGUgYXNrZWQgbW92ZSBhbmQgcmV0dXJuZWQgd2hhdCBpdCBmaW5hbGx5IGRpZCB3aXRoIHRoZSBhc2tlZCB4IGFuZCB5IGRlbHRhXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtkeF0gQXNrZWQgeCBtb3ZlIGRlbHRhXG4gKiBAcGFyYW0ge051bWJlcn0gW2R5XSBBc2tlZCB5IG1vdmUgZGVsdGFcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlRHJhd10gU2hvdWxkIHRoZSBlbGVtZW50cyBiZSByZWRyYXduIGluc3RlYWQgb2YgdHJhbnNsYXRpbmcgdGhlIGlubmVyIGNvbnRhaW5lclxuICogQHBhcmFtIHtCb29sZWFufSBbc2tpcFhBeGlzXSBTaG91bGQgdGhlIHggYXhpcyBub3QgYmUgcmVkcmF3blxuICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VUaWNrc10gU2hvdWxkIHRoZSB0aWNrIGxpbmVzIGJlIGRyYXduXG4gKiBAcmV0dXJucyB7W051bWJlciwgTnVtYmVyLCBOdW1iZXIsIE51bWJlcl19IEZpbmFsIHRyYW5zbGF0ZSB4LCBmaW5hbCB0cmFuc2xhdGUgeSwgdHJhbnNsYXRlIHggZGVsdGEsIHRyYW5zbGF0ZSB5IGRlbHRhXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihkeCwgZHksIGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKSB7XG5cbiAgICBkeCA9IGR4IHx8IDA7XG4gICAgZHkgPSBkeSB8fCAwO1xuXG4gICAgdmFyIGN1cnJlbnRUcmFuc2xhdGUgPSB0aGlzLmJlaGF2aW9ycy56b29tLnRyYW5zbGF0ZSgpO1xuICAgIHZhciB1cGRhdGVkVCA9IFtjdXJyZW50VHJhbnNsYXRlWzBdICsgZHgsIGN1cnJlbnRUcmFuc2xhdGVbMV0gKyBkeV07XG5cbiAgICB1cGRhdGVkVCA9IHRoaXMuX2NsYW1wVHJhbnNsYXRpb25XaXRoU2NhbGUodXBkYXRlZFQsIFt0aGlzLmJlaGF2aW9ycy56b29tLnNjYWxlKCksIHRoaXMuYmVoYXZpb3JzLnpvb21ZLnNjYWxlKCldKTtcblxuICAgIHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKHVwZGF0ZWRUKTtcbiAgICB0aGlzLmJlaGF2aW9ycy56b29tWC50cmFuc2xhdGUodXBkYXRlZFQpO1xuICAgIHRoaXMuYmVoYXZpb3JzLnpvb21YLnNjYWxlKHRoaXMuYmVoYXZpb3JzLnpvb20uc2NhbGUoKSk7XG4gICAgdGhpcy5iZWhhdmlvcnMuem9vbVkudHJhbnNsYXRlKHVwZGF0ZWRUKTtcblxuICAgIHRoaXMubW92ZUVsZW1lbnRzKGZvcmNlRHJhdywgc2tpcFhBeGlzLCBmb3JjZVRpY2tzKTtcblxuICAgIHRoaXMuX2xhc3RUcmFuc2xhdGUgPSB1cGRhdGVkVDtcblxuICAgIHRoaXMuZW1pdCh0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJyk7XG5cbiAgICByZXR1cm4gdXBkYXRlZFQuY29uY2F0KFt1cGRhdGVkVFswXSAtIGN1cnJlbnRUcmFuc2xhdGVbMF0sIHVwZGF0ZWRUWzFdIC0gY3VycmVudFRyYW5zbGF0ZVsxXV0pO1xufTtcblxuLyoqXG4gKiBNb3ZlIGVsZW1lbnRzLCBzd2l0Y2hpbmcgYmV0d2VlbiBkcmF3aW5nIG1ldGhvZHMgZGVwZW5kaW5nIG9uIGFyZ3VtZW50c1xuICogQmFzaWNhbGx5LCBpdCBzaG91bGQgYmUgdXNlZCB0byB0aGF0IGlzIGNob29zZXMgb3B0aW1pemVkIGRyYXdpbmcgKHRyYW5zbGF0aW5nIHRoZSBpbm5lciBjb250YWluZXIpIGlzIHRoZXJlIGlzIG5vIHNjYWxlIGNoYW5nZS5cbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZURyYXddIEZvcmNlIHRoZSBlbGVtZW50cyB0byBiZSBkcmF3biB3aXRob3V0IHRyYW5zbGF0aW9uIG9wdGltaXphdGlvblxuICogQHBhcmFtIHtCb29sZWFufSBbc2tpcFhBeGlzXSBTa2lwIHggYXhpcyBiZWluZyByZWRyYXduIChhbHdheXMgdGhlIGNhc2Ugd2hlbiB0aGUgc2NhbGUgZG9lcyBub3QgY2hhbmdlIG9uIG1vdmUpXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZVRpY2tzXSBGb3JjZSB0aWNrcyB0byBiZSByZWRyYXduOyBpZiBmYWxzZSB0aGVuIHRoZXkgd2lsbCBiZSBoaWRkZW5cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUubW92ZUVsZW1lbnRzID0gZnVuY3Rpb24oZm9yY2VEcmF3LCBza2lwWEF4aXMsIGZvcmNlVGlja3MpIHtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLnJlbmRlck9uSWRsZSB8fCBmb3JjZURyYXcpIHtcbiAgICAgICAgdGhpcy5kcmF3RWxlbWVudHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRyYW5zbGF0ZUVsZW1lbnRzKHRoaXMuYmVoYXZpb3JzLnpvb20udHJhbnNsYXRlKCksIHRoaXMuX2xhc3RUcmFuc2xhdGUpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhd1lBeGlzKHVuZGVmaW5lZCwgIWZvcmNlVGlja3MpO1xuXG4gICAgaWYgKCFza2lwWEF4aXMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVYQXhpc0ludGVydmFsKCk7XG4gICAgICAgIHRoaXMuZHJhd1hBeGlzKHVuZGVmaW5lZCwgIWZvcmNlVGlja3MpO1xuICAgIH1cbn07XG5cbi8qKlxuICogRHJhdyBlbGVtZW50cyAoZW50ZXJpbmcsIGV4aXRpbmcsIHVwZGF0aW5nKVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICogQHJldHVybnMge0QzVGFibGV9XG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmRyYXdFbGVtZW50cyA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgaWYgKHRoaXMuX3ByZXZlbnREcmF3aW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuc3RvcEVsZW1lbnRUcmFuc2l0aW9uKCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5fZWxlbWVudHNBRikge1xuICAgICAgICB0aGlzLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2VsZW1lbnRzQUYpXG4gICAgfVxuXG4gICAgdGhpcy5fZWxlbWVudHNBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1hcCBvZiBzdGFydCB0cmFuc2Zvcm0gc3RyaW5ncyBmb3IgYWxsIGVsZW1lbnRzXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3Q8U3RyaW5nPn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBzdGFydFRyYW5zZm9ybU1hcCA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXAgb2YgZW5kIHRyYW5zZm9ybSBzdHJpbmdzIGZvciBhbGwgZWxlbWVudHNcbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUge09iamVjdDxTdHJpbmc+fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGVuZFRyYW5zZm9ybU1hcCA9IHt9O1xuXG5cbiAgICAgICAgLy8gZmlsbCBib3RoIHRyYW5zZm9ybSBzdHJpbmcgbWFwc1xuXG4gICAgICAgIGlmIChzZWxmLm9wdGlvbnMudXNlUHJldmlvdXNEYXRhRm9yVHJhbnNmb3JtICYmIHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcbiAgICAgICAgICAgIGlmIChzZWxmLnByZXZpb3VzRmxhdHRlbmVkRGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYucHJldmlvdXNGbGF0dGVuZWREYXRhLmZvckVhY2goXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge0QzVGFibGVFbGVtZW50fSBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXN0YXJ0VHJhbnNmb3JtTWFwW2RhdGEudWlkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VHJhbnNmb3JtTWFwW2RhdGEuaWRdID0gc3RhcnRUcmFuc2Zvcm1NYXBbZGF0YS51aWRdID0gc2VsZi5nZXRUcmFuc2Zvcm1Gcm9tRGF0YShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2VsZi5mbGF0dGVuZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5mbGF0dGVuZWREYXRhLmZvckVhY2goXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge0QzVGFibGVFbGVtZW50fSBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVuZFRyYW5zZm9ybU1hcFtkYXRhLnVpZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRUcmFuc2Zvcm1NYXBbZGF0YS5pZF0gPSBlbmRUcmFuc2Zvcm1NYXBbZGF0YS51aWRdID0gc2VsZi5nZXRUcmFuc2Zvcm1Gcm9tRGF0YShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmaWx0ZXIgd2l0aCBjdWxsaW5nIGxvZ2ljXG4gICAgICAgIHZhciBkYXRhID0gc2VsZi5mbGF0dGVuZWREYXRhLmZpbHRlcihzZWxmLmN1bGxpbmdGaWx0ZXIuYmluZChzZWxmKSk7XG5cbiAgICAgICAgdmFyIGdyb3VwcyA9IHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuc2VsZWN0QWxsKCdnLicgKyBzZWxmLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1lbGVtZW50JylcbiAgICAgICAgICAgIC5kYXRhKGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZC51aWQ7XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIC8vIGhhbmRsZSBleGl0aW5nIGVsZW1lbnRzXG5cbiAgICAgICAgdmFyIGV4aXRpbmcgPSBncm91cHMuZXhpdCgpO1xuXG4gICAgICAgIGlmIChzZWxmLm9wdGlvbnMuZW5hYmxlVHJhbnNpdGlvbk9uRXhpdCAmJiB0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG5cbiAgICAgICAgICAgIGV4aXRpbmcuZWFjaChcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge0QzVGFibGVFbGVtZW50fSBkYXRhXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBncm91cCA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRFeGl0KGdyb3VwLCBkYXRhKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmbGFnIHRoZSBlbGVtZW50IGFzIHJlbW92ZWRcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5fcmVtb3ZlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4aXRUcmFuc2Zvcm0gPSBlbmRUcmFuc2Zvcm1NYXBbZGF0YS51aWRdIHx8IGVuZFRyYW5zZm9ybU1hcFtkYXRhLmlkXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZXhpdFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi53cmFwV2l0aEFuaW1hdGlvbihncm91cCwgdHJhbnNpdGlvbkR1cmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBleGl0VHJhbnNmb3JtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0RGV0YWlsZWRFdmVudCgnZWxlbWVudDpyZW1vdmUnLCBncm91cCwgbnVsbCwgW2RhdGFdKTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleGl0aW5nXG4gICAgICAgICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyBoYW5kbGUgZW50ZXJpbmcgZWxlbWVudHNcblxuICAgICAgICBncm91cHMuZW50ZXIoKS5hcHBlbmQoJ2cnKVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAuZWFjaChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbGVtZW50RW50ZXIoZDMuc2VsZWN0KHRoaXMpLCBkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgLy8gaGFuZGxlIGFsbCBlbGVtZW50cyBleGlzdGluZyBhZnRlciBlbnRlcmluZ1xuXG4gICAgICAgIGdyb3Vwcy5lYWNoKFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge0QzVGFibGVFbGVtZW50fSBkYXRhXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgIGlmIChkYXRhLl9yZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSBkMy5zZWxlY3QodGhpcyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5fZGVmYXVsdFByZXZlbnRlZCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudFVwZGF0ZShncm91cCwgZGF0YSwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGlzVXBkYXRlID0gZGF0YS5fcG9zaXRpb25lZDtcblxuICAgICAgICAgICAgICAgIHZhciBuZXdUcmFuc2Zvcm0gPSBlbmRUcmFuc2Zvcm1NYXBbZGF0YS51aWRdIHx8IGVuZFRyYW5zZm9ybU1hcFtkYXRhLmlkXSB8fCBzZWxmLmdldFRyYW5zZm9ybUZyb21EYXRhKGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25EdXJhdGlvbiA+IDApIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgb3JpZ2luVHJhbnNmb3JtID0gc3RhcnRUcmFuc2Zvcm1NYXBbZGF0YS51aWRdIHx8IHN0YXJ0VHJhbnNmb3JtTWFwW2RhdGEuaWRdIHx8IG5ld1RyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1vZGlmaWVkT3JpZ2luVHJhbnNmb3JtO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNVcGRhdGUgJiYgc2VsZi5vcHRpb25zLnVzZVByZXZpb3VzRGF0YUZvclRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpblRyYW5zZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkT3JpZ2luVHJhbnNmb3JtID0gb3JpZ2luVHJhbnNmb3JtO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwLmF0dHIoJ3RyYW5zZm9ybScsIG9yaWdpblRyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZWxmLndyYXBXaXRoQW5pbWF0aW9uKGdyb3VwLCB0cmFuc2l0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0clR3ZWVuKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmlnaW5UcmFuc2Zvcm0gPSBtb2RpZmllZE9yaWdpblRyYW5zZm9ybSB8fCBncm91cC5hdHRyKCd0cmFuc2Zvcm0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmVuYWJsZVlUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5pbnRlcnBvbGF0ZVRyYW5zZm9ybShvcmlnaW5UcmFuc2Zvcm0sIG5ld1RyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXJ0VHJhbnNmb3JtID0gZDMudHJhbnNmb3JtKG9yaWdpblRyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbmRUcmFuc2Zvcm0gPSBkMy50cmFuc2Zvcm0obmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUcmFuc2Zvcm0udHJhbnNsYXRlWzFdID0gZW5kVHJhbnNmb3JtLnRyYW5zbGF0ZVsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLmludGVycG9sYXRlVHJhbnNmb3JtKHN0YXJ0VHJhbnNmb3JtLnRvU3RyaW5nKCksIGVuZFRyYW5zZm9ybS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgbmV3VHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkYXRhLl9wb3NpdGlvbmVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudFVwZGF0ZShncm91cCwgZGF0YSwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgPSBbMC4wLCAwLjBdO1xuICAgICAgICBzZWxmLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLmF0dHIoJ3RyYW5zZm9ybScsIG51bGwpO1xuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkQzVGFibGUucHJvdG90eXBlLnRyYW5zbGF0ZUVsZW1lbnRzID0gZnVuY3Rpb24odHJhbnNsYXRlLCBwcmV2aW91c1RyYW5zbGF0ZSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHR4ID0gdHJhbnNsYXRlWzBdIC0gcHJldmlvdXNUcmFuc2xhdGVbMF07XG4gICAgdmFyIHR5ID0gdHJhbnNsYXRlWzFdIC0gcHJldmlvdXNUcmFuc2xhdGVbMV07XG5cbiAgICB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzBdID0gdGhpcy5jdXJyZW50RWxlbWVudHNHcm91cFRyYW5zbGF0ZVswXSArIHR4O1xuICAgIHRoaXMuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGVbMV0gPSB0aGlzLmN1cnJlbnRFbGVtZW50c0dyb3VwVHJhbnNsYXRlWzFdICsgdHk7XG5cblxuICAgIGlmICh0aGlzLl9lbHRzVHJhbnNsYXRlQUYpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9lbHRzVHJhbnNsYXRlQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX2VsdHNUcmFuc2xhdGVBRiA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHNlbGYuZWxlbWVudHMuaW5uZXJDb250YWluZXIuYXR0cih7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoJyArIHNlbGYuY3VycmVudEVsZW1lbnRzR3JvdXBUcmFuc2xhdGUgKyAnKSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHNlbGYuZWxlbWVudHNUcmFuc2xhdGUgIT09IHNlbGYubm9vcCkge1xuICAgICAgICAgICAgc2VsZi5lbGVtZW50cy5pbm5lckNvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoJy4nICsgc2VsZi5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpXG4gICAgICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnRzVHJhbnNsYXRlKGQzLnNlbGVjdCh0aGlzKSwgZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG59O1xuXG5EM1RhYmxlLnByb3RvdHlwZS5zdG9wRWxlbWVudFRyYW5zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsZW1lbnRzLmlubmVyQ29udGFpbmVyLnNlbGVjdEFsbCgnZy4nICsgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctZWxlbWVudCcpLnRyYW5zaXRpb24oKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtEM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge2QzLlNlbGVjdGlvbn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudEVudGVyID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBlbGVtZW50KSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbi8qKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtEM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHRyYW5zaXRpb25EdXJhdGlvblxuICogQHJldHVybnMge2QzLlNlbGVjdGlvbn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudFVwZGF0ZSA9IGZ1bmN0aW9uKHNlbGVjdGlvbiwgZWxlbWVudCwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7IHJldHVybiBzZWxlY3Rpb247IH07XG5cbi8qKlxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtEM1RhYmxlRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge2QzLlNlbGVjdGlvbn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUuZWxlbWVudEV4aXQgPSBmdW5jdGlvbihzZWxlY3Rpb24sIGVsZW1lbnQpIHsgcmV0dXJuIHNlbGVjdGlvbjsgfTtcblxuLyoqXG4gKiBXcmFwIHRoZSBzZWxlY3Rpb24gd2l0aCBhIGQzIHRyYW5zaXRpb24gaWYgdGhlIHRyYW5zaXRpb24gZHVyYXRpb24gaXMgZ3JlYXRlciB0aGFuIDBcbiAqXG4gKiBAcGFyYW0ge2QzLlNlbGVjdGlvbn0gc2VsZWN0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gW3RyYW5zaXRpb25EdXJhdGlvbl1cbiAqIEByZXR1cm5zIHtkMy5TZWxlY3Rpb258ZDMuVHJhbnNpdGlvbn1cbiAqL1xuRDNUYWJsZS5wcm90b3R5cGUud3JhcFdpdGhBbmltYXRpb24gPSBmdW5jdGlvbihzZWxlY3Rpb24sIHRyYW5zaXRpb25EdXJhdGlvbikge1xuICAgIGlmICh0cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XG4gICAgICAgIHJldHVybiBzZWxlY3Rpb24udHJhbnNpdGlvbigpLmR1cmF0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikuZWFzZSh0aGlzLm9wdGlvbnMudHJhbnNpdGlvbkVhc2luZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdGlvbjtcbiAgICB9XG59O1xuXG4vKipcbiAqIFByb3h5IHRvIHJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lc1xuICogRW5zdXJlIGFsbCBsaXN0ZW5lcnMgcmVnaXN0ZXIgYmVmb3JlIHRoZSBuZXh0IGZyYW1lIGFyZSBwbGF5ZWQgaW4gdGhlIHNhbWUgc2VxdWVuY2VcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihsaXN0ZW5lcikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMucHVzaChsaXN0ZW5lcik7XG5cbiAgICBpZiAodGhpcy5fbmV4dEFuaW1hdGlvbkZyYW1lSGFuZGxlcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBnO1xuICAgICAgICAgICAgd2hpbGUoZyA9IHNlbGYuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLnNoaWZ0KCkpIGcoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpc3RlbmVyO1xufTtcblxuLyoqXG4gKiBQcm94eSB0byBjYW5jZWwgYW5pbWF0aW9uIGZyYW1lXG4gKiBSZW1vdmUgdGhlIGxpc3RlbmVyIGZyb20gdGhlIGxpc3Qgb2YgZnVuY3Rpb25zIHRvIGJlIHBsYXllZCBvbiBuZXh0IGFuaW1hdGlvbiBmcmFtZVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24obGlzdGVuZXIpIHtcblxuICAgIHZhciBpbmRleCA9IHRoaXMuX25leHRBbmltYXRpb25GcmFtZUhhbmRsZXJzLmxlbmd0aCA+IDAgPyB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5pbmRleE9mKGxpc3RlbmVyKSA6IC0xO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICB0aGlzLl9uZXh0QW5pbWF0aW9uRnJhbWVIYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbn07XG5cbi8qKlxuICogQ2FsbCBhIG1vdmUgZm9yY2luZyB0aGUgZHJhd2luZ3MgdG8gZml0IHdpdGhpbiBzY2FsZSBkb21haW5zXG4gKlxuICogQHJldHVybnMge1tOdW1iZXIsTnVtYmVyLE51bWJlcixOdW1iZXJdfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS5lbnN1cmVJbkRvbWFpbnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tb3ZlKDAsIDAsIGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIFRvZ2dsZSBpbnRlcm5hbCBkcmF3aW5nIHByZXZlbnQgZmxhZ1xuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2FjdGl2ZV0gSWYgbm90IHByb3ZpZGVkLCBpdCBuZWdhdGVzIHRoZSBjdXJyZW50IGZsYWcgdmFsdWVcbiAqIEByZXR1cm5zIHtEM1RhYmxlfVxuICovXG5EM1RhYmxlLnByb3RvdHlwZS50b2dnbGVEcmF3aW5nID0gZnVuY3Rpb24oYWN0aXZlKSB7XG5cbiAgICB0aGlzLl9wcmV2ZW50RHJhd2luZyA9IHR5cGVvZiBhY3RpdmUgPT09ICdib29sZWFuJyA/ICFhY3RpdmUgOiAhdGhpcy5fcHJldmVudERyYXdpbmc7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9mci9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PYmpldHNfZ2xvYmF1eC9BcnJheS9maW5kXG4gKiBAdHlwZSB7KnxGdW5jdGlvbn1cbiAqIEBwcml2YXRlXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLl9maW5kID0gZnVuY3Rpb24obGlzdCwgcHJlZGljYXRlKSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3QubGVuZ3RoID4+PiAwO1xuICAgIHZhciB0aGlzQXJnID0gbGlzdDtcbiAgICB2YXIgdmFsdWU7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gbGlzdFtpXTtcbiAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBsaXN0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogQ2xhbXBlZCBwcm92aWRlZCB0cmFuc2xhdGlvbiBiYXNlZCBvbiBkaW1lbnNpb25zIGFuZCBjdXJyZW50IHByb3ZpZGVkIHNjYWxlc1xuICpcbiAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfSB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7W051bWJlcixOdW1iZXJdfSBzY2FsZVxuICogQHJldHVybnMge1tOdW1iZXIsTnVtYmVyXX1cbiAqIEBwcml2YXRlXG4gKi9cbkQzVGFibGUucHJvdG90eXBlLl9jbGFtcFRyYW5zbGF0aW9uV2l0aFNjYWxlID0gZnVuY3Rpb24odHJhbnNsYXRlLCBzY2FsZSkge1xuXG4gICAgc2NhbGUgPSBzY2FsZSB8fCBbMSwgMV07XG5cbiAgICBpZiAoIShzY2FsZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICBzY2FsZSA9IFtzY2FsZSwgc2NhbGVdO1xuICAgIH1cblxuICAgIHZhciB0eCA9IHRyYW5zbGF0ZVswXTtcbiAgICB2YXIgdHkgPSB0cmFuc2xhdGVbMV07XG4gICAgdmFyIHN4ID0gc2NhbGVbMF07XG4gICAgdmFyIHN5ID0gc2NhbGVbMV07XG5cbiAgICBpZiAoc3ggPT09IDEpIHtcbiAgICAgICAgdHggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHR4ID0gTWF0aC5taW4oTWF0aC5tYXgoLXRoaXMuZGltZW5zaW9ucy53aWR0aCAqIChzeC0xKSwgdHgpLCAwKTtcbiAgICB9XG5cbiAgICBpZiAoc3kgPT09IDEpIHtcbiAgICAgICAgdHkgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHR5ID0gTWF0aC5taW4oTWF0aC5tYXgoLXRoaXMuZGltZW5zaW9ucy5oZWlnaHQgKiAoc3ktMSksIHR5KSwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFt0eCwgdHldO1xuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBEM1RhYmxlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cy9ldmVudHMnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcbmltcG9ydCBEM1RhYmxlIGZyb20gJy4vRDNUYWJsZSc7XG5cbi8qKlxuICogVGFibGUgbWFya2VyIG9wdGlvbnMgd2hpY2gga25vd3MgaG93IHRvIHJlcHJlc2VudCBpdHNlbGYgaW4gYSB7QGxpbmsgRDNUYWJsZSNjb250YWluZXJ9XG4gKlxuICogQHBhcmFtIHtEM1RhYmxlTWFya2VyT3B0aW9uc30gb3B0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGFibGVNYXJrZXIob3B0aW9ucykge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBleHRlbmQodHJ1ZSwge30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0QzVGFibGV9XG4gICAgICovXG4gICAgdGhpcy50YWJsZSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7ZDMuU2VsZWN0aW9ufVxuICAgICAqL1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHt7bGluZTogZDMuU2VsZWN0aW9uLCBsYWJlbDogZDMuU2VsZWN0aW9ufX1cbiAgICAgKi9cbiAgICB0aGlzLmVsZW1lbnRzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMudmFsdWUgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fdGFibGVSZXNpemVMaXN0ZW5lciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl90YWJsZURlc3Ryb3lMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RUaW1lVXBkYXRlZCA9IG51bGw7XG59XG5cbmluaGVyaXRzKEQzVGFibGVNYXJrZXIsIEV2ZW50RW1pdHRlcik7XG5cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLkxBWU9VVF9IT1JJWk9OVEFMID0gJ2hvcml6b250YWwnO1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuTEFZT1VUX1ZFUlRJQ0FMID0gJ3ZlcnRpY2FsJztcblxuLyoqXG4gKiBAdHlwZSB7RDNUYWJsZU1hcmtlck9wdGlvbnN9XG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmRlZmF1bHRzID0ge1xuICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZCkgeyByZXR1cm4gZDsgfSxcbiAgICBvdXRlclRpY2tTaXplOiAxMCxcbiAgICB0aWNrUGFkZGluZzogMyxcbiAgICByb3VuZFBvc2l0aW9uOiBmYWxzZSxcbiAgICBiZW1CbG9ja05hbWU6ICd0YWJsZU1hcmtlcicsXG4gICAgYmVtTW9kaWZpZXJzOiBbXSxcbiAgICBsYXlvdXQ6IEQzVGFibGVNYXJrZXIucHJvdG90eXBlLkxBWU9VVF9WRVJUSUNBTCxcbiAgICBsaW5lU2hhcGU6ICdsaW5lJyxcbiAgICByZWN0VGhpY2tuZXNzOiBEM1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cy5yb3dIZWlnaHRcbn07XG5cbi8qKlxuICogU2V0IHRoZSB0YWJsZSBpdCBzaG91bGQgZHJhdyBpdHNlbGYgb250b1xuICogQHBhcmFtIHtEM1RhYmxlfSB0YWJsZVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zZXRUYWJsZSA9IGZ1bmN0aW9uKHRhYmxlKSB7XG5cbiAgICB2YXIgcHJldmlvdXNUYWJsZSA9IHRoaXMudGFibGU7XG5cbiAgICB0aGlzLnRhYmxlID0gdGFibGUgJiYgdGFibGUgaW5zdGFuY2VvZiBEM1RhYmxlID8gdGFibGUgOiBudWxsO1xuXG4gICAgaWYgKHRoaXMudGFibGUpIHtcbiAgICAgICAgaWYgKHByZXZpb3VzVGFibGUgIT09IHRoaXMudGFibGUpIHtcbiAgICAgICAgICAgIGlmIChwcmV2aW91c1RhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51bmJpbmRUYWJsZShwcmV2aW91c1RhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYmluZFRhYmxlKCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCF0aGlzLnRhYmxlICYmIHByZXZpb3VzVGFibGUpIHtcbiAgICAgICAgdGhpcy51bmJpbmRUYWJsZShwcmV2aW91c1RhYmxlKTtcbiAgICB9XG5cbn07XG5cbi8qKlxuICogQ29tcGFyZSB0d28gdmFsdWVzXG4gKiBUbyBiZSBvdmVycmlkZGVuIGlmIHlvdSB3aXNoIHRoZSBtYXJrZXIgbm90IHRvIGJlIG1vdmVkIGZvciBzb21lIHZhbHVlIGNoYW5nZXMgd2hpY2ggc2hvdWxkIG5vdCBpbXBhY3QgdGhlIG1hcmtlciBwb3NpdGlvblxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBhXG4gKiBAcGFyYW0ge051bWJlcn0gYlxuICogQHJldHVybnMge0Jvb2xlYW59XG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnZhbHVlQ29tcGFyYXRvciA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gK2EgIT09ICtiO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIHZhbHVlIGZvciB0aGUgbWFya2VyLCB3aGljaCB1cGRhdGVzIGlmIGl0IG5lZWRzIHRvXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtzaWxlbnRdXG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24odmFsdWUsIHNpbGVudCkge1xuXG4gICAgdmFyIHByZXZpb3VzVGltZVVwZGF0ZWQgPSB0aGlzLl9sYXN0VGltZVVwZGF0ZWQ7XG5cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy52YWx1ZUNvbXBhcmF0b3IocHJldmlvdXNUaW1lVXBkYXRlZCwgdGhpcy52YWx1ZSkgJiYgdGhpcy50YWJsZSAmJiB0aGlzLmNvbnRhaW5lcikge1xuXG4gICAgICAgIHRoaXMuX2xhc3RUaW1lVXBkYXRlZCA9IHRoaXMudmFsdWU7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJcbiAgICAgICAgICAgIC5kYXR1bSh7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXNpbGVudCkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn07XG5cbi8qKlxuICogVmFsdWUgZ2V0dGVyIGZyb20gZDMgc2VsZWN0aW9uIGRhdHVtIHdoaWNoIHNob3VsZCBiZSBtYWRlIG9mIGEgdmFsdWVcbiAqIFRvIGJlIG92ZXJyaWRkZW4gaWYgeW91IHdpc2ggdG8gYWx0ZXIgdGhpcyB2YWx1ZSBkeW5hbWljYWxseVxuICpcbiAqIEBwYXJhbSB7dmFsdWU6IE51bWJlcn0gZGF0YVxuICogQHJldHVybnMgeyp9XG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBkYXRhLnZhbHVlO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgYSBEM1RhYmxlIGJlaW5nIGJvdW5kXG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLmJpbmRUYWJsZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnICcgKyB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy0tJyArIHRoaXMub3B0aW9ucy5sYXlvdXQ7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmJlbU1vZGlmaWVycyAmJiBBcnJheS5pc0FycmF5KHRoaXMub3B0aW9ucy5iZW1Nb2RpZmllcnMpICYmIHRoaXMub3B0aW9ucy5iZW1Nb2RpZmllcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBjbGFzc05hbWUgPSBjbGFzc05hbWUgKyAnICcgKyB0aGlzLm9wdGlvbnMuYmVtTW9kaWZpZXJzLm1hcChmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLS0nICsgbW9kaWZpZXI7XG4gICAgICAgIH0pLmpvaW4oJyAnKTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMudGFibGUuY29udGFpbmVyXG4gICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAuZGF0dW0oe1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMudmFsdWVcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgY2xhc3NOYW1lKTtcblxuICAgIHN3aXRjaCh0aGlzLm9wdGlvbnMubGluZVNoYXBlKSB7XG4gICAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICAgICAgdGhpcy5lbGVtZW50cy5saW5lID0gdGhpcy5jb250YWluZXJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCdsaW5lJylcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCB0aGlzLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJy1saW5lJylcbiAgICAgICAgICAgICAgICAuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZWN0JzpcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMubGluZSA9IHRoaXMuY29udGFpbmVyXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgdGhpcy5vcHRpb25zLmJlbUJsb2NrTmFtZSArICctcmVjdCcpXG4gICAgICAgICAgICAgICAgLnN0eWxlKCdwb2ludGVyLWV2ZW50cycsICdub25lJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnRzLmxhYmVsID0gdGhpcy5jb250YWluZXJcbiAgICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsIHRoaXMub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxhYmVsJyk7XG5cbiAgICB0aGlzLnNpemVMaW5lQW5kTGFiZWwoKTtcblxuICAgIC8vIG9uIHRhYmxlIG1vdmUsIG1vdmUgdGhlIG1hcmtlclxuICAgIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyID0gdGhpcy5tb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy50YWJsZS5vbih0aGlzLnRhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzptb3ZlJywgdGhpcy5fdGFibGVNb3ZlTGlzdGVuZXIpO1xuXG4gICAgLy8gb24gdGFibGUgcmVzaXplLCByZXNpemUgdGhlIG1hcmtlciBhbmQgbW92ZSBpdFxuICAgIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIgPSBmdW5jdGlvbih0YWJsZSwgc2VsZWN0aW9uLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcbiAgICAgICAgc2VsZi5yZXNpemUodHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgc2VsZi5tb3ZlKHRyYW5zaXRpb25EdXJhdGlvbik7XG4gICAgfTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnJlc2l6ZScsIHRoaXMuX3RhYmxlUmVzaXplTGlzdGVuZXIpO1xuXG4gICAgdGhpcy5fdGFibGVEZXN0cm95TGlzdGVuZXIgPSBmdW5jdGlvbih0YWJsZSkge1xuICAgICAgICBzZWxmLnVuYmluZFRhYmxlKHRhYmxlKTtcbiAgICB9O1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6ZGVzdHJveScsIHRoaXMuX3RhYmxlRGVzdHJveUxpc3RlbmVyKTtcblxuICAgIHRoaXMuZW1pdCgnbWFya2VyOmJvdW5kJyk7XG5cbiAgICB0aGlzLm1vdmUoKTtcblxufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvcnJlY3QgZGltZW5zaW9ucyBhbmQgbGFiZWwgY29udGVudFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbdHJhbnNpdGlvbkR1cmF0aW9uXVxuICovXG5EM1RhYmxlTWFya2VyLnByb3RvdHlwZS5zaXplTGluZUFuZExhYmVsID0gZnVuY3Rpb24odHJhbnNpdGlvbkR1cmF0aW9uKSB7XG5cbiAgICB2YXIgbGF5b3V0ID0gdGhpcy5vcHRpb25zLmxheW91dDtcblxuICAgIHZhciBsaW5lID0gdGhpcy5lbGVtZW50cy5saW5lO1xuICAgIHZhciBsYWJlbCA9IHRoaXMuZWxlbWVudHMubGFiZWw7XG5cbiAgICBpZiAodHJhbnNpdGlvbkR1cmF0aW9uID4gMCkge1xuICAgICAgICBsaW5lID0gbGluZS50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgbGFiZWwgPSBsYWJlbC50cmFuc2l0aW9uKCkuZHVyYXRpb24odHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBzd2l0Y2gobGF5b3V0KSB7XG5cbiAgICAgICAgY2FzZSB0aGlzLkxBWU9VVF9WRVJUSUNBTDpcblxuICAgICAgICAgICAgc3dpdGNoKHRoaXMub3B0aW9ucy5saW5lU2hhcGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkxOiAtdGhpcy5vcHRpb25zLm91dGVyVGlja1NpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTI6IHRoaXMudGFibGUuZGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgbGluZS5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IC10aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzcy8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMub3B0aW9ucy5yZWN0VGhpY2tuZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSArIHRoaXMudGFibGUuZGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgICAgIC5hdHRyKCdkeScsIC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZS10aGlzLm9wdGlvbnMudGlja1BhZGRpbmcpO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRoaXMuTEFZT1VUX0hPUklaT05UQUw6XG5cbiAgICAgICAgICAgIHN3aXRjaCh0aGlzLm9wdGlvbnMubGluZVNoYXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgICAgICAgICAgICAgIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MTogLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgyOiB0aGlzLnRhYmxlLmRpbWVuc2lvbnMud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgbGluZS5hdHRyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IC10aGlzLm9wdGlvbnMub3V0ZXJUaWNrU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IC10aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzcy8yLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplICsgdGhpcy50YWJsZS5kaW1lbnNpb25zLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9wdGlvbnMucmVjdFRoaWNrbmVzc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2R4JywgLXRoaXMub3B0aW9ucy5vdXRlclRpY2tTaXplLXRoaXMub3B0aW9ucy50aWNrUGFkZGluZylcbiAgICAgICAgICAgICAgICAuYXR0cignZHknLCA0KTtcblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuXG59O1xuXG4vKipcbiAqIEhhbmRsZSBEM1RhYmxlIHVuYm91bmRcbiAqXG4gKiBAcGFyYW0ge0QzVGFibGV9IHByZXZpb3VzVGFibGVcbiAqL1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUudW5iaW5kVGFibGUgPSBmdW5jdGlvbihwcmV2aW91c1RhYmxlKSB7XG5cbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdmUnLCB0aGlzLl90YWJsZU1vdmVMaXN0ZW5lcik7XG4gICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzpyZXNpemUnLCB0aGlzLl90YWJsZVJlc2l6ZUxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOmRlc3Ryb3knLCB0aGlzLl90YWJsZURlc3Ryb3lMaXN0ZW5lcik7XG5cbiAgICBpZiAodGhpcy5jb250YWluZXIpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICBwcmV2aW91c1RhYmxlLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vdmVBRik7XG4gICAgICAgIHRoaXMuX21vdmVBRiA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlTW92ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuZW1pdCgnbWFya2VyOnVuYm91bmQnLCBwcmV2aW91c1RhYmxlKTtcbn07XG5cbi8qKlxuICogTW92ZSB0aGUgbWFya2VyIHJlcXVlc3RpbmcgYW4gYW5pbWF0aW9uIGZyYW1lXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt0cmFuc2l0aW9uRHVyYXRpb25dXG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGhpcy50YWJsZS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9tb3ZlQUYpO1xuICAgIH1cblxuICAgIHRoaXMuX21vdmVBRiA9IHRoaXMudGFibGUucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMubW92ZVN5bmMuYmluZCh0aGlzKSk7XG5cbn07XG5cbi8qKlxuICogTW92ZSB0aGUgbWFya2VyIHN5bmNocm9ub3VzbHlcbiAqL1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUubW92ZVN5bmMgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICghdGhpcy50YWJsZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBsYXlvdXQgPSB0aGlzLm9wdGlvbnMubGF5b3V0O1xuXG4gICAgdGhpcy5jb250YWluZXJcbiAgICAgICAgLmVhY2goZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBzZWxmLmdldFZhbHVlKGRhdGEpO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzY2FsZSwgcG9zaXRpb24gPSBbMCwgMF0sIHBvc2l0aW9uSW5kZXg7XG5cbiAgICAgICAgICAgIHN3aXRjaChsYXlvdXQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIHNlbGYuTEFZT1VUX1ZFUlRJQ0FMOlxuICAgICAgICAgICAgICAgICAgICBzY2FsZSA9IHNlbGYudGFibGUuc2NhbGVzLng7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHNlbGYuTEFZT1VUX0hPUklaT05UQUw6XG4gICAgICAgICAgICAgICAgICAgIHNjYWxlID0gc2VsZi50YWJsZS5zY2FsZXMueTtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25JbmRleCA9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdID0gc2NhbGUodmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgcmFuZ2UgPSBzY2FsZS5yYW5nZSgpO1xuICAgICAgICAgICAgdmFyIGlzSW5SYW5nZSA9IHBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdID49IHJhbmdlWzBdICYmIHBvc2l0aW9uW3Bvc2l0aW9uSW5kZXhdIDw9IHJhbmdlW3JhbmdlLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSBkMy5zZWxlY3QodGhpcyk7XG5cbiAgICAgICAgICAgIGlmIChpc0luUmFuZ2UpIHtcblxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xuXG4gICAgICAgICAgICAgICAgZ3JvdXAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyhzZWxmLnRhYmxlLm1hcmdpbi5sZWZ0ICsgcG9zaXRpb25bMF0gPj4gMCkrJywnKyhzZWxmLnRhYmxlLm1hcmdpbi50b3AgKyBwb3NpdGlvblsxXSA+PiAwKSsnKScpO1xuXG4gICAgICAgICAgICAgICAgZ3JvdXAuc2VsZWN0KCcuJyArIHNlbGYub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnLWxhYmVsJylcbiAgICAgICAgICAgICAgICAgICAgLnRleHQoc2VsZi5vcHRpb25zLmZvcm1hdHRlci5jYWxsKHNlbGYsIHZhbHVlKSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbn07XG5cbi8qKlxuICogU2hvdyB0aGUgbWFya2VyXG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5jb250YWluZXIpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUoJ2Rpc3BsYXknLCAnJyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBIaWRlIHRoZSBtYXJrZXJcbiAqL1xuRDNUYWJsZU1hcmtlci5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZSgnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmRhdHVtKHtcbiAgICAgICAgICAgIHZhbHVlOiBudWxsXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbi8qKlxuICogSW1wbGVtZW50IHJlc2l6aW5nIHRoZSBtYXJrZXIsIHdoaWNoIHNob3VsZCBiZSBjYWxsZWQgb24gRDNUYWJsZSByZXNpemUgZXZlbnRcbiAqXG4gKiBAcGFyYW0gdHJhbnNpdGlvbkR1cmF0aW9uXG4gKi9cbkQzVGFibGVNYXJrZXIucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKHRyYW5zaXRpb25EdXJhdGlvbikge1xuXG4gICAgdGhpcy5zaXplTGluZUFuZExhYmVsKHRyYW5zaXRpb25EdXJhdGlvbik7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZU1hcmtlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgRDNUYWJsZU1hcmtlciBmcm9tICcuL0QzVGFibGVNYXJrZXInO1xuaW1wb3J0IGluaGVyaXRzIGZyb20gJ2luaGVyaXRzJztcbmltcG9ydCBleHRlbmQgZnJvbSAnZXh0ZW5kJztcblxuLyoqXG4gKiBNb3VzZSBwb3NpdGlvbiB0cmFja2VyIHdoaWNoIHJlc3BvbmRzIHRvIEQzVGFibGUgZXZlbnRzICh3aGljaCBsaXN0ZW5zIGl0c2VsZiB0byBtb3VzZSBldmVudHMpXG4gKlxuICogQHBhcmFtIHtEM1RhYmxlTW91c2VUcmFja2VyT3B0aW9uc30gb3B0aW9uc1xuICogQGV4dGVuZHMge0QzVGFibGVNYXJrZXJ9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRDNUYWJsZU1vdXNlVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZU1hcmtlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5fdGFibGVNb3VzZWVudGVyTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyID0gbnVsbDtcblxuICAgIHRoaXMuX21vdmVBRiA9IG51bGw7XG5cbiAgICB0aGlzLm9uKCdtYXJrZXI6Ym91bmQnLCB0aGlzLmhhbmRsZVRhYmxlQm91bmQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5vbignbWFya2VyOnVuYm91bmQnLCB0aGlzLmhhbmRsZVRhYmxlVW5ib3VuZC5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQG5hbWUgRDNUYWJsZU1vdXNlVHJhY2tlciNvcHRpb25zXG4gICAgICogQHR5cGUge0QzVGFibGVNb3VzZVRyYWNrZXJPcHRpb25zfVxuICAgICAqL1xufVxuXG5pbmhlcml0cyhEM1RhYmxlTW91c2VUcmFja2VyLCBEM1RhYmxlTWFya2VyKTtcblxuLyoqXG4gKiBAdHlwZSB7RDNUYWJsZU1vdXNlVHJhY2tlck9wdGlvbnN9XG4gKi9cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbU1vZGlmaWVyczogWydtb3VzZVRyYWNrZXInXSxcbiAgICBsaXN0ZW5Ub1RvdWNoRXZlbnRzOiB0cnVlXG59KTtcblxuLyoqXG4gKiBJbXBsZW1lbnQgdGhlIGxpc3RlbmVyIGZvciBEM1RhYmxlIGJlaW5nIGJvdW5kXG4gKi9cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZVRhYmxlQm91bmQgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyID0gdGhpcy5oYW5kbGVNb3VzZWVudGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGFibGVNb3VzZW1vdmVMaXN0ZW5lciA9IHRoaXMuaGFuZGxlTW91c2Vtb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdGFibGVNb3VzZWxlYXZlTGlzdGVuZXIgPSB0aGlzLmhhbmRsZU1vdXNlbGVhdmUuYmluZCh0aGlzKTtcblxuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VlbnRlcicsIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyKTtcbiAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdXNlbW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIHRoaXMudGFibGUub24odGhpcy50YWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VsZWF2ZScsIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubGlzdGVuVG9Ub3VjaEV2ZW50cykge1xuICAgICAgICB0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMgPSB0cnVlO1xuICAgICAgICB0aGlzLnRhYmxlLm9uKHRoaXMudGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOnRvdWNobW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2lzTGlzdGVuaW5nVG9Ub3VjaEV2ZW50cyA9IGZhbHNlO1xuICAgIH1cbn07XG5cbi8qKlxuICogSW1wbGVtZW50IHRoZSBsaXN0ZW5lciBmb3IgRDNUYWJsZSBiZWluZyB1bmJvdW5kXG4gKi9cbkQzVGFibGVNb3VzZVRyYWNrZXIucHJvdG90eXBlLmhhbmRsZVRhYmxlVW5ib3VuZCA9IGZ1bmN0aW9uKHByZXZpb3VzVGFibGUpIHtcblxuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VlbnRlcicsIHRoaXMuX3RhYmxlTW91c2VlbnRlckxpc3RlbmVyKTtcbiAgICBwcmV2aW91c1RhYmxlLnJlbW92ZUxpc3RlbmVyKHByZXZpb3VzVGFibGUub3B0aW9ucy5iZW1CbG9ja05hbWUgKyAnOm1vdXNlbW92ZScsIHRoaXMuX3RhYmxlTW91c2Vtb3ZlTGlzdGVuZXIpO1xuICAgIHByZXZpb3VzVGFibGUucmVtb3ZlTGlzdGVuZXIocHJldmlvdXNUYWJsZS5vcHRpb25zLmJlbUJsb2NrTmFtZSArICc6bW91c2VsZWF2ZScsIHRoaXMuX3RhYmxlTW91c2VsZWF2ZUxpc3RlbmVyKTtcblxuICAgIGlmICh0aGlzLl9pc0xpc3RlbmluZ1RvVG91Y2hFdmVudHMpIHtcbiAgICAgICAgcHJldmlvdXNUYWJsZS5yZW1vdmVMaXN0ZW5lcihwcmV2aW91c1RhYmxlLm9wdGlvbnMuYmVtQmxvY2tOYW1lICsgJzp0b3VjaG1vdmUnLCB0aGlzLl90YWJsZU1vdXNlbW92ZUxpc3RlbmVyKTtcbiAgICB9XG5cbn07XG5cbi8qKlxuICogSW1wbGVtZW50IGdldHRpbmcgeCBhbmQgeSBwb3NpdGlvbnMgZnJvbSBEM1RhYmxlIGV2ZW50XG4gKlxuICogQHBhcmFtIHtEM1RhYmxlfSB0YWJsZVxuICogQHBhcmFtIHtkMy5TZWxlY3Rpb259IHNlbGVjdGlvblxuICogQHBhcmFtIHtkMy5FdmVudH0gZDNFdmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0VGltZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0Um93XG4gKlxuICogQHNlZSBEM1RhYmxlI2VtaXREZXRhaWxlZEV2ZW50IGZvciBhcmd1bWVudHMgZGVzY3JpcHRpb25cbiAqIEByZXR1cm5zIHsqfVxuICovXG5EM1RhYmxlTW91c2VUcmFja2VyLnByb3RvdHlwZS5nZXRWYWx1ZUZyb21UYWJsZUV2ZW50ID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG4gICAgc3dpdGNoICh0aGlzLm9wdGlvbnMubGF5b3V0KSB7XG4gICAgICAgIGNhc2UgJ3ZlcnRpY2FsJzpcbiAgICAgICAgICAgIHJldHVybiBnZXRUaW1lKCk7XG4gICAgICAgIGNhc2UgJ2hvcml6b250YWwnOlxuICAgICAgICAgICAgcmV0dXJuIGdldFJvdygpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSW1wbGVtZW50IG1vdXNlIGVudGVyIGhhbmRsaW5nXG4gKiAgLSBzaG93IHRoZSBtYXJrZXIgYW5kIHNldCB0aGUgdmFsdWUgZnJvbSBtb3VzZSBwb3NpdGlvblxuICpcbiAqIEBwYXJhbSB7RDNUYWJsZX0gdGFibGVcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7ZDMuRXZlbnR9IGQzRXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFRpbWVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFJvd1xuICpcbiAqIEBzZWUgRDNUYWJsZSNlbWl0RGV0YWlsZWRFdmVudCBmb3IgYXJndW1lbnRzIGRlc2NyaXB0aW9uXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2VlbnRlciA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHRpbWUgPSB0aGlzLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRhYmxlLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5zaG93KCk7XG4gICAgICAgIHNlbGYuc2V0VmFsdWUodGltZSk7XG4gICAgfSk7XG5cbn07XG5cbi8qKlxuICogSW1wbGVtZW50IG1vdXNlIG1vdmUgaGFuZGxpbmdcbiAqICAtIHNldCB0aGUgdmFsdWUgZnJvbSBtb3VzZSBwb3NpdGlvblxuICpcbiAqIEBwYXJhbSB7RDNUYWJsZX0gdGFibGVcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7ZDMuRXZlbnR9IGQzRXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFRpbWVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFJvd1xuICpcbiAqIEBzZWUgRDNUYWJsZSNlbWl0RGV0YWlsZWRFdmVudCBmb3IgYXJndW1lbnRzIGRlc2NyaXB0aW9uXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2Vtb3ZlID0gZnVuY3Rpb24odGFibGUsIHNlbGVjdGlvbiwgZDNFdmVudCwgZ2V0VGltZSwgZ2V0Um93KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHRpbWUgPSB0aGlzLmdldFZhbHVlRnJvbVRhYmxlRXZlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGlmICh0aGlzLl9tb3ZlQUYpIHtcbiAgICAgICAgdGFibGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fbW92ZUFGKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tb3ZlQUYgPSB0YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuc2V0VmFsdWUodGltZSk7XG4gICAgfSk7XG5cbn07XG5cbi8qKlxuICogSW1wbGVtZW50IG1vdXNlIGxlYXZlIGhhbmRsaW5nXG4gKiAgLSBoaWRlIHRoZSBtYXJrZXIgYW5kIHNldCB0aGUgdmFsdWUgZnJvbSBtb3VzZSBwb3NpdGlvblxuICpcbiAqIEBwYXJhbSB7RDNUYWJsZX0gdGFibGVcbiAqIEBwYXJhbSB7ZDMuU2VsZWN0aW9ufSBzZWxlY3Rpb25cbiAqIEBwYXJhbSB7ZDMuRXZlbnR9IGQzRXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFRpbWVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFJvd1xuICpcbiAqIEBzZWUgRDNUYWJsZSNlbWl0RGV0YWlsZWRFdmVudCBmb3IgYXJndW1lbnRzIGRlc2NyaXB0aW9uXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuRDNUYWJsZU1vdXNlVHJhY2tlci5wcm90b3R5cGUuaGFuZGxlTW91c2VsZWF2ZSA9IGZ1bmN0aW9uKHRhYmxlLCBzZWxlY3Rpb24sIGQzRXZlbnQsIGdldFRpbWUsIGdldFJvdykge1xuXG4gICAgaWYgKHRoaXMuX21vdmVBRikge1xuICAgICAgICB0YWJsZS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9tb3ZlQUYpO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0YWJsZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuaGlkZSgpO1xuICAgIH0pO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGFibGVNb3VzZVRyYWNrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IEQzVGFibGVNYXJrZXIgZnJvbSAnLi9EM1RhYmxlTWFya2VyJztcbmltcG9ydCBpbmhlcml0cyBmcm9tICdpbmhlcml0cyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbi8qKlxuICogQSBEM1RhYmxlVmFsdWVUcmFja2VyIGlzIGEgRDNUYWJsZU1hcmtlciB3aGljaCBiZWhhdmVzIGFsb25lIGFuZCBjYW4gYmUgc3RhcnRlZCBhbmQgc3RvcHBlZCxcbiAqIGdldHRpbmcgaXRzIHZhbHVlIGZyb20gdGhlIGltcGxlbWVudGVkIHZhbHVlR2V0dGVyXG4gKlxuICogQHNlZSBkMy50aW1lciB0byB1bmRlcnN0YW5kIGhvdyBpdCBiZWhhdmVzIGF1dG9tYXRpY2FsbHlcbiAqIEBwYXJhbSB7RDNUYWJsZU1hcmtlck9wdGlvbnN9IG9wdGlvbnNcbiAqIEBleHRlbmRzIHtEM1RhYmxlTWFya2VyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGFibGVWYWx1ZVRyYWNrZXIob3B0aW9ucykge1xuICAgIEQzVGFibGVNYXJrZXIuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xufVxuXG5pbmhlcml0cyhEM1RhYmxlVmFsdWVUcmFja2VyLCBEM1RhYmxlTWFya2VyKTtcblxuLyoqXG4gKiBAdHlwZSB7RDNUYWJsZU1hcmtlck9wdGlvbnN9XG4gKi9cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlTWFya2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbU1vZGlmaWVyczogWyd2YWx1ZVRyYWNrZXInXVxufSk7XG5cbi8qKlxuICogQnkgZGVmYXVsdCwgdGhlIHZhbHVlIGl0IGdldHMgaXMgMFxuICpcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gKi9cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlR2V0dGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgIHJldHVybiAwO1xuXG59O1xuXG4vKipcbiAqIFN0YXJ0IHRoZSB0cmFja2VyXG4gKi9cbkQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG4gICAgZDMudGltZXIoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgc2VsZi5zZXRWYWx1ZShzZWxmLnZhbHVlR2V0dGVyKCkpO1xuXG4gICAgICAgIHJldHVybiAhc2VsZi5lbmFibGVkO1xuXG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFN0b3AgdGhlIHRyYWNrZXJcbiAqL1xuRDNUYWJsZVZhbHVlVHJhY2tlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRDNUYWJsZVZhbHVlVHJhY2tlcjtcbiIsIi8qIGdsb2JhbCBjYW5jZWxBbmltYXRpb25GcmFtZSwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IEQzQmxvY2tUYWJsZSBmcm9tICcuL0QzQmxvY2tUYWJsZSc7XG5pbXBvcnQgZDMgZnJvbSAnZDMnO1xuXG4vKipcbiAqIFRpbWVsaW5lIHZlcnNpb24gb2YgYSBEM0Jsb2NrVGFibGUgd2l0aFxuICogIC0gdGltZSBzY2FsZSBhcyB4IHNjYWxlXG4gKiAgLSBhbmQgc3BlY2lhbCBtZXRob2RzIHByb3h5aW5nIHRvIEQzQmxvY2tUYWJsZSBtZXRob2RzXG4gKlxuICpcbiAqIEBwYXJhbSB7RDNUaW1lbGluZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMge0QzQmxvY2tUYWJsZX1cbiAqL1xuZnVuY3Rpb24gRDNUaW1lbGluZShvcHRpb25zKSB7XG5cbiAgICBEM0Jsb2NrVGFibGUuY2FsbCh0aGlzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA9IHRoaXMub3B0aW9ucy5taW5pbXVtVGltZUludGVydmFsO1xuXG4gICAgLyoqXG4gICAgICogQG5hbWUgRDNUaW1lbGluZSNvcHRpb25zXG4gICAgICogQHR5cGUge0QzVGltZWxpbmVPcHRpb25zfVxuICAgICAqL1xufVxuXG5pbmhlcml0cyhEM1RpbWVsaW5lLCBEM0Jsb2NrVGFibGUpO1xuXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5kZWZhdWx0cyA9IGV4dGVuZCh0cnVlLCB7fSwgRDNCbG9ja1RhYmxlLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbUJsb2NrTmFtZTogJ3RpbWVsaW5lJyxcbiAgICBiZW1CbG9ja01vZGlmaWVyOiAnJyxcbiAgICB4QXhpc1RpY2tzRm9ybWF0dGVyOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkLmdldE1pbnV0ZXMoKSAlIDE1ID8gJycgOiBkMy50aW1lLmZvcm1hdCgnJUg6JU0nKShkKTtcbiAgICB9LFxuICAgIHhBeGlzU3Ryb2tlV2lkdGg6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQuZ2V0TWludXRlcygpICUzMCA/IDEgOiAyO1xuICAgIH0sXG4gICAgbWluaW11bUNvbHVtbldpZHRoOiAzMCxcbiAgICBtaW5pbXVtVGltZUludGVydmFsOiAzZTUsXG4gICAgYXZhaWxhYmxlVGltZUludGVydmFsczogWyA2ZTQsIDNlNSwgOWU1LCAxLjhlNiwgMy42ZTYsIDcuMmU2LCAxLjQ0ZTcsIDIuODhlNywgNC4zMmU3LCA4LjY0ZTcgXVxufSk7XG5cbi8qKlxuICogVGltZSBzY2FsZSBhcyB4IHNjYWxlXG4gKiBAcmV0dXJucyB7ZDMudGltZS5TY2FsZX1cbiAqL1xuRDNUaW1lbGluZS5wcm90b3R5cGUueFNjYWxlRmFjdG9yeSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy50aW1lLnNjYWxlKCk7XG59O1xuXG4vKipcbiAqIFVzZSBkYXRhIHN0YXJ0IHByb3BlcnR5IHdpdGhvdXQgY2FzdGluZ1xuICpcbiAqIEBwYXJhbSB7RDNUYWJsZUVsZW1lbnR9IGRhdGFcbiAqIEByZXR1cm5zIHtzdGFydHxhbnl9XG4gKi9cbkQzVGltZWxpbmUucHJvdG90eXBlLmdldERhdGFTdGFydCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YS5zdGFydDtcbn07XG5cbi8qKlxuICogVXNlIGRhdGEgZW5kIHByb3BlcnR5IHdpdGhvdXQgY2FzdGluZ1xuICpcbiAqIEBwYXJhbSB7RDNUYWJsZUVsZW1lbnR9IGRhdGFcbiAqIEByZXR1cm5zIHtzdGFydHxhbnl9XG4gKi9cbkQzVGltZWxpbmUucHJvdG90eXBlLmdldERhdGFFbmQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEuZW5kO1xufTtcblxuLyoqXG4gKiBPdmVycmlkZSB1cGRhdGUgeCBheGlzIGludGVydmFsIGltcGxlbWVudCB3aXRoIGNvbHVtbiB3aWR0aCB1cGRhdGUgYmFzZWQgb24gaW5zdGFuY2Ugb3B0aW9uczpcbiAqICAtIG1pbmltdW1Db2x1bW5XaWR0aDogdGhlIGNvbHVtbiB3aWR0aCBzaG91bGQgbmV2ZXIgYmUgbG93ZXIgdGhhbiB0aGF0XG4gKiAgLSBtaW5pbXVtVGltZUludGVydmFsOiB0aGUgdGltZSBpbnRlcnZhbCBzaG91bGQgbmV2ZXIgYmUgbG93ZXIgdGhhbiB0aGF0XG4gKiAgLSBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzOiB0aGUgbGlzdCBvZiBhdmFpbGFibGUgdGltZSBpbnRlcnZhbHNcbiAqXG4gKiBAcmV0dXJucyB7RDNUaW1lbGluZX1cbiAqL1xuRDNUaW1lbGluZS5wcm90b3R5cGUudXBkYXRlWEF4aXNJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIG1pbmltdW1UaW1lSW50ZXJ2YWwgPSB0aGlzLm9wdGlvbnMubWluaW11bVRpbWVJbnRlcnZhbDtcbiAgICB2YXIgbWluaW11bUNvbHVtbldpZHRoID0gdGhpcy5vcHRpb25zLm1pbmltdW1Db2x1bW5XaWR0aDtcbiAgICB2YXIgY3VycmVudFRpbWVJbnRlcnZhbCA9IHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbDtcbiAgICB2YXIgYXZhaWxhYmxlVGltZUludGVydmFscyA9IHRoaXMub3B0aW9ucy5hdmFpbGFibGVUaW1lSW50ZXJ2YWxzO1xuICAgIHZhciBjdXJyZW50VGltZUludGVydmFsSW5kZXggPSBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzLmluZGV4T2YoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgdmFyIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHRoaXMuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbCk7XG5cbiAgICAvLyBwcml2YXRlIGZ1bmN0aW9uIHRvIGluY3JlYXNlL2RlY3JlYXNlIHRpbWUgaW50ZXJ2YWwgYnkgaW5kZXggZGVsdGEgaW4gdGhlIGF2YWlsYWJsZSB0aW1lIGludGVydmFscyBhbmQgdXBkYXRlIHRpbWUgaW50ZXJ2YWwgYW5kIGNvbHVtbiB3aWR0aFxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZVRpbWVJbnRlcnZhbChkZWx0YSkge1xuICAgICAgICBjdXJyZW50VGltZUludGVydmFsSW5kZXggKz0gZGVsdGE7XG4gICAgICAgIGN1cnJlbnRUaW1lSW50ZXJ2YWwgPSBhdmFpbGFibGVUaW1lSW50ZXJ2YWxzW2N1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleF07XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgfVxuXG4gICAgaWYgKGF2YWlsYWJsZVRpbWVJbnRlcnZhbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBpZiBsb3dlciwgaW5jcmVhc2VcbiAgICAgICAgaWYgKGN1cnJlbnRDb2x1bW5XaWR0aCA8IG1pbmltdW1Db2x1bW5XaWR0aCkge1xuICAgICAgICAgICAgLy8gc3RvcCB3aGVuIGl0J3MgaGlnaGVyXG4gICAgICAgICAgICB3aGlsZShjdXJyZW50Q29sdW1uV2lkdGggPCBtaW5pbXVtQ29sdW1uV2lkdGggJiYgY3VycmVudFRpbWVJbnRlcnZhbEluZGV4IDwgYXZhaWxhYmxlVGltZUludGVydmFscy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlVGltZUludGVydmFsKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGlmIGdyZWF0ZXIgZGVjcmVhc2VcbiAgICAgICAgZWxzZSBpZiAoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoKSB7XG4gICAgICAgICAgICAvLyBzdG9wIHdoZW4gaXQncyBsb3dlclxuICAgICAgICAgICAgd2hpbGUoY3VycmVudENvbHVtbldpZHRoID4gbWluaW11bUNvbHVtbldpZHRoICYmIGN1cnJlbnRUaW1lSW50ZXJ2YWxJbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGhlbiBpbmNyZWFzZSBvbmNlXG4gICAgICAgICAgICB0cmFuc2xhdGVUaW1lSW50ZXJ2YWwoMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB0aW1lIGludGVydmFsIGlzIGxvd2VyIHRoYW4gdGhlIG1pbmltdW0sIHNldCBpdCB0byB0aGUgbWluaW11bSBhbmQgY29tcHV0ZSBjb2x1bW4gd2lkdGhcbiAgICBpZiAoY3VycmVudFRpbWVJbnRlcnZhbCA8IG1pbmltdW1UaW1lSW50ZXJ2YWwpIHtcbiAgICAgICAgY3VycmVudFRpbWVJbnRlcnZhbCA9IG1pbmltdW1UaW1lSW50ZXJ2YWw7XG4gICAgICAgIGN1cnJlbnRDb2x1bW5XaWR0aCA9IHNlbGYuX2NvbXB1dGVDb2x1bW5XaWR0aEZyb21UaW1lSW50ZXJ2YWwoY3VycmVudFRpbWVJbnRlcnZhbClcbiAgICB9XG5cbiAgICAvLyBrZWVwIGZsb29yIHZhbHVlc1xuICAgIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCA9IE1hdGguZmxvb3IoY3VycmVudFRpbWVJbnRlcnZhbCk7XG4gICAgdGhpcy5jb2x1bW5XaWR0aCA9IE1hdGguZmxvb3IoY3VycmVudENvbHVtbldpZHRoKTtcblxuICAgIC8vIHVwZGF0ZSBheGlzZXMgdGlja3NcbiAgICBpZiAodGhpcy5jdXJyZW50VGltZUludGVydmFsID4gMy42ZTYpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLmhvdXJzLCB0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgLyAzLjZlNiApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiA2ZTQpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLm1pbnV0ZXMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDZlNCApO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmN1cnJlbnRUaW1lSW50ZXJ2YWwgPiAxZTMpIHtcbiAgICAgICAgdGhpcy5heGlzZXMueC50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgICAgICB0aGlzLmF4aXNlcy54Mi50aWNrcyhkMy50aW1lLnNlY29uZHMsIHRoaXMuY3VycmVudFRpbWVJbnRlcnZhbCAvIDFlMyApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQcm94eSB0byB7QGxpbmsgRDNUYWJsZSNzZXRYUmFuZ2V9XG4gKlxuICogQHBhcmFtIHtEYXRlfSBtaW5EYXRlXG4gKiBAcGFyYW0ge0RhdGV9IG1heERhdGVcbiAqIEByZXR1cm5zIHtEM1RpbWVsaW5lfVxuICovXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5zZXRUaW1lUmFuZ2UgPSBmdW5jdGlvbihtaW5EYXRlLCBtYXhEYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFJhbmdlKG1pbkRhdGUsIG1heERhdGUpO1xufTtcblxuLyoqXG4gKiBDb21wdXRlIGNvbHVtbiB3aWR0aCBmcm9tIGEgcHJvdmlkZWQgdGltZSBpbnRlcnZhbFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lSW50ZXJ2YWxcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gKiBAcHJpdmF0ZVxuICovXG5EM1RpbWVsaW5lLnByb3RvdHlwZS5fY29tcHV0ZUNvbHVtbldpZHRoRnJvbVRpbWVJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVJbnRlcnZhbCkge1xuICAgIHJldHVybiB0aGlzLnNjYWxlcy54KG5ldyBEYXRlKHRpbWVJbnRlcnZhbCkpIC0gdGhpcy5zY2FsZXMueChuZXcgRGF0ZSgwKSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEM1RpbWVsaW5lO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBEM1RhYmxlVmFsdWVUcmFja2VyIGZyb20gJy4vRDNUYWJsZVZhbHVlVHJhY2tlcic7XG5pbXBvcnQgaW5oZXJpdHMgZnJvbSAnaW5oZXJpdHMnO1xuaW1wb3J0IGV4dGVuZCBmcm9tICdleHRlbmQnO1xuXG4vKipcbiAqIFRpbWVsaW5lIHRpbWUgdHJhY2tlciB3aGljaCBjYW4gYmUgc3RhcnRlZCBhbmQgc3RvcHBlZCBhcyBpdCBpcyBhIHtAbGluayBEM1RhYmxlVmFsdWVUcmFja2VyfVxuICpcbiAqIEBleHRlbmRzIHtEM1RhYmxlVmFsdWVUcmFja2VyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEQzVGltZWxpbmVUaW1lVHJhY2tlcihvcHRpb25zKSB7XG4gICAgRDNUYWJsZVZhbHVlVHJhY2tlci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgLyoqXG4gICAgICogQG5hbWUgRDNUaW1lbGluZVRpbWVUcmFja2VyI3ZhbHVlXG4gICAgICogQHR5cGUge0RhdGV9XG4gICAgICovXG59XG5cbmluaGVyaXRzKEQzVGltZWxpbmVUaW1lVHJhY2tlciwgRDNUYWJsZVZhbHVlVHJhY2tlcik7XG5cbi8qKlxuICogQHR5cGUge0QzVGFibGVNYXJrZXJPcHRpb25zfVxuICovXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLmRlZmF1bHRzID0gZXh0ZW5kKHRydWUsIHt9LCBEM1RhYmxlVmFsdWVUcmFja2VyLnByb3RvdHlwZS5kZWZhdWx0cywge1xuICAgIGJlbUJsb2NrTmFtZTogJ3RpbWVsaW5lTWFya2VyJyxcbiAgICBiZW1Nb2RpZmllcnM6IFsndGltZVRyYWNrZXInXSxcbiAgICBsYXlvdXQ6ICd2ZXJ0aWNhbCdcbn0pO1xuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCB0aW1lXG4gKiBUbyBiZSBvdmVycmlkZGVuIGlmIHlvdSB3aXNoIHRvIHJlcHJlc2VudCBhIGJpYXNlZCB0aW1lIGZvciBleGFtcGxlXG4gKlxuICogQHJldHVybnMge0RhdGV9XG4gKi9cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudGltZUdldHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpO1xufTtcblxuLyoqXG4gKiBQcm94eSB0byB7QGxpbmsgRDNUYWJsZVZhbHVlVHJhY2tlciN0aW1lR2V0dGVyfVxuICpcbiAqIEByZXR1cm5zIHtEYXRlfVxuICovXG5EM1RpbWVsaW5lVGltZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlR2V0dGVyID0gRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS50aW1lR2V0dGVyO1xuXG4vKipcbiAqIENvbXBhcmUgdGltZXMsIGRlZmF1bHRzIHRvIHtAbGluayBEM1RhYmxlVmFsdWVUcmFja2VyI3ZhbHVlQ29tcGFyYXRvcn1cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb258Kn1cbiAqL1xuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS50aW1lQ29tcGFyYXRvciA9IEQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnZhbHVlQ29tcGFyYXRvcjtcblxuLyoqXG4gKiBQcm94eSB0byB7QGxpbmsgRDNUaW1lbGluZVRpbWVUcmFja2VyLnRpbWVDb21wYXJhdG9yfVxuICpcbiAqIEBwYXJhbSB7RGF0ZX0gYVxuICogQHBhcmFtIHtEYXRlfSBiXG4gKi9cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUudmFsdWVDb21wYXJhdG9yID0gZnVuY3Rpb24oYSxiKSB7XG4gICAgcmV0dXJuIHRoaXMudGltZUNvbXBhcmF0b3IoYSxiKTtcbn07XG5cbi8qKlxuICogUHJveHkgdG8ge0BsaW5rIEQzVGFibGVWYWx1ZVRyYWNrZXIjc2V0VmFsdWV9XG4gKiBUbyBiZSBvdmVycmlkZGVuIGlmIHlvdSB3aGljaCB0byBhbHRlciB0aGUgdmFsdWUgc2V0XG4gKlxuICogQHBhcmFtIHtEYXRlfSB0aW1lXG4gKi9cbkQzVGltZWxpbmVUaW1lVHJhY2tlci5wcm90b3R5cGUuc2V0VGltZSA9IEQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnNldFZhbHVlO1xuXG4vKipcbiAqIFByb3h5IHRvIHtAbGluayBEM1RhYmxlVmFsdWVUcmFja2VyI3NldFRhYmxlfVxuICpcbiAqIEBwYXJhbSB7RDNUaW1lbGluZX0gdGltZWxpbmVcbiAqL1xuRDNUaW1lbGluZVRpbWVUcmFja2VyLnByb3RvdHlwZS5zZXRUaW1lbGluZSA9IEQzVGFibGVWYWx1ZVRyYWNrZXIucHJvdG90eXBlLnNldFRhYmxlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEQzVGltZWxpbmVUaW1lVHJhY2tlcjtcbiJdfQ==
(1)
});
;