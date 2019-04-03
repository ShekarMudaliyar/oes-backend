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
app.get("/codeeditor", (req, res) => {
  console.dir(
    "code editor" +
      " " +
      req.query.studid +
      " " +
      req.query.examid +
      " " +
      req.query.qid +
      " " +
      req.query.ques
  );

  res.render("editor", {
    studid: req.query.studid,
    examid: req.query.examid,
    id: req.query.qid,
    ques: req.query.ques
  });
  // res.send(req.params.studid + req.params.examid);
});
app.post("/createexamans", urlencodedParser, (req, res) => {
  collection = database.collection("exam_students");
  collection.findOne({ examid: req.body.examid }, (error, result) => {
    if (error) throw error;
    else {
      // res.send(result);
      console.log(result);
      database
        .collection("exam_answers")
        .findOne({ studentid: req.body.studid }, (err, resultmore) => {
          if (error) throw error;
          else {
            if (resultmore == null) {
              database.collection("exam_answers").insertOne({
                userid: result.userid,
                examid: req.body.examid,
                studentid: req.body.studid,
                fib: [],
                mcq: [],
                brief: [],
                code: []
              });
            }
          }
        });
    }
  });
});
app.post("/submitfib", urlencodedParser, (req, res) => {
  let ran = randomstring.generate({
    length: 5,
    charset: "alphanumeric"
  });
  collection = database.collection("exam_answers");
  query = { studentid: req.body.studid, examid: req.body.examid };
  values = {
    $push: {
      fib: {
        id: req.body.quesid,
        question: req.body.ques,
        answer: req.body.ans,
        gans: req.body.gans
      }
    }
  };

  collection.findOne(
    { studentid: req.body.studid, examid: req.body.examid },
    (err, findres) => {
      if (err) throw err;
      else {
        if (findres != null) {
          console.log(findres);
          collection
            .find({ fib: { $elemMatch: { id: req.body.quesid } } })
            .toArray((err, elemres) => {
              console.log(elemres);
              if (elemres.length == 0) {
                collection.updateOne(query, values, (error, result) => {
                  if (error) throw error;
                  else {
                    res.send(result);
                  }
                });
              } else {
                console.log("not null");
                collection.updateOne(
                  { examid: req.body.examid, "fib.id": req.body.quesid },
                  { $set: { "fib.$.gans": req.body.gans } },
                  (err, elseresult) => {
                    if (err) throw err;
                    else {
                      res.send(elseresult);
                      console.log(elseresult);
                    }
                  }
                );
              }
            });
        }
      }
    }
  );
});
app.post("/submitmcq", urlencodedParser, (req, res) => {
  let ran = randomstring.generate({
    length: 5,
    charset: "alphanumeric"
  });
  collection = database.collection("exam_answers");
  query = { studentid: req.body.studid, examid: req.body.examid };
  values = {
    $push: {
      mcq: {
        id: req.body.quesid,
        question: req.body.ques,
        answer: req.body.ans,
        gans: req.body.gans
      }
    }
  };

  collection.findOne(
    { studentid: req.body.studid, examid: req.body.examid },
    (err, findres) => {
      if (err) throw err;
      else {
        if (findres != null) {
          console.log(findres);
          collection
            .find({ mcq: { $elemMatch: { id: req.body.quesid } } })
            .toArray((err, elemres) => {
              console.log(elemres);
              if (elemres.length == 0) {
                collection.updateOne(query, values, (error, result) => {
                  if (error) throw error;
                  else {
                    res.send(result);
                  }
                });
              } else {
                console.log("not null");
                collection.updateOne(
                  { examid: req.body.examid, "mcq.id": req.body.quesid },
                  { $set: { "mcq.$.gans": req.body.gans } },
                  (err, elseresult) => {
                    if (err) throw err;
                    else {
                      res.send(elseresult);
                      console.log(elseresult);
                    }
                  }
                );
              }
            });
        }
      }
    }
  );
});
app.post("/submitbrief", urlencodedParser, (req, res) => {
  let ran = randomstring.generate({
    length: 5,
    charset: "alphanumeric"
  });
  collection = database.collection("exam_answers");
  query = { studentid: req.body.studid, examid: req.body.examid };
  values = {
    $push: {
      brief: {
        id: req.body.quesid,
        question: req.body.ques,
        answer: req.body.ans,
        gans: req.body.gans
      }
    }
  };

  collection.findOne(
    { studentid: req.body.studid, examid: req.body.examid },
    (err, findres) => {
      if (err) throw err;
      else {
        if (findres != null) {
          console.log(findres);
          collection
            .find({ brief: { $elemMatch: { id: req.body.quesid } } })
            .toArray((err, elemres) => {
              console.log(elemres);
              if (elemres.length == 0) {
                collection.updateOne(query, values, (error, result) => {
                  if (error) throw error;
                  else {
                    res.send(result);
                  }
                });
              } else {
                console.log("not null");
                collection.updateOne(
                  { examid: req.body.examid, "brief.id": req.body.quesid },
                  { $set: { "brief.$.gans": req.body.gans } },
                  (err, elseresult) => {
                    if (err) throw err;
                    else {
                      res.send(elseresult);
                      console.log(elseresult);
                    }
                  }
                );
              }
            });
        }
      }
    }
  );
});
app.post("/submitcode", urlencodedParser, (req, res) => {
  let ran = randomstring.generate({
    length: 5,
    charset: "alphanumeric"
  });
  collection = database.collection("exam_answers");
  query = { studentid: req.body.studid, examid: req.body.examid };
  values = {
    $push: {
      code: {
        id: req.body.quesid,
        question: req.body.ques,
        answer: req.body.ans,
        gans: req.body.gans
      }
    }
  };

  collection.findOne(
    { studentid: req.body.studid, examid: req.body.examid },
    (err, findres) => {
      if (err) throw err;
      else {
        if (findres != null) {
          console.log(findres);
          collection
            .find({ code: { $elemMatch: { id: req.body.quesid } } })
            .toArray((err, elemres) => {
              console.log(elemres);
              if (elemres.length == 0) {
                collection.updateOne(query, values, (error, result) => {
                  if (error) throw error;
                  else {
                    res.send(result);
                  }
                });
              } else {
                console.log("not null");
                collection.updateOne(
                  { examid: req.body.examid, "code.id": req.body.quesid },
                  { $set: { "code.$.gans": req.body.gans } },
                  (err, elseresult) => {
                    if (err) throw err;
                    else {
                      res.send(elseresult);
                      console.log(elseresult);
                    }
                  }
                );
              }
            });
        }
      }
    }
  );
});
app.listen(port, () => console.log(`Express Running ${port}!`));
