const {Router} = require('express');
const router = Router();
const multer = require('multer');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Faqat Excel fayllari (.xlsx, .xls) qabul qilinadi'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  getActiveProducts,
  searchActiveProducts,
  importProductsFromExcelFile,
} = require('../controllers/productController');

const { productValidate } = require('../middleware/validations/productValidation');
const auth = require('../middleware/auth');

router.get('/', auth, getAllProducts);
router.get('/active', auth, getActiveProducts);
router.get('/search', auth, searchActiveProducts);
router.post('/', auth, productValidate, createProduct);
router.post('/import', auth, upload.single('file'), importProductsFromExcelFile);
router.get('/:id', auth, getProductById);
router.put('/:id', auth, productValidate, updateProduct);

module.exports = router;
