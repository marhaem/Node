/*jshint esnext:true, -W014 */

export function parser(path) {
  let raw = (path.charAt(0) == '!'
    ? path.charAt(1) == '/'
      ? path.slice(2)
      : path.slice(1)
    : path.charAt(0) == '/'
      ? path.slice(1)
      : path).split('?');
  let uri = raw[0].split('/');
  let qs = raw[1];
  let params = {};

  if (/^\s*$/.test(uri[uri.length-1])) {
    uri.pop();
  }

  if (qs) {
    let c;
    qs.split('&').forEach(function(v) {
      c = v.split('=');
      if (/^\s*$/.test(c[0]) === false) {
        params[c[0]] = c[1];
      }
    });
  }

  uri.push(params);
  return uri;
}