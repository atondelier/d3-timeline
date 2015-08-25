/**
 * Simulate a drag on the provided timeline
 *
 * @param {d3Timeline.D3Timeline} timeline
 * @param domElement
 * @param done
 * @returns {EventSimulator}
 */
function simulateTimelineClick(timeline, domElement, done) {

    var clickSimulator = new EventSimulator(domElement, timeline.container.node(), timeline.elements.body.select('.timeline-boundingRect').node());

    clickSimulator.dispatchActionOnElement('click');

    timeline.requestAnimationFrame(function() {
        done();
    });

    return clickSimulator;
}
