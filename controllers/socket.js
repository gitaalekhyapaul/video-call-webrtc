const globalIO = require("../util/socket").getIO();
const {
  readClients,
  writeClients,
  readRooms,
  writeRooms,
} = require("../util/operations");
const { v4 } = require("uuid");

const socketController = async (socket) => {
  try {
    await socket.on("bye-bye", async (socketId) => {
      const userDisconnected = socketId;
      const clients = await readClients();
      const updatedClients = clients.filter((ele) => {
        if (ele.socketId !== userDisconnected) {
          return true;
        } else {
          console.log(
            `DISCONNECT:: Client ${ele.username} with Socket ID ${ele.socketId}`
          );
          return false;
        }
      });
      const result = await writeClients(updatedClients);
      if (result) {
        socket.broadcast.emit("refresh-clients", updatedClients);
      }
      return socket.disconnect(true);
    });
    await socket.on("createRoom", (clientId, cb) => {
      const newRoom = v4();
      socket.join(newRoom);
      socket.to(clientId).emit("joinRoom", {
        roomId: newRoom,
        callerId: socket.id,
      });
      cb(newRoom);
    });
    await socket.on("joinedRoom", (data, cb) => {
      socket.join(data.roomId);
      console.log(
        `ROOM_CREATED:: ${data.roomId} from ${data.callerId} to ${data.calleeId}`
      );
      cb(data);
    });
    await socket.on("signal", (data) => {
      console.log(`SIGNAL:: FROM: ${socket.id} ${data.type}`);
      socket.to(data.roomId).broadcast.emit("signal", data);
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const newSocket = async (socket) => {
  const username = socket.handshake.query.username;
  const socketId = socket.id;
  console.log(`CONNECT:: Client ${username} with Socket ID ${socketId}`);
  const clients = await readClients();
  const updatedClients = clients.map((ele) => {
    if (ele.username === username) {
      return {
        username,
        socketId,
      };
    } else {
      return ele;
    }
  });
  const result = await writeClients(updatedClients);
  if (result) {
    socket.broadcast.emit("refresh-clients", updatedClients);
  }
};

module.exports = {
  socketController,
  newSocket,
};
