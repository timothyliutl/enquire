//This chunk of code is used to set up all of the dependencies 
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const passport = require("passport");
const multer = require('multer');
const passportLocalMongoose = require("passport-local-mongoose");
const path = require('path');
const e = require('express');
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

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.orginalname).toLowerCase());

    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }

}

//Tells program which mongodb database to be looking for

//Tells how the response document should be structured

//Tells how the question document should be structured
const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
        immutable: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        immutable: true
    },
    body: String,
    tags: String, //evenutally needs to be made into a list as opposed to a string
    course: {
        type: String,
        required: true,
        immutable: true
    },

});


//Tells how the course document should be structured
const courseSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        immutable: true
    },
    courseName: {
        type: String,
        required: true
    },
    discipline: {
        type: String,
        minlength: 4,
        maxlength: 4,
        required: true
    },
    year: {
        type: Number,
        min: 1,
        max: 4,
        required: true
    }
});

//Tells how the user document should be structured
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, minlength: 5 },
    password: String,
    email: String,
    courses: {
        type: [String],
        required: true,
        default: []
    }
});
//Do not make password required here, for some reason it doesn't work with passport

const responseSchema = new mongoose.Schema({
    // title: {
    //     type: String,
    //     required: true,
    // },
    author: {
        type: String,
        required: true,
        immutable: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        immutable: true
    },
    body: String,
    //tags: [String],
    //subject: String,
    // course: {
    //     type: String,
    //     required: true,
    // },
    question: {
        type: String,
        required: true,
        immutable: true
    },
    upvotes: {
        type: Number,
        required: true,
        default: 0
    },
    upvoteUsers: {
        type: [String],
        required: true,
        default: []
    },
    downvoteUsers: {
        type: [String],
        required: true,
        default: []
    }
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
const DBcourse = new mongoose.model("Course", courseSchema);
const DBquestion = new mongoose.model("Question", questionSchema);
const DBresponse = new mongoose.model("Response", responseSchema)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
    session({
        secret: process.env.APP_SECRET,
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


mongoose.connect(process.env.MONGO_DB, {
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
//var courses = DBcourse.find({}, { _id: 1 }).lean();
//courses = ["APSC 112", "APSC 172", "APSC 174", "Muck Fod 1"];
DBcourse.find({}, { _id: 1 }).lean().exec(function(err, doc) {

});
courses = ["APSC 112", "APSC 172", "APSC 174", "Muck Fod 1"];

//This is where we want to compile data from the database into a list, right now the ejs file is 
//expecting a list of javascript objects as shown below, this should model the objects already in the response database
var questionList = [];

function getQuestions() {
    DBquestion.find({}).sort({ date: -1 }).limit(20).lean().skip(0).exec(function (err, doc) {
        if (err) {
            console.log(err);
        }

        dummyresponselist = doc;
        //console.log(doc);

    });
    //Don't really need this function anymore
}




//Everything below this comment are functions that run when a website is loaded

app.get("/", function (req, res) {

    res.sendFile(__dirname + "/HTML/home-notloggedin.html");

});

app.get('/home', function (req, res) {
    if (req.isAuthenticated()) {

        res.redirect('/home/page/1')
    } else {
        res.redirect('/login');
    }

});

app.get('/home/page/:pagenum', function (req, res) {
    if (req.isAuthenticated()) {
        DBquestion.find({}).sort({ date: -1 }).limit(20).lean().skip(req.params.pagenum - 1).exec(function (err, doc) {
            if (err) {
                console.log(err);
                res.render("404errorpage");
            }

            DBquestion.countDocuments({}, function (err, result) {
                res.render('home', { list: doc, currentPage: req.params.pagenum, pages: Math.ceil(result / 20) });
            });


        });

    } else {
        res.redirect('/login');
    }
});

app.get('/home/query/:course', function (req, res) {
    if (res.isAuthenticated()) {
        res.send(req.params.course);
    }
});


app.get("/question", function (req, res) {

    if (req.isAuthenticated()) {
        DBcourse.find({}, { _id: 1 }).lean().exec(function(err,doc){
            if(err){
                res.render('404errorpage');
                console.log(err);
            }else{
                var coursenames = [];
                for(i in doc){
                    coursenames.push(doc[i]._id);
                }
                
                res.render("index", { date: days[day.getDay()], courselist: coursenames});
            }
    
        });
        
    } else {
        res.redirect("/login");
    }
});

//After submit button is hit, the code inside here runs and saves all the date into the database, also console logs the information too
app.post("/question-compositions", function (req, res) {
    console.log(req);
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            res.redirect('/question-compositions');
        } else {
            //for some reason body parser cannot get access to req.body unless its inside the multer function
            //multer can read multi part forms and body parser cannot, its weird but it works
            console.log(req.file);
            var date = new Date();
            const question = new DBquestion({
                title: req.body.title,
                author: req.user.username,
                date: date,
                body: req.body.questionBody,
                tags: req.body.tags, //eventually need to make this a list, as opposed to a string
                course: req.body.course
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


app.get("/profile", function (req, res) {
    res.render('profile');
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
app.get("/view-question/:questionID", function(req, res) {

    if (req.isAuthenticated) {
        DBquestion.findOne({ _id: req.params.questionID }, function (err, question) {
            if (err) {
                console.log(err);
                res.render("404errorpage");
            } else {

                DBresponse.find({ question: req.params.questionID }, function(err, responseArray) {
                    if (err) {
                        console.log(err);
                    } else {

                        res.render("question", { question: question, questionID: req.params.questionID, responseArray: responseArray });
                    }
                })

                //need to add a response in the render function too
            }
        });
    } else {
        res.redirect('/login');
    }


});

app.post('/view-question/:questionID', function (req, res) {
    var replytext = req.body.response;

    if (req.isAuthenticated) {
        newResponse = new DBresponse({
            question: req.params.questionID,
            body: replytext,
            author: req.user.username,
            date: Date()

        });
        newResponse.save();
        res.redirect('/view-question/' + req.params.questionID);
    } else {
        res.redirect('/login');
    }
    //Works, now just need to get the database to work with it
});

//var updoots = 0;
// var username = "maxbennett1"; //PLACEHOLDER, need to change this
// var responseID = "65rdfcvbhji87trfvbhj"; //PLACEHOLDER, need to change this

//Updoots and downdoots get and post requests
//Change this in the future so it edits values in the database

app.get('/vote/:questionID', function(req,res){
var username = req.user.username;
var responseID = req.params.questionID;
DBresponse.findOne({_id: responseID}).exec(function(err,doc){
if(err){
    res.render('404errorpage');
    console.log(err);
}else{
    var upvoteList = doc.upvoteUsers;
    var downvoteList = doc.downvoteUsers;
    var tams = upvoteList.length - downvoteList.length;
    
    var status;
    if(upvoteList.includes(username)){
        status = 'upvote';
    }else{
        if(downvoteList.includes(username)){
            status = 'downvote';
        }else{
            status = 'neutral';
        }
    }
    res.send({tams: tams, status: status});
}
});

});

app.post("/vote/:questionID", function(req, res) {
    var username = req.user.username;
    var responseID = req.params.questionID;
    DBresponse.findOne({ _id: responseID }, { upvoteUsers: 1, downvoteUsers: 1 }).exec(function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log(doc);
            upvoteList = doc.upvoteUsers;
            downvoteList = doc.downvoteUsers;
            upvotes = upvoteList.length - downvoteList.length;
            
            if (req.body.type === "updoot") {
                console.log(!upvoteList.includes(username));
                if (downvoteList.includes(username)) {
                    
                    DBresponse.updateOne({ _id: responseID }, {
                        $inc: { upvotes: 2 },
                        $pull: { downvoteUsers: username },
                        $addToSet: { upvoteUsers: [username] }
                    });
                    upvotes += 2;
                } else if (!upvoteList.includes(username)) {
                    console.log("juerhfd");
                    DBresponse.updateOne({ _id: responseID }, {
                        $inc: { upvotes: 1 },
                        $addToSet: { upvoteUsers: [username] }
                        
                    }, function(err, result){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(result);
                        }
                    });
                    
                    upvotes++;
                }else{
                    console.log('unupvote');
                    DBresponse.updateOne({ _id: responseID }, {
                        $inc: { upvotes: -1 },
                        $pull: { upvoteUsers: username },
                        
                    });
                    upvotes--;
                }
                //res.send({ value: updoots });
            } else {
                if (req.body.type === "downdoot") {
                    if (upvoteList.includes(username)) {
                        DBresponse.updateOne({ _id: responseID }, {
                            $addToSet: { downvoteUsers: [username] },
                            $pull: { upvoteUsers: username },
                            $inc: { upvotes: -2 }
                        }, function(err, result){
                            if(err){
                                console.log(err)
                            }else{
                                console.log(result);
                            }
                        });
                        upvotes -= 2;
                    } else if (!downvoteList.includes(username)) {
                        console.log("downvote");
                        DBresponse.updateOne({ _id: responseID }, {
                            $inc: { upvotes: -1 },
                            $addToSet: { downvoteUsers: [username] }
                        }, function(err,result){
                            if(err){
                                console.log(err);
                            }else{
                                console.log(result);
                            }
                        });
                        upvotes--;
                    } else{
                        console.log('undownvote');
                        DBresponse.updateOne({ _id: responseID }, {
                            $inc: { downvotes: -1 },
                            $pull: { downvoteUsers: username },
                            
                        }, function(err,result){
                            if(err){
                                console.log(err);
                            }else{
                                console.log(result);
                            }
                        });
                        upvotes++;
                    }
                }
            }
        }
        console.log(upvotes);
        res.status(200).send({ value: upvotes });
    });;
    // upvoteList = voteLists.upvoteUsers;
    // downvoteList = voteLists.downvoteUsers;
    console.log(req.body.type);
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