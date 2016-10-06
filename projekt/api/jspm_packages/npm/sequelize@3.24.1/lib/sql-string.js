/* */ 
(function(Buffer) {
  'use strict';
  var dataTypes = require('./data-types'),
      _ = require('lodash'),
      SqlString = exports;
  SqlString.escapeId = function(val, forbidQualified) {
    if (forbidQualified) {
      return '`' + val.replace(/`/g, '``') + '`';
    }
    return '`' + val.replace(/`/g, '``').replace(/\./g, '`.`') + '`';
  };
  SqlString.escape = function(val, timeZone, dialect, format) {
    var prependN = false;
    if (val === undefined || val === null) {
      return 'NULL';
    }
    switch (typeof val) {
      case 'boolean':
        if (dialect === 'sqlite' || dialect === 'mssql') {
          return +!!val;
        }
        return '' + !!val;
      case 'number':
        return val + '';
      case 'string':
        prependN = dialect === 'mssql';
        break;
    }
    if (val instanceof Date) {
      val = dataTypes[dialect].DATE.prototype.stringify(val, {timezone: timeZone});
    }
    if (Buffer.isBuffer(val)) {
      if (dataTypes[dialect].BLOB) {
        return dataTypes[dialect].BLOB.prototype.stringify(val);
      }
      return dataTypes.BLOB.prototype.stringify(val);
    }
    if (Array.isArray(val)) {
      var escape = _.partial(SqlString.escape, _, timeZone, dialect, format);
      if (dialect === 'postgres' && !format) {
        return dataTypes.ARRAY.prototype.stringify(val, {escape: escape});
      }
      return val.map(escape);
    }
    if (dialect === 'postgres' || dialect === 'sqlite' || dialect === 'mssql') {
      val = val.replace(/'/g, "''");
    } else {
      val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
        switch (s) {
          case '\0':
            return '\\0';
          case '\n':
            return '\\n';
          case '\r':
            return '\\r';
          case '\b':
            return '\\b';
          case '\t':
            return '\\t';
          case '\x1a':
            return '\\Z';
          default:
            return '\\' + s;
        }
      });
    }
    return (prependN ? "N'" : "'") + val + "'";
  };
  SqlString.format = function(sql, values, timeZone, dialect) {
    values = [].concat(values);
    return sql.replace(/\?/g, function(match) {
      if (!values.length) {
        return match;
      }
      return SqlString.escape(values.shift(), timeZone, dialect, true);
    });
  };
  SqlString.formatNamedParameters = function(sql, values, timeZone, dialect) {
    return sql.replace(/\:+(?!\d)(\w+)/g, function(value, key) {
      if ('postgres' === dialect && '::' === value.slice(0, 2)) {
        return value;
      }
      if (values[key] !== undefined) {
        return SqlString.escape(values[key], timeZone, dialect, true);
      } else {
        throw new Error('Named parameter "' + value + '" has no value in the given object.');
      }
    });
  };
})(require('buffer').Buffer);
