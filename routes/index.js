const express = require('express');
const user_controller = require('../controllers/userController');

const router = express.Router();

router.get('/', (req, res, next) => res.render('index', { title: 'Homepage' }));

router.get('/signup', user_controller.user_signup_get);

router.post('/signup', user_controller.user_signup_post);

router.get('/signin', user_controller.user_signin_get);

router.post('/signin', user_controller.user_signin_post);

router.get('/signout', user_controller.user_signout_get);

module.exports = router;
