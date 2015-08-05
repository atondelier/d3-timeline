!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.d3Timeline=e():"undefined"!=typeof global?global.d3Timeline=e():"undefined"!=typeof self&&(self.d3Timeline=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports.D3Timeline = require('./src/D3Timeline.js');
module.exports.D3BlockTimeline = require('./src/D3BlockTimeline.js');
module.exports.D3EntityTimeline = require('./src/D3EntityTimeline.js');

},{"./src/D3BlockTimeline.js":5,"./src/D3EntityTimeline.js":6,"./src/D3Timeline.js":7}],2:[function(require,module,exports){
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

var _D3Timeline = require('./D3Timeline');

var _D3Timeline2 = _interopRequireDefault(_D3Timeline);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _extend = require('extend');

/**
 *
 * @extends {D3Timeline}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3BlockTimeline(options) {
    _D3Timeline2['default'].call(this, options);
}

(0, _inherits2['default'])(D3BlockTimeline, _D3Timeline2['default']);

D3BlockTimeline.prototype.defaults = (0, _extend2['default'])(true, {}, _D3Timeline2['default'].prototype.defaults, {
    clipElement: true,
    clipElementFilter: null
});

D3BlockTimeline.prototype.generateClipPathId = function (d) {
    return 'timeline-elementClipPath_' + this.instanceNumber + '_' + d.id;
};

D3BlockTimeline.prototype.generateClipRectLink = function (d) {
    return '#' + this.generateClipRectId(d);
};

D3BlockTimeline.prototype.generateClipPathLink = function (d) {
    return 'url(#' + this.generateClipPathId(d) + ')';
};

D3BlockTimeline.prototype.generateClipRectId = function (d) {
    return 'timeline-elementClipRect_' + this.instanceNumber + '_' + d.id;
};

D3BlockTimeline.prototype.elementEnter = function (selection) {

    var elementHeight = this.options.rowHeight - this.options.rowPadding * 2;

    var rect = selection.append('rect').attr('class', 'timeline-elementBackground').attr('height', elementHeight);

    var g = selection.append('g').attr('class', 'timeline-elementContent');

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
};

D3BlockTimeline.prototype.elementUpdate = function (selection) {

    var self = this;

    selection.select('rect.timeline-elementBackground').attr({
        y: this.options.rowPadding,
        width: function width(d) {
            return self.scales.x(d.end) - self.scales.x(d.start);
        }
    });
};

exports['default'] = D3BlockTimeline;
module.exports = exports['default'];

},{"./D3Timeline":7,"extend":3,"inherits":4}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _D3BlockTimeline = require('./D3BlockTimeline');

var _D3BlockTimeline2 = _interopRequireDefault(_D3BlockTimeline);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _extend = require('extend');

/**
 *
 * @extends {D3BlockTimeline}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3EntityTimeline(options) {
    _D3BlockTimeline2['default'].call(this, options);
}

(0, _inherits2['default'])(D3EntityTimeline, _D3BlockTimeline2['default']);

_D3BlockTimeline2['default'].prototype.defaults = (0, _extend2['default'])(true, {}, _D3BlockTimeline2['default'].prototype.defaults, {
    alignLeft: true,
    alignOnTranslate: true
});

D3EntityTimeline.prototype.elementEnter = function (selection) {

    this.constructor.super_.prototype.elementEnter.call(this, selection);

    selection.select('.timeline-elementContent').append('text').classed('timeline-bookingLabel', true).attr('dy', this.options.rowHeight / 2 + 4);

    selection.call(this.elementContentEnter.bind(this));
};

D3EntityTimeline.prototype.elementUpdate = function (selection) {
    var _this = this;

    this.constructor.super_.prototype.elementUpdate.call(this, selection);

    if (this.options.alignLeft) {

        selection.select('.timeline-elementContent > text').attr('dx', function (d) {
            return Math.max(-_this.scales.x(d.start), 2);
        });
    }

    selection.call(this.elementContentUpdate.bind(this));
};

D3EntityTimeline.prototype.elementsTranslate = function (selection) {
    var _this2 = this;

    if (this.options.alignLeft && this.options.alignOnTranslate) {
        selection.select('.timeline-elementContent > text').attr('dx', function (d) {
            return Math.max(-_this2.scales.x(d.start), 2);
        });
    }
};

D3EntityTimeline.prototype.elementContentEnter = function () {};

D3EntityTimeline.prototype.elementContentUpdate = function () {};

exports['default'] = D3EntityTimeline;
module.exports = exports['default'];

},{"./D3BlockTimeline":5,"extend":3,"inherits":4}],7:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/* global cancelAnimationFrame, requestAnimationFrame */

"use strict";

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);

var _d32 = _interopRequireDefault(_d3);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _eventsEvents = require('events/events');

/**
 * @typedef {{xAxisHeight: number, yAxisWidth: number, rowHeight: number, rowPadding: number, axisConfigs: *[], container: string}} D3TimelineOptions
 */

/**
 *
 * @param {D3TimelineOptions} options
 * @constructor
 */

var _eventsEvents2 = _interopRequireDefault(_eventsEvents);

function D3Timeline(options) {

    _eventsEvents2['default'].call(this);

    D3Timeline.instancesCount += 1;

    this.instanceNumber = D3Timeline.instancesCount;

    var self = this;

    this.options = (0, _extend2['default'])(true, {}, this.defaults, options);

    /** @type {Array<{id: Number, name: String, elements: Array<{ id: Number, start: Date, end: Date}>}>} */
    this.data = [];

    this.margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    /** @type {Number} */
    this.yScale = 0.0;

    this.dimensions = { width: 0, height: 0 };

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
        x: _d32['default'].time.scale(),
        y: _d32['default'].scale.linear()
    };

    this.axises = {

        x: _d32['default'].svg.axis().scale(this.scales.x).orient('top').tickFormat(this.options.xAxisTicksFormatter).outerTickSize(0).tickPadding(20),

        x2: _d32['default'].svg.axis().scale(this.scales.x).orient('top').tickFormat(this.options.xAxis2TicksFormatter).outerTickSize(0).innerTickSize(0),

        y: _d32['default'].svg.axis().scale(this.scales.y).orient('left').tickFormat(function (d) {
            if (self._isRound(d)) {
                return self._entryNameGetter(self.data[d | 0]);
            } else {
                return '';
            }
        }).outerTickSize(0)
    };

    this.behaviors = {
        zoom: _d32['default'].behavior.zoom().scaleExtent([1, 10]).on('zoom', this.handleZooming.bind(this)).on('zoomend', this.handleZoomingEnd.bind(this)),
        zoomX: _d32['default'].behavior.zoom().x(this.scales.x).scale(1).scaleExtent([1, 10]),
        zoomY: _d32['default'].behavior.zoom().y(this.scales.y).scale(1).scaleExtent([1, 1]),
        pan: _d32['default'].behavior.drag().on('drag', this.handleDragging.bind(this))
    };

    this._lastTranslate = this.behaviors.zoom.translate();
    this._lastScale = this.behaviors.zoom.scale();

    this._currentScaleConfig = null;
    this._dataChangeCount = 0;
    this._dimensionsChangeCount = 0;
    this._lastAvailableWidth = 0;
    this._lastAvailableHeight = 0;
    this._preventDrawing = false;
    this._nextAnimationFrameHandlers = [];
    this._currentElementsGroupTranslate = [0.0, 0.0];
}

