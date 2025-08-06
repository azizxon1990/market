'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CostTypeOrganization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CostTypeOrganization.init({
    cost_type_id: DataTypes.INTEGER,
    organization_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CostTypeOrganization',
    tableName: 'cost_type_organizations'
  });
  return CostTypeOrganization;
};