const express = require('express');
const authController = require('../controllers/authController');
const { guestOnly } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimit');
const validators = require('../middlewares/validators');

const router = express.Router();

router.get('/login', guestOnly, authController.showLogin);
router.post('/login', guestOnly, authLimiter, validators.login, authController.login);

router.get('/register', guestOnly, authController.showRegister);
router.post('/register', guestOnly, authLimiter, validators.register, authController.register);

router.post('/logout', authController.logout);

module.exports = router;
