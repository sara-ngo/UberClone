
import { User, Trip } from '../models/user.js'

function DatabaseServer(app) {
  // routes
  app.post('/rate', function (request, response) {
    const id = request.body.otherID
    const tripID = request.body.tripID
    const rating = request.body.rating
    const ratingForDriver = request.body.wasRider
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
      }
    })
    Trip.findById(tripID, (err, trip) => {
      if(trip) {
        console.log(ratingForDriver)
        if(ratingForDriver){
          trip.driverRating = true
        } else{
          trip.riderRating = true
        }
        trip.save()
      }
    })
  })

  app.post('/user', function (req, res) {
    const id = req.body.data
    User.findById(id, (err, data) => {
      res.send({user: data})
    })
  })

  app.post('/trip', function (req, res) {
    const id = req.body.data
    Trip.findById(id, (err, data) => {
      res.send({trip: data})
    })
  })
}
export default DatabaseServer;
