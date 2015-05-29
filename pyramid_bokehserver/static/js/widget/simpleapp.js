(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/has_parent", "common/continuum_view", "common/collection"], function(HasParent, ContinuumView, Collection) {
    var SimpleApp, SimpleAppView, SimpleApps, simpleapps, _ref, _ref1, _ref2;
    SimpleAppView = (function(_super) {
      __extends(SimpleAppView, _super);

      function SimpleAppView() {
        _ref = SimpleAppView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      SimpleAppView.prototype.initialize = function(options) {
        SimpleAppView.__super__.initialize.call(this, options);
        return this.render();
      };

      SimpleAppView.prototype.render = function() {
        var layout;
        this.$el.html('');
        layout = this.mget('layout');
        this.layout_view = new layout.default_view({
          model: layout
        });
        return this.$el.append(this.layout_view.$el);
      };

      return SimpleAppView;

    })(ContinuumView);
    SimpleApp = (function(_super) {
      __extends(SimpleApp, _super);

      function SimpleApp() {
        _ref1 = SimpleApp.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      SimpleApp.prototype.type = SimpleApp;

      SimpleApp.prototype.default_view = SimpleAppView;

      return SimpleApp;

    })(HasParent);
    SimpleApps = (function(_super) {
      __extends(SimpleApps, _super);

      function SimpleApps() {
        _ref2 = SimpleApps.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      SimpleApps.prototype.model = SimpleApp;

      return SimpleApps;

    })(Collection);
    simpleapps = new SimpleApps();
    return {
      "Model": SimpleApp,
      "Collection": simpleapps,
      "View": SimpleAppView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=simpleapp.js.map
*/