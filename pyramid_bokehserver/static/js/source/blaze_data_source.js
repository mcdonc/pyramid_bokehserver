(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["jquery", "underscore", "backbone", "common/logging", "./remote_data_source"], function($, _, Backbone, Logging, RemoteDataSource) {
    var BlazeDataSource, BlazeDataSources, logger, _ref, _ref1;
    logger = Logging.logger;
    BlazeDataSource = (function(_super) {
      __extends(BlazeDataSource, _super);

      function BlazeDataSource() {
        this.update = __bind(this.update, this);
        this.setup = __bind(this.setup, this);
        this.destroy = __bind(this.destroy, this);
        _ref = BlazeDataSource.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      BlazeDataSource.prototype.type = 'BlazeDataSource';

      BlazeDataSource.prototype.destroy = function() {
        if (this.interval != null) {
          return clearInterval(this.interval);
        }
      };

      BlazeDataSource.prototype.setup = function(plot_view, glyph) {
        this.pv = plot_view;
        this.update();
        if (this.get('polling_interval')) {
          return this.interval = setInterval(this.update, this.get('polling_interval'));
        }
      };

      BlazeDataSource.prototype.update = function() {
        var data,
          _this = this;
        data = JSON.stringify({
          expr: this.get('expr'),
          namespace: this.get('namespace')
        });
        return $.ajax({
          dataType: 'json',
          url: this.get('data_url'),
          data: data,
          xhrField: {
            withCredentials: true
          },
          method: 'POST',
          contentType: 'application/json'
        }).done(function(data) {
          var colname, columns_of_data, data_dict, idx, orig_data, _i, _len, _ref1;
          columns_of_data = _.zip.apply(_, data.data);
          data_dict = {};
          _ref1 = data.names;
          for (idx = _i = 0, _len = _ref1.length; _i < _len; idx = ++_i) {
            colname = _ref1[idx];
            data_dict[colname] = columns_of_data[idx];
          }
          orig_data = _.clone(_this.get('data'));
          _.extend(orig_data, data_dict);
          _this.set('data', orig_data);
          return null;
        });
      };

      return BlazeDataSource;

    })(RemoteDataSource.RemoteDataSource);
    BlazeDataSources = (function(_super) {
      __extends(BlazeDataSources, _super);

      function BlazeDataSources() {
        _ref1 = BlazeDataSources.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      BlazeDataSources.prototype.model = BlazeDataSource;

      BlazeDataSources.prototype.defaults = {
        url: "",
        expr: null
      };

      return BlazeDataSources;

    })(Backbone.Collection);
    return {
      "Model": BlazeDataSource,
      "Collection": new BlazeDataSources()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=blaze_data_source.js.map
*/