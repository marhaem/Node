/* */ 
'use strict';
var Utils = require('./utils'),
    Promise = require('./promise');
var hookTypes = {
  beforeValidate: {params: 2},
  afterValidate: {params: 2},
  validationFailed: {params: 3},
  beforeCreate: {params: 2},
  afterCreate: {params: 2},
  beforeDestroy: {params: 2},
  afterDestroy: {params: 2},
  beforeRestore: {params: 2},
  afterRestore: {params: 2},
  beforeUpdate: {params: 2},
  afterUpdate: {params: 2},
  beforeBulkCreate: {params: 2},
  afterBulkCreate: {params: 2},
  beforeBulkDestroy: {params: 1},
  afterBulkDestroy: {params: 1},
  beforeBulkRestore: {params: 1},
  afterBulkRestore: {params: 1},
  beforeBulkUpdate: {params: 1},
  afterBulkUpdate: {params: 1},
  beforeFind: {params: 1},
  beforeFindAfterExpandIncludeAll: {params: 1},
  beforeFindAfterOptions: {params: 1},
  afterFind: {params: 2},
  beforeCount: {params: 1},
  beforeDefine: {
    params: 2,
    sync: true
  },
  afterDefine: {
    params: 1,
    sync: true
  },
  beforeInit: {
    params: 2,
    sync: true
  },
  afterInit: {
    params: 1,
    sync: true
  },
  beforeConnect: {params: 1},
  beforeSync: {params: 1},
  afterSync: {params: 1},
  beforeBulkSync: {params: 1},
  afterBulkSync: {params: 1}
};
var hookAliases = {
  beforeDelete: 'beforeDestroy',
  afterDelete: 'afterDestroy',
  beforeBulkDelete: 'beforeBulkDestroy',
  afterBulkDelete: 'afterBulkDestroy',
  beforeConnection: 'beforeConnect'
};
var Hooks = {
  replaceHookAliases: function(hooks) {
    var realHookName;
    Utils._.each(hooks, function(hooksArray, name) {
      if (realHookName = hookAliases[name]) {
        hooks[realHookName] = (hooks[realHookName] || []).concat(hooksArray);
        delete hooks[name];
      }
    });
    return hooks;
  },
  runHooks: function(hooks) {
    var self = this,
        fn,
        fnArgs = Utils.sliceArgs(arguments, 1),
        hookType;
    if (typeof fnArgs[fnArgs.length - 1] === 'function') {
      fn = fnArgs.pop();
    }
    if (typeof hooks === 'string') {
      hookType = hooks;
      hooks = this.options.hooks[hookType] || [];
      if (!Array.isArray(hooks))
        hooks = hooks === undefined ? [] : [hooks];
      if (this.sequelize)
        hooks = hooks.concat(this.sequelize.options.hooks[hookType] || []);
    }
    if (!Array.isArray(hooks)) {
      hooks = hooks === undefined ? [] : [hooks];
    }
    if (hookTypes[hookType] && hookTypes[hookType].sync) {
      hooks.forEach(function(hook) {
        if (typeof hook === 'object')
          hook = hook.fn;
        return hook.apply(self, fnArgs);
      });
      return;
    }
    var promise = Promise.each(hooks, function(hook) {
      if (typeof hook === 'object') {
        hook = hook.fn;
      }
      if (hookType && hook.length > hookTypes[hookType].params) {
        hook = Promise.promisify(hook, self);
      }
      return hook.apply(self, fnArgs);
    }).return();
    if (fn) {
      return promise.nodeify(fn);
    }
    return promise;
  },
  hook: function() {
    return Hooks.addHook.apply(this, arguments);
  },
  addHook: function(hookType, name, fn) {
    if (typeof name === 'function') {
      fn = name;
      name = null;
    }
    hookType = hookAliases[hookType] || hookType;
    this.options.hooks[hookType] = this.options.hooks[hookType] || [];
    this.options.hooks[hookType].push(!!name ? {
      name: name,
      fn: fn
    } : fn);
    return this;
  },
  removeHook: function(hookType, name) {
    hookType = hookAliases[hookType] || hookType;
    if (!this.hasHook(hookType)) {
      return this;
    }
    this.options.hooks[hookType] = this.options.hooks[hookType].filter(function(hook) {
      if (typeof hook === 'function') {
        return true;
      }
      return typeof hook === 'object' && hook.name !== name;
    });
    return this;
  },
  hasHook: function(hookType) {
    return this.options.hooks[hookType] && !!this.options.hooks[hookType].length;
  }
};
Hooks.hasHooks = Hooks.hasHook;
module.exports = {
  hooks: hookTypes,
  hookAliases: hookAliases,
  applyTo: function(Model) {
    Utils._.mixin(Model, Hooks);
    Utils._.mixin(Model.prototype, Hooks);
    var allHooks = Object.keys(hookTypes).concat(Object.keys(hookAliases));
    allHooks.forEach(function(hook) {
      Model.prototype[hook] = function(name, callback) {
        return this.addHook(hook, name, callback);
      };
    });
  }
};
