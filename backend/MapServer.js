import http from 'http'
import {
  Server
} from 'socket.io'

import TripService from './components/TripService/emitter.js';
import TripUtils from './components/TripUtils/tripUtils.js';
import UserUtils from './components/UserUtils/UserUtils.js';

var userMap = new Map();
var tripMap = new Map();
var riderSocketIdToTripMap = new Map();
var driverPosArray = [];
var io = {};
var connectedUserLoopFlag = true;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function connectedUserLoop() {
  while (connectedUserLoopFlag) {
    await sleep(8000);
    // Remove disconnected users
    for (let [key, value] of userMap) {
      removeUserIfDisconnected(key);
    }
    console.log("userMap:", userMap);
  }
}

function newUserIfNotExist(socketId) {
  var userObjRef = userMap.get(socketId);
  if (!userObjRef) {
    console.log("New User:", socketId);
    userMap.set(socketId, {
      "tripMatching": false,
      "tripDoing": false,
      "isActive": true
    });
  }
}

function removeUserIfDisconnected(socketId) {
  // console.log("attempt to remove", socketId);
  var userObjRef = userMap.get(socketId);
  var deleteFlag = false;
  if (userObjRef === undefined || !userObjRef) {
    deleteFlag = true;
  } else if (userObjRef.lastUpdate === undefined) {
    // delete if no update time
    deleteFlag = true;
  } else if ((userObjRef.lastUpdate + 30000) < Date.now()) {
    // user did not update for awhile so we delete
    // Date.now() is in milliseconds
    deleteFlag = true;
  }
  if (deleteFlag) {
    var index = driverPosArray.findIndex(obj => {
      return obj.socketId == socketId;
    });
    if (index > -1) {
      driverPosArray.splice(index, 1);
    }
  }
  if (userObjRef && deleteFlag) {
    userObjRef.isActive = false;
    userMap.delete(socketId);
  }
}

async function requestRide(socketId) {
  let riderObjRef = userMap.get(socketId);
  // Is the current user already involved with a trip?
  let tripIdRef = riderSocketIdToTripMap.get(socketId);
  if (tripIdRef) {
    let riderData = {};
    riderData.message = "Trip already in progress!"
    riderData.timestamp = Date.now();
    riderData.socketId = socketId;
    riderData.tripId = tripIdRef;
    io.to(socketId).emit('requestRideProgress', riderData);
    return ;
  }
  // Create a trip
  let tripId = TripUtils.generateTripId(tripMap);
  let tripData = {
    "tripId": tripId,
    "driverMatched": false,
    "driverMatchedConfirm": false,
    "inProgress": false,
    "completed": false,
    "hasRiderRating": false,
    "hasDriverRating": false,
    "riderSocketId": socketId,
    "riderId": riderObjRef.userId,
    "riderName": riderObjRef.firstName + " " + riderObjRef.lastName,
    "riderRating": 0,
    "driverSocketId": 0,
    "driverId": 0,
    "driverName": "",
    "driverRating": 0
  }
  tripMap.set(tripId, tripData);
  riderSocketIdToTripMap.set(socketId, tripId);
  // notify the rest of the system about the trip
  TripService.emit("newTrip", tripData);
  let tripObjRef = tripMap.get(tripId);
  TripService.emit("matchRiderDriverTrip", tripId);
}

