(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var Spread, Spreads, _ref, _ref1;
    Spread = (function(_super) {
      __extends(Spread, _super);

      function Spread() {
        _ref = Spread.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Spread.prototype.type = "Spread";

      return Spread;

    })(Transform);
    Spreads = (function(_super) {
      __extends(Spreads, _super);

      function Spreads() {
        _ref1 = Spreads.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Spreads.prototype.model = Spread;

      return Spreads;

    })(Collection);
    return {
      Model: Spread,
      Collection: new Spreads()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=spread.js.map
*/