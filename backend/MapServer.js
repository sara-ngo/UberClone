import http from 'http'
import {
  Server
} from 'socket.io'

var userMap = new Map();
var driverPosArray = [];
var io = {};

function requestRide(socketId) {
  var userObjRef = userMap.get(socketId);
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
    return;
  }
  // driver found. send them a confirmation
  driverDistanceArray[0].socketId
  var data = {};
  data.message = "A rider has matched you for a ride!"
  data.timestamp = Date.now();
  data.socketId = driverDistanceArray[0].socketId;
  data.riderProfile = userObjRef;
  console.log(driverDistanceArray);
  io.to(driverDistanceArray[0].socketId).emit('requestRideDriverConfirm', data);
  // tell the Rider
  var data = {};
  data.message = "A driver was found! Waiting for them to confirm trip."
  data.timestamp = Date.now();
  data.socketId = socketId;
  io.to(socketId).emit('requestRideProgress', data);
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
      data.timestamp = Date.now();
      data.socketId = socket.id;
      userObjRef.lastUpdate = Date.now();
      userObjRef.socketId = socket.id;
      userObjRef.long = data.long;
      userObjRef.lat = data.lat;
      userObjRef.type = data.type;
      console.log("position update from: ", socket.id)
      // Add type==driver to the driverPosArray
      if (data.type == "driver") {
        var result = driverPosArray.find(obj => {
          return obj.socketId == socket.id;
        });
        if (!result) {
          // Does not exist, so create a new entry
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
  })

  httpServer.listen(4001, function() {
    console.log('Position Socket server listening at http://localhost:4001')
  });
  httpServer.on('error', (err) => {
    console.log('server error:')
    console.log(err)
  });
}

export default MapServer;
