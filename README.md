# UberClone(https://quickmovecontractor.com/login)

## Description
This project reproduce the popular ride-sharing platform Uber.

Our team develop the infrastucture and website to accommodate both drivers and riders. Drivers
can view a map and wait to accept nearby riders in real-time. Conversely,riders can submit requests and be assigned to a driver. Riders should be able to complete their request in a timely manner. .

This web app includes authentication and uses Mapbox services to fetch users real time location, calculate driving distances and get driving instructions.

We also have a database to store users ride-sharing history and their ratings.
![image](https://user-images.githubusercontent.com/69872401/168938830-7de3a491-fd33-41fa-be21-6d91c9367225.png)

![image](https://user-images.githubusercontent.com/69872401/168938995-a13b27b5-8c1c-4c61-896e-c5f0e384d5f5.png)

## Quick start
Start the node server using: nodemon server

Start the React app by changing directory to /frontend and using: npm start

.env requires MONGO_URI variable

Remember to install packages

### How to start the server
First add the .env file to the directory

```shell
cd "UberClone"
npm install
npm start
```

### How to start the web server
```shell
cd "UberClone\frontend" #windows path :(
npm install
npm start
```

### Production server
Go to frontend/constants.js and change the variables:
```node
export const AUTHENTICATION_SERVER = "https://uberclonecs160.herokuapp.com";
export const CHAT_SERVER = "https://uberclonecs160.herokuapp.com";
export const MAP_SERVER = "https://uberclonecs160.herokuapp.com";
```
