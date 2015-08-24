describe('e2e', function () {

    /**
     * @type {d3Timeline.D3Timeline}
     */
    var timeline;

    var $body = $('body');
    $body.append('<div id="container" class="debug-outlineGroups"></div>');

    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var date = now.getDate();
    var hours = now.getHours();
    var minDate = new Date(year,month,date,hours-2);
    var maxDate = new Date(year,month,date,hours+4);
    var rows = 50;
    var columns = 4;

    var data = generateRandomData(rows, columns, minDate, maxDate);

    $body.append('<link rel="stylesheet" href="/base/examples/booking/demo.css"/>');
    $body.append('<link rel="stylesheet" href="/base/examples/booking/debug.css"/>');

    before(function (done) {

        if (timeline) {
            timeline.destroy();
        }

        timeline = new d3Timeline.D3Timeline({
            container: '#container',
            cullingX: false,
            cullingY: false
        });

        timeline.elementContentUpdate = function(selection) {
            selection
                .select('.timeline-entityLabel')
                .text(d => d.entity.name);
        };

        timeline
            .toggleDrawing(false)
            .initialize()
            .setTimeRange(minDate, maxDate)
            .setAvailableDimensions(innerWidth,innerHeight)
            .toggleDrawing(true)
            .setData(data)
            .requestAnimationFrame(done);

    });

    var testedElements = rows * columns;

    describe('timeline', function () {

        it('should contain the elements', function () {
            $('.timeline-element').should.have.length(testedElements);
        });

    });

    describe(`timeline-element (${testedElements} elements tested)`, function () {

        d3.range(0,testedElements).forEach(function(elementIndex) {

            describe(`element ${elementIndex}`, function () {

                var domTimelineElement;
                var data;
                var elementBBox;
                var elementScreenCTM;
                var innerContainerScreenCTM;
                var elementPosition;

                before(function() {
                    innerContainerScreenCTM = timeline.elements.innerContainer.node().getScreenCTM();
                    domTimelineElement = $('.timeline-element').get(elementIndex);
                    data = domTimelineElement.__data__;
                    elementBBox = domTimelineElement.firstChild.getBBox();
                    elementScreenCTM = domTimelineElement.getScreenCTM();
                    elementPosition = {
                        x: elementScreenCTM.e - innerContainerScreenCTM.e + window.scrollX,
                        y: elementScreenCTM.f - innerContainerScreenCTM.f + window.scrollY
                    };
                });

                it('should have the right label', function () {
                    domTimelineElement.textContent.trim().should.equal(data.entity.name);
                });

                it('should have the right width (±.1)', function() {
                    var expectedWidth = timeline.scales.x(data.end) - timeline.scales.x(data.start);
                    var elementWidth = elementBBox.width;
                    elementWidth.should.almost.equal(expectedWidth, 1);
                });

                it('should have the right height (±.1)', function () {
                    var expectedHeight = timeline.options.rowHeight - 2 * timeline.options.rowPadding;
                    var elementHeight = elementBBox.height;
                    elementHeight.should.almost.equal(expectedHeight, 1);
                });

                it('should be at the right x position (±.1)', function () {
                    var expectedX = timeline.scales.x(data.start);
                    elementPosition.x.should.almost.equal(expectedX, 1);
                });

                it('should be at the right y position (±.1)', function () {
                    var expectedY = timeline.scales.y(timeline.data.indexOf(timeline.getElementRow(data)));
                    elementPosition.y.should.almost.equal(expectedY, 1);
                });

            });
        })

    });

    describe('timeline-element drag', function () {

        var startSpy;
        var moveSpy;
        var stopSpy;
        var dragStartTimelineTime;
        var dragEndTimelineTime;
        var dragEndTimelineRow;
        var domElement;
        var targetDate;
        var targetRow;

        before(function (done) {

            targetDate = new Date(+minDate + 3 * 60 * 60 * 1000);
            targetRow = 10;

            startSpy = sinon.spy(function(element, timeline, d3Selection, d3Event, getTime, getRow) {
                dragStartTimelineTime = getTime();
            });
            moveSpy = sinon.spy();
            stopSpy = sinon.spy(function(element, timeline, d3Selection, d3Event, getTime, getRow) {
                dragEndTimelineTime = getTime();
                dragEndTimelineRow = getRow();
            });

            timeline.on('timeline:element:dragstart', startSpy);
            timeline.on('timeline:element:drag', moveSpy);
            timeline.on('timeline:element:dragend', stopSpy);

            domElement = $('.timeline-element')[0];

            simulateTimelineDrag(timeline, domElement, targetRow, targetDate, function() {

                done();

            }, 1000);

        });

        after(function() {
            timeline.removeListener('timelien:element:dragstart', startSpy);
            timeline.removeListener('timelien:element:drag', moveSpy);
            timeline.removeListener('timelien:element:dragend', stopSpy);
        });

        it('should emit timeline events (dragstart, drag, dragend)', function () {
            startSpy.should.have.been.calledOnce;
            moveSpy.should.have.been.called;
            stopSpy.should.have.been.calledOnce;
        });

        it('should wait for a distance before starting drag', function () {
            dragStartTimelineTime.getTime().should.not.almost.equal(+domElement.__data__.start, -5);
        });

        it('should call the dragend listener with the right time', function () {
            dragEndTimelineTime.getTime().should.almost.equal(+targetDate, -5);
        });

        it('should call the dragend listener with the right time', function () {
            dragEndTimelineRow.should.almost.equal(+targetRow, -1);
        });

    });

});
