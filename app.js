require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { errorHandler, CustomError } = require("./helpers/errorHandler");
const app = express();
const { router } = require("./routes/chat");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT, (err) => {
  if (err) {
    errorHandler(err);
  } else {
    console.log(`Express Listening on Port ${process.env.PORT}`);
  }
});
const io = require("./util/socket").initSocket(server);
const { socketController, newSocket } = require("./controllers/socket");

app.use("/api", router);
app.use(errorHandler);
io.on("connection", async (socket) => {
  await newSocket(socket);
  await socketController(socket);
});
