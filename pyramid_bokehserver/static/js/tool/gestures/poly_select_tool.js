(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "common/collection", "renderer/overlay/poly_selection", "tool/gestures/select_tool"], function(_, Collection, PolySelection, SelectTool) {
    var PolySelectTool, PolySelectToolView, PolySelectTools, _ref, _ref1, _ref2;
    PolySelectToolView = (function(_super) {
      __extends(PolySelectToolView, _super);

      function PolySelectToolView() {
        _ref = PolySelectToolView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      PolySelectToolView.prototype.initialize = function(options) {
        PolySelectToolView.__super__.initialize.call(this, options);
        this.listenTo(this.model, 'change:active', this._active_change);
        return this.data = null;
      };

      PolySelectToolView.prototype._active_change = function() {
        if (!this.mget('active')) {
          return this._clear_data();
        }
      };

      PolySelectToolView.prototype._keyup = function(e) {
        if (e.keyCode === 13) {
          return this._clear_data();
        }
      };

      PolySelectToolView.prototype._doubletap = function(e) {
        var append, _ref1;
        append = (_ref1 = e.srcEvent.shiftKey) != null ? _ref1 : false;
        this._select(this.data.vx, this.data.vy, true, append);
        return this._clear_data();
      };

      PolySelectToolView.prototype._clear_data = function() {
        this.data = null;
        return this.mget('overlay').set('data', null);
      };

      PolySelectToolView.prototype._tap = function(e) {
        var canvas, new_data, overlay, vx, vy;
        canvas = this.plot_view.canvas;
        vx = canvas.sx_to_vx(e.bokeh.sx);
        vy = canvas.sy_to_vy(e.bokeh.sy);
        if (this.data == null) {
          this.data = {
            vx: [vx],
            vy: [vy]
          };
          return null;
        }
        this.data.vx.push(vx);
        this.data.vy.push(vy);
        overlay = this.mget('overlay');
        new_data = {};
        new_data.vx = _.clone(this.data.vx);
        new_data.vy = _.clone(this.data.vy);
        return overlay.set('data', new_data);
      };

      PolySelectToolView.prototype._select = function(vx, vy, final, append) {
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

      return PolySelectToolView;

    })(SelectTool.View);
    PolySelectTool = (function(_super) {
      __extends(PolySelectTool, _super);

      function PolySelectTool() {
        _ref1 = PolySelectTool.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      PolySelectTool.prototype.default_view = PolySelectToolView;

      PolySelectTool.prototype.type = "PolySelectTool";

      PolySelectTool.prototype.tool_name = "Poly Select";

      PolySelectTool.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAQCAYAAAAbBi9cAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAGdSURBVDiNjdO/axRBGMbxT8IiwSBBi4AiBBVRJE3UIqIIilrYLGuxMYo/AimsrNTCWkH/AbFR78Dc5dZiWW3SKQaVaKWlIFEiithooaiIZ7EbPM7b3D0wzLzzvvOdZ5iZviTNmnKN4gE2YSteYjW24A2+Yh/ux1G4uVij2cyXB0V8AYuYwBq8x5Ei/wEH8LNoHRVgWxyFr4v4RUvuScv4ESRpFhTQ/9SPmSTNdpbt1KZhXCsD7cZQj6AB7OqUCDCCTz2C3mF/maNnGOsRtB53y0BD/t1eN32T32pH0HY870ZI0mwMFZwvA73F+AqA4STNduCS3PlSpdbY0F4XFKAfJZA9mMO9OAonl+crtcZcpdaYP3ti4mqro0Py79AKOJqk2TwGMRVH4XTbHqtwpVJrVKv1ZGDZ0SIO4mGSZqNYh2m8wtM4Cr93MPur6E9jY7WenAvkz38pSbO9eIzrcRQe63TUFg3iDz7iIj73Yxa3i4LxOAovr0S4MzPbhzoOYy1GzkzGXwLcxC0sxFH4u4sTUyePN3EDKrXGAk4h/QvU5XGB9rRYawAAAABJRU5ErkJggg==";

      PolySelectTool.prototype.event_type = "tap";

      PolySelectTool.prototype.default_order = 11;

      PolySelectTool.prototype.initialize = function(attrs, options) {
        var plot_renderers;
        PolySelectTool.__super__.initialize.call(this, attrs, options);
        this.set('overlay', new PolySelection.Model);
        plot_renderers = this.get('plot').get('renderers');
        plot_renderers.push(this.get('overlay'));
        return this.get('plot').set('renderers', plot_renderers);
      };

      return PolySelectTool;

    })(SelectTool.Model);
    PolySelectTools = (function(_super) {
      __extends(PolySelectTools, _super);

      function PolySelectTools() {
        _ref2 = PolySelectTools.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      PolySelectTools.prototype.model = PolySelectTool;

      return PolySelectTools;

    })(Collection);
    return {
      "Model": PolySelectTool,
      "Collection": new PolySelectTools(),
      "View": PolySelectToolView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=poly_select_tool.js.map
*/