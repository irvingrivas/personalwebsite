$(document).ready(function(){
    $("#title").on("click", function () {
        var target = $("#list-item-2");
        $('html, body').animate({
            scrollTop: target.offset().top
          }, 1000, function() {
            var $target = $(target);
            $target.focus();
        });
    });
});