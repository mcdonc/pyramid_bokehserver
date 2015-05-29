(function() {
  define(["underscore", "jquery", "common/logging", "./figure", "./helpers"], function(_, $, Logging, figure, helpers) {
    var logger, show, _api;
    logger = Logging.logger;
    show = helpers.show;
    _api = {
      "figure": figure
    };
    return $.fn.bokeh = function(type, args) {
      var obj;
      if (!(type in _api)) {
        logger.error("Unknown API type '" + type + "'. Recognized API types: " + (Object.keys(_api)));
        return this;
      }
      obj = _api[type](args);
      show(this, obj);
      return obj;
    };
  });

}).call(this);

/*
//@ sourceMappingURL=plugin.js.map
*/