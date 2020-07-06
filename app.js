const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Tells program which mongodb database to be looking for
mongoose.connect('mongodb://localhost:27017/form', { useNewUrlParser: true, useUnifiedTopology: true });

//Tells how the response document should be structured
const responseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: String,
    tags: String
});
const DBresponse = mongoose.model("Response", responseSchema);


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", "ejs");

//This date stuff isn't really used in the code currently, just something I used to test out templating
var day = new Date();
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var response = {};

//TODO: add this array to the database and not have it hardcoded in here
var courses = ["APSC 112", "APSC 172", "APSC 174", "Muck Fod 1"];

app.get('/', function (req, res) {

    res.render("index", { date: days[day.getDay()], courselist: courses});

});


//After submit button is hit, the code inside here runs and saves all the date into the database, also console logs the information too
app.post('/question-compositions', function (req, res) {
    const question = new DBresponse({
        title: req.body.title,
        body: req.body.questionBody,
        tags: req.body.tags
    });
    question.save();
    console.log(req.body.title);
    response = req.body;
    console.log(response);
    res.render('preview', { title: response.title, body: response.questionBody, tags: response.tags});

});

//sends the login html, more to be done here
//TODO: add authentication and encryption
//TODO: add redirect for people who want to create a new account
app.get("/login", function(req,res){
res.sendFile(__dirname + "/HTML/login.html", function(err){
    if(err){
        console.log(err);
    }
})
});

//TODO: redirect to profile page template with approriate information
//Curently just redirects to a dummy page
app.post("/login", function(req,res){
    console.log(req.body.username);
    res.send("Thank You for Logging In");
});


//Tells what port the website should be running on
app.listen(3000, function () {
    console.log("Server running on Port 3000");
})
//const in JS for things inside a variable aren't always constant, the variable itself just can't be reassigned