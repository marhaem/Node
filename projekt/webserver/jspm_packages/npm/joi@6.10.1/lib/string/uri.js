/* */ 
var RFC3986 = require('./rfc3986');
var internals = {Uri: {createUriRegex: function(optionalScheme) {
      var scheme = RFC3986.scheme;
      if (optionalScheme) {
        scheme = '(?:' + optionalScheme + ')';
      }
      return new RegExp('^' + scheme + ':' + RFC3986.hierPart + '(?:\\?' + RFC3986.query + ')?' + '(?:#' + RFC3986.fragment + ')?$');
    }}};
module.exports = internals.Uri;
