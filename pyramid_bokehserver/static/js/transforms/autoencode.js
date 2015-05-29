(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var AutoEncode, AutoEncodes, _ref, _ref1;
    AutoEncode = (function(_super) {
      __extends(AutoEncode, _super);

      function AutoEncode() {
        _ref = AutoEncode.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      AutoEncode.prototype.type = "AutoEncode";

      return AutoEncode;

    })(Transform);
    AutoEncodes = (function(_super) {
      __extends(AutoEncodes, _super);

      function AutoEncodes() {
        _ref1 = AutoEncodes.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      AutoEncodes.prototype.model = AutoEncode;

      return AutoEncodes;

    })(Collection);
    return {
      Model: AutoEncode,
      Collection: new AutoEncodes()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=autoencode.js.map
*/