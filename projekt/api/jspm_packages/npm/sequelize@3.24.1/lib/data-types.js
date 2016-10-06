/* */ 
(function(Buffer, process) {
  'use strict';
  var util = require('util'),
      _ = require('lodash'),
      Wkt = require('terraformer-wkt-parser'),
      sequelizeErrors = require('./errors'),
      warnings = {},
      Validator = require('validator'),
      momentTz = require('moment-timezone'),
      moment = require('moment');
  var ABSTRACT = function(options) {};
  ABSTRACT.prototype.dialectTypes = '';
  ABSTRACT.prototype.toString = function(options) {
    return this.toSql(options);
  };
  ABSTRACT.prototype.toSql = function() {
    return this.key;
  };
  ABSTRACT.warn = function(link, text) {
    if (!warnings[text]) {
      warnings[text] = true;
      console.warn('>> WARNING:', text, '\n>> Check:', link);
    }
  };
  ABSTRACT.prototype.stringify = function(value, options) {
    if (this.$stringify) {
      return this.$stringify(value, options);
    }
    return value;
  };
  ABSTRACT.inherits = function(Constructor) {
    var baseType = this;
    if (!Constructor) {
      Constructor = function() {
        if (!(this instanceof Constructor)) {
          var args = [null].concat(arguments);
          var FactoryFunction = Constructor.bind.apply(Constructor, args);
          return new FactoryFunction();
        }
        baseType.apply(this, arguments);
      };
    }
    util.inherits(Constructor, baseType);
    _.extend(Constructor, this);
    return Constructor;
  };
  var STRING = ABSTRACT.inherits(function(length, binary) {
    var options = typeof length === 'object' && length || {
      length: length,
      binary: binary
    };
    if (!(this instanceof STRING))
      return new STRING(options);
    this.options = options;
    this._binary = options.binary;
    this._length = options.length || 255;
  });
  STRING.prototype.key = STRING.key = 'STRING';
  STRING.prototype.toSql = function() {
    return 'VARCHAR(' + this._length + ')' + ((this._binary) ? ' BINARY' : '');
  };
  STRING.prototype.validate = function(value) {
    if (Object.prototype.toString.call(value) !== '[object String]') {
      if ((this.options.binary && Buffer.isBuffer(value)) || _.isNumber(value)) {
        return true;
      }
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid string', value));
    }
    return true;
  };
  Object.defineProperty(STRING.prototype, 'BINARY', {get: function() {
      this._binary = true;
      this.options.binary = true;
      return this;
    }});
  var CHAR = STRING.inherits(function(length, binary) {
    var options = typeof length === 'object' && length || {
      length: length,
      binary: binary
    };
    if (!(this instanceof CHAR))
      return new CHAR(options);
    STRING.apply(this, arguments);
  });
  CHAR.prototype.key = CHAR.key = 'CHAR';
  CHAR.prototype.toSql = function() {
    return 'CHAR(' + this._length + ')' + ((this._binary) ? ' BINARY' : '');
  };
  var TEXT = ABSTRACT.inherits(function(length) {
    var options = typeof length === 'object' && length || {length: length};
    if (!(this instanceof TEXT))
      return new TEXT(options);
    this.options = options;
    this._length = options.length || '';
  });
  TEXT.prototype.key = TEXT.key = 'TEXT';
  TEXT.prototype.toSql = function() {
    switch (this._length.toLowerCase()) {
      case 'tiny':
        return 'TINYTEXT';
      case 'medium':
        return 'MEDIUMTEXT';
      case 'long':
        return 'LONGTEXT';
      default:
        return this.key;
    }
  };
  TEXT.prototype.validate = function(value) {
    if (!_.isString(value)) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid string', value));
    }
    return true;
  };
  var NUMBER = ABSTRACT.inherits(function(options) {
    this.options = options;
    this._length = options.length;
    this._zerofill = options.zerofill;
    this._decimals = options.decimals;
    this._precision = options.precision;
    this._scale = options.scale;
    this._unsigned = options.unsigned;
  });
  NUMBER.prototype.key = NUMBER.key = 'NUMBER';
  NUMBER.prototype.toSql = function() {
    var result = this.key;
    if (this._length) {
      result += '(' + this._length;
      if (typeof this._decimals === 'number') {
        result += ',' + this._decimals;
      }
      result += ')';
    }
    if (this._unsigned) {
      result += ' UNSIGNED';
    }
    if (this._zerofill) {
      result += ' ZEROFILL';
    }
    return result;
  };
  NUMBER.prototype.validate = function(value) {
    if (!Validator.isFloat(String(value))) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid number', value));
    }
    return true;
  };
  Object.defineProperty(NUMBER.prototype, 'UNSIGNED', {get: function() {
      this._unsigned = true;
      this.options.unsigned = true;
      return this;
    }});
  Object.defineProperty(NUMBER.prototype, 'ZEROFILL', {get: function() {
      this._zerofill = true;
      this.options.zerofill = true;
      return this;
    }});
  var INTEGER = NUMBER.inherits(function(length) {
    var options = typeof length === 'object' && length || {length: length};
    if (!(this instanceof INTEGER))
      return new INTEGER(options);
    NUMBER.call(this, options);
  });
  INTEGER.prototype.key = INTEGER.key = 'INTEGER';
  INTEGER.prototype.validate = function(value) {
    if (!Validator.isInt(String(value))) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid integer', value));
    }
    return true;
  };
  var BIGINT = NUMBER.inherits(function(length) {
    var options = typeof length === 'object' && length || {length: length};
    if (!(this instanceof BIGINT))
      return new BIGINT(options);
    NUMBER.call(this, options);
  });
  BIGINT.prototype.key = BIGINT.key = 'BIGINT';
  BIGINT.prototype.validate = function(value) {
    if (!Validator.isInt(String(value))) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid bigint', value));
    }
    return true;
  };
  var FLOAT = NUMBER.inherits(function(length, decimals) {
    var options = typeof length === 'object' && length || {
      length: length,
      decimals: decimals
    };
    if (!(this instanceof FLOAT))
      return new FLOAT(options);
    NUMBER.call(this, options);
  });
  FLOAT.prototype.key = FLOAT.key = 'FLOAT';
  FLOAT.prototype.validate = function(value) {
    if (!Validator.isFloat(String(value))) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid float', value));
    }
    return true;
  };
  var REAL = NUMBER.inherits(function(length, decimals) {
    var options = typeof length === 'object' && length || {
      length: length,
      decimals: decimals
    };
    if (!(this instanceof REAL))
      return new REAL(options);
    NUMBER.call(this, options);
  });
  REAL.prototype.key = REAL.key = 'REAL';
  var DOUBLE = NUMBER.inherits(function(length, decimals) {
    var options = typeof length === 'object' && length || {
      length: length,
      decimals: decimals
    };
    if (!(this instanceof DOUBLE))
      return new DOUBLE(options);
    NUMBER.call(this, options);
  });
  DOUBLE.prototype.key = DOUBLE.key = 'DOUBLE PRECISION';
  var DECIMAL = NUMBER.inherits(function(precision, scale) {
    var options = typeof precision === 'object' && precision || {
      precision: precision,
      scale: scale
    };
    if (!(this instanceof DECIMAL))
      return new DECIMAL(options);
    NUMBER.call(this, options);
  });
  DECIMAL.prototype.key = DECIMAL.key = 'DECIMAL';
  DECIMAL.prototype.toSql = function() {
    if (this._precision || this._scale) {
      return 'DECIMAL(' + [this._precision, this._scale].filter(_.identity).join(',') + ')';
    }
    return 'DECIMAL';
  };
  DECIMAL.prototype.validate = function(value) {
    if (!Validator.isDecimal(String(value))) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid decimal', value));
    }
    return true;
  };
  [FLOAT, DOUBLE, REAL].forEach(function(floating) {
    floating.prototype.escape = false;
    floating.prototype.$stringify = function(value) {
      if (isNaN(value)) {
        return "'NaN'";
      } else if (!isFinite(value)) {
        var sign = value < 0 ? '-' : '';
        return "'" + sign + "Infinity'";
      }
      return value;
    };
  });
  var BOOLEAN = ABSTRACT.inherits();
  BOOLEAN.prototype.key = BOOLEAN.key = 'BOOLEAN';
  BOOLEAN.prototype.toSql = function() {
    return 'TINYINT(1)';
  };
  BOOLEAN.prototype.validate = function(value) {
    if (!Validator.isBoolean(String(value))) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid boolean', value));
    }
    return true;
  };
  var TIME = ABSTRACT.inherits();
  TIME.prototype.key = TIME.key = 'TIME';
  TIME.prototype.toSql = function() {
    return 'TIME';
  };
  var DATE = ABSTRACT.inherits(function(length) {
    var options = typeof length === 'object' && length || {length: length};
    if (!(this instanceof DATE))
      return new DATE(options);
    this.options = options;
    this._length = options.length || '';
  });
  DATE.prototype.key = DATE.key = 'DATE';
  DATE.prototype.toSql = function() {
    return 'DATETIME';
  };
  DATE.prototype.validate = function(value) {
    if (!_.isDate(value)) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid date', value));
    }
    return true;
  };
  DATE.prototype.$applyTimezone = function(date, options) {
    if (options.timezone) {
      if (momentTz.tz.zone(options.timezone)) {
        date = momentTz(date).tz(options.timezone);
      } else {
        date = moment(date).utcOffset(options.timezone);
      }
    } else {
      date = momentTz(date);
    }
    return date;
  };
  DATE.prototype.$stringify = function(date, options) {
    date = this.$applyTimezone(date, options);
    return date.format('YYYY-MM-DD HH:mm:ss.SSS Z');
  };
  var DATEONLY = function() {
    if (!(this instanceof DATEONLY))
      return new DATEONLY();
    ABSTRACT.apply(this, arguments);
  };
  util.inherits(DATEONLY, ABSTRACT);
  DATEONLY.prototype.key = DATEONLY.key = 'DATEONLY';
  DATEONLY.prototype.toSql = function() {
    return 'DATE';
  };
  var HSTORE = ABSTRACT.inherits();
  HSTORE.prototype.key = HSTORE.key = 'HSTORE';
  HSTORE.prototype.validate = function(value) {
    if (!_.isPlainObject(value)) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid hstore', value));
    }
    return true;
  };
  var JSONTYPE = function() {
    if (!(this instanceof JSONTYPE))
      return new JSONTYPE();
    ABSTRACT.apply(this, arguments);
  };
  util.inherits(JSONTYPE, ABSTRACT);
  JSONTYPE.prototype.key = JSONTYPE.key = 'JSON';
  JSONTYPE.prototype.validate = function(value) {
    return true;
  };
  JSONTYPE.prototype.$stringify = function(value, options) {
    return JSON.stringify(value);
  };
  var JSONB = function() {
    if (!(this instanceof JSONB))
      return new JSONB();
    JSONTYPE.apply(this, arguments);
  };
  util.inherits(JSONB, JSONTYPE);
  JSONB.prototype.key = JSONB.key = 'JSONB';
  var NOW = ABSTRACT.inherits();
  NOW.prototype.key = NOW.key = 'NOW';
  var BLOB = ABSTRACT.inherits(function(length) {
    var options = typeof length === 'object' && length || {length: length};
    if (!(this instanceof BLOB))
      return new BLOB(options);
    this.options = options;
    this._length = options.length || '';
  });
  BLOB.prototype.key = BLOB.key = 'BLOB';
  BLOB.prototype.toSql = function() {
    switch (this._length.toLowerCase()) {
      case 'tiny':
        return 'TINYBLOB';
      case 'medium':
        return 'MEDIUMBLOB';
      case 'long':
        return 'LONGBLOB';
      default:
        return this.key;
    }
  };
  BLOB.prototype.validate = function(value) {
    if (!_.isString(value) && !Buffer.isBuffer(value)) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid blob', value));
    }
    return true;
  };
  BLOB.prototype.escape = false;
  BLOB.prototype.$stringify = function(value) {
    if (!Buffer.isBuffer(value)) {
      if (Array.isArray(value)) {
        value = new Buffer(value);
      } else {
        value = new Buffer(value.toString());
      }
    }
    var hex = value.toString('hex');
    return this.$hexify(hex);
  };
  BLOB.prototype.$hexify = function(hex) {
    return "X'" + hex + "'";
  };
  var RANGE = ABSTRACT.inherits(function(subtype) {
    var options = _.isPlainObject(subtype) ? subtype : {subtype: subtype};
    if (!options.subtype)
      options.subtype = new INTEGER();
    if (_.isFunction(options.subtype)) {
      options.subtype = new options.subtype();
    }
    if (!(this instanceof RANGE))
      return new RANGE(options);
    ABSTRACT.apply(this, arguments);
    this._subtype = options.subtype.key;
    this.options = options;
  });
  var pgRangeSubtypes = {
    integer: 'int4range',
    bigint: 'int8range',
    decimal: 'numrange',
    dateonly: 'daterange',
    date: 'tstzrange',
    datenotz: 'tsrange'
  };
  RANGE.prototype.key = RANGE.key = 'RANGE';
  RANGE.prototype.toSql = function() {
    return pgRangeSubtypes[this._subtype.toLowerCase()];
  };
  RANGE.prototype.validate = function(value) {
    if (_.isPlainObject(value) && value.inclusive) {
      value = value.inclusive;
    }
    if (!_.isArray(value)) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid range', value));
    }
    if (value.length !== 2) {
      throw new sequelizeErrors.ValidationError('A range must be an array with two elements');
    }
    return true;
  };
  var UUID = ABSTRACT.inherits();
  UUID.prototype.key = UUID.key = 'UUID';
  UUID.prototype.validate = function(value, options) {
    if (!_.isString(value) || !Validator.isUUID(value) && (!options || !options.acceptStrings)) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid uuid', value));
    }
    return true;
  };
  var UUIDV1 = function() {
    if (!(this instanceof UUIDV1))
      return new UUIDV1();
    ABSTRACT.apply(this, arguments);
  };
  util.inherits(UUIDV1, ABSTRACT);
  UUIDV1.prototype.key = UUIDV1.key = 'UUIDV1';
  UUIDV1.prototype.validate = function(value, options) {
    if (!_.isString(value) || !Validator.isUUID(value) && (!options || !options.acceptStrings)) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid uuid', value));
    }
    return true;
  };
  var UUIDV4 = function() {
    if (!(this instanceof UUIDV4))
      return new UUIDV4();
    ABSTRACT.apply(this, arguments);
  };
  util.inherits(UUIDV4, ABSTRACT);
  UUIDV4.prototype.key = UUIDV4.key = 'UUIDV4';
  UUIDV4.prototype.validate = function(value, options) {
    if (!_.isString(value) || !Validator.isUUID(value, 4) && (!options || !options.acceptStrings)) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid uuidv4', value));
    }
    return true;
  };
  var VIRTUAL = function(ReturnType, fields) {
    if (!(this instanceof VIRTUAL))
      return new VIRTUAL(ReturnType, fields);
    if (typeof ReturnType === 'function')
      ReturnType = new ReturnType();
    this.returnType = ReturnType;
    this.fields = fields;
  };
  util.inherits(VIRTUAL, ABSTRACT);
  VIRTUAL.prototype.key = VIRTUAL.key = 'VIRTUAL';
  var ENUM = ABSTRACT.inherits(function(value) {
    var options = typeof value === 'object' && !Array.isArray(value) && value || {values: Array.prototype.slice.call(arguments).reduce(function(result, element) {
        return result.concat(Array.isArray(element) ? element : [element]);
      }, [])};
    if (!(this instanceof ENUM))
      return new ENUM(options);
    this.values = options.values;
    this.options = options;
  });
  ENUM.prototype.key = ENUM.key = 'ENUM';
  ENUM.prototype.validate = function(value) {
    if (!_.includes(this.values, value)) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid choice in %j', value, this.values));
    }
    return true;
  };
  var ARRAY = function(type) {
    var options = _.isPlainObject(type) ? type : {type: type};
    if (!(this instanceof ARRAY))
      return new ARRAY(options);
    this.type = typeof options.type === 'function' ? new options.type() : options.type;
  };
  util.inherits(ARRAY, ABSTRACT);
  ARRAY.prototype.key = ARRAY.key = 'ARRAY';
  ARRAY.prototype.toSql = function() {
    return this.type.toSql() + '[]';
  };
  ARRAY.prototype.validate = function(value) {
    if (!_.isArray(value)) {
      throw new sequelizeErrors.ValidationError(util.format('%j is not a valid array', value));
    }
    return true;
  };
  ARRAY.is = function(obj, type) {
    return obj instanceof ARRAY && obj.type instanceof type;
  };
  var helpers = {
    BINARY: [STRING, CHAR],
    UNSIGNED: [NUMBER, INTEGER, BIGINT, FLOAT, DOUBLE, REAL],
    ZEROFILL: [NUMBER, INTEGER, BIGINT, FLOAT, DOUBLE, REAL],
    PRECISION: [DECIMAL],
    SCALE: [DECIMAL]
  };
  var GEOMETRY = ABSTRACT.inherits(function(type, srid) {
    var options = _.isPlainObject(type) ? type : {
      type: type,
      srid: srid
    };
    if (!(this instanceof GEOMETRY))
      return new GEOMETRY(options);
    this.options = options;
    this.type = options.type;
    this.srid = options.srid;
  });
  GEOMETRY.prototype.key = GEOMETRY.key = 'GEOMETRY';
  GEOMETRY.prototype.escape = false;
  GEOMETRY.prototype.$stringify = function(value, options) {
    return 'GeomFromText(' + options.escape(Wkt.convert(value)) + ')';
  };
  var GEOGRAPHY = ABSTRACT.inherits(function(type, srid) {
    var options = _.isPlainObject(type) ? type : {
      type: type,
      srid: srid
    };
    if (!(this instanceof GEOGRAPHY))
      return new GEOGRAPHY(options);
    this.options = options;
    this.type = options.type;
    this.srid = options.srid;
  });
  GEOGRAPHY.prototype.key = GEOGRAPHY.key = 'GEOGRAPHY';
  GEOGRAPHY.prototype.escape = false;
  GEOGRAPHY.prototype.$stringify = function(value, options) {
    return 'GeomFromText(' + options.escape(Wkt.convert(value)) + ')';
  };
  Object.keys(helpers).forEach(function(helper) {
    helpers[helper].forEach(function(DataType) {
      if (!DataType[helper]) {
        Object.defineProperty(DataType, helper, {get: function() {
            var dataType = new DataType();
            if (typeof dataType[helper] === 'object') {
              return dataType;
            }
            return dataType[helper].apply(dataType, arguments);
          }});
      }
    });
  });
  var dataTypes = {
    ABSTRACT: ABSTRACT,
    STRING: STRING,
    CHAR: CHAR,
    TEXT: TEXT,
    NUMBER: NUMBER,
    INTEGER: INTEGER,
    BIGINT: BIGINT,
    FLOAT: FLOAT,
    TIME: TIME,
    DATE: DATE,
    DATEONLY: DATEONLY,
    BOOLEAN: BOOLEAN,
    NOW: NOW,
    BLOB: BLOB,
    DECIMAL: DECIMAL,
    NUMERIC: DECIMAL,
    UUID: UUID,
    UUIDV1: UUIDV1,
    UUIDV4: UUIDV4,
    HSTORE: HSTORE,
    JSON: JSONTYPE,
    JSONB: JSONB,
    VIRTUAL: VIRTUAL,
    ARRAY: ARRAY,
    NONE: VIRTUAL,
    ENUM: ENUM,
    RANGE: RANGE,
    REAL: REAL,
    DOUBLE: DOUBLE,
    'DOUBLE PRECISION': DOUBLE,
    GEOMETRY: GEOMETRY,
    GEOGRAPHY: GEOGRAPHY
  };
  _.each(dataTypes, function(dataType) {
    dataType.types = {};
  });
  dataTypes.postgres = require('./dialects/postgres/data-types')(dataTypes);
  dataTypes.mysql = require('./dialects/mysql/data-types')(dataTypes);
  dataTypes.mariadb = dataTypes.mysql;
  dataTypes.sqlite = require('./dialects/sqlite/data-types')(dataTypes);
  dataTypes.mssql = require('./dialects/mssql/data-types')(dataTypes);
  module.exports = dataTypes;
})(require('buffer').Buffer, require('process'));
