'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('supplier_residues', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'suppliers',
          key: 'id',
        },
        onDelete: 'CASCADE'
      },
      residue: {
        type: Sequelize.DECIMAL(18,2),
        allowNull: false,
        defaultValue: 0.00
      },
      currency: {
        type: Sequelize.ENUM('UZS', 'USD'),
        allowNull: false,
        defaultValue: 'UZS'
      },
    });
    await queryInterface.addConstraint('supplier_residues', {
      fields: ['supplier_id', 'currency'],
      type: 'unique',
      name: 'unique_supplier_currency'
    });
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_supplier_residue_insert() RETURNS TRIGGER AS $$
      BEGIN
        UPDATE supplier_residues SET residue = residue + NEW.value
          WHERE supplier_id = NEW.supplier_id AND currency = NEW.currency;
        IF NOT FOUND THEN
          INSERT INTO supplier_residues (supplier_id, residue, currency, createdAt, updatedAt)
          VALUES (NEW.supplier_id, NEW.value, NEW.currency, NOW(), NOW());
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_supplier_residue_update() RETURNS TRIGGER AS $$
      BEGIN
        IF (OLD.supplier_id IS DISTINCT FROM NEW.supplier_id OR OLD.currency IS DISTINCT FROM NEW.currency) THEN
          UPDATE supplier_residues SET residue = residue - OLD.value
            WHERE supplier_id = OLD.supplier_id AND currency = OLD.currency;
        END IF;
        UPDATE supplier_residues SET residue = residue + NEW.value
          WHERE supplier_id = NEW.supplier_id AND currency = NEW.currency;
        IF NOT FOUND THEN
          INSERT INTO supplier_residues (supplier_id, residue, currency, createdAt, updatedAt)
          VALUES (NEW.supplier_id, NEW.value, NEW.currency, NOW(), NOW());
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_supplier_residue_delete() RETURNS TRIGGER AS $$
      BEGIN
        UPDATE supplier_residues SET residue = residue - OLD.value
          WHERE supplier_id = OLD.supplier_id AND currency = OLD.currency;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS supplier_calculations_after_insert ON supplier_calculations;
      CREATE TRIGGER supplier_calculations_after_insert
      AFTER INSERT ON supplier_calculations
      FOR EACH ROW EXECUTE FUNCTION update_supplier_residue_insert();
    `);
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS supplier_calculations_after_update ON supplier_calculations;
      CREATE TRIGGER supplier_calculations_after_update
      AFTER UPDATE ON supplier_calculations
      FOR EACH ROW EXECUTE FUNCTION update_supplier_residue_update();
    `);
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS supplier_calculations_after_delete ON supplier_calculations;
      CREATE TRIGGER supplier_calculations_after_delete
      AFTER DELETE ON supplier_calculations
      FOR EACH ROW EXECUTE FUNCTION update_supplier_residue_delete();
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('supplier_residues');
  }
};
