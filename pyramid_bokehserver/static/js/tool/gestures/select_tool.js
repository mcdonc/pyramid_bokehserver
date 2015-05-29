(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["common/logging", "./gesture_tool"], function(Logging, GestureTool) {
    var SelectTool, SelectToolView, logger, _ref, _ref1;
    logger = Logging.logger;
    SelectToolView = (function(_super) {
      __extends(SelectToolView, _super);

      function SelectToolView() {
        _ref = SelectToolView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      SelectToolView.prototype._keyup = function(e) {
        var ds, r, sm, _i, _len, _ref1, _results;
        if (e.keyCode === 27) {
          _ref1 = this.mget('renderers');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            r = _ref1[_i];
            ds = r.get('data_source');
            sm = ds.get('selection_manager');
            _results.push(sm.clear());
          }
          return _results;
        }
      };

      SelectToolView.prototype._save_geometry = function(geometry, final, append) {
        var g, geoms, i, tool_events, xm, ym, _i, _ref1;
        g = _.clone(geometry);
        xm = this.plot_view.frame.get('x_mappers')['default'];
        ym = this.plot_view.frame.get('y_mappers')['default'];
        if (g.type === 'point') {
          g.x = xm.map_from_target(g.vx);
          g.y = ym.map_from_target(g.vy);
        } else if (g.type === 'rect') {
          g.x0 = xm.map_from_target(g.vx0);
          g.y0 = ym.map_from_target(g.vy0);
          g.x1 = xm.map_from_target(g.vx1);
          g.y1 = ym.map_from_target(g.vy1);
        } else if (g.type === 'poly') {
          g.x = new Array(g.vx.length);
          g.y = new Array(g.vy.length);
          for (i = _i = 0, _ref1 = g.vx.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
            g.x[i] = xm.map_from_target(g.vx[i]);
            g.y[i] = ym.map_from_target(g.vy[i]);
          }
        } else {
          logger.debug("Unrecognized selection geometry type: '" + g.type + "'");
        }
        if (final) {
          tool_events = this.plot_model.get('tool_events');
          if (append) {
            geoms = tool_events.get('geometries');
            geoms.push(g);
          } else {
            geoms = [g];
          }
          tool_events.set("geometries", geoms);
          tool_events.save();
        }
        return null;
      };

      return SelectToolView;

    })(GestureTool.View);
    SelectTool = (function(_super) {
      __extends(SelectTool, _super);

      function SelectTool() {
        _ref1 = SelectTool.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      SelectTool.prototype.initialize = function(attrs, options) {
        var all_renderers, names, r, renderers, _i, _len;
        SelectTool.__super__.initialize.call(this, attrs, options);
        names = this.get('names');
        renderers = this.get('renderers');
        if (renderers.length === 0) {
          all_renderers = this.get('plot').get('renderers');
          renderers = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = all_renderers.length; _i < _len; _i++) {
              r = all_renderers[_i];
              if (r.type === "GlyphRenderer") {
                _results.push(r);
              }
            }
            return _results;
          })();
        }
        if (names.length > 0) {
          renderers = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = renderers.length; _i < _len; _i++) {
              r = renderers[_i];
              if (names.indexOf(r.get('name')) >= 0) {
                _results.push(r);
              }
            }
            return _results;
          })();
        }
        this.set('renderers', renderers);
        logger.debug("setting " + renderers.length + " renderers for " + this.type + " " + this.id);
        for (_i = 0, _len = renderers.length; _i < _len; _i++) {
          r = renderers[_i];
          logger.debug("- " + r.type + " " + r.id);
        }
        return null;
      };

      SelectTool.prototype.defaults = function() {
        return _.extend({}, SelectTool.__super__.defaults.call(this), {
          renderers: [],
          names: [],
          multi_select_modifier: "shift"
        });
      };

      return SelectTool;

    })(GestureTool.Model);
    return {
      "Model": SelectTool,
      "View": SelectToolView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=select_tool.js.map
*/