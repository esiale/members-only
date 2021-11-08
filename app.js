if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const createError = require('http-errors');
const http = require('http');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const indexRouter = require('./routes/index');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const compression = require('compression');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

const mongoDb = process.env.MONGODB_URI || process.env.dev_db_url;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongo connection error'));

const app = express();
app.enable('trust proxy');
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.secret,
    store: MongoStore.create({ mongoUrl: mongoDb }),
    resave: false,
    saveUninitialized: true,
    proxy: true,
  })
);

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ login: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect password' });
        }
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRouter);

app.use((req, res, next) => {
  next(createError(404));
});
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error', { title: err.code });
});

module.exports = app;
