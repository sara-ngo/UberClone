import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import {
  createServer
} from "http";
import {
  Server
} from "socket.io";
import {User} from './backend/models/user.js'
import ChatServer from './backend/ChatServer.js'
import MapServer from './backend/MapServer.js'
import AuthServer from './backend/AuthServer.js'
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
  });

AuthServer(app);
ChatServer(app);
MapServer(app);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"))

// get something from database
app.get('/', (req, res) => {
  User.User.find({}, (err, data) => {
    res.send(data)
  })
})

// listen for requests :)
const listener = app.listen(process.env.PORT || 5000, function() {
  console.log("Node is running at http://localhost:" + listener.address().port)
})

export default app
