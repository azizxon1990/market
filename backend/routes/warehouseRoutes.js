const { Router } = require('express');
const router = Router();
const { getAllWarehouses, createWarehouse, getWarehouseById, updateWarehouse, getActiveWarehousesByOrganizationId } = require('../controllers/warehouseController');
const { warehouseValidate } = require('../middleware/validations/warehouseValidation');
const auth = require('../middleware/auth');

router.get('/', auth, getAllWarehouses);
router.post('/', auth, warehouseValidate,  createWarehouse);
router.get('/:id', auth, getWarehouseById);
router.put('/:id', auth, warehouseValidate, updateWarehouse);
router.get('/organization/:id', auth, getActiveWarehousesByOrganizationId);

module.exports = router;

