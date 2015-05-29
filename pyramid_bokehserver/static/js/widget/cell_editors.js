(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "jquery", "common/has_properties", "common/collection", "common/continuum_view", "jquery_ui/autocomplete", "jquery_ui/spinner"], function(_, $, HasProperties, Collection, ContinuumView) {
    var CellEditor, CellEditorCollection, CellEditorView, CheckboxEditor, CheckboxEditorView, CheckboxEditors, DateEditor, DateEditorView, DateEditors, IntEditor, IntEditorView, IntEditors, NumberEditor, NumberEditorView, NumberEditors, PercentEditor, PercentEditorView, PercentEditors, SelectEditor, SelectEditorView, SelectEditors, StringEditor, StringEditorView, StringEditors, TextEditor, TextEditorView, TextEditors, TimeEditor, TimeEditorView, TimeEditors, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    CellEditor = (function(_super) {
      __extends(CellEditor, _super);

      function CellEditor() {
        _ref = CellEditor.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CellEditor.prototype.editorDefaults = {};

      CellEditor.prototype.defaults = function() {
        return _.extend({}, CellEditor.__super__.defaults.call(this), this.editorDefaults);
      };

      return CellEditor;

    })(HasProperties);
    CellEditorCollection = (function(_super) {
      __extends(CellEditorCollection, _super);

      function CellEditorCollection() {
        _ref1 = CellEditorCollection.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      return CellEditorCollection;

    })(Collection);
    CellEditorView = (function(_super) {
      __extends(CellEditorView, _super);

      function CellEditorView() {
        _ref2 = CellEditorView.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      CellEditorView.prototype.tagName = "div";

      CellEditorView.prototype.className = "bk-cell-editor";

      CellEditorView.prototype.input = null;

      CellEditorView.prototype.emptyValue = null;

      CellEditorView.prototype.defaultValue = null;

      CellEditorView.prototype.initialize = function(args) {
        CellEditorView.__super__.initialize.call(this, {});
        this.args = args;
        this.model = this.args.column.editor;
        return this.render();
      };

      CellEditorView.prototype.render = function() {
        this.$el.appendTo(this.args.container);
        this.$input = $(this.input);
        this.$el.append(this.$input);
        this.renderEditor();
        return this.disableNavigation();
      };

      CellEditorView.prototype.renderEditor = function() {};

      CellEditorView.prototype.disableNavigation = function() {
        var _this = this;
        return this.$input.keydown(function(event) {
          var stop;
          stop = function() {
            return event.stopImmediatePropagation();
          };
          switch (event.keyCode) {
            case $.ui.keyCode.LEFT:
              return stop();
            case $.ui.keyCode.RIGHT:
              return stop();
            case $.ui.keyCode.UP:
              return stop();
            case $.ui.keyCode.DOWN:
              return stop();
            case $.ui.keyCode.PAGE_UP:
              return stop();
            case $.ui.keyCode.PAGE_DOWN:
              return stop();
          }
        });
      };

      CellEditorView.prototype.destroy = function() {
        return this.remove();
      };

      CellEditorView.prototype.focus = function() {
        return this.$input.focus();
      };

      CellEditorView.prototype.show = function() {};

      CellEditorView.prototype.hide = function() {};

      CellEditorView.prototype.position = function() {};

      CellEditorView.prototype.getValue = function() {
        return this.$input.val();
      };

      CellEditorView.prototype.setValue = function(val) {
        return this.$input.val(val);
      };

      CellEditorView.prototype.serializeValue = function() {
        return this.getValue();
      };

      CellEditorView.prototype.isValueChanged = function() {
        return !(this.getValue() === "" && (this.defaultValue == null)) && (this.getValue() !== this.defaultValue);
      };

      CellEditorView.prototype.applyValue = function(item, state) {
        return this.args.grid.getData().setField(item.index, this.args.column.field, state);
      };

      CellEditorView.prototype.loadValue = function(item) {
        var value;
        value = item[this.args.column.field];
        this.defaultValue = value != null ? value : this.emptyValue;
        return this.setValue(this.defaultValue);
      };

      CellEditorView.prototype.validateValue = function(value) {
        var result;
        if (this.args.column.validator) {
          result = this.args.column.validator(value);
          if (!result.valid) {
            return result;
          }
        }
        return {
          valid: true,
          msg: null
        };
      };

      CellEditorView.prototype.validate = function() {
        return this.validateValue(this.getValue());
      };

      return CellEditorView;

    })(ContinuumView);
    StringEditorView = (function(_super) {
      __extends(StringEditorView, _super);

      function StringEditorView() {
        _ref3 = StringEditorView.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      StringEditorView.prototype.emptyValue = "";

      StringEditorView.prototype.input = '<input type="text" />';

      StringEditorView.prototype.renderEditor = function() {
        var completions;
        completions = this.model.get("completions");
        if (!_.isEmpty(completions)) {
          this.$input.autocomplete({
            source: completions
          });
          this.$input.autocomplete("widget").addClass("bk-cell-editor-completion");
        }
        return this.$input.focus().select();
      };

      StringEditorView.prototype.loadValue = function(item) {
        StringEditorView.__super__.loadValue.call(this, item);
        this.$input[0].defaultValue = this.defaultValue;
        return this.$input.select();
      };

      return StringEditorView;

    })(CellEditorView);
    StringEditor = (function(_super) {
      __extends(StringEditor, _super);

      function StringEditor() {
        _ref4 = StringEditor.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      StringEditor.prototype.type = 'StringEditor';

      StringEditor.prototype.default_view = StringEditorView;

      StringEditor.prototype.editorDefaults = {
        completions: []
      };

      return StringEditor;

    })(CellEditor);
    StringEditors = (function(_super) {
      __extends(StringEditors, _super);

      function StringEditors() {
        _ref5 = StringEditors.__super__.constructor.apply(this, arguments);
        return _ref5;
      }

      StringEditors.prototype.model = StringEditor;

      return StringEditors;

    })(CellEditorCollection);
    TextEditorView = (function(_super) {
      __extends(TextEditorView, _super);

      function TextEditorView() {
        _ref6 = TextEditorView.__super__.constructor.apply(this, arguments);
        return _ref6;
      }

      return TextEditorView;

    })(CellEditorView);
    TextEditor = (function(_super) {
      __extends(TextEditor, _super);

      function TextEditor() {
        _ref7 = TextEditor.__super__.constructor.apply(this, arguments);
        return _ref7;
      }

      TextEditor.prototype.type = 'TextEditor';

      TextEditor.prototype.default_view = TextEditorView;

      return TextEditor;

    })(CellEditor);
    TextEditors = (function(_super) {
      __extends(TextEditors, _super);

      function TextEditors() {
        _ref8 = TextEditors.__super__.constructor.apply(this, arguments);
        return _ref8;
      }

      TextEditors.prototype.model = TextEditor;

      return TextEditors;

    })(CellEditorCollection);
    SelectEditorView = (function(_super) {
      __extends(SelectEditorView, _super);

      function SelectEditorView() {
        _ref9 = SelectEditorView.__super__.constructor.apply(this, arguments);
        return _ref9;
      }

      SelectEditorView.prototype.input = '<select />';

      SelectEditorView.prototype.renderEditor = function() {
        var option, _i, _len, _ref10;
        _ref10 = this.model.get("options");
        for (_i = 0, _len = _ref10.length; _i < _len; _i++) {
          option = _ref10[_i];
          this.$input.append($('<option>').attr({
            value: option
          }).text(option));
        }
        return this.focus();
      };

      SelectEditorView.prototype.loadValue = function(item) {
        SelectEditorView.__super__.loadValue.call(this, item);
        return this.$input.select();
      };

      return SelectEditorView;

    })(CellEditorView);
    SelectEditor = (function(_super) {
      __extends(SelectEditor, _super);

      function SelectEditor() {
        _ref10 = SelectEditor.__super__.constructor.apply(this, arguments);
        return _ref10;
      }

      SelectEditor.prototype.type = 'SelectEditor';

      SelectEditor.prototype.default_view = SelectEditorView;

      SelectEditor.prototype.editorDefaults = {
        options: []
      };

      return SelectEditor;

    })(CellEditor);
    SelectEditors = (function(_super) {
      __extends(SelectEditors, _super);

      function SelectEditors() {
        _ref11 = SelectEditors.__super__.constructor.apply(this, arguments);
        return _ref11;
      }

      SelectEditors.prototype.model = SelectEditor;

      return SelectEditors;

    })(CellEditorCollection);
    PercentEditorView = (function(_super) {
      __extends(PercentEditorView, _super);

      function PercentEditorView() {
        _ref12 = PercentEditorView.__super__.constructor.apply(this, arguments);
        return _ref12;
      }

      return PercentEditorView;

    })(CellEditorView);
    PercentEditor = (function(_super) {
      __extends(PercentEditor, _super);

      function PercentEditor() {
        _ref13 = PercentEditor.__super__.constructor.apply(this, arguments);
        return _ref13;
      }

      PercentEditor.prototype.type = 'PercentEditor';

      PercentEditor.prototype.default_view = PercentEditorView;

      return PercentEditor;

    })(CellEditor);
    PercentEditors = (function(_super) {
      __extends(PercentEditors, _super);

      function PercentEditors() {
        _ref14 = PercentEditors.__super__.constructor.apply(this, arguments);
        return _ref14;
      }

      PercentEditors.prototype.model = PercentEditor;

      return PercentEditors;

    })(CellEditorCollection);
    CheckboxEditorView = (function(_super) {
      __extends(CheckboxEditorView, _super);

      function CheckboxEditorView() {
        _ref15 = CheckboxEditorView.__super__.constructor.apply(this, arguments);
        return _ref15;
      }

      CheckboxEditorView.prototype.input = '<input type="checkbox" value="true" />';

      CheckboxEditorView.prototype.renderEditor = function() {
        return this.focus();
      };

      CheckboxEditorView.prototype.loadValue = function(item) {
        this.defaultValue = !!item[this.args.column.field];
        return this.$input.prop('checked', this.defaultValue);
      };

      CheckboxEditorView.prototype.serializeValue = function() {
        return this.$input.prop('checked');
      };

      return CheckboxEditorView;

    })(CellEditorView);
    CheckboxEditor = (function(_super) {
      __extends(CheckboxEditor, _super);

      function CheckboxEditor() {
        _ref16 = CheckboxEditor.__super__.constructor.apply(this, arguments);
        return _ref16;
      }

      CheckboxEditor.prototype.type = 'CheckboxEditor';

      CheckboxEditor.prototype.default_view = CheckboxEditorView;

      return CheckboxEditor;

    })(CellEditor);
    CheckboxEditors = (function(_super) {
      __extends(CheckboxEditors, _super);

      function CheckboxEditors() {
        _ref17 = CheckboxEditors.__super__.constructor.apply(this, arguments);
        return _ref17;
      }

      CheckboxEditors.prototype.model = CheckboxEditor;

      return CheckboxEditors;

    })(CellEditorCollection);
    IntEditorView = (function(_super) {
      __extends(IntEditorView, _super);

      function IntEditorView() {
        _ref18 = IntEditorView.__super__.constructor.apply(this, arguments);
        return _ref18;
      }

      IntEditorView.prototype.input = '<input type="text" />';

      IntEditorView.prototype.renderEditor = function() {
        this.$input.spinner({
          step: this.model.get("step")
        });
        return this.$input.focus().select();
      };

      IntEditorView.prototype.remove = function() {
        this.$input.spinner("destroy");
        return IntEditorView.__super__.remove.call(this);
      };

      IntEditorView.prototype.serializeValue = function() {
        return parseInt(this.getValue(), 10) || 0;
      };

      IntEditorView.prototype.loadValue = function(item) {
        IntEditorView.__super__.loadValue.call(this, item);
        this.$input[0].defaultValue = this.defaultValue;
        return this.$input.select();
      };

      IntEditorView.prototype.validateValue = function(value) {
        if (isNaN(value)) {
          return {
            valid: false,
            msg: "Please enter a valid integer"
          };
        } else {
          return IntEditorView.__super__.validateValue.call(this, value);
        }
      };

      return IntEditorView;

    })(CellEditorView);
    IntEditor = (function(_super) {
      __extends(IntEditor, _super);

      function IntEditor() {
        _ref19 = IntEditor.__super__.constructor.apply(this, arguments);
        return _ref19;
      }

      IntEditor.prototype.type = 'IntEditor';

      IntEditor.prototype.default_view = IntEditorView;

      IntEditor.prototype.editorDefaults = {
        step: 1
      };

      return IntEditor;

    })(CellEditor);
    IntEditors = (function(_super) {
      __extends(IntEditors, _super);

      function IntEditors() {
        _ref20 = IntEditors.__super__.constructor.apply(this, arguments);
        return _ref20;
      }

      IntEditors.prototype.model = IntEditor;

      return IntEditors;

    })(CellEditorCollection);
    NumberEditorView = (function(_super) {
      __extends(NumberEditorView, _super);

      function NumberEditorView() {
        _ref21 = NumberEditorView.__super__.constructor.apply(this, arguments);
        return _ref21;
      }

      NumberEditorView.prototype.input = '<input type="text" />';

      NumberEditorView.prototype.renderEditor = function() {
        this.$input.spinner({
          step: this.model.get("step")
        });
        return this.$input.focus().select();
      };

      NumberEditorView.prototype.remove = function() {
        this.$input.spinner("destroy");
        return NumberEditorView.__super__.remove.call(this);
      };

      NumberEditorView.prototype.serializeValue = function() {
        return parseFloat(this.getValue()) || 0.0;
      };

      NumberEditorView.prototype.loadValue = function(item) {
        NumberEditorView.__super__.loadValue.call(this, item);
        this.$input[0].defaultValue = this.defaultValue;
        return this.$input.select();
      };

      NumberEditorView.prototype.validateValue = function(value) {
        if (isNaN(value)) {
          return {
            valid: false,
            msg: "Please enter a valid number"
          };
        } else {
          return NumberEditorView.__super__.validateValue.call(this, value);
        }
      };

      return NumberEditorView;

    })(CellEditorView);
    NumberEditor = (function(_super) {
      __extends(NumberEditor, _super);

      function NumberEditor() {
        _ref22 = NumberEditor.__super__.constructor.apply(this, arguments);
        return _ref22;
      }

      NumberEditor.prototype.type = 'NumberEditor';

      NumberEditor.prototype.default_view = NumberEditorView;

      NumberEditor.prototype.editorDefaults = {
        step: 0.01
      };

      return NumberEditor;

    })(CellEditor);
    NumberEditors = (function(_super) {
      __extends(NumberEditors, _super);

      function NumberEditors() {
        _ref23 = NumberEditors.__super__.constructor.apply(this, arguments);
        return _ref23;
      }

      NumberEditors.prototype.model = NumberEditor;

      return NumberEditors;

    })(CellEditorCollection);
    TimeEditorView = (function(_super) {
      __extends(TimeEditorView, _super);

      function TimeEditorView() {
        _ref24 = TimeEditorView.__super__.constructor.apply(this, arguments);
        return _ref24;
      }

      return TimeEditorView;

    })(CellEditorView);
    TimeEditor = (function(_super) {
      __extends(TimeEditor, _super);

      function TimeEditor() {
        _ref25 = TimeEditor.__super__.constructor.apply(this, arguments);
        return _ref25;
      }

      TimeEditor.prototype.type = 'TimeEditor';

      TimeEditor.prototype.default_view = TimeEditorView;

      return TimeEditor;

    })(CellEditor);
    TimeEditors = (function(_super) {
      __extends(TimeEditors, _super);

      function TimeEditors() {
        _ref26 = TimeEditors.__super__.constructor.apply(this, arguments);
        return _ref26;
      }

      TimeEditors.prototype.model = TimeEditor;

      return TimeEditors;

    })(CellEditorCollection);
    DateEditorView = (function(_super) {
      __extends(DateEditorView, _super);

      function DateEditorView() {
        _ref27 = DateEditorView.__super__.constructor.apply(this, arguments);
        return _ref27;
      }

      DateEditorView.prototype.emptyValue = new Date();

      DateEditorView.prototype.input = '<input type="text" />';

      DateEditorView.prototype.renderEditor = function() {
        var _this = this;
        this.calendarOpen = false;
        this.$input.datepicker({
          showOn: "button",
          buttonImageOnly: true,
          beforeShow: function() {
            return _this.calendarOpen = true;
          },
          onClose: function() {
            return _this.calendarOpen = false;
          }
        });
        this.$input.siblings(".bk-ui-datepicker-trigger").css({
          "vertical-align": "middle"
        });
        this.$input.width(this.$input.width() - (14 + 2 * 4 + 4));
        return this.$input.focus().select();
      };

      DateEditorView.prototype.destroy = function() {
        $.datepicker.dpDiv.stop(true, true);
        this.$input.datepicker("hide");
        this.$input.datepicker("destroy");
        return DateEditorView.__super__.destroy.call(this);
      };

      DateEditorView.prototype.show = function() {
        if (this.calendarOpen) {
          $.datepicker.dpDiv.stop(true, true).show();
        }
        return DateEditorView.__super__.show.call(this);
      };

      DateEditorView.prototype.hide = function() {
        if (this.calendarOpen) {
          $.datepicker.dpDiv.stop(true, true).hide();
        }
        return DateEditorView.__super__.hide.call(this);
      };

      DateEditorView.prototype.position = function(position) {
        if (this.calendarOpen) {
          $.datepicker.dpDiv.css({
            top: position.top + 30,
            left: position.left
          });
        }
        return DateEditorView.__super__.position.call(this);
      };

      DateEditorView.prototype.getValue = function() {
        return this.$input.datepicker("getDate").getTime();
      };

      DateEditorView.prototype.setValue = function(val) {
        return this.$input.datepicker("setDate", new Date(val));
      };

      return DateEditorView;

    })(CellEditorView);
    DateEditor = (function(_super) {
      __extends(DateEditor, _super);

      function DateEditor() {
        _ref28 = DateEditor.__super__.constructor.apply(this, arguments);
        return _ref28;
      }

      DateEditor.prototype.type = 'DateEditor';

      DateEditor.prototype.default_view = DateEditorView;

      return DateEditor;

    })(CellEditor);
    DateEditors = (function(_super) {
      __extends(DateEditors, _super);

      function DateEditors() {
        _ref29 = DateEditors.__super__.constructor.apply(this, arguments);
        return _ref29;
      }

      DateEditors.prototype.model = DateEditor;

      return DateEditors;

    })(CellEditorCollection);
    return {
      String: {
        Model: StringEditor,
        Collection: new StringEditors(),
        View: StringEditorView
      },
      Text: {
        Model: TextEditor,
        Collection: new TextEditors(),
        View: TextEditorView
      },
      Select: {
        Model: SelectEditor,
        Collection: new SelectEditors(),
        View: SelectEditorView
      },
      Percent: {
        Model: PercentEditor,
        Collection: new PercentEditors(),
        View: PercentEditorView
      },
      Checkbox: {
        Model: CheckboxEditor,
        Collection: new CheckboxEditors(),
        View: CheckboxEditorView
      },
      Int: {
        Model: IntEditor,
        Collection: new IntEditors(),
        View: IntEditorView
      },
      Number: {
        Model: NumberEditor,
        Collection: new NumberEditors(),
        View: NumberEditorView
      },
      Time: {
        Model: TimeEditor,
        Collection: new TimeEditors(),
        View: TimeEditorView
      },
      Date: {
        Model: DateEditor,
        Collection: new DateEditors(),
        View: DateEditorView
      }
    };
  });

}).call(this);

/*
//@ sourceMappingURL=cell_editors.js.map
*/