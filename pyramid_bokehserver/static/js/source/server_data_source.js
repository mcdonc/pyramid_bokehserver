(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(["jquery", "underscore", "backbone", "./remote_data_source", "common/collection", "common/has_properties", "common/logging", "range/range1d", "range/data_range1d"], function($, _, Backbone, RemoteDataSource, Collection, HasProperties, Logging, Range1d, DataRange1d) {
    var AbstractRenderingSource, HeatmapSource, Line1dSource, ServerDataSource, ServerDataSources, ServerSourceUpdater, ajax_throttle, logger, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    logger = Logging.logger;
    ajax_throttle = function(func) {
      var busy, callback, has_callback, resp;
      busy = false;
      resp = null;
      has_callback = false;
      callback = function() {
        if (busy) {
          if (has_callback) {
            return logger.debug('already bound, ignoring');
          } else {
            logger.debug('busy, so doing it later');
            has_callback = true;
            return resp.done(function() {
              has_callback = false;
              return callback();
            });
          }
        } else {
          logger.debug('executing');
          busy = true;
          resp = func();
          return resp.done(function() {
            logger.debug('done, setting to false');
            busy = false;
            return resp = null;
          });
        }
      };
      return callback;
    };
    ServerSourceUpdater = (function(_super) {
      __extends(ServerSourceUpdater, _super);

      function ServerSourceUpdater() {
        _ref = ServerSourceUpdater.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ServerSourceUpdater.prototype.initialize = function(attrs, options) {
        ServerSourceUpdater.__super__.initialize.call(this, attrs, options);
        this.callbacks = [];
        this.plot_state = {
          data_x: options.data_x,
          data_y: options.data_y,
          screen_x: options.screen_x,
          screen_y: options.screen_y
        };
        this.glyph = options.glyph;
        this.data_source = options.data_source;
        this.render_state = options.render_state;
        return this.auto_bounds = options.data_source.get('transform')['auto_bounds'];
      };

      ServerSourceUpdater.prototype.stoplistening_for_updates = function() {
        var entry, _i, _len, _ref1, _results;
        _ref1 = this.callbacks;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          entry = _ref1[_i];
          _results.push(this.stopListening.apply(this, entry));
        }
        return _results;
      };

      ServerSourceUpdater.prototype.listen_for_updates = function() {
        var callback, param, ranges, _i, _len,
          _this = this;
        this.stoplistening_for_updates();
        callback = ajax_throttle(function() {
          return _this.update();
        });
        callback = _.debounce(callback, 100);
        callback();
        ranges = [this.plot_state['data_x'], this.plot_state['data_x'], this.plot_state['screen_x'], this.plot_state['screen_y']];
        for (_i = 0, _len = ranges.length; _i < _len; _i++) {
          param = ranges[_i];
          this.listenTo(param, 'change', callback);
          this.callbacks.push([param, 'change', callback]);
        }
        return null;
      };

      ServerSourceUpdater.prototype.update = function() {
        return null;
      };

      ServerSourceUpdater.prototype.plot_state_json = function() {
        var item, key, proxy, sendable_plot_state, _ref1;
        sendable_plot_state = {};
        _ref1 = this.plot_state;
        for (key in _ref1) {
          item = _ref1[key];
          proxy = new Range1d.Model();
          proxy.set('start', item.get('start'));
          proxy.set('end', item.get('end'));
          sendable_plot_state[key] = proxy;
        }
        return sendable_plot_state;
      };

      ServerSourceUpdater.prototype.update_url = function() {
        var base_url, docid, glyph, glyphid, sourceid, url;
        glyph = this.glyph;
        if (this.get('data_url')) {
          url = data_url;
          base_url = url.replace("/compute.json", "/render");
        } else {
          base_url = glyph.get_base().Config.prefix + "render";
        }
        docid = this.glyph.get('doc');
        sourceid = this.data_source.get('id');
        glyphid = glyph.get('id');
        url = "" + base_url + "/" + docid + "/" + sourceid + "/" + glyphid;
        return url;
      };

      return ServerSourceUpdater;

    })(Backbone.Model);
    AbstractRenderingSource = (function(_super) {
      __extends(AbstractRenderingSource, _super);

      function AbstractRenderingSource() {
        _ref1 = AbstractRenderingSource.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      AbstractRenderingSource.prototype.update = function() {
        var data, plot_state, render_state, resp,
          _this = this;
        plot_state = this.plot_state;
        render_state = this.render_state;
        if (!render_state) {
          render_state = {};
        }
        if (plot_state['screen_x'].get('start') === plot_state['screen_x'].get('end') || plot_state['screen_y'].get('start') === plot_state['screen_y'].get('end')) {
          logger.debug("skipping due to under-defined view state");
          return $.ajax();
        }
        logger.debug("Sent render State", render_state);
        data = {
          plot_state: this.plot_state_json(),
          render_state: render_state,
          auto_bounds: this.auto_bounds
        };
        resp = $.ajax({
          method: 'POST',
          dataType: 'json',
          url: this.update_url(),
          xhrField: {
            withCredentials: true
          },
          contentType: 'application/json',
          data: JSON.stringify(data),
          success: function(data) {
            var new_data;
            if (data.render_state === "NO UPDATE") {
              logger.info("No update");
              return;
            }
            if (_this.auto_bounds) {
              plot_state['data_x'].set({
                start: data.x_range.start,
                end: data.x_range.end
              });
              plot_state['data_y'].set({
                start: data.y_range.start,
                end: data.y_range.end
              });
              _this.auto_bounds = false;
            }
            logger.debug("New render State:", data.render_state);
            new_data = _.clone(_this.data_source.get('data'));
            _.extend(new_data, data['data']);
            _this.data_source.set('data', new_data);
            return null;
          }
        });
        return resp;
      };

      return AbstractRenderingSource;

    })(ServerSourceUpdater);
    Line1dSource = (function(_super) {
      __extends(Line1dSource, _super);

      function Line1dSource() {
        _ref2 = Line1dSource.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      Line1dSource.prototype.update = function() {
        var data, plot_state, render_state, resp,
          _this = this;
        plot_state = this.plot_state;
        render_state = this.render_state;
        if (!render_state) {
          render_state = {};
        }
        if (plot_state['screen_x'].get('start') === plot_state['screen_x'].get('end') || plot_state['screen_y'].get('start') === plot_state['screen_y'].get('end')) {
          logger.debug("skipping due to under-defined view state");
          return $.ajax();
        }
        logger.debug("Sent render State", render_state);
        data = {
          plot_state: this.plot_state_json(),
          render_state: render_state,
          auto_bounds: this.auto_bounds
        };
        resp = $.ajax({
          method: 'POST',
          dataType: 'json',
          url: this.update_url(),
          xhrField: {
            withCredentials: true
          },
          contentType: 'application/json',
          data: JSON.stringify(data),
          success: function(data) {
            var new_data;
            if (data.render_state === "NO UPDATE") {
              logger.info("No update");
              return;
            }
            if (_this.auto_bounds) {
              plot_state['data_x'].set({
                start: data.x_range.start,
                end: data.x_range.end
              });
              plot_state['data_y'].set({
                start: data.y_range.start,
                end: data.y_range.end
              });
              _this.auto_bounds = false;
            }
            logger.debug("New render State:", data.render_state);
            new_data = _.clone(_this.data_source.get('data'));
            _.extend(new_data, data['data']);
            _this.data_source.set('data', new_data);
            return null;
          }
        });
        return resp;
      };

      return Line1dSource;

    })(ServerSourceUpdater);
    HeatmapSource = (function(_super) {
      __extends(HeatmapSource, _super);

      function HeatmapSource() {
        _ref3 = HeatmapSource.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      HeatmapSource.prototype.update = function() {
        var data, plot_state, render_state, resp,
          _this = this;
        plot_state = this.plot_state;
        render_state = this.render_state;
        if (!render_state) {
          render_state = {};
        }
        if (plot_state['screen_x'].get('start') === plot_state['screen_x'].get('end') || plot_state['screen_y'].get('start') === plot_state['screen_y'].get('end')) {
          logger.debug("skipping due to under-defined view state");
          return $.ajax();
        }
        logger.debug("Sent render State", render_state);
        data = {
          plot_state: this.plot_state_json(),
          render_state: render_state,
          auto_bounds: this.auto_bounds
        };
        resp = $.ajax({
          method: 'POST',
          dataType: 'json',
          url: this.update_url(),
          xhrField: {
            withCredentials: true
          },
          contentType: 'application/json',
          data: JSON.stringify(data),
          success: function(data) {
            var new_data;
            if (data.render_state === "NO UPDATE") {
              logger.info("No update");
              return;
            }
            if (_this.auto_bounds) {
              plot_state['data_x'].set({
                start: data.x_range.start,
                end: data.x_range.end
              });
              plot_state['data_y'].set({
                start: data.y_range.start,
                end: data.y_range.end
              });
              _this.auto_bounds = false;
            }
            logger.debug("New render State:", data.render_state);
            new_data = _.clone(_this.data_source.get('data'));
            _.extend(new_data, data['data']);
            _this.data_source.set('data', new_data);
            return null;
          }
        });
        return resp;
      };

      return HeatmapSource;

    })(ServerSourceUpdater);
    ServerDataSource = (function(_super) {
      __extends(ServerDataSource, _super);

      function ServerDataSource() {
        this.setup_proxy = __bind(this.setup_proxy, this);
        this.setup = __bind(this.setup, this);
        this.initialize = __bind(this.initialize, this);
        _ref4 = ServerDataSource.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      ServerDataSource.prototype.type = 'ServerDataSource';

      ServerDataSource.prototype.initialize = function(attrs, options) {
        return ServerDataSource.__super__.initialize.call(this, attrs, options);
      };

      ServerDataSource.prototype.setup = function(plot_view, glyph) {
        var data_x_range, data_y_range, options, plot_h_range, plot_v_range;
        plot_h_range = plot_v_range = data_x_range = data_y_range = options = {
          data_x: plot_view.x_range,
          data_y: plot_view.y_range,
          screen_x: plot_view.frame.get('h_range'),
          screen_y: plot_view.frame.get('v_range'),
          glyph: glyph.model
        };
        return this.setup_proxy(options);
      };

      ServerDataSource.prototype.setup_proxy = function(options) {
        options['data_source'] = this;
        if (this.get('transform')['resample'] === 'abstract rendering') {
          this.proxy = new AbstractRenderingSource({}, options);
        } else if (this.get('transform')['resample'] === 'line1d') {
          this.proxy = new Line1dSource({}, options);
        } else if (this.get('transform')['resample'] === 'heatmap') {
          this.proxy = new HeatmapSource({}, options);
        }
        return this.proxy.listen_for_updates();
      };

      return ServerDataSource;

    })(RemoteDataSource.RemoteDataSource);
    ServerDataSources = (function(_super) {
      __extends(ServerDataSources, _super);

      function ServerDataSources() {
        _ref5 = ServerDataSources.__super__.constructor.apply(this, arguments);
        return _ref5;
      }

      ServerDataSources.prototype.model = ServerDataSource;

      return ServerDataSources;

    })(Collection);
    return {
      "Model": ServerDataSource,
      "Collection": new ServerDataSources()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=server_data_source.js.map
*/