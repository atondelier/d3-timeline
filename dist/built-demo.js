;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _babelRuntimeRegenerator = require('babel-runtime/regenerator');

var _babelRuntimeRegenerator2 = _interopRequireDefault(_babelRuntimeRegenerator);

var _srcD3Timeline = require('../../src/D3Timeline');

var _srcD3Timeline2 = _interopRequireDefault(_srcD3Timeline);

var _srcD3TableMouseTracker = require('../../src/D3TableMouseTracker');

var _srcD3TableMouseTracker2 = _interopRequireDefault(_srcD3TableMouseTracker);

var _srcD3TimelineTimeTracker = require('../../src/D3TimelineTimeTracker');

var _srcD3TimelineTimeTracker2 = _interopRequireDefault(_srcD3TimelineTimeTracker);

var _Faker = require('Faker');

var _Faker2 = _interopRequireDefault(_Faker);

var _datGui = require('dat-gui');

var _datGui2 = _interopRequireDefault(_datGui);

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

/*
Data random generation
 */

var _lodash2 = _interopRequireDefault(_lodash);

var gdsData = [];
var bookings = [];
var now = new Date();
var year = now.getFullYear();
var month = now.getMonth();
var date = now.getDate();
var hours = now.getHours();
var minDate = new Date(year, month, date, hours - 2);
var maxDate = new Date(year, month, date, hours + 4);

var randomizeMethodByMode = {
    'tables': randomizeEntries,
    'bookings': randomizeEntries2
};

function randomizeBookings(rows, elements) {
    bookings = (0, _lodash2['default'])(0).range(elements, 1).map(function (i) {
        var start = new Date(year, month, date, hours - 2, Math.random() * 60 * 4);
        var end = new Date(+start + (20 + Math.random() * 10 >> 0) * 6e4);
        var tables = (0, _lodash2['default'])(1).range(rows, 1).shuffle().slice(rows / 2 >> 0, (rows / 2 >> 0) + 2 + Math.random() * 3 >> 0).value();
        return {
            id: i,
            uid: i,
            start: start,
            end: end,
            card: _Faker2['default'].Helpers.createCard(),
            parentId: tables[0],
            tables: tables
        };
    }).value();
}

function makeBookingsInRows(bookings, rows) {
    return (0, _lodash2['default'])(0).range(rows, 1).map(function (i) {
        return {
            uid: i,
            name: 'T' + (i + 1),
            elements: _lodash2['default'].cloneDeep((0, _lodash2['default'])(bookings).filter(function (b) {
                var hasTable = b.tables.indexOf(i) !== -1;
                if (hasTable) {
                    b.parentId = i;
                    b.uid = i + '_' + b.id;
                }
                return hasTable;
            }).value())
        };
    }).value();
}

function makeSortedBookings(bookings) {
    return (0, _lodash2['default'])(bookings).sortBy(function (b) {
        return b.start;
    }).map(function (b) {
        return {
            uid: b.parentId + '_' + b.id,
            name: b.uid,
            elements: [_lodash2['default'].cloneDeep(b)]
        };
    }).value();
}

function randomizeEntries(rows, elements, keepExisting) {
    if (!keepExisting) {
        randomizeBookings(rows, elements);
    }
    gdsData = makeBookingsInRows(bookings, rows);
}

function randomizeEntries2(rows, elements, keepExisting) {
    if (!keepExisting) {
        randomizeBookings(rows, elements);
    }
    gdsData = makeSortedBookings(bookings);
}

var randomDataRows = 40;
var randomDataElements = 40;

function handleDistributionMode(mode, keepExisting, animate) {
    randomizeMethodByMode[mode](randomDataRows, randomDataElements, keepExisting);

    timeline.setData(gdsData, animate ? 400 : 0);

    timeline.updateY().updateX().updateXAxisInterval().drawXAxis().drawYAxis();
}

/*
Timeline instantiation and listeners
 */

/**
 * @type {D3Timeline}
 */
var timeline = new _srcD3Timeline2['default']({
    container: '#container',
    renderOnIdle: true,
    hideTicksOnZoom: true,
    hideTicksOnDrag: true,
    clipElementFilter: function clipElementFilter(selection) {
        return selection.datum().card.name.length > 10;
    },
    enableYTransition: true,
    cullingX: true,
    cullingY: true
});

timeline.elementContentUpdate = function (selection) {
    selection.select('.timeline-entityLabel').text(function (d) {
        return d.card.name;
    });
};

timeline.on('timeline:element:click', function (d, timeline, selection, d3Event, getTime, getRow) {
    console.log('click on element', arguments);
    console.log('time:', getTime());
    console.log('row:', getRow());
});

timeline.on('timeline:click', function (timeline, selection, d3Event, getTime, getRow) {
    console.log('click on timeline', arguments);
    console.log('time:', getTime());
    console.log('row:', getRow());
});

timeline.on('timeline:element:dragend', function (d, timeline, selection, d3Event, getTime, getRow) {
    console.log('draggend on timeline', arguments);
    console.log('time:', getTime());
    console.log('row:', getRow());
});

timeline.on('timeline:element:dragend', function (d, timeline, selection, d3Event, getTime, getRow) {
    var d = selection.datum();
    var original = _lodash2['default'].findWhere(bookings, { uid: d.uid }) || _lodash2['default'].findWhere(bookings, { id: d.id });

    var previousDuration = Math.floor(+timeline.getDataEnd(d) - +timeline.getDataStart(d));

    d.start = original.start = Math.round(getTime());
    d.end = original.end = new Date(+d.start + previousDuration);
    var currentRow = timeline.data[d.rowIndex];
    var row = getRow();

    currentRow.elements.splice(currentRow.elements.indexOf(d), 1);

    row.elements.push(d);

    if (demoOptions.distributionMode === 'bookings') {
        gdsData = makeSortedBookings(bookings);
        timeline.setData(gdsData, 500);
    } else if (demoOptions.distributionMode === 'tables') {
        timeline.generateFlattenedData();
        timeline.drawElements();
    }
});

timeline.options.yAxisFormatter = function (d) {
    return !d ? '' : demoOptions.distributionMode === 'bookings' ? d.elements[0].card.name : d.name;
};

/*
GUI
 */

var demoOptions = {
    outlineGroups: false,
    distributionMode: 'tables'
};

var gui = new _datGui2['default'].GUI({
    width: 400
});

gui.close();

var debugGui = gui.addFolder('External options');

debugGui.add(demoOptions, 'outlineGroups').name('Outline groups').onChange(function () {
    $(document.body).toggleClass('debug-outlineGroups', demoOptions.outlineGroups);
});
debugGui.add(demoOptions, 'distributionMode', ['tables', 'bookings']).name('Distribution').onChange(function () {
    handleDistributionMode(demoOptions.distributionMode, true, true);
});

var timelineGui = gui.addFolder('Rendering');
var dimensionsGui = gui.addFolder('Dimensions');
var cullingGui = gui.addFolder('Culling');
var elementGui = gui.addFolder('Text alignment');
var behaviorGui = gui.addFolder('Behaviors');

function forceFullRedraw() {
    timeline.container.selectAll('g.timeline-element').remove();
    timeline.updateMargins();
    timeline.setData([]);
    timeline.requestAnimationFrame(timeline.setData.bind(timeline, gdsData));
}

timelineGui.add(timeline.options, 'renderOnIdle').name('Render on idle');
timelineGui.add(timeline.options, 'renderOnAutomaticScrollIdle').name('Render on automatic scroll');
timelineGui.add(timeline.options, 'hideTicksOnDrag').name('Hide ticks on drag');
timelineGui.add(timeline.options, 'hideTicksOnZoom').name('Hide ticks on zoom');
timelineGui.add(timeline.options, 'clipElement').name('Clip blocks').onChange(forceFullRedraw);

dimensionsGui.add(timeline.options, 'rowHeight', 10, 50).step(1).name('Row height').onChange(forceFullRedraw);
dimensionsGui.add(timeline.options, 'rowPadding', 0, 10).step(1).name('Row padding').onChange(forceFullRedraw);
dimensionsGui.add(timeline.options, 'xAxisHeight', 30, 100).step(1).name('X axis height').onFinishChange(forceFullRedraw);
dimensionsGui.add(timeline.options, 'yAxisWidth', 30, 100).step(1).name('Y axis width').onFinishChange(forceFullRedraw);

cullingGui.add(timeline.options, 'cullingX').name('X culling');
cullingGui.add(timeline.options, 'cullingY').name('Y culling');
cullingGui.add(timeline.options, 'cullingDistance', -10, 10).step(1).name('Y culling distance');

elementGui.add(timeline.options, 'alignLeft').name('Keep text visible');
elementGui.add(timeline.options, 'alignOnTranslate').name('Keep text visible on translate');

behaviorGui.add(timeline.options, 'panYOnWheel').name('Y pan on mouse wheel');
behaviorGui.add(timeline.options, 'wheelMultiplier', 1, 5).step(1).name('Y pan rows per rotation');

/*
 Timeline initialization
 */

timeline.toggleDrawing(false).initialize().setAvailableWidth(innerWidth).setAvailableHeight(innerHeight - 5).setTimeRange(minDate, maxDate).toggleDrawing(true);

handleDistributionMode(demoOptions.distributionMode, false, false);

/*
 Markers
 */

var mouseTracker = new _srcD3TableMouseTracker2['default']({
    xFormatter: d3.time.format('%H:%M')
});

mouseTracker.setTimeline(timeline);

global.mouseTracker = mouseTracker;

var timeTracker = new _srcD3TimelineTimeTracker2['default']({
    xFormatter: d3.time.format('%H:%M')
});

timeTracker.setTimeline(timeline);

timeTracker.timeComparator = function (timeA, timeB) {
    var oneMinute = 1e3;
    return +timeA / oneMinute >> 0 !== +timeB / oneMinute >> 0;
};

timeTracker.start();

global.timeTracker = timeTracker;

$(window).resize(_lodash2['default'].debounce(function () {
    console.log('window size', innerWidth, innerHeight);
    timeline.setAvailableWidth(innerWidth).setAvailableHeight(innerHeight - 5);
}, 100));

