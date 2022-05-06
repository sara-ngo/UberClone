import React from 'react';
import io from "socket.io-client";
import * as Constants from "../../constants.js"

export const socket = io(Constants.CHAT_SERVER + "?service=chat", {
  cors: {
    origin: "*",
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
    credentials: false
  }
});
export const SocketContext = React.createContext();
