const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
var randomstring = require("randomstring");
const socket = require("socket.io");
const MongoClient = require("mongodb").MongoClient;
const mongoconf = require("./config/mongo.config");
var nearest = require("nearest-date");

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
        res.send({ status: "total failure" });
      } else {
        if (result.pass === pass) {
          res.send({ status: "success", data: result });
        } else {
          res.send({ status: "failure" });
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
        // console.log(result);
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
        // console.log(result);
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
        answer: req.body.ans,
        marks: req.body.marks
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
        answer: req.body.ans,
        marks: req.body.marks
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
        question: req.body.ques,
        marks: req.body.marks
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
        op4: req.body.op4,
        answer: req.body.ans,
        marks: req.body.marks
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
      // console.log(result);
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
      req.query.ques +
      " " +
      req.query.marks
  );

  res.render("editor", {
    studid: req.query.studid,
    examid: req.query.examid,
    id: req.query.qid,
    ques: req.query.ques,
    marks: req.query.marks
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
        gans: req.body.gans,
        marks: req.body.marks
      }
    }
  };

  collection.findOne(
    { studentid: req.body.studid, examid: req.body.examid },
    (err, findres) => {
      if (err) throw err;
      else {
        if (findres != null) {
          // console.log(findres);
          collection
            .find({
              examid: req.body.examid,
              studentid: req.body.studid,
              "fib.id": req.body.quesid
            })
            .toArray((err, elemres) => {
              console.log(elemres);
              if (elemres.length == 0) {
                console.log("null");
                collection.updateOne(query, values, (error, result) => {
                  if (error) throw error;
                  else {
                    res.send(result);
                    // console.log(result);
                  }
                });
              } else {
                console.log("not null");
                collection.updateOne(
                  {
                    examid: req.body.examid,
                    studentid: req.body.studid,
                    "fib.id": req.body.quesid
                  },
                  { $set: { "fib.$.gans": req.body.gans } },
                  (err, elseresult) => {
                    if (err) throw err;
                    else {
                      res.send(elseresult);
                      // console.log(elseresult);
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
        gans: req.body.gans,
        marks: req.body.marks
      }
    }
  };

  collection.findOne(
    { studentid: req.body.studid, examid: req.body.examid },
    (err, findres) => {
      if (err) throw err;
      else {
        if (findres != null) {
          // console.log(findres);
          collection
            .find({
              examid: req.body.examid,
              studentid: req.body.studid,
              "mcq.id": req.body.quesid
            })
            .toArray((err, elemres) => {
              console.log(elemres);
              if (elemres.length == 0) {
                console.log("null");
                collection.updateOne(query, values, (error, result) => {
                  if (error) throw error;
                  else {
                    res.send(result);
                    // console.log(result);
                  }
                });
              } else {
                console.log("not null");
                collection.updateOne(
                  {
                    examid: req.body.examid,
                    studentid: req.body.studid,
                    "mcq.id": req.body.quesid
                  },
                  { $set: { "mcq.$.gans": req.body.gans } },
                  (err, elseresult) => {
                    if (err) throw err;
                    else {
                      res.send(elseresult);
                      // console.log(elseresult);
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
        gans: req.body.gans,
        marks: req.body.marks
      }
    }
  };

  collection.findOne(
    { studentid: req.body.studid, examid: req.body.examid },
    (err, findres) => {
      if (err) throw err;
      else {
        if (findres != null) {
          // console.log(findres);
          collection
            .find({
              examid: req.body.examid,
              studentid: req.body.studid,
              "brief.id": req.body.quesid
            })
            .toArray((err, elemres) => {
              console.log(elemres);
              if (elemres.length == 0) {
                console.log("null");
                collection.updateOne(query, values, (error, result) => {
                  if (error) throw error;
                  else {
                    res.send(result);
                    // console.log(result);
                  }
                });
              } else {
                console.log("not null");
                collection.updateOne(
                  {
                    examid: req.body.examid,
                    studentid: req.body.studid,
                    "brief.id": req.body.quesid
                  },
                  { $set: { "brief.$.gans": req.body.gans } },
                  (err, elseresult) => {
                    if (err) throw err;
                    else {
                      res.send(elseresult);
                      // console.log(elseresult);
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
        gans: req.body.gans,
        marks: req.body.marks
      }
    }
  };

  collection.findOne(
    { studentid: req.body.studid, examid: req.body.examid },
    (err, findres) => {
      if (err) throw err;
      else {
        if (findres != null) {
          // console.log(findres);
          collection
            .find({
              examid: req.body.examid,
              studentid: req.body.studid,
              "code.id": req.body.quesid
            })
            .toArray((err, elemres) => {
              console.log(elemres);
              if (elemres.length == 0) {
                console.log("null");
                collection.updateOne(query, values, (error, result) => {
                  if (error) throw error;
                  else {
                    res.send(result);
                    // console.log(result);
                  }
                });
              } else {
                console.log("not null");
                collection.updateOne(
                  {
                    examid: req.body.examid,
                    studentid: req.body.studid,
                    "code.id": req.body.quesid
                  },
                  { $set: { "code.$.gans": req.body.gans } },
                  (err, elseresult) => {
                    if (err) throw err;
                    else {
                      res.send(elseresult);
                      // console.log(elseresult);
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
app.post("/getanswers", urlencodedParser, (req, res) => {
  collection = database.collection("exam_answers");

  collection
    .find({
      userid: req.body.userid,
      examid: req.body.examid,
      studentid: req.body.studid
    })
    .toArray((err, result) => {
      if (err) throw err;
      else {
        res.send(result);
        database.collection("exam_assess").findOne(
          {
            userid: req.body.userid,
            examid: req.body.examid,
            studentid: req.body.studid
          },
          (err, findres) => {
            if (err) throw err;
            else {
              if (findres) {
                console.dir("ok");
              } else {
                database.collection("exam_assess").insertOne(
                  {
                    userid: req.body.userid,
                    examid: req.body.examid,
                    studentid: req.body.studid,
                    fib: [],
                    mcq: [],
                    brief: [],
                    code: []
                  },
                  (err, results) => {
                    if (err) throw err;
                    else {
                      console.log(results);
                    }
                  }
                );
              }
            }
          }
        );
      }
    });
});

app.post("/assessfib", urlencodedParser, (req, res) => {
  collection = database.collection("exam_assess");
  query = { studentid: req.body.studid, examid: req.body.examid };
  values = {
    $push: {
      fib: {
        id: req.body.quesid,
        question: req.body.ques,
        marks: req.body.marks,
        gmarks: req.body.gmarks
      }
    }
  };

  collection.findOne(
    { studentid: req.body.studid, examid: req.body.examid },
    (err, findres) => {
      if (err) throw err;
      else {
        if (findres != null) {
          // console.log(findres);
          collection
            .find({
              examid: req.body.examid,
              studentid: req.body.studid,
              "fib.id": req.body.quesid
            })
            .toArray((err, elemres) => {
              console.log(elemres);
              if (elemres.length == 0) {
                console.log("null");
                collection.updateOne(query, values, (error, result) => {
                  if (error) throw error;
                  else {
                    res.send(result);
                    // console.log(result);
                  }
                });
              } else {
                console.log("not null");
                collection.updateOne(
                  {
                    examid: req.body.examid,
                    studentid: req.body.studid,
                    "fib.id": req.body.quesid
                  },
                  { $set: { "fib.$.gmarks": req.body.gmarks } },
                  (err, elseresult) => {
                    if (err) throw err;
                    else {
                      res.send(elseresult);
                      // console.log(elseresult);
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
app.post("/assessbrief", urlencodedParser, (req, res) => {
  collection = database.collection("exam_assess");
  query = { studentid: req.body.studid, examid: req.body.examid };
  values = {
    $push: {
      brief: {
        id: req.body.quesid,
        question: req.body.ques,
        marks: req.body.marks,
        gmarks: req.body.gmarks
      }
    }
  };

  collection.findOne(
    { studentid: req.body.studid, examid: req.body.examid },
    (err, findres) => {
      if (err) throw err;
      else {
        if (findres != null) {
          // console.log(findres);
          collection
            .find({
              examid: req.body.examid,
              studentid: req.body.studid,
              "brief.id": req.body.quesid
            })
            .toArray((err, elemres) => {
              console.log(elemres);
              if (elemres.length == 0) {
                console.log("null");
                collection.updateOne(query, values, (error, result) => {
                  if (error) throw error;
                  else {
                    res.send(result);
                    // console.log(result);
                  }
                });
              } else {
                console.log("not null");
                collection.updateOne(
                  {
                    examid: req.body.examid,
                    studentid: req.body.studid,
                    "brief.id": req.body.quesid
                  },
                  { $set: { "brief.$.gmarks": req.body.gmarks } },
                  (err, elseresult) => {
                    if (err) throw err;
                    else {
                      res.send(elseresult);
                      // console.log(elseresult);
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
app.post("/assessmcq", urlencodedParser, (req, res) => {
  collection = database.collection("exam_assess");
  query = { studentid: req.body.studid, examid: req.body.examid };

  database.collection("exam_answers").findOne(
    {
      studentid: req.body.studid,
      examid: req.body.examid,
      userid: req.body.userid
    },
    (err, results) => {
      if (err) throw err;
      else {
        // console.log(results);
        let mcq = results.mcq;
        // console.log(mcq);
        mcq.forEach(data => {
          if (data.answer == null) {
            console.log("null");
          } else {
            if (data.answer == data.gans) {
              console.log("true");
              console.log(data);
              values = {
                $push: {
                  mcq: {
                    id: data.id,
                    question: data.question,
                    marks: data.marks,
                    gmarks: data.marks
                  }
                }
              };
              collection.findOne(
                { studentid: req.body.studid, examid: req.body.examid },
                (err, findres) => {
                  if (err) throw err;
                  else {
                    if (findres != null) {
                      // console.log(findres);
                      collection
                        .find({
                          examid: req.body.examid,
                          studentid: req.body.studid,
                          "mcq.id": data.id
                        })
                        .toArray((err, elemres) => {
                          // console.log(elemres);
                          if (elemres.length == 0) {
                            console.log("null");
                            collection.updateOne(
                              query,
                              values,
                              (error, result) => {
                                if (error) throw error;
                                else {
                                  try {
                                    res.send(JSON.parse(result));
                                  } catch (error) {
                                    console.log("err");
                                  }
                                }
                              }
                            );
                          } else {
                            console.log("not null");
                            collection.updateOne(
                              {
                                examid: req.body.examid,
                                studentid: req.body.studid,
                                "mcq.id": data.id
                              },
                              { $set: { "mcq.$.gmarks": data.marks } },
                              (err, elseresult) => {
                                if (err) throw err;
                                else {
                                  try {
                                    res.send(JSON.parse(elseresult));
                                  } catch (error) {
                                    console.log("err");
                                  }
                                  // console.log(JSON.parse(elseresult));
                                }
                              }
                            );
                          }
                        });
                    }
                  }
                }
              );
            } else {
              console.log(data);
              values = {
                $push: {
                  mcq: {
                    id: data.id,
                    question: data.question,
                    marks: data.marks,
                    gmarks: 0
                  }
                }
              };
              collection.findOne(
                { studentid: req.body.studid, examid: req.body.examid },
                (err, findres) => {
                  if (err) throw err;
                  else {
                    if (findres != null) {
                      // console.log(findres);
                      collection
                        .find({
                          examid: req.body.examid,
                          studentid: req.body.studid,
                          "mcq.id": data.id
                        })
                        .toArray((err, elemres) => {
                          // console.log(elemres);
                          if (elemres.length == 0) {
                            console.log("null");
                            collection.updateOne(
                              query,
                              values,
                              (error, result) => {
                                if (error) throw error;
                                else {
                                  try {
                                    res.send(JSON.parse(result));
                                  } catch (error) {
                                    console.log("err");
                                  }
                                }
                              }
                            );
                          } else {
                            console.log("not null");
                            collection.updateOne(
                              {
                                examid: req.body.examid,
                                studentid: req.body.studid,
                                "mcq.id": data.id
                              },
                              { $set: { "mcq.$.gmarks": 0 } },
                              (err, elseresult) => {
                                if (err) throw err;
                                else {
                                  try {
                                    res.send(JSON.parse(elseresult));
                                  } catch (error) {
                                    console.log("err");
                                  }
                                  // console.log(JSON.parse(elseresult));
                                }
                              }
                            );
                          }
                        });
                    }
                  }
                }
              );
            }
            // res.send(stat);
          }
        });
      }
      // console.log(stat);
    }
  );

  // collection.findOne(
  //   { studentid: req.body.studid, examid: req.body.examid },
  //   (err, findres) => {
  //     if (err) throw err;
  //     else {
  //       if (findres != null) {
  //         // console.log(findres);
  //         collection
  //           .find({
  //             examid: req.body.examid,
  //             studentid: req.body.studid,
  //             "mcq.id": req.body.quesid
  //           })
  //           .toArray((err, elemres) => {
  //             console.log(elemres);
  //             if (elemres.length == 0) {
  //               console.log("null");
  //               collection.updateOne(query, values, (error, result) => {
  //                 if (error) throw error;
  //                 else {
  //                   res.send(result);
  //                   // console.log(result);
  //                 }
  //               });
  //             } else {
  //               console.log("not null");
  //               collection.updateOne(
  //                 {
  //                   examid: req.body.examid,
  //                   studentid: req.body.studid,
  //                   "mcq.id": req.body.quesid
  //                 },
  //                 { $set: { "mcq.$.gmarks": req.body.gmarks } },
  //                 (err, elseresult) => {
  //                   if (err) throw err;
  //                   else {
  //                     res.send(elseresult);
  //                     // console.log(elseresult);
  //                   }
  //                 }
  //               );
  //             }
  //           });
  //       }
  //     }
  //   }
  // );
});
app.post("/assesscode", urlencodedParser, (req, res) => {
  collection = database.collection("exam_assess");
  query = { studentid: req.body.studid, examid: req.body.examid };
  values = {
    $push: {
      code: {
        id: req.body.quesid,
        question: req.body.ques,
        marks: req.body.marks,
        gmarks: req.body.gmarks
      }
    }
  };

  collection.findOne(
    { studentid: req.body.studid, examid: req.body.examid },
    (err, findres) => {
      if (err) throw err;
      else {
        if (findres != null) {
          // console.log(findres);
          collection
            .find({
              examid: req.body.examid,
              studentid: req.body.studid,
              "code.id": req.body.quesid
            })
            .toArray((err, elemres) => {
              console.log(elemres);
              if (elemres.length == 0) {
                console.log("null");
                collection.updateOne(query, values, (error, result) => {
                  if (error) throw error;
                  else {
                    res.send(result);
                    // console.log(result);
                  }
                });
              } else {
                console.log("not null");
                collection.updateOne(
                  {
                    examid: req.body.examid,
                    studentid: req.body.studid,
                    "code.id": req.body.quesid
                  },
                  { $set: { "code.$.gmarks": req.body.gmarks } },
                  (err, elseresult) => {
                    if (err) throw err;
                    else {
                      res.send(elseresult);
                      // console.log(elseresult);
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
app.post("/getresult", urlencodedParser, (req, res) => {
  database.collection("exam_answers").findOne(
    {
      examid: req.body.examid,
      userid: req.body.userid,
      studentid: req.body.studid
    },
    (err, results) => {
      if (err) throw err;
      else {
        if (results != null) {
          database.collection("exam_assess").findOne(
            {
              userid: req.body.userid,
              examid: req.body.examid,
              studentid: req.body.studid
            },
            (err, quesres) => {
              if (err) throw err;
              else {
                let fib = 0;
                let mcq = 0;
                let brief = 0;
                let code = 0;
                let fibq = 0;
                let mcqq = 0;
                let briefq = 0;
                let codeq = 0;
                quesres.fib.forEach(temp => {
                  fib += parseInt(temp.gmarks);
                });
                quesres.mcq.forEach(temp => {
                  mcq += parseInt(temp.gmarks);
                });
                quesres.brief.forEach(temp => {
                  brief += parseInt(temp.gmarks);
                });
                quesres.code.forEach(temp => {
                  code += parseInt(temp.gmarks);
                });
                quesres.fib.forEach(temp => {
                  fibq += parseInt(temp.marks);
                });
                quesres.mcq.forEach(temp => {
                  mcqq += parseInt(temp.marks);
                });
                quesres.brief.forEach(temp => {
                  briefq += parseInt(temp.marks);
                });
                quesres.code.forEach(temp => {
                  codeq += parseInt(temp.marks);
                });
                res.send({
                  fib,
                  mcq,
                  brief,
                  code,
                  fibq,
                  mcqq,
                  briefq,
                  codeq
                });
              }
            }
          );
        } else {
          res.send("no data");
        }
      }
    }
  );
});
app.post("/remove", urlencodedParser, (req, res) => {
  type = req.body.type;
  collection = database.collection("exam_questions");
  query = { userid: req.body.userid, examid: req.body.examid };
  switch (type) {
    case "mcq":
      values = {
        $pull: { mcq: { id: req.body.id } }
      };
      collection.update(query, values, (error, result) => {
        if (error) throw error;
        else {
          res.send(result);
        }
      });
      break;
    case "fib":
      values = {
        $pull: { fib: { id: req.body.id } }
      };
      collection.update(query, values, (error, result) => {
        if (error) throw error;
        else {
          res.send(result);
        }
      });
      break;
    case "brief":
      values = {
        $pull: { brief: { id: req.body.id } }
      };
      collection.update(query, values, (error, result) => {
        if (error) throw error;
        else {
          res.send(result);
        }
      });
      break;
    case "code":
      values = {
        $pull: { code: { id: req.body.id } }
      };
      collection.update(query, values, (error, result) => {
        if (error) throw error;
        else {
          res.send(result);
        }
      });
      break;
  }
  // values = {
  //   $pull: { mcq: { id: req.body.id } }
  // };
  // collection.update(query, values, (error, result) => {
  //   if (error) throw error;
  //   else {
  //     res.send(result);
  //   }
  // });
});

var server = app.listen(port, () => console.log(`Express Running ${port}!`));
users = [];
connections = [];
var io = socket(server);
io.on("connection", socket => {
  console.log(socket.id);
  // socket.on("reset", function(data) {
  // countdown = 1000;
  // io.sockets.emit("timer", { countdown: countdown });
  // });
  socket.on("getdates", data => {
    collection = database.collection("exam_dates");
    collection.findOne({ examid: data.examid }, (error, result) => {
      if (error) throw error;
      else {
        var checkdate = [];
        for (var i = 0; i < result.dates.length; i++) {
          // console.log(result.dates[i]);
          let date = result.dates[i].date;
          let dates = date.split("-");
          let tf = result.dates[i].timefrom;
          let timef = tf.split(":");
          let tempdate = new Date(
            dates[2],
            dates[1] - 1,
            dates[0],
            timef[0],
            timef[1]
          );
          checkdate.push(tempdate);
        }
        var cnow = new Date();
        // // console.log(checkdate);
        var index = nearest(checkdate, cnow);
        // console.log(checkdate[index]);

        function calcdate() {
          var date = result.dates[index].date;
          var dates = date.split("-");
          var tf = result.dates[index].timefrom;
          var timef = tf.split(":");
          var tt = result.dates[index].timeto;
          var timet = tt.split(":");
          var now = new Date();

          var eventDate = new Date(
            dates[2],
            dates[1] - 1,
            dates[0],
            timef[0],
            timef[1]
          );
          var eventendDate = new Date(
            dates[2],
            dates[1] - 1,
            dates[0],
            timet[0],
            timet[1]
          );
          var currTime = now.getTime();
          var eventTime = eventDate.getTime();
          var eventendTime = eventendDate.getTime();
          var remTime = eventTime - currTime;
          var s = Math.floor(remTime / 1000);
          var m = Math.floor(s / 60);
          var h = Math.floor(m / 60);
          var d = Math.floor(h / 24);
          h %= 24;
          m %= 60;
          s %= 60;
          h = h < 10 ? "0" + h : h;
          m = m < 10 ? "0" + m : m;
          s = s < 10 ? "0" + s : s;
          if (eventDate >= now) {
            // console.log(eventDate, now);
            io.sockets.emit("date", [h, m, s]);
          } else {
            clearInterval(interval);

            io.sockets.emit("date", "start");
          }

          if (
            (h == 00 || h == "00") &&
            (m == 00 || m == "00") &&
            (s == 00 || s == "00")
          ) {
            clearInterval(interval);
            io.sockets.emit("date", "start");
          }
          if (currTime > eventTime && currTime < eventendTime) {
            function examstart() {
              var now = new Date();
              var currTime = now.getTime();
              var remeTime = eventendTime - currTime;
              var es = Math.floor(remeTime / 1000);
              var em = Math.floor(es / 60);
              var eh = Math.floor(em / 60);
              var ed = Math.floor(eh / 24);
              eh %= 24;
              em %= 60;
              es %= 60;
              eh = eh < 10 ? "0" + eh : eh;
              em = em < 10 ? "0" + em : em;
              es = es < 10 ? "0" + es : es;
              io.sockets.emit("time", [eh, em, es]);

              if (
                (eh == 00 || eh == "00") &&
                (em == 00 || em == "00") &&
                (es == 00 || es == "00")
              ) {
                clearInterval(einterval);
                io.sockets.emit("time", "end");
              }
              // console.log([eh, em, es]);
            }
            var einterval = setInterval(examstart, 1000);
          } else {
            io.sockets.emit("time", "end");
          }
        }
        var interval = setInterval(calcdate, 1000);
        // console.log(firstDate);
      }
    });
    // console.log(data);
  });
});
// var countdown = 1000;
// setInterval(function() {
//   countdown--;
//   console.log(countdown);
//   var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
//   var firstDate = new Date();
//   var secondDate = new Date(2016, 02, 20);
//   var diffDays = "expired";
//   if (secondDate >= firstDate) {
//     diffDays = parseInt((secondDate - firstDate) / oneDay) + " days left";
//   }
//   io.sockets.emit("timer", { countdown: countdown });
// }, 1000);