global.timeline = timeline;

},{"../../src/D3TableMouseTracker":90,"../../src/D3Timeline":92,"../../src/D3TimelineTimeTracker":93,"Faker":2,"babel-runtime/regenerator":78,"dat-gui":80}],2:[function(require,module,exports){
/*

   this index.js file is used for including the Faker library as a CommonJS module, instead of a bundle

   you can include the Faker library into your existing node.js application by requiring the entire /Faker directory

    var faker = require(./faker);
    var randomName = Faker.Name.findName();

   you can also simply include the "Faker.js" file which is the auto-generated bundled version of the Faker library

    var Faker = require(./customAppPath/Faker);
    var randomName = Faker.Name.findName();


  if you plan on modifying the Faker library you should be performing your changes in the /lib/ directory

*/

'use strict';

exports.Name = require('./lib/name');
exports.Address = require('./lib/address');
exports.PhoneNumber = require('./lib/phone_number');
exports.Internet = require('./lib/internet');
exports.Company = require('./lib/company');
exports.Image = require('./lib/image');
exports.Lorem = require('./lib/lorem');
exports.Helpers = require('./lib/helpers');
exports.Tree = require('./lib/tree');
exports.Date = require('./lib/date');
exports.random = require('./lib/random');
exports.definitions = require('./lib/definitions');

},{"./lib/address":3,"./lib/company":4,"./lib/date":5,"./lib/definitions":6,"./lib/helpers":7,"./lib/image":8,"./lib/internet":9,"./lib/lorem":10,"./lib/name":11,"./lib/phone_number":12,"./lib/random":13,"./lib/tree":14}],3:[function(require,module,exports){
'use strict';

var Helpers = require('./helpers');
var Faker = require('../index');
var definitions = require('../lib/definitions');

var address = {
    zipCode: function zipCode() {
        return Helpers.replaceSymbolWithNumber(Faker.random.array_element(["#####", '#####-####']));
    },

    zipCodeFormat: function zipCodeFormat(format) {
        return Helpers.replaceSymbolWithNumber(["#####", '#####-####'][format]);
    },

    city: function city() {
        var result;
        switch (Faker.random.number(4)) {
            case 0:
                result = Faker.random.city_prefix() + " " + Faker.random.first_name() + Faker.random.city_suffix();
                break;
            case 1:
                result = Faker.random.city_prefix() + " " + Faker.random.first_name();
                break;
            case 2:
                result = Faker.random.first_name() + Faker.random.city_suffix();
                break;
            case 3:
                result = Faker.random.last_name() + Faker.random.city_suffix();
                break;
        }
        return result;
    },

    streetName: function streetName() {
        var result;
        switch (Faker.random.number(2)) {
            case 0:
                result = Faker.random.last_name() + " " + Faker.random.street_suffix();
                break;
            case 1:
                result = Faker.random.first_name() + " " + Faker.random.street_suffix();
                break;
        }
        return result;
    },

    //
    // TODO: change all these methods that accept a boolean to instead accept an options hash.
    //
    streetAddress: function streetAddress(useFullAddress) {
        if (useFullAddress === undefined) {
            useFullAddress = false;
        }
        var address = "";
        switch (Faker.random.number(3)) {
            case 0:
                address = Helpers.replaceSymbolWithNumber("#####") + " " + this.streetName();
                break;
            case 1:
                address = Helpers.replaceSymbolWithNumber("####") + " " + this.streetName();
                break;
            case 2:
                address = Helpers.replaceSymbolWithNumber("###") + " " + this.streetName();
                break;
        }
        return useFullAddress ? address + " " + this.secondaryAddress() : address;
    },

    secondaryAddress: function secondaryAddress() {
        return Helpers.replaceSymbolWithNumber(Faker.random.array_element(['Apt. ###', 'Suite ###']));
    },

    brState: function brState(useAbbr) {
        return useAbbr ? Faker.random.br_state_abbr() : Faker.random.br_state();
    },

    ukCounty: function ukCounty() {
        return Faker.random.uk_county();
    },

    ukCountry: function ukCountry() {
        return Faker.random.uk_country();
    },

    usState: function usState(useAbbr) {
        return useAbbr ? Faker.random.us_state_abbr() : Faker.random.us_state();
    },

    latitude: function latitude() {
        return (Faker.random.number(180 * 10000) / 10000.0 - 90.0).toFixed(4);
    },

    longitude: function longitude() {
        return (Faker.random.number(360 * 10000) / 10000.0 - 180.0).toFixed(4);
    }
};

module.exports = address;

},{"../index":2,"../lib/definitions":6,"./helpers":7}],4:[function(require,module,exports){
"use strict";

var Faker = require('../index');

var company = {
    suffixes: function suffixes() {
        return ["Inc", "and Sons", "LLC", "Group", "and Daughters"];
    },

    companyName: function companyName(format) {
        switch (format ? format : Faker.random.number(3)) {
            case 0:
                return Faker.Name.lastName() + " " + this.companySuffix();
            case 1:
                return Faker.Name.lastName() + "-" + Faker.Name.lastName();
            case 2:
                return Faker.Name.lastName() + ", " + Faker.Name.lastName() + " and " + Faker.Name.lastName();
        }
    },

    companySuffix: function companySuffix() {
        return Faker.random.array_element(this.suffixes());
    },

    catchPhrase: function catchPhrase() {
        return Faker.random.catch_phrase_adjective() + " " + Faker.random.catch_phrase_descriptor() + " " + Faker.random.catch_phrase_noun();
    },

    bs: function bs() {
        return Faker.random.bs_adjective() + " " + Faker.random.bs_buzz() + " " + Faker.random.bs_noun();
    }
};

module.exports = company;

},{"../index":2}],5:[function(require,module,exports){
'use strict';

var Faker = require('../index');

var date = {

    past: function past(years, refDate) {
        var date = refDate ? new Date(Date.parse(refDate)) : new Date();

        var past = date.getTime();
        past -= Faker.random.number(years) * 365 * 3600 * 1000; // some time from now to N years ago, in milliseconds
        date.setTime(past);

        return date.toJSON();
    },

    future: function future(years, refDate) {
        var date = refDate ? new Date(Date.parse(refDate)) : new Date();
        var future = date.getTime();
        future += Faker.random.number(years) * 365 * 3600 * 1000; // some time from now to N years later, in milliseconds
        date.setTime(future);

        return date.toJSON();
    },

    between: function between(from, to) {
        var fromMilli = Date.parse(from);
        var dateOffset = Faker.random.number(Date.parse(to) - fromMilli);

        var newDate = new Date(fromMilli + dateOffset);

        return newDate.toJSON();
    },

    recent: function recent(days) {
        var date = new Date();
        var future = date.getTime();
        future -= Faker.random.number(days) * 3600 * 1000; // some time from now to N days ago, in milliseconds
        date.setTime(future);

        return date.toJSON();
    }
};
module.exports = date;

},{"../index":2}],6:[function(require,module,exports){
// name.js definitions
"use strict";exports.first_name = ["Aaliyah","Aaron","Abagail","Abbey","Abbie","Abbigail","Abby","Abdiel","Abdul","Abdullah","Abe","Abel","Abelardo","Abigail","Abigale","Abigayle","Abner","Abraham","Ada","Adah","Adalberto","Adaline","Adam","Adan","Addie","Addison","Adela","Adelbert","Adele","Adelia","Adeline","Adell","Adella","Adelle","Aditya","Adolf","Adolfo","Adolph","Adolphus","Adonis","Adrain","Adrian","Adriana","Adrianna","Adriel","Adrien","Adrienne","Afton","Aglae","Agnes","Agustin","Agustina","Ahmad","Ahmed","Aida","Aidan","Aiden","Aileen","Aimee","Aisha","Aiyana","Akeem","Al","Alaina","Alan","Alana","Alanis","Alanna","Alayna","Alba","Albert","Alberta","Albertha","Alberto","Albin","Albina","Alda","Alden","Alec","Aleen","Alejandra","Alejandrin","Alek","Alena","Alene","Alessandra","Alessandro","Alessia","Aletha","Alex","Alexa","Alexander","Alexandra","Alexandre","Alexandrea","Alexandria","Alexandrine","Alexandro","Alexane","Alexanne","Alexie","Alexis","Alexys","Alexzander","Alf","Alfonso","Alfonzo","Alford","Alfred","Alfreda","Alfredo","Ali","Alia","Alice","Alicia","Alisa","Alisha","Alison","Alivia","Aliya","Aliyah","Aliza","Alize","Allan","Allen","Allene","Allie","Allison","Ally","Alphonso","Alta","Althea","Alva","Alvah","Alvena","Alvera","Alverta","Alvina","Alvis","Alyce","Alycia","Alysa","Alysha","Alyson","Alysson","Amalia","Amanda","Amani","Amara","Amari","Amaya","Amber","Ambrose","Amelia","Amelie","Amely","America","Americo","Amie","Amina","Amir","Amira","Amiya","Amos","Amparo","Amy","Amya","Ana","Anabel","Anabelle","Anahi","Anais","Anastacio","Anastasia","Anderson","Andre","Andreane","Andreanne","Andres","Andrew","Andy","Angel","Angela","Angelica","Angelina","Angeline","Angelita","Angelo","Angie","Angus","Anibal","Anika","Anissa","Anita","Aniya","Aniyah","Anjali","Anna","Annabel","Annabell","Annabelle","Annalise","Annamae","Annamarie","Anne","Annetta","Annette","Annie","Ansel","Ansley","Anthony","Antoinette","Antone","Antonetta","Antonette","Antonia","Antonietta","Antonina","Antonio","Antwan","Antwon","Anya","April","Ara","Araceli","Aracely","Arch","Archibald","Ardella","Arden","Ardith","Arely","Ari","Ariane","Arianna","Aric","Ariel","Arielle","Arjun","Arlene","Arlie","Arlo","Armand","Armando","Armani","Arnaldo","Arne","Arno","Arnold","Arnoldo","Arnulfo","Aron","Art","Arthur","Arturo","Arvel","Arvid","Arvilla","Aryanna","Asa","Asha","Ashlee","Ashleigh","Ashley","Ashly","Ashlynn","Ashton","Ashtyn","Asia","Assunta","Astrid","Athena","Aubree","Aubrey","Audie","Audra","Audreanne","Audrey","August","Augusta","Augustine","Augustus","Aurelia","Aurelie","Aurelio","Aurore","Austen","Austin","Austyn","Autumn","Ava","Avery","Avis","Axel","Ayana","Ayden","Ayla","Aylin","Baby","Bailee","Bailey","Barbara","Barney","Baron","Barrett","Barry","Bart","Bartholome","Barton","Baylee","Beatrice","Beau","Beaulah","Bell","Bella","Belle","Ben","Benedict","Benjamin","Bennett","Bennie","Benny","Benton","Berenice","Bernadette","Bernadine","Bernard","Bernardo","Berneice","Bernhard","Bernice","Bernie","Berniece","Bernita","Berry","Bert","Berta","Bertha","Bertram","Bertrand","Beryl","Bessie","Beth","Bethany","Bethel","Betsy","Bette","Bettie","Betty","Bettye","Beulah","Beverly","Bianka","Bill","Billie","Billy","Birdie","Blair","Blaise","Blake","Blanca","Blanche","Blaze","Bo","Bobbie","Bobby","Bonita","Bonnie","Boris","Boyd","Brad","Braden","Bradford","Bradley","Bradly","Brady","Braeden","Brain","Brandi","Brando","Brandon","Brandt","Brandy","Brandyn","Brannon","Branson","Brant","Braulio","Braxton","Brayan","Breana","Breanna","Breanne","Brenda","Brendan","Brenden","Brendon","Brenna","Brennan","Brennon","Brent","Bret","Brett","Bria","Brian","Briana","Brianne","Brice","Bridget","Bridgette","Bridie","Brielle","Brigitte","Brionna","Brisa","Britney","Brittany","Brock","Broderick","Brody","Brook","Brooke","Brooklyn","Brooks","Brown","Bruce","Bryana","Bryce","Brycen","Bryon","Buck","Bud","Buddy","Buford","Bulah","Burdette","Burley","Burnice","Buster","Cade","Caden","Caesar","Caitlyn","Cale","Caleb","Caleigh","Cali","Calista","Callie","Camden","Cameron","Camila","Camilla","Camille","Camren","Camron","Camryn","Camylle","Candace","Candelario","Candice","Candida","Candido","Cara","Carey","Carissa","Carlee","Carleton","Carley","Carli","Carlie","Carlo","Carlos","Carlotta","Carmel","Carmela","Carmella","Carmelo","Carmen","Carmine","Carol","Carolanne","Carole","Carolina","Caroline","Carolyn","Carolyne","Carrie","Carroll","Carson","Carter","Cary","Casandra","Casey","Casimer","Casimir","Casper","Cassandra","Cassandre","Cassidy","Cassie","Catalina","Caterina","Catharine","Catherine","Cathrine","Cathryn","Cathy","Cayla","Ceasar","Cecelia","Cecil","Cecile","Cecilia","Cedrick","Celestine","Celestino","Celia","Celine","Cesar","Chad","Chadd","Chadrick","Chaim","Chance","Chandler","Chanel","Chanelle","Charity","Charlene","Charles","Charley","Charlie","Charlotte","Chase","Chasity","Chauncey","Chaya","Chaz","Chelsea","Chelsey","Chelsie","Chesley","Chester","Chet","Cheyanne","Cheyenne","Chloe","Chris","Christ","Christa","Christelle","Christian","Christiana","Christina","Christine","Christop","Christophe","Christopher","Christy","Chyna","Ciara","Cicero","Cielo","Cierra","Cindy","Citlalli","Clair","Claire","Clara","Clarabelle","Clare","Clarissa","Clark","Claud","Claude","Claudia","Claudie","Claudine","Clay","Clemens","Clement","Clementina","Clementine","Clemmie","Cleo","Cleora","Cleta","Cletus","Cleve","Cleveland","Clifford","Clifton","Clint","Clinton","Clotilde","Clovis","Cloyd","Clyde","Coby","Cody","Colby","Cole","Coleman","Colin","Colleen","Collin","Colt","Colten","Colton","Columbus","Concepcion","Conner","Connie","Connor","Conor","Conrad","Constance","Constantin","Consuelo","Cooper","Cora","Coralie","Corbin","Cordelia","Cordell","Cordia","Cordie","Corene","Corine","Cornelius","Cornell","Corrine","Cortez","Cortney","Cory","Coty","Courtney","Coy","Craig","Crawford","Creola","Cristal","Cristian","Cristina","Cristobal","Cristopher","Cruz","Crystal","Crystel","Cullen","Curt","Curtis","Cydney","Cynthia","Cyril","Cyrus","Dagmar","Dahlia","Daija","Daisha","Daisy","Dakota","Dale","Dallas","Dallin","Dalton","Damaris","Dameon","Damian","Damien","Damion","Damon","Dan","Dana","Dandre","Dane","D'angelo","Dangelo","Danial","Daniela","Daniella","Danielle","Danika","Dannie","Danny","Dante","Danyka","Daphne","Daphnee","Daphney","Darby","Daren","Darian","Dariana","Darien","Dario","Darion","Darius","Darlene","Daron","Darrel","Darrell","Darren","Darrick","Darrin","Darrion","Darron","Darryl","Darwin","Daryl","Dashawn","Dasia","Dave","David","Davin","Davion","Davon","Davonte","Dawn","Dawson","Dax","Dayana","Dayna","Dayne","Dayton","Dean","Deangelo","Deanna","Deborah","Declan","Dedric","Dedrick","Dee","Deion","Deja","Dejah","Dejon","Dejuan","Delaney","Delbert","Delfina","Delia","Delilah","Dell","Della","Delmer","Delores","Delpha","Delphia","Delphine","Delta","Demarco","Demarcus","Demario","Demetris","Demetrius","Demond","Dena","Denis","Dennis","Deon","Deondre","Deontae","Deonte","Dereck","Derek","Derick","Deron","Derrick","Deshaun","Deshawn","Desiree","Desmond","Dessie","Destany","Destin","Destinee","Destiney","Destini","Destiny","Devan","Devante","Deven","Devin","Devon","Devonte","Devyn","Dewayne","Dewitt","Dexter","Diamond","Diana","Dianna","Diego","Dillan","Dillon","Dimitri","Dina","Dino","Dion","Dixie","Dock","Dolly","Dolores","Domenic","Domenica","Domenick","Domenico","Domingo","Dominic","Dominique","Don","Donald","Donato","Donavon","Donna","Donnell","Donnie","Donny","Dora","Dorcas","Dorian","Doris","Dorothea","Dorothy","Dorris","Dortha","Dorthy","Doug","Douglas","Dovie","Doyle","Drake","Drew","Duane","Dudley","Dulce","Duncan","Durward","Dustin","Dusty","Dwight","Dylan","Earl","Earlene","Earline","Earnest","Earnestine","Easter","Easton","Ebba","Ebony","Ed","Eda","Edd","Eddie","Eden","Edgar","Edgardo","Edison","Edmond","Edmund","Edna","Eduardo","Edward","Edwardo","Edwin","Edwina","Edyth","Edythe","Effie","Efrain","Efren","Eileen","Einar","Eino","Eladio","Elaina","Elbert","Elda","Eldon","Eldora","Eldred","Eldridge","Eleanora","Eleanore","Eleazar","Electa","Elena","Elenor","Elenora","Eleonore","Elfrieda","Eli","Elian","Eliane","Elias","Eliezer","Elijah","Elinor","Elinore","Elisa","Elisabeth","Elise","Eliseo","Elisha","Elissa","Eliza","Elizabeth","Ella","Ellen","Ellie","Elliot","Elliott","Ellis","Ellsworth","Elmer","Elmira","Elmo","Elmore","Elna","Elnora","Elody","Eloisa","Eloise","Elouise","Eloy","Elroy","Elsa","Else","Elsie","Elta","Elton","Elva","Elvera","Elvie","Elvis","Elwin","Elwyn","Elyse","Elyssa","Elza","Emanuel","Emelia","Emelie","Emely","Emerald","Emerson","Emery","Emie","Emil","Emile","Emilia","Emiliano","Emilie","Emilio","Emily","Emma","Emmalee","Emmanuel","Emmanuelle","Emmet","Emmett","Emmie","Emmitt","Emmy","Emory","Ena","Enid","Enoch","Enola","Enos","Enrico","Enrique","Ephraim","Era","Eriberto","Eric","Erica","Erich","Erick","Ericka","Erik","Erika","Erin","Erling","Erna","Ernest","Ernestina","Ernestine","Ernesto","Ernie","Ervin","Erwin","Eryn","Esmeralda","Esperanza","Esta","Esteban","Estefania","Estel","Estell","Estella","Estelle","Estevan","Esther","Estrella","Etha","Ethan","Ethel","Ethelyn","Ethyl","Ettie","Eudora","Eugene","Eugenia","Eula","Eulah","Eulalia","Euna","Eunice","Eusebio","Eva","Evalyn","Evan","Evangeline","Evans","Eve","Eveline","Evelyn","Everardo","Everett","Everette","Evert","Evie","Ewald","Ewell","Ezekiel","Ezequiel","Ezra","Fabian","Fabiola","Fae","Fannie","Fanny","Fatima","Faustino","Fausto","Favian","Fay","Faye","Federico","Felicia","Felicita","Felicity","Felipa","Felipe","Felix","Felton","Fermin","Fern","Fernando","Ferne","Fidel","Filiberto","Filomena","Finn","Fiona","Flavie","Flavio","Fleta","Fletcher","Flo","Florence","Florencio","Florian","Florida","Florine","Flossie","Floy","Floyd","Ford","Forest","Forrest","Foster","Frances","Francesca","Francesco","Francis","Francisca","Francisco","Franco","Frank","Frankie","Franz","Fred","Freda","Freddie","Freddy","Frederic","Frederick","Frederik","Frederique","Fredrick","Fredy","Freeda","Freeman","Freida","Frida","Frieda","Friedrich","Fritz","Furman","Gabe","Gabriel","Gabriella","Gabrielle","Gaetano","Gage","Gail","Gardner","Garett","Garfield","Garland","Garnet","Garnett","Garret","Garrett","Garrick","Garrison","Garry","Garth","Gaston","Gavin","Gay","Gayle","Gaylord","Gene","General","Genesis","Genevieve","Gennaro","Genoveva","Geo","Geoffrey","George","Georgette","Georgiana","Georgianna","Geovanni","Geovanny","Geovany","Gerald","Geraldine","Gerard","Gerardo","Gerda","Gerhard","Germaine","German","Gerry","Gerson","Gertrude","Gia","Gianni","Gideon","Gilbert","Gilberto","Gilda","Giles","Gillian","Gina","Gino","Giovani","Giovanna","Giovanni","Giovanny","Gisselle","Giuseppe","Gladyce","Gladys","Glen","Glenda","Glenna","Glennie","Gloria","Godfrey","Golda","Golden","Gonzalo","Gordon","Grace","Gracie","Graciela","Grady","Graham","Grant","Granville","Grayce","Grayson","Green","Greg","Gregg","Gregoria","Gregorio","Gregory","Greta","Gretchen","Greyson","Griffin","Grover","Guadalupe","Gudrun","Guido","Guillermo","Guiseppe","Gunnar","Gunner","Gus","Gussie","Gust","Gustave","Guy","Gwen","Gwendolyn","Hadley","Hailee","Hailey","Hailie","Hal","Haleigh","Haley","Halie","Halle","Hallie","Hank","Hanna","Hannah","Hans","Hardy","Harley","Harmon","Harmony","Harold","Harrison","Harry","Harvey","Haskell","Hassan","Hassie","Hattie","Haven","Hayden","Haylee","Hayley","Haylie","Hazel","Hazle","Heath","Heather","Heaven","Heber","Hector","Heidi","Helen","Helena","Helene","Helga","Hellen","Helmer","Heloise","Henderson","Henri","Henriette","Henry","Herbert","Herman","Hermann","Hermina","Herminia","Herminio","Hershel","Herta","Hertha","Hester","Hettie","Hilario","Hilbert","Hilda","Hildegard","Hillard","Hillary","Hilma","Hilton","Hipolito","Hiram","Hobart","Holden","Hollie","Hollis","Holly","Hope","Horace","Horacio","Hortense","Hosea","Houston","Howard","Howell","Hoyt","Hubert","Hudson","Hugh","Hulda","Humberto","Hunter","Hyman","Ian","Ibrahim","Icie","Ida","Idell","Idella","Ignacio","Ignatius","Ike","Ila","Ilene","Iliana","Ima","Imani","Imelda","Immanuel","Imogene","Ines","Irma","Irving","Irwin","Isaac","Isabel","Isabell","Isabella","Isabelle","Isac","Isadore","Isai","Isaiah","Isaias","Isidro","Ismael","Isobel","Isom","Israel","Issac","Itzel","Iva","Ivah","Ivory","Ivy","Izabella","Izaiah","Jabari","Jace","Jacey","Jacinthe","Jacinto","Jack","Jackeline","Jackie","Jacklyn","Jackson","Jacky","Jaclyn","Jacquelyn","Jacques","Jacynthe","Jada","Jade","Jaden","Jadon","Jadyn","Jaeden","Jaida","Jaiden","Jailyn","Jaime","Jairo","Jakayla","Jake","Jakob","Jaleel","Jalen","Jalon","Jalyn","Jamaal","Jamal","Jamar","Jamarcus","Jamel","Jameson","Jamey","Jamie","Jamil","Jamir","Jamison","Jammie","Jan","Jana","Janae","Jane","Janelle","Janessa","Janet","Janice","Janick","Janie","Janis","Janiya","Jannie","Jany","Jaquan","Jaquelin","Jaqueline","Jared","Jaren","Jarod","Jaron","Jarred","Jarrell","Jarret","Jarrett","Jarrod","Jarvis","Jasen","Jasmin","Jason","Jasper","Jaunita","Javier","Javon","Javonte","Jay","Jayce","Jaycee","Jayda","Jayde","Jayden","Jaydon","Jaylan","Jaylen","Jaylin","Jaylon","Jayme","Jayne","Jayson","Jazlyn","Jazmin","Jazmyn","Jazmyne","Jean","Jeanette","Jeanie","Jeanne","Jed","Jedediah","Jedidiah","Jeff","Jefferey","Jeffery","Jeffrey","Jeffry","Jena","Jenifer","Jennie","Jennifer","Jennings","Jennyfer","Jensen","Jerad","Jerald","Jeramie","Jeramy","Jerel","Jeremie","Jeremy","Jermain","Jermaine","Jermey","Jerod","Jerome","Jeromy","Jerrell","Jerrod","Jerrold","Jerry","Jess","Jesse","Jessica","Jessie","Jessika","Jessy","Jessyca","Jesus","Jett","Jettie","Jevon","Jewel","Jewell","Jillian","Jimmie","Jimmy","Jo","Joan","Joana","Joanie","Joanne","Joannie","Joanny","Joany","Joaquin","Jocelyn","Jodie","Jody","Joe","Joel","Joelle","Joesph","Joey","Johan","Johann","Johanna","Johathan","John","Johnathan","Johnathon","Johnnie","Johnny","Johnpaul","Johnson","Jolie","Jon","Jonas","Jonatan","Jonathan","Jonathon","Jordan","Jordane","Jordi","Jordon","Jordy","Jordyn","Jorge","Jose","Josefa","Josefina","Joseph","Josephine","Josh","Joshua","Joshuah","Josiah","Josiane","Josianne","Josie","Josue","Jovan","Jovani","Jovanny","Jovany","Joy","Joyce","Juana","Juanita","Judah","Judd","Jude","Judge","Judson","Judy","Jules","Julia","Julian","Juliana","Julianne","Julie","Julien","Juliet","Julio","Julius","June","Junior","Junius","Justen","Justice","Justina","Justine","Juston","Justus","Justyn","Juvenal","Juwan","Kacey","Kaci","Kacie","Kade","Kaden","Kadin","Kaela","Kaelyn","Kaia","Kailee","Kailey","Kailyn","Kaitlin","Kaitlyn","Kale","Kaleb","Kaleigh","Kaley","Kali","Kallie","Kameron","Kamille","Kamren","Kamron","Kamryn","Kane","Kara","Kareem","Karelle","Karen","Kari","Kariane","Karianne","Karina","Karine","Karl","Karlee","Karley","Karli","Karlie","Karolann","Karson","Kasandra","Kasey","Kassandra","Katarina","Katelin","Katelyn","Katelynn","Katharina","Katherine","Katheryn","Kathleen","Kathlyn","Kathryn","Kathryne","Katlyn","Katlynn","Katrina","Katrine","Kattie","Kavon","Kay","Kaya","Kaycee","Kayden","Kayla","Kaylah","Kaylee","Kayleigh","Kayley","Kayli","Kaylie","Kaylin","Keagan","Keanu","Keara","Keaton","Keegan","Keeley","Keely","Keenan","Keira","Keith","Kellen","Kelley","Kelli","Kellie","Kelly","Kelsi","Kelsie","Kelton","Kelvin","Ken","Kendall","Kendra","Kendrick","Kenna","Kennedi","Kennedy","Kenneth","Kennith","Kenny","Kenton","Kenya","Kenyatta","Kenyon","Keon","Keshaun","Keshawn","Keven","Kevin","Kevon","Keyon","Keyshawn","Khalid","Khalil","Kian","Kiana","Kianna","Kiara","Kiarra","Kiel","Kiera","Kieran","Kiley","Kim","Kimberly","King","Kip","Kira","Kirk","Kirsten","Kirstin","Kitty","Kobe","Koby","Kody","Kolby","Kole","Korbin","Korey","Kory","Kraig","Kris","Krista","Kristian","Kristin","Kristina","Kristofer","Kristoffer","Kristopher","Kristy","Krystal","Krystel","Krystina","Kurt","Kurtis","Kyla","Kyle","Kylee","Kyleigh","Kyler","Kylie","Kyra","Lacey","Lacy","Ladarius","Lafayette","Laila","Laisha","Lamar","Lambert","Lamont","Lance","Landen","Lane","Laney","Larissa","Laron","Larry","Larue","Laura","Laurel","Lauren","Laurence","Lauretta","Lauriane","Laurianne","Laurie","Laurine","Laury","Lauryn","Lavada","Lavern","Laverna","Laverne","Lavina","Lavinia","Lavon","Lavonne","Lawrence","Lawson","Layla","Layne","Lazaro","Lea","Leann","Leanna","Leanne","Leatha","Leda","Lee","Leif","Leila","Leilani","Lela","Lelah","Leland","Lelia","Lempi","Lemuel","Lenna","Lennie","Lenny","Lenora","Lenore","Leo","Leola","Leon","Leonard","Leonardo","Leone","Leonel","Leonie","Leonor","Leonora","Leopold","Leopoldo","Leora","Lera","Lesley","Leslie","Lesly","Lessie","Lester","Leta","Letha","Letitia","Levi","Lew","Lewis","Lexi","Lexie","Lexus","Lia","Liam","Liana","Libbie","Libby","Lila","Lilian","Liliana","Liliane","Lilla","Lillian","Lilliana","Lillie","Lilly","Lily","Lilyan","Lina","Lincoln","Linda","Lindsay","Lindsey","Linnea","Linnie","Linwood","Lionel","Lisa","Lisandro","Lisette","Litzy","Liza","Lizeth","Lizzie","Llewellyn","Lloyd","Logan","Lois","Lola","Lolita","Loma","Lon","London","Lonie","Lonnie","Lonny","Lonzo","Lora","Loraine","Loren","Lorena","Lorenz","Lorenza","Lorenzo","Lori","Lorine","Lorna","Lottie","Lou","Louie","Louisa","Lourdes","Louvenia","Lowell","Loy","Loyal","Loyce","Lucas","Luciano","Lucie","Lucienne","Lucile","Lucinda","Lucio","Lucious","Lucius","Lucy","Ludie","Ludwig","Lue","Luella","Luigi","Luis","Luisa","Lukas","Lula","Lulu","Luna","Lupe","Lura","Lurline","Luther","Luz","Lyda","Lydia","Lyla","Lynn","Lyric","Lysanne","Mabel","Mabelle","Mable","Mac","Macey","Maci","Macie","Mack","Mackenzie","Macy","Madaline","Madalyn","Maddison","Madeline","Madelyn","Madelynn","Madge","Madie","Madilyn","Madisen","Madison","Madisyn","Madonna","Madyson","Mae","Maegan","Maeve","Mafalda","Magali","Magdalen","Magdalena","Maggie","Magnolia","Magnus","Maia","Maida","Maiya","Major","Makayla","Makenna","Makenzie","Malachi","Malcolm","Malika","Malinda","Mallie","Mallory","Malvina","Mandy","Manley","Manuel","Manuela","Mara","Marc","Marcel","Marcelina","Marcelino","Marcella","Marcelle","Marcellus","Marcelo","Marcia","Marco","Marcos","Marcus","Margaret","Margarete","Margarett","Margaretta","Margarette","Margarita","Marge","Margie","Margot","Margret","Marguerite","Maria","Mariah","Mariam","Marian","Mariana","Mariane","Marianna","Marianne","Mariano","Maribel","Marie","Mariela","Marielle","Marietta","Marilie","Marilou","Marilyne","Marina","Mario","Marion","Marisa","Marisol","Maritza","Marjolaine","Marjorie","Marjory","Mark","Markus","Marlee","Marlen","Marlene","Marley","Marlin","Marlon","Marques","Marquis","Marquise","Marshall","Marta","Martin","Martina","Martine","Marty","Marvin","Mary","Maryam","Maryjane","Maryse","Mason","Mateo","Mathew","Mathias","Mathilde","Matilda","Matilde","Matt","Matteo","Mattie","Maud","Maude","Maudie","Maureen","Maurice","Mauricio","Maurine","Maverick","Mavis","Max","Maxie","Maxime","Maximilian","Maximillia","Maximillian","Maximo","Maximus","Maxine","Maxwell","May","Maya","Maybell","Maybelle","Maye","Maymie","Maynard","Mayra","Mazie","Mckayla","Mckenna","Mckenzie","Meagan","Meaghan","Meda","Megane","Meggie","Meghan","Mekhi","Melany","Melba","Melisa","Melissa","Mellie","Melody","Melvin","Melvina","Melyna","Melyssa","Mercedes","Meredith","Merl","Merle","Merlin","Merritt","Mertie","Mervin","Meta","Mia","Micaela","Micah","Michael","Michaela","Michale","Micheal","Michel","Michele","Michelle","Miguel","Mikayla","Mike","Mikel","Milan","Miles","Milford","Miller","Millie","Milo","Milton","Mina","Minerva","Minnie","Miracle","Mireille","Mireya","Misael","Missouri","Misty","Mitchel","Mitchell","Mittie","Modesta","Modesto","Mohamed","Mohammad","Mohammed","Moises","Mollie","Molly","Mona","Monica","Monique","Monroe","Monserrat","Monserrate","Montana","Monte","Monty","Morgan","Moriah","Morris","Mortimer","Morton","Mose","Moses","Moshe","Mossie","Mozell","Mozelle","Muhammad","Muriel","Murl","Murphy","Murray","Mustafa","Mya","Myah","Mylene","Myles","Myra","Myriam","Myrl","Myrna","Myron","Myrtice","Myrtie","Myrtis","Myrtle","Nadia","Nakia","Name","Nannie","Naomi","Naomie","Napoleon","Narciso","Nash","Nasir","Nat","Natalia","Natalie","Natasha","Nathan","Nathanael","Nathanial","Nathaniel","Nathen","Nayeli","Neal","Ned","Nedra","Neha","Neil","Nelda","Nella","Nelle","Nellie","Nels","Nelson","Neoma","Nestor","Nettie","Neva","Newell","Newton","Nia","Nicholas","Nicholaus","Nichole","Nick","Nicklaus","Nickolas","Nico","Nicola","Nicolas","Nicole","Nicolette","Nigel","Nikita","Nikki","Nikko","Niko","Nikolas","Nils","Nina","Noah","Noble","Noe","Noel","Noelia","Noemi","Noemie","Noemy","Nola","Nolan","Nona","Nora","Norbert","Norberto","Norene","Norma","Norris","Norval","Norwood","Nova","Novella","Nya","Nyah","Nyasia","Obie","Oceane","Ocie","Octavia","Oda","Odell","Odessa","Odie","Ofelia","Okey","Ola","Olaf","Ole","Olen","Oleta","Olga","Olin","Oliver","Ollie","Oma","Omari","Omer","Ona","Onie","Opal","Ophelia","Ora","Oral","Oran","Oren","Orie","Orin","Orion","Orland","Orlando","Orlo","Orpha","Orrin","Orval","Orville","Osbaldo","Osborne","Oscar","Osvaldo","Oswald","Oswaldo","Otha","Otho","Otilia","Otis","Ottilie","Ottis","Otto","Ova","Owen","Ozella","Pablo","Paige","Palma","Pamela","Pansy","Paolo","Paris","Parker","Pascale","Pasquale","Pat","Patience","Patricia","Patrick","Patsy","Pattie","Paul","Paula","Pauline","Paxton","Payton","Pearl","Pearlie","Pearline","Pedro","Peggie","Penelope","Percival","Percy","Perry","Pete","Peter","Petra","Peyton","Philip","Phoebe","Phyllis","Pierce","Pierre","Pietro","Pink","Pinkie","Piper","Polly","Porter","Precious","Presley","Preston","Price","Prince","Princess","Priscilla","Providenci","Prudence","Queen","Queenie","Quentin","Quincy","Quinn","Quinten","Quinton","Rachael","Rachel","Rachelle","Rae","Raegan","Rafael","Rafaela","Raheem","Rahsaan","Rahul","Raina","Raleigh","Ralph","Ramiro","Ramon","Ramona","Randal","Randall","Randi","Randy","Ransom","Raoul","Raphael","Raphaelle","Raquel","Rashad","Rashawn","Rasheed","Raul","Raven","Ray","Raymond","Raymundo","Reagan","Reanna","Reba","Rebeca","Rebecca","Rebeka","Rebekah","Reece","Reed","Reese","Regan","Reggie","Reginald","Reid","Reilly","Reina","Reinhold","Remington","Rene","Renee","Ressie","Reta","Retha","Retta","Reuben","Reva","Rex","Rey","Reyes","Reymundo","Reyna","Reynold","Rhea","Rhett","Rhianna","Rhiannon","Rhoda","Ricardo","Richard","Richie","Richmond","Rick","Rickey","Rickie","Ricky","Rico","Rigoberto","Riley","Rita","River","Robb","Robbie","Robert","Roberta","Roberto","Robin","Robyn","Rocio","Rocky","Rod","Roderick","Rodger","Rodolfo","Rodrick","Rodrigo","Roel","Rogelio","Roger","Rogers","Rolando","Rollin","Roma","Romaine","Roman","Ron","Ronaldo","Ronny","Roosevelt","Rory","Rosa","Rosalee","Rosalia","Rosalind","Rosalinda","Rosalyn","Rosamond","Rosanna","Rosario","Roscoe","Rose","Rosella","Roselyn","Rosemarie","Rosemary","Rosendo","Rosetta","Rosie","Rosina","Roslyn","Ross","Rossie","Rowan","Rowena","Rowland","Roxane","Roxanne","Roy","Royal","Royce","Rozella","Ruben","Rubie","Ruby","Rubye","Rudolph","Rudy","Rupert","Russ","Russel","Russell","Rusty","Ruth","Ruthe","Ruthie","Ryan","Ryann","Ryder","Rylan","Rylee","Ryleigh","Ryley","Sabina","Sabrina","Sabryna","Sadie","Sadye","Sage","Saige","Sallie","Sally","Salma","Salvador","Salvatore","Sam","Samanta","Samantha","Samara","Samir","Sammie","Sammy","Samson","Sandra","Sandrine","Sandy","Sanford","Santa","Santiago","Santina","Santino","Santos","Sarah","Sarai","Sarina","Sasha","Saul","Savanah","Savanna","Savannah","Savion","Scarlett","Schuyler","Scot","Scottie","Scotty","Seamus","Sean","Sebastian","Sedrick","Selena","Selina","Selmer","Serena","Serenity","Seth","Shad","Shaina","Shakira","Shana","Shane","Shanel","Shanelle","Shania","Shanie","Shaniya","Shanna","Shannon","Shanny","Shanon","Shany","Sharon","Shaun","Shawn","Shawna","Shaylee","Shayna","Shayne","Shea","Sheila","Sheldon","Shemar","Sheridan","Sherman","Sherwood","Shirley","Shyann","Shyanne","Sibyl","Sid","Sidney","Sienna","Sierra","Sigmund","Sigrid","Sigurd","Silas","Sim","Simeon","Simone","Sincere","Sister","Skye","Skyla","Skylar","Sofia","Soledad","Solon","Sonia","Sonny","Sonya","Sophia","Sophie","Spencer","Stacey","Stacy","Stan","Stanford","Stanley","Stanton","Stefan","Stefanie","Stella","Stephan","Stephania","Stephanie","Stephany","Stephen","Stephon","Sterling","Steve","Stevie","Stewart","Stone","Stuart","Summer","Sunny","Susan","Susana","Susanna","Susie","Suzanne","Sven","Syble","Sydnee","Sydney","Sydni","Sydnie","Sylvan","Sylvester","Sylvia","Tabitha","Tad","Talia","Talon","Tamara","Tamia","Tania","Tanner","Tanya","Tara","Taryn","Tate","Tatum","Tatyana","Taurean","Tavares","Taya","Taylor","Teagan","Ted","Telly","Terence","Teresa","Terrance","Terrell","Terrence","Terrill","Terry","Tess","Tessie","Tevin","Thad","Thaddeus","Thalia","Thea","Thelma","Theo","Theodora","Theodore","Theresa","Therese","Theresia","Theron","Thomas","Thora","Thurman","Tia","Tiana","Tianna","Tiara","Tierra","Tiffany","Tillman","Timmothy","Timmy","Timothy","Tina","Tito","Titus","Tobin","Toby","Tod","Tom","Tomas","Tomasa","Tommie","Toney","Toni","Tony","Torey","Torrance","Torrey","Toy","Trace","Tracey","Tracy","Travis","Travon","Tre","Tremaine","Tremayne","Trent","Trenton","Tressa","Tressie","Treva","Trever","Trevion","Trevor","Trey","Trinity","Trisha","Tristian","Tristin","Triston","Troy","Trudie","Trycia","Trystan","Turner","Twila","Tyler","Tyra","Tyree","Tyreek","Tyrel","Tyrell","Tyrese","Tyrique","Tyshawn","Tyson","Ubaldo","Ulices","Ulises","Una","Unique","Urban","Uriah","Uriel","Ursula","Vada","Valentin","Valentina","Valentine","Valerie","Vallie","Van","Vance","Vanessa","Vaughn","Veda","Velda","Vella","Velma","Velva","Vena","Verda","Verdie","Vergie","Verla","Verlie","Vern","Verna","Verner","Vernice","Vernie","Vernon","Verona","Veronica","Vesta","Vicenta","Vicente","Vickie","Vicky","Victor","Victoria","Vida","Vidal","Vilma","Vince","Vincent","Vincenza","Vincenzo","Vinnie","Viola","Violet","Violette","Virgie","Virgil","Virginia","Virginie","Vita","Vito","Viva","Vivian","Viviane","Vivianne","Vivien","Vivienne","Vladimir","Wade","Waino","Waldo","Walker","Wallace","Walter","Walton","Wanda","Ward","Warren","Watson","Wava","Waylon","Wayne","Webster","Weldon","Wellington","Wendell","Wendy","Werner","Westley","Weston","Whitney","Wilber","Wilbert","Wilburn","Wiley","Wilford","Wilfred","Wilfredo","Wilfrid","Wilhelm","Wilhelmine","Will","Willa","Willard","William","Willie","Willis","Willow","Willy","Wilma","Wilmer","Wilson","Wilton","Winfield","Winifred","Winnifred","Winona","Winston","Woodrow","Wyatt","Wyman","Xander","Xavier","Xzavier","Yadira","Yasmeen","Yasmin","Yasmine","Yazmin","Yesenia","Yessenia","Yolanda","Yoshiko","Yvette","Yvonne","Zachariah","Zachary","Zachery","Zack","Zackary","Zackery","Zakary","Zander","Zane","Zaria","Zechariah","Zelda","Zella","Zelma","Zena","Zetta","Zion","Zita","Zoe","Zoey","Zoie","Zoila","Zola","Zora","Zul"];exports.last_name = ["Abbott","Abernathy","Abshire","Adams","Altenwerth","Anderson","Ankunding","Armstrong","Auer","Aufderhar","Bahringer","Bailey","Balistreri","Barrows","Bartell","Bartoletti","Barton","Bashirian","Batz","Bauch","Baumbach","Bayer","Beahan","Beatty","Bechtelar","Becker","Bednar","Beer","Beier","Berge","Bergnaum","Bergstrom","Bernhard","Bernier","Bins","Blanda","Blick","Block","Bode","Boehm","Bogan","Bogisich","Borer","Bosco","Botsford","Boyer","Boyle","Bradtke","Brakus","Braun","Breitenberg","Brekke","Brown","Bruen","Buckridge","Carroll","Carter","Cartwright","Casper","Cassin","Champlin","Christiansen","Cole","Collier","Collins","Conn","Connelly","Conroy","Considine","Corkery","Cormier","Corwin","Cremin","Crist","Crona","Cronin","Crooks","Cruickshank","Cummerata","Cummings","Dach","D'Amore","Daniel","Dare","Daugherty","Davis","Deckow","Denesik","Dibbert","Dickens","Dicki","Dickinson","Dietrich","Donnelly","Dooley","Douglas","Doyle","DuBuque","Durgan","Ebert","Effertz","Eichmann","Emard","Emmerich","Erdman","Ernser","Fadel","Fahey","Farrell","Fay","Feeney","Feest","Feil","Ferry","Fisher","Flatley","Frami","Franecki","Friesen","Fritsch","Funk","Gaylord","Gerhold","Gerlach","Gibson","Gislason","Gleason","Gleichner","Glover","Goldner","Goodwin","Gorczany","Gottlieb","Goyette","Grady","Graham","Grant","Green","Greenfelder","Greenholt","Grimes","Gulgowski","Gusikowski","Gutkowski","Guªann","Haag","Hackett","Hagenes","Hahn","Haley","Halvorson","Hamill","Hammes","Hand","Hane","Hansen","Harber","Harris","Harªann","Harvey","Hauck","Hayes","Heaney","Heathcote","Hegmann","Heidenreich","Heller","Herman","Hermann","Hermiston","Herzog","Hessel","Hettinger","Hickle","Hilll","Hills","Hilpert","Hintz","Hirthe","Hodkiewicz","Hoeger","Homenick","Hoppe","Howe","Howell","Hudson","Huel","Huels","Hyatt","Jacobi","Jacobs","Jacobson","Jakubowski","Jaskolski","Jast","Jenkins","Jerde","Jewess","Johns","Johnson","Johnston","Jones","Kassulke","Kautzer","Keebler","Keeling","Kemmer","Kerluke","Kertzmann","Kessler","Kiehn","Kihn","Kilback","King","Kirlin","Klein","Kling","Klocko","Koch","Koelpin","Koepp","Kohler","Konopelski","Koss","Kovacek","Kozey","Krajcik","Kreiger","Kris","Kshlerin","Kub","Kuhic","Kuhlman","Kuhn","Kulas","Kunde","Kunze","Kuphal","Kutch","Kuvalis","Labadie","Lakin","Lang","Langosh","Langworth","Larkin","Larson","Leannon","Lebsack","Ledner","Leffler","Legros","Lehner","Lemke","Lesch","Leuschke","Lind","Lindgren","Littel","Little","Lockman","Lowe","Lubowitz","Lueilwitz","Luettgen","Lynch","Macejkovic","Maggio","Mann","Mante","Marks","Marquardt","Marvin","Mayer","Mayert","McClure","McCullough","McDermott","McGlynn","McKenzie","McLaughlin","Medhurst","Mertz","Metz","Miller","Mills","Mitchell","Moen","Mohr","Monahan","Moore","Morar","Morissette","Mosciski","Mraz","Mueller","Muller","Murazik","Murphy","Murray","Nader","Nicolas","Nienow","Nikolaus","Nitzsche","Nolan","Oberbrunner","O'Connell","O'Conner","O'Hara","O'Keefe","O'Kon","Okuneva","Olson","Ondricka","O'Reilly","Orn","Ortiz","Osinski","Pacocha","Padberg","Pagac","Parisian","Parker","Paucek","Pfannerstill","Pfeffer","Pollich","Pouros","Powlowski","Predovic","Price","Prohaska","Prosacco","Purdy","Quigley","Quitzon","Rath","Ratke","Rau","Raynor","Reichel","Reichert","Reilly","Reinger","Rempel","Renner","Reynolds","Rice","Rippin","Ritchie","Robel","Roberts","Rodriguez","Rogahn","Rohan","Rolfson","Romaguera","Roob","Rosenbaum","Rowe","Ruecker","Runolfsdottir","Runolfsson","Runte","Russel","Rutherford","Ryan","Sanford","Satterfield","Sauer","Sawayn","Schaden","Schaefer","Schamberger","Schiller","Schimmel","Schinner","Schmeler","Schmidt","Schmitt","Schneider","Schoen","Schowalter","Schroeder","Schulist","Schultz","Schumm","Schuppe","Schuster","Senger","Shanahan","Shields","Simonis","Sipes","Skiles","Smith","Smitham","Spencer","Spinka","Sporer","Stamm","Stanton","Stark","Stehr","Steuber","Stiedemann","Stokes","Stoltenberg","Stracke","Streich","Stroman","Strosin","Swaniawski","Swift","Terry","Thiel","Thompson","Tillman","Torp","Torphy","Towne","Toy","Trantow","Tremblay","Treutel","Tromp","Turcotte","Turner","Ullrich","Upton","Vandervort","Veum","Volkman","Von","VonRueden","Waelchi","Walker","Walsh","Walter","Ward","Waters","Watsica","Weber","Wehner","Weimann","Weissnat","Welch","West","White","Wiegand","Wilderman","Wilkinson","Will","Williamson","Willms","Windler","Wintheiser","Wisoky","Wisozk","Witting","Wiza","Wolf","Wolff","Wuckert","Wunsch","Wyman","Yost","Yundt","Zboncak","Zemlak","Ziemann","Zieme","Zulauf"];exports.name_prefix = ["Mr.","Mrs.","Ms.","Miss","Dr."];exports.name_suffix = ["Jr.","Sr.","I","II","III","IV","V","MD","DDS","PhD","DVM"]; // address.js definitions
exports.br_state = ['Acre','Alagoas','Amapá','Amazonas','Bahia','Ceará','Distrito Federal','Espírito Santo','Goiás','Maranhão','Mato Grosso','Mato Grosso do Sul','Minas Gerais','Paraná','Paraíba','Pará','Pernambuco','Piauí','Rio de Janeiro','Rio Grande do Norte','Rio Grande do Sul','Rondônia','Roraima','Santa Catarina','Sergipe','São Paulo','Tocantins'];exports.br_state_abbr = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PR','PB','PA','PE','PI','RJ','RN','RS','RO','RR','SC','SE','SP','TO'];exports.us_state = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];exports.us_state_abbr = ["AL","AK","AS","AZ","AR","CA","CO",'CT',"DE","DC","FM","FL","GA","GU","HI","ID","IL","IN","IA","KS","KY","LA","ME","MH","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","MP","OH","OK","OR","PW","PA","PR","RI","SC","SD","TN","TX","UT","VT","VI","VA","WA","WV","WI","WY","AE","AA","AP"];exports.city_prefix = ["North","East","West","South","New","Lake","Port"];exports.city_suffix = ["town","ton","land","ville","berg","burgh","borough","bury","view","port","mouth","stad","furt","chester","mouth","fort","haven","side","shire"];exports.street_suffix = ["Alley","Avenue","Branch","Bridge","Brook","Brooks","Burg","Burgs","Bypass","Camp","Canyon","Cape","Causeway","Center","Centers","Circle","Circles","Cliff","Cliffs","Club","Common","Corner","Corners","Course","Court","Courts","Cove","Coves","Creek","Crescent","Crest","Crossing","Crossroad","Curve","Dale","Dam","Divide","Drive","Drive","Drives","Estate","Estates","Expressway","Extension","Extensions","Fall","Falls","Ferry","Field","Fields","Flat","Flats","Ford","Fords","Forest","Forge","Forges","Fork","Forks","Fort","Freeway","Garden","Gardens","Gateway","Glen","Glens","Green","Greens","Grove","Groves","Harbor","Harbors","Haven","Heights","Highway","Hill","Hills","Hollow","Inlet","Inlet","Island","Island","Islands","Islands","Isle","Isle","Junction","Junctions","Key","Keys","Knoll","Knolls","Lake","Lakes","Land","Landing","Lane","Light","Lights","Loaf","Lock","Locks","Locks","Lodge","Lodge","Loop","Mall","Manor","Manors","Meadow","Meadows","Mews","Mill","Mills","Mission","Mission","Motorway","Mount","Mountain","Mountain","Mountains","Mountains","Neck","Orchard","Oval","Overpass","Park","Parks","Parkway","Parkways","Pass","Passage","Path","Pike","Pine","Pines","Place","Plain","Plains","Plains","Plaza","Plaza","Point","Points","Port","Port","Ports","Ports","Prairie","Prairie","Radial","Ramp","Ranch","Rapid","Rapids","Rest","Ridge","Ridges","River","Road","Road","Roads","Roads","Route","Row","Rue","Run","Shoal","Shoals","Shore","Shores","Skyway","Spring","Springs","Springs","Spur","Spurs","Square","Square","Squares","Squares","Station","Station","Stravenue","Stravenue","Stream","Stream","Street","Street","Streets","Summit","Summit","Terrace","Throughway","Trace","Track","Trafficway","Trail","Trail","Tunnel","Tunnel","Turnpike","Turnpike","Underpass","Union","Unions","Valley","Valleys","Via","Viaduct","View","Views","Village","Village","","Villages","Ville","Vista","Vista","Walk","Walks","Wall","Way","Ways","Well","Wells"];exports.uk_county = ['Avon','Bedfordshire','Berkshire','Borders','Buckinghamshire','Cambridgeshire','Central','Cheshire','Cleveland','Clwyd','Cornwall','County Antrim','County Armagh','County Down','County Fermanagh','County Londonderry','County Tyrone','Cumbria','Derbyshire','Devon','Dorset','Dumfries and Galloway','Durham','Dyfed','East Sussex','Essex','Fife','Gloucestershire','Grampian','Greater Manchester','Gwent','Gwynedd County','Hampshire','Herefordshire','Hertfordshire','Highlands and Islands','Humberside','Isle of Wight','Kent','Lancashire','Leicestershire','Lincolnshire','Lothian','Merseyside','Mid Glamorgan','Norfolk','North Yorkshire','Northamptonshire','Northumberland','Nottinghamshire','Oxfordshire','Powys','Rutland','Shropshire','Somerset','South Glamorgan','South Yorkshire','Staffordshire','Strathclyde','Suffolk','Surrey','Tayside','Tyne and Wear','Warwickshire','West Glamorgan','West Midlands','West Sussex','West Yorkshire','Wiltshire','Worcestershire'];exports.uk_country = ['England','Scotland','Wales','Northern Ireland']; // internet.js definitions
exports.catch_phrase_adjective = ["Adaptive","Advanced","Ameliorated","Assimilated","Automated","Balanced","Business-focused","Centralized","Cloned","Compatible","Configurable","Cross-group","Cross-platform","Customer-focused","Customizable","Decentralized","De-engineered","Devolved","Digitized","Distributed","Diverse","Down-sized","Enhanced","Enterprise-wide","Ergonomic","Exclusive","Expanded","Extended","Face to face","Focused","Front-line","Fully-configurable","Function-based","Fundamental","Future-proofed","Grass-roots","Horizontal","Implemented","Innovative","Integrated","Intuitive","Inverse","Managed","Mandatory","Monitored","Multi-channelled","Multi-lateral","Multi-layered","Multi-tiered","Networked","Object-based","Open-architected","Open-source","Operative","Optimized","Optional","Organic","Organized","Persevering","Persistent","Phased","Polarised","Pre-emptive","Proactive","Profit-focused","Profound","Programmable","Progressive","Public-key","Quality-focused","Reactive","Realigned","Re-contextualized","Re-engineered","Reduced","Reverse-engineered","Right-sized","Robust","Seamless","Secured","Self-enabling","Sharable","Stand-alone","Streamlined","Switchable","Synchronised","Synergistic","Synergized","Team-oriented","Total","Triple-buffered","Universal","Up-sized","Upgradable","User-centric","User-friendly","Versatile","Virtual","Visionary","Vision-oriented"];exports.catch_phrase_descriptor = ["24 hour","24/7","3rd generation","4th generation","5th generation","6th generation","actuating","analyzing","assymetric","asynchronous","attitude-oriented","background","bandwidth-monitored","bi-directional","bifurcated","bottom-line","clear-thinking","client-driven","client-server","coherent","cohesive","composite","context-sensitive","contextually-based","content-based","dedicated","demand-driven","didactic","directional","discrete","disintermediate","dynamic","eco-centric","empowering","encompassing","even-keeled","executive","explicit","exuding","fault-tolerant","foreground","fresh-thinking","full-range","global","grid-enabled","heuristic","high-level","holistic","homogeneous","human-resource","hybrid","impactful","incremental","intangible","interactive","intermediate","leading edge","local","logistical","maximized","methodical","mission-critical","mobile","modular","motivating","multimedia","multi-state","multi-tasking","national","needs-based","neutral","next generation","non-volatile","object-oriented","optimal","optimizing","radical","real-time","reciprocal","regional","responsive","scalable","secondary","solution-oriented","stable","static","systematic","systemic","system-worthy","tangible","tertiary","transitional","uniform","upward-trending","user-facing","value-added","web-enabled","well-modulated","zero administration","zero defect","zero tolerance"];exports.catch_phrase_noun = ["ability","access","adapter","algorithm","alliance","analyzer","application","approach","architecture","archive","artificial intelligence","array","attitude","benchmark","budgetary management","capability","capacity","challenge","circuit","collaboration","complexity","concept","conglomeration","contingency","core","customer loyalty","database","data-warehouse","definition","emulation","encoding","encryption","extranet","firmware","flexibility","focus group","forecast","frame","framework","function","functionalities","Graphic Interface","groupware","Graphical User Interface","hardware","help-desk","hierarchy","hub","implementation","info-mediaries","infrastructure","initiative","installation","instruction set","interface","internet solution","intranet","knowledge user","knowledge base","local area network","leverage","matrices","matrix","methodology","middleware","migration","model","moderator","monitoring","moratorium","neural-net","open architecture","open system","orchestration","paradigm","parallelism","policy","portal","pricing structure","process improvement","product","productivity","project","projection","protocol","secured line","service-desk","software","solution","standardization","strategy","structure","success","superstructure","support","synergy","system engine","task-force","throughput","time-frame","toolset","utilisation","website","workforce"];exports.bs_adjective = ["implement","utilize","integrate","streamline","optimize","evolve","transform","embrace","enable","orchestrate","leverage","reinvent","aggregate","architect","enhance","incentivize","morph","empower","envisioneer","monetize","harness","facilitate","seize","disintermediate","synergize","strategize","deploy","brand","grow","target","syndicate","synthesize","deliver","mesh","incubate","engage","maximize","benchmark","expedite","reintermediate","whiteboard","visualize","repurpose","innovate","scale","unleash","drive","extend","engineer","revolutionize","generate","exploit","transition","e-enable","iterate","cultivate","matrix","productize","redefine","recontextualize"];exports.bs_buzz = ["clicks-and-mortar","value-added","vertical","proactive","robust","revolutionary","scalable","leading-edge","innovative","intuitive","strategic","e-business","mission-critical","sticky","one-to-one","24/7","end-to-end","global","B2B","B2C","granular","frictionless","virtual","viral","dynamic","24/365","best-of-breed","killer","magnetic","bleeding-edge","web-enabled","interactive","dot-com","sexy","back-end","real-time","efficient","front-end","distributed","seamless","extensible","turn-key","world-class","open-source","cross-platform","cross-media","synergistic","bricks-and-clicks","out-of-the-box","enterprise","integrated","impactful","wireless","transparent","next-generation","cutting-edge","user-centric","visionary","customized","ubiquitous","plug-and-play","collaborative","compelling","holistic","rich"];exports.bs_noun = ["synergies","web-readiness","paradigms","markets","partnerships","infrastructures","platforms","initiatives","channels","eyeballs","communities","ROI","solutions","e-tailers","e-services","action-items","portals","niches","technologies","content","vortals","supply-chains","convergence","relationships","architectures","interfaces","e-markets","e-commerce","systems","bandwidth","infomediaries","models","mindshare","deliverables","users","schemas","networks","applications","metrics","e-business","functionalities","experiences","web services","methodologies"];exports.domain_suffix = ["co.uk","com","us","net","ca","biz","info","name","io","org","biz","tv","me"]; // lorem.js definitions
exports.lorem = ["alias","consequatur","aut","perferendis","sit","voluptatem","accusantium","doloremque","aperiam","eaque","ipsa","quae","ab","illo","inventore","veritatis","et","quasi","architecto","beatae","vitae","dicta","sunt","explicabo","aspernatur","aut","odit","aut","fugit","sed","quia","consequuntur","magni","dolores","eos","qui","ratione","voluptatem","sequi","nesciunt","neque","dolorem","ipsum","quia","dolor","sit","amet","consectetur","adipisci","velit","sed","quia","non","numquam","eius","modi","tempora","incidunt","ut","labore","et","dolore","magnam","aliquam","quaerat","voluptatem","ut","enim","ad","minima","veniam","quis","nostrum","exercitationem","ullam","corporis","nemo","enim","ipsam","voluptatem","quia","voluptas","sit","suscipit","laboriosam","nisi","ut","aliquid","ex","ea","commodi","consequatur","quis","autem","vel","eum","iure","reprehenderit","qui","in","ea","voluptate","velit","esse","quam","nihil","molestiae","et","iusto","odio","dignissimos","ducimus","qui","blanditiis","praesentium","laudantium","totam","rem","voluptatum","deleniti","atque","corrupti","quos","dolores","et","quas","molestias","excepturi","sint","occaecati","cupiditate","non","provident","sed","ut","perspiciatis","unde","omnis","iste","natus","error","similique","sunt","in","culpa","qui","officia","deserunt","mollitia","animi","id","est","laborum","et","dolorum","fuga","et","harum","quidem","rerum","facilis","est","et","expedita","distinctio","nam","libero","tempore","cum","soluta","nobis","est","eligendi","optio","cumque","nihil","impedit","quo","porro","quisquam","est","qui","minus","id","quod","maxime","placeat","facere","possimus","omnis","voluptas","assumenda","est","omnis","dolor","repellendus","temporibus","autem","quibusdam","et","aut","consequatur","vel","illum","qui","dolorem","eum","fugiat","quo","voluptas","nulla","pariatur","at","vero","eos","et","accusamus","officiis","debitis","aut","rerum","necessitatibus","saepe","eveniet","ut","et","voluptates","repudiandae","sint","et","molestiae","non","recusandae","itaque","earum","rerum","hic","tenetur","a","sapiente","delectus","ut","aut","reiciendis","voluptatibus","maiores","doloribus","asperiores","repellat"]; // phone_number.js definitions
exports.phone_formats = ['###-###-####','(###)###-####','1-###-###-####','###.###.####','###-###-####','(###)###-####','1-###-###-####','###.###.####','###-###-#### x###','(###)###-#### x###','1-###-###-#### x###','###.###.#### x###','###-###-#### x####','(###)###-#### x####','1-###-###-#### x####','###.###.#### x####','###-###-#### x#####','(###)###-#### x#####','1-###-###-#### x#####','###.###.#### x#####']; //All this avatar have been authorized by its awesome users to be use on live websites (not just mockups)
//For more information, please visit: http://uifaces.com/authorized
exports.avatar_uri = ["https://s3.amazonaws.com/uifaces/faces/twitter/jarjan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mahdif/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sprayaga/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ruzinav/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/Skyhartman/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/moscoz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kurafire/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/91bilal/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/igorgarybaldi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/calebogden/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/malykhinv/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joelhelin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kushsolitary/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/coreyweb/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/snowshade/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/areus/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/holdenweb/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/heyimjuani/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/envex/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/unterdreht/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/collegeman/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/peejfancher/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/andyisonline/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ultragex/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/fuck_you_two/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ateneupopular/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ahmetalpbalkan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/Stievius/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kerem/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/osvaldas/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/angelceballos/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thierrykoblentz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/peterlandt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/catarino/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/wr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/weglov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/brandclay/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/flame_kaizar/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ahmetsulek/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nicolasfolliot/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jayrobinson/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/victorerixon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kolage/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/michzen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/markjenkins/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nicolai_larsen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/noxdzine/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/alagoon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/idiot/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mizko/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chadengle/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mutlu82/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/simobenso/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vocino/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/guiiipontes/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/soyjavi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joshaustin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tomaslau/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/VinThomas/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ManikRathee/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/langate/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cemshid/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/leemunroe/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/_shahedk/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/enda/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/BillSKenney/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/divya/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joshhemsley/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sindresorhus/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/soffes/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/9lessons/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/linux29/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/Chakintosh/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/anaami/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joreira/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/shadeed9/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/scottkclark/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jedbridges/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/salleedesign/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/marakasina/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ariil/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/BrianPurkiss/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/michaelmartinho/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bublienko/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/devankoshal/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ZacharyZorbas/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/timmillwood/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joshuasortino/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/damenleeturks/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tomas_janousek/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/herrhaase/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/RussellBishop/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/brajeshwar/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nachtmeister/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cbracco/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bermonpainter/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/abdullindenis/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/isacosta/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/suprb/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/yalozhkin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chandlervdw/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/iamgarth/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/_victa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/commadelimited/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/roybarberuk/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/axel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vladarbatov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ffbel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/syropian/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ankitind/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/traneblow/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/flashmurphy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ChrisFarina78/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/baliomega/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/saschamt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jm_denis/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/anoff/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kennyadr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chatyrko/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dingyi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mds/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/terryxlife/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aaroni/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kinday/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/prrstn/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/eduardostuart/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dhilipsiva/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/GavicoInd/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/baires/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rohixx/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bigmancho/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/blakesimkins/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/leeiio/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tjrus/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/uberschizo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kylefoundry/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/claudioguglieri/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ripplemdk/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/exentrich/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jakemoore/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joaoedumedeiros/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/poormini/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tereshenkov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/keryilmaz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/haydn_woods/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rude/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/llun/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sgaurav_baghel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jamiebrittain/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/badlittleduck/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/pifagor/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/agromov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/benefritz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/erwanhesry/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/diesellaws/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jeremiaha/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/koridhandy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chaensel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/andrewcohen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/smaczny/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gonzalorobaina/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nandini_m/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sydlawrence/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cdharrison/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tgerken/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lewisainslie/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/charliecwaite/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/robbschiller/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/flexrs/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mattdetails/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/raquelwilson/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/karsh/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mrmartineau/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/opnsrce/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hgharrygo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/maximseshuk/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/uxalex/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/samihah/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chanpory/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sharvin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/josemarques/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jefffis/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/krystalfister/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lokesh_coder/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thedamianhdez/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dpmachado/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/funwatercat/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/timothycd/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ivanfilipovbg/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/picard102/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/marcobarbosa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/krasnoukhov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/g3d/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ademilter/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rickdt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/operatino/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bungiwan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hugomano/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/logorado/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dc_user/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/horaciobella/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/SlaapMe/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/teeragit/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/iqonicd/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ilya_pestov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/andrewarrow/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ssiskind/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/stan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/HenryHoffman/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rdsaunders/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/adamsxu/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/curiousoffice/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/themadray/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/michigangraham/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kohette/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nickfratter/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/runningskull/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/madysondesigns/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/brenton_clarke/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jennyshen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bradenhamm/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kurtinc/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/amanruzaini/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/coreyhaggard/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/Karimmove/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aaronalfred/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/wtrsld/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jitachi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/therealmarvin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/pmeissner/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ooomz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chacky14/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jesseddy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thinmatt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/shanehudson/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/akmur/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/IsaryAmairani/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/arthurholcombe1/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/andychipster/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/boxmodel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ehsandiary/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/LucasPerdidao/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/shalt0ni/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/swaplord/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kaelifa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/plbabin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/guillemboti/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/arindam_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/renbyrd/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thiagovernetti/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jmillspaysbills/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mikemai2awesome/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jervo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mekal/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sta1ex/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/robergd/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/felipecsl/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/andrea211087/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/garand/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dhooyenga/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/abovefunction/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/pcridesagain/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/randomlies/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/BryanHorsey/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/heykenneth/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dahparra/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/allthingssmitty/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/danvernon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/beweinreich/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/increase/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/falvarad/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/alxndrustinov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/souuf/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/orkuncaylar/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/AM_Kn2/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gearpixels/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bassamology/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vimarethomas/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kosmar/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/SULiik/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mrjamesnoble/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/silvanmuhlemann/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/shaneIxD/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nacho/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/yigitpinarbasi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/buzzusborne/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aaronkwhite/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rmlewisuk/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/giancarlon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nbirckel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/d_nny_m_cher/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sdidonato/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/atariboy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/abotap/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/karalek/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/psdesignuk/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ludwiczakpawel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nemanjaivanovic/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/baluli/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ahmadajmi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vovkasolovev/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/samgrover/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/derienzo777/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jonathansimmons/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nelsonjoyce/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/S0ufi4n3/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/xtopherpaul/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/oaktreemedia/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nateschulte/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/findingjenny/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/namankreative/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/antonyzotov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/we_social/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/leehambley/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/solid_color/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/abelcabans/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mbilderbach/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kkusaa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jordyvdboom/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/carlosgavina/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/pechkinator/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vc27/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rdbannon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/croakx/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/suribbles/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kerihenare/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/catadeleon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gcmorley/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/duivvv/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/saschadroste/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/victorDubugras/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/wintopia/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mattbilotti/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/taylorling/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/megdraws/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/meln1ks/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mahmoudmetwally/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/Silveredge9/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/derekebradley/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/happypeter1983/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/travis_arnold/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/artem_kostenko/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/adobi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/daykiine/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/alek_djuric/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/scips/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/miguelmendes/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/justinrhee/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/alsobrooks/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/fronx/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mcflydesign/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/santi_urso/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/allfordesign/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/stayuber/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bertboerland/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/marosholly/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/adamnac/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cynthiasavard/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/muringa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/danro/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hiemil/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jackiesaik/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/zacsnider/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/iduuck/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/antjanus/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aroon_sharma/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dshster/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thehacker/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/michaelbrooksjr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ryanmclaughlin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/clubb3rry/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/taybenlor/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/xripunov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/myastro/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/adityasutomo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/digitalmaverick/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hjartstrorn/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/itolmach/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vaughanmoffitt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/abdots/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/isnifer/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sergeysafonov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/maz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/scrapdnb/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chrismj83/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vitorleal/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sokaniwaal/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/zaki3d/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/illyzoren/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mocabyte/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/osmanince/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/djsherman/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/davidhemphill/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/waghner/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/necodymiconer/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/praveen_vijaya/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/fabbrucci/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cliffseal/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/travishines/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kuldarkalvik/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/Elt_n/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/phillapier/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/okseanjay/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/id835559/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kudretkeskin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/anjhero/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/duck4fuck/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/scott_riley/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/noufalibrahim/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/h1brd/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/borges_marcos/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/devinhalladay/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ciaranr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/stefooo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mikebeecham/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tonymillion/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joshuaraichur/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/irae/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/petrangr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dmitriychuta/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/charliegann/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/arashmanteghi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ainsleywagon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/svenlen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/faisalabid/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/beshur/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/carlyson/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dutchnadia/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/teddyzetterlund/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/samuelkraft/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aoimedia/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/toddrew/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/codepoet_ru/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/artvavs/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/benoitboucart/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jomarmen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kolmarlopez/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/creartinc/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/homka/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gaborenton/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/robinclediere/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/maximsorokin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/plasticine/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/j2deme/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/peachananr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kapaluccio/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/de_ascanio/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rikas/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dawidwu/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/marcoramires/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/angelcreative/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rpatey/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/popey/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rehatkathuria/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/the_purplebunny/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/1markiz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ajaxy_ru/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/brenmurrell/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dudestein/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/oskarlevinson/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/victorstuber/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nehfy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vicivadeline/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/leandrovaranda/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/scottgallant/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/victor_haydin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sawrb/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ryhanhassan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/amayvs/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/a_brixen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/karolkrakowiak_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/herkulano/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/geran7/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cggaurav/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chris_witko/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lososina/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/polarity/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mattlat/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/brandonburke/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/constantx/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/teylorfeliz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/craigelimeliah/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rachelreveley/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/reabo101/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rahmeen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ky/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rickyyean/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/j04ntoh/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/spbroma/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sebashton/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jpenico/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/francis_vega/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/oktayelipek/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kikillo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/fabbianz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/larrygerard/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/BroumiYoussef/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/0therplanet/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mbilalsiddique1/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ionuss/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/grrr_nl/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/liminha/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rawdiggie/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ryandownie/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sethlouey/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/pixage/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/arpitnj/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/switmer777/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/josevnclch/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kanickairaj/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/puzik/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tbakdesigns/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/besbujupi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/supjoey/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lowie/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/linkibol/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/balintorosz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/imcoding/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/agustincruiz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gusoto/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thomasschrijer/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/superoutman/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kalmerrautam/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gabrielizalo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gojeanyn/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/davidbaldie/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/_vojto/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/laurengray/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jydesign/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mymyboy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nellleo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/marciotoledo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ninjad3m0/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/to_soham/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hasslunsford/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/muridrahhal/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/levisan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/grahamkennery/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lepetitogre/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/antongenkin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nessoila/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/amandabuzard/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/safrankov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cocolero/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dss49/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/matt3224/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bluesix/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/quailandquasar/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/AlbertoCococi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lepinski/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sementiy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mhudobivnik/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thibaut_re/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/olgary/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/shojberg/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mtolokonnikov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bereto/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/naupintos/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/wegotvices/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/xadhix/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/macxim/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rodnylobos/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/madcampos/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/madebyvadim/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bartoszdawydzik/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/supervova/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/markretzloff/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vonachoo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/darylws/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/stevedesigner/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mylesb/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/herbigt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/depaulawagner/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/geshan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gizmeedevil1991/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/_scottburgess/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lisovsky/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/davidsasda/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/artd_sign/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/YoungCutlass/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mgonto/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/itstotallyamy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/victorquinn/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/osmond/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/oksanafrewer/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/zauerkraut/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/iamkeithmason/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nitinhayaran/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lmjabreu/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mandalareopens/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thinkleft/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ponchomendivil/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/juamperro/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/brunodesign1206/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/caseycavanagh/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/luxe/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dotgridline/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/spedwig/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/madewulf/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mattsapii/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/helderleal/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chrisstumph/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jayphen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nsamoylov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chrisvanderkooi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/justme_timothyg/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/otozk/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/prinzadi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gu5taf/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cyril_gaillard/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/d_kobelyatsky/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/daniloc/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nwdsha/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/romanbulah/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/skkirilov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dvdwinden/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dannol/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thekevinjones/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jwalter14/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/timgthomas/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/buddhasource/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/uxpiper/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thatonetommy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/diansigitp/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/adrienths/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/klimmka/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gkaam/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/derekcramer/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jennyyo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nerrsoft/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/xalionmalik/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/edhenderson/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/keyuri85/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/roxanejammet/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kimcool/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/edkf/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/matkins/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/alessandroribe/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jacksonlatka/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lebronjennan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kostaspt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/karlkanall/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/moynihan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/danpliego/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/saulihirvi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/wesleytrankin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/fjaguero/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bowbrick/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mashaaaaal/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/yassiryahya/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dparrelli/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/fotomagin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aka_james/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/denisepires/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/iqbalperkasa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/martinansty/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jarsen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/r_oy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/justinrob/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gabrielrosser/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/malgordon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/carlfairclough/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/michaelabehsera/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/pierrestoffe/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/enjoythetau/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/loganjlambert/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rpeezy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/coreyginnivan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/michalhron/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/msveet/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lingeswaran/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kolsvein/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/peter576/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/reideiredale/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joeymurdah/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/raphaelnikson/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mvdheuvel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/maxlinderman/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jimmuirhead/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/begreative/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/frankiefreesbie/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/robturlinckx/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/Talbi_ConSept/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/longlivemyword/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vanchesz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/maiklam/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hermanobrother/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rez___a/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gregsqueeb/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/greenbes/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/_ragzor/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/anthonysukow/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/fluidbrush/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dactrtr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jehnglynn/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bergmartin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hugocornejo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/_kkga/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dzantievm/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sawalazar/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sovesove/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jonsgotwood/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/byryan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vytautas_a/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mizhgan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cicerobr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nilshelmersson/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/d33pthought/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/davecraige/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nckjrvs/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/alexandermayes/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jcubic/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/craigrcoles/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bagawarman/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rob_thomas10/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cofla/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/maikelk/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rtgibbons/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/russell_baylis/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mhesslow/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/codysanfilippo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/webtanya/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/madebybrenton/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dcalonaci/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/perfectflow/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jjsiii/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/saarabpreet/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kumarrajan12123/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/iamsteffen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/themikenagle/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ceekaytweet/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/larrybolt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/conspirator/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dallasbpeters/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/n3dmax/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/terpimost/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kirillz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/byrnecore/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/j_drake_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/calebjoyce/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/russoedu/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hoangloi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tobysaxon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gofrasdesign/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dimaposnyy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tjisousa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/okandungel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/billyroshan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/oskamaya/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/motionthinks/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/knilob/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ashocka18/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/marrimo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bartjo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/omnizya/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ernestsemerda/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/andreas_pr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/edgarchris99/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thomasgeisen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gseguin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joannefournier/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/demersdesigns/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/adammarsbar/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nasirwd/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/n_tassone/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/javorszky/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/themrdave/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/yecidsm/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nicollerich/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/canapud/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nicoleglynn/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/judzhin_miles/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/designervzm/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kianoshp/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/evandrix/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/alterchuca/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dhrubo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ma_tiax/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ssbb_me/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dorphern/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mauriolg/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bruno_mart/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mactopus/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/the_winslet/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joemdesign/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/Shriiiiimp/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jacobbennett/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nfedoroff/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/iamglimy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/allagringaus/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aiiaiiaii/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/olaolusoga/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/buryaknick/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/wim1k/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nicklacke/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/a1chapone/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/steynviljoen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/strikewan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ryankirkman/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/andrewabogado/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/doooon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jagan123/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ariffsetiawan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/elenadissi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mwarkentin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thierrymeier_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/r_garcia/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dmackerman/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/borantula/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/konus/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/spacewood_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ryuchi311/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/evanshajed/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tristanlegros/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/shoaib253/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aislinnkelly/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/okcoker/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/timpetricola/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sunshinedgirl/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chadami/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aleclarsoniv/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nomidesigns/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/petebernardo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/scottiedude/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/millinet/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/imsoper/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/imammuht/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/benjamin_knight/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nepdud/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joki4/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lanceguyatt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bboy1895/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/amywebbb/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rweve/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/haruintesettden/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ricburton/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nelshd/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/batsirai/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/primozcigler/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jffgrdnr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/8d3k/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/geneseleznev/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/al_li/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/souperphly/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mslarkina/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/2fockus/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cdavis565/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/xiel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/turkutuuli/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/uxward/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lebinoclard/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gauravjassal/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/davidmerrique/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mdsisto/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/andrewofficer/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kojourin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dnirmal/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kevka/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mr_shiznit/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aluisio_azevedo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cloudstudio/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/danvierich/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/alexivanichkin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/fran_mchamy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/perretmagali/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/betraydan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cadikkara/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/matbeedotcom/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jeremyworboys/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bpartridge/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/michaelkoper/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/silv3rgvn/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/alevizio/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/johnsmithagency/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lawlbwoy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vitor376/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/desastrozo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thimo_cz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jasonmarkjones/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lhausermann/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/xravil/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/guischmitt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vigobronx/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/panghal0/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/miguelkooreman/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/surgeonist/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/christianoliff/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/caspergrl/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/iamkarna/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ipavelek/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/pierre_nel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/y2graphic/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sterlingrules/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/elbuscainfo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bennyjien/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/stushona/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/estebanuribe/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/embrcecreations/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/danillos/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/elliotlewis/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/charlesrpratt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vladyn/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/emmeffess/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/carlosblanco_eu/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/leonfedotov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rangafangs/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chris_frees/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tgormtx/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bryan_topham/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jpscribbles/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mighty55/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/carbontwelve/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/isaacfifth/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/iamjdeleon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/snowwrite/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/barputro/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/drewbyreese/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sachacorazzi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bistrianiosip/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/magoo04/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/pehamondello/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/yayteejay/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/a_harris88/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/algunsanabria/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/zforrester/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ovall/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/carlosjgsousa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/geobikas/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ah_lice/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/looneydoodle/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nerdgr8/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ddggccaa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/zackeeler/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/normanbox/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/el_fuertisimo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ismail_biltagi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/juangomezw/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jnmnrd/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/patrickcoombe/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ryanjohnson_me/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/markolschesky/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jeffgolenski/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kvasnic/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lindseyzilla/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gauchomatt/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/afusinatto/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kevinoh/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/okansurreel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/adamawesomeface/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/emileboudeling/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/arishi_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/juanmamartinez/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/wikiziner/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/danthms/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mkginfo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/terrorpixel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/curiousonaut/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/prheemo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/michaelcolenso/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/foczzi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/martip07/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thaodang17/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/johncafazza/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/robinlayfield/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/franciscoamk/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/abdulhyeuk/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/marklamb/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/edobene/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/andresenfredrik/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mikaeljorhult/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chrisslowik/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vinciarts/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/meelford/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/yehudab/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vijaykarthik/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bfrohs/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/josep_martins/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/attacks/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sur4dye/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tumski/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/instalox/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mangosango/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/paulfarino/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kazaky999/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kiwiupover/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nvkznemo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tom_even/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ratbus/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/woodsman001/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joshmedeski/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thewillbeard/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/psaikali/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joe_black/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aleinadsays/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/marcusgorillius/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hota_v/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jghyllebert/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/shinze/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/janpalounek/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jeremiespoken/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/her_ruu/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dansowter/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/felipeapiress/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/magugzbrand2d/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/posterjob/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nathalie_fs/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bobbytwoshoes/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dreizle/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jeremymouton/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/elisabethkjaer/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/notbadart/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mohanrohith/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jlsolerdeltoro/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/itskawsar/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/slowspock/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/zvchkelly/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/wiljanslofstra/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/craighenneberry/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/trubeatto/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/juaumlol/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/samscouto/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/BenouarradeM/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gipsy_raf/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/netonet_il/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/arkokoley/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/itsajimithing/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/smalonso/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/victordeanda/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/_dwite_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/richardgarretts/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gregrwilkinson/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/anatolinicolae/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lu4sh1i/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/stefanotirloni/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ostirbu/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/darcystonge/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/naitanamoreno/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/michaelcomiskey/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/adhiardana/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/marcomano_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/davidcazalis/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/falconerie/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gregkilian/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bcrad/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bolzanmarco/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/low_res/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vlajki/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/petar_prog/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jonkspr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/akmalfikri/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mfacchinello/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/atanism/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/harry_sistalam/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/murrayswift/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bobwassermann/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gavr1l0/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/madshensel/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mr_subtle/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/deviljho_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/salimianoff/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joetruesdell/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/twittypork/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/airskylar/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dnezkumar/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dgajjar/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cherif_b/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/salvafc/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/louis_currie/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/deeenright/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cybind/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/eyronn/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vickyshits/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sweetdelisa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/cboller1/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/andresdjasso/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/melvindidit/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/andysolomon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thaisselenator_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lvovenok/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/giuliusa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/belyaev_rs/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/overcloacked/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kamal_chaneman/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/incubo82/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hellofeverrrr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mhaligowski/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sunlandictwin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bu7921/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/andytlaw/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jeremery/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/finchjke/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/manigm/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/umurgdk/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/scottfeltham/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ganserene/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mutu_krish/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jodytaggart/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ntfblog/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tanveerrao/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hfalucas/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/alxleroydeval/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kucingbelang4/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bargaorobalo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/colgruv/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/stalewine/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kylefrost/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/baumannzone/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/angelcolberg/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sachingawas/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jjshaw14/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ramanathan_pdy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/johndezember/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nilshoenson/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/brandonmorreale/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nutzumi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/brandonflatsoda/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sergeyalmone/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/klefue/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kirangopal/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/baumann_alex/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/matthewkay_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jay_wilburn/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/shesgared/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/apriendeau/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/johnriordan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/wake_gs/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aleksitappura/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/emsgulam/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/xilantra/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/imomenui/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sircalebgrove/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/newbrushes/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hsinyo23/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/m4rio/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/katiemdaly/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/s4f1/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ecommerceil/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/marlinjayakody/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/swooshycueb/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sangdth/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/coderdiaz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bluefx_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vivekprvr/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sasha_shestakov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/eugeneeweb/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dgclegg/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/n1ght_coder/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dixchen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/blakehawksworth/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/trueblood_33/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hai_ninh_nguyen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/marclgonzales/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/yesmeck/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/stephcoue/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/doronmalki/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ruehldesign/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/anasnakawa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kijanmaharjan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/wearesavas/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/stefvdham/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tweetubhai/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/alecarpentier/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/fiterik/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/antonyryndya/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/d00maz/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/theonlyzeke/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/missaaamy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/carlosm/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/manekenthe/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/reetajayendra/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jeremyshimko/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/justinrgraham/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/stefanozoffoli/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/overra/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mrebay007/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/shvelo96/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/pyronite/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/thedjpetersen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/rtyukmaev/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/_williamguerra/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/albertaugustin/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vikashpathak18/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kevinjohndayy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vj_demien/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/colirpixoil/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/goddardlewis/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/laasli/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jqiuss/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/heycamtaylor/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nastya_mane/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mastermindesign/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ccinojasso1/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/nyancecom/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sandywoodruff/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/bighanddesign/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sbtransparent/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aviddayentonbay/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/richwild/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kaysix_dizzy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/tur8le/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/seyedhossein1/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/privetwagner/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/emmandenn/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dev_essentials/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jmfsocial/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/_yardenoon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mateaodviteza/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/weavermedia/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mufaddal_mw/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hafeeskhan/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ashernatali/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sulaqo/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/eddiechen/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/josecarlospsh/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vm_f/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/enricocicconi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/danmartin70/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/gmourier/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/donjain/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mrxloka/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/_pedropinho/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/eitarafa/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/oscarowusu/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ralph_lam/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/panchajanyag/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/woodydotmx/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/jerrybai1907/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/marshallchen_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/xamorep/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aio___/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/chaabane_wail/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/txcx/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/akashsharma39/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/falling_soul/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sainraja/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mugukamil/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/johannesneu/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/markwienands/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/karthipanraj/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/balakayuriy/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/alan_zhang_/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/layerssss/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/kaspernordkvist/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/mirfanqureshi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/hanna_smi/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/VMilescu/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/aeon56/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/m_kalibry/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/sreejithexp/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dicesales/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/dhoot_amit/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/smenov/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/lonesomelemon/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vladimirdevic/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/joelcipriano/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/haligaliharun/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/buleswapnil/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/serefka/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/ifarafonow/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/vikasvinfotech/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/urrutimeoli/128.jpg","https://s3.amazonaws.com/uifaces/faces/twitter/areandacom/128.jpg"];

},{}],7:[function(require,module,exports){
'use strict';

var Faker = require('../index');

// backword-compatibility
exports.randomNumber = function (range) {
    return Faker.random.number(range);
};

// backword-compatibility
exports.randomize = function (array) {
    return Faker.random.array_element(array);
};

// slugifies string
exports.slugify = function (string) {
    return string.replace(/ /g, '-').replace(/[^\w\.\-]+/g, '');
};

// parses string for a symbol and replace it with a random number from 1-10
exports.replaceSymbolWithNumber = function (string, symbol) {
    // default symbol is '#'
    if (symbol === undefined) {
        symbol = '#';
    }

    var str = '';
    for (var i = 0; i < string.length; i++) {
        if (string[i] == symbol) {
            str += Math.floor(Math.random() * 10);
        } else {
            str += string[i];
        }
    }
    return str;
};

// takes an array and returns it randomized
exports.shuffle = function (o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i, 10), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

exports.createCard = function () {
    return {
        "name": Faker.Name.findName(),
        "username": Faker.Internet.userName(),
        "email": Faker.Internet.email(),
        "address": {
            "streetA": Faker.Address.streetName(),
            "streetB": Faker.Address.streetAddress(),
            "streetC": Faker.Address.streetAddress(true),
            "streetD": Faker.Address.secondaryAddress(),
            "city": Faker.Address.city(),
            "ukCounty": Faker.Address.ukCounty(),
            "ukCountry": Faker.Address.ukCountry(),
            "zipcode": Faker.Address.zipCode(),
            "geo": {
                "lat": Faker.Address.latitude(),
                "lng": Faker.Address.longitude()
            }
        },
        "phone": Faker.PhoneNumber.phoneNumber(),
        "website": Faker.Internet.domainName(),
        "company": {
            "name": Faker.Company.companyName(),
            "catchPhrase": Faker.Company.catchPhrase(),
            "bs": Faker.Company.bs()
        },
        "posts": [{
            "words": Faker.Lorem.words(),
            "sentence": Faker.Lorem.sentence(),
            "sentences": Faker.Lorem.sentences(),
            "paragraph": Faker.Lorem.paragraph()
        }, {
            "words": Faker.Lorem.words(),
            "sentence": Faker.Lorem.sentence(),
            "sentences": Faker.Lorem.sentences(),
            "paragraph": Faker.Lorem.paragraph()
        }, {
            "words": Faker.Lorem.words(),
            "sentence": Faker.Lorem.sentence(),
            "sentences": Faker.Lorem.sentences(),
            "paragraph": Faker.Lorem.paragraph()
        }]
    };
};

exports.userCard = function () {
    return {
        "name": Faker.Name.findName(),
        "username": Faker.Internet.userName(),
        "email": Faker.Internet.email(),
        "address": {
            "street": Faker.Address.streetName(true),
            "suite": Faker.Address.secondaryAddress(),
            "city": Faker.Address.city(),
            "zipcode": Faker.Address.zipCode(),
            "geo": {
                "lat": Faker.Address.latitude(),
                "lng": Faker.Address.longitude()
            }
        },
        "phone": Faker.PhoneNumber.phoneNumber(),
        "website": Faker.Internet.domainName(),
        "company": {
            "name": Faker.Company.companyName(),
            "catchPhrase": Faker.Company.catchPhrase(),
            "bs": Faker.Company.bs()
        }
    };
};

/*
String.prototype.capitalize = function () { //v1.0
    return this.replace(/\w+/g, function (a) {
        return a.charAt(0).toUpperCase() + a.substr(1).toLowerCase();
    });
};
*/

},{"../index":2}],8:[function(require,module,exports){
'use strict';

var Faker = require('../index');

var image = {
  avatar: function avatar() {
    return Faker.random.avatar_uri();
  },
  imageUrl: function imageUrl(width, height, category) {
    var width = width || 640;
    var height = height || 480;

    var url = 'http://lorempixel.com/' + width + '/' + height;
    if (typeof category !== 'undefined') {
      url += '/' + category;
    }
    return url;
  },
  abstractImage: function abstractImage(width, height) {
    return this.imageUrl(width, height, 'abstract');
  },
  animals: function animals(width, height) {
    return this.imageUrl(width, height, 'animals');
  },
  business: function business(width, height) {
    return this.imageUrl(width, height, 'business');
  },
  cats: function cats(width, height) {
    return this.imageUrl(width, height, 'cats');
  },
  city: function city(width, height) {
    return this.imageUrl(width, height, 'city');
  },
  food: function food(width, height) {
    return this.imageUrl(width, height, 'food');
  },
  nightlife: function nightlife(width, height) {
    return this.imageUrl(width, height, 'nightlife');
  },
  fashion: function fashion(width, height) {
    return this.imageUrl(width, height, 'fashion');
  },
  people: function people(width, height) {
    return this.imageUrl(width, height, 'people');
  },
  nature: function nature(width, height) {
    return this.imageUrl(width, height, 'nature');
  },
  sports: function sports(width, height) {
    return this.imageUrl(width, height, 'sports');
  },
  technics: function technics(width, height) {
    return this.imageUrl(width, height, 'technics');
  },
  transport: function transport(width, height) {
    return this.imageUrl(width, height, 'transport');
  }
};

module.exports = image;

},{"../index":2}],9:[function(require,module,exports){
"use strict";

var Faker = require('../index');

var internet = {
    email: function email() {
        return Faker.Helpers.slugify(this.userName()) + "@" + Faker.Helpers.slugify(this.domainName());
    },

    userName: function userName() {
        var result;
        switch (Faker.random.number(2)) {
            case 0:
                result = Faker.random.first_name();
                break;
            case 1:
                result = Faker.random.first_name() + Faker.random.array_element([".", "_"]) + Faker.random.last_name();
                break;
        }
        return result;
    },

    domainName: function domainName() {
        return this.domainWord() + "." + Faker.random.domain_suffix();
    },

    domainWord: function domainWord() {
        return Faker.random.first_name().toLowerCase();
    },

    ip: function ip() {
        var randNum = function randNum() {
            return (Math.random() * 254 + 1).toFixed(0);
        };

        var result = [];
        for (var i = 0; i < 4; i++) {
            result[i] = randNum();
        }

        return result.join(".");
    },

    color: function color(baseRed255, baseGreen255, baseBlue255) {

        // based on awesome response : http://stackoverflow.com/questions/43044/algorithm-to-randomly-generate-an-aesthetically-pleasing-color-palette
        var red = Math.floor((Faker.random.number(256) + baseRed255) / 2);
        var green = Math.floor((Faker.random.number(256) + baseRed255) / 2);
        var blue = Math.floor((Faker.random.number(256) + baseRed255) / 2);

        return '#' + red.toString(16) + green.toString(16) + blue.toString(16);
    }
};

module.exports = internet;

},{"../index":2}],10:[function(require,module,exports){
'use strict';

var Faker = require('../index');
var Helpers = require('./helpers');
var definitions = require('../lib/definitions');

var lorem = {
    words: function words(num) {
        if (typeof num == 'undefined') {
            num = 3;
        }
        return Helpers.shuffle(definitions.lorem).slice(0, num);
    },

    sentence: function sentence(wordCount, range) {
        if (typeof wordCount == 'undefined') {
            wordCount = 3;
        }
        if (typeof range == 'undefined') {
            range = 7;
        }

        // strange issue with the node_min_test failing for captialize, please fix and add this back
        //return  this.words(wordCount + Helpers.randomNumber(range)).join(' ').capitalize();

        return this.words(wordCount + Faker.random.number(7)).join(' ');
    },

    sentences: function sentences(sentenceCount) {
        if (typeof sentenceCount == 'undefined') {
            sentenceCount = 3;
        }
        var sentences = [];
        for (sentenceCount; sentenceCount > 0; sentenceCount--) {
            sentences.push(this.sentence());
        }
        return sentences.join("\n");
    },

    paragraph: function paragraph(sentenceCount) {
        if (typeof sentenceCount == 'undefined') {
            sentenceCount = 3;
        }
        return this.sentences(sentenceCount + Faker.random.number(3));
    },

    paragraphs: function paragraphs(paragraphCount) {
        if (typeof paragraphCount == 'undefined') {
            paragraphCount = 3;
        }
        var paragraphs = [];
        for (paragraphCount; paragraphCount > 0; paragraphCount--) {
            paragraphs.push(this.paragraph());
        }
        return paragraphs.join("\n \r\t");
    }
};

module.exports = lorem;

},{"../index":2,"../lib/definitions":6,"./helpers":7}],11:[function(require,module,exports){
"use strict";

var Faker = require('../index');

var _name = {
    firstName: function firstName() {
        return Faker.random.first_name();
    },

    //Working as intended
    firstNameFemale: function firstNameFemale() {
        return Faker.random.first_name();
    },
    //Working as intended
    firstNameMale: function firstNameMale() {
        return Faker.random.first_name();
    },

    lastName: function lastName() {
        return Faker.random.last_name();
    },

    findName: function findName() {
        var r = Faker.random.number(8);
        switch (r) {
            case 0:
                return Faker.random.name_prefix() + " " + this.firstName() + " " + this.lastName();
            case 1:
                return this.firstName() + " " + this.lastName() + " " + Faker.random.name_suffix();
        }

        return this.firstName() + " " + this.lastName();
    }
};

module.exports = _name;

},{"../index":2}],12:[function(require,module,exports){
'use strict';

var Faker = require('../index');
var Helpers = require('./helpers');
var definitions = require('./definitions');

var phone = {
    phoneNumber: function phoneNumber() {
        return Helpers.replaceSymbolWithNumber(Faker.random.phone_formats());
    },

    // FIXME: this is strange passing in an array index.
    phoneNumberFormat: function phoneNumberFormat(phoneFormatsArrayIndex) {
        return Helpers.replaceSymbolWithNumber(definitions.phone_formats[phoneFormatsArrayIndex]);
    }
};

module.exports = phone;

},{"../index":2,"./definitions":6,"./helpers":7}],13:[function(require,module,exports){
'use strict';

var definitions = require('./definitions');

var random = {
    // returns a single random number based on a range
    number: function number(range) {
        return Math.floor(Math.random() * range);
    },

    // takes an array and returns the array randomly sorted
    array_element: function array_element(array) {
        var r = Math.floor(Math.random() * array.length);
        return array[r];
    },

    city_prefix: function city_prefix() {
        return this.array_element(definitions.city_prefix);
    },

    city_suffix: function city_suffix() {
        return this.array_element(definitions.city_suffix);
    },

    street_suffix: function street_suffix() {
        return this.array_element(definitions.street_suffix);
    },

    br_state: function br_state() {
        return this.array_element(definitions.br_state);
    },

    br_state_abbr: function br_state_abbr() {
        return this.array_element(definitions.br_state_abbr);
    },

    us_state: function us_state() {
        return this.array_element(definitions.us_state);
    },

    us_state_abbr: function us_state_abbr() {
        return this.array_element(definitions.us_state_abbr);
    },

    uk_county: function uk_county() {
        return this.array_element(definitions.uk_county);
    },

    uk_country: function uk_country() {
        return this.array_element(definitions.uk_country);
    },

    first_name: function first_name() {
        return this.array_element(definitions.first_name);
    },

    last_name: function last_name() {
        return this.array_element(definitions.last_name);
    },

    name_prefix: function name_prefix() {
        return this.array_element(definitions.name_prefix);
    },

    name_suffix: function name_suffix() {
        return this.array_element(definitions.name_suffix);
    },

    catch_phrase_adjective: function catch_phrase_adjective() {
        return this.array_element(definitions.catch_phrase_adjective);
    },

    catch_phrase_descriptor: function catch_phrase_descriptor() {
        return this.array_element(definitions.catch_phrase_descriptor);
    },

    catch_phrase_noun: function catch_phrase_noun() {
        return this.array_element(definitions.catch_phrase_noun);
    },

    bs_adjective: function bs_adjective() {
        return this.array_element(definitions.bs_adjective);
    },

    bs_buzz: function bs_buzz() {
        return this.array_element(definitions.bs_buzz);
    },

    bs_noun: function bs_noun() {
        return this.array_element(definitions.bs_noun);
    },

    phone_formats: function phone_formats() {
        return this.array_element(definitions.phone_formats);
    },

    domain_suffix: function domain_suffix() {
        return this.array_element(definitions.domain_suffix);
    },

    avatar_uri: function avatar_uri() {
        return this.array_element(definitions.avatar_uri);
    }

};

module.exports = random;

},{"./definitions":6}],14:[function(require,module,exports){
'use strict';

var Faker = require('../index');

var tree = {

    clone: function clone(obj) {
        if (obj == null || typeof obj != 'object') return obj;

        var temp = obj.constructor(); // changed

        for (var key in obj) {
            temp[key] = this.clone(obj[key]);
        }
        return temp;
    },

    createTree: function createTree(depth, width, obj) {
        if (!obj) {
            throw {
                name: "ObjectError",
                message: "there needs to be an object passed in"
            };
        }

        if (width <= 0) {
            throw {
                name: "TreeParamError",
                message: "width must be greater than zero"
            };
        }

        var newObj = this.clone(obj);

        for (var prop in newObj) {
            if (newObj.hasOwnProperty(prop)) {
                var value = null;
                if (newObj[prop] !== "__RECURSE__") {
                    value = eval(newObj[prop]);
                } else {
                    if (depth !== 0) {
                        value = [];
                        var evalWidth = 1;

                        if (typeof width == "function") {
                            evalWidth = width();
                        } else {
                            evalWidth = width;
                        }

                        for (var i = 0; i < evalWidth; i++) {
                            value.push(this.createTree(depth - 1, width, obj));
                        }
                    }
                }

                newObj[prop] = value;
            }
        }

        return newObj;
    }

};

module.exports = tree;

},{"../index":2}],15:[function(require,module,exports){
"use strict";

module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };

},{"core-js/library/fn/object/create":19}],16:[function(require,module,exports){
"use strict";

module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };

},{"core-js/library/fn/promise":20}],17:[function(require,module,exports){
"use strict";

module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };

},{"core-js/library/fn/symbol":21}],18:[function(require,module,exports){
"use strict";

module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };

},{"core-js/library/fn/symbol/iterator":22}],19:[function(require,module,exports){
'use strict';

var $ = require('../../modules/$');
module.exports = function create(P, D) {
  return $.create(P, D);
};

},{"../../modules/$":50}],20:[function(require,module,exports){
'use strict';

require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/$.core').Promise;

},{"../modules/$.core":27,"../modules/es6.object.to-string":73,"../modules/es6.promise":74,"../modules/es6.string.iterator":75,"../modules/web.dom.iterable":77}],21:[function(require,module,exports){
'use strict';

require('../../modules/es6.symbol');
module.exports = require('../../modules/$.core').Symbol;

},{"../../modules/$.core":27,"../../modules/es6.symbol":76}],22:[function(require,module,exports){
'use strict';

require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/$.wks')('iterator');

},{"../../modules/$.wks":70,"../../modules/es6.string.iterator":75,"../../modules/web.dom.iterable":77}],23:[function(require,module,exports){
'use strict';

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],24:[function(require,module,exports){
'use strict';

var isObject = require('./$.is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./$.is-object":42}],25:[function(require,module,exports){
'use strict';

var cof = require('./$.cof'),
    TAG = require('./$.wks')('toStringTag'),

// ES3 wrong here
ARG = cof((function () {
  return arguments;
})()) == 'Arguments';

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
  // @@toStringTag case
  : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
  // builtinTag case
  : ARG ? cof(O)
  // ES3 arguments fallback
  : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./$.cof":26,"./$.wks":70}],26:[function(require,module,exports){
"use strict";

var toString = ({}).toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],27:[function(require,module,exports){
'use strict';

var core = module.exports = {};
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],28:[function(require,module,exports){
// Optional / simple context binding
'use strict';

var aFunction = require('./$.a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (~length && that === undefined) return fn;
  switch (length) {
    case 1:
      return function (a) {
        return fn.call(that, a);
      };
    case 2:
      return function (a, b) {
        return fn.call(that, a, b);
      };
    case 3:
      return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
  }return function () /* ...args */{
    return fn.apply(that, arguments);
  };
};

},{"./$.a-function":23}],29:[function(require,module,exports){
'use strict';

var global = require('./$.global'),
    core = require('./$.core'),
    PROTOTYPE = 'prototype';
function ctx(fn, that) {
  return function () {
    return fn.apply(that, arguments);
  };
}
// type bitmap
$def.F = 1; // forced
$def.G = 2; // global
$def.S = 4; // static
$def.P = 8; // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source) {
  var key,
      own,
      out,
      exp,
      isGlobal = type & $def.G,
      isProto = type & $def.P,
      target = isGlobal ? global : type & $def.S ? global[name] : (global[name] || {})[PROTOTYPE],
      exports = isGlobal ? core : core[name] || (core[name] = {});
  if (isGlobal) source = name;
  for (key in source) {
    // contains in native
    own = !(type & $def.F) && target && key in target;
    if (own && key in exports) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    if (isGlobal && typeof target[key] != 'function') exp = source[key];
    // bind timers to global for call from export context
    else if (type & $def.B && own) exp = ctx(out, global);
      // wrap global constructors for prevent change them in library
      else if (type & $def.W && target[key] == out) !(function (C) {
          exp = function (param) {
            return this instanceof C ? new C(param) : C(param);
          };
          exp[PROTOTYPE] = C[PROTOTYPE];
        })(out);else exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export
    exports[key] = exp;
    if (isProto) (exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
  }
}
module.exports = $def;

},{"./$.core":27,"./$.global":36}],30:[function(require,module,exports){
"use strict";

module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],31:[function(require,module,exports){
'use strict';

var isObject = require('./$.is-object'),
    document = require('./$.global').document,

// in old IE typeof document.createElement is 'object'
is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./$.global":36,"./$.is-object":42}],32:[function(require,module,exports){
'use strict';

var $ = require('./$');
module.exports = function (it) {
  var keys = $.getKeys(it),
      isEnum = $.isEnum,
      getSymbols = $.getSymbols;
  if (getSymbols) for (var symbols = getSymbols(it), i = 0, key; symbols.length > i;) {
    if (isEnum.call(it, key = symbols[i++])) keys.push(key);
  }
  return keys;
};

},{"./$":50}],33:[function(require,module,exports){
// fallback for not array-like ES3 strings
'use strict';

var cof = require('./$.cof'),
    $Object = Object;
module.exports = 0 in $Object('z') ? $Object : function (it) {
  return cof(it) == 'String' ? it.split('') : $Object(it);
};

},{"./$.cof":26}],34:[function(require,module,exports){
'use strict';

var ctx = require('./$.ctx'),
    call = require('./$.iter-call'),
    isArrayIter = require('./$.is-array-iter'),
    anObject = require('./$.an-object'),
    toLength = require('./$.to-length'),
    getIterFn = require('./core.get-iterator-method');
module.exports = function (iterable, entries, fn, that) {
  var iterFn = getIterFn(iterable),
      f = ctx(fn, that, entries ? 2 : 1),
      index = 0,
      length,
      step,
      iterator;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    call(iterator, f, step.value, entries);
  }
};

},{"./$.an-object":24,"./$.ctx":28,"./$.is-array-iter":41,"./$.iter-call":44,"./$.to-length":66,"./core.get-iterator-method":71}],35:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
'use strict';

var toString = ({}).toString,
    toObject = require('./$.to-object'),
    getNames = require('./$').getNames;

var windowNames = typeof window == 'object' && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

function getWindowNames(it) {
  try {
    return getNames(it);
  } catch (e) {
    return windowNames.slice();
  }
}

module.exports.get = function getOwnPropertyNames(it) {
  if (windowNames && toString.call(it) == '[object Window]') return getWindowNames(it);
  return getNames(toObject(it));
};

},{"./$":50,"./$.to-object":67}],36:[function(require,module,exports){
'use strict';

var global = typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
module.exports = global;
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],37:[function(require,module,exports){
"use strict";

var hasOwnProperty = ({}).hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],38:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    createDesc = require('./$.property-desc');
module.exports = require('./$.support-desc') ? function (object, key, value) {
  return $.setDesc(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./$":50,"./$.property-desc":54,"./$.support-desc":62}],39:[function(require,module,exports){
'use strict';

module.exports = require('./$.global').document && document.documentElement;

},{"./$.global":36}],40:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
"use strict";

module.exports = function (fn, args, that) {
                  var un = that === undefined;
                  switch (args.length) {
                                    case 0:
                                                      return un ? fn() : fn.call(that);
                                    case 1:
                                                      return un ? fn(args[0]) : fn.call(that, args[0]);
                                    case 2:
                                                      return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);
                                    case 3:
                                                      return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);
                                    case 4:
                                                      return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);
                                    case 5:
                                                      return un ? fn(args[0], args[1], args[2], args[3], args[4]) : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
                  }return fn.apply(that, args);
};

},{}],41:[function(require,module,exports){
'use strict';

var Iterators = require('./$.iterators'),
    ITERATOR = require('./$.wks')('iterator');
module.exports = function (it) {
  return ('Array' in Iterators ? Iterators.Array : Array.prototype[ITERATOR]) === it;
};

},{"./$.iterators":49,"./$.wks":70}],42:[function(require,module,exports){
// http://jsperf.com/core-js-isobject
'use strict';

module.exports = function (it) {
  return it !== null && (typeof it == 'object' || typeof it == 'function');
};

},{}],43:[function(require,module,exports){
// Safari has buggy iterators w/o `next`
'use strict';

module.exports = 'keys' in [] && !('next' in [].keys());

},{}],44:[function(require,module,exports){
'use strict';

var anObject = require('./$.an-object');
function close(iterator) {
  var ret = iterator['return'];
  if (ret !== undefined) anObject(ret.call(iterator));
}
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  } catch (e) {
    close(iterator);
    throw e;
  }
};

},{"./$.an-object":24}],45:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./$.hide')(IteratorPrototype, require('./$.wks')('iterator'), function () {
  return this;
});

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = $.create(IteratorPrototype, { next: require('./$.property-desc')(1, next) });
  require('./$.tag')(Constructor, NAME + ' Iterator');
};

},{"./$":50,"./$.hide":38,"./$.property-desc":54,"./$.tag":63,"./$.wks":70}],46:[function(require,module,exports){
'use strict';
var LIBRARY = require('./$.library'),
    $def = require('./$.def'),
    $redef = require('./$.redef'),
    hide = require('./$.hide'),
    has = require('./$.has'),
    SYMBOL_ITERATOR = require('./$.wks')('iterator'),
    Iterators = require('./$.iterators'),
    FF_ITERATOR = '@@iterator',
    KEYS = 'keys',
    VALUES = 'values';
function returnThis() {
  return this;
}
module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE) {
  require('./$.iter-create')(Constructor, NAME, next);
  function createMethod(kind) {
    switch (kind) {
      case KEYS:
        return function keys() {
          return new Constructor(this, kind);
        };
      case VALUES:
        return function values() {
          return new Constructor(this, kind);
        };
    }return function entries() {
      return new Constructor(this, kind);
    };
  }
  var TAG = NAME + ' Iterator',
      proto = Base.prototype,
      _native = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT],
      _default = _native || createMethod(DEFAULT),
      methods,
      key;
  // Fix native
  if (_native) {
    var IteratorPrototype = require('./$').getProto(_default.call(new Base()));
    // Set @@toStringTag to native iterators
    require('./$.tag')(IteratorPrototype, TAG, true);
    // FF fix
    if (!LIBRARY && has(proto, FF_ITERATOR)) hide(IteratorPrototype, SYMBOL_ITERATOR, returnThis);
  }
  // Define iterator
  if (!LIBRARY || FORCE) hide(proto, SYMBOL_ITERATOR, _default);
  // Plug for library
  Iterators[NAME] = _default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      keys: IS_SET ? _default : createMethod(KEYS),
      values: DEFAULT == VALUES ? _default : createMethod(VALUES),
      entries: DEFAULT != VALUES ? _default : createMethod('entries')
    };
    if (FORCE) for (key in methods) {
      if (!(key in proto)) $redef(proto, key, methods[key]);
    } else $def($def.P + $def.F * require('./$.iter-buggy'), NAME, methods);
  }
};

},{"./$":50,"./$.def":29,"./$.has":37,"./$.hide":38,"./$.iter-buggy":43,"./$.iter-create":45,"./$.iterators":49,"./$.library":52,"./$.redef":55,"./$.tag":63,"./$.wks":70}],47:[function(require,module,exports){
'use strict';

var SYMBOL_ITERATOR = require('./$.wks')('iterator'),
    SAFE_CLOSING = false;
try {
  var riter = [7][SYMBOL_ITERATOR]();
  riter['return'] = function () {
    SAFE_CLOSING = true;
  };
  Array.from(riter, function () {
    throw 2;
  });
} catch (e) {/* empty */}
module.exports = function (exec) {
  if (!SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7],
        iter = arr[SYMBOL_ITERATOR]();
    iter.next = function () {
      safe = true;
    };
    arr[SYMBOL_ITERATOR] = function () {
      return iter;
    };
    exec(arr);
  } catch (e) {/* empty */}
  return safe;
};

},{"./$.wks":70}],48:[function(require,module,exports){
"use strict";

module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],49:[function(require,module,exports){
"use strict";

module.exports = {};

},{}],50:[function(require,module,exports){
"use strict";

var $Object = Object;
module.exports = {
  create: $Object.create,
  getProto: $Object.getPrototypeOf,
  isEnum: ({}).propertyIsEnumerable,
  getDesc: $Object.getOwnPropertyDescriptor,
  setDesc: $Object.defineProperty,
  setDescs: $Object.defineProperties,
  getKeys: $Object.keys,
  getNames: $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each: [].forEach
};

},{}],51:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    toObject = require('./$.to-object');
module.exports = function (object, el) {
  var O = toObject(object),
      keys = $.getKeys(O),
      length = keys.length,
      index = 0,
      key;
  while (length > index) if (O[key = keys[index++]] === el) return key;
};

},{"./$":50,"./$.to-object":67}],52:[function(require,module,exports){
"use strict";

module.exports = true;

},{}],53:[function(require,module,exports){
'use strict';

var $redef = require('./$.redef');
module.exports = function (target, src) {
  for (var key in src) $redef(target, key, src[key]);
  return target;
};

},{"./$.redef":55}],54:[function(require,module,exports){
"use strict";

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],55:[function(require,module,exports){
'use strict';

module.exports = require('./$.hide');

},{"./$.hide":38}],56:[function(require,module,exports){
"use strict";

module.exports = Object.is || function is(x, y) {
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};

},{}],57:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
'use strict';

var getDesc = require('./$').getDesc,
    isObject = require('./$.is-object'),
    anObject = require('./$.an-object');
function check(O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
}
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
  ? (function (buggy, set) {
    try {
      set = require('./$.ctx')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
      set({}, []);
    } catch (e) {
      buggy = true;
    }
    return function setPrototypeOf(O, proto) {
      check(O, proto);
      if (buggy) O.__proto__ = proto;else set(O, proto);
      return O;
    };
  })() : undefined),
  check: check
};

},{"./$":50,"./$.an-object":24,"./$.ctx":28,"./$.is-object":42}],58:[function(require,module,exports){
'use strict';

var global = require('./$.global'),
    SHARED = '__core-js_shared__',
    store = global[SHARED] || (global[SHARED] = {});
module.exports = function (key) {
  return store[key] || (store[key] = {});
};

},{"./$.global":36}],59:[function(require,module,exports){
'use strict';

var $ = require('./$'),
    SPECIES = require('./$.wks')('species');
module.exports = function (C) {
  if (require('./$.support-desc') && !(SPECIES in C)) $.setDesc(C, SPECIES, {
    configurable: true,
    get: function get() {
      return this;
    }
  });
};

},{"./$":50,"./$.support-desc":62,"./$.wks":70}],60:[function(require,module,exports){
"use strict";

module.exports = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) throw TypeError(name + ": use the 'new' operator!");
  return it;
};

},{}],61:[function(require,module,exports){
// true  -> String#at
// false -> String#codePointAt
'use strict';

var toInteger = require('./$.to-integer'),
    defined = require('./$.defined');
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that)),
        i = toInteger(pos),
        l = s.length,
        a,
        b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./$.defined":30,"./$.to-integer":65}],62:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
