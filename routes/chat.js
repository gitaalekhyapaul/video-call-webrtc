const router = require("express").Router();
const { getRoot, postLogin } = require("../controllers/chat");

router.get("/", getRoot);
router.post("/", postLogin);

module.exports = {
  router,
};
