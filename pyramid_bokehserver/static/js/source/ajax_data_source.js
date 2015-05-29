(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["jquery", "underscore", "backbone", "common/logging", "./remote_data_source"], function($, _, Backbone, Logging, RemoteDataSource) {
    var AjaxDataSource, AjaxDataSources, logger, _ref, _ref1;
    logger = Logging.logger;
    AjaxDataSource = (function(_super) {
      __extends(AjaxDataSource, _super);

      function AjaxDataSource() {
        this.defaults = __bind(this.defaults, this);
        this.get_data = __bind(this.get_data, this);
        this.setup = __bind(this.setup, this);
        this.destroy = __bind(this.destroy, this);
        _ref = AjaxDataSource.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      AjaxDataSource.prototype.type = 'AjaxDataSource';

      AjaxDataSource.prototype.destroy = function() {
        if (this.interval != null) {
          return clearInterval(this.interval);
        }
      };

      AjaxDataSource.prototype.setup = function(plot_view, glyph) {
        this.pv = plot_view;
        this.get_data(this.get('mode'));
        if (this.get('polling_interval')) {
          return this.interval = setInterval(this.get_data, this.get('polling_interval'), this.get('mode'), this.get('max_size'), this.get('if_modified'));
        }
      };

      AjaxDataSource.prototype.get_data = function(mode, max_size, if_modified) {
        var _this = this;
        if (max_size == null) {
          max_size = 0;
        }
        if (if_modified == null) {
          if_modified = false;
        }
        $.ajax({
          dataType: 'json',
          ifModified: if_modified,
          url: this.get('data_url'),
          xhrField: {
            withCredentials: true
          },
          method: this.get('method'),
          contentType: 'application/json'
        }).done(function(data) {
          var column, original_data, _i, _len, _ref1;
          if (mode === 'replace') {
            _this.set('data', data);
          } else if (mode === 'append') {
            original_data = _this.get('data');
            _ref1 = _this.columns();
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              column = _ref1[_i];
              data[column] = original_data[column].concat(data[column]).slice(-max_size);
            }
            _this.set('data', data);
          } else {
            logger.error("unsupported mode: " + mode);
          }
          logger.info(data);
          return null;
        }).error(function() {
          return logger.error(arguments);
        });
        return null;
      };

      AjaxDataSource.prototype.defaults = function() {
        return _.extend({}, AjaxDataSource.__super__.defaults.call(this), {
          mode: 'replace'
        });
      };

      return AjaxDataSource;

    })(RemoteDataSource.RemoteDataSource);
    AjaxDataSources = (function(_super) {
      __extends(AjaxDataSources, _super);

      function AjaxDataSources() {
        _ref1 = AjaxDataSources.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      AjaxDataSources.prototype.model = AjaxDataSource;

      AjaxDataSources.prototype.defaults = {
        url: "",
        expr: null
      };

      return AjaxDataSources;

    })(Backbone.Collection);
    return {
      "Model": AjaxDataSource,
      "Collection": new AjaxDataSources()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=ajax_data_source.js.map
*/