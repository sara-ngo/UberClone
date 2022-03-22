import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from './models/user.js'
import path from 'path'
// Required environment variables- MONGO_URI

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// connect to database
mongoose.connect(process.env.MONGO_URI)
  .then((result) => {
    result.connection.client.db().admin().listDatabases()
      .then((result) => {
        result.databases.forEach((db) => console.log(` - ${db.name}`))
      })
    })

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"))

// listen for requests :)
const listener = app.listen(process.env.PORT || 5000, function () {
  console.log("Node is running at http://localhost:" + listener.address().port)
})

// get something from database
app.get('/', (req, res) => {
  User.User.find({}, (err, data) => {
    res.send(data)
  })
})

app.get("/estimate", function (request, response) {
  response.sendFile(path.resolve(path.dirname('')) + "/frontend/public/estimate.html");
});

export default app
