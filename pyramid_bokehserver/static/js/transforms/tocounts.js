(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var ToCounts, ToCountss, _ref, _ref1;
    ToCounts = (function(_super) {
      __extends(ToCounts, _super);

      function ToCounts() {
        _ref = ToCounts.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ToCounts.prototype.type = "ToCounts";

      return ToCounts;

    })(Transform);
    ToCountss = (function(_super) {
      __extends(ToCountss, _super);

      function ToCountss() {
        _ref1 = ToCountss.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      ToCountss.prototype.model = ToCounts;

      return ToCountss;

    })(Collection);
    return {
      Model: ToCounts,
      Collection: new ToCountss()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=tocounts.js.map
*/