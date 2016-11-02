/* */ 
var array = require('postgres-array');
var ap = require('ap');
var arrayParser = require('./arrayParser');
var parseDate = require('postgres-date');
var parseInterval = require('postgres-interval');
var parseByteA = require('postgres-bytea');
function allowNull(fn) {
  return function nullAllowed(value) {
    if (value === null)
      return value;
    return fn(value);
  };
}
function parseBool(value) {
  if (value === null)
    return value;
  return value === 't';
}
function parseBoolArray(value) {
  if (!value)
    return null;
  return array.parse(value, parseBool);
}
function parseIntegerArray(value) {
  if (!value)
    return null;
  return array.parse(value, allowNull(ap.partialRight(parseInt, 10)));
}
function parseBigIntegerArray(value) {
  if (!value)
    return null;
  return array.parse(value, allowNull(function(entry) {
    return parseBigInteger(entry).trim();
  }));
}
var parseFloatArray = function(value) {
  if (!value) {
    return null;
  }
  var p = arrayParser.create(value, function(entry) {
    if (entry !== null) {
      entry = parseFloat(entry);
    }
    return entry;
  });
  return p.parse();
};
var parseStringArray = function(value) {
  if (!value) {
    return null;
  }
  var p = arrayParser.create(value);
  return p.parse();
};
var parseDateArray = function(value) {
  if (!value) {
    return null;
  }
  var p = arrayParser.create(value, function(entry) {
    if (entry !== null) {
      entry = parseDate(entry);
    }
    return entry;
  });
  return p.parse();
};
var parseByteAArray = function(value) {
  var arr = parseStringArray(value);
  if (!arr)
    return arr;
  return arr.map(function(element) {
    return parseByteA(element);
  });
};
var parseInteger = function(value) {
  return parseInt(value, 10);
};
var parseBigInteger = function(value) {
  var valStr = String(value);
  if (/^\d+$/.test(valStr)) {
    return valStr;
  }
  return value;
};
var parseJsonArray = function(value) {
  var arr = parseStringArray(value);
  if (!arr) {
    return arr;
  }
  return arr.map(function(el) {
    return JSON.parse(el);
  });
};
var parsePoint = function(value) {
  if (value[0] !== '(') {
    return null;
  }
  value = value.substring(1, value.length - 1).split(',');
  return {
    x: parseFloat(value[0]),
    y: parseFloat(value[1])
  };
};
var parseCircle = function(value) {
  if (value[0] !== '<' && value[1] !== '(') {
    return null;
  }
  var point = '(';
  var radius = '';
  var pointParsed = false;
  for (var i = 2; i < value.length - 1; i++) {
    if (!pointParsed) {
      point += value[i];
    }
    if (value[i] === ')') {
      pointParsed = true;
      continue;
    } else if (!pointParsed) {
      continue;
    }
    if (value[i] === ',') {
      continue;
    }
    radius += value[i];
  }
  var result = parsePoint(point);
  result.radius = parseFloat(radius);
  return result;
};
var init = function(register) {
  register(20, parseBigInteger);
  register(21, parseInteger);
  register(23, parseInteger);
  register(26, parseInteger);
  register(700, parseFloat);
  register(701, parseFloat);
  register(16, parseBool);
  register(1082, parseDate);
  register(1114, parseDate);
  register(1184, parseDate);
  register(600, parsePoint);
  register(718, parseCircle);
  register(1000, parseBoolArray);
  register(1001, parseByteAArray);
  register(1005, parseIntegerArray);
  register(1007, parseIntegerArray);
  register(1028, parseIntegerArray);
  register(1016, parseBigIntegerArray);
  register(1021, parseFloatArray);
  register(1022, parseFloatArray);
  register(1231, parseFloatArray);
  register(1014, parseStringArray);
  register(1015, parseStringArray);
  register(1008, parseStringArray);
  register(1009, parseStringArray);
  register(1115, parseDateArray);
  register(1182, parseDateArray);
  register(1185, parseDateArray);
  register(1186, parseInterval);
  register(17, parseByteA);
  register(114, JSON.parse.bind(JSON));
  register(3802, JSON.parse.bind(JSON));
  register(199, parseJsonArray);
  register(3807, parseJsonArray);
  register(2951, parseStringArray);
  register(791, parseStringArray);
  register(1183, parseStringArray);
};
module.exports = {init: init};
