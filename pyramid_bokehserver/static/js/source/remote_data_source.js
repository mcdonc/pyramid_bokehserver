(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["backbone", "underscore", "./column_data_source"], function(Backbone, _, ColumnDataSource) {
    var RemoteDataSource, _ref;
    RemoteDataSource = (function(_super) {
      __extends(RemoteDataSource, _super);

      function RemoteDataSource() {
        _ref = RemoteDataSource.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      return RemoteDataSource;

    })(ColumnDataSource.Model);
    return {
      'RemoteDataSource': RemoteDataSource
    };
  });

}).call(this);

/*
//@ sourceMappingURL=remote_data_source.js.map
*/