(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "jquery", "common/has_properties", "common/collection", "numeral"], function(_, $, HasProperties, Collection, Numeral) {
    var BooleanFormatter, BooleanFormatters, CellFormatter, CellFormatterCollection, DateFormatter, DateFormatters, NumberFormatter, NumberFormatters, StringFormatter, StringFormatters, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    CellFormatter = (function(_super) {
      __extends(CellFormatter, _super);

      function CellFormatter() {
        _ref = CellFormatter.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CellFormatter.prototype.format = function(row, cell, value, columnDef, dataContext) {
        if (value === null) {
          return "";
        } else {
          return (value + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
      };

      CellFormatter.prototype.formatterDefaults = {};

      CellFormatter.prototype.defaults = function() {
        return _.extend({}, CellFormatter.__super__.defaults.call(this), this.formatterDefaults);
      };

      return CellFormatter;

    })(HasProperties);
    CellFormatterCollection = (function(_super) {
      __extends(CellFormatterCollection, _super);

      function CellFormatterCollection() {
        _ref1 = CellFormatterCollection.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      return CellFormatterCollection;

    })(Collection);
    StringFormatter = (function(_super) {
      __extends(StringFormatter, _super);

      function StringFormatter() {
        _ref2 = StringFormatter.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      StringFormatter.prototype.type = 'StringFormatter';

      StringFormatter.prototype.formatterDefaults = {
        font_style: null,
        text_align: null,
        text_color: null
      };

      StringFormatter.prototype.format = function(row, cell, value, columnDef, dataContext) {
        var font_style, text, text_align, text_color;
        text = StringFormatter.__super__.format.call(this, row, cell, value, columnDef, dataContext);
        font_style = this.get("font_style");
        text_align = this.get("text_align");
        text_color = this.get("text_color");
        if ((font_style != null) || (text_align != null) || (text_color != null)) {
          text = $("<span>" + text + "</span>");
          switch (font_style) {
            case "bold":
              text = text.css("font-weight", "bold");
              break;
            case "italic":
              text = text.css("font-style", "italic");
          }
          if (text_align != null) {
            text = text.css("text-align", text_align);
          }
          if (text_color != null) {
            text = text.css("color", text_color);
          }
          text = text.prop('outerHTML');
        }
        return text;
      };

      return StringFormatter;

    })(CellFormatter);
    StringFormatters = (function(_super) {
      __extends(StringFormatters, _super);

      function StringFormatters() {
        _ref3 = StringFormatters.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      StringFormatters.prototype.model = StringFormatter;

      return StringFormatters;

    })(CellFormatterCollection);
    NumberFormatter = (function(_super) {
      __extends(NumberFormatter, _super);

      function NumberFormatter() {
        _ref4 = NumberFormatter.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      NumberFormatter.prototype.type = 'NumberFormatter';

      NumberFormatter.prototype.formatterDefaults = {
        font_style: null,
        text_align: null,
        text_color: null,
        format: '0,0',
        language: 'en',
        rounding: 'round'
      };

      NumberFormatter.prototype.format = function(row, cell, value, columnDef, dataContext) {
        var format, language, rounding;
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
        value = Numeral.format(value, format, language, rounding);
        return NumberFormatter.__super__.format.call(this, row, cell, value, columnDef, dataContext);
      };

      return NumberFormatter;

    })(StringFormatter);
    NumberFormatters = (function(_super) {
      __extends(NumberFormatters, _super);

      function NumberFormatters() {
        _ref5 = NumberFormatters.__super__.constructor.apply(this, arguments);
        return _ref5;
      }

      NumberFormatters.prototype.model = NumberFormatter;

      return NumberFormatters;

    })(CellFormatterCollection);
    BooleanFormatter = (function(_super) {
      __extends(BooleanFormatter, _super);

      function BooleanFormatter() {
        _ref6 = BooleanFormatter.__super__.constructor.apply(this, arguments);
        return _ref6;
      }

      BooleanFormatter.prototype.type = 'BooleanFormatter';

      BooleanFormatter.prototype.formatterDefaults = {
        icon: 'check'
      };

      BooleanFormatter.prototype.format = function(row, cell, value, columnDef, dataContext) {
        if (!!value) {
          return $('<i>').addClass(this.get("icon")).html();
        } else {
          return "";
        }
      };

      return BooleanFormatter;

    })(CellFormatter);
    BooleanFormatters = (function(_super) {
      __extends(BooleanFormatters, _super);

      function BooleanFormatters() {
        _ref7 = BooleanFormatters.__super__.constructor.apply(this, arguments);
        return _ref7;
      }

      BooleanFormatters.prototype.model = BooleanFormatter;

      return BooleanFormatters;

    })(CellFormatterCollection);
    DateFormatter = (function(_super) {
      __extends(DateFormatter, _super);

      function DateFormatter() {
        _ref8 = DateFormatter.__super__.constructor.apply(this, arguments);
        return _ref8;
      }

      DateFormatter.prototype.type = 'DateFormatter';

      DateFormatter.prototype.formatterDefaults = {
        format: 'yy M d'
      };

      DateFormatter.prototype.getFormat = function() {
        var format, name;
        format = this.get("format");
        name = (function() {
          switch (format) {
            case "ATOM":
            case "W3C":
            case "RFC-3339":
            case "ISO-8601":
              return "ISO-8601";
            case "COOKIE":
              return "COOKIE";
            case "RFC-850":
              return "RFC-850";
            case "RFC-1036":
              return "RFC-1036";
            case "RFC-1123":
              return "RFC-1123";
            case "RFC-2822":
              return "RFC-2822";
            case "RSS":
            case "RFC-822":
              return "RFC-822";
            case "TICKS":
              return "TICKS";
            case "TIMESTAMP":
              return "TIMESTAMP";
            default:
              return null;
          }
        })();
        if (name != null) {
          return $.datepicker[name];
        } else {
          return format;
        }
      };

      DateFormatter.prototype.format = function(row, cell, value, columnDef, dataContext) {
        var date;
        value = _.isString(value) ? parseInt(value, 10) : value;
        date = $.datepicker.formatDate(this.getFormat(), new Date(value));
        return DateFormatter.__super__.format.call(this, row, cell, date, columnDef, dataContext);
      };

      return DateFormatter;

    })(CellFormatter);
    DateFormatters = (function(_super) {
      __extends(DateFormatters, _super);

      function DateFormatters() {
        _ref9 = DateFormatters.__super__.constructor.apply(this, arguments);
        return _ref9;
      }

      DateFormatters.prototype.model = DateFormatter;

      return DateFormatters;

    })(CellFormatterCollection);
    return {
      String: {
        Model: StringFormatter,
        Collection: new StringFormatters()
      },
      Number: {
        Model: NumberFormatter,
        Collection: new NumberFormatters()
      },
      Boolean: {
        Model: BooleanFormatter,
        Collection: new BooleanFormatters()
      },
      Date: {
        Model: DateFormatter,
        Collection: new DateFormatters()
      }
    };
  });

}).call(this);

/*
//@ sourceMappingURL=cell_formatters.js.map
*/