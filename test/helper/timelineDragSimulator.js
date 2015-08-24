/**
 * Simulate a drag on the provided timeline
 *
 * @param {d3Timeline.D3Timeline} timeline
 * @param domElement
 * @param row
 * @param column
 * @param done
 * @returns {DragSimulator}
 */
function simulateTimelineDrag(timeline, domElement, row, column, done, transitionDuration) {

    var dragSimulation = new DragSimulator(domElement, timeline.elements.body.node());

    if (transitionDuration) {
        dragSimulation.transitionDuration = transitionDuration;
    }

    var x = timeline.scales.x(column);
    var y = timeline.scales.y(row);

    dragSimulation.dragTo(x, y, done);

    return dragSimulation;
}
