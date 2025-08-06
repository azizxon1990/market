'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_type_residues', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      payment_type_id: {
        type: Sequelize.INTEGER
      },
      organization_id: {
        type: Sequelize.INTEGER
      },
      residue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
    
    }, {
      uniqueKeys: {
        paymentTypeOrganizationUnique: {
          fields: ['payment_type_id', 'organization_id']
        }
      }
    });

    // TRIGGER FUNCTION: update residue on payments INSERT
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_payment_type_residue_insert() RETURNS TRIGGER AS $$
      BEGIN
        UPDATE payment_type_residues SET residue = residue + NEW.value
          WHERE organization_id = NEW.organization_id AND payment_type_id = NEW.payment_type_id;
        IF NOT FOUND THEN
          INSERT INTO payment_type_residues (organization_id, payment_type_id, residue)
          VALUES (NEW.organization_id, NEW.payment_type_id, NEW.value);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // TRIGGER FUNCTION: update residue on payments UPDATE
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_payment_type_residue_update() RETURNS TRIGGER AS $$
      BEGIN
        -- Subtract from old residue if organization or payment type changed
        IF (OLD.organization_id IS DISTINCT FROM NEW.organization_id OR OLD.payment_type_id IS DISTINCT FROM NEW.payment_type_id) THEN
          UPDATE payment_type_residues SET residue = residue - OLD.value
            WHERE organization_id = OLD.organization_id AND payment_type_id = OLD.payment_type_id;
        END IF;
        -- Add to new residue
        UPDATE payment_type_residues SET residue = residue + NEW.value
          WHERE organization_id = NEW.organization_id AND payment_type_id = NEW.payment_type_id;
        IF NOT FOUND THEN
          INSERT INTO payment_type_residues (organization_id, payment_type_id, residue)
          VALUES (NEW.organization_id, NEW.payment_type_id, NEW.value);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // TRIGGER FUNCTION: update residue on payments DELETE
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_payment_type_residue_delete() RETURNS TRIGGER AS $$
      BEGIN
        UPDATE payment_type_residues SET residue = residue - OLD.value
          WHERE organization_id = OLD.organization_id AND payment_type_id = OLD.payment_type_id;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // TRIGGERS for payments table
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS payments_after_insert ON payments;
      CREATE TRIGGER payments_after_insert
      AFTER INSERT ON payments
      FOR EACH ROW EXECUTE FUNCTION update_payment_type_residue_insert();
    `);
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS payments_after_update ON payments;
      CREATE TRIGGER payments_after_update
      AFTER UPDATE ON payments
      FOR EACH ROW EXECUTE FUNCTION update_payment_type_residue_update();
    `);
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS payments_after_delete ON payments;
      CREATE TRIGGER payments_after_delete
      AFTER DELETE ON payments
      FOR EACH ROW EXECUTE FUNCTION update_payment_type_residue_delete();
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_type_residues');
  }
};