async function matchDriverToRider(tripId) {
  let tripObjRef = tripMap.get(tripId);
  if (tripObjRef === undefined) {
    return;
  }
  let riderSocketId = tripObjRef.riderSocketId;
  let riderObjRef = userMap.get(riderSocketId);
  /*
  Search for a match in a loop
  */
  while (true) {
    // Is rider still active?
    if (!TripUtils.matchDriverToRiderActiveCheck(io, riderObjRef)) {
      break;
    }
    // keep alive
    riderObjRef.lastUpdate = Date.now();
    // calculate the distance between the rider and each driver
    let query = TripUtils.getClosestDriver(driverPosArray, riderObjRef);
    // see if the closest driver exists
    if (!query) {
      riderObjRef.tripMatching = false;
      var data = {};
      data.message = "No drivers were found!"
      data.timestamp = Date.now();
      data.socketId = riderSocketId;
      io.to(riderSocketId).emit('requestRideProgress', data)
      await sleep(5000);
      continue;
    }
    let driverSocketId = query.socketId;
    // DRIVER FOUND!
    // set variables
    tripObjRef.driverMatched = true;
    tripObjRef.inProgress = false;
    let driverObjRef = userMap.get(driverSocketId);
    // if the driver can't be found then remove from the list
    if (!driverObjRef) {
      removeUserIfDisconnected(driverSocketId);
      await sleep(1000);
      continue;
    }
    // set trip properties
    tripObjRef.riderSocketId = riderSocketId;
    tripObjRef.driverSocketId = driverSocketId;
    // send driver a confirmation
    var data = {};
    data.message = "A rider has matched you for a ride!"
    data.timestamp = Date.now();
    data.socketId = driverSocketId;
    data.riderFirstName = riderObjRef.firstName;
    data.riderLastName = riderObjRef.lastName;
    io.to(driverSocketId).emit('requestRideDriverConfirm', data);
    // tell the Rider
    var data = {};
    data.message = "A driver was found! Waiting for them to confirm trip."
    data.timestamp = Date.now();
    data.socketId = driverSocketId;
    data.driverFirstName = driverObjRef.firstName;
    data.driverLastName = driverObjRef.lastName;
    io.to(driverSocketId).emit('requestRideProgress', data);
    await sleep(5000);
    // If driver did not accept, then stop break out of loop to stop searching
    if (!tripObjRef.driverMatchedConfirm) {
      removeUserIfDisconnected(driverSocketId);
      continue;
    }
    TripService.emit("driverToRiderTrip", tripObjRef.tripId);
    break;
  }
}

async function driverToRiderTrip(tripId) {
  let tripObjRef = tripMap.get(tripId);
  if (tripObjRef === undefined) {
    return;
  }
  let riderSocketId = tripObjRef.riderSocketId;
  let driverSocketId = tripObjRef.driverSocketId;
  let riderObjRef = userMap.get(riderSocketId);
  let driverObjRef = userMap.get(driverSocketId);
  while (true) {
    // Is rider still active?
    if (!TripUtils.driverToRiderActiveCheck(io, riderObjRef)) {
      TripUtils.driverToRiderCancel(io, driverObjRef);
      break;
    }
    if (!TripUtils.driverToRiderActiveCheck(io, driverObjRef)) {
      TripUtils.driverToRiderCancel(io, riderObjRef);
      break;
    }
    // keep alive
    riderObjRef.lastUpdate = Date.now();
    driverObjRef.lastUpdate = Date.now();
    // calculate the distance between the rider and each driver
    let distance = TripUtils.getRiderDriverDistance(riderObjRef, driverObjRef);
    console.log("driver distance", distance);
    // see if the driver is within proximity
    if (distance > 100) {
      var data = {};
      data.message = "Driver hasn't arrived yet!"
      data.timestamp = Date.now();
      data.socketId = riderSocketId;
      io.to(riderSocketId).emit('tripDriverToRiderProgress', data)
      await sleep(5000);
      continue;
    }
    // driver has arrived!
    // send driver a confirmation
    var data = {};
    data.message = "The driver has arrived!"
    data.timestamp = Date.now();
    data.socketId = driverSocketId;
    io.to(driverSocketId).emit('tripDriverToRiderProgress', data);
    // tell the Rider
    var data = {};
    data.message = "Have you picked up the rider?"
    data.timestamp = Date.now();
    data.socketId = driverSocketId;
    io.to(driverSocketId).emit('tripDriverToRiderConfirm', data);
    await sleep(5000);
    // If driver did not pick up rider, keep confirming
    if (!tripObjRef.inProgress) {
      removeUserIfDisconnected(driverSocketId);
      continue;
    }
    TripService.emit("togetherTrip", tripObjRef.tripId);
    break;
  }
}

