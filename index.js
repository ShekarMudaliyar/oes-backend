const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const mongoconf = require("./config/mongo.config");
const app = express();
const port = 3000;
var urlencodedParser = bodyparser.urlencoded({ extended: false });
const database_name = "oes";
var database, collection;
app.use(cors());

app.use(express.json());
MongoClient.connect(mongoconf, { useNewUrlParser: true }, (error, client) => {
  if (error) {
    throw error;
  }
  database = client.db(database_name);
  console.log("Connected to `" + database_name + "`!");
});
app.get("/", (req, res) => res.send("Welcome to oes dash api"));

app.post("/auth", urlencodedParser, (req, res) => {
  let email = req.body.email;
  let pass = req.body.pass;
  // res.send(email + pass);
  // let email = "shekar@gmail.com";
  collection = database.collection("users");
  collection.findOne({ email: email }, (error, result) => {
    if (error) {
      throw error;
    } else {
      if (result == null) {
        res.send("total failure");
      } else {
        if (result.pass === pass) {
          res.send("success");
        } else {
          res.send("failure");
        }
      }
    }
  });
});
app.listen(port, () => console.log(`Express Running ${port}!`));
