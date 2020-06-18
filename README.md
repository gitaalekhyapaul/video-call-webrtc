# webMOBI Video Call

# API Documentation:

# REST Routes:

1.  ### **/api/login => POST Route**

    **Request Parameters:**
    |Parameter Name|Type|
    |--|--|
    |_username_|String|

    **Response Body:**

    ```json
    {
        "status": "OK" or "ERROR",
        "error": "<error message is any error>"
    }
    ```

    **Response Codes and Error / Success Messages**
    |Type|Code|Error Message
    |--|--|--|
    |Success|201|-|
    |Error|400|Invalid Request. Missing Parameters!|
    |Error|400|Username already exists.|
    |Error|500|Internal Server Error.|

2.  ### **/api/clients => GET Route**

    **Response Body:**

    ```json
    {
    "status": "OK" or "ERROR",
    "error": "<error message is any error>",
    "data": [
                {
                "username": "<username>",
                "socketId": "<Socket.IO ID>"
                },
            ...<Array of Connected Clients>
            ]
    }
    ```

    **Response Codes and Error / Success Messages**
    |Type|Code|Error Message
    |--|--|--|
    |Success|200|-|
    |Error|500|Internal Server Error.|

# SocketIO Events:

## **Clients => send to => Server:**

1.  ### **createRoom => Expects ( clientId, callback( roomId ) )**
    **Purpose: This event is triggered by the caller to create a signalling room between him and the target callee, so that they can establish the video call**

- **clientId** => The target callee SocketIO ID.
- **callback( roomId )** => Callback where the newly created Room ID is passed.

2.  ### **joinedRoom => Expects ( data, callback( connectionInfo ) )**
    **Purpose: This event is triggered by the callee on accepting the caller request for connection.**

**"data" format::**

```json
{
  "roomId": "<Signalling Room ID>",
  "callerId": "<Caller SocketIO ID>",
  "calleeId": "<The SocketIO ID of Callee>"
}
```

- **data** => Data containing the caller and callee SocketIO ID and the Signalling Room ID.
- **callback( connectionInfo )** => Callback where the new successful connection Information is shared.

**"connectionInfo" format::**

```json
{
  "roomId": "<Signalling Room ID>",
  "callerId": "<Caller SocketIO ID>",
  "calleeId": "<The SocketIO ID of Callee>"
}
```

3. ### **bye-bye => Expects ( socketId )**
   **Purpose: This event is triggered either when the client closes the window or tab, and his disconnection has to be updated on the server-side.**

- **socketId** => The disconnected client's SocketIO ID.

4. ### **signal => Expects ( signalData )**
   **Purpose: This is the signal which has to be relayed to the specified room by the server.**

**"signalData" format::**

```json

    {
        "type": "<Signal Type>",
        "roomId": "<The room to which the server has to relay>",
        <Other Properties as applicable.>
    }
```

- **signalData** => A RTCPeerConnection or ICECandidate Signal. [More on Signals](#types-of-signals).

## Clients <= gets from <= Server:

1. ### **joinRoom => Gets ( data )**
   **Purpose: This event is sent to callee after the caller creates a room, on this event, the callee is asked if he wants to accept the incoming connection. On confirmation, he will emit the [joinedRoom](#joinedroom--expects--data-callback-connectioninfo--) event.**

**"data" format::**

```json
{
  "roomId": "<Signalling Room ID>",
  "callerId": "<Caller SocketIO ID>"
}
```

- **data** => Data containing the caller SocketIO ID and the Signalling Room ID.

2. ### **refresh-clients => Gets ( data )**
   **Purpose: This event is fired on each new connection, and should be used to real-time update the list of available clients.**

**"data" format::**

```json
    [
        {
            "username": "<username>",
            "socketId": "<Socket.IO ID>"
        },
        ...<Array of Connected Clients>
    ]
```

- **data** => Data containing all the online clients with their respective SocketIO IDs.

3. ### **signal => Gets ( signalData )**
   **Purpose: This is the signal which has been relayed back from the server to the caller / callee.**

**"signalData" format::**

```json
    {
        "type": "<Signal Type>",
        "roomId": "<The room from which the signal is coming>",
        <Other Properties as applicable.>
    }
```

- **signalData** => A RTCPeerConnection or ICECandidate Signal. [More on Signals](#types-of-signals).

## Types of signals:

- **"offer" => The offer containing the SDP packet of the caller in a 'sdp' property in the JSON. Is sent, after the RTCDataChannel connection is established between the two after connecting, and the caller / callee presses the "Video Call" or "Screen Share" button. NOTE: EACH TIME THE MEDIA TRACKS CHANGE, A NEW OFFER IS FORMED.**
- **"answer" => On pressing the video call / screen share button from one side, the other side is asked for consent, if agreed on, an answer SDP packet from the callee is sent to the video caller in the 'sdp' property of the Signal JSON. On each offer from the caller, a new answer is formed by the callee.**
- **"new-ice-candidate" => This is a ICE Candidate of the opposite caller / callee. The candidate is found under the 'candidate' property of the Signal JSON. It is to be added to the RTCPeerConnection object.**
- **"hang-up" => This is a signal initiated by either of the participants who click the hang up button. It is to notify the other user to hang up and close RTCDataChannel and RTCPeerConnection.**

---

# Client-Side Logic

## In Reference to: [Mozilla Documentation for RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling)

## In Reference to: [Mozilla Documentation for RTCDataChannel](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Simple_RTCDataChannel_sample)

## Video Calling Workflow (image from MDN):

![Video Call Workflow](https://media.prod.mdn.mozit.cloud/attachments/2016/01/27/12363/9d667775214ae0422fae606050f60c1e/WebRTC%20-%20Signaling%20Diagram.svg)

## ICE Candidate Exchange Flow (image from MDN):

![ICE Candidate Exchange Workflow](https://media.prod.mdn.mozit.cloud/attachments/2016/01/27/12365/b5bcd9ecac08ae0bc89b6a3e08cfe93c/WebRTC%20-%20ICE%20Candidate%20Exchange.svg)

```

```
