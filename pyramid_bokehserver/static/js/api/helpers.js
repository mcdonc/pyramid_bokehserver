(function() {
  define(["underscore", "common/logging"], function(_, Logging) {
    var logger, show;
    logger = Logging.logger;
    show = function(target, plot) {
      var myrender;
      logger.debug("Scheduling render for plot " + plot + " on target " + target);
      myrender = function() {
        var view;
        view = new plot.default_view({
          model: plot
        });
        return target.append(view.$el);
      };
      return _.defer(myrender);
    };
    return {
      show: show
    };
  });

}).call(this);

/*
//@ sourceMappingURL=helpers.js.map
*/