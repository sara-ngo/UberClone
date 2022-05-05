import http from 'http'
import {
  Server
} from 'socket.io'

import TripService from './components/TripService/emitter.js';
import TripUtils from './components/TripUtils/tripUtils.js';
import UserUtils from './components/UserUtils/UserUtils.js';
import RiderAI from './components/MapAI/RiderAI.js';
import DriverAI from './components/MapAI/DriverAI.js';
import * as Constants from "../constants.js"

let userMap = new Map();
let tripMap = new Map();
let riderSocketIdToTripMap = new Map();
let driverSocketIdToTripMap = new Map();
let io = {};
let connectedUserLoopFlag = true;

let userCheckDisconnectMS = 8000;
let userDisconnectThresholdMS = 20000;
let driverToRiderProximity = 0.0002;
let riderDestinationProximity = 0.0002;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function connectedUserLoop() {
  while (connectedUserLoopFlag) {
    await sleep(userCheckDisconnectMS);
    // Remove disconnected users
    for (let [key, value] of userMap) {
      removeUserIfDisconnected(key);
    }
    //console.log("userMap:", userMap);
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
  } else if ((userObjRef.lastUpdate + userDisconnectThresholdMS) < Date.now()) {
    // user did not update for awhile so we delete
    // Date.now() is in milliseconds
    deleteFlag = true;
  }
  if (userObjRef && deleteFlag) {
    userObjRef.isActive = false;
    userMap.delete(socketId);
    riderSocketIdToTripMap.delete(socketId);
    driverSocketIdToTripMap.delete(socketId);
  }
}

