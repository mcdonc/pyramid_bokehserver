(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["backbone", "common/has_properties", "common/logging"], function(Backbone, HasProperties, Logging) {
    var ToolEvents, ToolEventsCollection, logger, _ref, _ref1;
    logger = Logging.logger;
    ToolEvents = (function(_super) {
      __extends(ToolEvents, _super);

      function ToolEvents() {
        _ref = ToolEvents.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ToolEvents.prototype.type = 'ToolEvents';

      return ToolEvents;

    })(HasProperties);
    ToolEventsCollection = (function(_super) {
      __extends(ToolEventsCollection, _super);

      function ToolEventsCollection() {
        _ref1 = ToolEventsCollection.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      ToolEventsCollection.prototype.model = ToolEvents;

      return ToolEventsCollection;

    })(Backbone.Collection);
    return {
      "Model": ToolEvents,
      "Collection": new ToolEventsCollection()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=tool_events.js.map
*/