(0, _inherits2['default'])(D3Timeline, _eventsEvents2['default']);

/**
 * Default options
 *
 * @type {D3TimelineOptions}
 */
D3Timeline.prototype.defaults = {
    xAxisHeight: 50,
    yAxisWidth: 50,
    rowHeight: 30,
    rowPadding: 5,
    axisConfigs: [{
        threshold: 2,
        minutes: 30
    }, {
        threshold: 4,
        minutes: 15
    }, {
        threshold: 10,
        minutes: 5
    }],
    container: 'body',
    cullingX: true,
    cullingY: true,
    cullingDistance: 1,
    renderOnIdle: true,
    flattenRowElements: false, // @todo: make it dynamic
    hideTicksOnZoom: false,
    hideTicksOnDrag: false,
    panYOnWheel: true,
    wheelMultiplier: 1,
    xAxisTicksFormatter: function xAxisTicksFormatter(d) {
        return d.getMinutes() % 15 ? '' : _d32['default'].time.format('%H:%M')(d);
    },
    xAxis2TicksFormatter: function xAxis2TicksFormatter(d) {
        return '';
    },
    padding: 10
};

D3Timeline.instancesCount = 0;

D3Timeline.prototype.noop = function () {};

D3Timeline.prototype.initialize = function () {

    // container
    this.container = _d32['default'].select(this.options.container).append('svg').attr('class', 'timeline');

    // defs
    this.elements.defs = this.container.append('defs');

    // clip rect in defs
    var clipId = 'timelineBodyClipPath_' + D3Timeline.instancesCount;
    this.elements.clip = this.elements.defs.append('clipPath').property('id', clipId);
    this.elements.clip.append('rect');

    // surrounding rect
    this.container.append('rect').classed('timeline-backgroundRect', true);

    // axises containers
    this.elements.xAxisContainer = this.container.append('g').attr('class', 'timeline-axis timeline-axis--x');

    this.elements.x2AxisContainer = this.container.append('g').attr('class', 'timeline-axis timeline-axis--x timeline-axis--secondary');

    this.elements.yAxisContainer = this.container.append('g').attr('class', 'timeline-axis timeline-axis--y');

    // body container inner container and surrounding rect
    this.elements.body = this.container.append('g').attr('clip-path', 'url(#' + clipId + ')');

    // surrounding rect
    this.elements.body.append('rect').classed('timeline-contactRect', true);

    // inner container
    this.elements.innerContainer = this.elements.body.append('g');

    // surrounding rect
    this.elements.body.append('rect').classed('timeline-boundingRect', true);

    this.updateMargins();

    this.elements.body.call(this.behaviors.pan);
    this.elements.body.call(this.behaviors.zoom);

    return this;
};

