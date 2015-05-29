(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var HDAlpha, HDAlphas, _ref, _ref1;
    HDAlpha = (function(_super) {
      __extends(HDAlpha, _super);

      function HDAlpha() {
        _ref = HDAlpha.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      HDAlpha.prototype.type = "HDAlpha";

      return HDAlpha;

    })(Transform);
    HDAlphas = (function(_super) {
      __extends(HDAlphas, _super);

      function HDAlphas() {
        _ref1 = HDAlphas.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      HDAlphas.prototype.model = HDAlpha;

      return HDAlphas;

    })(Collection);
    return {
      Model: HDAlpha,
      Collection: new HDAlphas()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=hdalpha.js.map
*/