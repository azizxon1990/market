const { Router } = require('express');
const { login, logout } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = Router();

router.post('/login', login);
router.post('/logout', auth, logout);


module.exports = router;
