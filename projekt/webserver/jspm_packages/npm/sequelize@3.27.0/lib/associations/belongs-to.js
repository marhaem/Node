/* */ 
'use strict';
var Utils = require('../utils'),
    Helpers = require('./helpers'),
    _ = require('lodash'),
    Transaction = require('../transaction'),
    Association = require('./base'),
    util = require('util');
var BelongsTo = function(source, target, options) {
  Association.call(this);
  this.associationType = 'BelongsTo';
  this.source = source;
  this.target = target;
  this.options = options;
  this.scope = options.scope;
  this.isSingleAssociation = true;
  this.isSelfAssociation = (this.source === this.target);
  this.as = this.options.as;
  this.foreignKeyAttribute = {};
  if (this.as) {
    this.isAliased = true;
    this.options.name = {singular: this.as};
  } else {
    this.as = this.target.options.name.singular;
    this.options.name = this.target.options.name;
  }
  if (_.isObject(this.options.foreignKey)) {
    this.foreignKeyAttribute = this.options.foreignKey;
    this.foreignKey = this.foreignKeyAttribute.name || this.foreignKeyAttribute.fieldName;
  } else if (this.options.foreignKey) {
    this.foreignKey = this.options.foreignKey;
  }
  if (!this.foreignKey) {
    this.foreignKey = Utils.camelizeIf([Utils.underscoredIf(this.as, this.source.options.underscored), this.target.primaryKeyAttribute].join('_'), !this.source.options.underscored);
  }
  this.identifier = this.foreignKey;
  if (this.source.rawAttributes[this.identifier]) {
    this.identifierField = this.source.rawAttributes[this.identifier].field || this.identifier;
  }
  this.targetKey = this.options.targetKey || this.target.primaryKeyAttribute;
  this.targetKeyField = this.target.rawAttributes[this.targetKey].field || this.targetKey;
  this.targetKeyIsPrimary = this.targetKey === this.target.primaryKeyAttribute;
  this.targetIdentifier = this.targetKey;
  this.associationAccessor = this.as;
  this.options.useHooks = options.useHooks;
  var singular = Utils.uppercaseFirst(this.options.name.singular);
  this.accessors = {
    get: 'get' + singular,
    set: 'set' + singular,
    create: 'create' + singular
  };
};
util.inherits(BelongsTo, Association);
BelongsTo.prototype.injectAttributes = function() {
  var newAttributes = {};
  newAttributes[this.foreignKey] = _.defaults({}, this.foreignKeyAttribute, {
    type: this.options.keyType || this.target.rawAttributes[this.targetKey].type,
    allowNull: true
  });
  if (this.options.constraints !== false) {
    var source = this.source.rawAttributes[this.foreignKey] || newAttributes[this.foreignKey];
    this.options.onDelete = this.options.onDelete || (source.allowNull ? 'SET NULL' : 'NO ACTION');
    this.options.onUpdate = this.options.onUpdate || 'CASCADE';
  }
  Helpers.addForeignKeyConstraints(newAttributes[this.foreignKey], this.target, this.source, this.options, this.targetKeyField);
  Utils.mergeDefaults(this.source.rawAttributes, newAttributes);
  this.identifierField = this.source.rawAttributes[this.foreignKey].field || this.foreignKey;
  this.source.refreshAttributes();
  Helpers.checkNamingCollision(this);
  return this;
};
BelongsTo.prototype.mixin = function(obj) {
  var association = this;
  obj[this.accessors.get] = function(options) {
    return association.get(this, options);
  };
  association.injectSetter(obj);
  association.injectCreator(obj);
};
BelongsTo.prototype.get = function(instances, options) {
  var association = this,
      Target = association.target,
      instance,
      where = {};
  options = Utils.cloneDeep(options);
  if (options.hasOwnProperty('scope')) {
    if (!options.scope) {
      Target = Target.unscoped();
    } else {
      Target = Target.scope(options.scope);
    }
  }
  if (options.hasOwnProperty('schema')) {
    Target = Target.schema(options.schema, options.schemaDelimiter);
  }
  if (!Array.isArray(instances)) {
    instance = instances;
    instances = undefined;
  }
  if (instances) {
    where[association.targetKey] = {$in: instances.map(function(instance) {
        return instance.get(association.foreignKey);
      })};
  } else {
    if (association.targetKeyIsPrimary && !options.where) {
      return Target.findById(instance.get(association.foreignKey), options);
    } else {
      where[association.targetKey] = instance.get(association.foreignKey);
      options.limit = null;
    }
  }
  options.where = options.where ? {$and: [where, options.where]} : where;
  if (instances) {
    return Target.findAll(options).then(function(results) {
      var result = {};
      instances.forEach(function(instance) {
        result[instance.get(association.foreignKey, {raw: true})] = null;
      });
      results.forEach(function(instance) {
        result[instance.get(association.targetKey, {raw: true})] = instance;
      });
      return result;
    });
  }
  return Target.findOne(options);
};
BelongsTo.prototype.injectSetter = function(instancePrototype) {
  var association = this;
  instancePrototype[this.accessors.set] = function(associatedInstance, options) {
    options = options || {};
    var value = associatedInstance;
    if (associatedInstance instanceof association.target.Instance) {
      value = associatedInstance[association.targetKey];
    }
    this.set(association.foreignKey, value);
    if (options.save === false)
      return;
    options = _.extend({
      fields: [association.foreignKey],
      allowNull: [association.foreignKey],
      association: true
    }, options);
    return this.save(options);
  };
  return this;
};
BelongsTo.prototype.injectCreator = function(instancePrototype) {
  var association = this;
  instancePrototype[this.accessors.create] = function(values, fieldsOrOptions) {
    var instance = this,
        options = {};
    if ((fieldsOrOptions || {}).transaction instanceof Transaction) {
      options.transaction = fieldsOrOptions.transaction;
    }
    options.logging = (fieldsOrOptions || {}).logging;
    return association.target.create(values, fieldsOrOptions).then(function(newAssociatedObject) {
      return instance[association.accessors.set](newAssociatedObject, options);
    });
  };
  return this;
};
module.exports = BelongsTo;
