const { Router } = require('express');
const router = Router();

const {
  getAllInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');

const { invoiceValidate } = require('../middleware/validations/invoiceValidation');
const auth = require('../middleware/auth');

router.get('/', auth, getAllInvoices);
router.post('/', auth, invoiceValidate, createInvoice);
router.get('/:id', auth, getInvoiceById);
router.put('/:id', auth, invoiceValidate, updateInvoice);
router.delete('/:id', auth, deleteInvoice);

module.exports = router;
