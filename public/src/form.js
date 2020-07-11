


function check(){
if(document.getElementById("examplecheckbox").checked){
    document.getElementById("submitButton").disabled = false;
    
}else{
    document.getElementById("submitButton").disabled = true;
}
}
const submitButton = document.getElementById("examplecheckbox").addEventListener("change", check);

const questionBody = document.getElementById("exampleFormControlTextarea1").addEventListener("input", function(){
    //could be an issue with the "input" event listener, may not work depending on the browser
    document.getElementById("textareapreview").innerHTML = document.getElementById("exampleFormControlTextarea1").value;
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    //preview is a bit glitchy when typing in real time, could do something about this in the future
});
