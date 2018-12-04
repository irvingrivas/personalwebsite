$(document).ready(function(){
    $("html, body").animate({
        scrollTop: $("#about-page").offset().top + 5
    }, 1000, "easeInOutQuad");
    $(".page-control").click(function(event){ 
        divId = $(this).attr("href"); 
        event.preventDefault(); 
        $("html, body").animate({
            scrollTop: $(divId).offset().top + 5
        }, 1000, "easeInOutQuad");
    });
 });