D3Timeline.prototype.updateMargins = function (updateDimensions) {

    this.margin = {
        top: this.options.xAxisHeight + this.options.padding,
        right: this.options.padding,
        bottom: this.options.padding,
        left: this.options.yAxisWidth + this.options.padding
    };

    this.dimensions.width = this._lastAvailableWidth - this.margin.left - this.margin.right;
    this._maxBodyHeight = this._lastAvailableHeight - this.margin.top - this.margin.bottom;

    var contentPosition = { x: this.margin.left, y: this.margin.top };
    var contentTransform = 'translate(' + this.margin.left + ',' + this.margin.top + ')';

    this.container.select('rect.timeline-backgroundRect').attr(contentPosition);

    this.elements.body.attr('transform', contentTransform);

    this.elements.xAxisContainer.attr('transform', contentTransform);

    this.elements.x2AxisContainer.attr('transform', contentTransform);

    this.elements.yAxisContainer.attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    if (updateDimensions) {
        this.updateX();
        this.updateY();
    }
};

D3Timeline.prototype.destroy = function () {

    // remove behavior listeners
    this.behaviors.zoom.on('zoom', null);

    // remove dom listeners
    this.elements.body.on('.zoom', null);

    // remove references
    this.container = null;
    this.elements = null;
    this.scales = null;
    this.axises = null;
    this.behaviors = null;
    this.data = null;
    this.flattenedData = null;
};

D3Timeline.prototype.restoreZoom = function () {
    this.behaviors.zoom.translate(this._lastTranslate);
    this.behaviors.zoom.scale(this._lastScale);
};

/**
 * pan X/Y & zoom X handler (clamped pan Y when wheel is pressed without ctrl, zoom X and pan X/Y otherwise)
 */
