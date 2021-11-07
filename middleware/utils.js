exports.checkAuthentication = (req, res, next) => {
  const error = new Error('Not logged in or insufficient permissions.');
  error.status = 401;
  req.isAuthenticated() ? next() : next(error);
};