async function togetherTrip(tripId) {
  let tripObjRef = tripMap.get(tripId);
  if (tripObjRef === undefined) {
    return;
  }
  let riderSocketId = tripObjRef.riderSocketId;
  let driverSocketId = tripObjRef.driverSocketId;
  let riderObjRef = userMap.get(riderSocketId);
  let driverObjRef = userMap.get(driverSocketId);
  while (true) {
    // Is rider still active?
    if (!TripUtils.togetherActiveCheck(io, riderObjRef)) {
      TripUtils.togetherCancel(io, driverObjRef);
      break;
    }
    if (!TripUtils.togetherActiveCheck(io, driverObjRef)) {
      TripUtils.togetherCancel(io, riderObjRef);
      break;
    }
    // keep alive
    riderObjRef.lastUpdate = Date.now();
    driverObjRef.lastUpdate = Date.now();
    // calculate the distance between the rider and each driver
    let distance = TripUtils.getRiderDriverDistance(riderObjRef, driverObjRef);
    console.log("driver distance", distance);
    // see if the driver is within proximity
    if (distance > 100) {
      let riderData = {};
      riderData.message = "You've separated from the driver!"
      riderData.timestamp = Date.now();
      riderData.socketId = riderSocketId;
      io.to(riderSocketId).emit('tripTogetherProgress', riderData);
      let driverData = {};
      driverData.message = "You've separated from the rider!"
      driverData.timestamp = Date.now();
      driverData.socketId = driverSocketId;
      io.to(driverSocketId).emit('tripTogetherProgress', driverData);
      await sleep(5000);
      continue;
    }
    // TODO: see if driver has reached destination
    // send driver a confirmation
    let riderData = {};
    riderData.message = "You've arrived at your destination!"
    riderData.timestamp = Date.now();
    riderData.socketId = riderSocketId;
    io.to(riderSocketId).emit('tripTogetherProgress', riderData);
    // tell the Rider
    let driverData = {};
    driverData.message = "Have you picked up the rider?"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('tripTogetherConfirm', driverData);
    await sleep(5000);
    // If driver did not confirm destination is reached, then keep confirming
    if (!tripObjRef.completed) {
      removeUserIfDisconnected(driverSocketId);
      continue;
    }
    TripService.emit("rateTrip", tripObjRef.tripId);
    break;
  }
}

function rateTrip(tripId) {
  let tripObjRef = tripMap.get(tripId);
  if (tripObjRef === undefined) {
    return;
  }
  let riderSocketId = tripObjRef.riderSocketId;
  let driverSocketId = tripObjRef.driverSocketId;
  let riderObjRef = userMap.get(riderSocketId);
  let driverObjRef = userMap.get(driverSocketId);
  // TODO
}

// TODO
function matchDriverToRiderDone(driverSocketId, tripId) {
  let driverObjRef = userMap.get(driverSocketId);
  // Does the trip ID exist?
  let tripObjRef = tripMap.get(tripId);
  if (tripObjRef === undefined || !tripObjRef) {
    let driverData = {};
    driverData.message = "ERROR: can't find trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
    return ;
  }
  // Is the driver involved with this trip?
  if (tripObjRef.driverSocketId != driverSocketId) {
    let driverData = {};
    driverData.message = "ERROR: you are not assigned to this trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
    return ;
  }
  // Does the rider still exist?
  let riderSocketId = tripObjRef.riderSocketId;
  let riderObjRef = userMap.get(riderSocketId);
  if (riderObjRef === undefined || !riderObjRef) {
    let driverData = {};
    driverData.message = "ERROR: the rider has gone inactive!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
    return ;
  }
  // Is the rider already doing a trip?
  if (riderObjRef.tripDoing) {
    let driverData = {};
    driverData.message = "ERROR: the rider already is in a trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
    return ;
  }
  // Is the driver already doing a trip?
  if (driverObjRef.tripDoing) {
    let driverData = {};
    driverData.message = "ERROR: You are already is in a trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
    return ;
  }
  // Trip conditions are satisfied
  // Set trip flags
  tripIdRef.driverMatchedConfirm = true;
  riderObjRef.tripDoing = true;
  driverObjRef.tripDoing = true;
  // emit messages
  let driverData = {};
  driverData.message = "Matched to a rider!"
  driverData.timestamp = Date.now();
  driverData.socketId = driverSocketId;
  driverData.riderLastName = riderObjRef.firstName;
  io.to(driverSocketId).emit('tripDriverToRiderBegin', driverData);
  let riderData = {};
  riderData.message = "Matched to a driver!"
  riderData.timestamp = Date.now();
  riderData.socketId = riderSocketId;
  riderData.riderLastName = driverObjRef.firstName;
  io.to(riderSocketId).emit('tripDriverToRiderBegin', riderData);
  console.log(driverSocketId + "(" + driverObjRef.firstName + ") and " + riderSocketId + "(" + riderObjRef.firstName + ") matched!");
}

