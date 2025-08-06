'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_types', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      active: {
        type: Sequelize.BOOLEAN
      },
      currency: {
        type: Sequelize.ENUM('UZS', 'USD'),
        allowNull: false,
        defaultValue: 'UZS'
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_types');
  }
};