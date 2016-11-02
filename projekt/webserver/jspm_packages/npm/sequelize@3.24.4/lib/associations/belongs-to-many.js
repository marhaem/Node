/* */ 
'use strict';
var Utils = require('../utils'),
    Helpers = require('./helpers'),
    _ = require('lodash'),
    Association = require('./base'),
    BelongsTo = require('./belongs-to'),
    HasMany = require('./has-many'),
    HasOne = require('./has-one'),
    CounterCache = require('../plugins/counter-cache'),
    util = require('util');
var BelongsToMany = function(source, target, options) {
  Association.call(this);
  options = options || {};
  if (options.through === undefined || options.through === true || options.through === null) {
    throw new Error('belongsToMany must be given a through option, either a string or a model');
  }
  if (!options.through.model) {
    options.through = {model: options.through};
  }
  this.associationType = 'BelongsToMany';
  this.source = source;
  this.target = target;
  this.targetAssociation = null;
  this.options = options;
  this.sequelize = source.modelManager.sequelize;
  this.through = _.assign({}, options.through);
  this.scope = options.scope;
  this.isMultiAssociation = true;
  this.isSelfAssociation = this.source === this.target;
  this.doubleLinked = false;
  this.as = this.options.as;
  if (!this.as && this.isSelfAssociation) {
    throw new Error('\'as\' must be defined for many-to-many self-associations');
  }
  if (this.as) {
    this.isAliased = true;
    if (Utils._.isPlainObject(this.as)) {
      this.options.name = this.as;
      this.as = this.as.plural;
    } else {
      this.options.name = {
        plural: this.as,
        singular: Utils.singularize(this.as)
      };
    }
  } else {
    this.as = this.target.options.name.plural;
    this.options.name = this.target.options.name;
  }
  this.combinedTableName = Utils.combineTableNames(this.source.tableName, this.isSelfAssociation ? (this.as || this.target.tableName) : this.target.tableName);
  if (this.isSelfAssociation) {
    this.targetAssociation = this;
  }
  if (_.isObject(this.options.foreignKey)) {
    this.foreignKeyAttribute = this.options.foreignKey;
    this.foreignKey = this.foreignKeyAttribute.name || this.foreignKeyAttribute.fieldName;
  } else {
    if (!this.options.foreignKey) {
      this.foreignKeyDefault = true;
    }
    this.foreignKeyAttribute = {};
    this.foreignKey = this.options.foreignKey || Utils.camelizeIf([Utils.underscoredIf(this.source.options.name.singular, this.source.options.underscored), this.source.primaryKeyAttribute].join('_'), !this.source.options.underscored);
  }
  if (_.isObject(this.options.otherKey)) {
    this.otherKeyAttribute = this.options.otherKey;
    this.otherKey = this.otherKeyAttribute.name || this.otherKeyAttribute.fieldName;
  } else {
    if (!this.options.otherKey) {
      this.otherKeyDefault = true;
    }
    this.otherKeyAttribute = {};
    this.otherKey = this.options.otherKey || Utils.camelizeIf([Utils.underscoredIf(this.isSelfAssociation ? Utils.singularize(this.as) : this.target.options.name.singular, this.target.options.underscored), this.target.primaryKeyAttribute].join('_'), !this.target.options.underscored);
  }
  _.each(this.target.associations, function(association) {
    if (association.associationType !== 'BelongsToMany')
      return;
    if (association.target !== this.source)
      return;
    if (this.options.through.model === association.options.through.model) {
      this.paired = association;
      association.paired = this;
    }
  }.bind(this));
  if (typeof this.through.model === 'string') {
    if (!this.sequelize.isDefined(this.through.model)) {
      this.through.model = this.sequelize.define(this.through.model, {}, _.extend(this.options, {
        tableName: this.through.model,
        indexes: [],
        paranoid: false,
        validate: {}
      }));
    } else {
      this.through.model = this.sequelize.model(this.through.model);
    }
  }
  if (this.paired) {
    if (this.otherKeyDefault) {
      this.otherKey = this.paired.foreignKey;
    }
    if (this.paired.otherKeyDefault) {
      if (this.paired.otherKey !== this.foreignKey) {
        delete this.through.model.rawAttributes[this.paired.otherKey];
      }
      this.paired.otherKey = this.foreignKey;
      this.paired.foreignIdentifier = this.foreignKey;
      delete this.paired.foreignIdentifierField;
    }
  }
  if (this.through) {
    this.throughModel = this.through.model;
  }
  this.options.tableName = this.combinedName = (this.through.model === Object(this.through.model) ? this.through.model.tableName : this.through.model);
  this.associationAccessor = this.as;
  var plural = Utils.uppercaseFirst(this.options.name.plural),
      singular = Utils.uppercaseFirst(this.options.name.singular);
  this.accessors = {
    get: 'get' + plural,
    set: 'set' + plural,
    addMultiple: 'add' + plural,
    add: 'add' + singular,
    create: 'create' + singular,
    remove: 'remove' + singular,
    removeMultiple: 'remove' + plural,
    hasSingle: 'has' + singular,
    hasAll: 'has' + plural,
    count: 'count' + plural
  };
  if (this.options.counterCache) {
    new CounterCache(this, this.options.counterCache !== true ? this.options.counterCache : {});
  }
};
util.inherits(BelongsToMany, Association);
BelongsToMany.prototype.injectAttributes = function() {
  var self = this;
  this.identifier = this.foreignKey;
  this.foreignIdentifier = this.otherKey;
  _.each(this.through.model.rawAttributes, function(attribute, attributeName) {
    if (attribute.primaryKey === true && attribute._autoGenerated === true) {
      if (attributeName === self.foreignKey || attributeName === self.otherKey) {
        attribute.primaryKey = false;
      } else {
        delete self.through.model.rawAttributes[attributeName];
      }
      self.primaryKeyDeleted = true;
    }
  });
  var sourceKey = this.source.rawAttributes[this.source.primaryKeyAttribute],
      sourceKeyType = sourceKey.type,
      sourceKeyField = sourceKey.field || this.source.primaryKeyAttribute,
      targetKey = this.target.rawAttributes[this.target.primaryKeyAttribute],
      targetKeyType = targetKey.type,
      targetKeyField = targetKey.field || this.target.primaryKeyAttribute,
      sourceAttribute = _.defaults({}, this.foreignKeyAttribute, {type: sourceKeyType}),
      targetAttribute = _.defaults({}, this.otherKeyAttribute, {type: targetKeyType});
  if (this.primaryKeyDeleted === true) {
    targetAttribute.primaryKey = sourceAttribute.primaryKey = true;
  } else if (this.through.unique !== false) {
    var uniqueKey = [this.through.model.tableName, this.foreignKey, this.otherKey, 'unique'].join('_');
    targetAttribute.unique = sourceAttribute.unique = uniqueKey;
  }
  if (!this.through.model.rawAttributes[this.foreignKey]) {
    this.through.model.rawAttributes[this.foreignKey] = {_autoGenerated: true};
  }
  if (!this.through.model.rawAttributes[this.otherKey]) {
    this.through.model.rawAttributes[this.otherKey] = {_autoGenerated: true};
  }
  if (this.options.constraints !== false) {
    sourceAttribute.references = {
      model: this.source.getTableName(),
      key: sourceKeyField
    };
    sourceAttribute.onDelete = this.options.onDelete || this.through.model.rawAttributes[this.foreignKey].onDelete;
    sourceAttribute.onUpdate = this.options.onUpdate || this.through.model.rawAttributes[this.foreignKey].onUpdate;
    if (!sourceAttribute.onDelete)
      sourceAttribute.onDelete = 'CASCADE';
    if (!sourceAttribute.onUpdate)
      sourceAttribute.onUpdate = 'CASCADE';
    targetAttribute.references = {
      model: this.target.getTableName(),
      key: targetKeyField
    };
    targetAttribute.onDelete = this.through.model.rawAttributes[this.otherKey].onDelete || this.options.onDelete;
    targetAttribute.onUpdate = this.through.model.rawAttributes[this.otherKey].onUpdate || this.options.onUpdate;
    if (!targetAttribute.onDelete)
      targetAttribute.onDelete = 'CASCADE';
    if (!targetAttribute.onUpdate)
      targetAttribute.onUpdate = 'CASCADE';
  }
  this.through.model.rawAttributes[this.foreignKey] = _.extend(this.through.model.rawAttributes[this.foreignKey], sourceAttribute);
  this.through.model.rawAttributes[this.otherKey] = _.extend(this.through.model.rawAttributes[this.otherKey], targetAttribute);
  this.identifierField = this.through.model.rawAttributes[this.foreignKey].field || this.foreignKey;
  this.foreignIdentifierField = this.through.model.rawAttributes[this.otherKey].field || this.otherKey;
  if (this.paired && !this.paired.foreignIdentifierField) {
    this.paired.foreignIdentifierField = this.through.model.rawAttributes[this.paired.otherKey].field || this.paired.otherKey;
  }
  this.through.model.refreshAttributes();
  this.toSource = new BelongsTo(this.through.model, this.source, {foreignKey: this.foreignKey});
  this.manyFromSource = new HasMany(this.source, this.through.model, {foreignKey: this.foreignKey});
  this.oneFromSource = new HasOne(this.source, this.through.model, {
    foreignKey: this.foreignKey,
    as: this.through.model.name
  });
  this.toTarget = new BelongsTo(this.through.model, this.target, {foreignKey: this.otherKey});
  this.manyFromTarget = new HasMany(this.target, this.through.model, {foreignKey: this.otherKey});
  this.oneFromTarget = new HasOne(this.target, this.through.model, {
    foreignKey: this.otherKey,
    as: this.through.model.name
  });
  if (this.paired && this.paired.otherKeyDefault) {
    this.paired.toTarget = new BelongsTo(this.paired.through.model, this.paired.target, {foreignKey: this.paired.otherKey});
    this.paired.oneFromTarget = new HasOne(this.paired.target, this.paired.through.model, {
      foreignKey: this.paired.otherKey,
      as: this.paired.through.model.name
    });
  }
  Helpers.checkNamingCollision(this);
  return this;
};
BelongsToMany.prototype.get = function(instance, options) {
  options = Utils.cloneDeep(options) || {};
  var association = this,
      through = association.through,
      scopeWhere,
      throughWhere;
  if (association.scope) {
    scopeWhere = _.clone(association.scope);
  }
  options.where = {$and: [scopeWhere, options.where]};
  if (Object(through.model) === through.model) {
    throughWhere = {};
    throughWhere[association.foreignKey] = instance.get(association.source.primaryKeyAttribute);
    if (through.scope) {
      _.assign(throughWhere, through.scope);
    }
    if (options.through && options.through.where) {
      throughWhere = {$and: [throughWhere, options.through.where]};
    }
    options.include = options.include || [];
    options.include.push({
      association: association.oneFromTarget,
      attributes: options.joinTableAttributes,
      required: true,
      where: throughWhere
    });
  }
  var model = association.target;
  if (options.hasOwnProperty('scope')) {
    if (!options.scope) {
      model = model.unscoped();
    } else {
      model = model.scope(options.scope);
    }
  }
  if (options.hasOwnProperty('schema')) {
    model = model.schema(options.schema, options.schemaDelimiter);
  }
  return model.findAll(options);
};
BelongsToMany.prototype.injectGetter = function(obj) {
  var association = this;
  obj[this.accessors.get] = function(options) {
    return association.get(this, options);
  };
  obj[this.accessors.count] = function(options) {
    var model = association.target,
        sequelize = model.sequelize;
    options = Utils.cloneDeep(options);
    options.attributes = [[sequelize.fn('COUNT', sequelize.col([association.target.name, model.primaryKeyAttribute].join('.'))), 'count']];
    options.joinTableAttributes = [];
    options.raw = true;
    options.plain = true;
    return obj[association.accessors.get].call(this, options).then(function(result) {
      return parseInt(result.count, 10);
    });
  };
  obj[this.accessors.hasSingle] = obj[this.accessors.hasAll] = function(instances, options) {
    var where = {};
    if (!Array.isArray(instances)) {
      instances = [instances];
    }
    options = _.assign({raw: true}, options, {scope: false});
    where.$or = instances.map(function(instance) {
      if (instance instanceof association.target.Instance) {
        return instance.where();
      } else {
        var $where = {};
        $where[association.target.primaryKeyAttribute] = instance;
        return $where;
      }
    });
    options.where = {$and: [where, options.where]};
    return this[association.accessors.get](options).then(function(associatedObjects) {
      return associatedObjects.length === instances.length;
    });
  };
  return this;
};
BelongsToMany.prototype.injectSetter = function(obj) {
  var association = this;
  obj[this.accessors.set] = function(newAssociatedObjects, options) {
    options = options || {};
    var instance = this,
        sourceKey = association.source.primaryKeyAttribute,
        targetKey = association.target.primaryKeyAttribute,
        identifier = association.identifier,
        foreignIdentifier = association.foreignIdentifier,
        where = {};
    if (newAssociatedObjects === null) {
      newAssociatedObjects = [];
    } else {
      newAssociatedObjects = association.toInstanceArray(newAssociatedObjects);
    }
    where[identifier] = this.get(sourceKey);
    return association.through.model.findAll(_.defaults({
      where: where,
      raw: true
    }, options)).then(function(currentRows) {
      var obsoleteAssociations = [],
          defaultAttributes = options,
          promises = [],
          unassociatedObjects;
      defaultAttributes = _.omit(defaultAttributes, ['transaction', 'hooks', 'individualHooks', 'ignoreDuplicates', 'validate', 'fields', 'logging']);
      unassociatedObjects = newAssociatedObjects.filter(function(obj) {
        return !_.find(currentRows, function(currentRow) {
          return currentRow[foreignIdentifier] === obj.get(targetKey);
        });
      });
      currentRows.forEach(function(currentRow) {
        var newObj = _.find(newAssociatedObjects, function(obj) {
          return currentRow[foreignIdentifier] === obj.get(targetKey);
        });
        if (!newObj) {
          obsoleteAssociations.push(currentRow);
        } else {
          var throughAttributes = newObj[association.through.model.name];
          if (throughAttributes instanceof association.through.model.Instance) {
            throughAttributes = {};
          }
          var where = {},
              attributes = _.defaults({}, throughAttributes, defaultAttributes);
          where[identifier] = instance.get(sourceKey);
          where[foreignIdentifier] = newObj.get(targetKey);
          if (Object.keys(attributes).length) {
            promises.push(association.through.model.update(attributes, _.extend(options, {where: where})));
          }
        }
      });
      if (obsoleteAssociations.length > 0) {
        var where = {};
        where[identifier] = instance.get(sourceKey);
        where[foreignIdentifier] = obsoleteAssociations.map(function(obsoleteAssociation) {
          return obsoleteAssociation[foreignIdentifier];
        });
        promises.push(association.through.model.destroy(_.defaults({where: where}, options)));
      }
      if (unassociatedObjects.length > 0) {
        var bulk = unassociatedObjects.map(function(unassociatedObject) {
          var attributes = {};
          attributes[identifier] = instance.get(sourceKey);
          attributes[foreignIdentifier] = unassociatedObject.get(targetKey);
          attributes = _.defaults(attributes, unassociatedObject[association.through.model.name], defaultAttributes);
          _.assign(attributes, association.through.scope);
          return attributes;
        }.bind(this));
        promises.push(association.through.model.bulkCreate(bulk, _.assign({validate: true}, options)));
      }
      return Utils.Promise.all(promises);
    });
  };
  obj[this.accessors.addMultiple] = obj[this.accessors.add] = function(newInstances, additionalAttributes) {
    if (!newInstances)
      return Utils.Promise.resolve();
    additionalAttributes = _.clone(additionalAttributes) || {};
    var instance = this,
        defaultAttributes = _.omit(additionalAttributes, ['transaction', 'hooks', 'individualHooks', 'ignoreDuplicates', 'validate', 'fields', 'logging']),
        sourceKey = association.source.primaryKeyAttribute,
        targetKey = association.target.primaryKeyAttribute,
        identifier = association.identifier,
        foreignIdentifier = association.foreignIdentifier,
        options = additionalAttributes;
    newInstances = association.toInstanceArray(newInstances);
    var where = {};
    where[identifier] = instance.get(sourceKey);
    where[foreignIdentifier] = newInstances.map(function(newInstance) {
      return newInstance.get(targetKey);
    });
    _.assign(where, association.through.scope);
    return association.through.model.findAll(_.defaults({
      where: where,
      raw: true
    }, options)).then(function(currentRows) {
      var promises = [];
      var unassociatedObjects = [],
          changedAssociations = [];
      newInstances.forEach(function(obj) {
        var existingAssociation = _.find(currentRows, function(current) {
          return current[foreignIdentifier] === obj.get(targetKey);
        });
        if (!existingAssociation) {
          unassociatedObjects.push(obj);
        } else {
          var throughAttributes = obj[association.through.model.name],
              attributes = _.defaults({}, throughAttributes, defaultAttributes);
          if (_.some(Object.keys(attributes), function(attribute) {
            return attributes[attribute] !== existingAssociation[attribute];
          })) {
            changedAssociations.push(obj);
          }
        }
      });
      if (unassociatedObjects.length > 0) {
        var bulk = unassociatedObjects.map(function(unassociatedObject) {
          var throughAttributes = unassociatedObject[association.through.model.name],
              attributes = _.defaults({}, throughAttributes, defaultAttributes);
          attributes[identifier] = instance.get(sourceKey);
          attributes[foreignIdentifier] = unassociatedObject.get(targetKey);
          _.assign(attributes, association.through.scope);
          return attributes;
        }.bind(this));
        promises.push(association.through.model.bulkCreate(bulk, _.assign({validate: true}, options)));
      }
      changedAssociations.forEach(function(assoc) {
        var throughAttributes = assoc[association.through.model.name],
            attributes = _.defaults({}, throughAttributes, defaultAttributes),
            where = {};
        if (throughAttributes instanceof association.through.model.Instance) {
          throughAttributes = {};
        }
        where[identifier] = instance.get(sourceKey);
        where[foreignIdentifier] = assoc.get(targetKey);
        promises.push(association.through.model.update(attributes, _.extend(options, {where: where})));
      });
      return Utils.Promise.all(promises);
    });
  };
  obj[this.accessors.removeMultiple] = obj[this.accessors.remove] = function(oldAssociatedObjects, options) {
    options = options || {};
    oldAssociatedObjects = association.toInstanceArray(oldAssociatedObjects);
    var where = {};
    where[association.identifier] = this.get(association.source.primaryKeyAttribute);
    where[association.foreignIdentifier] = oldAssociatedObjects.map(function(newInstance) {
      return newInstance.get(association.target.primaryKeyAttribute);
    });
    return association.through.model.destroy(_.defaults({where: where}, options));
  };
  return this;
};
BelongsToMany.prototype.injectCreator = function(obj) {
  var association = this;
  obj[this.accessors.create] = function(values, options) {
    var instance = this;
    options = options || {};
    values = values || {};
    if (Array.isArray(options)) {
      options = {fields: options};
    }
    if (association.scope) {
      _.assign(values, association.scope);
      if (options.fields) {
        options.fields = options.fields.concat(Object.keys(association.scope));
      }
    }
    return association.target.create(values, options).then(function(newAssociatedObject) {
      return instance[association.accessors.add](newAssociatedObject, _.omit(options, ['fields'])).return(newAssociatedObject);
    });
  };
  return this;
};
module.exports = BelongsToMany;
