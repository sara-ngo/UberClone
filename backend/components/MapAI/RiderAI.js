import io from "socket.io-client";
import * as Constants from "../../../constants.js"

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// from stackoverflow lol
function getPositionAlongALine(x1, y1, x2, y2, percentage) {
  return {
    x: x1 * (1.0 - percentage) + x2 * percentage,
    y: y1 * (1.0 - percentage) + y2 * percentage
  };
}

function generateRandomDecimal(min, max) {
  return Math.random() * (max - min) + min;
};

class App {
  constructor(lat_, long_, endLat_, endLong_) {
    this.lat = lat_;
    this.long = long_;
    this.type = "rider";
    this.abort = false;
    this.userMap = new Map();
    this.driverSocketId = "";
    this.inProgressTogether = false;
    this.moveMap = new Map();
    this.moveCounter = 0;
    this.endLat = endLat_;
    this.endLong = endLong_;
  }
  async start() {
    this.socket = io(Constants.MAP_SERVER, {
      cors: {
        origin: "*",
        methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
        credentials: false
      }
    });
    this.positionUpdateLoop();
    // listen to server broadcasts
    this.socket.on('requestRideProgress', this.requestRideProgress.bind(this));
    this.socket.on('positionData', this.positionData.bind(this));
    this.socket.on('tripDriverToRiderStop', this.tripDriverToRiderStop.bind(this));
    this.socket.on('tripTogetherBegin', this.tripTogetherBegin.bind(this));
    this.socket.on('tripTogetherStop', this.tripTogetherStop.bind(this));
    this.socket.on('tripTogetherSuccess', this.tripTogetherSuccess.bind(this));
    // wait before requesting a ride
    await sleep(3000);
    this.requestRide();
  }

  requestRide() {
    this.socket.emit("requestRide", {
      "type": "UberX",
      "cost": 20,
      "startLat": this.lat,
      "startLong": this.long,
      "endLat": this.endLat,
      "endLong": this.endLong,
      "distance": 0,
      "duration": 0
    });
  }

  positionUpdate() {
    this.socket.emit("positionUpdate", {
      "long": this.long,
      "lat": this.lat,
      "type": this.type,
      "token": 0
    });
  }

  async positionUpdateLoop() {
    while (this.abort === false) {
      this.positionUpdate();
      await sleep(5000);
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
    let distance = Math.hypot(x1 - x2, y1 - y2);
    let frac = 0.0;
    let speed = Constants.RIDER_AI_SPEED; // distance/second
    let time = distance / speed * 1000; // milliseconds
    let timeQuanta = 400; // milliseconds
    let fracIncrement = timeQuanta / time;
    let loopCheck = true;
    while (loopCheck && frac < 1) {
      var xy = getPositionAlongALine(x1, y1, x2, y2, frac);
      this.long = xy.x;
      this.lat = xy.y;
      //console.log(xy.x, xy.y, frac);
      this.positionUpdate();
      frac += fracIncrement;
      await sleep(timeQuanta);
      loopCheck = this.moveMap.get(currentCounter);
      if (!loopCheck) {
        return;
      }
    }
    // on last step, set to exact point
    this.long = x2;
    this.lat = y2;
  }

  requestRideProgress(data) {
    //console.log("requestRideProgress Data Received:");
    //console.log(data);
  }

  positionData(data) {
    //console.log("positionData Data Received:");
    //console.log(data);
    this.userMap.set(data.socketId, data);
    // follow the driver around
    if (this.inProgressTogether && data.socketId == this.driverSocketId) {
      this.moveTo(data.long, data.lat);
    }
  }

  async tripDriverToRiderStop(data) {
    await sleep(3000);
    this.endLat = generateRandomDecimal(37.399026791869375, 37.24143720137937);
    this.endLong = generateRandomDecimal(-122.04096126819005, -121.77050796956928);
    this.requestRide();
  }

  tripTogetherBegin(data) {
    //console.log("tripTogetherBegin Data Received:");
    //console.log(data);
    this.inProgressTogether = true;
    this.driverSocketId = data.driverSocketId;
  }

  async tripTogetherStop(data) {
    //console.log("tripTogetherStop Data Received:");
    //console.log(data);
    this.inProgressTogether = false;
    // wait before requesting a ride
    await sleep(3000);
    this.endLat = generateRandomDecimal(37.399026791869375, 37.24143720137937);
    this.endLong = generateRandomDecimal(-122.04096126819005, -121.77050796956928);
    this.requestRide();
  }

  async tripTogetherSuccess(data) {
    //console.log("tripTogetherSuccess Data Received:");
    //console.log(data);
    this.inProgressTogether = false;
    // wait before requesting a ride
    await sleep(3000);
    this.endLat = generateRandomDecimal(37.399026791869375, 37.24143720137937);
    this.endLong = generateRandomDecimal(-122.04096126819005, -121.77050796956928);
    this.requestRide();
  }
}

export default App;
