(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var Const, Consts, _ref, _ref1;
    Const = (function(_super) {
      __extends(Const, _super);

      function Const() {
        _ref = Const.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Const.prototype.type = "Const";

      return Const;

    })(Transform);
    Consts = (function(_super) {
      __extends(Consts, _super);

      function Consts() {
        _ref1 = Consts.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Consts.prototype.model = Const;

      return Consts;

    })(Collection);
    return {
      Model: Const,
      Collection: new Consts()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=const.js.map
*/