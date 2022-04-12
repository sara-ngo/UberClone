import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from './models/user.js'
import MapServer from './models/mapServer.js'
import http from 'http'
import {
  Server
} from 'socket.io'
// Required environment variables- MONGO_URI

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }
})

io.on('connection', socket => {
  console.log(`User Connected: ${socket.id}`)

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

  socket.on('send_pm', (data) => {
    console.log(data)
    socket.to(data.target).emit('receive_pm', data)
  })
})

httpServer.listen(4000, function() {
  console.log('Socket server listening at http://localhost:4000')
})

MapServer();

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
const listener = app.listen(process.env.PORT || 5000, function() {
  console.log("Node is running at http://localhost:" + listener.address().port)
})

// get something from database
app.get('/', (req, res) => {
  User.User.find({}, (err, data) => {
    res.send(data)
  })
})

export default app
