(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "common/collection", "renderer/overlay/poly_selection", "tool/gestures/select_tool"], function(_, Collection, PolySelection, SelectTool) {
    var LassoSelectTool, LassoSelectToolView, LassoSelectTools, _ref, _ref1, _ref2;
    LassoSelectToolView = (function(_super) {
      __extends(LassoSelectToolView, _super);

      function LassoSelectToolView() {
        _ref = LassoSelectToolView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      LassoSelectToolView.prototype.initialize = function(options) {
        LassoSelectToolView.__super__.initialize.call(this, options);
        this.listenTo(this.model, 'change:active', this._active_change);
        return this.data = null;
      };

      LassoSelectToolView.prototype._active_change = function() {
        if (!this.mget('active')) {
          return this._clear_overlay();
        }
      };

      LassoSelectToolView.prototype._keyup = function(e) {
        if (e.keyCode === 13) {
          return this._clear_overlay();
        }
      };

      LassoSelectToolView.prototype._pan_start = function(e) {
        var canvas, vx, vy;
        canvas = this.plot_view.canvas;
        vx = canvas.sx_to_vx(e.bokeh.sx);
        vy = canvas.sy_to_vy(e.bokeh.sy);
        this.data = {
          vx: [vx],
          vy: [vy]
        };
        return null;
      };

      LassoSelectToolView.prototype._pan = function(e) {
        var append, canvas, new_data, overlay, vx, vy, _ref1;
        canvas = this.plot_view.canvas;
        vx = canvas.sx_to_vx(e.bokeh.sx);
        vy = canvas.sy_to_vy(e.bokeh.sy);
        this.data.vx.push(vx);
        this.data.vy.push(vy);
        overlay = this.mget('overlay');
        new_data = {};
        new_data.vx = _.clone(this.data.vx);
        new_data.vy = _.clone(this.data.vy);
        overlay.set('data', new_data);
        if (this.mget('select_every_mousemove')) {
          append = (_ref1 = e.srcEvent.shiftKey) != null ? _ref1 : false;
          return this._select(this.data.vx, this.data.vy, false, append);
        }
      };

      LassoSelectToolView.prototype._pan_end = function(e) {
        var append, _ref1;
        this._clear_overlay();
        append = (_ref1 = e.srcEvent.shiftKey) != null ? _ref1 : false;
        return this._select(this.data.vx, this.data.vy, true, append);
      };

      LassoSelectToolView.prototype._clear_overlay = function() {
        return this.mget('overlay').set('data', null);
      };

      LassoSelectToolView.prototype._select = function(vx, vy, final, append) {
        var ds, geometry, r, sm, _i, _len, _ref1;
        geometry = {
          type: 'poly',
          vx: vx,
          vy: vy
        };
        _ref1 = this.mget('renderers');
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          r = _ref1[_i];
          ds = r.get('data_source');
          sm = ds.get('selection_manager');
          sm.select(this, this.plot_view.renderers[r.id], geometry, final, append);
        }
        this._save_geometry(geometry, final, append);
        return null;
      };

      return LassoSelectToolView;

    })(SelectTool.View);
    LassoSelectTool = (function(_super) {
      __extends(LassoSelectTool, _super);

      function LassoSelectTool() {
        _ref1 = LassoSelectTool.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      LassoSelectTool.prototype.default_view = LassoSelectToolView;

      LassoSelectTool.prototype.type = "LassoSelectTool";

      LassoSelectTool.prototype.tool_name = "Lasso Select";

      LassoSelectTool.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAQCAYAAAAbBi9cAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAGlSURBVDiNldNNiM1hFMfxz/3PHQqxoCgWYmNDk0jyUqwsuP/719xnPVkQStl4mYWpsVXKQkYpL1m4qWmyYElZkDLKyiSbkdKYNBovo8m1uM+d/nPd/2TO6nn5nW+/c57zlCwQ9eGRBPuwF7uxAUswjme4V6tWxqFUAFiLXlSxDaswiz9RkqAL79Ffq1YeldoAXTiNs9iIn3iN0Zj0OULWYycORU1fKQdZh5s4ggncxX28DVk6W+D8MG5hrJQr5Ql68AADIUvfFTZvPuw5VpZjOVcjZCBk6eD/ACJkF7ZgMMEJVHB7kZDNeIhXGEpwEg3cWASkFy9i3vFatTJTxvJ4sAcvo3ANpkOW/sold+MgTsUKRlGbm6P68Mh59GvOSR2/cVTzqYfifisOYDtm4vmlkKVTjUZDC5TgIi5gBX7gG7qxVHNuluEjHuN6yNI3LadzoJz1HejDMXzP3X2Njp+GLJ1o79c/oBzwGgK+YHV0cyVk6eV27YKgCNuEKZzBubjeH7J0rAiUdAKFLP0QsnQSdzCp+Wl7Omlb0RGUi0+YRlmz+YXxF2YZkqkolYwKAAAAAElFTkSuQmCC";

      LassoSelectTool.prototype.event_type = "pan";

      LassoSelectTool.prototype.default_order = 12;

      LassoSelectTool.prototype.initialize = function(attrs, options) {
        var plot_renderers;
        LassoSelectTool.__super__.initialize.call(this, attrs, options);
        this.set('overlay', new PolySelection.Model({
          line_width: 2
        }));
        plot_renderers = this.get('plot').get('renderers');
        plot_renderers.push(this.get('overlay'));
        return this.get('plot').set('renderers', plot_renderers);
      };

      LassoSelectTool.prototype.defaults = function() {
        return _.extend({}, LassoSelectTool.__super__.defaults.call(this), {
          select_every_mousemove: true
        });
      };

      return LassoSelectTool;

    })(SelectTool.Model);
    LassoSelectTools = (function(_super) {
      __extends(LassoSelectTools, _super);

      function LassoSelectTools() {
        _ref2 = LassoSelectTools.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      LassoSelectTools.prototype.model = LassoSelectTool;

      return LassoSelectTools;

    })(Collection);
    return {
      "Model": LassoSelectTool,
      "Collection": new LassoSelectTools(),
      "View": LassoSelectToolView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=lasso_select_tool.js.map
*/