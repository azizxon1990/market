'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PaymentType.init({
    name: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    currency: {
      type: DataTypes.ENUM('UZS', 'USD'),
      allowNull: false,
      defaultValue: 'UZS'
    }
  }, {
    sequelize,
    modelName: 'PaymentType',
    tableName: 'payment_types'
  });
  return PaymentType;
};