
/*jshint esnext:true */

export function onRoute(receiver, route, params) {
  if (arguments) {
    receiver.onRouteHit(route, 0, params);
  }
}