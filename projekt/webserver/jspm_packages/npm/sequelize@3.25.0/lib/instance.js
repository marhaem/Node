/* */ 
(function(Buffer) {
  'use strict';
  var Utils = require('./utils'),
      BelongsTo = require('./associations/belongs-to'),
      BelongsToMany = require('./associations/belongs-to-many'),
      InstanceValidator = require('./instance-validator'),
      QueryTypes = require('./query-types'),
      sequelizeErrors = require('./errors'),
      Dottie = require('dottie'),
      Promise = require('./promise'),
      _ = require('lodash'),
      defaultsOptions = {raw: true};
  var initValues = function(values, options) {
    var defaults,
        key;
    values = values && _.clone(values) || {};
    if (options.isNewRecord) {
      defaults = {};
      if (this.Model._hasDefaultValues) {
        defaults = _.mapValues(this.Model._defaultValues, function(valueFn) {
          var value = valueFn();
          return (value && value._isSequelizeMethod) ? value : _.cloneDeep(value);
        });
      }
      if (!defaults.hasOwnProperty(this.Model.primaryKeyAttribute)) {
        defaults[this.Model.primaryKeyAttribute] = null;
      }
      if (this.Model._timestampAttributes.createdAt && defaults[this.Model._timestampAttributes.createdAt]) {
        this.dataValues[this.Model._timestampAttributes.createdAt] = Utils.toDefaultValue(defaults[this.Model._timestampAttributes.createdAt]);
        delete defaults[this.Model._timestampAttributes.createdAt];
      }
      if (this.Model._timestampAttributes.updatedAt && defaults[this.Model._timestampAttributes.updatedAt]) {
        this.dataValues[this.Model._timestampAttributes.updatedAt] = Utils.toDefaultValue(defaults[this.Model._timestampAttributes.updatedAt]);
        delete defaults[this.Model._timestampAttributes.updatedAt];
      }
      if (this.Model._timestampAttributes.deletedAt && defaults[this.Model._timestampAttributes.deletedAt]) {
        this.dataValues[this.Model._timestampAttributes.deletedAt] = Utils.toDefaultValue(defaults[this.Model._timestampAttributes.deletedAt]);
        delete defaults[this.Model._timestampAttributes.deletedAt];
      }
      if (Object.keys(defaults).length) {
        for (key in defaults) {
          if (values[key] === undefined) {
            this.set(key, Utils.toDefaultValue(defaults[key]), defaultsOptions);
            delete values[key];
          }
        }
      }
    }
    this.set(values, options);
  };
  var Instance = function(values, options) {
    this.dataValues = {};
    this._previousDataValues = {};
    this._changed = {};
    this.$modelOptions = this.Model.options;
    this.$options = options || {};
    this.hasPrimaryKeys = this.Model.options.hasPrimaryKeys;
    this.__eagerlyLoadedAssociations = [];
    this.isNewRecord = options.isNewRecord;
    initValues.call(this, values, options);
  };
  Object.defineProperty(Instance.prototype, 'sequelize', {get: function() {
      return this.Model.modelManager.sequelize;
    }});
  Instance.prototype.where = function() {
    var where;
    where = this.Model.primaryKeyAttributes.reduce(function(result, attribute) {
      result[attribute] = this.get(attribute, {raw: true});
      return result;
    }.bind(this), {});
    if (_.size(where) === 0) {
      return this.$modelOptions.whereCollection;
    }
    return Utils.mapWhereFieldNames(where, this.$Model);
  };
  Instance.prototype.toString = function() {
    return '[object SequelizeInstance:' + this.Model.name + ']';
  };
  Instance.prototype.getDataValue = function(key) {
    return this.dataValues[key];
  };
  Instance.prototype.setDataValue = function(key, value) {
    var originalValue = this._previousDataValues[key];
    if (!Utils.isPrimitive(value) || value !== originalValue) {
      this.changed(key, true);
    }
    this.dataValues[key] = value;
  };
  Instance.prototype.get = function(key, options) {
    if (options === undefined && typeof key === 'object') {
      options = key;
      key = undefined;
    }
    if (key) {
      if (this._customGetters[key]) {
        return this._customGetters[key].call(this, key);
      }
      if (options && options.plain && this.$options.include && this.$options.includeNames.indexOf(key) !== -1) {
        if (Array.isArray(this.dataValues[key])) {
          return this.dataValues[key].map(function(instance) {
            return instance.get({plain: options.plain});
          });
        } else if (this.dataValues[key] instanceof Instance) {
          return this.dataValues[key].get({plain: options.plain});
        } else {
          return this.dataValues[key];
        }
      }
      return this.dataValues[key];
    }
    if (this._hasCustomGetters || (options && options.plain && this.$options.include) || (options && options.clone)) {
      var values = {},
          _key;
      if (this._hasCustomGetters) {
        for (_key in this._customGetters) {
          if (this._customGetters.hasOwnProperty(_key)) {
            values[_key] = this.get(_key, options);
          }
        }
      }
      for (_key in this.dataValues) {
        if (!values.hasOwnProperty(_key) && this.dataValues.hasOwnProperty(_key)) {
          values[_key] = this.get(_key, options);
        }
      }
      return values;
    }
    return this.dataValues;
  };
  Instance.prototype.set = function(key, value, options) {
    var values,
        originalValue,
        keys,
        i,
        length;
    if (typeof key === 'object' && key !== null) {
      values = key;
      options = value || {};
      if (options.reset) {
        this.dataValues = {};
      }
      if (options.raw && !(this.$options && this.$options.include) && !(options && options.attributes) && !this.Model._hasBooleanAttributes && !this.Model._hasDateAttributes) {
        if (Object.keys(this.dataValues).length) {
          this.dataValues = _.extend(this.dataValues, values);
        } else {
          this.dataValues = values;
        }
        this._previousDataValues = _.clone(this.dataValues);
      } else {
        if (options.attributes) {
          keys = options.attributes;
          if (this.Model._hasVirtualAttributes) {
            keys = keys.concat(this.Model._virtualAttributes);
          }
          if (this.$options.includeNames) {
            keys = keys.concat(this.$options.includeNames);
          }
          for (i = 0, length = keys.length; i < length; i++) {
            if (values[keys[i]] !== undefined) {
              this.set(keys[i], values[keys[i]], options);
            }
          }
        } else {
          for (key in values) {
            this.set(key, values[key], options);
          }
        }
        if (options.raw) {
          this._previousDataValues = _.clone(this.dataValues);
        }
      }
    } else {
      if (!options)
        options = {};
      if (!options.raw) {
        originalValue = this.dataValues[key];
      }
      if (!options.raw && this._customSetters[key]) {
        this._customSetters[key].call(this, value, key);
      } else {
        if (this.$options && this.$options.include && this.$options.includeNames.indexOf(key) !== -1) {
          this._setInclude(key, value, options);
          return this;
        } else {
          if (!options.raw) {
            if (!this._isAttribute(key)) {
              if (key.indexOf('.') > -1 && this.Model._isJsonAttribute(key.split('.')[0])) {
                var previousDottieValue = Dottie.get(this.dataValues, key);
                if (!_.isEqual(previousDottieValue, value)) {
                  Dottie.set(this.dataValues, key, value);
                  this.changed(key.split('.')[0], true);
                }
              }
              return this;
            }
            if (this.Model._hasPrimaryKeys && originalValue && this.Model._isPrimaryKey(key)) {
              return this;
            }
            if (!this.isNewRecord && this.Model._hasReadOnlyAttributes && this.Model._isReadOnlyAttribute(key)) {
              return this;
            }
            if (this.Model._hasDateAttributes && this.Model._isDateAttribute(key) && !!value && !value._isSequelizeMethod) {
              if (!(value instanceof Date)) {
                value = new Date(value);
              }
              if (!(originalValue instanceof Date)) {
                originalValue = new Date(originalValue);
              }
              if (originalValue && value.getTime() === originalValue.getTime()) {
                return this;
              }
            }
          }
          if (this.Model._hasBooleanAttributes && this.Model._isBooleanAttribute(key) && value !== null && value !== undefined && !value._isSequelizeMethod) {
            if (Buffer.isBuffer(value) && value.length === 1) {
              value = value[0];
            }
            if (_.isString(value)) {
              value = (value === 'true') ? true : (value === 'false') ? false : value;
            } else if (_.isNumber(value)) {
              value = (value === 1) ? true : (value === 0) ? false : value;
            }
          }
          if (!options.raw && ((!Utils.isPrimitive(value) && value !== null) || value !== originalValue)) {
            this._previousDataValues[key] = originalValue;
            this.changed(key, true);
          }
          this.dataValues[key] = value;
        }
      }
    }
    return this;
  };
  Instance.prototype.setAttributes = function(updates) {
    return this.set(updates);
  };
  Instance.prototype.changed = function(key, value) {
    if (key) {
      if (value !== undefined) {
        this._changed[key] = value;
        return this;
      }
      return this._changed[key] || false;
    }
    var changed = Object.keys(this.dataValues).filter(function(key) {
      return this.changed(key);
    }.bind(this));
    return changed.length ? changed : false;
  };
  Instance.prototype.previous = function(key) {
    if (key) {
      return this._previousDataValues[key];
    }
    return _.pickBy(this._previousDataValues, function(value, key) {
      return this.changed(key);
    }.bind(this));
  };
  Instance.prototype._setInclude = function(key, value, options) {
    if (!Array.isArray(value))
      value = [value];
    if (value[0] instanceof Instance) {
      value = value.map(function(instance) {
        return instance.dataValues;
      });
    }
    var include = this.$options.includeMap[key],
        association = include.association,
        self = this,
        accessor = key,
        childOptions,
        primaryKeyAttribute = include.model.primaryKeyAttribute,
        isEmpty;
    if (!isEmpty) {
      childOptions = {
        isNewRecord: this.isNewRecord,
        include: include.include,
        includeNames: include.includeNames,
        includeMap: include.includeMap,
        includeValidated: true,
        raw: options.raw,
        attributes: include.originalAttributes
      };
    }
    if (include.originalAttributes === undefined || include.originalAttributes.length) {
      if (association.isSingleAssociation) {
        if (Array.isArray(value)) {
          value = value[0];
        }
        isEmpty = (value && value[primaryKeyAttribute] === null) || (value === null);
        self[accessor] = self.dataValues[accessor] = isEmpty ? null : include.model.build(value, childOptions);
      } else {
        isEmpty = value[0] && value[0][primaryKeyAttribute] === null;
        self[accessor] = self.dataValues[accessor] = isEmpty ? [] : include.model.bulkBuild(value, childOptions);
      }
    }
  };
  Instance.prototype.save = function(options) {
    if (arguments.length > 1) {
      throw new Error('The second argument was removed in favor of the options object.');
    }
    options = Utils.cloneDeep(options);
    options = _.defaults(options, {
      hooks: true,
      validate: true
    });
    if (!options.fields) {
      if (this.isNewRecord) {
        options.fields = Object.keys(this.Model.attributes);
      } else {
        options.fields = _.intersection(this.changed(), Object.keys(this.Model.attributes));
      }
      options.defaultFields = options.fields;
    }
    if (options.returning === undefined) {
      if (options.association) {
        options.returning = false;
      } else if (this.isNewRecord) {
        options.returning = true;
      }
    }
    var self = this,
        primaryKeyName = this.Model.primaryKeyAttribute,
        primaryKeyAttribute = primaryKeyName && this.Model.rawAttributes[primaryKeyName],
        updatedAtAttr = this.Model._timestampAttributes.updatedAt,
        createdAtAttr = this.Model._timestampAttributes.createdAt,
        hook = self.isNewRecord ? 'Create' : 'Update',
        wasNewRecord = this.isNewRecord,
        now = Utils.now(this.sequelize.options.dialect);
    if (updatedAtAttr && options.fields.length >= 1 && options.fields.indexOf(updatedAtAttr) === -1) {
      options.fields.push(updatedAtAttr);
    }
    if (options.silent === true && !(this.isNewRecord && this.get(updatedAtAttr, {raw: true}))) {
      Utils._.remove(options.fields, function(val) {
        return val === updatedAtAttr;
      });
      updatedAtAttr = false;
    }
    if (this.isNewRecord === true) {
      if (createdAtAttr && options.fields.indexOf(createdAtAttr) === -1) {
        options.fields.push(createdAtAttr);
      }
      if (primaryKeyAttribute && primaryKeyAttribute.defaultValue && options.fields.indexOf(primaryKeyName) < 0) {
        options.fields.unshift(primaryKeyName);
      }
    }
    if (this.isNewRecord === false) {
      if (primaryKeyName && this.get(primaryKeyName, {raw: true}) === undefined) {
        throw new Error('You attempted to save an instance with no primary key, this is not allowed since it would result in a global update');
      }
    }
    if (updatedAtAttr && !options.silent && options.fields.indexOf(updatedAtAttr) !== -1) {
      this.dataValues[updatedAtAttr] = this.Model.$getDefaultTimestamp(updatedAtAttr) || now;
    }
    if (this.isNewRecord && createdAtAttr && !this.dataValues[createdAtAttr]) {
      this.dataValues[createdAtAttr] = this.Model.$getDefaultTimestamp(createdAtAttr) || now;
    }
    return Promise.bind(this).then(function() {
      if (options.validate) {
        return Promise.bind(this).then(function() {
          if (options.hooks)
            return this.hookValidate(options);
          return this.validate(options).then(function(err) {
            if (err)
              throw err;
          });
        });
      }
    }).then(function() {
      return Promise.bind(this).then(function() {
        if (options.hooks) {
          var beforeHookValues = _.pick(this.dataValues, options.fields),
              afterHookValues,
              hookChanged,
              ignoreChanged = _.difference(this.changed(), options.fields);
          if (updatedAtAttr && options.fields.indexOf(updatedAtAttr) !== -1) {
            ignoreChanged = _.without(ignoreChanged, updatedAtAttr);
          }
          return this.Model.runHooks('before' + hook, this, options).bind(this).then(function() {
            if (options.defaultFields && !this.isNewRecord) {
              afterHookValues = _.pick(this.dataValues, _.difference(this.changed(), ignoreChanged));
              hookChanged = [];
              Object.keys(afterHookValues).forEach(function(key) {
                if (afterHookValues[key] !== beforeHookValues[key]) {
                  hookChanged.push(key);
                }
              });
              options.fields = _.uniq(options.fields.concat(hookChanged));
            }
            if (hookChanged) {
              if (options.validate) {
                options.skip = _.difference(Object.keys(this.Model.rawAttributes), hookChanged);
                return Promise.bind(this).then(function() {
                  if (options.hooks)
                    return this.hookValidate(options);
                  return this.validate(options).then(function(err) {
                    if (err)
                      throw err;
                  });
                }).then(function() {
                  delete options.skip;
                });
              }
            }
          });
        }
      }).then(function() {
        if (!options.fields.length)
          return this;
        if (!this.isNewRecord)
          return this;
        if (!this.$options.include || !this.$options.include.length)
          return this;
        return Promise.map(this.$options.include.filter(function(include) {
          return include.association instanceof BelongsTo;
        }), function(include) {
          var instance = self.get(include.as);
          if (!instance)
            return Promise.resolve();
          var includeOptions = _(Utils.cloneDeep(include)).omit(['association']).defaults({
            transaction: options.transaction,
            logging: options.logging,
            parentRecord: self
          }).value();
          return instance.save(includeOptions).then(function() {
            return self[include.association.accessors.set](instance, {
              save: false,
              logging: options.logging
            });
          });
        });
      }).then(function() {
        if (!options.fields.length)
          return this;
        if (!this.changed() && !this.isNewRecord)
          return this;
        var values = Utils.mapValueFieldNames(this.dataValues, options.fields, this.Model),
            query = null,
            args = [];
        if (self.isNewRecord) {
          query = 'insert';
          args = [self, self.$Model.getTableName(options), values, options];
        } else {
          var where = this.where();
          where = Utils.mapValueFieldNames(where, Object.keys(where), this.Model);
          query = 'update';
          args = [self, self.$Model.getTableName(options), values, where, options];
        }
        return self.sequelize.getQueryInterface()[query].apply(self.sequelize.getQueryInterface(), args).then(function(result) {
          Object.keys(self.Model.rawAttributes).forEach(function(attr) {
            if (self.Model.rawAttributes[attr].field && values[self.Model.rawAttributes[attr].field] !== undefined && self.Model.rawAttributes[attr].field !== attr) {
              values[attr] = values[self.Model.rawAttributes[attr].field];
              delete values[self.Model.rawAttributes[attr].field];
            }
          });
          values = _.extend(values, result.dataValues);
          result.dataValues = _.extend(result.dataValues, values);
          return result;
        }).tap(function(result) {
          if (options.hooks) {
            return self.Model.runHooks('after' + hook, result, options);
          }
        }).then(function(result) {
          options.fields.forEach(function(field) {
            result._previousDataValues[field] = result.dataValues[field];
            self.changed(field, false);
          });
          self.isNewRecord = false;
          return result;
        }).tap(function() {
          if (!wasNewRecord)
            return self;
          if (!self.$options.include || !self.$options.include.length)
            return self;
          return Promise.map(self.$options.include.filter(function(include) {
            return !(include.association instanceof BelongsTo);
          }), function(include) {
            var instances = self.get(include.as);
            if (!instances)
              return Promise.resolve();
            if (!Array.isArray(instances))
              instances = [instances];
            if (!instances.length)
              return Promise.resolve();
            var includeOptions = _(Utils.cloneDeep(include)).omit(['association']).defaults({
              transaction: options.transaction,
              logging: options.logging,
              parentRecord: self
            }).value();
            return Promise.map(instances, function(instance) {
              if (include.association instanceof BelongsToMany) {
                return instance.save(includeOptions).then(function() {
                  var values = {};
                  values[include.association.foreignKey] = self.get(self.Model.primaryKeyAttribute, {raw: true});
                  values[include.association.otherKey] = instance.get(instance.Model.primaryKeyAttribute, {raw: true});
                  return include.association.throughModel.create(values, includeOptions);
                });
              } else {
                instance.set(include.association.foreignKey, self.get(self.Model.primaryKeyAttribute, {raw: true}));
                return instance.save(includeOptions);
              }
            });
          });
        });
      });
    });
  };
  Instance.prototype.reload = function(options) {
    options = _.defaults({}, options, {
      where: this.where(),
      include: this.$options.include || null
    });
    return this.Model.findOne(options).bind(this).tap(function(reload) {
      if (!reload) {
        throw new sequelizeErrors.InstanceError('Instance could not be reloaded because it does not exist anymore (find call returned null)');
      }
    }).then(function(reload) {
      this.$options = reload.$options;
      this.set(reload.dataValues, {
        raw: true,
        reset: true && !options.attributes
      });
    }).return(this);
  };
  Instance.prototype.validate = function(options) {
    return new InstanceValidator(this, options).validate();
  };
  Instance.prototype.hookValidate = function(options) {
    return new InstanceValidator(this, options).hookValidate();
  };
  Instance.prototype.update = function(values, options) {
    var changedBefore = this.changed() || [],
        sideEffects,
        fields,
        setOptions;
    options = options || {};
    if (Array.isArray(options))
      options = {fields: options};
    options = Utils.cloneDeep(options);
    setOptions = Utils.cloneDeep(options);
    setOptions.attributes = options.fields;
    this.set(values, setOptions);
    sideEffects = _.without.apply(this, [this.changed() || []].concat(changedBefore));
    fields = _.union(Object.keys(values), sideEffects);
    if (!options.fields) {
      options.fields = _.intersection(fields, this.changed());
      options.defaultFields = options.fields;
    }
    return this.save(options);
  };
  Instance.prototype.updateAttributes = Instance.prototype.update;
  Instance.prototype.destroy = function(options) {
    options = Utils._.extend({
      hooks: true,
      force: false
    }, options);
    return Promise.bind(this).then(function() {
      if (options.hooks) {
        return this.Model.runHooks('beforeDestroy', this, options);
      }
    }).then(function() {
      var where = this.where();
      if (this.Model._timestampAttributes.deletedAt && options.force === false) {
        var attribute = this.Model.rawAttributes[this.Model._timestampAttributes.deletedAt],
            field = attribute.field || this.Model._timestampAttributes.deletedAt,
            values = {};
        values[field] = new Date();
        where[field] = attribute.hasOwnProperty('defaultValue') ? attribute.defaultValue : null;
        this.setDataValue(field, values[field]);
        return this.sequelize.getQueryInterface().update(this, this.$Model.getTableName(options), values, where, _.defaults({hooks: false}, options));
      } else {
        return this.sequelize.getQueryInterface().delete(this, this.$Model.getTableName(options), where, _.assign({
          type: QueryTypes.DELETE,
          limit: null
        }, options));
      }
    }).tap(function() {
      if (options.hooks) {
        return this.Model.runHooks('afterDestroy', this, options);
      }
    }).then(function(result) {
      return result;
    });
  };
  Instance.prototype.restore = function(options) {
    if (!this.Model._timestampAttributes.deletedAt)
      throw new Error('Model is not paranoid');
    options = Utils._.extend({
      hooks: true,
      force: false
    }, options);
    return Promise.bind(this).then(function() {
      if (options.hooks) {
        return this.Model.runHooks('beforeRestore', this, options);
      }
    }).then(function() {
      var deletedAtCol = this.Model._timestampAttributes.deletedAt,
          deletedAtAttribute = this.Model.rawAttributes[deletedAtCol],
          deletedAtDefaultValue = deletedAtAttribute.hasOwnProperty('defaultValue') ? deletedAtAttribute.defaultValue : null;
      this.setDataValue(deletedAtCol, deletedAtDefaultValue);
      return this.save(_.extend({}, options, {
        hooks: false,
        omitNull: false
      }));
    }).tap(function() {
      if (options.hooks) {
        return this.Model.runHooks('afterRestore', this, options);
      }
    });
  };
  Instance.prototype.increment = function(fields, options) {
    var identifier = this.where(),
        updatedAtAttr = this.Model._timestampAttributes.updatedAt,
        values = {},
        where;
    options = _.defaults({}, options, {
      by: 1,
      attributes: {},
      where: {}
    });
    where = _.extend({}, options.where, identifier);
    if (Utils._.isString(fields)) {
      values[fields] = options.by;
    } else if (Utils._.isArray(fields)) {
      Utils._.each(fields, function(field) {
        values[field] = options.by;
      });
    } else {
      values = fields;
    }
    if (!options.silent && updatedAtAttr && !values[updatedAtAttr]) {
      options.attributes[updatedAtAttr] = this.Model.$getDefaultTimestamp(updatedAtAttr) || Utils.now(this.sequelize.options.dialect);
    }
    Object.keys(values).forEach(function(attr) {
      if (this.Model.rawAttributes[attr] && this.Model.rawAttributes[attr].field && this.Model.rawAttributes[attr].field !== attr) {
        values[this.Model.rawAttributes[attr].field] = values[attr];
        delete values[attr];
      }
    }, this);
    return this.sequelize.getQueryInterface().increment(this, this.$Model.getTableName(options), values, where, options).return(this);
  };
  Instance.prototype.decrement = function(fields, options) {
    options = _.defaults({}, options, {by: 1});
    if (!Utils._.isString(fields) && !Utils._.isArray(fields)) {
      Utils._.each(fields, function(value, field) {
        fields[field] = -value;
      });
    }
    options.by = 0 - options.by;
    return this.increment(fields, options);
  };
  Instance.prototype.equals = function(other) {
    var result = true;
    if (!other || !other.dataValues) {
      return false;
    }
    Utils._.each(this.dataValues, function(value, key) {
      if (Utils._.isDate(value) && Utils._.isDate(other.dataValues[key])) {
        result = result && (value.getTime() === other.dataValues[key].getTime());
      } else {
        result = result && (value === other.dataValues[key]);
      }
    });
    return result;
  };
  Instance.prototype.equalsOneOf = function(others) {
    var self = this;
    return _.some(others, function(other) {
      return self.equals(other);
    });
  };
  Instance.prototype.setValidators = function(attribute, validators) {
    this.validators[attribute] = validators;
  };
  Instance.prototype.toJSON = function() {
    return this.get({plain: true});
  };
  module.exports = Instance;
})(require('buffer').Buffer);
