const { readClients, writeClients } = require("../util/operations");
const { CustomError } = require("../helpers/errorHandler");

const getClients = async (req, res, next) => {
  try {
    const connectedClients = await readClients();
    res.status(200).json({
      status: "OK",
      data: connectedClients,
    });
  } catch (error) {
    next(error);
  }
};

const postLogin = async (req, res, next) => {
  try {
    if (!req.body.username) {
      return next(new CustomError(400, "Invalid Request. Missing Parameters!"));
    }
    const connectedClients = await readClients();
    const isThere = connectedClients.find(
      (ele) => ele.username === req.body.username
    );
    if (isThere) {
      return next(new CustomError(400, "Username already exists."));
    }
    const clients = connectedClients;
    clients.push({
      username: req.body.username,
      socketId: null,
    });
    const result = await writeClients(clients);
    if (result) {
      res.status(201).json({
        status: "OK",
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = {
  getClients,
  postLogin,
};
