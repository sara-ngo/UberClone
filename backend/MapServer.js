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
let webSocketServer = {};
let connectedUserLoopFlag = true;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function connectedUserLoop() {
  while (connectedUserLoopFlag) {
    await sleep(Constants.userCheckDisconnectMS);
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
      "isActive": true,
      "socketId": socketId,
      "timeCreated": Date.now()
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
  } else if ((userObjRef.lastUpdate + Constants.userDisconnectThresholdMS) < Date.now()) {
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
  return deleteFlag;
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
    webSocketServer.to(riderSocketId).emit('requestRideProgress', riderData);
    return;
  }
  // Checking to see if user exists
  if (!riderObjRef) {
    console.log("SERVER ERROR: Rider does not exist!");
    console.log(riderObjRef);
    let riderData = {};
    riderData.message = "SERVER ERROR: Rider does not exist!"
    riderData.timestamp = Date.now();
    riderData.socketId = riderSocketId;
    webSocketServer.to(riderSocketId).emit('requestRideStop', riderData);
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

/*
This is the process that runs when a user requests a ride and the server attempts to match
them with a driver. The server simply looks for the closest, available driver and matches them
Drivers only have a few seconds to confirm the match before the server releases their claim to the rider
and re-requests a driver (The same driver may be assigned).
*/
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
    if (!TripUtils.matchDriverToRiderActiveCheck(webSocketServer, riderObjRef)) {
      TripUtils.matchDriverToRiderCancel(webSocketServer, riderObjRef);
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
      webSocketServer.to(riderSocketId).emit('requestRideProgress', data)
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
    webSocketServer.to(driverSocketId).emit('requestRideConfirm', driverData);
    // tell the Rider
    let riderData = {};
    riderData.message = "A driver was found! Waiting for them to confirm trip."
    riderData.timestamp = Date.now();
    riderData.socketId = driverSocketId;
    riderData.driverFirstName = driverObjRef.firstName;
    riderData.driverLastName = driverObjRef.lastName;
    riderData.tripId = tripId;
    webSocketServer.to(riderSocketId).emit('requestRideProgress', riderData);
    await sleep(5000);
    // If driver did not accept, then continue the loop and keep searching
    if (!tripObjRef.driverMatchedConfirm) {
      driverObjRef.tripMatching = false;
      if(removeUserIfDisconnected(driverSocketId)){
        continue;
      }
      // notify driver they were unmatched
      let driverData = {};
      driverData.message = "You have been unmatched for not accepting the match in a timely manner."
      driverData.timestamp = Date.now();
      driverData.socketId = driverSocketId;
      webSocketServer.to(driverSocketId).emit('tripDriverToRiderStop', driverData);
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
    if (!TripUtils.driverToRiderActiveCheck(webSocketServer, riderObjRef)) {
      TripUtils.driverToRiderCancel(webSocketServer, riderObjRef);
      TripUtils.driverToRiderCancel(webSocketServer, driverObjRef);
      TripUtils.userStopTrip(riderObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      TripUtils.userStopTrip(driverObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      break;
    }
    // Is driver still active?
    if (!TripUtils.driverToRiderActiveCheck(webSocketServer, driverObjRef)) {
      TripUtils.driverToRiderCancel(webSocketServer, riderObjRef);
      TripUtils.driverToRiderCancel(webSocketServer, driverObjRef);
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
    if (distance > Constants.driverToRiderProximity) {
      // tell rider
      let riderData = {};
      riderData.message = "Driver hasn't arrived yet!"
      riderData.timestamp = Date.now();
      riderData.socketId = riderSocketId;
      webSocketServer.to(riderSocketId).emit('tripDriverToRiderProgress', riderData);
      // tell driver
      let driverData = {};
      driverData.message = "Go to rider."
      driverData.timestamp = Date.now();
      driverData.socketId = driverSocketId;
      driverData.riderLong = riderObjRef.long;
      driverData.riderLat = riderObjRef.lat;
      webSocketServer.to(driverSocketId).emit('tripDriverToRiderProgress', driverData);
      await sleep(5000);
      continue;
    }
    // tell the Rider
    let riderData = {};
    riderData.message = "The driver is coming to pick you up."
    riderData.timestamp = Date.now();
    riderData.socketId = riderSocketId;
    webSocketServer.to(riderSocketId).emit('tripDriverToRiderProgress', riderData);
    // driver has arrived!
    // send driver a confirmation
    let driverData = {};
    driverData.message = "Have you picked up the rider?"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    driverData.riderLong = riderObjRef.long;
    driverData.riderLat = riderObjRef.lat;
    webSocketServer.to(driverSocketId).emit('tripDriverToRiderConfirm', driverData);
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
    if (!TripUtils.togetherActiveCheck(webSocketServer, riderObjRef)) {
      TripUtils.togetherCancel(webSocketServer, riderObjRef);
      TripUtils.togetherCancel(webSocketServer, driverObjRef);
      TripUtils.userStopTrip(riderObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      TripUtils.userStopTrip(driverObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      break;
    }
    if (!TripUtils.togetherActiveCheck(webSocketServer, driverObjRef)) {
      TripUtils.togetherCancel(webSocketServer, riderObjRef);
      TripUtils.togetherCancel(webSocketServer, driverObjRef);
      TripUtils.userStopTrip(riderObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      TripUtils.userStopTrip(driverObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap);
      break;
    }
    // calculate the distance between the rider and driver
    let riderDriverDistance = TripUtils.getRiderDriverDistance(riderObjRef, driverObjRef);
    // see if the driver is within proximity
    if (riderDriverDistance > Constants.driverToRiderProximity) {
      let riderData = {};
      riderData.message = "You've separated from the driver!"
      riderData.timestamp = Date.now();
      riderData.socketId = riderSocketId;
      webSocketServer.to(riderSocketId).emit('tripTogetherProgress', riderData);
      let driverData = {};
      driverData.message = "You've separated from the rider!"
      driverData.timestamp = Date.now();
      driverData.socketId = driverSocketId;
      webSocketServer.to(driverSocketId).emit('tripTogetherProgress', driverData);
      await sleep(5000);
      continue;
    }
    // calculate the distance between the rider and destination
    let riderDestinationDistance = TripUtils.getRiderDestinationDistance(riderObjRef, tripObjRef);
    // see if the driver is within proximity
    if (riderDestinationDistance > Constants.riderDestinationProximity) {
      let riderData = {};
      riderData.message = "Still on the way to destination!"
      riderData.timestamp = Date.now();
      riderData.socketId = riderSocketId;
      riderData.destDistance = riderDestinationDistance;
      riderData.destDistanceThresh = Constants.riderDestinationProximity;
      webSocketServer.to(riderSocketId).emit('tripTogetherProgress', riderData);
      let driverData = {};
      driverData.message = "Still on the way to destination!"
      driverData.timestamp = Date.now();
      driverData.socketId = driverSocketId;
      driverData.destDistance = riderDestinationDistance;
      driverData.destDistanceThresh = Constants.riderDestinationProximity;
      webSocketServer.to(driverSocketId).emit('tripTogetherProgress', driverData);
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
    webSocketServer.to(riderSocketId).emit('tripTogetherSuccess', riderData);
    // tell the Rider
    let driverData = {};
    driverData.message = "You've arrived at your destination!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    webSocketServer.to(driverSocketId).emit('tripTogetherSuccess', driverData);
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
    webSocketServer.to(riderSocketId).emit('rateBegin', riderData);
  }
  // driver
  if (driverObjRef) {
    let driverData = {};
    driverData.message = "Please rate your driver"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    driverData.tripId = tripId;
    webSocketServer.to(driverSocketId).emit('rateBegin', driverData);
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
    webSocketServer.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
    return;
  }
  // Is the driver involved with this trip?
  if (tripObjRef.driverSocketId != driverSocketId) {
    let driverData = {};
    driverData.message = "ERROR: you are not assigned to this trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    webSocketServer.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
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
    webSocketServer.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
    return;
  }
  // Is the rider already doing a trip?
  if (riderObjRef.tripDoing) {
    let driverData = {};
    driverData.message = "ERROR: the rider already is in a trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    webSocketServer.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
    return;
  }
  // Is the driver already doing a trip?
  if (driverObjRef.tripDoing) {
    let driverData = {};
    driverData.message = "ERROR: You are already is in a trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    webSocketServer.to(driverSocketId).emit('requestRideConfirmProgress', driverData);
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
  webSocketServer.to(driverSocketId).emit('tripDriverToRiderBegin', driverData);
  let riderData = {};
  riderData.message = "Matched to a driver!"
  riderData.timestamp = Date.now();
  riderData.socketId = riderSocketId;
  riderData.driverSocketId = driverSocketId;
  riderData.driverFirstName = driverObjRef.firstName;
  riderData.driverLastName = driverObjRef.lastName;
  webSocketServer.to(riderSocketId).emit('tripDriverToRiderBegin', riderData);
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
    webSocketServer.to(driverSocketId).emit('tripDriverToRiderStop', driverData);
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
    webSocketServer.to(driverSocketId).emit('tripDriverToRiderStop', driverData);
    return;
  }
  // Is the driver involved with this trip?
  if (tripObjRef.driverSocketId != driverSocketId) {
    let driverData = {};
    driverData.message = "ERROR: you are not assigned to this trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = driverSocketId;
    webSocketServer.to(driverSocketId).emit('tripDriverToRiderStop', driverData);
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
    webSocketServer.to(driverSocketId).emit('tripDriverToRiderStop', driverData);
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
  webSocketServer.to(driverSocketId).emit('tripTogetherBegin', driverData);
  let riderData = {};
  riderData.message = "Trip together begins!"
  riderData.timestamp = Date.now();
  riderData.socketId = riderSocketId;
  riderData.driverSocketId = driverSocketId;
  riderData.driverFirstName = driverObjRef.firstName;
  riderData.driverLastName = driverObjRef.lastName;
  riderData.endLong = tripObjRef.endLong;
  riderData.endLat = tripObjRef.endLat;
  webSocketServer.to(riderSocketId).emit('tripTogetherBegin', riderData);
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
    webSocketServer.to(socketId).emit('rateProgress', driverData);
    return;
  }
  // Is the driver involved with this trip?
  if ((userObjRef.type == "driver" && tripObjRef.driverSocketId != socketId) || (userObjRef.type == "rider" && tripObjRef.riderSocketId != socketId)) {
    let driverData = {};
    driverData.message = "ERROR: you are not assigned to this trip!"
    driverData.timestamp = Date.now();
    driverData.socketId = socketId;
    webSocketServer.to(socketId).emit('rateProgress', driverData);
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
  webSocketServer.to(socketId).emit('rateDone', driverData);
  console.log(socketId + "(" + userObjRef.firstName + ") rated trip ID:", tripId, "with a score:", data.score);
  TripService.emit("rateTrip", tripObjRef);
}

const MapServer = (webSocketServer_) => {
  webSocketServer = webSocketServer_;

  webSocketServer.on('connection', socket => {
    // Reject all connections that are not for the trip service
    if(!socket.handshake.query.service){
      return;
    }
    if(socket.handshake.query.service != "trip"){
      return;
    }
    // Create a new user
    newUserIfNotExist(socket.id);
    // user object passed by reference
    var userObjRef = userMap.get(socket.id);
    console.log("[MapServer] User Connected:");
    console.log(userObjRef);

    socket.on('request_target', () => {
      webSocketServer.allSockets().then((result) => {
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
      userObjRef.heading = data.heading;
      userObjRef.type = data.type;
      /*
      Don't query for the user information too often
      */
      if (userObjRef.token != data.token) {
        userObjRef.token = data.token;
        // defaults
        userObjRef.userId = -1;
        userObjRef.firstName = "FIRST_NAME";
        userObjRef.lastName = "LAST_NAME";
        userObjRef.email = "EMAIL@EMAIL.COM";
        // get user info
        let userInfo = await UserUtils.getUserInfoByTokenId(userObjRef.token);
        if (userInfo) {
          userObjRef.userId = userInfo._id;
          userObjRef.firstName = userInfo.firstName;
          userObjRef.lastName = userInfo.lastName;
          userObjRef.email = userInfo.email;
        }
      }
      // console.log("position update from:", socket.id, "at", data.timestamp)
      webSocketServer.sockets.emit('positionData', data);
    })

    socket.on('requestRide', (data) => {
      if (userObjRef.tripMatching) {
        let riderData = {};
        riderData.message = "User is already being matched!"
        riderData.timestamp = Date.now();
        riderData.socketId = socket.id;
        webSocketServer.to(socket.id).emit('requestRideStop', riderData);
      }
      if (!data) {
        let riderData = {};
        riderData.message = "ERROR: no data object"
        riderData.timestamp = Date.now();
        riderData.socketId = socket.id;
        webSocketServer.to(socket.id).emit('requestRideStop', riderData);
      }
      if (data.type === undefined || data.cost === undefined || data.endLat === undefined || data.endLong === undefined) {
        let riderData = {};
        riderData.message = "ERROR: data not complete"
        riderData.timestamp = Date.now();
        riderData.socketId = socket.id;
        webSocketServer.to(socket.id).emit('requestRideStop', riderData);
      }
      let riderData = {};
      riderData.message = "Trip Matching Started!"
      riderData.timestamp = Date.now();
      riderData.socketId = socket.id;
      webSocketServer.to(socket.id).emit('requestRideProgress', riderData);
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
      webSocketServer.to(socket.id).emit('currentTripData', data)
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

  connectedUserLoop();
  // Create AI
  let driverArray = [];
  if (Constants.FLAG_AI_DRIVERS) {
    for (let i = 0; i < Constants.NUM_AI_DRIVERS; i++) {
      let lat = TripUtils.generateRandomDecimal(37.399026791869375, 37.24143720137937);
      let long = TripUtils.generateRandomDecimal(-122.04096126819005, -121.77050796956928);
      driverArray.push(new DriverAI(lat, long));
    }
  }
  let riderArray = [];
  if (Constants.FLAG_AI_RIDERS) {
    for (let i = 0; i < Constants.NUM_AI_RIDERS; i++) {
      let lat = TripUtils.generateRandomDecimal(37.399026791869375, 37.24143720137937);
      let long = TripUtils.generateRandomDecimal(-122.04096126819005, -121.77050796956928);
      let endLat = TripUtils.generateRandomDecimal(37.399026791869375, 37.24143720137937);
      let endLong = TripUtils.generateRandomDecimal(-122.04096126819005, -121.77050796956928);
      riderArray.push(new RiderAI(lat, long, endLat, endLong));
    }
  }
  for (const driver of driverArray) {
    driver.start();
  }
  for (const rider of riderArray) {
    rider.start();
  }
}

export default MapServer;
