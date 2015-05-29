(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "common/has_parent", "common/collection", "common/plot_widget", "renderer/properties"], function(_, HasParent, Collection, PlotWidget, properties) {
    var PolySelection, PolySelectionView, PolySelections, _ref, _ref1, _ref2;
    PolySelectionView = (function(_super) {
      __extends(PolySelectionView, _super);

      function PolySelectionView() {
        _ref = PolySelectionView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      PolySelectionView.prototype.initialize = function(options) {
        PolySelectionView.__super__.initialize.call(this, options);
        return this.props = {
          line: new properties.Line(this),
          fill: new properties.Fill(this)
        };
      };

      PolySelectionView.prototype.bind_bokeh_events = function() {
        return this.listenTo(this.model, 'change:data', this.plot_view.request_render);
      };

      PolySelectionView.prototype.render = function(ctx) {
        var canvas, data, i, sx, sy, _i, _ref1;
        data = _.clone(this.mget('data'));
        if (_.isEmpty(data) || (data == null)) {
          return null;
        }
        canvas = this.plot_view.canvas;
        ctx = this.plot_view.canvas_view.ctx;
        for (i = _i = 0, _ref1 = data.vx.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          sx = canvas.vx_to_sx(data.vx[i]);
          sy = canvas.vy_to_sy(data.vy[i]);
          if (i === 0) {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        if (this.mget('auto_close')) {
          ctx.closePath();
        }
        if (this.props.line.do_stroke) {
          this.props.line.set(ctx);
          ctx.stroke();
        }
        if (this.props.fill.do_fill && this.mget('auto_close')) {
          this.props.fill.set(ctx);
          return ctx.fill();
        }
      };

      return PolySelectionView;

    })(PlotWidget);
    PolySelection = (function(_super) {
      __extends(PolySelection, _super);

      function PolySelection() {
        _ref1 = PolySelection.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      PolySelection.prototype.default_view = PolySelectionView;

      PolySelection.prototype.type = "PolySelection";

      PolySelection.prototype.display_defaults = function() {
        return _.extend({}, PolySelection.__super__.display_defaults.call(this), {
          fill_color: null,
          fill_alpha: 0.2,
          line_color: 'grey',
          line_width: 3,
          line_alpha: 0.8,
          line_join: 'miter',
          line_cap: 'butt',
          line_dash: [4],
          line_dash_offset: 0
        });
      };

      PolySelection.prototype.defaults = function() {
        return _.extend({}, PolySelection.__super__.defaults.call(this), {
          level: 'overlay',
          auto_close: true,
          data: {}
        });
      };

      return PolySelection;

    })(HasParent);
    PolySelections = (function(_super) {
      __extends(PolySelections, _super);

      function PolySelections() {
        _ref2 = PolySelections.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      PolySelections.prototype.model = PolySelection;

      return PolySelections;

    })(Collection);
    return {
      "Model": PolySelection,
      "Collection": new PolySelections(),
      "View": PolySelectionView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=poly_selection.js.map
*/