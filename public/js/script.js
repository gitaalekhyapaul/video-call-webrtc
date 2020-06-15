let socketId;
let roomId;
let peerConn;
let dataChannel;
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

const showClients = () => {
  document.querySelector("#cardDeck").toggleAttribute("hidden");
  document.querySelector("#cardDeck").classList.toggle("d-flex");
  document.querySelector("#cardDeckHeader").toggleAttribute("hidden");
  document.querySelector("#messageDialog").toggleAttribute("hidden");
};

const connect = (clientId) => {
  socket.emit("createRoom", clientId, (createdRoom) => {
    roomId = createdRoom;
    console.log(`Joined Signalling Room ${createdRoom}`);
    showClients();
    createOffer();
  });
};

const sendSignal = (data) => {
  socket.emit("signal", data);
};

const sendChat = () => {
  const message = document.querySelector("#chatMessage").value;
  document.querySelector("#chatMessage").value = "";
  if (message.length > 0 && dataChannel.readyState === "open") {
    dataChannel.send(message);
    const displayMessage = `<strong class="text-left">You:: ${message}</strong><br>`;
    document
      .querySelector("#messageConsole")
      .insertAdjacentHTML("afterbegin", displayMessage);
  }
};

const receiveChat = (event) => {
  const message = `<strong class="text-right">Friend:: ${event.data}</strong><br>`;
  document
    .querySelector("#messageConsole")
    .insertAdjacentHTML("afterbegin", message);
};

const joinRoom = (data) => {
  roomId = data.roomId;
  socket.emit("joinedRoom", { ...data, calleeId: socketId }, (conn) => {
    console.log(`Joined ${conn.callerId} on Room ${conn.roomId}`);
    showClients();
  });
};

socket.on("joinRoom", joinRoom);

const negotationEvent = async () => {
  try {
    const offer = await peerConn.createOffer();
    await peerConn.setLocalDescription(offer);
    console.log("Offer created.");
    sendSignal({
      type: "offer",
      roomId,
      sdp: peerConn.localDescription,
    });
    console.log("Offer sent.");
  } catch (error) {
    alert("Error Occurred.");
    console.log(error);
  }
};

const icecandidateSend = (ev) => {
  if (ev.candidate) {
    sendSignal({
      type: "new-ice-candidate",
      candidate: ev.candidate,
      roomId,
    });
    console.log("ICE Candidate Sent.");
  }
};

const iceCandidateAccept = async (data) => {
  try {
    if (!data.candidate) {
      alert("Error Occurred.");
      console.error("Malformed ICE Candidate Received!");
      return;
    } else if (!peerConn) {
      alert("Error Occurred.");
      console.error("No RTCPeerConnection Esatblished!");
      return;
    }
    const candidate = new RTCIceCandidate(data.candidate);
    await peerConn.addIceCandidate(candidate);
    console.log("Added Remote ICE Candidate");
  } catch (error) {
    alert("Error Occurred.");
    console.error(error);
  }
};

const addDataChannel = (ev) => {
  try {
    if (dataChannel) {
      alert("Error Occurred.");
      console.error("DataChannel was not closed properly!");
      return;
    } else if (!ev.channel) {
      alert("Error Occurred.");
      console.error("DataChannel Object not Found.");
      return;
    }
    dataChannel = ev.channel;
    console.log("Data channel added.");
    dataChannel.onmessage = receiveChat;
    dataChannel.onopen = () => {
      dataChannel.send("Connection Established!");
      console.log("Data Channel Opened!");
      document.querySelector("#btn-start-video").toggleAttribute("disabled");
      document.querySelector("#btn-share-screen").toggleAttribute("disabled");
      document.querySelector("#btn-end-connection").toggleAttribute("disabled");
    };
  } catch (error) {
    console.error(error);
    alert("Error Occurred.");
  }
};

const addMediaTrack = (ev) => {
  console.log("Remote Video Feed Available!");
  document.querySelector("#remoteVideo").srcObject = ev.streams[0];
};

