const {  Router } = require('express');
const router = Router();
const { getAllOrganizations, createOrganization, getOrganizationById, updateOrganization, getActiveOrganizations } = require('../controllers/organizationController');
const { organizationValidate } = require('../middleware/validations/organizationValidation');
const auth = require('../middleware/auth');

router.get('/', auth, getAllOrganizations);
router.get('/active', auth, getActiveOrganizations);
router.post('/', auth, organizationValidate, createOrganization);
router.get('/:id', auth, getOrganizationById);
router.put('/:id', auth, organizationValidate, updateOrganization);

module.exports = router;