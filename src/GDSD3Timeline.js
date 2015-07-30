"use strict";

import D3Timeline from './D3Timeline';

export default class GDSD3Timeline extends D3Timeline {

    elementEnter(selection) {

        selection
            .append('rect');

        selection
            .append('text')
            .classed('bookingLabel', true)
            .attr({
                dx: 2,
                dy: 20
            });

    }

    elementUpdate(selection) {

        var self = this;

        selection
            .select('rect')
            .attr({
                y: this.options.rowPadding,
                width: function(d) { return self.scales.x(d.end) - self.scales.x(d.start) },
                height: this.options.rowHeight - this.options.rowPadding * 2
            });

        selection
            .select('text')
            .text(d => d.id);

    }
}
