(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var BinarySegment, BinarySegments, _ref, _ref1;
    BinarySegment = (function(_super) {
      __extends(BinarySegment, _super);

      function BinarySegment() {
        _ref = BinarySegment.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      BinarySegment.prototype.type = "BinarySegment";

      return BinarySegment;

    })(Transform);
    BinarySegments = (function(_super) {
      __extends(BinarySegments, _super);

      function BinarySegments() {
        _ref1 = BinarySegments.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      BinarySegments.prototype.model = BinarySegment;

      return BinarySegments;

    })(Collection);
    return {
      Model: BinarySegment,
      Collection: new BinarySegments()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=binarysegment.js.map
*/