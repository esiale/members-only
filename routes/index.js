const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => res.render('index', { title: 'Homepage' }));

router.get('/register', (req, res, next) =>
  res.render('register', { title: 'Register' })
);

module.exports = router;
