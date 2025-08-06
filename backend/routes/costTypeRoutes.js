const { Router } = require('express');
const { getAllCostTypes, createCostType, getCostTypeById, updateCostType, addOrDeleteCostTypeOrganization, getActiveCostTypesByUserOrganizationId } = require('../controllers/costTypeController');
const auth = require('../middleware/auth');
const { costTypeValidate } = require('../middleware/validations/costTypeValidation');
const router = Router();

router.get('/', auth, getAllCostTypes);
router.get('/active', auth, getActiveCostTypesByUserOrganizationId);
router.post('/', auth, costTypeValidate, createCostType);
router.get('/:id', auth, getCostTypeById);
router.put('/:id', auth, costTypeValidate, updateCostType);
router.put('/:id/organizations', auth, addOrDeleteCostTypeOrganization);



module.exports = router;