D3Timeline.prototype.handleZooming = function () {

    if (!_d32['default'].event.sourceEvent.ctrlKey && !(_d32['default'].event.sourceEvent.changedTouches && _d32['default'].event.sourceEvent.changedTouches.length >= 2)) {
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
};

D3Timeline.prototype.handleZoomingEnd = function () {

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
D3Timeline.prototype.handleWheeling = function () {

    var event = _d32['default'].event.sourceEvent;
    var t = this.behaviors.zoom.translate();

    var dx = 0,
        dy = 0;

    var movingX = event.wheelDeltaX || event.deltaX;

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

    var updatedT = [t[0] + dx, t[1] + dy];

    updatedT = this._clampTranslationWithScale(updatedT, [this.behaviors.zoom.scale(), this.behaviors.zoomY.scale()]);

    this.behaviors.zoom.translate(updatedT);
    this.behaviors.zoomY.translate(updatedT);

    this.moveElements(false, true);

    this._lastTranslate = updatedT;
};

D3Timeline.prototype.handleDragging = function () {

    if (_d32['default'].event.sourceEvent.changedTouches && _d32['default'].event.sourceEvent.touches.length >= 2) {
        return;
    }

    var t = this.behaviors.zoom.translate();
    var updatedT = [t[0] + _d32['default'].event.dx, t[1] + _d32['default'].event.dy];

    updatedT = this._clampTranslationWithScale(updatedT, [this.behaviors.zoom.scale(), this.behaviors.zoomY.scale()]);

    this.behaviors.zoom.translate(updatedT);
    this.behaviors.zoomX.translate(updatedT);
    this.behaviors.zoomX.scale(this.behaviors.zoom.scale());
    this.behaviors.zoomY.translate(updatedT);

    this.moveElements(false, false, !this.options.hideTicksOnDrag);

    this._lastTranslate = updatedT;
};

D3Timeline.prototype.toggleDrawing = function (active) {

    this._preventDrawing = typeof active === 'boolean' ? !active : !this._preventDrawing;

    return this;
};

/**
 *
 * @param {Array<{id: Number, name: String, elements: Array<{ id: Number, start: Date, end: Date}>}>} data
 * @param {Number} [transitionDuration]
 * @returns {D3Timeline}
 */
D3Timeline.prototype.setData = function (data, transitionDuration) {

    this._dataChangeCount += 1;

    var isSizeChanging = data.length !== this.data.length;

    this.data = data;

    if (isSizeChanging || this._dataChangeCount === 1) {
        this.updateXAxisInterval().updateY().drawXAxis().drawYAxis();
    }

    if (this.options.flattenRowElements) {
        this.flattenedData = this.data.map(function (d, i) {
            d.elements.forEach(function (e) {
                e.rowIndex = i;
            });
            return d.elements;
        }).reduce(function (result, elements) {
            return result.concat(elements);
        }, []);
    } else {
        this.flattenedData = [];
    }

    this.drawElements(transitionDuration);

    return this;
};

/**
 *
 * @param {Date} minDate
 * @param {Date} maxDate
 * @returns {D3Timeline}
 */
D3Timeline.prototype.setTimeRange = function (minDate, maxDate) {

    this.minDate = minDate;
    this.maxDate = maxDate;

    this.updateX().drawXAxis().drawYAxis().drawElements();

    return this;
};

D3Timeline.prototype.setAvailableWidth = function (availableWidth) {

    this._dimensionsChangeCount += 1;

    var isAvailableWidthChanging = availableWidth !== this._lastAvailableWidth;
    this._lastAvailableWidth = availableWidth;

    this.dimensions.width = this._lastAvailableWidth - this.margin.left - this.margin.right;

    if (isAvailableWidthChanging || this._dimensionsChangeCount === 1) {
        this.updateX().drawXAxis().drawYAxis().drawElements();
    }

    return this;
};

D3Timeline.prototype.setAvailableHeight = function (availableHeight) {

    this._dimensionsChangeCount += 1;

    var isAvailableHeightChanging = availableHeight !== this._lastAvailableHeight;
    this._lastAvailableHeight = availableHeight;

    this._maxBodyHeight = this._lastAvailableHeight - this.margin.top - this.margin.bottom;

    if (isAvailableHeightChanging || this._dimensionsChangeCount === 1) {
        this.updateY().drawXAxis().drawYAxis().drawElements();
    }

    return this;
};

D3Timeline.prototype.updateX = function () {

    this.container.attr('width', this.dimensions.width + this.margin.left + this.margin.right);

    this.scales.x.domain([this.minDate, this.maxDate]).range([0, this.dimensions.width]);

    this.axises.y.innerTickSize(-this.dimensions.width);

    this.behaviors.zoomX.x(this.scales.x);

    this.elements.body.select('rect.timeline-boundingRect').attr('width', this.dimensions.width);
    this.elements.body.select('rect.timeline-contactRect').attr('width', this.dimensions.width);
    this.container.select('rect.timeline-backgroundRect').attr('width', this.dimensions.width);
    this.elements.clip.select('rect').attr('width', this.dimensions.width);

    return this;
};

D3Timeline.prototype.requestAnimationFrame = function (f) {

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

D3Timeline.prototype.cancelAnimationFrame = function (f) {

    var index = this._nextAnimationFrameHandlers.length > 0 ? this._nextAnimationFrameHandlers.indexOf(f) : -1;

    if (index !== -1) {
        this._nextAnimationFrameHandlers.splice(index, 1);
    }
};

D3Timeline.prototype.drawXAxis = function (transitionDuration, skipTicks) {

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
            'stroke-width': function strokeWidth(d) {
                return d.getMinutes() % 30 ? 1 : 2;
            }
        });

        self._wrapWithAnimation(self.elements.x2AxisContainer, transitionDuration).call(self.axises.x2).selectAll('text').attr({
            x: (self.scales.x(new Date(0, 0, 0, 0, Math.max(15, self._currentScaleConfig.minutes, 0))) - self.scales.x(new Date(0, 0, 0, 0, 0, 0))) / 2
        }).style({
            display: function display(d) {
                return +d === +self.maxDate ? 'none' : '';
            }
        });
    });

    return this;
};

