(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "common/logging", "common/has_parent", "common/collection", "common/plot_widget", "range/factor_range", "source/remote_data_source"], function(_, Logging, HasParent, Collection, PlotWidget, FactorRange, RemoteDataSource) {
    var GlyphRenderer, GlyphRendererView, GlyphRenderers, logger, _ref, _ref1, _ref2;
    logger = Logging.logger;
    GlyphRendererView = (function(_super) {
      __extends(GlyphRendererView, _super);

      function GlyphRendererView() {
        _ref = GlyphRendererView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      GlyphRendererView.prototype.initialize = function(options) {
        var nonselection_glyph, selection_glyph;
        GlyphRendererView.__super__.initialize.call(this, options);
        this.glyph = this.build_glyph(this.mget("glyph"));
        selection_glyph = this.mget("selection_glyph");
        if (selection_glyph == null) {
          selection_glyph = this.mget("glyph").clone();
          selection_glyph.set(this.model.selection_defaults, {
            silent: true
          });
        }
        this.selection_glyph = this.build_glyph(selection_glyph);
        nonselection_glyph = this.mget("nonselection_glyph");
        if (nonselection_glyph == null) {
          nonselection_glyph = this.mget("glyph").clone();
          nonselection_glyph.set(this.model.nonselection_defaults, {
            silent: true
          });
        }
        this.nonselection_glyph = this.build_glyph(nonselection_glyph);
        this.need_set_data = true;
        this.xmapper = this.plot_view.frame.get('x_mappers')[this.mget("x_range_name")];
        this.ymapper = this.plot_view.frame.get('y_mappers')[this.mget("y_range_name")];
        if (this.mget('data_source') instanceof RemoteDataSource.RemoteDataSource) {
          return this.mget('data_source').setup(this.plot_view, this.glyph);
        }
      };

      GlyphRendererView.prototype.build_glyph = function(model) {
        return new model.default_view({
          model: model,
          renderer: this
        });
      };

      GlyphRendererView.prototype.bind_bokeh_events = function() {
        this.listenTo(this.model, 'change', this.request_render);
        this.listenTo(this.mget('data_source'), 'change', this.set_data);
        return this.listenTo(this.mget('data_source'), 'select', this.request_render);
      };

      GlyphRendererView.prototype.have_selection_glyphs = function() {
        return true;
      };

      GlyphRendererView.prototype.setup_server_data = function() {};

      GlyphRendererView.prototype.set_data = function(request_render) {
        var dt, source, t0;
        if (request_render == null) {
          request_render = true;
        }
        source = this.mget('data_source');
        t0 = Date.now();
        this.all_indices = this.glyph.set_data(source);
        this.selection_glyph.set_data(source);
        this.nonselection_glyph.set_data(source);
        dt = Date.now() - t0;
        logger.debug("" + this.glyph.model.type + " glyph (" + this.glyph.model.id + "): set_data finished in " + dt + "ms");
        this.have_new_data = true;
        if (request_render) {
          return this.request_render();
        }
      };

      GlyphRendererView.prototype.render = function() {
        var ctx, do_render, dt, i, idx, indices, nonselected, selected, selected_indices, selected_mask, selection, t0, _i, _j, _len, _len1,
          _this = this;
        if (this.need_set_data) {
          this.set_data(false);
          this.need_set_data = false;
        }
        this.glyph._map_data();
        this.selection_glyph._map_data();
        this.nonselection_glyph._map_data();
        if ((this._mask_data != null) && !(this.plot_view.x_range instanceof FactorRange.Model) && !(this.plot_view.y_range instanceof FactorRange.Model)) {
          indices = this._mask_data();
        } else {
          indices = this.all_indices;
        }
        ctx = this.plot_view.canvas_view.ctx;
        ctx.save();
        do_render = function(ctx, indices, glyph) {
          if (_this.have_new_data) {
            glyph.update_data(_this.mget('data_source'));
          }
          return glyph.render(ctx, indices);
        };
        selection = this.mget('data_source').get('selected');
        if ((selection != null) && selection.length > 0) {
          selected_indices = selection;
        } else {
          selected_indices = [];
        }
        t0 = Date.now();
        if (!(selected_indices && selected_indices.length && this.have_selection_glyphs())) {
          do_render(ctx, indices, this.glyph);
        } else {
          selected_mask = (function() {
            var _i, _len, _ref1, _results;
            _ref1 = this.all_indices;
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              i = _ref1[_i];
              _results.push(false);
            }
            return _results;
          }).call(this);
          for (_i = 0, _len = selected_indices.length; _i < _len; _i++) {
            idx = selected_indices[_i];
            selected_mask[idx] = true;
          }
          selected = new Array();
          nonselected = new Array();
          for (_j = 0, _len1 = indices.length; _j < _len1; _j++) {
            i = indices[_j];
            if (selected_mask[i]) {
              selected.push(i);
            } else {
              nonselected.push(i);
            }
          }
          do_render(ctx, selected, this.selection_glyph);
          do_render(ctx, nonselected, this.nonselection_glyph);
        }
        dt = Date.now() - t0;
        logger.trace("" + this.glyph.model.type + " glyph (" + this.glyph.model.id + "): do_render calls finished in " + dt + "ms");
        this.have_new_data = false;
        return ctx.restore();
      };

      GlyphRendererView.prototype.xrange = function() {
        return this.plot_view.x_range;
      };

      GlyphRendererView.prototype.yrange = function() {
        return this.plot_view.y_range;
      };

      GlyphRendererView.prototype.map_to_screen = function(x, x_units, y, y_units) {
        return this.plot_view.map_to_screen(x, x_units, y, y_units, this.mget("x_range_name"), this.mget("y_range_name"));
      };

      GlyphRendererView.prototype.draw_legend = function(ctx, x0, x1, y0, y1) {
        return this.glyph.draw_legend(ctx, x0, x1, y0, y1);
      };

      GlyphRendererView.prototype.hit_test = function(geometry) {
        return this.glyph.hit_test(geometry);
      };

      return GlyphRendererView;

    })(PlotWidget);
    GlyphRenderer = (function(_super) {
      __extends(GlyphRenderer, _super);

      function GlyphRenderer() {
        _ref1 = GlyphRenderer.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      GlyphRenderer.prototype.default_view = GlyphRendererView;

      GlyphRenderer.prototype.type = 'GlyphRenderer';

      GlyphRenderer.prototype.selection_defaults = {};

      GlyphRenderer.prototype.nonselection_defaults = {
        fill_alpha: 0.1,
        line_alpha: 0.1
      };

      GlyphRenderer.prototype.defaults = function() {
        return _.extend({}, GlyphRenderer.__super__.defaults.call(this), {
          x_range_name: "default",
          y_range_name: "default",
          data_source: null
        });
      };

      GlyphRenderer.prototype.display_defaults = function() {
        return _.extend({}, GlyphRenderer.__super__.display_defaults.call(this), {
          level: 'glyph'
        });
      };

      return GlyphRenderer;

    })(HasParent);
    GlyphRenderers = (function(_super) {
      __extends(GlyphRenderers, _super);

      function GlyphRenderers() {
        _ref2 = GlyphRenderers.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      GlyphRenderers.prototype.model = GlyphRenderer;

      return GlyphRenderers;

    })(Collection);
    return {
      Model: GlyphRenderer,
      View: GlyphRendererView,
      Collection: new GlyphRenderers()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=glyph_renderer.js.map
*/