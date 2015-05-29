(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "numeral", "common/collection", "common/has_properties"], function(_, Numeral, Collection, HasProperties) {
    var NumeralTickFormatter, NumeralTickFormatters, _ref, _ref1;
    NumeralTickFormatter = (function(_super) {
      __extends(NumeralTickFormatter, _super);

      function NumeralTickFormatter() {
        _ref = NumeralTickFormatter.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      NumeralTickFormatter.prototype.type = 'NumeralTickFormatter';

      NumeralTickFormatter.prototype.format = function(ticks) {
        var format, labels, language, rounding, tick;
        format = this.get("format");
        language = this.get("language");
        rounding = (function() {
          switch (this.get("rounding")) {
            case "round":
            case "nearest":
              return Math.round;
            case "floor":
            case "rounddown":
              return Math.floor;
            case "ceil":
            case "roundup":
              return Math.ceil;
          }
        }).call(this);
        labels = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = ticks.length; _i < _len; _i++) {
            tick = ticks[_i];
            _results.push(Numeral.format(tick, format, language, rounding));
          }
          return _results;
        })();
        return labels;
      };

      NumeralTickFormatter.prototype.defaults = function() {
        return _.extend({}, NumeralTickFormatter.__super__.defaults.call(this), {
          format: '0,0',
          language: 'en',
          rounding: 'round'
        });
      };

      return NumeralTickFormatter;

    })(HasProperties);
    NumeralTickFormatters = (function(_super) {
      __extends(NumeralTickFormatters, _super);

      function NumeralTickFormatters() {
        _ref1 = NumeralTickFormatters.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      NumeralTickFormatters.prototype.model = NumeralTickFormatter;

      return NumeralTickFormatters;

    })(Collection);
    return {
      Model: NumeralTickFormatter,
      Collection: new NumeralTickFormatters()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=numeral_tick_formatter.js.map
*/