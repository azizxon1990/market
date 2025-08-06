const {Router} = require('express');
const {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { categoryValidate } = require('../middleware/validations/categoryValidation');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', auth, getAllCategories);
router.post('/', auth, categoryValidate, createCategory);
router.get('/:id', auth, getCategoryById);
router.put('/:id', auth, categoryValidate, updateCategory);

module.exports = router;
