(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "jquery", "common/continuum_view", "common/has_properties", "common/collection", "util/dom_util", "slick_grid/slick.grid", "slick_grid/plugins/slick.rowselectionmodel", "slick_grid/plugins/slick.checkboxselectcolumn", "jquery_ui/sortable"], function(_, $, ContinuumView, HasProperties, Collection, DOMUtil, SlickGrid, RowSelectionModel, CheckboxSelectColumn, $1) {
    var DataProvider, DataTable, DataTableView, DataTables, _ref, _ref1, _ref2;
    DataProvider = (function() {
      function DataProvider(source) {
        var _i, _ref, _results;
        this.source = source;
        this.data = this.source.get('data');
        this.fields = _.keys(this.data);
        if (!_.contains(this.fields, "index")) {
          this.data["index"] = (function() {
            _results = [];
            for (var _i = 0, _ref = this.getLength(); 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this);
          this.fields.push("index");
        }
      }

      DataProvider.prototype.getLength = function() {
        return this.source.get_length();
      };

      DataProvider.prototype.getItem = function(index) {
        var field, item, _i, _len, _ref;
        item = {
          index: index
        };
        _ref = this.fields;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          field = _ref[_i];
          item[field] = this.data[field][index];
        }
        return item;
      };

      DataProvider.prototype._setItem = function(index, item) {
        var field, value;
        for (field in item) {
          value = item[field];
          this.data[field][index] = value;
        }
      };

      DataProvider.prototype.setItem = function(index, item) {
        this._setItem(index, item);
        return this.updateSource();
      };

      DataProvider.prototype.getField = function(index, field) {
        return this.data[field][index];
      };

      DataProvider.prototype._setField = function(index, field, value) {
        this.data[field][index] = value;
      };

      DataProvider.prototype.setField = function(index, field, value) {
        this._setField(index, field, value);
        return this.updateSource();
      };

      DataProvider.prototype.updateSource = function() {
        return this.source.forceTrigger("data");
      };

      DataProvider.prototype.getItemMetadata = function(index) {
        return null;
      };

      DataProvider.prototype.getRecords = function() {
        var i;
        return (function() {
          var _i, _ref, _results;
          _results = [];
          for (i = _i = 0, _ref = this.getLength(); 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            _results.push(this.getItem(i));
          }
          return _results;
        }).call(this);
      };

      DataProvider.prototype.sort = function(columns) {
        var cols, column, i, record, records, _i, _len;
        cols = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = columns.length; _i < _len; _i++) {
            column = columns[_i];
            _results.push([column.sortCol.field, column.sortAsc ? 1 : -1]);
          }
          return _results;
        })();
        if (_.isEmpty(cols)) {
          cols = [["index", 1]];
        }
        records = this.getRecords();
        records.sort(function(record1, record2) {
          var field, result, sign, value1, value2, _i, _len, _ref;
          for (_i = 0, _len = cols.length; _i < _len; _i++) {
            _ref = cols[_i], field = _ref[0], sign = _ref[1];
            value1 = record1[field];
            value2 = record2[field];
            result = value1 === value2 ? 0 : value1 > value2 ? sign : -sign;
            if (result !== 0) {
              return result;
            }
          }
          return 0;
        });
        for (i = _i = 0, _len = records.length; _i < _len; i = ++_i) {
          record = records[i];
          this._setItem(i, record);
        }
        return this.updateSource();
      };

      return DataProvider;

    })();
    DataTableView = (function(_super) {
      __extends(DataTableView, _super);

      function DataTableView() {
        _ref = DataTableView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      DataTableView.prototype.attributes = {
        "class": "bk-data-table"
      };

      DataTableView.prototype.initialize = function(options) {
        var source,
          _this = this;
        DataTableView.__super__.initialize.call(this, options);
        DOMUtil.waitForElement(this.el, function() {
          return _this.render();
        });
        this.listenTo(this.model, 'change', function() {
          return _this.render();
        });
        source = this.mget("source");
        this.listenTo(source, 'change:data', function() {
          return _this.updateGrid();
        });
        return this.listenTo(source, 'change:selected', function() {
          return _this.updateSelection();
        });
      };

      DataTableView.prototype.updateGrid = function() {
        this.data = new DataProvider(this.mget("source"));
        this.grid.setData(this.data);
        return this.grid.render();
      };

      DataTableView.prototype.updateSelection = function() {
        var selected;
        selected = this.mget("source").get("selected");
        return this.grid.setSelectedRows(selected);
      };

      DataTableView.prototype.newIndexColumn = function() {
        return {
          id: _.uniqueId(),
          name: "#",
          field: "index",
          width: 40,
          behavior: "select",
          cannotTriggerInsert: true,
          resizable: false,
          selectable: false,
          sortable: true,
          cssClass: "bk-cell-index"
        };
      };

      DataTableView.prototype.render = function() {
        var checkboxSelector, column, columns, height, options, width,
          _this = this;
        columns = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.mget("columns");
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            column = _ref1[_i];
            _results.push(column.toColumn());
          }
          return _results;
        }).call(this);
        if (this.mget("selectable") === "checkbox") {
          checkboxSelector = new CheckboxSelectColumn({
            cssClass: "bk-cell-select"
          });
          columns.unshift(checkboxSelector.getColumnDefinition());
        }
        if (this.mget("row_headers") && (this.mget("source").get_column("index") != null)) {
          columns.unshift(this.newIndexColumn());
        }
        width = this.mget("width");
        height = this.mget("height");
        options = {
          enableCellNavigation: this.mget("selectable") !== false,
          enableColumnReorder: true,
          forceFitColumns: this.mget("fit_columns"),
          autoHeight: height === "auto",
          multiColumnSort: this.mget("sortable"),
          editable: this.mget("editable"),
          autoEdit: false
        };
        if (width != null) {
          this.$el.css({
            width: "" + (this.mget("width")) + "px"
          });
        }
        if ((height != null) && height !== "auto") {
          this.$el.css({
            height: "" + (this.mget("height")) + "px"
          });
        }
        this.data = new DataProvider(this.mget("source"));
        this.grid = new SlickGrid(this.el, this.data, columns, options);
        this.grid.onSort.subscribe(function(event, args) {
          columns = args.sortCols;
          _this.data.sort(columns);
          _this.grid.invalidate();
          return _this.grid.render();
        });
        if (this.mget("selectable") !== false) {
          this.grid.setSelectionModel(new RowSelectionModel({
            selectActiveRow: checkboxSelector == null
          }));
          if (checkboxSelector != null) {
            this.grid.registerPlugin(checkboxSelector);
          }
          return this.grid.onSelectedRowsChanged.subscribe(function(event, args) {
            return _this.mget("source").set("selected", args.rows);
          });
        }
      };

      return DataTableView;

    })(ContinuumView);
    DataTable = (function(_super) {
      __extends(DataTable, _super);

      function DataTable() {
        _ref1 = DataTable.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      DataTable.prototype.type = 'DataTable';

      DataTable.prototype.default_view = DataTableView;

      DataTable.prototype.defaults = function() {
        return _.extend({}, DataTable.__super__.defaults.call(this), {
          columns: [],
          width: null,
          height: 400,
          fit_columns: true,
          sortable: true,
          editable: false,
          selectable: true,
          row_headers: true
        });
      };

      return DataTable;

    })(HasProperties);
    DataTables = (function(_super) {
      __extends(DataTables, _super);

      function DataTables() {
        _ref2 = DataTables.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      DataTables.prototype.model = DataTable;

      return DataTables;

    })(Collection);
    return {
      Model: DataTable,
      Collection: new DataTables(),
      View: DataTableView
    };
  });

}).call(this);

/*
//@ sourceMappingURL=data_table.js.map
*/