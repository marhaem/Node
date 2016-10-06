/*global window */
/*jshint esnext:true, -W014 */

export function hash(initial) {
  if (typeof window.location.hash !== 'string') {
    return initial;
  }
  else {
    var loc = window.location.hash.slice(0, 1) === '#'
      ? window.location.hash.slice(1) //whatever comes after #
      : window.location.hash;

    if (/\/$/.test(loc)) {
      loc = loc.slice(0, -1); // cut off "/" at the end 
    }

    return loc.length === 0
      ? initial
      : loc;
  }
}
