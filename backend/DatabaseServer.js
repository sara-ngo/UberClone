
import { User } from '../models/user.js'

function DatabaseServer(app) {
  // routes
  app.post('/rate:id', function (request, response) {
    const { id } = request.params
    const rating = request.body.rating
    User.findById(id, (err, user) => {
      if (err) throw err
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
  })

  app.post('/user', function (req, res) {
    const id = req.body.data
    User.findById(id, (err, data) => {
      res.send({user: data})
    })
  })
}
export default DatabaseServer;