async function requestRide(riderSocketId, requestData) {
  let riderObjRef = userMap.get(riderSocketId);
  // Is the current user already involved with a trip?
  let tripIdRef = riderSocketIdToTripMap.get(riderSocketId);
  if (tripIdRef) {
    let riderData = {};
    riderData.message = "Trip already in progress!"
    riderData.timestamp = Date.now();
    riderData.socketId = riderSocketId;
    riderData.tripId = tripIdRef;
    io.to(riderSocketId).emit('requestRideProgress', riderData);
    return;
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
    "riderSocketId": riderSocketId,
    "riderId": riderObjRef.userId,
    "riderName": riderObjRef.firstName + " " + riderObjRef.lastName,
    "riderRating": 0,
    "driverSocketId": 0,
    "driverId": 0,
    "driverName": "",
    "driverRating": 0,
    "startLat": requestData.startLat,
    "startLong": requestData.startLong,
    "endLat": requestData.endLat,
    "endLong": requestData.endLong,
    "type": requestData.type,
    "distanceEstimate": requestData.distance,
    "durationEstimate": requestData.duration,
    "costEstimate": requestData.cost
  }
  tripMap.set(tripId, tripData);
  riderSocketIdToTripMap.set(riderSocketId, tripId);
  // set flags
  riderObjRef.tripMatching = true;
  // notify the rest of the system about the trip
  TripService.emit("newTrip", tripData);
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
      TripUtils.matchDriverToRiderCancel(io, riderObjRef);
      TripUtils.userStopTrip(riderObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      break;
    }
    // calculate the distance between the rider and each driver
    let query = TripUtils.getClosestDriver(userMap, riderObjRef);
    // see if the closest driver exists
    if (!query) {
      var data = {};
      data.message = "No drivers were found! Search continuing..."
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
    // set user flags
    driverObjRef.tripMatching = true;
    // set trip properties
    tripObjRef.riderSocketId = riderSocketId;
    tripObjRef.driverSocketId = driverSocketId;
    // send driver a confirmation
    let driverData = {};
    driverData.message = "A rider has matched you for a ride!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    driverData.riderFirstName = riderObjRef.firstName;
    driverData.riderLastName = riderObjRef.lastName;
    driverData.tripId = tripId;
    io.to(driverSocketId).emit('requestRideConfirm', driverData);
    // tell the Rider
    let riderData = {};
    riderData.message = "A driver was found! Waiting for them to confirm trip."
    riderData.timestamp = Date.now();
    riderData.socketId = driverSocketId;
    riderData.driverFirstName = driverObjRef.firstName;
    riderData.driverLastName = driverObjRef.lastName;
    riderData.tripId = tripId;
    io.to(riderSocketId).emit('requestRideProgress', riderData);
    await sleep(5000);
    // If driver did not accept, then continue the loop and keep searching
    if (!tripObjRef.driverMatchedConfirm) {
      driverObjRef.tripMatching = false;
      removeUserIfDisconnected(driverSocketId);
      continue;
    }
    TripService.emit("driverRiderMatchedTrip", tripObjRef);
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
      TripUtils.driverToRiderCancel(io, riderObjRef);
      TripUtils.driverToRiderCancel(io, driverObjRef);
      TripUtils.userStopTrip(riderObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      TripUtils.userStopTrip(driverObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      break;
    }
    // Is driver still active?
    if (!TripUtils.driverToRiderActiveCheck(io, driverObjRef)) {
      TripUtils.driverToRiderCancel(io, riderObjRef);
      TripUtils.driverToRiderCancel(io, driverObjRef);
      TripUtils.userStopTrip(riderObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      TripUtils.userStopTrip(driverObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      break;
    }
    // BRAD: 5/4/2022 removed because it defeats the purpose of the active checks above
    // keep alive
    //riderObjRef.lastUpdate = Date.now();
    //driverObjRef.lastUpdate = Date.now();
    // calculate the distance between the rider and driver
    let distance = TripUtils.getRiderDriverDistance(riderObjRef, driverObjRef);
    // see if the driver is within proximity
    if (distance > driverToRiderProximity) {
      // tell rider
      let riderData = {};
      riderData.message = "Driver hasn't arrived yet!"
      riderData.timestamp = Date.now();
      riderData.socketId = riderSocketId;
      io.to(riderSocketId).emit('tripDriverToRiderProgress', riderData);
      // tell driver
      let driverData = {};
      driverData.message = "Go to rider."
      driverData.timestamp = Date.now();
      driverData.socketId = driverSocketId;
      driverData.riderLong = riderObjRef.long;
      driverData.riderLat = riderObjRef.lat;
      io.to(driverSocketId).emit('tripDriverToRiderProgress', driverData);
      await sleep(5000);
      continue;
    }
    // tell the Rider
    let riderData = {};
    riderData.message = "The driver is coming to pick you up."
    riderData.timestamp = Date.now();
    riderData.socketId = riderSocketId;
    io.to(riderSocketId).emit('tripDriverToRiderProgress', riderData);
    // driver has arrived!
    // send driver a confirmation
    let driverData = {};
    driverData.message = "Have you picked up the rider?"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    driverData.riderLong = riderObjRef.long;
    driverData.riderLat = riderObjRef.lat;
    io.to(driverSocketId).emit('tripDriverToRiderConfirm', driverData);
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
      TripUtils.togetherCancel(io, riderObjRef);
      TripUtils.togetherCancel(io, driverObjRef);
      TripUtils.userStopTrip(riderObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      TripUtils.userStopTrip(driverObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      break;
    }
    if (!TripUtils.togetherActiveCheck(io, driverObjRef)) {
      TripUtils.togetherCancel(io, riderObjRef);
      TripUtils.togetherCancel(io, driverObjRef);
      TripUtils.userStopTrip(riderObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      TripUtils.userStopTrip(driverObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      break;
    }
    // keep alive
    riderObjRef.lastUpdate = Date.now();
    driverObjRef.lastUpdate = Date.now();
    // calculate the distance between the rider and driver
    let riderDriverDistance = TripUtils.getRiderDriverDistance(riderObjRef, driverObjRef);
    // see if the driver is within proximity
    if (riderDriverDistance > driverToRiderProximity) {
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
    // calculate the distance between the rider and destination
    let riderDestinationDistance = TripUtils.getRiderDestinationDistance(riderObjRef, tripObjRef);
    // see if the driver is within proximity
    if (riderDestinationDistance > riderDestinationProximity) {
      let riderData = {};
      riderData.message = "Still on the way to destination!"
      riderData.timestamp = Date.now();
      riderData.socketId = riderSocketId;
      riderData.destDistance = riderDestinationDistance;
      riderData.destDistanceThresh = riderDestinationProximity;
      io.to(riderSocketId).emit('tripTogetherProgress', riderData);
      let driverData = {};
      driverData.message = "Still on the way to destination!"
      driverData.timestamp = Date.now();
      driverData.socketId = driverSocketId;
      driverData.destDistance = riderDestinationDistance;
      driverData.destDistanceThresh = riderDestinationProximity;
      io.to(driverSocketId).emit('tripTogetherProgress', driverData);
      await sleep(5000);
      continue;
    }
    // set user flags
    riderObjRef.tripMatching = false;
    riderObjRef.tripDoing = false;
    driverObjRef.tripMatching = false;
    driverObjRef.tripDoing = false;
    // send driver a confirmation
    let riderData = {};
    riderData.message = "You've arrived at your destination!"
    riderData.timestamp = Date.now();
    riderData.socketId = riderSocketId;
    io.to(riderSocketId).emit('tripTogetherSuccess', riderData);
    // tell the Rider
    let driverData = {};
    driverData.message = "You've arrived at your destination!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('tripTogetherSuccess', driverData);
    // set the trip complete flags
    tripObjRef.completed = true;
    TripUtils.userStopTrip(riderObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
    TripUtils.userStopTrip(driverObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
    console.log(driverSocketId + "(" + driverObjRef.firstName + ") and " + riderSocketId + "(" + riderObjRef.firstName + ") completed a trip!");
    // let them rate trip
    // both local only
    TripService.emit("completeTrip", tripObjRef);
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
  // rider
  if (riderObjRef) {
    let riderData = {};
    riderData.message = "Please rate your driver"
    riderData.timestamp = Date.now();
    riderData.socketId = riderSocketId;
    riderData.tripId = tripId;
    io.to(riderSocketId).emit('rateBegin', riderData);
  }
  // driver
  if (driverObjRef) {
    let driverData = {};
    driverData.message = "Please rate your driver"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    driverData.tripId = tripId;
    io.to(driverSocketId).emit('rateBegin', driverData);
  }
}

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
    return;
  }
  // Is the driver involved with this trip?
  if (tripObjRef.driverSocketId != driverSocketId) {
    let driverData = {};
    driverData.message = "ERROR: you are not assigned to this trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
    return;
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
    return;
  }
  // Is the rider already doing a trip?
  if (riderObjRef.tripDoing) {
    let driverData = {};
    driverData.message = "ERROR: the rider already is in a trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
    return;
  }
  // Is the driver already doing a trip?
  if (driverObjRef.tripDoing) {
    let driverData = {};
    driverData.message = "ERROR: You are already is in a trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
    return;
  }
  // Trip conditions are satisfied
  // Set trip flags
  tripObjRef.driverMatchedConfirm = true;
  riderObjRef.tripDoing = true;
  driverObjRef.tripDoing = true;
  driverSocketIdToTripMap.set(driverSocketId, tripId);
  // emit messages
  let driverData = {};
  driverData.message = "Matched to a rider!"
  driverData.timestamp = Date.now();
  driverData.socketId = driverSocketId;
  driverData.riderSocketId = riderSocketId;
  driverData.riderFirstName = riderObjRef.firstName;
  driverData.riderLastName = riderObjRef.lastName;
  driverData.riderLong = riderObjRef.long;
  driverData.riderLat = riderObjRef.lat;
  io.to(driverSocketId).emit('tripDriverToRiderBegin', driverData);
  let riderData = {};
  riderData.message = "Matched to a driver!"
  riderData.timestamp = Date.now();
  riderData.socketId = riderSocketId;
  riderData.driverSocketId = driverSocketId;
  riderData.driverFirstName = driverObjRef.firstName;
  riderData.driverLastName = driverObjRef.lastName;
  io.to(riderSocketId).emit('tripDriverToRiderBegin', riderData);
  console.log(driverSocketId + "(" + driverObjRef.firstName + ") and " + riderSocketId + "(" + riderObjRef.firstName + ") matched!");
}

function tripDriverToRiderConfirmDone(driverSocketId) {
  let driverObjRef = userMap.get(driverSocketId);
  // Is the current user already involved with a trip?
  let tripIdRef = driverSocketIdToTripMap.get(driverSocketId);
  if (!tripIdRef) {
    let driverData = {};
    driverData.message = "You are not on a trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('tripDriverToRiderStop', driverData);
    return;
  }
  let tripId = tripIdRef;
  // Does the trip ID exist?
  let tripObjRef = tripMap.get(tripId);
  if (tripObjRef === undefined || !tripObjRef) {
    let driverData = {};
    driverData.message = "ERROR: can't find trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('tripDriverToRiderStop', driverData);
    return;
  }
  // Is the driver involved with this trip?
  if (tripObjRef.driverSocketId != driverSocketId) {
    let driverData = {};
    driverData.message = "ERROR: you are not assigned to this trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('tripDriverToRiderStop', driverData);
    return;
  }
  // Does the rider still exist?
  let riderSocketId = tripObjRef.riderSocketId;
  let riderObjRef = userMap.get(riderSocketId);
  if (riderObjRef === undefined || !riderObjRef) {
    let driverData = {};
    driverData.message = "ERROR: the rider has gone inactive!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    io.to(driverSocketId).emit('tripDriverToRiderStop', driverData);
    return;
  }
  // Rider pickup conditions are satisfied
  // Set trip flags
  tripObjRef.driverMatchedConfirm = true;
  tripObjRef.inProgress = true;
  riderObjRef.tripDoing = true;
  driverObjRef.tripDoing = true;
  // emit messages
  let driverData = {};
  driverData.message = "Trip together begins!"
  driverData.timestamp = Date.now();
  driverData.socketId = driverSocketId;
  driverData.riderSocketId = riderSocketId;
  driverData.riderFirstName = riderObjRef.firstName;
  driverData.riderLastName = riderObjRef.lastName;
  driverData.endLong = tripObjRef.endLong;
  driverData.endLat = tripObjRef.endLat;
  io.to(driverSocketId).emit('tripTogetherBegin', driverData);
  let riderData = {};
  riderData.message = "Trip together begins!"
  riderData.timestamp = Date.now();
  riderData.socketId = riderSocketId;
  riderData.driverSocketId = driverSocketId;
  riderData.driverFirstName = driverObjRef.firstName;
  riderData.driverLastName = driverObjRef.lastName;
  riderData.endLong = tripObjRef.endLong;
  riderData.endLat = tripObjRef.endLat;
  io.to(riderSocketId).emit('tripTogetherBegin', riderData);
  console.log(driverSocketId + "(" + driverObjRef.firstName + ") and " + riderSocketId + "(" + riderObjRef.firstName + ") together!");
}

function rateDone(socketId, tripId, data) {
  let userObjRef = userMap.get(socketId);
  // Does the trip ID exist?
  let tripObjRef = tripMap.get(tripId);
  if (tripObjRef === undefined || !tripObjRef) {
    let driverData = {};
    driverData.message = "ERROR: can't find trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = socketId;
    io.to(socketId).emit('rateProgress', driverData);
    return;
  }
  // Is the driver involved with this trip?
  if ((userObjRef.type == "driver" && tripObjRef.driverSocketId != socketId) || (userObjRef.type == "rider" && tripObjRef.riderSocketId != socketId)) {
    let driverData = {};
    driverData.message = "ERROR: you are not assigned to this trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = socketId;
    io.to(socketId).emit('rateProgress', driverData);
    return;
  }
  // rate conditions are satisfied
  // Set flags
  if (userObjRef.type == "driver") {
    tripObjRef.hasDriverRating = true;
    tripObjRef.driverRating = data.score;
  } else if (userObjRef.type == "rider") {
    tripObjRef.hasRiderRating = true;
    tripObjRef.riderRating = data.score;
  }
  // emit messages
  let driverData = {};
  driverData.message = "Trip rated!"
  driverData.timestamp = Date.now();
  driverData.socketId = socketId;
  driverData.score = data.score;
  io.to(socketId).emit('rateDone', driverData);
  console.log(socketId + "(" + userObjRef.firstName + ") rated trip ID:", tripId, "with a score:", data.score);
  TripService.emit("rateTrip", tripObjRef);
}

const MapServer = (app) => {
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
      io.sockets.emit('positionData', data);
    })

    socket.on('requestRide', (data) => {
      if (userObjRef.tripMatching) {
        let riderData = {};
        riderData.message = "User is already being matched!"
        riderData.timestamp = Date.now();
        riderData.socketId = socket.id;
        io.to(socket.id).emit('requestRideProgress', riderData);
      }
      if (!data) {
        let riderData = {};
        riderData.message = "ERROR: no data object"
        riderData.timestamp = Date.now();
        riderData.socketId = socket.id;
        io.to(socket.id).emit('requestRideProgress', riderData);
      }
      if (data.type === undefined || data.cost === undefined || data.endLat === undefined || data.endLong === undefined) {
        let riderData = {};
        riderData.message = "ERROR: data not complete"
        riderData.timestamp = Date.now();
        riderData.socketId = socket.id;
        io.to(socket.id).emit('requestRideProgress', riderData);
      }
      let riderData = {};
      riderData.message = "Trip Matching Started!"
      riderData.timestamp = Date.now();
      riderData.socketId = socket.id;
      io.to(socket.id).emit('requestRideProgress', riderData);
      requestRide(socket.id, data);
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

    socket.on('requestRideDone', (data) => {
      let driverSocketId = socket.id;
      if (data === undefined) {
        console.log("requestRideDone ERROR no data");
        return;
      }
      if (data.tripId === undefined) {
        console.log("requestRideDone ERROR no tripId");
        return;
      }
      let tripId = data.tripId;
      matchDriverToRiderDone(driverSocketId, tripId);
    });

    socket.on('tripDriverToRiderConfirmDone', (data) => {
      let driverSocketId = socket.id;
      tripDriverToRiderConfirmDone(driverSocketId);
    });

    socket.on('rateDone', (data) => {
      if (data === undefined) {
        console.log("rateDone ERROR no data");
        return;
      }
      if (data.tripId === undefined) {
        console.log("rateDone ERROR no tripId");
        return;
      }
      rateDone(socket.id, data.tripId, data);
    });
  });

  TripService.on("driverToRiderTrip", driverToRiderTrip);
  TripService.on("matchRiderDriverTrip", matchDriverToRider);
  TripService.on("togetherTrip", togetherTrip);
  TripService.on("rateTrip", rateTrip);

  httpServer.listen(4001, function() {
    console.log('Position Socket server listening at http://localhost:4001')
  });
  httpServer.on('error', (err) => {
    console.log('server error:')
    console.log(err);
  });

  connectedUserLoop();
  // Create AI
  let driverArray = [];
  if (Constants.FLAG_AI_DRIVERS) {
    driverArray.push(new DriverAI(37.293447, -121.904626));
    driverArray.push(new DriverAI(37.315431, -121.861966));
    driverArray.push(new DriverAI(37.339592, -121.842453));
    driverArray.push(new DriverAI(37.391607, -121.889225));
    driverArray.push(new DriverAI(37.34996, -121.825282));
  }
  let riderArray = [];
  if (Constants.FLAG_AI_RIDERS) {
    riderArray.push(new RiderAI(37.334789, -121.888138));
    riderArray.push(new RiderAI(37.33171, -121.93034));
    riderArray.push(new RiderAI(37.413738, -121.899117));
    riderArray.push(new RiderAI(37.362517, -121.925567));
    riderArray.push(new RiderAI(37.313938, -121.927011));
  }
  for (const driver of driverArray) {
    driver.start();
  }
  for (const rider of riderArray) {
    rider.start();
  }
}

export default MapServer;
