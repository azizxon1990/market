'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Warehouse extends Model {

    static associate(models) {
      Warehouse.belongsTo(models.Organization, {
        foreignKey: 'organization_id',
        as: 'organization'
      });
    }
  }
  Warehouse.init({
    name: DataTypes.STRING,
    organization_id: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Warehouse',
    tableName: 'warehouses'
  });
  return Warehouse;
};