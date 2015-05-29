(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(["underscore", "common/has_properties", "common/collection"], function(_, HasProperties, Collection) {
    var TableColumn, TableColumns, _ref, _ref1;
    TableColumn = (function(_super) {
      __extends(TableColumn, _super);

      function TableColumn() {
        _ref = TableColumn.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      TableColumn.prototype.type = 'TableColumn';

      TableColumn.prototype.default_view = null;

      TableColumn.prototype.defaults = function() {
        return _.extend({}, TableColumn.__super__.defaults.call(this), {
          field: null,
          title: null,
          width: 300,
          formatter: null,
          editor: null,
          sortable: true,
          default_sort: "ascending"
        });
      };

      TableColumn.prototype.toColumn = function() {
        return {
          id: _.uniqueId(),
          field: this.get("field"),
          name: this.get("title"),
          width: this.get("width"),
          formatter: this.get("formatter"),
          editor: this.get("editor"),
          sortable: this.get("sortable"),
          defaultSortAsc: this.get("default_sort") === "ascending"
        };
      };

      return TableColumn;

    })(HasProperties);
    TableColumns = (function(_super) {
      __extends(TableColumns, _super);

      function TableColumns() {
        _ref1 = TableColumns.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      TableColumns.prototype.model = TableColumn;

      return TableColumns;

    })(Collection);
    return {
      Model: TableColumn,
      Collection: new TableColumns()
    };
  });

}).call(this);

/*
//@ sourceMappingURL=table_column.js.map
*/