import React from 'react';
import io from "socket.io-client";
import * as Constants from "../../constants.js"

export const socket = io(Constants.CHAT_SERVER);
export const SocketContext = React.createContext();
