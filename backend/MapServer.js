import http from 'http'
import {
  Server
} from 'socket.io'

var userMap = new Map();
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
      tripMatching: false,
      tripDoing: false
    });
  }
}

function removeUserIfDisconnected(socketId) {
  // console.log("attempt to remove", socketId);
  var userObjRef = userMap.get(socketId);
  var deleteFlag = false;
  if (!userObjRef) {
    deleteFlag = true;
  } else if (!userObjRef.lastUpdate) {
    // delete if no update time
    deleteFlag = true;
  } else if((userObjRef.lastUpdate + 30000) < Date.now()) {
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
    userMap.delete(socketId);
  }
}

async function requestRide(socketId) {
  var userObjRef = userMap.get(socketId);
  while (true) {
    var driverDistanceArray = []
    // calculate the distance between the rider and each driver
    for (const element of driverPosArray) {
      driverDistanceArray.push({
        distance: Math.hypot(userObjRef.long - element.long, userObjRef.lat - element.lat),
        socketId: element.socketId
      });
    }
    // sort drivers by smallest distance
    driverDistanceArray.sort(function(a, b) {
      return a.distance - b.distance;
    });
    // see if the closest driver exists
    if (!driverDistanceArray[0]) {
      userObjRef.tripMatching = false;
      var data = {};
      data.message = "No drivers were found!"
      data.timestamp = Date.now();
      data.socketId = socketId;
      io.to(socketId).emit('requestRideProgress', data)
      await sleep(5000);
      continue;
    }
    // driver found.
    // set variables
    var driverSocketId = driverDistanceArray[0].socketId;
    var driverObjRef = userMap.get(driverSocketId);
    // if the driver can't be found then remove from the list
    if (!driverObjRef) {
      removeUserIfDisconnected(driverSocketId);
      await sleep(1000);
      continue;
    }
    // set trip properties
    userObjRef.driver = {}
    userObjRef.driver.socketId = driverSocketId;
    driverObjRef.rider = {}
    driverObjRef.rider.socketId = socketId;
    // send driver a confirmation
    var data = {};
    data.message = "A rider has matched you for a ride!"
    data.timestamp = Date.now();
    data.socketId = driverDistanceArray[0].socketId;
    data.riderProfile = userObjRef;
    io.to(driverSocketId).emit('requestRideDriverConfirm', data);
    // tell the Rider
    var data = {};
    data.message = "A driver was found! Waiting for them to confirm trip."
    data.timestamp = Date.now();
    data.socketId = socketId;
    io.to(socketId).emit('requestRideProgress', data);
    await sleep(5000);
    // If driver did not accept, then stop break out of loop to stop searching
    if (!userObjRef.tripDoing) {
      removeUserIfDisconnected(driverSocketId);
      continue;
    }
    break;
  }
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
    userMap.set(socket.id, {
      tripMatching: false,
      tripDoing: false
    });
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

    socket.on('positionUpdate', (data) => {
      newUserIfNotExist(socket.id);
      userObjRef = userMap.get(socket.id);
      data.timestamp = Date.now();
      data.socketId = socket.id;
      userObjRef.lastUpdate = Date.now();
      userObjRef.socketId = socket.id;
      userObjRef.long = data.long;
      userObjRef.lat = data.lat;
      userObjRef.type = data.type;
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

    socket.on('confirmTrip', () => {
      var driverRes = {};
      var riderRes = {};
      if (userObjRef.tripDoing) {
        driverRes.message = "You already have a trip in progress!"
        driverRes.timestamp = Date.now();
        driverRes.socketId = socket.id;
        io.to(socket.id).emit('confirmTripProgress', driverRes);
      } else if (!userObjRef.rider) {
        driverRes.message = "ERROR!"
        driverRes.timestamp = Date.now();
        driverRes.socketId = socket.id;
        io.to(socket.id).emit('confirmTripProgress', driverRes);
      } else {
        userObjRef.tripDoing = true;
        var riderSocketId = userObjRef.rider.socketId;
        var riderObjRef = userMap.get(riderSocketId);
        riderObjRef.tripDoing = true;
        // emit messages
        driverRes.message = "Trip started!"
        driverRes.timestamp = Date.now();
        driverRes.socketId = socket.id;
        io.to(socket.id).emit('tripBeginDriver', driverRes);
        riderRes.message = "Trip started!"
        riderRes.timestamp = Date.now();
        riderRes.socketId = userObjRef.rider.socketId;
        io.to(userObjRef.rider.socketId).emit('tripBeginRider', riderRes);
        console.log(socket.id + " and " + userObjRef.rider.socketId + " matched!");
      }
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
