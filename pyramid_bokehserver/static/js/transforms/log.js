(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var Log, Logs, _ref, _ref1;
    Log = (function(_super) {
      __extends(Log, _super);

      function Log() {
        _ref = Log.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Log.prototype.type = "Log";

      return Log;

    })(Transform);
    Logs = (function(_super) {
      __extends(Logs, _super);

      function Logs() {
        _ref1 = Logs.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Logs.prototype.model = Log;

      return Logs;

    })(Collection);
    return {
      Model: Log,
      Collection: new Logs()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=log.js.map
*/