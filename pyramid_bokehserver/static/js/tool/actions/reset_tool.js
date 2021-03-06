(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "common/collection", "./action_tool"], function(_, Collection, ActionTool) {
    var ResetTool, ResetToolView, ResetTools, _ref, _ref1, _ref2;
    ResetToolView = (function(_super) {
      __extends(ResetToolView, _super);

      function ResetToolView() {
        _ref = ResetToolView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ResetToolView.prototype["do"] = function() {
        return this.plot_view.update_range();
      };

      return ResetToolView;

    })(ActionTool.View);
    ResetTool = (function(_super) {
      __extends(ResetTool, _super);

      function ResetTool() {
        _ref1 = ResetTool.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      ResetTool.prototype.default_view = ResetToolView;

      ResetTool.prototype.type = "ResetTool";

      ResetTool.prototype.tool_name = "Reset";

      ResetTool.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAgCAYAAABgrToAAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCRTI5MDhFMDIwQjUxMUU0ODREQUYzNzM5QTM2MjBCRSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoyOUMzNDE3NDIwQkIxMUU0ODREQUYzNzM5QTM2MjBCRSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkJFMjkwOERFMjBCNTExRTQ4NERBRjM3MzlBMzYyMEJFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkJFMjkwOERGMjBCNTExRTQ4NERBRjM3MzlBMzYyMEJFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+kFHGtQAAAm1JREFUeNrMmE9ExFEQx3+7ZYmlLrEsUUTHaEV0iESJVqduXaJr1xKlFB1bdYqoQ9GlFBFdikgpIhLd0rLqUsQqrW2G7+YZr+2993vaHT6H3583M795897M+0U2t3cCR6kh+kA3rtvx7IYoEGfEMSi4GIk4OJgg5ogRot5wzBvBhmaJnI2xqMW7dcQC8UCMWzgX4N1xjF2ALq8OctROiGkiHrhLHDpOoNOLg5xXF0Sn5lmWWCUGiBRRC1K4t4p3pLCuKyVnnXMwAUVJcT+HfFo3SH5ePGPI24TmA1Pl8rJcBGPEvsa5I6KVWDNcmQW824qxqiRhI+bi4IxmWjOYuneH/HvH2Ixmumd8bjNhhad8lxgSzrfp8jUa/L/wlI8KZ3h1T4bdB30Kb9zz4t6YbgurlIMBdoBHUQiGTBx8JYoKPqVe0ftFNInnW8J20SSCjRWM8k8E1S+TNfbZYyQ59yJEg0kjw1QyB42k1iI6ReXLfEWSK8iHJnJVsYqN8jtammuFc/FOr3juU7Ia+39uM7fiuq8aVrEqp+J6BPWzahw8IPLKdTPKUNU4yJ3Fhqb1inu0y7qeRNVYsWkWFkXPl0QZ8iVbohFmW0s2DmY1jSUX8mUPzi1rmoLML2eXsvsgR/FO3JtAix53nNZ96FDlDrasW35eKGniRRPJeywck9VdOjTdayL3Ahv5MC1/xy+Hp1Iq7BGHMHatjOEqMUgMlxmbVsaEOpMk4GSnp0VyCedyLtuMTlhRD1ZaPoRjeejoMf1HE7VUPkW04Jz7Ztm9rGHslM1Hhjl2xlCn+4muQP/77RyHdf799uli5FuAAQC+l5Sj5nEBdwAAAABJRU5ErkJggg==";

      return ResetTool;

    })(ActionTool.Model);
    ResetTools = (function(_super) {
      __extends(ResetTools, _super);

      function ResetTools() {
        _ref2 = ResetTools.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      ResetTools.prototype.model = ResetTool;

      return ResetTools;

    })(Collection);
    return {
      "Model": ResetTool,
      "Collection": new ResetTools(),
      "View": ResetToolView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=reset_tool.js.map
*/