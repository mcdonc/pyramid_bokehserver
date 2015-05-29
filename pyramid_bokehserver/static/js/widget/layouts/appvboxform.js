(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["../vboxform", "common/has_parent", "common/continuum_view", "common/build_views", "common/collection", "underscore"], function(vboxform, HasParent, ContinuumView, build_views, Collection, _) {
    var AppVBoxForm, AppVBoxFormView, AppVBoxForms, appvboxforms, _ref, _ref1, _ref2;
    AppVBoxFormView = (function(_super) {
      __extends(AppVBoxFormView, _super);

      function AppVBoxFormView() {
        _ref = AppVBoxFormView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      AppVBoxFormView.prototype.initialize = function(options) {
        var app;
        AppVBoxFormView.__super__.initialize.call(this, options);
        app = this.mget('app');
        return this.listenTo(app, 'change:objects', this.render);
      };

      return AppVBoxFormView;

    })(vboxform.View);
    AppVBoxForm = (function(_super) {
      __extends(AppVBoxForm, _super);

      function AppVBoxForm() {
        _ref1 = AppVBoxForm.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      AppVBoxForm.prototype.type = "AppVBoxForm";

      AppVBoxForm.prototype.default_view = AppVBoxFormView;

      AppVBoxForm.prototype.children = function() {
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

      return AppVBoxForm;

    })(HasParent);
    AppVBoxForms = (function(_super) {
      __extends(AppVBoxForms, _super);

      function AppVBoxForms() {
        _ref2 = AppVBoxForms.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      AppVBoxForms.prototype.model = AppVBoxForm;

      return AppVBoxForms;

    })(Collection);
    appvboxforms = new AppVBoxForms();
    return {
      "Model": AppVBoxForm,
      "Collection": appvboxforms,
      "View": AppVBoxFormView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=appvboxform.js.map
*/