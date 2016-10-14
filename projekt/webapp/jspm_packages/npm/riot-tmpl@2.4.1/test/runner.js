/* */ 
var isNode = typeof window === 'undefined';
describe('Tmpl Tests', function() {
  if (isNode) {
    var _ = require('../dist/tmpl');
    expect = require('expect.js');
    tmpl = _.tmpl;
    brackets = _.brackets;
    require('./specs/core.specs');
    require('./specs/brackets.specs');
  }
});
