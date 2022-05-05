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

  static getClosestDriver(userMap, riderObjRef) {
    // calculate the distance between the rider and each driver
    let driverDistanceArray = [];
    for (let [key, driverObjRef] of userMap) {
      // Don't match non-drivers
      if (driverObjRef.type != "driver") {
        continue;
      }
      // Don't match inactive drivers
      if (!driverObjRef.isActive) {
        continue;
      }
      // Don't match currently matching drivers and busy drivers
      if (driverObjRef.tripMatching || driverObjRef.tripDoing) {
        continue;
      }
      driverDistanceArray.push({
        distance: Math.hypot(riderObjRef.long - driverObjRef.long, riderObjRef.lat - driverObjRef.lat),
        socketId: driverObjRef.socketId
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
    return Math.hypot(riderObjRef.long - tripObjRef.endLong, riderObjRef.lat - tripObjRef.endLat);
  }

  static userStopTrip(userObjRef, riderSocketIdToTripMap, driverSocketIdToTripMap) {
    userObjRef.tripMatching = false;
    userObjRef.tripDoing = false;
    riderSocketIdToTripMap.delete(userObjRef.socketId);
    driverSocketIdToTripMap.delete(userObjRef.socketId);
  }

  static generateRandomDecimal(min, max) {
    return Math.random() * (max - min) + min;
  };
}

export default App;