'use strict';

module.exports = !!(function () {
  try {
    return Object.defineProperty({}, 'a', { get: function get() {
        return 2;
      } }).a == 2;
  } catch (e) {/* empty */}
})();

},{}],63:[function(require,module,exports){
'use strict';

var has = require('./$.has'),
    hide = require('./$.hide'),
    TAG = require('./$.wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) hide(it, TAG, tag);
};

},{"./$.has":37,"./$.hide":38,"./$.wks":70}],64:[function(require,module,exports){
'use strict';
var ctx = require('./$.ctx'),
    invoke = require('./$.invoke'),
    html = require('./$.html'),
    cel = require('./$.dom-create'),
    global = require('./$.global'),
    process = global.process,
    setTask = global.setImmediate,
    clearTask = global.clearImmediate,
    MessageChannel = global.MessageChannel,
    counter = 0,
    queue = {},
    ONREADYSTATECHANGE = 'onreadystatechange',
    defer,
    channel,
    port;
function run() {
  var id = +this;
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event) {
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [],
        i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (require('./$.cof')(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
    // Modern browsers, skip implementation for WebWorkers
    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
      defer = function (id) {
        global.postMessage(id, '*');
      };
      global.addEventListener('message', listner, false);
      // WebWorkers
    } else if (MessageChannel) {
        channel = new MessageChannel();
        port = channel.port2;
        channel.port1.onmessage = listner;
        defer = ctx(port.postMessage, port, 1);
        // IE8-
      } else if (ONREADYSTATECHANGE in cel('script')) {
          defer = function (id) {
            html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
              html.removeChild(this);
              run.call(id);
            };
          };
          // Rest old browsers
        } else {
            defer = function (id) {
              setTimeout(ctx(run, id, 1), 0);
            };
          }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./$.cof":26,"./$.ctx":28,"./$.dom-create":31,"./$.global":36,"./$.html":39,"./$.invoke":40}],65:[function(require,module,exports){
// 7.1.4 ToInteger
"use strict";

var ceil = Math.ceil,
    floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],66:[function(require,module,exports){
// 7.1.15 ToLength
'use strict';

var toInteger = require('./$.to-integer'),
    min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./$.to-integer":65}],67:[function(require,module,exports){
'use strict';

var ES5Object = require('./$.es5-object'),
    defined = require('./$.defined');
module.exports = function (it, realString) {
  return (realString ? Object : ES5Object)(defined(it));
};

},{"./$.defined":30,"./$.es5-object":33}],68:[function(require,module,exports){
'use strict';

var id = 0,
    px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],69:[function(require,module,exports){
"use strict";

module.exports = function () {/* empty */};

},{}],70:[function(require,module,exports){
'use strict';

var store = require('./$.shared')('wks'),
    Symbol = require('./$.global').Symbol;
module.exports = function (name) {
  return store[name] || (store[name] = Symbol && Symbol[name] || (Symbol || require('./$.uid'))('Symbol.' + name));
};

},{"./$.global":36,"./$.shared":58,"./$.uid":68}],71:[function(require,module,exports){
'use strict';

var global = require('./$.global'),
    classof = require('./$.classof'),
    ITERATOR = require('./$.wks')('iterator'),
    Iterators = require('./$.iterators');
module.exports = require('./$.core').getIteratorMethod = function (it) {
  var Symbol = global.Symbol;
  if (it != undefined) {
    return it[Symbol && Symbol.iterator || '@@iterator'] || it[ITERATOR] || Iterators[classof(it)];
  }
};

},{"./$.classof":25,"./$.core":27,"./$.global":36,"./$.iterators":49,"./$.wks":70}],72:[function(require,module,exports){
'use strict';

var setUnscope = require('./$.unscope'),
    step = require('./$.iter-step'),
    Iterators = require('./$.iterators'),
    toObject = require('./$.to-object');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
require('./$.iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toObject(iterated); // target
  this._i = 0; // next index
  this._k = kind; // kind
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t,
      kind = this._k,
      index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');

},{"./$.iter-define":46,"./$.iter-step":48,"./$.iterators":49,"./$.to-object":67,"./$.unscope":69}],73:[function(require,module,exports){
"use strict";

},{}],74:[function(require,module,exports){
'use strict';
var $ = require('./$'),
    LIBRARY = require('./$.library'),
    global = require('./$.global'),
    ctx = require('./$.ctx'),
    classof = require('./$.classof'),
    $def = require('./$.def'),
    isObject = require('./$.is-object'),
    anObject = require('./$.an-object'),
    aFunction = require('./$.a-function'),
    strictNew = require('./$.strict-new'),
    forOf = require('./$.for-of'),
    setProto = require('./$.set-proto').set,
    same = require('./$.same'),
    species = require('./$.species'),
    SPECIES = require('./$.wks')('species'),
    RECORD = require('./$.uid')('record'),
    PROMISE = 'Promise',
    process = global.process,
    isNode = classof(process) == 'process',
    asap = process && process.nextTick || require('./$.task').set,
    P = global[PROMISE],
    Wrapper;

function testResolve(sub) {
  var test = new P(function () {});
  if (sub) test.constructor = Object;
  return P.resolve(test) === test;
}

var useNative = (function () {
  var works = false;
  function P2(x) {
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = P && P.resolve && testResolve();
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, { constructor: { value: P2 } });
    // actual Firefox has broken subclass support, test that
    if (!(P2.resolve(5).then(function () {}) instanceof P2)) {
      works = false;
    }
    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
    if (works && require('./$.support-desc')) {
      var thenableThenGotten = false;
      P.resolve($.setDesc({}, 'then', {
        get: function get() {
          thenableThenGotten = true;
        }
      }));
      works = thenableThenGotten;
    }
  } catch (e) {
    works = false;
  }
  return works;
})();

// helpers
function isPromise(it) {
  return isObject(it) && (useNative ? classof(it) == 'Promise' : RECORD in it);
}
function sameConstructor(a, b) {
  // library wrapper special case
  if (LIBRARY && a === P && b === Wrapper) return true;
  return same(a, b);
}
function getConstructor(C) {
  var S = anObject(C)[SPECIES];
  return S != undefined ? S : C;
}
function isThenable(it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
}
function notify(record, isReject) {
  if (record.n) return;
  record.n = true;
  var chain = record.c;
  // strange IE + webpack dev server bug - use .call(global)
  asap.call(global, function () {
    var value = record.v,
        ok = record.s == 1,
        i = 0;
    function run(react) {
      var cb = ok ? react.ok : react.fail,
          ret,
          then;
      try {
        if (cb) {
          if (!ok) record.h = true;
          ret = cb === true ? value : cb(value);
          if (ret === react.P) {
            react.rej(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(ret)) {
            then.call(ret, react.res, react.rej);
          } else react.res(ret);
        } else react.rej(value);
      } catch (err) {
        react.rej(err);
      }
    }
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
    record.n = false;
    if (isReject) setTimeout(function () {
      // strange IE + webpack dev server bug - use .call(global)
      asap.call(global, function () {
        if (isUnhandled(record.p)) {
          if (isNode) {
            process.emit('unhandledRejection', value, record.p);
          } else if (global.console && console.error) {
            console.error('Unhandled promise rejection', value);
          }
        }
        record.a = undefined;
      });
    }, 1);
  });
}
function isUnhandled(promise) {
  var record = promise[RECORD],
      chain = record.a || record.c,
      i = 0,
      react;
  if (record.h) return false;
  while (chain.length > i) {
    react = chain[i++];
    if (react.fail || !isUnhandled(react.P)) return false;
  }return true;
}
function $reject(value) {
  var record = this;
  if (record.d) return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  notify(record, true);
}
function $resolve(value) {
  var record = this,
      then;
  if (record.d) return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if (then = isThenable(value)) {
      // strange IE + webpack dev server bug - use .call(global)
      asap.call(global, function () {
        var wrapper = { r: record, d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      record.v = value;
      record.s = 1;
      notify(record, false);
    }
  } catch (e) {
    $reject.call({ r: record, d: false }, e); // wrap
  }
}

// constructor polyfill
if (!useNative) {
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor) {
    aFunction(executor);
    var record = {
      p: strictNew(this, P, PROMISE), // <- promise
      c: [], // <- awaiting reactions
      a: undefined, // <- checked in isUnhandled reactions
      s: 0, // <- state
      d: false, // <- done
      v: undefined, // <- value
      h: false, // <- handled rejection
      n: false // <- notify
    };
    this[RECORD] = record;
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch (err) {
      $reject.call(record, err);
    }
  };
  require('./$.mix')(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var S = anObject(anObject(this).constructor)[SPECIES];
      var react = {
        ok: typeof onFulfilled == 'function' ? onFulfilled : true,
        fail: typeof onRejected == 'function' ? onRejected : false
      };
      var promise = react.P = new (S != undefined ? S : P)(function (res, rej) {
        react.res = aFunction(res);
        react.rej = aFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      if (record.a) record.a.push(react);
      if (record.s) notify(record, false);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function _catch(onRejected) {
      return this.then(undefined, onRejected);
    }
  });
}

// export
$def($def.G + $def.W + $def.F * !useNative, { Promise: P });
require('./$.tag')(P, PROMISE);
species(P);
species(Wrapper = require('./$.core')[PROMISE]);

// statics
$def($def.S + $def.F * !useNative, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    return new this(function (res, rej) {
      rej(r);
    });
  }
});
$def($def.S + $def.F * (!useNative || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return isPromise(x) && sameConstructor(x.constructor, this) ? x : new this(function (res) {
      res(x);
    });
  }
});
$def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function (iter) {
  P.all(iter)['catch'](function () {});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = getConstructor(this),
        values = [];
    return new C(function (res, rej) {
      forOf(iterable, false, values.push, values);
      var remaining = values.length,
          results = Array(remaining);
      if (remaining) $.each.call(values, function (promise, index) {
        C.resolve(promise).then(function (value) {
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = getConstructor(this);
    return new C(function (res, rej) {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(res, rej);
      });
    });
  }
});

},{"./$":50,"./$.a-function":23,"./$.an-object":24,"./$.classof":25,"./$.core":27,"./$.ctx":28,"./$.def":29,"./$.for-of":34,"./$.global":36,"./$.is-object":42,"./$.iter-detect":47,"./$.library":52,"./$.mix":53,"./$.same":56,"./$.set-proto":57,"./$.species":59,"./$.strict-new":60,"./$.support-desc":62,"./$.tag":63,"./$.task":64,"./$.uid":68,"./$.wks":70}],75:[function(require,module,exports){
'use strict';

var $at = require('./$.string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0; // next index
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t,
      index = this._i,
      point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./$.iter-define":46,"./$.string-at":61}],76:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $ = require('./$'),
    global = require('./$.global'),
    has = require('./$.has'),
    SUPPORT_DESC = require('./$.support-desc'),
    $def = require('./$.def'),
    $redef = require('./$.redef'),
    shared = require('./$.shared'),
    setTag = require('./$.tag'),
    uid = require('./$.uid'),
    wks = require('./$.wks'),
    keyOf = require('./$.keyof'),
    $names = require('./$.get-names'),
    enumKeys = require('./$.enum-keys'),
    anObject = require('./$.an-object'),
    toObject = require('./$.to-object'),
    createDesc = require('./$.property-desc'),
    getDesc = $.getDesc,
    setDesc = $.setDesc,
    $create = $.create,
    getNames = $names.get,
    $Symbol = global.Symbol,
    setter = false,
    HIDDEN = wks('_hidden'),
    isEnum = $.isEnum,
    SymbolRegistry = shared('symbol-registry'),
    AllSymbols = shared('symbols'),
    useNative = typeof $Symbol == 'function',
    ObjectProto = Object.prototype;

var setSymbolDesc = SUPPORT_DESC ? (function () {
  // fallback for old Android
  try {
    return $create(setDesc({}, HIDDEN, {
      get: function get() {
        return setDesc(this, HIDDEN, { value: false })[HIDDEN];
      }
    }))[HIDDEN] || setDesc;
  } catch (e) {
    return function (it, key, D) {
      var protoDesc = getDesc(ObjectProto, key);
      if (protoDesc) delete ObjectProto[key];
      setDesc(it, key, D);
      if (protoDesc && it !== ObjectProto) setDesc(ObjectProto, key, protoDesc);
    };
  }
})() : setDesc;

function wrap(tag) {
  var sym = AllSymbols[tag] = $create($Symbol.prototype);
  sym._k = tag;
  SUPPORT_DESC && setter && setSymbolDesc(ObjectProto, tag, {
    configurable: true,
    set: function set(value) {
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    }
  });
  return sym;
}

function defineProperty(it, key, D) {
  if (D && has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) setDesc(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = $create(D, { enumerable: createDesc(0, false) });
    }return setSymbolDesc(it, key, D);
  }return setDesc(it, key, D);
}
function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toObject(P)),
      i = 0,
      l = keys.length,
      key;
  while (l > i) defineProperty(it, key = keys[i++], P[key]);
  return it;
}
function create(it, P) {
  return P === undefined ? $create(it) : defineProperties($create(it), P);
}
function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key);
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
}
function getOwnPropertyDescriptor(it, key) {
  var D = getDesc(it = toObject(it), key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
}
function getOwnPropertyNames(it) {
  var names = getNames(toObject(it)),
      result = [],
      i = 0,
      key;
  while (names.length > i) if (!has(AllSymbols, key = names[i++]) && key != HIDDEN) result.push(key);
  return result;
}
function getOwnPropertySymbols(it) {
  var names = getNames(toObject(it)),
      result = [],
      i = 0,
      key;
  while (names.length > i) if (has(AllSymbols, key = names[i++])) result.push(AllSymbols[key]);
  return result;
}

// 19.4.1.1 Symbol([description])
if (!useNative) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
    return wrap(uid(arguments[0]));
  };
  $redef($Symbol.prototype, 'toString', function () {
    return this._k;
  });

  $.create = create;
  $.isEnum = propertyIsEnumerable;
  $.getDesc = getOwnPropertyDescriptor;
  $.setDesc = defineProperty;
  $.setDescs = defineProperties;
  $.getNames = $names.get = getOwnPropertyNames;
  $.getSymbols = getOwnPropertySymbols;

  if (SUPPORT_DESC && !require('./$.library')) {
    $redef(ObjectProto, 'propertyIsEnumerable', propertyIsEnumerable, true);
  }
}

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function _for(key) {
    return has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key) {
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function useSetter() {
    setter = true;
  },
  useSimple: function useSimple() {
    setter = false;
  }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call(('hasInstance,isConcatSpreadable,iterator,match,replace,search,' + 'species,split,toPrimitive,toStringTag,unscopables').split(','), function (it) {
  var sym = wks(it);
  symbolStatics[it] = useNative ? sym : wrap(sym);
});

setter = true;

$def($def.G + $def.W, { Symbol: $Symbol });

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * !useNative, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: getOwnPropertySymbols
});

// 19.4.3.5 Symbol.prototype[@@toStringTag]
setTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag(global.JSON, 'JSON', true);

},{"./$":50,"./$.an-object":24,"./$.def":29,"./$.enum-keys":32,"./$.get-names":35,"./$.global":36,"./$.has":37,"./$.keyof":51,"./$.library":52,"./$.property-desc":54,"./$.redef":55,"./$.shared":58,"./$.support-desc":62,"./$.tag":63,"./$.to-object":67,"./$.uid":68,"./$.wks":70}],77:[function(require,module,exports){
'use strict';

require('./es6.array.iterator');
var Iterators = require('./$.iterators');
Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;

},{"./$.iterators":49,"./es6.array.iterator":72}],78:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
"use strict";

