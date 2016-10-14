/* */ 
(function(process) {
  var riot = {settings: {}};
  if (typeof window === 'undefined')
    window = false;
  var brackets = (function(orig) {
    var cachedBrackets,
        r,
        b,
        re = /[{}]/g;
    return function(x) {
      var s = riot.settings.brackets || orig;
      if (cachedBrackets !== s) {
        cachedBrackets = s;
        b = s.split(' ');
        r = b.map(function(e) {
          return e.replace(/(?=.)/g, '\\');
        });
      }
      return x instanceof RegExp ? (s === orig ? x : new RegExp(x.source.replace(re, function(b) {
        return r[~~(b === '}')];
      }), x.global ? 'g' : '')) : b[x];
    };
  })('{ }');
  var tmpl = (function() {
    var cache = {},
        OGLOB = '"in d?d:' + (window ? 'window).' : 'global).'),
        reVars = /(['"\/])(?:[^\\]*?|\\.|.)*?\1|\.\w*|\w*:|\b(?:(?:new|typeof|in|instanceof) |(?:this|true|false|null|undefined)\b|function\s*\()|([A-Za-z_$]\w*)/g;
    return function(str, data) {
      return str && (cache[str] || (cache[str] = tmpl(str)))(data);
    };
    function tmpl(s, p) {
      if (s.indexOf(brackets(0)) < 0) {
        s = s.replace(/\n|\r\n?/g, '\n');
        return function() {
          return s;
        };
      }
      s = s.replace(brackets(/\\{/g), '\uFFF0').replace(brackets(/\\}/g), '\uFFF1');
      p = split(s, extract(s, brackets(/{/), brackets(/}/)));
      s = (p.length === 2 && !p[0]) ? expr(p[1]) : '[' + p.map(function(s, i) {
        return i % 2 ? expr(s, true) : '"' + s.replace(/\n|\r\n?/g, '\\n').replace(/"/g, '\\"') + '"';
      }).join(',') + '].join("")';
      return new Function('d', 'return ' + s.replace(/\uFFF0/g, brackets(0)).replace(/\uFFF1/g, brackets(1)) + ';');
    }
    function expr(s, n) {
      s = s.replace(/\n|\r\n?/g, ' ').replace(brackets(/^[{ ]+|[ }]+$|\/\*.+?\*\//g), '');
      return /^\s*[\w- "']+ *:/.test(s) ? '[' + extract(s, /["' ]*[\w- ]+["' ]*:/, /,(?=["' ]*[\w- ]+["' ]*:)|}|$/).map(function(pair) {
        return pair.replace(/^[ "']*(.+?)[ "']*: *(.+?),? *$/, function(_, k, v) {
          return v.replace(/[^&|=!><]+/g, wrap) + '?"' + k + '":"",';
        });
      }).join('') + '].join(" ").trim()' : wrap(s, n);
    }
    function wrap(s, nonull) {
      s = s.trim();
      return !s ? '' : '(function(v){try{v=' + s.replace(reVars, function(s, _, v) {
        return v ? '(("' + v + OGLOB + v + ')' : s;
      }) + '}catch(e){}return ' + (nonull === true ? '!v&&v!==0?"":v' : 'v') + '}).call(d)';
    }
    function split(str, substrings) {
      var parts = [];
      substrings.map(function(sub, i) {
        i = str.indexOf(sub);
        parts.push(str.slice(0, i), sub);
        str = str.slice(i + sub.length);
      });
      if (str)
        parts.push(str);
      return parts;
    }
    function extract(str, open, close) {
      var start,
          level = 0,
          matches = [],
          re = new RegExp('(' + open.source + ')|(' + close.source + ')', 'g');
      str.replace(re, function(_, open, close, pos) {
        if (!level && open)
          start = pos;
        level += open ? 1 : -1;
        if (!level && close != null)
          matches.push(str.slice(start, pos + close.length));
      });
      return matches;
    }
  })();
  module.exports = {
    brackets: brackets,
    tmpl: tmpl
  };
})(require('process'));
