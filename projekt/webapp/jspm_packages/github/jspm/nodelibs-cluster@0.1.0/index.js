/* */ 
if (System._nodeRequire)
  module.exports = System._nodeRequire('cluster');
else
  throw "Node cluster module not supported in browsers.";