var g = typeof global === "object" ? global : typeof window === "object" ? window : typeof self === "object" ? self : undefined;

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime && Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  delete g.regeneratorRuntime;
}

module.exports = { "default": module.exports, __esModule: true };

},{"./runtime":79}],79:[function(require,module,exports){
var process=require("__browserify_process"),global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

"use strict";

var _Symbol = require("babel-runtime/core-js/symbol")["default"];

var _Symbol$iterator = require("babel-runtime/core-js/symbol/iterator")["default"];

var _Object$create = require("babel-runtime/core-js/object/create")["default"];

var _Promise = require("babel-runtime/core-js/promise")["default"];

!(function (global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol = typeof _Symbol === "function" && _Symbol$iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = _Object$create((outerFn || Generator).prototype);

    generator._invoke = makeInvokeMethod(innerFn, self || null, new Context(tryLocsList || []));

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      prototype[method] = function (arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction ||
    // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  runtime.mark = function (genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = _Object$create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function (arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    // This invoke function is written in a style that assumes some
    // calling function (or Promise) will handle exceptions.
    function invoke(method, arg) {
      var result = generator[method](arg);
      var value = result.value;
      return value instanceof AwaitArgument ? _Promise.resolve(value.arg).then(invokeNext, invokeThrow) : _Promise.resolve(value).then(function (unwrapped) {
        // When a yielded Promise is resolved, its final value becomes
        // the .value of the Promise<{value,done}> result for the
        // current iteration. If the Promise is rejected, however, the
        // result for this iteration will be rejected with the same
        // reason. Note that rejections of yielded Promises are not
        // thrown back into the generator function, as is the case
        // when an awaited Promise is rejected. This difference in
        // behavior between yield and await is important, because it
        // allows the consumer to decide what to do with the yielded
        // rejection (swallow it and continue, manually .throw it back
        // into the generator, abandon iteration, whatever). With
        // await, by contrast, there is no opportunity to examine the
        // rejection reason outside the generator function, so the
        // only option is to throw it from the await expression, and
        // let the generator function handle the exception.
        result.value = unwrapped;
        return result;
      });
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var invokeNext = invoke.bind(generator, "next");
    var invokeThrow = invoke.bind(generator, "throw");
    var invokeReturn = invoke.bind(generator, "return");
    var previousPromise;

    function enqueue(method, arg) {
      var enqueueResult =
      // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(function () {
        return invoke(method, arg);
      }) : new _Promise(function (resolve) {
        resolve(invoke(method, arg));
      });

      // Avoid propagating enqueueResult failures to Promises returned by
      // later invocations of the iterator.
      previousPromise = enqueueResult["catch"](function (ignored) {});

      return enqueueResult;
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function (innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

    return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" || method === "throw" && delegate.iterator[method] === undefined) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            context.sent = undefined;
          }
        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }
        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }
        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function (object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function reset(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function stop() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function dispatchException(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function complete(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
// Among the various tricks for obtaining a reference to the global
// object, this seems to be the most reliable technique that does not
// use indirect eval (which violates Content Security Policy).
typeof global === "object" ? global : typeof window === "object" ? window : typeof self === "object" ? self : undefined);

},{"__browserify_process":85,"babel-runtime/core-js/object/create":15,"babel-runtime/core-js/promise":16,"babel-runtime/core-js/symbol":17,"babel-runtime/core-js/symbol/iterator":18}],80:[function(require,module,exports){
'use strict';

module.exports = require('./vendor/dat.gui');
module.exports.color = require('./vendor/dat.color');

},{"./vendor/dat.color":81,"./vendor/dat.gui":82}],81:[function(require,module,exports){
/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/** @namespace */
'use strict';

var dat = module.exports = dat || {};

/** @namespace */
dat.color = dat.color || {};

/** @namespace */
dat.utils = dat.utils || {};

dat.utils.common = (function () {

  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;

  /**
   * Band-aid methods for things that should be a lot easier in JavaScript.
   * Implementation and structure inspired by underscore.js
   * http://documentcloud.github.com/underscore/
   */

  return {

    BREAK: {},

    extend: function extend(target) {

      this.each(ARR_SLICE.call(arguments, 1), function (obj) {

        for (var key in obj) if (!this.isUndefined(obj[key])) target[key] = obj[key];
      }, this);

      return target;
    },

    defaults: function defaults(target) {

      this.each(ARR_SLICE.call(arguments, 1), function (obj) {

        for (var key in obj) if (this.isUndefined(target[key])) target[key] = obj[key];
      }, this);

      return target;
    },

    compose: function compose() {
      var toCall = ARR_SLICE.call(arguments);
      return function () {
        var args = ARR_SLICE.call(arguments);
        for (var i = toCall.length - 1; i >= 0; i--) {
          args = [toCall[i].apply(this, args)];
        }
        return args[0];
      };
    },

    each: function each(obj, itr, scope) {

      if (ARR_EACH && obj.forEach === ARR_EACH) {

        obj.forEach(itr, scope);
      } else if (obj.length === obj.length + 0) {
        // Is number but not NaN

        for (var key = 0, l = obj.length; key < l; key++) if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) return;
      } else {

        for (var key in obj) if (itr.call(scope, obj[key], key) === this.BREAK) return;
      }
    },

    defer: function defer(fnc) {
      setTimeout(fnc, 0);
    },

    toArray: function toArray(obj) {
      if (obj.toArray) return obj.toArray();
      return ARR_SLICE.call(obj);
    },

    isUndefined: function isUndefined(obj) {
      return obj === undefined;
    },

    isNull: function isNull(obj) {
      return obj === null;
    },

    isNaN: function isNaN(obj) {
      return obj !== obj;
    },

    isArray: Array.isArray || function (obj) {
      return obj.constructor === Array;
    },

    isObject: function isObject(obj) {
      return obj === Object(obj);
    },

    isNumber: function isNumber(obj) {
      return obj === obj + 0;
    },

    isString: function isString(obj) {
      return obj === obj + '';
    },

    isBoolean: function isBoolean(obj) {
      return obj === false || obj === true;
    },

    isFunction: function isFunction(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    }

  };
})();

dat.color.toString = (function (common) {

  return function (color) {

    if (color.a == 1 || common.isUndefined(color.a)) {

      var s = color.hex.toString(16);
      while (s.length < 6) {
        s = '0' + s;
      }

      return '#' + s;
    } else {

      return 'rgba(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ',' + color.a + ')';
    }
  };
})(dat.utils.common);

dat.Color = dat.color.Color = (function (interpret, math, _toString, common) {

  var Color = function Color() {

    this.__state = interpret.apply(this, arguments);

    if (this.__state === false) {
      throw 'Failed to interpret color arguments';
    }

    this.__state.a = this.__state.a || 1;
  };

  Color.COMPONENTS = ['r', 'g', 'b', 'h', 's', 'v', 'hex', 'a'];

  common.extend(Color.prototype, {

    toString: function toString() {
      return _toString(this);
    },

    toOriginal: function toOriginal() {
      return this.__state.conversion.write(this);
    }

  });

  defineRGBComponent(Color.prototype, 'r', 2);
  defineRGBComponent(Color.prototype, 'g', 1);
  defineRGBComponent(Color.prototype, 'b', 0);

  defineHSVComponent(Color.prototype, 'h');
  defineHSVComponent(Color.prototype, 's');
  defineHSVComponent(Color.prototype, 'v');

  Object.defineProperty(Color.prototype, 'a', {

    get: function get() {
      return this.__state.a;
    },

    set: function set(v) {
      this.__state.a = v;
    }

  });

  Object.defineProperty(Color.prototype, 'hex', {

    get: function get() {

      if (!this.__state.space !== 'HEX') {
        this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
      }

      return this.__state.hex;
    },

    set: function set(v) {

      this.__state.space = 'HEX';
      this.__state.hex = v;
    }

  });

  function defineRGBComponent(target, component, componentHexIndex) {

    Object.defineProperty(target, component, {

      get: function get() {

        if (this.__state.space === 'RGB') {
          return this.__state[component];
        }

        recalculateRGB(this, component, componentHexIndex);

        return this.__state[component];
      },

      set: function set(v) {

        if (this.__state.space !== 'RGB') {
          recalculateRGB(this, component, componentHexIndex);
          this.__state.space = 'RGB';
        }

        this.__state[component] = v;
      }

    });
  }

  function defineHSVComponent(target, component) {

    Object.defineProperty(target, component, {

      get: function get() {

        if (this.__state.space === 'HSV') return this.__state[component];

        recalculateHSV(this);

        return this.__state[component];
      },

      set: function set(v) {

        if (this.__state.space !== 'HSV') {
          recalculateHSV(this);
          this.__state.space = 'HSV';
        }

        this.__state[component] = v;
      }

    });
  }

  function recalculateRGB(color, component, componentHexIndex) {

    if (color.__state.space === 'HEX') {

      color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);
    } else if (color.__state.space === 'HSV') {

      common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
    } else {

      throw 'Corrupted color state';
    }
  }

  function recalculateHSV(color) {

    var result = math.rgb_to_hsv(color.r, color.g, color.b);

    common.extend(color.__state, {
      s: result.s,
      v: result.v
    });

    if (!common.isNaN(result.h)) {
      color.__state.h = result.h;
    } else if (common.isUndefined(color.__state.h)) {
      color.__state.h = 0;
    }
  }

  return Color;
})(dat.color.interpret = (function (toString, common) {

  var result, toReturn;

  var interpret = function interpret() {

    toReturn = false;

    var original = arguments.length > 1 ? common.toArray(arguments) : arguments[0];

    common.each(INTERPRETATIONS, function (family) {

      if (family.litmus(original)) {

        common.each(family.conversions, function (conversion, conversionName) {

          result = conversion.read(original);

          if (toReturn === false && result !== false) {
            toReturn = result;
            result.conversionName = conversionName;
            result.conversion = conversion;
            return common.BREAK;
          }
        });

        return common.BREAK;
      }
    });

    return toReturn;
  };

  var INTERPRETATIONS = [

  // Strings
  {

    litmus: common.isString,

    conversions: {

      THREE_CHAR_HEX: {

        read: function read(original) {

          var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
          if (test === null) return false;

          return {
            space: 'HEX',
            hex: parseInt('0x' + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString())
          };
        },

        write: toString

      },

      SIX_CHAR_HEX: {

        read: function read(original) {

          var test = original.match(/^#([A-F0-9]{6})$/i);
          if (test === null) return false;

          return {
            space: 'HEX',
            hex: parseInt('0x' + test[1].toString())
          };
        },

        write: toString

      },

      CSS_RGB: {

        read: function read(original) {

          var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
          if (test === null) return false;

          return {
            space: 'RGB',
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3])
          };
        },

        write: toString

      },

      CSS_RGBA: {

        read: function read(original) {

          var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
          if (test === null) return false;

          return {
            space: 'RGB',
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3]),
            a: parseFloat(test[4])
          };
        },

        write: toString

      }

    }

  },

  // Numbers
  {

    litmus: common.isNumber,

    conversions: {

      HEX: {
        read: function read(original) {
          return {
            space: 'HEX',
            hex: original,
            conversionName: 'HEX'
          };
        },

        write: function write(color) {
          return color.hex;
        }
      }

    }

  },

  // Arrays
  {

    litmus: common.isArray,

    conversions: {

      RGB_ARRAY: {
        read: function read(original) {
          if (original.length != 3) return false;
          return {
            space: 'RGB',
            r: original[0],
            g: original[1],
            b: original[2]
          };
        },

        write: function write(color) {
          return [color.r, color.g, color.b];
        }

      },

      RGBA_ARRAY: {
        read: function read(original) {
          if (original.length != 4) return false;
          return {
            space: 'RGB',
            r: original[0],
            g: original[1],
            b: original[2],
            a: original[3]
          };
        },

        write: function write(color) {
          return [color.r, color.g, color.b, color.a];
        }

      }

    }

  },

  // Objects
  {

    litmus: common.isObject,

    conversions: {

      RGBA_OBJ: {
        read: function read(original) {
          if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b) && common.isNumber(original.a)) {
            return {
              space: 'RGB',
              r: original.r,
              g: original.g,
              b: original.b,
              a: original.a
            };
          }
          return false;
        },

        write: function write(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a
          };
        }
      },

      RGB_OBJ: {
        read: function read(original) {
          if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b)) {
            return {
              space: 'RGB',
              r: original.r,
              g: original.g,
              b: original.b
            };
          }
          return false;
        },

        write: function write(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b
          };
        }
      },

      HSVA_OBJ: {
        read: function read(original) {
          if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v) && common.isNumber(original.a)) {
            return {
              space: 'HSV',
              h: original.h,
              s: original.s,
              v: original.v,
              a: original.a
            };
          }
          return false;
        },

        write: function write(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v,
            a: color.a
          };
        }
      },

      HSV_OBJ: {
        read: function read(original) {
          if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v)) {
            return {
              space: 'HSV',
              h: original.h,
              s: original.s,
              v: original.v
            };
          }
          return false;
        },

        write: function write(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v
          };
        }

      }

    }

  }];

  return interpret;
})(dat.color.toString, dat.utils.common), dat.color.math = (function () {

  var tmpComponent;

  return {

    hsv_to_rgb: function hsv_to_rgb(h, s, v) {

      var hi = Math.floor(h / 60) % 6;

      var f = h / 60 - Math.floor(h / 60);
      var p = v * (1.0 - s);
      var q = v * (1.0 - f * s);
      var t = v * (1.0 - (1.0 - f) * s);
      var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];

      return {
        r: c[0] * 255,
        g: c[1] * 255,
        b: c[2] * 255
      };
    },

    rgb_to_hsv: function rgb_to_hsv(r, g, b) {

      var min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          delta = max - min,
          h,
          s;

      if (max != 0) {
        s = delta / max;
      } else {
        return {
          h: NaN,
          s: 0,
          v: 0
        };
      }

      if (r == max) {
        h = (g - b) / delta;
      } else if (g == max) {
        h = 2 + (b - r) / delta;
      } else {
        h = 4 + (r - g) / delta;
      }
      h /= 6;
      if (h < 0) {
        h += 1;
      }

      return {
        h: h * 360,
        s: s,
        v: max / 255
      };
    },

    rgb_to_hex: function rgb_to_hex(r, g, b) {
      var hex = this.hex_with_component(0, 2, r);
      hex = this.hex_with_component(hex, 1, g);
      hex = this.hex_with_component(hex, 0, b);
      return hex;
    },

    component_from_hex: function component_from_hex(hex, componentIndex) {
      return hex >> componentIndex * 8 & 0xFF;
    },

    hex_with_component: function hex_with_component(hex, componentIndex, value) {
      return value << (tmpComponent = componentIndex * 8) | hex & ~(0xFF << tmpComponent);
    }

  };
})(), dat.color.toString, dat.utils.common);

},{}],82:[function(require,module,exports){
/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/** @namespace */
'use strict';

var dat = module.exports = dat || {};

/** @namespace */
dat.gui = dat.gui || {};

/** @namespace */
dat.utils = dat.utils || {};

/** @namespace */
dat.controllers = dat.controllers || {};

/** @namespace */
dat.dom = dat.dom || {};

/** @namespace */
dat.color = dat.color || {};

dat.utils.css = (function () {
  return {
    load: function load(url, doc) {
      doc = doc || document;
      var link = doc.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = url;
      doc.getElementsByTagName('head')[0].appendChild(link);
    },
    inject: function inject(css, doc) {
      doc = doc || document;
      var injected = document.createElement('style');
      injected.type = 'text/css';
      injected.innerHTML = css;
      doc.getElementsByTagName('head')[0].appendChild(injected);
    }
  };
})();

dat.utils.common = (function () {

  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;

  /**
   * Band-aid methods for things that should be a lot easier in JavaScript.
   * Implementation and structure inspired by underscore.js
   * http://documentcloud.github.com/underscore/
   */

  return {

    BREAK: {},

    extend: function extend(target) {

      this.each(ARR_SLICE.call(arguments, 1), function (obj) {

        for (var key in obj) if (!this.isUndefined(obj[key])) target[key] = obj[key];
      }, this);

      return target;
    },

    defaults: function defaults(target) {

      this.each(ARR_SLICE.call(arguments, 1), function (obj) {

        for (var key in obj) if (this.isUndefined(target[key])) target[key] = obj[key];
      }, this);

      return target;
    },

    compose: function compose() {
      var toCall = ARR_SLICE.call(arguments);
      return function () {
        var args = ARR_SLICE.call(arguments);
        for (var i = toCall.length - 1; i >= 0; i--) {
          args = [toCall[i].apply(this, args)];
        }
        return args[0];
      };
    },

    each: function each(obj, itr, scope) {

      if (ARR_EACH && obj.forEach === ARR_EACH) {

        obj.forEach(itr, scope);
      } else if (obj.length === obj.length + 0) {
        // Is number but not NaN

        for (var key = 0, l = obj.length; key < l; key++) if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) return;
      } else {

        for (var key in obj) if (itr.call(scope, obj[key], key) === this.BREAK) return;
      }
    },

    defer: function defer(fnc) {
      setTimeout(fnc, 0);
    },

    toArray: function toArray(obj) {
      if (obj.toArray) return obj.toArray();
      return ARR_SLICE.call(obj);
    },

    isUndefined: function isUndefined(obj) {
      return obj === undefined;
    },

    isNull: function isNull(obj) {
      return obj === null;
    },

    isNaN: function isNaN(obj) {
      return obj !== obj;
    },

    isArray: Array.isArray || function (obj) {
      return obj.constructor === Array;
    },

    isObject: function isObject(obj) {
      return obj === Object(obj);
    },

    isNumber: function isNumber(obj) {
      return obj === obj + 0;
    },

    isString: function isString(obj) {
      return obj === obj + '';
    },

    isBoolean: function isBoolean(obj) {
      return obj === false || obj === true;
    },

    isFunction: function isFunction(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    }

  };
})();

dat.controllers.Controller = (function (common) {

  /**
   * @class An "abstract" class that represents a given property of an object.
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var Controller = function Controller(object, property) {

    this.initialValue = object[property];

    /**
     * Those who extend this class will put their DOM elements in here.
     * @type {DOMElement}
     */
    this.domElement = document.createElement('div');

    /**
     * The object to manipulate
     * @type {Object}
     */
    this.object = object;

    /**
     * The name of the property to manipulate
     * @type {String}
     */
    this.property = property;

    /**
     * The function to be called on change.
     * @type {Function}
     * @ignore
     */
    this.__onChange = undefined;

    /**
     * The function to be called on finishing change.
     * @type {Function}
     * @ignore
     */
    this.__onFinishChange = undefined;
  };

  common.extend(Controller.prototype,

  /** @lends dat.controllers.Controller.prototype */
  {

    /**
     * Specify that a function fire every time someone changes the value with
     * this Controller.
     *
     * @param {Function} fnc This function will be called whenever the value
     * is modified via this Controller.
     * @returns {dat.controllers.Controller} this
     */
    onChange: function onChange(fnc) {
      this.__onChange = fnc;
      return this;
    },

    /**
     * Specify that a function fire every time someone "finishes" changing
     * the value wih this Controller. Useful for values that change
     * incrementally like numbers or strings.
     *
     * @param {Function} fnc This function will be called whenever
     * someone "finishes" changing the value via this Controller.
     * @returns {dat.controllers.Controller} this
     */
    onFinishChange: function onFinishChange(fnc) {
      this.__onFinishChange = fnc;
      return this;
    },

    /**
     * Change the value of <code>object[property]</code>
     *
     * @param {Object} newValue The new value of <code>object[property]</code>
     */
    setValue: function setValue(newValue) {
      this.object[this.property] = newValue;
      if (this.__onChange) {
        this.__onChange.call(this, newValue);
      }
      this.updateDisplay();
      return this;
    },

    /**
     * Gets the value of <code>object[property]</code>
     *
     * @returns {Object} The current value of <code>object[property]</code>
     */
    getValue: function getValue() {
      return this.object[this.property];
    },

    /**
     * Refreshes the visual display of a Controller in order to keep sync
     * with the object's current value.
     * @returns {dat.controllers.Controller} this
     */
    updateDisplay: function updateDisplay() {
      return this;
    },

    /**
     * @returns {Boolean} true if the value has deviated from initialValue
     */
    isModified: function isModified() {
      return this.initialValue !== this.getValue();
    }

  });

  return Controller;
})(dat.utils.common);

