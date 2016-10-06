/* */ 
(function(process) {
  'use strict';
  var url = require('url'),
      Path = require('path'),
      retry = require('retry-as-promised'),
      Utils = require('./utils'),
      Model = require('./model'),
      DataTypes = require('./data-types'),
      Deferrable = require('./deferrable'),
      ModelManager = require('./model-manager'),
      QueryInterface = require('./query-interface'),
      Transaction = require('./transaction'),
      QueryTypes = require('./query-types'),
      sequelizeErrors = require('./errors'),
      Promise = require('./promise'),
      Hooks = require('./hooks'),
      Instance = require('./instance'),
      Association = require('./associations/index'),
      _ = require('lodash');
  var Sequelize = function(database, username, password, options) {
    var config;
    if (arguments.length === 1 && typeof database === 'object') {
      options = database;
      config = _.pick(options, 'host', 'port', 'database', 'username', 'password');
    } else if ((arguments.length === 1 && typeof database === 'string') || (arguments.length === 2 && typeof username === 'object')) {
      config = {};
      options = username || {};
      var urlParts = url.parse(arguments[0]);
      if (urlParts.pathname) {
        config.database = urlParts.pathname.replace(/^\//, '');
      }
      options.dialect = urlParts.protocol.replace(/:$/, '');
      options.host = urlParts.hostname;
      if (urlParts.port) {
        options.port = urlParts.port;
      }
      if (urlParts.auth) {
        config.username = urlParts.auth.split(':')[0];
        config.password = urlParts.auth.split(':')[1];
      }
    } else {
      options = options || {};
      config = {
        database: database,
        username: username,
        password: password
      };
    }
    Sequelize.runHooks('beforeInit', config, options);
    this.options = Utils._.extend({
      dialect: 'mysql',
      dialectModulePath: null,
      host: 'localhost',
      protocol: 'tcp',
      define: {},
      query: {},
      sync: {},
      timezone: '+00:00',
      logging: console.log,
      omitNull: false,
      native: false,
      replication: false,
      ssl: undefined,
      pool: {},
      quoteIdentifiers: true,
      hooks: {},
      retry: {
        max: 5,
        match: ['SQLITE_BUSY: database is locked']
      },
      transactionType: Transaction.TYPES.DEFERRED,
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
      databaseVersion: 0,
      typeValidation: false,
      benchmark: false
    }, options || {});
    if (this.options.dialect === 'postgresql') {
      this.options.dialect = 'postgres';
    }
    if (this.options.dialect === 'sqlite' && this.options.timezone !== '+00:00') {
      throw new Error('Setting a custom timezone is not supported by SQLite, dates are always returned as UTC. Please remove the custom timezone parameter.');
    }
    if (this.options.logging === true) {
      console.log('DEPRECATION WARNING: The logging-option should be either a function or false. Default: console.log');
      this.options.logging = console.log;
    }
    this.options.hooks = this.replaceHookAliases(this.options.hooks);
    if ((['', null, false].indexOf(config.password) > -1) || (typeof config.password === 'undefined')) {
      config.password = null;
    }
    this.config = {
      database: config.database,
      username: config.username,
      password: config.password,
      host: config.host || this.options.host,
      port: config.port || this.options.port,
      pool: this.options.pool,
      protocol: this.options.protocol,
      native: this.options.native,
      ssl: this.options.ssl,
      replication: this.options.replication,
      dialectModulePath: this.options.dialectModulePath,
      keepDefaultTimezone: this.options.keepDefaultTimezone,
      dialectOptions: this.options.dialectOptions
    };
    var Dialect;
    switch (this.getDialect()) {
      case 'mariadb':
        Dialect = require('./dialects/mariadb/index');
        break;
      case 'mssql':
        Dialect = require('./dialects/mssql/index');
        break;
      case 'mysql':
        Dialect = require('./dialects/mysql/index');
        break;
      case 'postgres':
        Dialect = require('./dialects/postgres/index');
        break;
      case 'sqlite':
        Dialect = require('./dialects/sqlite/index');
        break;
      default:
        throw new Error('The dialect ' + this.getDialect() + ' is not supported. Supported dialects: mariadb, mssql, mysql, postgres, and sqlite.');
    }
    this.dialect = new Dialect(this);
    this.dialect.QueryGenerator.typeValidation = options.typeValidation;
    this.models = {};
    this.modelManager = new ModelManager(this);
    this.connectionManager = this.dialect.connectionManager;
    this.importCache = {};
    this.test = {
      $trackRunningQueries: false,
      $runningQueries: 0,
      trackRunningQueries: function() {
        this.$trackRunningQueries = true;
      },
      verifyNoRunningQueries: function() {
        if (this.$runningQueries > 0)
          throw new Error('Expected 0 running queries. ' + this.$runningQueries + ' queries still running');
      }
    };
    Sequelize.runHooks('afterInit', this);
  };
  Sequelize.version = require('../package.json!systemjs-json').version;
  Sequelize.options = {hooks: {}};
  Sequelize.prototype.Sequelize = Sequelize;
  Sequelize.prototype.Utils = Sequelize.Utils = Utils;
  Sequelize.prototype.Promise = Sequelize.Promise = Promise;
  Sequelize.prototype.QueryTypes = Sequelize.QueryTypes = QueryTypes;
  Sequelize.prototype.Validator = Sequelize.Validator = require('validator');
  Sequelize.prototype.Model = Sequelize.Model = Model;
  for (var dataType in DataTypes) {
    Sequelize[dataType] = DataTypes[dataType];
  }
  Object.defineProperty(Sequelize.prototype, 'connectorManager', {get: function() {
      return this.transactionManager.getConnectorManager();
    }});
  Sequelize.prototype.Transaction = Sequelize.Transaction = Transaction;
  Sequelize.prototype.Deferrable = Sequelize.Deferrable = Deferrable;
  Sequelize.prototype.Instance = Sequelize.Instance = Instance;
  Sequelize.prototype.Association = Sequelize.Association = Association;
  Hooks.applyTo(Sequelize);
  Sequelize.prototype.Error = Sequelize.Error = sequelizeErrors.BaseError;
  Sequelize.prototype.ValidationError = Sequelize.ValidationError = sequelizeErrors.ValidationError;
  Sequelize.prototype.ValidationErrorItem = Sequelize.ValidationErrorItem = sequelizeErrors.ValidationErrorItem;
  Sequelize.prototype.DatabaseError = Sequelize.DatabaseError = sequelizeErrors.DatabaseError;
  Sequelize.prototype.TimeoutError = Sequelize.TimeoutError = sequelizeErrors.TimeoutError;
  Sequelize.prototype.UniqueConstraintError = Sequelize.UniqueConstraintError = sequelizeErrors.UniqueConstraintError;
  Sequelize.prototype.ExclusionConstraintError = Sequelize.ExclusionConstraintError = sequelizeErrors.ExclusionConstraintError;
  Sequelize.prototype.ForeignKeyConstraintError = Sequelize.ForeignKeyConstraintError = sequelizeErrors.ForeignKeyConstraintError;
  Sequelize.prototype.ConnectionError = Sequelize.ConnectionError = sequelizeErrors.ConnectionError;
  Sequelize.prototype.ConnectionRefusedError = Sequelize.ConnectionRefusedError = sequelizeErrors.ConnectionRefusedError;
  Sequelize.prototype.AccessDeniedError = Sequelize.AccessDeniedError = sequelizeErrors.AccessDeniedError;
  Sequelize.prototype.HostNotFoundError = Sequelize.HostNotFoundError = sequelizeErrors.HostNotFoundError;
  Sequelize.prototype.HostNotReachableError = Sequelize.HostNotReachableError = sequelizeErrors.HostNotReachableError;
  Sequelize.prototype.InvalidConnectionError = Sequelize.InvalidConnectionError = sequelizeErrors.InvalidConnectionError;
  Sequelize.prototype.ConnectionTimedOutError = Sequelize.ConnectionTimedOutError = sequelizeErrors.ConnectionTimedOutError;
  Sequelize.prototype.InstanceError = Sequelize.InstanceError = sequelizeErrors.InstanceError;
  Sequelize.prototype.EmptyResultError = Sequelize.EmptyResultError = sequelizeErrors.EmptyResultError;
  Sequelize.prototype.refreshTypes = function() {
    this.connectionManager.refreshTypeParser(DataTypes);
  };
  Sequelize.prototype.getDialect = function() {
    return this.options.dialect;
  };
  Sequelize.prototype.getQueryInterface = function() {
    this.queryInterface = this.queryInterface || new QueryInterface(this);
    return this.queryInterface;
  };
  Sequelize.prototype.define = function(modelName, attributes, options) {
    options = options || {};
    var globalOptions = this.options;
    if (globalOptions.define) {
      options = Utils.merge(globalOptions.define, options);
    }
    options = Utils.merge({
      name: {
        plural: Utils.inflection.pluralize(modelName),
        singular: Utils.inflection.singularize(modelName)
      },
      indexes: [],
      omitNul: globalOptions.omitNull
    }, options);
    if (this.isDefined(modelName)) {
      this.modelManager.removeModel(this.modelManager.getModel(modelName));
    }
    options.sequelize = this;
    options.modelName = modelName;
    this.runHooks('beforeDefine', attributes, options);
    modelName = options.modelName;
    delete options.modelName;
    var model = new Model(modelName, attributes, options);
    model = model.init(this.modelManager);
    this.modelManager.addModel(model);
    this.runHooks('afterDefine', model);
    return model;
  };
  Sequelize.prototype.model = function(modelName) {
    if (!this.isDefined(modelName)) {
      throw new Error(modelName + ' has not been defined');
    }
    return this.modelManager.getModel(modelName);
  };
  Sequelize.prototype.isDefined = function(modelName) {
    var models = this.modelManager.models;
    return (models.filter(function(model) {
      return model.name === modelName;
    }).length !== 0);
  };
  Sequelize.prototype.import = function(path) {
    if (Path.normalize(path) !== Path.resolve(path)) {
      var callerFilename = Utils.stack()[1].getFileName(),
          callerPath = Path.dirname(callerFilename);
      path = Path.resolve(callerPath, path);
    }
    if (!this.importCache[path]) {
      var defineCall = (arguments.length > 1 ? arguments[1] : require(path));
      if (typeof defineCall === 'object' && defineCall.__esModule) {
        defineCall = defineCall['default'];
      }
      this.importCache[path] = defineCall(this, DataTypes);
    }
    return this.importCache[path];
  };
  Sequelize.prototype.query = function(sql, options) {
    if (arguments.length > 2) {
      throw new Error('Sequelize.query was refactored to only use the parameters `sql` and `options`. Please read the changelog about BC.');
    }
    var self = this;
    options = _.assign({}, this.options.query, options);
    if (options.instance && !options.model) {
      options.model = options.instance.Model;
    }
    if (options.model && options.mapToModel && !Utils._.isEmpty(options.model.fieldAttributeMap)) {
      options.fieldMap = options.model.fieldAttributeMap;
    }
    if (typeof sql === 'object') {
      if (sql.values !== undefined) {
        if (options.replacements !== undefined) {
          throw new Error('Both `sql.values` and `options.replacements` cannot be set at the same time');
        }
        options.replacements = sql.values;
      }
      if (sql.bind !== undefined) {
        if (options.bind !== undefined) {
          throw new Error('Both `sql.bind` and `options.bind` cannot be set at the same time');
        }
        options.bind = sql.bind;
      }
      if (sql.query !== undefined) {
        sql = sql.query;
      }
    }
    sql = sql.trim();
    if (!options.instance && !options.model) {
      options.raw = true;
    }
    if (options.replacements && options.bind) {
      throw new Error('Both `replacements` and `bind` cannot be set at the same time');
    }
    if (options.replacements) {
      if (Array.isArray(options.replacements)) {
        sql = Utils.format([sql].concat(options.replacements), this.options.dialect);
      } else {
        sql = Utils.formatNamedParameters(sql, options.replacements, this.options.dialect);
      }
    }
    var bindParameters;
    if (options.bind) {
      var bindSql = self.dialect.Query.formatBindParameters(sql, options.bind, this.options.dialect);
      sql = bindSql[0];
      bindParameters = bindSql[1];
    }
    options = _.defaults(options, {
      logging: this.options.hasOwnProperty('logging') ? this.options.logging : console.log,
      searchPath: this.options.hasOwnProperty('searchPath') ? this.options.searchPath : 'DEFAULT'
    });
    if (options.transaction === undefined && Sequelize.cls) {
      options.transaction = Sequelize.cls.get('transaction');
    }
    if (!options.type) {
      if (options.model || options.nest || options.plain) {
        options.type = QueryTypes.SELECT;
      } else {
        options.type = QueryTypes.RAW;
      }
    }
    if (options.transaction && options.transaction.finished) {
      var error = new Error(options.transaction.finished + ' has been called on this transaction(' + options.transaction.id + '), you can no longer use it. (The rejected query is attached as the \'sql\' property of this error)');
      error.sql = sql;
      return Promise.reject(error);
    }
    if (this.test.$trackRunningQueries) {
      this.test.$runningQueries++;
    }
    if (!self.dialect.supports.searchPath || !this.options.dialectOptions || !this.options.dialectOptions.prependSearchPath || options.supportsSearchPath === false) {
      delete options.searchPath;
    } else if (!options.searchPath) {
      options.searchPath = 'DEFAULT';
    }
    return Promise.resolve(options.transaction ? options.transaction.connection : self.connectionManager.getConnection(options)).then(function(connection) {
      var query = new self.dialect.Query(connection, self, options);
      return retry(function() {
        return query.run(sql, bindParameters).finally(function() {
          if (options.transaction)
            return;
          return self.connectionManager.releaseConnection(connection);
        });
      }, Utils._.extend(self.options.retry, options.retry || {}));
    }).finally(function() {
      if (self.test.$trackRunningQueries) {
        self.test.$runningQueries--;
      }
    });
  };
  Sequelize.prototype.set = function(variables, options) {
    var query;
    options = Utils._.extend({}, this.options.set, typeof options === 'object' && options || {});
    if (['mysql', 'mariadb'].indexOf(this.options.dialect) === -1) {
      throw new Error('sequelize.set is only supported for mysql');
    }
    if (!options.transaction || !(options.transaction instanceof Transaction)) {
      throw new TypeError('options.transaction is required');
    }
    options.raw = true;
    options.plain = true;
    options.type = 'SET';
    query = 'SET ' + Utils._.map(variables, function(v, k) {
      return '@' + k + ' := ' + (typeof v === 'string' ? '"' + v + '"' : v);
    }).join(', ');
    return this.query(query, options);
  };
  Sequelize.prototype.escape = function(value) {
    return this.getQueryInterface().escape(value);
  };
  Sequelize.prototype.createSchema = function(schema, options) {
    return this.getQueryInterface().createSchema(schema, options);
  };
  Sequelize.prototype.showAllSchemas = function(options) {
    return this.getQueryInterface().showAllSchemas(options);
  };
  Sequelize.prototype.dropSchema = function(schema, options) {
    return this.getQueryInterface().dropSchema(schema, options);
  };
  Sequelize.prototype.dropAllSchemas = function(options) {
    return this.getQueryInterface().dropAllSchemas(options);
  };
  Sequelize.prototype.sync = function(options) {
    var self = this;
    options = _.clone(options) || {};
    options.hooks = options.hooks === undefined ? true : !!options.hooks;
    options.logging = options.logging === undefined ? false : options.logging;
    options = Utils._.defaults(options, this.options.sync, this.options);
    if (options.match) {
      if (!options.match.test(this.config.database)) {
        return Promise.reject(new Error('Database does not match sync match parameter'));
      }
    }
    return Promise.try(function() {
      if (options.hooks) {
        return self.runHooks('beforeBulkSync', options);
      }
    }).then(function() {
      if (options.force) {
        return self.drop(options);
      }
    }).then(function() {
      var models = [];
      self.modelManager.forEachModel(function(model) {
        if (model) {
          models.push(model);
        } else {}
      });
      return Promise.each(models, function(model) {
        return model.sync(options);
      });
    }).then(function() {
      if (options.hooks) {
        return self.runHooks('afterBulkSync', options);
      }
    }).return(self);
  };
  Sequelize.prototype.truncate = function(options) {
    var models = [];
    this.modelManager.forEachModel(function(model) {
      if (model) {
        models.push(model);
      }
    }, {reverse: false});
    var truncateModel = function(model) {
      return model.truncate(options);
    };
    if (options && options.cascade) {
      return Promise.each(models, truncateModel);
    } else {
      return Promise.map(models, truncateModel);
    }
  };
  Sequelize.prototype.drop = function(options) {
    var models = [];
    this.modelManager.forEachModel(function(model) {
      if (model) {
        models.push(model);
      }
    }, {reverse: false});
    return Promise.each(models, function(model) {
      return model.drop(options);
    });
  };
  Sequelize.prototype.authenticate = function(options) {
    return this.query('SELECT 1+1 AS result', Utils._.assign({
      raw: true,
      plain: true
    }, options)).return();
  };
  Sequelize.prototype.databaseVersion = function(options) {
    return this.getQueryInterface().databaseVersion(options);
  };
  Sequelize.prototype.validate = Sequelize.prototype.authenticate;
  Sequelize.fn = Sequelize.prototype.fn = function(fn) {
    return new Utils.fn(fn, Utils.sliceArgs(arguments, 1));
  };
  Sequelize.col = Sequelize.prototype.col = function(col) {
    return new Utils.col(col);
  };
  Sequelize.cast = Sequelize.prototype.cast = function(val, type) {
    return new Utils.cast(val, type);
  };
  Sequelize.literal = Sequelize.asIs = Sequelize.prototype.asIs = Sequelize.prototype.literal = function(val) {
    return new Utils.literal(val);
  };
  Sequelize.and = Sequelize.prototype.and = function() {
    return {$and: Utils.sliceArgs(arguments)};
  };
  Sequelize.or = Sequelize.prototype.or = function() {
    return {$or: Utils.sliceArgs(arguments)};
  };
  Sequelize.json = Sequelize.prototype.json = function(conditionsOrPath, value) {
    return new Utils.json(conditionsOrPath, value);
  };
  Sequelize.where = Sequelize.condition = Sequelize.prototype.condition = Sequelize.prototype.where = function(attr, comparator, logic) {
    return new Utils.where(attr, comparator, logic);
  };
  Sequelize.prototype.transaction = function(options, autoCallback) {
    if (typeof options === 'function') {
      autoCallback = options;
      options = undefined;
    }
    var transaction = new Transaction(this, options),
        ns = Sequelize.cls;
    if (autoCallback) {
      var transactionResolver = function(resolve, reject) {
        transaction.prepareEnvironment().then(function() {
          if (ns) {
            autoCallback = ns.bind(autoCallback);
          }
          var result = autoCallback(transaction);
          if (!result || !result.then)
            throw new Error('You need to return a promise chain/thenable to the sequelize.transaction() callback');
          return result.then(function(result) {
            return transaction.commit().then(function() {
              resolve(result);
            });
          });
        }).catch(function(err) {
          if (transaction.finished) {
            reject(err);
          } else {
            return transaction.rollback().finally(function() {
              reject(err);
            });
          }
        });
      };
      if (ns) {
        transactionResolver = ns.bind(transactionResolver, ns.createContext());
      }
      return new Promise(transactionResolver);
    } else {
      return transaction.prepareEnvironment().return(transaction);
    }
  };
  Sequelize.prototype.log = function() {
    var args = Utils.sliceArgs(arguments),
        last = Utils._.last(args),
        options;
    if (last && Utils._.isPlainObject(last) && last.hasOwnProperty('logging')) {
      options = last;
      args.splice(args.length - 1, 1);
    } else {
      options = this.options;
    }
    if (options.logging) {
      if (options.logging === true) {
        console.log('DEPRECATION WARNING: The logging-option should be either a function or false. Default: console.log');
        options.logging = console.log;
      }
      if ((this.options.benchmark || options.benchmark) && options.logging === console.log) {
        args = [args[0] + ' Elapsed time: ' + args[1] + 'ms'];
      }
      options.logging.apply(null, args);
    }
  };
  Sequelize.prototype.close = function() {
    this.connectionManager.close();
  };
  Sequelize.prototype.normalizeDataType = function(Type) {
    var type = typeof Type === 'function' ? new Type() : Type,
        dialectTypes = this.dialect.DataTypes || {};
    if (dialectTypes[type.key]) {
      type = dialectTypes[type.key].extend(type);
    }
    if (type instanceof DataTypes.ARRAY && dialectTypes[type.type.key]) {
      type.type = dialectTypes[type.type.key].extend(type.type);
    }
    return type;
  };
  Sequelize.prototype.normalizeAttribute = function(attribute) {
    if (!Utils._.isPlainObject(attribute)) {
      attribute = {type: attribute};
    }
    if (!attribute.type)
      return attribute;
    attribute.type = this.normalizeDataType(attribute.type);
    if (attribute.hasOwnProperty('defaultValue')) {
      if (typeof attribute.defaultValue === 'function' && (attribute.defaultValue === DataTypes.NOW || attribute.defaultValue === DataTypes.UUIDV1 || attribute.defaultValue === DataTypes.UUIDV4)) {
        attribute.defaultValue = new attribute.defaultValue();
      }
    }
    if (attribute.type instanceof DataTypes.ENUM) {
      if (attribute.values) {
        attribute.type.values = attribute.type.options.values = attribute.values;
      } else {
        attribute.values = attribute.type.values;
      }
      if (!attribute.values.length) {
        throw new Error('Values for ENUM have not been defined.');
      }
    }
    return attribute;
  };
  module.exports = Promise.Sequelize = Sequelize;
})(require('process'));