D3Timeline.prototype.drawYAxis = function drawYAxis(transitionDuration, skipTicks) {

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

D3Timeline.prototype.drawElements = function (transitionDuration) {

    if (this._preventDrawing) {
        return this;
    }

    if (this.options.flattenRowElements) {
        return this.drawFlattenedElements(transitionDuration);
    } else {
        return this.drawGroupedElements(transitionDuration);
    }
};

D3Timeline.prototype.drawGroupedElements = function (transitionDuration) {

    var self = this;

    if (this._elementsAF) {
        this.cancelAnimationFrame(this._elementsAF);
    }

    this._elementsAF = this.requestAnimationFrame(function () {

        var domainX = self.scales.x.domain();
        var domainXStart = domainX[0];
        var domainXEnd = domainX[domainX.length - 1];

        var domainY = self.scales.y.domain();
        var domainYStart = domainY[0];
        var domainYEnd = domainY[domainY.length - 1];

        var cullingDistance = self.options.cullingDistance;

        var data = self.options.cullingY ? self.data.filter(function (row, i) {
            return i >= domainYStart - cullingDistance && i < domainYEnd + cullingDistance - 1;
        }) : self.data;

        var elementsDataGetter = self.options.cullingX ? function (d) {
            return d.elements.filter(function (element) {
                return !(element.end < domainXStart || element.start > domainXEnd);
            });
        } : function (d) {
            return d.elements;
        };

        var g = self.elements.innerContainer.selectAll('g.timeline-row').data(data, self._getter('id'));

        g.exit().remove();

        g.enter().append('g').classed('timeline-row', true).attr('transform', self.moveRow.bind(self));

        g.each(function (d, i) {

            var g = _d32['default'].select(this);

            g.attr('transform', self.moveRow.bind(self));

            var sg = g.selectAll('g.timeline-element').data(elementsDataGetter, self._getter('id'));

            sg.exit().remove();

            var enteringSG = sg.enter().append('g').classed('timeline-element', true);

            enteringSG.call(self.elementEnter.bind(self)).attr('transform', self.moveElement.bind(self));

            var updatingSG = self._wrapWithAnimation(sg, transitionDuration).attr('transform', self.moveElement.bind(self));

            updatingSG.call(self.elementUpdate.bind(self));
        });

        self._currentElementsGroupTranslate = [0.0, 0.0];
    });

    return this;
};

D3Timeline.prototype.drawFlattenedElements = function (transitionDuration) {

    var self = this;

    if (this._elementsAF) {
        this.cancelAnimationFrame(this._elementsAF);
    }

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

        var data = self.flattenedData.filter(function (d) {
            return (!cullingY || d.rowIndex >= domainYStart - cullingDistance && d.rowIndex < domainYEnd + cullingDistance - 1) && (!cullingX || !(d.end < domainXStart || d.start > domainXEnd));
        });

        var g = self.elements.innerContainer.selectAll('g.timeline-element').data(data, self._getter('id'));

        g.exit().remove();

        g.enter().append('g').attr('class', 'timeline-element');

        g.each(function (d) {

            var g = _d32['default'].select(this);

            var hasPreviousTransform = g.attr('transform') !== null;

            var updatingSG;

            if (!hasPreviousTransform) {
                g.call(self.elementEnter.bind(self));
            }

            var newTransform = 'translate(' + self.scales.x(d.start) + ',' + self.scales.y(d.rowIndex) + ')';

            if (transitionDuration > 0 && hasPreviousTransform) {
                updatingSG = self._wrapWithAnimation(g, transitionDuration).attrTween("transform", function (interpolate) {
                    var startTransform = _d32['default'].transform(g.attr('transform'));
                    startTransform.translate[1] = self.scales.y(d.rowIndex);
                    return _d32['default'].interpolateTransform(startTransform.toString(), newTransform);
                });
            } else {
                updatingSG = g.attr('transform', newTransform);
            }

            updatingSG.call(self.elementUpdate.bind(self));
        });

        self._currentElementsGroupTranslate = [0.0, 0.0];
    });

    return this;
};

