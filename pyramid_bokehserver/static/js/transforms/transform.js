(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/has_properties"], function(HasProperties) {
    var Transform, _ref;
    return Transform = (function(_super) {
      __extends(Transform, _super);

      function Transform() {
        _ref = Transform.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      return Transform;

    })(HasProperties);
  });

}).call(this);

/*
//@ sourceMappingURL=transform.js.map
*/