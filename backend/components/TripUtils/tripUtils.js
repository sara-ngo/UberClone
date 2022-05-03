import {
  v4 as uuid
} from 'uuid';

class App {
  static generateTripId(tripMap) {
    while (true) {
      const tripId = uuid();
      let tripObjRef = tripMap.get(tripId);
      if (!tripObjRef) {
        return tripId;
      }
    }
    return false;
  }

  static matchDriverToRiderActiveCheck(io, userObjRef) {
    if (userObjRef === undefined) {
      return false;
    } else if (userObjRef.isActive === undefined || !userObjRef.isActive) {
      let data = {};
      data.message = "You were removed from the matching system for being inactive!"
      data.timestamp = Date.now();
      data.socketId = userObjRef.socketId;
      io.to(userObjRef.socketId).emit('requestRideStop', data);
      return false;
    }
    return true;
  }

  static matchDriverToRiderCancel(io, userObjRef) {
    if (userObjRef) {
      let data = {};
      data.message = "Your trip has been cancelled!"
      data.timestamp = Date.now();
      data.socketId = userObjRef.socketId;
      io.to(userObjRef.socketId).emit('requestRideStop', data);
    }
  }

  static driverToRiderActiveCheck(io, userObjRef) {
    if (userObjRef === undefined) {
      return false;
    } else if (userObjRef.isActive === undefined || !userObjRef.isActive) {
      let data = {};
      data.message = "Your trip has been cancelled due to inactivity!"
      data.timestamp = Date.now();
      data.socketId = userObjRef.socketId;
      io.to(userObjRef.socketId).emit('tripDriverToRiderStop', data);
      return false;
    }
    return true;
  }

  static driverToRiderCancel(io, userObjRef) {
    if (userObjRef) {
      let data = {};
      data.message = "Your trip has been cancelled!"
      data.timestamp = Date.now();
      data.socketId = userObjRef.socketId;
      io.to(userObjRef.socketId).emit('tripDriverToRiderStop', data);
    }
  }

  static togetherActiveCheck(io, userObjRef) {
    if (userObjRef === undefined) {
      return false;
    } else if (userObjRef.isActive === undefined || !userObjRef.isActive) {
      let data = {};
      data.message = "Your trip has been cancelled due to inactivity!"
      data.timestamp = Date.now();
      data.socketId = userObjRef.socketId;
      io.to(userObjRef.socketId).emit('tripTogetherStop', data);
      return false;
    }
    return true;
  }

  static togetherCancel(io, userObjRef) {
    if (userObjRef) {
      let data = {};
      data.message = "Your trip has been cancelled!"
      data.timestamp = Date.now();
      data.socketId = userObjRef.socketId;
      io.to(userObjRef.socketId).emit('tripTogetherStop', data);
    }
  }

  static getClosestDriver(driverPosArray, riderObjRef) {
    // calculate the distance between the rider and each driver
    let driverDistanceArray = []
    for (const element of driverPosArray) {
      driverDistanceArray.push({
        distance: Math.hypot(riderObjRef.long - element.long, riderObjRef.lat - element.lat),
        socketId: element.socketId
      });
    }
    // sort drivers by smallest distance
    driverDistanceArray.sort(function(a, b) {
      return a.distance - b.distance;
    });
    if (driverDistanceArray.length > 0) {
      return driverDistanceArray[0];
    }
    return false;
  }

  static getRiderDriverDistance(riderObjRef, driverObjRef) {
    return Math.hypot(riderObjRef.long - driverObjRef.long, riderObjRef.lat - driverObjRef.lat);
  }

  static getRiderDestinationDistance(riderObjRef, tripObjRef) {
    return Math.hypot(riderObjRef.long - tripObjRef.destLong, riderObjRef.lat - tripObjRef.destLat);
  }

  static userStopTrip(userObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap){
    userObjRef.tripDoing = false;
    riderSocketIdToTripMap.delete(userObjRef.socketId);
    driverSocketIdToTripMap.delete(userObjRef.socketId);
  }
}

export default App;
