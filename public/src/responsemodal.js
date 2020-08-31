//TODO: add ajax so upvotes can be done without refreshing the page (NVM we will do this in the ejs file with a script tag)
//How do we identify each button to the unique question???
//Embedd the variables into the ejs files and identifying each thing as unique



$('#responsetextarea').on('input', function(){
    console.log("hello");
    
    $('#modalbodytext').text($('#responsetextarea').val());
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]); //This code is IMPORTANT, will update the mathjax everytime the keyboard is typed on
    //ßconsole.log($('#responsetextarea').html());
});

