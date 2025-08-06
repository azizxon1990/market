'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      value: {
        type: Sequelize.DECIMAL(18,2),
        allowNull: false
      },
      currency: {
        type: Sequelize.ENUM('UZS', 'USD'),
        allowNull: false,
        defaultValue: 'UZS'
      },
      payment_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'payment_types',
          key: 'id',
        },
        onDelete: 'RESTRICT'
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'suppliers',
          key: 'id',
        },
        onDelete: 'SET NULL'
      },
      cost_type_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'cost_types',
          key: 'id',
        },
        onDelete: 'SET NULL'
      },
      other_source_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'other_sources',
          key: 'id',
        },
        onDelete: 'SET NULL'
      },
      calculation_value: {
        type: Sequelize.DECIMAL(18,2),
        allowNull: true
      },
      exchange_rate: {
        type: Sequelize.DECIMAL(18,4),
        allowNull: true,
        defaultValue: 1.0
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};
