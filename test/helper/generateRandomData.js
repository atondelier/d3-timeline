/* global d3 */

"use strict";

function generateRandomData(rows, columns, minDate, maxDate) {

    return d3.range(0, rows).map(i => {

        var elements = d3.range(0, columns).map(j => {

            var start = new Date(+minDate + Math.random() * (maxDate - minDate));
            var end = new Date(+start + Math.random() * 3.6e6);

            return {
                id: i*rows+j,
                uid: i*rows+j+Math.random(),
                entity: {
                    name: '' + i*rows+j
                },
                start: start,
                end: end
            };
        });

        return {
            name: i,
            id: i,
            elements : elements
        };

    });

}
