(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var Id, Ids, _ref, _ref1;
    Id = (function(_super) {
      __extends(Id, _super);

      function Id() {
        _ref = Id.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Id.prototype.type = "Id";

      return Id;

    })(Transform);
    Ids = (function(_super) {
      __extends(Ids, _super);

      function Ids() {
        _ref1 = Ids.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      Ids.prototype.model = Id;

      return Ids;

    })(Collection);
    return {
      Model: Id,
      Collection: new Ids()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=id.js.map
*/