const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => res.render('index', { title: 'Homepage' }));

router.get('/signup', (req, res, next) =>
  res.render('signup', { title: 'Sign Up' })
);

router.get('/signin', (req, res, next) =>
  res.render('signin', { title: 'Sign In' })
);

module.exports = router;
