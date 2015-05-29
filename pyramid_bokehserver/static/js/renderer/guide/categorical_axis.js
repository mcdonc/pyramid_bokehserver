(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./axis", "common/logging", "range/factor_range", "ticking/categorical_ticker", "ticking/categorical_tick_formatter"], function(Collection, Axis, Logging, FactorRange, CategoricalTicker, CategoricalTickFormatter) {
    var CategoricalAxes, CategoricalAxis, CategoricalAxisView, logger, _ref, _ref1, _ref2;
    logger = Logging.logger;
    CategoricalAxisView = (function(_super) {
      __extends(CategoricalAxisView, _super);

      function CategoricalAxisView() {
        _ref = CategoricalAxisView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      return CategoricalAxisView;

    })(Axis.View);
    CategoricalAxis = (function(_super) {
      __extends(CategoricalAxis, _super);

      function CategoricalAxis() {
        _ref1 = CategoricalAxis.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      CategoricalAxis.prototype.default_view = CategoricalAxisView;

      CategoricalAxis.prototype.type = 'CategoricalAxis';

      CategoricalAxis.prototype.initialize = function(attrs, objects) {
        CategoricalAxis.__super__.initialize.call(this, attrs, objects);
        if (this.get('ticker') == null) {
          this.set_obj('ticker', CategoricalTicker.Collection.create());
        }
        if (this.get('formatter') == null) {
          return this.set_obj('formatter', CategoricalTickFormatter.Collection.create());
        }
      };

      CategoricalAxis.prototype._computed_bounds = function() {
        var cross_range, range, range_bounds, user_bounds, _ref2, _ref3;
        _ref2 = this.get('ranges'), range = _ref2[0], cross_range = _ref2[1];
        user_bounds = (_ref3 = this.get('bounds')) != null ? _ref3 : 'auto';
        range_bounds = [range.get('min'), range.get('max')];
        if (user_bounds !== 'auto') {
          logger.warn("Categorical Axes only support user_bounds='auto', ignoring");
        }
        return range_bounds;
      };

      return CategoricalAxis;

    })(Axis.Model);
    CategoricalAxes = (function(_super) {
      __extends(CategoricalAxes, _super);

      function CategoricalAxes() {
        _ref2 = CategoricalAxes.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      CategoricalAxes.prototype.model = CategoricalAxis;

      return CategoricalAxes;

    })(Collection);
    return {
      "Model": CategoricalAxis,
      "Collection": new CategoricalAxes(),
      "View": CategoricalAxisView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=categorical_axis.js.map
*/