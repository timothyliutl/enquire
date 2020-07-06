const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/form', { useNewUrlParser: true, useUnifiedTopology: true });


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

var day = new Date();
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var response = {};
var courses = ["APSC 112", "APSC 172", "APSC 174"];

app.get('/', function (req, res) {

    res.render("index", { date: days[day.getDay()], courselist: courses});

});

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

app.get("/login", function(req,res){
res.sendFile(__dirname + "/HTML/login.html", function(err){
    if(err){
        console.log(err);
    }
})
});

app.post("/login", function(req,res){
    console.log(req.body.username);
    res.send("Thank You for Logging In");
});



app.listen(3000, function () {
    console.log("Server running on Port 3000");
})
//const in JS for things inside a variable aren't always constant, the variable itself just can't be reassigned