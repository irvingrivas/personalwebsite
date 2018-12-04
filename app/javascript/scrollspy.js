$(document).ready(function(){
    $(".page-control").click(function(event){ 
        divId = $(this).attr("href"); 
        event.preventDefault(); 
        $("html, body").animate({
            scrollTop: $(divId).offset().top
        }, 1000, "easeInOutQuad");
    });
 });
