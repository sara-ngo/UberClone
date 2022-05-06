# UberClone
Start the node server using: nodemon server

Start the React app by changing directory to /frontend and using: npm start

.env requires MONGO_URI variable

Remember to install packages

## How to start the server
First add the .env file to the directory

```shell
cd "UberClone"
npm install
npm start
```

## How to start the web server
```shell
cd "UberClone\frontend" #windows path :(
npm install
npm start
```

## production server
Go to frontend/constants.js and change the variables:
```node
export const AUTHENTICATION_SERVER = "https://uberclonecs160.herokuapp.com";
export const CHAT_SERVER = "https://uberclonecs160.herokuapp.com";
export const MAP_SERVER = "https://uberclonecs160.herokuapp.com";
```
