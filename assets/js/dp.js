var serialize = require('./serialize');
var LRU = require('lru-cache');

function cache(f, maxSize) {
  var c = LRU(maxSize);
  var cf = function(s, k, a) {
    var args = Array.prototype.slice.call(arguments, 3);
    var stringedArgs = serialize(args);
    if (c.has(stringedArgs)) {
      return k(s, c.get(stringedArgs));
    } else {
      var newk = function(s, r) {
        if (c.has(stringedArgs)) {
          // This can happen when cache is used on recursive functions
          console.log('Already in cache:', stringedArgs);
          if (serialize(c.get(stringedArgs)) !== serialize(r)) {
            console.log('OLD AND NEW CACHE VALUE DIFFER!');
            console.log('Old value:', c.get(stringedArgs));
            console.log('New value:', r);
          }
        }
        c.set(stringedArgs, r);
        if (!maxSize && c.length === 1e4) {
          console.log(c.length + ' function calls have been cached.');
          console.log('The size of the cache can be limited by calling cache(f, maxSize).');
        }
        return k(s, r);
      };
      return f.apply(this, [s, newk, a].concat(args));
    }
  };
  // make the cache publically available to facillitate checking the complexity of algorithms
  cf.cache = c; 
  return cf;
}

module.exports = {
  cache: cache
}
