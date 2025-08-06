const { CostType, CostTypeOrganization } = require('../models');

const getAllCostTypes = async (req, res) => {
  try {
    const costTypes = await CostType.findAll();

    res.json(costTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const createCostType = async (req, res) => {
  
  try {
    const {name, active} = req.body;
    const newCostType = await CostType.create({name, active});
    res.status(201).json(newCostType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getCostTypeById = async (req, res) => {
  try {
    const costType = await CostType.findByPk(req.params.id);
    if (costType) {
      res.json(costType);
    } else {
      res.status(404).json({ error: 'Cost Type not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateCostType = async (req, res) => {
  try {
    const {name, active} = req.body;
    const [updated] = await CostType.update({
      name, active
    }, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedCostType = await CostType.findByPk(req.params.id);
      res.json(updatedCostType);
    } else {
      res.status(404).json({ error: 'Cost Type not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const addOrDeleteCostTypeOrganization  = async (req, res) => {
    const cost_type_id = req.params.id;
    const {organization_ids} = req.body.organization_ids;
    try {
    await CostTypeOrganization.destroy({ where: { cost_type_id, organization_id: { [Op.notIn]: organization_ids } } });
    await CostTypeOrganization.bulkCreate(organization_ids.map(organization_id => ({ cost_type_id, organization_id })));
        res.json({ message: 'Cost Type Organizations updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

} 

const getActiveCostTypesByUserOrganizationId = async (req, res) => {
  try {
    const userOrganizationId = req.user.organization_id;
    const activeCostTypes = await CostType.findAll({
        include: [
          {
            model: CostTypeOrganization,
            where: { organization_id: userOrganizationId }
          }
        ]
      });
    res.json(activeCostTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



module.exports = {
  getAllCostTypes,
  createCostType,
  getCostTypeById,
  updateCostType,
  addOrDeleteCostTypeOrganization,
  getActiveCostTypesByUserOrganizationId
};