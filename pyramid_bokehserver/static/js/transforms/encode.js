(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var Encode, Encodes, _ref, _ref1;
    Encode = (function(_super) {
      __extends(Encode, _super);

      function Encode() {
        _ref = Encode.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Encode.prototype.type = "Encode";

      return Encode;

    })(Transform);
    Encodes = (function(_super) {
      __extends(Encodes, _super);

      function Encodes() {
        _ref1 = Encodes.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Encodes.prototype.model = Encode;

      return Encodes;

    })(Collection);
    return {
      Model: Encode,
      Collection: new Encodes()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=encode.js.map
*/