(function() {
  define(["underscore", "sprintf", "numeral"], function(_, SPrintf, Numeral) {
    var replace_placeholders, _format_number;
    _format_number = function(number) {
      var format;
      if (_.isNumber(number)) {
        format = (function() {
          switch (false) {
            case Math.floor(number) !== number:
              return "%d";
            case !(Math.abs(number) > 0.1 && Math.abs(number) < 1000):
              return "%0.3f";
            default:
              return "%0.3e";
          }
        })();
        return SPrintf.sprintf(format, number);
      } else {
        return "" + number;
      }
    };
    replace_placeholders = function(string, data_source, i, special_vars) {
      var _this = this;
      if (special_vars == null) {
        special_vars = {};
      }
      string = string.replace(/(^|[^\$])\$(\w+)/g, function(match, prefix, name) {
        return "" + prefix + "@$" + name;
      });
      string = string.replace(/(^|[^@])@(?:(\$?\w+)|{([^{}]+)})(?:{([^{}]+)})?/g, function(match, prefix, name, long_name, format) {
        var replacement, value, _ref;
        name = long_name != null ? long_name : name;
        value = name[0] === "$" ? special_vars[name.substring(1)] : (_ref = data_source.get_column(name)) != null ? _ref[i] : void 0;
        replacement = value == null ? "???" : format != null ? Numeral.format(value, format) : _format_number(value);
        return "" + prefix + (_.escape(replacement));
      });
      return string;
    };
    return {
      replace_placeholders: replace_placeholders
    };
  });

}).call(this);

/*
//@ sourceMappingURL=util.js.map
*/