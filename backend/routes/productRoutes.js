const {Router} = require('express');
const router = Router();

const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  getActiveProducts,
  searchActiveProducts,
} = require('../controllers/productController');

const { productValidate } = require('../middleware/validations/productValidation');
const auth = require('../middleware/auth');

router.get('/', auth, getAllProducts);
router.get('/active', auth, getActiveProducts);
router.get('/search', auth, searchActiveProducts);
router.post('/', auth, productValidate, createProduct);
router.get('/:id', auth, getProductById);
router.put('/:id', auth, productValidate, updateProduct);

module.exports = router;
