const {Router} = require('express');
const {  getAllUsers, createUser, getUserById, updateUser  } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', auth, getAllUsers);
router.post('/', auth, createUser);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUser);

module.exports = router;
