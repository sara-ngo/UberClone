// server.js

// init project
var express = require("express");
var app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");

// connect to DB
async function listDatabases(client) {
  var databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
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
  //var userInfo = client.getUsers({showCredentials:true});
  //console.log(userInfo);
  var collection = client.db("UberUsers").collection("users");
  listDatabases(client);
  //console.log(userInfo2);

  // does user exist
  /*collection.find({}, function (err, doc) {
    if (err) throw err;
    if (doc) {
      console.log("Found: " + doc._id + ", pass=" + doc.pass);
    } else {
      console.log("Not found: ");
      console.log(doc);
    }
  });*/
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