const createOffer = async () => {
  try {
    if (peerConn) {
      alert("Error Occurred.");
      console.error("RTCPeerConnection was not closed properly!");
      return;
    }
    peerConn = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    dataChannel = peerConn.createDataChannel("chat");
    console.log("Data channel created.");
    dataChannel.onmessage = receiveChat;
    dataChannel.onopen = () => {
      console.log("Data Channel Opened!");
      dataChannel.send("Connection Established!");
      document.querySelector("#btn-start-video").toggleAttribute("disabled");
      document.querySelector("#btn-share-screen").toggleAttribute("disabled");
      document.querySelector("#btn-end-connection").toggleAttribute("disabled");
    };

    peerConn.onnegotiationneeded = await negotationEvent;
    peerConn.onicecandidate = await icecandidateSend;
    peerConn.ondatachannel = await addDataChannel;
    peerConn.ontrack = addMediaTrack;
  } catch (error) {
    alert("Error Occurred.");
    console.error(error);
  }
};

const createAnswer = async (data) => {
  try {
    if (!data.sdp) {
      console.error("Offer not Found.");
      alert("Error Occurred.");
      return;
    }
    if (peerConn) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: "user",
        },
      });
      document.querySelector("#videoArea").toggleAttribute("hidden");
      document.querySelector("#videoArea").toggleAttribute("d-flex");
      stream.getTracks().forEach((track) => peerConn.addTrack(track, stream));
      document.querySelector("#myVideo").srcObject = stream;
      const remoteSdp = new RTCSessionDescription(data.sdp);
      await peerConn.setRemoteDescription(remoteSdp);
      const answer = await peerConn.createAnswer();
      console.log("Video Call Answer Created.");
      await peerConn.setLocalDescription(answer);
      sendSignal({
        type: "answer",
        roomId,
        sdp: peerConn.localDescription,
      });
    } else {
      peerConn = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.stunprotocol.org",
          },
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });
      peerConn.onnegotiationneeded = await negotationEvent;
      peerConn.onicecandidate = await icecandidateSend;
      peerConn.ondatachannel = await addDataChannel;
      peerConn.ontrack = addMediaTrack;

      const remoteSdp = new RTCSessionDescription(data.sdp);
      await peerConn.setRemoteDescription(remoteSdp);
      const answer = await peerConn.createAnswer();
      console.log("Answer Created.");
      await peerConn.setLocalDescription(answer);
      sendSignal({
        type: "answer",
        roomId,
        sdp: peerConn.localDescription,
      });
    }
  } catch (error) {
    alert("Error Occurred.");
    console.error(error);
  }
};

const acceptAnswer = async (data) => {
  try {
    if (!peerConn || !dataChannel) {
      alert("Error Occurred.");
      console.error(
        "RTCPeerConnection OR RTCDataChannel not Initialized. Cannot Accept Answer!"
      );
      return;
    } else if (!data.sdp) {
      alert("Error Occurred.");
      console.error("Malformed Answer Recieved! No SDP Attached!");
      return;
    }
    const remoteSdp = new RTCSessionDescription(data.sdp);
    await peerConn.setRemoteDescription(remoteSdp);
    console.log("Connection Established!");
  } catch (error) {
    alert("Error Occurred.");
    console.error(error);
  }
};

socket.on("signal", (data) => {
  switch (data.type) {
    case "offer":
      createAnswer(data);
      break;
    case "answer":
      acceptAnswer(data);
      break;
    case "new-ice-candidate":
      iceCandidateAccept(data);
      break;

    default:
      alert("Error Occurred.");
      console.error("Error in Signal Format!");
      break;
  }
});

const startVideoCall = async () => {
  console.log("Video Call Initiated!");
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      facingMode: "user",
    },
  });
  document.querySelector("#videoArea").toggleAttribute("hidden");
  document.querySelector("#videoArea").toggleAttribute("d-flex");
  if (!peerConn) {
    alert("Error Occurred.");
    console.error("RTCPeerConnection not Initialized!");
    return;
  }
  stream.getTracks().forEach((track) => peerConn.addTrack(track, stream));
  document.querySelector("#myVideo").srcObject = stream;
};