function MapServer(app) {
  const httpServer = http.createServer(app)
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
      credentials: false
    }
  })

  io.on('connection', socket => {
    console.log(`Position User Connected: ${socket.id}`);
    newUserIfNotExist(socket.id);
    // user object passed by reference
    var userObjRef = userMap.get(socket.id);

    socket.on('request_target', () => {
      io.allSockets().then((result) => {
        for (let item of result) {
          if (item != socket.id) {
            console.log('targets:', socket.id, item)
            socket.emit('receive_target', item)
            socket.to(item).emit('receive_target', socket.id)
          }
        }
      })
    })

    socket.on('positionUpdate', async (data) => {
      newUserIfNotExist(socket.id);
      userObjRef = userMap.get(socket.id);
      data.timestamp = Date.now();
      data.socketId = socket.id;
      userObjRef.lastUpdate = Date.now();
      userObjRef.socketId = socket.id;
      userObjRef.long = data.long;
      userObjRef.lat = data.lat;
      userObjRef.type = data.type;
      /*
      Don't query for the user information too often
      */
      if (userObjRef.token != data.token) {
        userObjRef.token = data.token;
        let userInfo = await UserUtils.getUserInfoByTokenId(userObjRef.token);
        if (userInfo) {
          userObjRef.userId = userInfo._id;
          userObjRef.firstName = userInfo.firstName;
          userObjRef.lastName = userInfo.lastName;
          userObjRef.email = userInfo.email;
        }
      }
      // console.log("position update from:", socket.id, "at", data.timestamp)
      // Add type==driver to the driverPosArray
      if (data.type == "driver") {
        var result = driverPosArray.find(obj => {
          return obj.socketId == socket.id;
        });
        if (!result) {
          // Does not exist, so create a new entry
          //console.log("driver position added:", socket.id, "at", data.timestamp)
          driverPosArray.push({
            long: data.long,
            lat: data.lat,
            socketId: socket.id
          });
        } else {
          // Update Driver position
          result.long = data.long;
          result.lat = data.lat;
          result.socketId = socket.id;
        }
      }
      io.sockets.emit('positionData', data);
    })

    socket.on('requestRide', () => {
      var data = {};
      if (!userObjRef.tripMatching) {
        data.message = "Trip Matching Started!"
        userObjRef.tripMatching = true;
        requestRide(socket.id);
      } else {
        data.message = "Trip Matching In Progress!"
      }
      data.timestamp = Date.now();
      data.socketId = socket.id;
      io.to(socket.id).emit('requestRideProgress', data)
    });

    socket.on('currentTrip', () => {
      var data = {};
      if (!userObjRef.tripDoing) {
        data.message = "No trip in progress."
      } else {
        data.message = "Trip Matching In Progress!"
        data.rider = userObjRef;
        data.driver = userObjRef.trip.driver;
        data.destination = userObjRef.trip.destination;
      }
      data.timestamp = Date.now();
      data.socketId = socket.id;
      io.to(socket.id).emit('currentTripData', data)
    });

    socket.on('confirmTrip', (data) => {
      let driverSocketId = socket.id;
      let tripId = data.tripId;
      matchDriverToRiderDone(driverSocketId, tripId);
    });

    TripService.on("driverToRiderTrip", async (tripId) => {
      driverToRiderTrip(tripId);
    });
    TripService.on("matchRiderDriverTrip", async (tripId) => {
      matchDriverToRider(tripId);
    });
    TripService.on("togetherTrip", async (tripId) => {
      togetherTrip(tripId);
    });

    TripService.on("rateTrip", async (tripId) => {
      rateTrip(tripId);
    });
  })

  httpServer.listen(4001, function() {
    console.log('Position Socket server listening at http://localhost:4001')
  });
  httpServer.on('error', (err) => {
    console.log('server error:')
    console.log(err);
  });

  connectedUserLoop();
}

export default MapServer;
