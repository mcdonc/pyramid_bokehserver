(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var Cuberoot, Cuberoots, _ref, _ref1;
    Cuberoot = (function(_super) {
      __extends(Cuberoot, _super);

      function Cuberoot() {
        _ref = Cuberoot.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Cuberoot.prototype.type = "Cuberoot";

      return Cuberoot;

    })(Transform);
    Cuberoots = (function(_super) {
      __extends(Cuberoots, _super);

      function Cuberoots() {
        _ref1 = Cuberoots.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Cuberoots.prototype.model = Cuberoot;

      return Cuberoots;

    })(Collection);
    return {
      Model: Cuberoot,
      Collection: new Cuberoots()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=cuberoot.js.map
*/