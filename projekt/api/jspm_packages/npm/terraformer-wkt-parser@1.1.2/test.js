/* */ 
"use strict";
var WKT = require('./terraformer-wkt-parser');
console.assert(typeof WKT !== undefined);
var wktPoint = WKT.convert({
  "type": "Point",
  "coordinates": [-122.6764, 45.5165]
});
var geoJsonPoint = WKT.parse(wktPoint);
