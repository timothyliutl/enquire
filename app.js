const express = require('express');
const bodyParser = require('body-parser');
const { static } = require('express');
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set("view engine", "ejs");

var day = new Date();
var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var response = {};

app.get('/', function(req,res){

    res.render("index", {date: days[day.getDay()]});

});

app.post('/question-compositions', function(req,res){
    
    console.log(req.body.title);
    response = req.body;
    console.log(response);
    res.render('preview', {title: response.title, body:response.questionBody, tags:response.tags});
});



app.listen(3000, function(){
    console.log("Server running on Port 3000");
})
//const in JS for things inside a variable aren't always constant, the variable itself just can't be reassigned