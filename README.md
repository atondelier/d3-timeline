# d3-timeline

:warning: Still WIP

## Introduction

The aim is to provide a generic and customizable implementation of a timeline with [d3.js](http://d3js.org/). 

The result is that you fully keep control how the elements are rendered, with a set of performance optimizations, advanced behaviors for an improved user experience, and an understandable representation of data injections and surjections.


## Design

### Timeline constructor

Basically, it renders elements with x position based on its `start` time, `end` time and y position based on the row it belongs to in the provided data set. The whole is surrounded with a time axis (top) and a left axis not limited to any type of data.

Before being a timeline and depending on time, an instance of `D3Timeline` is a `D3BlockTable` and by extension an instance of `D3Table`. This means the `D3BlockTable` constructor can be used in case you don't want to represent data over time.

Some details:

 - using `D3Table` extending `EventEmitter`:
   - you fully control how each element is rendered based on its data
   - since elements have positions, culling is implemented
 - using `D3BlockTable` extending `D3Table`:
   - you have a sized rect based on data properties
   - since elements are blocks, clipping is implemented
   - since elements are blocks, dragging is implemented with automatic scroll on borders
   - a text element can be created for you, vertically aligned
   - when a text is created, keeping text left alignment is implemented for handling the left part of the block being outside of the graph
 - using `D3Timeline` extending `D3BlockTable`:
   - the X dimension becomes the time

The demo uses the latter based on some information generated with [Faker](https://www.npmjs.com/package/Faker).

#### Timeline events

The emitted events are:

 - `"timeline:click"`: timeline is clicked (not an element in it)
 - `"timeline:move"`: timeline is moving (inside move, not its container)
 - `"timeline:resize"`: timeline is being resized
 - `"timeline:element:click"`: an element is clicked
 - `"timeline:element:dragend"`: an element is dropped.

These events are emitted with the following arguments provided to the listener:
 - `data`: (only for `"timeline:element:*"` events): the data bound to the element
 - `timeline`: the timeline instance
 - `selection`: the d3 selection concerned
 - `d3Event`: the d3 event (as it's a reference, you do not lose it in asynchronous code)
 - `getTime`: a getter for the time concerned
 - `getRow`: a getter for the row concerned.

 
### Marker constructors

Markers are totally separate elements. You provide them the timeline instance and it internally knows how to behave when the timeline moves. You can dynamically set them with a new time, so that it moves in the timeline. It represents itself as a vertical line, taking the whole timeline body height, with an overridable formatter for the label at the top of the line.

That being said, you have special types of markers using the `D3TableMarker` (extending `EventEmitter`):
 - using `D3TableMouseTracker` extending `D3TableMarker`:
   - the marker will follow the mouse position and disappear when it's outside
 - using `D3TableValueTracker` extending `D3TableMarker`:
   - the started marker will automatically follow the given value and disappear when it's outside
 - using `D3TimelineTimeTracker` extending `D3TableValueTracker`:
   - the started tracker will automatically follow the current time and disappear when it's outside.


### Data structure

Data provided to the timeline instance have this basic structure:
```JS
Array<{
    id: Number, 
    name: String, 
    elements: Array<{ 
        id: Number, 
        uid: Number, 
        start: Date, 
        end: Date
    }>
}>
```

#### Why an `id` and a `uid`? 

Because you may change the dimension used for elements distribution in timeline rows. This type of change is not always a bijection, thus resulting in some elements having to merge into one (surjection), or one to become multiple separate elements (injection) when setting the same data but with a different distribution. 

For this to be generically interpreted by the timeline, you have to provide an `id` which can exist several times, and a `uid` which can exist only once and that will be used by d3 to match with existing data.

For example:
 - injection: a distribution change may make a single element becoming several; the entering elements (with not matched `uid`) will find the transform transition start on being appended with its `id` since a single element with this `id` was existing in the previous data set distribution.
 - surjection: conversely, a distribution change may make several elements becoming one; the exiting (with not matched `uid`) will find the transform transition end before removal with its `id` since a single element with this `id` is existing in the new data set distribution.


## Dependencies

 - **d3** is not included in the built file. If you include the built file, make sure d3 is included before timeline creation. If you import it with bundler tools like browserify or webpack, d3 is referenced as an import in the core files.
 - **requestAnimationFrame** and **cancelAnimationFrame** and **es5** shims may be included to support older browsers.


## Compatibility

Tested on Chrome (desktop and android), Firefox, Safari (desktop and ipad).


## Demo

Visit this [block timeline demo](http://atondelier.github.io/d3-timeline/) to see d3-timeline at work, with options being controlled with [dat-gui](https://www.npmjs.com/package/dat-gui). 

The responsiveness is based on window width and height.


## Build

To experiment improvements in the demo, run `grunt` then make your edits and refresh (I didn't want livereload).

To build the dist file before committing, run `grunt build`.


## Features

 - pan X and Y while dragging
 - pan Y while using the mousewheel
 - zoom X while using zoom touch gesture or using the mousewheel with the control key pressed
 - update X axises ticks interval while zooming X based on optional configuration
 - clamped pan behaviors based on scales domains
 - element drag and drop
 - automatic scroll on element drag


## Rendering improvements

 - culling for elements outside the viewport even if in the dataset
 - pan can render only on idle, making the culling visible (and that's the reason why culling distance can be configured)
 - element drag can cause render only on idle too


## To be continued...
