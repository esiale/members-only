const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

exports.user_signup_get = (req, res, next) => {
  res.render('signup', { title: 'Sign Up' });
};

exports.user_signup_post = [
  body('login')
    .trim()
    .notEmpty()
    .withMessage('Login is required.')
    .isLength({ max: 20 })
    .withMessage('Login must be shorter than 20 characters.')
    .escape()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ login: value }).exec();
        if (user) return Promise.reject('User already exists.');
      } catch (err) {
        return next(err);
      }
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  body('confirm_password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords don't match.");
    } else {
      return true;
    }
  }),
  async (req, res, next) => {
    const user = new User({ login: req.body.login });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('signup', {
        title: 'Sign up',
        user: user,
        errors: errors.mapped(),
      });
    }
    try {
      const hashed_password = await bcrypt.hash(req.body.password, 10);
      user.password = hashed_password;
      await user.save();
      req.login(user, () => res.redirect('/'));
    } catch (err) {
      return next(err);
    }
  },
];

exports.user_signin_get = (req, res, next) => {
  res.render('signin', { title: 'Sign In' });
};
