/* */ 
var Pool = require('../lib/generic-pool').Pool;
var resourceIdx = 1;
var pool = new Pool({
  name: 'test-resource-pool',
  create: function(callback) {
    var id = resourceIdx++;
    console.log('### creating resource %d', id);
    callback({
      testResource: 'test',
      id: id
    });
  },
  destroy: function(resource) {
    console.log('### destroying resource ', resource);
  },
  validateAsync: function(resource, callback) {
    console.log('### asynchronous validation:', resource);
    function _validate() {
      callback(true);
    }
    setTimeout(_validate, 10);
  },
  max: 2,
  min: 0,
  reapIntervalMillis: 5000,
  idleTimeoutMillis: 5000,
  log: true
});
function executeUnitOfWork(someWork, duration, callback) {
  pool.acquire(function(error, resource) {
    if (error) {
      return callback(error);
    }
    console.log('### performing work: "%s" with resource %d', someWork, resource.id);
    function _work() {
      pool.release(resource);
      callback(null, {testData: resource.id});
    }
    if (duration == false) {
      return _work();
    } else {
      setTimeout(_work, duration);
    }
  });
}
function createUnitOfWorkExecutor(work, duration) {
  return function(cb) {
    executeUnitOfWork(work, duration, function(error, results) {
      if (error) {
        console.error('### Could not acquire resource from the pool', error);
      } else {
        console.log('### results: ', results);
      }
      if (cb) {
        cb();
      }
    });
  };
}
var unit1 = createUnitOfWorkExecutor("should create a new resource", 500);
var unit2 = createUnitOfWorkExecutor("should re-use an existing resource", 500);
var unit3 = createUnitOfWorkExecutor("should re-use an existing resource again", 500);
setTimeout(unit1, 1000);
setTimeout(unit2, 2500);
setTimeout(unit3, 4000);