dat.dom.dom = (function (common) {

  var EVENT_MAP = {
    'HTMLEvents': ['change'],
    'MouseEvents': ['click', 'mousemove', 'mousedown', 'mouseup', 'mouseover'],
    'KeyboardEvents': ['keydown']
  };

  var EVENT_MAP_INV = {};
  common.each(EVENT_MAP, function (v, k) {
    common.each(v, function (e) {
      EVENT_MAP_INV[e] = k;
    });
  });

  var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;

  function cssValueToPixels(val) {

    if (val === '0' || common.isUndefined(val)) return 0;

    var match = val.match(CSS_VALUE_PIXELS);

    if (!common.isNull(match)) {
      return parseFloat(match[1]);
    }

    // TODO ...ems? %?

    return 0;
  }

  /**
   * @namespace
   * @member dat.dom
   */
  var dom = {

    /**
     * 
     * @param elem
     * @param selectable
     */
    makeSelectable: function makeSelectable(elem, selectable) {

      if (elem === undefined || elem.style === undefined) return;

      elem.onselectstart = selectable ? function () {
        return false;
      } : function () {};

      elem.style.MozUserSelect = selectable ? 'auto' : 'none';
      elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
      elem.unselectable = selectable ? 'on' : 'off';
    },

    /**
     *
     * @param elem
     * @param horizontal
     * @param vertical
     */
    makeFullscreen: function makeFullscreen(elem, horizontal, vertical) {

      if (common.isUndefined(horizontal)) horizontal = true;
      if (common.isUndefined(vertical)) vertical = true;

      elem.style.position = 'absolute';

      if (horizontal) {
        elem.style.left = 0;
        elem.style.right = 0;
      }
      if (vertical) {
        elem.style.top = 0;
        elem.style.bottom = 0;
      }
    },

    /**
     *
     * @param elem
     * @param eventType
     * @param params
     */
    fakeEvent: function fakeEvent(elem, eventType, params, aux) {
      params = params || {};
      var className = EVENT_MAP_INV[eventType];
      if (!className) {
        throw new Error('Event type ' + eventType + ' not supported.');
      }
      var evt = document.createEvent(className);
      switch (className) {
        case 'MouseEvents':
          var clientX = params.x || params.clientX || 0;
          var clientY = params.y || params.clientY || 0;
          evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0, //screen X
          0, //screen Y
          clientX, //client X
          clientY, //client Y
          false, false, false, false, 0, null);
          break;
        case 'KeyboardEvents':
          var init = evt.initKeyboardEvent || evt.initKeyEvent; // webkit || moz
          common.defaults(params, {
            cancelable: true,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            keyCode: undefined,
            charCode: undefined
          });
          init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
          break;
        default:
          evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
          break;
      }
      common.defaults(evt, aux);
      elem.dispatchEvent(evt);
    },

    /**
     *
     * @param elem
     * @param event
     * @param func
     * @param bool
     */
    bind: function bind(elem, event, func, bool) {
      bool = bool || false;
      if (elem.addEventListener) elem.addEventListener(event, func, bool);else if (elem.attachEvent) elem.attachEvent('on' + event, func);
      return dom;
    },

    /**
     *
     * @param elem
     * @param event
     * @param func
     * @param bool
     */
    unbind: function unbind(elem, event, func, bool) {
      bool = bool || false;
      if (elem.removeEventListener) elem.removeEventListener(event, func, bool);else if (elem.detachEvent) elem.detachEvent('on' + event, func);
      return dom;
    },

    /**
     *
     * @param elem
     * @param className
     */
    addClass: function addClass(elem, className) {
      if (elem.className === undefined) {
        elem.className = className;
      } else if (elem.className !== className) {
        var classes = elem.className.split(/ +/);
        if (classes.indexOf(className) == -1) {
          classes.push(className);
          elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
        }
      }
      return dom;
    },

    /**
     *
     * @param elem
     * @param className
     */
    removeClass: function removeClass(elem, className) {
      if (className) {
        if (elem.className === undefined) {
          // elem.className = className;
        } else if (elem.className === className) {
            elem.removeAttribute('class');
          } else {
            var classes = elem.className.split(/ +/);
            var index = classes.indexOf(className);
            if (index != -1) {
              classes.splice(index, 1);
              elem.className = classes.join(' ');
            }
          }
      } else {
        elem.className = undefined;
      }
      return dom;
    },

    hasClass: function hasClass(elem, className) {
      return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
    },

    /**
     *
     * @param elem
     */
    getWidth: function getWidth(elem) {

      var style = getComputedStyle(elem);

      return cssValueToPixels(style['border-left-width']) + cssValueToPixels(style['border-right-width']) + cssValueToPixels(style['padding-left']) + cssValueToPixels(style['padding-right']) + cssValueToPixels(style['width']);
    },

    /**
     *
     * @param elem
     */
    getHeight: function getHeight(elem) {

      var style = getComputedStyle(elem);

      return cssValueToPixels(style['border-top-width']) + cssValueToPixels(style['border-bottom-width']) + cssValueToPixels(style['padding-top']) + cssValueToPixels(style['padding-bottom']) + cssValueToPixels(style['height']);
    },

    /**
     *
     * @param elem
     */
    getOffset: function getOffset(elem) {
      var offset = { left: 0, top: 0 };
      if (elem.offsetParent) {
        do {
          offset.left += elem.offsetLeft;
          offset.top += elem.offsetTop;
        } while (elem = elem.offsetParent);
      }
      return offset;
    },

    // http://stackoverflow.com/posts/2684561/revisions
    /**
     * 
     * @param elem
     */
    isActive: function isActive(elem) {
      return elem === document.activeElement && (elem.type || elem.href);
    }

  };

  return dom;
})(dat.utils.common);

