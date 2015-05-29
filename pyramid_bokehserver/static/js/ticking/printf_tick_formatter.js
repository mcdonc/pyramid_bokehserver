(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "sprintf", "common/collection", "common/has_properties"], function(_, SPrintf, Collection, HasProperties) {
    var PrintfTickFormatter, PrintfTickFormatters, _ref, _ref1;
    PrintfTickFormatter = (function(_super) {
      __extends(PrintfTickFormatter, _super);

      function PrintfTickFormatter() {
        _ref = PrintfTickFormatter.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      PrintfTickFormatter.prototype.type = 'PrintfTickFormatter';

      PrintfTickFormatter.prototype.format = function(ticks) {
        var format, labels, tick;
        format = this.get("format");
        labels = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = ticks.length; _i < _len; _i++) {
            tick = ticks[_i];
            _results.push(SPrintf.sprintf(format, tick));
          }
          return _results;
        })();
        return labels;
      };

      PrintfTickFormatter.prototype.defaults = function() {
        return _.extend({}, PrintfTickFormatter.__super__.defaults.call(this), {
          format: '%s'
        });
      };

      return PrintfTickFormatter;

    })(HasProperties);
    PrintfTickFormatters = (function(_super) {
      __extends(PrintfTickFormatters, _super);

      function PrintfTickFormatters() {
        _ref1 = PrintfTickFormatters.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      PrintfTickFormatters.prototype.model = PrintfTickFormatter;

      return PrintfTickFormatters;

    })(Collection);
    return {
      Model: PrintfTickFormatter,
      Collection: new PrintfTickFormatters()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=printf_tick_formatter.js.map
*/