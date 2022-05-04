import {
  User,
  Trip
} from '../models/user.js'
import TripService from './components/TripService/emitter.js';

function DatabaseServer(app) {
  // routes
  app.post('/rate', function(request, response) {
    const id = request.body.otherID
    const tripID = request.body.tripID
    const rating = request.body.rating
    const ratingForDriver = request.body.wasRider
    let userUpdateMessage = "nothing";
    let tripUpdateMessage = "nothing";
    User.findById(id, (err, user) => {
      // calculate the new rating
      if (user) {
        if (user.rating) {
          user.rating = (user.rating * user.numRatings + rating) / (user.numRatings + 1)
          user.numRatings++
        } else {
          user.rating = rating
          user.numRatings = 1
        }
        user.save()
        userUpdateMessage = "User updated!";
      }
    })
    Trip.findById(tripID, (err, trip) => {
      if (trip) {
        console.log(ratingForDriver)
        if (ratingForDriver) {
          trip.driverRating = true
        } else {
          trip.riderRating = true
        }
        trip.save()
        tripUpdateMessage = "Trip updated!";
      }
    })
    response.send({
      "userUpdateMessage": userUpdateMessage,
      "tripUpdateMessage": tripUpdateMessage
    })
  })

  app.post('/user', function(req, res) {
    const id = req.body.data
    User.findById(id, (err, data) => {
      res.send({
        user: data
      })
    })
  })

  app.post('/trip', function(req, res) {
    const id = req.body.data
    Trip.findById(id, (err, data) => {
      res.send({
        trip: data
      })
    })
  })

  /*
  let tripData = {
    "tripId": tripId,
    "driverMatched": false,
    "driverMatchedConfirm": false,
    "inProgress": false,
    "completed": false,
    "hasRiderRating": false,
    "hasDriverRating": false,
    "riderSocketId": 0,
    "riderId": "",
    "riderName": "",
    "riderRating": 0,
    "driverSocketId": 0,
    "driverId": "",
    "driverName": "",
    "driverRating": 0,
    "destLong": 0.0,
    "destLat": 0.0,
    "type": "UberX",
    "costEstimate": "16.00"
  }
  */

  TripService.on("newTrip", (data) => {
    // TODO: Handle adding a trip to the database
    // Triggers when request a ride button is pressed by rider
    //console.log("newTrip data:");
    //console.log(data);
  });

  TripService.on("driverRiderMatchedTrip", (data) => {
    // TODO: Handle adding a trip to the database
    // Triggers when driver and rider are matched successfully
    //console.log("driverRiderMatchedTrip data:");
    //console.log(data);
  });

  TripService.on("completeTrip", (data) => {
    // TODO: Handle adding a trip to the database
    // Triggers when the trip is completed successfully
    //console.log("completeTrip data:");
    //console.log(data);
  });

  TripService.on("rateTrip", (data) => {
    // TODO: Handle adding a trip to the database
    // Triggers when either the driver or rider rate the trip
    //console.log("rateTrip data:");
    //console.log(data);
  });
}
export default DatabaseServer;
