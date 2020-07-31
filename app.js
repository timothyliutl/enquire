//This chunk of code is used to set up all of the dependencies 
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const passport = require("passport");
const multer = require('multer');
const passportLocalMongoose = require("passport-local-mongoose");
const path = require('path');
var ObjectId = require('mongodb').ObjectID;

var storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({
  storage: storage,
  limits: { fileSize: 20000000 },
  /*fileFilter: function (req, file, cb) {
checkFileType(file, cb);
  }*/
}).single('userimage');

function checkFileType(file, cb){
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.orginalname).toLowerCase());

  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  }else{
    cb('Error: Images Only!');
  }

}


//replace this later with the actual list from the database

//Tells program which mongodb database to be looking for

//Tells how the response document should be structured
const responseSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: String,
  subject: String,
  tags: String,
  course: String,
  author: String,
  date: Date
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 5 },
  password: String,
  email: String
});
//Do not make password required here, for some reason it doesn't work with passport

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);


const DBresponse = mongoose.model("Response", responseSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.use(express.static("public"));
app.use(
  session({
    secret: "endoplasmic retticulum",
    //Make sure to put secret in .env in the future
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/form", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useCreateIndex', true);
//This date stuff isn't really used in the code currently, just something I used to test out templating
var day = new Date();
var days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
var response = {};

//TODO: add this array to the database and not have it hardcoded in here
var courses = ["APSC 112", "APSC 172", "APSC 174", "Muck Fod 1"];

//This is where we want to compile data from the database into a list, right now the ejs file is 
//expecting a list of javascript objects as shown below, this should model the objects already in the response database
var dummyresponselist = [];

function getQuestions() {
  DBresponse.find({}).lean().exec(function (err, doc) {
    if (err) {
      console.log(err);
    }
    dummyresponselist = doc;
    //console.log(doc);

  });
  //Looks like the code runs and after it runs through once, it runs the find function (probably an async function)
}


getQuestions();




//Everything below this comment are functions that run when a website is loaded

app.get("/", function (req, res) {

  res.sendFile(__dirname + "/HTML/home-notloggedin.html");

});

app.get('/home', function (req, res) {
  if (req.isAuthenticated()) {
    getQuestions();
    //This function here might cause some issues
    //Can solve question home screen issue by redirecting to the question specific page first then have the user redirect to the home screen
    //remember the () after the is authenticated, will always return true unless you call the function
    res.render('home', { list: dummyresponselist });
  } else {
    res.redirect('/login');
  }

});

app.get('/home/page/:pagenum', function (req, res) {
  if (req.isAuthenticated()) {
    res.render('home', { list: dummyresponselist });
  }
});

app.get('/home/query/:course', function (req, res) {
  if (res.isAuthenticated()) {
    res.send(req.params.course);
  }
});


app.get("/question", function (req, res) {

  if (req.isAuthenticated()) {
    getQuestions();
    res.render("index", { date: days[day.getDay()], courselist: courses });
  } else {
    res.redirect("/login");
  }
});

//After submit button is hit, the code inside here runs and saves all the date into the database, also console logs the information too
app.post("/question-compositions", function (req, res) {
  console.log(req);
  upload(req, res, function(err){
    if(err){
      console.log(err);
      res.redirect('/question-compositions');
    }else{
      //for some reason body parser cannot get access to req.body unless its inside the multer function
      //multer can read multi part forms and body parser cannot, its weird but it works
      console.log(req.file);
var date = new Date();
  const question = new DBresponse({
    title: req.body.title,
    body: req.body.questionBody,
    tags: req.body.tags,
    course: req.body.course,
    date: date,
    author: req.user.username

  });
  question.save();
  console.log(req.body.title);
  response = req.body;
  console.log(response);
  /*res.render("preview", {
    title: response.title,
    body: response.questionBody,
    tags: response.tags,
  });*/
  res.redirect('/home');

    }
  });
  
});


app.get("/login", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/home');
    //Makes it so someone can't go back to the login screen if they are already logged in
  } else {
    res.sendFile(__dirname + "/HTML/login.html", function (err) {
      if (err) {
        console.log(err);
      }
    });
  }

});

//TODO: redirect to profile page template with approriate information
//Curently just redirects to the question composition page
app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });


  req.login(user, function (err) {

    if (err) {
      console.log(err);
    } else {
      //why can user be interchangble replaced with passport?
      User.authenticate("local")(req, res, function () {
        res.redirect('/question');
      });
    }
  });
});

app.get("/register", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/home')
  } else {
    res.render('register', { error: '' });
  }


});

app.post("/register", function (req, res) {

  User.register(
    //This used to be a javascript object, but to follow documentation
    //on mongoose passport local, I just put the username string as the first parameter
    //Update: for some reason the object has to stay here, probably because the username was stored in a javascript object too
    { username: req.body.username, email: req.body.email },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.render('register', { error: err });
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/home");
        });
      }
    }
  );

});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login');
});

app.get("/user/:userID", function (req, res) {
  //req.params.ID will be the username and will be used to get user specific information from the database into the profile page
  User.findOne({ username: req.params.userID }, function (err, doc) {
    if (err) {
      console.log(err);
    }
    res.send(doc.email);

  });

});

//Need to find a way to pass in the question ID to the ejs file and from the ejs file to a redirectable link
app.get("/view-question/:questionID", function (req, res) {
  res.render("question");
});

app.post('/view-question/:questionID', function (req, res) {
  var replytext = req.body.response;
  console.log(replytext);
  res.redirect("/home");
  //Works, now just need to get the database to work with it
});

app.get("*", function (req, res) {
  res.render("404errorpage");
});

//Tells what port the website should be running on
app.listen(3000, function () {
  console.log("Server running on Port 3000");
});
//const in JS for things inside a variable aren't always constant, the variable itself just can't be reassigned

//Next Things to work on, adding parameters to hyperlinks for the questions
//Work on adding templating to the ejs files
//Find out how to upload images to mongo database
//Find how to fix the issue of questions not loading as soon as they are posted (something to do with query not loading in time)
