/*jshint esnext:true */

import riot from 'riot';

export let RouteableComponent = {
  bind: function bind(obj) {
    obj.Routeable = {
      _target: null,
      _tag: null,

      next: function next(parts, index, params, routes, node) {
        let target = parts[index];
        if (target) {
          if (routes.hasOwnProperty(target) === false) {
            target = '/404/';
          }

          if (routes.hasOwnProperty(target)) {
            if (this._target != target) {
              if (this._target !== null) {
                if (this._tag.onRouteLeave) {
                  this._tag.onRouteLeave(parts, index + 1, params);
                }

                this._tag.unmount(true);
              }

              if (node && routes[target].tagName) {
                let tag = riot.mount(node, routes[target].tagName, { route: { parts: parts, index: index + 1, params: params } });
                if (tag) {
                  this._target = target;
                  this._tag = tag[0];
                }
                else {
                  this._target = null;
                  this._tag = null;
                }
              }
            }

            if (this._tag && this._tag.onRouteHit) {
              this._tag.onRouteHit(parts, index + 1, params);
            }
          }
        }
      }
    };
  }
};