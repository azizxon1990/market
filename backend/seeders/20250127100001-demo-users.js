'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords for users
    const hashedPassword1 = await bcrypt.hash('pass', 10);
    const hashedPassword2 = await bcrypt.hash('manager123', 10);
    const hashedPassword3 = await bcrypt.hash('user123', 10);
    const hashedPassword4 = await bcrypt.hash('warehouse123', 10);
    const hashedPassword5 = await bcrypt.hash('sales123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        full_name: 'System Administrator',
        username: 'user',
        password: hashedPassword1,
        organization_id: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        full_name: 'Manager User',
        username: 'manager',
        password: hashedPassword2,
        organization_id: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        full_name: 'Regular User',
        username: 'user',
        password: hashedPassword3,
        organization_id: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        full_name: 'Warehouse Manager',
        username: 'warehouse_user',
        password: hashedPassword4,
        organization_id: 4,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        full_name: 'Sales Representative',
        username: 'sales_user',
        password: hashedPassword5,
        organization_id: 5,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
