const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');
const utils = require('../middleware/utils');
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
  res.render('signin', { title: 'Sign In', error: req.flash('error') });
};

exports.user_signin_post = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/signin',
  failureFlash: 'Invalid username or password.',
});

exports.user_signout_get = (req, res, next) => {
  req.logout();
  res.redirect('/');
};

exports.user_upgrade_get = [
  utils.checkAuthentication,
  (req, res, next) => {
    res.render('upgrade', { title: 'Upgrade' });
  },
];

exports.user_upgrade_post = [
  utils.checkAuthentication,
  body('upgrade_password')
    .notEmpty()
    .withMessage("Password can't be empty, duh...")
    .custom((value) => {
      if (value !== process.env.member_pwd && value !== process.env.admin_pwd) {
        throw new Error('Invalid password.');
      } else {
        return true;
      }
    }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('upgrade', {
        title: 'Upgrade',
        errors: errors.mapped(),
      });
    } else {
      const fetchUser = User.findOne({
        login: req.user.login,
      }).exec();
      if (
        req.user.status === 'new' &&
        req.body.upgrade_password === process.env.member_pwd
      ) {
        try {
          const user = await fetchUser;
          user.status = 'member';
          await user.save();
          return res.redirect('/');
        } catch (err) {
          return next(err);
        }
      }
      if (
        (req.user.status === 'new' || req.user.status === 'member') &&
        req.body.upgrade_password === process.env.admin_pwd
      ) {
        try {
          const user = await fetchUser;
          user.status = 'admin';
          await user.save();
          return res.redirect('/');
        } catch (err) {
          return next(err);
        }
      }
      if (
        req.user.status === 'member' ||
        req.body.upgrade_password === process.env.member_pwd
      ) {
        return res.render('upgrade', {
          title: 'Upgrade',
          errors: {
            upgrade_password: {
              msg: "You're already a member!",
            },
          },
        });
      }
    }
  },
];
