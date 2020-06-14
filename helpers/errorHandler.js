class CustomError extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      status: "ERROR",
      error: err.message,
    });
  } else {
    console.log(err);
    res.status(500).json({
      status: "ERROR",
      error: "Internal Server Error.",
    });
  }
};

module.exports = {
  CustomError,
  errorHandler,
};
