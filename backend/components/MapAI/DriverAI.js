import io from "socket.io-client";
import * as Constants from "../../../constants.js"

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class App {
  constructor(lat_, long_) {
    this.lat = lat_;
    this.long = long_;
    this.type = "driver";
    this.abort = false;
    this.userMap = new Map();
    this.tripId = "";
    this.riderSocketId = "";
    this.riderLat = 0.0;
    this.riderLong = 0.0;
    this.destLat = 0.0;
    this.destLong = 0.0;
  }
  async start() {
    this.socket = io(Constants.MAP_SERVER, {
      cors: {
        origin: "*",
        methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
        credentials: false
      }
    });
    this.positionUpdate();
    // listen to server broadcasts
    this.socket.on('requestRideConfirm', this.requestRideConfirm.bind(this));
    this.socket.on('positionData', this.positionData.bind(this));
    this.socket.on('tripDriverToRiderBegin', this.tripDriverToRiderBegin.bind(this));
    this.socket.on('tripDriverToRiderConfirm', this.tripDriverToRiderConfirm.bind(this));
    this.socket.on('tripTogetherBegin', this.tripTogetherBegin.bind(this));
    this.socket.on('rateBegin', this.rateBegin.bind(this));
  }
  async positionUpdate() {
    while (this.abort === false) {
      this.socket.emit("positionUpdate", {
        "long": this.long,
        "lat": this.lat,
        "type": this.type,
        "token": 0
      });
      await sleep(8000);
    }
  }

  async requestRideConfirm(data) {
    //console.log("requestRideProgress Data Received:");
    //console.log(data);
    if (data.tripId === undefined) {
      console.log("requestRideConfirm ERROR");
      return;
    }
    this.tripId = data.tripId;
    await sleep(1000);
    this.socket.emit('requestRideDone', {
      "tripId": this.tripId
    });
  }

  positionData(data) {
    //console.log("positionData Data Received:");
    //console.log(data);
    this.userMap.set(data.socketId, data);
  }

  async tripDriverToRiderBegin(data) {
    //console.log("tripTogetherBegin Data Received:");
    //console.log(data);
    this.riderLat = data.riderLat;
    this.riderLong = data.riderLong;
    this.destLat = data.destLat;
    this.destLong = data.destLong;
    this.riderSocketId = data.riderSocketId;
    // change location to rider
    this.lat = this.riderLat;
    this.long = this.riderLong;
  }

  async tripDriverToRiderConfirm(data) {
    //console.log("tripDriverToRiderConfirm Data Received:");
    //console.log(data);
    await sleep(1000);
    this.socket.emit('tripDriverToRiderConfirmDone', {
      "tripId": this.tripId
    });
  }

  async tripTogetherBegin(data) {
    //console.log("tripTogetherBegin Data Received:");
    //console.log(data);
    // change location to destination
    this.lat = this.destLat;
    this.long = this.destLong;
  }

  async rateBegin(data) {
    //console.log("rateBegin Data Received:");
    //console.log(data);
    await sleep(1000);
    this.socket.emit('rateDone', {
      "tripId": this.tripId,
      "score": 5
    });
  }
}

export default App;
