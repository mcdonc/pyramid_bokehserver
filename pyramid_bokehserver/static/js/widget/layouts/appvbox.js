(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["../vbox", "common/has_parent", "common/continuum_view", "common/build_views", "common/collection", "underscore"], function(vbox, HasParent, ContinuumView, build_views, Collection, _) {
    var AppVBox, AppVBoxView, AppVBoxes, appvboxes, _ref, _ref1, _ref2;
    AppVBoxView = (function(_super) {
      __extends(AppVBoxView, _super);

      function AppVBoxView() {
        _ref = AppVBoxView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      AppVBoxView.prototype.initialize = function(options) {
        var app;
        AppVBoxView.__super__.initialize.call(this, options);
        app = this.mget('app');
        return this.listenTo(app, 'change:objects', this.render);
      };

      return AppVBoxView;

    })(vbox.View);
    AppVBox = (function(_super) {
      __extends(AppVBox, _super);

      function AppVBox() {
        _ref1 = AppVBox.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      AppVBox.prototype.type = "AppVBox";

      AppVBox.prototype.default_view = AppVBoxView;

      AppVBox.prototype.children = function() {
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

      return AppVBox;

    })(HasParent);
    AppVBoxes = (function(_super) {
      __extends(AppVBoxes, _super);

      function AppVBoxes() {
        _ref2 = AppVBoxes.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      AppVBoxes.prototype.model = AppVBox;

      return AppVBoxes;

    })(Collection);
    appvboxes = new AppVBoxes();
    return {
      "Model": AppVBox,
      "Collection": appvboxes,
      "View": AppVBoxView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=appvbox.js.map
*/