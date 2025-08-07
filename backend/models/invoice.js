'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      Invoice.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      Invoice.belongsTo(models.Warehouse, {
        foreignKey: 'warehouse_id',
        as: 'warehouse'
      });

      Invoice.belongsTo(models.Supplier, {
        foreignKey: 'supplier_id',
        as: 'supplier'
      });

      Invoice.belongsTo(models.OtherSource, {
        foreignKey: 'other_source_id',
        as: 'otherSource'
      });

      Invoice.hasMany(models.InvoiceItem, {
        foreignKey: 'invoice_id',
        as: 'items'
      });
    }
  }
  Invoice.init({
    invoice_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    invoice_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    warehouse_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    other_source_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
  });

  return Invoice;
};
