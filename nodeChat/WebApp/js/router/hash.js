/*global window */
/*jshint esnext:true, -W014 */

export function hash(initial) {
  if (typeof window.location.hash !== 'string') {
    return initial;
  }
  else {
    var loc = window.location.hash.slice(0, 1) === '#'
      ? window.location.hash.slice(1)
      : window.location.hash;

    if (/\/$/.test(loc)) {
      loc = loc.slice(0, -1);
    }

    return loc.length === 0
      ? initial
      : loc;
  }
}