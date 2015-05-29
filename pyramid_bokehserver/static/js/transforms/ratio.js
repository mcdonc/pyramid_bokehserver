(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var Ratio, Ratios, _ref, _ref1;
    Ratio = (function(_super) {
      __extends(Ratio, _super);

      function Ratio() {
        _ref = Ratio.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Ratio.prototype.type = "Ratio";

      return Ratio;

    })(Transform);
    Ratios = (function(_super) {
      __extends(Ratios, _super);

      function Ratios() {
        _ref1 = Ratios.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Ratios.prototype.model = Ratio;

      return Ratios;

    })(Collection);
    return {
      Model: Ratio,
      Collection: new Ratios()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=ratio.js.map
*/