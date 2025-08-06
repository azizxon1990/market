const { Router } = require('express');
const { getAllPaymentTypes, createPaymentType, getPaymentTypeById, updatePaymentType, addOrDeletePaymentTypeOrganization , getActivePaymentTypesByUserOrganizationId } = require('../controllers/paymentTypeController');
const auth = require('../middleware/auth');
const { paymentTypeValidate } = require('../middleware/validations/paymentTypeValidation');
const router = Router();

router.get('/', auth, getAllPaymentTypes);
router.get('/active', auth, getActivePaymentTypesByUserOrganizationId);
router.post('/', auth, paymentTypeValidate, createPaymentType);
router.get('/:id', auth, getPaymentTypeById);
router.put('/:id', auth, paymentTypeValidate, updatePaymentType);
router.put('/:id/organizations', auth, addOrDeletePaymentTypeOrganization);

module.exports = router;
