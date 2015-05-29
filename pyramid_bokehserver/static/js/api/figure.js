(function() {
  define(["common/base", "common/logging", "range/factor_range", "range/range1d", "source/column_data_source", "./helpers"], function(base, Logging, FactorRange, Range1d, ColumnDataSource) {
    var Collections, add_annotations, add_glyphs, add_guides, add_tools, figure, logger, make_plot, make_sources, _get_axis_type, _get_num_minor_ticks, _get_range, _get_sources, _process_annotations, _process_glyphs, _process_guides, _process_tools;
    Collections = base.Collections;
    logger = Logging.logger;
    _get_num_minor_ticks = function(axis_type, num_minor_ticks) {
      if (num_minor_ticks == null) {
        return 0;
      }
      if (_.isNumber(num_minor_ticks)) {
        if (num_minor_ticks <= 1) {
          logger.error("num_minor_ticks must be > 1");
          num_minor_ticks = 0;
        }
        return num_minor_ticks;
      }
      if (num_minor_ticks === 'auto') {
        if ((axis_type != null) === "Log") {
          return 10;
        }
        return 5;
      }
      logger.error("unrecognized num_minor_ticks: " + num_minor_ticks);
      return 0;
    };
    _get_axis_type = function(axis_type, range) {
      var e;
      if (axis_type == null) {
        return null;
      }
      if (axis_type === "auto") {
        if (range instanceof FactorRange.Model) {
          return Collections("CategoricalAxis");
        } else if (range instanceof Range1d.Model) {
          try {
            new Date.parse(range.get('start'));
            return Collections("DatetimeAxis");
          } catch (_error) {
            e = _error;
            "pass";
          }
          return Collections("LinearAxis");
        }
      }
      try {
        return Collections(axis_type + "Axis");
      } catch (_error) {
        e = _error;
        logger.error("unrecognized axis_type: " + axis_type);
        return null;
      }
    };
    _get_range = function(range) {
      if (range == null) {
        return Collections("DataRange1d").create();
      }
      if (_.isArray(range)) {
        if (_.every(range, _.isString)) {
          return Collections("FactorRange").create({
            factors: range
          });
        }
        if (range.length === 2 && _.every(range, _.isNumber)) {
          return Collections("Range1d").create({
            start: range[0],
            end: range[1]
          });
        }
      }
      logger.error("Unrecognized range input: " + range.toJSON);
      return null;
    };
    _get_sources = function(sources, glyph_source) {
      if (glyph_source instanceof ColumnDataSource.Model) {
        return glyph_source;
      }
      if (_.isString(glyph_source)) {
        return sources[glyph_source];
      }
      return Collections("ColumnDataSource").create({
        data: glyph_source
      });
    };
    _process_annotations = function(annotations) {
      var annotation_objs;
      annotation_objs = [];
      return annotation_objs;
    };
    _process_tools = function(tools) {
      var e, tool, tool_args, tool_obj, tool_objs, tool_type, _i, _len;
      tool_objs = [];
      for (_i = 0, _len = tools.length; _i < _len; _i++) {
        tool = tools[_i];
        if (_.isString(tool)) {
          tool_type = tool + "Tool";
          tool_args = {};
        } else {
          tool_type = tool.type + "Tool";
          tool_args = _.omit(tool, "type");
        }
        try {
          tool_obj = Collections(tool_type).create(tool_args);
          tool_objs.push(tool_obj);
        } catch (_error) {
          e = _error;
          logger.error("unrecognized tool: " + tool);
        }
      }
      return tool_objs;
    };
    _process_glyphs = function(glyphs, sources) {
      var glyph, glyph_args, glyph_obj, glyph_type, renderer, renderer_args, renderers, source, x, x_args, x_obj, _i, _j, _len, _len1, _ref;
      renderers = [];
      for (_i = 0, _len = glyphs.length; _i < _len; _i++) {
        glyph = glyphs[_i];
        glyph_type = glyph.type;
        source = _get_sources(sources, glyph.source);
        glyph_args = _.omit(glyph, 'source', 'selection', 'inspection', 'nonselection');
        glyph_obj = Collections(glyph_type).create(glyph_args);
        renderer_args = {
          data_source: source,
          glyph: glyph_obj
        };
        _ref = ['selection', 'inspection', 'nonselection'];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          x = _ref[_j];
          if (glyph[x] != null) {
            if (glyph[x].type != null) {
              x_args = _.omit(glyph[x], 'type');
              x_obj = Collections(glyph[x].type).create(x_args);
            } else {
              x_obj = _.clone(glyph_obj);
              x_obj.set(glyph[x]);
            }
            renderer_args[x] = x_obj;
          }
        }
        renderer = Collections("GlyphRenderer").create(renderer_args);
        renderers.push(renderer);
      }
      return renderers;
    };
    _process_guides = function(guides, plot) {
      var axis, axis_args, axis_type, dim, grid, guide, guide_objs, location, range, _i, _len;
      guide_objs = [];
      for (_i = 0, _len = guides.length; _i < _len; _i++) {
        guide = guides[_i];
        location = guide.location;
        if (location === "below" || location === "above") {
          dim = 0;
          range = plot.get('x_range');
        } else if (location === "left" || location === "right") {
          dim = 1;
          range = plot.get('y_range');
        } else {
          logger.error("unrecognized axis location: " + location);
          continue;
        }
        axis_type = _get_axis_type(guide.type, range);
        axis_args = _.omit(guide, 'type', 'grid');
        axis_args['plot'] = plot;
        axis = axis_type.create(axis_args);
        guide_objs.push(axis);
        if (guide.grid === true) {
          grid = Collections("Grid").create({
            dimension: dim,
            plot: plot,
            ticker: axis.get('ticker')
          });
          guide_objs.push(grid);
        }
      }
      return guide_objs;
    };
    make_plot = function(options) {
      var plot;
      options.x_range = _get_range(options.x_range);
      options.y_range = _get_range(options.y_range);
      plot = Collections('Plot').create(options);
      return plot;
    };
    make_sources = function(data) {
      var key, source_objs, value;
      source_objs = {};
      for (key in data) {
        value = data[key];
        source_objs[key] = Collections("ColumnDataSource").create({
          data: value
        });
      }
      return source_objs;
    };
    add_glyphs = function(plot, sources, glyphs) {
      glyphs = _process_glyphs(glyphs, sources);
      return plot.add_renderers(glyphs);
    };
    add_guides = function(plot, guides) {
      var guide, loc, location, _i, _len;
      guides = _process_guides(guides, plot);
      for (_i = 0, _len = guides.length; _i < _len; _i++) {
        guide = guides[_i];
        location = guide.get('location');
        if (location != null) {
          loc = plot.get(location);
          loc.push(guide);
          plot.set(location, loc);
        }
      }
      return plot.add_renderers(guides);
    };
    add_annotations = function(plot, annotations) {
      annotations = _process_annotations(annotations);
      return plot.add_renderers(annotations);
    };
    add_tools = function(plot, tools) {
      var tool, _i, _len;
      tools = _process_tools(tools, plot);
      for (_i = 0, _len = tools.length; _i < _len; _i++) {
        tool = tools[_i];
        tool.set('plot', plot);
      }
      plot.set_obj('tools', tools);
      plot.get('tool_manager').set_obj('tools', tools);
      return plot.get('tool_manager')._init_tools();
    };
    return figure = function(_arg) {
      var annotations, glyphs, guides, options, plot, sources, tools;
      options = _arg.options, sources = _arg.sources, glyphs = _arg.glyphs, guides = _arg.guides, annotations = _arg.annotations, tools = _arg.tools;
      if (options == null) {
        options = {};
      }
      if (sources == null) {
        sources = {};
      }
      if (glyphs == null) {
        glyphs = [];
      }
      if (guides == null) {
        guides = [];
      }
      if (annotations == null) {
        annotations = {};
      }
      if (tools == null) {
        tools = [];
      }
      plot = make_plot(options);
      sources = make_sources(sources);
      add_glyphs(plot, sources, glyphs);
      add_guides(plot, guides);
      add_annotations(plot, annotations);
      add_tools(plot, tools);
      return plot;
    };
  });

}).call(this);

/*
//@ sourceMappingURL=figure.js.map
*/