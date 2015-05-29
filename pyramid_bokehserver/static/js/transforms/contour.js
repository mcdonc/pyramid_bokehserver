(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var Contour, Contours, _ref, _ref1;
    Contour = (function(_super) {
      __extends(Contour, _super);

      function Contour() {
        _ref = Contour.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Contour.prototype.type = "Contour";

      return Contour;

    })(Transform);
    Contours = (function(_super) {
      __extends(Contours, _super);

      function Contours() {
        _ref1 = Contours.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Contours.prototype.model = Contour;

      return Contours;

    })(Collection);
    return {
      Model: Contour,
      Collection: new Contours()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=contour.js.map
*/