const { Organization } = require('../models');

const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.findAll();
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const createOrganization = async (req, res) => {
  
  try {
    const {name, active} = req.body;
    const newOrganization = await Organization.create({name, active});
    res.status(201).json(newOrganization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id);
    if (organization) {
      res.json(organization);
    } else {
      res.status(404).json({ error: 'Organization not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateOrganization = async (req, res) => {
  try {
    const {name, active} = req.body;
    const [updated] = await Organization.update({
        name, 
        active
    }, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedOrganization = await Organization.findByPk(req.params.id);
      res.json(updatedOrganization);
    } else {
      res.status(404).json({ error: 'Organization not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getActiveOrganizations = async (req, res) => {
  try {
    const activeOrganizations = await Organization.findAll({ where: { active: true } });
    res.json(activeOrganizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllOrganizations,
  createOrganization,
  getOrganizationById,
  updateOrganization,
  getActiveOrganizations
};