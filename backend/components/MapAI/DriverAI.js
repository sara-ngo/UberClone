import io from "socket.io-client";
import * as Constants from "../../../constants.js"
import commonAIUtils from "./common.js"

class App {
  constructor(lat_, long_) {
    this.lat = lat_;
    this.long = long_;
    this.heading = 0;
    this.type = "driver";
    this.abort = false;
    this.userMap = new Map();
    this.tripId = "";
    this.riderSocketId = "";
    this.riderLat = 0.0;
    this.riderLong = 0.0;
    this.endLat = 0.0;
    this.endLong = 0.0;
    this.moveMap = new Map();
    this.moveCounter = 0;
  }
  async start() {
    this.socket = io(Constants.MAP_SERVER + "?service=trip", {
      cors: {
        origin: "*",
        methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
        credentials: false
      }
    });
    this.positionUpdateLoop();
    // listen to server broadcasts
    this.socket.on('requestRideConfirm', this.requestRideConfirm.bind(this));
    this.socket.on('positionData', this.positionData.bind(this));
    this.socket.on('tripDriverToRiderBegin', this.tripDriverToRiderBegin.bind(this));
    this.socket.on('tripDriverToRiderConfirm', this.tripDriverToRiderConfirm.bind(this));
    this.socket.on('tripTogetherBegin', this.tripTogetherBegin.bind(this));
    this.socket.on('tripTogetherSuccess', this.tripTogetherSuccess.bind(this));
    this.socket.on('rateBegin', this.rateBegin.bind(this));
  }

  positionUpdate() {
    this.socket.emit("positionUpdate", {
      "long": this.long,
      "lat": this.lat,
      "heading": this.heading,
      "type": this.type,
      "token": 0
    });
  }

  async positionUpdateLoop() {
    while (this.abort === false) {
      this.positionUpdate();
      await commonAIUtils.sleep(5000);
    }
  }

  async moveTo(x2, y2) {
    let currentCounter = this.moveCounter;
    this.moveMap.set(currentCounter, true);
    if (currentCounter > 0) {
      this.moveMap.set(currentCounter - 1, false);
    }
    this.moveCounter++;
    this.moveInProgress = true;
    let x1 = this.long;
    let y1 = this.lat;
    this.heading = commonAIUtils.bearing(y1, x1, y2, x2);
    let distance = Math.hypot(x1 - x2, y1 - y2);
    let frac = 0.0;
    let speed = Constants.DRIVER_AI_SPEED; // distance/second
    let time = distance / speed * 1000; // milliseconds
    let timeQuanta = 400; // milliseconds
    let fracIncrement = timeQuanta / time;
    let loopCheck = true;
    while (loopCheck && frac < 1) {
      var xy = commonAIUtils.getPositionAlongALine(x1, y1, x2, y2, frac);
      this.long = xy.x;
      this.lat = xy.y;
      //console.log(xy.x, xy.y, frac);
      this.positionUpdate();
      frac += fracIncrement;
      await commonAIUtils.sleep(timeQuanta);
      loopCheck = this.moveMap.get(currentCounter);
      if (!loopCheck) {
        return;
      }
    }
    // on last step, set to exact point
    this.long = x2;
    this.lat = y2;
  }

  async requestRideConfirm(data) {
    //console.log("requestRideProgress Data Received:");
    //console.log(data);
    if (data.tripId === undefined) {
      console.log("requestRideConfirm ERROR");
      return;
    }
    this.tripId = data.tripId;
    await commonAIUtils.sleep(1000);
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
    //console.log("tripDriverToRiderBegin Data Received:");
    //console.log(data);
    this.riderLat = data.riderLat;
    this.riderLong = data.riderLong;
    this.riderSocketId = data.riderSocketId;
    // change location to rider
    this.moveTo(this.riderLong, this.riderLat);
  }

  async tripDriverToRiderConfirm(data) {
    //console.log("tripDriverToRiderConfirm Data Received:");
    //console.log(data);
    await commonAIUtils.sleep(1000);
    this.socket.emit('tripDriverToRiderConfirmDone', {
      "tripId": this.tripId
    });
  }

  async tripTogetherBegin(data) {
    //console.log("tripTogetherBegin Data Received:");
    //console.log(data);
    this.endLat = data.endLat;
    this.endLong = data.endLong;
    // change location to destination
    this.moveTo(this.endLong, this.endLat);
  }

  async tripTogetherSuccess(data) {
    //console.log("tripTogetherSuccess Data Received:");
    //console.log(data);
  }

  async rateBegin(data) {
    //console.log("rateBegin Data Received:");
    //console.log(data);
    await commonAIUtils.sleep(1000);
    this.socket.emit('rateDone', {
      "tripId": this.tripId,
      "score": 5
    });
  }
}

export default App;
