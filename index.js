const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
var randomstring = require("randomstring");

const MongoClient = require("mongodb").MongoClient;
const mongoconf = require("./config/mongo.config");
const app = express();
const port = process.env.PORT || 3000;
var urlencodedParser = bodyparser.urlencoded({ extended: false });
const database_name = "oes";
var database, collection;
app.use(cors());
app.set("view engine", "ejs");

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
          res.send({ status: "success", data: result });
        } else {
          res.send("failure");
        }
      }
    }
  });
});
app.post("/authstud", urlencodedParser, (req, res) => {
  let email = req.body.email;
  let pass = req.body.pass;
  // res.send(email + pass);
  // let email = "shekar@gmail.com";
  collection = database.collection("students");
  collection.findOne(
    { email: email, examid: req.body.examid },
    (error, result) => {
      if (error) {
        throw error;
      } else {
        if (result == null) {
          res.send("total failure");
        } else {
          if (result.pass === pass) {
            res.send({ status: "success", data: result });
          } else {
            res.send("failure");
          }
        }
      }
    }
  );
});
app.post("/setexams", urlencodedParser, (req, res) => {
  let ran = randomstring.generate({
    length: 12,
    charset: "alphanumeric"
  });
  collection = database.collection("exams");
  query = { userid: req.body.userid };
  values = { $push: { exams: { id: ran, exam: req.body.exam } } };
  collection.updateOne(query, values, (error, result) => {
    if (error) throw error;
    else {
      database.collection("exam_dates").insertOne({
        userid: req.body.userid,
        examid: ran,
        dates: []
      });

      database.collection("exam_students").insertOne({
        userid: req.body.userid,
        examid: ran,
        students: []
      });

      database.collection("exam_questions").insertOne({
        userid: req.body.userid,
        examid: ran,
        fib: [],
        mcq: [],
        brief: [],
        code: []
      });
      res.send(result);
    }
  });
});
app.post("/getexams", urlencodedParser, (req, res) => {
  collection = database.collection("exams");
  collection.findOne({ userid: req.body.id }, (error, result) => {
    if (error) throw error;
    else {
      res.send(result);
      console.log(result);
    }
  });
});

app.post("/setdatetime", urlencodedParser, (req, res) => {
  let ran = randomstring.generate({
    length: 5,
    charset: "alphanumeric"
  });
  collection = database.collection("exam_dates");
  query = { userid: req.body.userid, examid: req.body.examid };
  values = {
    $push: {
      dates: {
        id: ran,
        date: req.body.date,
        timefrom: req.body.timefrom,
        timeto: req.body.timeto
      }
    }
  };
  collection.updateOne(query, values, (error, result) => {
    if (error) throw error;
    else {
      res.send(result);
    }
  });
});
app.post("/getdate", urlencodedParser, (req, res) => {
  collection = database.collection("exam_dates");
  collection.findOne(
    { userid: req.body.userid, examid: req.body.examid },
    (error, result) => {
      if (error) throw error;
      else {
        res.send(result);
        console.log(result);
      }
    }
  );
});
app.post("/addstudent", urlencodedParser, (req, res) => {
  let ran = randomstring.generate({
    length: 10,
    charset: "alphanumeric"
  });
  collection = database.collection("exam_students");
  query = { userid: req.body.userid, examid: req.body.examid };
  values = {
    $push: {
      students: {
        id: ran,
        rollno: req.body.rollno,
        name: req.body.name,
        email: req.body.email,
        pass: req.body.pass
      }
    }
  };
  collection.updateOne(query, values, (error, result) => {
    if (error) throw error;
    else {
      res.send(result);
    }
  });
  database.collection("students").insertOne({
    examid: req.body.examid,
    id: ran,
    rollno: req.body.rollno,
    name: req.body.name,
    email: req.body.email,
    pass: req.body.pass
  });
});
app.post("/getstudents", urlencodedParser, (req, res) => {
  collection = database.collection("exam_students");
  collection.findOne(
    { userid: req.body.userid, examid: req.body.examid },
    (error, result) => {
      if (error) throw error;
      else {
        res.send(result);
        console.log(result);
      }
    }
  );
});

app.post("/getquestions", urlencodedParser, (req, res) => {
  collection = database.collection("exam_questions");
  collection.findOne(
    { userid: req.body.userid, examid: req.body.examid },
    (error, result) => {
      if (error) throw error;
      else {
        res.send(result);
        console.log(result);
      }
    }
  );
});
app.post("/addbrief", urlencodedParser, (req, res) => {
  let ran = randomstring.generate({
    length: 5,
    charset: "alphanumeric"
  });
  collection = database.collection("exam_questions");
  query = { userid: req.body.userid, examid: req.body.examid };
  values = {
    $push: {
      brief: {
        id: ran,
        question: req.body.ques,
        answer: req.body.ans
      }
    }
  };
  collection.updateOne(query, values, (error, result) => {
    if (error) throw error;
    else {
      res.send(result);
    }
  });
});
app.post("/addfib", urlencodedParser, (req, res) => {
  let ran = randomstring.generate({
    length: 5,
    charset: "alphanumeric"
  });
  collection = database.collection("exam_questions");
  query = { userid: req.body.userid, examid: req.body.examid };
  values = {
    $push: {
      fib: {
        id: ran,
        question: req.body.ques,
        answer: req.body.ans
      }
    }
  };
  collection.updateOne(query, values, (error, result) => {
    if (error) throw error;
    else {
      res.send(result);
    }
  });
});
app.post("/addcode", urlencodedParser, (req, res) => {
  let ran = randomstring.generate({
    length: 5,
    charset: "alphanumeric"
  });
  collection = database.collection("exam_questions");
  query = { userid: req.body.userid, examid: req.body.examid };
  values = {
    $push: {
      code: {
        id: ran,
        question: req.body.ques
      }
    }
  };
  collection.updateOne(query, values, (error, result) => {
    if (error) throw error;
    else {
      res.send(result);
    }
  });
});
app.post("/addmcq", urlencodedParser, (req, res) => {
  let ran = randomstring.generate({
    length: 5,
    charset: "alphanumeric"
  });
  collection = database.collection("exam_questions");
  query = { userid: req.body.userid, examid: req.body.examid };
  values = {
    $push: {
      mcq: {
        id: ran,
        question: req.body.ques,
        op1: req.body.op1,
        op2: req.body.op2,
        op3: req.body.op3,
        op4: req.body.op4
      }
    }
  };
  collection.updateOne(query, values, (error, result) => {
    if (error) throw error;
    else {
      res.send(result);
    }
  });
});
app.post("/getquesstud", urlencodedParser, (req, res) => {
  collection = database.collection("exam_questions");
  collection.findOne({ examid: req.body.examid }, (error, result) => {
    if (error) throw error;
    else {
      res.send(result);
      console.log(result);
    }
  });
});
app.get("/codeeditor", urlencodedParser, (req, res) => {
  res.render("editor");
});
app.listen(port, () => console.log(`Express Running ${port}!`));
