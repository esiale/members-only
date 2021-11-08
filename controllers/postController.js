const utils = require('../middleware/utils');
const Post = require('../models/post');
const format = require('date-fns/format');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

exports.index_get = async (req, res, next) => {
  const fetchPosts = Post.find().sort({ date: -1 }).exec();
  try {
    await fetchPosts.then((posts) => {
      res.render('index', { title: 'Homepage', posts: posts, format: format });
    });
  } catch (err) {
    return next(err);
  }
};

exports.post_add_get = [
  utils.checkAuthentication,
  (req, res, next) => {
    res.render('addpost', { title: 'Add a new post' });
  },
];

exports.post_add_post = [
  utils.checkAuthentication,
  body('post_body')
    .trim()
    .notEmpty()
    .withMessage("Your post can't be empty!")
    .isLength({ max: 500 })
    .withMessage("Your post can't have more than 500 characters.")
    .escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('addpost', {
        title: 'Add a new post',
        error: errors.mapped(),
      });
    } else {
      const post = new Post({
        body: req.body.post_body,
        author: req.user.login,
      });
      try {
        await post.save();
        res.redirect('/');
      } catch (err) {
        return next(err);
      }
    }
  },
];

exports.post_remove = [
  async (req, res, next) => {
    if (req.user.status !== 'admin') return res.redirect('/');
    const id = mongoose.Types.ObjectId(req.params.id);
    const remove = Post.findOneAndDelete({ _id: id }).exec();
    try {
      await remove;
      res.redirect('/');
    } catch (err) {
      return next(err);
    }
  },
];
