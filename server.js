import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { createServer } from "http";
import { Server } from "socket.io";
import User from './models/user.js'
import Chat from './models/driverPositionSocket.js'
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

// socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

//Whenever someone connects this gets executed
io.on('connection', function(socket) {
   console.log('A user connected');

   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });
});
Chat(io);

// get something from database
app.get('/', (req, res) => {
  User.User.find({}, (err, data) => {
    res.send(data)
  })
})

// listen for requests :)
const listener = httpServer.listen(process.env.PORT || 5000, function () {
  console.log("Node is running at http://localhost:" + listener.address().port)
})

export default app
