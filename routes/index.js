const express = require('express');
const user_controller = require('../controllers/userController');
const post_controller = require('../controllers/postController');

const router = express.Router();

router.get('/', post_controller.index_get);

router.get('/signup', user_controller.user_signup_get);

router.post('/signup', user_controller.user_signup_post);

router.get('/signin', user_controller.user_signin_get);

router.post('/signin', user_controller.user_signin_post);

router.get('/signout', user_controller.user_signout_get);

router.get('/upgrade', user_controller.user_upgrade_get);

router.post('/upgrade', user_controller.user_upgrade_post);

router.get('/addpost', post_controller.post_add_get);

router.post('/addpost', post_controller.post_add_post);

router.get('/remove/:id', post_controller.post_remove);

module.exports = router;
