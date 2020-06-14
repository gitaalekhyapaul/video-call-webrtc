let socketId;
const socket = io.connect({
  query: {
    username,
  },
});
socket.on("connect", () => {
  socketId = socket.id;
  console.log("Socket Established", socket.id);
});

window.onunload = (ev) => {
  socket.emit("bye-bye", socketId);
};

const connect = (socketId) => {
  console.log(`You want to connect to ${socketId}`);
};

const refreshClients = (updatedClients) => {
  const cardDeck = document.querySelector("#cardDeck");
  cardDeck.innerHTML = "";
  updatedClients.forEach((client) => {
    if (client.socketId !== socketId) {
      const clientCard = `
          <div class="card px-1 py-1 mx-2 my-2 rounded border-info shadow">
          <div class="card-body">
          <p class="card-title">${client.username}</p>
          </div>
          <div class="card-footer">
          <button
          class="btn btn-info"
          onclick="connect('${client.socketId}')"
          >
          Connect
          </button>
          </div>
          </div>
          `;
      cardDeck.innerHTML += clientCard;
    }
  });
};

socket.on("refresh-clients", refreshClients);
