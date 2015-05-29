(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/collection", "./transform"], function(Collection, Transform) {
    var CountCategories, CountCategoriess, _ref, _ref1;
    CountCategories = (function(_super) {
      __extends(CountCategories, _super);

      function CountCategories() {
        _ref = CountCategories.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CountCategories.prototype.type = "CountCategories";

      return CountCategories;

    })(Transform);
    CountCategoriess = (function(_super) {
      __extends(CountCategoriess, _super);

      function CountCategoriess() {
        _ref1 = CountCategoriess.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      CountCategoriess.prototype.model = CountCategories;

      return CountCategoriess;

    })(Collection);
    return {
      Model: CountCategories,
      Collection: new CountCategoriess()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=countcategories.js.map
*/