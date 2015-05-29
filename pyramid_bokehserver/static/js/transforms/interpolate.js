(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var Interpolate, Interpolates, _ref, _ref1;
    Interpolate = (function(_super) {
      __extends(Interpolate, _super);

      function Interpolate() {
        _ref = Interpolate.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Interpolate.prototype.type = "Interpolate";

      return Interpolate;

    })(Transform);
    Interpolates = (function(_super) {
      __extends(Interpolates, _super);

      function Interpolates() {
        _ref1 = Interpolates.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Interpolates.prototype.model = Interpolate;

      return Interpolates;

    })(Collection);
    return {
      Model: Interpolate,
      Collection: new Interpolates()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=interpolate.js.map
*/