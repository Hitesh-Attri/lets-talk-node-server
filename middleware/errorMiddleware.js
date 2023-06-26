const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.origianlUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.stausCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    messgae: err.messgae,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
