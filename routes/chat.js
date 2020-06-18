const router = require("express").Router();
const { getClients, postLogin } = require("../controllers/chat");

router.get("/clients", getClients);
router.post("/login", postLogin);

module.exports = {
  router,
};