D3Timeline.prototype.moveElements = function (forceDraw, skipXAxis, forceTicks) {

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

D3Timeline.prototype.translateElements = function (translate, previousTranslate) {

    var self = this;

    var tx = translate[0] - previousTranslate[0];
    var ty = translate[1] - previousTranslate[1];

    this._currentElementsGroupTranslate[0] = this._currentElementsGroupTranslate[0] + tx;
    this._currentElementsGroupTranslate[1] = this._currentElementsGroupTranslate[1] + ty;

    if (this._eltsTranslateAF) {
        this.cancelAnimationFrame(this._eltsTranslateAF);
    }

    this._eltsTranslateAF = this.requestAnimationFrame(function () {

        self.elements.innerContainer.attr({
            transform: 'translate(' + self._currentElementsGroupTranslate + ')'
        });

        if (self.elementsTranslate !== self.noop) {
            self.elements.innerContainer.selectAll('.timeline-element').call(self.elementsTranslate.bind(self));
        }
    });
};

D3Timeline.prototype.moveRow = function (d) {
    return 'translate(0, ' + this.scales.y(this.data.indexOf(d)) + ')';
};

D3Timeline.prototype.moveElement = function (d) {
    return 'translate(' + this.scales.x(d.start) + ',0)';
};

D3Timeline.prototype.updateXAxisInterval = function () {

    var scale = this.behaviors.zoom.scale();

    var conf = this._currentScaleConfig = this._find(this.options.axisConfigs, function (params) {
        var threshold = params.threshold;
        return scale <= threshold;
    });

    this.axises.x.ticks(_d32['default'].time.minutes, conf.minutes);

    this.columnWidth = this.scales.x(new Date(0, 0, 0, 0, Math.max(15, this._currentScaleConfig.minutes, 0))) - this.scales.x(new Date(0, 0, 0, 0, 0, 0));

    return this;
};

D3Timeline.prototype.updateY = function () {

    var elementAmount = this.data.length;

    // have 1 more elemnt to force representing one more tick
    var elementsRange = [0, elementAmount];

    // compute new height
    this.dimensions.height = Math.min(this.data.length * 30, this._maxBodyHeight);

    // compute new Y scale
    this.yScale = this.options.rowHeight / this.dimensions.height * elementAmount;

    // update Y scale, axis and zoom behavior
    this.scales.y.domain(elementsRange).range([0, this.dimensions.height]);

    this.behaviors.zoomY.y(this.scales.y).translate(this._lastTranslate).scale(this.yScale);

    // and update X axis ticks height
    this.axises.x.innerTickSize(-this.dimensions.height);

    // update svg height
    this.container.attr('height', this.dimensions.height + this.margin.top + this.margin.bottom);

    // update inner rect height
    this.elements.body.select('rect.timeline-boundingRect').attr('height', this.dimensions.height);
    this.elements.body.select('rect.timeline-contactRect').attr('height', this.dimensions.height);
    this.container.select('rect.timeline-backgroundRect').attr('height', this.dimensions.height);
    this.elements.clip.select('rect').attr('height', this.dimensions.height);

    this.stopElementTransition();

    return this;
};

D3Timeline.prototype.stopElementTransition = function () {
    this.elements.innerContainer.selectAll('g.timeline-element').transition();
};

D3Timeline.prototype.elementEnter = function (selection) {
    return selection;
};

D3Timeline.prototype.elementUpdate = function (selection) {
    return selection;
};

D3Timeline.prototype._wrapWithAnimation = function (selection, transitionDuration) {
    if (transitionDuration > 0) {
        return selection.transition().duration(transitionDuration).ease('quad-out');
    } else {
        return selection;
    }
};

D3Timeline.prototype._getter = function (prop) {
    return function (d) {
        return d[prop];
    };
};

D3Timeline.prototype._entryNameGetter = function (entry) {
    return entry && entry.name || '';
};

D3Timeline.prototype._isRound = function (v) {
    var n = v | 0;
    return v > n - 1e-3 && v < n + 1e-3;
};

D3Timeline.prototype._range = function (start, end, inc) {
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
D3Timeline.prototype._find = function (list, predicate) {
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

D3Timeline.prototype._clampTranslationWithScale = function (translate, scale) {

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

exports['default'] = D3Timeline;
module.exports = exports['default'];

},{"events/events":2,"extend":3,"inherits":4}]},{},[1])
(1)
});
;