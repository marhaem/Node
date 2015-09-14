/*jshint esnext:true */

import riot from 'riot';

/**
 * Simplifies passing down routing events.
 * No unneccessary re-mounting when same route part is hit, so only changes are done.
 */
//@TODO: Explore other possibilities instead of binding, like mixin.
export let RouteableComponent = {
  bind: function bind(obj) {
    obj.Routeable = {
      _target: null,  // for remembering where we previously went so we do not unneccessary re-mounts
      _tag: null,     // remember tag to pass route events to (needed if not re-mounted)

      /**
       * Passes down the route to the next page.
       * If there should be a 404 displayed, subroutes need to contain '/404/'.
       *
       * parts:     all route parts as array (e.g. #rooms/kitchen => ['rooms', 'kitchen'])
       * index:     where we are / depth (e.g. 1 => 'kitchen')
       * params:    all params that were given as object (e.g. #rooms/kitchen?variant=12&style=red => { variant: '12', style: 'red' })
       * subroutes: all possible subsubroutes from where we currently are (e.g. rooms may have ['kitchen', 'bath', 'kidsroom'])
       * node:      html dom node where the next page shall mount itself to
       */
      next: function next(parts, index, params, subroutes, node) {
        let target = parts[index];
        if (target) {
          if (subroutes.hasOwnProperty(target) === false) {
            target = '/404/';
          }

          if (subroutes.hasOwnProperty(target)) {
            if (this._target != target) {
              if (this._target !== null) {
                if (this._tag.onRouteLeave) {
                  this._tag.onRouteLeave(parts, index + 1, params);
                }

                this._tag.unmount(true);
              }

              if (node && subroutes[target].tagName) {
                let tag = riot.mount(node, subroutes[target].tagName, { route: { parts: parts, index: index + 1, params: params } });
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