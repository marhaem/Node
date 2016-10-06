/* */ 
var Classes = Object.create(null);
exports.createConnection = function createConnection(config) {
  var Connection = loadClass('Connection');
  var ConnectionConfig = loadClass('ConnectionConfig');
  return new Connection({config: new ConnectionConfig(config)});
};
exports.createPool = function createPool(config) {
  var Pool = loadClass('Pool');
  var PoolConfig = loadClass('PoolConfig');
  return new Pool({config: new PoolConfig(config)});
};
exports.createPoolCluster = function createPoolCluster(config) {
  var PoolCluster = loadClass('PoolCluster');
  return new PoolCluster(config);
};
exports.createQuery = function createQuery(sql, values, callback) {
  var Connection = loadClass('Connection');
  return Connection.createQuery(sql, values, callback);
};
exports.escape = function escape(value, stringifyObjects, timeZone) {
  var SqlString = loadClass('SqlString');
  return SqlString.escape(value, stringifyObjects, timeZone);
};
exports.escapeId = function escapeId(value, forbidQualified) {
  var SqlString = loadClass('SqlString');
  return SqlString.escapeId(value, forbidQualified);
};
exports.format = function format(sql, values, stringifyObjects, timeZone) {
  var SqlString = loadClass('SqlString');
  return SqlString.format(sql, values, stringifyObjects, timeZone);
};
Object.defineProperty(exports, 'Types', {get: loadClass.bind(null, 'Types')});
function loadClass(className) {
  var Class = Classes[className];
  if (Class !== undefined) {
    return Class;
  }
  switch (className) {
    case 'Connection':
      Class = require('./lib/Connection');
      break;
    case 'ConnectionConfig':
      Class = require('./lib/ConnectionConfig');
      break;
    case 'Pool':
      Class = require('./lib/Pool');
      break;
    case 'PoolCluster':
      Class = require('./lib/PoolCluster');
      break;
    case 'PoolConfig':
      Class = require('./lib/PoolConfig');
      break;
    case 'SqlString':
      Class = require('./lib/protocol/SqlString');
      break;
    case 'Types':
      Class = require('./lib/protocol/constants/types');
      break;
    default:
      throw new Error('Cannot find class \'' + className + '\'');
  }
  Classes[className] = Class;
  return Class;
}
