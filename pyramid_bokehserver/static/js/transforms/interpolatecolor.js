(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var InterpolateColor, InterpolateColors, _ref, _ref1;
    InterpolateColor = (function(_super) {
      __extends(InterpolateColor, _super);

      function InterpolateColor() {
        _ref = InterpolateColor.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      InterpolateColor.prototype.type = "InterpolateColor";

      return InterpolateColor;

    })(Transform);
    InterpolateColors = (function(_super) {
      __extends(InterpolateColors, _super);

      function InterpolateColors() {
        _ref1 = InterpolateColors.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      InterpolateColors.prototype.model = InterpolateColor;

      return InterpolateColors;

    })(Collection);
    return {
      Model: InterpolateColor,
      Collection: new InterpolateColors()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=interpolatecolor.js.map
*/