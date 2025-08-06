const { check, validationResult } = require('express-validator');

const invoiceValidate = [
  check('date')
    .notEmpty()
    .withMessage('Sana kiritilishi shart')
    .isISO8601()
    .withMessage('To\'g\'ri sana formatini kiriting (YYYY-MM-DD)'),

  check('commentary')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Izoh 1000 belgidan oshmasligi kerak'),

  // Products array validatsiyasi
  check('products')
    .isArray({ min: 1 })
    .withMessage('Kamida bitta mahsulot kiritilishi kerak'),

  check('products.*.product_id')
    .notEmpty()
    .withMessage('Mahsulot ID kiritilishi shart')
    .isInt({ min: 1 })
    .withMessage('Mahsulot ID to\'g\'ri bo\'lishi kerak'),

  check('products.*.quantity')
    .notEmpty()
    .withMessage('Miqdor kiritilishi shart')
    .isInt({ min: 1 })
    .withMessage('Miqdor 1 dan kam bo\'lishi mumkin emas'),

  check('products.*.price')
    .notEmpty()
    .withMessage('Narx kiritilishi shart')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Narx to\'g\'ri formatda bo\'lishi kerak')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Narx manfiy bo\'lishi mumkin emas');
      }
      return true;
    }),

  // Supplier yoki Other Source dan biri tanlanganligini tekshirish
  check('supplier_id')
    .custom((value, { req }) => {
      const { supplier_id, other_source_id } = req.body;
      
      if (!supplier_id && !other_source_id) {
        throw new Error('Supplier yoki Other Source dan biri tanlanishi kerak');
      }
      
      if (supplier_id && other_source_id) {
        throw new Error('Faqat bitta manbani tanlash mumkin (Supplier yoki Other Source)');
      }
      
      return true;
    }),

  check('other_source_id')
    .custom((value, { req }) => {
      const { supplier_id, other_source_id } = req.body;
      
      if (!supplier_id && !other_source_id) {
        throw new Error('Supplier yoki Other Source dan biri tanlanishi kerak');
      }
      
      if (supplier_id && other_source_id) {
        throw new Error('Faqat bitta manbani tanlash mumkin (Supplier yoki Other Source)');
      }
      
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation xatolari',
        details: errors.array()
      });
    }
    next();
  }
];

module.exports = { invoiceValidate };