dat.controllers.OptionController = (function (Controller, dom, common) {

  /**
   * @class Provides a select input to alter the property of an object, using a
   * list of accepted values.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object|string[]} options A map of labels to acceptable values, or
   * a list of acceptable string values.
   *
   * @member dat.controllers
   */
  var OptionController = function OptionController(object, property, options) {

    OptionController.superclass.call(this, object, property);

    var _this = this;

    /**
     * The drop down menu
     * @ignore
     */
    this.__select = document.createElement('select');

    if (common.isArray(options)) {
      var map = {};
      common.each(options, function (element) {
        map[element] = element;
      });
      options = map;
    }

    common.each(options, function (value, key) {

      var opt = document.createElement('option');
      opt.innerHTML = key;
      opt.setAttribute('value', value);
      _this.__select.appendChild(opt);
    });

    // Acknowledge original value
    this.updateDisplay();

    dom.bind(this.__select, 'change', function () {
      var desiredValue = this.options[this.selectedIndex].value;
      _this.setValue(desiredValue);
    });

    this.domElement.appendChild(this.__select);
  };

  OptionController.superclass = Controller;

  common.extend(OptionController.prototype, Controller.prototype, {

    setValue: function setValue(v) {
      var toReturn = OptionController.superclass.prototype.setValue.call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      return toReturn;
    },

    updateDisplay: function updateDisplay() {
      this.__select.value = this.getValue();
      return OptionController.superclass.prototype.updateDisplay.call(this);
    }

  });

  return OptionController;
})(dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.controllers.NumberController = (function (Controller, common) {

  /**
   * @class Represents a given property of an object that is a number.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object} [params] Optional parameters
   * @param {Number} [params.min] Minimum allowed value
   * @param {Number} [params.max] Maximum allowed value
   * @param {Number} [params.step] Increment by which to change value
   *
   * @member dat.controllers
   */
  var NumberController = function NumberController(object, property, params) {

    NumberController.superclass.call(this, object, property);

    params = params || {};

    this.__min = params.min;
    this.__max = params.max;
    this.__step = params.step;

    if (common.isUndefined(this.__step)) {

      if (this.initialValue == 0) {
        this.__impliedStep = 1; // What are we, psychics?
      } else {
          // Hey Doug, check this out.
          this.__impliedStep = Math.pow(10, Math.floor(Math.log(this.initialValue) / Math.LN10)) / 10;
        }
    } else {

      this.__impliedStep = this.__step;
    }

    this.__precision = numDecimals(this.__impliedStep);
  };

  NumberController.superclass = Controller;

  common.extend(NumberController.prototype, Controller.prototype,

  /** @lends dat.controllers.NumberController.prototype */
  {

    setValue: function setValue(v) {

      if (this.__min !== undefined && v < this.__min) {
        v = this.__min;
      } else if (this.__max !== undefined && v > this.__max) {
        v = this.__max;
      }

      if (this.__step !== undefined && v % this.__step != 0) {
        v = Math.round(v / this.__step) * this.__step;
      }

      return NumberController.superclass.prototype.setValue.call(this, v);
    },

    /**
     * Specify a minimum value for <code>object[property]</code>.
     *
     * @param {Number} minValue The minimum value for
     * <code>object[property]</code>
     * @returns {dat.controllers.NumberController} this
     */
    min: function min(v) {
      this.__min = v;
      return this;
    },

    /**
     * Specify a maximum value for <code>object[property]</code>.
     *
     * @param {Number} maxValue The maximum value for
     * <code>object[property]</code>
     * @returns {dat.controllers.NumberController} this
     */
    max: function max(v) {
      this.__max = v;
      return this;
    },

    /**
     * Specify a step value that dat.controllers.NumberController
     * increments by.
     *
     * @param {Number} stepValue The step value for
     * dat.controllers.NumberController
     * @default if minimum and maximum specified increment is 1% of the
     * difference otherwise stepValue is 1
     * @returns {dat.controllers.NumberController} this
     */
    step: function step(v) {
      this.__step = v;
      return this;
    }

  });

  function numDecimals(x) {
    x = x.toString();
    if (x.indexOf('.') > -1) {
      return x.length - x.indexOf('.') - 1;
    } else {
      return 0;
    }
  }

  return NumberController;
})(dat.controllers.Controller, dat.utils.common);

dat.controllers.NumberControllerBox = (function (NumberController, dom, common) {

  /**
   * @class Represents a given property of an object that is a number and
   * provides an input element with which to manipulate it.
   *
   * @extends dat.controllers.Controller
   * @extends dat.controllers.NumberController
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object} [params] Optional parameters
   * @param {Number} [params.min] Minimum allowed value
   * @param {Number} [params.max] Maximum allowed value
   * @param {Number} [params.step] Increment by which to change value
   *
   * @member dat.controllers
   */
  var NumberControllerBox = function NumberControllerBox(object, property, params) {

    this.__truncationSuspended = false;

    NumberControllerBox.superclass.call(this, object, property, params);

    var _this = this;

    /**
     * {Number} Previous mouse y position
     * @ignore
     */
    var prev_y;

    this.__input = document.createElement('input');
    this.__input.setAttribute('type', 'text');

    // Makes it so manually specified values are not truncated.

    dom.bind(this.__input, 'change', onChange);
    dom.bind(this.__input, 'blur', onBlur);
    dom.bind(this.__input, 'mousedown', onMouseDown);
    dom.bind(this.__input, 'keydown', function (e) {

      // When pressing entire, you can be as precise as you want.
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
      }
    });

    function onChange() {
      var attempted = parseFloat(_this.__input.value);
      if (!common.isNaN(attempted)) _this.setValue(attempted);
    }

    function onBlur() {
      onChange();
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    function onMouseDown(e) {
      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);
      prev_y = e.clientY;
    }

    function onMouseDrag(e) {

      var diff = prev_y - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);

      prev_y = e.clientY;
    }

    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
    }

    this.updateDisplay();

    this.domElement.appendChild(this.__input);
  };

  NumberControllerBox.superclass = NumberController;

  common.extend(NumberControllerBox.prototype, NumberController.prototype, {

    updateDisplay: function updateDisplay() {

      this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
      return NumberControllerBox.superclass.prototype.updateDisplay.call(this);
    }

  });

  function roundToDecimal(value, decimals) {
    var tenTo = Math.pow(10, decimals);
    return Math.round(value * tenTo) / tenTo;
  }

  return NumberControllerBox;
})(dat.controllers.NumberController, dat.dom.dom, dat.utils.common);

dat.controllers.NumberControllerSlider = (function (NumberController, dom, css, common, styleSheet) {

  /**
   * @class Represents a given property of an object that is a number, contains
   * a minimum and maximum, and provides a slider element with which to
   * manipulate it. It should be noted that the slider element is made up of
   * <code>&lt;div&gt;</code> tags, <strong>not</strong> the html5
   * <code>&lt;slider&gt;</code> element.
   *
   * @extends dat.controllers.Controller
   * @extends dat.controllers.NumberController
   * 
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Number} minValue Minimum allowed value
   * @param {Number} maxValue Maximum allowed value
   * @param {Number} stepValue Increment by which to change value
   *
   * @member dat.controllers
   */
  var NumberControllerSlider = function NumberControllerSlider(object, property, min, max, step) {

    NumberControllerSlider.superclass.call(this, object, property, { min: min, max: max, step: step });

    var _this = this;

    this.__background = document.createElement('div');
    this.__foreground = document.createElement('div');

    dom.bind(this.__background, 'mousedown', onMouseDown);

    dom.addClass(this.__background, 'slider');
    dom.addClass(this.__foreground, 'slider-fg');

    function onMouseDown(e) {

      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);

      onMouseDrag(e);
    }

    function onMouseDrag(e) {

      e.preventDefault();

      var offset = dom.getOffset(_this.__background);
      var width = dom.getWidth(_this.__background);

      _this.setValue(map(e.clientX, offset.left, offset.left + width, _this.__min, _this.__max));

      return false;
    }

    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    this.updateDisplay();

    this.__background.appendChild(this.__foreground);
    this.domElement.appendChild(this.__background);
  };

  NumberControllerSlider.superclass = NumberController;

  /**
   * Injects default stylesheet for slider elements.
   */
  NumberControllerSlider.useDefaultStyles = function () {
    css.inject(styleSheet);
  };

  common.extend(NumberControllerSlider.prototype, NumberController.prototype, {

    updateDisplay: function updateDisplay() {
      var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
      this.__foreground.style.width = pct * 100 + '%';
      return NumberControllerSlider.superclass.prototype.updateDisplay.call(this);
    }

  });

  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }

  return NumberControllerSlider;
})(dat.controllers.NumberController, dat.dom.dom, dat.utils.css, dat.utils.common, ".slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 1em;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}");

