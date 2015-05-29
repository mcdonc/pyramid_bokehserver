(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "common/collection", "tool/gestures/select_tool"], function(_, Collection, SelectTool) {
    var TapTool, TapToolView, TapTools, _ref, _ref1, _ref2;
    TapToolView = (function(_super) {
      __extends(TapToolView, _super);

      function TapToolView() {
        _ref = TapToolView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      TapToolView.prototype._tap = function(e) {
        var append, canvas, vx, vy, _ref1;
        canvas = this.plot_view.canvas;
        vx = canvas.sx_to_vx(e.bokeh.sx);
        vy = canvas.sy_to_vy(e.bokeh.sy);
        append = (_ref1 = e.srcEvent.shiftKey) != null ? _ref1 : false;
        return this._select(vx, vy, true, append);
      };

      TapToolView.prototype._select = function(vx, vy, final, append) {
        var action, ds, geometry, r, sm, _i, _len, _ref1;
        geometry = {
          type: 'point',
          vx: vx,
          vy: vy
        };
        action = this.mget("action");
        _ref1 = this.mget('renderers');
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          r = _ref1[_i];
          ds = r.get('data_source');
          sm = ds.get('selection_manager');
          sm.select(this, this.plot_view.renderers[r.id], geometry, final, append);
          if (action != null) {
            action.execute(ds);
          }
        }
        this._save_geometry(geometry, final, append);
        return null;
      };

      return TapToolView;

    })(SelectTool.View);
    TapTool = (function(_super) {
      __extends(TapTool, _super);

      function TapTool() {
        _ref1 = TapTool.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      TapTool.prototype.default_view = TapToolView;

      TapTool.prototype.type = "TapTool";

      TapTool.prototype.tool_name = "Tap";

      TapTool.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAHWSURBVDiNbdJfaI9RGAfwz/7JNlLGjdxLyDU2u0EIx6uc7UIpF5pIU1OSGzfkUhvSiuSCvZbXGxeT0IxcSYlIiVxSJmqZzbj4nbafcer0nM75Ps/5Pt/vU2PWyouyAbsRsTJdv0SOGzELE9X4mlnJ7TiOtentV3qqS/EJTsUsDP9TIC/KvTiHZgyhwHP8Tkx2Ygd+4EDMwpXpAnlRtuJu+vFozMLF2a0lXAfOowkbYxYe1+RF2Yhb2IT9MQv9eVHOxTGsSwxGcCZm4WdelLuSHg8QatGZeh5KyQtxB/NwCIfRgtt5US6IWbiJgZTTWZ/UrsG1xLQHL2IWeqrYd+dF2YdunMRVBMRaLMckXiVwK3r/I0E/tqXzW0xgdX0VYCrFOjO2Va+PuJTO4/iE8Xq8RhuWqdj2FAdxpDo7ZmEUF/KiXIwxrMJUvYqibSrTdx2nUeZFeRaX8SFm4Suk5PcYiVnYAtU2bkBHzMJgXpTNOIHtqfdeLMUS3Mcz7GFmkNbjHr6jK2ZhsJp+XpQt6ec6jKIB86cLJNA+9GFOamsAb1Qc+qJic2PSagzv/iqQirQn6mvS1SQ+Y0WawkXJjUcxC5uhdpbSw9iKLjzEt7QnE6QpxWmb/wA4250STmTc7QAAAABJRU5ErkJggg==";

      TapTool.prototype.event_type = "tap";

      TapTool.prototype.default_order = 10;

      return TapTool;

    })(SelectTool.Model);
    TapTools = (function(_super) {
      __extends(TapTools, _super);

      function TapTools() {
        _ref2 = TapTools.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      TapTools.prototype.model = TapTool;

      return TapTools;

    })(Collection);
    return {
      Model: TapTool,
      Collection: new TapTools(),
      View: TapToolView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=tap_tool.js.map
*/