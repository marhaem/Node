/* */ 
'use strict';
var Utils = require('../utils'),
    _ = require('lodash'),
    HasOne = require('./has-one'),
    HasMany = require('./has-many'),
    BelongsToMany = require('./belongs-to-many'),
    BelongsTo = require('./belongs-to');
var Mixin = module.exports = function() {};
var singleLinked = function(Type) {
  return function(target, options) {
    if (!(target instanceof this.sequelize.Model)) {
      throw new Error(this.name + '.' + Utils.lowercaseFirst(Type.toString()) + ' called with something that\'s not an instance of Sequelize.Model');
    }
    var source = this;
    options = options || {};
    options.hooks = options.hooks === undefined ? false : Boolean(options.hooks);
    options.useHooks = options.hooks;
    var association = new Type(source, target, _.extend(options, source.options));
    source.associations[association.associationAccessor] = association.injectAttributes();
    if (association.mixin) {
      association.mixin(source.Instance.prototype);
    } else {
      association.injectGetter(source.Instance.prototype);
      association.injectSetter(source.Instance.prototype);
      association.injectCreator(source.Instance.prototype);
    }
    return association;
  };
};
Mixin.hasOne = singleLinked(HasOne);
Mixin.belongsTo = singleLinked(BelongsTo);
Mixin.hasMany = function(target, options) {
  if (!(target instanceof this.sequelize.Model)) {
    throw new Error(this.name + '.hasMany called with something that\'s not an instance of Sequelize.Model');
  }
  var source = this;
  options = options || {};
  options.hooks = options.hooks === undefined ? false : Boolean(options.hooks);
  options.useHooks = options.hooks;
  options = _.extend(options, _.omit(source.options, ['hooks']));
  var association = new HasMany(source, target, options);
  source.associations[association.associationAccessor] = association;
  association.injectAttributes();
  association.mixin(source.Instance.prototype);
  return association;
};
Mixin.belongsToMany = function(targetModel, options) {
  if (!(targetModel instanceof this.sequelize.Model)) {
    throw new Error(this.name + '.belongsToMany called with something that\'s not an instance of Sequelize.Model');
  }
  var sourceModel = this;
  options = options || {};
  options.hooks = options.hooks === undefined ? false : Boolean(options.hooks);
  options.useHooks = options.hooks;
  options.timestamps = options.timestamps === undefined ? this.sequelize.options.timestamps : options.timestamps;
  options = _.extend(options, _.omit(sourceModel.options, ['hooks', 'timestamps', 'scopes', 'defaultScope']));
  var association = new BelongsToMany(sourceModel, targetModel, options);
  sourceModel.associations[association.associationAccessor] = association.injectAttributes();
  association.injectGetter(sourceModel.Instance.prototype);
  association.injectSetter(sourceModel.Instance.prototype);
  association.injectCreator(sourceModel.Instance.prototype);
  return association;
};
Mixin.getAssociation = function(target, alias) {
  for (var associationName in this.associations) {
    if (this.associations.hasOwnProperty(associationName)) {
      var association = this.associations[associationName];
      if (association.target.name === target.name && (alias === undefined ? !association.isAliased : association.as === alias)) {
        return association;
      }
    }
  }
  return null;
};
