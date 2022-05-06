import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import http, {
  createServer
} from "http";
import {
  Server
} from 'socket.io'
import connection from './db.js'
import ChatServer from './backend/ChatServer.js'
import MapServer from './backend/MapServer.js'
import AuthServer from './backend/AuthServer.js'
import DatabaseServer from './backend/DatabaseServer.js'
import * as Constants from "./constants.js"

// Required environment variables- MONGO_URI
dotenv.config()

const app = express()

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  //intercepts OPTIONS method
  if ('OPTIONS' === req.method) {
    //respond with 200
    res.send(200);
  } else {
    //move on
    next();
  }
});

app.options("/*", function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.send(200);
});

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json())

// connect to database
connection();

// list databases in console as a test
const defaultConnection = mongoose.connection;
mongoose.connection.on("connected", () => {
  mongoose.connection.client.db().admin().listDatabases()
    .then((result) => {
      result.databases.forEach((db) => console.log(` - ${db.name}`))
    })
});

// Create HTTP SERVER
const httpServer = http.createServer(app);

// Create WebSocket Server
let webSocketServerOptions = {
  cors: {
    origin: "*",
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
    credentials: false
  }
};
const webSocketServer = new Server(httpServer, webSocketServerOptions);

// TCP servers
AuthServer(app);
DatabaseServer(app);
// UDP servers, websockets
// Chat Server
let httpServerChat = httpServer;
let webSocketServerChat = webSocketServer;
/*
Heroku and glitch.com only allow one externally facing port
setting Constants.CHAT_SERVER_NEW = false and Constants.MAP_SERVER_NEW = false
will force all servers to listen on a single port
*/
if (Constants.CHAT_SERVER_NEW) {
  httpServerChat = http.createServer(app);
  webSocketServerChat = new Server(httpServerChat, webSocketServerOptions);
}
ChatServer(webSocketServerChat);
if (Constants.CHAT_SERVER_NEW) {
  const listener = httpServerChat.listen(Constants.CHAT_SERVER_PORT, function(err) {
    if (err) throw err;
    console.log('Chat Socket server listening at http://localhost:' + listener.address().port);
  });
}
// Map Server
let httpServerMap = httpServer;
let webSocketServerMap = webSocketServer;
if (Constants.MAP_SERVER_NEW) {
  httpServerMap = http.createServer(app);
  webSocketServerMap = new Server(httpServerMap, webSocketServerOptions);
}
MapServer(webSocketServerMap);
if (Constants.MAP_SERVER_NEW) {
  const listener = httpServerMap.listen(Constants.MAP_SERVER_PORT, function(err) {
    if (err) throw err;
    console.log('Map Socket server listening at http://localhost:' + listener.address().port);
  });
}

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"))

// listen for requests :)
const listener = httpServer.listen(process.env.PORT || Constants.AUTHENTICATION_SERVER_PORT, function(err) {
  if (err) throw err;
  console.log("Node is running at http://localhost:" + listener.address().port)
})
httpServer.on('error', (err) => {
  console.log('server error:')
  console.log(err);
});
listener.on('error', (err) => {
  console.log('listener error:')
  console.log(err);
});

export default app
