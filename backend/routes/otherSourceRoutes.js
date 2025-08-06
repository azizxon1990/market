const { Router } = require('express');
const { getAllOtherSources, createOtherSource, getOtherSourceById, updateOtherSource } = require('../controllers/otherSourceController');
const auth = require('../middleware/auth');
const { otherSourceValidate } = require('../middleware/validations/otherSourceValidation');
const router = Router();

router.get('/', auth, getAllOtherSources);
router.post('/', auth, otherSourceValidate, createOtherSource);
router.get('/:id', auth, getOtherSourceById);
router.put('/:id', auth, otherSourceValidate, updateOtherSource);

module.exports = router;
