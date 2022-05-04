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
    this.type = "rider";
    this.abort = false;
    this.userMap = new Map();
    this.driverSocketId = "";
    this.inProgressTogether = false;
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
    this.socket.on('requestRideProgress', this.requestRideProgress.bind(this));
    this.socket.on('positionData', this.positionData.bind(this));
    this.socket.on('tripTogetherBegin', this.tripTogetherBegin.bind(this));
    // wait before requesting a ride
    await sleep(3000);
    this.socket.emit("requestRide", {
      "type": "UberX",
      "cost": 20,
      "startLat" : this.lat,
      "startLong" : this.long,
      "endLat" : this.lat,
      "endLong" : this.long,
      "distance": 0,
      "duration": 0 
    });
  }
  async positionUpdate(){
    while(this.abort === false){
      this.socket.emit("positionUpdate", {
        "long" : this.long,
        "lat" : this.lat,
        "type" : this.type,
        "token" : 0
      });
      await sleep(8000);
    }
  }

  requestRideProgress(data){
    //console.log("requestRideProgress Data Received:");
    //console.log(data);
  }

  positionData(data){
    //console.log("positionData Data Received:");
    //console.log(data);
    this.userMap.set(data.socketId, data);
    // follow the driver around
    if(this.inProgressTogether && data.socketId == this.driverSocketId){
      this.lat = data.lat;
      this.long = data.long;
    }
  }

  tripTogetherBegin(data){
    this.inProgressTogether = true;
    this.driverSocketId = data.driverSocketId;
    //console.log("tripTogetherBegin Data Received:");
    //console.log(data);
  }
}

export default App;
