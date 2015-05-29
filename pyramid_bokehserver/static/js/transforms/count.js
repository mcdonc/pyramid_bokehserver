(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var Count, Counts, _ref, _ref1;
    Count = (function(_super) {
      __extends(Count, _super);

      function Count() {
        _ref = Count.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Count.prototype.type = "Count";

      return Count;

    })(Transform);
    Counts = (function(_super) {
      __extends(Counts, _super);

      function Counts() {
        _ref1 = Counts.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Counts.prototype.model = Count;

      return Counts;

    })(Collection);
    return {
      Model: Count,
      Collection: new Counts()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=count.js.map
*/