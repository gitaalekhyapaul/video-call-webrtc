const { readClients, writeClients } = require("../util/operations");
const getRoot = (req, res, next) => {
  try {
    res.render("login.ejs", {
      error: req.query.error ? decodeURIComponent(req.query.error) : null,
    });
  } catch (error) {
    next(error);
  }
};

const postLogin = async (req, res, next) => {
  try {
    if (!req.body.username) {
      return res.redirect(
        `/?error=${encodeURIComponent("Invalid Request. Missing Parameters.")}`
      );
    }
    const connectedClients = await readClients();
    const isThere = connectedClients.find(
      (ele) => ele.username === req.body.username
    );
    if (isThere) {
      return res.redirect(
        `/?error=${encodeURIComponent("Username already exists.")}`
      );
    }
    const clients = connectedClients;
    clients.push({
      username: req.body.username,
      socketId: null,
    });
    const result = await writeClients(clients);
    if (result) {
      return res.render("chat.ejs", {
        connected: connectedClients,
        username: req.body.username,
      });
    }
  } catch (err) {
    console.log(err);
    res.redirect(`/?error=${encodeURIComponent("Internal Server Error.")}`);
  }
};

module.exports = {
  getRoot,
  postLogin,
};
