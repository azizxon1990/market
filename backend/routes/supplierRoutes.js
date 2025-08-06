const { Router } = require('express');
const { supplierValidate } = require('../middleware/validations/supplierValidation');
const { getAllSuppliers, createSupplier, getSupplierById, updateSupplier, getActiveSuppliers } = require('../controllers/supplierController');
const  auth  = require('../middleware/auth');
const router = Router();

router.get('/', auth, getAllSuppliers);
router.get('/active', auth, getActiveSuppliers);
router.post('/', auth, supplierValidate, createSupplier);
router.get('/:id', auth, getSupplierById);
router.put('/:id', auth, supplierValidate, updateSupplier);

module.exports = router;
