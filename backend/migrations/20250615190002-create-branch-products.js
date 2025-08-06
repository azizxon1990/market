"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("branch_products",{
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        branch_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "organizations", key: "id" },
          onDelete: "CASCADE",
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "products", key: "id" },
          onDelete: "CASCADE",
        },
        stock: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
        wholesale_markup: {
          type: Sequelize.FLOAT,
          allowNull: true,
          defaultValue: 0,
        },
        wholesale_price: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
        retail_markup: {
          type: Sequelize.FLOAT,
          allowNull: true,
          defaultValue: 0,
        },
        retail_price: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
        createdAt: { allowNull: false, type: Sequelize.DATE },
        updatedAt: { allowNull: false, type: Sequelize.DATE },
      },
      {
        uniqueKeys: {
          unique_branch_product: {
            fields: ["branch_id", "product_id"],
          },
        },
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("branch_products");
  },
};
