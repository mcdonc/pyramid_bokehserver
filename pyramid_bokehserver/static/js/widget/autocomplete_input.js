(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["jquery_ui/autocomplete", "common/collection", "./text_input"], function($1, Collection, TextInput) {
    var AutocompleteInput, AutocompleteInputView, AutocompleteInputs, _ref, _ref1, _ref2;
    AutocompleteInputView = (function(_super) {
      __extends(AutocompleteInputView, _super);

      function AutocompleteInputView() {
        _ref = AutocompleteInputView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      AutocompleteInputView.prototype.render = function() {
        var $input;
        AutocompleteInputView.__super__.render.call(this);
        $input = this.$el.find("input");
        $input.autocomplete({
          source: this.mget("completions")
        });
        return $input.autocomplete("widget").addClass("bk-autocomplete-input");
      };

      return AutocompleteInputView;

    })(TextInput.View);
    AutocompleteInput = (function(_super) {
      __extends(AutocompleteInput, _super);

      function AutocompleteInput() {
        _ref1 = AutocompleteInput.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      AutocompleteInput.prototype.type = "AutocompleteInput";

      AutocompleteInput.prototype.default_view = AutocompleteInputView;

      AutocompleteInput.prototype.defaults = function() {
        return _.extend({}, AutocompleteInput.__super__.defaults.call(this), {
          completions: []
        });
      };

      return AutocompleteInput;

    })(TextInput.Model);
    AutocompleteInputs = (function(_super) {
      __extends(AutocompleteInputs, _super);

      function AutocompleteInputs() {
        _ref2 = AutocompleteInputs.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      AutocompleteInputs.prototype.model = AutocompleteInput;

      return AutocompleteInputs;

    })(Collection);
    return {
      View: AutocompleteInputView,
      Model: AutocompleteInput,
      Collection: new AutocompleteInputs()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=autocomplete_input.js.map
*/