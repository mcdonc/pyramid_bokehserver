(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var NonZero, NonZeros, _ref, _ref1;
    NonZero = (function(_super) {
      __extends(NonZero, _super);

      function NonZero() {
        _ref = NonZero.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      NonZero.prototype.type = "NonZero";

      return NonZero;

    })(Transform);
    NonZeros = (function(_super) {
      __extends(NonZeros, _super);

      function NonZeros() {
        _ref1 = NonZeros.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      NonZeros.prototype.model = NonZero;

      return NonZeros;

    })(Collection);
    return {
      Model: NonZero,
      Collection: new NonZeros()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=nonzero.js.map
*/