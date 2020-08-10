//TODO: make js file so that text in modal matches the text in the textbox with mathjax enabled
//TODO: add ajax so upvotes can be done without refreshing the page (NVM we will do this in the ejs file with a script tag)
//How do we identify each button to the unique question???

$('.btn').click(function(){
$(this).toggleClass('clicked');
});

$('#responsetextarea').on('input', function(){
    console.log("hello");
    
    $('#modalbodytext').text($('#responsetextarea').val());
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]); //This code is IMPORTANT, will update the mathjax everytime the keyboard is typed on
    console.log($('#responsetextarea').html());
});

