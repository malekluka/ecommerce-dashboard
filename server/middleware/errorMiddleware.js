// Centralized error handler middleware
const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack || err.message || err);
  res.status(err.status || 500).json({
    message: err.message || "Server Error"
  });
};

module.exports = errorMiddleware;
