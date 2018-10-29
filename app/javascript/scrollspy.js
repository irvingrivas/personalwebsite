$(document).ready(function(){
    $(".nav-link").click(function(event){ 
        divId = $(this).attr("href"); 
        event.preventDefault(); 
        $("html, body").animate({
            scrollTop: $(divId).offset().top + 5
        }, 1000, "easeInOutQuad");
    });
 });
