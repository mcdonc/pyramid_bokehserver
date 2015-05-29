(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "common/has_properties"], function(Collection, HasProperties) {
    var FactorRange, FactorRanges, _ref, _ref1;
    FactorRange = (function(_super) {
      __extends(FactorRange, _super);

      function FactorRange() {
        _ref = FactorRange.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      FactorRange.prototype.type = 'FactorRange';

      FactorRange.prototype.initialize = function(attrs, options) {
        FactorRange.__super__.initialize.call(this, attrs, options);
        this.set('end', this.get('factors').length + 0.5);
        this.register_property('min', function() {
          return this.get('start');
        }, false);
        this.add_dependencies('min', this, ['factors']);
        this.register_property('max', function() {
          return this.get('end');
        }, false);
        this.add_dependencies('max', this, ['factors']);
        return this.listenTo(this, 'change:factors', function() {
          return this.set('end', this.get('factors').length + 0.5);
        });
      };

      FactorRange.prototype.defaults = function() {
        return _.extend({}, FactorRange.__super__.defaults.call(this), {
          start: 0.5,
          factors: []
        });
      };

      return FactorRange;

    })(HasProperties);
    FactorRanges = (function(_super) {
      __extends(FactorRanges, _super);

      function FactorRanges() {
        _ref1 = FactorRanges.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      FactorRanges.prototype.model = FactorRange;

      return FactorRanges;

    })(Collection);
    return {
      "Model": FactorRange,
      "Collection": new FactorRanges()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=factor_range.js.map
*/