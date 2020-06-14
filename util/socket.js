let io;
module.exports = {
  initSocket: (httpServer) => {
    io = require("socket.io")(httpServer);
    console.log(`Socket.io Listening on Port ${process.env.PORT}`);
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io Not Initialized!");
    } else {
      return io;
    }
  },
};
