# d3-timeline

:warning: Still WIP

## Introduction

The aim is to provide a customizable implementation of a timeline with [d3.js](http://d3js.org/). The result is that youfully keep control of how the elements are rendered.

As of now, you have 2 levels of control:

 - using D3Timeline, you fully control how each element is rendered based on its data
 - using D3BlockTimeline, you have a sized rect based on start and end data properties (and clipping), but you still control its content

The D3EntityTimeline is an example of extending the D3BlockTimeline (itself inheriting D3Timeline) to render a text based on the some information generated with [Faker](https://www.npmjs.com/package/Faker).
 
 
## Dependencies

 - **d3** is not included in the built file. If you include the built file, make sure d3 is included before timeline creation. If you import it with bundler tools like browserify or webpack, d3 is referenced as an import in the core files.
 - **requestAnimationFrame** and **cancelAnimationFrame** and **es5** shims may be included to support older browsers.


## Compatibility

Tested on Chrome (desktop and android), Firefox, Safari (desktop and ipad).


## Demo

Visit this [block timeline demo](http://atondelier.github.io/d3-timeline/) to see d3-timeline at work, with options being controlled with [dat-gui](https://www.npmjs.com/package/dat-gui). 

The responsiveness is based on window width and height.

Data provided to the timeline instance have this basic structure:
```JS
{Array<{id: Number, name: String, elements: Array<{ id: Number, start: Date, end: Date}>}>}
```

:warning: Compatibility is not fully verified. `requestAnimationFrame` and `cancelAnimationFrame` are not polyfilled.

## Features

 - pan X and Y while dragging
 - pan Y while using the mousewheel
 - zoom X while using zoom touch gesture or using the mousewheel with the control key pressed
 - clamped pan behaviors based on scales domains

## Rendering improvements

 - culling for elements outside the viewport even if in the dataset
 - pan can render only on idle, making the culling visible (and that's the reason why culling distance can be configured)
 - instead of y-translated rows with x-translated elements in it, it can draw x/y-translated elements directly


## To be continued...
