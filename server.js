// server.js

// init project
var express = require("express");
var app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");

// connect to DB
async function listDatabases(client) {
  var databasesList = await client.db().admin().listDatabases();

  console.log("MongoDB Databases:");
  databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
}

const uri =
  "mongodb+srv://cs160:keniscool@cluster0.gspwu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

client.connect((err) => {
  if (err) {
    console.log("MONGODB ERROR!");
    throw err;
  }

  var dbUberUsers = client.db("UberUsers");
  var collection = dbUberUsers.collection("users");
  listDatabases(client);
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("*", function (request, response) {
  response.sendFile(__dirname + "/app/index.html");
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
