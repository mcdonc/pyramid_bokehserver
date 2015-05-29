(function() {
  define(["underscore", "jquery"], function(_, $) {
    var waitForElement;
    waitForElement = function(el, fn) {
      var handler, interval,
        _this = this;
      handler = function() {
        if ($.contains(document.documentElement, el)) {
          clearInterval(interval);
          return fn();
        }
      };
      return interval = setInterval(handler, 50);
    };
    return {
      waitForElement: waitForElement
    };
  });

}).call(this);

/*
//@ sourceMappingURL=dom_util.js.map
*/