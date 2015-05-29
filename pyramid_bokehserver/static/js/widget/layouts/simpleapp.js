(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(["./hbox", "backbone"], function(hbox, Backbone) {
    var SimpleAppLayout, SimpleAppLayoutView, SimpleAppLayouts, simpleapplayouts, _ref, _ref1, _ref2;
    SimpleAppLayoutView = (function(_super) {
      __extends(SimpleAppLayoutView, _super);

      function SimpleAppLayoutView() {
        _ref = SimpleAppLayoutView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      return SimpleAppLayoutView;

    })(hbox.View);
    SimpleAppLayout = (function(_super) {
      __extends(SimpleAppLayout, _super);

      function SimpleAppLayout() {
        this.children = __bind(this.children, this);
        _ref1 = SimpleAppLayout.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      SimpleAppLayout.prototype.initialize = function(attrs, options) {
        this.register_property('children', this.children, true);
        return this.add_dependencies('children', this, ['widgets', 'output']);
      };

      SimpleAppLayout.prototype.children = function() {
        return [this.get('widgets'), this.get('output')];
      };

      return SimpleAppLayout;

    })(hbox.Model);
    SimpleAppLayouts = (function(_super) {
      __extends(SimpleAppLayouts, _super);

      function SimpleAppLayouts() {
        _ref2 = SimpleAppLayouts.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      SimpleAppLayouts.prototype.model = SimpleAppLayout;

      return SimpleAppLayouts;

    })(Backbone.Collection);
    simpleapplayouts = new SimpleAppLayouts();
    return {
      "Model": SimpleAppLayout,
      "Collection": simpleapplayouts,
      "View": SimpleAppLayoutView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=simpleapp.js.map
*/