(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "util/util", "common/collection", "common/has_properties"], function(_, Util, Collection, HasProperties) {
    var OpenURL, OpenURLs, _ref, _ref1;
    OpenURL = (function(_super) {
      __extends(OpenURL, _super);

      function OpenURL() {
        _ref = OpenURL.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      OpenURL.prototype.type = 'OpenURL';

      OpenURL.prototype.execute = function(data_source) {
        var i, indices, url, _i, _len, _results;
        indices = data_source.get("selected");
        _results = [];
        for (_i = 0, _len = indices.length; _i < _len; _i++) {
          i = indices[_i];
          url = Util.replace_placeholders(this.get("url"), data_source, i);
          _results.push(window.open(url));
        }
        return _results;
      };

      OpenURL.prototype.defaults = function() {
        return _.extend({}, OpenURL.__super__.defaults.call(this), {
          url: 'http://'
        });
      };

      return OpenURL;

    })(HasProperties);
    OpenURLs = (function(_super) {
      __extends(OpenURLs, _super);

      function OpenURLs() {
        _ref1 = OpenURLs.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      OpenURLs.prototype.model = OpenURL;

      return OpenURLs;

    })(Collection);
    return {
      Model: OpenURL,
      Collection: new OpenURLs()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=open_url.js.map
*/