var temp = 0;

$(document).ready(function () {
  $("#toggle").on("click", function () {
    if (temp % 2 == 0) {
        $('#toggle').html("Show Sidebar");
      $("div.sidebar").hide();
      $(".col-lg-6").css("margin-left","auto");
      temp++;
    } else {
        $('#toggle').html("Hide Sidebar");
        $(".col-lg-6").css("margin-left","0px");
      $("div.sidebar").show();
      
      temp++;
    }
  });
});
//look into how to add animations to this later