dat.controllers.FunctionController = (function (Controller, dom, common) {

  /**
   * @class Provides a GUI interface to fire a specified method, a property of an object.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var FunctionController = function FunctionController(object, property, text) {

    FunctionController.superclass.call(this, object, property);

    var _this = this;

    this.__button = document.createElement('div');
    this.__button.innerHTML = text === undefined ? 'Fire' : text;
    dom.bind(this.__button, 'click', function (e) {
      e.preventDefault();
      _this.fire();
      return false;
    });

    dom.addClass(this.__button, 'button');

    this.domElement.appendChild(this.__button);
  };

  FunctionController.superclass = Controller;

  common.extend(FunctionController.prototype, Controller.prototype, {

    fire: function fire() {
      if (this.__onChange) {
        this.__onChange.call(this);
      }
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      this.getValue().call(this.object);
    }
  });

  return FunctionController;
})(dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.controllers.BooleanController = (function (Controller, dom, common) {

  /**
   * @class Provides a checkbox input to alter the boolean property of an object.
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var BooleanController = function BooleanController(object, property) {

    BooleanController.superclass.call(this, object, property);

    var _this = this;
    this.__prev = this.getValue();

    this.__checkbox = document.createElement('input');
    this.__checkbox.setAttribute('type', 'checkbox');

    dom.bind(this.__checkbox, 'change', onChange, false);

    this.domElement.appendChild(this.__checkbox);

    // Match original value
    this.updateDisplay();

    function onChange() {
      _this.setValue(!_this.__prev);
    }
  };

  BooleanController.superclass = Controller;

  common.extend(BooleanController.prototype, Controller.prototype, {

    setValue: function setValue(v) {
      var toReturn = BooleanController.superclass.prototype.setValue.call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      this.__prev = this.getValue();
      return toReturn;
    },

    updateDisplay: function updateDisplay() {

      if (this.getValue() === true) {
        this.__checkbox.setAttribute('checked', 'checked');
        this.__checkbox.checked = true;
      } else {
        this.__checkbox.checked = false;
      }

      return BooleanController.superclass.prototype.updateDisplay.call(this);
    }

  });

  return BooleanController;
})(dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.color.toString = (function (common) {

  return function (color) {

    if (color.a == 1 || common.isUndefined(color.a)) {

      var s = color.hex.toString(16);
      while (s.length < 6) {
        s = '0' + s;
      }

      return '#' + s;
    } else {

      return 'rgba(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ',' + color.a + ')';
    }
  };
})(dat.utils.common);

dat.color.interpret = (function (toString, common) {

  var result, toReturn;

  var interpret = function interpret() {

    toReturn = false;

    var original = arguments.length > 1 ? common.toArray(arguments) : arguments[0];

    common.each(INTERPRETATIONS, function (family) {

      if (family.litmus(original)) {

        common.each(family.conversions, function (conversion, conversionName) {

          result = conversion.read(original);

          if (toReturn === false && result !== false) {
            toReturn = result;
            result.conversionName = conversionName;
            result.conversion = conversion;
            return common.BREAK;
          }
        });

        return common.BREAK;
      }
    });

    return toReturn;
  };

  var INTERPRETATIONS = [

  // Strings
  {

    litmus: common.isString,

    conversions: {

      THREE_CHAR_HEX: {

        read: function read(original) {

          var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
          if (test === null) return false;

          return {
            space: 'HEX',
            hex: parseInt('0x' + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString())
          };
        },

        write: toString

      },

      SIX_CHAR_HEX: {

        read: function read(original) {

          var test = original.match(/^#([A-F0-9]{6})$/i);
          if (test === null) return false;

          return {
            space: 'HEX',
            hex: parseInt('0x' + test[1].toString())
          };
        },

        write: toString

      },

      CSS_RGB: {

        read: function read(original) {

          var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
          if (test === null) return false;

          return {
            space: 'RGB',
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3])
          };
        },

        write: toString

      },

      CSS_RGBA: {

        read: function read(original) {

          var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
          if (test === null) return false;

          return {
            space: 'RGB',
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3]),
            a: parseFloat(test[4])
          };
        },

        write: toString

      }

    }

  },

  // Numbers
  {

    litmus: common.isNumber,

    conversions: {

      HEX: {
        read: function read(original) {
          return {
            space: 'HEX',
            hex: original,
            conversionName: 'HEX'
          };
        },

        write: function write(color) {
          return color.hex;
        }
      }

    }

  },

  // Arrays
  {

    litmus: common.isArray,

    conversions: {

      RGB_ARRAY: {
        read: function read(original) {
          if (original.length != 3) return false;
          return {
            space: 'RGB',
            r: original[0],
            g: original[1],
            b: original[2]
          };
        },

        write: function write(color) {
          return [color.r, color.g, color.b];
        }

      },

      RGBA_ARRAY: {
        read: function read(original) {
          if (original.length != 4) return false;
          return {
            space: 'RGB',
            r: original[0],
            g: original[1],
            b: original[2],
            a: original[3]
          };
        },

        write: function write(color) {
          return [color.r, color.g, color.b, color.a];
        }

      }

    }

  },

  // Objects
  {

    litmus: common.isObject,

    conversions: {

      RGBA_OBJ: {
        read: function read(original) {
          if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b) && common.isNumber(original.a)) {
            return {
              space: 'RGB',
              r: original.r,
              g: original.g,
              b: original.b,
              a: original.a
            };
          }
          return false;
        },

        write: function write(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a
          };
        }
      },

      RGB_OBJ: {
        read: function read(original) {
          if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b)) {
            return {
              space: 'RGB',
              r: original.r,
              g: original.g,
              b: original.b
            };
          }
          return false;
        },

        write: function write(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b
          };
        }
      },

      HSVA_OBJ: {
        read: function read(original) {
          if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v) && common.isNumber(original.a)) {
            return {
              space: 'HSV',
              h: original.h,
              s: original.s,
              v: original.v,
              a: original.a
            };
          }
          return false;
        },

        write: function write(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v,
            a: color.a
          };
        }
      },

      HSV_OBJ: {
        read: function read(original) {
          if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v)) {
            return {
              space: 'HSV',
              h: original.h,
              s: original.s,
              v: original.v
            };
          }
          return false;
        },

        write: function write(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v
          };
        }

      }

    }

  }];

  return interpret;
})(dat.color.toString, dat.utils.common);

dat.GUI = dat.gui.GUI = (function (css, saveDialogueContents, styleSheet, controllerFactory, Controller, BooleanController, FunctionController, NumberControllerBox, NumberControllerSlider, OptionController, ColorController, requestAnimationFrame, CenteredDiv, dom, common) {

  css.inject(styleSheet);

  /** Outer-most className for GUI's */
  var CSS_NAMESPACE = 'dg';

  var HIDE_KEY_CODE = 72;

  /** The only value shared between the JS and SCSS. Use caution. */
  var CLOSE_BUTTON_HEIGHT = 20;

  var DEFAULT_DEFAULT_PRESET_NAME = 'Default';

  var SUPPORTS_LOCAL_STORAGE = (function () {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  })();

  var SAVE_DIALOGUE;

  /** Have we yet to create an autoPlace GUI? */
  var auto_place_virgin = true;

  /** Fixed position div that auto place GUI's go inside */
  var auto_place_container;

  /** Are we hiding the GUI's ? */
  var hide = false;

  /** GUI's which should be hidden */
  var hideable_guis = [];

  /**
   * A lightweight controller library for JavaScript. It allows you to easily
   * manipulate variables and fire functions on the fly.
   * @class
   *
   * @member dat.gui
   *
   * @param {Object} [params]
   * @param {String} [params.name] The name of this GUI.
   * @param {Object} [params.load] JSON object representing the saved state of
   * this GUI.
   * @param {Boolean} [params.auto=true]
   * @param {dat.gui.GUI} [params.parent] The GUI I'm nested in.
   * @param {Boolean} [params.closed] If true, starts closed
   */
  var GUI = function GUI(params) {

    var _this = this;

    /**
     * Outermost DOM Element
     * @type DOMElement
     */
    this.domElement = document.createElement('div');
    this.__ul = document.createElement('ul');
    this.domElement.appendChild(this.__ul);

    dom.addClass(this.domElement, CSS_NAMESPACE);

    /**
     * Nested GUI's by name
     * @ignore
     */
    this.__folders = {};

    this.__controllers = [];

    /**
     * List of objects I'm remembering for save, only used in top level GUI
     * @ignore
     */
    this.__rememberedObjects = [];

    /**
     * Maps the index of remembered objects to a map of controllers, only used
     * in top level GUI.
     *
     * @private
     * @ignore
     *
     * @example
     * [
     *  {
     *    propertyName: Controller,
     *    anotherPropertyName: Controller
     *  },
     *  {
     *    propertyName: Controller
     *  }
     * ]
     */
    this.__rememberedObjectIndecesToControllers = [];

    this.__listening = [];

    params = params || {};

    // Default parameters
    params = common.defaults(params, {
      autoPlace: true,
      width: GUI.DEFAULT_WIDTH
    });

    params = common.defaults(params, {
      resizable: params.autoPlace,
      hideable: params.autoPlace
    });

    if (!common.isUndefined(params.load)) {

      // Explicit preset
      if (params.preset) params.load.preset = params.preset;
    } else {

      params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
    }

    if (common.isUndefined(params.parent) && params.hideable) {
      hideable_guis.push(this);
    }

    // Only root level GUI's are resizable.
    params.resizable = common.isUndefined(params.parent) && params.resizable;

    if (params.autoPlace && common.isUndefined(params.scrollable)) {
      params.scrollable = true;
    }
    //    params.scrollable = common.isUndefined(params.parent) && params.scrollable === true;

    // Not part of params because I don't want people passing this in via
    // constructor. Should be a 'remembered' value.
    var use_local_storage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';

    Object.defineProperties(this,

    /** @lends dat.gui.GUI.prototype */
    {

      /**
       * The parent <code>GUI</code>
       * @type dat.gui.GUI
       */
      parent: {
        get: function get() {
          return params.parent;
        }
      },

      scrollable: {
        get: function get() {
          return params.scrollable;
        }
      },

      /**
       * Handles <code>GUI</code>'s element placement for you
       * @type Boolean
       */
      autoPlace: {
        get: function get() {
          return params.autoPlace;
        }
      },

      /**
       * The identifier for a set of saved values
       * @type String
       */
      preset: {

        get: function get() {
          if (_this.parent) {
            return _this.getRoot().preset;
          } else {
            return params.load.preset;
          }
        },

        set: function set(v) {
          if (_this.parent) {
            _this.getRoot().preset = v;
          } else {
            params.load.preset = v;
          }
          setPresetSelectIndex(this);
          _this.revert();
        }

      },

      /**
       * The width of <code>GUI</code> element
       * @type Number
       */
      width: {
        get: function get() {
          return params.width;
        },
        set: function set(v) {
          params.width = v;
          setWidth(_this, v);
        }
      },

      /**
       * The name of <code>GUI</code>. Used for folders. i.e
       * a folder's name
       * @type String
       */
      name: {
        get: function get() {
          return params.name;
        },
        set: function set(v) {
          // TODO Check for collisions among sibling folders
          params.name = v;
          if (title_row_name) {
            title_row_name.innerHTML = params.name;
          }
        }
      },

      /**
       * Whether the <code>GUI</code> is collapsed or not
       * @type Boolean
       */
      closed: {
        get: function get() {
          return params.closed;
        },
        set: function set(v) {
          params.closed = v;
          if (params.closed) {
            dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
          } else {
            dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
          }
          // For browsers that aren't going to respect the CSS transition,
          // Lets just check our height against the window height right off
          // the bat.
          this.onResize();

          if (_this.__closeButton) {
            _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
          }
        }
      },

      /**
       * Contains all presets
       * @type Object
       */
      load: {
        get: function get() {
          return params.load;
        }
      },

      /**
       * Determines whether or not to use <a href="https://developer.mozilla.org/en/DOM/Storage#localStorage">localStorage</a> as the means for
       * <code>remember</code>ing
       * @type Boolean
       */
      useLocalStorage: {

        get: function get() {
          return use_local_storage;
        },
        set: function set(bool) {
          if (SUPPORTS_LOCAL_STORAGE) {
            use_local_storage = bool;
            if (bool) {
              dom.bind(window, 'unload', saveToLocalStorage);
            } else {
              dom.unbind(window, 'unload', saveToLocalStorage);
            }
            localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
          }
        }

      }

    });

    // Are we a root level GUI?
    if (common.isUndefined(params.parent)) {

      params.closed = false;

      dom.addClass(this.domElement, GUI.CLASS_MAIN);
      dom.makeSelectable(this.domElement, false);

      // Are we supposed to be loading locally?
      if (SUPPORTS_LOCAL_STORAGE) {

        if (use_local_storage) {

          _this.useLocalStorage = true;

          var saved_gui = localStorage.getItem(getLocalStorageHash(this, 'gui'));

          if (saved_gui) {
            params.load = JSON.parse(saved_gui);
          }
        }
      }

      this.__closeButton = document.createElement('div');
      this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
      this.domElement.appendChild(this.__closeButton);

      dom.bind(this.__closeButton, 'click', function () {

        _this.closed = !_this.closed;
      });

      // Oh, you're a nested GUI!
    } else {

        if (params.closed === undefined) {
          params.closed = true;
        }

        var title_row_name = document.createTextNode(params.name);
        dom.addClass(title_row_name, 'controller-name');

        var title_row = addRow(_this, title_row_name);

        var on_click_title = function on_click_title(e) {
          e.preventDefault();
          _this.closed = !_this.closed;
          return false;
        };

        dom.addClass(this.__ul, GUI.CLASS_CLOSED);

        dom.addClass(title_row, 'title');
        dom.bind(title_row, 'click', on_click_title);

        if (!params.closed) {
          this.closed = false;
        }
      }

    if (params.autoPlace) {

      if (common.isUndefined(params.parent)) {

        if (auto_place_virgin) {
          auto_place_container = document.createElement('div');
          dom.addClass(auto_place_container, CSS_NAMESPACE);
          dom.addClass(auto_place_container, GUI.CLASS_AUTO_PLACE_CONTAINER);
          document.body.appendChild(auto_place_container);
          auto_place_virgin = false;
        }

        // Put it in the dom for you.
        auto_place_container.appendChild(this.domElement);

        // Apply the auto styles
        dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
      }

      // Make it not elastic.
      if (!this.parent) setWidth(_this, params.width);
    }

    dom.bind(window, 'resize', function () {
      _this.onResize();
    });
    dom.bind(this.__ul, 'webkitTransitionEnd', function () {
      _this.onResize();
    });
    dom.bind(this.__ul, 'transitionend', function () {
      _this.onResize();
    });
    dom.bind(this.__ul, 'oTransitionEnd', function () {
      _this.onResize();
    });
    this.onResize();

    if (params.resizable) {
      addResizeHandle(this);
    }

    function saveToLocalStorage() {
      localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
    }

    var root = _this.getRoot();
    function resetWidth() {
      var root = _this.getRoot();
      root.width += 1;
      common.defer(function () {
        root.width -= 1;
      });
    }

    if (!params.parent) {
      resetWidth();
    }
  };

  GUI.toggleHide = function () {

    hide = !hide;
    common.each(hideable_guis, function (gui) {
      gui.domElement.style.zIndex = hide ? -999 : 999;
      gui.domElement.style.opacity = hide ? 0 : 1;
    });
  };

  GUI.CLASS_AUTO_PLACE = 'a';
  GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
  GUI.CLASS_MAIN = 'main';
  GUI.CLASS_CONTROLLER_ROW = 'cr';
  GUI.CLASS_TOO_TALL = 'taller-than-window';
  GUI.CLASS_CLOSED = 'closed';
  GUI.CLASS_CLOSE_BUTTON = 'close-button';
  GUI.CLASS_DRAG = 'drag';

  GUI.DEFAULT_WIDTH = 245;
  GUI.TEXT_CLOSED = 'Close Controls';
  GUI.TEXT_OPEN = 'Open Controls';

  dom.bind(window, 'keydown', function (e) {

    if (document.activeElement.type !== 'text' && (e.which === HIDE_KEY_CODE || e.keyCode == HIDE_KEY_CODE)) {
      GUI.toggleHide();
    }
  }, false);

  common.extend(GUI.prototype,

  /** @lends dat.gui.GUI */
  {

    /**
     * @param object
     * @param property
     * @returns {dat.controllers.Controller} The new controller that was added.
     * @instance
     */
    add: function add(object, property) {

      return _add(this, object, property, {
        factoryArgs: Array.prototype.slice.call(arguments, 2)
      });
    },

    /**
     * @param object
     * @param property
     * @returns {dat.controllers.ColorController} The new controller that was added.
     * @instance
     */
    addColor: function addColor(object, property) {

      return _add(this, object, property, {
        color: true
      });
    },

    /**
     * @param controller
     * @instance
     */
    remove: function remove(controller) {

      // TODO listening?
      this.__ul.removeChild(controller.__li);
      this.__controllers.slice(this.__controllers.indexOf(controller), 1);
      var _this = this;
      common.defer(function () {
        _this.onResize();
      });
    },

    destroy: function destroy() {

      if (this.autoPlace) {
        auto_place_container.removeChild(this.domElement);
      }
    },

    /**
     * @param name
     * @returns {dat.gui.GUI} The new folder.
     * @throws {Error} if this GUI already has a folder by the specified
     * name
     * @instance
     */
    addFolder: function addFolder(name) {

      // We have to prevent collisions on names in order to have a key
      // by which to remember saved values
      if (this.__folders[name] !== undefined) {
        throw new Error('You already have a folder in this GUI by the' + ' name "' + name + '"');
      }

      var new_gui_params = { name: name, parent: this };

      // We need to pass down the autoPlace trait so that we can
      // attach event listeners to open/close folder actions to
      // ensure that a scrollbar appears if the window is too short.
      new_gui_params.autoPlace = this.autoPlace;

      // Do we have saved appearance data for this folder?

      if (this.load && // Anything loaded?
      this.load.folders && // Was my parent a dead-end?
      this.load.folders[name]) {
        // Did daddy remember me?

        // Start me closed if I was closed
        new_gui_params.closed = this.load.folders[name].closed;

        // Pass down the loaded data
        new_gui_params.load = this.load.folders[name];
      }

      var gui = new GUI(new_gui_params);
      this.__folders[name] = gui;

      var li = addRow(this, gui.domElement);
      dom.addClass(li, 'folder');
      return gui;
    },

    open: function open() {
      this.closed = false;
    },

    close: function close() {
      this.closed = true;
    },

    onResize: function onResize() {

      var root = this.getRoot();

      if (root.scrollable) {

        var top = dom.getOffset(root.__ul).top;
        var h = 0;

        common.each(root.__ul.childNodes, function (node) {
          if (!(root.autoPlace && node === root.__save_row)) h += dom.getHeight(node);
        });

        if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
          dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
        } else {
          dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = 'auto';
        }
      }

      if (root.__resize_handle) {
        common.defer(function () {
          root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
        });
      }

      if (root.__closeButton) {
        root.__closeButton.style.width = root.width + 'px';
      }
    },

    /**
     * Mark objects for saving. The order of these objects cannot change as
     * the GUI grows. When remembering new objects, append them to the end
     * of the list.
     *
     * @param {Object...} objects
     * @throws {Error} if not called on a top level GUI.
     * @instance
     */
    remember: function remember() {

      if (common.isUndefined(SAVE_DIALOGUE)) {
        SAVE_DIALOGUE = new CenteredDiv();
        SAVE_DIALOGUE.domElement.innerHTML = saveDialogueContents;
      }

      if (this.parent) {
        throw new Error("You can only call remember on a top level GUI.");
      }

      var _this = this;

      common.each(Array.prototype.slice.call(arguments), function (object) {
        if (_this.__rememberedObjects.length == 0) {
          addSaveMenu(_this);
        }
        if (_this.__rememberedObjects.indexOf(object) == -1) {
          _this.__rememberedObjects.push(object);
        }
      });

      if (this.autoPlace) {
        // Set save row width
        setWidth(this, this.width);
      }
    },

    /**
     * @returns {dat.gui.GUI} the topmost parent GUI of a nested GUI.
     * @instance
     */
    getRoot: function getRoot() {
      var gui = this;
      while (gui.parent) {
        gui = gui.parent;
      }
      return gui;
    },

    /**
     * @returns {Object} a JSON object representing the current state of
     * this GUI as well as its remembered properties.
     * @instance
     */
    getSaveObject: function getSaveObject() {

      var toReturn = this.load;

      toReturn.closed = this.closed;

      // Am I remembering any values?
      if (this.__rememberedObjects.length > 0) {

        toReturn.preset = this.preset;

        if (!toReturn.remembered) {
          toReturn.remembered = {};
        }

        toReturn.remembered[this.preset] = getCurrentPreset(this);
      }

      toReturn.folders = {};
      common.each(this.__folders, function (element, key) {
        toReturn.folders[key] = element.getSaveObject();
      });

      return toReturn;
    },

    save: function save() {

      if (!this.load.remembered) {
        this.load.remembered = {};
      }

      this.load.remembered[this.preset] = getCurrentPreset(this);
      markPresetModified(this, false);
    },

    saveAs: function saveAs(presetName) {

      if (!this.load.remembered) {

        // Retain default values upon first save
        this.load.remembered = {};
        this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
      }

      this.load.remembered[presetName] = getCurrentPreset(this);
      this.preset = presetName;
      addPresetOption(this, presetName, true);
    },

    revert: function revert(gui) {

      common.each(this.__controllers, function (controller) {
        // Make revert work on Default.
        if (!this.getRoot().load.remembered) {
          controller.setValue(controller.initialValue);
        } else {
          recallSavedValue(gui || this.getRoot(), controller);
        }
      }, this);

      common.each(this.__folders, function (folder) {
        folder.revert(folder);
      });

      if (!gui) {
        markPresetModified(this.getRoot(), false);
      }
    },

    listen: function listen(controller) {

      var init = this.__listening.length == 0;
      this.__listening.push(controller);
      if (init) updateDisplays(this.__listening);
    }

  });

  function _add(gui, object, property, params) {

    if (object[property] === undefined) {
      throw new Error("Object " + object + " has no property \"" + property + "\"");
    }

    var controller;

    if (params.color) {

      controller = new ColorController(object, property);
    } else {

      var factoryArgs = [object, property].concat(params.factoryArgs);
      controller = controllerFactory.apply(gui, factoryArgs);
    }

    if (params.before instanceof Controller) {
      params.before = params.before.__li;
    }

    recallSavedValue(gui, controller);

    dom.addClass(controller.domElement, 'c');

    var name = document.createElement('span');
    dom.addClass(name, 'property-name');
    name.innerHTML = controller.property;

    var container = document.createElement('div');
    container.appendChild(name);
    container.appendChild(controller.domElement);

    var li = addRow(gui, container, params.before);

    dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
    dom.addClass(li, typeof controller.getValue());

    augmentController(gui, li, controller);

    gui.__controllers.push(controller);

    return controller;
  }

  /**
   * Add a row to the end of the GUI or before another row.
   *
   * @param gui
   * @param [dom] If specified, inserts the dom content in the new row
   * @param [liBefore] If specified, places the new row before another row
   */
  function addRow(gui, dom, liBefore) {
    var li = document.createElement('li');
    if (dom) li.appendChild(dom);
    if (liBefore) {
      gui.__ul.insertBefore(li, params.before);
    } else {
      gui.__ul.appendChild(li);
    }
    gui.onResize();
    return li;
  }

  function augmentController(gui, li, controller) {

    controller.__li = li;
    controller.__gui = gui;

    common.extend(controller, {

      options: function options(_options) {

        if (arguments.length > 1) {
          controller.remove();

          return _add(gui, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [common.toArray(arguments)]
          });
        }

        if (common.isArray(_options) || common.isObject(_options)) {
          controller.remove();

          return _add(gui, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [_options]
          });
        }
      },

      name: function name(v) {
        controller.__li.firstElementChild.firstElementChild.innerHTML = v;
        return controller;
      },

      listen: function listen() {
        controller.__gui.listen(controller);
        return controller;
      },

      remove: function remove() {
        controller.__gui.remove(controller);
        return controller;
      }

    });

    // All sliders should be accompanied by a box.
    if (controller instanceof NumberControllerSlider) {

      var box = new NumberControllerBox(controller.object, controller.property, { min: controller.__min, max: controller.__max, step: controller.__step });

      common.each(['updateDisplay', 'onChange', 'onFinishChange'], function (method) {
        var pc = controller[method];
        var pb = box[method];
        controller[method] = box[method] = function () {
          var args = Array.prototype.slice.call(arguments);
          pc.apply(controller, args);
          return pb.apply(box, args);
        };
      });

      dom.addClass(li, 'has-slider');
      controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
    } else if (controller instanceof NumberControllerBox) {

      var r = function r(returned) {

        // Have we defined both boundaries?
        if (common.isNumber(controller.__min) && common.isNumber(controller.__max)) {

          // Well, then lets just replace this with a slider.
          controller.remove();
          return _add(gui, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [controller.__min, controller.__max, controller.__step]
          });
        }

        return returned;
      };

      controller.min = common.compose(r, controller.min);
      controller.max = common.compose(r, controller.max);
    } else if (controller instanceof BooleanController) {

      dom.bind(li, 'click', function () {
        dom.fakeEvent(controller.__checkbox, 'click');
      });

      dom.bind(controller.__checkbox, 'click', function (e) {
        e.stopPropagation(); // Prevents double-toggle
      });
    } else if (controller instanceof FunctionController) {

        dom.bind(li, 'click', function () {
          dom.fakeEvent(controller.__button, 'click');
        });

        dom.bind(li, 'mouseover', function () {
          dom.addClass(controller.__button, 'hover');
        });

        dom.bind(li, 'mouseout', function () {
          dom.removeClass(controller.__button, 'hover');
        });
      } else if (controller instanceof ColorController) {

        dom.addClass(li, 'color');
        controller.updateDisplay = common.compose(function (r) {
          li.style.borderLeftColor = controller.__color.toString();
          return r;
        }, controller.updateDisplay);

        controller.updateDisplay();
      }

    controller.setValue = common.compose(function (r) {
      if (gui.getRoot().__preset_select && controller.isModified()) {
        markPresetModified(gui.getRoot(), true);
      }
      return r;
    }, controller.setValue);
  }

  function recallSavedValue(gui, controller) {

    // Find the topmost GUI, that's where remembered objects live.
    var root = gui.getRoot();

    // Does the object we're controlling match anything we've been told to
    // remember?
    var matched_index = root.__rememberedObjects.indexOf(controller.object);

    // Why yes, it does!
    if (matched_index != -1) {

      // Let me fetch a map of controllers for thcommon.isObject.
      var controller_map = root.__rememberedObjectIndecesToControllers[matched_index];

      // Ohp, I believe this is the first controller we've created for this
      // object. Lets make the map fresh.
      if (controller_map === undefined) {
        controller_map = {};
        root.__rememberedObjectIndecesToControllers[matched_index] = controller_map;
      }

      // Keep track of this controller
      controller_map[controller.property] = controller;

      // Okay, now have we saved any values for this controller?
      if (root.load && root.load.remembered) {

        var preset_map = root.load.remembered;

        // Which preset are we trying to load?
        var preset;

        if (preset_map[gui.preset]) {

          preset = preset_map[gui.preset];
        } else if (preset_map[DEFAULT_DEFAULT_PRESET_NAME]) {

          // Uhh, you can have the default instead?
          preset = preset_map[DEFAULT_DEFAULT_PRESET_NAME];
        } else {

          // Nada.

          return;
        }

        // Did the loaded object remember thcommon.isObject?
        if (preset[matched_index] &&

        // Did we remember this particular property?
        preset[matched_index][controller.property] !== undefined) {

          // We did remember something for this guy ...
          var value = preset[matched_index][controller.property];

          // And that's what it is.
          controller.initialValue = value;
          controller.setValue(value);
        }
      }
    }
  }

  function getLocalStorageHash(gui, key) {
    // TODO how does this deal with multiple GUI's?
    return document.location.href + '.' + key;
  }

  function addSaveMenu(gui) {

    var div = gui.__save_row = document.createElement('li');

    dom.addClass(gui.domElement, 'has-save');

    gui.__ul.insertBefore(div, gui.__ul.firstChild);

    dom.addClass(div, 'save-row');

    var gears = document.createElement('span');
    gears.innerHTML = '&nbsp;';
    dom.addClass(gears, 'button gears');

    // TODO replace with FunctionController
    var button = document.createElement('span');
    button.innerHTML = 'Save';
    dom.addClass(button, 'button');
    dom.addClass(button, 'save');

    var button2 = document.createElement('span');
    button2.innerHTML = 'New';
    dom.addClass(button2, 'button');
    dom.addClass(button2, 'save-as');

    var button3 = document.createElement('span');
    button3.innerHTML = 'Revert';
    dom.addClass(button3, 'button');
    dom.addClass(button3, 'revert');

    var select = gui.__preset_select = document.createElement('select');

    if (gui.load && gui.load.remembered) {

      common.each(gui.load.remembered, function (value, key) {
        addPresetOption(gui, key, key == gui.preset);
      });
    } else {
      addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
    }

    dom.bind(select, 'change', function () {

      for (var index = 0; index < gui.__preset_select.length; index++) {
        gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
      }

      gui.preset = this.value;
    });

    div.appendChild(select);
    div.appendChild(gears);
    div.appendChild(button);
    div.appendChild(button2);
    div.appendChild(button3);

    if (SUPPORTS_LOCAL_STORAGE) {
      var saveLocally;
      var explain;
      var localStorageCheckBox;

      (function () {
        var showHideExplain = function showHideExplain() {
          explain.style.display = gui.useLocalStorage ? 'block' : 'none';
        };

        saveLocally = document.getElementById('dg-save-locally');
        explain = document.getElementById('dg-local-explain');

        saveLocally.style.display = 'block';

        localStorageCheckBox = document.getElementById('dg-local-storage');

        if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
          localStorageCheckBox.setAttribute('checked', 'checked');
        }

        showHideExplain();

        // TODO: Use a boolean controller, fool!
        dom.bind(localStorageCheckBox, 'change', function () {
          gui.useLocalStorage = !gui.useLocalStorage;
          showHideExplain();
        });
      })();
    }

    var newConstructorTextArea = document.getElementById('dg-new-constructor');

    dom.bind(newConstructorTextArea, 'keydown', function (e) {
      if (e.metaKey && (e.which === 67 || e.keyCode == 67)) {
        SAVE_DIALOGUE.hide();
      }
    });

    dom.bind(gears, 'click', function () {
      newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
      SAVE_DIALOGUE.show();
      newConstructorTextArea.focus();
      newConstructorTextArea.select();
    });

    dom.bind(button, 'click', function () {
      gui.save();
    });

    dom.bind(button2, 'click', function () {
      var presetName = prompt('Enter a new preset name.');
      if (presetName) gui.saveAs(presetName);
    });

    dom.bind(button3, 'click', function () {
      gui.revert();
    });

    //    div.appendChild(button2);
  }

  function addResizeHandle(gui) {

    gui.__resize_handle = document.createElement('div');

    common.extend(gui.__resize_handle.style, {

      width: '6px',
      marginLeft: '-3px',
      height: '200px',
      cursor: 'ew-resize',
      position: 'absolute'
      //      border: '1px solid blue'

    });

    var pmouseX;

    dom.bind(gui.__resize_handle, 'mousedown', dragStart);
    dom.bind(gui.__closeButton, 'mousedown', dragStart);

    gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);

    function dragStart(e) {

      e.preventDefault();

      pmouseX = e.clientX;

      dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.bind(window, 'mousemove', drag);
      dom.bind(window, 'mouseup', dragStop);

      return false;
    }

    function drag(e) {

      e.preventDefault();

      gui.width += pmouseX - e.clientX;
      gui.onResize();
      pmouseX = e.clientX;

      return false;
    }

    function dragStop() {

      dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.unbind(window, 'mousemove', drag);
      dom.unbind(window, 'mouseup', dragStop);
    }
  }

  function setWidth(gui, w) {
    gui.domElement.style.width = w + 'px';
    // Auto placed save-rows are position fixed, so we have to
    // set the width manually if we want it to bleed to the edge
    if (gui.__save_row && gui.autoPlace) {
      gui.__save_row.style.width = w + 'px';
    }if (gui.__closeButton) {
      gui.__closeButton.style.width = w + 'px';
    }
  }

  function getCurrentPreset(gui, useInitialValues) {

    var toReturn = {};

    // For each object I'm remembering
    common.each(gui.__rememberedObjects, function (val, index) {

      var saved_values = {};

      // The controllers I've made for thcommon.isObject by property
      var controller_map = gui.__rememberedObjectIndecesToControllers[index];

      // Remember each value for each property
      common.each(controller_map, function (controller, property) {
        saved_values[property] = useInitialValues ? controller.initialValue : controller.getValue();
      });

      // Save the values for thcommon.isObject
      toReturn[index] = saved_values;
    });

    return toReturn;
  }

  function addPresetOption(gui, name, setSelected) {
    var opt = document.createElement('option');
    opt.innerHTML = name;
    opt.value = name;
    gui.__preset_select.appendChild(opt);
    if (setSelected) {
      gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
    }
  }

  function setPresetSelectIndex(gui) {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      if (gui.__preset_select[index].value == gui.preset) {
        gui.__preset_select.selectedIndex = index;
      }
    }
  }

  function markPresetModified(gui, modified) {
    var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
    //    console.log('mark', modified, opt);
    if (modified) {
      opt.innerHTML = opt.value + "*";
    } else {
      opt.innerHTML = opt.value;
    }
  }

  function updateDisplays(controllerArray) {

    if (controllerArray.length != 0) {

      requestAnimationFrame(function () {
        updateDisplays(controllerArray);
      });
    }

    common.each(controllerArray, function (c) {
      c.updateDisplay();
    });
  }

  return GUI;
})(dat.utils.css, "<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>", ".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity 0.1s linear;-o-transition:opacity 0.1s linear;-moz-transition:opacity 0.1s linear;transition:opacity 0.1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity 0.1s linear;-o-transition:opacity 0.1s linear;-moz-transition:opacity 0.1s linear;transition:opacity 0.1s linear;border:0;position:absolute;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-x:hidden}.dg.a.has-save ul{margin-top:27px}.dg.a.has-save ul.closed{margin-top:0}.dg.a .save-row{position:fixed;top:0;z-index:1002}.dg li{-webkit-transition:height 0.1s ease-out;-o-transition:height 0.1s ease-out;-moz-transition:height 0.1s ease-out;transition:height 0.1s ease-out}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;overflow:hidden;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li > *{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:9px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2fa1d6}.dg .cr.number input[type=text]{color:#2fa1d6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2fa1d6}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n", dat.controllers.factory = (function (OptionController, NumberControllerBox, NumberControllerSlider, StringController, FunctionController, BooleanController, common) {

  return function (object, property) {

    var initialValue = object[property];

    // Providing options?
    if (common.isArray(arguments[2]) || common.isObject(arguments[2])) {
      return new OptionController(object, property, arguments[2]);
    }

    // Providing a map?

    if (common.isNumber(initialValue)) {

      if (common.isNumber(arguments[2]) && common.isNumber(arguments[3])) {

        // Has min and max.
        return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
      } else {

        return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
      }
    }

    if (common.isString(initialValue)) {
      return new StringController(object, property);
    }

    if (common.isFunction(initialValue)) {
      return new FunctionController(object, property, '');
    }

    if (common.isBoolean(initialValue)) {
      return new BooleanController(object, property);
    }
  };
})(dat.controllers.OptionController, dat.controllers.NumberControllerBox, dat.controllers.NumberControllerSlider, dat.controllers.StringController = (function (Controller, dom, common) {

  /**
   * @class Provides a text input to alter the string property of an object.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var StringController = function StringController(object, property) {

    StringController.superclass.call(this, object, property);

    var _this = this;

    this.__input = document.createElement('input');
    this.__input.setAttribute('type', 'text');

    dom.bind(this.__input, 'keyup', onChange);
    dom.bind(this.__input, 'change', onChange);
    dom.bind(this.__input, 'blur', onBlur);
    dom.bind(this.__input, 'keydown', function (e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    });

    function onChange() {
      _this.setValue(_this.__input.value);
    }

    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    this.updateDisplay();

    this.domElement.appendChild(this.__input);
  };

  StringController.superclass = Controller;

  common.extend(StringController.prototype, Controller.prototype, {

    updateDisplay: function updateDisplay() {
      // Stops the caret from moving on account of:
      // keyup -> setValue -> updateDisplay
      if (!dom.isActive(this.__input)) {
        this.__input.value = this.getValue();
      }
      return StringController.superclass.prototype.updateDisplay.call(this);
    }

  });

  return StringController;
})(dat.controllers.Controller, dat.dom.dom, dat.utils.common), dat.controllers.FunctionController, dat.controllers.BooleanController, dat.utils.common), dat.controllers.Controller, dat.controllers.BooleanController, dat.controllers.FunctionController, dat.controllers.NumberControllerBox, dat.controllers.NumberControllerSlider, dat.controllers.OptionController, dat.controllers.ColorController = (function (Controller, dom, Color, interpret, common) {

  var ColorController = function ColorController(object, property) {

    ColorController.superclass.call(this, object, property);

    this.__color = new Color(this.getValue());
    this.__temp = new Color(0);

    var _this = this;

    this.domElement = document.createElement('div');

    dom.makeSelectable(this.domElement, false);

    this.__selector = document.createElement('div');
    this.__selector.className = 'selector';

    this.__saturation_field = document.createElement('div');
    this.__saturation_field.className = 'saturation-field';

    this.__field_knob = document.createElement('div');
    this.__field_knob.className = 'field-knob';
    this.__field_knob_border = '2px solid ';

    this.__hue_knob = document.createElement('div');
    this.__hue_knob.className = 'hue-knob';

    this.__hue_field = document.createElement('div');
    this.__hue_field.className = 'hue-field';

    this.__input = document.createElement('input');
    this.__input.type = 'text';
    this.__input_textShadow = '0 1px 1px ';

    dom.bind(this.__input, 'keydown', function (e) {
      if (e.keyCode === 13) {
        // on enter
        onBlur.call(this);
      }
    });

    dom.bind(this.__input, 'blur', onBlur);

    dom.bind(this.__selector, 'mousedown', function (e) {

      dom.addClass(this, 'drag').bind(window, 'mouseup', function (e) {
        dom.removeClass(_this.__selector, 'drag');
      });
    });

    var value_field = document.createElement('div');

    common.extend(this.__selector.style, {
      width: '122px',
      height: '102px',
      padding: '3px',
      backgroundColor: '#222',
      boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
    });

    common.extend(this.__field_knob.style, {
      position: 'absolute',
      width: '12px',
      height: '12px',
      border: this.__field_knob_border + (this.__color.v < .5 ? '#fff' : '#000'),
      boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
      borderRadius: '12px',
      zIndex: 1
    });

    common.extend(this.__hue_knob.style, {
      position: 'absolute',
      width: '15px',
      height: '2px',
      borderRight: '4px solid #fff',
      zIndex: 1
    });

    common.extend(this.__saturation_field.style, {
      width: '100px',
      height: '100px',
      border: '1px solid #555',
      marginRight: '3px',
      display: 'inline-block',
      cursor: 'pointer'
    });

    common.extend(value_field.style, {
      width: '100%',
      height: '100%',
      background: 'none'
    });

    linearGradient(value_field, 'top', 'rgba(0,0,0,0)', '#000');

    common.extend(this.__hue_field.style, {
      width: '15px',
      height: '100px',
      display: 'inline-block',
      border: '1px solid #555',
      cursor: 'ns-resize'
    });

    hueGradient(this.__hue_field);

    common.extend(this.__input.style, {
      outline: 'none',
      //      width: '120px',
      textAlign: 'center',
      //      padding: '4px',
      //      marginBottom: '6px',
      color: '#fff',
      border: 0,
      fontWeight: 'bold',
      textShadow: this.__input_textShadow + 'rgba(0,0,0,0.7)'
    });

    dom.bind(this.__saturation_field, 'mousedown', fieldDown);
    dom.bind(this.__field_knob, 'mousedown', fieldDown);

    dom.bind(this.__hue_field, 'mousedown', function (e) {
      setH(e);
      dom.bind(window, 'mousemove', setH);
      dom.bind(window, 'mouseup', unbindH);
    });

    function fieldDown(e) {
      setSV(e);
      // document.body.style.cursor = 'none';
      dom.bind(window, 'mousemove', setSV);
      dom.bind(window, 'mouseup', unbindSV);
    }

    function unbindSV() {
      dom.unbind(window, 'mousemove', setSV);
      dom.unbind(window, 'mouseup', unbindSV);
      // document.body.style.cursor = 'default';
    }

    function onBlur() {
      var i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
    }

    function unbindH() {
      dom.unbind(window, 'mousemove', setH);
      dom.unbind(window, 'mouseup', unbindH);
    }

    this.__saturation_field.appendChild(value_field);
    this.__selector.appendChild(this.__field_knob);
    this.__selector.appendChild(this.__saturation_field);
    this.__selector.appendChild(this.__hue_field);
    this.__hue_field.appendChild(this.__hue_knob);

    this.domElement.appendChild(this.__input);
    this.domElement.appendChild(this.__selector);

    this.updateDisplay();

    function setSV(e) {

      e.preventDefault();

      var w = dom.getWidth(_this.__saturation_field);
      var o = dom.getOffset(_this.__saturation_field);
      var s = (e.clientX - o.left + document.body.scrollLeft) / w;
      var v = 1 - (e.clientY - o.top + document.body.scrollTop) / w;

      if (v > 1) v = 1;else if (v < 0) v = 0;

      if (s > 1) s = 1;else if (s < 0) s = 0;

      _this.__color.v = v;
      _this.__color.s = s;

      _this.setValue(_this.__color.toOriginal());

      return false;
    }

    function setH(e) {

      e.preventDefault();

      var s = dom.getHeight(_this.__hue_field);
      var o = dom.getOffset(_this.__hue_field);
      var h = 1 - (e.clientY - o.top + document.body.scrollTop) / s;

      if (h > 1) h = 1;else if (h < 0) h = 0;

      _this.__color.h = h * 360;

      _this.setValue(_this.__color.toOriginal());

      return false;
    }
  };

  ColorController.superclass = Controller;

  common.extend(ColorController.prototype, Controller.prototype, {

    updateDisplay: function updateDisplay() {

      var i = interpret(this.getValue());

      if (i !== false) {

        var mismatch = false;

        // Check for mismatch on the interpreted value.

        common.each(Color.COMPONENTS, function (component) {
          if (!common.isUndefined(i[component]) && !common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
            mismatch = true;
            return {}; // break
          }
        }, this);

        // If nothing diverges, we keep our previous values
        // for statefulness, otherwise we recalculate fresh
        if (mismatch) {
          common.extend(this.__color.__state, i);
        }
      }

      common.extend(this.__temp.__state, this.__color.__state);

      this.__temp.a = 1;

      var flip = this.__color.v < .5 || this.__color.s > .5 ? 255 : 0;
      var _flip = 255 - flip;

      common.extend(this.__field_knob.style, {
        marginLeft: 100 * this.__color.s - 7 + 'px',
        marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
        backgroundColor: this.__temp.toString(),
        border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip + ')'
      });

      this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px';

      this.__temp.s = 1;
      this.__temp.v = 1;

      linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toString());

      common.extend(this.__input.style, {
        backgroundColor: this.__input.value = this.__color.toString(),
        color: 'rgb(' + flip + ',' + flip + ',' + flip + ')',
        textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip + ',.7)'
      });
    }

  });

  var vendors = ['-moz-', '-o-', '-webkit-', '-ms-', ''];

  function linearGradient(elem, x, a, b) {
    elem.style.background = '';
    common.each(vendors, function (vendor) {
      elem.style.cssText += 'background: ' + vendor + 'linear-gradient(' + x + ', ' + a + ' 0%, ' + b + ' 100%); ';
    });
  }

  function hueGradient(elem) {
    elem.style.background = '';
    elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);';
    elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  }

  return ColorController;
})(dat.controllers.Controller, dat.dom.dom, dat.color.Color = (function (interpret, math, _toString, common) {

  var Color = function Color() {

    this.__state = interpret.apply(this, arguments);

    if (this.__state === false) {
      throw 'Failed to interpret color arguments';
    }

    this.__state.a = this.__state.a || 1;
  };

  Color.COMPONENTS = ['r', 'g', 'b', 'h', 's', 'v', 'hex', 'a'];

  common.extend(Color.prototype, {

    toString: function toString() {
      return _toString(this);
    },

    toOriginal: function toOriginal() {
      return this.__state.conversion.write(this);
    }

  });

  defineRGBComponent(Color.prototype, 'r', 2);
  defineRGBComponent(Color.prototype, 'g', 1);
  defineRGBComponent(Color.prototype, 'b', 0);

  defineHSVComponent(Color.prototype, 'h');
  defineHSVComponent(Color.prototype, 's');
  defineHSVComponent(Color.prototype, 'v');

  Object.defineProperty(Color.prototype, 'a', {

    get: function get() {
      return this.__state.a;
    },

    set: function set(v) {
      this.__state.a = v;
    }

  });

  Object.defineProperty(Color.prototype, 'hex', {

    get: function get() {

      if (!this.__state.space !== 'HEX') {
        this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
      }

      return this.__state.hex;
    },

    set: function set(v) {

      this.__state.space = 'HEX';
      this.__state.hex = v;
    }

  });

  function defineRGBComponent(target, component, componentHexIndex) {

    Object.defineProperty(target, component, {

      get: function get() {

        if (this.__state.space === 'RGB') {
          return this.__state[component];
        }

        recalculateRGB(this, component, componentHexIndex);

        return this.__state[component];
      },

      set: function set(v) {

        if (this.__state.space !== 'RGB') {
          recalculateRGB(this, component, componentHexIndex);
          this.__state.space = 'RGB';
        }

        this.__state[component] = v;
      }

    });
  }

  function defineHSVComponent(target, component) {

    Object.defineProperty(target, component, {

      get: function get() {

        if (this.__state.space === 'HSV') return this.__state[component];

        recalculateHSV(this);

        return this.__state[component];
      },

      set: function set(v) {

        if (this.__state.space !== 'HSV') {
          recalculateHSV(this);
          this.__state.space = 'HSV';
        }

        this.__state[component] = v;
      }

    });
  }

  function recalculateRGB(color, component, componentHexIndex) {

    if (color.__state.space === 'HEX') {

      color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);
    } else if (color.__state.space === 'HSV') {

      common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
    } else {

      throw 'Corrupted color state';
    }
  }

  function recalculateHSV(color) {

    var result = math.rgb_to_hsv(color.r, color.g, color.b);

    common.extend(color.__state, {
      s: result.s,
      v: result.v
    });

    if (!common.isNaN(result.h)) {
      color.__state.h = result.h;
    } else if (common.isUndefined(color.__state.h)) {
      color.__state.h = 0;
    }
  }

  return Color;
})(dat.color.interpret, dat.color.math = (function () {

  var tmpComponent;

  return {

    hsv_to_rgb: function hsv_to_rgb(h, s, v) {

      var hi = Math.floor(h / 60) % 6;

      var f = h / 60 - Math.floor(h / 60);
      var p = v * (1.0 - s);
      var q = v * (1.0 - f * s);
      var t = v * (1.0 - (1.0 - f) * s);
      var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];

      return {
        r: c[0] * 255,
        g: c[1] * 255,
        b: c[2] * 255
      };
    },

    rgb_to_hsv: function rgb_to_hsv(r, g, b) {

      var min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          delta = max - min,
          h,
          s;

      if (max != 0) {
        s = delta / max;
      } else {
        return {
          h: NaN,
          s: 0,
          v: 0
        };
      }

      if (r == max) {
        h = (g - b) / delta;
      } else if (g == max) {
        h = 2 + (b - r) / delta;
      } else {
        h = 4 + (r - g) / delta;
      }
      h /= 6;
      if (h < 0) {
        h += 1;
      }

      return {
        h: h * 360,
        s: s,
        v: max / 255
      };
    },

    rgb_to_hex: function rgb_to_hex(r, g, b) {
      var hex = this.hex_with_component(0, 2, r);
      hex = this.hex_with_component(hex, 1, g);
      hex = this.hex_with_component(hex, 0, b);
      return hex;
    },

    component_from_hex: function component_from_hex(hex, componentIndex) {
      return hex >> componentIndex * 8 & 0xFF;
    },

    hex_with_component: function hex_with_component(hex, componentIndex, value) {
      return value << (tmpComponent = componentIndex * 8) | hex & ~(0xFF << tmpComponent);
    }

  };
})(), dat.color.toString, dat.utils.common), dat.color.interpret, dat.utils.common), dat.utils.requestAnimationFrame = (function () {

  /**
   * requirejs version of Paul Irish's RequestAnimationFrame
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   */

  return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback, element) {

    window.setTimeout(callback, 1000 / 60);
  };
})(), dat.dom.CenteredDiv = (function (dom, common) {

  var CenteredDiv = function CenteredDiv() {

    this.backgroundElement = document.createElement('div');
    common.extend(this.backgroundElement.style, {
      backgroundColor: 'rgba(0,0,0,0.8)',
      top: 0,
      left: 0,
      display: 'none',
      zIndex: '1000',
      opacity: 0,
      WebkitTransition: 'opacity 0.2s linear'
    });

    dom.makeFullscreen(this.backgroundElement);
    this.backgroundElement.style.position = 'fixed';

    this.domElement = document.createElement('div');
    common.extend(this.domElement.style, {
      position: 'fixed',
      display: 'none',
      zIndex: '1001',
      opacity: 0,
      WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear'
    });

    document.body.appendChild(this.backgroundElement);
    document.body.appendChild(this.domElement);

    var _this = this;
    dom.bind(this.backgroundElement, 'click', function () {
      _this.hide();
    });
  };

  CenteredDiv.prototype.show = function () {

    var _this = this;

    this.backgroundElement.style.display = 'block';

    this.domElement.style.display = 'block';
    this.domElement.style.opacity = 0;
    //    this.domElement.style.top = '52%';
    this.domElement.style.webkitTransform = 'scale(1.1)';

    this.layout();

    common.defer(function () {
      _this.backgroundElement.style.opacity = 1;
      _this.domElement.style.opacity = 1;
      _this.domElement.style.webkitTransform = 'scale(1)';
    });
  };

  CenteredDiv.prototype.hide = function () {

    var _this = this;

    var hide = function hide() {

      _this.domElement.style.display = 'none';
      _this.backgroundElement.style.display = 'none';

      dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
      dom.unbind(_this.domElement, 'transitionend', hide);
      dom.unbind(_this.domElement, 'oTransitionEnd', hide);
    };

    dom.bind(this.domElement, 'webkitTransitionEnd', hide);
    dom.bind(this.domElement, 'transitionend', hide);
    dom.bind(this.domElement, 'oTransitionEnd', hide);

    this.backgroundElement.style.opacity = 0;
    //    this.domElement.style.top = '48%';
    this.domElement.style.opacity = 0;
    this.domElement.style.webkitTransform = 'scale(1.1)';
  };

  CenteredDiv.prototype.layout = function () {
    this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + 'px';
    this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + 'px';
  };

  function lockScroll(e) {
    console.log(e);
  }

  return CenteredDiv;
})(dat.dom.dom, dat.utils.common), dat.dom.dom, dat.utils.common);

},{}],83:[function(require,module,exports){
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

'use strict';

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
EventEmitter.prototype.setMaxListeners = function (n) {
  if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function (type) {
  var er, handler, len, args, i, listeners;

  if (!this._events) this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler)) return false;

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
        for (i = 1; i < len; i++) args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++) args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++) listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function (type, listener) {
  var m;

  if (!isFunction(listener)) throw TypeError('listener must be a function');

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener) this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);else
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
      console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function (type, listener) {
  if (!isFunction(listener)) throw TypeError('listener must be a function');

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
EventEmitter.prototype.removeListener = function (type, listener) {
  var list, position, length, i;

  if (!isFunction(listener)) throw TypeError('listener must be a function');

  if (!this._events || !this._events[type]) return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener || isFunction(list.listener) && list.listener === listener) {
    delete this._events[type];
    if (this._events.removeListener) this.emit('removeListener', type, listener);
  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
        position = i;
        break;
      }
    }

    if (position < 0) return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener) this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function (type) {
  var key, listeners;

  if (!this._events) return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
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
    while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function (type) {
  var ret;
  if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function (emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type]) ret = 0;else if (isFunction(emitter._events[type])) ret = 1;else ret = emitter._events[type].length;
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

},{}],84:[function(require,module,exports){
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
	var options,
	    name,
	    src,
	    copy,
	    copyIsArray,
	    clone,
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
	} else if (typeof target !== 'object' && typeof target !== 'function' || target == null) {
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

},{}],85:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],86:[function(require,module,exports){
'use strict';

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
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
    ctor.super_ = superCtor;
    var TempCtor = function TempCtor() {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };
}

},{}],87:[function(require,module,exports){
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
 *
 * @extends {D3Table}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3BlockTable(options) {
    _D3Table2['default'].call(this, options);
}

(0, _inherits2['default'])(D3BlockTable, _D3Table2['default']);

D3BlockTable.prototype.defaults = (0, _extend2['default'])(true, {}, _D3Table2['default'].prototype.defaults, {
    clipElement: true,
    clipElementFilter: null,
    renderOnAutomaticScrollIdle: true,
    hideTicksOnAutomaticScroll: false,
    automaticScrollSpeedMultiplier: 2e-4,
    automaticScrollMarginDelta: 30,
    appendText: true,
    alignLeft: true,
    alignOnTranslate: true
});

D3BlockTable.prototype.generateClipPathId = function (d) {
    return this.options.bemBlockName + '-elementClipPath_' + this.instanceNumber + '_' + d.uid;
};

D3BlockTable.prototype.generateClipRectLink = function (d) {
    return '#' + this.generateClipRectId(d);
};

D3BlockTable.prototype.generateClipPathLink = function (d) {
    return 'url(#' + this.generateClipPathId(d) + ')';
};

D3BlockTable.prototype.generateClipRectId = function (d) {
    return this.options.bemBlockName + '-elementClipRect_' + this.instanceNumber + '_' + d.uid;
};

D3BlockTable.prototype.elementEnter = function (selection) {

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

    selection.on('click', function (d) {
        if (!d3.event.defaultPrevented) {
            self.emitDetailedEvent('element:click', selection, null, [d]);
        }
    });

    if (this.options.appendText) {
        selection.select('.timeline-elementMovableContent').append('text').classed('timeline-entityLabel', true).attr('dy', this.options.rowHeight / 2 + 4);
    }

    selection.call(this.elementContentEnter.bind(this));

    this.bindDragAndDropOnSelection(selection);
};

D3BlockTable.prototype.elementsTranslate = function (selection) {

    var self = this;

    var d = selection.datum();

    if (this.options.appendText && this.options.alignLeft && this.options.alignOnTranslate && !d._defaultPrevented) {

        selection.select('.' + this.options.bemBlockName + '-elementMovableContent').attr('transform', function (d) {
            return 'translate(' + Math.max(-self.scales.x(self.getDataStart(d)), 2) + ',0)';
        });
    }
};

D3BlockTable.prototype.elementContentEnter = function () {};

D3BlockTable.prototype.elementContentUpdate = function () {};

// @todo clean up
D3BlockTable.prototype.bindDragAndDropOnSelection = function (selection) {

    var self = this;
    var bodyNode = self.elements.body.node();

    // positions
    var currentTransform = null;
    var dragStartX = 0,
        dragStartY = 0;
    var elementStartX = 0,
        elementStartY = 0;
    var dragPosition;

    // movements
    var verticalMove = 0;
    var horizontalMove = 0;
    var verticalSpeed = 0;
    var horizontalSpeed = 0;
    var timerActive = false;
    var needTimerStop = false;

    // reset start position: to call on drag start or when things are redrawn
    function storeStart() {
        currentTransform = d3.transform(selection.attr('transform'));
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
    var getPreciseTime = window.performance && typeof performance.now === 'function' ? performance.now.bind(performance) : Date.now ? function () {
        return 1000 * Date.now();
    } : function () {
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

    var drag = d3.behavior.drag().on('dragstart', function () {

        if (d3.event.sourceEvent) {
            d3.event.sourceEvent.stopPropagation();
        }

        dragPosition = d3.mouse(bodyNode);

        storeStart();
    }).on('drag', function () {

        dragPosition = d3.mouse(bodyNode);

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

        var data = selection.datum();
        data._defaultPrevented = true;

        if (self._dragAF) {
            self.cancelAnimationFrame(self._dragAF);
        }

        self._dragAF = self.requestAnimationFrame(updateTransform);
    }).on('dragend', function () {

        self.cancelAnimationFrame(self._dragAF);
        self._dragAF = null;
        horizontalMove = 0;
        verticalMove = 0;

        var data = selection.datum();
        data._defaultPrevented = false;

        d3.timer.flush();

        var deltaFromTopLeftCorner = d3.mouse(selection.node());
        var halfHeight = self.options.rowHeight / 2;
        self.elements.innerContainer.attr('transform', null);

        self.emitDetailedEvent('element:dragend', selection, [-deltaFromTopLeftCorner[0], -deltaFromTopLeftCorner[1] + halfHeight], [data]);

        self.updateY().drawYAxis();
    });

    selection.call(drag);
};

D3BlockTable.prototype.elementUpdate = function (selection, d, transitionDuration) {
    var _this = this;

    var self = this;

    this._wrapWithAnimation(selection.select('.' + this.options.bemBlockName + '-elementBackground'), transitionDuration).attr({
        y: this.options.rowPadding,
        width: function width(d) {
            return self.scales.x(self.getDataEnd(d)) - self.scales.x(self.getDataStart(d));
        }
    });

    if (this.options.appendText && this.options.alignLeft && !d._defaultPrevented) {

        selection.select('.' + this.options.bemBlockName + '-elementMovableContent').attr('transform', function (d) {
            return 'translate(' + Math.max(-_this.scales.x(_this.getDataStart(d)), 2) + ',0)';
        });
    }

    selection.call(this.elementContentUpdate.bind(this));
};

D3BlockTable.prototype.elementExit = function (selection) {

    selection.on('click', null);
};

exports['default'] = D3BlockTable;
module.exports = exports['default'];

},{"./D3Table":88,"extend":84,"inherits":86}],88:[function(require,module,exports){
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
 *
 * @param {Object} options
 * @constructor
 */

var _d32 = _interopRequireDefault(_d3);

function D3Table(options) {

    _eventsEvents2['default'].call(this);

    D3Table.instancesCount += 1;

    this.instanceNumber = D3Table.instancesCount;

    var self = this;

    this.options = (0, _extend2['default'])(true, {}, this.defaults, options);

    /** @type {Array<{id: Number, name: String, elements: Array<{ id: Number, start: Date, end: Date}>}>} */
    this.data = [];
    this.flattenedData = [];

    this.margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    this.dimensions = { width: 0, height: 0 };

    this.currentElementsGroupTranslate = [0.0, 0.0];

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
        x: null,
        y: null
    };

    this.axises = {
        x: null,
        x2: null,
        y: null
    };

    this.behaviors = {
        zoom: null,
        zoomX: null,
        zoomY: null,
        pan: null
    };

    this._lastTranslate = null;
    this._lastScale = null;

    this._yScale = 0.0;
    this._dataChangeCount = 0;
    this._dimensionsChangeCount = 0;
    this._lastAvailableWidth = 0;
    this._lastAvailableHeight = 0;
    this._preventDrawing = false;
    this._nextAnimationFrameHandlers = [];
    this._maxBodyHeight = Infinity;
}

(0, _inherits2['default'])(D3Table, _eventsEvents2['default']);

/**
 * Default options
 *
 * @type {D3TableOptions}
 */
D3Table.prototype.defaults = {
    bemBlockName: 'table',
    bemBlockModifier: '',
    xAxisHeight: 50,
    yAxisWidth: 50,
    rowHeight: 30,
    rowPadding: 5,
    axisConfigs: [{ threshold: 2, minutes: 30 }, { threshold: 4, minutes: 15 }, { threshold: 10, minutes: 5 }],
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
    usePreviousDataForTransform: true,
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
    trackedDOMEvents: ['click', 'mousemove', 'mouseenter', 'mouseleave'] // not dynamic
};

D3Table.instancesCount = 0;

D3Table.prototype.noop = function () {};

D3Table.prototype.initialize = function () {

    // container
    this.container = _d32['default'].select(this.options.container).append('svg').attr('class', this.options.bemBlockName + (this.options.bemBlockModifier ? ' ' + this.options.bemBlockName + this.options.bemBlockModifier : ''));

    // defs
    this.elements.defs = this.container.append('defs');

    // clip rect in defs
    var clipId = this.options.bemBlockName + '-bodyClipPath--' + D3Table.instancesCount;
    this.elements.clip = this.elements.defs.append('clipPath').property('id', clipId);
    this.elements.clip.append('rect');

    // surrounding rect
    this.container.append('rect').classed(this.options.bemBlockName + '-backgroundRect', true);

    // axises containers
    this.elements.xAxisContainer = this.container.append('g').attr('class', this.options.bemBlockName + '-axis ' + this.options.bemBlockName + '-axis--x');

    this.elements.x2AxisContainer = this.container.append('g').attr('class', this.options.bemBlockName + '-axis ' + this.options.bemBlockName + '-axis--x ' + this.options.bemBlockName + '-axis--secondary');

    this.elements.yAxisContainer = this.container.append('g').attr('class', this.options.bemBlockName + '-axis ' + this.options.bemBlockName + '-axis--y');

    // body container inner container and surrounding rect
    this.elements.body = this.container.append('g').attr('clip-path', 'url(#' + clipId + ')');

    // surrounding rect
    this.elements.body.append('rect').classed(this.options.bemBlockName + '-contactRect', true);

    // inner container
    this.elements.innerContainer = this.elements.body.append('g');

    // surrounding rect
    this.elements.body.append('rect').classed(this.options.bemBlockName + '-boundingRect', true);

    this.updateMargins();

    this.initializeD3Instances();

    this.initializeEventListeners();

    return this;
};

D3Table.prototype.xScaleFactory = function () {
    return _d32['default'].scale.linear();
};

D3Table.prototype.yScaleFactory = function () {
    return _d32['default'].scale.linear();
};

D3Table.prototype.initializeD3Instances = function () {

    var self = this;

    this.scales.x = this.xScaleFactory();

    this.scales.y = this.yScaleFactory();

    this.axises.x = _d32['default'].svg.axis().scale(this.scales.x).orient('top').tickFormat(this.options.xAxisTicksFormatter.bind(this)).outerTickSize(0).tickPadding(20);

    this.axises.x2 = _d32['default'].svg.axis().scale(this.scales.x).orient('top').tickFormat(this.options.xAxis2TicksFormatter.bind(this)).outerTickSize(0).innerTickSize(0);

    this.axises.y = _d32['default'].svg.axis().scale(this.scales.y).orient('left').tickFormat(function (d) {
        if (self._isRound(d)) {
            return self.options.yAxisFormatter(self.data[d | 0]);
        } else {
            return '';
        }
    }).outerTickSize(0);

    this.behaviors.zoom = _d32['default'].behavior.zoom().scaleExtent([1, 10]).on('zoom', this.handleZooming.bind(this)).on('zoomend', this.handleZoomingEnd.bind(this));

    this.behaviors.zoomX = _d32['default'].behavior.zoom().x(this.scales.x).scale(1).scaleExtent([1, 10]);

    this.behaviors.zoomY = _d32['default'].behavior.zoom().y(this.scales.y).scale(1).scaleExtent([1, 1]);

    this.behaviors.pan = _d32['default'].behavior.drag().on('drag', this.handleDragging.bind(this));

    this.elements.body.call(this.behaviors.pan);
    this.elements.body.call(this.behaviors.zoom);

    this._lastTranslate = this.behaviors.zoom.translate();
    this._lastScale = this.behaviors.zoom.scale();
};

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

D3Table.prototype.emitDetailedEvent = function (eventName, d3TargetSelection, delta, priorityArguments) {

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
        return self.data[self.scales.y.invert(position[1]) >> 0];
    } // a row getter
    ];

    if (Array.isArray(priorityArguments)) {
        args = priorityArguments.concat(args);
    }

    args.unshift(this.options.bemBlockName + ':' + eventName); // the event name

    this.emit.apply(this, args);
};

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
        this.updateX();
        this.updateY();
    }
};

