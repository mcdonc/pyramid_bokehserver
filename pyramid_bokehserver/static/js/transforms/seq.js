(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var Seq, Seqs, _ref, _ref1;
    Seq = (function(_super) {
      __extends(Seq, _super);

      function Seq() {
        _ref = Seq.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Seq.prototype.type = "Seq";

      return Seq;

    })(Transform);
    Seqs = (function(_super) {
      __extends(Seqs, _super);

      function Seqs() {
        _ref1 = Seqs.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Seqs.prototype.model = Seq;

      return Seqs;

    })(Collection);
    return {
      Model: Seq,
      Collection: new Seqs()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=seq.js.map
*/