(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["../hbox", "common/has_parent", "common/continuum_view", "common/build_views", "common/collection", "underscore"], function(hbox, HasParent, ContinuumView, build_views, Collection, _) {
    var AppHBox, AppHBoxView, AppHBoxes, apphboxes, _ref, _ref1, _ref2;
    AppHBoxView = (function(_super) {
      __extends(AppHBoxView, _super);

      function AppHBoxView() {
        _ref = AppHBoxView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      AppHBoxView.prototype.initialize = function(options) {
        var app;
        AppHBoxView.__super__.initialize.call(this, options);
        app = this.mget('app');
        return this.listenTo(app, 'change:objects', this.render);
      };

      return AppHBoxView;

    })(hbox.View);
    AppHBox = (function(_super) {
      __extends(AppHBox, _super);

      function AppHBox() {
        _ref1 = AppHBox.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      AppHBox.prototype.type = "AppHBox";

      AppHBox.prototype.default_view = AppHBoxView;

      AppHBox.prototype.children = function() {
        var app, children, objects, raw_children,
          _this = this;
        app = this.get('app');
        raw_children = this.get('children');
        objects = app.get('objects');
        children = _.map(raw_children, function(child) {
          if (_.isString(child)) {
            return _this.resolve_ref(objects[child]);
          } else {
            return child;
          }
        });
        return children;
      };

      return AppHBox;

    })(HasParent);
    AppHBoxes = (function(_super) {
      __extends(AppHBoxes, _super);

      function AppHBoxes() {
        _ref2 = AppHBoxes.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      AppHBoxes.prototype.model = AppHBox;

      return AppHBoxes;

    })(Collection);
    apphboxes = new AppHBoxes();
    return {
      "Model": AppHBox,
      "Collection": apphboxes,
      "View": AppHBoxView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=apphbox.js.map
*/