D3Table.prototype.destroy = function () {

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
};

D3Table.prototype.restoreZoom = function () {
    this.behaviors.zoom.translate(this._lastTranslate);
    this.behaviors.zoom.scale(this._lastScale);
};

D3Table.prototype.move = function (dx, dy, forceDraw, skipXAxis, forceTicks) {

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

D3Table.prototype.ensureInDomains = function () {
    return this.move(0, 0, false, false, true);
};

/**
 * pan X/Y & zoom X handler (clamped pan Y when wheel is pressed without ctrl, zoom X and pan X/Y otherwise)
 */
D3Table.prototype.handleZooming = function () {

    if (_d32['default'].event.sourceEvent && !_d32['default'].event.sourceEvent.ctrlKey && !(_d32['default'].event.sourceEvent.changedTouches && _d32['default'].event.sourceEvent.changedTouches.length >= 2)) {
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

    this.emit(this.options.bemBlockName + ':move');
};

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
 * wheel handler (clamped pan Y)
 */
D3Table.prototype.handleWheeling = function () {

    var event = _d32['default'].event.sourceEvent;

    var dx = 0,
        dy = 0;

    var movingX = event && event.wheelDeltaX || event.deltaX;

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

    this.move(dx, dy, false, !movingX);
};

D3Table.prototype.handleDragging = function () {

    if (_d32['default'].event.sourceEvent.changedTouches && _d32['default'].event.sourceEvent.touches.length >= 2) {
        return;
    }

    this.move(_d32['default'].event.dx, _d32['default'].event.dy, false, false, !this.options.hideTicksOnDrag);
};

D3Table.prototype.toggleDrawing = function (active) {

    this._preventDrawing = typeof active === 'boolean' ? !active : !this._preventDrawing;

    return this;
};

/**
 *
 * @param {Array<{id: Number, name: String, elements: Array<{ id: Number, start: Date, end: Date}>}>} data
 * @param {Number} [transitionDuration]
 * @returns {D3Table}
 */
D3Table.prototype.setData = function (data, transitionDuration) {

    this._dataChangeCount += 1;

    var isSizeChanging = data.length !== this.data.length;

    this.data = data;

    this.generateFlattenedData();

    if (isSizeChanging || this._dataChangeCount === 1) {
        this.updateXAxisInterval().updateY().drawXAxis().drawYAxis();
    }

    this.drawElements(transitionDuration);

    return this;
};

D3Table.prototype.generateFlattenedData = function () {

    var self = this;

    if (this.options.usePreviousDataForTransform) {
        this.previousFlattenedData = this.flattenedData.slice(0);
    }

    this.flattenedData.length = 0;

    this.data.forEach(function (d, i) {
        d.elements.forEach(function (e) {
            e.rowIndex = i;
            e.parentId = e.parentId !== undefined && e.parentId !== null ? e.parentId : d.id;
            self.flattenedData.push(e);
        });
    });
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

D3Table.prototype.setAvailableWidth = function (availableWidth) {

    this._dimensionsChangeCount += 1;

    var isAvailableWidthChanging = availableWidth !== this._lastAvailableWidth;
    this._lastAvailableWidth = availableWidth;

    this.dimensions.width = this._lastAvailableWidth - this.margin.left - this.margin.right;

    if (isAvailableWidthChanging || this._dimensionsChangeCount === 1) {
        this.updateX().updateXAxisInterval().drawXAxis().drawYAxis().drawElements();
    }

    this.emit(this.options.bemBlockName + ':resize');

    return this;
};

D3Table.prototype.setAvailableHeight = function (availableHeight) {

    this._dimensionsChangeCount += 1;

    var isAvailableHeightChanging = availableHeight !== this._lastAvailableHeight;
    this._lastAvailableHeight = availableHeight;

    this._maxBodyHeight = this._lastAvailableHeight - this.margin.top - this.margin.bottom;

    if (isAvailableHeightChanging || this._dimensionsChangeCount === 1) {
        this.updateY().drawXAxis().drawYAxis().drawElements();
    }

    this.emit(this.options.bemBlockName + ':resize');

    return this;
};

D3Table.prototype.updateX = function () {

    this.container.attr('width', this.dimensions.width + this.margin.left + this.margin.right);

    this.scales.x.domain([this.minX, this.maxX]).range([0, this.dimensions.width]);

    this.axises.y.innerTickSize(-this.dimensions.width);

    this.behaviors.zoomX.x(this.scales.x).translate(this.behaviors.zoom.translate()).scale(this.behaviors.zoom.scale());

    this.elements.body.select('rect.' + this.options.bemBlockName + '-boundingRect').attr('width', this.dimensions.width);
    this.elements.body.select('rect.' + this.options.bemBlockName + '-contactRect').attr('width', this.dimensions.width);
    this.container.select('rect.' + this.options.bemBlockName + '-backgroundRect').attr('width', this.dimensions.width);
    this.elements.clip.select('rect').attr('width', this.dimensions.width);

    return this;
};

D3Table.prototype.requestAnimationFrame = function (f) {

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

D3Table.prototype.cancelAnimationFrame = function (f) {

    var index = this._nextAnimationFrameHandlers.length > 0 ? this._nextAnimationFrameHandlers.indexOf(f) : -1;

    if (index !== -1) {
        this._nextAnimationFrameHandlers.splice(index, 1);
    }
};

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

        self._wrapWithAnimation(self.elements.xAxisContainer, transitionDuration).call(self.axises.x).selectAll('line').style({
            'stroke-width': self.options.xAxisStrokeWidth.bind(self)
        });

        self._wrapWithAnimation(self.elements.x2AxisContainer, transitionDuration).call(self.axises.x2).selectAll('text').attr({
            x: self.columnWidth / 2
        }).style({
            display: function display(d) {
                return +d === +self.maxX ? 'none' : '';
            }
        });
    });

    return this;
};

D3Table.prototype.drawYAxis = function drawYAxis(transitionDuration, skipTicks) {

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

D3Table.prototype.getTransformFromData = function (d) {
    return 'translate(' + this.scales.x(this.getDataStart(d)) + ',' + this.scales.y(d.rowIndex) + ')';
};

D3Table.prototype.getDataStart = function (d) {
    return +d.start;
};

D3Table.prototype.getDataEnd = function (d) {
    return +d.end;
};

D3Table.prototype.drawElements = function (transitionDuration) {

    if (this._preventDrawing) {
        return this;
    }

    this.stopElementTransition();

    var self = this;

    if (this._elementsAF) {
        this.cancelAnimationFrame(this._elementsAF);
    }

    var enableYTransition = this.options.enableYTransition;

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

        var transformMap = {};

        if (self.options.usePreviousDataForTransform && self.previousFlattenedData && transitionDuration > 0) {
            self.previousFlattenedData.forEach(function (d) {
                if (!transformMap[d.uid] || !transformMap[d.id]) {
                    transformMap[d.id] = transformMap[d.uid] = self.getTransformFromData(d);
                }
            });
        }

        var transformMap2 = {};

        if (self.options.usePreviousDataForTransform && self.flattenedData) {
            self.flattenedData.forEach(function (d) {
                if (!transformMap2[d.uid] || !transformMap2[d.id]) {
                    transformMap2[d.id] = transformMap2[d.uid] = self.getTransformFromData(d);
                }
            });
        }

        var data = self.flattenedData.filter(function (d) {
            return d._defaultPrevented || (!cullingY || d.rowIndex >= domainYStart - cullingDistance && d.rowIndex < domainYEnd + cullingDistance - 1) && (!cullingX || !(self.getDataEnd(d) < domainXStart || self.getDataStart(d) > domainXEnd));
        });

        var g = self.elements.innerContainer.selectAll('g.' + self.options.bemBlockName + '-element').data(data, function (d) {
            return d.uid;
        });

        var exiting = g.exit();

        if (self.options.enableTransitionOnExit && transitionDuration > 0) {
            exiting.call(self.elementExit.bind(self));

            self._wrapWithAnimation(exiting, transitionDuration).attr('transform', function (d) {
                return transformMap2[d.uid] || transformMap2[d.id];
            }).remove();
        } else {
            exiting.remove();
        }

        g.enter().append('g').attr('class', self.options.bemBlockName + '-element').each(function () {
            _d32['default'].select(this).call(self.elementEnter.bind(self));
        });

        g.each(function (d) {

            var g = _d32['default'].select(this);

            if (d._defaultPrevented) {

                self.elementUpdate(g, d, transitionDuration);

                return;
            }

            var hasPreviousTransform = g.attr('transform') !== null;

            if (!hasPreviousTransform) {
                g;
            }

            var newTransform = transformMap2[d.uid];

            if (transitionDuration > 0) {
                if (!hasPreviousTransform && self.options.usePreviousDataForTransform) {
                    var originTransform = transformMap[d.uid] || transformMap[d.id];
                    if (originTransform) {
                        g.attr('transform', originTransform);
                    }
                }

                self._wrapWithAnimation(g, transitionDuration).attrTween("transform", function () {
                    var startTransform = _d32['default'].transform(g.attr('transform'));
                    if (!enableYTransition) {
                        startTransform.translate[1] = self.scales.y(d.rowIndex);
                    }
                    return _d32['default'].interpolateTransform(startTransform.toString(), newTransform);
                });
            } else {
                g.attr('transform', newTransform);
            }

            self.elementUpdate(g, d, transitionDuration);
        });

        self.currentElementsGroupTranslate = [0.0, 0.0];
        self.elements.innerContainer.attr('transform', null);
    });

    return this;
};

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
            self.elements.innerContainer.selectAll('.' + self.options.bemBlockName + '-element').call(self.elementsTranslate.bind(self));
        }
    });
};

D3Table.prototype.updateXAxisInterval = function () {

    this.columnWidth = this.scales.x(1) - this.scales.x(0);

    return this;
};

D3Table.prototype.updateY = function () {

    var elementAmount = this.data.length;

    // have 1 more elemnt to force representing one more tick
    var elementsRange = [0, elementAmount];

    // compute new height
    this.dimensions.height = Math.min(this.data.length * 30, this._maxBodyHeight);

    // compute new Y scale
    this._yScale = this.options.rowHeight / this.dimensions.height * elementAmount;

    // update Y scale, axis and zoom behavior
    this.scales.y.domain(elementsRange).range([0, this.dimensions.height]);

    this.behaviors.zoomY.y(this.scales.y).translate(this._lastTranslate).scale(this._yScale);

    // and update X axis ticks height
    this.axises.x.innerTickSize(-this.dimensions.height);

    // update svg height
    this.container.attr('height', this.dimensions.height + this.margin.top + this.margin.bottom);

    // update inner rect height
    this.elements.body.select('rect.' + this.options.bemBlockName + '-boundingRect').attr('height', this.dimensions.height);
    this.elements.body.select('rect.' + this.options.bemBlockName + '-contactRect').attr('height', this.dimensions.height);
    this.container.select('rect.' + this.options.bemBlockName + '-backgroundRect').attr('height', this.dimensions.height);
    this.elements.clip.select('rect').attr('height', this.dimensions.height);

    this.stopElementTransition();

    return this;
};

D3Table.prototype.stopElementTransition = function () {
    this.elements.innerContainer.selectAll('g.' + this.options.bemBlockName + '-element').transition().style('opacity', '');
};

D3Table.prototype.elementEnter = function (selection) {
    return selection;
};

D3Table.prototype.elementUpdate = function (selection) {
    return selection;
};

D3Table.prototype.elementExit = function (selection) {
    return selection;
};

D3Table.prototype._wrapWithAnimation = function (selection, transitionDuration) {
    if (transitionDuration > 0) {
        return selection.transition().duration(transitionDuration).ease(this.options.transitionEasing);
    } else {
        return selection;
    }
};

D3Table.prototype._getter = function (prop) {
    return function (d) {
        return d[prop];
    };
};

D3Table.prototype._isRound = function (v) {
    var n = v | 0;
    return v > n - 1e-3 && v < n + 1e-3;
};

D3Table.prototype._range = function (start, end, inc) {
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

},{"events/events":83,"extend":84,"inherits":86}],89:[function(require,module,exports){
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

var _D3Timeline = require('./D3Timeline');

var _D3Timeline2 = _interopRequireDefault(_D3Timeline);

function D3TableMarker(options) {

    _eventsEvents2['default'].call(this);

    this.options = (0, _extend2['default'])(true, {}, this.defaults, options);

    /**
     * @type {D3Timeline}
     */
    this.timeline = null;

    this.container = null;

    /**
     * @type {Function}
     * @private
     */
    this._timelineMoveListener = null;

    /**
     * @type {Function}
     * @private
     */
    this._timelineResizeListener = null;

    this._moveAF = null;

    this.value = null;
    this._lastTimeUpdated = null;
}

(0, _inherits2['default'])(D3TableMarker, _eventsEvents2['default']);

D3TableMarker.prototype.defaults = {
    xFormatter: function xFormatter(d) {
        return d;
    },
    outerTickSize: 10,
    tickPadding: 10,
    roundPosition: false,
    bemBlockName: 'tableMarker',
    bemModifier: ''
};

/**
 *
 * @param {D3Timeline} timeline
 */
D3TableMarker.prototype.setTimeline = function (timeline) {

    var previousTimeline = this.timeline;

    this.timeline = timeline && timeline instanceof _D3Timeline2['default'] ? timeline : null;

    if (this.timeline && !previousTimeline) {
        this.handleBoundTimeline();
    } else if (!this.timeline && previousTimeline) {
        this.handleUnboundTimeline(previousTimeline);
    }
};

D3TableMarker.prototype.valueComparator = function (timeA, timeB) {
    return +timeA !== +timeB;
};

D3TableMarker.prototype.setValue = function (value) {

    var previousTimeUpdated = this._lastTimeUpdated;

    this.value = value;

    if (this.valueComparator(previousTimeUpdated, this.value) && this.timeline && this.container) {

        this._lastTimeUpdated = this.value;

        this.container.datum({
            value: value
        });

        this.move();
    }
};

D3TableMarker.prototype.handleBoundTimeline = function () {

    var self = this;

    this.container = this.timeline.container.append('g').datum({
        value: this.value
    }).attr('class', this.options.bemBlockName + (this.options.bemModifier ? ' ' + this.options.bemBlockName + this.options.bemModifier : ''));

    this.container.append('line').attr('class', this.options.bemBlockName + '-line').style('pointer-events', 'none').attr({
        y1: -this.options.outerTickSize,
        y2: this.timeline.dimensions.height
    });

    this.container.append('text').attr('class', this.options.bemBlockName + '-label').attr('dy', -this.options.outerTickSize - this.options.tickPadding);

    // on timeline move, move the marker
    this._timelineMoveListener = this.move.bind(this);
    this.timeline.on('timeline:move', this._timelineMoveListener);

    // on timeline resize, resize the marker and move it
    this._timelineResizeListener = function () {
        self.resize();
        self.move();
    };
    this.timeline.on('timeline:resize', this._timelineResizeListener);

    this.emit('marker:bound');

    this.move();
};

D3TableMarker.prototype.handleUnboundTimeline = function (previousTimeline) {

    previousTimeline.removeListener('timeline:move', this._timelineMoveListener);
    previousTimeline.removeListener('timeline:resize', this._timelineResizeListener);

    this.container.remove();

    if (this._moveAF) {
        previousTimeline.cancelAnimationFrame(this._moveAF);
        this._moveAF = null;
    }

    this.container = null;
    this._timelineMoveListener = null;

    this.emit('marker:unbound', previousTimeline);
};

D3TableMarker.prototype.move = function () {

    var self = this;

    if (this._moveAF) {
        this.timeline.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = this.timeline.requestAnimationFrame(function () {

        self.container.each(function (d) {

            var xScale = self.timeline.scales.x;
            var xRange = xScale.range();
            var left = self.timeline.scales.x(d.value);
            var isInRange = left >= xRange[0] && left <= xRange[xRange.length - 1];

            var g = _d32['default'].select(this);

            if (isInRange) {

                self.show();

                g.attr('transform', 'translate(' + (self.timeline.margin.left + left >> 0) + ',' + self.timeline.margin.top + ')');

                g.select('.' + self.options.bemBlockName + '-label').text(function (d) {
                    return self.options.xFormatter(d.value);
                });
            } else {
                self.hide();
            }
        });
    });
};

D3TableMarker.prototype.show = function () {
    this.container.style('display', '');
};

D3TableMarker.prototype.hide = function () {
    this.container.style('display', 'none');
};

D3TableMarker.prototype.resize = function () {

    this.container.select('.' + this.options.bemBlockName + '-line').attr({
        y1: -this.options.outerTickSize,
        y2: this.timeline.dimensions.height
    });
};

module.exports = D3TableMarker;

},{"./D3Timeline":92,"events/events":83,"extend":84,"inherits":86}],90:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _D3TableMarker = require('./D3TableMarker');

var _D3TableMarker2 = _interopRequireDefault(_D3TableMarker);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _extend = require('extend');

/**
 *
 * @extends {D3TableMarker}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3TableMouseTracker(options) {
    _D3TableMarker2['default'].call(this, options);

    this._timelineMouseenterListener = null;
    this._timelineMousemoveListener = null;
    this._timelineMouseleaveListener = null;

    this._moveAF = null;

    this.on('marker:bound', this.handleTimelineBound.bind(this));
    this.on('marker:unbound', this.handleTimelineUnbound.bind(this));
}

(0, _inherits2['default'])(D3TableMouseTracker, _D3TableMarker2['default']);

D3TableMouseTracker.prototype.defaults = (0, _extend2['default'])(true, {}, _D3TableMarker2['default'].prototype.defaults, {
    bemModifier: '--mouseTracker'
});

D3TableMouseTracker.prototype.handleTimelineBound = function () {

    this.timeline.on('timeline:mouseenter', this._timelineMouseenterListener = this.handleMouseenter.bind(this));
    this.timeline.on('timeline:mousemove', this._timelineMousemoveListener = this.handleMousemove.bind(this));
    this.timeline.on('timeline:mouseleave', this._timelineMouseleaveListener = this.handleMouseleave.bind(this));
};

D3TableMouseTracker.prototype.handleTimelineUnbound = function (previousTimeline) {

    previousTimeline.removeListener('timeline:mouseenter', this._timelineMouseenterListener);
    previousTimeline.removeListener('timeline:mousemove', this._timelineMousemoveListener);
    previousTimeline.removeListener('timeline:mouseleave', this._timelineMouseleaveListener);
};

D3TableMouseTracker.prototype.handleMouseenter = function (timeline, selection, d3Event, getTime, getRow) {

    var self = this;

    var time = getTime();

    timeline.requestAnimationFrame(function () {
        self.show();
        self.setValue(time);
    });
};

D3TableMouseTracker.prototype.handleMousemove = function (timeline, selection, d3Event, getTime, getRow) {

    var self = this;
    var time = getTime();

    if (this._moveAF) {
        timeline.cancelAnimationFrame(this._moveAF);
    }

    this._moveAF = timeline.requestAnimationFrame(function () {
        self.setValue(time);
    });
};

D3TableMouseTracker.prototype.handleMouseleave = function (timeline, selection, d3Event, getTime, getRow) {

    if (this._moveAF) {
        timeline.cancelAnimationFrame(this._moveAF);
    }

    var self = this;
    timeline.requestAnimationFrame(function () {
        self.hide();
    });
};

module.exports = D3TableMouseTracker;

},{"./D3TableMarker":89,"extend":84,"inherits":86}],91:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _D3TableMarker = require('./D3TableMarker');

var _D3TableMarker2 = _interopRequireDefault(_D3TableMarker);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _extend = require('extend');

/**
 *
 * @extends {D3TableMarker}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3TableValueTracker(options) {
    _D3TableMarker2['default'].call(this, options);

    this.enabled = false;
}

(0, _inherits2['default'])(D3TableValueTracker, _D3TableMarker2['default']);

D3TableValueTracker.prototype.defaults = (0, _extend2['default'])(true, {}, _D3TableMarker2['default'].prototype.defaults, {
    bemModifier: '--valueTracker'
});

D3TableValueTracker.prototype.valueGetter = function () {

    return 0;
};

D3TableValueTracker.prototype.start = function () {

    var self = this;

    this.enabled = true;

    d3.timer(function () {

        self.setValue(self.timeGetter());

        return !self.enabled;
    });
};

D3TableValueTracker.prototype.stop = function () {

    this.enabled = false;
};

module.exports = D3TableValueTracker;

},{"./D3TableMarker":89,"extend":84,"inherits":86}],92:[function(require,module,exports){
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
 *
 * @param {Object} options
 * @constructor
 */

var _d32 = _interopRequireDefault(_d3);

function D3Timeline(options) {

    _D3BlockTable2['default'].call(this);

    this._currentScaleConfig = null;
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
    }
});

_D3BlockTable2['default'].prototype.xScaleFactory = function () {
    return _d32['default'].time.scale();
};

_D3BlockTable2['default'].prototype.yScaleFactory = function () {
    return _d32['default'].scale.linear();
};

_D3BlockTable2['default'].prototype.getDataStart = function (d) {
    return d.start;
};

_D3BlockTable2['default'].prototype.getDataEnd = function (d) {
    return d.end;
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

D3Timeline.prototype.setTimeRange = function (minDate, maxDate) {
    return this.setXRange(minDate, maxDate);
};

exports['default'] = D3Timeline;
module.exports = exports['default'];

},{"./D3BlockTable":87,"extend":84,"inherits":86}],93:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _D3TableValueTracker = require('./D3TableValueTracker');

var _D3TableValueTracker2 = _interopRequireDefault(_D3TableValueTracker);

var _inherits = require('inherits');

var _inherits2 = _interopRequireDefault(_inherits);

var _extend = require('extend');

/**
 *
 * @extends {D3TableValueTracker}
 * @constructor
 */

var _extend2 = _interopRequireDefault(_extend);

function D3TimelineTimeTracker(options) {
    _D3TableValueTracker2['default'].call(this, options);
}

(0, _inherits2['default'])(D3TimelineTimeTracker, _D3TableValueTracker2['default']);

D3TimelineTimeTracker.prototype.defaults = (0, _extend2['default'])(true, {}, _D3TableValueTracker2['default'].prototype.defaults, {
    bemBlockName: 'timelineMarker',
    bemModifier: '--timeTracker'
});

D3TimelineTimeTracker.prototype.timeGetter = function () {
    return new Date();
};

D3TimelineTimeTracker.prototype.timeComparator = function (a, b) {
    return this.valueComparator(a, b);
};

D3TimelineTimeTracker.prototype.setTime = function (time) {
    return this.setValue(time);
};

D3TimelineTimeTracker.prototype.valueGetter = function () {
    return this.timeGetter();
};

module.exports = D3TimelineTimeTracker;

},{"./D3TableValueTracker":91,"extend":84,"inherits":86}]},{},[1])
;